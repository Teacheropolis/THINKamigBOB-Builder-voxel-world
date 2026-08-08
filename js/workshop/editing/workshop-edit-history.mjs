export const WORKSHOP_EDIT_OPERATION_TYPES = Object.freeze({
  PLACEMENT: "PLACEMENT",
  DELETION: "DELETION",
  MOVE: "MOVE",
});

const validNumber = (value) => Number.isFinite(value);
const freezeCoordinates = (position) => {
  if (!position || !validNumber(position.x) || !validNumber(position.y) ||
      !validNumber(position.z)) return null;
  return Object.freeze({ x: position.x, y: position.y, z: position.z });
};

function createEntry(entry) {
  if (!entry || !entry.object) return null;
  const before = entry.before == null ? null : freezeCoordinates(entry.before);
  const after = entry.after == null ? null : freezeCoordinates(entry.after);
  if ((entry.before != null && !before) || (entry.after != null && !after)) return null;
  return Object.freeze({ object: entry.object, before, after });
}

function validOperationShape(type, entries) {
  if (new Set(entries.map((entry) => entry.object)).size !== entries.length) return false;
  if (type === WORKSHOP_EDIT_OPERATION_TYPES.PLACEMENT) {
    return entries.every((entry) => entry.before === null && entry.after !== null);
  }
  if (type === WORKSHOP_EDIT_OPERATION_TYPES.DELETION) {
    return entries.every((entry) => entry.before !== null && entry.after === null);
  }
  return entries.every((entry) => entry.before !== null && entry.after !== null);
}

function sameCoordinates(left, right) {
  if (left === null || right === null) return left === right;
  return left.x === right.x && left.y === right.y && left.z === right.z;
}

function sameOperation(left, right) {
  return !!left && left.type === right.type && left.entries.length === right.entries.length &&
    left.entries.every((entry, index) => {
      const candidate = right.entries[index];
      return entry.object === candidate.object &&
        sameCoordinates(entry.before, candidate.before) &&
        sameCoordinates(entry.after, candidate.after);
    });
}

export function createWorkshopEditTransaction({
  id,
  type,
  entries,
  translation = null,
  selection = [],
} = {}) {
  if (!Number.isInteger(id) || id < 1 ||
      !Object.values(WORKSHOP_EDIT_OPERATION_TYPES).includes(type) ||
      !Array.isArray(entries) || entries.length === 0) return null;
  const frozenEntries = entries.map(createEntry);
  if (frozenEntries.some((entry) => !entry)) return null;
  if (!validOperationShape(type, frozenEntries)) return null;
  const frozenTranslation = translation == null ? null : (() => {
    if (!validNumber(translation.x) || !validNumber(translation.z)) return null;
    return Object.freeze({ x: translation.x, z: translation.z });
  })();
  if (translation != null && !frozenTranslation) return null;
  const frozenSelection = Object.freeze(Array.isArray(selection) ? [...selection] : []);
  return Object.freeze({
    id,
    type,
    entries: Object.freeze(frozenEntries),
    translation: frozenTranslation,
    selection: frozenSelection,
  });
}

export function createWorkshopEditHistory({ validate, apply } = {}) {
  if (typeof validate !== "function" || typeof apply !== "function") {
    throw new TypeError("Edit history validate and apply adapters are required.");
  }
  const undoStack = [];
  const redoStack = [];
  let nextId = 1;
  let applying = false;

  const snapshot = () => Object.freeze({
    undoCount: undoStack.length,
    redoCount: redoStack.length,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    latestUndo: undoStack.at(-1) || null,
    latestRedo: redoStack.at(-1) || null,
  });

  const commit = (operation) => {
    if (applying) return Object.freeze({ ok: false, code: "BUSY" });
    const transaction = createWorkshopEditTransaction({ ...operation, id: nextId });
    if (!transaction) return Object.freeze({ ok: false, code: "INVALID_TRANSACTION" });
    if (sameOperation(undoStack.at(-1), transaction)) {
      return Object.freeze({ ok: false, code: "REPEATED" });
    }
    let valid = false;
    try { valid = validate(transaction, "COMMIT") === true; } catch (_) { valid = false; }
    if (!valid) return Object.freeze({ ok: false, code: "INVALID_OBJECTS" });
    undoStack.push(transaction);
    redoStack.length = 0;
    nextId += 1;
    return Object.freeze({ ok: true, code: "COMMITTED", transaction });
  };

  const transfer = (direction) => {
    if (applying) return Object.freeze({ ok: false, code: "BUSY" });
    const source = direction === "UNDO" ? undoStack : redoStack;
    const destination = direction === "UNDO" ? redoStack : undoStack;
    const transaction = source.at(-1);
    if (!transaction) return Object.freeze({ ok: false, code: "EMPTY" });
    let valid = false;
    try { valid = validate(transaction, direction) === true; } catch (_) { valid = false; }
    if (!valid) return Object.freeze({ ok: false, code: "INVALID_OBJECTS" });
    applying = true;
    let applied = false;
    try { applied = apply(transaction, direction) === true; } catch (_) { applied = false; }
    applying = false;
    if (!applied) return Object.freeze({ ok: false, code: "APPLY_FAILED" });
    source.pop();
    destination.push(transaction);
    return Object.freeze({ ok: true, code: direction === "UNDO" ? "UNDONE" : "REDONE", transaction });
  };

  return Object.freeze({
    commit,
    undo: () => transfer("UNDO"),
    redo: () => transfer("REDO"),
    reset() {
      undoStack.length = 0;
      redoStack.length = 0;
      return Object.freeze({ ok: true, code: "RESET" });
    },
    getSnapshot: snapshot,
  });
}
