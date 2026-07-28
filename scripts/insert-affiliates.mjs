#!/usr/bin/env node
//
// insert-affiliates.mjs
//
// Scans ArchiGen article HTML and injects affiliate links on the FIRST mention
// of each mapped AI tool, inside <div class="article-body"> prose only.
//
// - Pure regex/string ops (no DOM lib), matching update-homepage.mjs / link-bylines.mjs.
// - Idempotent: inserted links carry data-affiliate="<slug>"; re-runs skip tools
//   already linked in that article, so it never double-inserts.
// - Never links inside an existing <a>...</a> (won't clobber internal links).
// - FTC: inserted links get rel="sponsored nofollow"; if the article carries the old
//   "No affiliate relationship..." disclaimer it's rewritten to a proper disclosure
//   (or a disclosure <p> is appended) whenever a real (url-backed) link is added.
// - Tools with an empty url are still SCANNED/COUNTED (opportunity) but not linked.
//
// Usage:
//   node insert-affiliates.mjs                 # DRY RUN (default) — report only, writes nothing
//   node insert-affiliates.mjs --apply         # write changes to files
//   node insert-affiliates.mjs --limit 20      # only first 20 articles (testing)
//   node insert-affiliates.mjs --tool topaz-photo-ai   # only this tool
//   node insert-affiliates.mjs --json          # machine-readable summary
//
// Map: ./affiliate-map.json (put YOUR affiliate URLs there).
// After --apply: review the diff, then branch + PR (master pushes are blocked).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const MAP_PATH = path.join(SCRIPT_DIR, 'affiliate-map.json');

const LINK_STYLE = 'color:inherit;text-decoration:underline;text-decoration-color:rgba(26,25,21,0.25);text-underline-offset:3px;';
const DISCLOSURE = 'ArchiGen may earn a commission when you buy through links to tools we name. It never affects our reviews or rankings.';
const DISCLOSURE_STYLE = 'font-family: var(--f-mono); font-size: 11px; color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase;';

// --- args -------------------------------------------------------------------
const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const val = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const APPLY = has('apply');
const JSON_OUT = has('json');
const LIMIT = parseInt(val('limit', '0'), 10) || 0;
const ONLY_TOOL = val('tool', null);

// --- load map ---------------------------------------------------------------
function loadTools() {
  const raw = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  let tools = raw.tools || [];
  if (ONLY_TOOL) tools = tools.filter((t) => t.slug === ONLY_TOOL);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const t of tools) {
    // longest alias first so "Topaz Photo AI" beats "Topaz"
    const aliases = [...(t.match || [])].sort((a, b) => b.length - a.length).map(esc);
    // word-safe: no alphanumeric immediately adjacent (so "Flux" != "influx")
    t._re = new RegExp(`(?<![A-Za-z0-9])(?:${aliases.join('|')})(?![A-Za-z0-9])`, 'i');
    t.url = (t.url || '').trim();
  }
  return tools;
}

// --- article discovery ------------------------------------------------------
function articleFiles() {
  return fs.readdirSync(REPO_ROOT)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => fs.readFileSync(path.join(REPO_ROOT, f), 'utf8').includes('<div class="article-body"'))
    .sort();
}

// --- extract the article-body region (balanced <div> scan) ------------------
function splitBody(html) {
  const m = /<div class="article-body"[^>]*>/.exec(html);
  if (!m) return null;
  const bodyStart = m.index + m[0].length;
  const tagRe = /<\/?div\b[^>]*>/g;
  tagRe.lastIndex = bodyStart;
  let depth = 1, mm;
  while ((mm = tagRe.exec(html))) {
    depth += mm[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return { before: html.slice(0, bodyStart), body: html.slice(bodyStart, mm.index), after: html.slice(mm.index) };
  }
  return null;
}

function buildLink(tool, text) {
  return `<a href="${tool.url}" rel="sponsored nofollow" target="_blank" data-affiliate="${tool.slug}" style="${LINK_STYLE}">${text}</a>`;
}

// --- link first mention of each tool in body prose --------------------------
function processBody(body, tools, alreadyLinked) {
  const tokens = body.split(/(<[^>]+>)/);
  const done = new Set(alreadyLinked);
  const hits = [];
  let inAnchor = 0;
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok && tok[0] === '<') {
      const t = tok.toLowerCase();
      if (/^<a[\s>]/.test(t)) inAnchor++;
      else if (t.startsWith('</a')) inAnchor = Math.max(0, inAnchor - 1);
      continue;
    }
    if (inAnchor > 0 || !tok || !tok.trim()) continue;
    const cands = [];
    for (const tool of tools) {
      if (done.has(tool.slug)) continue;
      const m = tool._re.exec(tok);
      if (m) cands.push({ start: m.index, end: m.index + m[0].length, text: m[0], tool });
    }
    if (!cands.length) continue;
    cands.sort((a, b) => a.start - b.start);
    const chosen = [];
    let lastEnd = -1;
    for (const c of cands) if (c.start >= lastEnd) { chosen.push(c); lastEnd = c.end; }
    let out = '', idx = 0;
    for (const c of chosen) {
      done.add(c.tool.slug);
      hits.push({ slug: c.tool.slug, text: c.text, linked: !!c.tool.url });
      out += tok.slice(idx, c.start) + (c.tool.url ? buildLink(c.tool, c.text) : c.text);
      idx = c.end;
    }
    out += tok.slice(idx);
    tokens[i] = out;
  }
  return { body: tokens.join(''), hits };
}

