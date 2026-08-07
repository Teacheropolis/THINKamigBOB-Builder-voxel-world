# PB-003C-FIX-02 — Student Choice Visual Hierarchy Refinement

## Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-003C — My STEM Work Experience  
Depends On: PB-003C-FIX-01 — Student Work Empty-State and Choice Hierarchy Refinement  
Operation: Bounded visual and language refinement only

## Controlling References

- `docs/platform/PLATFORM-BLUEPRINT-v1.0.md`
- `docs/platform/DEVELOPMENT-STANDARDS-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-DESIGN-DECISIONS-v1.0.md`
- `docs/platform/builds/PB-003C/PB-003C-MY-STEM-WORK-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003C/PB-003C-BUILD-SPECIFICATION-v1.0.md`
- `docs/platform/builds/PB-003C/PB-003C-FIX-01-SPECIFICATION-v1.0.md`
- Approved PB-003C and PB-003C-FIX-01 implementations

## Purpose

Improve how quickly a student can distinguish continuing current work, choosing a future path, reviewing work history, and understanding future evidence relationships.

PB-003C-FIX-02 changes presentation only. It must not create project choices, mission choices, launch behavior, storage, evidence, or integrations.

## Objective

Create a clear student-facing choice hierarchy in which:

1. Continue Current Work is immediately recognizable as the primary choice category.
2. Choose a Future Path is recognizable as a separate secondary choice category.
3. Recent Work and Previous Work are recognizable as history categories rather than active choices.
4. Evidence Connections is recognizable as future supporting information.

Every unavailable category remains visibly noninteractive and honest.

## Included Scope

Implement only:

- Stronger visual priority for Continue Current Work.
- Clear visual separation between active-choice concepts, work-history categories, and evidence relationships.
- Student-friendly category labels and supporting language.
- Supplemental color and icon guidance using approved existing presentation techniques.
- Responsive, accessible Chromebook presentation.
- Focused visual-contract tests.
- Directly conflicting PB-003C or FIX-01 test updates only when required by approved presentation changes.
- PB-003C-FIX-02 implementation notes.

## Explicitly Out of Scope

Do not implement:

- Project, mission, choice, evidence, history, or progress data.
- Enabled or disabled action controls.
- Continue, Start, Open, View, or launch behavior.
- New routes, navigation destinations, roles, session keys, storage, or persistence.
- Builder, Workshop, Google Drive, Google Slides, or Google Vids integration.
- Read-Aloud, speech technology, sound, animation, or AI.
- Teacher controls, teacher visibility, reports, or review status.
- Credits, badges, rewards, rankings, analytics, or public recognition.
- New image, SVG, font, icon-library, framework, package, dependency, or network request.
- Application architecture changes or unrelated Student Home redesign.

## Continue Current Work Priority

Continue Current Work remains the first and strongest concept inside My STEM Work.

The presentation must:

- Keep `Continue Current Work` before Future Path, Recent Work, Previous Work, and Evidence Connections in DOM, visual, screen-reader, and responsive order.
- Use the strongest approved border, surface, spacing, and heading treatment within My STEM Work.
- Keep the approved Current Work empty-state language from PB-003C-FIX-01.
- Make the category purpose recognizable without making the empty state look enabled or clickable.
- Avoid button-like framing, hover affordances, pointer cursors, action verbs presented as controls, or an empty focus target.

No current project, project card, or Continue action is authorized.

## Choice Category Separation

### Continue Category

Visible category label:

`Continue Current Work`

Meaning: Return to verified current engineering work when a future approved project owner and launch contract exist.

Current state: Informational and noninteractive.

### Future Choice Category

Visible category label:

`Choose a Future Path`

Meaning: Understand where future mission choices will appear through the existing Mission Choice experience.

Current state: Informational and noninteractive. It remains secondary to Continue Current Work and must not duplicate PB-003B mission cards.

### Work History Category

Visible group cue:

`Look Back at Your Work`

Meaning: Explain that Recent Work and Previous Work will organize verified work history when an authoritative source exists.

Current state: Informational and noninteractive. Recent and Previous retain separate semantic headings and their approved FIX-01 empty-state language.

### Evidence Category

Visible category label:

`Evidence Connections`

Meaning: Describe future supporting relationships with approved evidence sources.

Current state: Informational and noninteractive. Preserve `Evidence cannot be checked right now.` and the four Coming Later relationships.

## Required Reading Order

Use the following DOM, visual, screen-reader, and responsive order inside My STEM Work:

1. My STEM Work heading and engineering-journey guidance.
2. Continue Current Work.
3. Choose a Future Path.
4. Look Back at Your Work group cue.
5. Recent Work.
6. Previous Work.
7. Evidence Connections.

