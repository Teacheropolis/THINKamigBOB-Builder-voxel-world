import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const css = await readFile(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

test("teacher can save, schedule, and show a Do Now Post", () => {
  assert.match(app, /DO_NOW_POSTS_KEY/);
  assert.match(app, /At the beginning of every class/);
  assert.match(app, /data-action="show-do-now"/);
  assert.match(app, /scheduledDoNowForClass/);
  assert.match(app, /openClassroomPresentationWindow[\s\S]*showDoNow/);
});

test("Do Now supports rich text, images, and layered backgrounds", () => {
  for (const value of ["Text color", "Size", "Font", "backgroundType", "Paste an image here"]) assert.match(app, new RegExp(value));
  assert.match(app, /do-now-toggle-format/);
  assert.match(app, /linear-gradient/);
});

test("Do Now cards animate in two reading directions", () => {
  assert.match(css, /@keyframes do-now-fade/);
  assert.match(css, /@keyframes do-now-fade-side/);
  assert.match(css, /animation-delay:calc\(var\(--do-now-index\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Do Now posts can be copied, assigned to several classes, or shown without animation", () => {
  assert.match(app, /data-do-now-class/);
  assert.match(app, /data-action="copy-do-now"/);
  assert.match(app, /Choose at least one class/);
  assert.match(app, /No animation/);
  assert.match(css, /data-do-now-animation="none"/);
  assert.match(app, /option\[value="bottom-right"\]/);
  assert.match(app, /doNowDraft\.animation === "bottom-right"/);
});
