import test from "node:test";
import assert from "node:assert/strict";
import { firstNameFromRosterLine, generateNameBobLimerick, generateNameBobs, retryNameBob } from "../../platform/scripts/namebob-generator.mjs";

test("extracts first names from typed and common pasted roster lines", () => {
  assert.equal(firstNameFromRosterLine("Ava Smith"), "Ava");
  assert.equal(firstNameFromRosterLine("Smith, Liam"), "Liam");
  assert.equal(firstNameFromRosterLine("  Mia  "), "Mia");
});

test("generates editable labels using the first name and a funny Bob last name", () => {
  const result = generateNameBobs("Ava\nLiam\nLily");
  assert.equal(result.labels.length, 3);
  assert.match(result.labels[0], /^Ava Bob/i);
  assert.match(result.labels[1], /^Liam Bob/i);
  assert.match(result.labels[2], /^Lily Bob/i);
  assert.equal(new Set(result.labels.map((label) => label.toLowerCase())).size, 3);
});

test("varies the funny Bob last names across a class", () => {
  const names = ["Ava", "Liam", "Mia", "Noah", "Lily", "Riley", "Emma", "Mason", "Ella", "Logan", "Olivia", "Ethan", "Lucas", "Sofia", "Henry", "Aria", "Jack", "Nora", "Leo", "Ruby", "Owen", "Ivy", "Ezra", "Luna", "Theo", "Maya", "Finn", "Zoe", "Eli", "Isla"];
  const labels = generateNameBobs(names).labels;
  assert.equal(labels.every((label) => /bob/i.test(label)), true);
  const forms = labels.map((label) => label.split(/\s+/).at(-1).toLowerCase());
  assert.ok(new Set(forms).size >= 10);
});

test("avoids labels used in earlier classes and resolves repeated first names", () => {
  const first = generateNameBobs("Ava").labels[0];
  const result = generateNameBobs("Ava\nAva", { usedLabels: [first] });
  assert.equal(result.labels.length, 2);
  assert.equal(result.labels.includes(first), false);
  assert.notEqual(result.labels[0].toLowerCase(), result.labels[1].toLowerCase());
});

test("uses a different Bob last name for every student in a class", () => {
  const result = generateNameBobs("Lily\nRiley\nAvery\nLucy\nMolly\nEmily");
  const lastNames = result.labels.map((label) => label.split(/\s+/).at(-1).toLowerCase());
  assert.equal(new Set(lastNames).size, result.labels.length);
});

test("retries one student's label without changing the rest of the class", () => {
  const original = generateNameBobs("Ava\nLiam\nMia").labels;
  const result = retryNameBob("Liam", original);
  assert.equal(result.ok, true);
  assert.equal(result.labels[0], original[0]);
  assert.notEqual(result.labels[1], original[1]);
  assert.match(result.labels[1], /Liam/i);
  assert.match(result.labels[1], /Bob/i);
  assert.equal(result.labels[2], original[2]);
  const lastNames = result.labels.map((label) => label.split(/\s+/).at(-1).toLowerCase());
  assert.equal(new Set(lastNames).size, result.labels.length);
});

test("creates a five-line funny limerick from a first name or complete Bob name", () => {
  const labels = generateNameBobs("Ava\nLiam").labels;
  const byFirstName = generateNameBobLimerick("Ava", labels);
  const byBobName = generateNameBobLimerick(labels[1], labels);
  assert.equal(byFirstName.ok, true);
  assert.equal(byBobName.ok, true);
  assert.match(byFirstName.limerick, new RegExp(labels[0], "i"));
  assert.equal(byFirstName.limerick.split("\n").length, 5);
  assert.match(byBobName.limerick, new RegExp(labels[1], "i"));
});

test("limerick reports when the student is not in the generated list", () => {
  const labels = generateNameBobs("Ava\nLiam").labels;
  const result = generateNameBobLimerick("Mia", labels);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "student-not-found");
});

test("retry reports when the entered student is not in the generated list", () => {
  const original = generateNameBobs("Ava\nLiam").labels;
  const result = retryNameBob("Mia", original);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "student-not-found");
});
