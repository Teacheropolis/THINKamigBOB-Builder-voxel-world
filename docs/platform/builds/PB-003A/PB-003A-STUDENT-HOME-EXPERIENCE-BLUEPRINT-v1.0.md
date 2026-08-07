# PB-003A — Student Home Experience

## Design Blueprint v1.0

Status: Proposed blueprint pending review and approval  
Parent Build: PB-003 — Student Dashboard Experience  
Foundation: PB-001 — Platform Foundation

## Document Boundary

This document defines the proposed Student Home experience only. It is not a build specification and does not authorize implementation.

Any implementation requires a separately reviewed and approved PB-003A Build Specification and the complete THINKamigBOB development workflow.

## Purpose

Define a student home experience that helps each student enter class calmly, recognize authentic progress, understand the current focus, and choose a useful next action without waiting for teacher review.

The experience must make the student's work feel important while protecting privacy and avoiding invented praise, progress, challenges, goals, or reflection status.

## Primary Experience Question

Within the first 10 seconds after login, the student should be able to answer:

1. Am I in the correct class and dashboard?
2. What matters today?
3. What can I do next?

## First 10 Seconds After Student Login

### Immediate Orientation

After successful PB-001 student entry, the Student Home should immediately present:

- The authorized student's display name.
- The current class display name when already known.
- A brief BOB Welcome message.
- One visually dominant current-focus area.
- A clearly labeled Choose Your Path area containing only available or honestly unavailable choices.
- Consistent sign-out access.

The private identifier must not appear after entry.

### Attention Order

The first viewport should use this reading and keyboard order:

1. Student and class orientation.
2. BOB Welcome.
3. Current Goal.
4. Yesterday's Wins and Yesterday's Challenge.
5. What I Learned Today check.
6. Choose Your Path.

Responsive reflow may change columns but must preserve this logical order.

### Ten-Second Standard

Without opening a menu or reading a long paragraph, a student should be able to:

- Confirm the dashboard belongs to them.
- Identify the Current Goal or understand honestly that none is available.
- Find the strongest available next action.
- Locate the optional Read Aloud control.

The first viewport must not be dominated by badges, credits, profile settings, future features, platform instructions, or decorative media.

### First Login and Returning Login

On first login, BOB may provide concise visible orientation explaining the Student Home and Choose Your Path.

Returning students should receive a shorter welcome and reach useful dashboard content immediately. A repeated tutorial must not interrupt each login.

The eventual build specification must identify the approved owner for first-login recognition. If durable recognition is unavailable, the build must document a session-level limitation instead of inventing persistence.

## BOB Welcome Behavior

### Role

BOB Welcome is a calm orientation guide. BOB is not a chatbot, AI tutor, teacher substitute, grading system, or source of new classroom instructions.

### Visible Welcome

The welcome should:

- Address the student using only the authorized display name.
- Use brief, age-appropriate language.
- Point the student toward the Current Goal and Choose Your Path.
- Remain truthful when no current goal or activity source exists.
- Avoid praise that implies teacher review.

Examples of acceptable tone include:

- `Welcome back. Here's what is ready for you today.`
- `Choose a path when you're ready to begin.`

Final wording requires the build specification and content review.

### Read-Aloud

BOB Read-Aloud follows the PB-003 design decisions:

- Narration is optional and student-initiated.
- Audio never starts automatically.
- Visible text remains authoritative and complete.
- A clearly labeled Read Aloud control starts approved welcome guidance.
- An obvious Stop Reading control is available while narration is active.
- Narration stops when the student leaves the context or signs out.
- Audio failure never blocks the dashboard.

The blueprint does not select a speech technology. Chromebook support, privacy, external-service boundaries, error handling, and fallback behavior require inspection before Read-Aloud implementation.

### Prohibited BOB Behavior

BOB must not:

- Generate personalized recommendations from student behavior.
- Interpret grades, progress, support needs, or reflection responses.
- Read private identifiers, credentials, roster information, or teacher-only data.
- Invent a Win, Challenge, Goal, mission, deadline, or next step.
- Claim that the teacher reviewed or praised the student's work.
- Require narration before the student can continue.
- Send student text or audio to an external service without separate architectural and privacy approval.

## Yesterday's Wins

### Purpose

Yesterday's Wins helps the student recognize authentic forward movement from an approved prior activity source.

