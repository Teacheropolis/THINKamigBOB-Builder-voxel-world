import {
  DEVELOPMENT_FIXTURE_ACCESS,
  DEVELOPMENT_FIXTURE_NOTICE,
  findClassByCode,
  getClassById,
  getClassForTeacher,
  getDevelopmentIdentifier,
  getRosterForClass,
  getStudentById,
  getTeacherById,
  validateStudentIdentifier,
  validateTeacherCredentials,
} from "./platform-fixtures.mjs";
import { createSessionStore, PLATFORM_ROLES } from "./platform-session.mjs";

export const ROUTES = Object.freeze({
  WELCOME: "/welcome",
  TEACHER_LOGIN: "/teacher/login",
  TEACHER_CREATE: "/teacher/create",
  TEACHER_RECOVERY: "/teacher/recovery",
  TEACHER_DASHBOARD: "/teacher/dashboard",
  STUDENT_ENTRY: "/student/entry",
  STUDENT_ROSTER: "/student/roster",
  STUDENT_IDENTIFIER: "/student/identifier",
  STUDENT_DASHBOARD: "/student/dashboard",
});

const root = document.querySelector("#platform-root");
const session = createSessionStore(window.sessionStorage);
const knownRoutes = new Set(Object.values(ROUTES));

function currentRoute() {
  return window.location.hash.replace(/^#/, "").replace(/\/$/, "") || ROUTES.WELCOME;
}

function navigate(route, { replace = false } = {}) {
  const nextHash = `#${route}`;
  if (replace) {
    window.location.replace(nextHash);
  } else if (window.location.hash === nextHash) {
    render();
  } else {
    window.location.hash = route;
  }
}

function guardRoute(route, state) {
  const isTeacherRoute = route.startsWith("/teacher/");
  const isStudentRoute = route.startsWith("/student/");

  if (state.role === PLATFORM_ROLES.TEACHER && isStudentRoute) return ROUTES.TEACHER_DASHBOARD;
  if (state.role === PLATFORM_ROLES.STUDENT && isTeacherRoute) return ROUTES.STUDENT_DASHBOARD;
  if (route === ROUTES.TEACHER_DASHBOARD && state.role !== PLATFORM_ROLES.TEACHER) return ROUTES.TEACHER_LOGIN;
  if (route === ROUTES.STUDENT_DASHBOARD && state.role !== PLATFORM_ROLES.STUDENT) return ROUTES.STUDENT_ENTRY;
  if (route === ROUTES.STUDENT_ROSTER && !state.pendingClassId) return ROUTES.STUDENT_ENTRY;
  if (route === ROUTES.STUDENT_IDENTIFIER && (!state.pendingClassId || !state.pendingStudentId)) {
    return state.pendingClassId ? ROUTES.STUDENT_ROSTER : ROUTES.STUDENT_ENTRY;
  }
  return route;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shell(content, { title, eyebrow = "Platform Foundation", signedIn = false, teacherContext = null } = {}) {
  document.title = `${title} | THINKamigBOB`;
  return `
    <header class="platform-header">
      <a class="platform-brand" href="#${ROUTES.WELCOME}" aria-label="THINKamigBOB Platform home">
        <span class="platform-brand-mark" aria-hidden="true">BOB</span>
        <span><strong>THINKamigBOB</strong><small>STEM Learning Platform</small></span>
      </a>
      ${teacherContext ? `
        <div class="platform-teacher-orientation" aria-label="Current teacher and class">
          <span><small>Teacher</small><strong>${escapeHtml(teacherContext.teacherName)}</strong></span>
          <span><small>Current class</small><strong>${escapeHtml(teacherContext.className)}</strong></span>
          <span><small>Current period</small><strong>${escapeHtml(teacherContext.periodLabel)}</strong></span>
        </div>
        <div class="platform-header-actions">
          <button class="platform-button platform-button-quiet" type="button" data-action="reserved-nav" data-label="Settings">Settings</button>
          <button class="platform-button platform-button-quiet" type="button" data-action="sign-out">Sign out</button>
        </div>
      ` : signedIn ? '<button class="platform-button platform-button-quiet" type="button" data-action="sign-out">Sign out</button>' : ""}
    </header>
    <main id="platform-main" class="platform-main" tabindex="-1">
      <div class="platform-page-heading">
        <p class="platform-eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      ${content}
    </main>
    <footer class="platform-footer">PB-001 development preview • Production accounts and persistent identity are not yet connected.</footer>
  `;
}

function fixtureNotice(details = "") {
  return `
    <aside class="platform-dev-notice" aria-label="Development fixture notice">
      <strong>Development preview</strong>
      <p>${escapeHtml(DEVELOPMENT_FIXTURE_NOTICE)}</p>
      ${details}
    </aside>
  `;
}

function welcomeView() {
  return shell(`
    <section class="platform-hero">
      <p class="platform-lead">A clear starting point for teachers and students.</p>
      <div class="platform-entry-grid">
        <article class="platform-entry-card">
          <span class="platform-card-icon" aria-hidden="true">T</span>
          <h2>Teachers</h2>
          <p>Open the development login or review the future account-creation path.</p>
          <div class="platform-actions">
            <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Teacher Login</a>
            <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CREATE}">Create Teacher Account</a>
          </div>
        </article>
        <article class="platform-entry-card">
          <span class="platform-card-icon" aria-hidden="true">S</span>
          <h2>Students</h2>
          <p>Enter with a class code, select your roster name, and use your private identifier.</p>
          <a class="platform-button platform-button-primary" href="#${ROUTES.STUDENT_ENTRY}">Student Entry</a>
        </article>
      </div>
    </section>
  `, { title: "Welcome" });
}

function teacherLoginView() {
  const access = `<details><summary>Show development test access</summary><dl><dt>Email</dt><dd><code>${escapeHtml(DEVELOPMENT_FIXTURE_ACCESS.teacherEmail)}</code></dd><dt>Password</dt><dd><code>${escapeHtml(DEVELOPMENT_FIXTURE_ACCESS.teacherPassword)}</code></dd></dl></details>`;
  return shell(`
    <div class="platform-form-layout">
      <form class="platform-panel platform-form" data-form="teacher-login" novalidate>
        <div class="platform-field">
          <label for="teacher-email">Email</label>
          <input id="teacher-email" name="email" type="email" autocomplete="username" required>
        </div>
        <div class="platform-field">
          <label for="teacher-password">Password</label>
          <input id="teacher-password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Continue to Teacher Dashboard</button>
        <div class="platform-text-links">
          <a href="#${ROUTES.TEACHER_RECOVERY}">Forgot password?</a>
          <a href="#${ROUTES.WELCOME}">Back to Welcome</a>
        </div>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Teacher Login", eyebrow: "Teacher entry" });
}

function teacherCreateView() {
  return shell(`
    <section class="platform-panel platform-shell-message">
      <h2>Teacher account creation is reserved</h2>
      <p>Production registration requires an approved authentication service. No account will be created in PB-001.</p>
      <div class="platform-actions">
        <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Go to Teacher Login</a>
        <a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </div>
    </section>
  `, { title: "Create Teacher Account", eyebrow: "Future account service" });
}

function teacherRecoveryView() {
  return shell(`
    <section class="platform-panel platform-shell-message">
      <h2>Password recovery is reserved</h2>
      <p>Email verification and password recovery require an approved authentication service. No recovery message will be sent in PB-001.</p>
      <div class="platform-actions">
        <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Return to Teacher Login</a>
        <a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </div>
    </section>
  `, { title: "Password Recovery", eyebrow: "Future account service" });
}

function studentEntryView() {
  const access = `<details><summary>Show development class code</summary><p><code>${escapeHtml(DEVELOPMENT_FIXTURE_ACCESS.classCode)}</code></p></details>`;
  return shell(`
    <div class="platform-form-layout">
      <form class="platform-panel platform-form" data-form="student-entry" novalidate>
        <p>Ask your teacher for your class code.</p>
        <div class="platform-field">
          <label for="class-code">Class Code</label>
          <input id="class-code" name="classCode" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" maxlength="24" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Find My Class</button>
        <a class="platform-back-link" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Student Entry", eyebrow: "Step 1 of 3" });
}

function studentRosterView(state) {
  const classRecord = getClassById(state.pendingClassId);
  const roster = classRecord ? getRosterForClass(classRecord.id) : [];
  const rosterButtons = roster.map((student) => `
    <button class="platform-roster-button" type="button" data-action="select-student" data-student-id="${escapeHtml(student.id)}">
      ${escapeHtml(student.displayName)}
    </button>
  `).join("");
  return shell(`
    <section class="platform-panel">
      <p class="platform-context-label">${escapeHtml(classRecord?.displayName ?? "Preview class")}</p>
      <h2>Select your name</h2>
      <p>Choose only your own roster name.</p>
      <div class="platform-roster-grid">${rosterButtons}</div>
      <a class="platform-back-link" href="#${ROUTES.STUDENT_ENTRY}">Use a different class code</a>
    </section>
  `, { title: "Roster Selection", eyebrow: "Step 2 of 3" });
}

function studentIdentifierView(state) {
  const student = getStudentById(state.pendingStudentId);
  const identifier = getDevelopmentIdentifier(state.pendingStudentId);
  const access = `<details><summary>Show this fictional student’s test identifier</summary><p><code>${escapeHtml(identifier)}</code></p></details>`;
  return shell(`
    <div class="platform-form-layout">
      <form class="platform-panel platform-form" data-form="student-identifier" novalidate>
        <p class="platform-context-label">Selected student</p>
        <h2>${escapeHtml(student?.displayName ?? "Student")}</h2>
        <div class="platform-field">
          <label for="private-identifier">Private Identifier</label>
          <input id="private-identifier" name="identifier" type="password" inputmode="numeric" autocomplete="off" maxlength="20" required aria-describedby="identifier-help">
          <small id="identifier-help">Enter the private identifier provided by your teacher.</small>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Open Student Dashboard</button>
        <a class="platform-back-link" href="#${ROUTES.STUDENT_ROSTER}">Choose a different name</a>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Private Identifier", eyebrow: "Step 3 of 3" });
}

const studentAreas = ["Today’s Mission", "Continue Working", "My STEM Work", "Builder", "Workshop", "Google Slides", "Google Vids", "What I Learned Today", "Engineering Credits", "Help"];

function placeholderGrid(items) {
  return `<div class="platform-placeholder-grid">${items.map((item) => `
    <section class="platform-placeholder-card" aria-labelledby="area-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
      <h2 id="area-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${escapeHtml(item)}</h2>
      <p>Coming in a future build.</p>
      <button type="button" disabled aria-disabled="true">Not available in PB-001</button>
    </section>
  `).join("")}</div>`;
}

function teacherDashboardView(state) {
  const teacher = getTeacherById(state.teacherId);
  const classRecord = getClassForTeacher(state.teacherId);
  const teacherName = teacher?.displayName ?? "Preview Teacher";
  const className = classRecord?.displayName ?? "Class not selected";
  const periodLabel = classRecord?.periodLabel ?? "Period not selected";
  return shell(`
    <div class="platform-command-layout">
      <nav class="platform-teacher-nav" aria-label="Teacher navigation">
        <a href="#${ROUTES.TEACHER_DASHBOARD}" aria-current="page">Today</a>
        ${["Classes", "Students", "Missions", "Reports", "Settings"].map((item) => `
          <button type="button" data-action="reserved-nav" data-label="${item}">${item}<small>Future build</small></button>
        `).join("")}
        <p id="teacher-nav-status" class="platform-nav-status" role="status" aria-live="polite">Reserved areas are labeled for future builds.</p>
      </nav>

      <section class="platform-today-board" aria-labelledby="today-board-title">
        <div class="platform-today-heading">
          <div>
            <p class="platform-eyebrow">Classroom Command Board</p>
            <h2 id="today-board-title">TODAY</h2>
          </div>
          <p>Class focus, organization, and readiness at a glance.</p>
        </div>

        <div class="platform-today-primary-grid">
          <section class="platform-command-card platform-command-card-mission">
            <p class="platform-command-label">Class focus</p>
            <h3>Today's Mission</h3>
            <p>Coming in future build</p>
          </section>
          <section class="platform-command-card">
            <p class="platform-command-label">Class timing</p>
            <h3>Lesson Progress</h3>
            <p>Timer coming in future build</p>
          </section>
          <section class="platform-command-card">
            <p class="platform-command-label">Class communication</p>
            <h3>Teacher Memo</h3>
            <p>Class message coming in future build</p>
          </section>
        </div>

        <p class="platform-rhythm-title">Wins • Blockers • Next Steps</p>
        <div class="platform-class-rhythm" aria-label="Wins, Blockers, and Next Steps">
          <section class="platform-rhythm-card platform-rhythm-wins">
            <h3><span aria-hidden="true">🏆</span> Wins</h3>
            <p>Future classroom accomplishments will appear here.</p>
          </section>
          <section class="platform-rhythm-card platform-rhythm-blockers">
            <h3><span aria-hidden="true">🚧</span> Blockers</h3>
            <p>Future classroom challenges will appear here.</p>
          </section>
          <section class="platform-rhythm-card platform-rhythm-next">
            <h3><span aria-hidden="true">➡️</span> Next Steps</h3>
            <p>Future class direction will appear here.</p>
          </section>
        </div>

        <section class="platform-teacher-feed" aria-labelledby="teacher-feed-title">
          <div>
            <p class="platform-command-label">Reserved event area</p>
            <h3 id="teacher-feed-title">Teacher Feed</h3>
          </div>
          <p>Future classroom events will appear here.</p>
        </section>
      </section>
    </div>
  `, {
    title: "Teacher Command Center",
    eyebrow: "TODAY view",
    signedIn: true,
    teacherContext: { teacherName, className, periodLabel },
  });
}

function studentDashboardView(state) {
  const student = getStudentById(state.studentId);
  return shell(`
    <section class="platform-dashboard-intro">
      <p>Welcome, <strong>${escapeHtml(student?.displayName ?? "Student")}</strong>.</p>
      <p>Your Student Dashboard is ready. Learning tools will appear here in future approved builds.</p>
    </section>
    ${placeholderGrid(studentAreas)}
  `, { title: "Student Dashboard", eyebrow: "Student Dashboard shell", signedIn: true });
}

function viewForRoute(route, state) {
  switch (route) {
    case ROUTES.TEACHER_LOGIN: return teacherLoginView();
    case ROUTES.TEACHER_CREATE: return teacherCreateView();
    case ROUTES.TEACHER_RECOVERY: return teacherRecoveryView();
    case ROUTES.TEACHER_DASHBOARD: return teacherDashboardView(state);
    case ROUTES.STUDENT_ENTRY: return studentEntryView();
    case ROUTES.STUDENT_ROSTER: return studentRosterView(state);
    case ROUTES.STUDENT_IDENTIFIER: return studentIdentifierView(state);
    case ROUTES.STUDENT_DASHBOARD: return studentDashboardView(state);
    default: return welcomeView();
  }
}

function showFormError(form, message) {
  const error = form.querySelector("[data-error]");
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
  error.focus?.();
}

function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);

  if (form.dataset.form === "teacher-login") {
    const teacher = validateTeacherCredentials(data.get("email"), data.get("password"));
    if (!teacher) return showFormError(form, "The email or password is not valid for this development preview.");
    session.signInTeacher(teacher.id);
    return navigate(ROUTES.TEACHER_DASHBOARD);
  }

  if (form.dataset.form === "student-entry") {
    const classCode = String(data.get("classCode") ?? "").trim();
    if (!classCode) return showFormError(form, "Enter your class code to continue.");
    const classRecord = findClassByCode(classCode);
    if (!classRecord) return showFormError(form, "That class code could not be found. Check the code and try again.");
    session.beginStudentEntry(classRecord.id);
    return navigate(ROUTES.STUDENT_ROSTER);
  }

  if (form.dataset.form === "student-identifier") {
    const state = session.read();
    const identifier = String(data.get("identifier") ?? "").trim();
    if (!identifier) return showFormError(form, "Enter your private identifier to continue.");
    const student = validateStudentIdentifier(state.pendingClassId, state.pendingStudentId, identifier);
    if (!student) return showFormError(form, "That private identifier is not valid. Check it and try again.");
    session.signInStudent(state.pendingClassId, student.id);
    return navigate(ROUTES.STUDENT_DASHBOARD);
  }
}

function handleClick(event) {
  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.action === "sign-out") {
    session.signOut();
    navigate(ROUTES.WELCOME, { replace: true });
  }
  if (action.dataset.action === "reserved-nav") {
    const status = document.querySelector("#teacher-nav-status");
    if (status) status.textContent = `${action.dataset.label}: Coming in future build.`;
  }
  if (action.dataset.action === "select-student") {
    const state = session.read();
    const student = getStudentById(action.dataset.studentId);
    if (!student || student.classId !== state.pendingClassId) return navigate(ROUTES.STUDENT_ENTRY, { replace: true });
    session.selectStudent(student.id);
    navigate(ROUTES.STUDENT_IDENTIFIER);
  }
}

function render() {
  const requestedRoute = currentRoute();
  if (!knownRoutes.has(requestedRoute)) return navigate(ROUTES.WELCOME, { replace: true });
  const state = session.read();
  const allowedRoute = guardRoute(requestedRoute, state);
  if (allowedRoute !== requestedRoute) return navigate(allowedRoute, { replace: true });
  root.innerHTML = viewForRoute(allowedRoute, state);
  window.requestAnimationFrame(() => document.querySelector("#platform-main")?.focus({ preventScroll: true }));
}

root.addEventListener("submit", handleSubmit);
root.addEventListener("click", handleClick);
window.addEventListener("hashchange", render);
render();
