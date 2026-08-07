# PB-002E-FIX-01 — Smart Board Presentation Controls

## Fix Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-002E — Smart Board Presentation System  
Source Finding: PB-002E Chromebook/Classroom Validation Failure

## Purpose

Correct the PB-002E classroom presentation failures without redesigning the Lesson Timer, Teacher Memo, Student Display, routing, roles, or broader Platform architecture.

PB-002E-FIX-01 gives the teacher explicit control over which approved classroom information is publicly presented and improves combined-view readability from classroom distance.

This corrective build does not authorize future Smart Board features.

## Validation Findings Addressed

PB-002E physical validation found:

- The Class Message was not prominent enough from classroom viewing distance when displayed with the timer.
- The combined presentation needed the timer positioned closer to the top.
- Class Message typography needed to be larger.
- Timer-only presentation required clearing the saved memo.
- Clearing the memo was unacceptable because teachers may want to preserve or prepare a message for later presentation.
- Teachers needed direct control over Timer + Class Message, Class Message only, and Timer only presentations.

## Objective

Allow an authorized teacher to select one of three presentation modes while preserving existing timer and saved-memo state:

1. Timer + Class Message
2. Class Message only
3. Timer only

The selected mode must restore after refresh for the current teacher browser session and must never expose controls on Student Display.

## Included Scope

PB-002E-FIX-01 includes only:

- One teacher-only presentation-mode control group.
- Exactly three presentation modes.
- Mode-aware Student Display presentation.
- Saved memo preservation when the memo is hidden.
- Session-based mode restoration and sign-out cleanup.
- Improved combined-view timer placement.
- Improved combined-view Class Message typography and prominence.
- Focused automated, browser, regression, and physical validation.

## Presentation Modes

### Timer + Class Message

When a saved memo exists, show:

- THINKamigBOB identity.
- Today's Engineering Time.
- Remaining time.
- Class Message heading.
- Current saved memo.

The timer remains the visual anchor and must stay immediately identifiable. The Class Message is co-primary classroom information and must be readable without appearing as secondary fine print.

When no saved memo exists, Timer + Class Message must fail safely to a Timer only presentation. Do not render an empty message panel or public placeholder.

### Class Message Only

When a saved memo exists, show:

- THINKamigBOB identity.
- Class Message heading.
- Current saved memo.

Do not show:

- Today's Engineering Time heading.
- Remaining time.
- Timer state.
- Any teacher control.

The Lesson Timer may continue running in teacher-owned state while hidden. Selecting Class Message only must not pause, reset, end, or otherwise change the timer.

Class Message only is available only when a saved memo exists. If no memo exists, its teacher control must be disabled and the Student Display must remain or return Timer only.

### Timer Only

Show:

- THINKamigBOB identity.
- Today's Engineering Time.
- Remaining time.

Do not show the Class Message region, even when a saved memo exists.

Selecting Timer only must hide, not clear, the saved memo.

## Teacher Presentation Controls

Add one clearly labeled teacher-only control group:

`Student Display content`

Provide exactly three native controls:

- Timer + Message
- Message only
- Timer only

The controls must:

- Appear only on the protected Teacher Dashboard.
- Use a single-selection pattern with an accessible group label and selected state.
- Be keyboard and touchpad operable.
- Provide visible focus treatment.
- Provide at least 44 CSS pixels in the primary interaction dimension.
- Clearly indicate the active mode before Student Display opens.
- Remain available while Student Display is closed.
- Never appear inside Student Display.

The control group should be integrated beside the existing Student Display guidance and opening action using the smallest safe Teacher Command Center surface.

Do not duplicate the control group across the Lesson Timer and Teacher Memo cards.

Both existing Open Student Display buttons continue opening the same presentation using the currently selected mode.

## Mode Selection Behavior

Selecting a mode:

- Changes only Student Display presentation preference.
- Does not open Student Display automatically.
- Does not save, update, clear, or expose a memo.
- Does not start, pause, resume, reset, end, add time, or subtract time.
- Does not create history, analytics, events, notifications, or Teacher Feed entries.

