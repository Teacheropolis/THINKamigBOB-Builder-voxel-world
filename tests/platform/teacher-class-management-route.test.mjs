import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

function between(start, end) {
  const from = app.indexOf(start);
  const to = app.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from);
  return app.slice(from, to);
}

test("teacher Today view links to protected class management", () => {
  const today = between("function teacherDashboardView(state)", "function teacherClassesView(state)");
  assert.match(app, /TEACHER_CLASSES: "\/teacher\/classes"/);
  assert.match(app, /route === ROUTES\.TEACHER_CLASSES && state\.role !== PLATFORM_ROLES\.TEACHER/);
  assert.doesNotMatch(today, /class="platform-page-heading-actions"/);
  assert.match(app, /class="platform-teacher-menu"/);
  assert.match(app, /platform-teacher-menu-heading">Manage Classes<\/strong>/);
  assert.match(app, /platform-teacher-menu-heading">Teacher Command Center<\/strong>/);
  assert.match(app, /AMIG means Ask, Make, Improve, Grow/);
  assert.match(app, /href="#\$\{ROUTES\.TEACHER_DASHBOARD\}">Run Today’s Class<\/a>/);
  assert.doesNotMatch(today, /platform-manage-classes-card/);
  assert.doesNotMatch(today, /platform-teacher-nav/);
  assert.doesNotMatch(today, /\$\{classroomSetupMarkup\(\)\}/);
});

test("Create a Classroom lives on the dedicated Manage Classes screen", () => {
  const classes = between("function teacherClassesView(state)", "function studentDashboardView(state)");
  assert.match(classes, /id="class-management-title">Manage Classes/);
  assert.match(classes, /\$\{classroomSetupMarkup\(\)\}/);
  assert.match(classes, /\$\{teacherSetupMarkup\(\)\}/);
  assert.match(classes, /id="teacher-setup-tools"/);
  assert.match(classes, /Back to Today/);
  assert.match(app, /Create Classroom &amp; Add Students/);
  assert.doesNotMatch(classes, /platform-class-management-nav/);
  assert.doesNotMatch(classes, /aria-label="Classroom access shortcuts"/);
  assert.doesNotMatch(classes, /platform-class-management-footer-nav/);
  for (const target of ["teacher-create-classroom", "teacher-class-sharing", "teacher-class-schedule", "teacher-setup-tools"]) {
    assert.match(app, new RegExp(`data-action="open-manage-classes-section" data-scroll-target="${target}"`));
  }
  assert.match(app, /case ROUTES\.TEACHER_CLASSES: return teacherClassesView\(state\)/);
  assert.match(css, /\.platform-class-management \.platform-classroom-setup/);
  assert.match(css, /\.platform-page-heading-bottom \{[^}]*justify-content: space-between/);
  assert.match(classes, /platform-command-layout-no-sidebar/);
  assert.doesNotMatch(classes, /platform-teacher-nav/);
});

test("Manage Classes presents a simple four-step teacher workflow", () => {
  const classes = between("function teacherClassesView(state)", "function studentDashboardView(state)");
  for (const label of ["Class &amp; Students", "Schedule", "Reuse Setup", "Connections"]) assert.match(classes, new RegExp(label));
  assert.ok(classes.indexOf("classroomSetupMarkup") < classes.indexOf("classTimerScheduleMarkup"));
  assert.ok(classes.indexOf("classTimerScheduleMarkup") < classes.indexOf("classSetupSharingMarkup"));
  assert.match(app, /Optional: Make Funny NameBobs &amp; Limericks/);
  assert.match(app, /Optional Timer &amp; Message Settings/);
  assert.match(classes, /<details class="platform-manage-advanced"/);
  assert.match(css, /\.platform-manage-class-flow \{ display: grid;/);
});
