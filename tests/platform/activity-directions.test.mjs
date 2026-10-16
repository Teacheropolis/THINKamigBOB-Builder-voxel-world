import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACTIVITY_DIRECTIONS_STORAGE_KEY, createActivityDirections } from "../../platform/scripts/activity-directions.mjs";

function memoryStorage() { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }

test("teachers can build and release directions incrementally", () => {
  let clock = 10;
  const store = createActivityDirections({ storage: memoryStorage(), now: () => clock++ });
  store.setTitle("class-a", "Bridge Challenge");
  const first = store.saveCard("class-a", { title: "Investigate", directions: "Study the examples before building.", mediaType: "google-slides", url: "https://docs.google.com/presentation/example" });
  assert.equal(first.ok, true);
  assert.equal(store.releasedForStudents("class-a").length, 0);
  store.release("class-a", first.card.id);
  assert.equal(store.releasedForStudents("class-a")[0].title, "Investigate");
  store.withdraw("class-a", first.card.id);
  assert.equal(store.releasedForStudents("class-a").length, 0);
});

test("direction cards can be copied, reordered, edited, and removed", () => {
  let clock = 20;
  const store = createActivityDirections({ storage: memoryStorage(), now: () => clock++ });
  const one = store.saveCard("class-a", { title: "One", directions: "First direction" }).card;
  const two = store.saveCard("class-a", { title: "Two", directions: "Second direction" }).card;
  assert.equal(store.move("class-a", two.id, -1).ok, true);
  assert.deepEqual(store.read("class-a").cards.map((item) => item.title), ["Two", "One"]);
  const copy = store.duplicate("class-a", one.id).card;
  assert.equal(copy.status, "draft");
  store.saveCard("class-a", { ...copy, title: "Edited copy", directions: "Changed" });
  assert.equal(store.read("class-a").cards.some((item) => item.title === "Edited copy"), true);
  store.remove("class-a", copy.id);
  assert.equal(store.read("class-a").cards.length, 2);
});

test("unsafe or incomplete media is rejected", () => {
  const store = createActivityDirections({ storage: memoryStorage() });
  assert.equal(store.saveCard("a", { title: "Unsafe", directions: "Text", resources: [{ mediaType: "image", url: "javascript:alert(1)" }] }).ok, false);
});

test("a direction card can contain multiple mixed resources", () => {
  const store = createActivityDirections({ storage: memoryStorage() });
  const saved = store.saveCard("a", { title: "Explore", directions: "Use both resources.", resources: [{ mediaType: "image", url: "https://example.com/model.png" }, { mediaType: "youtube", url: "https://www.youtube.com/watch?v=abcdef123" }] });
  assert.equal(saved.ok, true);
  assert.deepEqual(store.read("a").cards[0].resources.map((item) => item.mediaType), ["image", "youtube"]);
});

test("teacher and student views expose the live directions timeline", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  for (const text of ["Live Activity Directions", "Add Direction Card", "Add another resource", "Release to Students", "Withdraw", "Duplicate", "Move Up", "Move Down"]) assert.match(app, new RegExp(text));
  assert.match(app, /activityDirections\.releasedForStudents/);
  assert.match(app, /ACTIVITY_DIRECTIONS_STORAGE_KEY/);
  assert.match(css, /platform-activity-directions/);
  assert.equal(ACTIVITY_DIRECTIONS_STORAGE_KEY, "thinkamigbob.activity-directions.v1");
});
