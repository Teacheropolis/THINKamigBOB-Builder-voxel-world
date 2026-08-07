# PB-002E-FIX-02 — Student Display Control Layout Refinement

## Fix Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-002E — Smart Board Presentation System  
Protected Correction: PB-002E-FIX-01 — Smart Board Presentation Controls

## Purpose

Refine the Teacher Command Center layout so the Lesson Timer and Teacher Memo cards are shorter and the Student Display controls are organized in one clearly identifiable section beneath both cards.

This is a teacher-dashboard layout correction only. It must not redesign Student Display, presentation modes, timer behavior, memo behavior, persistence, routing, roles, or protected Platform architecture.

## Objective

Reduce the visual height and repetition of the Timer and Teacher Memo cards while giving teachers one consistent location to:

- Choose Student Display content.
- Open Student Display.

## Included Scope

PB-002E-FIX-02 includes only:

- Shorter Lesson Timer dashboard card presentation.
- Shorter Teacher Memo dashboard card presentation.
- Removal of Student Display opening controls from the individual Timer and Teacher Memo cards.
- Removal of presentation-mode controls from the Teacher Memo card.
- One shared Student Display control section positioned below both cards.
- The existing three presentation-mode controls inside the shared section.
- One primary Open Student Display button inside the shared section.
- Responsive and accessible layout adjustments.
- Focused automated, browser, regression, and physical Chromebook validation.

## Teacher Command Center Layout

### Existing Primary Cards

Preserve the existing TODAY workspace and its primary information areas:

- Today's Mission placeholder.
- Today's Engineering Time.
- Teacher Memo.

Do not reorder or redesign unrelated PB-002A areas.

### Lesson Timer Card

Keep all approved timer content and teacher controls:

- Today's Engineering Time heading.
- Remaining time.
- Timer state.
- Duration field and Set duration.
- Start, Pause, Resume, Reset, and End.
- Add 1 minute and Subtract 1 minute.
- Validation feedback.

Remove the individual Open Student Display button from this card.

The card may use tighter internal spacing and responsive control grouping to reduce unnecessary height, but it must not:

- Remove or rename timer controls.
- Reduce any required 44 CSS-pixel interaction target.
- Change timer state, order, ownership, or behavior.
- Hide controls behind an accordion, menu, disclosure, or modal.

### Teacher Memo Card

Keep all approved memo content and teacher controls:

- Teacher Memo heading.
- Plain-text memo editor.
- Character count.
- Save Memo and Clear Memo.
- Validation and saved/unsaved feedback.
- Current saved class message.

Move the Student Display content mode group out of this card.

Remove the individual Open Student Display button and its duplicated display guidance from this card.

The card may use tighter internal spacing to reduce unnecessary height, but it must not:

- Change the 240-character boundary.
- Change memo validation, save, update, clear, refresh, or sign-out behavior.
- Hide the saved/unsaved status.
- Hide controls behind an accordion, menu, disclosure, or modal.

## Shared Student Display Control Section

Add one teacher-only section titled:

`Student Display`

The section must appear below the Lesson Timer and Teacher Memo cards and visually belong to both rather than either individual card.

### Desktop Placement

Within the existing primary Command Board grid, the section should occupy the horizontal area beneath the Lesson Timer and Teacher Memo cards.

It must not displace, overlap, or visually merge with the Today's Mission placeholder.

### Narrow Chromebook and Mobile Placement

When the primary cards stack or reflow, the Student Display section must:

- Appear after the Lesson Timer and Teacher Memo cards.
- Use the available content width.
- Keep controls readable without horizontal scrolling.
- Preserve logical keyboard order.

### Section Content

The shared section contains only:

- Student Display heading.
- Concise guidance explaining that the teacher chooses what students see.
- Existing presentation-mode control group.
- One primary Open Student Display button.

Do not place timer operation, memo editing, future Smart Board controls, or student-facing content inside this teacher control section.

## Presentation Mode Controls

Preserve exactly the three PB-002E-FIX-01 modes:

1. Timer + Message
2. Message only
3. Timer only

The mode controls must continue to:

- Use the existing `student-display-mode.mjs` owner.
- Change presentation visibility only.
- Preserve saved memo state.
- Preserve timer state and continuity.
- Restore after refresh.
- Clear on sign-out.
- Disable Message only when no saved memo exists.
- Expose programmatic grouping and selected state.
- Provide native keyboard operation, visible focus, and 44 CSS-pixel targets.

Do not add, rename, remove, reorder, or duplicate a presentation mode.

## Open Student Display Button Placement

