import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const approvedPath = "assets/images/workshop/production/engineering-smart-board/engineering-smart-board-production-v2-extended.png";

test("mounts one approved noninteractive Smart Board hardware foundation", () => {
  assert.equal(source.split(approvedPath).length - 1, 1);
  assert.match(source, /<div id="engineeringSmartBoard"[^>]*data-board-mechanical="retracted"[^>]*data-board-power="powered-off"[^>]*aria-hidden="true">/);
  assert.match(source, /<img id="engineeringSmartBoardHardware"[^>]*alt=""[^>]*aria-hidden="true"[^>]*draggable="false"/);
  assert.doesNotMatch(source, /engineering-smart-board-production-v1-retracted\.png/);
  assert.doesNotMatch(source, /engineering-smart-board-production-v4-measurement-assistant\.png/);
});

test("keeps the empty application surface separate from decorative hardware", () => {
  const screen = source.match(/<div id="engineeringSmartBoardScreen" data-board-application="none" aria-hidden="true">([\s\S]*?)<\/div>/);
  assert.ok(screen);
  assert.equal(screen[1], "");
  assert.match(source, /#engineeringSmartBoardScreen\{[\s\S]*?background:transparent;[\s\S]*?pointer-events:none;/);
});

test("declares deterministic endpoints without claiming a real lifecycle", () => {
  assert.match(source, /#engineeringSmartBoardCabinet\{[\s\S]*?transform:translateX\(var\(--smart-board-retracted-x\)\);[\s\S]*?transition:none;/);
  assert.match(source, /data-board-mechanical="extended"[^}]*transform:translateX\(var\(--smart-board-extended-x\)\)/);
  assert.match(source, /return workshopStartupTestDouble\.activateSmartBoard\(transition\)/);
  assert.match(source, /return workshopShutdownTestDouble\.retractSmartBoard\(transition\)/);
});

test("wires responsive registration while preserving pointer and focus isolation", () => {
  assert.match(source, /import\("\.\/js\/workshop\/smartboard\/responsive-smart-board-registration\.mjs"\)/);
  assert.match(source, /registerResponsiveSmartBoard\(\{[\s\S]*?stage:document\.getElementById\("workshopViewportStage"\)[\s\S]*?mount:document\.getElementById\("engineeringSmartBoard"\)/);
  assert.match(source, /#engineeringSmartBoard\{[\s\S]*?pointer-events:none;[\s\S]*?user-select:none;/);
  assert.doesNotMatch(source, /engineeringSmartBoard(?:Hardware|Screen)?\.addEventListener/);
});
