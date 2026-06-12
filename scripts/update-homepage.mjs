#!/usr/bin/env node
// update-homepage.mjs — keep index.html fresh from published articles.
//
// Cards update daily (driven by article JSON-LD); the issue number/date
// advance weekly from a Sunday anchor, in step with the Sunday letter.
// The main hero and cover artwork are deliberately NOT touched — those
// change by hand, for editorial reasons only.
//
// Idempotent: managed regions are delimited by AUTO markers after the
// first run. Run from repo root: node scripts/update-homepage.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const INDEX = 'index.html';

// ---- 1. collect articles from JSON-LD ----
const articles = [];
for (const file of readdirSync('.')) {
  if (!file.endsWith('.html') || file === INDEX) continue;
  let html;
  try { html = readFileSync(file, 'utf8'); } catch { continue; }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    const items = Array.isArray(data['@graph']) ? data['@graph'] : [data];
    for (const it of items) {
      if (!String(it['@type'] || '').includes('Article')) continue;
      const published = Date.parse(it.datePublished || '');
      if (!it.headline || Number.isNaN(published)) continue;
      const minutes = parseMinutes(it.timeRequired) ?? estimateMinutes(html);
      articles.push({
        file,
        headline: String(it.headline),
        description: String(it.description || ''),
        section: String(it.articleSection || 'Field Notes').split(',')[0].trim(),
        published,
        minutes,
      });
    }
  }
}
articles.sort((a, b) => b.published - a.published || a.file.localeCompare(b.file));
if (articles.length < 5) {
  console.error(`Only ${articles.length} articles found — refusing to rewrite homepage.`);
  process.exit(1);
}

function parseMinutes(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || '');
  if (!m || (!m[1] && !m[2])) return null;
  return (Number(m[1] || 0) * 60) + Number(m[2] || 0);
}
function estimateMinutes(html) {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ');
  return Math.max(3, Math.round(text.split(/\s+/).length / 220));
}

// ---- 2. weekly issue from Sunday anchor (Issue 047 = week of Sun 2026-05-24) ----
const ANCHOR_UTC = Date.UTC(2026, 4, 24);
const ANCHOR_ISSUE = 47;
const todayNY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
const [y, mo, d] = todayNY.split('-').map(Number);
const weeks = Math.floor((Date.UTC(y, mo - 1, d) - ANCHOR_UTC) / (7 * 86400000));
const issueNo = String(ANCHOR_ISSUE + weeks).padStart(3, '0');
const issueDate = fmtDate(new Date(ANCHOR_UTC + weeks * 7 * 86400000));

function fmtDate(dt) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(dt);
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shorten = (s, max = 58) => s.length <= max ? s : s.slice(0, max).replace(/\s+\S*$/, '') + '…';
const monthYear = (ts) => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(ts));
const readTag = (m) => m > 12 ? '<span class="r warn">Long</span>' : `<span class="r">${m} min</span>`;

// ---- 3. rewrite managed regions ----
let html = readFileSync(INDEX, 'utf8');
let changes = [];

// region(): replace marker content if present, else convert the legacy
// static markup (first run) into a marked region.
function region(name, fresh, legacyRe) {
  const marked = new RegExp(`(<!--AUTO:${name}-->)[\\s\\S]*?(<!--/AUTO:${name}-->)`, 'g');
  const wrapped = `<!--AUTO:${name}-->${fresh}<!--/AUTO:${name}-->`;
  if (marked.test(html)) {
    const before = html;
    html = html.replace(marked, wrapped);
    if (html !== before) changes.push(name);
    return;
  }
  if (legacyRe.test(html)) {
    html = html.replace(legacyRe, wrapped);
    changes.push(`${name} (first run)`);
  } else {
    console.error(`WARN: region "${name}" not found — skipped`);
  }
}

// journal section meta — must run BEFORE issue-date so the global date
// regex below can't swallow this line's "Updated 26 May 2026"
region('journal-meta',
  `${articles.length} articles · Updated ${fmtDate(new Date(articles[0].published))}`,
  /11 of 62 · Updated 26 May 2026/);

// marquee + masthead issue number/date (legacy regexes are global: ×2 in marquee;
// (?<=>) pins the date to whole-span contents only)
region('issue-no', `Issue № ${issueNo}`, /Issue № 047/g);
region('issue-date', issueDate, /(?<=>)26 May 2026(?=<\/span>)/g);
region('vol-issue', `Vol. 04 · Issue ${issueNo}`, /Vol\. 04 · Issue 047/);

// bento feature card = newest article
const f = articles[0];
const ARROW = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>';
region('feature-card', `
      <a href="${f.file}" class="art-card feature" style="text-decoration:none;display:block;">
        <div class="cat"><span class="dot"></span> ${esc(f.section)} · ${monthYear(f.published)}</div>
        <h3>${esc(f.headline)}</h3>
        <div class="viz"></div>
        <p class="excerpt">${esc(f.description)}</p>
        <div class="foot">
          <span>${f.minutes} min · ${esc(f.section)}</span>
          <span class="arrow">${ARROW}</span>
        </div>
      </a>`,
  /\n\s*<a href="[^"]*" class="art-card feature"[\s\S]*?<\/a>/);

// bento list card = next four articles
const items = articles.slice(1, 5).map(a =>
  `          <li><a href="${a.file}" style="text-decoration:none;color:inherit;"><span class="t">${esc(shorten(a.headline))}</span>${readTag(a.minutes)}</a></li>`
).join('\n');
region('list-card', `
        <div class="cat"><span class="dot"></span> On the Site · ${monthYear(articles[1].published)}</div>
        <ul>
${items}
        </ul>`,
  /\n\s*<div class="cat"><span class="dot"><\/span> On the Site[\s\S]*?<\/ul>/);

writeFileSync(INDEX, html);
console.log(`Issue № ${issueNo} · ${issueDate} · ${articles.length} articles`);
console.log(`Feature: ${f.headline} (${f.file})`);
console.log(`Updated regions: ${changes.length ? changes.join(', ') : 'none (already current)'}`);
