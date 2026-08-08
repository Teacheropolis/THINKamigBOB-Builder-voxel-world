import assert from "node:assert/strict";
import test from "node:test";

import {
  WORKSHOP_EDIT_OPERATION_TYPES,
  createWorkshopEditHistory,
} from "../../js/workshop/editing/workshop-edit-history.mjs";

function coordinates(x, y = 0, z = 0) { return { x, y, z }; }

function harness() {
  const present = new Set();
  const positions = new Map();
  const applied = [];
  const validate = (transaction, direction) => transaction.entries.every((entry) => {
    const exists = present.has(entry.object);
    if (direction === "COMMIT") {
      return transaction.type === "PLACEMENT" ? exists :
        transaction.type === "DELETION" ? !exists : exists;
    }
    if (transaction.type === "PLACEMENT") return direction === "UNDO" ? exists : !exists;
    if (transaction.type === "DELETION") return direction === "UNDO" ? !exists : exists;
    return exists;
  });
  const apply = (transaction, direction) => {
    applied.push(`${direction}:${transaction.type}`);
    for (const entry of transaction.entries) {
      const useBefore = direction === "UNDO";
      const exists = transaction.type === "PLACEMENT" ? !useBefore :
        transaction.type === "DELETION" ? useBefore : true;
      if (exists) present.add(entry.object); else present.delete(entry.object);
      const point = useBefore ? entry.before : entry.after;
      if (point) positions.set(entry.object, { ...point });
    }
    return true;
  };
  return { present, positions, applied, history:createWorkshopEditHistory({ validate, apply }) };
}

test("ledger preserves chronological placement, deletion, and Move ordering", () => {
  const { present, applied, history } = harness();
  const first = {}, second = {};
  present.add(first);
  assert.equal(history.commit({
    type:WORKSHOP_EDIT_OPERATION_TYPES.PLACEMENT,
    entries:[{ object:first, before:null, after:coordinates(0) }],
  }).ok, true);
  present.add(second);
  assert.equal(history.commit({
    type:WORKSHOP_EDIT_OPERATION_TYPES.PLACEMENT,
    entries:[{ object:second, before:null, after:coordinates(1) }],
  }).ok, true);
  present.delete(first);
  assert.equal(history.commit({
    type:WORKSHOP_EDIT_OPERATION_TYPES.DELETION,
    entries:[{ object:first, before:coordinates(0), after:null }],
  }).ok, true);
  assert.equal(history.undo().transaction.type, "DELETION");
  assert.equal(history.undo().transaction.entries[0].object, second);
  assert.equal(history.undo().transaction.entries[0].object, first);
  assert.deepEqual(applied, ["UNDO:DELETION", "UNDO:PLACEMENT", "UNDO:PLACEMENT"]);
  assert.equal(history.redo().transaction.entries[0].object, first);
  assert.equal(history.redo().transaction.entries[0].object, second);
  assert.equal(history.redo().transaction.type, "DELETION");
});

test("transactions and nested coordinate snapshots are deeply immutable", () => {
  const { present, history } = harness();
  const object = {};
  present.add(object);
  const result = history.commit({
    type:"MOVE",
    entries:[{ object, before:coordinates(1, 2, 3), after:coordinates(4, 5, 6) }],
    translation:{ x:3, z:3 },
    selection:[object],
  });
  assert.equal(result.ok, true);
  assert.equal(Object.isFrozen(result.transaction), true);
  assert.equal(Object.isFrozen(result.transaction.entries), true);
  assert.equal(Object.isFrozen(result.transaction.entries[0]), true);
  assert.equal(Object.isFrozen(result.transaction.entries[0].before), true);
  assert.equal(Object.isFrozen(result.transaction.entries[0].after), true);
  assert.equal(Object.isFrozen(result.transaction.translation), true);
  assert.equal(Object.isFrozen(result.transaction.selection), true);
});

test("new edits clear Redo and repeated commits are rejected", () => {
  const { present, history } = harness();
  const first = {}, second = {};
  present.add(first);
  const operation = { type:"PLACEMENT", entries:[{ object:first, before:null, after:coordinates(0) }] };
  assert.equal(history.commit(operation).ok, true);
  assert.equal(history.commit(operation).code, "REPEATED");
  assert.equal(history.undo().ok, true);
  assert.equal(history.getSnapshot().canRedo, true);
  present.add(second);
  assert.equal(history.commit({
    type:"PLACEMENT",
    entries:[{ object:second, before:null, after:coordinates(2) }],
  }).ok, true);
  assert.equal(history.getSnapshot().canRedo, false);
});

test("invalid, missing-object, and failed operations leave both stacks atomic", () => {
  const object = {};
  const present = new Set([object]);
  let failApply = false;
  const history = createWorkshopEditHistory({
    validate(transaction, direction) {
      return direction === "COMMIT" || present.has(transaction.entries[0].object);
    },
    apply() { return !failApply; },
  });
  assert.equal(history.commit({ type:"PLACEMENT", entries:[] }).code, "INVALID_TRANSACTION");
  assert.equal(history.commit({
    type:"PLACEMENT", entries:[{ object, before:null, after:coordinates(0) }],
  }).ok, true);
  present.delete(object);
  const beforeMissing = history.getSnapshot();
  assert.equal(history.undo().code, "INVALID_OBJECTS");
  assert.deepEqual(history.getSnapshot(), beforeMissing);
  present.add(object);
  failApply = true;
  const beforeFailure = history.getSnapshot();
  assert.equal(history.undo().code, "APPLY_FAILED");
  assert.deepEqual(history.getSnapshot(), beforeFailure);
});

test("reset clears the session-only ledger", () => {
  const { present, history } = harness();
  const object = {};
  present.add(object);
  history.commit({ type:"PLACEMENT", entries:[{ object, before:null, after:coordinates(0) }] });
  assert.equal(history.reset().ok, true);
  assert.deepEqual(history.getSnapshot(), {
    undoCount:0, redoCount:0, canUndo:false, canRedo:false,
    latestUndo:null, latestRedo:null,
  });
});
