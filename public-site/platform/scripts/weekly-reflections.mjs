export const WEEKLY_REFLECTION_STORAGE_KEY = "thinkamigbob.weekly-reflections.v1";
export const CAPTAINS_LOG_PRESET_PROMPTS = Object.freeze([
  { id: "week-1-ask", week: 1, label: "Ask", prompt: "What did you notice or wonder today?" },
  { id: "week-2-make", week: 2, label: "Make", prompt: "What did you make, build, or try today?" },
  { id: "week-3-improve", week: 3, label: "Improve", prompt: "What did you test or change today?" },
  { id: "week-4-grow", week: 4, label: "Grow", prompt: "What did you learn from today’s work?" },
  { id: "week-5-evidence", week: 5, label: "Evidence", prompt: "What evidence shows your idea is working?" },
  { id: "week-6-explain", week: 6, label: "Explain", prompt: "What challenge did you solve, and how?" },
  { id: "week-7-next", week: 7, label: "Next Step", prompt: "What are you proud of, and what will you try next?" },
]);
export const CAPTAINS_LOG_SCHEDULE_OPTIONS = Object.freeze(["Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
export const CAPTAINS_LOG_WEEKDAYS = Object.freeze(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
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
  const captainLogPlan = (classId) => {
    const weekly = readAll().captainLogWeekPlans?.[classId];
    if (weekly?.days) {
      const today = new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
      return weekly.days[today] ?? weekly.days[CAPTAINS_LOG_WEEKDAYS.find((day) => weekly.days[day]?.enabled)] ?? { prompt: "", promptId: "custom", week: weekly.week ?? 1, schedule: today, required: requirement(classId) };
    }
    const saved = readAll().captainLogPlans?.[classId];
    const fallback = CAPTAINS_LOG_PRESET_PROMPTS[0];
    return saved && typeof saved.prompt === "string" ? saved : { prompt: fallback.prompt, promptId: fallback.id, week: 1, schedule: "Today", required: requirement(classId), updatedAt: null };
  };
  const captainLogWeekPlan = (classId) => {
    const saved = readAll().captainLogWeekPlans?.[classId];
    if (saved?.days) return saved;
    const legacy = readAll().captainLogPlans?.[classId];
    const days = Object.fromEntries(CAPTAINS_LOG_WEEKDAYS.map((day, index) => {
      const preset = CAPTAINS_LOG_PRESET_PROMPTS[index];
      return [day, { enabled: legacy ? day === legacy.schedule || legacy.schedule === "Today" && index === 0 : true, promptId: legacy?.promptId ?? preset.id, prompt: legacy?.prompt ?? preset.prompt }];
    }));
    return { week: legacy?.week ?? 1, days };
  };
  const saveCaptainLogWeekPlan = (classId, value) => {
    const week = Number(value?.week), days = {};
    if (!classId || !Number.isInteger(week) || week < 1 || week > 7) return { ok: false };
    for (const day of CAPTAINS_LOG_WEEKDAYS) {
      const entry = value?.days?.[day] ?? {}, prompt = String(entry.prompt ?? "").trim();
      if (entry.enabled && (prompt.length < 5 || prompt.length > 240)) return { ok: false };
      days[day] = { enabled: Boolean(entry.enabled), promptId: String(entry.promptId ?? "custom"), prompt };
    }
    const all = readAll(), plan = { week, days, updatedAt: new Date(now()).toISOString() };
    all.captainLogWeekPlans = { ...(all.captainLogWeekPlans ?? {}), [classId]: plan };
    all.requirements = { ...(all.requirements ?? {}), [classWeek(classId)]: CAPTAINS_LOG_WEEKDAYS.filter((day) => days[day].enabled).length };
    write(all);
    return { ok: true, plan };
  };
  const copyCaptainLogWeekPlan = (sourceClassId, targetClassIds, selectedDays = CAPTAINS_LOG_WEEKDAYS) => {
    const source = captainLogWeekPlan(sourceClassId), targets = [...new Set(targetClassIds)].filter((id) => id && id !== sourceClassId);
    const chosen = selectedDays.filter((day) => CAPTAINS_LOG_WEEKDAYS.includes(day));
    if (!sourceClassId || !targets.length || !chosen.length) return { ok: false, copied: 0 };
    const all = readAll(); all.captainLogWeekPlans = { ...(all.captainLogWeekPlans ?? {}) }; all.requirements = { ...(all.requirements ?? {}) };
    targets.forEach((targetId) => {
      const existing = captainLogWeekPlan(targetId), days = { ...existing.days };
      chosen.forEach((day) => { days[day] = { ...source.days[day] }; });
      all.captainLogWeekPlans[targetId] = { week: source.week, days, updatedAt: new Date(now()).toISOString() };
      all.requirements[classWeek(targetId)] = CAPTAINS_LOG_WEEKDAYS.filter((day) => days[day].enabled).length;
    });
    write(all); return { ok: true, copied: targets.length };
  };
  const captainLogAvailableToday = (classId) => {
    const weekly = readAll().captainLogWeekPlans?.[classId];
    if (weekly?.days) return Boolean(weekly.days[new Date(now()).toLocaleDateString("en-US", { weekday: "long" })]?.enabled);
    const schedule = captainLogPlan(classId).schedule;
    return schedule === "Today" || schedule === new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
  };
  const saveCaptainLogPlan = (classId, value) => {
    const prompt = String(value?.prompt ?? "").trim();
    const week = Number(value?.week), required = Number(value?.required), schedule = String(value?.schedule ?? "");
    if (!classId || prompt.length < 5 || prompt.length > 240 || !Number.isInteger(week) || week < 1 || week > 7 || !CAPTAINS_LOG_SCHEDULE_OPTIONS.includes(schedule) || !Number.isInteger(required) || required < 0 || required > 5) return { ok: false };
    const all = readAll();
    const plan = { prompt, promptId: String(value?.promptId ?? "custom"), week, schedule, required, updatedAt: new Date(now()).toISOString() };
    all.captainLogPlans = { ...(all.captainLogPlans ?? {}), [classId]: plan };
    all.requirements = { ...(all.requirements ?? {}), [classWeek(classId)]: required };
    write(all);
    return { ok: true, plan };
  };
  const captainLogLibrary = () => (readAll().captainLogLibrary ?? []).filter((item) => item && typeof item.prompt === "string");
  const saveCaptainLogPrompt = (prompt) => {
    const clean = String(prompt ?? "").trim();
    if (clean.length < 5 || clean.length > 240) return { ok: false };
    const all = readAll(), existing = captainLogLibrary();
    const duplicate = existing.find((item) => item.prompt.toLowerCase() === clean.toLowerCase());
    if (duplicate) return { ok: true, item: duplicate, duplicate: true };
    const item = { id: `captains-log-${new Date(now()).getTime()}`, prompt: clean };
    all.captainLogLibrary = [item, ...existing].slice(0, 30);
    write(all);
    return { ok: true, item, duplicate: false };
  };
  const deleteCaptainLogPrompt = (id) => {
    const all = readAll(), before = captainLogLibrary();
    all.captainLogLibrary = before.filter((item) => item.id !== id);
    write(all);
    return { ok: all.captainLogLibrary.length !== before.length };
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
  return { requirement, setRequirement, captainLogPlan, captainLogWeekPlan, saveCaptainLogWeekPlan, copyCaptainLogWeekPlan, captainLogAvailableToday, saveCaptainLogPlan, captainLogLibrary, saveCaptainLogPrompt, deleteCaptainLogPrompt, activities, recordActivity, responses, status, submit };
}
