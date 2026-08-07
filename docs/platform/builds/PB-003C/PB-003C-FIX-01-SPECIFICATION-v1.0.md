# PB-003C-FIX-01 — Student Work Empty-State and Choice Hierarchy Refinement

## Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-003C — My STEM Work Experience  
Operation: Bounded presentation refinement only

## Controlling References

- `docs/platform/PLATFORM-BLUEPRINT-v1.0.md`
- `docs/platform/DEVELOPMENT-STANDARDS-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-DESIGN-DECISIONS-v1.0.md`
- `docs/platform/builds/PB-003C/PB-003C-MY-STEM-WORK-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003C/PB-003C-BUILD-SPECIFICATION-v1.0.md`
- Approved PB-003C implementation

## Purpose

Refine the PB-003C Student Home presentation so a student can quickly understand the difference between continuing existing engineering work and choosing a future path.

The refinement must improve language and visual priority without inventing projects, enabling unavailable actions, or adding a project, mission, evidence, or persistence system.

## Objective

Present student choices in this order of importance:

1. Continue verified current work when it exists.
2. Choose a future path when an approved choice is available.
3. Review recent and previous work when authoritative project history exists.
4. Understand that evidence connections are future supporting relationships.

PB-003C-FIX-01 remains an empty-state presentation foundation. Because no authoritative project or choice owner is added by this fix, it must not display an enabled Continue or Future Path action.

## Included Scope

Implement only:

- A student-first choice hierarchy.
- Strongest visual priority for Continue Current Work.
- A clearly secondary Future Path presentation.
- Calm, student-facing empty-state language.
- Visual distinction among current work, future choice, work history, and evidence relationships.
- Responsive, accessible Chromebook presentation.
- Focused tests for the refined hierarchy and language.
- Directly conflicting PB-003C test updates only when required by approved text or ordering changes.
- PB-003C-FIX-01 implementation notes.

## Explicitly Out of Scope

Do not implement:

- Project records, sample projects, fixtures, identity, classification, storage, persistence, or history.
- Continue Building launch behavior.
- Mission launch, assignment, availability, selection, or progress logic.
- Enabled or disabled placeholder buttons for unavailable actions.
- Builder or Workshop integration.
- Google Drive, Google Slides, or Google Vids integration.
- Evidence creation, viewing, synchronization, or review.
- New routes, navigation destinations, roles, session keys, or authentication behavior.
- Teacher controls, teacher visibility, reports, or review status.
- Credits, badges, rewards, rankings, analytics, AI, or speech technology.
- Application architecture changes or unrelated visual redesign.

## Student-First Choice Hierarchy

### Primary Choice: Continue Current Work

Continue Current Work is the first and strongest choice concept in the My STEM Work experience.

When an authoritative current project exists in a future approved build, this area may expose one primary Continue action for that verified project. PB-003C-FIX-01 does not create that owner or action.

In the current empty state:

- Keep the Current Work area first in the My STEM Work reading order.
- Use the visible cue `Continue Current Work` to explain the area's purpose.
- Do not render a project card, button, link, or focus target.
- Do not imply that work was lost, deleted, late, incomplete, or overlooked.

### Secondary Choice: Choose a Future Path

Future Path language explains where a student will make a new choice after no current work is available or after choosing not to continue it.

The presentation must:

- Use the visible cue `Choose a Future Path`.
- Explain that available mission choices will appear through the existing Mission Choice experience.
- Remain visually secondary to Continue Current Work.
- Preserve PB-003B's honest empty and Coming Later states.
- Avoid presenting a route, mission, or action that is not currently available.
- Avoid implying that a student must abandon current work to explore a future path.

PB-003C-FIX-01 may clarify the visual relationship between My STEM Work and the existing Mission Choice region, but it must not duplicate PB-003B mission cards or change mission behavior.

### Supporting Information: Recent, Previous, and Evidence

