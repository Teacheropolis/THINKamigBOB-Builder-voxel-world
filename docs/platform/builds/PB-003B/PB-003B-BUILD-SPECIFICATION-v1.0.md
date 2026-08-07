# PB-003B — Mission Choice Experience

## Build Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-003 — Student Dashboard Experience  
Foundation: PB-003A — Student Home Experience

## Controlling References

- `docs/platform/PLATFORM-BLUEPRINT-v1.0.md`
- `docs/platform/DEVELOPMENT-STANDARDS-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-DESIGN-DECISIONS-v1.0.md`
- `docs/platform/builds/PB-003B/PB-003B-MISSION-CHOICE-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003B/PB-003B-MISSION-CHOICE-DESIGN-DECISIONS-v1.0.md`

## Architecture Finding

The current Platform has no approved mission definition, teacher assignment, student availability, resumable-work, mission launch, or mission persistence owner.

Repository mission imagery does not constitute an approved Platform mission system and must not be used to simulate one. Existing Mission behavior outside the Platform remains protected.

Therefore PB-003B v1.0 is an honest Mission Choice layout and state foundation only. It must not display fabricated mission cards or enable Start or Continue.

## Build Objective

Refine the PB-003A Choose Your Path area into a clear, accessible Mission Choice foundation that:

- Places Continue before new mission choices.
- Explains the difference between Continue and Start.
- Presents truthful empty states while authoritative mission owners are unavailable.
- Reserves the approved mission-card hierarchy without fabricating mission data.
- Preserves student agency, privacy, and teacher availability authority.
- Establishes responsive and testable presentation boundaries for future mission integration.

PB-003B does not implement a mission system.

## Primary User

Student authenticated through the existing PB-001 entry flow and viewing the existing PB-003A Student Home route.

The Mission Choice region should answer:

> Can I continue something, and are any new missions available?

without implying that unavailable data exists.

## Required User Flow

```text
Existing Student Entry
→ Existing protected Student Home route
→ Choose Your Path
→ Mission Choice foundation
→ Honest Continue and Available Missions states
```

No new route, navigation destination, role, redirect, storage owner, or session key is authorized.

## Included Scope

Implement only:

- Rename and refine the PB-003A Choose Your Path region as the Mission Choice experience while retaining the visible `Choose Your Path` student-facing heading.
- One Continue-first subsection.
- Continue empty state.
- One Available Missions subsection.
- Available Missions empty state.
- Visible Start-versus-Continue guidance.
- Mission-card structural container reserved for future authoritative cards, empty in PB-003B.
- Visible, noninteractive Side Paths reserved-state message.
- Namespaced Mission Choice styling.
- Responsive and accessible presentation.
- Focused PB-003B tests.
- Directly conflicting PB-003A test updates.
- PB-003B implementation notes.

## Explicitly Out of Scope

Do not implement:

- Mission definitions, fixtures, sample missions, authoring, assignment, availability, ordering, or publishing.
- Enabled mission cards.
- Start Mission behavior.
- Continue Mission behavior.
- Mission details, preview, modal, route, or page.
- Mission launch, enrollment, work creation, progress, completion, save, restore, or history.
- Teacher availability controls.
- Student mission-choice persistence.
- View All Missions.
- Side Path definitions, cards, authoring, availability, launch, progress, or evidence.
- Builder integration or launch.
- Workshop integration or launch.
- Cross-tool data transfer or synchronization.
- BOB interaction, Read-Aloud, chatbot, AI, or recommendations.
- Current Goal connection.
- Wins, Challenge, reflection, Help, My STEM Work, portfolio, credits, badges, jobs, or profile behavior.
- Analytics, tracking, notifications, rewards, rankings, or public recognition.
- Backend, database, production authentication, cross-device synchronization, framework, dependency, or asset.
- Modifications to existing mission-related assets.

## Mission Choice Layout

### Region Identity

Preserve the PB-003A visible heading:

`Choose Your Path`

Add a concise mission-focused introduction explaining:

- Continue returns to work already started.
- Start begins a mission that is available.
- Mission availability is not connected in PB-003B.

The guidance must remain visible text and must not be presented as BOB-generated or personalized advice.

### Required DOM and Reading Order

Within Choose Your Path, use this order:

