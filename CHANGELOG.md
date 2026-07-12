# CHANGELOG

# Update #103 – Engineering Console Dashboard

Status: Complete

Changes:
- Replaced flat dashboard with brushed gunmetal engineering console.
- Added thick metallic gold outer frame.
- Redesigned Return to Missions as engraved brushed-gold navigation button.
- Converted utility buttons to brushed silver.
- Converted build controls to colored metallic buttons.
- Updated dashboard styling to industrial engineering theme.
- Preserved all Builder functionality.

## Update #102B – Add Cube, Sphere, and Triangle Shapes

Date: July 2026

Status: Complete ✅

Added:
- Cube building
- Sphere building
- Triangle building
- Shape selector integrated into the Builder

Notes:
- Existing Builder layout preserved.
- Mission system unchanged.
- Dashboard, robot animation, voice reader, engineering grid, and gameplay preserved.

## Update #102B – Add Cube, Sphere, and Triangle Shapes

Status: Complete ✅

### Added
- Cube building support
- Sphere building support
- Triangle building support
- Shape selection integrated into the Builder

### Preserved
- Existing Builder layout
- Mission system
- Robot animation
- Dashboard
- Engineering grid
- Toolbox
- Passport
- Voice reader
- Camera controls
- Mission-generated objects
- Existing event listeners

### Result
Students can now build using three basic geometric shapes instead of cubes alone, providing a stronger foundation for engineering, mathematics, and creative design activities.

## Update #101.2C — Increase Grass Engineering Grid Contrast

Completed:
- Increased engineering grid visibility on grass missions.
- Preserved existing grid alignment.
- Preserved cube placement and snapping.
- Preserved Grid On/Off toggle.
- No gameplay or performance changes.

## Update #101B — Add Engineering Build Grid

### Changes
- Added a persistent engineering grid across the full 50 × 50 build surface.
- Added minor grid lines every 1 world unit.
- Added brighter major grid lines every 5 world units.
- Aligned the grid to block-placement coordinates.
- Positioned the grid slightly above the ground to avoid flicker.
- Kept the grid non-interactive and excluded from raycasting.
- Prevented duplicate grid creation after Reset World.

### Verification
- Tested across grass, gray, dark, moon, and white mission grounds.
- Confirmed block placement, removal, move mode, and reset remain unchanged.
- Confirmed no duplicate grid or noticeable performance issue.


## Update #101A — Inspect Build Area for Engineering Grid

### Type
Diagnostic inspection only — no code changes.

### Findings
- Confirmed the active build surface is the `ground` mesh.
- Confirmed the ground is a 50 × 1 × 50 box positioned at `y = -1`.
- Confirmed the visible ground and block-placement raycasting surface are the same object.
- Confirmed block placement snaps to one-unit coordinates.
- Found no active Three.js engineering grid.
- Identified the empty `buildStarterGrid()` function as the safest insertion point.
- Recommended a lightweight custom `THREE.LineSegments` grid with minor lines every 1 unit and major lines every 5 units.
- Recommended placing the grid approximately 0.015 units above the ground.
- Confirmed the grid can be non-interactive and should have negligible Chromebook performance impact.

### Status
Inspection complete. Awaiting Update #101B implementation and testing.

## Update #100.3B — Apply Final Mission HUD Style Immediately

### Changes
- Applied the approved Mission HUD cyan bottom glow immediately when the active HUD appears.
- Removed the visible dependency on the delayed `builderTitleCompactActive` state.
- Preserved the existing HUD design, placement, dimensions, mission text, and timing.
- Made no JavaScript or gameplay changes.

### Verification
- Tested multiple missions in Chrome using Live Server.
- Confirmed that the HUD appears immediately in its complete final style.
- Confirmed that no delayed style change remains.

## Update #100.3A — Diagnose Delayed Mission HUD Style Change

### Type
Diagnostic inspection only — no code changes.

### Findings
- Confirmed that `#worldTitle` is the single active Selected Mission HUD.
- Confirmed that the main blue HUD panel appears immediately in its correct style.
- Identified a legacy `#worldTitle::after` rule that adds the cyan bottom glow only after the body receives the `builderTitleCompactActive` class.
- Confirmed that delayed legacy Builder title JavaScript adds `builderTitleCompactActive` after a timer or title-state change.
- Determined that the delayed visual change is not caused by mission text, the popup, image loading, or a delayed stylesheet.
- Recommended a CSS-only final override that applies the approved cyan glow immediately and removes its dependency on the delayed compact-title class.

### Status
Diagnosis complete. Awaiting Update #100.3B implementation and testing.



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

## Update #100.3A — Diagnose Delayed Mission HUD Style Change

### Type
Diagnostic inspection only — no code changes.

### Findings
- Confirmed that `#worldTitle` is the single active Selected Mission HUD.
- Confirmed that the main blue HUD panel appears immediately in its correct style.
- Identified a legacy `#worldTitle::after` rule that adds the cyan bottom glow only after the body receives the `builderTitleCompactActive` class.
- Confirmed that delayed legacy Builder title JavaScript adds `builderTitleCompactActive` after a timer or title-state change.
- Determined that the delayed visual change is not caused by mission text, the popup, image loading, or a delayed stylesheet.
- Recommended a CSS-only final override that applies the approved cyan glow immediately and removes its dependency on the delayed compact-title class.

### Status
Diagnosis complete. Awaiting Update #100.3B implementation and testing.