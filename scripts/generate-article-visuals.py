#!/usr/bin/env python3
"""ArchiGen visual engine — gives every article a hero + inline visuals.

Pipeline (all Gemini API):
  1. gemini-2.5-flash reads the article and derives image briefs (JSON).
  2. The canonical hero image model (scripts/hero-pipeline-config.mjs) renders them.
  3. PIL optimizes to progressive JPEG (house rule: .jpg only, <=200KB target).
  4. Figures are inserted in house style with prompt-receipt captions, and
     og:image / twitter:image / JSON-LD refs are updated together.

Auth: GEMINI_API_KEY env var only. Never put a key value or secrets path in this repo.
Usage:
  uv run python scripts/generate-article-visuals.py <article.html> [...] [--dry-run] [--inline 2]
Idempotent: articles already carrying data-agvis markup are skipped.
"""

import io
import json
import os
import re
import sys
from pathlib import Path

from PIL import Image
from google import genai

REPO = Path(__file__).resolve().parent.parent
ASSETS = REPO / "assets"
BRIEF_MODEL = "gemini-flash-latest"  # rolling alias — survives model retirements
SITE = "https://archigenai.com"
MAX_BYTES = 200_000
HERO_WIDTH, INLINE_WIDTH = 1600, 1200

# Escalation ladder: AGV_EDGE env var (1-5). Each backfill batch runs one level
# higher than the last so the site's visual language keeps advancing instead of
# converging on a house average. Directives are cumulative.
EDGE = max(1, min(5, int(os.environ.get("AGV_EDGE", "1"))))
EDGE_DIRECTIVES = {
    2: "ESCALATION LEVEL 2 — cutting edge: at least one image per article must use an "
       "unconventional camera (drone top-down, worm's-eye from the ground, or shot through "
       "foreground objects or glass); push one image to an extreme weather or light moment "
       "(storm clearing, dense fog dawn, monsoon glow); favor bold crops and asymmetry over "
       "safe establishing shots.",
    3: "ESCALATION LEVEL 3 — experimental: build one composition around reflection or "
       "mirroring (water, glass, polished stone); allow one night scene with artificial "
       "color (neon spill, projection-mapped facade, light streaks); include one "
       "near-abstract architectural macro (raking light on texture, pattern rhythm). The "
       "safest image in the set must still be bolder than a stock photo.",
    4: "ESCALATION LEVEL 4 — avant-garde: permitted moves include double-exposure feel, "
       "architecture dissolving into wireframe or point-cloud at one edge of frame, "
       "impossible-but-believable vantage points, hard color-grade experiments. Keep one "
       "grounded image per article so the set stays credible.",
    5: "ESCALATION LEVEL 5 — no safe images: every frame must do something a stock library "
       "cannot; treat each image as a magazine-cover attempt.",
}
EDGE_TEXT = " ".join(v for k, v in EDGE_DIRECTIVES.items() if EDGE >= k)

STYLE_GUIDE = (
    "Upbeat, vibrant editorial architectural imagery for a modern design magazine. "
    "Photoreal rendering or archviz-style photography with rich, saturated but natural color: "
    "bright daylight or vivid golden hour, blue skies, lush planting, glowing interiors, crisp contrast "
    "and an optimistic, energetic mood. Magazine cover quality. "
    "Every scene must feel ALIVE and inhabited: architecture in use, human presence and "
    "motion (silhouettes, motion blur, figures at distance, never identifiable faces), "
    "atmosphere, depth and activity. NEVER sterile still-life compositions, grey or muddy palettes, "
    "empty desks, or lifeless product shots. Absolutely no text, no logos, no watermarks, "
    "no UI chrome."
)


def hero_model_config():
    """hero-pipeline-config.mjs is the single source of truth for hero settings."""
    src = (REPO / "scripts" / "hero-pipeline-config.mjs").read_text(encoding="utf-8")
    model = re.search(r"HERO_MODEL\s*=\s*'([^']+)'", src).group(1)
    aspect = re.search(r"HERO_ASPECT_RATIO\s*=\s*'([^']+)'", src).group(1)
    return model, aspect


