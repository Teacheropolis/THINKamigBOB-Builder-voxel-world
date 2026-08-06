export const TEACHER_MEMO_SESSION_KEY = "thinkamigbob.pb002d.teacher-memo.v1";
export const TEACHER_MEMO_MAX_CHARACTERS = 240;

function emptyState() {
  return { version: 1, text: "" };
}

function sanitizeState(value) {
  if (!value || typeof value !== "object" || value.version !== 1 ||
      typeof value.text !== "string") return emptyState();
  const text = value.text.trim();
  if (!text || text.length > TEACHER_MEMO_MAX_CHARACTERS) return emptyState();
  return { version: 1, text };
}

export function createTeacherMemoStore({ storage } = {}) {
  let memoryState = emptyState();

  function persist(state) {
    const cleanState = sanitizeState(state);
    memoryState = cleanState;
    try {
      storage?.setItem(TEACHER_MEMO_SESSION_KEY, JSON.stringify(cleanState));
    } catch {
      // In-memory state remains available for this page load.
    }
    return { ...cleanState };
  }

  function read() {
    try {
      const raw = storage?.getItem(TEACHER_MEMO_SESSION_KEY);
      if (raw) return sanitizeState(JSON.parse(raw));
    } catch {
      // Fall through to the sanitized in-memory state.
    }
    return sanitizeState(memoryState);
  }

  return Object.freeze({
    read,
    save(value) {
      if (typeof value !== "string") {
        return { ok: false, reason: "invalid", state: read() };
      }
      const text = value.trim();
      if (!text) return { ok: false, reason: "empty", state: read() };
      if (text.length > TEACHER_MEMO_MAX_CHARACTERS) {
        return { ok: false, reason: "too-long", state: read() };
      }
      return { ok: true, reason: null, state: persist({ version: 1, text }) };
    },
    clear() {
      memoryState = emptyState();
      try {
        storage?.removeItem(TEACHER_MEMO_SESSION_KEY);
      } catch {
        // In-memory state is still cleared for this page load.
      }
      return { ...memoryState };
    },
  });
}
