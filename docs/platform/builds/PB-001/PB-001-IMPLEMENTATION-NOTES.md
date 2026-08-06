# PB-001 — Implementation Notes

Status: Implemented and locally inspected; Chromebook validation pending  
Version target: v0.1.0  
Branch: `codex/platform`

## Architecture

PB-001 is implemented as an isolated static application under `platform/`.

- The existing root `index.html` remains the Builder entry and is unchanged.
- The platform uses one HTML shell with hash-routed views.
- Platform CSS uses the `platform-` namespace.
- Platform JavaScript is split into application, fixture, and session modules.
- No framework, package manager, backend, database, or production authentication provider was added.

## Routes

```text
#/welcome
#/teacher/login
#/teacher/create
#/teacher/recovery
#/teacher/dashboard
#/student/entry
#/student/roster
#/student/identifier
#/student/dashboard
```

Unknown routes return to Welcome. Protected routes are checked before their view is rendered. Wrong-role navigation returns an authenticated user to the dashboard for their current role.

## Development Fixture Boundary

`platform/scripts/platform-fixtures.mjs` contains fictional development records only:

- One test teacher
- One test class
- Three fake roster students
- One class code
- One private identifier per fake student

The fixture module exposes the replacement seam for teacher validation, class lookup, roster lookup, and private-identifier validation. It is client-visible and must not be treated as secure authentication.

Production registration, email verification, password recovery, durable accounts, durable student identity, and persistent classroom data remain unresolved until a backend is separately approved.

## Entry State

`platform/scripts/platform-session.mjs` stores only PB-001 entry state in namespaced `sessionStorage` under:

```text
thinkamigbob.pb001.entry-state.v1
```

Teacher and student states are mutually exclusive. Student roster and identifier steps require the preceding entry state. Sign-out removes the PB-001 session key. Storage failures fall back to sanitized in-memory state for the current page load.

This client-side route separation supports PB-001 development testing. It is not a substitute for server-side authorization.

## Dashboard Shells

Teacher and student dashboards reserve the approved future areas. Every unavailable item is disabled and labeled “Coming in a future build.” No classroom activity, mission, portfolio, credit, report, Google, Builder, or Workshop functionality is simulated.

## Accessibility and Responsive Baseline

The platform includes:

- Semantic headings and landmarks
- Explicit form labels
- Accessible live error messages
- Keyboard-visible focus states
- A skip link
- Large controls
- Responsive two-, three-, and one-column layouts
- Reduced-motion handling
- No required horizontal page scrolling at supported narrow widths

## Tests

The automated PB-001 contract test is:

```text
tests/platform/pb-001-platform-foundation.test.mjs
```

It covers fixture validation, state isolation, student step order, required routes, role guards, honest placeholders, accessibility foundations, responsive foundations, and absence of backend integration.

Browser inspection must additionally cover teacher and student entry, invalid inputs, direct protected routes, wrong-role routes, refresh, history, keyboard navigation, viewport behavior, console errors, and missing resources.

Existing Workshop tests and Builder/Workshop smoke checks remain required regression protection.

## Protected Systems

PB-001 does not modify:

- Root `index.html`
- Builder behavior or navigation
- Workshop behavior or modules
- Missions
- Three.js rendering
- Camera or view controls
- Measurement Assistant
- Tool Chest
- Dashboard
- Existing assets
- Existing Workshop tests

## Completion Boundary

PB-001 is not complete until implementation inspection, local testing, Chromebook validation, and user approval all pass. No commit, release, or tag is authorized by these implementation notes.
