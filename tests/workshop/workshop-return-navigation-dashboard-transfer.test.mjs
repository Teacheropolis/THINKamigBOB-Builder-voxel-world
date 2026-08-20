import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=readFileSync(new URL("../../index.html",import.meta.url),"utf8");

test("Make Cube remains the sole student-facing Workshop Cube control",()=>{
  assert.equal((source.match(/id="workshopShapeCube"/g)||[]).length,1);
  assert.match(source,/id="workshopShapeCube"[^>]*data-workshop-shape="cube"[^>]*onclick="chooseWorkshopBuildShape\('cube'\)"/);
  assert.doesNotMatch(source,/id="workshopQuickCube"/);
  assert.doesNotMatch(source,/getElementById\("workshopQuickCube"\)/);
});

test("the existing mode switch moves into the former first Quick Access slot",()=>{
  assert.equal((source.match(/id="workspaceModeSwitch"/g)||[]).length,1);
  assert.match(source,/var quickToolbar=document\.getElementById\("workshopQuickAccessToolbar"\)/);
  assert.match(source,/quickToolbar\.insertBefore\(modeSwitch,quickToolbar\.firstElementChild\)/);
  assert.match(source,/switcher\.removeAttribute\("onclick"\)[\s\S]*switcher\.addEventListener\("click"[\s\S]*setWorkspaceMode/);
  assert.match(source,/window\.returnToMission=function\(\)\{ return setWorkspaceMode\("mission"\); \}/);
});

test("Return to Mission keeps native input and canonical shutdown ownership",()=>{
  assert.match(source,/id="workspaceModeSwitch" type="button"/);
  assert.match(source,/requestedMode==="mission" && workshopCanonicalState==="SHUTTING_DOWN"\)[\s\S]*return true/);
  assert.match(source,/action:"REQUEST_POWER_OFF"/);
  assert.match(source,/stopBuilderClickThrough\(workshopDashboard\)/);
  assert.doesNotMatch(source,/workspaceModeSwitch[\s\S]{0,500}addEventListener\("keydown"/);
});

test("Workshop project controls retain equal 48px Chromebook allocation",()=>{
  assert.match(source,/#workspaceUtilityRail\{[\s\S]*grid-template-columns:repeat\(2,minmax\(44px,1fr\)\);[\s\S]*grid-template-rows:48px/);
  assert.match(source,/\.workshopUtilityProjectButton\{[\s\S]*height:48px;[\s\S]*min-height:48px/);
  assert.match(source,/#workshopUtilitySave\{[\s\S]*grid-column:1/);
  assert.match(source,/#workshopUtilityOpen\{[\s\S]*grid-column:2/);
});

test("Workshop Return presentation belongs to Quick Access and remains 44px",()=>{
  assert.match(source,/#workshopQuickAccessToolbar button,[\s\S]*?#workshopConsoleTabs button\{[\s\S]*height:44px;[\s\S]*min-height:44px/);
  assert.match(source,/#workshopQuickAccessToolbar\{[\s\S]*grid-template-columns:minmax\(82px,1\.45fr\) repeat\(5,minmax\(44px,1fr\)\);[\s\S]*gap:2px/);
  assert.match(source,/#workshopQuickAccessToolbar #workspaceModeSwitch\{[\s\S]*width:100%;[\s\S]*height:44px;[\s\S]*border-image-source:var\(--workshop-builder-face\);[\s\S]*background:linear-gradient\(180deg,var\(--workshop-view-highlight\),var\(--workshop-view-base\) 42%,var\(--workshop-view-shadow\)\)/);
  assert.match(source,/#workshopQuickAccessToolbar #workspaceModeSwitch\[aria-pressed="true"\] \.workspaceModeLabel/);
  assert.match(source,/#workshopQuickAccessToolbar #workspaceModeSwitch\[aria-pressed="true"\] \.workspaceModeLabel\{[\s\S]*flex-direction:column;[\s\S]*gap:1px/);
  assert.match(source,/#workshopQuickAccessToolbar #workspaceModeSwitch\[aria-pressed="true"\] \.workspaceModeReturnLine\{[\s\S]*font:900 8px/);
  assert.match(source,/#workshopQuickAccessToolbar #workspaceModeSwitch\[aria-pressed="true"\] \.workspaceModeMissionLine\{[\s\S]*font:900 8px/);
  assert.match(source,/#workspaceModeSwitch\[aria-pressed="true"\] \.workspaceModeReturnWords\{[\s\S]*color:#bff7ff;[\s\S]*text-shadow:none/);
  assert.match(source,/#workspaceModeSwitch\[aria-pressed="true"\] \.workspaceModeMissionLine\{[\s\S]*color:#effeff;[\s\S]*text-shadow:none/);
});
