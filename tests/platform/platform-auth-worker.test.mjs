import test from "node:test";
import assert from "node:assert/strict";
import { createPlatformAuthWorker } from "../../platform/integrations/cloudflare/platform-auth-worker.mjs";
import { PLATFORM_SESSION_COOKIE } from "../../platform/integrations/cloudflare/platform-auth-d1-repository.mjs";

const token = Buffer.alloc(32, 8).toString("base64url");
const env = {
  PRODUCTION_ENABLED: "true",
  AUTH_DB: { prepare() {} },
  CLASSROOM_CODE_HASH_KEY: Buffer.alloc(32, 9).toString("base64"),
  AUDIT_POLICY_APPROVED: "true",
  AUDIT_PURPOSE: "authentication-and-classroom-security",
  AUDIT_AUTHORIZED_VIEWERS: "authorized-platform-security-operators",
  AUDIT_RETENTION_DAYS: "30",
  AUDIT_DELETION_ENFORCEMENT: "required",
};

function workerFor(session, owns = true) {
  return createPlatformAuthWorker({ repositoryFactory: () => ({
    async findSession(value) { return value === token ? session : null; },
    async teacherOwnsClass({ teacherId, classId }) { return owns && teacherId === "teacher-1" && classId === "class-1"; },
    async findOrCreateGoogleTeacher() { return { teacherId: "teacher-1", created: true }; },
    async findStudentEntry() { return { studentId: "student-1", classId: "class-1" }; },
    async createSession({ role }) { return { token, expiresAt: 2000, role }; },
    async revokeSession(value) { return value === token; },
    async createClassroom() { return { classId: "class-1", name: "STEM Lab", classCode: "ABCDEFGH", students: [{ studentId: "student-1", displayLabel: "Avery", studentCode: "ABCDEFGHJK" }] }; },
    async listTeacherClassrooms() { return [{ id: "class-1", name: "STEM Lab", status: "active", studentCount: 1 }]; },
    async saveLessonStep({ teacherId, classId, step }) { return { id: "lesson-1", classId, title: step.title, directions: step.directions, resources: step.resources || [], status: step.status === "released" ? "released" : "draft", order: step.order || 0, updatedAt: 1000, releasedAt: step.status === "released" ? 1000 : null, teacherId }; },
    async listTeacherLessonSteps() { return [{ id: "lesson-1", classId: "class-1", title: "Build", directions: "Build a bridge.", resources: [], status: "draft", order: 0, updatedAt: 1000, releasedAt: null }]; },
    async listReleasedLessonSteps() { return [{ id: "lesson-2", classId: "class-1", title: "Test", directions: "Test the bridge.", resources: [], status: "released", order: 1, updatedAt: 1000, releasedAt: 1000 }]; },
  }) });
}

function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.authenticated !== false) headers.set("cookie", `${PLATFORM_SESSION_COOKIE}=${token}`);
  return new Request(`https://platform-auth.internal${path}`, { ...options, headers });
}

test("internal session endpoint returns only the authenticated role", async () => {
  const teacher = workerFor({ role: "teacher", id: "teacher-1" });
  assert.deepEqual(await (await teacher.fetch(request("/internal/evidence/v1/session"), env)).json(), { teacher: { id: "teacher-1" }, student: null });
  const student = workerFor({ role: "student", id: "student-1", classId: "class-1" });
  assert.deepEqual(await (await student.fetch(request("/internal/evidence/v1/session"), env)).json(), { teacher: null, student: { id: "student-1", classId: "class-1" } });
  assert.deepEqual(await (await student.fetch(request("/internal/evidence/v1/session", { authenticated: false }), env)).json(), { teacher: null, student: null });
});

test("class authorization binds the requested teacher to the verified session", async () => {
  const worker = workerFor({ role: "teacher", id: "teacher-1" });
  const allowed = await worker.fetch(request("/internal/evidence/v1/authorize-class", { method: "POST", body: JSON.stringify({ teacherId: "teacher-1", classId: "class-1" }) }), env);
  assert.deepEqual(await allowed.json(), { authorized: true });
  const impersonation = await worker.fetch(request("/internal/evidence/v1/authorize-class", { method: "POST", body: JSON.stringify({ teacherId: "teacher-2", classId: "class-1" }) }), env);
  assert.deepEqual(await impersonation.json(), { authorized: false });
});

test("student sessions cannot authorize teacher ownership", async () => {
  const worker = workerFor({ role: "student", id: "student-1", classId: "class-1" });
  const response = await worker.fetch(request("/internal/evidence/v1/authorize-class", { method: "POST", body: JSON.stringify({ teacherId: "teacher-1", classId: "class-1" }) }), env);
  assert.deepEqual(await response.json(), { authorized: false });
});

test("auth service is disabled until explicitly configured", async () => {
  const worker = workerFor(null);
  const response = await worker.fetch(request("/internal/evidence/v1/session"), {});
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "setup-required" });
});

test("auth service fails closed until the complete audit policy is approved", async () => {
  const worker = workerFor(null);
  const incomplete = { ...env, AUDIT_RETENTION_DAYS: "" };
  assert.deepEqual(await (await worker.fetch(request("/health"), incomplete)).json(), { ok: true, productionReady: false });
  const response = await worker.fetch(request("/internal/identity/v1/student-session", { method: "POST", body: "{}", authenticated: false }), incomplete);
  assert.equal(response.status, 503);
});

