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

STYLE_GUIDE = (
    "Editorial architectural imagery for a print-quality design magazine. "
    "Photoreal rendering or archviz-style photography, warm paper-toned grading "
    "(cream, bone, ink, muted terracotta accents), soft directional daylight, "
    "considered composition with generous negative space. Absolutely no text, "
    "no logos, no watermarks, no UI chrome, no people's faces. Subtle film grain, "
    "magazine cover quality."
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
    h2s = re.findall(r"<h2>(.*?)</h2>", html, re.S)
    paras = re.findall(r"<p>(.*?)</p>", html, re.S)[:6]
    strip = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()

    prompt = f"""You are the art director for ArchiGen AI, an editorial publication about AI tools for architects.
Derive image briefs for this article. Return STRICT JSON only:
{{"hero": {{"prompt": "...", "alt": "...", "caption": "..."}},
 "inline": [{{"h2_index": <0-based index of the h2 the image should sit above>, "prompt": "...", "alt": "...", "caption": "..."}}]}}

Rules: exactly 1 hero + {inline_count} inline briefs. Prompts must be concrete visual scenes
(architecture, renders, workflows made physical — never abstract concepts, never screenshots with text).
Each prompt must embed this style guide: "{STYLE_GUIDE}"
alt = one factual sentence. caption = under 12 words, wry editorial tone matching the article.

ARTICLE
Title: {strip(title.group(1) if title else slug)}
Lede: {strip(lede.group(1) if lede else '')}
Sections: {json.dumps([strip(h) for h in h2s])}
Opening paragraphs: {json.dumps([strip(p) for p in paras])[:3000]}"""

    resp = client.models.generate_content(
        model=BRIEF_MODEL,
        contents=prompt,
        config={"response_mime_type": "application/json"},
    )
    return json.loads(resp.text)


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
    esc = lambda s: s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")
    img = (
        f'<img src="{src}" alt="{esc(alt)}" fetchpriority="high" />'
        if hero
        else f'<img src="{src}" alt="{esc(alt)}" loading="lazy" />'
    )
    fig = f'{img}\n  <figcaption class="agv-cap"><span class="agv-chip">Generated · Gemini</span> <span>{esc(caption)}</span></figcaption>'
    if hero:
        return f'\n<section class="agv-hero-section" data-agvis="hero">\n  <div class="wrap"><figure>\n  {fig}\n  </figure></div>\n</section>\n'
    return f'<figure class="agv-inline" data-agvis="inline">\n  {fig}\n</figure>\n\n    '


def process(client, path: Path, model: str, hero_aspect: str, inline_count: int, dry: bool):
    html = path.read_text(encoding="utf-8")
    slug = path.stem
    if "data-agvis" in html:
        print(f"  [skip] {slug} — already has visuals")
        return

    briefs = derive_briefs(client, html, slug, inline_count)
    hero_file = ASSETS / f"hero-{slug}.jpg"
    print(f"  [briefs] hero + {len(briefs.get('inline', []))} inline")
    if dry:
        print(json.dumps(briefs, indent=2)[:1500])
        return

    # hero (reuse an existing hero file rather than regenerate)
    if not hero_file.exists():
        w, h, size = to_jpeg(render_image(client, model, briefs["hero"]["prompt"], hero_aspect), HERO_WIDTH, hero_file)
        print(f"  [hero] {hero_file.name} {w}x{h} {size//1024}KB")
    hero_fig = figure_html(f"assets/{hero_file.name}", briefs["hero"]["alt"], briefs["hero"]["caption"], hero=True)

    inline_figs = []
    for n, b in enumerate(briefs.get("inline", [])[:inline_count], 1):
        f = ASSETS / f"inline-{slug}-{n}.jpg"
        if not f.exists():
            w, h, size = to_jpeg(render_image(client, model, b["prompt"], "4:3"), INLINE_WIDTH, f)
            print(f"  [inline {n}] {f.name} {w}x{h} {size//1024}KB")
        inline_figs.append((b.get("h2_index", n * 2 - 1), figure_html(f"assets/{f.name}", b["alt"], b["caption"], hero=False)))

    # --- HTML surgery ---
    html = html.replace("</style>", CSS + "</style>", 1)

    m = re.search(r'<section class="article-header">.*?</section>', html, re.S)
    html = html[: m.end()] + "\n" + hero_fig + html[m.end() :]

    h2_iter = list(re.finditer(r"[ \t]*<h2>", html))
    for h2_index, fig in sorted(inline_figs, key=lambda x: -x[0]):
        idx = min(max(h2_index, 0), len(h2_iter) - 1)
        pos = h2_iter[idx].start()
        html = html[:pos] + "    " + fig + html[pos:]

    hero_url = f"{SITE}/assets/{hero_file.name}"
    og = f'<meta property="og:image" content="{hero_url}" />'
    if 'property="og:image"' in html:
        html = re.sub(r'<meta property="og:image" content="[^"]*" />', og, html)
    else:
        html = re.sub(r"(<meta property=\"og:description\"[^>]*/>)", r"\1\n" + og, html, count=1)
    tw = f'<meta name="twitter:image" content="{hero_url}" />'
    if 'name="twitter:image"' in html:
        html = re.sub(r'<meta name="twitter:image" content="[^"]*" />', tw, html)
    else:
        html = re.sub(r"(<meta name=\"twitter:description\"[^>]*/>)", r"\1\n" + tw, html, count=1)
    html = html.replace('name="twitter:card" content="summary"', 'name="twitter:card" content="summary_large_image"')
    if '"@type"' in html and "application/ld+json" in html:
        html = re.sub(r'("@type"\s*:\s*"(?:Article|NewsArticle)")', r'\1, "image": "' + hero_url + '"', html, count=1)

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
