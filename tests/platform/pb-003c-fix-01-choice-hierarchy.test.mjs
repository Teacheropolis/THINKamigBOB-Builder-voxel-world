import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
const stemWorkStart = appSource.indexOf('<section class="platform-stem-work"');
const stemWorkEnd = appSource.indexOf('`, { title: "Student Home"', stemWorkStart);
const stemWorkSource = appSource.slice(stemWorkStart, stemWorkEnd);

test("student choice hierarchy places current work before future and supporting areas", () => {
  const positions = [
    "Continue Current Work",
    "Choose a Future Path",
    "Recent Work",
    "Previous Work",
    "Evidence Connections",
  ].map((label) => stemWorkSource.indexOf(label));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("approved student-facing empty-state language is exact", () => {
  for (const message of [
    "You do not have current work to continue yet.",
    "When a project is ready, you can return to it here.",
    "Available mission choices will appear in Mission Choice.",
    "Your recent engineering work will appear here when it is available.",
    "Your earlier engineering work will appear here when it is available.",
    "Evidence cannot be checked right now.",
  ]) assert.ok(stemWorkSource.includes(message), `expected ${message}`);
});

test("choice guidance adds no unavailable action or project data", () => {
  assert.doesNotMatch(stemWorkSource, /<button|<a\s|href=|data-action=|data-form=|navigate\(/);
  assert.doesNotMatch(stemWorkSource, /platform-project-card["\s]/);
  assert.doesNotMatch(stemWorkSource, /data-project|projectId|last (?:saved|opened)|data-progress|progressPercent/i);
});

test("visual priority is namespaced and ordered without interactive styling", () => {
  assert.match(cssSource, /\.platform-stem-work-current \{[^}]*border:[^}]*border-top-width:\s*7px[^}]*box-shadow:/);
  assert.match(cssSource, /\.platform-stem-work-future-path \{[^}]*border-top:\s*5px/);
  assert.doesNotMatch(cssSource, /\.platform-stem-work-(?:current|future-path)[^{]*\{[^}]*cursor:\s*pointer/);
});

test("protected Mission Choice foundation remains present", () => {
  for (const label of ["Continue first", "Available Missions", "Side Paths", "Coming Later"]) {
    assert.ok(appSource.includes(label), `expected ${label}`);
  }
});