def derive_briefs(client, html: str, slug: str, inline_count: int):
    title = re.search(r"<h1>(.*?)</h1>", html, re.S)
    lede = re.search(r'<p class="lede">(.*?)</p>', html, re.S)
    h2s = re.findall(r"<h2\b[^>]*>(.*?)</h2>", html, re.S)
    paras = re.findall(r"<p>(.*?)</p>", html, re.S)[:6]
    strip = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()

    prompt = f"""You are the art director for ArchiGen AI, an editorial publication about AI tools for architects.
Derive image briefs for this article. Return STRICT JSON only:
{{"hero": {{"prompt": "...", "alt": "...", "caption": "..."}},
 "inline": [{{"h2_index": <0-based index of the h2 the image should sit above>, "prompt": "...", "alt": "...", "caption": "..."}}]}}

Rules: exactly 1 hero + {inline_count} inline briefs. Prompts must be concrete visual scenes
(architecture, renders, workflows made physical — never abstract concepts, never screenshots with text).
The images in one article must be visually DISTINCT from each other: vary the time of day, color
palette (at least one image bold and vibrant in color), setting (studio / street / building / landscape)
and composition. Never two dusk scenes, never two of the same recipe.
{EDGE_TEXT}
Each prompt must embed this style guide: "{STYLE_GUIDE}"
alt = one factual sentence. caption = under 12 words, wry editorial tone matching the article.

ARTICLE
Title: {strip(title.group(1) if title else slug)}
Lede: {strip(lede.group(1) if lede else '')}
Sections: {json.dumps([strip(h) for h in h2s])}
Opening paragraphs: {json.dumps([strip(p) for p in paras])[:3000]}"""

    last = None
    for _ in range(3):  # the brief model occasionally returns malformed JSON
        try:
            resp = client.models.generate_content(
                model=BRIEF_MODEL,
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            briefs = json.loads(resp.text)
            complete = lambda b: isinstance(b, dict) and all(str(b.get(k) or "").strip() for k in ("prompt", "alt", "caption"))
            inline = briefs.get("inline") if isinstance(briefs, dict) else None
            if complete(briefs.get("hero")) and isinstance(inline, list) and len(inline) >= inline_count \
                    and all(complete(b) for b in inline[:inline_count]):
                briefs["inline"] = inline[:inline_count]
                return briefs
            last = ValueError(f"incomplete briefs: need hero + {inline_count} inline with prompt/alt/caption")
        except Exception as e:  # noqa: BLE001
            last = e
    raise RuntimeError(f"could not derive image briefs: {last}")


def render_image(client, model: str, prompt: str, aspect: str) -> bytes:
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config={"response_modalities": ["IMAGE"], "image_config": {"aspect_ratio": aspect}},
    )
    for cand in resp.candidates or []:
        for part in cand.content.parts or []:
            data = getattr(part, "inline_data", None)
            if data and data.data:
                return data.data
    raise RuntimeError(f"no image in response for prompt: {prompt[:80]}")


def to_jpeg(raw: bytes, width: int, out: Path):
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    for quality in (85, 80, 75, 70, 65, 60):
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
        if buf.tell() <= MAX_BYTES or quality == 60:
            out.write_bytes(buf.getvalue())
            return img.width, img.height, buf.tell()


CSS = """
/*agvis*/
.agv-hero-section { border-bottom: 1px solid var(--rule); }
.agv-hero-section figure { margin: 0; padding: 40px 0; }
.agv-hero-section img, .agv-inline img { width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid var(--rule); }
.agv-cap { display: flex; gap: 12px; align-items: baseline; margin-top: 12px; font-family: var(--f-mono); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); }
.agv-chip { background: var(--ink); color: var(--paper); padding: 2px 8px; border-radius: 3px; white-space: nowrap; }
.agv-inline { margin: 40px 0; }
"""