### Permitted Win Evidence

A future implementation may present a Win only when supported by an authoritative record such as:

- Work saved or revised.
- Evidence added.
- An approved activity step completed.
- A reflection submitted.
- Another objective event approved by a future build.

The exact event owner and wording must be defined before implementation.

### Presentation Rules

- Present the student's own verified activity only.
- Use factual wording rather than invented praise.
- Keep Wins private to the student dashboard.
- Allow more work to continue regardless of whether a Win exists.
- Use a calm empty state when no approved evidence exists.
- Do not compare the Win with another student or class.

Acceptable factual patterns may include `You saved work in [approved activity]` or `A reflection was submitted`, provided the source verifies the statement.

### Prohibited Win Claims

Do not display:

- `Your teacher loved this` without an authoritative teacher action.
- Quality judgments inferred from time, clicks, saves, or completion.
- Public rankings or competitive placement.
- Fabricated activity to avoid an empty state.
- Teacher-only support classifications.

## Yesterday's Challenge

### Purpose

Yesterday's Challenge provides a private, nonjudgmental reminder of an unresolved or student-identified obstacle that may help the student choose what to do next.

It is not a grade, warning, support color, behavior label, or public Blocker.

### Source Boundary

A Challenge may appear only from an approved source, such as:

- A student help request.
- A student-owned unresolved activity state.
- A class-safe teacher direction explicitly approved for student display.
- Another separately approved factual source.

The dashboard must not infer a Challenge solely from inactivity, time-on-page, repeated login, low activity, missing credits, or a teacher-only support signal.

### Presentation Rules

- Display only the current student's private Challenge or an anonymous class-wide Challenge.
- Use neutral language focused on the work, never the student's ability or character.
- Pair the Challenge with an available recovery or continuation path when one exists.
- Allow the student to continue other approved work.
- Use an honest empty state when no approved Challenge exists.

### Prohibited Challenge Content

Do not expose:

- Another student's name or obstacle.
- Private teacher notes.
- Green, yellow, or red support classification.
- Language such as behind, failing, struggling, inactive, or needs intervention.
- A requirement for teacher clearance before ordinary continuation.

## What I Learned Today Check

### Purpose

The check helps the student understand whether the existing What I Learned Today reflection has been submitted for the relevant class period.

### Source of Truth

The What I Learned Today Google Form remains the only reflection source.

PB-003A must not create:

- A duplicate reflection editor.
- A replacement form.
- A second reflection record.
- A summary generated from the student's response.
- An interpretation or score of the reflection.

### Approved States

When an authoritative integration exists, the check may present:

- `Submitted` — a verified submission exists for the relevant class context.
- `Not submitted` — the approved source confirms no submission for that context.
- `Check unavailable` — the source cannot be checked safely.
- `Reflection link unavailable` — no approved launch destination exists.

Wording must not imply that the teacher read or approved the response.

### Student Action

When an approved Google Form link exists, the dashboard may offer a clearly labeled action to open What I Learned Today.

Submitting reflection must not block current work, starting another available activity, or revisiting saved work.

### Timing Clarification

Because the Student Home is viewed at the beginning and throughout class, the eventual specification must define which class date or period the check represents. It must not label a submission as today's or yesterday's without an authoritative classroom-time boundary.

## Current Goal

### Purpose

Current Goal provides one clear student-facing statement of the most relevant approved classroom or activity focus.

### Authoritative Source

The goal must come from a separately approved mission, assignment, classroom, or student-goal owner. PB-003A does not create goal-setting, mission logic, or assignment rules.

### Presentation Rules

- Display one primary Current Goal.
- Identify its source or context clearly enough to avoid confusion.
- Keep wording short and actionable.
- Provide a Continue or Open action only when a functional destination exists.
- Preserve access to other approved choices.
- Use `No current goal is available yet` or equivalent honest language when no source exists.

### Goal Boundaries

The Current Goal must not:

- Be inferred from support signals, inactivity, grades, credits, or analytics.
- Claim completion without an authoritative record.
- Become a gate requiring teacher review before continuation.
- Replace the What I Learned Today reflection.
- Expose a teacher-only note or intervention plan.

## Choose Your Path Experience

### Purpose

Choose Your Path gives students guided agency: the most relevant approved action is easiest to find while other available paths remain understandable and reachable.

