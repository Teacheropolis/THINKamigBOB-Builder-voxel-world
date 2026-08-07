# PB-003B — Mission Choice Experience

## Design Blueprint v1.0

Status: Proposed blueprint pending review and approval  
Parent Build: PB-003 — Student Dashboard Experience  
Foundation: PB-003A — Student Home Experience

## Document Boundary

This document defines the proposed student Mission Choice experience only. It is not a build specification and does not authorize implementation.

Any implementation requires approved mission and assignment owners, a read-only pre-implementation inspection, a separately reviewed PB-003B Build Specification, and the complete THINKamigBOB development workflow.

## Purpose

Define how Student Home can guide a student toward meaningful mission choices without overwhelming them, restricting ordinary continuation, inventing availability, or changing protected Builder, Workshop, or Mission systems.

The experience should make the most relevant approved choice easy to understand while preserving student agency and honest access to other teacher-authorized paths.

## Experience Objective

The Mission Choice experience should help a student answer:

1. What can I continue?
2. What can I start?
3. Why might I choose this mission?
4. Which approved work environment might support the idea?
5. Can I explore a related Side Path without losing my main work?

The experience organizes authorized choices. It does not assign missions, calculate recommendations, launch tools, track progress, or decide what a student is capable of doing.

## Core Principles

### Continue Before Starting Over

When authoritative resumable work exists, Continue receives the strongest priority. Starting another approved mission must not silently duplicate, replace, or discard current work.

### Guided Choice, Not Hidden Judgment

The dashboard may organize teacher-authorized choices using known mission information. It must not infer student ability, readiness, support need, or likely success from activity, grades, time, or behavioral signals.

### Choice Without Overload

Present a small, understandable set of relevant choices before exposing a larger catalog. The student should not have to scan every future activity to identify a useful next action.

### Honest Availability

Every enabled mission card requires an authoritative assignment or availability source and a functional destination. Missing sources produce an honest empty or unavailable state.

### Student Continuity

Teacher review, credits, badges, reflection, jobs, and later features must never block ordinary continuation of authorized work.

### Privacy and Dignity

Choice presentation remains private to the student. It must not expose rankings, classmates' work, support signals, or comparative labels.

## Guided Choice Model

### Choice Tiers

The proposed experience uses three tiers.

#### Tier 1 — Continue

If an authoritative current-work source identifies resumable work, display one primary Continue card before all new choices.

The card may show only verified information such as:

- Mission title.
- Approved short description.
- Approved work environment relationship.
- Factual last-saved or last-opened information when an authorized owner exists.
- One clear Continue action.

Do not infer progress from elapsed time or page visits.

#### Tier 2 — Teacher-Authorized Mission Choices

Display a bounded set of missions the teacher or approved assignment source has made available to the current student or class.

The interface may emphasize one current classroom mission when the authoritative source explicitly identifies it. Emphasis must not be described as a personalized recommendation unless a separately approved system supports that claim.

#### Tier 3 — Side Paths

Display optional related explorations only after the primary Continue and mission choices are understandable.

Side Paths remain secondary, optional, and teacher-authorized. They do not replace assigned work or imply remediation.

### Choice Order

Use this default presentation order:

1. Continue current mission or activity.
2. Current teacher-authorized mission.
3. Other available mission choices.
4. Related Side Paths.
5. Honest empty or unavailable information.

The order may change only when an approved mission or assignment source provides an explicit classroom order.

### Choice Boundaries

Guided choice must not:

- Choose on the student's behalf.
- Automatically launch a mission or tool.
- Hide authorized alternatives to force a preferred selection.
- Use support signals, grades, inactivity, or analytics to rank choices.
- Describe a choice as easier, harder, remedial, advanced, gifted, or for struggling students without an approved, student-safe content decision.
- Require completion, teacher review, credits, badges, jobs, or reflection before an otherwise authorized choice opens.
- Convert browsing a card into mission enrollment or progress.
- Create multiple copies of work through repeated selection.

## Mission Card Experience

### Purpose

A mission card should give the student enough information to understand the idea and make a safe choice without opening hidden details or reading a long description.

### Required Card Information

When backed by approved mission data, a mission card may contain:

- Mission title.
- One concise student-facing purpose statement.
- Mission availability state.
- Continue or Start action, never both when their meanings would conflict.
- Approved Builder, Workshop, or other work-environment relationship.
- Optional teacher-authored student-safe label or classroom context.

### Optional Future Information

Only when authoritative owners exist, a later specification may consider:

- Factual saved-work status.
- Last opened date.
- Evidence type expected.
- Approved approximate classroom scope.
- Related Side Path count.

These items are not authorized by this blueprint.

### Card States

Each card should have one unambiguous state.

#### Continue

Verified resumable work exists. The action returns to the same authorized work.

#### Available

