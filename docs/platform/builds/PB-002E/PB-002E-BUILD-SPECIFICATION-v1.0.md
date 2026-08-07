# PB-002E — Smart Board Presentation System

## Build Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-002 — Teacher Classroom Command Center  
Design Authority: PB-002E Smart Board Presentation Flow Blueprint v1.0  
Protected Baseline: PB-002D-FIX-01 approved commit `32643744bebe3d87403ef0c9d1b70eee961db26e`

## Purpose

Improve the existing Student Display so the Lesson Timer and saved Teacher Memo form one calm, readable classroom presentation.

PB-002E addresses the validated observation that the memo is present but visually subordinate to the much larger timer. It is a presentation-only build and must not change approved timer, memo, routing, role, or session behavior.

## Objective

Allow students to understand both remaining engineering time and the current saved class message at a glance, while preserving a balanced timer-only presentation when no memo exists.

## Included Scope

PB-002E includes only:

- Responsive presentation hierarchy for the existing Student Display.
- A clearly identifiable Engineering Time region.
- A clearly identifiable Class Message region when a saved memo exists.
- Improved memo prominence and classroom-distance readability.
- Balanced timer-only presentation when no saved memo exists.
- Focus return to the teacher control that opened Student Display.
- Focused automated presentation tests.
- Required Platform and Workshop regression testing.

## Existing Data and Behavior Only

PB-002E must consume only existing approved state.

### Lesson Timer

Use the existing PB-002B/PB-002C timer state and presentation:

- Today's Engineering Time.
- Remaining time.
- Ready, Running, Paused, and Complete states.
- Existing live countdown and adjustment synchronization.
- Existing refresh reconstruction.

PB-002E must not calculate time, create timer state, or modify timer controls.

### Teacher Memo

Use the existing PB-002D memo state and presentation:

- One saved class-wide plain-text memo.
- Existing 240-character maximum.
- Existing save, update, clear, refresh restoration, and sign-out cleanup behavior.

PB-002E must never display an unsaved draft.

## Student Display Presentation

### Shared Identity

The existing THINKamigBOB identity remains visible and subordinate to the classroom information.

No new branding, asset, illustration, or decorative environment is authorized.

### Engineering Time Region

The existing timer content must remain immediately identifiable:

- Today's Engineering Time heading.
- Remaining time.

The presentation may reorganize the existing heading and output inside the Student Display, but it must not rename the timer, alter its value, expose internal timer state, or change live synchronization.

### Class Message Region

When a saved memo exists, show one distinct Class Message region containing:

- A visible Class Message heading.
- The current saved Teacher Memo as plain text.

The region must:

- Have clear separation from the Engineering Time region.
- Use readable contrast and responsive typography.
- Give the memo enough visual weight to function as classroom direction.
- Preserve intentional internal line breaks and spacing.
- Wrap a permitted 240-character memo without clipping or horizontal scrolling.
- Remain outside the keyboard focus order.
- Render text safely without HTML, Markdown, links, or executable content.

The heading presented to students is `Class Message`. The existing Teacher Command Center may continue using `Teacher Memo` for the teacher-owned editor.

### Timer-Only Presentation

When no saved memo exists:

- Do not render an empty Class Message panel.
- Do not show placeholder instructions or a false classroom message.
- Keep the existing timer information centered and visually balanced.
- Preserve the existing Student Display background and identity.

### Responsive Hierarchy

With a saved memo, the presentation must behave as one responsive composition.

Required relationships:

- Timer and memo are both visible within the presentation viewport at supported Chromebook dimensions.
- Remaining time remains prominent without reducing the memo to fine print.
- The Class Message heading is distinguishable from its content.
- The memo surface does not obscure, overlap, or truncate the timer.
- The timer does not push the memo outside the visible viewport.
- Short memos do not create excessive empty space.
- Maximum-length memos remain readable without page-level horizontal scrolling.
- Large classroom displays scale both regions rather than enlarging only the timer.

Do not lock permanent design values merely to one validation viewport. Use responsive relationships within the existing namespaced Platform CSS.

## Timer-State Presentation

PB-002E must remain compatible with every approved timer state.

### Ready

- Show the selected remaining duration.
- Show the saved Class Message when one exists.
- Expose no Start control or teacher status.

### Running

- Continue the existing live countdown.
- Keep the Class Message stable while the time updates.
- Avoid layout shifting as timer digits change.

### Paused

- Preserve the approved paused timer value.
- Do not introduce flashing, animation, or a teacher control.
- Keep the Class Message readable.

### Complete

- Preserve the existing zero/completion timer presentation.
- Keep the saved Class Message visible until the teacher clears it, closes Student Display, or signs out.
- Do not create an automatic next screen or end-of-class summary.

No new timer state, transition, sound, notification, animation, or automatic display change is authorized.

## Live Presentation Behavior

While Student Display is open:

- Existing timer updates must continue through the existing presentation synchronization.
- Saving or updating a memo must replace the visible Class Message immediately.
- Clearing the saved memo must remove the Class Message region without closing Student Display.
- Unsaved teacher edits must remain absent from Student Display.

