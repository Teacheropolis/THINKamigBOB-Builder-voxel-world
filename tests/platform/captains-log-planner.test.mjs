import assert from "node:assert/strict";
import test from "node:test";
import { CAPTAINS_LOG_PRESET_PROMPTS, createWeeklyReflections } from "../../platform/scripts/weekly-reflections.mjs";

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
