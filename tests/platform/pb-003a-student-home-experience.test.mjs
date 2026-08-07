import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(
  new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(
  new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
const fixtureSource = readFileSync(
  new URL("../../platform/scripts/platform-fixtures.mjs", import.meta.url), "utf8");

const studentHomeStart = appSource.indexOf("function studentDashboardView(state)");
const studentHomeEnd = appSource.indexOf("function viewForRoute", studentHomeStart);
const studentHomeSource = appSource.slice(studentHomeStart, studentHomeEnd);

test("Student Home preserves the existing protected PB-001 route and owners", () => {
  assert.match(appSource, /STUDENT_DASHBOARD: "\/student\/dashboard"/);
  assert.match(appSource,
    /route === ROUTES\.STUDENT_DASHBOARD && state\.role !== PLATFORM_ROLES\.STUDENT/);
  assert.match(appSource,
    /state\.role === PLATFORM_ROLES\.STUDENT && isTeacherRoute/);
  assert.match(studentHomeSource, /getStudentById\(state\.studentId\)/);
  assert.match(studentHomeSource, /getClassById\(state\.classId\)/);
  assert.match(appSource, /session\.signOut\(\)/);
});

test("Student Home presents the approved sections in logical order", () => {
  const orderedIds = [
    "student-orientation-title",
    "bob-welcome-title",
    "current-goal-title",
    "yesterday-wins-title",
    "yesterday-challenge-title",
    "reflection-check-title",
    "choose-path-title",
  ];
  let previous = -1;
  for (const id of orderedIds) {
    const position = studentHomeSource.indexOf(`id="${id}"`);
    assert.ok(position > previous, `expected ${id} in approved order`);
    previous = position;
  }
  assert.match(studentHomeSource, /title: "Student Home"/);
  assert.match(studentHomeSource, /aria-labelledby="student-orientation-title"/);
  assert.match(studentHomeSource, /aria-labelledby="yesterday-title"/);
  assert.match(studentHomeSource, /aria-labelledby="choose-path-title"/);
});

test("unowned information uses only the approved honest states", () => {
  for (const message of [
    "No current goal is available yet.",
    "No verified Win is available yet.",
    "No Challenge is available yet.",
    "Check unavailable.",
  ]) assert.ok(studentHomeSource.includes(message), `expected ${message}`);

  assert.match(studentHomeSource, /No mission is ready to continue yet\./);
  assert.match(studentHomeSource, /No new missions are available right now\./);
});

test("Choose Your Path remains an honest noninteractive foundation", () => {
  for (const section of ["Continue", "Available Missions", "Side Paths"]) {
    assert.ok(studentHomeSource.includes(section), `expected ${section}`);
  }
  assert.doesNotMatch(studentHomeSource, /platform-student-path-card/);
  assert.doesNotMatch(studentHomeSource, /href=|navigate\(|data-action=|data-form=/);
});

test("BOB is visible guidance only and adds no speech or conversational behavior", () => {
  assert.match(studentHomeSource, /Welcome, \$\{studentName\}/);
  assert.doesNotMatch(studentHomeSource,
    /Read Aloud|Stop Reading|speechSynthesis|SpeechSynthesis|microphone|chatbot|prompt|audio/i);
  assert.doesNotMatch(`${appSource}\n${fixtureSource}`,
    /pb003a.*session|student-home.*sessionStorage|localStorage|fetch\s*\(|WebSocket/i);
});

test("Student Home markup protects private and teacher-only information", () => {
  assert.doesNotMatch(studentHomeSource,
    /private identifier|class code|teacher feed|support signal|needs attention|student-display-mode/i);
  assert.doesNotMatch(studentHomeSource, /state\.pending|identifier|teacherId|raw id/i);
  assert.doesNotMatch(studentHomeSource, /Submitted|Not submitted/);
});

test("Student Home CSS is namespaced, responsive, and Chromebook-friendly", () => {
  for (const selector of [
    ".platform-student-home",
    ".platform-student-orientation",
    ".platform-bob-welcome",
    ".platform-student-goal",
    ".platform-yesterday-grid",
    ".platform-student-reflection",
    ".platform-mission-choice-layout",
  ]) assert.ok(cssSource.includes(selector), `expected ${selector}`);
  assert.match(cssSource,
    /@media \(max-width: 800px\)[\s\S]*\.platform-mission-choice-layout \{ grid-template-columns: 1fr; \}/);
  assert.match(cssSource,
    /@media \(max-width: 520px\)[\s\S]*\.platform-student-home \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(cssSource, /\.platform-student-[^{]*\{[^}]*overflow-x:\s*(?:auto|scroll)/);
});
