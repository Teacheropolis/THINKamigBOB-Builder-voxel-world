# PB-003 — Student Dashboard Experience

## Design Blueprint v1.0

Status: Proposed blueprint pending review and approval  
Parent Phase: Platform Student Experience  
Foundation: PB-001 — Platform Foundation

## Document Boundary

This document defines the proposed Student Dashboard experience and information architecture only. It is not a build specification and does not authorize implementation.

Implementation requires a separately reviewed and approved PB-003 Build Specification and the complete THINKamigBOB development workflow.

## Purpose

Define a calm, clear Student Dashboard that helps a student answer three questions immediately:

1. What should I work on now?
2. How do I continue work I already started?
3. Where can I find my STEM work and classroom tools?

The dashboard should make student work feel important and worth continuing without inventing progress, praise, teacher review, or unavailable integrations.

## Experience Objective

Create a student home experience that:

- Preserves the PB-001 class-code, roster-name, and private-identifier entry flow.
- Gives the signed-in student a clear sense of place within the current class.
- Prioritizes continuity and the next useful action.
- Organizes future activities and work evidence without creating dead ends.
- Uses honest empty, unavailable, and future-build states.
- Protects student dignity and private classroom information.
- Remains comfortable on a school Chromebook.

## Design Principles

### Student Work Comes First

The dashboard highlights the student's work and available next actions rather than platform features, scores, or software branding.

### Keep Students Moving

A student must not be blocked because teacher review, credits, jobs, integrations, or later Platform features are incomplete.

### Continue Before Starting Over

When trustworthy current-work state eventually exists, continuing it should be easier to find than starting unrelated work.

### Honest Recognition

The dashboard may describe verified activity or saved evidence. It must never imply that a teacher reviewed, approved, praised, or graded work unless that event is explicitly recorded by an approved future system.

### Privacy and Dignity

The dashboard is private to the authenticated student session. It must not expose classmates, rankings, support signals, comparative progress, or teacher-only information.

### Low Reading Burden

Headings, actions, and status messages should be concise, age-appropriate, and understandable at a glance.

### Chromebook First

The primary experience must support keyboard, touchpad, common Chromebook viewports, readable contrast, visible focus, and large interaction targets without horizontal scrolling.

## Existing Approved Foundation

PB-003 builds conceptually on the completed PB-001 Student Dashboard shell:

- Student role.
- Class-code entry.
- Roster-name selection.
- Private-identifier validation.
- Protected Student Dashboard route.
- Student sign-out.
- Development-only fixtures.
- Role separation and route guards.

This blueprint does not change those owners or convert development fixtures into production authentication.

## Proposed Dashboard Hierarchy

The Student Dashboard should use the following attention order.

### 1. Student Orientation

The top of the page should confirm only the minimum useful context:

- Student display name from the authorized student session.
- Current class name when already known.
- A clear Student Dashboard or student-home identity.
- Sign-out access.

Do not show the private identifier after entry. Do not expose a class roster or another student's information.

### 2. Today

The first primary area should orient the student to current classroom work.

Reserved future content may include:

- Today's Mission.
- A class-safe teacher direction already authorized for student presentation.
- A clear Continue Current Mission action when a trustworthy current mission exists.

Until those sources are implemented, the area must use honest language such as `Coming in a future build` or `No current mission is available yet`. It must not invent a mission, teacher direction, deadline, or progress state.

### 3. Continue Working

This area is the preferred location for the student's most relevant resumable work.

Future cards may identify:

- Activity or mission name.
- Approved source application.
- Last saved or last opened information when trustworthy tracking exists.
- A direct Continue action.

If no approved current-work source exists, show a calm empty state. Do not infer work from page visits or fabricate a recent item.

### 4. Available Activities

This area organizes activities the student is permitted to start or open.

Future availability must be determined by an approved mission or classroom-assignment source. PB-003 must not create its own assignment rules.

