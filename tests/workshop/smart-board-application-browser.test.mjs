import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("empty Smart Board screen is connected to the application render bridge", () => {
  assert.match(source, /<div id="engineeringSmartBoardScreen" data-board-application="none" aria-hidden="true"><\/div>/);
  assert.match(source, /import\("\.\/js\/workshop\/smartboard\/smart-board-application-view\.mjs"\)/);
  assert.match(source, /createSmartBoardApplicationView\(\{[\s\S]*?screen:document\.getElementById\("engineeringSmartBoardScreen"\)/);
  assert.match(source, /activateSmartBoardApplication:function\(transition\)\{[\s\S]*?workshopSmartBoardApplicationView\.activate\(transition\)/);
  assert.match(source, /clearSmartBoardApplication:function\(transition\)\{[\s\S]*?workshopSmartBoardApplicationView\.clear\(transition\)/);
});

test("Measurement Assistant remains separate and unchanged by the empty application layer", () => {
  assert.equal((source.match(/id="workshopMeasurementAssistant"/g) || []).length, 1);
  assert.match(source, /<aside id="workshopRightPanelShell"[\s\S]*?<section id="workshopMeasurementAssistant"/);
  const screen = source.match(/<div id="engineeringSmartBoardScreen"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(screen);
  assert.equal(screen[1], "");
});
