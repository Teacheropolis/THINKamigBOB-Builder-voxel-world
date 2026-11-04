import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../../index.html",import.meta.url),"utf8");
const controller=fs.readFileSync(new URL("../../js/persistence/builder-exit-protection-controller.mjs",import.meta.url),"utf8");

test("Builder owns one accessible protected-exit dialog with nondestructive choices",()=>{
  assert.match(source,/id="builderExitProtectionDialog"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(source,/aria-labelledby="builderExitProtectionTitle"/);
  assert.match(source,/aria-describedby="builderExitProtectionDescription"/);
  assert.match(source,/id="builderExitProtectionCancel"[^>]*>CANCEL</);
  assert.match(source,/id="builderExitProtectionSave"[^>]*>SAVE PROJECT FILE</);
  assert.match(source,/id="builderExitProtectionContinue"[^>]*>CONTINUE WITH RECOVERY</);
  assert.doesNotMatch(source,/builderExitProtection[^]{0,500}>\s*DISCARD\s*</i);
  assert.match(source,/#builderExitProtectionActions button\{[\s\S]*?min-height:48px/);
});

test("Return, Workshop, file Open, mission Start, and recovery Resume route through protection",()=>{
  assert.match(source,/requestBuilderReturnToMissions[\s\S]{0,220}requestImmediate/);
  assert.match(source,/requestBuilderOpenWorkshop[\s\S]{0,220}requestImmediate/);
  assert.match(source,/requestBuilderOpenProjectFile[\s\S]{0,350}requestReplacement/);
  assert.match(source,/window\.startSelectedWorld=function\(\)[\s\S]{0,650}requestReplacement/);
  assert.match(source,/function resumeSavedBuild\([\s\S]{0,1200}requestReplacement/);
  assert.match(source,/input\.value="";[\s\S]{0,80}input\.click\(\)/);
});

test("portable v3 Save supplies the guard confirmation without changing its schema",()=>{
  assert.match(source,/app:\s*"THINKamigBOB Builder",\s*version:\s*3/);
  assert.match(source,/notifyBuilderProjectFileSaved/);
  assert.match(source,/saveProjectFile:function\(\)\{ return saveWorld\(\); \}/);
});

test("modal isolates input and browser leave warnings have no custom message",()=>{
  assert.match(controller,/\["click","contextmenu","mousedown","mouseup","pointerdown","pointerup","pointercancel","touchstart","touchmove","touchend","touchcancel","wheel"\]/);
  assert.match(controller,/event\.returnValue=""/);
  assert.doesNotMatch(controller,/returnValue\s*=\s*["'][^"']+["']/);
  assert.match(controller,/event\.key==="Escape"/);
  assert.match(controller,/event\.key!=="Tab"/);
  assert.match(source,/#builderExitProtectionDialog\{[\s\S]{0,180}inset:0/);
});

test("recovery failure wording is exact and the current project remains in place",()=>{
  assert.match(controller,/Recovery failed\. Stay here and try again, or save a project file\./);
  assert.match(controller,/requestImmediate[\s\S]{0,260}verifiedFlush\(false\)[\s\S]{0,80}fail\(\)/);
  assert.match(controller,/continueWithRecovery\(\)[\s\S]{0,100}verifiedFlush\(true\)/);
});