Unavailable activities should be disabled or clearly labeled without suggesting that the student is behind, ineligible, or waiting for teacher review.

### 5. My STEM Work

This is the future home for the student's own work and evidence, including approved connections to:

- STEM Builder.
- STEM Workshop.
- Google Slides portfolio.
- Google Vids portfolio.

The area should distinguish tools from saved work. It must not claim that an integration, file, portfolio, save, or revision exists until an approved source provides it.

### 6. Reflection and Classroom Tools

Reserved student resources may include:

- What I Learned Today.
- Help.
- Classroom job.
- Kit Manager controls when assigned.

The What I Learned Today Google Form remains the only reflection source. The dashboard must not create a duplicate reflection editor or request the same response again.

Help must eventually use a separately approved support workflow. It must not expose teacher-only support classifications.

### 7. Growth and Profile

Reserved future areas may include:

- Engineering Credits.
- Badges.
- Student profile.

These elements must remain secondary to current work. They must not become rankings, public comparisons, artificial praise, or gates that prevent a student from continuing.

## Proposed Navigation Model

The Student Dashboard should act as the student home destination.

The eventual student navigation may reserve access to:

- Home.
- My STEM Work.
- Activities.
- Help.
- Profile.

Navigation requirements:

- Student-only destinations.
- Clear current-location treatment.
- Consistent sign-out access.
- Logical keyboard order.
- No links to protected teacher routes.
- No dead-end enabled controls.
- Unavailable destinations labeled honestly rather than simulated.

This blueprint does not authorize new routes. Route additions require the PB-003 Build Specification to identify exact paths, guards, restoration behavior, and tests.

## Dashboard Content States

Every future dashboard region should define these states where applicable:

### Available

The action is backed by an approved source and may be opened safely.

### Continue

Trustworthy resumable work exists and the action returns to that work without creating a duplicate.

### Empty

No current item exists. The message explains this without blame or urgency.

### Unavailable

The feature or resource exists conceptually but is not available to this student or build. The control is disabled or omitted with honest explanation.

### Loading

If a future data source requires loading, the page keeps its structure stable and does not expose stale information as current.

### Error

The student receives a calm recovery path. Errors must not reveal credentials, roster data, internal identifiers, or another student's information.

PB-003 must not use color alone to communicate these states.

## Student Continuity Rules

The eventual dashboard must follow these rules:

- Teacher review never blocks continued work.
- Credits, badges, jobs, or reflections never block continued work.
- A student may return to previous work when the approved activity permits it.
- Starting another available activity does not silently discard current work.
- The dashboard does not request information already known by the authorized session or an approved source.
- Refresh restoration must not change the student's role, class, or selected identity.
- Sign-out clears protected entry state according to the existing PB-001 session owner.

## Privacy and Role Boundary

Student Dashboard content may include only information authorized for the current student and class context.

It must never display:

- Teacher-only support signals.
- Individual blockers for other students.
- Teacher Feed content not explicitly approved for students.
- Class roster details.
- Private identifiers.
- Other students' work, credits, badges, jobs, or activity.
- Public rankings or leaderboards.
- Claims of teacher review without an authoritative record.

Direct navigation to teacher destinations must continue failing safely through the existing role guards.

## Visual Experience Direction

The Student Dashboard should feel:

- Welcoming without being childish.
- Focused without feeling empty.
- Energetic without animation or visual noise.
- Consistent with the existing isolated Platform visual language.
- Centered on the student's next useful action.

Recommended relationships:

- Today and Continue Working receive the strongest visual priority.
- My STEM Work and available tools are easy to scan.
- Growth indicators remain supportive and secondary.
- Disabled future areas remain legible but do not compete with available actions.
- Cards use natural content height and responsive wrapping rather than fixed-height clipping.

This blueprint does not lock exact colors, dimensions, card counts, grid columns, icons, illustrations, or assets. Those decisions require inspection and a bounded build specification.

