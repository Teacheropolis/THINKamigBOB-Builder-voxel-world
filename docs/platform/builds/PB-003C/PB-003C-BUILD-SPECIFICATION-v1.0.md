# PB-003C — My STEM Work Experience

## Build Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-003 — Student Dashboard Experience  
Foundation: PB-003A Student Home and PB-003B Mission Choice

## Controlling References

- `docs/platform/PLATFORM-BLUEPRINT-v1.0.md`
- `docs/platform/DEVELOPMENT-STANDARDS-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-DESIGN-DECISIONS-v1.0.md`
- `docs/platform/builds/PB-003C/PB-003C-MY-STEM-WORK-EXPERIENCE-BLUEPRINT-v1.0.md`
- PB-003C Blueprint Review: PASS

## Architecture Finding

The current Platform has no approved cross-system project identity, Current/Recent/Previous classification, resumable project owner, evidence owner, Builder connection, Workshop connection, or Google Slides/Vids integration.

Existing Builder, Workshop, mission, and Google-related assets or behavior do not constitute an approved My STEM Work data source and must remain protected.

Therefore PB-003C v1.0 is an honest My STEM Work layout and empty-state foundation only. It must not display fabricated projects or evidence and must not enable Continue Building or source-application actions.

## Build Objective

Add a clear, private, accessible My STEM Work region to the existing Student Home that:

- Presents engineering work as one continuing journey.
- Establishes Current, Recent, and Previous organization.
- Places Current Work and future Continue Building behavior first.
- Reserves a project-card structure without inventing projects.
- Establishes evidence-connection boundaries.
- Communicates protected future relationships with Builder, Workshop, Google Slides, and Google Vids.
- Uses honest empty states while authoritative owners are unavailable.
- Preserves student privacy, teacher-review opacity, and Chromebook usability.

PB-003C does not implement a project system, portfolio, evidence integration, or activity history.

## Primary User

Student authenticated through the existing PB-001 entry flow and viewing the existing PB-003A Student Home route.

The My STEM Work region should answer:

> Is any project ready to continue, and where will my recent and previous engineering work appear?

without implying that unconnected data exists.

## Required User Flow

```text
Existing Student Entry
→ Existing protected Student Home route
→ My STEM Work region
→ Current Work
→ Recent Work
→ Previous Work
→ Evidence Connections reserved state
```

No new route, role, redirect, navigation destination, storage owner, session key, or external link is authorized.

## Included Scope

Implement only:

- One My STEM Work region on the existing Student Home.
- Student engineering journey guidance.
- Current Work subsection.
- Current Work empty state.
- Continue Building reserved behavior communicated without an action control.
- Recent Work subsection.
- Recent Work empty state.
- Previous Work subsection.
- Previous Work empty state.
- Empty responsive project-card containers reserved for future authoritative cards.
- Evidence Connections reserved subsection.
- Evidence unavailable state.
- Visible future-source relationship labels for Builder, Workshop, Google Slides, and Google Vids.
- Clear Coming Later treatment for every unconnected source.
- Namespaced My STEM Work CSS.
- Responsive and accessible presentation.
- Focused PB-003C tests.
- Directly conflicting PB-003A/PB-003B test updates only if required by placement assertions.
- PB-003C implementation notes.

## Explicitly Out of Scope

Do not implement:

- Project identity, fixtures, sample projects, project creation, storage, persistence, history, or classification logic.
- Enabled project cards.
- Continue Building behavior or control.
- Current, Recent, or Previous data queries or state movement.
- Last-saved, last-opened, session, revision, or active-time tracking.
- Mission integration.
- Builder launch, save, data transfer, return, or integration.
- Workshop launch, save, data transfer, return, or integration.
- Google Slides, Google Vids, Google Drive, account, file, sharing, or portfolio integration.
- Evidence upload, ingestion, copying, connection, viewing, deletion, or synchronization.
- Growth timeline or calculation.
- Reflection form, response, status, interpretation, duplication, summary, or score.
- Teacher visibility, review status, support signals, progress, or reports.
- Rename, pin, sort, filter, group, archive, restore, or delete controls.
- Credits, badges, jobs, Help, profile, notification, reward, ranking, or public recognition.
- AI, recommendation, generated summary, chatbot, or speech technology.
- Backend, database, production authentication, cross-device synchronization, framework, dependency, or asset.
- New student or teacher routes.

