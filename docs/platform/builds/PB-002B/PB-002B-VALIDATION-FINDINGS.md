# PB-002B — Validation Findings

Status: Closed — Chromebook revalidation passed
Build: PB-002B — Lesson Timer

## Refresh Failure

Result: FAIL

A timer refresh failure was reported during validation. The observed behavior requires diagnosis and correction before PB-002B can pass final validation.

Acceptance requirement:

- Refreshing during an active teacher timer must preserve the protected teacher session.
- The timer must reconstruct the current remaining time and state from its approved session-based data.
- Refresh must not restart, extend, or unexpectedly complete the timer.
- Refresh must not expose teacher controls to the student display.

Disposition: PB-002B-FIX-01 was implemented and passed local automated inspection. Chromebook validation must be repeated before the finding can be closed.

## Timer Adjustment Feature Request

Type: Feature request
Status: Pending definition and approval

A timer-adjustment capability was requested during validation. The requested adjustment behavior, allowed timer states, control design, limits, and session behavior have not yet been specified.

This request is not part of the approved PB-002B Build Specification v1.0 and must not be implemented without a separately approved specification or scope amendment.

Definition required before implementation:

- Whether adjustment means adding time, subtracting time, replacing the remaining time, or a defined combination.
- Whether adjustment is allowed while Ready, Running, Paused, or Complete.
- Minimum and maximum adjustment limits.
- Expected behavior at zero remaining time.
- Chromebook control and accessibility requirements.
- Whether the adjusted value becomes the Reset duration.

## Validation Status

PB-002B-FIX-01 passed Chromebook revalidation and the refresh finding is closed. The timer-adjustment request remains outside the current approved implementation scope pending definition and authorization.

No code change, commit, or push is authorized by this document.
