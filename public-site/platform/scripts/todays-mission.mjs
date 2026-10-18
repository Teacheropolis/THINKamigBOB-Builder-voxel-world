export const TODAYS_MISSION_SESSION_KEY = "thinkamigbob.pb002i.todays-mission.v1";
export const TODAYS_MISSION_TITLE_MAX_CHARACTERS = 80;
export const TODAYS_MISSION_FOCUS_MAX_CHARACTERS = 180;

export const TODAYS_MISSION_AVAILABILITY = Object.freeze({
  AVAILABLE: "available",
  NOT_PART: "not-part",
});

const VALID_AVAILABILITY = new Set(Object.values(TODAYS_MISSION_AVAILABILITY));

function emptyState() {
  return { version: 1, title: "", focus: "", builder: "", workshop: "" };
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeState(value) {
  if (!value || typeof value !== "object" || value.version !== 1) return emptyState();
  const title = normalizeText(value.title);
  const focus = normalizeText(value.focus);
  if (!title || title.length > TODAYS_MISSION_TITLE_MAX_CHARACTERS ||
      !focus || focus.length > TODAYS_MISSION_FOCUS_MAX_CHARACTERS ||
      !VALID_AVAILABILITY.has(value.builder) ||
      !VALID_AVAILABILITY.has(value.workshop)) return emptyState();
  return { version: 1, title, focus, builder: value.builder, workshop: value.workshop };
}

export function createTodaysMissionStore({ storage } = {}) {
  let memoryState = emptyState();

  function read() {
    try {
      const raw = storage?.getItem(TODAYS_MISSION_SESSION_KEY);
      if (raw) return sanitizeState(JSON.parse(raw));
    } catch {
      // Fall through to the sanitized page-memory state.
    }
    return sanitizeState(memoryState);
  }

  function persist(value) {
    const state = sanitizeState(value);
    memoryState = state;
    try {
      storage?.setItem(TODAYS_MISSION_SESSION_KEY, JSON.stringify(state));
    } catch {
      // The announcement remains available for this page load.
    }
    return { ...state };
  }

  return Object.freeze({
    read,
    save({ title, focus, builder, workshop } = {}) {
      const current = read();
      const cleanTitle = normalizeText(title);
      const cleanFocus = normalizeText(focus);
      if (!cleanTitle) return { ok: false, reason: "missing-title", state: current };
      if (cleanTitle.length > TODAYS_MISSION_TITLE_MAX_CHARACTERS) {
        return { ok: false, reason: "title-too-long", state: current };
      }
      if (!cleanFocus) return { ok: false, reason: "missing-focus", state: current };
      if (cleanFocus.length > TODAYS_MISSION_FOCUS_MAX_CHARACTERS) {
        return { ok: false, reason: "focus-too-long", state: current };
      }
      if (!VALID_AVAILABILITY.has(builder)) {
        return { ok: false, reason: "missing-builder", state: current };
      }
      if (!VALID_AVAILABILITY.has(workshop)) {
        return { ok: false, reason: "missing-workshop", state: current };
      }
      return {
        ok: true,
        reason: null,
        state: persist({ version: 1, title: cleanTitle, focus: cleanFocus, builder, workshop }),
      };
    },
    clear() {
      memoryState = emptyState();
      try {
        storage?.removeItem(TODAYS_MISSION_SESSION_KEY);
      } catch {
        // Page-memory state is still cleared.
      }
      return { ...memoryState };
    },
  });
}
