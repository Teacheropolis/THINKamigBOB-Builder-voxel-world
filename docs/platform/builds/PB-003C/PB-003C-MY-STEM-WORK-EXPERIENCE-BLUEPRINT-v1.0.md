# PB-003C — My STEM Work Experience

## Design Blueprint v1.0

Status: Proposed blueprint pending review and approval  
Parent Build: PB-003 — Student Dashboard Experience  
Foundation: PB-003A Student Home and PB-003B Mission Choice

## Document Boundary

This document defines the proposed My STEM Work experience only. It is not a build specification and does not authorize implementation.

Any implementation requires authoritative project and evidence owners, read-only pre-implementation inspection, a separately reviewed PB-003C Build Specification, and the complete THINKamigBOB development workflow.

## Purpose

Define a private student experience that organizes engineering work as an ongoing journey rather than a list of software files or completed assignments.

My STEM Work should help a student:

- Continue the work that matters now.
- Find recently active projects.
- Revisit previous engineering work.
- Recognize factual growth through saved work and evidence.
- Understand how Builder, Workshop, Google Slides, and Google Vids may relate to one project.

The experience must not invent projects, duplicate evidence, replace reflection, expose teacher-review status, or turn student work into a ranking system.

## Student Engineering Journey Philosophy

### Work Is a Journey

Engineering work develops through ideas, plans, builds, tests, revisions, explanations, and reflection. My STEM Work should preserve that continuity rather than treating every tool visit as a separate unrelated activity.

### Projects Before Applications

Organize work around the student's project, mission, or engineering idea. Builder, Workshop, Slides, Vids, and other approved sources are supporting work environments and evidence connections within that context.

Do not make the student reconstruct their journey by searching separate application lists.

### Revisions Matter

Verified saves, revisions, evidence additions, and returns to work may show that engineering thinking continued. They are factual activity signals, not proof of learning quality, grades, or teacher approval.

### Continuity Before Completion

The experience prioritizes continuing current work over celebrating completion. A project does not need teacher review, credits, badges, publication, or reflection approval before the student can continue when the underlying system permits it.

### Honest Growth

Growth visibility describes verified changes in the student's own work. It must never invent praise, infer ability, or imply that a teacher personally reviewed the work.

### Reflection Remains Separate

The What I Learned Today Google Form remains the only reflection source.

Builder, Workshop, Google Slides, and Google Vids provide evidence of work. My STEM Work must not convert evidence into a duplicate reflection response or ask the student to reflect again.

## Experience Objective

My STEM Work should answer:

1. What am I building now?
2. Where can I continue it?
3. What have I worked on recently?
4. Where is my previous work?
5. What evidence shows how my work changed?

The answers must come from approved authoritative sources. Missing sources produce honest empty or unavailable states.

## Current vs Recent vs Previous Work

### Current Work

Current Work is the student's single strongest resumable engineering context.

When an authoritative owner exists, Current Work may present:

- Project or mission title.
- Approved short purpose statement.
- Current work environment.
- Factual saved or last-opened information.
- Available evidence connections.
- One clear Continue Building action.

Current does not mean highest-scoring, teacher-approved, most important, or nearly complete. The authoritative current-work owner must define the state without relying on hidden performance judgment.

If more than one project is active, only the authoritative primary context occupies Current Work. Other active projects may appear under Recent Work.

### Recent Work

Recent Work helps the student find a small, scannable set of projects they worked on lately.

Recent ordering must come from a trustworthy last-saved or last-opened source. It must not be inferred from page visits alone when those visits do not establish meaningful work.

Recent Work should:

- Remain secondary to Current Work.
- Avoid duplicate presentation of the same current project unless the visual relationship is explicit.
- Use a bounded initial set rather than an overwhelming history.
- Provide a future path to more work only when a functional destination exists.

The exact quantity and ordering rules require a companion design-decision document.

### Previous Work

Previous Work is the student's private historical collection of projects no longer considered Current or Recent.

Previous does not mean failed, abandoned, low quality, or unimportant. It describes organization, not judgment.

A future implementation may support finding prior work by approved project or classroom context. Search, filtering, archiving, restoration, and deletion require separate decisions and are not authorized by this blueprint.

### State Movement

Movement between Current, Recent, and Previous must come from an approved project owner.

The UI must not:

- Move a project merely because a card was viewed.
- Mark work Previous because the student was inactive.
- Infer completion from elapsed time.
- Duplicate a project when its organizational state changes.
- Hide or delete work silently.

