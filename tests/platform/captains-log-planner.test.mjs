import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { CAPTAINS_LOG_ASSIGNMENT_OPTIONS, CAPTAINS_LOG_PRESET_PROMPTS, captainLogCoachingQuestions, createWeeklyReflections } from "../../platform/scripts/weekly-reflections.mjs";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test("Captain's Log provides a seven-week AMIG prompt progression", () => {
  assert.equal(CAPTAINS_LOG_PRESET_PROMPTS.length, 7);
  assert.deepEqual(CAPTAINS_LOG_PRESET_PROMPTS.map((item) => item.week), [1, 2, 3, 4, 5, 6, 7]);
  assert.match(CAPTAINS_LOG_PRESET_PROMPTS[0].prompt, /notice or wonder/i);
  assert.match(CAPTAINS_LOG_PRESET_PROMPTS[6].prompt, /try next/i);
});

test("teacher can schedule a prompt and update the weekly requirement", () => {
  const reflections = createWeeklyReflections({ storage: memoryStorage(), now: () => new Date("2026-10-19T12:00:00Z") });
  reflections.setActiveCaptainLogWeek("class-1", 2);
  const result = reflections.saveCaptainLogPlan("class-1", { promptId: "week-3-improve", prompt: "What did you improve?", week: 3, schedule: "Monday", required: 2 });
  assert.equal(result.ok, true);
  assert.equal(reflections.captainLogPlan("class-1").prompt, "What did you improve?");
  assert.equal(reflections.requirement("class-1"), 2);
  assert.equal(reflections.captainLogAvailableToday("class-1"), true);
});

test("custom prompts can be saved once and removed from the library", () => {
  const reflections = createWeeklyReflections({ storage: memoryStorage() });
  const first = reflections.saveCaptainLogPrompt("What made you feel proud today?");
  const second = reflections.saveCaptainLogPrompt("What made you feel proud today?");
  assert.equal(first.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(reflections.captainLogLibrary().length, 1);
  assert.equal(reflections.deleteCaptainLogPrompt(first.item.id).ok, true);
  assert.equal(reflections.captainLogLibrary().length, 0);
});

test("teacher can assign five different weekday prompts", () => {
  const reflections = createWeeklyReflections({ storage: memoryStorage(), now: () => new Date("2026-10-19T12:00:00Z") });
  reflections.setActiveCaptainLogWeek("class-1", 2);
  const days = Object.fromEntries(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => [day, { enabled: true, promptId: `prompt-${index}`, prompt: `Different prompt number ${index + 1}?` }]));
  const result = reflections.saveCaptainLogWeekPlan("class-1", { week: 2, days });
  assert.equal(result.ok, true);
  assert.equal(new Set(Object.values(reflections.captainLogWeekPlan("class-1").days).map((item) => item.prompt)).size, 5);
  assert.equal(reflections.requirement("class-1"), 5);
  assert.equal(reflections.captainLogPlan("class-1").prompt, "Different prompt number 1?");
});

test("five-day plan can be copied to other classes", () => {
  const reflections = createWeeklyReflections({ storage: memoryStorage(), now: () => new Date("2026-10-19T12:00:00Z") });
  const days = Object.fromEntries(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => [day, { enabled: true, promptId: `prompt-${index}`, prompt: `Class prompt number ${index + 1}?` }]));
  reflections.saveCaptainLogWeekPlan("source", { week: 4, days });
  const result = reflections.copyCaptainLogWeekPlan("source", ["class-2", "class-3"], ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], 4);
  assert.deepEqual(result, { ok: true, copied: 2 });
  assert.equal(reflections.captainLogWeekPlan("class-2", 4).days.Wednesday.prompt, "Class prompt number 3?");
  assert.equal(reflections.requirement("class-3"), 1);
});

test("all seven class weeks are stored independently", () => {
  const reflections = createWeeklyReflections({ storage: memoryStorage(), now: () => new Date("2026-10-19T12:00:00Z") });
  const makeDays = (week) => Object.fromEntries(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => [day, { enabled: true, promptId: `week-${week}-${index}`, prompt: `Week ${week} prompt ${index + 1}?` }]));
  for (let week = 1; week <= 7; week += 1) reflections.saveCaptainLogWeekPlan("class-1", { week, days: makeDays(week) });
  assert.equal(reflections.captainLogWeekPlan("class-1", 1).days.Monday.prompt, "Week 1 prompt 1?");
  assert.equal(reflections.captainLogWeekPlan("class-1", 7).days.Friday.prompt, "Week 7 prompt 5?");
  reflections.setActiveCaptainLogWeek("class-1", 7);
  assert.equal(reflections.captainLogPlan("class-1").prompt, "Week 7 prompt 1?");
});