## Student Engineering Journey Presentation

At the beginning of My STEM Work, display concise visible guidance explaining:

- Engineering work develops through ideas, plans, builds, tests, revisions, and explanations.
- Current, Recent, and Previous organize one journey rather than judging the work.
- Project and evidence information is not connected in PB-003C.

The guidance must not:

- Claim that a student project exists.
- Imply teacher review or approval.
- Describe activity as progress, mastery, or completion.
- Ask for a duplicate reflection.
- Present Builder, Workshop, Slides, or Vids as currently connected.

## Required Layout and Reading Order

Add My STEM Work after the PB-003B Choose Your Path region.

Use this DOM, visual, screen-reader, and responsive reading order:

1. My STEM Work heading and engineering-journey guidance.
2. Current Work.
3. Recent Work.
4. Previous Work.
5. Evidence Connections.

My STEM Work remains secondary to Current Goal and Mission Choice on Student Home.

## Continue Building Behavior

### PB-003C Presentation

Current Work displays the empty-state message:

`No project is ready to continue yet.`

Display concise supporting text explaining that Continue Building will return to verified current engineering work when an approved project owner is connected.

Do not render:

- A Continue Building button or link.
- A current project card.
- A project title, application, date, save, revision, evidence, progress, or completion claim.

An enabled or disabled Continue Building control would be misleading without a current-project and launch owner.

### Future Continue Building Contract

A later approved implementation must:

- Open the same authorized project.
- Preserve source work and evidence connections.
- Remain idempotent under repeated activation.
- Avoid duplicate project, Builder, Workshop, Slides, or Vids records.
- Avoid resetting geometry, camera, content, saves, or evidence.
- Fail safely when the destination cannot be verified.
- Remain available without teacher review, credits, badges, reflection approval, jobs, portfolio completion, or public sharing when the underlying project permits continuation.

PB-003C v1.0 documents and tests this contract but does not implement it.

## Current, Recent, and Previous Organization

### Current Work

Display:

- Heading: `Current Work`.
- Empty state: `No project is ready to continue yet.`
- Supporting future Continue Building explanation.

Current Work receives the strongest visual priority inside My STEM Work.

Do not infer Current Work from PB-003B Mission Choice, page visits, timer state, student login, or unrelated fixture data.

### Recent Work

Display:

- Heading: `Recent Work`.
- Empty state: `No recent projects are available yet.`
- Supporting text explaining that recently saved or opened projects will appear only when an approved project-history source is connected.

Do not render recent project cards or infer ordering.

### Previous Work

Display:

- Heading: `Previous Work`.
- Empty state: `Previous projects will appear here when available.`
- Supporting text explaining that earlier engineering work will remain private and available only through an approved project-history source.

Previous must not imply failed, abandoned, low-quality, inactive, or unimportant work.

### Classification Boundary

PB-003C adds no logic that moves work among Current, Recent, and Previous.

Future movement must come from an approved project owner and must not:

- Occur merely because a card was viewed.
- Treat inactivity as completion.
- Hide or delete work.
- Duplicate a project.
- Infer quality or teacher review.

## Project Card Structure

### PB-003C Containers

Provide empty project-card containers associated with Current, Recent, and Previous headings.

Each container must:

- Be structurally ready for responsive project-card presentation.
- Contain only its approved empty-state and supporting text in PB-003C.
- Contain no fabricated project article, title, ID, state, source, evidence, date, or action.
- Avoid creating an empty interactive group.

### Future Authoritative Card Order

When a later approved build provides project data, a project card must use:

