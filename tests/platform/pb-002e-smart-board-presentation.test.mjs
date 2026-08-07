import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(
  new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(
  new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

const displayStart = appSource.indexOf(
  '<section id="platform-student-timer-display"');
const displayEnd = appSource.indexOf("</section>", displayStart);
const displaySource = appSource.slice(displayStart, displayEnd);
const displayCssStart = cssSource.indexOf(".platform-student-timer-display[hidden]");
const displayCssEnd = cssSource.indexOf(".platform-footer", displayCssStart);
const displayCssSource = cssSource.slice(displayCssStart, displayCssEnd);

test("Student Display presents approved identity, time, and Class Message regions", () => {
  assert.ok(displayStart >= 0);
  assert.match(displaySource, /THINKamigBOB/);
  assert.match(displaySource, /platform-student-engineering-time/);
  assert.match(displaySource, /Today's Engineering Time/);
  assert.match(displaySource, /data-timer-remaining/);
  assert.match(displaySource, /platform-student-memo/);
  assert.match(displaySource, /Class Message/);
  assert.match(displaySource, /data-student-memo-text/);
});

test("timer-only and combined presentation use the approved mode owner", () => {
  assert.match(appSource, /createStudentDisplayModeStore/);
  assert.match(appSource,
    /selectedDisplayMode !== STUDENT_DISPLAY_MODES\.MESSAGE/);
  assert.match(appSource,
    /hasMemo && selectedDisplayMode !== STUDENT_DISPLAY_MODES\.TIMER/);
  assert.match(appSource,
    /display\.classList\.toggle\("platform-student-display-combined", showTimer && showMemo\)/);
});

test("presentation remains control-free and uses the single shared teacher trigger", () => {
  assert.doesNotMatch(displaySource,
    /<button|<input|<textarea|Save Memo|Clear Memo|timer-start|timer-pause|timer-reset/);
  assert.equal((appSource.match(/<button[^>]+data-action="open-timer-display"/g) ?? []).length, 1);
  assert.doesNotMatch(appSource, /localStorage/i);
  assert.doesNotMatch(displaySource,
    /Whiteboard|Hall of Fame|Challenge Studio|artificial intelligence/i);
});

test("Escape restores focus to the teacher control that opened Student Display", () => {
  assert.match(appSource, /lessonTimerDisplayTrigger = action/);
  assert.match(appSource,
    /lessonTimerDisplayTrigger\?\.isConnected\s*\? lessonTimerDisplayTrigger/);
  assert.match(appSource, /lessonTimerDisplayTrigger = null;\s*focusTarget\?\.focus\(\)/);
});

test("responsive presentation keeps timer and memo readable without overflow", () => {
  for (const selector of [
    ".platform-student-engineering-time",
    ".platform-student-display-combined",
    ".platform-student-display-timer-only",
    ".platform-student-memo",
  ]) assert.ok(cssSource.includes(selector), `expected ${selector}`);
  assert.match(cssSource,
    /\.platform-student-memo p \{[^}]*overflow-wrap: anywhere;[^}]*white-space: pre-wrap;/);
  assert.match(cssSource,
    /\.platform-student-display-combined output \{ font-size: clamp\(/);
  assert.doesNotMatch(displayCssSource, /@keyframes|animation:/);
});
