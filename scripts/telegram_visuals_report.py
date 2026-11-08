#!/usr/bin/env python3
"""Send the owner what the visuals job pushed: one summary message, then an album per article
(its images, title and link), naming any article that failed. Uses Nora's Telegram bot.

Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (repo secrets), VISUALS_PUSHED ("true" once the commit is on master),
     GITHUB_SERVER_URL / GITHUB_REPOSITORY / GITHUB_RUN_ID (link to the run).
Never fails the job: missing secrets or Telegram errors are printed and skipped.
"""
import html
import json
import os
import sys
import time
from pathlib import Path

import requests

REPO = Path(__file__).resolve().parent.parent
RUN = REPO / "visuals-run.json"


def main():
    token, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set; skipping report")
        return 0
    if not RUN.exists():
        print("[telegram] no visuals-run.json; nothing to report")
        return 0
    run = json.loads(RUN.read_text())
    done, failed = run.get("done", []), run.get("failed", [])
    if not done and not failed:
        print("[telegram] nothing generated and nothing failed; no message")
        return 0
    api = f"https://api.telegram.org/bot{token}"
    pushed = os.environ.get("VISUALS_PUSHED") == "true"
    run_url = f"{os.environ.get('GITHUB_SERVER_URL', 'https://github.com')}/{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}"

    lines = [f"<b>ArchiGen article images</b>: {len(done)} article(s) got a hero + 2 inline images"
             + (" and are live on the site within a few minutes." if pushed else ", but the push to the site FAILED (see the run).")]
    if failed:
        lines.append(f"\n<b>Failed ({len(failed)})</b>, the next run retries them:")
        lines += [f"• {html.escape(f.get('title') or f['file'])}: {html.escape(f['error'][:120])}" for f in failed]
    lines.append(f'\n<a href="{run_url}">Run log</a>')
    send(api, "sendMessage", data={"chat_id": chat, "text": "\n".join(lines), "parse_mode": "HTML",
                                   "disable_web_page_preview": "true"})

    for a in done:
        files, media = {}, []
        for i, img in enumerate(a["images"]):
            p = REPO / img
            if not p.exists():
                continue
            key = f"p{i}"
            files[key] = (p.name, p.read_bytes(), "image/jpeg")
            item = {"type": "photo", "media": f"attach://{key}"}
            if not media:
                item.update(caption=f'<b>{html.escape(a["title"])}</b>\n{a["url"]}', parse_mode="HTML")
            media.append(item)
        if media:
            send(api, "sendMediaGroup", data={"chat_id": chat, "media": json.dumps(media)}, files=files)
            time.sleep(1.5)  # stay well under Telegram's per-chat rate limit
    return 0


def send(api, method, data, files=None):
    for attempt in range(3):
        try:
            r = requests.post(f"{api}/{method}", data=data, files=files, timeout=60)
            if r.status_code == 429:  # rate limited: wait as told, then retry
                time.sleep(int(r.json().get("parameters", {}).get("retry_after", 5)) + 1)
                continue
            if not r.ok:
                print(f"[telegram] {method} failed: HTTP {r.status_code} {r.text[:200]}")
            return
        except requests.RequestException as e:
            print(f"[telegram] {method} error: {type(e).__name__}")
            time.sleep(3)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # reporting must never fail the job
        print(f"[telegram] report skipped: {type(e).__name__}: {e}")
        sys.exit(0)
