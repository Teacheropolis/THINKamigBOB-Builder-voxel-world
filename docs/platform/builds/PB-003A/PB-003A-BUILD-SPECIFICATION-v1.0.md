# PB-003A — Student Home Experience

## Build Specification v1.0

Status: Proposed specification pending review and approval  
Parent Build: PB-003 — Student Dashboard Experience  
Foundation: PB-001 — Platform Foundation

## Controlling References

- `docs/platform/PLATFORM-BLUEPRINT-v1.0.md`
- `docs/platform/DEVELOPMENT-STANDARDS-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-EXPERIENCE-BLUEPRINT-v1.0.md`
- `docs/platform/builds/PB-003/PB-003-STUDENT-DASHBOARD-DESIGN-DECISIONS-v1.0.md`
- `docs/platform/builds/PB-003A/PB-003A-STUDENT-HOME-EXPERIENCE-BLUEPRINT-v1.0.md`

## Build Objective

Replace the PB-001 Student Dashboard placeholder grid with an honest, accessible, Chromebook-ready Student Home layout foundation.

PB-003A must help a signed-in student quickly:

- Confirm their student and class context.
- Understand that the dashboard is their private student home.
- Locate the Current Goal area.
- Review reserved Yesterday's Wins and Yesterday's Challenge areas.
- Locate the What I Learned Today check.
- Understand the future Choose Your Path structure.

PB-003A is a layout-and-content-state build only. No authoritative sources currently exist for missions, Wins, Challenges, reflection status, goals, current work, available activities, portfolios, or help requests. Those areas must remain truthful empty or unavailable states.

## Primary User

Student authenticated through the existing PB-001 development entry flow.

The page should answer within 10 seconds:

> Am I in the right place, what matters today, and where will I choose what to do next?

## Required User Flow

```text
Class Code
→ Roster Selection
→ Private Identifier
→ Existing protected Student Dashboard route
→ PB-003A Student Home layout
```

Use the existing PB-001 route, role guard, session owner, refresh restoration, and sign-out behavior.

Do not add authentication, a role, a route, a redirect, or a session key.

## Included Scope

Implement only:

- Student Home layout within the existing Student Dashboard route.
- Student and class orientation using existing PB-001 session and fixture records.
- Visible BOB Welcome guidance.
- Current Goal empty state.
- Yesterday's Wins empty state.
- Yesterday's Challenge empty state.
- What I Learned Today check-unavailable state.
- Choose Your Path layout with honest unavailable cards.
- Responsive visual navigation foundation.
- Namespaced Student Home CSS.
- Accessibility and Chromebook presentation requirements.
- Focused PB-003A tests.
- PB-003A implementation notes.

## Explicitly Out of Scope

Do not implement:

- First-login recognition or completion persistence.
- Read-Aloud audio, speech synthesis, recorded narration, or an audio service.
- Read Aloud or Stop Reading controls.
- Chatbot, conversational BOB, AI, recommendations, or generated guidance.
- Mission assignment, launch, stages, progress, completion, or restoration.
- Win detection or activity-history logic.
- Challenge detection, help requests, or support signals.
- What I Learned Today Google integration or submission checking.
- A reflection form, editor, response display, summary, or score.
- Current Goal creation, editing, assignment, or persistence.
- Continue Current Work behavior.
- Activity availability or launch behavior.
- Builder or Workshop integration.
- Google Slides, Google Vids, Google Drive, or portfolio integration.
- My STEM Work data.
- Classroom jobs, Kit Manager, Engineering Credits, badges, or profile behavior.
- Teacher controls or teacher-to-student publishing.
- Tracking, analytics, reports, notifications, rewards, or public recognition.
- Backend, database, production authentication, cross-device synchronization, framework, dependency, or asset.
- New student routes or navigation destinations.

## Student Home Layout

### Overall Page Structure

The existing Student Dashboard route becomes the Student Home and contains, in DOM and keyboard order:

1. Student orientation header.
2. BOB Welcome region.
3. Current Goal region.
4. Yesterday overview containing Wins and Challenge.
5. What I Learned Today check.
6. Choose Your Path region.

