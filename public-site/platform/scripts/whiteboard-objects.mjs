export const WHITEBOARD_OBJECT_TYPES = Object.freeze(["path", "line", "dimension", "rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "star", "arrow", "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere", "shape-fragment", "text", "image", "youtube"]);

export function createWhiteboardObject(type, values = {}) {
  if (!WHITEBOARD_OBJECT_TYPES.includes(type)) return null;
  return { id: globalThis.crypto?.randomUUID?.() ?? `object-${Date.now()}-${Math.random().toString(16).slice(2)}`, type, ...values };
}

export function objectBounds(object) {
  if (!object) return null;
  if (object.type === "path") {
    const xs = object.points.map((point) => point.x), ys = object.points.map((point) => point.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(12, Math.max(...xs) - Math.min(...xs)), height: Math.max(12, Math.max(...ys) - Math.min(...ys)) };
  }
  if (object.type === "dimension") {
    const angle = Math.atan2(object.height ?? 0, object.width ?? 0);
    const offset = Number(object.annotationOffset ?? 18);
    const offsetX = -Math.sin(angle) * offset, offsetY = Math.cos(angle) * offset;
    const labelX = object.x + (object.width ?? 0) / 2 + offsetX, labelY = object.y + (object.height ?? 0) / 2 + offsetY;
    const xs = [object.x, object.x + (object.width ?? 0), object.x + offsetX, object.x + (object.width ?? 0) + offsetX, labelX - 120, labelX + 120];
    const ys = [object.y, object.y + (object.height ?? 0), object.y + offsetY, object.y + (object.height ?? 0) + offsetY, labelY - 28, labelY + 28];
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(12, Math.max(...xs) - Math.min(...xs)), height: Math.max(12, Math.max(...ys) - Math.min(...ys)) };
  }
  return { x: Math.min(object.x, object.x + (object.width ?? 0)), y: Math.min(object.y, object.y + (object.height ?? 0)), width: Math.max(12, Math.abs(object.width ?? 0)), height: Math.max(12, Math.abs(object.height ?? 0)) };
}

export function hitTestObjects(objects, point) {
  return [...objects].reverse().find((object) => {
    const bounds = objectBounds(object);
    const padding = 10;
    return point.x >= bounds.x - padding && point.x <= bounds.x + bounds.width + padding && point.y >= bounds.y - padding && point.y <= bounds.y + bounds.height + padding;
  }) ?? null;
}

export function moveWhiteboardObject(object, dx, dy) {
  if (object.type === "path") return { ...object, points: object.points.map((point) => ({ x: point.x + dx, y: point.y + dy })) };
  return { ...object, x: object.x + dx, y: object.y + dy };
}

export function resizeWhiteboardObject(object, width, height) {
  if (object.type === "path") {
    const bounds = objectBounds(object), sx = Math.max(12, width) / bounds.width, sy = Math.max(12, height) / bounds.height;
    return { ...object, points: object.points.map((point) => ({ x: bounds.x + (point.x - bounds.x) * sx, y: bounds.y + (point.y - bounds.y) * sy })) };
  }
  return { ...object, width: Math.max(12, width), height: Math.max(12, height) };
}

export function duplicateWhiteboardObject(object, offset = 24) {
  const copy = structuredClone(object);
  copy.id = globalThis.crypto?.randomUUID?.() ?? `object-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return moveWhiteboardObject(copy, offset, offset);
}
