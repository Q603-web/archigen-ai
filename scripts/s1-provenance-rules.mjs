export const disclaimerCore = "does not depict or substantiate reviewed-tool performance.";
export const unsupportedClaimPatterns = [
  /\bwe(?:\x27ve| have)? (?:tested|pressure-tested|ran|built|trialed|used)\b/i,
  /\bwe use (?:it|this|the|our|a|an)\b/i,
  /\bour (?:own |ongoing )?(?:testing|benchmark|trial)\b/i,
  /\bVista Studios\b.{0,100}\b(?:experience|use|testing|trial|project pipeline)\b/i,
  /\brunning every tool through real projects\b/i,
  /\bwe use it daily\b.{0,160}\b(?:output|performance|faster|hours?)\b/i,
  /\b(?:Vista Studios|our)\b.{0,80}\bexperience\b.{0,80}\b(?:using|running|producing|presenting|finishing)\b.{0,120}\b(?:live|actual|real|client|project|workflow)\b/i,
  /\bVista Studios\b.{0,120}\bputting\b.{0,80}\bactual project\b/i,
  /\bwe\b.{0,100}\bran a fresh trial\b.{0,120}\bcurrent Vista Studios project\b/i,
  /\bwe (?:pressure-)?tested\b.{0,120}\b(?:same|live|actual|real|current)\b.{0,80}\b(?:project|geometry|plan|workflow|model|source)\b/i,
  /\bwe (?:ran|built|tested|trialed)\b.{0,180}\b(?:live|actual|real|current)\b.{0,80}\b(?:project|geometry|plan|workflow|model|source|client)\b/i,
  /\b(?:in our testing|our test|our benchmark)\b.{0,220}\b(?:seconds?|minutes?|hours?|faster|output|result|performance|geometry|workflow|project|model|tool)\b/i,
  /\bwe saw\b.{0,160}\b(?:seconds?|minutes?|hours?|faster|output|performance)\b.{0,120}\b(?:test|project|workflow|tool|model)\b/i,
  /\bour\b.{0,100}\b(?:time|output|performance)\b.{0,120}\b(?:dropped|improved|increased|faster)\b.{0,120}\b(?:project|tested|test)\b/i,
];
export function normalizeVisible(value) {
  return value.replace(/&mdash;|&#8212;|&#x2014;|\u2014/gi, "-").replace(/\s+/g, " ").trim();
}
export function findUnsupportedClaims(line) {
  const visible=normalizeVisible(line.replace(/<[^>]+>/g," "));
  if (/No preserved Vista Studios test artifact/i.test(visible)) return [];
  return unsupportedClaimPatterns.filter((pattern)=>pattern.test(visible)).map((pattern)=>pattern.source);
}
