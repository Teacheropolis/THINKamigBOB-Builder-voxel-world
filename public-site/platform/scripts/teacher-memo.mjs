export const TEACHER_MEMO_SESSION_KEY = "thinkamigbob.pb002d.teacher-memo.v1";
export const TEACHER_MEMO_MAX_CHARACTERS = 240;
export const TEACHER_MEMO_COLORS = Object.freeze(["white", "yellow", "light-blue", "green", "pink"]);
export const TEACHER_MEMO_SIZES = Object.freeze(["large", "extra-large", "huge"]);
export const TEACHER_MEMO_STYLES = Object.freeze(["regular", "bold", "underline", "bold-underline"]);

function emptyState() {
  return { version: 3, text: "", color: "white", size: "extra-large", style: "bold", segments: [], image: "" };
}

function sanitizeSegments(value, fallback) {
  if (!Array.isArray(value)) return fallback.text ? [{ text: fallback.text, color: fallback.color, size: fallback.size, style: fallback.style }] : [];
  const segments = value.slice(0, 100).map((segment) => ({
    text: String(segment?.text ?? ""),
    color: TEACHER_MEMO_COLORS.includes(segment?.color) ? segment.color : fallback.color,
    size: TEACHER_MEMO_SIZES.includes(segment?.size) ? segment.size : fallback.size,
    style: TEACHER_MEMO_STYLES.includes(segment?.style) ? segment.style : fallback.style,
  })).filter((segment) => segment.text);
  return segments.map((segment) => ({ ...segment, text: segment.text.slice(0, TEACHER_MEMO_MAX_CHARACTERS) }));
}

function sanitizeState(value) {
  if (!value || typeof value !== "object" || ![1, 2, 3].includes(value.version) ||
      typeof value.text !== "string") return emptyState();
  const text = value.text.trim();
  if (!text || text.length > TEACHER_MEMO_MAX_CHARACTERS) return emptyState();
  const base = {
    version: 3,
    text,
    color: TEACHER_MEMO_COLORS.includes(value.color) ? value.color : "white",
    size: TEACHER_MEMO_SIZES.includes(value.size) ? value.size : "extra-large",
    style: TEACHER_MEMO_STYLES.includes(value.style) ? value.style : "bold",
  };
  const segments = sanitizeSegments(value.segments, base);
  if (segments.map((segment) => segment.text).join("").trim() !== text) base.segments = [{ text, color: base.color, size: base.size, style: base.style }];
  else base.segments = segments;
  base.image = String(value.image ?? "").startsWith("data:image/") && String(value.image).length <= 700000 ? String(value.image) : "";
  return base;
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
    save(value, formatting = {}) {
      if (typeof value !== "string") {
        return { ok: false, reason: "invalid", state: read() };
      }
      const text = value.trim();
      if (!text) return { ok: false, reason: "empty", state: read() };
      if (text.length > TEACHER_MEMO_MAX_CHARACTERS) {
        return { ok: false, reason: "too-long", state: read() };
      }
      return { ok: true, reason: null, state: persist({
        version: 3,
        text,
        color: formatting.color,
        size: formatting.size,
        style: formatting.style,
        segments: formatting.segments,
        image: formatting.image,
      }) };
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
