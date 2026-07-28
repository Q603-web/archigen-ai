#!/usr/bin/env node
// Post ArchiGen articles to @ArchiGenAi with their hero image.
//
//   node scripts/x-poster.mjs --latest        # newest not-yet-posted article
//   node scripts/x-poster.mjs --backfill 2    # N older not-yet-posted articles
//   node scripts/x-poster.mjs --dry-run ...   # compose only, post nothing
//
// Creds from env: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
// (OAuth 1.0a user context — same as tweet.js). Never hardcode values here.
// Posted-state ledger lives OUTSIDE the repo: ../x-poster-state.json

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { TwitterApi } from 'twitter-api-v2';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATE = process.env.X_POSTER_STATE || path.join(REPO, '..', 'x-poster-state.json');
const SITE = 'https://archigenai.com';

const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const val = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? Number(args[i + 1]) : d; };
const DRY = has('dry-run');
const LATEST = has('latest');
const BACKFILL = val('backfill', 0);

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { posted: {} };

function articles() {
  // added-date per file from one git pass (newest first)
  const log = execSync('git log --diff-filter=A --name-only --format=%ct', { cwd: REPO, encoding: 'utf8' });
  const added = {}; let ts = 0;
  for (const line of log.split('\n')) {
    const t = line.trim();
    if (/^\d+$/.test(t)) ts = Number(t);
    else if (t.endsWith('.html') && !t.includes('/')) added[t] ??= ts;
  }
  return fs.readdirSync(REPO)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ file: f, slug: f.replace(/\.html$/, ''), html: fs.readFileSync(path.join(REPO, f), 'utf8'), added: added[f] ?? 0 }))
    .filter((a) => a.html.includes('article-body') && a.html.includes('data-agvis'))
    .filter((a) => fs.existsSync(path.join(REPO, 'assets', `hero-${a.slug}.jpg`)))
    .sort((a, b) => b.added - a.added);
}

function compose(a) {
  const og = (p) => (a.html.match(new RegExp(`<meta (?:property|name)="${p}" content="([^"]+)"`)) || [])[1] || '';
  const title = (og('og:title') || a.slug).replace(/,?\s*ArchiGen AI\s*$/i, '');
  const desc = og('og:description') || og('description') || '';
  const hook = desc.split(/(?<=[.!?])\s/)[0] || '';
  const url = `${SITE}/${a.file}`;
  // 280 budget: title + \n\n + hook + \n\n + t.co URL (23)
  let text = title;
  const room = 280 - 23 - 2 - text.length - 2;
  if (hook && hook.length <= room) text += `\n\n${hook}`;
  text += `\n\n${url}`;
  return { text, hero: path.join(REPO, 'assets', `hero-${a.slug}.jpg`) };
}

async function postOne(client, a) {
  const { text, hero } = compose(a);
  if (DRY) { console.log(`--- DRY ${a.slug}\n${text}\n[media] ${path.basename(hero)}`); return; }
  const mediaId = await client.v1.uploadMedia(hero);
  const res = await client.v2.tweet({ text, media: { media_ids: [mediaId] } });
  state.posted[a.slug] = { id: res.data?.id, at: new Date().toISOString() };
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
  console.log(`posted ${a.slug} -> ${res.data?.id}`);
}

(async () => {
  for (const k of ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET']) {
    if (!process.env[k] && !DRY) { console.error(`missing env ${k}`); process.exit(1); }
  }
  const client = DRY ? null : new TwitterApi({
    appKey: process.env.X_API_KEY, appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN, accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
  const pool = articles().filter((a) => !state.posted[a.slug]);
  if (!pool.length) { console.log('nothing unposted'); return; }
  const picks = [];
  if (LATEST) picks.push(pool[0]);
  if (BACKFILL > 0) picks.push(...pool.slice(LATEST ? 1 : 0).reverse().slice(0, BACKFILL)); // oldest classics first
  if (!picks.length) picks.push(pool[0]);
  for (const a of picks) {
    try { await postOne(client, a); }
    catch (e) { console.error(`FAILED ${a.slug}: ${e.message || e}`); process.exitCode = 1; }
  }
})();
