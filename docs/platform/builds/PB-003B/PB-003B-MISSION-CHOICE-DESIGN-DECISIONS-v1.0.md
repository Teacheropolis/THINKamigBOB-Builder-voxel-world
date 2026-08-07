# PB-003B — Mission Choice Design Decisions

## Design Decisions v1.0

Status: Proposed decisions pending review and approval  
Companion Document: PB-003B Mission Choice Experience Blueprint v1.0  
Foundation: PB-003A — Student Home Experience

## Document Boundary

This document records Mission Choice experience decisions only. It does not authorize implementation, mission data, routes, storage, Builder or Workshop integration, Side Path behavior, or application-file changes.

Each implementation milestone requires authoritative mission and assignment owners, pre-implementation inspection, and a separately approved build specification.

## Decision 1 — Mission Choice Quantity

### Decision

The primary Mission Choice area may display:

- Up to one Continue card when authoritative resumable work exists.
- Up to three teacher-authorized Start mission cards.

The Continue card is separate from the three-card Start limit.

### Rationale

One Continue action protects student continuity. A maximum of three new mission choices provides meaningful agency without turning the Student Home into a large catalog or forcing the student to compare too many options at once.

### Quantity Rules

- Never fabricate cards to reach three choices.
- Show fewer than three Start cards when fewer missions are authorized.
- Show no Continue card when resumable work cannot be verified.
- Do not place duplicate missions in Continue and Start states.
- Do not randomly rotate, shuffle, or personalize mission order.
- Do not use an automatic carousel or horizontally scrolling card rail.
- Do not count Side Paths as primary Start missions.
- Do not count unavailable or Coming Later information as an available Start choice.

### More Than Three Available Missions

The teacher or approved assignment source determines which missions occupy the three primary Start positions and their order.

If a future experience needs access to more than three available missions, it requires a separately inspected and approved `View All Missions` destination. PB-003B must not silently hide teacher-authorized missions using an unapproved ranking algorithm.

Until such a destination exists, the teacher-facing availability system must keep the primary student choice set within the approved limit.

### Empty Space

When fewer cards are present, the layout uses natural space and responsive reflow. It must not stretch a small amount of content into oversized cards or insert decorative filler.

## Decision 2 — Continue-First Behavior

### Decision

When verified resumable work exists, Continue is the first and strongest Mission Choice action.

### Presentation

The Continue card appears before Start cards in:

- DOM order.
- Visual reading order.
- Keyboard order.

Responsive reflow must preserve this order.

### Continue Rules

- Continue returns to the same authoritative mission-work record.
- Continue does not create another mission or work record.
- Repeated activation remains idempotent.
- Viewing the Continue card does not change progress or last-opened state.
- The card may show last-saved or last-opened information only when an approved owner verifies it.
- Continue remains available without teacher review, credits, badges, reflection, jobs, or later features when the underlying mission permits continued work.
- Continue must not be described as recommended, required, or best for the student unless an approved source explicitly establishes that meaning.

### Multiple Resumable Items

The primary Student Home displays only one Continue card.

An authoritative current-work owner must identify the primary resumable item. PB-003B must not choose using recency, time, activity, or performance unless a future approved rule explicitly authorizes that method.

Access to additional prior work belongs in a separately approved My STEM Work or mission-history experience.

### Missing or Unsafe Continuation

If resumable work cannot be identified or opened safely:

- Do not display an enabled Continue action.
- Do not guess which record to open.
- Present the approved Continue empty or error state.
- Preserve existing work without mutation.

## Decision 3 — Mission Card Structure

### Decision

Each primary mission card uses one consistent, compact structure.

### Required Content Order

1. Visible state label: Continue, Available, Unavailable, or Coming Later.
2. Mission title.
3. One concise student-facing purpose statement.
4. Approved work-environment relationship when one exists.
5. One primary action or one unavailable explanation.

### Required Information

An enabled card requires:

- Authoritative mission identity.
- Approved student-facing title and purpose.
- Verified availability for the current student or class.
- Exactly one current action: Continue or Start.
- A functional guarded destination.

### Work-Environment Relationship

A card may display an approved relationship such as Builder or Workshop only when the mission source explicitly provides it.

The relationship is informational until a separately approved integration makes it actionable. It must not imply automatic synchronization, saved work, progress, or launch behavior.

### Prohibited Card Content

Do not include:

- Rankings, popularity, completion comparisons, or class percentages.
- Difficulty, remedial, gifted, advanced, or ability labels.
- Teacher-review claims without an authoritative action.
- Inferred progress from page visits, elapsed time, or inactivity.
- Grades, support signals, credits, badges, or rewards.
- Decorative detail that obscures the title, purpose, state, or action.
- New images, icons, or assets without separate approval.

### Whole-Card Interaction

A whole card may be interactive only when it represents one unambiguous destination and provides a clear accessible name.

If the card contains any secondary control or information action, the primary Start or Continue action must be a separately labeled native control.

## Decision 4 — Start vs Continue Behavior

### Decision

Start and Continue are different actions and must never be presented interchangeably.

### Continue

Continue means:

- Authorized work already exists.
- The action opens that same work.
- No duplicate record is created.
- Existing state is preserved.

### Start

Start means:

- No existing work record for that mission is being resumed through this card.
- The mission is currently available.
- The approved mission owner creates or opens the initial work context exactly once.
- Repeated activation cannot create duplicate records.

### Existing-Work Conflict

If Start discovers that resumable work already exists:

- Do not create a second record.
- Normalize the action to the approved Continue behavior or stop with a calm recovery message.
- Do not overwrite or discard existing work.

The exact conflict resolution requires the mission owner's build specification.

### Confirmation

Routine Start and Continue actions should not require repetitive confirmation.

A confirmation is permitted only when the action has a meaningful consequence the student needs to understand, such as leaving unsaved work. Confirmation must never be used to conceal unsafe or destructive behavior.

### Labels

Use action-specific labels such as:

- `Continue Mission`
- `Start Mission`

Do not use vague labels such as `Go`, `Open`, or `Choose` when the action actually creates or resumes work.

## Decision 5 — Teacher Availability Controls

### Decision

Mission visibility and Start availability are teacher-controlled through a future approved assignment or mission-availability owner.

### Teacher May Control

- Which missions are available to the class or current student.
- Which mission is identified as the current classroom mission.
- Which missions appear in the three primary Start positions.
- Mission order when classroom sequence matters.
- Which Side Paths are available.
- Approved student-facing classroom context.
- Approved Builder or Workshop relationships.

### Availability States

The teacher-facing owner may provide student-safe states such as:

- Available now.
- Unavailable.
- Coming later.
- No longer available for new starts while existing work remains resumable.

The student-facing interface must translate these states into factual, nonjudgmental language.

### Teacher Workload Boundary

Teachers must not be required to:

- Approve every Continue action.
- Approve repeated access to existing authorized work.
- Re-enter mission, student, or class information the Platform already knows.
- Review work, award credits, or record reflection merely to unlock ordinary continuation.
- Manually order cards when the approved assignment source already provides order.

### Protected Teacher Authority

Students cannot create availability, reorder teacher choices, publish missions, or override assignment state.

Teacher availability controls remain in protected teacher routes and are not implemented by this decision record.

## Decision 6 — Student Choice Boundaries

### Student May

When supported by the approved mission owner, a student may:

- Continue the primary resumable mission.
- Start one of up to three available missions.
- Review mission card information without starting.
- Return to existing work.
- Explore an available Side Path without losing the main mission.
- Choose an approved Builder or Workshop pathway when the mission explicitly offers both.

### Student May Not

- Make an unavailable mission available.
- Change the three-card teacher-authorized selection or order.
- View another student's choices, missions, or work.
- Override mission definitions or teacher context.
- Access teacher-only mission authoring, assignments, notes, analytics, or support signals.
- Publish work or choices to Student Display or another public surface automatically.

### Agency Rules

- Guided choice may emphasize but must not manipulate.
- A mission may be marked required only when the authoritative assignment source says so.
- Optional and required states must be visible in text.
- No choice is labeled for struggling, advanced, gifted, or remedial students.
- Starting another available mission must not erase or submit current work.
- Teacher review, credits, badges, jobs, and reflection do not block ordinary continuation.

### Privacy of Choice

The student's selected mission remains private to authorized student and teacher systems. It must not become a public classroom event, ranking, or recognition item without a separately approved teacher-controlled workflow.

## Decision 7 — Empty States

### Decision

Mission Choice uses calm, specific empty states rather than fabricated cards or generic errors.

### No Current Work

Use the meaning:

`No mission is ready to continue yet.`

Do not imply that work was lost, rejected, or overlooked.

### No Available Missions

Use the meaning:

`No new missions are available right now.`