### Path Categories

The experience may reserve these future paths:

1. Continue Current Work.
2. Start an Available Activity.
3. Open My STEM Work.
4. Complete What I Learned Today.
5. Ask for Help.

Only paths backed by approved functional owners may be enabled.

### Guided Choice Rules

- Emphasize one strongest next action when an authoritative source identifies it.
- Keep other available choices visible without overwhelming the student.
- Distinguish Continue from Start.
- Do not silently create duplicate work.
- Do not discard current work when another path opens.
- Do not lock students into one path unless a separately approved mission design requires it.
- Do not require teacher review, credits, badges, jobs, or reflection before ordinary continuation.
- Do not infer recommendations from surveillance or unapproved analytics.

### Card Behavior

Each path card should contain:

- A concise path name.
- A short explanation.
- One clear state: available, continue, empty, unavailable, loading, or error.
- One primary action when functional.

If the whole card is interactive, it must represent one unambiguous destination. Cards with more than one action use separately labeled controls.

### Honest Unavailable States

Unavailable future paths remain disabled or use honest future-build messaging. They must not appear active, simulate launch behavior, or imply the student lacks permission because of performance.

## Visual Navigation Requirements

### Hierarchy

The Student Home should visually prioritize:

1. Current Goal.
2. Choose Your Path.
3. Yesterday's Wins and Challenge.
4. What I Learned Today check.
5. Secondary future areas.

On first login, the BOB Welcome may temporarily precede the Current Goal but must not permanently dominate returning-student use.

### Navigation Rules

- Use concise visible text labels for all destinations.
- Icons may support but never replace text.
- Identify the current page visibly and programmatically.
- Keep Home and Sign Out consistently reachable.
- Do not link students to teacher-only routes.
- Do not enable controls without a functional destination.
- Avoid nested navigation for the primary first-viewport actions.
- Preserve browser refresh and Back behavior within approved routing.
- Keep keyboard order consistent with the visual reading order.
- Provide visible focus for links, buttons, and interactive cards.
- Avoid hover-only actions or instructions.

### Visual Tone

- Welcoming, calm, and age-respectful.
- Energetic without flashing, pulsing, confetti, automatic carousels, or game-like urgency.
- Consistent with the namespaced Platform visual language.
- Focused on student work rather than software decoration.
- No new character art, icons, illustrations, or assets without separate approval.

This blueprint does not lock exact colors, icons, card dimensions, breakpoints, or grid columns.

## Privacy Boundaries

### Student-Safe Content

The Student Home may display only information authorized for the current student and class context.

Permitted information may include:

- Authorized student display name.
- Current class display name.
- Current student's verified Win, Challenge, Goal, reflection status, work, and available paths when their sources are approved.
- Anonymous class-wide directions approved for student presentation.

### Prohibited Information

Never display:

- The private identifier after login.
- A class roster.
- Another student's identity, work, progress, Challenge, reflection, credits, badges, job, help request, or activity.
- Teacher credentials, private notes, Teacher Feed, Needs Attention, reports, or controls.
- Teacher-only support signals.
- Rankings, leaderboards, comparisons, or public status colors.
- Raw fixture identifiers, session keys, debugging data, or internal errors.
- Claims of teacher review without an authoritative teacher action.

### Public Display Separation

Student Home content is private and must not flow to the classroom Student Display or Smart Board. Any future public sharing requires explicit teacher control, class-safe review, and separate approval.

### Shared Chromebook Rules

- Existing PB-001 sign-out remains authoritative.
- Refresh must preserve the correct authorized student, class, and role only within the approved session boundary.
- Wrong-role and direct-route protection remain intact.
- Error states reveal no roster or credential details.
- Browser-history and Back-button exposure require inspection before sensitive work is linked.

## Chromebook Requirements

The eventual PB-003A implementation must be validated physically on a Chromebook.

At minimum verify:

- The first 10-second content fits and reads clearly at the approved Chromebook viewport.
- No horizontal page scrolling.
- Natural vertical scrolling without nested card scroll areas.
- Primary actions provide at least 44 CSS-pixel interaction targets.
- Keyboard and touchpad operation.
- Visible focus at every interactive element.
- Long student names, class names, goals, Wins, and Challenges wrap without clipping.
- Choose Your Path cards reflow without changing their priority or state meaning.
- Read-Aloud controls remain usable if included by an approved specification.
- Audio unavailable and muted conditions do not block use.
- Refresh and Back behavior preserve protected student context.
- Sign-out prevents stale student content from remaining visible.
- No slowdown, layout shift, stale state, or console error disrupts entry.

