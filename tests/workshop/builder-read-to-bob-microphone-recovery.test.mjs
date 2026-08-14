import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source=fs.readFileSync(new URL("../../index.html",import.meta.url),"utf8");
const start=source.indexOf("function prepareReadToBobMicrophone(attemptToken)");
const end=source.indexOf("window.hideReadToBobPhoneticHelp",start);
const microphone=source.slice(start,end);

test("bounds a stalled Chromebook microphone request and restores Start Reading",()=>{
  assert.match(microphone,/setTimeout\(function\(\)[\s\S]*requestSettled=true[\s\S]*requestingMicrophone=false[\s\S]*updateListeningButtons\(\)[\s\S]*},8000\)/);
  assert.match(microphone,/if\(requestSettled\)[\s\S]*getTracks[\s\S]*track\.stop\(\)/);
});

test("reports actionable Chromebook microphone failures",()=>{
  ["NotFoundError","NotReadableError","AbortError"].forEach(name=>assert.match(microphone,new RegExp(name)));
  assert.match(microphone,/Microphone permission was not allowed/);
});
