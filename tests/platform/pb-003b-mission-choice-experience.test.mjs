import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(
  new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(
  new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
const sessionSource = readFileSync(
  new URL("../../platform/scripts/platform-session.mjs", import.meta.url), "utf8");
const fixtureSource = readFileSync(
  new URL("../../platform/scripts/platform-fixtures.mjs", import.meta.url), "utf8");

const studentHomeStart = appSource.indexOf("function studentDashboardView(state)");
const studentHomeEnd = appSource.indexOf("function viewForRoute", studentHomeStart);
const studentHomeSource = appSource.slice(studentHomeStart, studentHomeEnd);
const missionChoiceStart = studentHomeSource.indexOf(
  '<section class="platform-student-paths"');
const missionChoiceEnd = studentHomeSource.indexOf("</section>\n    </div>", missionChoiceStart);
const missionChoiceSource = studentHomeSource.slice(missionChoiceStart, missionChoiceEnd);

test("Mission Choice preserves the existing Student Home route and protected owners", () => {
  assert.match(appSource, /STUDENT_DASHBOARD: "\/student\/dashboard"/);
  assert.match(appSource,
    /route === ROUTES\.STUDENT_DASHBOARD && state\.role !== PLATFORM_ROLES\.STUDENT/);
  assert.match(appSource,
    /state\.role === PLATFORM_ROLES\.STUDENT && isTeacherRoute/);
  assert.doesNotMatch(`${sessionSource}\n${fixtureSource}`, /pb003b|mission choice/i);
});

test("Mission Choice presents Continue, Available Missions, and Side Paths in order", () => {
  const orderedIds = [
    "choose-path-title",
    "mission-continue-title",
    "available-missions-title",
    "side-paths-title",
  ];
  let previous = -1;
  for (const id of orderedIds) {
    const position = missionChoiceSource.indexOf(`id="${id}"`);
    assert.ok(position > previous, `expected ${id} in approved order`);
    previous = position;
  }
  assert.match(missionChoiceSource, /Continue<\/strong> returns to work already started/);
  assert.match(missionChoiceSource, /Start<\/strong> begins a mission made available to you/);
});

test("Mission Choice uses exactly the approved honest current states", () => {
  for (const state of [
    "No mission is ready to continue yet.",
    "No new missions are available right now.",
    "Optional Side Paths are not available yet.",
    "Coming Later",
  ]) assert.ok(missionChoiceSource.includes(state), `expected ${state}`);
});

test("no mission, Side Path, Builder, or Workshop interaction is fabricated", () => {
  assert.doesNotMatch(missionChoiceSource,
    /<button|<a\s|href=|data-action=|data-form=|navigate\(|Builder|Workshop/);
  assert.doesNotMatch(missionChoiceSource,
    /mission title|progress|last saved|evidence|start mission|continue mission/i);
  assert.equal((missionChoiceSource.match(/platform-mission-card-container/g) ?? []).length, 1);
  assert.doesNotMatch(missionChoiceSource, /platform-mission-card["\s]/);
});

test("PB-003A regions outside Mission Choice remain intact", () => {
  for (const id of [
    "student-orientation-title",
    "bob-welcome-title",
    "current-goal-title",
    "yesterday-wins-title",
    "yesterday-challenge-title",
    "reflection-check-title",
  ]) assert.ok(studentHomeSource.includes(`id="${id}"`), `expected ${id}`);
});

test("Mission Choice CSS is namespaced, responsive, and has no card rail", () => {
  for (const selector of [
    ".platform-mission-choice-layout",
    ".platform-mission-choice-section",
    ".platform-mission-choice-continue",
    ".platform-mission-choice-available",
    ".platform-mission-choice-side-paths",
    ".platform-mission-card-container",
  ]) assert.ok(cssSource.includes(selector), `expected ${selector}`);
  assert.match(cssSource,
    /@media \(max-width: 800px\)[\s\S]*\.platform-mission-choice-layout \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(cssSource,
    /\.platform-mission-[^{]*\{[^}]*overflow-x:\s*(?:auto|scroll)|carousel|scroll-snap/i);
});

test("Mission Choice adds no data, persistence, networking, or production integration", () => {
  assert.doesNotMatch(missionChoiceSource,
    /sessionStorage|localStorage|fetch\s*\(|WebSocket|XMLHttpRequest|missionId|assignmentId|progress/i);
  assert.doesNotMatch(appSource, /pb003b.*(?:session|storage|route)/i);
});
