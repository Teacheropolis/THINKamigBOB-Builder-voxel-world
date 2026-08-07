# PB-002E — Smart Board Presentation Flow

## Design Blueprint v1.0

Status: Design blueprint pending review and approval  
Parent Build: PB-002 — Teacher Classroom Command Center

## Document Boundary

This document defines a proposed classroom presentation flow only. It is not a build specification and does not authorize implementation.

Any implementation requires a separately reviewed and approved PB-002E Build Specification followed by the complete THINKamigBOB development workflow.

## Purpose

Define a calm, readable, teacher-controlled Smart Board presentation that helps students understand the two most immediate classroom signals:

- How much engineering time remains.
- What class-wide message currently matters.

PB-002E responds to the PB-002D-FIX-01 Chromebook observation that the saved Teacher Memo is present but visually subordinate to the much larger Lesson Timer.

The design must improve attention and readability without redesigning the approved Lesson Timer, Teacher Memo, session storage, routing, or Student Display foundation.

## Design Principles

The presentation must be:

- Classroom-readable from a distance.
- Calm rather than attention-seeking.
- Teacher-controlled.
- Student-facing and control-free.
- Honest about absent information.
- Responsive across Chromebook and classroom-display dimensions.
- Safe for public classroom viewing.
- Compatible with the existing timer and memo states.

The presentation must not introduce student surveillance, competition, public support signals, or automated classroom judgment.

## Existing Approved Inputs

PB-002E may organize only information already approved and available from completed builds:

### Lesson Timer

- Today's Engineering Time label.
- Remaining time.
- Existing Ready, Running, Paused, and Complete behavior.
- Existing teacher Start, Pause, Resume, Reset, End, Add 1 minute, and Subtract 1 minute controls.

### Teacher Memo

- One saved, class-wide, plain-text memo.
- Maximum 240 characters.
- Existing Save, update, clear, refresh restoration, and sign-out cleanup behavior.

No new information source is authorized by this blueprint.

## Presentation Model

The Smart Board presentation contains two coordinated regions:

1. Engineering Time
2. Class Message

Both regions may be visible together, but neither may make the other unreadable.

The timer remains the authoritative pacing signal. The memo receives enough visual weight to function as a classroom direction rather than decorative secondary text.

## Proposed Presentation Flow

### 1. Teacher Preparation

The teacher works from the protected Teacher Command Center.

- The teacher may prepare or update the existing memo.
- Only the saved memo is eligible for public presentation.
- Unsaved text remains private to the teacher editor.
- The teacher may configure or operate the existing Lesson Timer independently.

### 2. Open Presentation

The teacher opens the existing Student Display from either the Lesson Timer card or Teacher Memo card.

Opening the presentation:

- Uses the existing protected Teacher Dashboard context.
- Uses the existing Student Display open-state behavior.
- Does not create a new route, role, login, or student session.
- Does not reveal teacher controls.
- Moves focus into the existing display using the approved accessibility behavior.

### 3. Combined Presentation

When a saved memo exists, the display presents:

- THINKamigBOB classroom identity.
- Today's Engineering Time.
- Remaining time.
- A clearly identifiable Class Message region containing the saved memo.

The visual hierarchy should allow a student to understand both the remaining time and the class message within a brief glance.

The memo should use a distinct surface, readable typography, and sufficient contrast. It must not compete through animation, flashing, or excessive color.

### 4. Timer-Only Presentation

When no saved memo exists:

- The display remains timer-focused.
- No empty memo panel is required.
- No false message, placeholder direction, or prompt is shown to students.
- The existing timer presentation remains honest and complete.

### 5. Live Updates

While Student Display is open:

- Existing timer changes remain synchronized.
- A newly saved or updated memo replaces the presented class message.
- Clearing the memo removes the Class Message region without closing Student Display.
- Unsaved teacher edits never appear publicly.

No transition may interrupt or reset the timer.

### 6. Refresh Restoration

Refreshing while Student Display is open should reconstruct the authorized presentation from existing session state:

- Teacher authorization remains required.
- Existing Student Display open-state restoration remains authoritative.
- Existing timer reconstruction remains authoritative.
- The saved memo restores from the existing PB-002D session record.
- Unsaved drafts do not restore or appear.

PB-002E must not introduce a second presentation-state store.

### 7. Close Presentation

Escape closes Student Display using the existing behavior and returns the teacher to the protected Teacher Command Center.

Closing the presentation must not:

- Stop or change the timer.
- Clear the saved memo.
- Change the teacher session.
- Navigate to a student route.

### 8. Sign Out

Teacher sign-out continues to:

- Close and clear Student Display open state.
- Clear Lesson Timer session state.
- Clear Teacher Memo session state.
- Return to the approved Platform entry flow.

