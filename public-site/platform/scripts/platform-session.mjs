export const PLATFORM_SESSION_KEY = "thinkamigbob.pb001.entry-state.v1";
export const PLATFORM_ROLES = Object.freeze({
  TEACHER: "teacher",
  STUDENT: "student",
});

const EMPTY_STATE = Object.freeze({
  version: 1,
  role: null,
  teacherId: null,
  classId: null,
  studentId: null,
  pendingClassId: null,
  pendingStudentId: null,
});

function cleanId(value) {
  return typeof value === "string" && value.length <= 100 ? value : null;
}

function sanitizeState(value) {
  if (!value || typeof value !== "object" || value.version !== 1) return { ...EMPTY_STATE };
  const role = Object.values(PLATFORM_ROLES).includes(value.role) ? value.role : null;
  return {
    version: 1,
    role,
    teacherId: role === PLATFORM_ROLES.TEACHER ? cleanId(value.teacherId) : null,
    classId: role === PLATFORM_ROLES.STUDENT ? cleanId(value.classId) : null,
    studentId: role === PLATFORM_ROLES.STUDENT ? cleanId(value.studentId) : null,
    pendingClassId: role ? null : cleanId(value.pendingClassId),
    pendingStudentId: role ? null : cleanId(value.pendingStudentId),
  };
}

export function createSessionStore(storage) {
  let memoryState = { ...EMPTY_STATE };

  function read() {
    try {
      const raw = storage?.getItem(PLATFORM_SESSION_KEY);
      if (raw) return sanitizeState(JSON.parse(raw));
    } catch {
      // An in-memory fallback keeps navigation safe when storage is unavailable.
    }
    return sanitizeState(memoryState);
  }

  function write(nextState) {
    const cleanState = sanitizeState(nextState);
    memoryState = cleanState;
    try {
      storage?.setItem(PLATFORM_SESSION_KEY, JSON.stringify(cleanState));
    } catch {
      // The sanitized in-memory copy remains available for this page load.
    }
    return cleanState;
  }

  return Object.freeze({
    read,
    beginStudentEntry(classId) {
      return write({ ...EMPTY_STATE, pendingClassId: cleanId(classId) });
    },
    selectStudent(studentId) {
      const current = read();
      if (!current.pendingClassId) return current;
      return write({ ...current, pendingStudentId: cleanId(studentId) });
    },
    signInTeacher(teacherId) {
      return write({ ...EMPTY_STATE, role: PLATFORM_ROLES.TEACHER, teacherId: cleanId(teacherId) });
    },
    signInStudent(classId, studentId) {
      return write({
        ...EMPTY_STATE,
        role: PLATFORM_ROLES.STUDENT,
        classId: cleanId(classId),
        studentId: cleanId(studentId),
      });
    },
    signOut() {
      memoryState = { ...EMPTY_STATE };
      try {
        storage?.removeItem(PLATFORM_SESSION_KEY);
      } catch {
        // State is still cleared for this page load.
      }
      return { ...EMPTY_STATE };
    },
  });
}