test("Captain's Log follows the class rotation week without a separate publish button", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  assert.match(app, /Current Rotation Week/);
  assert.match(app, /data-current-rotation-week/);
  assert.match(app, /saveCurrentRotationWeek\(classId, rotationWeek\.value\)/);
  assert.doesNotMatch(app, /Use Selected Week for Students/);
  assert.doesNotMatch(app, /data-action="set-active-captains-log-week"/);
});

test("prompts can be assigned to a weekday or offered as a daily student choice", () => {
  assert.deepEqual(CAPTAINS_LOG_ASSIGNMENT_OPTIONS, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Daily student choice"]);
  const reflections = createWeeklyReflections({ storage: memoryStorage(), now: () => new Date("2026-10-19T12:00:00Z") });
  reflections.saveCaptainLogWeekPlan("class-1", { week: 1, days: {
    Monday: { enabled: true, promptId: "monday-only", prompt: "What did you make today?", assignment: "Monday" },
    Tuesday: { enabled: true, promptId: "daily-one", prompt: "What did you notice today?", assignment: "Daily student choice" },
    Wednesday: { enabled: true, promptId: "daily-two", prompt: "What will you improve next?", assignment: "Daily student choice" },
    Thursday: { enabled: false, promptId: "off", prompt: "Disabled prompt here.", assignment: "Thursday" },
    Friday: { enabled: false, promptId: "off-two", prompt: "Another disabled prompt.", assignment: "Friday" },
  } });
  assert.deepEqual(reflections.captainLogChoices("class-1", "student-1").map((item) => item.promptId), ["monday-only", "daily-one", "daily-two"]);
  reflections.submit("class-1", "student-1", { activity: "Bridge", promptId: "daily-one", progress: "🧪 Testing", explanation: "I tested the bridge today.", improved: "Yes", badge: "🏗 Builder – I built, tested, or improved a design.", help: "😊 No, I'm doing fine.", helpOther: "Maybe", rating: "4 = Good 😊", followUps: [{ dok: 2, question: "What detail supports your answer?", answer: "The bridge held ten blocks." }] });
  assert.deepEqual(reflections.captainLogChoices("class-1", "student-1").map((item) => item.promptId), ["monday-only", "daily-two"]);
});

test("teacher prompt dropdowns do not display rotation week numbers", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const reflections = readFileSync(new URL("../../platform/scripts/weekly-reflections.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(app, /\$\{item\.week \? `Week \$\{item\.week\} · `/);
  assert.match(app, /Offer this prompt/);
  assert.match(reflections, /Daily student choice/);
});

test("Bob uses deterministic writing and timing signals to adjust follow-up depth", () => {
  const supported = captainLogCoachingQuestions({ explanation: "i made bridge", progress: "🌱 Started", improved: "Not Yet" }, { elapsedSeconds: 300 });
  const extended = captainLogCoachingQuestions({ explanation: "I tested three bridge designs because I wanted evidence. The triangle supports held the most blocks, so I strengthened the center and tested it again with additional weight.", progress: "🏆 Complete", improved: "Yes" }, { elapsedSeconds: 90 });
  assert.equal(supported.length, 1);
  assert.equal(extended.length, 3);
  assert.deepEqual(extended.map((item) => item.dok), [2, 3, 4]);
});

test("weekly goal cannot exceed the number of available unique prompts", () => {
  const reflections = createWeeklyReflections({ storage: memoryStorage() });
  const days = Object.fromEntries(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => [day, { enabled: index < 2, promptId: `prompt-${index}`, prompt: `Prompt number ${index + 1} here?`, assignment: "Daily student choice" }]));
  assert.equal(reflections.saveCaptainLogWeekPlan("class-1", { week: 1, days, required: 3 }).reason, "goal-exceeds-prompts");
  assert.equal(reflections.saveCaptainLogWeekPlan("class-1", { week: 1, days, required: 2 }).ok, true);
});
