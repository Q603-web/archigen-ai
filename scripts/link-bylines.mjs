// Phase 1.8 — link article bylines to the masthead.
// Only touches <div class="name"> blocks that are actual bylines
// (Nora Sinclair variants and the Editorial team credits); the same
// class is reused for prompt-anatomy labels, which are left alone.
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const LINK_STYLE = 'color:inherit;text-decoration:underline;text-decoration-color:rgba(26,25,21,0.25);text-underline-offset:3px;';

const RULES = [
  // [needle inside the name div, anchor target]
  [/<div class="name">(Nora Sinclair(?:,| &mdash;) Vista Studios)<\/div>/g, 'masthead.html#nora-sinclair'],
  [/<div class="name">((?:ArchiGen AI|Vista Studios) Editorial(?: Team)?)<\/div>/g, 'masthead.html'],
];

let touched = 0, links = 0;
for (const f of readdirSync('.')) {
  if (!f.endsWith('.html') || f === 'masthead.html') continue;
  const src = readFileSync(f, 'utf8');
  let out = src;
  for (const [re, target] of RULES) {
    out = out.replace(re, (_, name) => {
      links++;
      return `<div class="name"><a href="${target}" style="${LINK_STYLE}">${name}</a></div>`;
    });
  }
  if (out !== src) {
    writeFileSync(f, out);
    touched++;
  }
}
console.log(`Linked ${links} bylines across ${touched} files`);
