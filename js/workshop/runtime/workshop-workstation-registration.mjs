export const WORKSHOP_WORKSTATION_REGISTRATION = Object.freeze({
  worldBounds: Object.freeze({
    xMin: -25,
    xMax: 25,
    zMin: -25,
    zMax: 25,
    width: 50,
    depth: 50,
  }),
  elevations: Object.freeze({
    platformSurface: -0.5,
    grid: -0.498,
    rulerProjection: -0.485,
  }),
  table: Object.freeze({
    anchor: "VISUAL_BASE_CENTER",
    preferredWidthRatio: 0.96,
    minimumWidth: 320,
    maximumWidth: 1150,
    essentialControlClearance: 12,
  }),
});

const CORNER_COORDINATES = Object.freeze([
  Object.freeze({ x: -25, z: -25 }),
  Object.freeze({ x: -25, z: 25 }),
  Object.freeze({ x: 25, z: -25 }),
  Object.freeze({ x: 25, z: 25 }),
]);

export const WORKSHOP_WORKSTATION_WORLD_CORNERS = Object.freeze(
  CORNER_COORDINATES.map(({ x, z }) => Object.freeze({
    x,
    y: WORKSHOP_WORKSTATION_REGISTRATION.elevations.rulerProjection,
    z,
  })),
);

const finite = (value) => Number.isFinite(value);

function frozenBounds(value) {
  if (!value || !finite(value.left) || !finite(value.top)) return null;
  const width = finite(value.width)
    ? value.width
    : finite(value.right) ? value.right - value.left : NaN;
  const height = finite(value.height)
    ? value.height
    : finite(value.bottom) ? value.bottom - value.top : NaN;
  if (!finite(width) || !finite(height) || width <= 0 || height <= 0) return null;
  return Object.freeze({
    left: value.left,
    top: value.top,
    right: value.left + width,
    bottom: value.top + height,
    width,
    height,
  });
}

function frozenProtectedZone(value) {
  const bounds = frozenBounds(value);
  if (!bounds || !finite(value?.inset) || value.inset < 0) return null;
  return Object.freeze({
    ...bounds,
    inset: value.inset,
    blocked: value.blocked === true || bounds.width === 0 || bounds.height === 0,
  });
}

function frozenTableRegistration(value) {
  if (!value || !finite(value.width) || !finite(value.height) ||
      !finite(value.imageLeft) || !finite(value.imageTop) ||
      !finite(value.anchorScreenX) || !finite(value.anchorScreenY)) return null;
  const visible = frozenBounds(value.visible);
  if (!visible) return null;
  const transform = value.transform && ["x", "y", "z", "width", "height"]
    .every((key) => finite(value.transform[key]))
    ? Object.freeze({
      x: value.transform.x,
      y: value.transform.y,
      z: value.transform.z,
      width: value.transform.width,
      height: value.transform.height,
    })
    : null;
  return Object.freeze({
    width: value.width,
    height: value.height,
    imageLeft: value.imageLeft,
    imageTop: value.imageTop,
    anchorScreenX: value.anchorScreenX,
    anchorScreenY: value.anchorScreenY,
    preferredWidth: finite(value.preferredWidth) ? value.preferredWidth : value.width,
    reducedForClearance: value.reducedForClearance === true,
    hidden: value.hidden === true,
    visible,
    transform,
  });
}

function signatureFor(value) {
  return JSON.stringify(value);
}

export function createWorkshopWorkstationRegistration({
  getStableHomeScreenBounds,
  getLiveProjectedScreenBounds,
  getProtectedBuildZone,
  getTableRegistration,
} = {}) {
  if (typeof getStableHomeScreenBounds !== "function" ||
      typeof getLiveProjectedScreenBounds !== "function" ||
      typeof getProtectedBuildZone !== "function" ||
      typeof getTableRegistration !== "function") {
    throw new TypeError("All Workshop workstation registration providers are required.");
  }

  let lastSignature = "";
  let lastSnapshot = null;

  function update() {
    const stableHomeScreenBounds = frozenBounds(getStableHomeScreenBounds());
    const liveProjectedScreenBounds = frozenBounds(getLiveProjectedScreenBounds());
    const protectedBuildZone = frozenProtectedZone(getProtectedBuildZone());
    const tableRegistration = frozenTableRegistration(getTableRegistration());
    const blocked = !stableHomeScreenBounds || !liveProjectedScreenBounds ||
      !protectedBuildZone || protectedBuildZone.blocked || !tableRegistration ||
      tableRegistration.hidden;
    const next = {
      worldBounds: WORKSHOP_WORKSTATION_REGISTRATION.worldBounds,
      elevations: WORKSHOP_WORKSTATION_REGISTRATION.elevations,
      worldCorners: WORKSHOP_WORKSTATION_WORLD_CORNERS,
      stableHomeScreenBounds,
      liveProjectedScreenBounds,
      protectedBuildZone,
      tableRegistration,
      blocked,
    };
    const signature = signatureFor(next);
    if (signature === lastSignature && lastSnapshot) return lastSnapshot;
    lastSignature = signature;
    lastSnapshot = Object.freeze(next);
    return lastSnapshot;
  }

  return Object.freeze({
    configuration: WORKSHOP_WORKSTATION_REGISTRATION,
    worldCorners: WORKSHOP_WORKSTATION_WORLD_CORNERS,
    update,
    getSnapshot() {
      return lastSnapshot || update();
    },
  });
}
