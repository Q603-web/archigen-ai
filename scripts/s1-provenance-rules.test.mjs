import assert from "node:assert/strict";
import { disclaimerCore, findUnsupportedClaims, normalizeVisible } from "./s1-provenance-rules.mjs";
const bad=[
  "We've been running every tool through real projects before recommending anything.",
  "We use it daily at Vista Studios, and the output-per-hour case is not close.",
  "The framing reflects Vista Studios experience using both tools on live projects.",
  "Workflow framing reflects Vista Studios experience running Veras on live projects.",
  "The caveats reflect Vista Studios experience producing client motion on live projects.",
  "Vista Studios spent 2024 putting AI through the actual project pipeline.",
  "We ran a fresh trial on a current Vista Studios project.",
  "For each tool, we either pulled a review, ran a fresh trial on a current Vista Studios project, or both.",
  "We pressure-tested both stacks on the same project.",
  "Our ongoing testing found the output faster.",
  "In our testing the model ran four times faster on the same source plan.",
];
for(const fixture of bad)assert.ok(findUnsupportedClaims(fixture).length,fixture);
const good=[
  "Editorial analysis based on cited public and vendor sources.",
  "No preserved Vista Studios test artifact supports a performance claim on this page.",
  "A page may claim testing only when it preserves the source artifact.",
];
for(const fixture of good)assert.equal(findUnsupportedClaims(fixture).length,0,fixture);
assert.ok(normalizeVisible("Editorial only &mdash; does not depict or substantiate reviewed-tool performance.").includes(disclaimerCore));
assert.ok(normalizeVisible("Editorial only \u2014 does not depict or substantiate reviewed-tool performance.").includes(disclaimerCore));
console.log(JSON.stringify({badFixtures:bad.length,goodFixtures:good.length,normalizationFixtures:2}));