## Continue Building Experience

### Purpose

Continue Building is the primary My STEM Work action. It returns the student to the authoritative current project without creating another project or losing state.

### Required Behavior Contract

A future Continue Building action must:

- Open the same authorized project record.
- Return to an approved work environment or project hub.
- Preserve existing saves and evidence connections.
- Remain idempotent under repeated activation.
- Avoid creating duplicate Builder, Workshop, Slides, or Vids work.
- Avoid resetting progress, camera state, geometry, content, or evidence.
- Fail safely when the destination cannot be verified.

### Labeling

Use `Continue Building` only when resumable engineering work is verified.

If the current work is explanatory or presentation-focused rather than a physical/digital build, a future specification may choose a more accurate action label. The UI must not call every activity building merely for consistency.

### No Current Work

When no authoritative current project exists, do not render an enabled Continue Building action.

Use a calm empty state that points toward available Mission Choice only when that destination is functional. Do not fabricate a current project from recent tool use.

### Leaving Unsaved Work

If continuing one project requires leaving another context with unsaved work, the owning application must provide a safe preservation or warning contract. My STEM Work must not bypass protected Builder or Workshop save behavior.

## Project Organization

### Project as the Primary Unit

The project, mission, or approved engineering idea is the primary organizational unit.

One project may connect to:

- Builder work.
- Workshop work.
- Google Slides evidence or portfolio presentation.
- Google Vids evidence or portfolio presentation.
- Other future approved evidence sources.

The interface should show these as relationships within one journey, not as separate projects merely because different tools were used.

### Project Card

A future project card may contain:

- Project title.
- Approved project or mission context.
- Organizational state: Current, Recent, or Previous.
- Factual last-saved or last-opened information.
- Connected work-environment labels.
- Evidence-presence summary from authoritative sources.
- One clear primary action.

Do not display completion percentages, quality scores, rankings, support colors, or teacher-review indicators without separately approved authoritative systems.

### Duplicate Prevention

The same authoritative project must use one stable identity across work-environment and evidence connections.

Opening Builder, Workshop, Slides, or Vids must not automatically create another project when the current project already exists.

The eventual architecture must define how project identity is shared safely before integration.

### Organization Controls

Renaming, pinning, sorting, filtering, archiving, deleting, restoring, grouping, and manual status changes are not authorized by this blueprint. Each requires separate ownership, recovery, privacy, and Chromebook review.

## Evidence Connections

### Evidence Philosophy

Evidence shows that engineering work exists or changed. Evidence may include approved saves, revisions, images, videos, slides, or other artifacts.

Evidence is not automatically:

- Reflection.
- Proof of learning.
- A grade.
- Teacher-reviewed.
- Public.
- Complete.

### Connection Model

My STEM Work should connect to authoritative evidence rather than copying it into a second uncontrolled store.

A connection may show:

- Evidence type.
- Source work environment.
- Factual date or revision information.
- A safe Open or View action when authorized.

The interface must not claim that evidence exists until the source verifies it.

### Evidence Status

Permitted future status meanings may include:

- Connected.
- Not connected.
- Unavailable.
- Loading.
- Error.

Statuses must be factual and must not reveal whether the teacher personally reviewed the evidence.

### Evidence Safety

- Student evidence remains private by default.
- Public sharing requires separate teacher-controlled approval.
- Broken connections must not delete source evidence.
- Removing a connection must not delete the source artifact without explicit, separately approved destructive-action behavior.
- Cross-source duplicates must be identified through authoritative IDs, not guessed from titles.

## Builder Relationship

### Role

Builder may provide project planning, arrangement, representation, or other approved Builder work connected to the student's engineering journey.

Builder is a work environment and evidence source. It is not the My STEM Work owner, reflection source, grading authority, or teacher-review indicator.

### Future Connection

An approved project may show:

- Builder relationship label.
- Verified Builder work exists.
- Continue in Builder action.
- Factual save or revision information.

Exact data exchange, launch, return, save, and identity behavior require separate Builder integration inspection.

### Protected Boundaries

PB-003C does not authorize changes to Builder behavior, navigation, persistence, assets, or existing mission flow.

My STEM Work must not:

- Recalculate Builder work state.
- Duplicate Builder saves.
- Infer progress from opening Builder.
- Automatically create Builder work.
- Claim Builder evidence is reflection.

