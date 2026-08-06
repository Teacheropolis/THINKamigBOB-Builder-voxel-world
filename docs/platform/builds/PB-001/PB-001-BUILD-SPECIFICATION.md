# PB-001 — Platform Foundation Build Specification

Status: Approved  
Phase: Phase 1 — Platform Foundation  
Version target: v0.1.0

## 1. Objective

Create the first isolated platform entry and navigation foundation for THINKamigBOB.

PB-001 answers:

> How does a teacher or student enter THINKamigBOB and reach the correct dashboard shell?

## 2. Included Scope

### Welcome page

Provide:

- THINKamigBOB identity
- Teacher Login
- Create Teacher Account
- Student Entry

### Teacher entry

Provide:

- Teacher Login screen
- Create Teacher Account shell
- Password Recovery shell
- Successful teacher routing to Teacher Dashboard shell
- Teacher sign-out

PB-001 may use clearly labeled development-safe placeholder authentication if no approved backend exists. It must not pretend production authentication is complete.

### Student entry

Provide:

```text
Class Code
→ roster-name selection
→ private identifier
→ Student Dashboard shell
```

Students do not require email accounts.

PB-001 may use development-safe fixture data if no approved persistent backend exists. Fixture use must be isolated and clearly documented.

### Teacher Dashboard shell

Reserve visible locations for future:

- Teacher Command Center
- Today’s Class
- Teacher Feed
- Wins • Blockers • Next Steps
- Classes
- Students
- Reports
- Settings

No classroom functionality is implemented.

### Student Dashboard shell

Reserve visible locations for future:

- Today’s Mission
- Continue Working
- My STEM Work
- Builder
- Workshop
- Google Slides
- Google Vids
- What I Learned Today
- Engineering Credits
- Help

Unavailable items must use honest future-build messaging.

### Roles

Active PB-001 roles:

- Teacher
- Student

Future roles are not implemented.

### Routing

Required route flow:

```text
Welcome
├── Teacher Login
│   └── Teacher Dashboard
└── Student Entry
    └── Student Dashboard
```

Every page must have a safe route backward or forward.

## 3. Explicitly Out of Scope

Do not implement:

- Missions
- Actual Builder integration
- Actual Workshop integration
- Teacher Feed
- Teacher Moments
- Smart Board
- Lesson timer
- Wins • Blockers • Next Steps functionality
- Classroom Jobs
- Peer Helpers
- Kit Checkout
- Cleanup Challenge
- Engineering Credits
- Badges
- Hall of Fame
- Support Signals
- Reports
- Google Drive integration
- Portfolio tracking
- What I Learned Today data integration
- Platform Intelligence
- Parent or administrator roles
- Subscription features
- Multi-subject expansion
- Challenge Studio

## 4. Data Boundary

PB-001 requires only the minimum conceptual data foundation for:

- Teacher
- Class
- Student
- Role
- Session or entry state

Do not add future classroom-operation tables or models.

## 5. Authentication Boundary

Because no backend technology has yet been approved, implementation must first inspect the repository.

Codex must not invent a production authentication provider, database vendor, or cloud service.

If none exists, PB-001 should provide:

- UI and routing foundation
- Secure architectural seams
- Clearly isolated development fixtures
- Documentation of the unresolved backend decision

Production teacher registration, verification, recovery, and durable student identity remain incomplete until an approved backend is selected.

## 6. UI Requirements

- Clear THINKamigBOB identity
- Professional and welcoming
- No Bobwarts/Hogwarts product branding
- Chromebook-first
- Responsive
- Accessible controls
- No dead buttons
- Honest placeholders
- No classroom feature simulations

## 7. Security Requirements

- Student routes cannot reveal teacher content.
- Teacher routes require teacher role state.
- Invalid class codes fail gracefully.
- Invalid identifiers fail gracefully.
- No credentials or secrets in client source.
- Development fixtures must not be represented as production security.
- Direct protected-route navigation must redirect safely.

## 8. Protected Systems

PB-001 must not change existing:

- Builder behavior
- Workshop behavior
- Renderer behavior
- Mission behavior
- Measurement behavior
- Existing assets
- Existing approved application routes unless required for isolated platform routing and separately documented

## 9. Success Criteria

Teacher:

- Opens platform welcome page
- Opens Teacher Login
- Completes approved PB-001 development login flow
- Reaches Teacher Dashboard shell
- Signs out
- Cannot accidentally access student-only state as an authenticated teacher

Student:

- Opens Student Entry
- Enters a valid fixture or approved class code
- Selects roster name
- Enters private identifier
- Reaches Student Dashboard shell
- Signs out
- Cannot access Teacher Dashboard

General:

- No dead ends
- Responsive on Chromebook
- Existing Builder and Workshop remain unaffected
- No unauthorized features
- Documentation is updated
- Chromebook validation remains required for final completion

## 10. Failure Criteria

PB-001 fails if:

- It invents an unapproved production backend.
- It changes Builder or Workshop behavior.
- It adds classroom functionality.
- Teacher and student routes are not separated.
- Invalid entry data exposes information.
- Dashboard shells contain deceptive fake functionality.
- Chromebook testing fails.
