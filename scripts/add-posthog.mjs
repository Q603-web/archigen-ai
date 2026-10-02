// Adds the PostHog snippet (scripts/posthog-snippet.html) to every top-level page, right after the GA4 block
// (or before </head> when a page has no GA4). Idempotent: pages that already carry it are skipped.
// Usage: node scripts/add-posthog.mjs [--check]
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const block = fs.readFileSync(path.join(root, 'scripts/posthog-snippet.html'), 'utf8');
const gaEnd = /(gtag\('config','G-JJQ4M8NNBR'\);\}\s*<\/script>\n)/;
const check = process.argv.includes('--check');
const SKIP = new Set(['exclude.html', 'google512fba9a1626c2a3.html']);
let added = 0, present = 0, skipped = [];
for (const f of fs.readdirSync(root).filter((f) => f.endsWith('.html')).sort()) {
  const p = path.join(root, f);
  const html = fs.readFileSync(p, 'utf8');
  if (SKIP.has(f)) { skipped.push(f); continue; }  // exclude.html is the owner's opt-out page: no trackers there
  if (html.includes('posthog.init(')) { present++; continue; }
  if (!html.includes('</head>')) { skipped.push(f); continue; }
  const out = gaEnd.test(html) ? html.replace(gaEnd, `$1${block}`) : html.replace('</head>', `${block}</head>`);
  if (!check) fs.writeFileSync(p, out);
  added++;
}
console.log(`${check ? 'would add' : 'added'} ${added}, already present ${present}, skipped (no <head>) ${skipped.length}: ${skipped.join(', ')}`);
