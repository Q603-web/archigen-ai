// Phase 1.4 — remove dead "Sign in" nav buttons sitewide.
// The #signin anchor has no target anywhere; real auth is Phase 2.
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const PATTERN = /[ \t]*<a href="#signin" class="btn">Sign in<\/a>\r?\n/g;

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
console.log(`Removed Sign in button from ${touched} files`);