The group cue must not introduce an extra interactive layer or hide the semantic Recent and Previous headings.

## Visual Distinction Rules

### Primary Treatment

Continue Current Work must use:

- The strongest existing Platform accent treatment inside My STEM Work.
- A clear surface boundary.
- The greatest category emphasis through heading size, weight, spacing, or border strength.
- Natural height based on content.

### Secondary Choice Treatment

Choose a Future Path must use:

- A distinct secondary accent.
- Less visual weight than Continue Current Work.
- More visual weight than Recent, Previous, and Evidence.
- Clear spatial separation from the history group.

### History Treatment

Recent Work and Previous Work must:

- Appear as a coordinated pair under `Look Back at Your Work`.
- Use quieter surfaces and borders than both choice categories.
- Remain visually distinguishable from each other through headings and text, not color alone.
- Avoid suggesting that Previous means failed, abandoned, low quality, or unimportant.

### Evidence Treatment

Evidence Connections must:

- Remain the least prominent category.
- Use a clearly informational treatment such as the existing dashed boundary.
- Preserve readable Coming Later labels without making them look like controls.

### Prohibited Visual Treatment

Do not add:

- Button-like cards for unavailable categories.
- Hover elevation, press states, pointer cursors, or action animation.
- Horizontal carousels, card rails, nested scrolling, or clipped fixed heights.
- Decorative complexity that competes with Student Home orientation or Mission Choice.
- New assets or unapproved branding.

## Color Guidance

- Use only existing Platform color tokens or values already established by the Platform visual system.
- Use one consistent primary accent for Continue Current Work.
- Use a clearly distinct existing secondary accent for Choose a Future Path.
- Use coordinated neutral or subdued treatments for work history and Evidence Connections.
- Maintain required text and boundary contrast in every state.
- Never use color as the only way to communicate category, priority, availability, or meaning.
- Do not use red, warning, success, grade-like, or traffic-light colors to imply performance or status.
- Do not create new theme variables or color systems unless a separate inspection authorizes them.

## Icon Guidance

Icons are optional supplemental cues, not required content.

If implementation uses icons, it must:

- Use only characters or icon techniques already approved and available without adding assets or dependencies.
- Use no more than one simple decorative cue per category heading.
- Keep the category's text label visible.
- Mark decorative icons so assistive technology does not announce redundant content.
- Preserve meaning when icons are hidden, unsupported, or not perceived.
- Avoid platform, company, trophy, badge, grade, warning, or completion imagery.
- Avoid making an informational category resemble an enabled control.

If no existing icon treatment meets these conditions, omit icons and use text, spacing, borders, and color instead.

## Student-Friendly Labels and Language

Required visible labels:

- `Continue Current Work`
- `Choose a Future Path`
- `Look Back at Your Work`
- `Recent Work`
- `Previous Work`
- `Evidence Connections`

Preserve the approved PB-003C-FIX-01 empty-state meanings:

- `You do not have current work to continue yet.`
- `When a project is ready, you can return to it here.`
- `Available mission choices will appear in Mission Choice.`
- `Your recent engineering work will appear here when it is available.`
- `Your earlier engineering work will appear here when it is available.`
- `Evidence cannot be checked right now.`

Visible language must:

- Use familiar classroom words and short sentences.
- Address the student directly where natural.
- Explain category purpose without promising unavailable behavior.
- Avoid developer, integration, database, synchronization, or system-owner terminology.
- Avoid blame, judgment, urgency, false praise, or failure language.
- Avoid implying progress, completion, mastery, grades, teacher review, or public visibility.

## Privacy Requirements

PB-003C-FIX-02 must not display, store, transmit, or infer:

- An unverified project, mission, choice, evidence item, date, revision, or history entry.
- Another student's identity, work, choices, evidence, or history.
- Class code, private identifier, raw student ID, project ID, file ID, or account details.
- Teacher-only notes, support signals, Feed content, reports, or review history.
- Rankings, comparisons, grades, quality judgments, or public status.

My STEM Work must remain private to the protected student experience and must not flow to Student Display, Smart Board, Teacher Feed, Hall of Fame, or another public surface.

## Accessibility Requirements

- Preserve semantic regions and logical heading levels.
- Match DOM, visual, screen-reader, and responsive order.
- Associate empty-state messages with their category headings.
- Preserve Recent Work and Previous Work as separately identifiable subsections under the history group.
- Communicate hierarchy through text, structure, headings, spacing, borders, and contrast—not color or icons alone.
- Keep all unavailable categories out of the tab order.
- Add no dead controls, empty focus targets, hover-only information, or audio-only information.
- Preserve visible focus for existing enabled controls elsewhere on Student Home.
- Maintain readable text and boundary contrast.
- Support text resizing and browser zoom without clipping, overlap, or loss of order.
- Wrap headings, labels, and empty-state text safely.
- Preserve reduced-motion compatibility through the existing Platform foundation.
- Decorative icons, if used, must be hidden from assistive technology.