If another approved Student Home path is functional, the interface may point toward it without presenting it as a substitute assignment.

### Availability Cannot Be Checked

Use the meaning:

`Mission choices cannot be checked right now. Try again.`

Provide a retry action only when retry behavior is implemented and safe.

### Coming Later

Use the meaning:

`Coming in a future build.`

The card remains disabled and must not simulate launch behavior.

### Existing Work Cannot Open

Use the meaning:

`Your work is still saved, but it cannot be opened right now.`

This message may be used only when an authoritative owner verifies that the work remains saved. Otherwise use a neutral availability error without making a storage claim.

### Empty-State Rules

Every empty state must:

- Explain what is unavailable.
- Avoid blame, urgency, judgment, or false praise.
- Avoid implying that teacher review is pending unless that is factually relevant and student-safe.
- Avoid exposing internal IDs, routes, storage, or network details.
- Use text rather than color alone.
- Preserve access to other approved Student Home areas.

Final wording requires content review in the build specification, but the meaning above must remain intact.

## Decision 8 — Accessibility Rules

### Structure

- Mission Choice has a semantic region and visible heading.
- Continue and Start groups have programmatic labels when visually separated.
- Card headings follow a logical hierarchy.
- State labels are programmatically associated with their cards.

### Interaction

- Use native links and buttons where appropriate.
- Every enabled action is keyboard operable.
- Focus is visible and follows DOM/reading order.
- Continue precedes Start actions in focus order when present.
- Primary targets are at least 44 CSS pixels.
- Disabled actions use native semantics and do not receive scripted focus.
- Whole-card interaction is used only for one unambiguous destination.
- Repeated activation is safe and does not create duplicate work.

### Communication

- Continue, Start, required, optional, available, and unavailable meanings are expressed in text.
- Color and icons are never the sole state indicators.
- No information or control is hover-only or audio-only.
- Loading and error updates use calm status announcements without repeated interruption.
- Error messages identify a safe recovery action when one exists.
- BOB guidance remains visible as text even if a future Read-Aloud feature is available.

### Responsive Behavior

- Visual, DOM, reading, and keyboard order remain aligned during reflow.
- Mission titles and descriptions wrap without clipping.
- Cards use natural height without internal scrolling.
- No horizontal page scrolling or card carousel.
- Reduced-motion preferences are respected.
- Common Chromebook, desktop, and narrow viewports remain usable.

### Focus After Navigation

The eventual build specification must define focus placement and return behavior for mission details, Start, Continue, errors, and any confirmation surface before those interactions are implemented.

## Protected Systems

Any future implementation must protect:

- PB-001 student entry, roles, routing, guards, session ownership, fixtures, refresh, and sign-out.
- PB-002A through PB-002E Teacher Command Center and Student Display behavior.
- PB-003A Student Home outside the authorized Mission Choice region.
- Existing Mission behavior and restoration.
- Builder behavior, navigation, assets, and persistence.
- Workshop rendering, camera, Table, Grid, measurement, Tool Chest, Smart Board, assets, and persistence.
- Existing Google workflow links.
- Unrelated files.

## Explicitly Not Authorized

These decisions do not authorize:

- Mission data, fixtures, authoring, assignment, availability, launch, progress, completion, or restoration.
- Start or Continue implementation.
- A View All Missions route.
- Teacher availability controls.
- Builder or Workshop integration.
- Side Path implementation.
- BOB Read-Aloud, chatbot, AI, or recommendations.
- Analytics, rankings, rewards, credits, badges, jobs, portfolios, reflection, or Help behavior.
- Backend, database, production authentication, cross-device state, route, role, session key, asset, framework, or dependency.

## Decision Validation Checklist

Confirm before approval:

- Primary choice quantity is limited to one Continue and three Start cards.
- Continue remains first and idempotent.
- Cards use one consistent information order.
- Start and Continue have distinct meanings and labels.
- Teacher authority controls availability and primary ordering.
- Student choice cannot override assignment rules or destroy current work.
- Empty states are specific, calm, and honest.
- Accessibility rules preserve hierarchy, keyboard order, and state meaning.
- No implementation or architecture is authorized.

## Approval and Next Step

Approval establishes these Mission Choice decisions as design authority only.

The next step should be a read-only PB-003B pre-implementation inspection to identify authoritative mission, assignment, continuation, and launch owners and determine whether any interactive Mission Choice build is currently safe.

Do not implement, modify application files, stage, commit, tag, or push based on this document alone.
