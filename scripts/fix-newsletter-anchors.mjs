// Phase 1.2 — point newsletter CTAs somewhere real.
// Only index.html has a #newsletter section; on every other page the
// anchor was dead. Repoint to index.html#newsletter.
import { readFileSync, writeFileSync, readdirSync } from 'fs';

let touched = 0;
for (const f of readdirSync('.')) {
  if (!f.endsWith('.html') || f === 'index.html') continue;
  const src = readFileSync(f, 'utf8');
  const out = src.replaceAll('href="#newsletter"', 'href="index.html#newsletter"');
  if (out !== src) {
    writeFileSync(f, out);
    touched++;
  }
}
console.log(`Repointed #newsletter anchors in ${touched} files`);
