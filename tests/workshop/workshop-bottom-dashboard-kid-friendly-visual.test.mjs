import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync(new URL("../../index.html",import.meta.url),"utf8");
const designPanel=source.slice(
  source.indexOf('<section id="workshopPanelBuild"'),
  source.indexOf('<section id="workshopPanelEdit"')
);
const moreToolsPanel=source.slice(
  source.indexOf('<section id="workshopPanelEdit"'),
  source.indexOf('<section id="workshopPanelPrecision"')
);
const themeStart=source.indexOf("/* Workshop unified Design dashboard:");
const themeEnd=source.indexOf("</style>",themeStart);
const theme=source.slice(themeStart,themeEnd);

const routes=[
  ["workshopTabBuild","workshopPanelBuild","build","Design"],
  ["workshopTabEdit","workshopPanelEdit","edit","More Tools"],
  ["workshopTabPrecision","workshopPanelPrecision","precision","Measure"],
  ["workshopTabPlanTrace","workshopPanelPlanTrace","plan-trace","Plan"],
  ["workshopTabArrange","workshopPanelArrange","arrange","Arrange"],
  ["workshopTabProject","workshopPanelProject","project","Project"],
  ["workshopTabThinkerBob","workshopPanelThinkerBob","thinker-bob","THINKer BOB"]
];

test("seven routes keep their IDs and behavior with student-facing labels", () => {
  assert.equal((source.match(/id="workshopTab[^" ]+"[^>]*role="tab"/g)||[]).length,7);
  assert.equal((source.match(/data-workshop-console-panel="[^"]+"/g)||[]).length,7);
  for(const [tabId,panelId,route,label] of routes){
    assert.match(
      source,
      new RegExp(`id="${tabId}"[^>]*aria-controls="${panelId}"[^>]*onclick="setWorkshopConsoleTab\\('${route}'\\)"[^>]*>${label.replace(" ","(?: |&amp;)")}</button>`)
    );
    assert.match(source,new RegExp(`id="${panelId}"[\\s\\S]*?data-workshop-console-panel="${route}"`));
  }
  assert.match(source,/id="workshopTabBuild"[^>]*aria-selected="true"/);
  assert.match(source,/setWorkshopConsoleTab\("build"\)/);
  assert.doesNotMatch(source,/setWorkshopConsoleTab\(['"]design['"]\)/);
});

test("Design combines Make Change and Fix without duplicating core controls", () => {
  assert.match(designPanel,/id="workshopBuildShapesLabel">Design tools</);
  assert.match(designPanel,/id="workshopDesignMakeLabel"[^>]*>Make</);
  assert.match(designPanel,/id="workshopDesignChangeLabel"[^>]*>Change</);
  assert.match(designPanel,/id="workshopDesignFixLabel"[^>]*>Fix</);

  const controls={
    workshopShapeCube:"chooseWorkshopBuildShape\\('cube'\\)",
    workshopShapeSphere:"chooseWorkshopBuildShape\\('sphere'\\)",
    workshopShapeWedge:"chooseWorkshopBuildShape\\('trianglePrism'\\)",
    workshopSelectButton:"startSelectMode\\(\\)",
    workshopMoveButton:"startMoveSelected\\(\\)",
    workshopCancelMoveButton:"cancelWorkshopMove",
    workshopRotateRightButton:"rotateWorkshopSelectionRight\\(\\)",
    workshopGrowButton:"resizeWorkshopSelection\\(1\\)",
    workshopShrinkButton:"resizeWorkshopSelection\\(-1\\)",
    workshopUndoButton:"undoLast\\(\\)",
    workshopRedoButton:"redoLast\\(\\)",
    workshopDeleteButton:"deleteWorkshopSelectedStructure\\(\\)"
  };
  for(const [id,handler] of Object.entries(controls)){
    assert.equal((source.match(new RegExp(`id="${id}"`,"g"))||[]).length,1,id);
    assert.match(designPanel,new RegExp(`id="${id}"[^>]*onclick="[^"]*${handler}`));
  }
  assert.match(designPanel,/id="workshopCancelMoveButton"[^>]*hidden disabled/);
});

test("Parts and Objects delegates to the Tool Chest owner", () => {
  assert.equal((source.match(/id="workshopPartsObjectsButton"/g)||[]).length,1);
  assert.match(
    designPanel,
    /id="workshopPartsObjectsButton"[^>]*onclick="toggleEngineeringToolChestDrawer\('parts-objects'\)"/
  );
  assert.match(source,/window\.toggleEngineeringToolChestDrawer=toggleEngineeringToolChestDrawer/);
});

test("future controls live only in the retained More Tools route", () => {
  assert.match(moreToolsPanel,/id="workshopEditToolsLabel">More tools</);
  for(const label of ["Cylinder","Cone","Pyramid","Custom Shape","Duplicate"]){
    assert.doesNotMatch(designPanel,new RegExp(`>${label}</button>`));
    assert.match(moreToolsPanel,new RegExp(`<button type="button" disabled>${label}</button>`));
  }
});

test("Quick Access and accessible dashboard language remain authoritative", () => {
  assert.match(source,/id="workshopDashboard"[^>]*aria-label="Workshop design tools, Advanced mode"/);
  assert.match(source,/id="workshopConsoleTabs"[^>]*aria-label="Workshop tool areas"/);
  assert.equal((source.match(/id="workshopQuick(?:Cube|Select|Undo|Delete|Screenshot|Help)"/g)||[]).length,6);
  assert.match(source,/"Workshop design tools, "[\s\S]*?"Advanced mode"/);
});

test("Builder-style theme preserves state and Chromebook geometry contracts", () => {
  assert.notEqual(themeStart,-1);
  assert.match(theme,/--workshop-dash-navy:#09263a/);
  assert.match(theme,/--workshop-dash-brass:#e3b83f/);
  assert.match(theme,/--workshop-dash-cyan:#7fefff/);
  assert.match(theme,/--workshop-dash-lime:#b9f548/);
  assert.match(theme,/--workshop-dash-coral:#ff806d/);
  assert.match(theme,/\.workshop-design-groups\{[\s\S]*?grid-template-columns:minmax\(285px,4fr\) minmax\(420px,6fr\) minmax\(220px,3fr\)/);
  assert.match(theme,/\.workshop-design-group-controls button\{[\s\S]*?min-height:44px/);
  assert.match(theme,/button\[aria-selected="true"\]/);
  assert.match(theme,/button\[aria-pressed="true"\]/);
  assert.match(theme,/button:disabled/);
  assert.match(theme,/#workshopDeleteButton[\s\S]*?#workshopQuickDelete/);
  assert.match(theme,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(theme,/transition:none/);
  assert.doesNotMatch(theme,/url\(|#buildBar|dashboard-ticker|dashboard-hood/);

  assert.match(source,/body\.workshopMode:not\(\.starterScreenActive\) #workshopDashboard\{\s*height:148px/);
  assert.match(source,/@media\(min-width:901px\) and \(max-width:1280px\)\{\s*body\.workshopMode:not\(\.starterScreenActive\) #workshopEngineeringDashboard\{\s*grid-template-columns:minmax\(360px,390px\) minmax\(0,1fr\)/);
  assert.match(source,/#workshopQuickAccessToolbar\{[\s\S]*?grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(source,/#workshopConsoleTabs\{[\s\S]*?grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
  assert.match(theme,/\.workshop-design-groups\{[\s\S]*?overflow:hidden/);
});
