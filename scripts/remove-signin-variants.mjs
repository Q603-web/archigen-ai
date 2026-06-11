// Phase 1.4 follow-up — 7 pages used a "Sign in" label pointing at the
// newsletter anchor instead of #signin; same lie, different href.
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const PATTERN = /[ \t]*<a href="index\.html#newsletter" class="btn">Sign in<\/a>\r?\n/g;

let touched = 0;
for (const f of readdirSync('.')) {
  if (!f.endsWith('.html')) continue;
  const src = readFileSync(f, 'utf8');
  const out = src.replace(PATTERN, '');
  if (out !== src) {
    writeFileSync(f, out);
    touched++;
  }
}
console.log(`Removed Sign in variant from ${touched} files`);
