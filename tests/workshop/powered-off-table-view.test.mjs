import assert from "node:assert/strict";
import test from "node:test";

import {
  FRONT_CHASSIS_ASSET,
  POWERED_OFF_TABLE_EMITTER_PLANE,
  POWERED_OFF_TABLE_REGISTRATION,
  POWERED_OFF_TABLE_STATE,
  TABLETOP_REAR_ASSET,
  WORKSHOP_STUDENT_COMPOSITE_LAYER,
  calculateCameraPlaneTransform,
  calculatePoweredOffTableRegistration,
  createPoweredOffTableCompositor,
} from "../../js/workshop/table/powered-off-table-view.mjs";

class Layers {
  constructor() { this.mask = 1; }
  set(layer) { this.mask = 1 << layer; }
  enable(layer) { this.mask |= 1 << layer; }
}

class Node {
  constructor() {
    this.children = [];
    this.parent = null;
    this.layers = new Layers();
    this.visible = true;
    this.userData = {};
    this.position = { x: 0, y: 0, z: 0, set: (x, y, z) => Object.assign(this.position, { x, y, z }) };
    this.scale = { x: 1, y: 1, z: 1, set: (x, y, z) => Object.assign(this.scale, { x, y, z }) };
  }
  add(child) { if (child.parent) child.parent.remove(child); child.parent = this; this.children.push(child); }
  remove(child) { this.children = this.children.filter((value) => value !== child); if (child.parent === this) child.parent = null; }
  traverse(callback) { callback(this); this.children.forEach((child) => child.traverse(callback)); }
}

class Material {
  constructor(values) { Object.assign(this, values); this.disposed = false; }
  dispose() { this.disposed = true; }
}

function createHarness({ stageBounds, protectedBounds = [] } = {}) {
  let currentStage = stageBounds || { left: 0, top: 0, width: 1000, height: 700 };
  let loadCallbacks = [];
  const textures = [];
  const geometry = { disposed: false, dispose() { this.disposed = true; } };
  class Mesh extends Node { constructor(value, material) { super(); this.geometry = value; this.material = material; } }
  class TextureLoader {
    load(path, onLoad) {
      const texture = { path, disposed: false, dispose() { this.disposed = true; } };
      textures.push(texture);
      loadCallbacks.push(onLoad);
      return texture;
    }
  }
  const THREE = {
    TextureLoader,
    PlaneGeometry: class { constructor() { return geometry; } },
    MeshBasicMaterial: Material,
    Mesh,
  };
  const scene = new Node();
  scene.background = { id: "mission-background" };
  const camera = new Node();
  camera.fov = 50;
  camera.aspect = 1000 / 700;
  camera.far = 2000;
  camera.matrixWorld = { elements: [1, 0, 0, 1] };
  camera.matrixWorldInverse = { elements: [1, 0, 0, 1] };
  camera.projectionMatrix = { elements: [1, 0, 0, 1] };
  camera.quaternion = { x: 0, y: 0, z: 0, w: 1 };
  camera.up = { x: 0, y: 1, z: 0 };
  const renderCalls = [];
  const renderer = {
    autoClear: true,
    clearDepthCalls: 0,
    domElement: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 700 }) },
    render(renderScene, renderCamera) {
      renderCalls.push({ mask: renderCamera.layers.mask, background: renderScene.background, autoClear: this.autoClear });
    },
    clearDepth() { this.clearDepthCalls += 1; },
  };
  const raycaster = { layers: new Layers() };
  const stage = { getBoundingClientRect: () => currentStage };
  const protectedElements = protectedBounds.map((bounds) => ({ getBoundingClientRect: () => bounds }));
  const observed = [];
  class FakeResizeObserver {
    constructor(callback) { this.callback = callback; }
    observe(value) { observed.push(value); }
    disconnect() { this.disconnected = true; }
  }
  const student = new Node();
  student.name = "student";
  scene.add(student);
  const cad = new Node();
  cad.name = "cad";
  scene.add(cad);
  const light = new Node();
  scene.add(light);
  const compositor = createPoweredOffTableCompositor({
    THREE, scene, camera, renderer, raycaster, stage, protectedElements,
    getStudentObjects: () => [student],
    getCadDimensionGroup: () => cad,
    lights: [light],
    ResizeObserver: FakeResizeObserver,
  });
  return {
    compositor, scene, camera, renderer, raycaster, student, cad, light, geometry,
    textures, renderCalls, observed,
    completeLoads() { loadCallbacks.splice(0).forEach((callback) => callback()); },
    setStage(bounds) { currentStage = bounds; },
  };
}

