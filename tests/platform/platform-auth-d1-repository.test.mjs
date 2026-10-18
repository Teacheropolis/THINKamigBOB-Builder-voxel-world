import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createPlatformAuthD1Repository, platformSessionCookie, PLATFORM_SESSION_COOKIE } from "../../platform/integrations/cloudflare/platform-auth-d1-repository.mjs";

function fakeD1() {
  const sessions = new Map();
  const memberships = new Set();
  const audits = [];
  return {
    sessions,
    memberships,
    audits,
    async batch(statements) {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      return results;
    },
    withSession(mode) { assert.equal(mode, "first-primary"); return this; },
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              if (sql.startsWith("INSERT INTO platform_sessions")) {
                sessions.set(values[0], { role: values[1], user_id: values[2], class_id: values[3], created_at: values[4], expires_at: values[5], revoked_at: null });
                return { meta: { changes: 1 } };
              }
              if (sql.startsWith("UPDATE platform_sessions")) {
                const record = sessions.get(values[1]);
                if (!record || record.revoked_at !== null) return { meta: { changes: 0 } };
                record.revoked_at = values[0];
                return { meta: { changes: 1 } };
              }
              if (sql.startsWith("INSERT INTO platform_audit_events")) {
                audits.push({ eventId: values[0], eventType: values[1], actorRole: values[2], actorId: values[3], classId: values[4], outcome: "success", occurredAt: values[5] });
                return { meta: { changes: 1 } };
              }
              throw new Error(`unexpected-run:${sql}`);
            },
            async first() {
              if (sql.includes("FROM platform_sessions")) {
                const record = sessions.get(values[0]);
                return record && record.revoked_at === null && record.expires_at > values[1] ? { ...record } : null;
              }
              if (sql.includes("FROM platform_class_teachers")) return memberships.has(`${values[0]}:${values[1]}`) ? { authorized: 1 } : null;
              throw new Error(`unexpected-first:${sql}`);
            },
          };
        },
      };
    },
  };
}

test("opaque sessions are hashed, role-bound, expiring, and revocable", async () => {
  let clock = 1000;
  const database = fakeD1();
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 9), now: () => clock, random: (length) => Buffer.alloc(length, 7) });
  const issued = await repository.createSession({ role: "student", userId: "student-1", classId: "class-1" });
  assert.equal(JSON.stringify([...database.sessions]).includes(issued.token), false);
  assert.deepEqual(await repository.findSession(issued.token), { role: "student", id: "student-1", classId: "class-1" });
  assert.equal(await repository.revokeSession(issued.token), true);
  assert.equal(await repository.findSession(issued.token), null);
  assert.deepEqual(database.audits.map((event) => event.eventType), ["STUDENT_SESSION_ISSUED", "SESSION_REVOKED"]);
  assert.equal(JSON.stringify(database.audits).includes(issued.token), false);

  const expiring = await repository.createSession({ role: "teacher", userId: "teacher-1", ttlMs: 15 * 60 * 1000 });
  clock = expiring.expiresAt;
  assert.equal(await repository.findSession(expiring.token), null);
});

test("teacher class ownership requires an active durable membership", async () => {
  const database = fakeD1();
  database.memberships.add("teacher-1:class-1");
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 9) });
  assert.equal(await repository.teacherOwnsClass({ teacherId: "teacher-1", classId: "class-1" }), true);
  assert.equal(await repository.teacherOwnsClass({ teacherId: "teacher-1", classId: "class-2" }), false);
});

test("session cookie is host-only, secure, HTTP-only, and same-site", () => {
  const token = Buffer.alloc(32, 4).toString("base64url");
  const cookie = platformSessionCookie(token);
  assert.match(cookie, new RegExp(`^${PLATFORM_SESSION_COOKIE}=`));
  assert.match(cookie, /Path=\/;/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.equal(cookie.includes("Domain="), false);
});

test("teacher identities and student entry use stable private database mappings", async () => {
  const identities = new Map();
  const codeSecret = Buffer.alloc(32, 6);
  const classHash = createHmac("sha256", codeSecret).update("class-code:ROOM-1").digest("base64url");
  const studentHash = createHmac("sha256", codeSecret).update("student-code:STUDENT-1").digest("base64url");
  const database = {
    withSession() { return this; },
    prepare(sql) {
      return { bind(...values) { return {
        async first() {
          if (sql.includes("platform_teacher_identities")) return identities.get(values[0]) || null;
          if (sql.includes("platform_student_entries")) return values[0] === classHash && values[1] === studentHash ? { student_id: "student-1", class_id: "class-1" } : null;
          throw new Error(`unexpected-first:${sql}`);
        },
        async run() {
          if (sql.startsWith("INSERT INTO platform_teacher_identities")) { identities.set(values[1], { teacher_id: values[0] }); return { meta: { changes: 1 } }; }
          throw new Error(`unexpected-run:${sql}`);
        },
      }; } };
    },
  };
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: codeSecret, now: () => 1000, random: (length) => Buffer.alloc(length, 2) });
  const first = await repository.findOrCreateGoogleTeacher({ subject: "google-subject", hostedDomain: "School.Example" });
  const second = await repository.findOrCreateGoogleTeacher({ subject: "google-subject", hostedDomain: "school.example" });
  assert.equal(first.teacherId, second.teacherId);
  assert.equal(JSON.stringify([...identities]).includes("google-subject"), false);
  assert.deepEqual(await repository.findStudentEntry({ classCode: "room-1", studentCode: "student-1" }), { studentId: "student-1", classId: "class-1" });
  assert.equal(await repository.findStudentEntry({ classCode: "wrong", studentCode: "student-1" }), null);
});