1. Region heading and guidance.
2. Continue subsection.
3. Available Missions subsection.
4. Side Paths reserved state.

DOM, visual, screen-reader, and keyboard order must remain aligned during responsive reflow.

### Replacement of PB-003A Generic Cards

Remove the five generic disabled PB-003A path cards from this region:

- Continue Current Work.
- Start an Available Activity.
- Open My STEM Work.
- What I Learned Today.
- Ask for Help.

PB-003B narrows this region to mission choice only.

This removal does not implement or remove future My STEM Work, reflection, or Help concepts from the overall Student Dashboard roadmap. Those require their own approved areas and builds.

## Continue-First Behavior

### PB-003B Presentation

Display a subsection titled:

`Continue`

Display the empty-state message:

`No mission is ready to continue yet.`

Display concise supporting text explaining that existing mission work will appear here when an approved current-work source is connected.

Do not render:

- A Continue mission card.
- An enabled or disabled Continue button.
- Mission title, progress, date, tool, or saved-work claim.

An unusable Continue control would be misleading because no current-work or launch owner exists.

### Future Continue Contract

Future integration must preserve these rules:

- At most one primary Continue card.
- Continue precedes all Start cards.
- Continue opens the same authoritative work.
- Repeated activation is idempotent.
- Continue creates no duplicate record.
- Teacher review, credits, badges, reflection, or jobs do not block otherwise authorized continuation.

PB-003B v1.0 documents and tests this future contract but does not implement it.

## Mission Card Structure

### PB-003B Container

Provide an empty mission-card container associated with the Available Missions heading.

The container must:

- Be structurally ready for responsive card layout.
- Contain no fabricated mission article, title, description, state, tool relationship, or action.
- Not create an empty interactive group.
- Use the Available Missions empty state as its current content.

### Future Authoritative Card Order

When a later approved build provides mission data, each card must use:

1. Visible state label.
2. Mission title.
3. One concise student-facing purpose statement.
4. Approved work-environment relationship when one exists.
5. One primary Continue or Start action, or one unavailable explanation.

### Future Quantity Boundary

- At most one Continue card.
- At most three Start cards.
- No fabricated filler cards.
- No random rotation, carousel, or hidden algorithmic ranking.
- Side Paths remain outside the primary mission-card count.

### Prohibited Card Content

Future cards must not contain rankings, popularity, comparison, ability labels, support signals, invented teacher review, inferred progress, rewards, or unapproved assets.

## Start vs Continue Behavior

### PB-003B Guidance

Present static visible guidance that distinguishes:

- `Continue` — return to work already started.
- `Start` — begin a mission made available to the student.

Do not render Start or Continue action controls in PB-003B.

### Future Start Contract

A later approved Start implementation must:

- Verify current availability.
- Create or open the initial mission-work context exactly once.
- Prevent duplicate records on repeated activation.
- Detect existing resumable work before creating anything.
- Preserve current work and avoid destructive replacement.

### Future Continue Contract

A later approved Continue implementation must:

- Verify the current student's authorized work record.
- Open that same record.
- Preserve saved state.
- Avoid creating or resetting work.

### Existing-Work Conflict

If a future Start action discovers existing work, it must not create another record. Conflict resolution requires the authoritative mission owner's specification and is not implemented here.

## Available Missions

Display a subsection titled:

`Available Missions`

Display the empty-state message:

`No new missions are available right now.`

Display concise supporting text explaining that teacher-authorized missions will appear when the approved assignment source is connected.

Do not display a disabled mission card merely to fill space.

Do not imply that the student lacks access because of performance, teacher review, or incomplete reflection.

## Side Paths Reserved State

Display a quiet secondary subsection titled:

`Side Paths`

Display the message:

`Optional Side Paths are not available yet.`

Supporting text may explain that Side Paths will be optional related explorations in a future approved build.

Do not display Side Path cards, counts, difficulty, popularity, actions, or suggested paths.

Side Paths must remain visually secondary to Continue and Available Missions.

## Teacher Availability Boundaries

PB-003B must preserve these boundaries:

