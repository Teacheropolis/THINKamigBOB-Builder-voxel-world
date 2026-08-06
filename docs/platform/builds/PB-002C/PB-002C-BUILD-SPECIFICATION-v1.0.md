# PB-002C — Timer Adjustment

## Build Specification v1.0

Status: Approved specification
Parent Build: PB-002 — Teacher Classroom Command Center
Protected Baseline: PB-002B — Lesson Timer / `v0.3.0`

## Purpose

Add a small teacher-controlled adjustment capability to the existing Lesson Timer without expanding the timer into lesson stages, tracking, analytics, or automation.

The timer remains a classroom awareness tool. PB-002C changes only the current remaining classroom time.

## Objective

Allow an authorized teacher to add or subtract one minute while the Lesson Timer is Running or Paused.

The adjustment must remain deterministic, session-based, visible on the existing teacher and Student Display presentations, and bounded by the approved timer limits.

## Included Scope

### Teacher Controls

Add exactly two teacher-only controls to the existing Lesson Timer area:

- Add 1 minute.
- Subtract 1 minute.

The controls must:

- Use the existing teacher dashboard and timer integration.
- Be available only while the timer is Running or Paused.
- Be disabled in Ready and Complete states.
- Be keyboard accessible.
- Provide at least a 44 CSS-pixel primary interaction target.
- Preserve the existing timer controls, labels, order, focus behavior, and state presentation except for the bounded addition of these controls.

### Adjustment Amount

Each accepted adjustment changes the current remaining time by exactly 60 seconds.

PB-002C does not provide:

- Custom adjustment amounts.
- Repeated-action presets.
- Direct replacement of remaining time.
- Automatic adjustments.

### Running Behavior

While Running:

- Add 1 minute extends the authoritative ending timestamp by exactly 60 seconds.
- Subtract 1 minute reduces the authoritative ending timestamp by exactly 60 seconds.
- Elapsed real time must be resolved before applying the adjustment.
- Each accepted action must update the endpoint exactly once.
- Countdown behavior continues without creating duplicate intervals or alternate timer ownership.

### Paused Behavior

While Paused:

- Add 1 minute increases stored remaining time by exactly 60 seconds.
- Subtract 1 minute decreases stored remaining time by exactly 60 seconds.
- The timer remains Paused.
- The ending timestamp remains unset until Resume uses the adjusted remaining time.

### Boundary Behavior

- Remaining time must never exceed 240 minutes.
- An addition that would exceed 240 minutes must fail safely without changing timer state.
- Subtracting when 60 seconds or less remain sets remaining time to zero and transitions to the existing Complete state.
- Complete timers cannot be adjusted.
- Ready timers cannot be adjusted; their duration remains controlled by the existing duration form.
- No new timer state may be introduced.

### Reset Behavior

Adjustments are temporary changes to the current remaining time.

- The originally selected lesson duration remains unchanged.
- Reset returns to the originally selected duration in the existing Ready state.
- Adjustment does not silently replace or redefine the Reset duration.

### Session Restoration

Continue using the approved namespaced PB-002B `sessionStorage` state.

- Adjusted Running and Paused states must survive refresh.
- A restored Running timer must continue from its adjusted authoritative endpoint.
- A restored Paused timer must retain its adjusted remaining time.
- Refresh must not repeat, reverse, or lose an accepted adjustment.
- Existing sign-out cleanup must continue clearing timer and Student Display session state.

No backend, database, localStorage, network persistence, or cross-device synchronization is authorized.

### Student Display

The existing Student Display must reflect adjusted remaining time through the existing live timer presentation.

Students must not see:

- Add or subtract controls.
- Teacher controls.
- Adjustment history.
- Internal timer state or timestamps.

## Data Rules

PB-002C may persist only the existing classroom-level timer state required by PB-002B.

Do not store:

- Adjustment history.
- Teacher activity history.
- Student data or student activity time.
- Mission progress.
- Grades.
- Analytics.

Existing compatible PB-002B session data must restore safely. Invalid or out-of-range data must fail closed to a valid timer state.

## Architecture Requirements

The implementation must:

- Extend the existing isolated Lesson Timer model.
- Keep timer calculations deterministic and teacher-controlled.
- Preserve the existing timer state vocabulary.
- Preserve the existing authoritative end-timestamp approach for Running state.
- Preserve the existing render and Student Display synchronization path.
- Avoid new routes, roles, application frameworks, dependencies, or persistence systems.

No application file outside the approved timer integration surface may be modified without additional inspection and approval.

## Approved Implementation Surface

Application changes are limited to:

- `platform/scripts/lesson-timer.mjs`
- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`

Testing changes are limited to:

- `tests/platform/pb-002b-lesson-timer.test.mjs`, or
- One isolated PB-002C test file under `tests/platform/`.

Implementation notes may be created under:

- `docs/platform/builds/PB-002C/`

## Explicitly Out of Scope

Do not implement:

- Custom or configurable adjustment amounts.
- Replacing remaining time while active.
- Adjustment history or undo adjustment.
- Adjustments in Ready or Complete states.
- Changes to the selected Reset duration.
- New timer states.
- Lesson stages or automatic transitions.
- Current-stage or upcoming-stage timers.
- Mission integration.
- Student timers or student tracking.
- Time-on-task analytics or reports.
- AI pacing suggestions.
- Notifications or rewards.
- Wins, Blockers, Next Steps, or Teacher Feed logic.
- Google integrations.
- Builder integration.
- Workshop integration.
- Backend or cross-device synchronization.
- Any future Platform feature.

## Protected Systems

Do not change or break:

- PB-001 authentication, roles, routing, entry, or sign-out protection.
- PB-002A Classroom Command Board layout outside the timer area.
- PB-002B duration, Start, Pause, Resume, Reset, End, refresh, and Student Display behavior.
- PB-002B-FIX-01 Student Display restoration and cleanup.
- Builder.
- Workshop.
- Existing mission, rendering, measurement, camera, navigation, or persistence behavior.
- Existing assets.
- Controlling PB-001, PB-002A, and PB-002B documents.
- Unrelated repository files, including `.vscode/settings.json`.

## Testing Requirements

### Focused Model Tests

Verify:

- Add while Running extends the endpoint by exactly 60 seconds.
- Subtract while Running reduces the endpoint by exactly 60 seconds.
- Add while Paused increases remaining time by exactly 60 seconds and remains Paused.
- Subtract while Paused decreases remaining time by exactly 60 seconds and remains Paused.
- Subtraction at 60 seconds or less transitions to Complete at zero.
- Addition cannot exceed 240 minutes.
- Ready and Complete reject adjustment without state changes.
- Reset restores the original selected duration after adjustments.
- Resume uses adjusted Paused time.
- Repeated actions apply once per accepted action.
- Invalid restored adjustment state fails safely.

### Refresh and Session Tests

Verify:

- Adjusted Running state restores from the adjusted endpoint.
- Adjusted Paused state restores with the adjusted remaining time.
- Repeated refresh does not duplicate an adjustment.
- Natural completion still works after subtraction.
- Sign-out clears adjusted timer and Student Display state.

### Presentation and Accessibility Tests

Verify:

- Only teachers can access adjustment controls.
- Controls are enabled only in Running and Paused states.
- Controls have clear accessible names.
- Controls meet the 44 CSS-pixel interaction requirement.
- Keyboard and touchpad activation work.
- Student Display updates immediately and remains control-free.
- Responsive layout has no horizontal scrolling at Chromebook viewports.
- No console errors occur.

### Regression Tests

Verify:

- All Platform tests pass.
- PB-001 teacher and student entry protections remain functional.
- PB-002A layout remains intact.
- All PB-002B timer controls and states remain functional.
- PB-002B refresh and Student Display restoration remain functional.
- Builder smoke test passes.
- Workshop tests and smoke test pass.
- Protected files and assets remain unchanged.

### Chromebook Validation

Physical Chromebook validation is required after implementation.

At minimum verify:

- Running Add and Subtract.
- Paused Add and Subtract.
- Zero-to-Complete behavior.
- Maximum-time protection.
- Reset to original selected duration.
- Refresh after both adjustment types.
- Student Display synchronization and control separation.
- Responsive layout, keyboard, and touchpad usability.
- PB-001, PB-002A, PB-002B, Builder, and Workshop regressions.

## Stop Conditions

Stop implementation and return to inspection if:

- A backend, new persistence mechanism, route, role, or timer state is required.
- Existing PB-002B timer ownership or refresh architecture must be replaced.
- Adjustment cannot preserve the original Reset duration.
- Student Display would expose teacher controls or internal state.
- A protected or unrelated file requires modification.
- Builder or Workshop behavior changes.

## Definition of Done

PB-002C is complete only when:

- Both approved one-minute controls exist for authorized teachers.
- Running and Paused adjustment behavior meets this specification.
- Boundary, Reset, refresh, and Student Display behavior pass.
- PB-001, PB-002A, PB-002B, Builder, and Workshop remain protected.
- Focused and regression tests pass.
- Physical Chromebook validation passes.
- The user approves the completed build.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- Timer-model decisions.
- Tests completed.
- Regression results.
- Chromebook validation result.
- Known limitations.

Do not commit, tag, or push until separately authorized.
