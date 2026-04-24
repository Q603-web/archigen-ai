#!/usr/bin/env node
/**
 * ArchiGen AI — Daily Intel Crawl
 * Run by Vega via OpenClaw. Saves sweep to intel/YYYY-MM-DD-sweep.md
 *
 * Requires: FIRECRAWL_API_KEY env var
 * Usage: node scripts/daily-crawl.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const REPO_ROOT = path.join(__dirname, '..');
const INTEL_DIR = path.join(REPO_ROOT, 'intel');

if (!FIRECRAWL_API_KEY) {
  console.error('Missing FIRECRAWL_API_KEY');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const outFile = path.join(INTEL_DIR, `${today}-sweep.md`);

if (!fs.existsSync(INTEL_DIR)) fs.mkdirSync(INTEL_DIR, { recursive: true });

function firecrawlSearch(query, limit = 8) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, limit });
    const req = https.request({
      hostname: 'api.firecrawl.dev',
      path: '/v1/search',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const QUERIES = [
  { label: 'New AI tools for architecture', query: 'AI tools architectural visualization rendering new release 2026', limit: 8 },
  { label: 'Community buzz', query: 'architects AI rendering workflow Reddit Midjourney ComfyUI tips', limit: 6 },
  { label: 'Competitor content', query: 'best AI rendering tools architects comparison review 2026', limit: 6 },
  { label: 'Trending tools', query: 'Chaos Veras SketchUp Diffusion ArchiVinci architecture AI update', limit: 5 },
];

async function run() {
  console.log(`ArchiGen AI Intel Crawl — ${today}`);
  const sections = [];

  for (const { label, query, limit } of QUERIES) {
    console.log(`  Searching: ${label}...`);
    try {
      const result = await firecrawlSearch(query, limit);
      const items = (result.data || result.results || []).slice(0, limit);
      if (!items.length) { console.log(`    No results`); continue; }

      const lines = items.map(r =>
        `- **[${r.title || r.url}](${r.url})**\n  ${(r.description || r.summary || '').slice(0, 200)}`
      ).join('\n');
      sections.push(`## ${label}\n\n${lines}`);
    } catch (err) {
      console.error(`    Error: ${err.message}`);
      sections.push(`## ${label}\n\n_Search failed: ${err.message}_`);
    }
  }

  const output = [
    `# Intel Sweep — ${today}`,
    `**Generated:** ${new Date().toISOString()} (daily-crawl.js)`,
    `**Queries:** ${QUERIES.length}`,
    '',
    '---',
    '',
    ...sections,
    '',
    '---',
    '',
    `*Next: Remix reviews this file and picks top content opportunities.*`,
  ].join('\n\n');

  fs.writeFileSync(outFile, output, 'utf8');
  console.log(`\nSaved: ${outFile}`);
}

run().catch(err => { console.error(err); process.exit(1); });
