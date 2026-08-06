/**
 * PB-001 DEVELOPMENT FIXTURES
 *
 * These fictional records support local entry-flow testing only. They are
 * client-visible, are not production authentication, and contain no real
 * teacher or student data. A future approved service must replace this module.
 */

const teachers = Object.freeze([
  Object.freeze({
    id: "teacher-preview-1",
    email: "teacher.preview@example.test",
    password: "BOB-Preview-001",
    displayName: "Preview Teacher",
  }),
]);

const classes = Object.freeze([
  Object.freeze({
    id: "class-preview-1",
    code: "STEM-101",
    displayName: "Preview STEM Class",
    periodLabel: "Period 2",
    teacherId: "teacher-preview-1",
  }),
]);

const students = Object.freeze([
  Object.freeze({ id: "student-preview-1", classId: "class-preview-1", displayName: "Ada Rivera", identifier: "1842" }),
  Object.freeze({ id: "student-preview-2", classId: "class-preview-1", displayName: "Mateo Chen", identifier: "2753" }),
  Object.freeze({ id: "student-preview-3", classId: "class-preview-1", displayName: "Jordan Brooks", identifier: "3964" }),
]);

function normalize(value) {
  return String(value ?? "").trim();
}

export const DEVELOPMENT_FIXTURE_NOTICE =
  "Development preview only. These fictional records do not provide production security.";

export const DEVELOPMENT_FIXTURE_ACCESS = Object.freeze({
  teacherEmail: teachers[0].email,
  teacherPassword: teachers[0].password,
  classCode: classes[0].code,
});

export function validateTeacherCredentials(email, password) {
  const normalizedEmail = normalize(email).toLowerCase();
  const normalizedPassword = normalize(password);
  return teachers.find((teacher) =>
    teacher.email.toLowerCase() === normalizedEmail && teacher.password === normalizedPassword
  ) ?? null;
}

export function findClassByCode(code) {
  const normalizedCode = normalize(code).toUpperCase();
  return classes.find((classRecord) => classRecord.code === normalizedCode) ?? null;
}

export function getClassById(classId) {
  return classes.find((classRecord) => classRecord.id === classId) ?? null;
}

export function getClassForTeacher(teacherId) {
  return classes.find((classRecord) => classRecord.teacherId === teacherId) ?? null;
}

export function getTeacherById(teacherId) {
  return teachers.find((teacher) => teacher.id === teacherId) ?? null;
}

export function getStudentById(studentId) {
  return students.find((student) => student.id === studentId) ?? null;
}

export function getRosterForClass(classId) {
  return students.filter((student) => student.classId === classId);
}

export function validateStudentIdentifier(classId, studentId, identifier) {
  const normalizedIdentifier = normalize(identifier);
  return students.find((student) =>
    student.classId === classId &&
    student.id === studentId &&
    student.identifier === normalizedIdentifier
  ) ?? null;
}

export function getDevelopmentIdentifier(studentId) {
  return getStudentById(studentId)?.identifier ?? "";
}
