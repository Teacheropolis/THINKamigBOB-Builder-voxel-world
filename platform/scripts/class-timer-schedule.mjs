export const CLASS_TIMER_SCHEDULE_KEY = "thinkamigbob.class-timer-schedule.v1";
export const CLASS_TIMER_OCCURRENCE_KEY = "thinkamigbob.class-timer-schedule-occurrence.v1";
export const CLASS_TIMER_TODAY_KEY = "thinkamigbob.class-timer-today.v1";
export const WEEKDAYS = Object.freeze(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
export const TIMER_SOUND_OPTIONS = Object.freeze(["None", "Bird Chirping", "Cardinal", "Guitar Loop — Time Ending", "Choir — Heavenly Transition", "Drum Loop", "Trap Loop Drums", "Soft Piano", "Custom Upload"]);

const DEFAULT_SCHEDULE = Object.freeze({
  enabled: false,
  weekdays: [...WEEKDAYS],
  startTime: "08:00",
  durationMinutes: 45,
  timeZone: "America/New_York",
  yellowSound: "Bird Chirping",
  redSound: "Cardinal",
  endSound: "Choir — Heavenly Transition",
  pomodoroEnabled: false,
  phases: [
    { key: "starter", name: "Start of Class", startMinute: 0, color: "purple" },
    { key: "main", name: "Main Activity", startMinute: 5, color: "green" },
    { key: "warning", name: "Five Minute Warning", startMinute: 35, color: "yellow" },
    { key: "ending", name: "Clean Up / Exit Activity", startMinute: 40, color: "red" },
  ],
});

function validTimeZone(value) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function sanitize(value) {
  if (!value || typeof value !== "object") return { ...DEFAULT_SCHEDULE, weekdays: [...WEEKDAYS], phases: DEFAULT_SCHEDULE.phases.map((phase) => ({ ...phase })) };
  const weekdays = Array.isArray(value.weekdays) ? WEEKDAYS.filter((day) => value.weekdays.includes(day)) : [];
  const startTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(value.startTime) ? value.startTime : DEFAULT_SCHEDULE.startTime;
  const durationMinutes = Number.isInteger(Number(value.durationMinutes)) && Number(value.durationMinutes) >= 1 && Number(value.durationMinutes) <= 240
    ? Number(value.durationMinutes)
    : DEFAULT_SCHEDULE.durationMinutes;
  const timeZone = validTimeZone(value.timeZone) ? value.timeZone : DEFAULT_SCHEDULE.timeZone;
  const sound = (field) => TIMER_SOUND_OPTIONS.includes(value[field]) ? value[field] : DEFAULT_SCHEDULE[field];
  const customAudio = (field) => typeof value[field] === "string" && /^data:audio\/[a-z0-9.+-]+;base64,/i.test(value[field]) && value[field].length <= 1_100_000 ? value[field] : "";
  const originalPhases = Array.isArray(value.phases) ? value.phases : [];
  const suppliedPhases = originalPhases.length === 3
    ? [originalPhases[0], originalPhases[1], { name: "Five Minute Warning", startMinute: Number(originalPhases[2]?.startMinute) - 5 }, originalPhases[2]]
    : originalPhases;
  const phases = DEFAULT_SCHEDULE.phases.map((fallback, index) => {
    const supplied = suppliedPhases[index] ?? {};
    const name = String(supplied.name ?? fallback.name).trim().slice(0, 40) || fallback.name;
    const startMinute = Number.isInteger(Number(supplied.startMinute)) ? Number(supplied.startMinute) : fallback.startMinute;
    return { ...fallback, name, startMinute };
  });
  const pomodoroEnabled = value.pomodoroEnabled === true;
  const safePhases = pomodoroEnabled && !validPhases({ pomodoroEnabled, phases }, durationMinutes)
    ? recommendedTimerPhases(durationMinutes, phases.map((phase) => phase.name))
    : phases;
  return { enabled: value.enabled === true, weekdays, startTime, durationMinutes, timeZone, yellowSound: sound("yellowSound"), redSound: sound("redSound"), endSound: sound("endSound"), yellowCustomAudio: customAudio("yellowCustomAudio"), redCustomAudio: customAudio("redCustomAudio"), endCustomAudio: customAudio("endCustomAudio"), pomodoroEnabled, phases: safePhases };
}

function validPhases(value, durationMinutes) {
  if (!value?.pomodoroEnabled) return true;
  if (!Array.isArray(value.phases) || value.phases.length !== 4) return false;
  const starts = value.phases.map((phase) => Number(phase.startMinute));
  return starts.every((start) => Number.isInteger(start) && start >= 0 && start < durationMinutes) &&
    starts[0] === 0 && starts[0] < starts[1] && starts[1] < starts[2] && starts[2] < starts[3];
}

export function recommendedTimerPhases(durationMinutes, names = DEFAULT_SCHEDULE.phases.map((phase) => phase.name)) {
  const duration = Math.max(16, Math.min(240, Number(durationMinutes) || DEFAULT_SCHEDULE.durationMinutes));
  return DEFAULT_SCHEDULE.phases.map((phase, index) => ({
    ...phase,
    name: String(names[index] ?? phase.name),
    startMinute: [0, 5, duration - 10, duration - 5][index],
  }));
}

function zonedParts(now, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return parts;
}

export function evaluateTimerPhases(schedule, elapsedSeconds) {
  const clean = sanitize(schedule);
  if (!clean.pomodoroEnabled) return { phase: null, fiveMinuteWarning: false, elapsedPercent: 0, mainStartPercent: 0, warningStartPercent: 0, redStartPercent: 0 };
  const durationSeconds = clean.durationMinutes * 60;
  const boundedElapsed = Math.min(durationSeconds, Math.max(0, Number(elapsedSeconds) || 0));
  const elapsedMinutes = boundedElapsed / 60;
  const phase = [...clean.phases].reverse().find((candidate) => elapsedMinutes >= candidate.startMinute) ?? clean.phases[0];
  return {
    phase,
    elapsedPercent: Math.min(100, Math.max(0, (boundedElapsed / durationSeconds) * 100)),
    mainStartPercent: (clean.phases[1].startMinute / clean.durationMinutes) * 100,
    warningStartPercent: (clean.phases[2].startMinute / clean.durationMinutes) * 100,
    redStartPercent: (clean.phases[3].startMinute / clean.durationMinutes) * 100,
    fiveMinuteWarning: phase.key === "warning",
  };
}

export function evaluateClassTimerSchedule(schedule, now = new Date()) {
  const clean = sanitize(schedule);
  if (!clean.enabled || clean.weekdays.length === 0) return { active: false, reason: "disabled" };
  const parts = zonedParts(now, clean.timeZone);
  if (!clean.weekdays.includes(parts.weekday)) return { active: false, reason: "not-scheduled-today" };
  const [startHour, startMinute] = clean.startTime.split(":").map(Number);
  const currentSeconds = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second);
  const startSeconds = startHour * 3600 + startMinute * 60;
  const elapsedSeconds = currentSeconds - startSeconds;
  const durationSeconds = clean.durationMinutes * 60;
  if (elapsedSeconds < 0) return { active: false, reason: "not-started" };
  if (elapsedSeconds >= durationSeconds) return { active: false, reason: "finished" };
  const phaseState = evaluateTimerPhases(clean, elapsedSeconds);
  return {
    active: true,
    durationMinutes: clean.durationMinutes,
    remainingSeconds: durationSeconds - elapsedSeconds,
    occurrence: `${parts.year}-${parts.month}-${parts.day}T${clean.startTime}@${clean.timeZone}`,
    weekday: parts.weekday,
    ...phaseState,
  };
}

