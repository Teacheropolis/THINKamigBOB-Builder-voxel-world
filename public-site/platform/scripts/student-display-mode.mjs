export const STUDENT_DISPLAY_MODE_SESSION_KEY = "thinkamigbob.pb002e.student-display-mode.v1";

export const STUDENT_DISPLAY_MODES = Object.freeze({
  COMBINED: "combined",
  MESSAGE: "message",
  TIMER: "timer",
});

const VALID_MODES = new Set(Object.values(STUDENT_DISPLAY_MODES));

function defaultMode(hasMemo) {
  return hasMemo ? STUDENT_DISPLAY_MODES.COMBINED : STUDENT_DISPLAY_MODES.TIMER;
}

function validStoredMode(value) {
  return value && value.version === 1 && VALID_MODES.has(value.mode)
    ? value.mode
    : null;
}

export function createStudentDisplayModeStore({ storage } = {}) {
  let memoryMode = null;

  function persist(mode) {
    memoryMode = mode;
    try {
      storage?.setItem(STUDENT_DISPLAY_MODE_SESSION_KEY,
        JSON.stringify({ version: 1, mode }));
    } catch {
      // The selected mode remains available for this page load.
    }
    return mode;
  }

  function read({ hasMemo = false } = {}) {
    let mode = null;
    try {
      const raw = storage?.getItem(STUDENT_DISPLAY_MODE_SESSION_KEY);
      if (raw) mode = validStoredMode(JSON.parse(raw));
    } catch {
      // Fall through to page-memory state or the approved default.
    }
    if (!mode && VALID_MODES.has(memoryMode)) mode = memoryMode;
    if (!mode) return defaultMode(hasMemo);
    if (mode === STUDENT_DISPLAY_MODES.MESSAGE && !hasMemo) {
      return persist(STUDENT_DISPLAY_MODES.TIMER);
    }
    return mode;
  }

  return Object.freeze({
    read,
    select(mode, { hasMemo = false } = {}) {
      if (!VALID_MODES.has(mode)) return { ok: false, mode: read({ hasMemo }) };
      if (mode === STUDENT_DISPLAY_MODES.MESSAGE && !hasMemo) {
        return { ok: false, mode: read({ hasMemo }) };
      }
      return { ok: true, mode: persist(mode) };
    },
    clear() {
      memoryMode = null;
      try {
        storage?.removeItem(STUDENT_DISPLAY_MODE_SESSION_KEY);
      } catch {
        // Page-memory state is still cleared.
      }
    },
  });
}