The student may start the mission. Starting behavior requires a separately approved mission owner.

#### Unavailable

The mission is visible but cannot be opened. The explanation is factual and does not blame the student.

#### Coming Later

The mission is planned but not implemented. It must not appear enabled.

#### Loading

Availability is being verified. The card must not expose stale availability as current.

#### Error

Availability cannot be determined safely. The student receives a calm recovery message without internal details.

### Card Interaction Rules

- A whole-card action is permitted only when the card has one destination and a clear accessible name.
- Cards with multiple approved actions use separately labeled native controls.
- Continue and Start must remain visibly and programmatically distinct.
- Opening details must not create work, change progress, or count as starting.
- Repeated activation must not create duplicate mission records.
- Enabled actions require a functional, guarded destination.
- Disabled cards must not enter the keyboard order through custom scripting.
- No hover-only details or controls.

### Card Content Rules

Mission copy must be:

- Student-facing and age-respectful.
- Concise enough to scan on a Chromebook.
- Factual about what the student will explore or create.
- Free from invented praise or teacher-review claims.
- Free from public performance labels.

## Student Choice Boundaries

### Student May

When the underlying approved system permits it, a student may:

- Continue current work.
- View teacher-authorized available missions.
- Start an available mission.
- Revisit prior work.
- Explore an available Side Path.
- Return from a Side Path to the main mission without losing work.
- Choose between approved Builder-idea and Workshop-idea pathways when the mission explicitly supports both.

### Student May Not

The Student Home must not allow a student to:

- Make an unavailable mission available.
- Change teacher assignment rules.
- View another student's choices or work.
- Alter mission definitions or teacher-authored classroom context.
- Override teacher-controlled public sharing.
- Access teacher-only mission management, reports, notes, or support signals.

### Choice Preservation

Choosing a new available mission or Side Path must not silently erase, replace, submit, complete, or publish existing work.

If the future mission architecture cannot preserve current work safely, the choice action must stop and explain the limitation rather than proceeding destructively.

### Student Agency

The interface may visually guide but must not shame, pressure, manipulate, or falsely personalize choices. Students should understand which choices are required, available, optional, or unavailable using visible text rather than color alone.

## Teacher Control Boundaries

### Teacher Controls

Through a separately approved teacher mission system, the teacher may eventually control:

- Which missions are assigned.
- Which additional missions are available.
- The current classroom mission.
- Mission ordering when classroom sequence matters.
- Which Side Paths are available.
- Student-safe mission descriptions or classroom context.
- Whether specific Builder or Workshop relationships are offered by a mission.

### Teacher Does Not Control

The teacher should not be required to:

- Approve every student continuation.
- Approve each return to existing work.
- Re-enter known student, class, mission, or activity information.
- Manually clear routine empty states.
- Award credits or review work merely to unlock an otherwise available mission.

### Student/Teacher Separation

Student mission cards may present teacher-authorized information but cannot create, edit, reorder, publish, or override teacher records.

Mission authoring, assignment, reporting, support classifications, and private teacher notes remain in protected teacher systems.

The student experience must never imply teacher review unless an authoritative teacher action exists.

## Builder Idea Relationship

### Philosophy

Builder is a future environment where a mission-related idea may be planned, arranged, explored, or represented using approved Builder capabilities.

PB-003B treats Builder as a possible work environment connected to an idea, not as the mission owner, reflection source, progress authority, or automatic recommendation engine.

### Mission Card Relationship

An approved mission may communicate that a student can:

- Develop an idea in Builder.
- Continue existing Builder work related to the mission.
- Choose Builder when the mission supports more than one work environment.

The exact wording and launch behavior require inspected Builder integration.

### Boundaries

PB-003B does not authorize:

- Opening Builder from Student Home.
- Passing mission, student, geometry, or save data into Builder.
- Modifying Builder UI, navigation, persistence, assets, or behavior.
- Treating Builder page-open time as progress.
- Automatically creating Builder work.
- Claiming that Builder evidence is reflection.

Builder may eventually provide evidence of work. It does not replace What I Learned Today.

## Workshop Idea Relationship

### Philosophy

Workshop is a future environment where a mission-related idea may be built, tested, viewed, measured, or refined using approved Workshop capabilities.

PB-003B treats Workshop as a possible work environment connected to an idea, not as the mission owner, reflection source, progress authority, or automatic recommendation engine.

### Mission Card Relationship

An approved mission may communicate that a student can:

- Develop or test an idea in Workshop.
- Continue existing Workshop work related to the mission.
- Choose Workshop when the mission supports more than one work environment.

The exact wording and launch behavior require inspected Workshop integration.

### Boundaries

PB-003B does not authorize:

