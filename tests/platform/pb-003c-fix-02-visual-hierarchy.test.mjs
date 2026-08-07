import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
const stemWorkStart = appSource.indexOf('<section class="platform-stem-work"');
const stemWorkEnd = appSource.indexOf('`, { title: "Student Home"', stemWorkStart);
const stemWorkSource = appSource.slice(stemWorkStart, stemWorkEnd);

test("approved categories follow the required student reading order", () => {
  const labels = [
    "Continue Current Work",
    "Choose a Future Path",
    "Look Back at Your Work",
    "Recent Work",
    "Previous Work",
    "Evidence Connections",
  ];
  const positions = labels.map((label) => stemWorkSource.indexOf(label));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  for (const label of labels) {
    assert.equal((stemWorkSource.match(new RegExp(label, "g")) ?? []).length, 1);
  }
});

test("work history semantically groups Recent and Previous Work", () => {
  assert.match(stemWorkSource,
    /<section class="platform-stem-work-history" aria-labelledby="work-history-title">/);
  assert.match(stemWorkSource, /<h3 id="work-history-title">Look Back at Your Work<\/h3>/);
  assert.match(stemWorkSource, /<h4 id="recent-work-title">Recent Work<\/h4>/);
  assert.match(stemWorkSource, /<h4 id="previous-work-title">Previous Work<\/h4>/);
});

test("FIX-01 empty-state meanings remain unchanged", () => {
  for (const message of [
    "You do not have current work to continue yet.",
    "When a project is ready, you can return to it here.",
    "Available mission choices will appear in Mission Choice.",
    "Your recent engineering work will appear here when it is available.",
    "Your earlier engineering work will appear here when it is available.",
    "Evidence cannot be checked right now.",
  ]) assert.ok(stemWorkSource.includes(message), `expected ${message}`);
});

test("visual categories use namespaced, progressively quieter treatments", () => {
  assert.match(cssSource, /\.platform-stem-work-current \{[^}]*border-top-width:\s*7px[^}]*box-shadow:/);
  assert.match(cssSource, /\.platform-stem-work-future-path \{[^}]*border-top:\s*5px/);
  assert.match(cssSource, /\.platform-stem-work-recent, \.platform-stem-work-previous \{[^}]*border-top:\s*3px[^}]*box-shadow:\s*none/);
  assert.match(cssSource, /\.platform-evidence-connections \{[^}]*border-style:\s*dashed[^}]*box-shadow:\s*none/);
});

test("responsive history layout collapses without a card rail", () => {
  assert.match(cssSource,
    /@media \(max-width: 520px\)[\s\S]*\.platform-stem-work-layout, \.platform-stem-work-history-layout, \.platform-evidence-source-list \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(cssSource,
    /\.platform-stem-work-(?:history|history-layout|current|future-path)[^{]*\{[^}]*overflow-x:\s*(?:auto|scroll)|carousel|scroll-snap/i);
});

test("visual refinement adds no controls, data, routes, storage, or integrations", () => {
  assert.doesNotMatch(stemWorkSource, /<button|<a\s|href=|data-action=|data-form=|navigate\(/);
  assert.doesNotMatch(stemWorkSource, /data-project|projectId|sessionStorage|localStorage|fetch\s*\(/);
  assert.doesNotMatch(stemWorkSource, /platform-project-card["\s]/);
});

