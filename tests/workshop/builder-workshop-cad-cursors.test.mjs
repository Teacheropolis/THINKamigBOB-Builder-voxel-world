import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../../index.html",import.meta.url),"utf8");
const cursorCss=source.match(/<style id="builderWorkshopCadCursorCSS">([\s\S]*?)<\/style>/)?.[1]??"";
test("Builder and Workshop interface chrome uses the regular cursor",()=>{
  assert.match(cursorCss,/body:not\(\.starterScreenActive\),\s*body:not\(\.starterScreenActive\) \*\{\s*cursor:default !important;/);
  assert.doesNotMatch(cursorCss,/precision-driver|thinkamigbob-precision-driver/i);
});

test("only the live renderer surface keeps the unchanged CAD crosshair",()=>{
  assert.match(cursorCss,/--builder-cad-crosshair-cursor:url\("data:image\/svg\+xml/);
  assert.match(cursorCss,/body:not\(\.starterScreenActive\) > canvas:not\(#viewCubeCanvas\)\{\s*cursor:var\(--builder-cad-crosshair-cursor\) !important;/);
  assert.doesNotMatch(cursorCss,/#viewCubeCanvas\{[^}]*builder-cad-crosshair-cursor/);
});

test("View Cube preserves grab and starter page remains unaffected",()=>{
  assert.match(cursorCss,/#viewCubeCanvas\{\s*cursor:grab !important;/);
  assert.match(cursorCss,/#viewCubeCanvas:active\{\s*cursor:grabbing !important;/);
  assert.doesNotMatch(cursorCss,/body\.starterScreenActive[^\n{]*\{/);
});

test("enabled interface controls consistently use the hand pointer",()=>{
  assert.match(cursorCss,/button:not\(:disabled\)[\s\S]*?\[role="button"\]:not\(\[aria-disabled="true"\]\)[\s\S]*?cursor:pointer !important;/);
  assert.match(cursorCss,/input:is\(\[type="button"\],\[type="submit"\],\[type="reset"\],\[type="checkbox"\],\[type="radio"\],\[type="range"\]\):not\(:disabled\)/);
  assert.match(cursorCss,/button:disabled[\s\S]*?\[aria-disabled="true"\][\s\S]*?cursor:not-allowed !important;/);
  assert.ok(
    cursorCss.indexOf("cursor:pointer !important")>cursorCss.indexOf("cursor:default !important"),
    "the actionable-control exception must follow the broad interface cursor rule"
  );
});

test("Gear progress remains a reward icon rather than cursor artwork",()=>{
  assert.match(source,/builderGearProgressIcon[^>]*aria-hidden="true">⚙<\/span>/);
  assert.doesNotMatch(cursorCss,/goldGear|gear-cursor/i);
});
