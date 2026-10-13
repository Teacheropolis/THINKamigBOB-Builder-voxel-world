import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createClassTimerSchedule, evaluateClassTimerSchedule, evaluateTimerPhases, recommendedTimerPhases, TIMER_SOUND_OPTIONS, WEEKDAYS } from "../../platform/scripts/class-timer-schedule.mjs";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}

test("weekday schedule catches up from the absolute class start time", () => {
  const result = evaluateClassTimerSchedule({ enabled: true, weekdays: ["Monday"], startTime: "09:00", durationMinutes: 45, timeZone: "America/New_York" }, new Date("2026-09-28T13:15:30Z"));
  assert.equal(result.active, true);
  assert.equal(result.remainingSeconds, 29 * 60 + 30);
  assert.match(result.occurrence, /^2026-09-28T09:00@America\/New_York$/);
});

test("schedule stays inactive before class, after class, and on unscheduled days", () => {
  const schedule = { enabled: true, weekdays: ["Monday"], startTime: "09:00", durationMinutes: 45, timeZone: "America/New_York" };
  assert.equal(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T12:59:00Z")).reason, "not-started");
  assert.equal(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:45:00Z")).reason, "finished");
  assert.equal(evaluateClassTimerSchedule(schedule, new Date("2026-09-29T13:15:00Z")).reason, "not-scheduled-today");
});

test("optional activity phases change names and colors at saved class minutes", () => {
  const schedule = {
    enabled: true,
    weekdays: ["Monday"],
    startTime: "09:00",
    durationMinutes: 50,
    timeZone: "America/New_York",
    pomodoroEnabled: true,
    phases: [
      { name: "Warm Up", startMinute: 0 },
      { name: "Build Time", startMinute: 8 },
      { name: "Five Minute Warning", startMinute: 37 },
      { name: "Clean Up", startMinute: 42 },
    ],
  };
  assert.deepEqual(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:03:00Z")).phase, { key: "starter", name: "Warm Up", startMinute: 0, color: "purple" });
  assert.deepEqual(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:20:00Z")).phase, { key: "main", name: "Build Time", startMinute: 8, color: "green" });
  assert.deepEqual(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:37:00Z")).phase, { key: "warning", name: "Five Minute Warning", startMinute: 37, color: "yellow" });
  assert.deepEqual(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:45:00Z")).phase, { key: "ending", name: "Clean Up", startMinute: 42, color: "red" });
  assert.equal(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:36:59Z")).fiveMinuteWarning, false);
  assert.equal(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:37:00Z")).fiveMinuteWarning, true);
  assert.equal(evaluateClassTimerSchedule(schedule, new Date("2026-09-28T13:42:00Z")).fiveMinuteWarning, false);
});

test("pomodoro phases require minute zero and increasing starts before class ends", () => {
  const schedule = createClassTimerSchedule({ storage: memoryStorage(), sessionStorage: memoryStorage() });
  const base = { enabled: true, weekdays: WEEKDAYS, startTime: "09:00", durationMinutes: 45, timeZone: "America/New_York", pomodoroEnabled: true };
  assert.equal(schedule.save({ ...base, phases: [{ name: "Start", startMinute: 1 }, { name: "Main", startMinute: 10 }, { name: "Warning", startMinute: 35 }, { name: "End", startMinute: 40 }] }).reason, "invalid-phases");
  assert.equal(schedule.save({ ...base, phases: [{ name: "Start", startMinute: 0 }, { name: "Main", startMinute: 38 }, { name: "Warning", startMinute: 35 }, { name: "End", startMinute: 40 }] }).reason, "invalid-phases");
  assert.equal(schedule.save({ ...base, phases: [{ name: "Start", startMinute: 0 }, { name: "Main", startMinute: 10 }, { name: "Warning", startMinute: 40 }, { name: "End", startMinute: 40 }] }).reason, "invalid-phases");
});

test("stored Pomodoro phase times are repaired so none exceed the class duration", () => {
  const storage = memoryStorage();
  storage.setItem("thinkamigbob.class-timer-schedule.v1", JSON.stringify({ enabled: false, weekdays: WEEKDAYS, startTime: "09:00", durationMinutes: 30, timeZone: "America/New_York", pomodoroEnabled: true, phases: [
    { name: "Start", startMinute: 0 }, { name: "Work", startMinute: 35 }, { name: "Warning", startMinute: 40 }, { name: "End", startMinute: 44 },
  ] }));
  const schedule = createClassTimerSchedule({ storage, sessionStorage: memoryStorage() }).read();
  assert.equal(schedule.durationMinutes, 30);
  assert.deepEqual(schedule.phases.map((phase) => phase.startMinute), [0, 5, 20, 25]);
  assert.ok(schedule.phases.every((phase) => phase.startMinute < schedule.durationMinutes));
});

test("recommended transitions use first five purple, last ten yellow, and last five red", () => {
  assert.deepEqual(recommendedTimerPhases(60).map((phase) => phase.startMinute), [0, 5, 50, 55]);
  assert.deepEqual(recommendedTimerPhases(45).map((phase) => phase.startMinute), [0, 5, 35, 40]);
});

test("four-color phases also advance when a teacher starts the timer manually", () => {
  const schedule = { durationMinutes: 50, pomodoroEnabled: true, phases: [
    { name: "Start", startMinute: 0 },
    { name: "Work", startMinute: 8 },
    { name: "Warning", startMinute: 37 },
    { name: "Exit", startMinute: 42 },
  ] };
  assert.equal(evaluateTimerPhases(schedule, 3 * 60).phase.color, "purple");
  assert.equal(evaluateTimerPhases(schedule, 20 * 60).phase.color, "green");
  assert.equal(evaluateTimerPhases(schedule, 39 * 60).phase.color, "yellow");
  assert.equal(evaluateTimerPhases(schedule, 45 * 60).phase.color, "red");
});

test("saved schedule persists while each occurrence applies only once per browser session", () => {
  const storage = memoryStorage();
  const sessionStorage = memoryStorage();
  const schedule = createClassTimerSchedule({ storage, sessionStorage, now: () => new Date("2026-09-28T13:10:00Z") });
  assert.equal(schedule.save({ enabled: true, weekdays: WEEKDAYS, startTime: "09:00", durationMinutes: 45, timeZone: "America/New_York" }).ok, true);
  const active = schedule.activeOccurrence();
  assert.equal(active.active, true);
  assert.equal(schedule.wasApplied(active.occurrence), false);
  schedule.markApplied(active.occurrence);
  assert.equal(schedule.wasApplied(active.occurrence), true);
  schedule.save({ enabled: true, weekdays: WEEKDAYS, startTime: "09:00", durationMinutes: 50, timeZone: "America/New_York" });
  assert.equal(schedule.wasApplied(active.occurrence), false);
});

test("today-only override changes effective timing without replacing the weekly schedule", () => {
  const schedule = createClassTimerSchedule({ storage: memoryStorage(), sessionStorage: memoryStorage(), now: () => new Date("2026-09-28T13:10:00Z") });
  schedule.save({ enabled: true, weekdays: WEEKDAYS, startTime: "09:00", durationMinutes: 45, timeZone: "America/New_York", pomodoroEnabled: true, phases: recommendedTimerPhases(45) });
  const result = schedule.saveTodayOverride({ durationMinutes: 60, phases: recommendedTimerPhases(60), pomodoroEnabled: true });
  assert.equal(result.ok, true);
  assert.equal(schedule.read().durationMinutes, 45);
  assert.equal(schedule.readEffective().durationMinutes, 60);
});

test("saving the class schedule clears an older today-only timer override", () => {
  const schedule = createClassTimerSchedule({ storage: memoryStorage(), sessionStorage: memoryStorage() });
  schedule.save({ enabled: false, durationMinutes: 45, pomodoroEnabled: true, phases: recommendedTimerPhases(45) });
  schedule.saveTodayOverride({ durationMinutes: 60, phases: recommendedTimerPhases(60), pomodoroEnabled: true });
  assert.equal(schedule.readEffective().durationMinutes, 60);

  const result = schedule.save({ enabled: false, durationMinutes: 35, pomodoroEnabled: true, phases: recommendedTimerPhases(35) });
  assert.equal(result.ok, true);
  assert.equal(schedule.readTodayOverride(), null);
  assert.equal(schedule.readEffective().durationMinutes, 35);
});

test("schedule saves independent yellow, red, and end sound choices", () => {
  const schedule = createClassTimerSchedule({ storage: memoryStorage(), sessionStorage: memoryStorage() });
  const saved = schedule.save({ enabled: false, yellowSound: "Bird Chirping", redSound: "Cardinal", endSound: "Choir — Heavenly Transition" });
  assert.equal(saved.ok, true);
  assert.deepEqual(TIMER_SOUND_OPTIONS, ["None", "Bird Chirping", "Cardinal", "Guitar Loop — Time Ending", "Choir — Heavenly Transition", "Drum Loop", "Trap Loop Drums", "Soft Piano", "Custom Upload"]);
  assert.deepEqual([schedule.read().yellowSound, schedule.read().redSound, schedule.read().endSound], ["Bird Chirping", "Cardinal", "Choir — Heavenly Transition"]);
});

test("teacher UI keeps schedule setup in Manage Classes and preserves manual controls", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  assert.match(app, /data-form="class-timer-schedule"/);
  assert.match(app, /id="teacher-class-schedule"/);
  assert.match(app, /data-scroll-target="teacher-class-schedule">Change Schedule/);
  assert.match(app, /\$\{classTimerScheduleMarkup\(classRecord\?\.id\)\}/);
  assert.match(app, /lessonTimer\.startScheduled\(occurrence\.durationMinutes, occurrence\.remainingSeconds\)/);
  assert.match(app, /lessonTimer\.startScheduled\(activeSchedule\.durationMinutes, activeSchedule\.remainingSeconds\)/);
  assert.match(app, /lessonTimer\.setDuration\(result\.schedule\.durationMinutes\)/);
  assert.match(app, /preserveCurrentClassSetup\(currentTeacherClass\(session\.read\(\)\.teacherId\)\?\.id\)/);
  assert.match(app, /previewIgnoresScheduleClock/);
  assert.match(app, /lessonTimer\.setDuration\(classTimerSchedule\.readEffective\(\)\.durationMinutes\)/);
  assert.match(app, /Apply for Today Only/);
  assert.match(app, /Change Schedule — Pomodoro intervals and timer sounds/);
  assert.match(app, /<button type="submit">Save Class Schedule<\/button>\s*\$\{showBackToToday \? `<a class="platform-button platform-button-secondary" href="#\$\{ROUTES\.TEACHER_DASHBOARD\}">Back to Today<\/a>` : ""\}/);
  assert.match(app, /Use Recommended Phase Times/);
  assert.match(app, /When yellow begins/);
  assert.match(app, /When red begins/);
  assert.match(app, /When the timer ends/);
  assert.match(app, /data-action="timer-test-sound"/);
  assert.match(app, /playTimerSound\(sounds\.yellowSound, sounds\.yellowCustomAudio\)/);
  assert.match(app, /playTimerSound\(sounds\.redSound, sounds\.redCustomAudio\)/);
  assert.match(app, /playTimerSound\(sounds\.endSound, sounds\.endCustomAudio\)/);
  assert.match(app, /accept="audio\/\*"/);
  assert.match(app, /750 \* 1024/);
  assert.match(app, /new Audio\(customAudio\)/);
  assert.match(app, /bird-chirping-loswin23\.mp3/);
  assert.match(app, /sound === "Bird Chirping"/);
  assert.match(app, /cardinal-freesound-community\.mp3/);
  assert.match(app, /sound === "Cardinal"/);
  assert.match(app, /guitar-loop-time-ending-idoberg\.mp3/);
  assert.match(app, /sound === "Guitar Loop — Time Ending"/);
  assert.match(app, /choir-heavenly-transition-floraphonic\.mp3/);
  assert.match(app, /sound === "Choir — Heavenly Transition"/);
  assert.match(app, /drum-loop-kamhunt\.mp3/);
  assert.match(app, /sound === "Drum Loop"/);
  assert.match(app, /trap-loop-drums-kamhunt\.mp3/);
  assert.match(app, /sound === "Trap Loop Drums"/);
  assert.match(app, /soft-piano-royalty-free-music\.mp3/);
  assert.match(app, /sound === "Soft Piano"/);
  assert.match(app, /evaluateTimerPhases\(classTimerSchedule\.readEffective\(\), timerState\.durationSeconds - timerState\.remainingSeconds\)/);
  assert.match(app, /data-timer-phase-name/);
  assert.match(app, /data-timer-phase-color/);
  assert.match(app, /Five minutes until cleanup or the ending activity/);
  assert.match(app, /class="platform-student-round-timer"/);
  assert.match(css, /conic-gradient\(from -90deg/);
  assert.match(css, /var\(--timer-main-start\)/);
  assert.match(css, /var\(--timer-warning-start\)/);
  assert.match(css, /var\(--timer-red-start\)/);
  assert.match(css, /#454f55 0 var\(--timer-elapsed\)/);
  for (const action of ["timer-start", "timer-pause", "timer-resume", "timer-reset", "timer-end"]) assert.match(app, new RegExp(`data-action="${action}"`));
});
