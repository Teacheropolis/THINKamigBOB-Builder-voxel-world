# PB-002B-FIX-01 — Lesson Timer Refresh Protection

## Fix Specification v1.0

Status: Approved specification
Parent Build: PB-002B — Lesson Timer
Source Finding: PB-002B Validation Findings — Refresh Failure

## Purpose

Correct the PB-002B timer refresh failure without changing the approved Lesson Timer feature set or platform architecture.

## Objective

Ensure that refreshing the protected Teacher Classroom Command Board during an active Lesson Timer preserves the teacher session and reconstructs the correct timer state and remaining time.

This is a corrective build only. It does not authorize new timer capabilities.

## Required Pre-Implementation Inspection

Before modifying code:

- Reproduce the refresh failure.
- Record the timer state before refresh.
- Record the route and teacher session state before and after refresh.
- Record the stored PB-002B session data before and after refresh.
- Identify the exact failure cause.
- Stop and report if correction requires an architecture change or changes outside the approved PB-002B integration surfaces.

## Included Scope

Implement only the minimum correction required so that:

- Refresh preserves the protected teacher session.
- A Running timer reconstructs from its stored end timestamp.
- Remaining time reflects elapsed real time during refresh.
- A Paused timer remains paused with the same remaining time.
- A Ready timer remains ready with its selected duration.
- A Complete timer remains complete at zero.
- Refresh does not restart, extend, duplicate, or unexpectedly complete the timer.
- The Teacher Dashboard remains on the authorized teacher route after refresh.
- Timer presentation and enabled controls match the reconstructed state.
- The student-facing display continues to exclude teacher controls and internal state.

## State and Data Requirements

Continue using the approved namespaced `sessionStorage` timer state.

The correction must not:

- Add localStorage persistence.
- Add cross-device or cross-browser synchronization.
- Add a backend, database, authentication provider, or network dependency.
- Store student data, activity time, mission progress, grades, or lesson history.
- Create a production-security claim.

Invalid, incomplete, or expired timer data must fail safely to a valid PB-002B state without breaking the teacher route or exposing internal errors.

## Explicitly Out of Scope

Do not implement:

- Timer adjustment controls or behavior.
- Add-time or subtract-time controls.
- Replacement of remaining time while a timer is active.
- Changes to the Reset duration rules.
- Lesson stages.
- Automatic transitions.
- Mission integration.
- Student tracking.
- Analytics or historical timer data.
- AI, rewards, or notifications.
- Wins automation or Teacher Feed logic.
- Google integrations.
- Future platform features.

The documented timer-adjustment request requires a separate approved specification or PB-002B scope amendment.

## Protected Systems

Do not change or break:

- PB-001 authentication, roles, routing, or sign-out protection.
- PB-002A Classroom Command Board layout outside the existing timer integration area.
- Approved PB-002B duration and control behavior except where required to correct refresh reconstruction.
- Builder.
- Workshop.
- Existing mission, rendering, measurement, camera, navigation, or persistence behavior.
- Existing approved assets.
- The controlling PB-001, PB-002A, and PB-002B specifications.
- Unrelated repository files, including `.vscode/settings.json`.

## Testing Requirements

### Automated Tests

Add or update focused PB-002B tests to verify:

- Running timer reconstruction after refresh.
- Elapsed real time is deducted exactly once.
- Paused, Ready, and Complete state reconstruction.
- Natural completion during a refresh interval.
- Safe handling of invalid or incomplete timer session data.
- Teacher sign-out still clears timer state.
- Teacher and student route guards remain intact.

### Interactive Local Testing

Verify refresh behavior for:

- Ready.
- Running.
- Paused.
- Complete.
- Running timer that expires while the page reloads.
- Repeated refreshes.
- Refresh after teacher sign-out.

Confirm:

- Remaining time is accurate.
- Timer controls match the state.
- No stale intervals or duplicate countdown behavior occurs.
- No console errors occur.
- The student-facing display remains control-free and readable.

### Regression Testing

Verify:

- All platform tests pass.
- PB-001 teacher and student entry protections remain functional.
- PB-002A layout remains intact.
- All other PB-002B controls still work.
- Builder smoke test passes.
- Workshop tests and smoke test pass.
- Protected files remain unchanged.

### Chromebook Validation

Repeat Chromebook validation after the correction.

At minimum verify:

- Running timer refresh protection.
- Paused timer refresh protection.
- Repeated refresh stability.
- Teacher session and route protection.
- Sign-out protection.
- Responsive layout.
- Keyboard and touchpad usability.
- Builder and Workshop smoke tests.

## Definition of Done

PB-002B-FIX-01 is complete only when:

- The refresh failure is reproduced and its cause is documented.
- The minimum authorized correction is implemented.
- Refresh behavior passes every required timer state test.
- PB-001, PB-002A, Builder, and Workshop remain protected.
- Automated and interactive inspections pass.
- Chromebook validation passes.
- The user approves the correction.

## Completion Report Required

After implementation, report:

- Reproduced failure behavior.
- Root cause.
- Files created.
- Files modified.
- Correction made.
- Tests completed.
- Regression results.
- Chromebook validation result.
- Known limitations.

Do not commit or push until separately authorized.
