"""Offline scenario tests for the automatic article-images job (no network, no spend).
Run: uv run --with pillow --with requests python tests/test_visuals.py
Each scenario copies the repo to a temp dir, fakes google.genai, and runs the real sweep/engine/report code."""
import io, json, os, re, runpy, shutil, subprocess, sys, tempfile, types
from pathlib import Path
from PIL import Image

SRC = Path(__file__).resolve().parent.parent
RESULTS = []
BRIEF = {"hero": {"prompt": "p", "alt": "A bright villa — test", "caption": "Wry — caption"},
         "inline": [{"h2_index": 1, "prompt": "p", "alt": "Inline one alt", "caption": "c1"},
                    {"h2_index": 1, "prompt": "p", "alt": "Inline two alt", "caption": "c2"}]}


def fake_genai(brief_for):
    class Part:
        def __init__(s, d): s.inline_data = types.SimpleNamespace(data=d)
    class Resp:
        def __init__(s, text=None, img=None):
            s.text = text
            s.candidates = [types.SimpleNamespace(content=types.SimpleNamespace(parts=[Part(img)]))] if img else []
    class Models:
        def generate_content(s, model, contents, config):
            if config.get("response_mime_type") == "application/json":
                return Resp(text=json.dumps(brief_for(contents)))
            b = io.BytesIO(); Image.new("RGB", (1600, 900), (30, 140, 200)).save(b, "PNG"); return Resp(img=b.getvalue())
    class Client:
        def __init__(s, *a, **k): s.models = Models()
    g = types.ModuleType("google.genai"); g.Client = Client
    root = types.ModuleType("google"); root.genai = g
    sys.modules["google"] = root; sys.modules["google.genai"] = g


def workdir():
    d = Path(tempfile.mkdtemp(prefix="vis-"))
    subprocess.run(f"git -C {SRC} ls-files -z | xargs -0 -I{{}} cp --parents {{}} {d}", shell=True, check=True)
    for f in ("scripts/visuals_sweep.py", "scripts/generate-article-visuals.py", "scripts/telegram_visuals_report.py"):
        shutil.copy(SRC / f, d / f)
    return d


def sweep(d, env=None, brief_for=lambda c: BRIEF):
    fake_genai(brief_for)
    old = os.getcwd(); os.chdir(d)
    for k in ("VISUALS_SINCE", "VISUALS_MAX", "VISUALS_ONLY"): os.environ.pop(k, None)
    os.environ.update({"GEMINI_API_KEY": "fake", **(env or {})})
    code = 0
    try:
        runpy.run_path(str(d / "scripts/visuals_sweep.py"), run_name="__main__")
    except SystemExit as e:
        code = e.code
    finally:
        os.chdir(old)
    return code, json.loads((d / "visuals-run.json").read_text())


def check(name, cond, detail=""):
    RESULTS.append((name, bool(cond), detail))


def jsonld_images(html):
    out = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        d = json.loads(m.group(1))
        for n in (d.get("@graph", [d]) if isinstance(d, dict) else d):
            t = n.get("@type") if isinstance(n, dict) else None
            if set(t if isinstance(t, list) else [t]) & {"Article", "NewsArticle", "BlogPosting"}:
                out.append(n.get("image"))
    return out


# 1. happy path on all 18 real candidates
d = workdir(); code, r = sweep(d)
check("finds exactly 18 and all succeed", r["found"] == 18 and len(r["done"]) == 18 and code == 0, f"found={r['found']} done={len(r['done'])} code={code}")
bad = []
for a in r["done"]:
    t = (d / a["file"]).read_text()
    caps = re.findall(r'<figcaption class="agv-cap">(.*?)</figcaption>', t, re.S)
    body = t[t.find("<body"):]
    above = [min([h for h in [m.start() for m in re.finditer(r"<h2\b", body)] if h > p], default=-1) for p in [m.start() for m in re.finditer(r'data-agvis="inline"', body)]]
    hero = f"https://archigenai.com/assets/hero-{a['file'][:-5]}.jpg"
    if len(caps) != 3 or any("—" in c for c in caps) or len(set(above)) != 2 or set(jsonld_images(t)) != {hero} or t.count('property="og:image" ') != 1:
        bad.append(a["file"])
check("each: 3 figures, no dashes, distinct headings, one JSON-LD image = hero, one og:image", not bad, ",".join(bad))
stage = (d / "visuals-stage.txt").read_text().split()
check("stage list = 18 articles + 54 images", len(stage) == 72, str(len(stage)))
gate = subprocess.run([sys.executable, "/home/lrd3/Projects/archigen-seo/tools/publish_gate.py", "--repo", str(d), "--require-visuals", *[a["file"] for a in r["done"]]], capture_output=True, text=True)
check("publish gate PASS with --require-visuals", "PASS" in gate.stdout, gate.stdout[:200])
code2, r2 = sweep(d)
check("second run finds nothing (idempotent)", r2["found"] == 0 and code2 == 0)

# 2. incomplete brief for one article, alongside a success
d = workdir()
victim = "archilabs-ai-alternatives-architects-2026.html"
before = (d / victim).read_text()
code, r = sweep(d, {"VISUALS_ONLY": f"{victim} lookx-ai-course-architects-2026.html"},
                brief_for=lambda c: {**BRIEF, "inline": []} if "ArchiLabs" in c else BRIEF)
check("incomplete brief: article untouched, other succeeds, exit 1", (d / victim).read_text() == before and len(r["done"]) == 1 and len(r["failed"]) == 1 and code == 1, f"done={len(r['done'])} failed={len(r['failed'])} code={code}")
check("incomplete brief: not staged", victim not in (d / "visuals-stage.txt").read_text())
_, r3 = sweep(d, {"VISUALS_ONLY": victim})
check("incomplete brief: still eligible next run", r3["found"] == 1)