The page remains inside the existing Platform shell and retains the existing global Sign Out action.

### Student Orientation Header

Display:

- Page title: `Student Home`.
- Existing student display name from `getStudentById(state.studentId)`.
- Existing class display name from `getClassById(state.classId)`.
- A concise private-dashboard orientation such as `Your private place to see what matters and choose what comes next.`

Do not display:

- Private identifier.
- Class code.
- Roster.
- Teacher-only context.
- Raw student or class IDs.

If the expected fixture lookup is unavailable, use the existing safe fallback labels and do not expose the identifier value.

### BOB Welcome Region

Display:

- Heading: `BOB Welcome`.
- A concise visible welcome using the authorized student display name.
- Guidance directing the student toward Current Goal and Choose Your Path.

The visible message is informational and contains no enabled control in PB-003A.

Required honest wording relationship:

- Welcome the student.
- State that goals and paths will appear when ready.
- Do not imply that a teacher personally prepared, reviewed, or approved content.

### Current Goal Region

Display:

- Heading: `Current Goal`.
- Empty-state message: `No current goal is available yet.`
- Supporting explanation that a goal will appear when an approved classroom goal source is connected.

Do not display a fabricated goal, mission, due date, progress value, Continue action, or enabled control.

This region receives the strongest visual priority after orientation and welcome.

### Yesterday Overview

Provide one labeled group containing two coordinated regions.

#### Yesterday's Wins

Display:

- Heading: `Yesterday's Wins`.
- Empty-state message: `No verified Win is available yet.`
- A short explanation that only verified student activity will appear here in a future approved build.

Do not invent praise, completion, saves, evidence, or teacher review.

#### Yesterday's Challenge

Display:

- Heading: `Yesterday's Challenge`.
- Empty-state message: `No Challenge is available yet.`
- A short explanation that private, approved work reminders may appear here in a future build.

Do not infer difficulty, inactivity, support need, or performance. Do not show a public or student-visible support color.

### What I Learned Today Check

Display:

- Heading: `What I Learned Today`.
- Explicit state: `Check unavailable`.
- Explanation that submission status is not connected in PB-003A.

Do not display Submitted or Not submitted because no authoritative Google Form status source is approved.

Do not include a reflection editor, text field, fake submission, response content, or enabled link.

### Choose Your Path Region

Display heading: `Choose Your Path`.

Display concise guidance explaining that available choices will appear here without requiring teacher review for ordinary continuation.

Reserve exactly these path cards:

1. `Continue Current Work`
2. `Start an Available Activity`
3. `Open My STEM Work`
4. `What I Learned Today`
5. `Ask for Help`

Each card must contain:

- Visible path name.
- One concise description.
- Honest unavailable state.
- A disabled native button labeled `Coming in a future build`.

No card may navigate, launch, save, create, submit, or simulate activity.

Disabled cards must not suggest that the student is behind, missing permission, or waiting for teacher review.

## Visual Navigation Requirements

PB-003A provides a visual navigation foundation within the existing route, not new navigation destinations.

Requirements:

- Use visible text labels for all path cards.
- Icons are not required and new icon assets are prohibited.
- Distinguish headings, state labels, descriptions, and disabled actions.
- Keep Current Goal and Choose Your Path visually prominent.
- Keep Wins, Challenge, and reflection check supportive and secondary.
- Use natural card heights without clipping or internal card scrolling.
- Preserve logical reading order during responsive reflow.
- Avoid hover-only information.
- Avoid animation, autoplay, carousels, flashing, pulsing, confetti, and game-like urgency.
- Use only namespaced Platform CSS.
- Do not change the global teacher navigation or Student Display presentation.

## BOB Interaction Rules

PB-003A includes visible BOB Welcome guidance only.

The BOB region must:

- Remain concise and readable without interaction.
- Use only existing authorized student and class context.
- Point toward dashboard regions rather than generating a recommendation.
- Contain no chatbot input, prompt, microphone, audio player, or enabled BOB action.
- Remain fully usable without sound.

PB-003A must not render a disabled Read Aloud button because a visible but unusable accessibility promise would be misleading. Read-Aloud requires a separate inspection and build specification that selects and validates a safe Chromebook-compatible technology.