If Student Display is already open, an accepted mode selection must update the presentation immediately without closing or reopening it. This behavior may be verified programmatically because teacher controls remain intentionally absent from the full-screen student-facing surface.

## Default and Fallback Behavior

When no valid presentation preference exists:

- Default to Timer + Class Message when a saved memo exists.
- Default to Timer only when no saved memo exists.

If Message only is selected and the saved memo is subsequently cleared:

- Normalize the selected presentation mode to Timer only.
- Keep Student Display open if it is already open.
- Show no empty Class Message panel.
- Do not affect the Lesson Timer.

If Timer + Class Message is selected and the memo is cleared:

- Keep the selected mode as Timer + Class Message.
- Present the safe Timer only fallback until a new memo is saved.
- Present the newly saved memo automatically when one becomes available again.

## Saved Memo Preservation

Presentation mode and memo state are independent.

- Timer only hides the saved memo without clearing it.
- Changing between modes never edits the memo.
- A hidden saved memo remains visible in the Teacher Memo card.
- A hidden saved memo continues restoring after refresh through the existing PB-002D record.
- Returning to a message-capable mode presents the same saved memo.
- Sign-out continues clearing the memo through the existing PB-002D cleanup.

Do not copy memo text into the presentation-mode record.

## Timer Preservation

Presentation mode and timer state are independent.

- Message only hides timer presentation without changing timer state.
- A Running timer continues counting while hidden.
- A Paused timer remains Paused while hidden.
- A Complete timer remains Complete while hidden.
- Returning to a timer-capable mode shows the authoritative current timer value.
- Refresh continues reconstructing the timer through the existing PB-002B state.

Do not copy timer state or remaining time into the presentation-mode record.

## Classroom Readability Correction

### Combined Mode

At supported Chromebook and classroom-display dimensions:

- Move the Engineering Time region closer to the top of the presentation.
- Preserve clear space between the timer and Class Message.
- Increase Class Message text size relative to the failed PB-002E presentation.
- Keep the Class Message heading visually distinct.
- Give the message enough width and vertical space for a 240-character memo.
- Prevent timer or message overlap, clipping, or horizontal scrolling.
- Keep remaining time immediately identifiable.
- Give timer and message comparable classroom attention without making their visual roles ambiguous.

The timer remains the pacing anchor. The message must function as equally actionable classroom direction when combined mode is selected.

### Message-Only Mode

- Center the Class Message composition within the available presentation surface.
- Use the largest responsive memo treatment that safely supports 240 characters.
- Avoid excessive empty space for short messages.
- Preserve safe line breaks and wrapping.

### Timer-Only Mode

- Preserve the approved balanced timer presentation.
- Do not reduce timer readability because other modes exist.

Do not lock the correction to one permanent pixel value or one display size. Use responsive relationships within namespaced Platform CSS.

## Session Persistence

PB-002E-FIX-01 may add one namespaced `sessionStorage` record containing only the selected presentation mode and schema version.

The record must:

- Be classroom-level for the current browser teacher session.
- Accept only the three authorized mode values.
- Restore after refresh.
- Fail closed to the approved default when missing, malformed, incompatible, or unknown.
- Clear on teacher sign-out.

Do not store:

- Memo text.
- Timer state or remaining time.
- Student data.
- Teacher activity history.
- Presentation history.
- Timestamps.
- Analytics.

No backend, database, `localStorage`, network persistence, or cross-device synchronization is authorized.

## Refresh Restoration

Refreshing the protected Teacher Dashboard must restore independently:

- Teacher authorization through PB-001.
- Student Display open state through PB-002B-FIX-01.
- Lesson Timer state through PB-002B/PB-002C.
- Saved memo through PB-002D.
- Selected presentation mode through PB-002E-FIX-01.

After refresh:

- The correct authorized mode is presented.
- Hidden memo and timer data remain preserved in their existing owners.
- Teacher controls remain absent from Student Display.
- No adjustment, save, clear, or mode change repeats.

## Escape and Focus Flow

