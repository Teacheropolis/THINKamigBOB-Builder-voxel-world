import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("runtime loads one ledger and connects the approved Move controller", () => {
  assert.equal((source.match(/import\("\.\/js\/workshop\/editing\/workshop-edit-history\.mjs"\)/g) || []).length, 1);
  assert.equal((source.match(/import\("\.\/js\/workshop\/editing\/workshop-selection-move-controller\.mjs"\)/g) || []).length, 1);
  assert.match(source, /workshopEditHistory=modules\[27\]\.createWorkshopEditHistory/);
  assert.match(source, /workshopSelectionMoveController=\s*modules\[28\]\.createWorkshopSelectionMoveController/);
  assert.match(source, /workshopSelectionMoveController\.arm\(/);
  assert.match(source, /workshopSelectionMoveController\.preview\(/);
  assert.match(source, /workshopSelectionMoveController\.beginCommit\(/);
  assert.match(source, /workshopSelectionMoveController\.complete\(/);
  assert.match(source, /workshopSelectionMoveController\.cancel\(/);
});

test("placement and deletion feed the chronological ledger", () => {
  assert.match(source, /blocks\.push\(block\);\s*recordWorkshopPlacementHistory\(block\)/);
  assert.match(source, /blocks\.push\(newBlock\);\s*recordWorkshopPlacementHistory\(newBlock\)/);
  assert.match(source, /recordWorkshopDeletionHistory\(deletedSelection\)/);
  assert.match(source, /workshopEditHistory\.undo\(\)/);
  assert.match(source, /workshopEditHistory\.redo\(\)/);
});

test("existing controls expose bounded Move and history availability", () => {
  assert.match(source, /const canUndo = editHistorySnapshot[\s\S]*?editHistorySnapshot\.canUndo/);
  assert.match(source, /const canRedo = editHistorySnapshot[\s\S]*?editHistorySnapshot\.canRedo/);
  assert.match(source, /undoButton\.disabled = !canUndo/);
  assert.match(source, /redoButton\.disabled = !canRedo/);
  assert.match(source, /id="workshopMoveButton"[^>]*aria-pressed="false"[^>]*onclick="startMoveSelected\(\)"[^>]*disabled/);
  assert.match(source, /id="workshopCancelMoveButton"[^>]*onclick="cancelWorkshopMove/);
  assert.match(source, /#workshopCancelMoveButton\[hidden\]\{\s*display:none !important/);
  assert.match(source, /\.workshop-dashboard-controls button\{[\s\S]*?min-height:44px/);
});

test("Move commit remains one validated atomic history transaction", () => {
  const moveStart=source.indexOf("if(moveSelectedMode && hit === ground)");
  const moveEnd=source.indexOf("const newBlock = createStudentShape",moveStart);
  const move=source.slice(moveStart,moveEnd);
  assert.match(move, /workshopTranslatedSelectionCollides/);
  assert.ok(move.indexOf("beginCommit") < move.indexOf("selectedBlocks.forEach(block =>"));
  assert.ok(move.indexOf("selectedBlocks.forEach(block =>") < move.indexOf('type:"MOVE"'));
  assert.match(move, /translation:\{x:changeX,z:changeZ\}/);
  assert.match(move, /selection:selectedBlocks\.slice\(\)/);
  assert.match(move, /workshopSelectionMoveController\.complete\(moveToken\)/);
  assert.doesNotMatch(move, /clearWorkshopSelectedBlocks\(\);/);
});

test("Move cancellation, preview, and selection synchronization use existing owners", () => {
  assert.match(source, /function previewWorkshopMoveAtPointer\(event\)/);
  assert.match(source, /event\.key==="Escape"[\s\S]*?cancelWorkshopMove/);
  assert.match(source, /document\.addEventListener\("pointermove",previewWorkshopMoveAtPointer\)/);
  assert.match(source, /function applyWorkshopEditTransaction[\s\S]*?transaction\.type==="MOVE"[\s\S]*?setWorkshopSelectedObjectsExact\(transaction\.selection\)/);
  assert.match(source, /syncWorkshopSelectionMeasurements\(\);[\s\S]*?updateUndoRedoButtons\(\)/);
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
