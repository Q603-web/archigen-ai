#!/usr/bin/env node
// UTM URL builder for archigenai.com promotion.
// Usage:
//   node utm-builder.js                              # interactive
//   node utm-builder.js <slug> <source> <variant>    # one-shot
//
// Examples:
//   node utm-builder.js what-actually-works-ai-architecture-2026 twitter hook-1
//   node utm-builder.js bim-first-ai-stack-2026-revit-archicad linkedin long-form

const readline = require('readline');

const BASE = 'https://archigenai.com';
const KNOWN_SOURCES = ['twitter', 'linkedin', 'reddit', 'instagram', 'facebook', 'email', 'direct'];

function normaliseSource(s) {
  s = (s || '').toLowerCase().trim();
  if (s === 'x') return 'twitter';        // X.com → still utm_source=twitter for analytics continuity
  if (s === 'ig') return 'instagram';
  if (s === 'fb') return 'facebook';
  return s;
}

function normaliseVariant(v) {
  return (v || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function build(slug, source, variant) {
  source = normaliseSource(source);
  variant = normaliseVariant(variant);
  if (!slug) throw new Error('slug required');
  if (!source) throw new Error('source required');
  if (!variant) throw new Error('variant required (utm_content)');
  if (!KNOWN_SOURCES.includes(source)) {
    process.stderr.write(`warning: unknown source "${source}" (known: ${KNOWN_SOURCES.join(', ')})\n`);
  }
  const medium = source === 'email' ? 'email' : 'social';
  const slugClean = slug.replace(/\.html$/, '');
  const url = `${BASE}/${slugClean}.html?utm_source=${encodeURIComponent(source)}&utm_medium=${medium}&utm_campaign=${encodeURIComponent(slugClean)}&utm_content=${encodeURIComponent(variant)}`;
  return url;
}

async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(r => rl.question(q, r));
  const slug = (await ask('Article slug (without .html): ')).trim();
  const source = (await ask(`Source [${KNOWN_SOURCES.join('/')}]: `)).trim();
  const variant = (await ask('Variant (utm_content, kebab-case): ')).trim();
  rl.close();
  console.log('\n' + build(slug, source, variant));
}

const [, , slug, source, variant] = process.argv;
if (slug && source && variant) {
  console.log(build(slug, source, variant));
} else {
  interactive().catch(e => { console.error(e.message); process.exit(1); });
}
