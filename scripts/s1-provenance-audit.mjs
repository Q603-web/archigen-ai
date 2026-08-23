import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const fix=process.argv.includes("--fix");
const files=fs.readdirSync(repo).filter(n=>n.endsWith(".html"));
const fig=/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, cap=/<figcaption([^>]*)>([\s\S]*?)<\/figcaption>/i;
const cls=/Editorial (?:AI )?illustration|Actual tested-tool output|Vendor\/third-party media/i;
const vista=/(?:tested|built) by Vista Studios|tools tested by Vista Studios|both tools tested by Vista Studios|Vista Studios[^<.]{0,120}(?:hands-on use|production use|practice maintaining|built on|runs across|uses on|trusts in|tested on|tested across|tests each)/i;
const note="Editorial only — does not depict or substantiate reviewed-tool performance.";
let figures=0,unclassified=0,evidentiary=0,unsupportedVista=0,changed=0;
for(const name of files){const file=path.join(repo,name),html=fs.readFileSync(file,"utf8");let next=html;if(fix){next=next.replace(fig,f=>{const m=f.match(cap);if(!m)return f;const [_,attrs,body]=m;if(cls.test(body))return body.includes(note)?f:f.replace(cap,`<figcaption${attrs}>${body} <span>${note}</span></figcaption>`);return f.replace(cap,`<figcaption${attrs}><span class="agv-chip">Editorial AI illustration — legacy model unrecorded</span> <span>${note}</span></figcaption>`);});next=next.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi,(whole,attrs,body)=>vista.test(body)?`<p${attrs}>Editorial analysis based on cited public and vendor sources. No preserved Vista Studios test artifact supports a performance claim on this page.</p>`:whole);}if(fix&&next!==html){fs.writeFileSync(file,next,"utf8");changed++;}const audited=fix?next:html;for(const f of audited.match(fig)??[]){figures++;const body=f.match(cap)?.[2]??"";if(!cls.test(body))unclassified++;if(cls.test(body)&&!body.includes("does not depict or substantiate reviewed-tool performance."))evidentiary++;}for(const line of audited.split(/\r?\n/))if(vista.test(line)&&!line.includes("No preserved Vista Studios test artifact"))unsupportedVista++;}
console.log(JSON.stringify({htmlFiles:files.length,figures,unclassified,evidentiary,unsupportedVista,changed},null,2));
if(unclassified||evidentiary||unsupportedVista)process.exitCode=1;



