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

Update #99.1 (Diagnostic)
Identified delayed legacy title-state CSS affecting #gameLogo. No code changes made.

Update #99.3 (Diagnostic)
Identified competing CSS rules causing the Selected Mission HUD to shift downward after legacy Builder title-state classes expire. No code changes made.

## Update #99.4 — Stable Builder Header and Mission HUD
Status: VERIFIED ✅

- Froze the Builder robot and sign in the approved centered position.
- Froze the Selected Mission HUD at its approved vertical position.
- Prevented delayed horizontal and vertical movement caused by legacy title-state CSS.
- Preserved immediate HUD visibility, dynamic mission titles, mission launch, popup behavior, and gameplay.

## Update #100.1 — Remove Obsolete PNG Builder Title Sequence

Status: PASS

Changes:
- Removed the legacy PNG Builder title introduction sequence.
- Preserved the active Builder header (#gameLogo, #builderHeaderRobot, #builderHeaderSign).
- Preserved the active Selected Mission HUD (#worldTitle).
- Preserved immediate mission HUD visibility.
- Preserved dynamic mission title updates.
- Mission launch and popup behavior remain functional.

Verification:
- One robot displayed.
- One Builder sign displayed.
- One Selected Mission HUD displayed.
- Mission titles remain dynamic.
- No regression observed after removal.

Remaining Issue:
- The Selected Mission HUD changes appearance slightly after approximately 20–30 seconds, even though its position remains fixed.
- Robot and Builder sign remain stable.
- This appears to be caused by a delayed legacy CSS state overriding HUD styling rather than movement.

Next Step:
- Update #99.5 Diagnostic — Trace delayed mission HUD style change.

## Update #100.2 — Mission HUD Appearance Diagnostic

Status: COMPLETE

Changes:
- Diagnosed delayed visual change affecting #worldTitle.
- Confirmed HUD position remains stable.
- Determined delayed appearance is caused by legacy builderTitleCompactActive CSS.
- Verified robot and Builder sign remain fixed.
- Determined JavaScript is no longer causing movement.
- Recommended one final CSS appearance freeze before removing remaining legacy Builder title CSS.
  

  

### Known Issues

- Selected Mission HUD remains in the correct position but changes visual styling after approximately 20–30 seconds.
- Suspected cause: delayed legacy CSS class or higher-specificity selector overriding the HUD appearance.
- Gameplay, mission launch, robot, and Builder sign are stable.