import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { disclaimerCore, findUnsupportedClaims, normalizeVisible } from "./s1-provenance-rules.mjs";

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const files=fs.readdirSync(repo).filter((name)=>name.endsWith(".html"));
const figurePattern=/<figure\b[^>]*>[\s\S]*?<\/figure>/gi;
const captionPattern=/<figcaption([^>]*)>([\s\S]*?)<\/figcaption>/i;
const classificationPattern=/Editorial (?:AI )?illustration|Actual tested-tool output|Vendor\/third-party media|Unknown-origin editorial media/i;
let figures=0,unclassified=0,evidentiary=0,unsupportedClaims=0,bomFiles=0;
const failures=[];
for(const relative of ["package.json","scripts/generate-article-visuals.py","scripts/s1-provenance-audit.mjs","scripts/s1-provenance-rules.mjs","scripts/s1-provenance-rules.test.mjs"]){const bytes=fs.readFileSync(path.join(repo,relative));if(bytes[0]===0xef&&bytes[1]===0xbb&&bytes[2]===0xbf){bomFiles++;failures.push(relative+": UTF-8 BOM");}}
for(const name of files){
  const bytes=fs.readFileSync(path.join(repo,name));
  const html=bytes.toString("utf8");
  for(const figure of html.match(figurePattern)??[]){
    figures++;
    const body=figure.match(captionPattern)?.[2]??"";
    if(!classificationPattern.test(normalizeVisible(body))){unclassified++;failures.push(name+": unclassified figure");}
    if(!normalizeVisible(body).includes(disclaimerCore)){evidentiary++;failures.push(name+": missing non-evidence disclaimer");}
  }
  html.split(/\r?\n/).forEach((line,index)=>{if(/<(?:title|h[1-6])\b/i.test(line)||/"name"\s*:/.test(line))return;if(findUnsupportedClaims(line).length){unsupportedClaims++;failures.push(name+":"+(index+1)+": unsupported first-person test/use/performance claim");}});
}
console.log(JSON.stringify({htmlFiles:files.length,figures,unclassified,evidentiary,unsupportedClaims,bomFiles},null,2));
if(failures.length){for(const failure of failures.slice(0,100))console.error(failure);process.exitCode=1;}
