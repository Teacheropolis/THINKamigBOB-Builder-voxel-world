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
    if (state.projector !== "FULLY_ACTIVE" || transition.tableProjectionStable !== true) return false;
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
    publish(transition, "workshop:ready", { timingCompliance: "ws009-projector-optics-with-legacy-table-compatibility" });
    return true;
  };

  const finishProjectorActive = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "PROJECTION_STARTING" || transition.tableProjectionStable !== true) return false;
    const result = validateTransition("projector", state.projector, "FULLY_ACTIVE", {
      tableProjectionStable: true,
    });
    if (!result.ok) return false;
    state.projector = "FULLY_ACTIVE";
    publish(transition, "projector:active");
    return finishPowerOn(transition);
  };

  const beginProjectorActiveSettle = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (transition.projectorProjectionStarted !== true || transition.tableProjectionStable !== true) return false;
    if (transition.projectorActiveSettleRequested === true) return false;
    transition.projectorActiveSettleRequested = true;
    drivers.settleProjectorProjection?.({
      transitionId: transition.id,
      complete: () => finishProjectorActive(transition),
    });
    return true;
  };

  const finishProjectorProjectionStart = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "PROJECTION_STARTING" || transition.projectorProjectionStarted === true) return false;
    transition.projectorProjectionStarted = true;
    publish(transition, "projector:projection-started");
    commitLegacyTableStable(transition);
    beginProjectorActiveSettle(transition);
    return true;
  };

  const commitLegacyTableStable = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (transition.legacyTableStableSignal !== true || transition.projectorProjectionStarted !== true) return false;
    if (transition.tableProjectionStable === true) return false;
    const result = validateTransition("table", state.table, "FULLY_ACTIVE", {
      tableProjectionStable: true,
    });
    if (!result.ok) return false;
    transition.tableProjectionStable = true;
    state.table = "FULLY_ACTIVE";
    publish(transition, "workspace:projection-stable", {
      timingCompliance: "legacy-table-compatibility-signal",
    });
    beginProjectorActiveSettle(transition);
    return true;
  };

  const markLegacyTableStable = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (transition.legacyTableStableSignal === true) return false;
    transition.legacyTableStableSignal = true;
    commitLegacyTableStable(transition);
    return true;
  };

  const beginProjectorProjection = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERED_ON" || state.table !== "POWERED_ON") return false;
    const projectorResult = validateTransition("projector", state.projector, "PROJECTION_STARTING", {
      tableEmittersReady: true,
    });
    const tableResult = validateTransition("table", state.table, "PROJECTION_STARTING", {
      projectorReady: true,
    });
    if (!projectorResult.ok || !tableResult.ok) return false;
    state.projector = "PROJECTION_STARTING";
    state.table = "PROJECTION_STARTING";
    drivers.startProjectorProjection?.({
      transitionId: transition.id,
      complete: () => finishProjectorProjectionStart(transition),
    });
    drivers.startLegacyTableProjection?.({
      transitionId: transition.id,
      stable: () => markLegacyTableStable(transition),
    });
    return true;
  };

  const finishTablePowerOn = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERED_ON") return false;
    if (state.table === "POWERING_ON") {
      const result = validateTransition("table", state.table, "POWERED_ON");
      if (!result.ok) return false;
      state.table = "POWERED_ON";
    }
    if (state.table !== "POWERED_ON") return false;
    if (!publish(transition, "table:powered-on")) return false;
    return beginProjectorProjection(transition);
  };

  const normalizeTableToPoweredOn = () => {
    if (state.table === "FULLY_ACTIVE") {
      const lowering = validateTransition("table", state.table, "PROJECTION_STARTING");
      if (!lowering.ok) return false;
      state.table = "PROJECTION_STARTING";
    }
    if (state.table === "PROJECTION_STARTING") {
      const standby = validateTransition("table", state.table, "POWERED_ON");
      if (!standby.ok) return false;
      state.table = "POWERED_ON";
    }
    return state.table === "POWERED_ON";
  };

  const beginTablePowerOn = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERED_ON") return false;
    if (state.table === "POWERED_OFF") {
      const result = validateTransition("table", state.table, "POWERING_ON", {
        projectorPoweredOn: true,
      });
      if (!result.ok) return false;
      state.table = "POWERING_ON";
    } else if (state.table !== "POWERING_ON" && !normalizeTableToPoweredOn()) {
      return false;
    }
    drivers.powerOnTable?.({
      transitionId: transition.id,
      begin: () => activeTransition === transition && !transition.cancelled,
      complete: () => finishTablePowerOn(transition),
    });
    return true;
  };

  const finishProjectorPowerOn = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERING_ON") return false;
    const result = validateTransition("projector", state.projector, "POWERED_ON");
    if (!result.ok) return false;
    state.projector = "POWERED_ON";
    publish(transition, "projector:powered-on");
    return beginTablePowerOn(transition);
  };

  const continueFromPoweredProjector = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERED_ON") return false;
    return beginTablePowerOn(transition);
  };

  const finishShutdownReversal = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector === "POWERING_ON") state.projector = "POWERED_ON";
    if (state.projector !== "POWERED_ON") return false;
    return continueFromPoweredProjector(transition);
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

  const markProjectorStandby = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector === "FULLY_ACTIVE") {
      const result = validateTransition("projector", state.projector, "POWERED_ON", {
        tableRendererAvailable: false,
      });
      if (!result.ok) return false;
      state.projector = "POWERED_ON";
    } else if (state.projector === "PROJECTION_STARTING") {
      const result = validateTransition("projector", state.projector, "POWERED_ON");
      if (!result.ok) return false;
      state.projector = "POWERED_ON";
    }
    return state.projector === "POWERED_ON" || state.projector === "POWERING_ON" || state.projector === "POWERED_OFF";
  };

  const markProjectorPoweredOff = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERED_OFF") {
      const result = validateTransition("projector", state.projector, "POWERED_OFF", {
        tableProjectionVisible: false,
      });
      if (!result.ok) return false;
      state.projector = "POWERED_OFF";
    }
    return publish(transition, "projector:powered-off");
  };

  const markTableStandby = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.table === "FULLY_ACTIVE") {
      const lowering = validateTransition("table", state.table, "PROJECTION_STARTING");
      if (!lowering.ok) return false;
      state.table = "PROJECTION_STARTING";
    }
    if (state.table === "PROJECTION_STARTING") {
      const standby = validateTransition("table", state.table, "POWERED_ON");
      if (!standby.ok) return false;
      state.table = "POWERED_ON";
    }
    return state.table === "POWERED_ON" || state.table === "POWERING_ON" || state.table === "POWERED_OFF";
  };

  const markTablePoweredOff = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (!markTableStandby(transition)) return false;
    if (state.table !== "POWERED_OFF") {
      const result = validateTransition("table", state.table, "POWERED_OFF", {
        projectionVisible: false,
      });
      if (!result.ok) return false;
      state.table = "POWERED_OFF";
    }
    return publish(transition, "table:powered-off");
  };

  const finishPowerOff = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    if (state.projector !== "POWERED_OFF" || state.table !== "POWERED_OFF") return false;
    Object.keys(drawerStates).forEach((id) => { drawerStates[id] = "CLOSED"; });
    activeDrawer = null;
    state.chest = "PARKED";
    state.boardApplication = "NONE";
    state.boardPower = "POWERED_OFF";
    state.boardMechanical = "RETRACTED";
    const result = validateTransition("workshop", state.workshop, "OFF", {
      shutdownSequenceComplete: true,
    });
    if (!result.ok) return false;
    state.workshop = "OFF";
    busy = false;
    activeTransition = null;
    publish(transition, "workshop:off", { timingCompliance: "ws010-safe-projector-shutdown" });
    return true;
  };

  const finishFaultSafePowerOff = (transition) => {
    if (activeTransition !== transition || transition.cancelled) return false;
    const projectorContext = state.projector === "FAULT_SAFE"
      ? { emissiveLayersOff: true }
      : { tableProjectionVisible: false };
    const projectorResult = validateTransition(
      "projector", state.projector, "POWERED_OFF", projectorContext,
    );
    const tableResult = validateTransition("table", state.table, "POWERED_OFF", {
      projectionVisible: false,
    });
    const workshopResult = validateTransition("workshop", state.workshop, "OFF", {
      faultAcknowledged: true,
      emissiveLayersOff: true,
    });
    if (!projectorResult.ok || !tableResult.ok || !workshopResult.ok) return false;
    state.projector = "POWERED_OFF";
    state.workshop = "OFF";
    state.table = "POWERED_OFF";
    state.boardMechanical = "RETRACTED";
    state.boardPower = "POWERED_OFF";
    state.boardApplication = "NONE";
    state.chest = "PARKED";
    state.measurement = "IDLE";
    Object.keys(drawerStates).forEach((id) => { drawerStates[id] = "CLOSED"; });
    activeDrawer = null;
    busy = false;
    activeTransition = null;
    publish(transition, "workshop:off", { timingCompliance: "ws010-fault-safe-settlement" });
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
    if (transition.from === "SHUTTING_DOWN" && state.projector !== "POWERED_OFF") {
      if (state.projector !== "POWERED_ON") state.projector = "POWERING_ON";
      drivers.restoreProjectorShutdown?.({
        transitionId: transition.id,
        complete: () => finishShutdownReversal(transition),
      });
      return accept(transition, "REVERSING");
    }
    drivers.powerOnProjector?.({
      transitionId: transition.id,
      begin: () => beginProjectorPowerOn(transition, context),
      complete: () => finishProjectorPowerOn(transition),
    });
    return accept(transition);
  };

  const requestPowerOff = (context) => {
    if (state.workshop === "OFF") return freezeResult({ ok: true, code: "IDEMPOTENT" });
    if (state.workshop === "FAULT_SAFE") {
      const transition = nextTransition("workshop", state.workshop, "OFF");
      activeTransition = transition;
      busy = true;
      const secureFault = state.table === "FAULT_SAFE"
        ? drivers.secureTableFault
        : drivers.secureProjectorFault;
      if (typeof secureFault === "function") {
        secureFault({
          transitionId: transition.id,
          code: "FAULT_ACKNOWLEDGED",
          message: "Projector fault secured.",
          complete: () => finishFaultSafePowerOff(transition),
        });
      } else finishFaultSafePowerOff(transition);
      return accept(transition, "FAULT_ACKNOWLEDGED");
    }
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
    drivers.exitWorkshop?.({
      transitionId: transition.id,
      tableStandby: () => markTableStandby(transition),
      tablePoweredOff: () => markTablePoweredOff(transition),
      standby: () => markProjectorStandby(transition),
      poweredOff: () => markProjectorPoweredOff(transition),
      complete: () => finishPowerOff(transition),
    });
    return accept(transition);
  };

  const reportProjectorRendererUnavailable = () => {
    if (state.projector !== "FULLY_ACTIVE") {
      return freezeResult({ ok: true, code: state.projector === "POWERED_ON" ? "IDEMPOTENT" : "NOT_ACTIVE" });
    }
    const transition = nextTransition("projector", state.projector, "POWERED_ON");
    drivers.lowerProjectorToStandby?.({
      transitionId: transition.id,
      complete: () => {
        if (transition.cancelled || state.projector !== "FULLY_ACTIVE") return false;
        const result = validateTransition("projector", state.projector, "POWERED_ON", {
          tableRendererAvailable: false,
        });
        if (!result.ok) return false;
        state.projector = "POWERED_ON";
        return true;
      },
    });
    return accept(transition, "STANDBY_REQUESTED");
  };

  const reportProjectorFault = ({ code = "PROJECTOR_ASSET_UNAVAILABLE", message } = {}) => {
    if (state.projector === "FAULT_SAFE") return freezeResult({ ok: true, code: "IDEMPOTENT" });
    if (activeTransition) activeTransition.cancelled = true;
    const transition = nextTransition("projector", state.projector, "FAULT_SAFE");
    const projectorResult = validateTransition("projector", state.projector, "FAULT_SAFE");
    const tableResult = validateTransition("table", state.table, "FAULT_SAFE");
    const workshopResult = validateTransition("workshop", state.workshop, "FAULT_SAFE");
    if (!projectorResult.ok || !tableResult.ok || !workshopResult.ok) {
      return reject(
        "FAULT_TRANSITION_REJECTED",
        projectorResult.reason || tableResult.reason || workshopResult.reason,
      );
    }
    activeTransition = transition;
    state.projector = "FAULT_SAFE";
    state.table = "FAULT_SAFE";
    state.workshop = "FAULT_SAFE";
    busy = true;
    publish(transition, "projector:fault", { code, message });
    const settle = () => {
      if (activeTransition !== transition || transition.cancelled) return false;
      busy = false;
      activeTransition = null;
      return true;
    };
    if (typeof drivers.secureProjectorFault === "function") {
      drivers.secureProjectorFault({ transitionId: transition.id, code, message, complete: settle });
    } else settle();
    return accept(transition, "FAULT_SAFE");
  };

  const reportTableFault = ({ code = "TABLE_EMITTER_ASSET_UNAVAILABLE", message } = {}) => {
    if (state.table === "FAULT_SAFE") return freezeResult({ ok: true, code: "IDEMPOTENT" });
    if (state.projector !== "POWERED_ON" || state.workshop !== "STARTING") {
      return reject("TABLE_FAULT_NOT_ACTIVE", "Table faults require an active powered-Projector startup.");
    }
    if (activeTransition) activeTransition.cancelled = true;
    const transition = nextTransition("table", state.table, "FAULT_SAFE");
    const tableResult = validateTransition("table", state.table, "FAULT_SAFE");
    const workshopResult = validateTransition("workshop", state.workshop, "FAULT_SAFE");
    if (!tableResult.ok || !workshopResult.ok) {
      return reject("FAULT_TRANSITION_REJECTED", tableResult.reason || workshopResult.reason);
    }
    activeTransition = transition;
    state.table = "FAULT_SAFE";
    state.workshop = "FAULT_SAFE";
    busy = true;
    const settle = () => {
      if (activeTransition !== transition || transition.cancelled) return false;
      busy = false;
      activeTransition = null;
      return true;
    };
    if (typeof drivers.secureTableFault === "function") {
      drivers.secureTableFault({ transitionId: transition.id, code, message, complete: settle });
    } else settle();
    return accept(transition, "FAULT_SAFE");
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
    reportProjectorRendererUnavailable,
    reportProjectorFault,
    reportTableFault,
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
        timingCompliance: "ws012-table-power-lifecycle",
      });
    },
  });
}