test("private identity endpoints issue teacher and student sessions and revoke signout", async () => {
  const worker = workerFor(null);
  const teacher = await worker.fetch(request("/internal/identity/v1/teacher-session", { method: "POST", body: JSON.stringify({ subject: "google-1" }), authenticated: false }), env);
  assert.equal(teacher.status, 201);
  assert.equal((await teacher.json()).token, token);
  const student = await worker.fetch(request("/internal/identity/v1/student-session", { method: "POST", body: JSON.stringify({ classCode: "ROOM-1", studentCode: "STUDENT-1" }), authenticated: false }), env);
  assert.equal(student.status, 201);
  const revoked = await worker.fetch(request("/internal/identity/v1/revoke-session", { method: "POST" }), env);
  assert.deepEqual(await revoked.json(), { revoked: true });
});

test("classroom setup is available only to a verified teacher session", async () => {
  const teacher = workerFor({ role: "teacher", id: "teacher-1" });
  const created = await teacher.fetch(request("/internal/classroom/v1/classrooms", { method: "POST", body: JSON.stringify({ name: "STEM Lab", studentLabels: ["Avery"] }) }), env);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).classroom.classCode, "ABCDEFGH");
  const student = workerFor({ role: "student", id: "student-1", classId: "class-1" });
  assert.equal((await student.fetch(request("/internal/classroom/v1/classrooms", { method: "POST", body: "{}" }), env)).status, 401);
});

test("teacher can release a shared lesson step and students receive only released steps", async () => {
  const teacher = workerFor({ role: "teacher", id: "teacher-1" });
  const created = await teacher.fetch(request("/internal/classroom/v1/lesson-steps", { method: "POST", body: JSON.stringify({ classId: "class-1", step: { title: "Test", directions: "Test the bridge.", status: "released", resources: [{ type: "image", label: "Bridge example", url: "https://example.test/bridge.png" }] } }) }), env);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).step.status, "released");
  const teacherList = await teacher.fetch(request("/internal/classroom/v1/lesson-steps?classId=class-1"), env);
  assert.equal((await teacherList.json()).steps[0].status, "draft");

  const student = workerFor({ role: "student", id: "student-1", classId: "class-1" });
  const studentList = await student.fetch(request("/internal/classroom/v1/lesson-steps"), env);
  const studentBody = await studentList.json();
  assert.equal(studentBody.steps.length, 1);
  assert.equal(studentBody.steps[0].status, "released");
  assert.equal((await student.fetch(request("/internal/classroom/v1/lesson-steps", { method: "POST", body: "{}" }), env)).status, 401);
});

test("scheduled audit retention runs only with complete production policy", async () => {
  const calls = [];
  const worker = createPlatformAuthWorker({ repositoryFactory: () => ({
    async deleteExpiredAuditEvents(input) { calls.push(["delete", input]); return { deleted: 3, cutoff: 1000, completedAt: 2000 }; },
    async recordAuditRetentionSuccess(input) { calls.push(["record", input]); },
  }) });
  const pending = [];
  const context = { waitUntil(promise) { pending.push(promise); } };
  worker.scheduled({}, { ...env, AUDIT_POLICY_APPROVED: "false" }, context);
  assert.equal(pending.length, 0);
  worker.scheduled({}, env, context);
  assert.equal(pending.length, 1);
  await pending[0];
  assert.deepEqual(calls, [
    ["delete", { retentionDays: 30, limit: 500 }],
    ["record", { deleted: 3, cutoff: 1000, completedAt: 2000 }],
  ]);
});

test("private retention status returns maintenance metadata only", async () => {
  const worker = createPlatformAuthWorker({ now: () => 3000, repositoryFactory: () => ({
    async findSession() { return null; },
    async readAuditRetentionStatus() { return { lastSuccessAt: 2000, lastDeletedCount: 3, lastCutoff: 1000 }; },
  }) });
  const response = await worker.fetch(request("/internal/operations/v1/audit-retention", { authenticated: false }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { retention: { state: "healthy", lastSuccessAt: 2000, nextExpectedBy: 129602000, lastDeletedCount: 3, lastCutoff: 1000 } });
});

test("private retention status reports pending and stale jobs without event data", async () => {
  let status = null;
  const worker = createPlatformAuthWorker({ now: () => 200000000, repositoryFactory: () => ({
    async readAuditRetentionStatus() { return status; },
  }) });
  const pending = await worker.fetch(request("/internal/operations/v1/audit-retention", { authenticated: false }), env);
  assert.equal((await pending.json()).retention.state, "pending");
  status = { lastSuccessAt: 1000, lastDeletedCount: 0, lastCutoff: 500 };
  const stale = await worker.fetch(request("/internal/operations/v1/audit-retention", { authenticated: false }), env);
  const body = await stale.json();
  assert.equal(body.retention.state, "stale");
  assert.deepEqual(Object.keys(body.retention).sort(), ["lastCutoff", "lastDeletedCount", "lastSuccessAt", "nextExpectedBy", "state"]);
});
