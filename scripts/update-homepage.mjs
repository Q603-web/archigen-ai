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

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

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
        ...articleImage(it, html),
      });
    }
  }
}
articles.sort((a, b) => b.published - a.published || a.file.localeCompare(b.file));
if (articles.length < 5) {
  console.error(`Only ${articles.length} articles found — refusing to rewrite homepage.`);
  process.exit(1);
}

// Only use real, local article artwork; never promote an external URL into markup.
function articleImage(article, html) {
  let candidate = Array.isArray(article.image) ? article.image[0] : article.image;
  candidate = typeof candidate === 'object' ? candidate?.url : candidate;
  if (typeof candidate !== 'string') return {};
  const file = candidate.replace(/^https:\/\/archigenai\.com\//, '');
  if (!/^assets\/[a-zA-Z0-9._-]+\.(?:webp|png|jpe?g)$/.test(file) || !existsSync(file)) return {};
  const imageTag = [...html.matchAll(/<img\b[^>]*>/g)].find(m => m[0].includes(`src="${file}"`))?.[0] || '';
  const alt = /\balt="([^"]*)"/.exec(imageTag)?.[1] || `Illustration for ${article.headline}`;
  const width = /\bwidth="(\d+)"/.exec(imageTag)?.[1];
  const height = /\bheight="(\d+)"/.exec(imageTag)?.[1];
  return { image: file, imageAlt: alt.replace(/&quot;/g, '"').replace(/&amp;/g, '&'), imageDimensions: width && height ? ` width="${width}" height="${height}"` : '' };
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
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
if (html.includes('<!--AUTO:issue-date-->')) region('issue-date', issueDate, /(?<=>)26 May 2026(?=<\/span>)/g);
region('vol-issue', `Vol. 04 · Issue ${issueNo}`, /Vol\. 04 · Issue 047/);

// Two recent illustrated articles lead the journal. New articles awaiting artwork
// remain discoverable in the reading desk rather than receiving fake images.
const illustrated = articles.filter(a => a.image);
const featured = illustrated.length >= 2 ? illustrated.slice(0, 2) : articles.slice(0, 2);
const cards = featured.map(a => `
  <a class="story-card" href="${esc(a.file)}">
    <div class="story-art">${a.image ? `<img src="${esc(a.image)}" alt="${esc(a.imageAlt)}"${a.imageDimensions} loading="lazy" decoding="async">` : `<div class="story-placeholder">${esc(a.section)}</div>`}<span class="story-arrow" aria-hidden="true">↗</span></div>
    <span class="eyebrow">${esc(a.section)} · ${fmtDate(new Date(a.published))}</span>
    <h3>${esc(a.headline)}</h3>
    <p class="excerpt">${esc(a.description)}</p>
    <span class="read-label">${a.minutes} min read</span>
  </a>`).join('\n');
region('feature-card', cards, /$^/);

const items = articles.filter(a => !featured.some(f => f.file === a.file)).slice(0, 4).map((a, i) => `
  <li><a href="${esc(a.file)}"><span class="desk-no">0${i + 1}</span><span><span class="desk-date">${esc(a.section)} · ${fmtDate(new Date(a.published))}</span><span class="desk-title">${esc(a.headline)}</span></span><span class="desk-time">${a.minutes} min ↗</span></a></li>`).join('\n');
region('list-card', `<ul>${items}\n</ul>`, /$^/);

writeFileSync(INDEX, html);
console.log(`Issue № ${issueNo} · ${issueDate} · ${articles.length} articles`);
console.log(`Featured: ${featured.map(a => a.headline).join("; ")}`);
console.log(`Updated regions: ${changes.length ? changes.join(', ') : 'none (already current)'}`);
