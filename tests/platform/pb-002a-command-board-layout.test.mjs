import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
const fixtureSource = readFileSync(new URL("../../platform/scripts/platform-fixtures.mjs", import.meta.url), "utf8");

function between(start, end) {
  const startIndex = appSource.indexOf(start);
  const endIndex = appSource.indexOf(end, startIndex + start.length);
  assert.ok(startIndex >= 0 && endIndex > startIndex, `expected ${start} before ${end}`);
  return appSource.slice(startIndex, endIndex);
}

const teacherViewSource = between("function teacherDashboardView(state)", "function studentDashboardView(state)");

test("teacher dashboard keeps the PB-001 protected route and role guard", () => {
  assert.match(appSource, /TEACHER_DASHBOARD: "\/teacher\/dashboard"/);
  assert.match(appSource, /route === ROUTES\.TEACHER_DASHBOARD && state\.role !== PLATFORM_ROLES\.TEACHER/);
  assert.match(appSource, /case ROUTES\.TEACHER_DASHBOARD: return teacherDashboardView\(state\)/);
  assert.doesNotMatch(appSource, /TEACHER_COMMAND_BOARD:/);
});

test("top navigation displays approved teacher orientation and reserved areas", () => {
  for (const label of ["Teacher", "Current class", "Current period", "Settings", "Sign out"]) {
    assert.ok(appSource.includes(label), `expected ${label}`);
  }
  for (const item of ["Classes", "Students", "Missions", "Reports", "Settings"]) {
    assert.ok(teacherViewSource.includes(`"${item}"`), `expected reserved ${item} navigation`);
  }
  assert.match(fixtureSource, /periodLabel: "Period 2"/);
  assert.match(appSource, /data-action="reserved-nav"/);
  assert.match(appSource, /Coming in future build\./);
});

test("TODAY board contains every approved PB-002A placeholder verbatim", () => {
  const requiredContent = [
    "TODAY",
    "Today's Mission",
    "Coming in future build",
    "Lesson Progress",
    "Timer coming in future build",
    "Teacher Memo",
    "Class message coming in future build",
    "Wins",
    "Future classroom accomplishments will appear here.",
    "Blockers",
    "Future classroom challenges will appear here.",
    "Next Steps",
    "Future class direction will appear here.",
    "Teacher Feed",
    "Future classroom events will appear here.",
  ];
  for (const content of requiredContent) {
    assert.ok(teacherViewSource.includes(content), `expected ${content}`);
  }
});

test("command board implements layout only and no excluded feature logic", () => {
  assert.doesNotMatch(teacherViewSource, /setInterval|setTimeout|fetch\s*\(|localStorage|WebSocket|EventSource/);
  assert.doesNotMatch(teacherViewSource, /student progress|support signal|teacher moment|shoutout|kit checkout|hall of fame|google drive|google forms|artificial intelligence/i);
  assert.doesNotMatch(teacherViewSource, /href=.*(?:builder|workshop)/i);
  assert.doesNotMatch(teacherViewSource, /<input|<textarea|contenteditable/i);
});

test("command board CSS is namespaced, responsive, and overflow-safe", () => {
  for (const selector of [
    ".platform-command-layout",
    ".platform-teacher-nav",
    ".platform-today-board",
    ".platform-today-primary-grid",
    ".platform-class-rhythm",
    ".platform-teacher-feed",
  ]) {
    assert.ok(cssSource.includes(selector), `expected ${selector}`);
  }
  assert.match(cssSource, /\.platform-today-board \{ min-width: 0;/);
  assert.match(cssSource, /@media \(max-width: 800px\)/);
  assert.match(cssSource, /@media \(max-width: 520px\)/);
  assert.match(cssSource, /overflow-x: auto/);
});