Provide exactly one teacher-facing Open Student Display button in the shared Student Display control section.

The button must:

- Use the existing `open-timer-display` action and existing Student Display owner.
- Open the currently selected presentation mode.
- Set the existing Student Display open-state record.
- Move focus to the existing Student Display container.
- Provide at least a 44 CSS-pixel interaction target.
- Remain keyboard and touchpad operable.
- Be visually identifiable as the primary action for the section.

Remove the two former card-level Open Student Display buttons so the dashboard exposes one unambiguous opening action.

PB-002E-FIX-02 intentionally changes the number and placement of teacher opening controls. It does not change Student Display open/closed state ownership.

## Escape and Focus Return

Escape must continue to:

- Close Student Display.
- Clear the existing open-display state.
- Return focus to the shared section's Open Student Display button.

The existing page-memory focus-owner mechanism may remain, but it must resolve to the single shared opening control.

Refresh restoration must continue focusing the Student Display itself. After closing a restored display, focus must return safely to the shared Open Student Display button.

## Card Height and Spacing Requirements

The layout refinement must make both cards meaningfully shorter than the failed pre-refinement layout by removing duplicated Student Display controls and reducing excess internal spacing.

The eventual implementation must use responsive content relationships rather than fixed card heights.

Do not:

- Force equal fixed heights when content requires more room.
- Clip content.
- Add internal card scrolling.
- Reduce control targets below 44 CSS pixels.
- Reduce validation or status text below readable Chromebook sizes.
- Hide essential controls.

The Timer and Teacher Memo cards should remain visually coordinated, but natural content height is allowed.

## Student Display Architecture Preservation

Preserve the existing Student Display architecture:

- One full-screen student-facing presentation.
- Existing timer-only, message-only, and combined presentation classes.
- Existing timer and memo content owners.
- Existing teacher authorization and protected route.
- Existing open-state session record.
- Existing presentation-mode session record.
- Existing refresh restoration.
- Existing control-free student presentation.
- Existing Escape cleanup.
- Existing sign-out cleanup.

Do not create:

- A new Student Display route.
- A second overlay or display owner.
- A popup window.
- A second presentation-mode store.
- A duplicate Open action.
- Student controls.

## Saved Memo and Timer Preservation

Moving controls must not change state behavior.

- Timer only continues hiding rather than clearing the saved memo.
- Message only continues hiding rather than changing the timer.
- Timer + Message continues showing both when a saved memo exists.
- Running timers continue while hidden.
- Saved memos remain available while hidden.
- Mode changes never start, pause, reset, end, save, update, or clear anything.

## Session and Refresh Preservation

Preserve all existing session owners and keys.

Refreshing must restore:

- Teacher authorization.
- Timer state.
- Saved memo.
- Selected presentation mode.
- Student Display open state.

No PB-002E-FIX-02 session key is authorized.

## Accessibility Requirements

The shared section must provide:

- A semantic section heading.
- A visible presentation-mode group label.
- Programmatic grouping and selected states.
- Logical keyboard order: heading/guidance, mode controls, Open Student Display.
- Visible focus treatment.
- 44 CSS-pixel mode and Open targets.
- Clear disabled treatment for Message only when unavailable.
- Responsive wrapping without horizontal scrolling.

Student Display must remain outside the normal focus order except when opened and focused through the existing dialog behavior.

## Authorized Implementation Surface

Implementation may modify only:

- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`
- Focused PB-002E tests under `tests/platform/`
- Existing Platform presentation tests whose markup assertions directly conflict with the approved control relocation
- `docs/platform/builds/PB-002E/PB-002E-FIX-02-IMPLEMENTATION-NOTES.md`

Do not modify:

- `platform/scripts/lesson-timer.mjs`
- `platform/scripts/teacher-memo.mjs`
- `platform/scripts/student-display-mode.mjs`
- PB-001 session or fixture modules
- Existing controlling specifications
- Builder or Workshop files
- Assets
- `.vscode/settings.json`
- Unrelated files

If a prohibited file is required, stop for additional inspection.

## Protected Systems

Protect:

- PB-001 authentication, roles, routing, guards, entry, and sign-out protection.
- PB-002A TODAY workspace, reserved navigation, and placeholders.
- PB-002B Lesson Timer behavior, state, controls, persistence, Student Display restoration, and cleanup.
- PB-002C timer adjustment boundaries and Reset behavior.
- PB-002D Teacher Memo validation, persistence, clear behavior, and cleanup.
- PB-002D-FIX-01 saved/unsaved feedback.
- PB-002E Student Display presentation and classroom readability.
- PB-002E-FIX-01 presentation modes, preservation, persistence, and control separation.
- Builder.
- Workshop.
- Mission behavior.
- Existing assets.

## Explicitly Out of Scope

Do not implement:

- A fourth presentation mode.
- New timer or memo behavior.
- Reusable memo history or rich text.
- Images, pasted media, files, or attachments.
- Whiteboard.
- Engineering Headlines.
- Hall of Fame.
- Challenge Studio.
- Lesson stages or Mission integration.
- Teacher Feed, Wins, Blockers, Next Steps, jobs, credits, shoutouts, or summaries.
- Student controls, progress, tracking, analytics, or reports.
- Notifications, sounds, rewards, or animation.
- AI features.
- Google integrations.
- Backend persistence or cross-device synchronization.
- Builder or Workshop integration.
- New assets, routes, roles, frameworks, or dependencies.

## Required Focused Tests

Verify:

- Lesson Timer card contains no Open Student Display button.
- Teacher Memo card contains no mode group or Open Student Display button.
- One shared Student Display section appears below both cards.
- Shared section contains exactly three authorized mode controls.
- Shared section contains exactly one Open Student Display button.
- Existing mode labels and selected-state behavior remain unchanged.
- Message only remains disabled without a saved memo.
- Open uses the existing action and display owner.
- Escape returns focus to the shared Open button.
- No new route, role, session key, display owner, or mode is introduced.
- Card layout remains namespaced and responsive.
- Student Display remains control-free.

## Required Browser Inspection

Verify at minimum at 1024×600 and 1366×768:

- Timer and Teacher Memo cards are visibly shorter.
- Timer controls remain complete and usable.
- Memo editor, feedback, and saved message remain complete and usable.
- Shared Student Display section appears below both cards.
- Mode controls are clear and correctly selected.
- One Open Student Display button is obvious and usable.
- All three modes open correctly.
- Saved memo preservation and hidden timer continuity remain correct.
- Refresh restores mode and open display correctly.
- Escape returns focus to the shared Open button.
- No horizontal scrolling or console errors occur.

## Required Regression Testing

Verify:

- All Platform tests pass.
- PB-001 teacher and student flows remain protected.
- PB-002A TODAY layout remains intact outside the authorized card/control refinement.
- PB-002B timer behavior and Student Display restoration remain intact.
- PB-002C timer adjustments remain intact.
- PB-002D memo behavior and feedback remain intact.
- PB-002E Student Display presentation remains intact.
- PB-002E-FIX-01 modes, preservation, and refresh remain intact.
- Builder smoke test passes.
- Workshop tests and smoke test pass.
- Protected files and assets remain unchanged.

## Physical Chromebook Validation

At minimum verify:

- Shorter Timer card.
- Shorter Teacher Memo card.
- Shared Student Display control-section placement.
- All three presentation modes.
- One clear Open Student Display action.
- Keyboard and touchpad usability.
- Escape focus return.
- Saved memo preservation.
- Hidden timer continuity.
- Refresh restoration.
- Responsive layout and no horizontal scrolling.
- Classroom-distance presentation readability.
- PB-001 and PB-002A through PB-002E-FIX-01 regressions.
- Builder and Workshop smoke tests.

## Stop Conditions

Stop and request additional inspection if:

- Timer, memo, or presentation-mode models must change.
- A new route, role, session key, or Student Display owner is required.
- Essential timer or memo controls must be hidden or removed to shorten a card.
- The shared section cannot remain within the existing Command Board architecture.
- Student Display control separation would be weakened.
- A protected or unrelated file requires modification.
- The correction expands into a new Platform or Smart Board feature.

## Definition of Done

PB-002E-FIX-02 is complete only when:

- Timer and Teacher Memo cards are shorter without losing approved functionality.
- One shared Student Display section appears below both cards.
- Exactly three existing mode controls remain available.
- Exactly one Open Student Display button remains available.
- Student Display architecture and behavior remain unchanged.
- Refresh, Escape, sign-out, memo preservation, and timer continuity remain correct.
- Focused and regression tests pass.
- Browser inspection passes.
- Physical Chromebook validation passes.
- User approval is received.

No commit, tag, or push may occur until separately authorized.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- Card-layout changes.
- Shared-control-section placement.
- Focus behavior.
- Automated tests completed.
- Browser inspection results.
- Regression results.
- Physical Chromebook validation status.
- Known limitations.

This specification does not authorize implementation, staging, committing, tagging, or pushing.
