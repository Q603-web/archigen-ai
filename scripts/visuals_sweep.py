#!/usr/bin/env python3
"""Find published articles with no images and give each a hero + 2 inline images (Gemini).

Runs in GitHub Actions (.github/workflows/article-visuals.yml) after each article push, as a daily sweep,
and on manual trigger. Owner rule (Quincy, 8 Nov 2026): article images go live automatically, with no
approval step, and never block or delay article publishing. Only articles published on or after
VISUALS_SINCE are touched; older articles are left as they are.

Writes visuals-run.json (consumed by scripts/telegram_visuals_report.py) and prints one line per article.
Env: GEMINI_API_KEY (required), VISUALS_SINCE (default 2026-10-04), VISUALS_MAX (default 25),
     VISUALS_ONLY (optional space-separated file names), AGV_EDGE (style escalation, default 1).
"""
import importlib.util
import json
import os
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FLOOR = "2026-10-04"  # owner rule: never touch articles published before this date
_since = (os.environ.get("VISUALS_SINCE") or FLOOR).strip()
SINCE = max(_since, FLOOR) if re.fullmatch(r"\d{4}-\d{2}-\d{2}", _since) else FLOOR
MAX = int(os.environ.get("VISUALS_MAX") or 25)
ONLY = set((os.environ.get("VISUALS_ONLY") or "").split())
OUT = REPO / "visuals-run.json"
STAGE = REPO / "visuals-stage.txt"  # files the workflow commits: only validated successes
GENERIC_SRC = re.compile(r"(^|/)(brand/|favicon|apple-touch-icon|icons?/)|(^|/)[^/]*logo[^/]*$", re.I)
ROBOTS_NOINDEX = re.compile(r"<meta\b(?=[^>]*\bname=[\"']robots[\"'])(?=[^>]*noindex)[^>]*>", re.I)
SECRETISH = re.compile(r"(AIza[0-9A-Za-z_\-]{20,}|key=[^&\s]+|bot\d+:[A-Za-z0-9_\-]+)")


def safe_error(e: Exception) -> str:
    return f"{type(e).__name__}: {SECRETISH.sub('[redacted]', str(e))[:200]}"


def content_images(body: str):
    """<img> tags that are article content, judged by their src (logos and site chrome are not)."""
    out = []
    for tag in re.findall(r"<img\b[^>]*>", body):
        src = re.search(r"\bsrc=[\"']([^\"']+)", tag)
        if src and not GENERIC_SRC.search(src.group(1)):
            out.append(tag)
    return out


def needs_visuals(html: str):
    """(date, title) if this is an indexable article published since SINCE with no hero or inline image."""
    if not re.search(r'"@type"\s*:\s*"(Article|NewsArticle|BlogPosting)"', html):
        return None
    m = re.search(r'"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})', html)
    if not m or m.group(1) < SINCE:
        return None
    head = (re.search(r"<head.*?</head>", html, re.S | re.I) or [html])[0]
    if ROBOTS_NOINDEX.search(head):
        return None
    if '<section class="article-header">' not in html:
        return None
    body = (re.search(r"<body.*", html, re.S) or [html])[0]
    if "data-agvis" in body or content_images(body):
        return None
    title = re.search(r"<h1>(.*?)</h1>", html, re.S)
    return m.group(1), re.sub(r"<[^>]+>|\s+", " ", title.group(1)).strip() if title else ""


def main():
    candidates = []
    for f in sorted(REPO.glob("*.html")):
        if ONLY and f.name not in ONLY:
            continue
        hit = needs_visuals(f.read_text(encoding="utf-8", errors="replace"))
        if hit:
            candidates.append((hit[0], f, hit[1]))
    candidates.sort(key=lambda x: x[0], reverse=True)  # newest first
    batch = candidates[:MAX]
    print(f"[sweep] {len(candidates)} article(s) since {SINCE} without images; processing {len(batch)}")
    result = {"since": SINCE, "found": len(candidates), "done": [], "failed": []}
    STAGE.write_text("")
    if not batch:
        OUT.write_text(json.dumps(result, indent=1))
        return 0
    if not os.environ.get("GEMINI_API_KEY"):
        result["failed"] = [{"file": f.name, "title": t, "error": "GEMINI_API_KEY secret is not set"} for _, f, t in batch]
        OUT.write_text(json.dumps(result, indent=1))
        print("[sweep] GEMINI_API_KEY is not set; nothing generated")
        return 1

    spec = importlib.util.spec_from_file_location("engine", REPO / "scripts" / "generate-article-visuals.py")
    engine = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(engine)
    model, hero_aspect = engine.hero_model_config()
    client = engine.genai.Client()
    for date, f, title in batch:
        slug = f.stem
        print(f"[article] {f.name} ({date})", flush=True)
        try:
            engine.process(client, f, model, hero_aspect, 2, False)
            imgs = [f"assets/hero-{slug}.jpg", f"assets/inline-{slug}-1.jpg", f"assets/inline-{slug}-2.jpg"]
            missing = [i for i in imgs if not (REPO / i).exists()]
            if missing or "data-agvis" not in f.read_text(encoding="utf-8"):
                raise RuntimeError(f"images or markup missing after generation: {missing}")
            result["done"].append({"file": f.name, "title": title, "date": date, "images": imgs,
                                   "url": f"https://archigenai.com/{f.name}"})
        except Exception as e:  # one bad article never stops the rest
            err = safe_error(e)
            print(f"  [FAIL] {f.name}: {err}", flush=True)
            result["failed"].append({"file": f.name, "title": title, "error": err})
    OUT.write_text(json.dumps(result, indent=1))
    STAGE.write_text("".join(f"{a['file']}\n" + "".join(f"{i}\n" for i in a["images"]) for a in result["done"]))
    print(f"[sweep] done: {len(result['done'])} ok, {len(result['failed'])} failed")
    return 1 if result["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
