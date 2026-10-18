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
