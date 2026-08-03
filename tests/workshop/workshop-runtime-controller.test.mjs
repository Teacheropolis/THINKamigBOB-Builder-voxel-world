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
      continueLegacyStartup: ({ complete }) => { pending.enter = complete; },
      exitWorkshop: ({ complete }) => { pending.exit = complete; },
      openDrawer: ({ complete }) => { pending.drawer = complete; },
      closeDrawer: ({ complete }) => { pending.drawer = complete; },
    },
  });
  return { controller, events, pending };
}

function completeStartup(pending) {
  assert.equal(pending.projectorBegin(), true);
  assert.equal(pending.projectorComplete(), true);
  assert.equal(pending.enter(), true);
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
    timingCompliance: "legacy-combined-not-bible-compliant",
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
  assert.equal(pending.enter(), true);
  assert.equal(pending.enter(), false);
  assert.equal(controller.getSnapshot().workshop, "READY");
  assert.deepEqual(events.map((event) => event.name), ["workshop:startup-begun", "projector:powered-on", "workspace:projection-stable", "workshop:ready"]);
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
