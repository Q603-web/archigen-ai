"""Offline scenario tests for the automatic article-images job (no network, no spend).
Run: uv run --with pillow --with requests python tests/test_visuals.py
Each scenario copies the repo to a temp dir, fakes google.genai, and runs the real sweep/engine/report code."""
import atexit, io, json, os, re, runpy, shutil, subprocess, sys, tempfile, types
from pathlib import Path
from PIL import Image

SRC = Path(__file__).resolve().parent.parent
RESULTS = []
BRIEF = {"hero": {"prompt": "p", "alt": "A bright villa — test", "caption": "Wry — caption"},
         "inline": [{"h2_index": 1, "prompt": "p", "alt": "Inline one alt", "caption": "c1"},
                    {"h2_index": 1, "prompt": "p", "alt": "Inline two alt", "caption": "c2"}]}


GEMINI = {"image_error": None, "image_calls": 0}


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
            GEMINI["image_calls"] += 1
            if GEMINI["image_error"]:
                raise RuntimeError(GEMINI["image_error"])
            b = io.BytesIO(); Image.new("RGB", (1600, 900), (30, 140, 200)).save(b, "PNG"); return Resp(img=b.getvalue())
    class Client:
        def __init__(s, *a, **k):
            if not os.environ.get("GEMINI_API_KEY"):
                raise ValueError("Missing key inputs argument! (no API key)")
            s.models = Models()
    g = types.ModuleType("google.genai"); g.Client = Client
    root = types.ModuleType("google"); root.genai = g
    sys.modules["google"] = root; sys.modules["google.genai"] = g


def workdir():
    d = Path(tempfile.mkdtemp(prefix="vis-"))
    atexit.register(shutil.rmtree, d, ignore_errors=True)  # each copy is ~250 MB; never leave them in /tmp
    subprocess.run(f"git -C {SRC} ls-files -z | xargs -0 -I{{}} cp --parents {{}} {d}", shell=True, check=True)
    for f in ("scripts/visuals_sweep.py", "scripts/generate-article-visuals.py", "scripts/telegram_visuals_report.py"):
        shutil.copy(SRC / f, d / f)
    # Every real article has images since the 16 Nov 2026 backfill, so take them off the copies again:
    # the scenarios need articles that are waiting for images.
    for f in d.glob("*.html"):
        h = f.read_text(encoding="utf-8", errors="replace")
        if "data-agvis" not in h:
            continue
        h = re.sub(r'\n?<section class="agv-hero-section" data-agvis="hero">.*?</section>\n?', "", h, flags=re.S)
        h = re.sub(r'<figure class="agv-inline" data-agvis="inline">.*?</figure>\s*', "", h, flags=re.S)
        f.write_text(h, encoding="utf-8")
        for img in (d / "assets").glob(f"*-{f.stem}*.jpg"):
            if img.name.startswith(("hero-", "inline-")):
                img.unlink()
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


# 1. happy path on every real candidate (the number grows as articles are published)
d = workdir(); code, r = sweep(d)
check("finds every waiting article and all succeed", r["found"] >= 1 and len(r["done"]) == r["found"] and code == 0, f"found={r['found']} done={len(r['done'])} code={code}")
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
check("stage list = each article + its 3 images", len(stage) == 4 * r["found"], str(len(stage)))
gate = subprocess.run([sys.executable, "/home/lrd3/Projects/archigen-seo/tools/publish_gate.py", "--repo", str(d), "--require-visuals", *[a["file"] for a in r["done"]]], capture_output=True, text=True)
check("publish gate PASS with --require-visuals", "PASS" in gate.stdout, gate.stdout[:200])
code2, r2 = sweep(d)
check("second run finds nothing (idempotent)", r2["found"] == 0 and code2 == 0)

# 1b. the brief model answers "503 high demand" twice, then works: the article still gets its images
d = workdir()
calls = {"n": 0}
def busy_then_ok(c):
    calls["n"] += 1
    if calls["n"] <= 2:
        raise RuntimeError("503 UNAVAILABLE. This model is currently experiencing high demand.")
    return BRIEF
code, r = sweep(d, {"VISUALS_ONLY": "lookx-ai-course-architects-2026.html", "VISUALS_BUSY_WAIT": "0"}, brief_for=busy_then_ok)
check("busy model (503 twice) is retried and the article succeeds", len(r["done"]) == 1 and code == 0 and calls["n"] == 3, f"done={len(r['done'])} code={code} calls={calls['n']}")
os.environ.pop("VISUALS_BUSY_WAIT", None)

