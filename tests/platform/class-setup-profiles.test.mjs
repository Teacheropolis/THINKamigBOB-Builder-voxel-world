import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createClassSetupProfiles } from "../../platform/scripts/class-setup-profiles.mjs";
import { getClassesForTeacher } from "../../platform/scripts/platform-fixtures.mjs";

const memoryStorage = () => { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) }; };

test("teacher pilot exposes multiple fictional classes", () => {
  const classes = getClassesForTeacher("teacher-preview-1");
  assert.equal(classes.length, 3);
  assert.deepEqual(classes.map((item) => item.periodLabel), ["Period 2", "Period 4", "Period 6"]);
});

test("class setup copy preserves unselected settings", () => {
  const store = createClassSetupProfiles({ storage: memoryStorage(), classIds: ["a", "b", "c"] });
  store.save("a", { schedule: { durationMinutes: 45 }, memo: { text: "Welcome" } });
  store.save("b", { schedule: { durationMinutes: 60 }, memo: { text: "Keep me" } });
  store.copy("a", ["b", "c"], { timer: true, memo: false });
  assert.equal(store.profile("b").schedule.durationMinutes, 45);
  assert.equal(store.profile("b").memo.text, "Keep me");
  assert.equal(store.profile("c").memo, undefined);
});

test("Manage Classes owns the class setup targeting workflow", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  assert.match(app, /classSetupSharingMarkup\(state\.teacherId, "manage"\)/);
  assert.doesNotMatch(app, /classSetupSharingMarkup\(state\.teacherId, "today"\)/);
  assert.match(app, /Current class/);
  assert.match(app, /All other classes/);
  assert.match(app, /Unselected settings will remain unchanged/);
});

test("Today links directly to the Manage Classes sharing section", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  assert.match(app, /data-action="open-manage-classes-section" data-scroll-target="teacher-class-sharing">Choose What to Share With Other Classes/);
  assert.match(app, /id="teacher-class-sharing"/);
  assert.match(app, /pendingScrollTarget = action\.dataset\.scrollTarget/);
  assert.match(css, /\.platform-workspace-heading-action-row \{ display: flex;/);
});

test("Manage Classes orders its primary setup sections and copies reflection requirements", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const classes = app.slice(app.indexOf("function teacherClassesView(state)"), app.indexOf("function studentDashboardView(state)"));
  assert.ok(classes.indexOf("classTimerScheduleMarkup") < classes.indexOf("classSetupSharingMarkup"));
  for (const text of ["Class Schedule", "Share Classroom Setup", "Connections &amp; Safeguards"]) assert.match(app, new RegExp(text));
  assert.match(app, /Create Classroom &amp; Add Students/);
  assert.match(app, /Shared Message Library/);
  assert.match(app, /What I Learned Today Requirement/);
  assert.match(app, /data-class-setup-component="reflection"/);
  assert.match(app, /weeklyReflections\.setRequirement\(classId, required\)/);
});

test("Today readiness squares are clickable and persist settings per class", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  for (const text of ["Quick class setup", "Use the current plan", "Start a new mission", "Apply Quick Class Setup", "Class Schedule"]) assert.match(app, new RegExp(text));
  assert.match(app, /data-action="open-class-readiness"/);
  assert.match(app, /data-action="open-message-board-quick"/);
  assert.match(app, /id="teacher-message-board"/);
  assert.match(app, /data-message-board-home hidden/);
  assert.match(app, /data-message-board-quick-panel/);
  assert.match(app, /host\.append\(board\)/);
  assert.match(app, /home\.append\(board\)/);
  assert.match(app, /data-action="open-class-schedule-quick"/);
  assert.match(app, /data-class-schedule-quick-panel/);
  assert.match(app, /host\.append\(schedule\)/);
  const quickMessageHandler = app.slice(app.indexOf('if (action.dataset.action === "open-message-board-quick")'), app.indexOf('if (action.dataset.action === "open-class-schedule-quick")'));
  assert.doesNotMatch(quickMessageHandler, /scrollIntoView|\.focus\(/);
  assert.match(app, /classSetupProfiles\.save\(classId, \{ \.\.\.profile, readiness, todayGoals, todayGoalsMode, planningWindow \}\)/);
  assert.match(app, /todaysGoalInputsMarkup\(classRecord\?\.id\)/);
  assert.match(app, /pendingScrollTarget = "teacher-todays-resources"/);
  assert.match(app, /resourceEditor\.open = true/);
  assert.match(app, /mission: todaysMission\.read\(\)/);
  assert.match(app, /profile\?\.mission\?\.title/);
  assert.match(css, /\.platform-class-readiness-panel/);
  assert.match(css, /\.platform-lesson-readiness-items/);
  const todayView = app.slice(app.indexOf("function teacherDashboardView(state)"), app.indexOf("function teacherClassesView(state)"));
  assert.doesNotMatch(todayView, /data-readiness-focus="safeguards"/);
  assert.doesNotMatch(todayView, /<label>Safeguards/);
});
