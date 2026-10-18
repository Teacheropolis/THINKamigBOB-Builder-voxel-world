export const WEEKLY_REFLECTION_STORAGE_KEY = "thinkamigbob.weekly-reflections.v1";
export const CAPTAINS_LOG_PRESET_PROMPTS = Object.freeze([
  { id: "week-1-ask", week: 1, label: "Ask", starting: "What did you notice?", growing: "What surprised you today? What do you wonder?", stretching: "What unexpected result changed your thinking, and what new question did it create?", prompt: "What did you notice?" },
  { id: "week-2-make", week: 2, label: "Make", starting: "What did you make or try?", growing: "What did you try? What happened?", stretching: "Which attempt produced an unexpected result, and what did that result reveal about your design?", prompt: "What did you make or try?" },
  { id: "week-3-improve", week: 3, label: "Improve", starting: "What will you or could you change?", growing: "What will you or could you change next?", stretching: "Which part will you or could you improve, and why is that change the strongest next step?", prompt: "What will you or could you change?" },
  { id: "week-4-grow", week: 4, label: "Grow", starting: "What did you learn?", growing: "What was hard? What did you learn?", stretching: "How did a challenge or uncertainty change your thinking, and how might that learning transfer to future work?", prompt: "What did you learn?" },
  { id: "week-5-evidence", week: 5, label: "Evidence", starting: "What did you see?", growing: "What did you see or measure? What did it show?", stretching: "What evidence reveals a limitation or a new opportunity, and how does it support your conclusion?", prompt: "What did you see?" },
  { id: "week-6-explain", week: 6, label: "Explain", starting: "What happened?", growing: "What was different from your plan? What did you learn?", stretching: "How did the outcome differ from your plan, and what explanation is best supported by your observations?", prompt: "What happened?" },
  { id: "week-7-next", week: 7, label: "Next Step", starting: "What will you try next?", growing: "What went well? What could be even better?", stretching: "What progress did you make, and how could you refine even that success to produce a stronger result?", prompt: "What will you try next?" },
]);
export const CAPTAINS_LOG_QUESTION_LEVELS = Object.freeze(["starting", "growing", "stretching"]);
export const CAPTAINS_LOG_SCHEDULE_OPTIONS = Object.freeze(["Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
export const CAPTAINS_LOG_WEEKDAYS = Object.freeze(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
export const CAPTAINS_LOG_ASSIGNMENT_OPTIONS = Object.freeze([...CAPTAINS_LOG_WEEKDAYS, "Daily student choice"]);
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

export function captainLogResponseLevel(value = {}, { elapsedSeconds = 0 } = {}) {
  const response = String(value.explanation ?? "").trim();
  const words = response.split(/\s+/).filter(Boolean);
  const writingSignals = [
    response && !/^[A-Z0-9“”'"(]/.test(response),
    response && !/[.!?]$/.test(response),
    /\s{2,}/.test(response),
    words.length > 4 && !/\b(?:because|so|but|and|then)\b/i.test(response),
  ].filter(Boolean).length;
  const slower = Number(elapsedSeconds) >= 240;
  if (slower || words.length < 15 || writingSignals >= 2) return "starting";
  const reasoningSignals = [/[.!?].+[.!?]$/s.test(response), /\b(?:because|therefore|evidence|result|showed|compared|however|although)\b/i.test(response), words.length >= 28].filter(Boolean).length;
  return reasoningSignals >= 2 ? "stretching" : "growing";
}

export function captainLogCoachingQuestions(value = {}, { elapsedSeconds = 0 } = {}) {
  const level = captainLogResponseLevel(value, { elapsedSeconds });
  const questions = level === "starting"
    ? ["What happened when you tried it?", value.improved === "Yes" ? "What got better?" : "What could you try next?"]
    : level === "growing"
      ? ["What detail from your work supports your answer?", value.progress === "🏆 Complete" ? "Why did your final idea work?" : value.improved === "Yes" ? "Why did your change make the idea better?" : "What could you change or test next?"]
      : ["Which evidence best supports your explanation, and why?", value.progress === "🏆 Complete" ? "What tradeoff remains in your final idea?" : "How could you compare your next change with this result?", "How could you apply what you learned to a different problem?"];
  const count = level === "starting" && Number(elapsedSeconds) >= 240 ? 1 : questions.length;
  return questions.slice(0, count).map((question, index) => ({ level, dok: level === "starting" ? index + 1 : level === "growing" ? index + 2 : index + 2, question }));
}

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
  return valid ? { activity, promptId: String(value.promptId ?? ""), progress: value.progress, explanation, improved: value.improved, badge: value.badge, help: value.help, helpOther: value.helpOther, rating: value.rating } : null;
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
  const migrateLegacyAutofilledPlans = () => {
    const all = readAll();
    if (all.blankPlannerDefaultsV1) return;
    const plans = { ...(all.captainLogWeekPlans ?? {}) };
    const isAutofilled = (plan) => Boolean(plan?.days) && CAPTAINS_LOG_WEEKDAYS.every((day, index) => {
      const entry = plan.days[day], preset = CAPTAINS_LOG_PRESET_PROMPTS[index];
      return entry?.enabled && entry.promptId === preset.id;
    });
    Object.entries(plans).forEach(([classId, stored]) => {
      if (isAutofilled(stored)) delete plans[classId];
      else if (stored && typeof stored === "object") {
        const next = { ...stored };
        Object.keys(next).forEach((week) => { if (isAutofilled(next[week])) delete next[week]; });
        plans[classId] = next;
      }
    });
    all.captainLogWeekPlans = plans;
    all.blankPlannerDefaultsV1 = true;
    write(all);
  };
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
  const activeCaptainLogWeek = (classId) => Math.max(1, Math.min(7, Number(readAll().captainLogActiveWeeks?.[classId] ?? 1)));
  const setActiveCaptainLogWeek = (classId, week) => {
    const value = Number(week);
    if (!classId || !Number.isInteger(value) || value < 1 || value > 7) return { ok: false };
    const all = readAll();
    const stored = all.captainLogWeekPlans?.[classId]?.[value] ?? all.captainLogWeekPlans?.[classId];
    const enabledCount = stored?.days ? Math.min(CAPTAINS_LOG_WEEKDAYS.filter((day) => stored.days[day]?.enabled).length, Number(stored.required ?? requirement(classId))) : requirement(classId);
    all.captainLogActiveWeeks = { ...(all.captainLogActiveWeeks ?? {}), [classId]: value };
    all.requirements = { ...(all.requirements ?? {}), [classWeek(classId)]: enabledCount };
    write(all);
    return { ok: true, week: value };
  };
  const captainLogPlan = (classId) => {
    migrateLegacyAutofilledPlans();
    const activeWeek = activeCaptainLogWeek(classId);
    const weekly = readAll().captainLogWeekPlans?.[classId]?.[activeWeek] ?? readAll().captainLogWeekPlans?.[classId];
    if (weekly?.days) {
      const today = new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
      const entries = CAPTAINS_LOG_WEEKDAYS.map((slot) => weekly.days[slot]).filter(Boolean);
      return entries.find((entry) => entry.enabled && (entry.assignment ?? entry.schedule) === today)
        ?? entries.find((entry) => entry.enabled && (entry.assignment ?? entry.schedule) === "Daily student choice")
        ?? entries.find((entry) => entry.enabled)
        ?? { prompt: "", promptId: "custom", week: weekly.week ?? 1, schedule: today, required: requirement(classId) };
    }
    const saved = readAll().captainLogPlans?.[classId];
    const fallback = CAPTAINS_LOG_PRESET_PROMPTS[0];
    return saved && typeof saved.prompt === "string" ? saved : { prompt: fallback.prompt, promptId: fallback.id, week: 1, schedule: "Today", required: requirement(classId), updatedAt: null };
  };
  const captainLogWeekPlan = (classId, requestedWeek = activeCaptainLogWeek(classId)) => {
    migrateLegacyAutofilledPlans();
    const week = Math.max(1, Math.min(7, Number(requestedWeek) || 1));
    const stored = readAll().captainLogWeekPlans?.[classId];
    const saved = stored?.[week] ?? (stored?.days && Number(stored.week) === week ? stored : null);
    if (saved?.days) return saved;
    const legacy = readAll().captainLogPlans?.[classId];
    const days = Object.fromEntries(CAPTAINS_LOG_WEEKDAYS.map((day, index) => {
      const preset = CAPTAINS_LOG_PRESET_PROMPTS[index];
      return [day, legacy
        ? { enabled: day === legacy.schedule || legacy.schedule === "Today" && index === 0, promptId: legacy.promptId ?? preset.id, prompt: legacy.prompt ?? preset.prompt, assignment: day }
        : { enabled: false, promptId: "", prompt: "", assignment: "" }];
    }));
    return { week, days, required: legacy?.required ?? 0 };
  };
  const saveCaptainLogWeekPlan = (classId, value) => {
    const week = Number(value?.week), days = {};
    if (!classId || !Number.isInteger(week) || week < 1 || week > 7) return { ok: false };
    for (const day of CAPTAINS_LOG_WEEKDAYS) {
      const entry = value?.days?.[day] ?? {}, prompt = String(entry.prompt ?? "").trim();
      if (entry.enabled && (prompt.length < 5 || prompt.length > 240)) return { ok: false, reason: "missing-prompt" };
      const assignment = CAPTAINS_LOG_ASSIGNMENT_OPTIONS.includes(entry.assignment) ? entry.assignment : day;
      days[day] = { enabled: Boolean(entry.enabled), promptId: String(entry.promptId ?? "custom"), prompt, assignment };
    }
    const enabledCount = CAPTAINS_LOG_WEEKDAYS.filter((day) => days[day].enabled).length;
    const assignedCount = CAPTAINS_LOG_WEEKDAYS.filter((day) => days[day].enabled && days[day].assignment !== "Daily student choice").length;
    const required = Number(value?.required ?? enabledCount);
    if (!Number.isInteger(required) || required < 0 || required > enabledCount) return { ok: false, reason: "goal-exceeds-prompts" };
    if (required < assignedCount) return { ok: false, reason: "goal-below-assigned" };
    const all = readAll(), plan = { week, days, required, updatedAt: new Date(now()).toISOString() };
    const classPlans = all.captainLogWeekPlans?.[classId]?.days ? { [all.captainLogWeekPlans[classId].week ?? 1]: all.captainLogWeekPlans[classId] } : { ...(all.captainLogWeekPlans?.[classId] ?? {}) };
    all.captainLogWeekPlans = { ...(all.captainLogWeekPlans ?? {}), [classId]: { ...classPlans, [week]: plan } };
    if (activeCaptainLogWeek(classId) === week) all.requirements = { ...(all.requirements ?? {}), [classWeek(classId)]: required };
    write(all);
    return { ok: true, plan };
  };
  const clearCaptainLogWeekPlan = (classId, requestedWeek = activeCaptainLogWeek(classId)) => {
    const week = Math.max(1, Math.min(7, Number(requestedWeek) || 1));
    if (!classId) return { ok: false };
    const all = readAll();
    const stored = all.captainLogWeekPlans?.[classId];
    if (stored?.days) delete all.captainLogWeekPlans[classId];
    else if (stored) {
      const next = { ...stored };
      delete next[week];
      all.captainLogWeekPlans = { ...(all.captainLogWeekPlans ?? {}), [classId]: next };
    }
    if (activeCaptainLogWeek(classId) === week) all.requirements = { ...(all.requirements ?? {}), [classWeek(classId)]: 0 };
    write(all);
    return { ok: true, week };
  };
  const copyCaptainLogWeekPlan = (sourceClassId, targetClassIds, selectedDays = CAPTAINS_LOG_WEEKDAYS, requestedWeek = activeCaptainLogWeek(sourceClassId)) => {
    const sourceWeek = Math.max(1, Math.min(7, Number(requestedWeek) || 1)), source = captainLogWeekPlan(sourceClassId, sourceWeek), targets = [...new Set(targetClassIds)].filter((id) => id && id !== sourceClassId);
    const chosen = selectedDays.filter((day) => CAPTAINS_LOG_WEEKDAYS.includes(day));
    if (!sourceClassId || !targets.length || !chosen.length) return { ok: false, copied: 0 };
    const all = readAll(); all.captainLogWeekPlans = { ...(all.captainLogWeekPlans ?? {}) }; all.requirements = { ...(all.requirements ?? {}) };
    targets.forEach((targetId) => {
      const existing = captainLogWeekPlan(targetId, sourceWeek), days = { ...existing.days };
      chosen.forEach((day) => { days[day] = { ...source.days[day] }; });
      const targetPlans = all.captainLogWeekPlans[targetId]?.days ? { [all.captainLogWeekPlans[targetId].week ?? 1]: all.captainLogWeekPlans[targetId] } : { ...(all.captainLogWeekPlans[targetId] ?? {}) };
      all.captainLogWeekPlans[targetId] = { ...targetPlans, [sourceWeek]: { week: sourceWeek, days, required: Math.min(source.required ?? chosen.length, CAPTAINS_LOG_WEEKDAYS.filter((day) => days[day].enabled).length), updatedAt: new Date(now()).toISOString() } };
      if (activeCaptainLogWeek(targetId) === sourceWeek) all.requirements[classWeek(targetId)] = all.captainLogWeekPlans[targetId][sourceWeek].required;
    });
    write(all); return { ok: true, copied: targets.length };
  };
  const captainLogAvailableToday = (classId) => {
    const activeWeek = activeCaptainLogWeek(classId), weekly = readAll().captainLogWeekPlans?.[classId]?.[activeWeek] ?? readAll().captainLogWeekPlans?.[classId];
    if (weekly?.days) {
      const today = new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
      return CAPTAINS_LOG_WEEKDAYS.some((slot) => {
        const entry = weekly.days[slot], assignment = entry?.assignment ?? slot;
        return Boolean(entry?.enabled && (assignment === today || assignment === "Daily student choice"));
      });
    }
    const schedule = captainLogPlan(classId).schedule;
    return schedule === "Today" || schedule === new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
  };
  const captainLogChoices = (classId, studentId) => {
    const activeWeek = activeCaptainLogWeek(classId), weekly = readAll().captainLogWeekPlans?.[classId]?.[activeWeek] ?? readAll().captainLogWeekPlans?.[classId];
    if (!weekly?.days) return [captainLogPlan(classId)];
    const today = new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
    const usedIds = new Set(responses(classId, studentId).map((item) => item.promptId).filter(Boolean));
    const visits = new Set(readAll().studentVisits?.[`${classWeek(classId)}|${studentId}`] ?? []);
    const todayIndex = CAPTAINS_LOG_WEEKDAYS.indexOf(today);
    return CAPTAINS_LOG_WEEKDAYS.map((slot) => ({ slot, ...weekly.days[slot] })).filter((entry) => {
      const assignment = entry?.assignment ?? entry.slot;
      const assignedDue = assignment !== "Daily student choice" && visits.has(assignment) && CAPTAINS_LOG_WEEKDAYS.indexOf(assignment) <= todayIndex;
      return entry?.enabled && (assignedDue || assignment === "Daily student choice") && !usedIds.has(entry.promptId);
    });
  };
  const recordStudentVisit = (classId, studentId) => {
    if (!classId || !studentId) return { ok: false };
    const today = new Date(now()).toLocaleDateString("en-US", { weekday: "long" });
    if (!CAPTAINS_LOG_WEEKDAYS.includes(today)) return { ok: true, days: [] };
    const all = readAll(), key = `${classWeek(classId)}|${studentId}`;
    const days = [...new Set([...(all.studentVisits?.[key] ?? []), today])];
    all.studentVisits = { ...(all.studentVisits ?? {}), [key]: days };
    write(all);
    return { ok: true, days };
  };
  const captainLogObligations = (classId, studentId) => {
    const plan = captainLogWeekPlan(classId), completedIds = new Set(responses(classId, studentId).map((item) => item.promptId).filter(Boolean));
    const visits = new Set(readAll().studentVisits?.[`${classWeek(classId)}|${studentId}`] ?? []);
    const today = new Date(now()).toLocaleDateString("en-US", { weekday: "long" }), todayIndex = CAPTAINS_LOG_WEEKDAYS.indexOf(today);
    const entries = CAPTAINS_LOG_WEEKDAYS.map((slot) => ({ slot, ...plan.days[slot] })).filter((entry) => entry.enabled);
    const assigned = entries.filter((entry) => (entry.assignment ?? entry.slot) !== "Daily student choice");
    const choices = entries.filter((entry) => (entry.assignment ?? entry.slot) === "Daily student choice");
    const overdueAssigned = assigned.filter((entry) => visits.has(entry.assignment ?? entry.slot) && CAPTAINS_LOG_WEEKDAYS.indexOf(entry.assignment ?? entry.slot) <= todayIndex && !completedIds.has(entry.promptId));
    const choiceRequired = Math.max(0, Number(plan.required ?? requirement(classId)) - assigned.length);
    const choiceCompleted = choices.filter((entry) => completedIds.has(entry.promptId)).length;
    const fridayChoiceDue = today === "Friday" ? Math.max(0, choiceRequired - choiceCompleted) : 0;
    return { due: overdueAssigned.length + fridayChoiceDue > 0, today, assigned: overdueAssigned, choiceDue: fridayChoiceDue, remaining: Math.max(0, Number(plan.required ?? requirement(classId)) - responses(classId, studentId).length) };
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
  const studentQuestionLevel = (classId, studentId) => {
    const saved = readAll().studentQuestionLevels?.[`${classId}|${studentId}`]?.level;
    return CAPTAINS_LOG_QUESTION_LEVELS.includes(saved) ? saved : "starting";
  };
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
    const followUps = Array.isArray(value.followUps) ? value.followUps.map((item) => ({ dok: Number(item.dok), question: String(item.question ?? "").trim(), answer: String(item.answer ?? "").trim() })).filter((item) => item.question && item.answer.length >= 5) : [];
    if (!followUps.length) return { ok: false };
    all.responses = { ...(all.responses ?? {}), [key]: [...list, { ...response, followUps, submittedAt: new Date(now()).toISOString() }] };
    const levelKey = `${classId}|${studentId}`, currentLevelState = all.studentQuestionLevels?.[levelKey] ?? { level: "starting", readinessStreak: 0 };
    const currentIndex = Math.max(0, CAPTAINS_LOG_QUESTION_LEVELS.indexOf(currentLevelState.level));
    const observedIndex = CAPTAINS_LOG_QUESTION_LEVELS.indexOf(captainLogResponseLevel(value, { elapsedSeconds: Number(value.elapsedSeconds ?? 0) }));
    const readinessStreak = observedIndex > currentIndex ? Number(currentLevelState.readinessStreak ?? 0) + 1 : 0;
    const nextIndex = readinessStreak >= 2 ? Math.min(CAPTAINS_LOG_QUESTION_LEVELS.length - 1, currentIndex + 1) : currentIndex;
    all.studentQuestionLevels = { ...(all.studentQuestionLevels ?? {}), [levelKey]: { level: CAPTAINS_LOG_QUESTION_LEVELS[nextIndex], readinessStreak: nextIndex > currentIndex ? 0 : readinessStreak, updatedAt: new Date(now()).toISOString() } };
    write(all);
    return { ok: true, status: status(classId, studentId) };
  };
  return { requirement, setRequirement, activeCaptainLogWeek, setActiveCaptainLogWeek, captainLogPlan, captainLogChoices, captainLogObligations, recordStudentVisit, captainLogWeekPlan, saveCaptainLogWeekPlan, clearCaptainLogWeekPlan, copyCaptainLogWeekPlan, captainLogAvailableToday, saveCaptainLogPlan, captainLogLibrary, saveCaptainLogPrompt, deleteCaptainLogPrompt, activities, recordActivity, responses, studentQuestionLevel, status, submit };
}
