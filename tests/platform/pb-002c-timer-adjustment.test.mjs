import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createLessonTimer,
  LESSON_TIMER_ADJUSTMENT_SECONDS,
  LESSON_TIMER_SESSION_KEY,
  LESSON_TIMER_STATES,
  MAX_LESSON_MINUTES,
} from "../../platform/scripts/lesson-timer.mjs";

const appSource = readFileSync(
  new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(
  new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
  };
}

test("uses one-minute bounded teacher adjustments", () => {
  assert.equal(LESSON_TIMER_ADJUSTMENT_SECONDS, 60);
  let currentTime = 0;
  const timer = createLessonTimer({
    storage: createMemoryStorage(), now: () => currentTime,
  });
  timer.setDuration(5);
  timer.start();
  currentTime = 30_000;

  const added = timer.addMinute();
  assert.equal(added.status, LESSON_TIMER_STATES.RUNNING);
  assert.equal(added.remainingSeconds, 330);
  assert.equal(added.endsAt, 360_000);

  const subtracted = timer.subtractMinute();
  assert.equal(subtracted.status, LESSON_TIMER_STATES.RUNNING);
  assert.equal(subtracted.remainingSeconds, 270);
  assert.equal(subtracted.endsAt, 300_000);
});

test("paused adjustments preserve Paused and Resume uses adjusted time", () => {
  let currentTime = 0;
  const timer = createLessonTimer({
    storage: createMemoryStorage(), now: () => currentTime,
  });
  timer.setDuration(5);
  timer.start();
  currentTime = 30_000;
  timer.pause();

  assert.equal(timer.addMinute().remainingSeconds, 330);
  const adjusted = timer.subtractMinute();
  assert.equal(adjusted.status, LESSON_TIMER_STATES.PAUSED);
  assert.equal(adjusted.remainingSeconds, 270);
  assert.equal(adjusted.endsAt, null);

  currentTime = 90_000;
  const resumed = timer.resume();
  assert.equal(resumed.status, LESSON_TIMER_STATES.RUNNING);
  assert.equal(resumed.endsAt, 360_000);
});

test("subtraction at one minute or less completes safely", () => {
  let currentTime = 0;
  const timer = createLessonTimer({
    storage: createMemoryStorage(), now: () => currentTime,
  });
  timer.setDuration(1);
  timer.start();
  currentTime = 1_000;
  const completed = timer.subtractMinute();
  assert.equal(completed.status, LESSON_TIMER_STATES.COMPLETE);
  assert.equal(completed.remainingSeconds, 0);
  assert.equal(completed.endsAt, null);
});

test("adjustments reject Ready, Complete, and the maximum boundary", () => {
  const timer = createLessonTimer({ storage: createMemoryStorage(), now: () => 0 });
  timer.setDuration(5);
  const ready = timer.read();
  assert.deepEqual(timer.addMinute(), ready);
  assert.deepEqual(timer.subtractMinute(), ready);

  timer.setDuration(MAX_LESSON_MINUTES);
  timer.start();
  const maximum = timer.read();
  assert.deepEqual(timer.addMinute(), maximum);

  timer.end();
  const complete = timer.read();
  assert.deepEqual(timer.addMinute(), complete);
  assert.deepEqual(timer.subtractMinute(), complete);
});

test("Reset restores the selected duration instead of adjusted time", () => {
  const timer = createLessonTimer({ storage: createMemoryStorage(), now: () => 0 });
  timer.setDuration(10);
  timer.start();
  assert.equal(timer.addMinute().remainingSeconds, 660);
  const reset = timer.reset();
  assert.equal(reset.status, LESSON_TIMER_STATES.READY);
  assert.equal(reset.durationSeconds, 600);
  assert.equal(reset.remainingSeconds, 600);
});

test("Running and Paused adjustments restore without repeating on refresh", () => {
  let currentTime = 0;
  const storage = createMemoryStorage();
  let timer = createLessonTimer({ storage, now: () => currentTime });
  timer.setDuration(5);
  timer.start();
  timer.addMinute();

  currentTime = 30_000;
  timer = createLessonTimer({ storage, now: () => currentTime });
  assert.equal(timer.read().remainingSeconds, 330);
  assert.equal(timer.read().remainingSeconds, 330);

  timer.pause();
  timer.subtractMinute();
  currentTime = 90_000;
  timer = createLessonTimer({ storage, now: () => currentTime });
  assert.equal(timer.read().status, LESSON_TIMER_STATES.PAUSED);
  assert.equal(timer.read().remainingSeconds, 270);
});

test("out-of-range restored Running adjustment fails closed", () => {
  const storage = createMemoryStorage();
  storage.setItem(LESSON_TIMER_SESSION_KEY, JSON.stringify({
    version: 1,
    status: LESSON_TIMER_STATES.RUNNING,
    durationSeconds: 300,
    remainingSeconds: 300,
    endsAt: (MAX_LESSON_MINUTES * 60 + 1) * 1000,
  }));
  const timer = createLessonTimer({ storage, now: () => 0 });
  const restored = timer.read();
  assert.equal(restored.status, LESSON_TIMER_STATES.READY);
  assert.equal(restored.durationSeconds, 300);
  assert.equal(restored.remainingSeconds, 300);
  assert.equal(restored.endsAt, null);
});

test("teacher controls are accessible and Student Display remains control-free", () => {
  for (const label of ["Add 1 minute", "Subtract 1 minute"]) {
    assert.ok(appSource.includes(`>${label}</button>`));
  }
  assert.match(appSource, /"timer-add-minute": \(\) => lessonTimer\.addMinute\(\)/);
  assert.match(appSource,
    /"timer-subtract-minute": \(\) => lessonTimer\.subtractMinute\(\)/);
  assert.match(cssSource,
    /\.platform-timer-adjustments button,[\s\S]*min-height: 2\.75rem/);

  const displayStart = appSource.indexOf(
    '<section id="platform-student-timer-display"');
  const displayEnd = appSource.indexOf("</section>", displayStart);
  const displaySource = appSource.slice(displayStart, displayEnd);
  assert.doesNotMatch(displaySource, /Add 1 minute|Subtract 1 minute|<button/);
});
