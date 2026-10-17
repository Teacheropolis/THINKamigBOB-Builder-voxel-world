import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(
  new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(
  new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

const studentHomeStart = appSource.indexOf("function studentDashboardView(state)");
const studentHomeEnd = appSource.indexOf("function viewForRoute", studentHomeStart);
const studentHomeSource = appSource.slice(studentHomeStart, studentHomeEnd);
const launcherStart = appSource.indexOf("function todaysLessonStudentMarkup");
const launcherEnd = appSource.indexOf("function studentReflectionMarkup", launcherStart);
const launcherSource = appSource.slice(launcherStart, launcherEnd);

test("School-Start Launcher is one full-width region inside Today’s Activity", () => {
  assert.match(studentHomeSource, /todaysLessonStudentMarkup\(state\.classId/);
  assert.equal((launcherSource.match(/platform-school-start-launcher platform-school-start-launcher-inline/g) ?? []).length, 1);
  assert.match(cssSource, /\.platform-school-start-launcher \{[^}]*grid-column: 1 \/ -1;/);
});

test("School-Start Launcher contains the three approved choices with visual and spoken support", () => {
  for (const label of ["CURRENT SIDE PATH", "STEM BUILDER", "STEM WORKSHOP"]) assert.match(launcherSource, new RegExp(label));
  for (const destination of ["currentSidePath.url", "../index.html", "http://192.168.1.252:8000"]) assert.ok(launcherSource.includes(destination), `expected ${destination}`);
  assert.equal((launcherSource.match(/<a\s/g) ?? []).length, 3);
  assert.equal((launcherSource.match(/target="_blank"/g) ?? []).length, 3);
  assert.equal((launcherSource.match(/rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.match(launcherSource, /data-action="read-student-launches"/);
  assert.match(launcherSource, /🔊 Listen/);
});

test("launcher does not add network or persistence behavior", () => {
  assert.doesNotMatch(launcherSource,
    /sessionStorage|localStorage|fetch\s*\(|WebSocket|XMLHttpRequest|Google API/i);
});

test("launcher CSS is namespaced, touch-sized, wrapping, and responsive", () => {
  for (const selector of [
    ".platform-school-start-launcher",
    ".platform-school-start-launch-grid",
    ".platform-school-start-launch-link",
  ]) assert.ok(cssSource.includes(selector), `expected ${selector}`);
  assert.match(cssSource,
    /\.platform-school-start-launch-grid \{[^}]*repeat\(3, minmax\(0, 1fr\)\)[^}]*min-width: 0;/);
  assert.match(cssSource,
    /\.platform-school-start-launch-link \{[^}]*min-width: 0;[^}]*min-height: 5\.25rem;[^}]*overflow-wrap: anywhere;/);
  assert.match(cssSource,
    /@media \(max-width: 520px\)[\s\S]*\.platform-school-start-launch-grid \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(cssSource,
    /\.platform-school-start-[^{]*\{[^}]*overflow-x:\s*(?:auto|scroll)/);
});

test("protected Mission Choice and My STEM Work remain outside the launcher", () => {
  assert.doesNotMatch(launcherSource, /platform-student-paths|platform-stem-work/);
  assert.match(studentHomeSource, /class="platform-student-paths\s/);
  assert.match(studentHomeSource, /class="platform-stem-work\s/);
});