- Opening Workshop from Student Home.
- Passing mission, student, geometry, selection, measurement, camera, or save data into Workshop.
- Modifying Workshop rendering, camera, Table, Grid, Tool Chest, Measurement Assistant, Smart Board, assets, persistence, or mission restoration.
- Treating Workshop page-open time as progress.
- Automatically creating Workshop work.
- Claiming that Workshop evidence is reflection.

Workshop may eventually provide evidence of work. It does not replace What I Learned Today.

## Builder and Workshop Choice Relationship

When an approved mission genuinely supports both environments:

- Present Builder and Workshop as understandable alternatives or stages defined by mission content.
- Explain the difference using student-facing purpose language, not technical architecture.
- Do not present one environment as better, easier, or more advanced.
- Do not force a student to recreate the same known information in both tools.
- Preserve existing work when moving between approved environments.
- Do not imply automatic synchronization until an approved integration provides it.

If only one environment is valid, show only that approved relationship rather than presenting a false choice.

## Side Paths Philosophy

### Definition

A Side Path is an optional, teacher-authorized exploration related to a mission idea. It gives students room to follow curiosity, try another approach, investigate a related question, or extend an idea without losing the main mission context.

### Core Rules

Side Paths are:

- Optional.
- Related to an approved mission or activity.
- Secondary to the primary mission choice.
- Available without implying that the student is ahead or behind.
- Reversible: the student can return to the main mission safely.
- Honest about whether work or evidence will be saved.
- Never required as remediation or reward unless a future approved design explicitly and safely establishes another model.

### Side Paths Are Not

- Hidden assignments.
- Extra credit.
- Punishment.
- Remediation labels.
- Gifted or advanced tracks.
- Public competition.
- AI-generated recommendations.
- A way to bypass teacher availability controls.
- A substitute for the main mission or reflection.

### Presentation

Side Paths should appear after primary mission choices under a clear optional label such as `Explore a Side Path`.

Each Side Path should state:

- What idea it explores.
- Its relationship to the main mission.
- Whether an approved work environment is available.
- That the student can return to the main mission.

Do not show a Side Path count, difficulty, popularity, or completion comparison unless a future specification establishes a useful, private, and authoritative reason.

## BOB Guidance Rules

### Role

BOB may explain the visible Mission Choice interface and help the student understand the difference between Continue, Start, Builder, Workshop, and Side Paths.

BOB does not choose, recommend, assign, evaluate, or generate missions.

### Approved Guidance

BOB may use approved visible guidance such as:

- `Continue returns to work you already started.`
- `Start begins a mission that is available to you.`
- `Side Paths are optional ways to explore a related idea.`

Final content requires review and must remain visible as text.

### Read-Aloud Boundary

If a future approved Read-Aloud foundation exists, BOB may read the current visible mission-choice guidance at the student's request.

PB-003B does not authorize speech technology, autoplay, hidden narration, voice preferences, conversational prompts, or external AI services.

### Prohibited Guidance

BOB must not:

- Tell a student which mission they should choose based on inferred ability or behavior.
- Describe a mission as best for the student without an approved source.
- Generate a new mission or Side Path.
- Interpret progress, grades, reflection responses, or support signals.
- Claim teacher endorsement, praise, or review without evidence.
- Read private identifiers, classmates' information, or teacher-only content.
- Block navigation until guidance is read or heard.

## Visual Navigation Requirements

### Hierarchy

The Mission Choice experience should visually prioritize:

1. Continue current work, when verified.
2. Current teacher-authorized mission.
3. Other available mission cards.
4. Optional Side Paths.
5. Honest unavailable or empty states.

### Requirements

- Use concise visible text labels for all choices and actions.
- Distinguish Continue, Start, and Explore in text, not color alone.
- Identify current, available, optional, unavailable, loading, and error states programmatically and visibly.
- Keep mission cards scannable without hiding essential information behind hover.
- Preserve DOM, reading, and keyboard order during responsive reflow.
- Use native links and buttons where appropriate.
- Provide visible focus.
- Use at least 44 CSS-pixel primary interaction targets.
- Avoid horizontal page scrolling and nested card scrolling.
- Allow long mission titles and descriptions to wrap without clipping.
- Avoid automatic carousels, flashing, pulsing, confetti, and manipulative urgency.
- Use the existing namespaced Platform visual language.
- Do not add icons, illustrations, badges, or assets without separate approval.

This blueprint does not lock card dimensions, columns, colors, icons, breakpoints, or animation.

## Accessibility Requirements

The eventual implementation must provide:

- Semantic Mission Choice region and logical heading order.
- Programmatically identifiable card names and states.
- Clear accessible names that distinguish Continue, Start, and Explore actions.
- Keyboard operation for every enabled action.
- Visible focus and predictable focus return.
- State meaning expressed with text rather than color alone.
- No hover-only or audio-only information.
- Readable contrast and scalable type.
- Responsive reading order matching the visual hierarchy.
- Disabled controls that use native semantics and do not receive scripted focus.
- Calm live-status behavior for availability changes without repetitive announcements.
- Error messages with a safe recovery action.
- Reduced-motion compatibility.
- Graceful operation when optional speech or integrations are unavailable.

