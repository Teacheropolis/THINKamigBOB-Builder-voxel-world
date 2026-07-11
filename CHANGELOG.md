# CHANGELOG

## Update 58 — Builder Refactor Setup
- Added README.md
- Added BRANDING.md
- Added CHANGELOG.md
- Organized project folder
- Prepared Builder for cleaner future updates

## Update 58 — Start Page Cleanup
- Update_58_BuilderRefactor_Baseline

## Update #96.7 — VERIFIED

Status: VERIFIED

Completed:
- Removed duplicate Builder header systems.
- Restored single Builder robot.
- Restored single Builder sign.
- Eliminated mission title flash.
- Stabilized Selected Mission HUD.
- Established verified Builder header layout.

Backup:
Update #96.7 VERIFIED

Notes:
Robot position is acceptable. Minor cosmetic adjustment (5–10 px lower) may be done later during polish.

## Update #97 — Builder Header Polish
Status: VERIFIED ✅

Changes:
- Lowered Builder robot approximately 6–8 px.
- Robot now rests naturally on the Builder sign.
- Preserved Builder sign, mission HUD, gameplay, and JavaScript.
- No regressions found during verification.

Backup:
index-update97-verified.html

Update 98.4
Status: PASS (timing)

• Removed delayed Selected Mission HUD reveal.
• Robot now appears immediately.
• Sign now appears immediately.
• Selected Mission HUD now appears immediately after popup closes.
• Remaining issue: HUD sits slightly too high and overlaps the popup area.
• Next update will adjust HUD vertical spacing only.

## Update #98.4 — Immediate Selected Mission HUD
Status: VERIFIED ✅

- Added a CSS-only override for the active Selected Mission HUD.
- Removed the delayed HUD reveal after the mission popup closes.
- Preserved mission launch, popup behavior, robot, sign, and gameplay.
- Mission HUD remains dynamic and stable.