## Data Ownership Rules

### Existing Authorized Owners

PB-003A may read only:

- Student role and IDs from the existing PB-001 session store.
- Student display name from the existing PB-001 development fixture lookup.
- Class display name from the existing PB-001 development fixture lookup.

Fixture data must retain its existing development-only labeling and must not be described as production authentication or durable student data.

### No New Data Owners

PB-003A must not add:

- A session key.
- A storage record.
- A fixture for Wins, Challenges, reflection status, goals, activities, work, help, or BOB preferences.
- Local storage.
- A backend or database.
- Network calls.
- Cross-device state.

### Unowned Information

Because no approved owner exists, these states are always empty or unavailable in PB-003A:

- Current Goal.
- Yesterday's Wins.
- Yesterday's Challenge.
- What I Learned Today submission status.
- Current work.
- Available activities.
- My STEM Work.
- Help requests.

Do not derive any state from page-open time, login count, inactivity, timer state, teacher memo, support classifications, or unrelated fixture information.

## Empty-State Standard

Every empty or unavailable state must:

- State plainly that information is not available yet.
- Avoid blame, urgency, judgment, or false personalization.
- Avoid implying that the student must wait for teacher review.
- Avoid presenting simulated content.
- Remain readable and visually intentional.
- Use text rather than color alone.

Required core messages:

- Current Goal: `No current goal is available yet.`
- Yesterday's Wins: `No verified Win is available yet.`
- Yesterday's Challenge: `No Challenge is available yet.`
- Reflection: `Check unavailable.`
- Path actions: `Coming in a future build.`

Minor punctuation and supporting copy may be refined during implementation, but the meaning must remain unchanged.

## Privacy Boundaries

PB-003A must:

- Render only the current authorized student's display name and class display name.
- Keep private identifier, class code, and raw IDs hidden.
- Preserve student/teacher route separation.
- Preserve direct-route and wrong-role guards.
- Preserve existing sign-out cleanup.
- Avoid another student's identity or information.
- Avoid teacher-only content, controls, notes, reports, Feed, or support signals.
- Avoid rankings, comparisons, public status colors, and invented teacher feedback.
- Keep Student Home content separate from Student Display and Smart Board content.
- Fail safely if fixture lookup information is missing.

No Student Home content may be sent to Student Display, copied to teacher state, or stored independently.

## Accessibility Requirements

Implement:

- Semantic main-page regions or sections.
- One clear page title and logical heading hierarchy.
- Programmatically associated section headings.
- A labeled Yesterday overview group.
- Native disabled buttons for unavailable path actions.
- Disabled and unavailable meaning communicated in text.
- Visible focus on all existing enabled controls, including Sign Out.
- DOM order matching the required reading order.
- Readable contrast and text sizing.
- No meaning communicated through color alone.
- No required audio or interaction for BOB guidance.
- No hover-only content.
- Reduced-motion compatibility through the existing Platform foundation.
- Graceful text wrapping for long names and content.

Disabled path actions must not enter the keyboard tab order through custom scripting.

## Chromebook Requirements

Validate physically at the approved Chromebook environment:

- First-viewport orientation is understandable within 10 seconds.
- Student and class context are readable.
- Current Goal and Choose Your Path are easy to find.
- Layout has no horizontal scrolling.
- Page uses natural vertical scrolling.
- No card has internal scrolling or clipped content.
- Enabled controls retain at least 44 CSS-pixel targets.
- Disabled path controls remain readable.
- Keyboard and touchpad operation remain correct.
- Visible focus remains clear.
- Long student and class names wrap safely.
- Layout remains stable at common Chromebook and narrow widths.
- Refresh restores the existing protected student route.
- Wrong-role protection remains intact.
- Sign-out clears the student session and removes Student Home content.
- No console error, slowdown, stale student identity, or unexpected state occurs.

## Authorized Implementation Surface

A future approved PB-003A implementation may modify only:

- `platform/scripts/platform-app.mjs`
- `platform/styles/platform.css`
- Existing PB-001 Platform tests whose Student Dashboard placeholder assertions directly conflict with PB-003A
- A new focused PB-003A test under `tests/platform/`
- `docs/platform/builds/PB-003A/PB-003A-IMPLEMENTATION-NOTES.md`

Do not modify:

- `platform/index.html`
- `platform/scripts/platform-session.mjs`
- `platform/scripts/platform-fixtures.mjs`
- Timer, memo, or Student Display modules
- Controlling specifications or blueprints
- Builder files
- Workshop files
- Mission files
- Assets
- `.vscode/settings.json`
- Unrelated files

If a prohibited file is required, stop for additional inspection.

## Protected Systems

Protect:

- PB-001 teacher and student entry flows.
- PB-001 roles, routing, guards, fixtures, session restoration, and sign-out.
- PB-002A through PB-002E Teacher Command Center.
- Lesson Timer, Teacher Memo, presentation modes, and Student Display.
- Builder.
- Workshop.
- Mission behavior.
- Rendering, camera, measurement, and existing persistence behavior.
- Approved assets and Google workflow links.

## Testing Requirements

### Focused Automated Tests

Verify:

- Existing `/student/dashboard` route remains the Student Home route.
- Student and teacher guards remain unchanged.
- Existing session and sign-out ownership remain unchanged.
- Student Home reads student and class display names from existing PB-001 fixture lookups.
- Private identifier, class code, and raw IDs do not appear in Student Home markup.
- Required layout sections appear in the required order.
- BOB Welcome contains visible guidance and no audio, chatbot, prompt, or enabled BOB action.
- Current Goal uses the required empty state.
- Wins and Challenge use required empty states.
- Reflection displays Check unavailable and contains no form field.
- Choose Your Path contains exactly five required path cards.
- All five path actions are native disabled buttons.
- No mission, activity, work, reflection, or Help behavior is simulated.
- No new route or session key is added.
- Student Home CSS remains namespaced and responsive.
- Protected teacher Student Display content is unchanged.

### Platform Regression Tests

Run all Platform tests and verify:

- PB-001 teacher login and student entry pass.
- Refresh and sign-out protection pass.
- Teacher/student wrong-role protection passes.
- PB-002A through PB-002E tests pass.
- No teacher dashboard layout or behavior changes.

### Protected-System Regression

- Run the complete Workshop test suite.
- Perform a Builder smoke test.
- Perform a Workshop smoke test.
- Confirm protected files and assets are unchanged.

### Browser Inspection

Inspect at minimum at 1024×600, 1366×768, and a narrow viewport:

- Required hierarchy and reading order.
- Honest state visibility.
- Long-name wrapping.
- Responsive path-card layout.
- No horizontal overflow.
- No clipped or internally scrolling cards.
- Keyboard order and visible focus.
- No console errors.

### Physical Chromebook Validation

Verify every Chromebook requirement in this specification. Local desktop testing does not replace physical Chromebook validation.

## Stop Conditions

Stop and request additional inspection if implementation requires:

- First-login persistence.
- Speech or audio technology.
- A new route, role, session key, fixture record, or data model.
- An authoritative Win, Challenge, reflection, goal, work, activity, or Help source.
- An enabled Choose Your Path destination.
- A new asset, dependency, framework, backend, or integration.
- Modification of a prohibited or protected file.
- Changes to PB-001 entry or PB-002 teacher behavior.

## Definition of Done

PB-003A is complete only when:

- The PB-001 Student Dashboard placeholder grid is replaced by the approved Student Home layout.
- Student and class orientation uses only existing authorized PB-001 context.
- BOB Welcome is visible, concise, truthful, and noninteractive.
- Current Goal, Wins, Challenge, and reflection use approved honest states.
- Choose Your Path contains exactly five honest unavailable cards.
- No activity, progress, teacher review, reflection, or integration is simulated.
- Student privacy and role boundaries remain intact.
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
- Layout and empty-state changes.
- Data-owner boundaries preserved.
- Accessibility and Chromebook results.
- Focused tests.
- Platform regression results.
- Builder and Workshop regression results.
- Known limitations.
- Physical Chromebook validation status.

This specification does not authorize implementation, staging, committing, tagging, or pushing.
