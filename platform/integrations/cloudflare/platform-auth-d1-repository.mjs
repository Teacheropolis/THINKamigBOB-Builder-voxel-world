import { createHash, createHmac, randomBytes } from "node:crypto";

const DEFAULT_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MIN_SESSION_TTL_MS = 15 * 60 * 1000;
const MAX_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const PLATFORM_SESSION_COOKIE = "__Host-thinkamigbob_session";

function requireDatabase(database) {
  if (typeof database?.prepare !== "function") throw new Error("auth-d1-database-binding-required");
  return database;
}

function clean(value, name) {
  const result = String(value || "").trim();
  if (!result || result.length > 120) throw new Error(`valid-${name}-required`);
  return result;
}

function sessionHash(token) {
  return createHash("sha256").update(String(token || "")).digest("base64url");
}

function identityHash(value) {
  return createHash("sha256").update(String(value || "")).digest("base64url");
}

function codeKey(value) {
  const key = Buffer.isBuffer(value) ? value : Buffer.from(value || "", "base64");
  if (key.length !== 32) throw new Error("32-byte-classroom-code-key-required");
  return key;
}

function primary(database) {
  return typeof database.withSession === "function" ? database.withSession("first-primary") : database;
}

function accessCode(random, length) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = random(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function displayLabel(value) {
  const label = String(value || "").trim().replace(/\s+/g, " ");
  if (label.length < 1 || label.length > 40) throw new Error("valid-student-display-label-required");
  return label;
}

function lessonText(value, name, maxLength) {
  const result = String(value || "").trim().replace(/\s+/g, " ");
  if (!result || result.length > maxLength) throw new Error(`valid-${name}-required`);
  return result;
}

function lessonResources(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 8) throw new Error("bounded-lesson-resources-required");
  return value.map((item) => {
    const type = String(item?.type || "").trim().toLowerCase();
    if (!["image", "video", "link"].includes(type)) throw new Error("valid-lesson-resource-type-required");
    const label = lessonText(item?.label, "lesson-resource-label", 100);
    const url = String(item?.url || "").trim();
    if (url.length > 2000) throw new Error("valid-lesson-resource-url-required");
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error("valid-lesson-resource-url-required"); }
    if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("valid-lesson-resource-url-required");
    return Object.freeze({ type, label, url: parsed.toString() });
  });
}

function lessonProjection(row) {
  let resources = [];
  try { resources = lessonResources(JSON.parse(String(row.resources_json || "[]"))); } catch { resources = []; }
  return Object.freeze({
    id: String(row.step_id),
    classId: String(row.class_id),
    title: String(row.title),
    directions: String(row.directions),
    resources,
    status: row.status === "released" ? "released" : "draft",
    order: Number(row.sort_order) || 0,
    updatedAt: Number(row.updated_at) || 0,
    releasedAt: row.released_at == null ? null : Number(row.released_at),
  });
}