## Workshop Relationship

### Role

Workshop may provide project building, testing, viewing, measuring, or refinement work connected to the student's engineering journey.

Workshop is a work environment and evidence source. It is not the My STEM Work owner, reflection source, grading authority, or teacher-review indicator.

### Future Connection

An approved project may show:

- Workshop relationship label.
- Verified Workshop work exists.
- Continue in Workshop action.
- Factual save or revision information.

Exact data exchange, launch, return, save, and identity behavior require separate Workshop integration inspection.

### Protected Boundaries

PB-003C does not authorize changes to Workshop rendering, camera, geometry, Table, Grid, measurement, Tool Chest, Smart Board, persistence, assets, or mission restoration.

My STEM Work must not:

- Recalculate Workshop state or measurements.
- Duplicate Workshop saves.
- Infer progress from opening Workshop.
- Automatically create Workshop work.
- Change camera, selection, geometry, or restoration behavior.
- Claim Workshop evidence is reflection.

## Google Slides and Google Vids Relationship

### Role

Google Slides and Google Vids may provide student-owned or classroom-authorized evidence and portfolio presentation connected to an engineering project.

They remain external evidence sources. My STEM Work must not silently copy, edit, publish, or change sharing permissions for Google content.

### Future Connection

When an approved Google integration exists, a project may show:

- Connected Slides or Vids artifact.
- Verified title or type.
- Factual modification information when permitted.
- Safe Open action.

The integration must reuse information already known through the approved Google workflow and must not request duplicate entry.

### Account and Access Boundary

Students do not require personal email accounts for Platform entry. Any Google connection must use a separately approved classroom workflow that does not make personal-account possession a requirement for Student Home access.

### Sharing and Privacy

- Google sharing state remains authoritative in Google or an approved integration owner.
- My STEM Work must not claim access it cannot verify.
- Public portfolio or Hall of Fame sharing requires teacher approval and separate authorization.
- A broken or revoked connection must fail safely without exposing account or file details.

### Reflection Boundary

Slides and Vids provide evidence of work. They do not replace the What I Learned Today Google Form or become an additional reflection editor.

## Growth Visibility

### Purpose

Growth visibility helps the student notice how their own engineering work developed over time.

### Permitted Growth Signals

When verified by approved sources, My STEM Work may display factual signals such as:

- A project was saved.
- A revision was created.
- Evidence was added or connected.
- Work continued across sessions.
- Another approved engineering artifact was added.

### Prohibited Interpretations

Do not translate activity into:

- Quality or mastery scores.
- Grades.
- Teacher praise or approval.
- Ability levels.
- Support classifications.
- Predictions or AI summaries.
- Comparisons with classmates.

Time and activity are engagement clues, not proof of learning.

### Student-Facing Presentation

Growth should appear as a calm private record of verified changes, not a competitive feed or reward system.

The experience may eventually use a simple project timeline or evidence summary, but its exact structure, quantity, terminology, and data owner require separate design decisions.

### Teacher Review Opacity

Students must not be able to determine whether the teacher personally reviewed their work merely from My STEM Work.

Do not show viewed, unseen, checked, pending review, teacher opened, or similar indicators unless a future approved policy explicitly changes the permanent Platform rule.

## Student Ownership Boundaries

### Student May Eventually

When authoritative owners permit it, a student may:

- View their own Current, Recent, and Previous work.
- Continue an authorized project.
- Open their own connected evidence.
- Revisit prior work.
- Understand factual changes in their own engineering journey.
- Move between approved work environments without losing the project context.

### Student May Not

- View another student's work or evidence.
- Change teacher assignments or mission definitions.
- Mark evidence teacher-reviewed.
- Publish work publicly without an approved workflow.
- Override source-system permissions.
- Change support signals, credits, badges, grades, or teacher notes.
- Delete source artifacts through an unapproved My STEM Work action.

### Ownership Does Not Mean Storage Authority

The student's work belongs in their learning journey, but each source remains authoritative for its artifact. My STEM Work organizes connections; it must not silently become a duplicate master store.

### No Work Blocking

Teacher review, credits, badges, reflection, jobs, portfolio completion, or public sharing must not block ordinary continuation when the underlying project remains authorized.

## Teacher Visibility Boundaries

### Future Teacher Visibility

A separately approved teacher progress or portfolio system may eventually provide private visibility into:

