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
const launcherStart = studentHomeSource.indexOf(
  '<section class="platform-school-start-launcher"');
const launcherEnd = studentHomeSource.indexOf("</section>", launcherStart);
const launcherSource = studentHomeSource.slice(launcherStart, launcherEnd);

test("School-Start Launcher is one full-width region in the approved position", () => {
  assert.ok(launcherStart > studentHomeSource.indexOf('class="platform-student-goal"'));
  assert.ok(launcherStart < studentHomeSource.indexOf('class="platform-yesterday"'));
  assert.equal((studentHomeSource.match(/platform-school-start-launcher"/g) ?? []).length, 1);
  assert.match(cssSource, /\.platform-school-start-launcher \{[^}]*grid-column: 1 \/ -1;/);
});

test("School-Start Launcher contains exactly the three approved links in order", () => {
  const destinations = [
    ["GO TO MY STEM MISSIONS", "https://sites.google.com/ravennaschools.us/steminbobwarts/home-start"],
    ["STEM BUILDER", "../index.html"],
    ["STEM WORKSHOP", "http://192.168.1.252:8000"],
  ];
  let previous = -1;
  for (const [label, destination] of destinations) {
    const position = launcherSource.indexOf(`>${label}</a>`);
    assert.ok(position > previous, `expected ${label} in approved order`);
    previous = position;
    assert.ok(launcherSource.includes(`href="${destination}"`), `expected ${destination}`);
  }
  assert.equal((launcherSource.match(/<a\s/g) ?? []).length, 3);
  assert.equal((launcherSource.match(/target="_blank"/g) ?? []).length, 3);
  assert.equal((launcherSource.match(/rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.doesNotMatch(launcherSource, /<button|data-action=|data-form=|onclick=|navigate\(/);
});

test("launcher adds no state, routing, persistence, data, or integration behavior", () => {
  assert.doesNotMatch(launcherSource,
    /state\.|getClassById|getStudentById|sessionStorage|localStorage|fetch\s*\(|WebSocket|XMLHttpRequest|Google API|grade|activity registry|mission distribution/i);
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
    /\.platform-school-start-launch-link \{[^}]*min-width: 0;[^}]*min-height: 2\.75rem;[^}]*overflow-wrap: anywhere;/);
  assert.match(cssSource,
    /@media \(max-width: 520px\)[\s\S]*\.platform-school-start-launch-grid \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(cssSource,
    /\.platform-school-start-[^{]*\{[^}]*overflow-x:\s*(?:auto|scroll)/);
});

test("protected Mission Choice and My STEM Work remain outside the launcher", () => {
  assert.doesNotMatch(launcherSource, /platform-student-paths|platform-stem-work/);
  assert.match(studentHomeSource, /class="platform-student-paths"/);
  assert.match(studentHomeSource, /class="platform-stem-work"/);
});