export function createPlatformAuthD1Repository({ database, classroomCodeKey, now = () => Date.now(), random = (length) => randomBytes(length) } = {}) {
  const db = requireDatabase(database);
  const lookupKey = codeKey(classroomCodeKey);

  function auditStatement({ eventType, actorRole, actorId, classId = null, occurredAt }) {
    return db.prepare(`INSERT INTO platform_audit_events (event_id, event_type, actor_role, actor_id, class_id, outcome, occurred_at)
      VALUES (?1, ?2, ?3, ?4, ?5, 'success', ?6)`)
      .bind(`audit-${random(18).toString("base64url")}`, eventType, actorRole, clean(actorId, "audit-actor-id"), classId ? clean(classId, "audit-class-id") : null, occurredAt);
  }

  async function findSessionRecord(token) {
    const value = String(token || "");
    if (value.length < 32 || value.length > 200) return null;
    const row = await primary(db).prepare(`SELECT role, user_id, class_id, expires_at
      FROM platform_sessions
      WHERE session_hash = ?1 AND revoked_at IS NULL AND expires_at > ?2
      LIMIT 1`).bind(sessionHash(value), now()).first();
    if (!row || !['teacher', 'student'].includes(row.role)) return null;
    try {
      const identity = { role: row.role, id: clean(row.user_id, "user-id") };
      if (row.role === "student") identity.classId = clean(row.class_id, "class-id");
      return Object.freeze(identity);
    } catch { return null; }
  }

  return Object.freeze({
    async saveLessonStep({ teacherId, classId, step }) {
      const owner = clean(teacherId, "teacher-id");
      const classroom = clean(classId, "class-id");
      if (!(await this.teacherOwnsClass({ teacherId: owner, classId: classroom }))) throw Object.assign(new Error("teacher-class-authorization-required"), { status: 403 });
      const id = step?.id ? clean(step.id, "lesson-step-id") : `lesson-${random(18).toString("base64url")}`;
      const title = lessonText(step?.title, "lesson-title", 100);
      const directions = lessonText(step?.directions, "lesson-directions", 2000);
      const resources = lessonResources(step?.resources);
      const status = step?.status === "released" ? "released" : "draft";
      const order = Number.isSafeInteger(step?.order) && step.order >= 0 && step.order <= 999 ? step.order : 0;
      const updatedAt = now();
      const releasedAt = status === "released" ? updatedAt : null;
      const statement = db.prepare(`INSERT INTO platform_lesson_steps
        (step_id, class_id, teacher_id, title, directions, resources_json, status, sort_order, created_at, updated_at, released_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9, ?10)
        ON CONFLICT(step_id) DO UPDATE SET title = excluded.title, directions = excluded.directions,
          resources_json = excluded.resources_json, status = excluded.status, sort_order = excluded.sort_order,
          updated_at = excluded.updated_at, released_at = excluded.released_at
        WHERE platform_lesson_steps.class_id = excluded.class_id AND platform_lesson_steps.teacher_id = excluded.teacher_id`)
        .bind(id, classroom, owner, title, directions, JSON.stringify(resources), status, order, updatedAt, releasedAt);
      if (status === "released" && typeof db.batch === "function") {
        await db.batch([statement, auditStatement({ eventType: "LESSON_STEP_RELEASED", actorRole: "teacher", actorId: owner, classId: classroom, occurredAt: updatedAt })]);
      } else {
        await statement.run();
      }
      return Object.freeze({ id, classId: classroom, title, directions, resources, status, order, updatedAt, releasedAt });
    },

    async listTeacherLessonSteps({ teacherId, classId }) {
      const owner = clean(teacherId, "teacher-id");
      const classroom = clean(classId, "class-id");
      if (!(await this.teacherOwnsClass({ teacherId: owner, classId: classroom }))) throw Object.assign(new Error("teacher-class-authorization-required"), { status: 403 });
      const result = await primary(db).prepare(`SELECT step_id, class_id, title, directions, resources_json, status, sort_order, updated_at, released_at
        FROM platform_lesson_steps WHERE class_id = ?1 AND teacher_id = ?2
        ORDER BY sort_order ASC, created_at ASC LIMIT 100`).bind(classroom, owner).all();
      return Object.freeze((result?.results || []).map(lessonProjection));
    },

    async listReleasedLessonSteps({ classId }) {
      const classroom = clean(classId, "class-id");
      const result = await primary(db).prepare(`SELECT step_id, class_id, title, directions, resources_json, status, sort_order, updated_at, released_at
        FROM platform_lesson_steps WHERE class_id = ?1 AND status = 'released'
        ORDER BY sort_order ASC, created_at ASC LIMIT 100`).bind(classroom).all();
      return Object.freeze((result?.results || []).map(lessonProjection));
    },

    async listActiveStudentLabels({ classId }) {
      const classroom = clean(classId, "class-id");
      const result = await primary(db).prepare(`SELECT display_label
        FROM platform_student_entries
        WHERE class_id = ?1 AND status = 'active'
        ORDER BY created_at ASC, student_id ASC LIMIT 40`).bind(classroom).all();
      return Object.freeze((result?.results || []).map((row) => displayLabel(row.display_label)));
    },

    async findStudentDisplayLabel({ studentId, classId }) {
      const row = await primary(db).prepare(`SELECT display_label
        FROM platform_student_entries
        WHERE student_id = ?1 AND class_id = ?2 AND status = 'active'
        LIMIT 1`).bind(clean(studentId, "student-id"), clean(classId, "class-id")).first();
      return row?.display_label ? displayLabel(row.display_label) : null;
    },

    async createClassroom({ teacherId, name, studentLabels }) {
      if (typeof db.batch !== "function") throw new Error("d1-batch-required");
      const owner = clean(teacherId, "teacher-id");
      const className = String(name || "").trim().replace(/\s+/g, " ");
      if (className.length < 2 || className.length > 80) throw new Error("valid-class-name-required");
      if (!Array.isArray(studentLabels) || studentLabels.length < 1 || studentLabels.length > 40) throw new Error("bounded-student-roster-required");
      const labels = studentLabels.map(displayLabel);
      if (new Set(labels.map((label) => label.toLowerCase())).size !== labels.length) throw new Error("unique-student-labels-required");
      const existingLabels = await primary(db).prepare(`SELECT LOWER(s.display_label) AS normalized_label
        FROM platform_student_entries s
        JOIN platform_class_teachers t ON t.class_id = s.class_id
        WHERE t.teacher_id = ?1 AND t.status = 'active' AND s.status = 'active'`).bind(owner).all();
      const usedLabels = new Set((existingLabels?.results || []).map((row) => String(row.normalized_label || "")));
      if (labels.some((label) => usedLabels.has(label.toLowerCase()))) throw Object.assign(new Error("student-label-already-used"), { status: 409 });
      const classId = `class-${random(18).toString("base64url")}`;
      const classCode = accessCode(random, 8);
      const classCodeHash = createHmac("sha256", lookupKey).update(`class-code:${classCode}`).digest("base64url");
      const createdAt = now();
      const students = labels.map((label) => {
        const studentCode = accessCode(random, 10);
        return { studentId: `student-${random(18).toString("base64url")}`, displayLabel: label, studentCode, studentCodeHash: createHmac("sha256", lookupKey).update(`student-code:${studentCode}`).digest("base64url") };
      });
      const statements = [
        db.prepare(`INSERT INTO platform_class_entry (class_id, class_name, class_code_hash, status, created_at, updated_at) VALUES (?1, ?2, ?3, 'active', ?4, ?4)`).bind(classId, className, classCodeHash, createdAt),
        db.prepare(`INSERT INTO platform_class_teachers (teacher_id, class_id, status, created_at, updated_at) VALUES (?1, ?2, 'active', ?3, ?3)`).bind(owner, classId, createdAt),
        ...students.map((student) => db.prepare(`INSERT INTO platform_student_entries (student_id, class_id, display_label, student_code_hash, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, 'active', ?5, ?5)`).bind(student.studentId, classId, student.displayLabel, student.studentCodeHash, createdAt)),
        auditStatement({ eventType: "CLASSROOM_CREATED", actorRole: "teacher", actorId: owner, classId, occurredAt: createdAt }),
      ];
      await db.batch(statements);
      return Object.freeze({ classId, name: className, classCode, students: students.map(({ studentId, displayLabel: label, studentCode }) => Object.freeze({ studentId, displayLabel: label, studentCode })) });
    },

    async listTeacherClassrooms({ teacherId }) {
      const result = await primary(db).prepare(`SELECT c.class_id, c.class_name, c.status, COUNT(s.student_id) AS student_count,
          GROUP_CONCAT(CASE WHEN s.status = 'active' THEN s.display_label END, CHAR(31)) AS student_labels
        FROM platform_class_entry c
        JOIN platform_class_teachers t ON t.class_id = c.class_id
        LEFT JOIN platform_student_entries s ON s.class_id = c.class_id AND s.status = 'active'
        WHERE t.teacher_id = ?1 AND t.status = 'active'
        GROUP BY c.class_id, c.class_name, c.status
        ORDER BY c.created_at DESC
        LIMIT 50`).bind(clean(teacherId, "teacher-id")).all();
      return Object.freeze((result?.results || []).map((row) => Object.freeze({ id: String(row.class_id), name: String(row.class_name), status: String(row.status), studentCount: Number(row.student_count) || 0, studentLabels: String(row.student_labels || "").split(String.fromCharCode(31)).filter(Boolean) })));
    },

    async findOrCreateGoogleTeacher({ subject, hostedDomain = null }) {
      const subjectHash = identityHash(`google:${clean(subject, "google-subject")}`);
      const domain = hostedDomain ? String(hostedDomain).trim().toLowerCase().slice(0, 253) : null;
      const existing = await primary(db).prepare(`SELECT teacher_id FROM platform_teacher_identities WHERE google_subject_hash = ?1 LIMIT 1`).bind(subjectHash).first();
      if (existing?.teacher_id) return Object.freeze({ teacherId: clean(existing.teacher_id, "teacher-id"), created: false });
      const teacherId = `teacher-${random(18).toString("base64url")}`;
      const createdAt = now();
      await db.prepare(`INSERT INTO platform_teacher_identities (teacher_id, google_subject_hash, hosted_domain, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?4)
        ON CONFLICT(google_subject_hash) DO NOTHING`).bind(teacherId, subjectHash, domain, createdAt).run();
      const saved = await primary(db).prepare(`SELECT teacher_id FROM platform_teacher_identities WHERE google_subject_hash = ?1 LIMIT 1`).bind(subjectHash).first();
      if (!saved?.teacher_id) throw new Error("teacher-identity-create-failed");
      return Object.freeze({ teacherId: clean(saved.teacher_id, "teacher-id"), created: saved.teacher_id === teacherId });
    },

    async findStudentEntry({ classCode, studentCode }) {
      const classroom = String(classCode || "").trim().toUpperCase();
      const student = String(studentCode || "").trim().toUpperCase();
      if (!/^[A-Z0-9-]{4,32}$/.test(classroom) || !/^[A-Z0-9-]{4,32}$/.test(student)) return null;
      const classroomHash = createHmac("sha256", lookupKey).update(`class-code:${classroom}`).digest("base64url");
      const studentHash = createHmac("sha256", lookupKey).update(`student-code:${student}`).digest("base64url");
      const row = await primary(db).prepare(`SELECT s.student_id, s.class_id
        FROM platform_student_entries s
        JOIN platform_class_entry c ON c.class_id = s.class_id
        WHERE c.class_code_hash = ?1 AND s.student_code_hash = ?2
          AND c.status = 'active' AND s.status = 'active'
        LIMIT 1`).bind(classroomHash, studentHash).first();
      if (!row) return null;
      try { return Object.freeze({ studentId: clean(row.student_id, "student-id"), classId: clean(row.class_id, "class-id") }); } catch { return null; }
    },

    async createSession({ role, userId, classId = null, ttlMs = DEFAULT_SESSION_TTL_MS }) {
      const safeRole = String(role || "");
      if (!['teacher', 'student'].includes(safeRole)) throw new Error("valid-session-role-required");
      const owner = clean(userId, "user-id");
      const classroom = safeRole === "student" ? clean(classId, "class-id") : null;
      if (!Number.isSafeInteger(ttlMs) || ttlMs < MIN_SESSION_TTL_MS || ttlMs > MAX_SESSION_TTL_MS) throw new Error("valid-session-duration-required");
      const token = random(32).toString("base64url");
      const createdAt = now();
      const expiresAt = createdAt + ttlMs;
      if (typeof db.batch !== "function") throw new Error("d1-batch-required");
      const sessionStatement = db.prepare(`INSERT INTO platform_sessions (session_hash, role, user_id, class_id, created_at, expires_at, revoked_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL)`)
        .bind(sessionHash(token), safeRole, owner, classroom, createdAt, expiresAt);
      await db.batch([sessionStatement, auditStatement({ eventType: safeRole === "teacher" ? "TEACHER_SESSION_ISSUED" : "STUDENT_SESSION_ISSUED", actorRole: safeRole, actorId: owner, classId: classroom, occurredAt: createdAt })]);
      return Object.freeze({ token, role: safeRole, expiresAt });
    },

    async findSession(token) {
      return findSessionRecord(token);
    },

    async revokeSession(token) {
      const value = String(token || "");
      if (value.length < 32 || value.length > 200) return false;
      const existing = await findSessionRecord(value);
      if (!existing || typeof db.batch !== "function") return false;
      const revokedAt = now();
      const update = db.prepare(`UPDATE platform_sessions SET revoked_at = ?1
        WHERE session_hash = ?2 AND revoked_at IS NULL`).bind(revokedAt, sessionHash(value));
      const results = await db.batch([update, auditStatement({ eventType: "SESSION_REVOKED", actorRole: existing.role, actorId: existing.id, classId: existing.classId || null, occurredAt: revokedAt })]);
      return Number(results?.[0]?.meta?.changes || 0) > 0;
    },

    async deleteExpiredAuditEvents({ retentionDays, limit = 500 }) {
      if (!Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 365) throw new Error("valid-audit-retention-required");
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw new Error("valid-audit-deletion-limit-required");
      const completedAt = now();
      const cutoff = completedAt - (retentionDays * 24 * 60 * 60 * 1000);
      const result = await db.prepare(`DELETE FROM platform_audit_events
        WHERE event_id IN (
          SELECT event_id FROM platform_audit_events
          WHERE occurred_at < ?1
          ORDER BY occurred_at ASC
          LIMIT ?2
        )`).bind(cutoff, limit).run();
      return Object.freeze({ deleted: Number(result?.meta?.changes || 0), cutoff, completedAt });
    },

    async recordAuditRetentionSuccess({ completedAt, deleted, cutoff }) {
      if (!Number.isSafeInteger(completedAt) || completedAt < 0 || !Number.isSafeInteger(cutoff) || cutoff < 0 || cutoff > completedAt) throw new Error("valid-audit-maintenance-time-required");
      if (!Number.isSafeInteger(deleted) || deleted < 0 || deleted > 1000) throw new Error("valid-audit-deletion-count-required");
      await db.prepare(`INSERT INTO platform_maintenance_status (task_key, last_success_at, last_deleted_count, last_cutoff, updated_at)
        VALUES ('audit-retention', ?1, ?2, ?3, ?1)
        ON CONFLICT(task_key) DO UPDATE SET last_success_at = excluded.last_success_at,
          last_deleted_count = excluded.last_deleted_count, last_cutoff = excluded.last_cutoff, updated_at = excluded.updated_at`)
        .bind(completedAt, deleted, cutoff).run();
      return true;
    },

    async readAuditRetentionStatus() {
      const row = await primary(db).prepare(`SELECT last_success_at, last_deleted_count, last_cutoff
        FROM platform_maintenance_status WHERE task_key = 'audit-retention' LIMIT 1`).first();
      if (!row) return null;
      const status = { lastSuccessAt: Number(row.last_success_at), lastDeletedCount: Number(row.last_deleted_count), lastCutoff: Number(row.last_cutoff) };
      if (!Number.isSafeInteger(status.lastSuccessAt) || !Number.isSafeInteger(status.lastDeletedCount) || !Number.isSafeInteger(status.lastCutoff)) return null;
      return Object.freeze(status);
    },

    async teacherOwnsClass({ teacherId, classId }) {
      const row = await primary(db).prepare(`SELECT 1 AS authorized
        FROM platform_class_teachers
        WHERE teacher_id = ?1 AND class_id = ?2 AND status = 'active'
        LIMIT 1`).bind(clean(teacherId, "teacher-id"), clean(classId, "class-id")).first();
      return row?.authorized === 1;
    },
  });
}

export function platformSessionCookie(token, { maxAgeSeconds = DEFAULT_SESSION_TTL_MS / 1000 } = {}) {
  const value = String(token || "");
  if (value.length < 32 || value.length > 200) throw new Error("valid-session-token-required");
  if (!Number.isSafeInteger(maxAgeSeconds) || maxAgeSeconds < 1 || maxAgeSeconds > MAX_SESSION_TTL_MS / 1000) throw new Error("valid-cookie-duration-required");
  return `${PLATFORM_SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; Secure; SameSite=Lax`;
}
