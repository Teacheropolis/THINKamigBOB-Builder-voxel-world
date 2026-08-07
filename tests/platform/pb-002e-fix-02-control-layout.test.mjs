import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(
  new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(
  new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

function sectionSource(className) {
  const start = appSource.indexOf(`<section class="${className}`);
  assert.ok(start >= 0, `expected ${className}`);
  return appSource.slice(start, appSource.indexOf("</section>", start));
}

test("timer and memo cards no longer contain Student Display controls", () => {
  const timerCard = sectionSource("platform-command-card platform-command-card-timer");
  const memoCard = sectionSource("platform-command-card platform-command-card-memo");
  for (const card of [timerCard, memoCard]) {
    assert.doesNotMatch(card, /open-timer-display|select-presentation-mode|data-presentation-mode/);
  }
  assert.match(timerCard, /timer-start/);
  assert.match(timerCard, /timer-subtract-minute/);
  assert.match(memoCard, /Save Memo/);
  assert.match(memoCard, /data-teacher-memo-status/);
});

test("one shared section follows both cards and owns all presentation controls", () => {
  const timerStart = appSource.indexOf("platform-command-card-timer");
  const memoStart = appSource.indexOf("platform-command-card-memo");
  const controlsStart = appSource.indexOf("platform-student-display-controls");
  assert.ok(controlsStart > timerStart && controlsStart > memoStart);

  const controls = sectionSource("platform-command-card platform-student-display-controls");
  assert.match(controls, /id="student-display-controls-title">Student Display/);
  assert.equal((controls.match(/data-action="select-presentation-mode"/g) ?? []).length, 3);
  assert.equal((controls.match(/data-action="open-timer-display"/g) ?? []).length, 1);
  for (const label of ["Timer + Message", "Message only", "Timer only"]) {
    assert.ok(controls.includes(label), `expected ${label}`);
  }
  assert.match(controls, /aria-label="Student Display content"/);
  assert.match(controls,
    /data-presentation-mode="\$\{STUDENT_DISPLAY_MODES\.MESSAGE\}"[^>]*\$\{hasMemo \? "" : " disabled"\}/);
});

test("shared controls remain responsive, accessible, and use existing ownership", () => {
  assert.equal((appSource.match(/<button[^>]+data-action="open-timer-display"/g) ?? []).length, 1);
  assert.match(appSource, /lessonTimerDisplayTrigger = action/);
  assert.match(appSource, /lessonTimerDisplayTrigger = null;\s*focusTarget\?\.focus\(\)/);
  assert.match(cssSource, /\.platform-student-display-controls \{ grid-column: 2 \/ 4;/);
  assert.match(cssSource, /\.platform-student-display-mode-controls button \{ min-height: 2\.75rem/);
  assert.match(cssSource, /\.platform-student-display-button \{ width: 100%;/);
  assert.match(cssSource,
    /@media \(max-width: 800px\)[\s\S]*\.platform-student-display-controls \{ grid-column: 1 \/ -1; \}/);
  assert.match(cssSource,
    /@media \(max-width: 520px\)[\s\S]*\.platform-student-display-controls \{ grid-column: auto; grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(appSource, /PB-002E-FIX-02|pb002e-fix-02|pb002e\.fix02/);
});
