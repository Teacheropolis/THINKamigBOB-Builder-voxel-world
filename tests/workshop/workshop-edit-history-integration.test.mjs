import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("runtime loads exactly one ledger and one nonvisual Move controller", () => {
  assert.equal((source.match(/import\("\.\/js\/workshop\/editing\/workshop-edit-history\.mjs"\)/g) || []).length, 1);
  assert.equal((source.match(/import\("\.\/js\/workshop\/editing\/workshop-selection-move-controller\.mjs"\)/g) || []).length, 1);
  assert.match(source, /workshopEditHistory=modules\[27\]\.createWorkshopEditHistory/);
  assert.match(source, /workshopSelectionMoveController=\s*modules\[28\]\.createWorkshopSelectionMoveController/);
  assert.doesNotMatch(source, /workshopSelectionMoveController\.(?:arm|preview|beginCommit)\(/);
});

test("placement and deletion feed the chronological ledger", () => {
  assert.match(source, /blocks\.push\(block\);\s*recordWorkshopPlacementHistory\(block\)/);
  assert.match(source, /blocks\.push\(newBlock\);\s*recordWorkshopPlacementHistory\(newBlock\)/);
  assert.match(source, /recordWorkshopDeletionHistory\(deletedSelection\)/);
  assert.match(source, /workshopEditHistory\.undo\(\)/);
  assert.match(source, /workshopEditHistory\.redo\(\)/);
});

test("existing controls derive only availability from the Workshop ledger", () => {
  assert.match(source, /const canUndo = editHistorySnapshot[\s\S]*?editHistorySnapshot\.canUndo/);
  assert.match(source, /const canRedo = editHistorySnapshot[\s\S]*?editHistorySnapshot\.canRedo/);
  assert.match(source, /undoButton\.disabled = !canUndo/);
  assert.match(source, /redoButton\.disabled = !canRedo/);
  assert.doesNotMatch(source, /id="[^\"]*move[^\"]*"[^>]*data-ws-013/i);
});

test("load, reset, Mission restoration, shutdown, and faults clear ownership", () => {
  assert.match(source, /function resetWorld\([\s\S]*?resetWorkshopEditFoundation\(\)/);
  assert.match(source, /function restoreSavedBuild\(state\)[\s\S]*?resetWorkshopEditFoundation\(\)/);
  assert.match(source, /function clearActiveWorkshopObjects\([\s\S]*?resetWorkshopEditFoundation\(\)/);
  assert.match(source, /snapshot\.workshop==="SHUTTING_DOWN"[\s\S]*?workshopSelectionMoveController\.reset\(\)/);
  assert.match(source, /snapshot\.workshop==="FAULT_SAFE"/);
  assert.match(source, /snapshot\.workshop==="OFF"/);
});

test("save and autosave schema remain unchanged", () => {
  const saveBlock = source.slice(source.indexOf("function saveNow("), source.indexOf("function scheduleSave("));
  assert.doesNotMatch(saveBlock, /workshopEditHistory|workshopSelectionMoveController|MOVE/);
  assert.match(saveBlock, /version:1/);
  assert.match(saveBlock, /blocks:blocks\.map\(blockRecord\)/);
});