- Teachers will eventually control which missions are available through a separately approved protected teacher system.
- Students cannot change availability or ordering.
- PB-003B reads no teacher assignment data.
- PB-003B adds no teacher control, route, placeholder control, or fixture.
- Teacher Command Center behavior remains unchanged.
- Student empty states must not imply that the teacher failed to assign or review something.

Future mission-card ordering must come from the approved teacher or assignment owner, not a student-facing algorithm.

## Student Choice Boundaries

PB-003B must:

- Preserve Student Home access regardless of mission availability.
- Keep the Mission Choice region private to the current student session.
- Provide no way to override availability.
- Provide no way to see another student's mission or work.
- Avoid required, recommended, easy, hard, remedial, advanced, or ability labels.
- Avoid automatic selection or launch.
- Avoid creating, changing, or storing student choice state.
- Avoid implying that an unavailable mission is caused by student performance.

No PB-003B state may block sign-out or access to the rest of Student Home.

## Empty, Error, and Unavailable States

### Required Current States

PB-003B implements exactly these current states:

- Continue: `No mission is ready to continue yet.`
- Available Missions: `No new missions are available right now.`
- Side Paths: `Optional Side Paths are not available yet.`

### Error-State Contract

PB-003B has no mission data request and therefore must not simulate a runtime mission error.

A later connected build must use the meaning:

`Mission choices cannot be checked right now. Try again.`

Retry may appear only when safe retry behavior exists.

### Unavailable-State Contract

A later mission card may use Unavailable or Coming Later only when the authoritative mission source provides that state.

Coming Later uses the meaning:

`Coming in a future build.`

No unavailable state may blame the student, reveal internal data, or imply teacher review is required for continuation.

### Presentation Rules

All states must:

- Be visible text.
- Avoid color-only meaning.
- Use calm, factual language.
- Avoid fabricated data.
- Preserve access to other Student Home areas.
- Avoid enabled or focusable dead controls.

## Visual Requirements

- Continue receives the strongest presentation within Mission Choice.
- Available Missions follows Continue.
- Side Paths remains visually secondary.
- Empty states look intentional rather than broken.
- No card carousel or horizontal card scrolling.
- No fixed height that clips content.
- No internal subsection scrolling.
- Long headings and messages wrap safely.
- Existing PB-003A visual language remains consistent.
- Use only namespaced Platform CSS.
- No new icons, imagery, assets, animation, or decorative dependencies.

## Accessibility Requirements

Implement:

- One semantic Choose Your Path region using the existing visible heading.
- Logical subsection heading order.
- Continue before Available Missions in DOM and reading order.
- Side Paths after primary mission choice content.
- Empty-state messages associated with their subsection headings.
- Text-based state meaning.
- No disabled or empty controls in the keyboard order.
- Existing visible focus for global enabled controls.
- Responsive order matching DOM and reading order.
- Readable contrast and scalable text.
- No hover-only or audio-only information.
- Reduced-motion compatibility through the existing Platform foundation.

No live region is required because PB-003B performs no asynchronous mission-state changes.

## Privacy Requirements

PB-003B must not display or store:

- Private identifier, class code, or raw IDs.
- Another student's mission, choice, work, or state.
- Teacher-only assignments, notes, Feed, reports, or support signals.
- Rankings, popularity, class completion, or comparisons.
- Grades, inferred ability, or intervention labels.
- Teacher-review claims.

Mission Choice content must not flow to Student Display, Smart Board, Teacher Feed, or a public surface.

## Chromebook Requirements

Physically validate:

- Choose Your Path is easy to find.
- Continue appears before Available Missions.
- All three required empty states are readable.
- Side Paths is visibly secondary.
- No horizontal scrolling.
- No card carousel or nested scrolling.
- Natural page scrolling.
- Long empty-state and guidance text wraps safely.
- Keyboard and touchpad use remain correct.
- Existing Sign Out target remains usable.
- Responsive layout remains stable at common Chromebook and narrow widths.
- Refresh restores the protected Student Home route.
- Wrong-role protection remains intact.
- No console error, slowdown, stale identity, or unexpected mission content appears.

## Authorized Implementation Surface

A future approved implementation may modify only:

- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`
- `tests/platform/pb-003a-student-home-experience.test.mjs` only where assertions directly conflict with the approved Mission Choice refinement
- A new focused PB-003B test under `tests/platform/`
- `docs/platform/builds/PB-003B/PB-003B-IMPLEMENTATION-NOTES.md`

Do not modify:

- `platform/index.html`
- Platform session or fixture modules
- Timer, memo, or Student Display modules
- Controlling blueprints or specifications
- Mission files or assets
- Builder files or assets
- Workshop files or assets
- `.vscode/settings.json`
- Unrelated files

If a prohibited file is required, stop for additional inspection.

## Protected Systems

Protect:

- PB-001 entry, roles, routing, guards, fixtures, refresh, and sign-out.
- PB-002A through PB-002E Teacher Command Center and Student Display.
- PB-003A Student Home outside the authorized Choose Your Path region.
- Existing Mission behavior and restoration.
- Builder behavior, navigation, persistence, and assets.
- Workshop rendering, camera, Table, Grid, measurement, Tool Chest, Smart Board, persistence, and assets.
- Existing Google workflow links.

## Testing Requirements

### Focused Automated Tests

Verify:

- Existing `/student/dashboard` route remains unchanged.
- Existing student and teacher guards remain unchanged.
- Choose Your Path remains present.
- Required order is guidance, Continue, Available Missions, Side Paths.
- Continue uses the exact approved empty-state meaning.
- Available Missions uses the exact approved empty-state meaning.
- Side Paths uses the exact approved reserved-state meaning.
- No mission cards are rendered without an authoritative source.
- No Start, Continue, retry, details, Side Path, Builder, or Workshop action is enabled.
- No mission title, progress, date, evidence, or tool relationship is fabricated.
- No new route, role, session key, fixture, storage owner, network request, asset, or dependency is added.
- Generic PB-003A path cards are removed from Choose Your Path.
- Student Home regions outside Choose Your Path remain unchanged.
- Teacher Command Center and Student Display markup remain unchanged.
- Namespaced responsive Mission Choice CSS exists.
- No horizontal card rail or carousel is introduced.

### Platform Regression Tests

Run all Platform tests and verify:

- PB-001 entry, route guards, refresh, and sign-out pass.
- PB-002A through PB-002E pass.
- PB-003A orientation, BOB Welcome, Current Goal, Wins, Challenge, reflection, privacy, and responsiveness remain intact.

### Protected-System Regression

- Run the complete Workshop test suite.
- Perform Builder smoke testing.
- Perform Workshop smoke testing.
- Confirm mission, Builder, Workshop, assets, and protected Platform modules are unchanged.

### Browser Inspection

Inspect at minimum at 1024×600, 1366×768, and a narrow viewport:

- Mission Choice hierarchy.
- Empty-state readability.
- Continue-first visual order.
- Side Paths secondary presentation.
- Long-text wrapping.
- No horizontal overflow or nested scrolling.
- Logical keyboard order and visible focus.
- No console errors.

### Physical Chromebook Validation

Verify all Chromebook requirements. Local desktop testing does not replace physical Chromebook validation.

## Stop Conditions

Stop and request additional inspection if implementation requires:

- A mission definition, assignment, availability, current-work, launch, or persistence owner.
- A mission or Side Path fixture.
- An enabled Start, Continue, retry, details, Builder, Workshop, or Side Path action.
- A new route, role, session key, data model, storage record, network call, asset, dependency, or framework.
- Teacher availability controls.
- Changes to mission, Builder, Workshop, PB-001, PB-002, or unrelated PB-003A behavior.
- Modification of any prohibited file.

## Definition of Done

PB-003B is complete only when:

- Choose Your Path presents the approved Mission Choice foundation.
- Continue appears first with its approved honest empty state.
- Available Missions appears second with its approved honest empty state.
- Side Paths appears last as a secondary reserved state.
- Start and Continue meanings are explained visibly without rendering dead controls.
- No mission or Side Path content is fabricated.
- No mission, assignment, launch, persistence, Builder, or Workshop behavior is implemented.
- Student privacy and teacher authority boundaries remain intact.
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
- Mission Choice layout changes.
- Empty and reserved states.
- Data-owner boundaries preserved.
- Accessibility and Chromebook results.
- Focused and regression tests.
- Builder and Workshop results.
- Known limitations.
- Physical Chromebook validation status.

This specification does not authorize implementation, staging, committing, tagging, or pushing.
