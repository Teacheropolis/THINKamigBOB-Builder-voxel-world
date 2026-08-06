# PB-001 — Final Implementation Package

Status: Approved for implementation after repository inspection  
Version target: v0.1.0  
Branch: codex/platform

## 1. Required Pre-Build Inspection

Before modifying files, inspect and report:

1. Repository path
2. Active branch
3. Working-tree status
4. Current entry pages
5. Existing routing
6. Current authentication or persistence systems
7. Existing Builder and Workshop boundaries
8. Shared CSS or JavaScript that could affect isolated platform pages
9. Existing assets suitable for platform identity
10. Exact files proposed for creation or modification

If repository reality conflicts with this package, stop before implementation and report the conflict.

## 2. Repository Boundary

Expected repository:

`/Users/jenniferwilliams/Documents/GitHub/THINKamigBOB-Platform`

Expected branch:

`codex/platform`

Do not switch branches, merge, commit, or push without authorization.

## 3. Implementation Strategy

Use the smallest isolated architecture supported by the existing repository.

Prefer:

- New platform-specific pages, modules, styles, and assets
- Namespaced CSS
- Namespaced JavaScript
- Minimal shared-file edits
- Explicit route guards
- Development fixtures isolated from future production services

Avoid:

- Rewriting the existing application
- Converting the repository to a new framework
- Introducing a backend vendor without approval
- Creating hidden coupling to Builder or Workshop
- Implementing future feature logic

## 4. Approved Pages or Views

PB-001 must provide these user-visible destinations:

1. Platform Welcome
2. Teacher Login
3. Create Teacher Account shell
4. Password Recovery shell
5. Student Entry
6. Roster Selection
7. Private Identifier
8. Teacher Dashboard shell
9. Student Dashboard shell

These may be implemented as separate pages or routed views according to the existing repository architecture. The chosen method must be documented.

## 5. Required Navigation

### Welcome

- Teacher Login
- Create Teacher Account
- Student Entry

### Teacher flow

```text
Welcome
→ Teacher Login
→ Teacher Dashboard
→ Sign Out
→ Welcome
```

### Student flow

```text
Welcome
→ Student Entry
→ Valid Class Code
→ Roster Selection
→ Private Identifier
→ Student Dashboard
→ Sign Out
→ Welcome
```

Back navigation must not expose protected state.

## 6. Development Fixture Rules

If no approved backend exists:

- Use a clearly named fixture or mock-data module.
- Keep fixtures separate from UI logic.
- Include at least one test teacher, one test class, and a small test roster.
- Never use real student data.
- Do not call the fixture system “secure authentication.”
- Display a development-state notice only where appropriate for testing, not as classroom-facing clutter.
- Document the exact future replacement seam.

## 7. Teacher Dashboard Shell

Display a professional shell with reserved areas for:

- Teacher Command Center
- Today’s Class
- Teacher Feed
- Wins • Blockers • Next Steps
- Classes
- Students
- Reports
- Settings

The shell must not display invented classroom data as real activity.

## 8. Student Dashboard Shell

Display a professional shell with reserved areas for:

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

Future items should use a consistent disabled or “Coming in a future build” state.

## 9. Responsive and Accessibility Requirements

Validate:

- Chromebook viewport
- Desktop viewport
- Narrow viewport
- Keyboard-only navigation
- Visible focus
- Form labels
- Error messaging
- Touch-friendly controls
- No horizontal page overflow
- Readable text and contrast

## 10. Regression Protections

Verify that PB-001 does not alter:

- Builder launch or operation
- Workshop launch or operation
- Camera or rendering
- Object placement or deletion
- Measurement Assistant
- View Dice or View Remote
- Tool Chest
- Bottom dashboard
- Mission navigation
- Existing asset paths

Where platform routing is isolated, Builder and Workshop regression testing may use smoke tests rather than full feature retesting, unless shared files were touched.

## 11. Local Test Checklist

Teacher:

- Open Welcome
- Open Login
- Test invalid login
- Test development-valid login
- Reach Teacher Dashboard
- Attempt direct Student Dashboard access
- Sign out
- Attempt protected-route return

Student:

- Open Student Entry
- Test blank class code
- Test invalid class code
- Test valid class code
- Select roster student
- Test incorrect private identifier
- Test valid identifier
- Reach Student Dashboard
- Attempt direct Teacher Dashboard access
- Sign out
- Attempt protected-route return

General:

- Browser refresh on every page
- Back and forward navigation
- Direct URL loading
- Responsive layout
- Console errors
- Missing assets
- Builder smoke test
- Workshop smoke test

## 12. Chromebook Validation Checklist

On Chromebook, verify:

- Welcome page loads correctly.
- Teacher buttons are visible and usable.
- Student Entry is visible and usable.
- Forms fit without horizontal scrolling.
- Keyboard and touchpad interaction work.
- Invalid states are understandable.
- Teacher fixture flow reaches Teacher Dashboard.
- Student fixture flow reaches Student Dashboard.
- Sign-out works.
- Refresh does not expose the wrong role.
- Back navigation does not reopen protected content.
- Dashboard shells remain readable.
- Builder still opens and operates.
- Workshop still opens and operates.
- No obvious slowdown, flashing, duplicate assets, or console-critical errors.

Final completion remains pending Chromebook PASS.

## 13. Inspection Report Required

After implementation, report:

- Files created
- Files modified
- Architecture chosen
- Fixture strategy, if used
- Route and permission implementation
- Tests run
- Regression results
- Known limitations
- Unresolved backend decisions
- Confirmation that no commit or push occurred

## 14. Commit and Release Rules

Do not commit or push until:

1. Implementation inspection passes.
2. Local tests pass.
3. Chromebook validation passes.
4. User approves PB-001.

After authorization:

- Create a focused PB-001 commit.
- Record the commit hash.
- Prepare release notes.
- Tag `v0.1.0` only when explicitly authorized.
- Lock PB-001 against feature additions.

## 15. Definition of Done

PB-001 is done only when:

- All required entry views exist.
- Teacher and student flows work.
- Route separation works.
- Dashboard shells work.
- No unapproved backend was invented.
- Existing Builder and Workshop remain stable.
- Local tests pass.
- Chromebook tests pass.
- Implementation is inspected.
- User approval is received.
- Commit and version actions are separately authorized.