export function createClassTimerSchedule({ storage, sessionStorage, now = () => new Date() } = {}) {
  function read() {
    try {
      const raw = storage?.getItem(CLASS_TIMER_SCHEDULE_KEY);
      return raw ? sanitize(JSON.parse(raw)) : sanitize(DEFAULT_SCHEDULE);
    } catch {
      return sanitize(DEFAULT_SCHEDULE);
    }
  }

  function todayKey(schedule = read()) {
    const parts = zonedParts(now(), schedule.timeZone);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function readTodayOverride() {
    try {
      const raw = sessionStorage?.getItem(CLASS_TIMER_TODAY_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return saved.date === todayKey(saved.schedule) ? sanitize(saved.schedule) : null;
    } catch { return null; }
  }

  function readEffective() {
    return readTodayOverride() ?? read();
  }

  return Object.freeze({
    read,
    readEffective,
    readTodayOverride,
    saveTodayOverride(value) {
      const next = sanitize({ ...read(), ...value });
      if (!validPhases(next, next.durationMinutes)) return { ok: false, reason: "invalid-phases" };
      try { sessionStorage?.setItem(CLASS_TIMER_TODAY_KEY, JSON.stringify({ date: todayKey(next), schedule: next })); }
      catch { return { ok: false, reason: "storage-error" }; }
      try { sessionStorage?.removeItem(CLASS_TIMER_OCCURRENCE_KEY); } catch { /* Best effort. */ }
      return { ok: true, schedule: next };
    },
    save(value) {
      const next = sanitize(value);
      if (value?.enabled && next.weekdays.length === 0) return { ok: false, reason: "weekdays-required", schedule: read() };
      if (value?.enabled && !validTimeZone(value.timeZone)) return { ok: false, reason: "invalid-time-zone", schedule: read() };
      if (!validPhases(value, next.durationMinutes)) return { ok: false, reason: "invalid-phases", schedule: read() };
      try {
        storage?.setItem(CLASS_TIMER_SCHEDULE_KEY, JSON.stringify(next));
      } catch {
        return { ok: false, reason: "storage-error", schedule: read() };
      }
      try { sessionStorage?.removeItem(CLASS_TIMER_OCCURRENCE_KEY); } catch { /* A new page session can still apply the saved schedule. */ }
      return { ok: true, schedule: next };
    },
    activeOccurrence() {
      return evaluateClassTimerSchedule(readEffective(), now());
    },
    wasApplied(occurrence) {
      try { return sessionStorage?.getItem(CLASS_TIMER_OCCURRENCE_KEY) === occurrence; } catch { return false; }
    },
    markApplied(occurrence) {
      try { sessionStorage?.setItem(CLASS_TIMER_OCCURRENCE_KEY, occurrence); } catch { /* Session-only protection is best effort. */ }
    },
  });
}

export function createBrowserClassTimerSchedule(windowRef) {
  let durableStorage;
  let occurrenceStorage;
  try { durableStorage = windowRef?.localStorage; } catch { durableStorage = undefined; }
  try { occurrenceStorage = windowRef?.sessionStorage; } catch { occurrenceStorage = undefined; }
  return createClassTimerSchedule({ storage: durableStorage, sessionStorage: occurrenceStorage });
}