# ---- backup provider (GPT Image 2 through the gateway), against a local fake gateway ----
import base64, http.server, threading
GW = {"images": 0, "chats": 0, "fail": False, "auth": []}
class FakeGateway(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        GW["auth"].append(self.headers.get("Authorization"))
        if GW["fail"]:
            self.send_response(500); self.end_headers(); self.wfile.write(b"gateway down"); return
        if self.path.endswith("/images/generations"):
            GW["images"] += 1
            b = io.BytesIO(); Image.new("RGB", (1536, 1024), (200, 60, 40)).save(b, "PNG")
            out = {"data": [{"b64_json": base64.b64encode(b.getvalue()).decode()}], "model": body["model"]}
        else:
            GW["chats"] += 1
            out = {"choices": [{"message": {"content": "```json\n" + json.dumps(BRIEF) + "\n```"}}]}
        data = json.dumps(out).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(data)
gw = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FakeGateway)
threading.Thread(target=gw.serve_forever, daemon=True).start()
BACKUP_ENV = {"AI_GATEWAY_API_KEY": "gw-test", "VISUALS_GATEWAY_URL": f"http://127.0.0.1:{gw.server_port}/v1", "VISUALS_BUSY_WAIT": "0"}
ONE = "lookx-ai-course-architects-2026.html"
def backup_case(env, image_error=None, brief_for=lambda c: BRIEF, fail=False):
    for k in list(BACKUP_ENV) + ["VISUALS_BACKUP_MAX_IMAGES"]: os.environ.pop(k, None)
    GW.update(images=0, chats=0, fail=fail, auth=[]); GEMINI.update(image_error=image_error, image_calls=0)
    d = workdir(); before = (d / ONE).read_text()
    code, r = sweep(d, {"VISUALS_ONLY": ONE, **env}, brief_for=brief_for)
    after = (d / ONE).read_text()
    GEMINI["image_error"] = None
    for k in list(BACKUP_ENV) + ["VISUALS_BACKUP_MAX_IMAGES"]: os.environ.pop(k, None)
    return code, r, before, after, d

QUOTA = "429 RESOURCE_EXHAUSTED. Quota exceeded for metric: generate_content_free_tier_requests, limit: 0"
code, r, before, after, d = backup_case(BACKUP_ENV, image_error=QUOTA)
check("backup: Gemini image quota error -> GPT Image makes all 3, article done", code == 0 and len(r["done"]) == 1 and GW["images"] == 3 and r.get("backup_images") == 3, f"code={code} done={len(r['done'])} gw={GW['images']} rec={r.get('backup_images')}")
check("backup: captions say GPT Image, not Gemini", after.count("AI illustration (GPT Image)") == 3 and "AI illustration (Gemini)" not in after)
check("backup: quota error is not retried against Gemini", GEMINI["image_calls"] == 3, str(GEMINI["image_calls"]))
check("backup: hero is cropped to 16:9 and inline to 4:3", [round(Image.open(d / i).width / Image.open(d / i).height, 2) for i in r["done"][0]["images"]] == [1.78, 1.33, 1.33] if r["done"] else False)
check("backup: gateway key sent as bearer token", set(GW["auth"]) == {"Bearer gw-test"}, str(set(GW["auth"])))

def always_busy(c): raise RuntimeError("503 UNAVAILABLE. This model is currently experiencing high demand.")
code, r, before, after, d = backup_case(BACKUP_ENV, brief_for=always_busy)
check("backup: Gemini briefs down -> backup briefs, Gemini still makes the images", code == 0 and len(r["done"]) == 1 and GW["chats"] == 1 and GW["images"] == 0 and after.count("AI illustration (Gemini)") == 3 and r.get("backup_briefs") == 1, f"code={code} chats={GW['chats']} imgs={GW['images']}")

code, r, before, after, d = backup_case({**BACKUP_ENV, "GEMINI_API_KEY": ""})
check("backup: no Gemini key at all -> everything by the backup", code == 0 and len(r["done"]) == 1 and GW["chats"] == 1 and GW["images"] == 3, f"code={code} done={len(r['done'])} chats={GW['chats']} imgs={GW['images']}")

code, r, before, after, d = backup_case({"VISUALS_BUSY_WAIT": "0"}, image_error=QUOTA)
check("no backup key: Gemini failure still fails honestly, article untouched", code == 1 and len(r["failed"]) == 1 and after == before and GW["images"] == 0, f"code={code}")
os.environ.pop("VISUALS_BUSY_WAIT", None)

code, r, before, after, d = backup_case({**BACKUP_ENV, "VISUALS_BACKUP_MAX_IMAGES": "2"}, image_error=QUOTA)
check("backup cap of 2 images: article fails, untouched, no third paid image", code == 1 and after == before and GW["images"] == 2 and "cap" in r["failed"][0]["error"], f"code={code} gw={GW['images']} err={r['failed'][0]['error'][:60] if r['failed'] else None}")