The build specification must define focus behavior before any mission details, confirmation, or launch surface is implemented.

## Privacy Requirements

The Mission Choice experience may display only choices authorized for the current student or class context.

It must not display:

- Another student's mission, choice, work, progress, evidence, or Side Path.
- Class rankings, popularity counts, or comparative completion.
- Teacher-only support signals, notes, reports, Needs Attention, or Feed content.
- Private identifiers, class codes, raw IDs, or internal assignment records.
- Grades or inferred ability labels.
- Claims of teacher review without an authoritative action.
- Public recognition without teacher approval and a separately approved workflow.

Choice selection must remain private. It must not automatically appear on Student Display, Smart Board, Hall of Fame, or another student's dashboard.

If a future teacher system needs to know the selected mission, the data owner, purpose, retention, and student-visible behavior require separate approval.

## Data and Architecture Boundaries

Before any implementation, inspection must identify authoritative owners for:

- Mission definitions.
- Student-safe mission content.
- Teacher assignment and availability.
- Current and resumable work.
- Start and Continue behavior.
- Side Path definitions and availability.
- Builder and Workshop relationships.
- Student choice state.
- Mission launch routing.
- Save, refresh, return, and sign-out behavior.

PB-003B must not invent these owners, add fixtures presented as real missions, or infer state from the PB-003A placeholder cards.

No new route, session key, storage record, integration, or data model is authorized by this blueprint.

## Protected Systems

Any future PB-003B implementation must protect:

- PB-001 student entry, roles, routing, guards, session ownership, fixtures, refresh, and sign-out.
- PB-002A through PB-002E Teacher Command Center and Student Display behavior.
- PB-003A Student Home hierarchy, privacy, empty states, and responsive foundation outside the authorized Mission Choice region.
- Existing Mission behavior and restoration.
- Builder behavior, navigation, assets, and persistence.
- Workshop rendering, camera, Table, Grid, measurement, Tool Chest, Smart Board, assets, and persistence.
- Existing Google workflow links.
- Unrelated files and systems.

## Explicitly Out of Scope

This blueprint does not authorize:

- Application implementation.
- Mission authoring, assignment, availability, stages, launch, progress, completion, or restoration.
- Start or Continue behavior.
- Mission fixtures or sample student activity presented as real.
- Builder or Workshop integration.
- Cross-tool synchronization.
- Side Path authoring, generation, launch, progress, or evidence.
- Student recommendations, personalization algorithms, or analytics.
- Help requests or support-signal behavior.
- Portfolios, Google integrations, reflection, credits, badges, jobs, profiles, or reports.
- Notifications, rewards, rankings, public recognition, or competition.
- AI, chatbot, conversational BOB, or speech technology.
- Backend, database, production authentication, or cross-device synchronization.
- New routes, roles, session keys, assets, frameworks, or dependencies.

## Required Pre-Implementation Inspection

Before a PB-003B Build Specification is created, inspect:

- Whether an approved mission data owner exists.
- Whether teacher assignment and availability state exists.
- Whether current-work continuation can be identified safely.
- Whether a mission can be viewed without starting it.
- Whether Start is idempotent and avoids duplicate work.
- Whether Builder or Workshop launch boundaries are approved.
- Whether Side Paths have an authoritative definition and teacher control.
- Whether the smallest first build should remain a disabled visual foundation.
- Exact routes, files, storage owners, and protected integration boundaries.
- Required focused, regression, browser, and physical Chromebook tests.

If these owners do not exist, implementation must remain an honest noninteractive foundation and must not simulate available missions.

## Blueprint Validation Checklist

Confirm before approval:

- Guided choice prioritizes Continue without hiding other authorized choices.
- Mission cards distinguish Continue, Start, and unavailable states.
- Student choice never changes teacher assignment authority.
- Teacher review never blocks ordinary continuation.
- Builder and Workshop remain protected future work environments, not mission owners.
- Side Paths are optional, related, reversible, and nonjudgmental.
- BOB explains choices but does not recommend or generate them.
- Visual navigation is clear and Chromebook-ready.
- Accessibility requirements cover card states, focus, and responsive order.
- Choice and work information remain private.
- Missing owners produce honest unavailable states.
- No implementation or integration is authorized.

## Approval and Next Step

Approval establishes Mission Choice experience direction only.

The next step should be a read-only PB-003B pre-implementation inspection to determine whether an authoritative mission and assignment foundation exists and to identify the smallest safe first build.

Do not implement, modify application files, stage, commit, tag, or push based on this blueprint alone.