PB-002E must not introduce polling, networking, duplicate intervals, or separate timer/memo ownership.

## Open, Close, and Focus Flow

### Open

Both existing teacher controls continue opening the same Student Display:

- Lesson Timer card: Open Student Display.
- Teacher Memo card: Open Student Display.

PB-002E must not introduce timer-only, memo-only, slide, page, or alternate display modes.

### Focus Ownership

When Student Display opens:

- Focus continues moving to the existing Student Display container.
- The presentation contains no interactive student-facing controls.

When Escape closes Student Display:

- Student Display open state is cleared through the existing mechanism.
- Focus returns to the specific teacher button that opened the display when that control remains available.
- Focus must not jump to a different card merely because both buttons share the same action.

This focus correction is presentation-flow state only. It must not be persisted, added to session storage, or used to create a second display owner.

### Close

Closing Student Display must not:

- Stop, pause, reset, or adjust the timer.
- Clear or update the memo.
- Change the teacher session.
- Navigate away from the protected Teacher Dashboard.

## Refresh Restoration

PB-002E must preserve the existing authorized refresh flow:

- Teacher authorization remains required.
- The existing PB-002B-FIX-01 Student Display session key remains authoritative for open-state restoration.
- The existing Lesson Timer record remains authoritative for time restoration.
- The existing Teacher Memo record remains authoritative for saved-message restoration.
- An open Student Display reconstructs the appropriate timer-only or combined presentation after refresh.
- Teacher controls remain hidden after restoration.
- Unsaved drafts do not restore or appear.

Do not add, rename, duplicate, or migrate a session storage record for PB-002E.

## Sign-Out Cleanup

Preserve the existing locked sign-out cleanup sequence and its effects:

- Student Display open state clears.
- Lesson Timer state clears.
- Teacher session clears.
- Teacher Memo state clears.
- Navigation returns to Welcome.

PB-002E adds no independently persisted state requiring cleanup.

## Teacher Command Center Boundary

No Teacher Command Center feature change is authorized beyond preserving the two existing Open Student Display controls and their accurate guidance.

Do not change:

- Lesson Timer controls or labels.
- Timer adjustment controls.
- Teacher Memo editor, validation, saved/unsaved feedback, or character boundary.
- PB-002A layout outside the minimum presentation trigger integration.
- Reserved navigation or dashboard placeholders.

## Accessibility Requirements

Student Display must provide:

- A clear semantic heading order.
- Readable contrast for identity, timer, Class Message heading, and memo text.
- Stable timer numerals without disruptive layout shifting.
- Memo text outside the focus order.
- No student-facing buttons, links, fields, or other controls.
- Reduced-motion compatibility with no required animation.

Teacher opening controls must retain:

- Native keyboard operation.
- Visible focus treatment.
- At least 44 CSS pixels in the primary interaction dimension.
- Correct focus return after Escape.

## Chromebook and Classroom-Display Requirements

Verify at minimum at:

- 1024×600 Chromebook viewport.
- 1366×768 Chromebook viewport.
- One larger classroom-display viewport selected during inspection.

At every required viewport:

- No page-level horizontal scrolling occurs.
- Timer and maximum-length memo remain visible and readable.
- Neither region overlaps or clips the other.
- Short messages remain visually balanced.
- Timer-only mode remains balanced.
- Ready, Running, Paused, and Complete presentations remain understandable.

Physical Chromebook validation must include keyboard, touchpad, refresh, and classroom-distance readability checks.

## Privacy and Classroom Safety

Only the teacher-saved class-wide memo may appear in the Class Message region.

Do not expose:

- Student names or identifiers.
- Student-specific messages.
- Grades, progress, or support signals.
- Private teacher notes.
- Teacher activity history.
- Storage details.
- Analytics or reports.

Teachers remain responsible for the public classroom safety of saved memo content. PB-002E adds no moderation, classification, or AI review.

## Authorized Implementation Surface

Implementation may modify only:

- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`
- A new focused test under `tests/platform/`
- `docs/platform/builds/PB-002E/PB-002E-IMPLEMENTATION-NOTES.md`

Existing Platform tests may be modified only when an assertion directly conflicts with the approved PB-002E presentation and the change preserves the earlier build's protected intent.

Do not modify `platform/scripts/lesson-timer.mjs` or `platform/scripts/teacher-memo.mjs`. If either model must change, stop for additional inspection.

## Protected Systems

Do not change or break:

- PB-001 authentication, teacher/student roles, routing, entry, guards, and sign-out protection.
- PB-002A Teacher Command Board structure outside the authorized presentation trigger boundary.
- PB-002B Lesson Timer behavior, state ownership, persistence, and control separation.
- PB-002B-FIX-01 Student Display restoration, Escape cleanup, and sign-out cleanup.
- PB-002C adjustment amounts, boundaries, Reset behavior, and refresh behavior.
- PB-002D Teacher Memo validation, storage, update, clear, refresh, and sign-out behavior.
- PB-002D-FIX-01 saved/unsaved feedback and Student Display discoverability.
- Student entry and Student Dashboard behavior.
- Builder.
- Workshop.
- Mission behavior.
- Existing assets.
- `.vscode/settings.json`.
- Unrelated files.

## Explicitly Out of Scope

Do not implement:

- Reusable memo history or a saved-memo library.
- Rich text, HTML, Markdown, bold, underline, headings, or subheadings.
- Teacher-selected colors or themes.
- Images, pasted media, files, or attachments.
- Multiple memo pages, slides, or playlists.
- Manual timer-only or memo-only modes.
- New routes, roles, logins, or display windows.
- Lesson stages or stage timers.
- Mission integration.
- Wins, Blockers, Next Steps, Teacher Feed, shoutouts, reminders, jobs, credits, Hall of Fame, or end-of-class summaries.
- Student tracking, progress, analytics, reports, or time-on-task data.
- Notifications, sounds, rewards, or animations.
- AI-generated content or pacing suggestions.
- Google integrations.
- Backend persistence, database storage, localStorage, or cross-device synchronization.
- Builder or Workshop integration.
- Workshop Smart Board changes.
- New image or media assets.

## Required Automated Tests

Create a focused PB-002E test covering:

- Existing Student Display identity remains present.
- Engineering Time heading and remaining-time output remain present.
- Saved memo appears under the Class Message heading.
- No Class Message panel appears when no saved memo exists.
- Memo updates and clear continue using the existing PB-002D state.
- Student Display contains no teacher controls.
- Timer-only and combined presentation classes are namespaced.
- Maximum-length memo presentation is overflow-safe.
- Ready, Running, Paused, and Complete timer states require no alternate presentation state.
- Both teacher buttons open the same Student Display.
- Escape returns focus to the button that opened the display.
- No PB-002E storage key, route, role, timer, or memo model is introduced.
- No future feature or forbidden integration is present.

## Required Browser Inspection

Verify locally:

- Timer-only Student Display opens and closes.
- Combined Student Display opens from the Lesson Timer card.
- Combined Student Display opens from the Teacher Memo card.
- Escape returns focus to the correct originating button in both cases.
- A short saved memo is prominent and readable.
- A multiline maximum-length memo is prominent, wraps safely, and remains visible.
- Saving an update changes the open Class Message immediately.
- Clearing removes the Class Message without closing Student Display.
- Running time continues without interruption during memo changes.
- Ready, Running, Paused, and Complete states remain readable.
- Refresh restores timer-only and combined presentations correctly.
- Teacher controls remain hidden.
- No console errors occur.

## Required Regression Testing

Verify:

- All Platform tests pass.
- PB-001 teacher and student entry protections remain functional.
- PB-002A Command Board structure remains intact.
- PB-002B timer controls, states, refresh, display restoration, and cleanup remain functional.
- PB-002C adjustment boundaries and Reset behavior remain functional.
- PB-002D memo validation, persistence, clear, and sign-out cleanup remain functional.
- PB-002D-FIX-01 saved/unsaved feedback and memo-card display access remain functional.
- Builder smoke test passes.
- Workshop tests and smoke test pass.
- Protected files and assets remain unchanged.

## Physical Chromebook Validation

At minimum verify:

- Timer-only presentation readability.
- Combined timer and memo readability.
- Short memo prominence.
- Maximum-length memo prominence and wrapping.
- Ready, Running, Paused, and Complete presentations.
- Open from each teacher card.
- Correct focus return after Escape from each opening control.
- Refresh restoration while combined presentation is open.
- Live timer continuity during memo update and clear.
- Teacher-control separation.
- No horizontal scrolling.
- Keyboard and touchpad usability.
- Classroom-distance readability.
- PB-001 and PB-002A through PB-002D-FIX-01 regressions.
- Builder and Workshop smoke tests.

Physical Chromebook validation is mandatory and cannot be replaced by local browser inspection.

## Stop Conditions

Stop implementation and request additional inspection if:

- Timer or memo model changes are required.
- A new route, role, session record, or display owner is required.
- Existing Student Display restoration must be replaced.
- The locked sign-out cleanup sequence must change.
- Presentation cannot remain control-free and class-safe.
- Timer and memo cannot remain readable at required dimensions without changing their approved behavior.
- A protected or unrelated file requires modification.
- New assets, frameworks, dependencies, backend services, or integrations become necessary.

## Definition of Done

PB-002E is complete only when:

- Timer-only presentation remains balanced and accurate.
- Combined presentation makes both timer and saved Class Message immediately understandable.
- Short and maximum-length memos are classroom-readable.
- Every existing timer state remains compatible.
- Live update, clear, refresh, Escape, and sign-out flows remain correct.
- Student Display remains teacher-authorized and control-free.
- PB-001 and PB-002A through PB-002D-FIX-01 remain intact.
- Focused and regression tests pass.
- Browser inspection passes.
- Physical Chromebook and classroom-distance validation pass.
- User approval is received.

No commit, tag, or push may occur until separately authorized.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- Presentation decisions.
- Focus-flow behavior.
- Automated tests completed.
- Browser inspection results.
- Regression results.
- Physical Chromebook validation status.
- Known limitations and deferred requests.

This specification does not itself authorize implementation, staging, committing, tagging, or pushing.
