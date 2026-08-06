# PB-002D — Teacher Memo

## Build Specification v1.0

Status: Draft specification pending review and approval
Parent Build: PB-002 — Teacher Classroom Command Center
Protected Baseline: PB-002C — Timer Adjustment / `v0.4.0`

## Purpose

Replace the existing Teacher Memo placeholder with one simple, optional classroom message controlled by the authorized teacher.

The Teacher Memo provides a short class-wide reminder or agenda without introducing missions, scheduling, notifications, student-specific messaging, or a Teacher Feed.

## Objective

Allow an authorized teacher to create, save, update, display, and clear one plain-text classroom memo for the current browser session.

The saved memo appears on the existing Teacher Classroom Command Board and, when present, appears read-only on the existing Student Display.

## Included Scope

### Teacher Memo Editor

Replace only the existing Teacher Memo placeholder within the PB-002A Teacher Command Board.

Provide:

- One clearly labeled plain-text memo field.
- Save Memo.
- Update Memo through the same field and Save Memo action.
- Clear Memo.
- Current character count.
- Clear validation and status feedback.

The memo editor must be available only on the protected Teacher Dashboard route.

### Plain-Text Boundary

The memo must:

- Accept plain text only.
- Contain no more than 240 characters.
- Trim leading and trailing whitespace before saving.
- Preserve intentional internal spaces and line breaks.
- Reject an empty or whitespace-only Save action.
- Render as text rather than executable markup.

The 240-character maximum keeps the memo readable on Chromebook and Student Display layouts while allowing a concise classroom reminder or agenda.

Do not support:

- Rich text.
- HTML.
- Markdown rendering.
- Links or link previews.
- Images, files, or attachments.
- Embedded media.

### Save and Update Behavior

Save Memo stores the validated current field value.

- Saving when no memo exists creates the current memo.
- Saving when a memo exists replaces that memo.
- Only one memo may exist at a time.
- Saving must not create history, versions, events, notifications, or Teacher Feed entries.
- The saved memo must immediately update its Teacher Command Board and Student Display presentations.

### Clear Behavior

Clear Memo removes the current memo from session state.

- Clear must be disabled when no saved memo exists.
- Clearing must return the Teacher Memo card to an honest empty state.
- Clearing must immediately remove the memo from Student Display.
- Clear must not affect the Lesson Timer or Student Display open/closed state.

No delete history, recovery, undo, or confirmation workflow is authorized.

### Teacher Command Board Presentation

The existing Teacher Memo card must display:

- Teacher Memo heading.
- Memo editor.
- Character count.
- Save Memo control.
- Clear Memo control.
- Current saved memo, or a clear empty-state message when no memo is saved.
- Accessible validation and save/clear status feedback.

No other PB-002A card or navigation area may change.

### Student Display Presentation

When a saved memo exists, the existing Student Display must show:

- Today's Engineering Time.
- Remaining Lesson Timer time.
- The saved Teacher Memo as read-only class-wide text.

When no saved memo exists:

- No empty memo panel or placeholder is required on Student Display.
- The existing timer-focused Student Display remains intact.

Student Display must not expose:

- The memo editor.
- Save or Clear controls.
- Character count.
- Validation or internal status.
- Storage details.
- Teacher-only timer controls.

The memo must remain class-safe. PB-002D provides no automatic moderation or safety classification; the authorized teacher remains responsible for the message.

## Session and Data Rules

Use one PB-002D-namespaced `sessionStorage` record.

The stored state may contain only:

- A schema version.
- The current saved memo text.

The state is:

- Classroom-level within the current development session.
- Teacher-controlled.
- Browser-session-based.
- Restored after refresh.
- Cleared on teacher sign-out.

Invalid, malformed, non-string, oversized, or incompatible stored data must fail closed to the empty memo state.

Do not store:

- Memo history or timestamps.
- Teacher activity history.
- Student identifiers or student-specific messages.
- Mission data.
- Timer data in the memo record.
- Analytics.
- Grades.
- Support signals.

Do not add localStorage, cookies, IndexedDB, a backend, database, network request, or cross-device synchronization.

## Architecture Requirements

The implementation must:

- Use the existing PB-001 teacher role and protected Teacher Dashboard route.
- Integrate only with the existing PB-002A Teacher Memo card.
- Reuse the existing PB-002B Student Display presentation.
- Remain independent from the PB-002B/PB-002C Lesson Timer state.
- Keep memo state and validation isolated and deterministic.
- Use existing Platform escaping and safe text-rendering practices.
- Keep existing hash routing and namespaced Platform CSS and JavaScript.
- Add no framework or external dependency.

A small isolated memo-state module is permitted.

## Proposed Implementation Surface

Application changes must be limited to:

- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`
- `platform/scripts/teacher-memo.mjs`, if an isolated state module is required

Testing changes must be limited to:

- One isolated PB-002D test file under `tests/platform/`, or
- A bounded addition to an existing Platform test when necessary for protected regression coverage

Implementation and validation notes may be created only under:

- `docs/platform/builds/PB-002D/`

Any additional application-file modification requires further inspection and approval.

## Explicitly Out of Scope

Do not implement:

- Mission selection, assignment, or integration.
- Lesson stages or automatic transitions.
- Scheduled, timed, or recurring messages.
- Memo history, versions, drafts, undo, or recovery.
- Rich text, HTML, Markdown rendering, links, or attachments.
- Student-specific or private messages.
- Student-authored messages or replies.
- Teacher Feed logic or events.
- Wins, Blockers, or Next Steps logic.
- Notifications or announcements outside the existing Student Display.
- Automated moderation or AI safety classification.
- Analytics or reports.
- Google integrations.
- Builder integration.
- Workshop integration.
- Backend, database, production authentication, or cross-device persistence.
- Any future Platform feature.

## Protected Systems

Do not change or break:

- PB-001 authentication, roles, routing, entry, and sign-out protection.
- PB-002A Teacher Command Board layout outside the Teacher Memo card.
- PB-002A reserved navigation and honest placeholders.
- PB-002B Lesson Timer controls, states, persistence, refresh, and Student Display restoration.
- PB-002C timer adjustment controls, boundaries, Reset behavior, persistence, and validation.
- Student entry and Student Dashboard behavior.
- Builder.
- Workshop.
- Mission behavior.
- Existing assets.
- Existing approved specifications and implementation notes.
- Unrelated repository files, including `.vscode/settings.json`.

## Accessibility and Chromebook Requirements

The Teacher Memo must provide:

- A persistent visible label for the memo field.
- Native keyboard-accessible controls.
- Visible focus treatment through existing Platform styles.
- At least 44 CSS pixels in the primary interaction dimension for Save and Clear.
- Programmatically associated character-count guidance.
- Accessible validation feedback.
- Accessible save and clear status feedback that does not steal focus.
- Readable contrast.
- Responsive wrapping without horizontal scrolling.

Student Display memo text must:

- Be readable at Chromebook and classroom-display sizes.
- Preserve safe line wrapping.
- Avoid covering or reducing the readability of the Lesson Timer.
- Remain outside keyboard focus and expose no controls.

## Testing Requirements

### Focused State Tests

Verify:

- Initial empty memo state.
- Valid plain-text Save.
- Update replaces the single current memo.
- Leading and trailing whitespace are trimmed.
- Internal spaces and line breaks are preserved.
- Empty and whitespace-only Save fail safely.
- The 240-character boundary is accepted.
- More than 240 characters are rejected.
- Malformed, incompatible, non-string, and oversized restored data fail closed.
- Clear returns to the empty memo state.
- Repeated Save and Clear operations remain stable.
- Timer state is never read or changed by the memo model.

### Refresh and Session Tests

Verify:

- Saved memo restores after refresh.
- Updated memo restores after refresh.
- Cleared memo does not return after refresh.
- Teacher sign-out clears memo session state.
- Student sign-in cannot restore or access teacher memo controls.
- Teacher and student route guards remain intact.

### Presentation Tests

Verify:

- The Teacher Memo editor appears only on the Teacher Dashboard.
- Saved memo appears immediately on the Teacher Command Board.
- Saved memo appears read-only on Student Display.
- Clearing removes the Student Display memo without closing the display.
- Student Display contains no memo controls, character count, validation, or storage details.
- Plain-text characters are rendered safely and cannot create markup or executable content.
- Existing timer and adjustment presentations remain unchanged.

### Accessibility and Responsive Tests

Verify at minimum at 1366×768 and 1024×600:

- Save and Clear targets meet the 44-pixel requirement.
- Field, character count, controls, and status feedback remain readable.
- Keyboard navigation and activation work.
- Touchpad interaction works.
- Memo and timer remain readable on Student Display.
- Long permitted text wraps safely.
- No horizontal scrolling occurs.
- No console errors occur.

### Regression Tests

Verify:

- All Platform tests pass.
- PB-001 teacher and student entry protections remain functional.
- PB-002A layout and reserved areas remain intact.
- PB-002B timer, refresh, sign-out, and Student Display behavior remain functional.
- PB-002C adjustments, boundaries, Reset, and refresh behavior remain functional.
- Builder smoke test passes.
- Workshop tests and smoke test pass.
- Protected files and assets remain unchanged.

### Chromebook Validation

Physical Chromebook validation is required after implementation and inspection.

At minimum verify:

- Save, update, and clear.
- Empty and oversized validation.
- Character count.
- Refresh restoration.
- Sign-out cleanup.
- Teacher-only editor access.
- Student Display memo presentation and control separation.
- Timer and adjustment coexistence.
- Responsive layout, keyboard, and touchpad usability.
- PB-001 and PB-002A through PB-002C regressions.
- Builder and Workshop smoke tests.

## Stop Conditions

Stop implementation and return to inspection if:

- A backend, database, production account, new route, or new role is required.
- Existing timer state or ownership must change.
- Existing Student Display restoration must be replaced.
- Memo presentation cannot remain class-wide and control-free.
- Student-specific data or messaging becomes necessary.
- A protected or unrelated file requires modification.
- Builder, Workshop, or Mission behavior changes.

## Definition of Done

PB-002D is complete only when:

- The teacher can save, update, and clear one bounded plain-text memo.
- Memo state restores after refresh and clears on sign-out.
- The Teacher Command Board and Student Display present the current memo correctly.
- Student Display remains read-only and control-free.
- PB-001 and PB-002A through PB-002C remain intact.
- Focused and regression tests pass.
- Physical Chromebook validation passes.
- The user approves the completed build.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- State and validation decisions.
- Tests completed.
- Regression results.
- Chromebook validation result.
- Known limitations.

Do not commit, tag, or push until separately authorized.