Preserve PB-002E focus behavior:

- Student Display opens from either existing teacher opening control.
- Escape closes the display.
- Display open state clears.
- Focus returns to the exact teacher control that opened the display when it remains connected.

Mode selection must not replace or interfere with the opening-control focus owner.

## Sign-Out Cleanup

Teacher sign-out must clear:

- Student Display open state.
- Lesson Timer state.
- Teacher session.
- Teacher Memo state.
- Presentation-mode session state.

The existing locked cleanup behavior must remain intact. Add only the required presentation-mode cleanup without reordering or redesigning unrelated ownership.

## Student Display Control Separation

Student Display must contain no:

- Presentation-mode controls.
- Timer controls or adjustment controls.
- Memo editor, Save, Clear, or character count.
- Teacher navigation.
- Storage details.
- Hidden interactive elements.

Student Display remains a teacher-authorized, read-only classroom presentation.

## Accessibility and Chromebook Requirements

Teacher mode controls must provide:

- A persistent visible group label.
- Programmatic grouping and selected state.
- Native keyboard operation.
- Visible focus indication.
- Minimum 44 CSS-pixel interaction targets.
- Clear disabled presentation for Message only when no memo exists.
- Responsive wrapping without horizontal scrolling.

Student Display must provide:

- Semantic heading order appropriate to the selected mode.
- Readable contrast.
- Responsive type and spacing.
- No keyboard-focusable controls.
- Reduced-motion compatibility.
- Safe 240-character wrapping.

## Authorized Implementation Surface

Implementation may modify only:

- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`
- A new isolated presentation-mode module under `platform/scripts/` if inspection confirms it is the smallest safe persistence owner
- Focused PB-002E tests under `tests/platform/`
- `docs/platform/builds/PB-002E/PB-002E-FIX-01-IMPLEMENTATION-NOTES.md`

Do not modify:

- `platform/scripts/lesson-timer.mjs`
- `platform/scripts/teacher-memo.mjs`
- PB-001 session or fixture modules
- Existing controlling specifications
- Builder or Workshop files
- Assets
- `.vscode/settings.json`
- Unrelated files

If implementation requires a prohibited file, stop for additional inspection.

## Protected Systems

Protect:

- PB-001 authentication, roles, routes, guards, entry, and sign-out protection.
- PB-002A Teacher Command Board structure and reserved areas.
- PB-002B timer controls, states, persistence, display restoration, and cleanup.
- PB-002C adjustment boundaries, Reset behavior, and refresh behavior.
- PB-002D memo validation, persistence, clear behavior, and sign-out cleanup.
- PB-002D-FIX-01 save feedback and memo-card display access.
- PB-002E timer-only and combined presentation foundations outside the authorized correction.
- Builder.
- Workshop.
- Mission behavior.
- Existing assets.

## Explicitly Out of Scope

Do not implement:

- Reusable memo history or saved-memo library.
- Rich text, HTML, Markdown, bold, underline, headings, or subheadings.
- Teacher-selected colors or themes.
- Images, pasted media, files, or attachments.
- More than the three authorized presentation modes.
- Multiple pages, slides, playlists, or automatic mode rotation.
- Scheduled presentation changes.
- Lesson stages or stage timers.
- Missions, Wins, Blockers, Next Steps, Teacher Feed, shoutouts, reminders, jobs, credits, Hall of Fame, or end-of-class summaries.
- Whiteboard or Challenge Studio.
- Student tracking, analytics, or reports.
- Notifications, sounds, rewards, or decorative animation.
- AI-generated content or pacing suggestions.
- Google integrations.
- Backend persistence or cross-device synchronization.
- Builder or Workshop integration.
- Workshop Smart Board changes.
- New image or media assets.

## Required Focused Tests

Verify:

- Exactly three authorized mode values exist.
- Invalid mode values fail to the approved default.
- Default is combined when a saved memo exists and timer-only when it does not.
- Timer + Class Message shows both authorized regions.
- Class Message only hides timer presentation but preserves timer state.
- Timer only hides memo presentation but preserves saved memo state.
- Message only is disabled without a saved memo.
- Clearing a memo from Message only normalizes to Timer only.
- Clearing a memo from combined retains combined preference with timer-only fallback.
- Saving a new memo restores message presentation in combined mode.
- Mode restores after refresh without repeating an action.
- Sign-out clears mode state.
- Both opening controls use the selected mode.
- Escape focus return remains correct.
- Student Display contains no controls.
- No memo text or timer state is stored in the mode record.
- No fourth mode or future feature is introduced.

## Required Browser Inspection

Verify:

- All three teacher mode controls are clear and accessible.
- Message only is disabled when no memo is saved.
- Timer + Class Message opens correctly.
- Class Message only opens correctly.
- Timer only opens correctly while preserving the saved memo.
- Switching modes does not clear memo or change timer state.
- Combined mode moves the timer upward and increases message readability.
- Short and maximum-length memos are readable in combined and message-only modes.
- Running, Paused, and Complete timers remain accurate after being hidden and shown.
- Mode selection restores after refresh.
- Open Student Display restores after refresh in each mode.
- Escape returns focus correctly from both opening controls.
- Teacher controls remain hidden.
- No horizontal scrolling or console errors occur.

## Required Regression Testing

Verify:

- All Platform tests pass.
- PB-001 teacher and student flows remain protected.
- PB-002A Command Board remains intact.
- PB-002B timer behavior, refresh, display restoration, and cleanup remain intact.
- PB-002C timer adjustments and Reset remain intact.
- PB-002D memo save, update, clear, restoration, and cleanup remain intact.
- PB-002D-FIX-01 usability feedback remains intact.
- PB-002E existing display and focus flow remain intact.
- Builder smoke test passes.
- Workshop tests and smoke test pass.
- Protected files and assets remain unchanged.

## Physical Chromebook and Classroom Validation

At minimum verify:

- All three teacher presentation controls.
- Timer + Class Message mode.
- Class Message only mode.
- Timer only mode with saved memo preserved.
- Combined-view timer placement.
- Combined-view message size and classroom-distance readability.
- Short and maximum-length message readability.
- Timer readability in timer-capable modes.
- Running timer continuity while hidden in Message only.
- Saved memo preservation while hidden in Timer only.
- Mode and open-display restoration after refresh.
- Correct Escape focus return from both opening controls.
- Teacher-control separation.
- Responsive layout and no horizontal scrolling.
- Keyboard and touchpad usability.
- PB-001 and PB-002A through PB-002E regressions.
- Builder and Workshop smoke tests.

Physical validation cannot be replaced by local browser inspection.

## Stop Conditions

Stop and request additional inspection if:

- Timer or memo models must change.
- A new route, role, login, or Student Display owner is required.
- More than one presentation-preference record is required.
- Mode selection cannot preserve hidden timer and memo state.
- Existing refresh, Escape, or sign-out protection must be replaced.
- Student Display cannot remain control-free.
- A protected file, asset, framework, backend, or integration is required.
- The correction expands into a future Smart Board feature.

## Definition of Done

PB-002E-FIX-01 is complete only when:

- Teachers can choose all three authorized modes without clearing a saved memo.
- Timer and memo state remain independent from presentation preference.
- Combined mode is readable from classroom distance.
- Message-only and timer-only modes are balanced and accurate.
- Mode and open display restore correctly after refresh.
- Escape and sign-out cleanup remain correct.
- Student Display remains teacher-authorized and control-free.
- Protected Platform, Builder, and Workshop behavior remains intact.
- Focused and regression tests pass.
- Browser inspection passes.
- Physical Chromebook and classroom validation passes.
- User approval is received.

No commit, tag, or push may occur until separately authorized.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- Presentation-mode state design.
- Mode and fallback behavior.
- Readability corrections.
- Automated tests completed.
- Browser inspection results.
- Regression results.
- Physical Chromebook validation status.
- Known limitations and deferred requests.

This specification does not authorize implementation, staging, committing, tagging, or pushing.
