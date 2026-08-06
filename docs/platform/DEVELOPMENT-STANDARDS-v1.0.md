# THINKamigBOB Development Standards v1.0

Status: Approved and permanent  
Applies to: All platform builds beginning with PB-001

## 1. Required Development Workflow

Every build follows:

```text
Approved Blueprint
→ Development Standards Check
→ Build Specification
→ Implementation
→ Inspection
→ Local Testing
→ Chromebook Validation
→ Approval
→ Commit and Version
→ Locked Build
```

No stage may be skipped.

## 2. One Build, One Objective

Each build must have one primary objective.

Do not add features because they are convenient, related, or easy to include.

Anything outside the approved scope must be deferred to a future build.

## 3. No Architecture Drift

Do not redesign previously approved architecture while implementing another build.

If an improvement is discovered:

- Record it
- Recommend a future build or revision
- Do not silently alter the current architecture

## 4. Foundation First

Every build must leave the platform stable and demonstrable.

A build may contain limited functionality, but it must not leave broken navigation, incomplete required workflows, or unstable shared infrastructure.

## 5. Student Continuity

Students must never be blocked because:

- Teacher review is pending
- Credits have not been awarded
- A job has not been checked
- A teacher has not viewed evidence
- A later platform feature is incomplete

## 6. Teacher Workload

Before adding a teacher action, ask whether the platform can:

- Reuse known information
- Automate setup
- Suggest rather than require
- Organize information automatically
- Manage normal cases quietly
- Surface only exceptions

## 7. No Duplicate Entry

Do not ask teachers or students to enter information the platform already knows or receives from an approved source.

The What I Learned Today Google Form remains the only reflection source.

## 8. Authentic Feedback

The platform may celebrate verified activity.

It must never:

- Invent praise
- Claim teacher review without evidence
- Suggest that automated recognition is personal teacher feedback
- Publicly identify students needing support

## 9. Privacy and Dignity

- No public support signals
- No public lists of struggling students
- No leaderboards
- No public comparison of students
- Teacher approval before public Hall of Fame recognition
- Public Smart Board content must be class-safe

## 10. Protected Existing Systems

Unless explicitly authorized, platform builds must not modify:

- Existing Builder behavior
- Existing Workshop behavior
- Mission behavior
- Rendering behavior
- Camera behavior
- Measurement behavior
- Existing approved assets
- Existing Google workflow links
- Unrelated repository files

## 11. Repository Discipline

Before implementation:

- Confirm repository path
- Confirm active branch
- Confirm clean working tree
- Inspect existing structure
- Identify protected files
- Record baseline status

Do not commit or push before inspection and required testing unless explicitly authorized.

## 12. Chromebook Standard

Chromebook validation is required before final approval.

Local Mac testing does not replace Chromebook testing.

## 13. Build Completion Report

Every build concludes with:

- Summary
- Files created
- Files modified
- Tests performed
- Regression results
- Known limitations
- Chromebook validation
- Commit reference
- Version
- Next build

## 14. Empty Shell Standard

A placeholder page should feel intentional and usable.

It may show:

- Clear page purpose
- Reserved sections
- Honest “Coming in a future build” states
- Functional navigation

It must not simulate functionality that does not exist.

## 15. Accessibility and Responsiveness

Every new platform screen must support:

- Keyboard navigation
- Visible focus states
- Clear labels
- Readable contrast
- Large Chromebook-friendly targets
- Responsive layouts
- Graceful error messages
- No dead ends

## 16. Security Baseline

- Teacher and student routes are separated.
- Students cannot access teacher-only routes.
- Invalid class codes fail safely.
- Invalid credentials do not reveal account information.
- Role authorization is checked before protected content loads.
- Secrets and credentials are never hard-coded into client files.

## 17. THINKamigBOB Feature Test

Before accepting a feature, ask:

1. Does it reduce teacher workload?
2. Does it make students feel their work matters?
3. Does it support authentic learning or engineering?
4. Does it avoid duplicate work?
5. Does it protect student dignity?
6. Does it keep students moving?
7. Does it preserve teacher judgment?
8. Does it fit the approved build scope?

If not, redesign or defer it.