test("records the approved powered-off Table assets, state, registration, and emitters", () => {
  assert.equal(TABLETOP_REAR_ASSET.endsWith("table-powered-off-tabletop-rear-1761x1174.png"), true);
  assert.equal(FRONT_CHASSIS_ASSET.endsWith("table-powered-off-front-chassis-1761x1174.png"), true);
  assert.deepEqual(POWERED_OFF_TABLE_STATE, { name: "POWERED_OFF", opacity: 1, scale: 1 });
  assert.equal(POWERED_OFF_TABLE_REGISTRATION.anchor, "VISUAL_BASE_CENTER");
  assert.equal(POWERED_OFF_TABLE_REGISTRATION.minimumWidth, 320);
  assert.equal(POWERED_OFF_TABLE_REGISTRATION.maximumWidth, 900);
  assert.equal(POWERED_OFF_TABLE_REGISTRATION.essentialControlClearance, 12);
  assert.equal(POWERED_OFF_TABLE_EMITTER_PLANE.length, 4);
  assert.equal(WORKSHOP_STUDENT_COMPOSITE_LAYER, 30);
});

test("uses 88% stage width and clamps to approved endpoints", () => {
  assert.equal(calculatePoweredOffTableRegistration({ stageBounds: { left: 0, top: 0, width: 1000, height: 700 } }).width, 880);
  assert.equal(calculatePoweredOffTableRegistration({ stageBounds: { left: 0, top: 0, width: 2000, height: 1400 } }).width, 900);
  assert.equal(calculatePoweredOffTableRegistration({ stageBounds: { left: 0, top: 0, width: 300, height: 700 } }).width, 320);
});

test("registers the approved visible base center and camera plane", () => {
  const registration = calculatePoweredOffTableRegistration({ stageBounds: { left: 0, top: 0, width: 1000, height: 700 } });
  assert.ok(Math.abs((registration.visible.left + registration.visible.right) / 2 - 500) < 0.001);
  assert.ok(Math.abs(registration.visible.bottom - 700) < 0.001);
  const transform = calculateCameraPlaneTransform({
    registration,
    canvasBounds: { left: 0, top: 0, width: 1000, height: 700 },
    camera: { fov: 50, aspect: 1000 / 700, far: 2000 },
  });
  assert.equal(transform.z, -800);
  assert.ok(transform.width > 0 && transform.height > 0);
});

test("keeps registration stable when Camera Fit expands the projected ruler grid track", async () => {
  const harness = createHarness({ stageBounds: { left: 200, top: 150, width: 600, height: 400 } });
  harness.completeLoads();
  await harness.compositor.ready;
  harness.compositor.setWorkshopActive(true);
  const stable = harness.compositor.registration;
  harness.setStage({ left: -647, top: -549, width: 2574, height: 370 });
  const fit = harness.compositor.updateRegistration();
  assert.equal(fit.hidden, false);
  assert.equal(fit.anchorScreenX, stable.anchorScreenX);
  assert.equal(fit.anchorScreenY, stable.anchorScreenY);
  assert.equal(fit.width, stable.width);
  harness.compositor.dispose();
});

test("reduces uniformly or hides instead of covering protected controls", () => {
  const reduced = calculatePoweredOffTableRegistration({
    stageBounds: { left: 0, top: 0, width: 1000, height: 700 },
    protectedBounds: [{ left: 0, top: 650, right: 100, bottom: 700, width: 100, height: 50 }],
  });
  assert.equal(reduced.hidden, false);
  assert.equal(reduced.reducedForClearance, true);
  const hidden = calculatePoweredOffTableRegistration({
    stageBounds: { left: 0, top: 0, width: 320, height: 300 },
    protectedBounds: [{ left: 0, top: 0, right: 320, bottom: 300, width: 320, height: 300 }],
  });
  assert.equal(hidden.hidden, true);
});

test("honors the approved Mac and Chromebook-responsive clearance matrix", () => {
  const cases = [
    { label: "1280x720", width: 1280, height: 720, hidden: false },
    { label: "1440x900", width: 1440, height: 900, hidden: false },
    { label: "1024x768", width: 1024, height: 768, hidden: false },
    { label: "760x740", width: 760, height: 740, hidden: false },
    { label: "Chromebook 1024x600", width: 1024, height: 600, hidden: false },
    { label: "Chromebook 1366x768", width: 1366, height: 768, hidden: false },
    { label: "rotation geometry 768x1024", width: 768, height: 1024, hidden: false },
    { label: "125% reflow", width: 1024, height: 576, hidden: true },
    { label: "150% reflow", width: 853, height: 480, hidden: true },
    { label: "200% reflow", width: 640, height: 360, hidden: true },
  ];
  cases.forEach(({ label, width, height, hidden }) => {
    const stageBounds = {
      left: width * (331 / 1280),
      top: height * (231 / 720),
      width: width * (622 / 1280),
      height: height * (319 / 720),
    };
    const dashboardTop = height - 126;
    const result = calculatePoweredOffTableRegistration({
      stageBounds,
      protectedBounds: [{ left: 0, top: dashboardTop, right: width, bottom: height, width, height: 126 }],
    });
    assert.equal(result.hidden, hidden, label);
  });
});

