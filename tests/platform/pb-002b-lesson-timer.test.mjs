import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createLessonTimer,
  DEFAULT_LESSON_MINUTES,
  formatLessonTime,
  LESSON_TIMER_SESSION_KEY,
  LESSON_TIMER_STATES,
} from "../../platform/scripts/lesson-timer.mjs";

const appSource = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
  };
}

test("timer starts ready with the development default and formats classroom time", () => {
  const timer = createLessonTimer({ storage: createMemoryStorage(), now: () => 0 });
  const state = timer.read();
  assert.equal(state.status, LESSON_TIMER_STATES.READY);
  assert.equal(state.durationSeconds, DEFAULT_LESSON_MINUTES * 60);
  assert.equal(state.remainingSeconds, DEFAULT_LESSON_MINUTES * 60);
  assert.equal(formatLessonTime(state.remainingSeconds), "45:00");
  assert.equal(formatLessonTime(3661), "1:01:01");
});

test("duration validation accepts whole classroom minutes only", () => {
  const timer = createLessonTimer({ storage: createMemoryStorage(), now: () => 0 });
  assert.equal(timer.setDuration(0).ok, false);
  assert.equal(timer.setDuration(241).ok, false);
  assert.equal(timer.setDuration(2.5).ok, false);
  const result = timer.setDuration(50);
  assert.equal(result.ok, true);
  assert.equal(result.state.durationSeconds, 3000);
  assert.equal(result.state.remainingSeconds, 3000);
  assert.equal(result.state.status, LESSON_TIMER_STATES.READY);
});

test("start, pause, resume, reset, and end preserve deterministic timer state", () => {
  let currentTime = 10_000;
  const timer = createLessonTimer({ storage: createMemoryStorage(), now: () => currentTime });
  timer.setDuration(10);

  assert.equal(timer.start().status, LESSON_TIMER_STATES.RUNNING);
  currentTime += 90_000;
  assert.equal(timer.read().remainingSeconds, 510);

  const paused = timer.pause();
  assert.equal(paused.status, LESSON_TIMER_STATES.PAUSED);
  assert.equal(paused.remainingSeconds, 510);
  currentTime += 120_000;
  assert.equal(timer.read().remainingSeconds, 510);

  assert.equal(timer.resume().status, LESSON_TIMER_STATES.RUNNING);
  currentTime += 10_000;
  assert.equal(timer.read().remainingSeconds, 500);

  const reset = timer.reset();
  assert.equal(reset.status, LESSON_TIMER_STATES.READY);
  assert.equal(reset.remainingSeconds, 600);

  timer.start();
  const ended = timer.end();
  assert.equal(ended.status, LESSON_TIMER_STATES.COMPLETE);
  assert.equal(ended.remainingSeconds, 0);
});

test("running timer completes naturally and survives a session refresh", () => {
  let currentTime = 0;
  const storage = createMemoryStorage();
  const timer = createLessonTimer({ storage, now: () => currentTime });
  timer.setDuration(1);
  timer.start();
  currentTime = 30_000;

  const refreshedTimer = createLessonTimer({ storage, now: () => currentTime });
  assert.equal(refreshedTimer.read().remainingSeconds, 30);
  assert.equal(refreshedTimer.read().status, LESSON_TIMER_STATES.RUNNING);

  currentTime = 60_000;
  assert.equal(refreshedTimer.read().remainingSeconds, 0);
  assert.equal(refreshedTimer.read().status, LESSON_TIMER_STATES.COMPLETE);

  refreshedTimer.clear();
  assert.equal(storage.getItem(LESSON_TIMER_SESSION_KEY), null);
  assert.equal(refreshedTimer.read().status, LESSON_TIMER_STATES.READY);
});

test("every approved timer state reconstructs safely after refresh", () => {
  let currentTime = 1_000;
  const storage = createMemoryStorage();
  const timer = createLessonTimer({ storage, now: () => currentTime });
  timer.setDuration(2);

  let refreshedTimer = createLessonTimer({ storage, now: () => currentTime });
  assert.deepEqual(refreshedTimer.read(), {
    version: 1,
    status: LESSON_TIMER_STATES.READY,
    durationSeconds: 120,
    remainingSeconds: 120,
    endsAt: null,
  });

  timer.start();
  currentTime += 15_000;
  refreshedTimer = createLessonTimer({ storage, now: () => currentTime });
  assert.equal(refreshedTimer.read().status, LESSON_TIMER_STATES.RUNNING);
  assert.equal(refreshedTimer.read().remainingSeconds, 105);

  refreshedTimer.pause();
  currentTime += 30_000;
  refreshedTimer = createLessonTimer({ storage, now: () => currentTime });
  assert.equal(refreshedTimer.read().status, LESSON_TIMER_STATES.PAUSED);
  assert.equal(refreshedTimer.read().remainingSeconds, 105);

  refreshedTimer.end();
  refreshedTimer = createLessonTimer({ storage, now: () => currentTime });
  assert.equal(refreshedTimer.read().status, LESSON_TIMER_STATES.COMPLETE);
  assert.equal(refreshedTimer.read().remainingSeconds, 0);
});