Recent Work, Previous Work, and Evidence Connections remain reference areas rather than primary student choices.

They must:

- Follow Continue Current Work and Future Path guidance in the visual hierarchy.
- Remain visually quieter than the two choice concepts.
- Preserve their existing organization and unavailable-state boundaries.
- Contain no fabricated history, evidence, dates, status, or source connections.

## Required Empty-State Language

Use concise, student-facing language with these meanings:

### Current Work

Primary message:

`You do not have current work to continue yet.`

Supporting message:

`When a project is ready, you can return to it here.`

### Future Path

Primary cue:

`Choose a Future Path`

Supporting message:

`Available mission choices will appear in Mission Choice.`

If no mission is available, the existing PB-003B empty state remains authoritative. Do not add a fake choice or imply that a choice is ready.

### Recent Work

Primary message:

`Your recent engineering work will appear here when it is available.`

### Previous Work

Primary message:

`Your earlier engineering work will appear here when it is available.`

### Evidence Connections

Preserve the honest unavailable meaning:

`Evidence cannot be checked right now.`

Builder, Workshop, Google Slides, and Google Vids remain noninteractive `Coming Later` relationships.

## Language Rules

All empty and unavailable states must:

- Address the student directly where natural.
- Use short sentences and familiar classroom language.
- Explain what the area is for without promising unavailable functionality.
- Avoid developer, database, integration, synchronization, or system-owner terminology in visible student copy.
- Avoid blame, urgency, judgment, false praise, failure language, and performance claims.
- Avoid implying teacher review, completion, progress, mastery, grades, or public visibility.
- Avoid suggesting that missing work has been deleted.

## Visual Hierarchy Requirements

- Continue Current Work receives the strongest visual treatment within My STEM Work.
- Future Path receives the second-strongest treatment and remains clearly connected to Mission Choice.
- Recent Work and Previous Work use coordinated secondary styling.
- Evidence Connections remains visually distinct and least prominent.
- The reading order and visual order must agree.
- Empty states must look intentional rather than disabled, broken, or unfinished.
- Unavailable content must not look clickable.
- No dead controls, empty focus targets, horizontal card rails, carousels, nested scrolling, or fixed heights that clip content.
- Long text must wrap safely at Chromebook and narrow widths.
- Use only namespaced Platform CSS and existing visual tokens.
- Add no new icons, images, assets, animation, framework, or dependency.

## Protected Systems

Preserve without behavior changes:

- PB-001 entry, authentication shell, roles, route guards, refresh restoration, and sign-out cleanup.
- PB-002 Teacher Command Center, timer, memo, and Student Display behavior.
- PB-003A Student Home orientation and privacy boundaries.
- PB-003B Mission Choice sections, states, and noninteractive foundation.
- PB-003C Current, Recent, Previous, project-card container, and evidence architecture.
- Builder and Workshop behavior, assets, persistence, mission flow, and navigation.

Stop implementation if the refinement requires a project owner, mission owner, new route, new stored state, or changes to Builder or Workshop.

## Privacy Requirements

PB-003C-FIX-01 must not display, store, transmit, or infer:

- A project, mission, activity, evidence item, file, revision, or date that has not been verified by an approved owner.
- Another student's identity, choices, work, evidence, or history.
- Class code, private identifier, raw student ID, project ID, file ID, or account information.
- Teacher-only notes, support signals, Feed content, reports, or review history.
- Rankings, comparisons, grades, quality judgments, progress, or public status.

My STEM Work content must remain private to the protected student experience and must not flow to Student Display, Smart Board, Hall of Fame, Teacher Feed, or another public surface.

## Accessibility Requirements

