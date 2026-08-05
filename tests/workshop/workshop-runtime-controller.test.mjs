import test from "node:test";
import assert from "node:assert/strict";
import {
  WORKSHOP_UI_DRAWER_MAP,
  createWorkshopRuntimeController,
} from "../../js/workshop/runtime/workshop-runtime-controller.mjs";

function harness() {
  const events = [];
  const pending = {};
  const controller = createWorkshopRuntimeController({
    emit: (name, detail) => events.push({ name, detail }),
    drivers: {
      powerOnProjector: ({ begin, complete }) => {
        pending.projectorBegin = begin;
        pending.projectorComplete = complete;
      },
      powerOnTable: ({ begin, complete }) => {
        pending.tableBegin = begin;
        pending.tablePower = complete;
      },
      startTableProjection: ({ complete, compatibilityStable }) => {
        pending.tableProjection = complete;
        pending.tableStable = compatibilityStable;
      },
      startProjectorProjection: ({ complete }) => { pending.projectionStart = complete; },
      settleProjectorProjection: ({ complete }) => { pending.projectorActive = complete; },
      exitWorkshop: ({ tableStandby, tablePoweredOff, standby, poweredOff, complete }) => {
        pending.tableStandby = tableStandby;
        pending.tablePoweredOff = tablePoweredOff;
        pending.standby = standby;
        pending.poweredOff = poweredOff;
        pending.exit = complete;
      },
      secureTableFault: ({ complete }) => { pending.tableFault = complete; },
      openDrawer: ({ complete }) => { pending.drawer = complete; },
      closeDrawer: ({ complete }) => { pending.drawer = complete; },
    },
  });
  return { controller, events, pending };
}

function completeStartup(pending) {
  assert.equal(pending.projectorBegin(), true);
  assert.equal(pending.projectorComplete(), true);
  assert.equal(pending.tableBegin(), true);
  assert.equal(pending.tablePower(), true);
  assert.equal(pending.projectionStart(), true);
  assert.equal(pending.tableProjection(), true);
  assert.equal(pending.tableStable(), true);
  assert.equal(pending.projectorActive(), true);
}

test("starts from deterministic protected states", () => {
  assert.deepEqual(harness().controller.getSnapshot(), {
    workshop: "OFF", projector: "POWERED_OFF", table: "POWERED_OFF",
    boardMechanical: "RETRACTED", boardPower: "POWERED_OFF", boardApplication: "NONE",
    chest: "PARKED", measurement: "IDLE",
    drawers: {
      D1_MEASURE: "CLOSED", D2_BUILD: "CLOSED", D3_MATERIALS: "CLOSED",
      D4_COMPONENTS: "CLOSED", D5_NOTEBOOK: "CLOSED", D6_UTILITY: "CLOSED",
    },
    activeDrawer: null, busy: false,
    disabled: { powerOn: false, powerOff: true, drawers: true, measurement: true },
    activeTransitionId: null,
    timingCompliance: "ws013-table-projection-start-with-ws014-compatibility",
  });
});

test("power-on changes visuals only through the accepted driver and settles once", () => {
  const { controller, events, pending } = harness();
  const result = controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  assert.equal(result.ok, true);
  assert.equal(controller.getSnapshot().workshop, "STARTING");
  assert.equal(controller.getSnapshot().projector, "POWERED_OFF");
  assert.deepEqual(events.map((event) => event.name), ["workshop:startup-begun"]);
  assert.equal(pending.projectorBegin(), true);
  assert.equal(controller.getSnapshot().projector, "POWERING_ON");
  assert.equal(pending.projectorComplete(), true);
  assert.equal(controller.getSnapshot().projector, "POWERED_ON");
  assert.deepEqual(events.map((event) => event.name), ["workshop:startup-begun", "projector:powered-on"]);
  assert.equal(pending.projectorComplete(), false);
  assert.equal(pending.tableBegin(), true);
  assert.equal(controller.getSnapshot().table, "POWERING_ON");
  assert.equal(pending.tablePower(), true);
  assert.equal(controller.getSnapshot().table, "PROJECTION_STARTING");
  assert.equal(controller.getSnapshot().projector, "PROJECTION_STARTING");
  assert.equal(pending.tableProjection(), true);
  assert.equal(pending.tableProjection(), false);
  assert.equal(pending.tableStable(), true);
  assert.equal(controller.getSnapshot().table, "PROJECTION_STARTING");
  assert.equal(pending.projectionStart(), true);
  assert.equal(pending.projectionStart(), false);
  assert.equal(controller.getSnapshot().table, "PROJECTION_STARTING");
  assert.equal(pending.projectorActive(), true);
  assert.equal(pending.projectorActive(), false);
  assert.equal(controller.getSnapshot().workshop, "READY");
  assert.deepEqual(events.map((event) => event.name), [
    "workshop:startup-begun",
    "projector:powered-on",
    "table:powered-on",
    "table:projection-started",
    "projector:projection-started",
    "workspace:projection-stable",
    "projector:active",
    "workshop:ready",
  ]);
});

test("power-on rejects missing asset readiness without invoking a driver", () => {
  const { controller, pending } = harness();
  const result = controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: false } });
  assert.equal(result.ok, false);
  assert.equal(result.code, "STARTUP_GUARD_FAILED");
  assert.equal(pending.projectorBegin, undefined);
});

