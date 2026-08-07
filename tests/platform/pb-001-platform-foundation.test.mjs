import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  DEVELOPMENT_FIXTURE_ACCESS,
  findClassByCode,
  getDevelopmentIdentifier,
  getRosterForClass,
  validateStudentIdentifier,
  validateTeacherCredentials,
} from "../../platform/scripts/platform-fixtures.mjs";
import {
  createSessionStore,
  PLATFORM_ROLES,
  PLATFORM_SESSION_KEY,
} from "../../platform/scripts/platform-session.mjs";

const appSource = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const fixtureSource = readFileSync(new URL("../../platform/scripts/platform-fixtures.mjs", import.meta.url), "utf8");
const htmlSource = readFileSync(new URL("../../platform/index.html", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
  };
}

test("development fixtures provide the approved teacher and student entry seam", () => {
  const teacher = validateTeacherCredentials(
    DEVELOPMENT_FIXTURE_ACCESS.teacherEmail,
    DEVELOPMENT_FIXTURE_ACCESS.teacherPassword,
  );
  assert.equal(teacher?.id, "teacher-preview-1");
  assert.equal(validateTeacherCredentials("missing@example.test", "wrong"), null);

  const classRecord = findClassByCode(DEVELOPMENT_FIXTURE_ACCESS.classCode.toLowerCase());
  assert.equal(classRecord?.id, "class-preview-1");
  assert.equal(findClassByCode("NOT-A-CLASS"), null);

  const roster = getRosterForClass(classRecord.id);
  assert.equal(roster.length, 3);
  assert.ok(roster.every((student) => student.classId === classRecord.id));

  const selectedStudent = roster[0];
  const identifier = getDevelopmentIdentifier(selectedStudent.id);
  assert.equal(validateStudentIdentifier(classRecord.id, selectedStudent.id, identifier)?.id, selectedStudent.id);
  assert.equal(validateStudentIdentifier(classRecord.id, selectedStudent.id, "wrong"), null);
});

test("session store keeps teacher and student states mutually exclusive", () => {
  const storage = createMemoryStorage();
  const session = createSessionStore(storage);

  session.signInTeacher("teacher-preview-1");
  assert.deepEqual(session.read(), {
    version: 1,
    role: PLATFORM_ROLES.TEACHER,
    teacherId: "teacher-preview-1",
    classId: null,
    studentId: null,
    pendingClassId: null,
    pendingStudentId: null,
  });

  session.signInStudent("class-preview-1", "student-preview-1");
  const studentState = session.read();
  assert.equal(studentState.role, PLATFORM_ROLES.STUDENT);
  assert.equal(studentState.teacherId, null);
  assert.equal(studentState.classId, "class-preview-1");
  assert.equal(studentState.studentId, "student-preview-1");

  session.signOut();
  assert.equal(storage.getItem(PLATFORM_SESSION_KEY), null);
  assert.equal(session.read().role, null);
});

test("student entry state cannot skip class and roster selection", () => {
  const session = createSessionStore(createMemoryStorage());
  assert.equal(session.selectStudent("student-preview-1").pendingStudentId, null);
  session.beginStudentEntry("class-preview-1");
  assert.equal(session.read().pendingClassId, "class-preview-1");
  session.selectStudent("student-preview-1");
  assert.equal(session.read().pendingStudentId, "student-preview-1");
});

test("platform declares all approved PB-001 routes and route guards", () => {
  for (const route of [
    "/welcome",
    "/teacher/login",
    "/teacher/create",
    "/teacher/recovery",
    "/teacher/dashboard",
    "/student/entry",
    "/student/roster",
    "/student/identifier",
    "/student/dashboard",
  ]) {
    assert.match(appSource, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(appSource, /function guardRoute\(/);
  assert.match(appSource, /state\.role === PLATFORM_ROLES\.TEACHER && isStudentRoute/);
  assert.match(appSource, /state\.role === PLATFORM_ROLES\.STUDENT && isTeacherRoute/);
  assert.match(appSource, /session\.signOut\(\)/);
  assert.match(appSource, /window\.addEventListener\("hashchange", render\)/);
});

test("dashboard areas remain honest future-build foundations", () => {
  for (const label of [
    "Teacher Feed",
    "Wins • Blockers • Next Steps",
    "Reports",
    "Current Goal",
    "Yesterday's Wins",
    "Yesterday's Challenge",
    "Choose Your Path",
    "Continue",
    "Available Missions",
    "Side Paths",
    "What I Learned Today",
  ]) {
    assert.ok(appSource.includes(label), `expected ${label}`);
  }
  assert.match(appSource, /No mission is ready to continue yet\./);
  assert.match(appSource, /No new missions are available right now\./);
  assert.match(appSource, /Optional Side Paths are not available yet\./);
  assert.doesNotMatch(appSource, /\.\.\/assets\//);
});

test("platform shell includes accessibility and responsive foundations", () => {
  assert.match(htmlSource, /<meta name="viewport"/);
  assert.match(htmlSource, /class="platform-skip-link"/);
  assert.match(htmlSource, /<noscript>/);
  assert.match(cssSource, /:focus-visible/);
  assert.match(cssSource, /@media \(max-width: 800px\)/);
  assert.match(cssSource, /@media \(max-width: 520px\)/);
  assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)/);
});

test("PB-001 platform code contains no backend or production-auth integration", () => {
  const combinedSource = `${appSource}\n${fixtureSource}\n${htmlSource}`;
  assert.doesNotMatch(combinedSource, /firebase|supabase|authorization:\s*bearer|XMLHttpRequest|WebSocket/i);
  assert.doesNotMatch(combinedSource, /fetch\s*\(/);
  assert.match(appSource, /Development preview/);
  assert.match(fixtureSource, /(not production authentication|do not provide production security)/i);
});