# 3. both inline briefs ask for heading 0
d = workdir()
code, r = sweep(d, {"VISUALS_ONLY": "niche-chaos-ai-tools-architects-2026.html"},
                brief_for=lambda c: {**BRIEF, "inline": [dict(BRIEF["inline"][0], h2_index=0), dict(BRIEF["inline"][1], h2_index=0)]})
t = (d / "niche-chaos-ai-tools-architects-2026.html").read_text(); body = t[t.find("<body"):]
h2 = [m.start() for m in re.finditer(r"<h2\b", body)]
above = [min([h for h in h2 if h > p]) for p in [m.start() for m in re.finditer(r'data-agvis="inline"', body)]]
check("[0,0] indices land above two different headings", len(set(above)) == 2)
code, r = sweep(workdir(), {"VISUALS_ONLY": "lookx-ai-course-architects-2026.html"},
                brief_for=lambda c: {**BRIEF, "inline": [dict(BRIEF["inline"][0], h2_index=99), dict(BRIEF["inline"][1], h2_index="x")]})
check("out-of-range / non-numeric indices still place both images", len(r["done"]) == 1)

# 4. floor cannot be lowered; boundary date included
d = workdir()
older = d / "zz-older-test-article.html"
older.write_text((d / "lookx-ai-course-architects-2026.html").read_text().replace('"datePublished":"2026-11-01', '"datePublished":"2026-10-01').replace('"datePublished": "2026-11-01', '"datePublished": "2026-10-01'))
_, r = sweep(d, {"VISUALS_SINCE": "2026-01-01", "VISUALS_ONLY": older.name})
check("since=2026-01-01 is clamped to 2026-10-04 (Oct 1 article ignored)", r["since"] == "2026-10-04" and r["found"] == 0, f"since={r['since']} found={r['found']}")
_, r = sweep(d, {"VISUALS_ONLY": "comfyui-fix-architectural-render-reflections-2026.html"})
check("exact floor date 2026-10-04 is included", r["found"] == 1)
_, r = sweep(d, {"VISUALS_SINCE": "garbage", "VISUALS_ONLY": older.name})
check("invalid since falls back to the floor", r["since"] == "2026-10-04")

# 5. generic-image detection by src, not alt
d = workdir()
iconic = d / "zz-iconic.html"
src = (d / "lookx-ai-course-architects-2026.html").read_text()
iconic.write_text(src.replace('<section class="article-header">', '<img src="assets/some-real-photo.jpg" alt="Iconic architecture, brand new tower"><section class="article-header">', 1))
logo_only = d / "zz-logo-only.html"
logo_only.write_text(src.replace('<section class="article-header">', '<img src="assets/brand/logo-512.png" alt="ArchiGen"><section class="article-header">', 1))
_, r = sweep(d, {"VISUALS_ONLY": f"{iconic.name} {logo_only.name}"})
check("real image with 'Iconic'/'brand' alt is not treated as missing", iconic.name not in [a["file"] for a in r["done"]])
check("logo-only article is treated as missing images", logo_only.name in [a["file"] for a in r["done"]])

# 6. existing JSON-LD image is replaced, BlogPosting handled
d = workdir()
blog = d / "zz-blogposting.html"
t = src.replace('"@type":"Article"', '"@type":"BlogPosting","image":"https://archigenai.com/assets/brand/old-logo.jpg"', 1)
blog.write_text(t)
_, r = sweep(d, {"VISUALS_ONLY": blog.name})
imgs = jsonld_images(blog.read_text()) if r["done"] else []
check("existing JSON-LD image replaced; exactly one hero reference (BlogPosting)", imgs == [f"https://archigenai.com/assets/hero-{blog.stem}.jpg"], str(imgs))

# 7. Telegram reporter never fails
def report(env, post=None, break_import=False):
    d2 = workdir(); shutil.copy(d / "visuals-run.json", d2 / "visuals-run.json")
    import requests
    saved_post, saved_mod = requests.post, sys.modules.get("requests")
    if post: requests.post = post
    if break_import: sys.modules["requests"] = None
    os.environ.update(env)
    code = 0
    try:
        runpy.run_path(str(d2 / "scripts/telegram_visuals_report.py"), run_name="__main__")
    except SystemExit as e:
        code = e.code
    finally:
        requests.post = saved_post; sys.modules["requests"] = saved_mod
        for k in env: os.environ.pop(k, None)
    return code
creds = {"TELEGRAM_BOT_TOKEN": "x", "TELEGRAM_CHAT_ID": "1", "VISUALS_PUSHED": "true"}
check("telegram: missing secrets -> exit 0", report({}) == 0)
check("telegram: requests import failure -> exit 0", report(creds, break_import=True) == 0)
class R429:
    status_code = 429; ok = False; text = "secret-body"
    def json(self): return {"parameters": {"retry_after": 99999}}
import time as _t
slept = []
real_sleep = _t.sleep; _t.sleep = lambda s: slept.append(s)
code = report(creds, post=lambda *a, **k: R429())
_t.sleep = real_sleep
check("telegram: 429 with huge retry_after is capped at 30 s, exit 0", code == 0 and slept and max(slept) <= 30, f"max sleep {max(slept) if slept else None}")

ok = sum(1 for _, p, _ in RESULTS if p)
print(f"\n{ok}/{len(RESULTS)} passed")
for n, p, det in RESULTS:
    print(("PASS " if p else "FAIL ") + n + (f"  ({det})" if det and not p else ""))
sys.exit(0 if ok == len(RESULTS) else 1)
