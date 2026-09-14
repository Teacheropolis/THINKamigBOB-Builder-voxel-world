import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../../index.html",import.meta.url),"utf8");
const controllerSource=fs.readFileSync(
  new URL("../../js/persistence/builder-recovery-controller.mjs",import.meta.url),
  "utf8"
);

test("portable Builder v3 Save and Open remain independent",()=>{
  assert.match(source,/app:\s*"THINKamigBOB Builder",\s*version:\s*3/);
  assert.match(source,/exportBuilderWorld\(builderProjectName\)/);
  assert.match(source,/document\.getElementById\(['"]loadFile['"]\)/);
  assert.match(source,/import\("\.\/js\/persistence\/builder-recovery-controller\.mjs"\)/);
  assert.match(source,/thinkamigbob-builder-recoveries-v3/);
});

test("recovery exposes debounce, immediate flush, and manual checkpoint boundaries",()=>{
  assert.match(source,/scheduleSave\(\{meaningful:true\}\)/);
  assert.match(source,/window\.flushBuilderRecovery=function\(\)/);
  assert.match(source,/window\.markBuilderManualSaveCheckpoint=function\(\)/);
  assert.match(source,/window\.markBuilderManualSaveCheckpoint\(\)/);
  assert.match(source,/beforeunload[\s\S]{0,250}(?:handleBeforeUnload|flushBuilderRecovery)/);
});

test("recovery status is accessible and never aliases portable save confirmation",()=>{
  assert.match(source,/status\.id="builderRecoveryStatus"[\s\S]{0,250}role","status"[\s\S]{0,250}aria-live","polite"/);
  assert.match(controllerSource,/Saving…/);
  assert.match(source,/Recovery Saved/);
  assert.match(source,/Recovery Failed/);
  assert.match(source,/Build saved!/);
});

test("starter Resume renders every recovery with project mission and timestamp metadata",()=>{
  assert.match(source,/var records=recoveryController \? recoveryController\.list\(\) : \[\]/);
  assert.match(source,/record\.projectName/);
  assert.match(source,/MISSION_TITLES\[missionKey\]/);
  assert.match(source,/new Date\(record\.updatedAt\)\.toLocaleString/);
  assert.match(source,/button\.dataset\.recoveryId=record\.recoveryId/);
});

test("successful Builder mutation paths notify the authoritative recovery owner",()=>{
  assert.match(source,/\["push","pop","splice"\]\.forEach/);
  assert.match(source,/blocks\[method\]=function\(\)[\s\S]{0,250}scheduleSave\(\{meaningful:true\}\)/);
  assert.match(source,/Selection moved\.[\s\S]{0,350}window\.scheduleStudentAutosave\(\{meaningful:true\}\)/);
  assert.match(source,/event\.target\.closest\("#challengeChecklist"\)\) scheduleSave\(\{meaningful:true\}\)/);
});

test("recovery keeps browser file-handle persistence out of the protected-exit workflow",()=>{
  const recoveryImport=source.indexOf('import("./js/persistence/builder-recovery-controller.mjs")');
  const recoveryScript=recoveryImport>=0
    ? source.slice(source.lastIndexOf("<script",recoveryImport),source.indexOf("</script>",recoveryImport)+9)
    : "";
  assert.doesNotMatch(recoveryScript,/showSaveFilePicker|showOpenFilePicker|indexedDB/i);
  assert.doesNotMatch(recoveryScript,/confirm\(/);
  assert.match(recoveryScript,/builder-exit-protection-controller\.mjs/);
  assert.match(recoveryScript,/handleBeforeUnload/);
});