test("repeated refresh deducts elapsed time once and completes at the stored endpoint", () => {
  let currentTime = 0;
  const storage = createMemoryStorage();
  createLessonTimer({ storage, now: () => currentTime }).setDuration(1);
  createLessonTimer({ storage, now: () => currentTime }).start();

  currentTime = 10_000;
  assert.equal(createLessonTimer({ storage, now: () => currentTime }).read().remainingSeconds, 50);
  assert.equal(createLessonTimer({ storage, now: () => currentTime }).read().remainingSeconds, 50);

  currentTime = 61_000;
  const completed = createLessonTimer({ storage, now: () => currentTime }).read();
  assert.equal(completed.status, LESSON_TIMER_STATES.COMPLETE);
  assert.equal(completed.remainingSeconds, 0);
});

test("invalid restored timer data fails safely instead of freezing Running", () => {
  const storage = createMemoryStorage();
  storage.setItem(LESSON_TIMER_SESSION_KEY, JSON.stringify({
    version: 1,
    status: LESSON_TIMER_STATES.RUNNING,
    durationSeconds: 600,
    remainingSeconds: 450,
    endsAt: null,
  }));

  const restored = createLessonTimer({ storage, now: () => 100_000 }).read();
  assert.equal(restored.status, LESSON_TIMER_STATES.READY);
  assert.equal(restored.durationSeconds, 600);
  assert.equal(restored.remainingSeconds, 600);
  assert.equal(restored.endsAt, null);
});

test("Teacher Command Board exposes only approved timer controls", () => {
  for (const label of [
    "Today's Engineering Time",
    "Lesson Timer",
    "Set duration",
    "Start",
    "Pause",
    "Resume",
    "Reset",
    "End",
    "Open Student Display",
  ]) {
    assert.ok(appSource.includes(label), `expected ${label}`);
  }
  assert.match(appSource, /lessonTimer\.clear\(\);\s*session\.signOut\(\)/);
  assert.doesNotMatch(appSource, /lesson stage|time-on-task|pacing suggestion|notification|reward/i);
});

test("student-facing display contains time only and no teacher controls", () => {
  const start = appSource.indexOf('<section id="platform-student-timer-display"');
  const end = appSource.indexOf("</section>", start);
  assert.ok(start >= 0 && end > start);
  const displaySource = appSource.slice(start, end);
  assert.match(displaySource, /Today's Engineering Time/);
  assert.match(displaySource, /data-timer-remaining/);
  assert.doesNotMatch(displaySource, /<button|<input|Reset|Pause|Resume|End|Timer state/);
  assert.match(cssSource, /\.platform-student-timer-display\[hidden\]/);
  assert.match(cssSource, /position: fixed/);
});

test("student display state persists and restores only for an authorized teacher dashboard", () => {
  assert.match(appSource, /thinkamigbob\.pb002b\.lesson-timer-display\.v1/);
  assert.match(appSource, /sessionStorage\.setItem\(LESSON_TIMER_DISPLAY_SESSION_KEY, "open"\)/);
  assert.match(appSource, /route === ROUTES\.TEACHER_DASHBOARD\s*&& state\.role === PLATFORM_ROLES\.TEACHER/);
  assert.match(appSource, /lessonTimerDisplayIsStoredOpen\(\)/);
  assert.match(appSource, /display\.hidden = false/);
  assert.match(appSource, /studentDisplayRestored[\s\S]*platform-student-timer-display[\s\S]*focus/);
});

test("Escape and sign-out clear the persisted student display state", () => {
  const cleanupCalls = [...appSource.matchAll(/storeLessonTimerDisplayOpen\(false\)/g)];
  assert.ok(cleanupCalls.length >= 3, "expected unauthorized, sign-out, and Escape cleanup");
  assert.match(appSource, /if \(action\.dataset\.action === "sign-out"\) \{\s*storeLessonTimerDisplayOpen\(false\);\s*lessonTimer\.clear\(\);\s*session\.signOut\(\)/);
  assert.match(appSource, /if \(!display\) return;\s*storeLessonTimerDisplayOpen\(false\);\s*display\.hidden = true/);
});

test("timer persistence is isolated from student and classroom analytics", () => {
  const timerSource = readFileSync(new URL("../../platform/scripts/lesson-timer.mjs", import.meta.url), "utf8");
  assert.match(timerSource, /sessionStorage|SESSION_KEY/i);
  assert.doesNotMatch(timerSource, /student|mission|grade|analytics|localStorage|fetch\s*\(|WebSocket/i);
});
