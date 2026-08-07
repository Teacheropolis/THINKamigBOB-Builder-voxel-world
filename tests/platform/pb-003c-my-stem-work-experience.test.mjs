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
const stemWorkStart = studentHomeSource.indexOf(
  '<section class="platform-stem-work"');
const stemWorkSource = studentHomeSource.slice(stemWorkStart);

test("My STEM Work preserves the existing protected Student Home route", () => {
  assert.match(appSource, /STUDENT_DASHBOARD: "\/student\/dashboard"/);
  assert.match(appSource,
    /route === ROUTES\.STUDENT_DASHBOARD && state\.role !== PLATFORM_ROLES\.STUDENT/);
  assert.match(appSource,
    /state\.role === PLATFORM_ROLES\.STUDENT && isTeacherRoute/);
  assert.doesNotMatch(`${sessionSource}\n${fixtureSource}`, /pb003c|stem work|project/i);
});

test("My STEM Work follows Mission Choice and uses the approved reading order", () => {
  assert.ok(stemWorkStart > studentHomeSource.indexOf('id="choose-path-title"'));
  const orderedIds = [
    "stem-work-title",
    "current-work-title",
    "recent-work-title",
    "previous-work-title",
    "evidence-connections-title",
  ];
  let previous = -1;
  for (const id of orderedIds) {
    const position = stemWorkSource.indexOf(`id="${id}"`);
    assert.ok(position > previous, `expected ${id} in approved order`);
    previous = position;
  }
});

test("project organization uses exactly the approved honest states", () => {
  for (const state of [
    "You do not have current work to continue yet.",
    "Your recent engineering work will appear here when it is available.",
    "Your earlier engineering work will appear here when it is available.",
    "Evidence cannot be checked right now.",
  ]) assert.ok(stemWorkSource.includes(state), `expected ${state}`);
  assert.equal((stemWorkSource.match(/platform-project-card-container/g) ?? []).length, 3);
  assert.doesNotMatch(stemWorkSource, /platform-project-card["\s]/);
});

test("Continue Current Work and Future Path remain explanatory and noninteractive", () => {
  assert.match(stemWorkSource, /Continue Current Work/);
  assert.match(stemWorkSource, /When a project is ready, you can return to it here\./);
  assert.match(stemWorkSource, /Choose a Future Path/);
  assert.match(stemWorkSource, /Available mission choices will appear in Mission Choice\./);
  assert.doesNotMatch(stemWorkSource,
    /<button|<a\s|href=|data-action=|data-form=|navigate\(/);
});

test("evidence foundation exposes exactly four noninteractive Coming Later sources", () => {
  for (const source of ["Builder", "Workshop", "Google Slides", "Google Vids"]) {
    assert.match(stemWorkSource, new RegExp(`<span>${source}<\\/span><strong>Coming Later<\\/strong>`));
  }
  assert.equal((stemWorkSource.match(/<strong>Coming Later<\/strong>/g) ?? []).length, 4);
  assert.match(stemWorkSource, /It is not automatically reflection, proof of learning, a grade, teacher-reviewed, public, or complete/);
});

test("no project, evidence, integration, or teacher-review data is fabricated", () => {
  assert.doesNotMatch(stemWorkSource,
    /projectId|fileId|accountId|last saved|revision count|progress|teacher viewed|pending review|support signal/i);
  assert.doesNotMatch(stemWorkSource,
    /sessionStorage|localStorage|fetch\s*\(|WebSocket|XMLHttpRequest|Google Drive|portfolio/i);
  assert.doesNotMatch(appSource, /pb003c.*(?:session|storage|route)/i);
});

test("My STEM Work CSS is namespaced, responsive, and has no card rail", () => {
  for (const selector of [
    ".platform-stem-work",
    ".platform-stem-work-layout",
    ".platform-stem-work-current",
    ".platform-stem-work-future-path",
    ".platform-stem-work-history",
    ".platform-stem-work-history-layout",
    ".platform-stem-work-recent",
    ".platform-stem-work-previous",
    ".platform-project-card-container",
    ".platform-evidence-connections",
    ".platform-evidence-source-list",
  ]) assert.ok(cssSource.includes(selector), `expected ${selector}`);
  assert.match(cssSource,
    /@media \(max-width: 520px\)[\s\S]*\.platform-stem-work-layout, \.platform-stem-work-history-layout, \.platform-evidence-source-list \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(cssSource,
    /\.platform-(?:stem-work|evidence|project)[^{]*\{[^}]*overflow-x:\s*(?:auto|scroll)|carousel|scroll-snap/i);
});

test("PB-003A and PB-003B regions remain present", () => {
  for (const id of [
    "student-orientation-title",
    "bob-welcome-title",
    "current-goal-title",
    "yesterday-wins-title",
    "yesterday-challenge-title",
    "reflection-check-title",
    "choose-path-title",
    "mission-continue-title",
    "available-missions-title",
    "side-paths-title",
  ]) assert.ok(studentHomeSource.includes(`id="${id}"`), `expected ${id}`);
});
