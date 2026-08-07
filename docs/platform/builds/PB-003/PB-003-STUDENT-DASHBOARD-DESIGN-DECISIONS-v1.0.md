# PB-003 — Student Dashboard Design Decisions

## Design Decisions v1.0

Status: Proposed decisions pending review and approval  
Companion Document: PB-003 Student Dashboard Experience Blueprint v1.0  
Foundation: PB-001 — Platform Foundation

## Document Boundary

This document records Student Dashboard experience decisions only. It does not authorize implementation, application-file changes, new routes, storage, integrations, assets, or production services.

Each implementation milestone requires a separately reviewed and approved build specification.

## Decision 1 — First Login Experience

### Decision

The first successful student entry opens a short, welcoming dashboard orientation before presenting the full Student Dashboard hierarchy.

The orientation must help the student understand:

- This is their private Student Dashboard for the selected class.
- The dashboard helps them find what to do now, continue work, and find their STEM work.
- They can use the visible BOB Read-Aloud control if they want the welcome guidance read aloud.
- They can continue to the dashboard immediately.

### Required Experience

- Use the authorized student display name and current class name only when already available from the PB-001 session.
- Keep the welcome concise enough to understand without scrolling at a Chromebook viewport.
- Provide one clear primary action: `Go to My Dashboard`.
- Allow immediate keyboard and touchpad operation.
- Keep all essential instructions visible as text.
- Do not require audio, a tutorial sequence, profile setup, preference selection, or teacher approval.
- Do not ask the student to re-enter information already known by the session.

### Returning Students

Returning students should enter the Student Dashboard directly. The introductory orientation should not interrupt every login.

A future approved dashboard may provide a quiet way to reopen the welcome guidance, but PB-003 must not create a permanent tutorial requirement.

### Persistence Boundary

The eventual build specification must identify how first-login completion is known. It must not invent production persistence while PB-001 still uses development-only fixtures and session-based entry.

If no approved durable owner exists, the first bounded build may treat the welcome as a session-level orientation and must document that limitation honestly.

### Prohibited Behavior

The first-login experience must not:

- Autoplay audio.
- Force a multi-step tour.
- Block dashboard access until narration finishes.
- Ask for personal email, profile details, reading level, disability information, or preferences.
- Display the private identifier after entry.
- Claim that the teacher reviewed or prepared personalized work.
- Simulate a mission, progress record, portfolio, credit, badge, job, or help request.

## Decision 2 — BOB Read-Aloud Behavior

### Decision

BOB Read-Aloud is an optional, student-controlled accessibility aid for approved dashboard guidance. It is not a chatbot, tutor, AI assistant, conversation system, or substitute for visible text.

### Control Model

- Read-Aloud never starts automatically.
- The student initiates narration with a clearly labeled `Read Aloud` control.
- While narration is active, the same control area provides an obvious `Stop Reading` action.
- The student may restart the current approved guidance after it stops.
- Navigating away, signing out, or leaving the authorized guidance context stops narration.
- Narration never blocks navigation or primary dashboard actions.
- The page remains fully usable when audio is muted, unavailable, interrupted, or unsupported.

Pause, resume, voice selection, reading speed, word highlighting, and persistent audio preferences are not authorized by this decision. They require later inspection if needed.

### Content Boundary

BOB may read only visible, approved guidance associated with the current dashboard context.

BOB must not:

- Read hidden content, private identifiers, credentials, roster information, or teacher-only data.
- Read other students' names or work.
- Generate new advice, praise, instructions, summaries, or recommendations.
- Interpret mission progress or student performance.
- Read user-entered content automatically.
- Send text, audio, or student information to an external service without a separately approved architecture and privacy review.

### Text and Audio Relationship

- Visible text is authoritative.
- Audio wording matches the visible approved guidance in meaning.
- Essential information is never audio-only.
- The Read-Aloud control has a clear accessible name and state.
- Status changes such as reading, stopped, or unavailable are communicated without relying on sound alone.

### Technology Boundary

This document does not select browser speech synthesis, recorded audio, a backend voice service, or any other speech technology.

The first build specification that includes Read-Aloud must inspect Chromebook support, privacy, offline behavior, voice consistency, error handling, and testing before selecting an implementation.

If no safe and reliable technology is approved, the dashboard proceeds with visible guidance and Read-Aloud remains an honest unavailable control or is deferred.

## Decision 3 — Visual Navigation Rules

### Decision

Student navigation is visual, text-labeled, shallow, and centered on the next useful student action.

### Navigation Priority

The dashboard uses this visual priority:

1. Today.
2. Continue Working.
3. Available Activities.
4. My STEM Work.
5. Reflection and Classroom Tools.
6. Growth and Profile.

