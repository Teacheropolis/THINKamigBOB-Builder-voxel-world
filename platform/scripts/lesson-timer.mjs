export const LESSON_TIMER_SESSION_KEY = "thinkamigbob.pb002b.lesson-timer.v1";

export const LESSON_TIMER_STATES = Object.freeze({
  READY: "Ready",
  RUNNING: "Running",
  PAUSED: "Paused",
  COMPLETE: "Complete",
});

export const DEFAULT_LESSON_MINUTES = 45;
export const MIN_LESSON_MINUTES = 1;
export const MAX_LESSON_MINUTES = 240;
export const LESSON_TIMER_ADJUSTMENT_SECONDS = 60;

const MAX_LESSON_SECONDS = MAX_LESSON_MINUTES * 60;

function createReadyState(durationSeconds = DEFAULT_LESSON_MINUTES * 60) {
  return {
    version: 1,
    status: LESSON_TIMER_STATES.READY,
    durationSeconds,
    remainingSeconds: durationSeconds,
    endsAt: null,
  };
}

function validSeconds(value) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_LESSON_SECONDS;
}

function sanitizeState(value) {
  if (!value || typeof value !== "object" || value.version !== 1) return createReadyState();
  const durationSeconds = validSeconds(value.durationSeconds) && value.durationSeconds > 0
    ? value.durationSeconds
    : DEFAULT_LESSON_MINUTES * 60;
  const remainingSeconds = validSeconds(value.remainingSeconds)
    ? value.remainingSeconds
    : durationSeconds;

  if (value.status === LESSON_TIMER_STATES.RUNNING) {
    if (!Number.isFinite(value.endsAt)) return createReadyState(durationSeconds);
    return {
      version: 1,
      status: LESSON_TIMER_STATES.RUNNING,
      durationSeconds,
      remainingSeconds,
      endsAt: value.endsAt,
    };
  }

  if (value.status === LESSON_TIMER_STATES.PAUSED && remainingSeconds > 0) {
    return {
      version: 1,
      status: LESSON_TIMER_STATES.PAUSED,
      durationSeconds,
      remainingSeconds,
      endsAt: null,
    };
  }

  if (value.status === LESSON_TIMER_STATES.COMPLETE || remainingSeconds === 0) {
    return {
      version: 1,
      status: LESSON_TIMER_STATES.COMPLETE,
      durationSeconds,
      remainingSeconds: 0,
      endsAt: null,
    };
  }

  return createReadyState(durationSeconds);
}

export function formatLessonTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function createLessonTimer({ storage, now = () => Date.now() } = {}) {
  let memoryState = createReadyState();

  function persist(nextState) {
    const cleanState = sanitizeState(nextState);
    memoryState = cleanState;
    try {
      storage?.setItem(LESSON_TIMER_SESSION_KEY, JSON.stringify(cleanState));
    } catch {
      // In-memory state remains available for this page load.
    }
    return { ...cleanState };
  }

  function storedState() {
    try {
      const raw = storage?.getItem(LESSON_TIMER_SESSION_KEY);
      if (raw) return sanitizeState(JSON.parse(raw));
    } catch {
      // Fall through to sanitized in-memory state.
    }
    return sanitizeState(memoryState);
  }

  function read() {
    const current = storedState();
    if (current.status !== LESSON_TIMER_STATES.RUNNING || current.endsAt === null) return current;
    const remainingSeconds = Math.max(0, Math.ceil((current.endsAt - now()) / 1000));
    if (remainingSeconds > MAX_LESSON_SECONDS) {
      return persist(createReadyState(current.durationSeconds));
    }
    if (remainingSeconds === 0) {
      return persist({
        ...current,
        status: LESSON_TIMER_STATES.COMPLETE,
        remainingSeconds: 0,
        endsAt: null,
      });
    }
    return { ...current, remainingSeconds };
  }

  return Object.freeze({
    read,
    setDuration(minutes) {
      const numericMinutes = Number(minutes);
      if (!Number.isInteger(numericMinutes) || numericMinutes < MIN_LESSON_MINUTES || numericMinutes > MAX_LESSON_MINUTES) {
        return { ok: false, state: read() };
      }
      const durationSeconds = numericMinutes * 60;
      return { ok: true, state: persist(createReadyState(durationSeconds)) };
    },
    start() {
      const current = read();
      if (current.status !== LESSON_TIMER_STATES.READY || current.remainingSeconds <= 0) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.RUNNING, endsAt: now() + current.remainingSeconds * 1000 });
    },
    pause() {
      const current = read();
      if (current.status !== LESSON_TIMER_STATES.RUNNING) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.PAUSED, endsAt: null });
    },
    resume() {
      const current = read();
      if (current.status !== LESSON_TIMER_STATES.PAUSED || current.remainingSeconds <= 0) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.RUNNING, endsAt: now() + current.remainingSeconds * 1000 });
    },
    addMinute() {
      const current = read();
      const adjustable = current.status === LESSON_TIMER_STATES.RUNNING ||
        current.status === LESSON_TIMER_STATES.PAUSED;
      if (!adjustable || current.remainingSeconds >
          MAX_LESSON_SECONDS - LESSON_TIMER_ADJUSTMENT_SECONDS) return current;
      return persist({
        ...current,
        remainingSeconds: current.remainingSeconds + LESSON_TIMER_ADJUSTMENT_SECONDS,
        endsAt: current.status === LESSON_TIMER_STATES.RUNNING
          ? current.endsAt + LESSON_TIMER_ADJUSTMENT_SECONDS * 1000
          : null,
      });
    },
    subtractMinute() {
      const current = read();
      const adjustable = current.status === LESSON_TIMER_STATES.RUNNING ||
        current.status === LESSON_TIMER_STATES.PAUSED;
      if (!adjustable) return current;
      if (current.remainingSeconds <= LESSON_TIMER_ADJUSTMENT_SECONDS) {
        return persist({
          ...current,
          status: LESSON_TIMER_STATES.COMPLETE,
          remainingSeconds: 0,
          endsAt: null,
        });
      }
      return persist({
        ...current,
        remainingSeconds: current.remainingSeconds - LESSON_TIMER_ADJUSTMENT_SECONDS,
        endsAt: current.status === LESSON_TIMER_STATES.RUNNING
          ? current.endsAt - LESSON_TIMER_ADJUSTMENT_SECONDS * 1000
          : null,
      });
    },
    reset() {
      const current = read();
      return persist(createReadyState(current.durationSeconds));
    },
    end() {
      const current = read();
      if (current.status === LESSON_TIMER_STATES.COMPLETE) return current;
      return persist({ ...current, status: LESSON_TIMER_STATES.COMPLETE, remainingSeconds: 0, endsAt: null });
    },
    clear() {
      memoryState = createReadyState();
      try {
        storage?.removeItem(LESSON_TIMER_SESSION_KEY);
      } catch {
        // In-memory state is still reset for this page load.
      }
      return { ...memoryState };
    },
  });
}