- Current student activity.
- Project and mission context.
- Evidence connections.
- Factual save and revision activity.
- Reflection submission status from the approved Google Form.
- Other information authorized by the Platform Blueprint.

PB-003C does not implement teacher visibility.

### Boundaries

- Teacher visibility remains private and teacher-only.
- Student My STEM Work does not expose teacher notes, support signals, review history, or Needs Attention state.
- Teacher viewing must not block the student's work.
- The system must not require repetitive teacher confirmation for ordinary continuation.
- Activity time remains an engagement clue, not a grade.
- Public sharing requires explicit teacher approval.

### Review Status

My STEM Work must not reveal whether a teacher opened or reviewed a project or evidence item. Teacher review opacity remains a permanent Platform requirement.

## Empty, Loading, and Error States

### No Current Work

Use the meaning:

`No project is ready to continue yet.`

Offer a path to Mission Choice only when that destination is functional.

### No Recent Work

Use the meaning:

`No recent projects are available yet.`

### No Previous Work

Use the meaning:

`Previous projects will appear here when available.`

### Evidence Unavailable

Use the meaning:

`Evidence cannot be checked right now.`

Do not claim evidence is missing or deleted unless the source verifies that state.

### Loading

Keep the project hierarchy stable while authoritative information loads. Do not present stale work as current.

### Error

Use calm recovery language without exposing file IDs, account details, internal routes, session keys, or another student's information.

## Visual Navigation Requirements

The eventual experience should prioritize:

1. Current Work and Continue Building.
2. Recent Work.
3. Previous Work.
4. Growth and evidence details.

Requirements:

- Use visible text labels for every destination and state.
- Keep Current, Recent, and Previous visually and programmatically distinct.
- Preserve DOM, reading, and keyboard order during responsive reflow.
- Use one primary action per project card.
- Avoid horizontal card rails and automatic carousels.
- Avoid nested card scrolling.
- Allow long project titles and evidence labels to wrap.
- Use natural card heights.
- Avoid hover-only details and controls.
- Avoid flashing, pulsing, confetti, manipulative urgency, and public-comparison visuals.
- Use the existing namespaced Platform visual language.
- Do not add images, icons, thumbnails, or assets without separate approval.

This blueprint does not authorize a new route or lock columns, card dimensions, filters, icons, breakpoints, or animation.

## Accessibility Requirements

The eventual implementation must provide:

- Semantic My STEM Work region or page and logical headings.
- Programmatically identifiable Current, Recent, and Previous groups.
- Project cards with clear accessible names and state relationships.
- Distinct accessible labels for Continue Building, Open Evidence, and other future actions.
- Keyboard operation for every enabled control.
- Visible focus and predictable focus return.
- At least 44 CSS-pixel primary targets.
- State meaning expressed with text rather than color alone.
- No hover-only or audio-only information.
- Loading and error updates announced calmly without repeated interruption.
- Disabled controls using native semantics without scripted focus.
- Responsive DOM and visual order alignment.
- Reduced-motion compatibility.
- Readable contrast, scalable text, and safe wrapping.

The build specification must define focus behavior before project details, evidence views, external links, or return flows are implemented.

## Chromebook Requirements

The eventual experience must be physically validated on a Chromebook for:

- Current Work visibility without excessive scrolling.
- Clear Continue Building action.
- Recent and Previous organization.
- Project-title and evidence-label wrapping.
- No horizontal page or card scrolling.
- Natural vertical page scrolling.
- Keyboard and touchpad operation.
- Visible focus.
- At least 44 CSS-pixel interaction targets.
- Safe external-link and return behavior when integrations exist.
- Refresh restoration of the correct student and project context.
- Sign-out cleanup and shared-device privacy.
- Stable layout at common Chromebook and narrow widths.
- No stale project, evidence, or student identity.
- No console error or significant slowdown.

Local desktop testing does not replace physical Chromebook validation.

## Privacy Requirements

### Private by Default

My STEM Work is private to the current authorized student and authorized teacher systems.

It must not display:

- Another student's project, evidence, activity, growth, reflection, or portfolio.
- Class rankings, comparisons, popularity, or public progress.
- Private identifier, class code, raw IDs, file IDs, or account details.
- Teacher-only support signals, notes, reports, Feed, Needs Attention, or review history.
- Unverified grades, quality judgments, or teacher feedback.

### Source Permissions

- Respect Builder, Workshop, and Google source permissions.
- Do not broaden access through My STEM Work.
- Do not expose a broken connection's private technical details.
- Do not retain copied credentials or secrets.
- Do not make external evidence public automatically.