## Chromebook Validation Requirements

Physically verify on the target Chromebook:

- Continue Current Work is recognized first without explanation.
- Choose a Future Path is recognized as a separate secondary category.
- Look Back at Your Work clearly groups Recent and Previous Work.
- Evidence Connections is recognizable as supporting future information.
- Students can distinguish all categories without relying on color or icons.
- No unavailable category looks clickable.
- No horizontal scrolling, card carousel, or nested scrolling appears.
- Natural vertical scrolling remains smooth.
- Labels and messages wrap without clipping at common Chromebook and narrow widths.
- Browser zoom and text resizing preserve order and readability.
- Keyboard and touchpad behavior remain correct.
- Existing enabled controls retain visible focus.
- Refresh restores the protected Student Home correctly.
- Teacher/student wrong-role protection remains intact.
- Sign-out removes Student Home content.
- No stale or cross-student work, choice, or evidence information appears.
- No console error, significant slowdown, or unexpected layout shift occurs.

Physical Chromebook validation is required and cannot be replaced by desktop inspection.

## Protected Systems

Preserve without behavior changes:

- PB-001 authentication shell, entry flows, roles, route guards, refresh restoration, and sign-out cleanup.
- PB-002 Teacher Command Center, timer, memo, Student Display, and presentation modes.
- PB-003A Student Home orientation, BOB Welcome, Goal, Yesterday, and Reflection foundations.
- PB-003B Mission Choice structure, empty states, and Coming Later behavior.
- PB-003C project-card containers, work organization, evidence boundaries, and source relationships.
- PB-003C-FIX-01 hierarchy, empty-state meanings, privacy, and noninteractive behavior.
- Builder and Workshop behavior, assets, navigation, persistence, mission flow, rendering, camera, geometry, and measurements.
- Existing Platform assets and visual tokens.
- `.vscode/settings.json` and unrelated files.

Stop implementation if the refinement requires new functionality, data, stored state, assets, dependencies, routes, or protected-system changes.

## Testing Requirements

### Focused Automated Tests

Verify:

- Required category labels are present exactly once in the authorized My STEM Work presentation.
- Continue Current Work precedes all other My STEM Work categories.
- Future Path precedes the history group and Evidence Connections.
- Look Back at Your Work groups Recent and Previous without removing their semantic headings.
- Required FIX-01 empty-state meanings remain present.
- Namespaced styles establish primary, secondary-choice, history, and evidence treatments.
- Category meaning is present in text and structure rather than color or icons alone.
- Any decorative icon is hidden from assistive technology and has no interactive behavior.
- No button, link, route, focus target, stored state, project data, mission data, evidence data, or integration is introduced.
- Responsive styles contain no horizontal card rail, carousel, nested scrolling, or clipped fixed height.

### Regression Tests

Run and pass:

- Full Platform automated test suite.
- PB-001 teacher/student entry, role, refresh, and sign-out regressions.
- PB-002 Teacher Command Center, timer, memo, and Student Display regressions.
- PB-003A Student Home regressions.
- PB-003B Mission Choice regressions.
- PB-003C and PB-003C-FIX-01 regressions.
- Full Workshop automated regression suite.
- Builder smoke test.
- Workshop smoke test.

### Final Inspection

Confirm:

- Only approved PB-003C-FIX-02 implementation files changed.
- No route, role, session, storage, fixture, data, integration, asset, or architecture change occurred.
- No Builder, Workshop, `.vscode/settings.json`, or unrelated file was modified.
- No file was staged, committed, tagged, or pushed before separate authorization.

## Definition of Done

PB-003C-FIX-02 is complete only when:

- Continue Current Work is the unmistakable first priority.
- Future Path is a distinct secondary choice category.
- Recent and Previous Work are clearly grouped as work history.
- Evidence Connections is clearly supporting future information.
- Student-friendly labels and approved empty-state meanings are present.
- Category meaning does not depend on color or icons.
- No unavailable category appears interactive.
- No functionality, data, storage, route, integration, asset, or dependency was added.
- Privacy and accessibility requirements are satisfied.
- Focused and regression tests pass.
- Builder and Workshop smoke tests pass.
- Final inspection passes.
- Physical Chromebook validation passes.
- User approval is received.

No commit, tag, or push is permitted until separately authorized.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- Choice hierarchy and label changes.
- Color and icon decisions.
- Focused test results.
- Regression results.
- Builder and Workshop smoke-test results.
- Inspection results.
- Known limitations.
- Physical Chromebook validation status.