No PB-002E presentation detail survives sign-out independently.

## Visual Hierarchy Guidance

The eventual build specification should define testable presentation relationships rather than arbitrary permanent pixel values.

Required relationships:

- Remaining time is immediately identifiable.
- The Class Message heading and memo are readable from classroom viewing distance.
- The memo does not appear as fine print beneath the timer.
- The timer does not crowd the memo outside the visible viewport.
- A 240-character memo wraps without clipping or horizontal scrolling.
- Short memos do not create an oversized empty panel.
- Timer-only mode remains visually balanced.
- Paused and Complete presentations remain understandable without exposing controls.

The design should use responsive type and spacing within the existing namespaced Platform presentation surface.

## Teacher Control Boundary

PB-002E does not require new timer or memo capabilities.

The Teacher Command Center may clarify that both existing Open Student Display buttons open the same combined presentation. It must not introduce competing display modes or duplicate state ownership.

Student Display must contain no:

- Timer controls.
- Timer adjustment controls.
- Memo editor.
- Save or Clear controls.
- Character count.
- Storage or session details.
- Teacher-only navigation.

## Accessibility and Chromebook Guidance

The presentation should support:

- Readable contrast.
- Responsive wrapping without horizontal scrolling.
- Safe scaling at 1024×600 and 1366×768.
- Classroom-display scaling at larger dimensions.
- Keyboard opening through existing native buttons.
- Escape cleanup and focus restoration.
- Reduced-motion preferences.
- Memo content outside the keyboard focus order.
- Semantic headings that preserve a clear reading order.

The eventual build specification must include physical Chromebook validation and classroom-distance visual inspection.

## Privacy and Classroom Safety

Only a teacher-saved class-wide memo may appear publicly.

The presentation must not expose:

- Student names or identifiers.
- Student-specific instructions.
- Grades or progress.
- Wins, Blockers, or Next Steps data.
- Private teacher notes.
- Support signals.
- Activity history or analytics.

Teachers remain responsible for ensuring that memo content is appropriate for public classroom display.

## Protected Systems

Any future PB-002E implementation must preserve:

- PB-001 authentication, roles, routing, and sign-out protection.
- PB-002A Teacher Command Board structure and reserved areas.
- PB-002B Lesson Timer controls, state, refresh restoration, and Student Display ownership.
- PB-002B-FIX-01 display restoration and cleanup.
- PB-002C adjustment behavior and boundaries.
- PB-002D Teacher Memo validation, storage, refresh restoration, and sign-out cleanup.
- PB-002D-FIX-01 save-state feedback and memo-card display access.
- Builder.
- Workshop.
- Mission behavior.
- Existing assets and unrelated files.

## Explicitly Outside This Blueprint

This blueprint does not authorize:

- A reusable memo library or history.
- Rich-text editing.
- Headings, subheadings, bold, underline, or formatted memo content.
- Teacher-selected text or background colors.
- Images, pasted media, files, or attachments.
- Multiple memo pages or slides.
- Manual timer-only versus memo-only display modes.
- Lesson stages or stage timers.
- Mission integration.
- Wins, Blockers, Next Steps, shoutouts, reminders, jobs, credits, or Hall of Fame presentation.
- Student progress, student tracking, analytics, or reports.
- Notifications.
- AI-generated content or pacing suggestions.
- Google integrations.
- Backend persistence or cross-device synchronization.
- Changes to Workshop Smart Board behavior or assets.

These concepts require separate inspection and authorization.

## Future Build-Specification Questions

Before implementation, the PB-002E Build Specification must resolve:

- The smallest presentation-only CSS and markup surface.
- The precise responsive hierarchy between timer and memo.
- Readability criteria for short and maximum-length memos.
- Behavior for Ready, Running, Paused, and Complete timer states.
- Focus return when Student Display is opened from either teacher card.
- Required automated presentation and regression tests.
- Physical classroom-distance validation procedure.

If these requirements cannot be met without changing approved timer, memo, route, role, or session architecture, implementation must stop for additional inspection.

## Blueprint Review Checklist

Review must confirm:

- The flow uses only approved timer and saved-memo data.
- Timer and memo state ownership remain unchanged.
- Student Display remains teacher-authorized and control-free.
- The memo becomes readable without diminishing timer clarity.
- Refresh, Escape, and sign-out behavior remain protected.
- Public content remains class-safe.
- No future Smart Board feature is silently introduced.
- A separate Build Specification is required before implementation.

## Blueprint Completion Boundary

PB-002E design documentation is complete when this blueprint has been reviewed and approved as the basis for a bounded Build Specification.

Approval of this blueprint does not authorize code changes, tests, staging, commits, tags, or pushes.
