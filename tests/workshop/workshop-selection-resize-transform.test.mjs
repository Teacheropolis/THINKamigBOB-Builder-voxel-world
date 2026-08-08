import assert from "node:assert/strict";
import test from "node:test";

import {
  WORKSHOP_RESIZE_MINIMUM_CM,
  WORKSHOP_RESIZE_STEP_CM,
  createWorkshopSelectionResizeCandidate,
} from "../../js/workshop/editing/workshop-selection-resize-transform.mjs";

const candidate = (overrides = {}) => createWorkshopSelectionResizeCandidate({
  object:{ name:"box" },
  dimensions:{ width:2, height:3, depth:4 },
  position:{ x:5, y:4, z:-2 },
  scaleY:1,
  delta:WORKSHOP_RESIZE_STEP_CM,
  ...overrides,
});

test("Grow changes each local dimension by 1cm and preserves the bottom", () => {
  const result=candidate();
  assert.deepEqual(result.entry.beforeDimensions,{width:2,height:3,depth:4});
  assert.deepEqual(result.entry.afterDimensions,{width:3,height:4,depth:5});
  assert.deepEqual(result.entry.before,{x:5,y:4,z:-2});
  assert.deepEqual(result.entry.after,{x:5,y:4.5,z:-2});
  assert.equal(4-(3/2),4.5-(4/2));
  assert.equal(result.noOp,false);
});

test("bottom anchoring accounts for unchanged positive Y scale", () => {
  const result=candidate({
    dimensions:{width:3.25,height:2.5,depth:5.75},
    position:{x:0.25,y:7.5,z:-0.5},
    scaleY:2,
    delta:-WORKSHOP_RESIZE_STEP_CM,
  });
  assert.deepEqual(result.entry.afterDimensions,{width:2.25,height:1.5,depth:4.75});
  assert.deepEqual(result.entry.after,{x:0.25,y:6.5,z:-0.5});
  assert.equal(7.5-(2.5*2)/2,6.5-(1.5*2)/2);
});

test("Shrink permits exactly 1cm and rejects any dimension below it", () => {
  const minimum=candidate({
    dimensions:{width:2,height:2,depth:2},delta:-1,
  });
  assert.deepEqual(minimum.entry.afterDimensions,{
    width:WORKSHOP_RESIZE_MINIMUM_CM,
    height:WORKSHOP_RESIZE_MINIMUM_CM,
    depth:WORKSHOP_RESIZE_MINIMUM_CM,
  });
  assert.equal(candidate({
    dimensions:{width:1.5,height:2,depth:2},delta:-1,
  }),null);
});

test("invalid, unsupported, and non-finite snapshots fail closed", () => {
  assert.equal(createWorkshopSelectionResizeCandidate(),null);
  assert.equal(candidate({scaleY:0}),null);
  assert.equal(candidate({scaleY:-1}),null);
  assert.equal(candidate({delta:2}),null);
  assert.equal(candidate({dimensions:{width:NaN,height:2,depth:2}}),null);
  assert.equal(candidate({position:{x:0,y:Infinity,z:0}}),null);
});

test("candidate and nested snapshots are immutable", () => {
  const result=candidate();
  assert.equal(Object.isFrozen(result),true);
  assert.equal(Object.isFrozen(result.entry),true);
  assert.equal(Object.isFrozen(result.entry.before),true);
  assert.equal(Object.isFrozen(result.entry.after),true);
  assert.equal(Object.isFrozen(result.entry.beforeDimensions),true);
  assert.equal(Object.isFrozen(result.entry.afterDimensions),true);
});
