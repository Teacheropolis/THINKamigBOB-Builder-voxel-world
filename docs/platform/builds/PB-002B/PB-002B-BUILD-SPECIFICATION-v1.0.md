# PB-002B — Lesson Timer

## Build Specification v1.0

Status: Approved specification

Parent Build: PB-002 — Teacher Classroom Command Center

## Purpose

Create a simple classroom timing system integrated into the Teacher Classroom Command Center.

The Lesson Timer is a classroom awareness tool, not a productivity tracker.

## Objective

Help teachers and students understand classroom pacing without adding management burden.

Teacher goal:

Set a lesson duration, start the timer, control it, and display remaining time.

Student goal:

Understand how much class time remains.

## Included Scope

### Teacher Controls

Include:

- Set lesson duration
- Start timer
- Pause timer
- Resume timer
- Reset timer
- End timer

Controls must be Chromebook-friendly.

### Timer Display

Teacher view displays:

- Lesson Timer label
- Remaining time
- Timer state

States:

- Ready
- Running
- Paused
- Complete

## PB-002A Integration

Replace the existing Lesson Progress placeholder with timer functionality.

The Lesson Progress area becomes:

Today's Engineering Time

with remaining time display.

## Smart Board Display Foundation

Provide a student-facing display mode.

Students see:

- Today's Engineering Time
- Remaining time

Students do not see:

- Teacher controls
- Reset controls
- Internal controls

## Timer Behavior

Start:

Begins countdown.

Pause:

Stops countdown while preserving remaining time.

Resume:

Continues countdown.

Reset:

Returns to the original selected duration.

End:

Stops timer and displays completion state.

## Data Rules

PB-002B timer state is:

- Session-based
- Classroom-level
- Teacher-controlled

Do not store:

- Student data
- Student activity time
- Mission progress
- Grades
- Historical lesson analytics

## Explicitly Out of Scope

Do not implement:

- Lesson stages
- Automatic transitions
- Mission integration
- Student timers
- Student tracking
- Time-on-task analytics
- AI pacing suggestions
- Notifications
- Rewards
- Wins integration
- Teacher Feed integration
- Google integrations
- Reports

## Protected Systems

Do not break:

- PB-001 authentication
- PB-001 routing
- PB-002A Command Board layout
- Builder
- Workshop
- Existing assets
- Existing mission workflow

## Testing Requirements

### Local Testing

Verify:

- Timer opens
- Duration can be set
- Start works
- Pause works
- Resume works
- Reset works
- End works
- Display updates correctly
- No console errors

### Smart Board Testing

Verify:

- Student display opens
- Controls are hidden
- Display is readable

### Chromebook Testing

Verify:

- No horizontal scrolling
- Buttons are usable
- Text is readable
- Touchpad interaction works
- Session protection remains intact

### Regression

Verify:

- PB-001 flows remain functional
- PB-002A remains intact
- Builder smoke test passes
- Workshop smoke test passes

## Definition of Done

PB-002B is complete when:

- Lesson Timer exists.
- Teacher controls work.
- Smart Board display works.
- PB-002A remains intact.
- PB-001 remains intact.
- Tests pass.
- Chromebook validation passes.
- User approval is received.

## Completion Report Required

After implementation, report:

- Files created
- Files modified
- Architecture decisions
- Tests completed
- Regression results
- Chromebook validation
- Known limitations

No commit or push until separately authorized.
