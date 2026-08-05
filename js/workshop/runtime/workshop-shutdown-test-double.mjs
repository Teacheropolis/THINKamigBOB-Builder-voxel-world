export const WORKSHOP_SHUTDOWN_PLACEHOLDER_TIMING = Object.freeze({
  drawers: 200,
  smartBoard: 400,
  reducedMotion: 150,
});

const freezeResult = (value) => Object.freeze(value);

export function createWorkshopShutdownTestDouble({
  schedule = (callback, delay) => globalThis.setTimeout(callback, delay),
  cancelSchedule = (handle) => globalThis.clearTimeout(handle),
  reducedMotion = () => false,
} = {}) {
  let serial = 0;
  let active = null;

  const cancel = () => {
    if (!active) return freezeResult({ ok: true, code: "IDEMPOTENT" });
    active.cancelled = true;
    if (active.handle !== null) cancelSchedule(active.handle);
    active = null;
    return freezeResult({ ok: true, code: "CANCELLED" });
  };

  const run = (stage, nominalDuration, { transitionId, complete = () => true } = {}) => {
    if (typeof transitionId !== "string" || transitionId.length === 0) {
      return freezeResult({ ok: false, code: "INVALID_TRANSITION_ID" });
    }
    if (active && active.transitionId === transitionId && active.stage === stage) {
      return freezeResult({ ok: true, code: "IDEMPOTENT", duration: active.duration });
    }
    cancel();
    const duration = reducedMotion()
      ? Math.min(WORKSHOP_SHUTDOWN_PLACEHOLDER_TIMING.reducedMotion, nominalDuration)
      : nominalDuration;
    const entry = {
      token: ++serial,
      transitionId,
      stage,
      duration,
      cancelled: false,
      completed: false,
      handle: null,
    };
    active = entry;
    entry.handle = schedule(() => {
      if (active !== entry || entry.cancelled || entry.completed) return false;
      entry.completed = true;
      active = null;
      return complete();
    }, duration);
    return freezeResult({ ok: true, code: "ACCEPTED", duration, token: entry.token });
  };

  return Object.freeze({
    secureDrawers(options) {
      return run("drawers", WORKSHOP_SHUTDOWN_PLACEHOLDER_TIMING.drawers, options);
    },
    retractSmartBoard(options) {
      return run("smartboard", WORKSHOP_SHUTDOWN_PLACEHOLDER_TIMING.smartBoard, options);
    },
    cancel,
    getSnapshot() {
      return freezeResult({
        active: active ? active.stage : null,
        transitionId: active?.transitionId || null,
        duration: active?.duration || 0,
      });
    },
  });
}