def figure_html(src: str, alt: str, caption: str, hero: bool) -> str:
    # house voice: no em or en dashes in published text, even if the brief model writes them
    clean = lambda s: re.sub(r"\s*[\u2014\u2013]\s*", ", ", str(s)).strip(" ,")
    esc = lambda s: clean(s).replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")
    img = (
        f'<img src="{src}" alt="{esc(alt)}" fetchpriority="high" />'
        if hero
        else f'<img src="{src}" alt="{esc(alt)}" loading="lazy" />'
    )
    fig = f'{img}\n  <figcaption class="agv-cap"><span class="agv-chip">AI illustration (Gemini)</span> <span>{esc(caption)}</span></figcaption>'
    if hero:
        return f'\n<section class="agv-hero-section" data-agvis="hero">\n  <div class="wrap"><figure>\n  {fig}\n  </figure></div>\n</section>\n'
    return f'<figure class="agv-inline" data-agvis="inline">\n  {fig}\n</figure>\n\n    '


ARTICLE_TYPES = {"Article", "NewsArticle", "BlogPosting"}


def inline_targets(html: str, wanted, count: int):
    """Distinct insertion offsets (descending) for the inline figures: above h2 headings, falling back to
    paragraph ends. Raises if `count` distinct places are not available (never publish a partial layout)."""
    anchors = [m.start() for m in re.finditer(r"[ \t]*<h2\b", html)]
    if len(anchors) < count:
        anchors = [m.end() for m in re.finditer(r"</p>", html)][1::3]
    if len(anchors) < count:
        raise RuntimeError(f"only {len(anchors)} places for {count} inline images")
    chosen = []
    for w in wanted:
        try:
            idx = min(max(int(w), 0), len(anchors) - 1)
        except (TypeError, ValueError):
            idx = 0
        if idx in chosen:  # nearest free heading, looking forward first
            free = [i for i in range(len(anchors)) if i not in chosen]
            idx = min(free, key=lambda i: (abs(i - idx), i < idx))
        chosen.append(idx)
    return [anchors[i] for i in chosen]


def set_jsonld_image(html: str, hero_url: str) -> str:
    """Set image on the Article/NewsArticle/BlogPosting object(s) in JSON-LD, replacing any old value."""
    def fix(m):
        try:
            data = json.loads(m.group(2))
        except json.JSONDecodeError:
            return m.group(0)
        hit = False
        nodes = data.get("@graph", [data]) if isinstance(data, dict) else data if isinstance(data, list) else []
        for node in nodes:
            t = node.get("@type") if isinstance(node, dict) else None
            types = set(t if isinstance(t, list) else [t])
            if types & ARTICLE_TYPES:
                node["image"] = hero_url
                hit = True
        return m.group(1) + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + m.group(3) if hit else m.group(0)
    return re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', fix, html, flags=re.S)


