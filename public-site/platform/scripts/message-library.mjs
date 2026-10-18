export const MESSAGE_LIBRARY_KEY = "thinkamigbob.message-library.v1";
export const MESSAGE_LIBRARY_LIMIT = 20;

const empty = () => ({ version: 1, messages: [], assignments: {} });
const cleanText = (value, limit) => String(value ?? "").trim().slice(0, limit);

function sanitize(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.messages)) return empty();
  const messages = value.messages.slice(0, MESSAGE_LIBRARY_LIMIT).map((item) => ({
    id: cleanText(item.id, 80), title: cleanText(item.title, 60), text: cleanText(item.text, 240),
    color: cleanText(item.color, 20), size: cleanText(item.size, 20), style: cleanText(item.style, 30),
    segments: Array.isArray(item.segments) ? item.segments.slice(0, 100).map((segment) => ({ text: cleanText(segment.text, 240), color: cleanText(segment.color, 20), size: cleanText(segment.size, 20), style: cleanText(segment.style, 30) })).filter((segment) => segment.text) : [],
    image: String(item.image ?? "").startsWith("data:image/") ? String(item.image) : "",
  })).filter((item) => item.id && item.title && item.text);
  const ids = new Set(messages.map((item) => item.id));
  const assignments = Object.fromEntries(Object.entries(value.assignments ?? {})
    .filter(([key, id]) => /^[A-Za-z0-9_-]+\|(Monday|Tuesday|Wednesday|Thursday|Friday)$/.test(key) && ids.has(id)));
  return { version: 1, messages, assignments };
}

export function createMessageLibrary({ storage, now = () => Date.now() } = {}) {
  const read = () => { try { return sanitize(JSON.parse(storage?.getItem(MESSAGE_LIBRARY_KEY) || "null")); } catch { return empty(); } };
  const write = (state) => { const clean = sanitize(state); storage?.setItem(MESSAGE_LIBRARY_KEY, JSON.stringify(clean)); return clean; };
  return Object.freeze({
    read,
    save(message) {
      const state = read();
      if (!String(message?.title ?? "").trim() || !String(message?.text ?? "").trim()) return { ok: false, reason: "required" };
      if (state.messages.length >= MESSAGE_LIBRARY_LIMIT) return { ok: false, reason: "limit" };
      const id = `message-${now()}-${state.messages.length + 1}`;
      const next = write({ ...state, messages: [{ id, ...message }, ...state.messages] });
      return { ok: true, message: next.messages.find((item) => item.id === id), state: next };
    },
    remove(id) {
      const state = read();
      return write({ ...state, messages: state.messages.filter((item) => item.id !== id), assignments: Object.fromEntries(Object.entries(state.assignments).filter(([, value]) => value !== id)) });
    },
    assign(classId, weekday, messageId) {
      const state = read(); const key = `${classId}|${weekday}`; const assignments = { ...state.assignments };
      if (messageId && state.messages.some((item) => item.id === messageId)) assignments[key] = messageId; else delete assignments[key];
      return write({ ...state, assignments });
    },
    assigned(classId, weekday) { const state = read(); return state.messages.find((item) => item.id === state.assignments[`${classId}|${weekday}`]) ?? null; },
  });
}

export function createBrowserMessageLibrary(windowRef) {
  let storage;
  try { storage = windowRef?.localStorage; } catch { storage = undefined; }
  return createMessageLibrary({ storage });
}
