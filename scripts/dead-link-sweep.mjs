// Phase 1 verification — sweep every local href/src across all HTML files.
// Reports: missing local files, anchors with no matching id, leftover
// #signin/#newsletter style dead anchors.
import { readFileSync, readdirSync, existsSync } from 'fs';

const files = readdirSync('.').filter((f) => f.endsWith('.html'));
const ids = new Map(); // file -> Set of ids
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  ids.set(f, new Set([...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));
}

let problems = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(url)) continue;
    const [pathPart, anchor] = url.split('#');
    if (pathPart && !existsSync(pathPart)) {
      console.log(`MISSING FILE  ${f} -> ${url}`);
      problems++;
      continue;
    }
    if (anchor !== undefined && anchor !== '') {
      const targetFile = pathPart || f;
      if (targetFile.endsWith('.html') && ids.has(targetFile) && !ids.get(targetFile).has(anchor)) {
        console.log(`DEAD ANCHOR   ${f} -> ${url}`);
        problems++;
      }
    }
  }
}
console.log(problems === 0 ? 'CLEAN: no dead links or anchors' : `${problems} problems`);