Growth, credits, badges, and profile areas must not visually overpower current work.

### Navigation Requirements

- Every enabled destination uses a concise text label; icons may support but never replace labels.
- The current location is visible and programmatically identified.
- Primary actions are visually distinct from informational cards.
- A whole card may be interactive only when it represents one unambiguous destination.
- Cards with multiple actions use separate labeled controls.
- Enabled controls lead somewhere functional; future features remain disabled or clearly labeled.
- No hover-only labels, instructions, or actions.
- Keyboard order follows reading order.
- Focus treatment remains visible.
- Primary interaction targets are at least 44 CSS pixels.
- Responsive reflow preserves priority and meaning without horizontal page scrolling.
- Browser Back and refresh behavior must remain predictable within the approved route architecture.

### Visual Language

- Use the existing namespaced Platform visual language.
- Prefer calm surfaces, clear headings, and limited accent colors.
- Use color to reinforce meaning, never as the only signal.
- Avoid flashing, pulsing, automatic carousels, confetti, noisy animation, and game-like urgency.
- Use natural card heights and readable wrapping rather than clipping or internal card scrolling.
- Do not introduce new character artwork, icons, or assets without separate approval.

### Route Boundary

These decisions define presentation rules, not route authorization. Exact student destinations, paths, guards, and restoration rules remain subject to pre-implementation inspection and a build specification.

## Decision 4 — Guided Choice Model

### Decision

The Student Dashboard uses guided choice: it makes the most relevant approved action easiest to find while preserving student access to other available work.

Guidance organizes choices; it does not make hidden judgments or lock students into one path.

### Choice Order

When authoritative information eventually exists, the dashboard presents choices in this order:

1. `Continue` an active or resumable item.
2. `Start` an available assigned activity.
3. Open `My STEM Work` to revisit existing evidence or work.
4. Use approved classroom resources such as reflection or Help.

### Choice Rules

- Show one strongest next action when the source clearly identifies it.
- Keep other authorized activities discoverable.
- Never block continuation because teacher review, credits, badges, jobs, or reflections are pending.
- Never silently discard current work when another activity opens.
- Never describe a student as ahead, behind, struggling, inactive, or needing intervention.
- Never infer a recommendation from page-open time, inactivity, support signals, or unapproved analytics.
- Never fabricate recent work, progress, availability, or deadlines.
- Use calm empty states when no authoritative choice exists.

### Teacher Direction

An approved future teacher assignment or mission source may determine what appears as current or available. The dashboard may present that authorized information but must not reinterpret it as a grade, approval, or personal praise.

### Student Agency

Students may continue current work, revisit prior work, or begin another approved available activity when the underlying system permits it. Guided choice must not become a forced sequence unless a separately approved mission design explicitly requires one.

## Decision 5 — Student Privacy Rules

### Decision

The Student Dashboard is private to the current authorized student session and uses the minimum information needed to orient that student.

### Permitted Student Context

The dashboard may display:

- The current student's approved display name.
- The current class display name when already known.
- The current student's authorized work, activities, evidence, and classroom tools when their owners are implemented.
- Class-wide student-safe directions from an approved source.

### Prohibited Dashboard Content

The dashboard must not display:

- The student's private identifier after entry.
- Another student's name, work, progress, activity, credits, badges, job, help request, or profile.
- The class roster.
- Teacher credentials or teacher-only controls.
- Teacher-only support signals.
- Individual blockers or Needs Attention information.
- Private Teacher Feed events.
- Rankings, leaderboards, comparative charts, or public status colors.
- Unverified teacher review, approval, praise, grading, or feedback.
- Internal fixture identifiers, session keys, debugging information, or raw errors.

### Shared-Device Behavior

- Sign-out uses the existing PB-001 owner and clears protected student entry state.
- Refresh must not switch student identity, class, or role.
- Direct navigation to teacher routes continues failing safely.
- Error and unavailable states reveal no roster or credential information.
- A later build must inspect Back-button and browser-history exposure before displaying sensitive student work.

### Public Display Boundary

Student Dashboard content is not Smart Board content. Nothing from an individual Student Dashboard may appear on the classroom Student Display unless a future build provides explicit teacher control, class-safe review, and separate approval.

## Decision 6 — Teacher Control Boundaries

### Decision

Teachers control classroom assignments and teacher-authorized class information through future approved teacher systems. Teachers do not remotely control the student's ordinary dashboard navigation or require repetitive approval for normal student continuation.

### Teacher May Eventually Control

Through separately approved systems, teachers may control:

- Which missions or activities are assigned or available.
- Class-wide directions intended for students.
- Classroom jobs and Kit Manager assignments.
- Skill-specific Peer Helper assignments.
- Teacher-approved public recognition.
- Human judgment where review or evaluation is required.

