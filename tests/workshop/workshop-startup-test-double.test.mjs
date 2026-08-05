import test from "node:test";
import assert from "node:assert/strict";
import {
  WORKSHOP_STARTUP_PLACEHOLDER_TIMING,
  createWorkshopStartupTestDouble,
} from "../../js/workshop/runtime/workshop-startup-test-double.mjs";

function harness({ reduced = false } = {}) {
  const tasks = [];
  const driver = createWorkshopStartupTestDouble({
    reducedMotion: () => reduced,
    schedule(callback, delay) {
      const task = { callback, delay, cancelled: false };
      tasks.push(task);
      return task;
    },
    cancelSchedule(task) { task.cancelled = true; },
  });
  return { driver, tasks };
}

test("declares locked placeholder stage durations", () => {
  assert.deepEqual(WORKSHOP_STARTUP_PLACEHOLDER_TIMING, {
    smartBoard: 400,
    readySettle: 200,
    reducedMotion: 150,
  });
});

test("each placeholder stage completes only through its owned callback", () => {
  const { driver, tasks } = harness();
  let completions = 0;
  assert.equal(driver.activateSmartBoard({ transitionId: "start-1", complete: () => { completions += 1; } }).duration, 400);
  assert.equal(completions, 0);
  tasks[0].callback();
  tasks[0].callback();
  assert.equal(completions, 1);
  assert.equal(driver.settleWorkshopReady({ transitionId: "start-1", complete: () => { completions += 1; } }).duration, 200);
  tasks[1].callback();
  assert.equal(completions, 2);
});

test("cancel rejects stale placeholder completion without a delayed side effect", () => {
  const { driver, tasks } = harness();
  let completions = 0;
  driver.activateSmartBoard({ transitionId: "start-2", complete: () => { completions += 1; } });
  assert.equal(driver.cancel().code, "CANCELLED");
  assert.equal(tasks[0].cancelled, true);
  tasks[0].callback();
  assert.equal(completions, 0);
  assert.deepEqual(driver.getSnapshot(), { active: null, transitionId: null, duration: 0 });
});

test("reduced motion shortens placeholders without skipping callbacks", () => {
  const { driver, tasks } = harness({ reduced: true });
  let completions = 0;
  assert.equal(driver.activateSmartBoard({ transitionId: "reduced-1", complete: () => { completions += 1; } }).duration, 150);
  assert.equal(tasks[0].delay, 150);
  tasks[0].callback();
  assert.equal(completions, 1);
});