### Shared Device

- Existing PB-001 student route and sign-out protection remain authoritative.
- Refresh must not switch student, class, or project context.
- Browser history and cached content require inspection before sensitive project views are implemented.
- Signed-out users and wrong-role sessions must not access My STEM Work.

### Public Sharing

No project or evidence connection may flow automatically to Student Display, Smart Board, Hall of Fame, Teacher Feed, or another public surface.

Public recognition requires explicit teacher approval and a separately approved workflow.

## Data and Architecture Boundaries

Before implementation, inspection must identify authoritative owners for:

- Project identity.
- Current, Recent, and Previous classification.
- Current resumable work.
- Builder work and saves.
- Workshop work and saves.
- Google Slides and Vids connections.
- Evidence identity and status.
- Save, revision, and last-opened timestamps.
- Project launch, return, refresh, and sign-out behavior.
- Teacher visibility and public-sharing boundaries.

PB-003C must not invent these owners, add fictional student projects, infer connections from filenames, or treat PB-003A/B empty states as data.

No route, role, session key, storage record, integration, backend, framework, asset, or dependency is authorized by this blueprint.

## Protected Systems

Any future implementation must protect:

- PB-001 entry, roles, routing, guards, fixtures, session ownership, refresh, and sign-out.
- PB-002A through PB-002E Teacher Command Center and Student Display.
- PB-003A Student Home.
- PB-003B Mission Choice.
- Existing Mission behavior and restoration.
- Builder behavior, navigation, persistence, assets, and canonical work.
- Workshop rendering, camera, Table, Grid, measurement, Tool Chest, Smart Board, persistence, assets, and canonical work.
- Existing Google workflows and permissions.
- What I Learned Today as the single reflection source.
- Unrelated files and systems.

## Explicitly Out of Scope

This blueprint does not authorize:

- Application implementation.
- Project data, fixtures, sample work, Current/Recent/Previous logic, or project persistence.
- Continue Building behavior.
- Mission, Builder, or Workshop integration.
- Google Slides, Vids, or Drive integration.
- Evidence ingestion, copying, upload, deletion, or synchronization.
- Portfolio authoring or publishing.
- Reflection editing, duplication, summary, or scoring.
- Growth calculation, AI summary, recommendation, or evaluation.
- Teacher progress, review, support-signal, or report implementation.
- Rename, pin, sort, filter, archive, restore, or delete controls.
- Credits, badges, jobs, Help, notifications, rewards, rankings, or public recognition.
- Backend, database, production authentication, or cross-device synchronization.
- New routes, roles, session keys, assets, frameworks, or dependencies.

## Required Pre-Implementation Inspection

Before a PB-003C Build Specification is created, inspect:

- Whether any authoritative project identity exists across current systems.
- Whether current or resumable work can be identified safely.
- Whether reliable recent-work ordering exists.
- Whether previous work can be accessed without inventing history.
- Builder and Workshop save, launch, and return boundaries.
- Google classroom-account and evidence-link boundaries.
- Whether evidence can be connected without duplication.
- Whether the smallest first build must remain a noninteractive empty-state foundation.
- Exact routes, files, storage owners, privacy risks, and protected systems.
- Required focused, regression, browser, and physical Chromebook tests.

If these owners do not exist, implementation must remain an honest noninteractive foundation and must not simulate projects or evidence.

## Blueprint Validation Checklist

Confirm before approval:

- Engineering work is organized as a journey rather than separate tool lists.
- Current, Recent, and Previous describe organization without judgment.
- Continue Building preserves one authoritative project.
- Project identity prevents cross-tool duplicates.
- Evidence connections do not become reflection, grades, or teacher-review signals.
- Builder and Workshop remain protected work environments.
- Slides and Vids remain permission-respecting external evidence sources.
- Growth visibility remains factual, private, and noncompetitive.
- Students see only their own work.
- Teacher visibility remains private and does not block continuation.
- Accessibility and Chromebook requirements are explicit.
- Missing data owners produce honest empty states.
- No implementation or integration is authorized.

## Approval and Next Step

Approval establishes My STEM Work experience direction only.

The next step should be a read-only PB-003C pre-implementation inspection to identify authoritative project and evidence owners and determine the smallest safe first build.

Do not implement, modify application files, stage, commit, tag, or push based on this blueprint alone.
