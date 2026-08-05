import test from "node:test";
import assert from "node:assert/strict";
import {
  WORKSHOP_SHUTDOWN_PLACEHOLDER_TIMING,
  createWorkshopShutdownTestDouble,
} from "../../js/workshop/runtime/workshop-shutdown-test-double.mjs";

function harness({ reduced = false } = {}) {
  const tasks = [];
  const driver = createWorkshopShutdownTestDouble({
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

test("declares locked shutdown placeholder durations", () => {
  assert.deepEqual(WORKSHOP_SHUTDOWN_PLACEHOLDER_TIMING, {
    drawers: 200,
    toolChest: 400,
    smartBoard: 400,
    reducedMotion: 150,
  });
});

test("each shutdown stage completes only through its owned callback", () => {
  const { driver, tasks } = harness();
  let completions = 0;
  assert.equal(driver.secureDrawers({ transitionId: "stop-1", complete: () => { completions += 1; } }).duration, 200);
  assert.equal(completions, 0);
  tasks[0].callback(); tasks[0].callback();
  assert.equal(completions, 1);
  assert.equal(driver.parkToolChest({ transitionId: "stop-1", complete: () => { completions += 1; } }).duration, 400);
  tasks[1].callback();
  assert.equal(driver.retractSmartBoard({ transitionId: "stop-1", complete: () => { completions += 1; } }).duration, 400);
  tasks[2].callback();
  assert.equal(completions, 3);
});

test("cancel rejects stale shutdown completion", () => {
  const { driver, tasks } = harness();
  let completions = 0;
  driver.secureDrawers({ transitionId: "stop-2", complete: () => { completions += 1; } });
  assert.equal(driver.cancel().code, "CANCELLED");
  assert.equal(tasks[0].cancelled, true);
  tasks[0].callback();
  assert.equal(completions, 0);
  assert.deepEqual(driver.getSnapshot(), { active: null, transitionId: null, duration: 0 });
});

test("reduced motion preserves callbacks while shortening each placeholder", () => {
  const { driver, tasks } = harness({ reduced: true });
  let completions = 0;
  assert.equal(driver.parkToolChest({ transitionId: "reduced-stop", complete: () => { completions += 1; } }).duration, 150);
  assert.equal(tasks[0].delay, 150);
  tasks[0].callback();
  assert.equal(completions, 1);
});