def process(client, path: Path, model: str, hero_aspect: str, inline_count: int, dry: bool):
    """Render hero + inline images, then rewrite the article only if the whole result validates.
    On any failure the article file is left unchanged, so the next run retries it."""
    original = path.read_text(encoding="utf-8")
    slug = path.stem
    if "data-agvis" in original:
        print(f"  [skip] {slug}: already has visuals")
        return

    briefs = derive_briefs(client, original, slug, inline_count)
    print(f"  [briefs] hero + {len(briefs['inline'])} inline")
    if dry:
        print(json.dumps(briefs, indent=2)[:1500])
        return

    hero_file = ASSETS / f"hero-{slug}.jpg"
    files = [(hero_file, briefs["hero"]["prompt"], hero_aspect, HERO_WIDTH)]
    files += [(ASSETS / f"inline-{slug}-{n}.jpg", b["prompt"], "4:3", INLINE_WIDTH) for n, b in enumerate(briefs["inline"], 1)]
    for f, prompt, aspect, width in files:  # reuse files left by an earlier partial run
        if not f.exists():
            w, h, size = to_jpeg(render_image(client, model, prompt, aspect), width, f)
            print(f"  [image] {f.name} {w}x{h} {size//1024}KB")

    html = original.replace("</style>", CSS + "</style>", 1)
    m = re.search(r'<section class="article-header">.*?</section>', html, re.S)
    if not m:
        raise RuntimeError("no article-header section")
    html = html[: m.end()] + "\n" + figure_html(f"assets/{hero_file.name}", briefs["hero"]["alt"], briefs["hero"]["caption"], hero=True) + html[m.end():]

    figs = [figure_html(f"assets/{f.name}", b["alt"], b["caption"], hero=False) for (f, *_), b in zip(files[1:], briefs["inline"])]
    targets = inline_targets(html, [b.get("h2_index", 2 * n + 1) for n, b in enumerate(briefs["inline"])], len(figs))
    for pos, fig in sorted(zip(targets, figs), key=lambda x: -x[0]):
        html = html[:pos] + "    " + fig + html[pos:]

    # NOTE: the article template emits plain ">" metas (not " />"); patterns must accept both.
    hero_url = f"{SITE}/assets/{hero_file.name}"
    og = f'<meta property="og:image" content="{hero_url}">'
    if 'property="og:image"' in html:
        html = re.sub(r'<meta property="og:image" content="[^"]*"\s*/?>', og, html)
    else:
        html = re.sub(r'(<meta property="og:description"[^>]*>)', r"\1" + og, html, count=1)
    tw = f'<meta name="twitter:image" content="{hero_url}">'
    if 'name="twitter:image"' in html:
        html = re.sub(r'<meta name="twitter:image" content="[^"]*"\s*/?>', tw, html)
    else:
        html = re.sub(r'(<meta name="twitter:description"[^>]*>)', r"\1" + tw, html, count=1)
    # a logo share card carries logo-specific size/alt tags; drop the sizes and describe the hero instead
    html = re.sub(r'<meta property="og:image:(?:width|height)" content="[^"]*"\s*/?>\s*', "", html)
    hero_alt = re.sub(r"\s*[\u2014\u2013]\s*", ", ", briefs["hero"]["alt"]).replace("&", "&amp;").replace('"', "&quot;")
    html = re.sub(r'(<meta (?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]*(")',
                  lambda mm: mm.group(1) + hero_alt + mm.group(2), html)
    html = html.replace('name="twitter:card" content="summary"', 'name="twitter:card" content="summary_large_image"')
    html = set_jsonld_image(html, hero_url)

    # validate the complete result before replacing the article
    problems = []
    if html.count('data-agvis="hero"') != 1 or html.count('data-agvis="inline"') != inline_count:
        problems.append("figure count")
    if not all(f.exists() for f, *_ in files):
        problems.append("image file missing")
    if f'property="og:image" content="{hero_url}"' not in html or f'name="twitter:image" content="{hero_url}"' not in html:
        problems.append("share card tags")
    imgs = []
    for mm in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        d = json.loads(mm.group(1))
        for node in (d.get("@graph", [d]) if isinstance(d, dict) else d):
            t = node.get("@type") if isinstance(node, dict) else None
            if set(t if isinstance(t, list) else [t]) & ARTICLE_TYPES:
                imgs.append(node.get("image"))
    if imgs and set(imgs) != {hero_url}:
        problems.append("JSON-LD image")
    if problems:
        raise RuntimeError("validation failed: " + ", ".join(problems))
    path.write_text(html, encoding="utf-8")
    print(f"  [done] {path.name}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    inline_count = int(sys.argv[sys.argv.index("--inline") + 1]) if "--inline" in sys.argv else 2
    if not args:
        sys.exit("usage: generate-article-visuals.py <article.html> [...] [--dry-run] [--inline N]")
    model, hero_aspect = hero_model_config()
    client = genai.Client()  # GEMINI_API_KEY from environment
    print(f"[engine] image model: {model} · hero {hero_aspect} · inline 4:3")
    for arg in args:
        p = Path(arg) if Path(arg).is_absolute() else REPO / arg
        print(f"[article] {p.name}")
        process(client, p, model, hero_aspect, inline_count, dry)


if __name__ == "__main__":
    main()
