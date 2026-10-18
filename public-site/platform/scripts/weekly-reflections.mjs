export const WEEKLY_REFLECTION_STORAGE_KEY = "thinkamigbob.weekly-reflections.v1";
export const REFLECTION_PROGRESS_OPTIONS = Object.freeze(["🌱 Started", "🧪 Testing", "🔧 Improving", "🏆 Complete"]);
export const REFLECTION_IMPROVEMENT_OPTIONS = Object.freeze(["Yes", "Not Yet"]);
export const REFLECTION_BADGE_OPTIONS = Object.freeze([
  "🏗 Builder – I built, tested, or improved a design.",
  "🧠 Scientist – I collected data, researched, or investigated.",
  "🎨 Creator – I designed, communicated, or created media.",
  "💻 Technology – I used coding, robotics, or technology tools.",
]);
export const REFLECTION_HELP_OPTIONS = Object.freeze([
  "😊 No, I'm doing fine.",
  "🤔 Maybe a little help. I'll let you know.",
  "🆘 Yes, I need help.",
  "🚨 I'm stuck and need teacher support.",
]);
export const REFLECTION_HELP_OTHER_OPTIONS = Object.freeze(["Yes", "Maybe", "Not Yet"]);
export const REFLECTION_ACTIVITY_RATING_OPTIONS = Object.freeze([
  "5 = Awesome 🤩", "4 = Good 😊", "3 = Okay 😐", "2 = Difficult 😕", "1 = Frustrating 😫",
]);

function normalizeResponse(value) {
  if (typeof value === "string") return value.trim().length >= 10 && value.trim().length <= 500 ? { reflection: value.trim() } : null;
  if (!value || typeof value !== "object") return null;
  const activity = String(value.activity ?? "").trim();
  const explanation = String(value.explanation ?? "").trim();
  const valid = activity.length > 0 && activity.length <= 120
    && explanation.length >= 10 && explanation.length <= 500
    && REFLECTION_PROGRESS_OPTIONS.includes(value.progress)
    && REFLECTION_IMPROVEMENT_OPTIONS.includes(value.improved)
    && REFLECTION_BADGE_OPTIONS.includes(value.badge)
    && REFLECTION_HELP_OPTIONS.includes(value.help)
    && REFLECTION_HELP_OTHER_OPTIONS.includes(value.helpOther)
    && REFLECTION_ACTIVITY_RATING_OPTIONS.includes(value.rating);
  return valid ? { activity, progress: value.progress, explanation, improved: value.improved, badge: value.badge, help: value.help, helpOther: value.helpOther, rating: value.rating } : null;
}

export function weekKey(date = new Date()) {
  const value = new Date(date);
  const day = (value.getDay() + 6) % 7;
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - day);
  return value.toISOString().slice(0, 10);
}

export function reflectionActivityWindowStart(date = new Date()) {
  const value = new Date(date);
  const day = (value.getDay() + 6) % 7;
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - day - 3);
  return value.getTime();
}

export function createWeeklyReflections({ storage, now = () => new Date() }) {
  const readAll = () => {
    try { return JSON.parse(storage.getItem(WEEKLY_REFLECTION_STORAGE_KEY) || "{}") || {}; }
    catch { return {}; }
  };
  const write = (value) => storage.setItem(WEEKLY_REFLECTION_STORAGE_KEY, JSON.stringify(value));
  const classWeek = (classId) => `${classId}|${weekKey(now())}`;
  const requirement = (classId) => Math.max(0, Math.min(5, Number(readAll().requirements?.[classWeek(classId)] ?? 1)));
  const setRequirement = (classId, count) => {
    const required = Number(count);
    if (!classId || !Number.isInteger(required) || required < 0 || required > 5) return { ok: false };
    const all = readAll();
    all.requirements = { ...(all.requirements ?? {}), [classWeek(classId)]: required };
    write(all);
    return { ok: true, required };
  };
  const responses = (classId, studentId) => readAll().responses?.[`${classWeek(classId)}|${studentId}`] ?? [];
  const recordActivity = (classId, title) => {
    const cleanTitle = String(title ?? "").trim().slice(0, 120);
    if (!classId || !cleanTitle) return { ok: false };
    const all = readAll();
    const current = all.activities?.[classId] ?? [];
    const entry = { title: cleanTitle, sharedAt: new Date(now()).getTime() };
    all.activities = { ...(all.activities ?? {}), [classId]: [entry, ...current].slice(0, 100) };
    write(all);
    return { ok: true, activity: entry };
  };
  const activities = (classId) => {
    const start = reflectionActivityWindowStart(now());
    const currentTime = new Date(now()).getTime();
    const recent = (readAll().activities?.[classId] ?? []).filter((entry) => entry && typeof entry.title === "string" && Number.isFinite(entry.sharedAt) && entry.sharedAt >= start && entry.sharedAt <= currentTime);
    return [...new Map(recent.map((entry) => [entry.title.toLowerCase(), entry])).values()];
  };
  const status = (classId, studentId) => {
    const required = requirement(classId);
    const completed = responses(classId, studentId).length;
    const remaining = Math.max(0, required - completed);
    return { required, completed, remaining, state: remaining === 0 ? "complete" : remaining === 1 ? "one" : "multiple" };
  };
  const submit = (classId, studentId, value) => {
    const response = normalizeResponse(value);
    const current = status(classId, studentId);
    if (!classId || !studentId || !response || current.remaining === 0) return { ok: false };
    const all = readAll();
    const key = `${classWeek(classId)}|${studentId}`;
    const list = all.responses?.[key] ?? [];
    all.responses = { ...(all.responses ?? {}), [key]: [...list, { ...response, submittedAt: new Date(now()).toISOString() }] };
    write(all);
    return { ok: true, status: status(classId, studentId) };
  };
  return { requirement, setRequirement, activities, recordActivity, responses, status, submit };
}