code, r, before, after, d = backup_case(BACKUP_ENV, image_error=QUOTA, fail=True)
check("Gemini and the backup both down: article fails, untouched, exit 1", code == 1 and len(r["failed"]) == 1 and after == before, f"code={code}")
check("both down: the error names the backup and leaks no key", "backup" in r["failed"][0]["error"] and "gw-test" not in json.dumps(r), r["failed"][0]["error"][:80] if r["failed"] else "")

code, r, before, after, d = backup_case(BACKUP_ENV, image_error="500 INTERNAL. transient")
check("backup: transient Gemini image error is retried once before the backup", code == 0 and GEMINI["image_calls"] == 6 and GW["images"] == 3, f"gemini calls={GEMINI['image_calls']} gw={GW['images']}")

code, r, before, after, d = backup_case(BACKUP_ENV)
check("backup configured but Gemini healthy: backup is never called", code == 0 and GW["images"] == 0 and GW["chats"] == 0 and r.get("backup_images") == 0)
for k, v in {**BACKUP_ENV, "VISUALS_BACKUP_SELFTEST": "true"}.items(): os.environ[k] = v
GW.update(images=0, chats=0, fail=False, auth=[])
d = workdir(); snap = subprocess.run(["git", "-C", str(SRC), "status", "--porcelain"], capture_output=True, text=True).stdout
code, r = sweep(d, {"VISUALS_BACKUP_SELFTEST": "true", **BACKUP_ENV})
check("backup self-test: one brief + one image through the backup, nothing staged or done", code == 0 and GW["chats"] == 1 and GW["images"] == 1 and not r["done"] and (d / "visuals-stage.txt").read_text() == "", f"code={code} chats={GW['chats']} imgs={GW['images']}")
GW["fail"] = True
code, r = sweep(d, {"VISUALS_BACKUP_SELFTEST": "true", **BACKUP_ENV})
check("backup self-test: reports failure (exit 1) when the gateway is down", code == 1)
os.environ.pop("AI_GATEWAY_API_KEY", None)
code, r = sweep(d, {"VISUALS_BACKUP_SELFTEST": "true"})
check("backup self-test: fails clearly when the backup key is missing", code == 1)
for k in list(BACKUP_ENV) + ["VISUALS_BACKUP_SELFTEST"]: os.environ.pop(k, None)
gw.shutdown()

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
def report(env, post=None, break_import=False, run_json="copy"):
    d2 = workdir()
    if run_json == "copy": shutil.copy(d / "visuals-run.json", d2 / "visuals-run.json")
    elif run_json is not None: (d2 / "visuals-run.json").write_text(json.dumps(run_json))
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

class ROK:
    status_code = 200; ok = True
sent = []
def grab(url, data=None, files=None, timeout=None):
    sent.append((url.rsplit("/", 1)[-1], (data or {}).get("text", ""))); return ROK()
empty = {"found": 0, "done": [], "failed": []}
sent.clear(); report(creds, post=grab, run_json=empty)
check("telegram: quiet run with nothing to do sends no message", sent == [], str(sent))
sent.clear(); report({**creds, "VISUALS_SWEEP_OUTCOME": "failure"}, post=grab, run_json=None)
check("telegram: job crashed before recording anything -> one failure alert", len(sent) == 1 and "FAILED before making any image" in sent[0][1], str(sent))
sent.clear(); report({**creds, "VISUALS_SWEEP_OUTCOME": "failure"}, post=grab, run_json=empty)
check("telegram: job failed with an empty record -> one failure alert", len(sent) == 1 and "FAILED" in sent[0][1], str(sent))
sent.clear(); report({**creds, "VISUALS_SWEEP_OUTCOME": "success"}, post=grab, run_json={**empty, "selftest": True})
check("telegram: self-test pass sends a test alert", len(sent) == 1 and "self-test passed" in sent[0][1], str(sent))
sent.clear(); report({**creds, "VISUALS_SWEEP_OUTCOME": "failure"}, post=grab, run_json={**empty, "selftest": True})
check("telegram: self-test failure sends a failure alert", len(sent) == 1 and "self-test FAILED" in sent[0][1], str(sent))

ok = sum(1 for _, p, _ in RESULTS if p)
print(f"\n{ok}/{len(RESULTS)} passed")
for n, p, det in RESULTS:
    print(("PASS " if p else "FAIL ") + n + (f"  ({det})" if det and not p else ""))
sys.exit(0 if ok == len(RESULTS) else 1)
