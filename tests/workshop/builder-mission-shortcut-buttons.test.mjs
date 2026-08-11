import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=readFileSync(new URL("../../index.html",import.meta.url),"utf8");

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