## Accessibility and Chromebook Requirements

The eventual build must provide:

- Semantic landmarks and heading order.
- Clear link and button labels.
- Visible keyboard focus.
- At least 44 CSS-pixel primary interaction targets.
- Readable contrast and text sizing.
- Status meaning that does not rely on color alone.
- Responsive stacking without horizontal page scrolling.
- No hover-only information.
- Keyboard and touchpad access to every enabled action.
- Stable layout at common Chromebook and narrow viewports.
- Graceful long-name and translated-text wrapping.

## Protected Systems

Any future PB-003 implementation must protect:

- PB-001 authentication shell, student entry, roles, routing, guards, session ownership, and sign-out.
- PB-002A through PB-002E Teacher Command Center behavior.
- Lesson Timer and Student Display behavior.
- Teacher Memo behavior.
- Builder.
- Workshop.
- Mission behavior.
- Rendering, camera, measurement, and persistence behavior.
- Existing assets and approved Google workflow links.
- Unrelated repository files.

## Explicitly Outside This Blueprint

This blueprint does not authorize implementation of:

- Mission assignment, launch, stages, progress, or completion.
- Continue Current Mission logic.
- Activity availability rules.
- Builder or Workshop integration.
- Google Slides, Google Vids, or Google Drive integration.
- Portfolio storage or evidence tracking.
- What I Learned Today integration or a replacement reflection form.
- Help requests or support-signal logic.
- Classroom jobs or Kit Manager behavior.
- Engineering Credits or badges.
- Student profiles beyond an honest reserved area.
- Teacher review indicators or feedback workflows.
- Student tracking, active-time analytics, or reports.
- Notifications, rewards, celebrations, or recommendations.
- AI features.
- Backend, database, production authentication, or cross-device synchronization.
- New routes, session keys, fixtures, assets, frameworks, or dependencies.

## Recommended Build Decomposition

PB-003 should not attempt the complete future Student Dashboard in one implementation. After inspection, the approved experience may be divided into bounded builds such as:

1. Student Dashboard layout and navigation foundation.
2. Today and Continue Working state presentation.
3. Available Activities presentation.
4. My STEM Work organization.
5. Approved reflection and help links.
6. Growth and profile presentation.

These are planning candidates only. Their order, names, and scope require separate inspection and approval.

## Required Pre-Implementation Decisions

Before a PB-003 Build Specification is approved, inspection must determine:

- The smallest first implementation milestone.
- Which PB-001 shell elements remain and which may be reorganized.
- Whether the first milestone is layout-only or has an approved data source.
- Exact navigation destinations and whether any new routes are required.
- The authoritative owner for current and resumable work.
- Honest empty and unavailable messages.
- Session and refresh boundaries.
- Exact authorized files and tests.
- Chromebook viewport and interaction checks.
- Builder and Workshop regression requirements.

If an authoritative data source does not exist, the first build must remain an honest shell and must not simulate student activity.

## Blueprint Validation Checklist

Confirm before approval:

- The hierarchy prioritizes Today and Continue Working.
- Student continuity does not depend on teacher review.
- The dashboard does not duplicate reflection entry.
- Private identifiers and teacher-only information remain hidden.
- No ranking, public comparison, or invented praise is introduced.
- Future tools and integrations remain honest placeholders.
- New routes and data owners are deferred to a build specification.
- PB-001 and PB-002 systems remain protected.
- Builder and Workshop remain protected.
- Chromebook and accessibility requirements are explicit.
- The blueprint contains no implementation authorization.

## Approval and Next Step

Approval of this blueprint establishes experience direction only.

The next authorized step should be a read-only PB-003 pre-implementation inspection to identify the smallest safe first Student Dashboard build. That inspection may then support a separate PB-003 Build Specification.

Do not implement, modify application files, stage, commit, tag, or push based on this blueprint alone.