Local desktop testing does not replace physical Chromebook validation.

## Accessibility Requirements

The eventual build must provide:

- Semantic page landmarks.
- One clear page heading and logical heading order.
- Programmatically associated labels and descriptions.
- Native links and buttons where appropriate.
- Visible keyboard focus.
- Logical focus order matching the reading order.
- Status messages announced appropriately without excessive interruption.
- State meaning expressed with text, not color alone.
- Readable contrast and scalable text.
- No hover-only content.
- No required audio.
- A visible text equivalent for everything BOB may read.
- A clear accessible name and state for Read Aloud and Stop Reading.
- Respect for reduced-motion preferences.
- Error messages that identify the problem and a safe next action.
- Graceful behavior when speech, JavaScript audio, or an external dependency is unavailable.

The build specification must define how the welcome, status checks, and dynamic path changes are announced without causing repeated or distracting screen-reader output.

## Data and Architecture Boundaries

This blueprint identifies desired information but does not authorize its data model.

Before implementation, inspection must identify authoritative owners for:

- First-login recognition.
- BOB Welcome content.
- Read-Aloud technology and lifecycle.
- Yesterday's Wins.
- Yesterday's Challenge.
- What I Learned Today submission status and link.
- Current Goal.
- Current and available path state.

If an approved owner does not exist, the related area must remain an honest empty or unavailable state. PB-003A must not invent records, add fixtures presented as real activity, or create a backend implicitly.

## Protected Systems

Any future implementation must protect:

- PB-001 student entry, roles, routing, guards, session ownership, fixtures, refresh, and sign-out.
- PB-002A through PB-002E Teacher Command Center and Student Display behavior.
- Builder.
- Workshop.
- Mission behavior.
- Existing Google workflow links.
- Rendering, camera, measurement, and persistence behavior.
- Existing approved assets.
- Unrelated files.

## Explicitly Out of Scope

This blueprint does not authorize:

- Application implementation.
- New routes, session keys, fixtures, dependencies, assets, or speech services.
- Mission assignment, stages, progress, completion, or launch.
- Win or Challenge detection logic.
- Teacher Feed, support signals, analytics, or reports.
- A reflection editor or replacement Google Form.
- Reflection-response interpretation or AI summaries.
- Goal creation or editing.
- Activity recommendation algorithms.
- Builder or Workshop integration.
- Google Slides, Google Vids, Google Drive, or portfolio integration.
- Help-request behavior.
- Jobs, Kit Manager, Engineering Credits, badges, or profiles.
- Notifications, rewards, public recognition, or competition.
- AI or conversational BOB behavior.
- Backend persistence, database, production authentication, or cross-device synchronization.

## Recommended Next Step

After blueprint review and approval, conduct a read-only PB-003A pre-implementation inspection.

The inspection should determine:

- Whether PB-003A begins as layout-only.
- Which requested regions have authoritative data owners today.
- Whether BOB Welcome and Read-Aloud should be separated into a later build.
- The exact first-login session boundary.
- The smallest safe file and test surface.
- Exact honest empty-state wording.
- Physical Chromebook validation requirements.

The resulting inspection may support a separate PB-003A Build Specification.

## Blueprint Validation Checklist

Confirm before approval:

- The first 10 seconds orient the student and expose a useful next action.
- BOB Welcome is brief, truthful, optional to hear, and non-blocking.
- Wins require verified evidence and never imply teacher review.
- Challenges remain private, factual, and nonjudgmental.
- What I Learned Today remains the single approved Google Form reflection source.
- Current Goal requires an authoritative owner.
- Choose Your Path preserves student agency and honest availability.
- Visual navigation is labeled and accessible.
- Student information never flows to public Student Display automatically.
- Chromebook and accessibility requirements are explicit.
- Missing data owners produce honest empty states rather than invented data.
- No implementation is authorized.

Approval of this blueprint establishes design direction only.

Do not implement, modify application files, stage, commit, tag, or push based on this document alone.
