# PB-002A — Classroom Command Board Layout

## Build Specification v1.0

**Status: AUTHORIZED FOR CREATION**

## Phase

Phase 1 — Platform Foundation Expansion

## Parent Build

PB-002 — Teacher Classroom Command Center

## Build

PB-002A — Classroom Command Board Layout

## Objective

Create the visual foundation of the Teacher Classroom Command Center.

The purpose is to provide the teacher with a clear **TODAY view** that communicates classroom focus, organization, and readiness.

PB-002A creates the structure only.

It does not create the intelligence behind the structure.

## 1. Primary User

Teacher

The page must answer:

> "What do I need to know about today's class?"

within 10 seconds.

## 2. Required User Flow

```text
Teacher Login

↓

Teacher Dashboard Shell

↓

Classroom Command Board

↓

View TODAY layout
```

PB-002A must use the existing PB-001 teacher routing.

No new authentication.

No new roles.

## 3. Required Layout

### Top Navigation Bar

Purpose:

Teacher orientation.

Display:

- THINKamigBOB identity
- Teacher name
- Current class
- Current period
- Settings access
- Sign out

## 4. TODAY Command Board

The primary screen area.

The layout must visually prioritize TODAY.

### Section A — Today's Mission

Purpose:

Show the classroom focus.

PB-002A displays:

Placeholder:

```text
Today's Mission

Coming in future build
```

No mission logic.

No assignments.

### Section B — Lesson Progress

Purpose:

Reserve the location for future timing and lesson stages.

Display:

```text
Lesson Progress

Timer coming in future build
```

No timer functionality.

### Section C — Teacher Memo

Purpose:

Reserve teacher communication space.

Display:

```text
Teacher Memo

Class message coming in future build
```

No editing.

No persistence.

### Section D — Wins

Purpose:

Establish the permanent classroom rhythm.

Display:

```text
🏆 Wins

Future classroom accomplishments will appear here.
```

No automation.

### Section E — Blockers

Purpose:

Establish engineering problem-solving culture.

Display:

```text
🚧 Blockers

Future classroom challenges will appear here.
```

No student data.

No support signals.

### Section F — Next Steps

Purpose:

Establish forward movement.

Display:

```text
➡️ Next Steps

Future class direction will appear here.
```

No automation.

## 5. Teacher Feed Shell

Location:

Bottom area.

Purpose:

Reserve space for future Teacher Feed.

Display:

```text
Teacher Feed

Future classroom events will appear here.
```

No events.

No data.

No filtering.

## 6. Navigation

Maintain teacher navigation framework.

Reserved items:

- Classes
- Students
- Missions
- Reports
- Settings

Future pages may show:

"Coming in future build."

## 7. Explicitly Not Included

PB-002A must NOT include:

- Timer functionality
- Smart Board mode
- Teacher Feed logic
- Wins generation
- Blocker generation
- Next Step generation
- Student tracking
- Activity tracking
- Teacher Moments
- Shoutouts
- Jobs
- Kits
- Credits
- Hall of Fame
- Google Drive
- Google Forms
- Builder integration
- Workshop integration
- AI
- Reports

## 8. Protected Systems

PB-002A must protect:

- PB-001 authentication
- PB-001 routing
- Existing Builder
- Existing Workshop
- Existing mission workflow
- Existing assets
- Existing rendering systems

No unrelated file changes.

## 9. Design Standards

The layout must:

- Feel like a professional product.
- Avoid looking like an unfinished prototype.
- Use honest placeholders.
- Be Chromebook-first.
- Support responsive layouts.
- Avoid horizontal scrolling.
- Use accessible controls.
- Maintain consistent THINKamigBOB identity.

## 10. Testing Requirements

### Local Testing

Verify:

- Teacher login works.
- Teacher reaches Command Board.
- Layout loads.
- Navigation works.
- Sign out works.
- No console errors.

### Chromebook Testing

Verify:

- Layout fits Chromebook screen.
- No horizontal scrolling.
- Text remains readable.
- Touchpad navigation works.
- Buttons work.
- Teacher route remains protected.
- PB-001 functionality remains intact.

## 11. Definition of Done

PB-002A is complete when:

✅ Command Board layout exists.

✅ Teacher can access it.

✅ Placeholder sections display correctly.

✅ PB-001 remains functional.

✅ No unauthorized features added.

✅ Inspection passes.

✅ Chromebook validation passes.

✅ User approval received.

## 12. Required Completion Report

After implementation, report:

- Files created
- Files modified
- Tests completed
- Regression results
- Chromebook results
- Known limitations
- Commit recommendation

No commit or push until separately authorized.

## PB-002A Status

**Build Specification v1.0: COMPLETE**

Next action:

➡️ `/BUILD PB-002A — Classroom Command Board Layout`

after this specification is reviewed and approved.
