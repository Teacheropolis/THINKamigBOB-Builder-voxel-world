import test from "node:test";
import assert from "node:assert/strict";
import { firstNameFromRosterLine, generateNameBobs, retryNameBob } from "../../platform/scripts/namebob-generator.mjs";

test("extracts first names from typed and common pasted roster lines", () => {
  assert.equal(firstNameFromRosterLine("Ava Smith"), "Ava");
  assert.equal(firstNameFromRosterLine("Smith, Liam"), "Liam");
  assert.equal(firstNameFromRosterLine("  Mia  "), "Mia");
});

test("generates editable memorable labels containing the first name and Bob", () => {
  const result = generateNameBobs("Ava\nLiam\nLily");
  assert.equal(result.labels.length, 3);
  assert.match(result.labels[0], /AvaBob/i);
  assert.match(result.labels[1], /LiamBob/i);
  assert.match(result.labels[2], /LilyBob/i);
  assert.equal(new Set(result.labels.map((label) => label.toLowerCase())).size, 3);
});

test("avoids labels used in earlier classes and resolves repeated first names", () => {
  const first = generateNameBobs("Ava").labels[0];
  const result = generateNameBobs("Ava\nAva", { usedLabels: [first] });
  assert.equal(result.labels.length, 2);
  assert.equal(result.labels.includes(first), false);
  assert.notEqual(result.labels[0].toLowerCase(), result.labels[1].toLowerCase());
});

test("retries one student's label without changing the rest of the class", () => {
  const original = generateNameBobs("Ava\nLiam\nMia").labels;
  const result = retryNameBob("Liam", original);
  assert.equal(result.ok, true);
  assert.equal(result.labels[0], original[0]);
  assert.notEqual(result.labels[1], original[1]);
  assert.match(result.labels[1], /LiamBob/i);
  assert.equal(result.labels[2], original[2]);
});

test("retry reports when the entered student is not in the generated list", () => {
  const original = generateNameBobs("Ava\nLiam").labels;
  const result = retryNameBob("Mia", original);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "student-not-found");
});