test("mounts two camera-attached structural layers with the approved depth contract", async () => {
  const harness = createHarness();
  assert.equal(harness.compositor.meshes.rear.parent, harness.camera);
  assert.equal(harness.compositor.meshes.chassis.parent, harness.camera);
  assert.equal(harness.compositor.materials.rear.depthTest, true);
  assert.equal(harness.compositor.materials.rear.depthWrite, true);
  assert.equal(harness.compositor.materials.chassis.depthTest, false);
  assert.equal(harness.compositor.materials.chassis.depthWrite, false);
  assert.equal(harness.compositor.meshes.rear.raycast(), undefined);
  harness.completeLoads();
  await harness.compositor.ready;
});

test("renders exactly one bounded final student pass only while the Table is visible", async () => {
  const harness = createHarness();
  harness.completeLoads();
  await harness.compositor.ready;
  harness.compositor.setWorkshopActive(true);
  const cameraMask = harness.camera.layers.mask;
  const raycasterMask = harness.raycaster.layers.mask;
  const background = harness.scene.background;
  assert.equal(harness.compositor.render(), true);
  assert.equal(harness.renderCalls.length, 2);
  assert.equal(harness.renderer.clearDepthCalls, 1);
  assert.equal((harness.renderCalls[0].mask & (1 << 30)) === 0, true);
  assert.equal(harness.renderCalls[1].mask, 1 << 30);
  assert.equal(harness.renderCalls[0].background, background);
  assert.equal(harness.renderCalls[1].background, null);
  assert.equal(harness.renderCalls[1].autoClear, false);
  assert.equal(harness.camera.layers.mask, cameraMask);
  assert.equal(harness.scene.background, background);
  assert.equal(harness.renderer.autoClear, true);
  assert.equal(harness.student.layers.mask, 1 << 30);
  assert.equal(harness.cad.layers.mask, 1 << 30);
  assert.equal(harness.light.layers.mask & (1 << 30), 1 << 30);
  assert.equal(harness.raycaster.layers.mask & (1 << 30), 1 << 30);
  harness.compositor.setWorkshopActive(false);
  assert.equal(harness.student.layers.mask, 1);
  assert.equal(harness.cad.layers.mask, 1);
  assert.equal(harness.light.layers.mask, 1);
  assert.equal(harness.raycaster.layers.mask, raycasterMask);
  assert.equal(harness.compositor.render(), false);
  assert.equal(harness.renderCalls.length, 2);
});

test("falls back to the original single-pass caller when protected geometry hides the Table", async () => {
  const harness = createHarness({
    stageBounds: { left: 0, top: 0, width: 320, height: 300 },
    protectedBounds: [{ left: 0, top: 0, right: 320, bottom: 300, width: 320, height: 300 }],
  });
  harness.completeLoads();
  await harness.compositor.ready;
  harness.compositor.setWorkshopActive(true);
  assert.equal(harness.compositor.visible, false);
  assert.equal(harness.compositor.render(), false);
  assert.equal(harness.renderCalls.length, 0);
  assert.equal(harness.student.layers.mask, 1);
});

test("restores render state even when the final pass throws", async () => {
  const harness = createHarness();
  harness.completeLoads();
  await harness.compositor.ready;
  harness.compositor.setWorkshopActive(true);
  const background = harness.scene.background;
  const originalRender = harness.renderer.render;
  harness.renderer.render = function(...args) {
    originalRender.apply(this, args);
    if (harness.renderCalls.length === 2) throw new Error("final pass failure");
  };
  assert.throws(() => harness.compositor.render(), /final pass failure/);
  assert.equal(harness.camera.layers.mask, 1);
  assert.equal(harness.scene.background, background);
  assert.equal(harness.renderer.autoClear, true);
});

test("disconnects and disposes without changing the canonical assets", async () => {
  const harness = createHarness();
  harness.completeLoads();
  await harness.compositor.ready;
  harness.compositor.setWorkshopActive(true);
  harness.compositor.dispose();
  assert.equal(harness.geometry.disposed, true);
  assert.equal(harness.compositor.materials.rear.disposed, true);
  assert.equal(harness.compositor.materials.chassis.disposed, true);
  assert.equal(harness.textures.every((texture) => texture.disposed), true);
  assert.equal(harness.student.layers.mask, 1);
});

test("rejects incomplete geometry and renderer hosts", () => {
  assert.throws(() => calculatePoweredOffTableRegistration(), /stageBounds/);
  assert.throws(() => calculateCameraPlaneTransform(), /required/);
  assert.throws(() => createPoweredOffTableCompositor(), /THREE constructors/);
});
