import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createStudentDisplayModeStore,
  STUDENT_DISPLAY_MODES,
  STUDENT_DISPLAY_MODE_SESSION_KEY,
} from "../../platform/scripts/student-display-mode.mjs";

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

test("mode store exposes exactly the three approved values and safe defaults", () => {
  assert.deepEqual(Object.values(STUDENT_DISPLAY_MODES),
    ["combined", "message", "timer"]);
  assert.equal(createStudentDisplayModeStore({ storage: createMemoryStorage() })
    .read({ hasMemo: true }), STUDENT_DISPLAY_MODES.COMBINED);
  assert.equal(createStudentDisplayModeStore({ storage: createMemoryStorage() })
    .read({ hasMemo: false }), STUDENT_DISPLAY_MODES.TIMER);
  const changingDefault = createStudentDisplayModeStore({ storage: createMemoryStorage() });
  assert.equal(changingDefault.read({ hasMemo: false }), STUDENT_DISPLAY_MODES.TIMER);
  assert.equal(changingDefault.read({ hasMemo: true }), STUDENT_DISPLAY_MODES.COMBINED);
});

test("selection preserves combined and timer preferences without memo content", () => {
  const storage = createMemoryStorage();
  const modes = createStudentDisplayModeStore({ storage });
  assert.equal(modes.select(STUDENT_DISPLAY_MODES.COMBINED, { hasMemo: false }).ok, true);
  assert.equal(modes.read({ hasMemo: false }), STUDENT_DISPLAY_MODES.COMBINED);
  assert.equal(modes.select(STUDENT_DISPLAY_MODES.TIMER, { hasMemo: true }).ok, true);
  assert.equal(modes.read({ hasMemo: true }), STUDENT_DISPLAY_MODES.TIMER);
  const record = JSON.parse(storage.getItem(STUDENT_DISPLAY_MODE_SESSION_KEY));
  assert.deepEqual(record, { version: 1, mode: STUDENT_DISPLAY_MODES.TIMER });
  assert.equal(Object.keys(record).length, 2);
});

test("message-only requires a memo and normalizes safely when memo is cleared", () => {
  const storage = createMemoryStorage();
  const modes = createStudentDisplayModeStore({ storage });
  assert.equal(modes.select(STUDENT_DISPLAY_MODES.MESSAGE, { hasMemo: false }).ok, false);
  assert.equal(modes.select(STUDENT_DISPLAY_MODES.MESSAGE, { hasMemo: true }).ok, true);
  assert.equal(modes.read({ hasMemo: true }), STUDENT_DISPLAY_MODES.MESSAGE);
  assert.equal(modes.read({ hasMemo: false }), STUDENT_DISPLAY_MODES.TIMER);
  assert.equal(JSON.parse(storage.getItem(STUDENT_DISPLAY_MODE_SESSION_KEY)).mode,
    STUDENT_DISPLAY_MODES.TIMER);
});

test("invalid and incompatible state fail closed and clear removes the record", () => {
  const storage = createMemoryStorage();
  for (const value of [
    "not json",
    JSON.stringify({ version: 2, mode: "combined" }),
    JSON.stringify({ version: 1, mode: "whiteboard" }),
  ]) {
    storage.setItem(STUDENT_DISPLAY_MODE_SESSION_KEY, value);
    assert.equal(createStudentDisplayModeStore({ storage }).read({ hasMemo: false }),
      STUDENT_DISPLAY_MODES.TIMER);
  }
  const modes = createStudentDisplayModeStore({ storage });
  modes.select(STUDENT_DISPLAY_MODES.COMBINED, { hasMemo: true });
  modes.clear();
  assert.equal(storage.getItem(STUDENT_DISPLAY_MODE_SESSION_KEY), null);
});

test("teacher owns one accessible three-mode control group", () => {
  assert.match(appSource, /aria-label="Student Display content"/);
  assert.equal((appSource.match(/data-action="select-presentation-mode"/g) ?? []).length, 3);
  for (const label of ["Timer + Message", "Message only", "Timer only"]) {
    assert.ok(appSource.includes(label), `expected ${label}`);
  }
  assert.match(appSource,
    /data-presentation-mode="\$\{STUDENT_DISPLAY_MODES\.MESSAGE\}"[^>]*aria-pressed[^>]*\$\{hasMemo \? "" : " disabled"\}/);
  assert.match(cssSource,
    /\.platform-student-display-mode-controls button \{ min-height: 2\.75rem/);
});

test("mode presentation hides content without changing timer or memo models", () => {
  assert.match(appSource, /timer\.hidden = !showTimer/);
  assert.match(appSource, /memo\.hidden = !showMemo/);
  assert.match(appSource, /studentDisplayMode\.select/);
  assert.match(appSource,
    /teacherMemo\.clear\(\);\s*studentDisplayMode\.clear\(\);\s*navigate/);
  assert.doesNotMatch(appSource,
    /studentDisplayMode\.(?:select|read)[^\n]*(?:lessonTimer|teacherMemo\.save)/);
});

test("all three student presentations remain control-free and responsive", () => {
  const displayStart = appSource.indexOf(
    '<section id="platform-student-timer-display"');
  const displayEnd = appSource.indexOf("</section>", displayStart);
  const displaySource = appSource.slice(displayStart, displayEnd);
  assert.doesNotMatch(displaySource, /<button|<input|<textarea|data-presentation-mode/);
  for (const selector of [
    ".platform-student-display-combined",
    ".platform-student-display-message-only",
    ".platform-student-display-timer-only",
  ]) assert.ok(cssSource.includes(selector), `expected ${selector}`);
  assert.match(cssSource,
    /\.platform-student-display-combined \{ justify-content: flex-start;/);
  assert.match(cssSource,
    /\.platform-student-display-message-only \.platform-student-memo p \{ font-size: clamp\(/);
});

test("mode module stores no content, analytics, networking, or future features", () => {
  const source = readFileSync(
    new URL("../../platform/scripts/student-display-mode.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source,
    /memo text|remainingSeconds|student data|analytics|fetch\s*\(|WebSocket|localStorage|whiteboard|headline|hall of fame|artificial intelligence/i);
});