test("classroom setup returns codes once and batches only keyed hashes", async () => {
  const statements = [];
  const database = {
    prepare(sql) { return { bind(...values) { const statement = { sql, values, async all() { return { results: [] }; } }; statements.push(statement); return statement; } }; },
    async batch(values) { assert.equal(values.length, 5); return values.map(() => ({ success: true })); },
  };
  let sequence = 0;
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 5), now: () => 1000, random(length) { return Buffer.alloc(length, ++sequence); } });
  const classroom = await repository.createClassroom({ teacherId: "teacher-1", name: "STEM Lab", studentLabels: ["Avery", "Jordan"] });
  assert.equal(classroom.students.length, 2);
  assert.equal(classroom.classCode.length, 8);
  assert.equal(classroom.students[0].studentCode.length, 10);
  const stored = JSON.stringify(statements);
  assert.equal(stored.includes(classroom.classCode), false);
  assert.equal(stored.includes(classroom.students[0].studentCode), false);
  assert.equal(statements.some((statement) => statement.sql.includes("platform_class_teachers")), true);
  const audit = statements.find((statement) => statement.sql.includes("platform_audit_events"));
  assert.equal(audit.values[1], "CLASSROOM_CREATED");
  assert.equal(stored.includes(classroom.students[0].displayLabel), true);
  assert.equal(JSON.stringify(audit).includes(classroom.students[0].displayLabel), false);
});

test("student display labels remain unique across every active class owned by a teacher", async () => {
  const database = {
    withSession() { return this; },
    prepare(sql) { return { bind() { return { async all() { return { results: sql.includes("normalized_label") ? [{ normalized_label: "brava avabob" }] : [] }; } }; } }; },
    async batch() { throw new Error("duplicate labels must fail before writes"); },
  };
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 5) });
  await assert.rejects(
    repository.createClassroom({ teacherId: "teacher-1", name: "STEM Lab", studentLabels: ["Brava AvaBob"] }),
    (error) => error.message === "student-label-already-used" && error.status === 409,
  );
});

test("students can receive only the active display labels for their own class poem", async () => {
  let query = null;
  const database = {
    withSession() { return this; },
    prepare(sql) { return { bind(...values) { return { async all() { query = { sql, values }; return { results: [{ display_label: "Avery Bobzilla" }, { display_label: "Jordan Bobaroo" }] }; } }; } }; },
  };
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 5) });
  assert.deepEqual(await repository.listActiveStudentLabels({ classId: "class-1" }), ["Avery Bobzilla", "Jordan Bobaroo"]);
  assert.deepEqual(query.values, ["class-1"]);
  assert.match(query.sql, /status = 'active'/);
  assert.match(query.sql, /LIMIT 40/);
});

test("student nameplate lookup is bound to both student and class", async () => {
  let query = null;
  const database = {
    withSession() { return this; },
    prepare(sql) { return { bind(...values) { return { async first() { query = { sql, values }; return { display_label: "Avery Bobzilla" }; } }; } }; },
  };
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 5) });
  assert.equal(await repository.findStudentDisplayLabel({ studentId: "student-1", classId: "class-1" }), "Avery Bobzilla");
  assert.deepEqual(query.values, ["student-1", "class-1"]);
  assert.match(query.sql, /student_id = \?1 AND class_id = \?2/);
});

test("audit retention deletes only a bounded set older than the approved cutoff", async () => {
  const runs = [];
  const database = {
    prepare(sql) { return { bind(...values) { return { async run() { runs.push({ sql, values }); return { meta: { changes: 12 } }; } }; } }; },
  };
  const now = 50 * 24 * 60 * 60 * 1000;
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 5), now: () => now });
  assert.deepEqual(await repository.deleteExpiredAuditEvents({ retentionDays: 30, limit: 500 }), { deleted: 12, cutoff: 20 * 24 * 60 * 60 * 1000, completedAt: now });
  assert.match(runs[0].sql, /DELETE FROM platform_audit_events/);
  assert.match(runs[0].sql, /ORDER BY occurred_at ASC/);
  assert.match(runs[0].sql, /LIMIT \?2/);
  assert.deepEqual(runs[0].values, [20 * 24 * 60 * 60 * 1000, 500]);
  await assert.rejects(repository.deleteExpiredAuditEvents({ retentionDays: 0 }), /valid-audit-retention/);
  await assert.rejects(repository.deleteExpiredAuditEvents({ retentionDays: 30, limit: 1001 }), /valid-audit-deletion-limit/);
});

test("audit maintenance status contains only bounded cleanup metadata", async () => {
  let saved = null;
  const database = {
    withSession() { return this; },
    prepare(sql) { return {
      bind(...values) { return {
        async run() { saved = { last_success_at: values[0], last_deleted_count: values[1], last_cutoff: values[2] }; return { meta: { changes: 1 } }; },
      }; },
      async first() { return saved; },
    }; },
  };
  const repository = createPlatformAuthD1Repository({ database, classroomCodeKey: Buffer.alloc(32, 5) });
  assert.equal(await repository.readAuditRetentionStatus(), null);
  assert.equal(await repository.recordAuditRetentionSuccess({ completedAt: 2000, deleted: 3, cutoff: 1000 }), true);
  assert.deepEqual(await repository.readAuditRetentionStatus(), { lastSuccessAt: 2000, lastDeletedCount: 3, lastCutoff: 1000 });
  await assert.rejects(repository.recordAuditRetentionSuccess({ completedAt: 2000, deleted: 1001, cutoff: 1000 }), /valid-audit-deletion-count/);
});
