export const WORKSHOP_RESIZE_STEP_CM = 1;
export const WORKSHOP_RESIZE_MINIMUM_CM = 1;

const validNumber = (value) => Number.isFinite(value);
const cleanNumber = (value) => {
  const cleaned = Number(value.toFixed(12));
  return Object.is(cleaned, -0) ? 0 : cleaned;
};

const freezeDimensions = (dimensions) => {
  if (!dimensions || !validNumber(dimensions.width) ||
      !validNumber(dimensions.height) || !validNumber(dimensions.depth) ||
      dimensions.width <= 0 || dimensions.height <= 0 || dimensions.depth <= 0) {
    return null;
  }
  return Object.freeze({
    width:dimensions.width,
    height:dimensions.height,
    depth:dimensions.depth,
  });
};

export function createWorkshopSelectionResizeCandidate({
  object,
  dimensions,
  position,
  scaleY,
  delta,
} = {}) {
  const beforeDimensions = freezeDimensions(dimensions);
  if (!object || !beforeDimensions || !position ||
      !validNumber(position.x) || !validNumber(position.y) ||
      !validNumber(position.z) || !validNumber(scaleY) || scaleY <= 0 ||
      (delta !== WORKSHOP_RESIZE_STEP_CM && delta !== -WORKSHOP_RESIZE_STEP_CM)) {
    return null;
  }

  const afterDimensions = freezeDimensions({
    width:cleanNumber(beforeDimensions.width + delta),
    height:cleanNumber(beforeDimensions.height + delta),
    depth:cleanNumber(beforeDimensions.depth + delta),
  });
  if (!afterDimensions || afterDimensions.width < WORKSHOP_RESIZE_MINIMUM_CM ||
      afterDimensions.height < WORKSHOP_RESIZE_MINIMUM_CM ||
      afterDimensions.depth < WORKSHOP_RESIZE_MINIMUM_CM) return null;

  const before = Object.freeze({x:position.x,y:position.y,z:position.z});
  const after = Object.freeze({
    x:before.x,
    y:cleanNumber(before.y +
      ((afterDimensions.height - beforeDimensions.height) * scaleY) / 2),
    z:before.z,
  });
  const noOp = before.x === after.x && before.y === after.y &&
    before.z === after.z &&
    beforeDimensions.width === afterDimensions.width &&
    beforeDimensions.height === afterDimensions.height &&
    beforeDimensions.depth === afterDimensions.depth;

  return Object.freeze({
    delta,
    entry:Object.freeze({
      object,
      before,
      after,
      beforeDimensions,
      afterDimensions,
    }),
    noOp,
  });
}