1. Organizational state: Current, Recent, or Previous.
2. Project title.
3. Approved project or mission context.
4. Factual work-environment relationships.
5. Factual last-saved or last-opened information when verified.
6. Factual evidence-presence summary when verified.
7. One primary action.

### Stable Identity Boundary

The same authoritative project must retain one stable identity across Builder, Workshop, Slides, Vids, and evidence connections.

PB-003C must not infer identity from project titles, filenames, card order, or tool names.

### Prohibited Card Content

Future project cards must not contain:

- Completion percentages without an approved progress owner.
- Grades, mastery, quality, or ability scores.
- Rankings or comparisons.
- Teacher-review indicators.
- Support colors or Needs Attention state.
- Rewards, credits, or badges as work gates.
- Unapproved thumbnails, images, icons, or assets.

## Evidence Connections

### PB-003C Presentation

Display a subsection titled:

`Evidence Connections`

Display the state:

`Evidence cannot be checked right now.`

Display concise supporting text explaining that approved project evidence may eventually connect from Builder, Workshop, Google Slides, and Google Vids.

### Source Relationship Labels

Display exactly four noninteractive source rows or labels:

- `Builder — Coming Later`
- `Workshop — Coming Later`
- `Google Slides — Coming Later`
- `Google Vids — Coming Later`

These labels communicate roadmap relationships only. They must not:

- Be links, buttons, tabs, or controls.
- Claim that an artifact, save, account, or connection exists.
- Display file names, IDs, dates, thumbnails, permissions, or sharing state.
- Create an empty focus target.

### Evidence Philosophy

Visible guidance must preserve these meanings:

- Evidence may show that engineering work exists or changed.
- Evidence is not automatically reflection, proof of learning, a grade, teacher-reviewed, public, or complete.
- What I Learned Today remains the only reflection source.

### Future Connection Contract

A later approved evidence connection must:

- Read from an authoritative source.
- Avoid copying evidence into an uncontrolled duplicate store.
- Preserve source permissions.
- Avoid deletion of source evidence when a connection breaks.
- Avoid revealing teacher-review status.
- Remain private by default.

PB-003C v1.0 does not implement this contract.

## Builder Relationship

PB-003C may display only the noninteractive `Builder — Coming Later` relationship label.

Do not:

- Launch Builder.
- Read or write Builder data.
- Create Builder work.
- Display a Builder save or revision.
- Infer progress from Builder use.
- Modify Builder navigation, persistence, assets, or behavior.
- Treat Builder work as reflection.

Future Builder integration requires separate inspection of project identity, launch, return, save, and evidence boundaries.

## Workshop Relationship

PB-003C may display only the noninteractive `Workshop — Coming Later` relationship label.

Do not:

- Launch Workshop.
- Read or write Workshop data.
- Create Workshop work.
- Display a Workshop save or revision.
- Infer progress from Workshop use.
- Modify Workshop rendering, camera, geometry, Table, Grid, measurement, Tool Chest, Smart Board, persistence, assets, mission restoration, or behavior.
- Treat Workshop work as reflection.

Future Workshop integration requires separate inspection of project identity, launch, return, save, and evidence boundaries.

## Google Slides Relationship

PB-003C may display only the noninteractive `Google Slides — Coming Later` relationship label.

Do not:

- Add a Google link, account flow, API, Drive integration, picker, file query, or network request.
- Require a personal Google account for Platform entry or Student Home access.
- Display or infer a Slides file, title, ID, date, permission, account, thumbnail, or sharing state.
- Copy, edit, publish, upload, delete, or change permissions for Slides content.
- Treat Slides evidence as reflection.

Future Slides integration must reuse approved classroom information, avoid duplicate entry, respect source permissions, and fail safely when access is unavailable.

## Google Vids Relationship

PB-003C may display only the noninteractive `Google Vids — Coming Later` relationship label.

Do not:

- Add a Google link, account flow, API, Drive integration, picker, file query, or network request.
- Require a personal Google account for Platform entry or Student Home access.
- Display or infer a Vids file, title, ID, date, permission, account, thumbnail, or sharing state.
- Copy, edit, publish, upload, delete, or change permissions for Vids content.
- Treat Vids evidence as reflection.