### Teacher Must Not Be Required To

- Approve every student login.
- Approve every continuation of existing work.
- Re-enter student or class information the Platform already knows.
- Mark routine items complete merely to unlock the student's next permitted action.
- Repeatedly dismiss normal dashboard states.

### Dashboard Must Not Expose

- Teacher Command Center navigation.
- Teacher Feed administration.
- Wins, Blockers, or Next Steps controls.
- Support-signal controls or classifications.
- Reports, analytics, private notes, or teacher settings.
- Student Display presentation controls.

### Control Separation

The Student Dashboard may reflect teacher-authorized assignments or class-wide content, but it cannot create, edit, or override those teacher records.

Teacher controls must remain in protected teacher routes. Student routes remain student-only, and wrong-role protection remains authoritative.

## Decision 7 — PB-003 Build Decomposition

### Decision

PB-003 will be delivered as bounded sub-builds. The Student Dashboard experience will not be implemented as one large milestone.

### PB-003A — Student Home Layout and Navigation Foundation

Proposed objective:

- Replace the PB-001 Student Dashboard shell with the approved hierarchy and visual navigation foundation.
- Preserve honest placeholders where no authoritative data owner exists.
- Preserve PB-001 entry, role, route, refresh, and sign-out behavior.

Potential content:

- Student orientation.
- Today area.
- Continue Working area.
- Available Activities area.
- My STEM Work area.
- Reflection and Classroom Tools area.
- Growth and Profile area.
- Responsive student navigation.

No mission logic, tool integration, progress, analytics, or production persistence is included.

### PB-003B — First Login Welcome and BOB Read-Aloud Foundation

Proposed objective:

- Add the approved concise first-login orientation.
- Add optional student-controlled Read-Aloud only if inspection approves a safe Chromebook-compatible technology.

The build specification must define the persistence boundary and audio fallback before implementation.

### PB-003C — Today and Continue Working Presentation

Proposed objective:

- Present current and resumable work from an approved authoritative source.

This build cannot proceed until the current-work owner, availability rules, launch behavior, and honest empty states are approved.

### PB-003D — Available Activities

Proposed objective:

- Present activities authorized by a separately approved assignment or mission source.

This build does not create assignment rules or mission behavior.

### PB-003E — My STEM Work

Proposed objective:

- Organize approved student work and evidence sources.

Builder, Workshop, Slides, Vids, portfolio, and evidence connections require their own inspected integration boundaries before inclusion.

### PB-003F — Reflection, Help, and Classroom Tools

Proposed objective:

- Present approved access to What I Learned Today, Help, classroom jobs, and Kit Manager assignments.

This build must preserve the Google Form as the only reflection source and must not expose teacher-only support signals.

### PB-003G — Growth and Profile

Proposed objective:

- Present approved Engineering Credits, badges, and student profile information as secondary dashboard content.

No rankings, public comparisons, artificial praise, or work-blocking gates are permitted.

### Decomposition Rules

- Each sub-build has one primary objective.
- Each sub-build requires inspection, specification, testing, Chromebook validation, approval, and separate commit authorization.
- A later sub-build may be deferred without weakening the usability of earlier completed builds.
- Build names and sequence remain proposed until reviewed against repository architecture and authoritative data sources.
- No sub-build may silently implement another sub-build's data model or integration.

## Protected Systems

All PB-003 sub-builds must protect:

- PB-001 student entry, authentication shell, roles, routing, guards, session ownership, and sign-out.
- PB-002A through PB-002E Teacher Command Center and Student Display behavior.
- Builder.
- Workshop.
- Mission behavior.
- Existing Google workflow links.
- Existing assets.
- Unrelated files and systems.

## Decision Validation Checklist

Confirm before approval:

- First login is concise, optional to revisit, and never blocks ordinary dashboard use.
- Read-Aloud is student-initiated, visible-text-based, stoppable, and nonessential.
- No speech technology is selected without inspection.
- Visual navigation remains labeled, accessible, and Chromebook-friendly.
- Guided choice preserves student agency and never invents progress.
- Private identifiers and other students' information remain hidden.
- Teachers control assignments, not ordinary student navigation.
- PB-003 is separated into bounded, independently approved builds.
- No implementation or new architecture is authorized by this document.

## Approval and Next Step

Approval establishes these experience decisions as design authority for PB-003 planning only.

The next step should be a read-only PB-003A pre-implementation inspection. That inspection should compare the existing PB-001 Student Dashboard shell with the approved blueprint and these decisions, then identify the smallest safe layout-and-navigation foundation.

Do not implement, modify application files, stage, commit, tag, or push based on this document alone.