- Use semantic regions and logical heading levels.
- Preserve a DOM order matching the visual and screen-reader order.
- Associate every empty-state message with its subsection heading.
- Communicate hierarchy and unavailable states with text, structure, spacing, and contrast rather than color alone.
- Render Future Path guidance as noninteractive text unless a separately approved functional destination exists.
- Create no empty tab stops or disabled placeholder controls.
- Preserve visible focus treatment for existing enabled controls.
- Maintain readable contrast and scalable text.
- Support browser zoom and text resizing without clipping or overlap.
- Provide safe wrapping for long headings and messages.
- Require no hover, audio, pointer precision, or timed response to understand the experience.
- Preserve reduced-motion compatibility through the existing Platform foundation.

## Chromebook Validation Requirements

Physically verify on the target Chromebook:

- Continue Current Work is immediately recognizable as the first priority.
- Future Path is recognizable as the secondary choice concept.
- The relationship between Future Path and Mission Choice is understandable.
- No unavailable choice appears actionable.
- Current, Recent, Previous, and Evidence states are readable and not judgmental.
- The complete hierarchy remains clear without horizontal scrolling.
- Natural vertical scrolling works without nested scrolling or a carousel.
- Text wraps without clipping at common Chromebook and narrow widths.
- Browser zoom and text resizing preserve usable layout.
- Keyboard and touchpad navigation remain usable.
- Existing enabled controls retain visible focus.
- Refresh restores the protected Student Home correctly.
- Teacher/student wrong-role protection remains intact.
- Sign-out removes Student Home content.
- No stale or cross-student project, choice, or evidence information appears.
- No console errors, visible slowdown, or unexpected layout shift occurs.

Physical Chromebook validation is required and cannot be replaced by desktop inspection.

## Testing Requirements

### Focused Automated Tests

Verify:

- Continue Current Work precedes Future Path, Recent Work, Previous Work, and Evidence Connections in the authorized hierarchy.
- Required empty-state meanings and Future Path language are present.
- Current Work has the strongest namespaced visual treatment.
- Future Path has a clear secondary treatment.
- Recent, Previous, and Evidence remain supporting areas.
- No project data, evidence, history, date, progress, or teacher-review claim is fabricated.
- No new button, link, route, focus target, session key, integration, or network request is introduced.
- Builder, Workshop, Google Slides, and Google Vids remain noninteractive Coming Later labels.
- Responsive styles avoid horizontal card rails, nested scrolling, and clipped fixed-height content.

### Regression Tests

Run and pass:

- Full Platform automated test suite.
- PB-001 teacher/student entry, role, refresh, and sign-out regression checks.
- PB-002 Teacher Command Center, timer, memo, and Student Display regression checks.
- PB-003A Student Home regression checks.
- PB-003B Mission Choice regression checks.
- PB-003C My STEM Work regression checks.
- Full Workshop automated regression suite.
- Builder smoke test.
- Workshop smoke test.

### Inspection

Confirm:

- Only approved PB-003C-FIX-01 files changed.
- No application architecture, route, role, session, fixture, or protected-system behavior changed.
- No unrelated file, asset, Builder file, Workshop file, or `.vscode/settings.json` was modified.
- No file was staged, committed, tagged, or pushed before separate authorization.

## Definition of Done

PB-003C-FIX-01 is complete only when:

- The student-first hierarchy is clear.
- Continue Current Work has the approved first priority.
- Future Path has the approved secondary treatment and honest relationship to Mission Choice.
- Empty-state language is concise, student-facing, calm, and accurate.
- Recent Work, Previous Work, and Evidence Connections remain supporting areas.
- No unavailable action or fabricated project, mission, history, or evidence appears.
- Privacy and accessibility requirements are satisfied.
- Focused and regression tests pass.
- Builder and Workshop smoke tests pass.
- Inspection passes.
- Physical Chromebook validation passes.
- User approval is received.

No commit, tag, or push is permitted until separately authorized.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- Hierarchy and language changes.
- Focused test results.
- Regression results.
- Builder and Workshop smoke-test results.
- Inspection results.
- Known limitations.
- Physical Chromebook validation status.

