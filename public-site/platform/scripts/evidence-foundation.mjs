export const EVIDENCE_TYPES = Object.freeze({
  PHOTO: "Photo",
  SCREENSHOT: "Screenshot",
  VIDEO: "Video",
  REFLECTION: "Reflection",
  MORE: "More Evidence",
});

export const PILOT_ACTIVITY = "Design a Bridge That Holds Weight";

export const PILOT_EVIDENCE = Object.freeze([
  { id: "pilot-3", type: "Reflection", title: "What changed after testing", activity: PILOT_ACTIVITY, time: "Today, 10:42 AM", detail: "I added triangle braces because the middle bent during our first test." },
  { id: "pilot-2", type: "Photo", title: "Second bridge test", activity: PILOT_ACTIVITY, time: "Today, 10:31 AM", detail: "Fictional pilot photo · 1 image" },
  { id: "pilot-1", type: "Screenshot", title: "First bridge plan", activity: PILOT_ACTIVITY, time: "Yesterday, 2:18 PM", detail: "Fictional pilot screenshot · 1 image" },
]);

export const PILOT_TEACHER_EVIDENCE = Object.freeze([
  { id: "teacher-pilot-1", student: "Avery M.", type: "Photo", title: "Bridge load test", activity: PILOT_ACTIVITY, time: "Today, 10:48 AM", detail: "Fictional preview: the bridge is shown holding eight classroom weights." },
  { id: "teacher-pilot-2", student: "Jordan R.", type: "Reflection", title: "Why I changed the supports", activity: PILOT_ACTIVITY, time: "Today, 10:42 AM", detail: "I made the base wider after the first test tipped to one side." },
  { id: "teacher-pilot-3", student: "Mia S.", type: "Screenshot", title: "Revised bridge plan", activity: PILOT_ACTIVITY, time: "Today, 10:35 AM", detail: "Fictional preview: a labeled plan with two added triangle braces." },
  { id: "teacher-pilot-4", student: "Noah T.", type: "Video", title: "Second test", activity: PILOT_ACTIVITY, time: "Today, 10:29 AM", detail: "Fictional preview: a 12-second video placeholder describing the second test." },
]);

export function createEvidenceFoundation({ storage } = {}) {
  const key = "thinkamigbob.evidence-foundation.v1";
  let sessionItems = [];

  function readSaved() {
    if (!storage) return sessionItems;
    try {
      const value = JSON.parse(storage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeSaved(items) {
    sessionItems = items;
    if (!storage) return true;
    try {
      storage.setItem(key, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }

  return Object.freeze({
    timeline() {
      return [...readSaved(), ...PILOT_EVIDENCE];
    },
    save({ type, title, activity, detail }) {
      if (!Object.values(EVIDENCE_TYPES).includes(type) || !String(detail || "").trim()) {
        return { ok: false, reason: "missing-evidence" };
      }
      const next = [{
        id: `session-${Date.now()}`,
        type,
        title: String(title || type).trim(),
        activity: String(activity || PILOT_ACTIVITY).trim(),
        time: "Saved just now",
        detail: String(detail).trim(),
      }, ...readSaved()];
      return writeSaved(next) ? { ok: true, item: next[0] } : { ok: false, reason: "storage-unavailable" };
    },
  });
}