test("shutdown cancels an unsettled startup transition", () => {
  const { controller, events, pending } = harness();
  controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  const staleBegin = pending.projectorBegin;
  const staleCompletion = pending.projectorComplete;
  const result = controller.request({ action: "REQUEST_POWER_OFF", input: "host", context: { applicationStateSecured: true } });
  assert.equal(result.ok, true);
  assert.equal(staleBegin(), false);
  assert.equal(staleCompletion(), false);
  assert.equal(pending.exit(), true);
  assert.equal(controller.getSnapshot().workshop, "OFF");
  assert.deepEqual(events.map((event) => event.name), ["workshop:startup-begun", "workshop:shutdown-begun", "workshop:off"]);
});

test("uses only approved WS-002 mappings for current drawer UI", () => {
  assert.deepEqual(WORKSHOP_UI_DRAWER_MAP, {
    "colors-materials": "D3_MATERIALS",
    "parts-objects": "D4_COMPONENTS",
  });
  const { controller, pending } = harness();
  controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  completeStartup(pending);
  assert.equal(controller.request({ action: "OPEN_DRAWER", input: "pointer", payload: { uiDrawer: "shapes" } }).code, "UNMAPPED_DRAWER");
  const open = controller.request({ action: "OPEN_DRAWER", input: "pointer", payload: { uiDrawer: "colors-materials" } });
  assert.equal(open.ok, true);
  pending.drawer();
  assert.equal(controller.getSnapshot().drawers.D3_MATERIALS, "OPEN");
});

test("requires close completion before opening a different drawer", () => {
  const { controller, pending } = harness();
  controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  completeStartup(pending);
  controller.request({ action: "OPEN_DRAWER", input: "pointer", payload: { uiDrawer: "colors-materials" } });
  pending.drawer();
  assert.equal(controller.request({ action: "OPEN_DRAWER", input: "pointer", payload: { uiDrawer: "parts-objects" } }).code, "DRAWER_CLOSE_REQUIRED");
  controller.request({ action: "CLOSE_DRAWER", input: "pointer", payload: { uiDrawer: "colors-materials" } });
  pending.drawer();
  assert.equal(controller.request({ action: "OPEN_DRAWER", input: "pointer", payload: { uiDrawer: "parts-objects" } }).ok, true);
});

test("routes measurement selection through READY guards without changing geometry", () => {
  const { controller, pending } = harness();
  const object = Object.freeze({ id: "beam-1", width: 2 });
  assert.equal(controller.request({ action: "SELECT_MEASURABLE_OBJECT", input: "pointer", payload: { objectId: object.id, objectMeasurable: true } }).ok, false);
  controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  completeStartup(pending);
  assert.equal(controller.request({ action: "SELECT_MEASURABLE_OBJECT", input: "pointer", payload: { objectId: object.id, objectMeasurable: true } }).ok, true);
  assert.deepEqual(object, { id: "beam-1", width: 2 });
  assert.equal(controller.request({ action: "CLEAR_SELECTION", input: "keyboard", payload: {} }).ok, true);
});

test("reports invalid and unwired actions without throwing", () => {
  const { controller } = harness();
  assert.equal(controller.request({ action: "CLICK", input: "pointer" }).code, "INVALID_ACTION");
  assert.equal(controller.request({ action: "OPEN_NOTEBOOK", input: "pointer" }).code, "UNIMPLEMENTED_ACTION");
});

test("requires both readiness branches and emits table projection once", () => {
  const { controller, events, pending } = harness();
  controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  pending.projectorBegin(); pending.projectorComplete(); pending.tableBegin(); pending.tablePower();
  assert.equal(pending.tableProjection(), true);
  assert.equal(pending.tableProjection(), false);
  assert.equal(events.filter((event) => event.name === "table:projection-started").length, 1);
  assert.equal(controller.getSnapshot().workshop, "STARTING");
  assert.equal(pending.tableStable(), true);
  assert.equal(controller.getSnapshot().workshop, "STARTING");
  pending.projectionStart(); pending.projectorActive();
  assert.equal(controller.getSnapshot().workshop, "READY");
});

test("labels temporary WS-014 compatibility without claiming a Table active visual", () => {
  const { controller, events, pending } = harness();
  controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  pending.projectorBegin(); pending.projectorComplete(); pending.tableBegin(); pending.tablePower();
  pending.tableProjection(); pending.tableStable(); pending.projectionStart(); pending.projectorActive();
  assert.equal(controller.getSnapshot().table, "PROJECTION_STARTING");
  const stable = events.find((event) => event.name === "workspace:projection-stable");
  assert.deepEqual(
    { timingCompliance: stable.detail.timingCompliance, visualState: stable.detail.visualState, temporaryCompatibility: stable.detail.temporaryCompatibility },
    { timingCompliance: "ws013-field-with-ws014-compatibility", visualState: "PROJECTION_STARTING", temporaryCompatibility: true },
  );
});

test("rejects stale Table, Projector, and compatibility callbacks after cancellation", () => {
  const { controller, events, pending } = harness();
  controller.request({ action: "REQUEST_POWER_ON", input: "host", context: { assetsLoaded: true } });
  pending.projectorBegin(); pending.projectorComplete(); pending.tableBegin(); pending.tablePower();
  const staleTable = pending.tableProjection;
  const staleProjector = pending.projectionStart;
  const staleCompatibility = pending.tableStable;
  controller.request({ action: "REQUEST_POWER_OFF", input: "host", context: { applicationStateSecured: true } });
  assert.equal(staleTable(), false);
  assert.equal(staleProjector(), false);
  assert.equal(staleCompatibility(), false);
  assert.equal(events.some((event) => event.name === "table:projection-started"), false);
});
