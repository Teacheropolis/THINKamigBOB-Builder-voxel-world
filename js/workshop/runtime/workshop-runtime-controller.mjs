import {
  CANONICAL_EVENTS,
  createOneShotEventLedger,
  normalizeSemanticAction,
  validateTransition,
} from "../contracts/workshop-state-contract.mjs";

export const WORKSHOP_UI_DRAWER_MAP = Object.freeze({
  "colors-materials": "D3_MATERIALS",
  "parts-objects": "D4_COMPONENTS",
});

const INITIAL_STATE = Object.freeze({
  workshop: "OFF",
  projector: "POWERED_OFF",
  table: "POWERED_OFF",
  boardMechanical: "RETRACTED",
  boardPower: "POWERED_OFF",
  boardApplication: "NONE",
  chest: "PARKED",
  measurement: "IDLE",
});

const freezeResult = (value) => Object.freeze(value);

export function createWorkshopRuntimeController({ drivers = {}, emit = () => {} } = {}) {
  const state = { ...INITIAL_STATE };
  const drawerStates = Object.fromEntries(
    ["D1_MEASURE", "D2_BUILD", "D3_MATERIALS", "D4_COMPONENTS", "D5_NOTEBOOK", "D6_UTILITY"]
      .map((id) => [id, "CLOSED"]),
  );
  const ledger = createOneShotEventLedger();
  let transitionSerial = 0;
  let activeTransition = null;
  let activeDrawer = null;
  let busy = false;

  const nextTransition = (domain, from, to) => ({
    id: `ws005-${++transitionSerial}`,
    domain,
    from,
    to,
    cancelled: false,
  });

  const publish = (transition, eventName, detail = {}) => {
    if (transition.cancelled || !CANONICAL_EVENTS) return false;
    if (!ledger.claim(transition.id, eventName)) return false;
    emit(eventName, Object.freeze({ transitionId: transition.id, ...detail }));
    return true;
  };

  const reject = (code, reason) => freezeResult({ ok: false, code, reason });
  const accept = (transition, code = "ACCEPTED") => freezeResult({
    ok: true,
    code,
    transitionId: transition.id,
  });

  const finishPowerOn = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    state.projector = "FULLY_ACTIVE";
    state.table = "FULLY_ACTIVE";
    state.boardMechanical = "EXTENDED";
    state.boardPower = "READY";
    state.boardApplication = "MEASUREMENT_ASSISTANT";
    state.chest = "DEPLOYED";
    state.measurement = "IDLE";
    const result = validateTransition("workshop", state.workshop, "READY", {
      startupSequenceComplete: true,
    });
    if (!result.ok) return false;
    state.workshop = "READY";
    busy = false;
    activeTransition = null;
    publish(transition, "workspace:projection-stable", { timingCompliance: "legacy-combined-not-bible-compliant" });
    publish(transition, "workshop:ready", { timingCompliance: "legacy-combined-not-bible-compliant" });
    return true;
  };

  const finishProjectorPowerOn = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERING_ON") return false;
    const result = validateTransition("projector", state.projector, "POWERED_ON");
    if (!result.ok) return false;
    state.projector = "POWERED_ON";
    publish(transition, "projector:powered-on");
    drivers.continueLegacyStartup?.({
      transitionId: transition.id,
      complete: () => finishPowerOn(transition),
    });
    return true;
  };

  const beginProjectorPowerOn = (transition, context) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERED_OFF") return false;
    const result = validateTransition("projector", state.projector, "POWERING_ON", {
      workshopState: state.workshop,
      assetReady: context.assetsLoaded === true,
      shutdownLock: state.workshop === "SHUTTING_DOWN",
    });
    if (!result.ok) return false;
    state.projector = "POWERING_ON";
    return true;
  };

  const finishPowerOff = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    Object.keys(drawerStates).forEach((id) => { drawerStates[id] = "CLOSED"; });
    activeDrawer = null;
    state.chest = "PARKED";
    state.boardApplication = "NONE";
    state.boardPower = "POWERED_OFF";
    state.boardMechanical = "RETRACTED";
    state.table = "POWERED_OFF";
    state.projector = "POWERED_OFF";
    const result = validateTransition("workshop", state.workshop, "OFF", {
      shutdownSequenceComplete: true,
    });
    if (!result.ok) return false;
    state.workshop = "OFF";
    busy = false;
    activeTransition = null;
    publish(transition, "workshop:off", { timingCompliance: "legacy-combined-not-bible-compliant" });
    return true;
  };

  const requestPowerOn = (context) => {
    const result = validateTransition("workshop", state.workshop, "STARTING", {
      assetsLoaded: context.assetsLoaded === true,
      allDrawersClosed: Object.values(drawerStates).every((value) => value === "CLOSED"),
      chestParked: state.chest === "PARKED",
      shutdownInProgress: state.workshop === "SHUTTING_DOWN",
    });
    if (!result.ok) return reject(result.code, result.reason);
    if (result.code === "IDEMPOTENT") return freezeResult({ ok: true, code: result.code });
    const transition = nextTransition("workshop", state.workshop, "STARTING");
    activeTransition = transition;
    state.workshop = "STARTING";
    busy = true;
    publish(transition, "workshop:startup-begun");
    drivers.powerOnProjector?.({
      transitionId: transition.id,
      begin: () => beginProjectorPowerOn(transition, context),
      complete: () => finishProjectorPowerOn(transition),
    });
    return accept(transition);
  };

  const requestPowerOff = (context) => {
    if (state.workshop === "OFF") return freezeResult({ ok: true, code: "IDEMPOTENT" });
    const result = validateTransition("workshop", state.workshop, "SHUTTING_DOWN", {
      applicationStateSecured: context.applicationStateSecured !== false,
    });
    if (!result.ok) return reject(result.code, result.reason);
    if (activeTransition) activeTransition.cancelled = true;
    const transition = nextTransition("workshop", state.workshop, "SHUTTING_DOWN");
    activeTransition = transition;
    state.workshop = "SHUTTING_DOWN";
    busy = true;
    publish(transition, "workshop:shutdown-begun");
    drivers.exitWorkshop?.({ transitionId: transition.id, complete: () => finishPowerOff(transition) });
    return accept(transition);
  };

  const finishDrawer = (transition, logicalId, targetState, eventName) => {
    if (transition.cancelled) return false;
    const result = validateTransition("drawer", drawerStates[logicalId], targetState, {
      chestDeployed: state.chest === "DEPLOYED",
      otherDrawerActive: activeDrawer !== null && activeDrawer !== logicalId,
    });
    if (!result.ok) return false;
    drawerStates[logicalId] = targetState;
    if (targetState === "CLOSED") activeDrawer = null;
    busy = false;
    publish(transition, eventName, { drawerId: logicalId });
    return true;
  };

  const requestDrawer = (action, payload) => {
    if (state.workshop !== "READY") return reject("WORKSHOP_NOT_READY", "Drawers require Workshop READY.");
    const logicalId = payload.drawerId || WORKSHOP_UI_DRAWER_MAP[payload.uiDrawer];
    if (!logicalId) return reject("UNMAPPED_DRAWER", `No approved WS-002 mapping for ${payload.uiDrawer || "drawer"}.`);
    if (!Object.hasOwn(drawerStates, logicalId)) return reject("UNKNOWN_DRAWER", `Unknown drawer: ${logicalId}`);
    const opening = action === "OPEN_DRAWER";
    if (opening && activeDrawer && activeDrawer !== logicalId) {
      return reject("DRAWER_CLOSE_REQUIRED", `Close ${activeDrawer} before opening ${logicalId}.`);
    }
    const target = opening ? "OPENING" : "CLOSING";
    const result = validateTransition("drawer", drawerStates[logicalId], target, {
      chestDeployed: state.chest === "DEPLOYED",
      otherDrawerActive: opening && activeDrawer !== null && activeDrawer !== logicalId,
      uncommittedOperationResolved: payload.uncommittedOperationResolved !== false,
    });
    if (!result.ok) return reject(result.code, result.reason);
    if (result.code === "IDEMPOTENT") return freezeResult({ ok: true, code: result.code });

    const transition = nextTransition("drawer", drawerStates[logicalId], target);
    drawerStates[logicalId] = target;
    busy = true;
    if (opening) activeDrawer = logicalId;
    const driver = opening ? drivers.openDrawer : drivers.closeDrawer;
    driver?.({
      transitionId: transition.id,
      logicalId,
      uiDrawer: payload.uiDrawer,
      complete: () => finishDrawer(
        transition,
        logicalId,
        opening ? "OPEN" : "CLOSED",
        opening ? "drawer:opened" : "drawer:closed",
      ),
    });
    return accept(transition);
  };

  const requestMeasurement = (action, payload) => {
    const target = action === "SELECT_MEASURABLE_OBJECT" ? "SELECTED_OBJECT" : "IDLE";
    const result = validateTransition("measurement", state.measurement, target, {
      workshopReady: state.workshop === "READY",
      measurementAppActive: state.boardApplication === "MEASUREMENT_ASSISTANT",
      objectMeasurable: payload.objectMeasurable === true,
    });
    if (!result.ok) return reject(result.code, result.reason);
    if (result.code === "IDEMPOTENT") return freezeResult({ ok: true, code: result.code });
    const transition = nextTransition("measurement", state.measurement, target);
    state.measurement = target;
    drivers.renderMeasurement?.({ state: target, payload });
    publish(
      transition,
      target === "SELECTED_OBJECT" ? "measurement:object-selected" : "measurement:selection-cleared",
      { objectId: payload.objectId },
    );
    return accept(transition);
  };

  return Object.freeze({
    request(command) {
      let normalized;
      try {
        normalized = normalizeSemanticAction(command);
      } catch (error) {
        return reject("INVALID_ACTION", error.message);
      }
      const context = command.context || {};
      if (normalized.action === "REQUEST_POWER_ON") return requestPowerOn(context);
      if (normalized.action === "REQUEST_POWER_OFF" || normalized.action === "CANCEL_TRANSITION") return requestPowerOff(context);
      if (normalized.action === "OPEN_DRAWER" || normalized.action === "CLOSE_DRAWER") return requestDrawer(normalized.action, normalized.payload);
      if (normalized.action === "SELECT_MEASURABLE_OBJECT" || normalized.action === "CLEAR_SELECTION") return requestMeasurement(normalized.action, normalized.payload);
      return reject("UNIMPLEMENTED_ACTION", `${normalized.action} is not wired in WS-005.`);
    },
    getSnapshot() {
      return freezeResult({
        ...state,
        drawers: freezeResult({ ...drawerStates }),
        activeDrawer,
        busy,
        disabled: freezeResult({
          powerOn: state.workshop !== "OFF",
          powerOff: state.workshop === "OFF",
          drawers: state.workshop !== "READY" || state.chest !== "DEPLOYED" || busy,
          measurement: state.workshop !== "READY" || state.boardApplication !== "MEASUREMENT_ASSISTANT",
        }),
        activeTransitionId: activeTransition?.id || null,
        timingCompliance: "legacy-combined-not-bible-compliant",
      });
    },
  });
}
