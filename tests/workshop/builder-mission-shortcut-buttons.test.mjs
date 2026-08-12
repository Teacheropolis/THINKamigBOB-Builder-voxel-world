import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=readFileSync(new URL("../../index.html",import.meta.url),"utf8");

test("Builder reuses the Workshop THINKamigBOB title above its mission challenge",()=>{
  assert.match(source,/<div id="info">[\s\S]*?<img id="builderMissionLogo" src="assets\/images\/workshop\/thinkamigbob-polished-transparent\.png" alt="THINKamigBOB"\/>[\s\S]*?<h2>Current Mission<\/h2>/);
  assert.match(source,/:not\(\.workshopMode\) #builderMissionLogo\{[\s\S]*width:186px;[\s\S]*max-width:186px;[\s\S]*height:62px;[\s\S]*margin:0 0 3px;[\s\S]*object-position:left center;[\s\S]*pointer-events:none/);
  assert.match(source,/:not\(\.workshopMode\) #viewCubeBox\{[\s\S]*top:-14px !important;/);
  assert.match(source,/:not\(\.workshopMode\) #viewCubeCanvas\{[\s\S]*width:128px !important;[\s\S]*height:128px !important;/);
  assert.match(source,/@media\(max-height:700px\)\{[\s\S]*:not\(\.workshopMode\) #viewCubeCanvas\{[\s\S]*width:96px !important;[\s\S]*height:96px !important;/);
  assert.match(source,/:not\(\.workshopMode\) #info\{[\s\S]*top:-22px !important;/);
  assert.match(source,/:not\(\.workshopMode\) #rightHudColumn\{[\s\S]*top:18px !important;/);
});

test("Workshop branding matches the Builder top-left placement without covering its controls",()=>{
  assert.match(source,/body\.workshopMode:not\(\.starterScreenActive\) #workshopLogo\{[\s\S]*?top:18px;[\s\S]*?left:18px;/);
  assert.match(source,/body\.workshopMode:not\(\.starterScreenActive\) #viewCubeBox\{[\s\S]*?top:75px !important;[\s\S]*?left:8px !important;/);
});

test("Builder presents larger Badges and Passport shortcuts above Help",()=>{
  assert.match(source,/id="builderMissionActions"[\s\S]*id="badgeMessage"[\s\S]*id="openPassportFromBadge"/);
  assert.match(source,/#builderMissionActions\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(source,/#builderMissionActions > button\{[\s\S]*height:46px !important;[\s\S]*min-height:44px !important;/);
  assert.match(source,/badgeMessage"\)\.innerHTML\s*=\s*"<b>OPEN<br>BADGES<\/b>"/);
  assert.match(source,/if\(el\.tagName !== 'BUTTON'\)\{[\s\S]*el\.onkeydown/);
});

test("Help keeps one slot and Open Workshop fills the remaining two slots",()=>{
  assert.match(source,/var target=mode==="workshop" \? controlStation : missionPanel/);
  assert.match(source,/\.observe\(document\.body,[\s\S]*?placeUtilityRail\(currentWorkspaceMode\);\s*updateModeControls\(\);/);
  assert.match(source,/:not\(\.workshopMode\) #info #workspaceUtilityRail\{[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(0,2fr\)/);
  assert.match(source,/:not\(\.workshopMode\) #info #workspaceUtilityRail #helpButton\{[\s\S]*height:46px !important;[\s\S]*min-height:44px !important;/);
  assert.match(source,/:not\(\.workshopMode\) #info #workspaceModeSwitch\{[\s\S]*width:100%;[\s\S]*height:46px;[\s\S]*builder-shortcut-grid-frame-glow\.png/);
});