// --- main -------------------------------------------------------------------
const tools = loadTools();
const files = articleFiles().slice(0, LIMIT || undefined);
const perTool = new Map(); // slug -> { articles, linkedArticles, url }
const changed = [];        // {file, linked:[{slug,text}], disclosure}
const samples = [];

for (const f of files) {
  const fp = path.join(REPO_ROOT, f);
  let html = fs.readFileSync(fp, 'utf8');
  const parts = splitBody(html);
  if (!parts) continue;

  const already = tools.filter((t) => html.includes(`data-affiliate="${t.slug}"`)).map((t) => t.slug);
  const { body: newBody, hits } = processBody(parts.body, tools, already);
  if (!hits.length) continue;

  for (const h of hits) {
    const rec = perTool.get(h.slug) || { articles: 0, linkedArticles: 0 };
    rec.articles++;
    if (h.linked) rec.linkedArticles++;
    perTool.set(h.slug, rec);
  }

  const linkedHits = hits.filter((h) => h.linked);
  if (!linkedHits.length) continue; // scanned but nothing to link yet (no urls)

  // reassemble + handle disclosure
  let full = parts.before + newBody + parts.after;
  let disclosure = 'none';
  if (/No affiliate relationship[^.<]*\.?/i.test(full)) {
    full = full.replace(/No affiliate relationship[^.<]*\.?/i, DISCLOSURE);
    disclosure = 'rewritten';
  } else {
    full = parts.before + newBody + `\n    <p style="${DISCLOSURE_STYLE}">${DISCLOSURE}</p>` + parts.after;
    disclosure = 'appended';
  }

  changed.push({ file: f, linked: linkedHits.map((h) => ({ slug: h.slug, text: h.text })), disclosure });
  if (samples.length < 6) for (const h of linkedHits) if (samples.length < 6) samples.push({ file: f, slug: h.slug, text: h.text });

  if (APPLY) fs.writeFileSync(fp, full, 'utf8');
}

// --- report -----------------------------------------------------------------
const sortedTools = [...perTool.entries()].sort((a, b) => b[1].articles - a[1].articles);
const totalLinks = changed.reduce((n, c) => n + c.linked.length, 0);
const withUrl = tools.filter((t) => t.url).length;

if (JSON_OUT) {
  console.log(JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', articlesScanned: files.length, articlesChanged: changed.length, totalLinks, perTool: Object.fromEntries(sortedTools), samples }, null, 2));
} else {
  const L = [];
  L.push(`\nArchiGen Affiliate Insertion — ${APPLY ? '✅ APPLY (files written)' : '🔍 DRY RUN (no files written)'}`);
  L.push('─'.repeat(60));
  L.push(`Articles scanned:        ${files.length}`);
  L.push(`Articles ${APPLY ? 'changed' : 'that would change'}:  ${changed.length}`);
  L.push(`Affiliate links ${APPLY ? 'inserted' : 'to insert'}: ${totalLinks}   (from ${withUrl}/${tools.length} tools with a URL set)`);
  L.push('');
  L.push('Opportunity by tool (first-mention across articles):');
  for (const [slug, r] of sortedTools) {
    const flag = r.linkedArticles ? `→ ${r.linkedArticles} linkable ✓` : '→ NO URL yet — add affiliate link';
    L.push(`  ${slug.padEnd(26)} ${String(r.articles).padStart(3)} articles   ${flag}`);
  }
  L.push('');
  if (samples.length) {
    L.push('Sample insertions:');
    for (const s of samples) L.push(`  ${s.file}  —  "${s.text}" → linked (${s.slug})`);
    L.push('');
  }
  const noUrl = sortedTools.filter(([s]) => { const t = tools.find((x) => x.slug === s); return t && !t.url; });
  if (noUrl.length) L.push(`⚠️  ${noUrl.length} mentioned tools have NO affiliate URL yet — add them to affiliate-map.json to monetize those spots.`);
  if (!APPLY) L.push(`\nNothing was written. Re-run with --apply once URLs look right, then branch + PR (master pushes are blocked).`);
  console.log(L.join('\n'));
}
