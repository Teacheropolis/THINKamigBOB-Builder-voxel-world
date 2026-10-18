import { createPlatformAuthD1Repository, PLATFORM_SESSION_COOKIE } from "./platform-auth-d1-repository.mjs";
import { evaluatePlatformAuditPolicy } from "./platform-audit-policy.mjs";
import { evaluateAuditRetentionHealth } from "./audit-retention-health.mjs";

const SESSION_PATH = "/internal/evidence/v1/session";
const CLASS_PATH = "/internal/evidence/v1/authorize-class";
const TEACHER_SESSION_PATH = "/internal/identity/v1/teacher-session";
const STUDENT_SESSION_PATH = "/internal/identity/v1/student-session";
const REVOKE_SESSION_PATH = "/internal/identity/v1/revoke-session";
const CLASSROOMS_PATH = "/internal/classroom/v1/classrooms";
const LESSON_STEPS_PATH = "/internal/classroom/v1/lesson-steps";
const AUDIT_RETENTION_STATUS_PATH = "/internal/operations/v1/audit-retention";
const MAX_BODY_BYTES = 32768;

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

function sessionToken(request) {
  const matches = String(request.headers.get("cookie") || "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${PLATFORM_SESSION_COOKIE}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(PLATFORM_SESSION_COOKIE.length + 1);
  return token.length >= 32 && token.length <= 200 ? token : null;
}

async function body(request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) throw Object.assign(new Error("request-too-large"), { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw Object.assign(new Error("request-too-large"), { status: 413 });
  try { return JSON.parse(text || "{}"); } catch { throw Object.assign(new Error("invalid-json"), { status: 400 }); }
}

export function createPlatformAuthWorker({ repositoryFactory = ({ database, classroomCodeKey }) => createPlatformAuthD1Repository({ database, classroomCodeKey }), now = () => Date.now() } = {}) {
  return Object.freeze({
    async fetch(request, env) {
      const path = new URL(request.url).pathname;
      const auditPolicy = evaluatePlatformAuditPolicy(env);
      const productionReady = env?.PRODUCTION_ENABLED === "true" && typeof env?.AUTH_DB?.prepare === "function" && Boolean(env?.CLASSROOM_CODE_HASH_KEY) && auditPolicy.ready;
      if (path === "/health") return json(200, { ok: true, productionReady });
      if (![SESSION_PATH, CLASS_PATH, TEACHER_SESSION_PATH, STUDENT_SESSION_PATH, REVOKE_SESSION_PATH, CLASSROOMS_PATH, LESSON_STEPS_PATH, AUDIT_RETENTION_STATUS_PATH].includes(path)) return json(404, { error: "not-found" });
      if (!productionReady) return json(503, { status: "setup-required" });
      try {
        const repository = repositoryFactory({ database: env.AUTH_DB, classroomCodeKey: env.CLASSROOM_CODE_HASH_KEY });
        const token = sessionToken(request);
        const session = token ? await repository.findSession(token) : null;

        if (path === AUDIT_RETENTION_STATUS_PATH && request.method === "GET") {
          return json(200, { retention: evaluateAuditRetentionHealth(await repository.readAuditRetentionStatus(), { now: now() }) });
        }

        if (path === SESSION_PATH && request.method === "GET") {
          return json(200, {
            teacher: session?.role === "teacher" ? { id: session.id } : null,
            student: session?.role === "student" ? { id: session.id, classId: session.classId } : null,
          });
        }

        if (path === CLASS_PATH && request.method === "POST") {
          if (session?.role !== "teacher") return json(200, { authorized: false });
          const input = await body(request);
          if (String(input.teacherId || "") !== session.id) return json(200, { authorized: false });
          const authorized = await repository.teacherOwnsClass({ teacherId: session.id, classId: input.classId });
          return json(200, { authorized });
        }

        if (path === TEACHER_SESSION_PATH && request.method === "POST") {
          const input = await body(request);
          const teacher = await repository.findOrCreateGoogleTeacher({ subject: input.subject, hostedDomain: input.hostedDomain });
          const issued = await repository.createSession({ role: "teacher", userId: teacher.teacherId });
          return json(201, { token: issued.token, expiresAt: issued.expiresAt, created: teacher.created });
        }

        if (path === STUDENT_SESSION_PATH && request.method === "POST") {
          const input = await body(request);
          const student = await repository.findStudentEntry({ classCode: input.classCode, studentCode: input.studentCode });
          if (!student) return json(401, { error: "classroom-entry-not-recognized" });
          const issued = await repository.createSession({ role: "student", userId: student.studentId, classId: student.classId });
          return json(201, { token: issued.token, expiresAt: issued.expiresAt });
        }

        if (path === REVOKE_SESSION_PATH && request.method === "POST") {
          return json(200, { revoked: token ? await repository.revokeSession(token) : false });
        }

        if (path === CLASSROOMS_PATH && request.method === "POST") {
          if (session?.role !== "teacher") return json(401, { error: "authenticated-teacher-required" });
          const input = await body(request);
          return json(201, { classroom: await repository.createClassroom({ teacherId: session.id, name: input.name, studentLabels: input.studentLabels }) });
        }

        if (path === CLASSROOMS_PATH && request.method === "GET") {
          if (session?.role !== "teacher") return json(401, { error: "authenticated-teacher-required" });
          return json(200, { classrooms: await repository.listTeacherClassrooms({ teacherId: session.id }) });
        }

        if (path === LESSON_STEPS_PATH && request.method === "POST") {
          if (session?.role !== "teacher") return json(401, { error: "authenticated-teacher-required" });
          const input = await body(request);
          const step = await repository.saveLessonStep({ teacherId: session.id, classId: input.classId, step: input.step });
          return json(201, { step });
        }

        if (path === LESSON_STEPS_PATH && request.method === "GET") {
          if (session?.role === "teacher") {
            const classId = new URL(request.url).searchParams.get("classId");
            return json(200, { steps: await repository.listTeacherLessonSteps({ teacherId: session.id, classId }) });
          }
          if (session?.role === "student") return json(200, {
            steps: await repository.listReleasedLessonSteps({ classId: session.classId }),
            studentLabels: await repository.listActiveStudentLabels({ classId: session.classId }),
          });
          return json(401, { error: "authenticated-classroom-session-required" });
        }

        return json(405, { error: "method-not-allowed" });
      } catch (error) {
        const status = Number(error?.status) || 500;
        console.error(JSON.stringify({ event: "platform-auth-error", path, status, reason: status === 500 ? "internal-error" : String(error.message) }));
        return json(status, { error: status === 500 ? "authentication-service-unavailable" : String(error.message) });
      }
    },
    scheduled(_controller, env, context) {
      const auditPolicy = evaluatePlatformAuditPolicy(env);
      if (env?.PRODUCTION_ENABLED !== "true" || typeof env?.AUTH_DB?.prepare !== "function" || !env?.CLASSROOM_CODE_HASH_KEY || !auditPolicy.ready) return;
      const repository = repositoryFactory({ database: env.AUTH_DB, classroomCodeKey: env.CLASSROOM_CODE_HASH_KEY });
      const cleanup = repository
        .deleteExpiredAuditEvents({ retentionDays: auditPolicy.retentionDays, limit: 500 })
        .then(async (result) => {
          await repository.recordAuditRetentionSuccess(result);
          console.log(JSON.stringify({ event: "platform-audit-retention-complete", deleted: result.deleted }));
        })
        .catch(() => console.error(JSON.stringify({ event: "platform-audit-retention-error", reason: "cleanup-failed" })));
      context.waitUntil(cleanup);
    },
  });
}

export default createPlatformAuthWorker();

export const PLATFORM_IDENTITY_INTERNAL_PATHS = Object.freeze({ session: SESSION_PATH, teacherSession: TEACHER_SESSION_PATH, studentSession: STUDENT_SESSION_PATH, revokeSession: REVOKE_SESSION_PATH, classrooms: CLASSROOMS_PATH, lessonSteps: LESSON_STEPS_PATH, auditRetentionStatus: AUDIT_RETENTION_STATUS_PATH });
