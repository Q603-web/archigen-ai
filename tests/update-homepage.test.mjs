import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

test('daily refresh preserves the cover, uses actual local artwork, keeps new imageless stories visible and is idempotent', () => {
  const dir = mkdtempSync(join(tmpdir(), 'archigen-home-'));
  try {
    mkdirSync(join(dir, 'assets'));
    writeFileSync(join(dir, 'assets', 'one.webp'), 'fixture');
    writeFileSync(join(dir, 'assets', 'two.webp'), 'fixture');
    const regions = ['journal-meta', 'issue-no', 'vol-issue', 'feature-card', 'list-card'];
    writeFileSync(join(dir, 'index.html'), '<main><h1>Manually selected cover</h1>' + regions.map(n => `<!--AUTO:${n}-->old<!--/AUTO:${n}-->`).join('\n') + '</main>');
    const articles = [
      { file: 'new-no-art.html', date: '2026-09-12', title: 'Brand new, awaiting artwork' },
      { file: 'external.html', date: '2026-09-11', title: 'External artwork is not embedded', image: 'https://example.org/tracker.webp' },
      { file: 'one.html', date: '2026-09-10', title: 'First illustrated story', image: 'https://archigenai.com/assets/one.webp' },
      { file: 'two.html', date: '2026-09-09', title: 'Second illustrated story', image: 'assets/two.webp' },
      { file: 'missing.html', date: '2026-09-08', title: 'Missing asset story', image: 'assets/missing.webp' },
      { file: 'older.html', date: '2026-09-07', title: 'Older & useful <story>' },
    ];
    for (const a of articles) writeFileSync(join(dir, a.file), `<script type="application/ld+json">${JSON.stringify({'@type':'Article',headline:a.title,datePublished:a.date,timeRequired:'PT8M',image:a.image})}</script>`);
    const script = resolve('scripts/update-homepage.mjs');
    execFileSync(process.execPath, [script], { cwd: dir });
    const first = readFileSync(join(dir, 'index.html'), 'utf8');
    assert.ok(first.includes('<h1>Manually selected cover</h1>'));
    const cards = first.split('<!--AUTO:feature-card-->')[1].split('<!--/AUTO:feature-card-->')[0];
    assert.equal((cards.match(/class="story-card"/g) || []).length, 2);
    assert.ok(cards.includes('assets/one.webp') && cards.includes('assets/two.webp'));
    assert.ok(!first.includes('https://example.org') && !first.includes('assets/missing.webp'));
    const desk = first.split('<!--AUTO:list-card-->')[1].split('<!--/AUTO:list-card-->')[0];
    assert.ok(desk.includes('Brand new, awaiting artwork'));
    assert.ok(desk.includes('Older &amp; useful &lt;story&gt;'));
    assert.ok(!desk.includes('First illustrated story'));
    execFileSync(process.execPath, [script], { cwd: dir });
    assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), first);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