Future Vids integration must reuse approved classroom information, avoid duplicate entry, respect source permissions, and fail safely when access is unavailable.

## Empty, Error, and Unavailable States

### Required Current States

PB-003C implements exactly these content meanings:

- Current Work: `No project is ready to continue yet.`
- Recent Work: `No recent projects are available yet.`
- Previous Work: `Previous projects will appear here when available.`
- Evidence Connections: `Evidence cannot be checked right now.`
- Source relationships: `Coming Later`.

### Error-State Contract

PB-003C performs no project or evidence request and therefore must not simulate runtime errors.

A later connected build must use calm recovery language without exposing project IDs, file IDs, accounts, routes, storage, or another student's information.

### State Rules

All states must:

- Use visible text.
- Avoid color-only meaning.
- Avoid blame, urgency, judgment, or false praise.
- Avoid implying teacher review or incomplete performance.
- Avoid enabled or focusable dead controls.
- Preserve access to Mission Choice and other Student Home areas.

## Growth Visibility Boundary

PB-003C does not display a growth timeline, event, count, revision, or evidence summary because no authoritative owner exists.

Visible engineering-journey guidance may explain that verified saves, revisions, and evidence connections can eventually show how work changed.

Do not display:

- Quality, mastery, completion, or ability claims.
- Grades.
- Teacher praise, approval, viewed, pending review, or unseen status.
- Support signals.
- AI summaries or predictions.
- Comparisons with classmates.

## Student Ownership Boundaries

PB-003C must:

- Keep My STEM Work private to the current student session.
- Display no project or evidence belonging to another student.
- Provide no project creation, modification, publication, or deletion behavior.
- Provide no ability to alter teacher assignments or mission definitions.
- Provide no ability to override source-system permissions.
- Avoid becoming a duplicate master store for future source artifacts.
- Preserve ordinary Student Home access regardless of project availability.

No teacher review, credit, badge, reflection, job, portfolio, or public-sharing state may block ordinary continuation in a future connected build when the source project remains authorized.

## Teacher Visibility Boundaries

PB-003C adds no teacher-facing UI, data, route, control, Feed event, report, or progress record.

Preserve:

- Teacher Command Center behavior.
- Teacher/student route separation.
- Teacher-review opacity on Student Home.
- Private teacher support signals and notes.
- Non-blocking student continuation.

Do not expose whether a teacher opened, viewed, checked, or reviewed student work.

Any future teacher visibility requires a separately approved private teacher progress or portfolio build.

## Privacy Requirements

PB-003C must not display, store, or transmit:

- Private identifier, class code, raw student ID, project ID, file ID, or account information.
- Another student's project, evidence, activity, growth, reflection, or portfolio.
- Teacher-only notes, Feed, Needs Attention, support signals, reports, or review history.
- Rankings, comparisons, popularity, or public progress.
- Unverified grades, quality judgments, or teacher feedback.
- Credentials, secrets, tokens, or Google account details.

My STEM Work content must not flow to Student Display, Smart Board, Hall of Fame, Teacher Feed, or another public surface.

Existing PB-001 wrong-role, refresh, and sign-out protection remain authoritative.

## Visual Requirements

- My STEM Work appears after Mission Choice.
- Current Work receives the strongest visual treatment inside the region.
- Recent and Previous use coordinated secondary treatment.
- Evidence Connections remains visually distinct and secondary to projects.
- Source relationship labels are readable but noninteractive.
- Empty states look intentional rather than broken.
- No horizontal card rail, automatic carousel, or nested scrolling.
- No fixed heights that clip content.
- Long headings, guidance, and source labels wrap safely.
- Use only namespaced Platform CSS.
- Use natural card heights.
- Add no new icons, images, thumbnails, assets, or animation.

## Accessibility Requirements

Implement:

- One semantic My STEM Work region with a visible heading.
- Logical subsection heading order.
- Current, Recent, Previous, and Evidence Connections identified visibly and programmatically.
- Empty-state text associated with each subsection heading.
- Source relationship labels presented as noninteractive text or list items.
- DOM and reading order matching the required visual order.
- Text-based state meaning.
- No dead controls or empty focus targets.
- Existing visible focus for global enabled controls.
- Readable contrast and scalable text.
- Safe long-text wrapping.
- No hover-only or audio-only information.
- Reduced-motion compatibility through the existing Platform foundation.

No live region is required because PB-003C performs no asynchronous project or evidence request.

## Chromebook Requirements

Physically validate:

- My STEM Work is easy to locate after Mission Choice.
- Current Work appears before Recent and Previous.
- All required empty states are readable.
- Evidence Connections and four Coming Later labels are clear.
- No relationship label appears interactive.
- No horizontal scrolling.
- No card carousel or nested scrolling.
- Natural vertical page scrolling.
- Long headings and guidance wrap safely.
- Keyboard and touchpad use remain correct.
- Existing Sign Out target remains usable.
- Responsive layout remains stable at common Chromebook and narrow widths.
- Refresh restores the protected Student Home route and correct student identity.
- Wrong-role protection remains intact.
- Sign-out removes Student Home content.
- No stale project, evidence, account, or another student's information appears.
- No console error or significant slowdown occurs.

Local desktop testing does not replace physical Chromebook validation.

## Authorized Implementation Surface

A future approved PB-003C implementation may modify only:

- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`
- `tests/platform/pb-003a-student-home-experience.test.mjs` only where section-order assertions directly conflict with the approved My STEM Work addition
- `tests/platform/pb-003b-mission-choice-experience.test.mjs` only where Student Home placement assertions directly conflict with the approved My STEM Work addition
- A new focused PB-003C test under `tests/platform/`
- `docs/platform/builds/PB-003C/PB-003C-IMPLEMENTATION-NOTES.md`

Do not modify:

- `platform/index.html`
- Platform session or fixture modules
- Timer, memo, or Student Display modules
- Controlling blueprints or specifications
- Mission files or assets
- Builder files or assets
- Workshop files or assets
- Google workflow files or assets
- `.vscode/settings.json`
- Unrelated files

If a prohibited file is required, stop for additional inspection.

## Protected Systems

Protect:

- PB-001 entry, roles, routing, guards, fixtures, refresh, and sign-out.
- PB-002A through PB-002E Teacher Command Center and Student Display.
- PB-003A Student Home outside the authorized My STEM Work addition.
- PB-003B Mission Choice.
- Existing Mission behavior and restoration.
- Builder behavior, navigation, persistence, assets, and canonical work.
- Workshop rendering, camera, Table, Grid, measurement, Tool Chest, Smart Board, persistence, assets, and canonical work.
- Existing Google workflows and permissions.
- What I Learned Today as the single reflection source.

## Testing Requirements

### Focused Automated Tests

Verify:

- Existing `/student/dashboard` route remains unchanged.
- Existing student and teacher guards remain unchanged.
- My STEM Work appears after Choose Your Path.
- Required order is guidance, Current, Recent, Previous, Evidence Connections.
- Current uses the exact approved empty-state meaning.
- Recent uses the exact approved empty-state meaning.
- Previous uses the exact approved empty-state meaning.
- Evidence Connections uses the exact approved unavailable meaning.
- Exactly four approved source relationship labels appear.
- Every source relationship is marked Coming Later.
- No project card is rendered without an authoritative source.
- No Continue Building, project, evidence, Builder, Workshop, Google, or portfolio action is enabled.
- No project title, ID, state, date, save, revision, progress, evidence, file, account, or permission is fabricated.
- No teacher-review status is displayed.
- No new route, role, session key, fixture, storage owner, network request, asset, framework, or dependency is added.
- PB-003A regions outside My STEM Work remain unchanged.
- PB-003B Mission Choice markup and behavior remain unchanged.
- Teacher Command Center and Student Display remain unchanged.
- Namespaced responsive My STEM Work CSS exists.
- No horizontal card rail or carousel is introduced.

### Browser Inspection

Inspect at minimum at 1024×600, 1366×768, and a narrow viewport:

- My STEM Work hierarchy.
- Current-first visual order.
- Empty-state readability.
- Evidence/source-label readability.
- Long-text wrapping.
- No horizontal overflow or nested scrolling.
- Logical keyboard order and visible focus.
- No misleading interaction affordance.
- No console errors.

### Physical Chromebook Validation

Verify all Chromebook requirements. Local desktop testing does not replace physical Chromebook validation.

## Regression Requirements

### Platform Regression Tests

Run all Platform tests and verify:

- PB-001 entry, route guards, refresh, and sign-out pass.
- PB-002A through PB-002E pass.
- PB-003A orientation, BOB Welcome, Current Goal, Wins, Challenge, reflection, privacy, and responsiveness remain intact.
- PB-003B Continue, Available Missions, Side Paths, privacy, and responsiveness remain intact.

### Protected-System Regression

- Run the complete Workshop test suite.
- Perform Builder smoke testing.
- Perform Workshop smoke testing.
- Confirm mission, Builder, Workshop, Google, assets, and protected Platform modules are unchanged.

## Unresolved Decisions

PB-003C v1.0 intentionally leaves these decisions unresolved because no approved owners exist:

- Stable project identity across Platform, Builder, Workshop, Slides, and Vids.
- The authoritative rule for Current, Recent, and Previous classification.
- Reliable current-work and project-history sources.
- Continue Building launch, return, save, refresh, and conflict behavior.
- Project-card quantity and any future history-navigation model.
- Evidence identity, connection, revision, and permission ownership.
- Builder integration and return contract.
- Workshop integration and return contract.
- Google classroom-account, Slides, Vids, and Drive authorization boundaries.
- Teacher visibility, retention, public sharing, and project-review policy.
- Cross-device project persistence.

These unresolved decisions do not block the approved noninteractive layout foundation because PB-003C displays only honest empty and Coming Later states.

If implementation requires resolving any item above or adding an interactive action, stop and obtain additional inspection and approval before changing code.

## Stop Conditions

Stop and request additional inspection if implementation requires:

- A project identity, project-state, current-work, history, evidence, launch, or persistence owner.
- A project, evidence, Builder, Workshop, Slides, or Vids fixture.
- An enabled Continue Building, project, evidence, Builder, Workshop, Google, retry, archive, delete, or public-sharing action.
- A new route, role, session key, data model, storage record, network call, asset, dependency, or framework.
- Teacher visibility or review status.
- Changes to Mission, Builder, Workshop, Google workflows, PB-001, PB-002, PB-003A, or PB-003B behavior.
- Modification of any prohibited file.

## Definition of Done

PB-003C is complete only when:

- My STEM Work appears after Mission Choice on the existing Student Home.
- Engineering-journey guidance is visible and truthful.
- Current Work appears first with the approved honest empty state.
- Recent Work appears second with the approved honest empty state.
- Previous Work appears third with the approved honest empty state.
- Evidence Connections appears last with the approved unavailable state.
- Exactly four noninteractive source relationships are marked Coming Later.
- No project or evidence content is fabricated.
- No Continue Building, integration, project, evidence, portfolio, or teacher-visibility behavior is implemented.
- Student privacy and teacher-review opacity remain intact.
- Accessibility and responsive requirements pass.
- Focused and full Platform tests pass.
- Workshop tests and Builder/Workshop smoke tests pass.
- Browser inspection passes.
- Physical Chromebook validation passes.
- User approval is received.

No commit, tag, or push may occur until separately authorized.

## Completion Report Required

After implementation, report:

- Files created.
- Files modified.
- My STEM Work layout changes.
- Empty and Coming Later states.
- Project and evidence-owner boundaries preserved.
- Accessibility and Chromebook results.
- Focused and regression tests.
- Builder and Workshop results.
- Known limitations.
- Physical Chromebook validation status.

This specification does not authorize implementation, staging, committing, tagging, or pushing.
