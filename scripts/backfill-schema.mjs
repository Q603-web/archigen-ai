// Phase 1.7 — backfill baseline JSON-LD on pages that lack it.
// Reuses the canonical Organization/@id graph pattern already shipped on
// 93 pages (see index.html) — no new schema shapes invented.
// Skipped on purpose: exclude.html, google site verification, welcome.html
// and tool-*.html stubs (noindex).
import { readFileSync, writeFileSync } from 'fs';

const PAGES = [
  'about.html',
  'advertise.html',
  'case-studies.html',
  'comparisons.html',
  'masthead.html',
  'pricing.html',
  'submit-work.html',
  'workflows.html',
];

const get = (src, re) => (src.match(re) || [])[1] || '';

let touched = 0;
for (const f of PAGES) {
  let src = readFileSync(f, 'utf8');
  if (src.includes('application/ld+json')) {
    console.log(`skip ${f} (already has JSON-LD)`);
    continue;
  }
  const title = get(src, /<title>([^<]*)<\/title>/);
  const desc = get(src, /<meta name="description" content="([^"]*)"/);
  const canonical = get(src, /<link rel="canonical" href="([^"]*)"/) || `https://archigenai.com/${f}`;

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://archigenai.com/#organization',
        name: 'ArchiGen AI',
        alternateName: 'ArchiGen',
        url: 'https://archigenai.com/',
        description: 'An editorial publication for architects working with AI-assisted design and rendering tools.',
        publisher: { '@type': 'Organization', name: 'Vista Studios' },
      },
      {
        '@type': 'WebPage',
        '@id': canonical + '#webpage',
        url: canonical,
        name: title,
        description: desc,
        isPartOf: { '@id': 'https://archigenai.com/#website' },
        publisher: { '@id': 'https://archigenai.com/#organization' },
        inLanguage: 'en',
      },
    ],
  };

  const block = `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>\n</head>`;
  src = src.replace(/<\/head>/, block);
  writeFileSync(f, src);
  touched++;
  console.log(`backfilled ${f}`);
}
console.log(`Done: ${touched} pages`);
