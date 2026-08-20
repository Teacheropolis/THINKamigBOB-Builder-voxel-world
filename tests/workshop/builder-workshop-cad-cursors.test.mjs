import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const cursorCss = source.match(
  /<style id="builderWorkshopCadCursorCSS">([\s\S]*?)<\/style>/
)?.[1] ?? "";

const gearCursorDeclaration = cursorCss.match(
  /--builder-tools-gold-gear-cursor:url\("(data:image\/svg\+xml[^";]+)"\) 16 16,default;/
)?.[0] ?? "";

test("Builder and Workshop chrome use the eight-tooth Gold Gear cursor", () => {
  assert.match(cursorCss, /--builder-tools-gold-gear-cursor:url\("data:image\/svg\+xml/);
  assert.match(gearCursorDeclaration, /id='goldGear8Teeth'/);
  assert.equal((gearCursorDeclaration.match(/%3Crect/g) ?? []).length, 8);
  assert.match(gearCursorDeclaration, /fill='%23d9a326' stroke='%23072535'/);
  assert.match(gearCursorDeclaration, /stroke-linejoin='miter'/);
  assert.doesNotMatch(gearCursorDeclaration, /\brx='/);
  assert.doesNotMatch(cursorCss, /builder-tools-nut-cursor/);
  assert.match(
    cursorCss,
    /body:not\(\.starterScreenActive\),\s*body:not\(\.starterScreenActive\) \*\{\s*cursor:var\(--builder-tools-gold-gear-cursor\) !important;/
  );
});

test("Gold Gear uses an aqua edge highlight, dark center hole, and no green", () => {
  assert.match(gearCursorDeclaration, /id='aquaEdgeHighlight'[^>]+stroke='%235eeaff'/);
  assert.match(gearCursorDeclaration, /id='darkCenterHole'[^>]+fill='%23192834' stroke='%23072535'/);
  assert.doesNotMatch(gearCursorDeclaration, /%2300(?:80|ff)00|%23228b22|%2332cd32|%237cfc00/i);
});

test("Gold Gear cursor uses the visual center as its hotspot", () => {
  assert.match(
    cursorCss,
    /--builder-tools-gold-gear-cursor:url\("data:image\/svg\+xml[^;]+\) 16 16,default;/
  );
  assert.doesNotMatch(gearCursorDeclaration, /r='(?:0|1|2)(?:\.[0-9]+)?'/);
});

test("only the live Builder and Workshop renderer surface uses the CAD crosshair", () => {
  assert.match(cursorCss, /--builder-cad-crosshair-cursor:url\("data:image\/svg\+xml/);
  assert.match(
    cursorCss,
    /body:not\(\.starterScreenActive\) > canvas:not\(#viewCubeCanvas\)\{\s*cursor:var\(--builder-cad-crosshair-cursor\) !important;/
  );
  assert.doesNotMatch(cursorCss, /#viewCubeCanvas\{[^}]*builder-cad-crosshair-cursor/);
});

test("View Cube preserves its existing grab cursor outside Gold Gear ownership", () => {
  assert.match(
    cursorCss,
    /body:not\(\.starterScreenActive\) #viewCubeCanvas\{\s*cursor:grab !important;/
  );
  assert.match(
    cursorCss,
    /body:not\(\.starterScreenActive\) #viewCubeCanvas:active\{\s*cursor:grabbing !important;/
  );
  assert.doesNotMatch(cursorCss, /#viewCubeCanvas\{[^}]*builder-tools-gold-gear-cursor/);
});

test("cursor styling remains inactive on the starter page", () => {
  assert.doesNotMatch(cursorCss, /body\.starterScreenActive[^\n{]*\{/);
});
