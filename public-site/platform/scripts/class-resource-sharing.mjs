export const CLASS_RESOURCE_STORAGE_KEY = "thinkamigbob.class-resource-sharing.v1";
export const RESOURCE_TYPES = Object.freeze(["Mission Activity", "Side Path", "Webpage", "Builder", "Workshop"]);
export const RESOURCE_RELEASES = Object.freeze(["manual", "class-start", "purple", "green", "yellow", "red"]);

function emptyState() { return { classes: {} }; }
function normalizeResource(value = {}) {
  return {
    title: String(value.title ?? "").trim().slice(0, 80),
    type: value.type === "Activity" ? "Mission Activity" : RESOURCE_TYPES.includes(value.type) ? value.type : "Mission Activity",
    url: String(value.url ?? "").trim().slice(0, 1000),
    release: RESOURCE_RELEASES.includes(value.release) ? value.release : "manual",
  };
}
function safeUrl(value) {
  return /^(https?:\/\/|\.\.?\/|\/)/i.test(value) && !/[\u0000-\u001f]/.test(value);
}

function normalizeAudienceRow(row = {}, fallbackResources = [], fallbackSlots = 4, index = 0) {
  const audienceType = ["whole-class", "students", "teacher-group", "random-group"].includes(row.audienceType) ? row.audienceType : "whole-class";
  const audienceIds = Array.isArray(row.audienceIds) ? row.audienceIds.map(String) : [];
  const resources = Array.isArray(row.resources) ? row.resources : fallbackResources;
  return {
    id: String(row.id || (index === 0 ? "whole-class" : `audience-${index + 1}`)),
    audienceType,
    audienceIds,
    audienceLabel: String(row.audienceLabel || (audienceType === "whole-class" ? "Whole class" : "Select students or a group")),
    slotCount: Math.max(4, Number(row.slotCount) || fallbackSlots || 4, resources.length),
    resources,
  };
}

export function createClassResourceSharing({ storage, now = () => Date.now() }) {
  const read = () => {
    try { return { ...emptyState(), ...JSON.parse(storage.getItem(CLASS_RESOURCE_STORAGE_KEY) || "{}") }; }
    catch { return emptyState(); }
  };
  const write = (state) => storage.setItem(CLASS_RESOURCE_STORAGE_KEY, JSON.stringify(state));
  const classState = (classId) => {
    const stored = read().classes[classId] ?? {};
    const activeResources = Array.isArray(stored.activeResources)
      ? stored.activeResources
      : stored.active ? [stored.active] : [];
    const slotCount = Math.max(4, Number(stored.slotCount) || 4, activeResources.length);
    const audienceRows = Array.isArray(stored.audienceRows) && stored.audienceRows.length
      ? stored.audienceRows.map((row, index) => normalizeAudienceRow(row, index === 0 ? activeResources : [], slotCount, index))
      : [normalizeAudienceRow({}, activeResources, slotCount, 0)];
    const primary = audienceRows[0];
    return { prepared: null, saved: [], history: [], savedGroupSets: [], ...stored, assignmentMode: stored.assignmentMode || primary.audienceType, exceptionsEnabled: Boolean(stored.exceptionsEnabled), audienceRows, slotCount: primary.slotCount, activeResources: primary.resources, active: primary.resources[0] ?? null };
  };
  const update = (classId, patch) => {
    const state = read();
    state.classes[classId] = { ...classState(classId), ...patch };
    write(state);
    return state.classes[classId];
  };
  const prepare = (classId, input) => {
    const resource = { ...normalizeResource(input), id: String(input?.id || `resource-${now()}`) };
    if (!classId || !resource.title || !resource.url || !safeUrl(resource.url)) return { ok: false, reason: "missing-resource" };
    const current = classState(classId);
    const saved = [resource, ...current.saved.filter((item) => item.id !== resource.id)].slice(0, 12);
    update(classId, { prepared: resource, saved });
    return { ok: true, resource };
  };
  const updateAudienceRows = (classId, audienceRows, extra = {}) => {
    const primary = audienceRows[0] ?? normalizeAudienceRow();
    return update(classId, { ...extra, audienceRows, slotCount: primary.slotCount, activeResources: primary.resources, active: primary.resources[0] ?? null });
  };
  const pushResource = (classId, resource, slot = "auto", rowId = "whole-class") => {
    const current = classState(classId);
    if (!resource) return { ok: false, reason: "missing-resource" };
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row) => row.id === rowId));
    const row = current.audienceRows[rowIndex];
    const activeResources = [...row.resources];
    let index = slot === "auto" ? activeResources.length : Number(slot);
    if (!Number.isInteger(index) || index < 0 || index >= row.slotCount) index = activeResources.length;
    if (index >= row.slotCount) return { ok: false, reason: "tray-full" };
    const active = { ...resource, sharedAt: now() };
    activeResources[index] = active;
    const compact = activeResources.filter(Boolean);
    const audienceRows = current.audienceRows.map((item, itemIndex) => itemIndex === rowIndex ? { ...item, resources: compact } : item);
    updateAudienceRows(classId, audienceRows, { history: [active, ...current.history].slice(0, 20) });
    return { ok: true, resource: active };
  };
  const push = (classId, slot = "auto", rowId = "whole-class") => pushResource(classId, classState(classId).prepared, slot, rowId);
  const pushSaved = (classId, resourceId, slot = "auto", rowId = "whole-class") => pushResource(classId, classState(classId).saved.find((item) => item.id === resourceId), slot, rowId);
  const replaceActive = (classId, resources = []) => {
    const normalized = resources.map((resource, index) => ({ ...normalizeResource(resource), id: String(resource?.id || `resource-${now()}-${index}`), sharedAt: resource?.sharedAt || now() }));
    if (!classId || normalized.some((resource) => !resource.title || !safeUrl(resource.url))) return { ok: false, reason: "missing-resource" };
    const current = classState(classId);
    const audienceRows = current.audienceRows.map((row, index) => index === 0 ? { ...row, slotCount: Math.max(row.slotCount, normalized.length), resources: normalized } : row);
    updateAudienceRows(classId, audienceRows, { history: [...normalized, ...current.history].slice(0, 20) });
    return { ok: true, resources: normalized };
  };
  const addSlot = (classId, rowId = "whole-class") => {
    if (!classId) return { ok: false, reason: "missing-class" };
    const current = classState(classId);
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row) => row.id === rowId));
    const slotCount = current.audienceRows[rowIndex].slotCount + 1;
    const audienceRows = current.audienceRows.map((row, index) => index === rowIndex ? { ...row, slotCount } : row);
    updateAudienceRows(classId, audienceRows);
    return { ok: true, slotCount };
  };
  const removeSlot = (classId, rowId = "whole-class") => {
    if (!classId) return { ok: false, reason: "missing-class" };
    const current = classState(classId);
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row) => row.id === rowId));
    const row = current.audienceRows[rowIndex];
    if (row.slotCount <= 1) return { ok: false, reason: "last-slot" };
    if (row.resources.length >= row.slotCount) return { ok: false, reason: "slot-in-use" };
    const slotCount = row.slotCount - 1;
    const audienceRows = current.audienceRows.map((item, index) => index === rowIndex ? { ...item, slotCount } : item);
    updateAudienceRows(classId, audienceRows);
    return { ok: true, slotCount };
  };
  const stop = (classId, index = null, rowId = "whole-class") => {
    const current = classState(classId);
    const rowIndex = Math.max(0, current.audienceRows.findIndex((row) => row.id === rowId));
    const resources = index === null ? [] : current.audienceRows[rowIndex].resources.filter((_, itemIndex) => itemIndex !== Number(index));
    const audienceRows = current.audienceRows.map((row, itemIndex) => itemIndex === rowIndex ? { ...row, resources } : row);
    return updateAudienceRows(classId, audienceRows);
  };
  const addAudienceRow = (classId) => {
    const current = classState(classId);
    const row = normalizeAudienceRow({ id: `audience-${now()}`, audienceType: "students", audienceLabel: "Select students" }, [], 4, current.audienceRows.length);
    updateAudienceRows(classId, [...current.audienceRows, row]);
    return row;
  };
  const removeAudienceRow = (classId, rowId) => {
    const current = classState(classId);
    if (rowId === "whole-class") return { ok: false, reason: "whole-class" };
    return updateAudienceRows(classId, current.audienceRows.filter((row) => row.id !== rowId));
  };
  const updateAudience = (classId, rowId, patch = {}) => {
    const current = classState(classId);
    const audienceRows = current.audienceRows.map((row) => row.id === rowId ? normalizeAudienceRow({ ...row, ...patch }, [], row.slotCount) : row);
    return updateAudienceRows(classId, audienceRows);
  };
  const configureAssignment = (classId, assignmentMode, exceptionsEnabled = false) => {
    const allowed = ["whole-class", "students", "teacher-group", "random-group"];
    const mode = allowed.includes(assignmentMode) ? assignmentMode : "whole-class";
    const current = classState(classId);
    const primary = normalizeAudienceRow({
      ...current.audienceRows[0],
      id: "whole-class",
      audienceType: mode,
      audienceIds: mode === "whole-class" ? [] : current.assignmentMode === mode ? current.audienceRows[0].audienceIds : [],
      audienceLabel: mode === "whole-class" ? "Whole class" : mode === "students" ? "Selected students" : mode === "teacher-group" ? "Group 1" : "Random Group 1",
    }, current.audienceRows[0]?.resources || [], current.audienceRows[0]?.slotCount || 4, 0);
    const exceptionRows = exceptionsEnabled ? current.audienceRows.slice(1) : [];
    return updateAudienceRows(classId, [primary, ...exceptionRows], { assignmentMode: mode, exceptionsEnabled: Boolean(exceptionsEnabled) });
  };
  const setGroupRows = (classId, groups = [], audienceType = "teacher-group") => {
    const current = classState(classId);
    const nonGroups = current.audienceRows.filter((row) => !["teacher-group", "random-group"].includes(row.audienceType));
    const rows = groups.map((group, index) => normalizeAudienceRow({
      id: group.id || `group-${now()}-${index}`,
      audienceType,
      audienceIds: group.audienceIds,
      audienceLabel: group.name || `Group ${index + 1}`,
      resources: group.resources || [],
      slotCount: group.slotCount || 4,
    }, [], 4, nonGroups.length + index));
    return updateAudienceRows(classId, [...nonGroups, ...rows]);
  };
  const saveGroupSet = (classId, name) => {
    const current = classState(classId);
    const cleanName = String(name || "").trim().slice(0, 60);
    if (!cleanName) return { ok: false, reason: "missing-name" };
    const groups = current.audienceRows.filter((row) => ["teacher-group", "random-group"].includes(row.audienceType)).map((row) => ({ name: row.audienceLabel, audienceIds: [...row.audienceIds] }));
    if (!groups.length) return { ok: false, reason: "missing-groups" };
    const preset = { id: `group-set-${now()}`, name: cleanName, groups };
    const savedGroupSets = [preset, ...current.savedGroupSets.filter((item) => item.name !== cleanName)].slice(0, 20);
    update(classId, { savedGroupSets });
    return { ok: true, preset };
  };
  const applyGroupSet = (classId, presetId) => {
    const current = classState(classId);
    const preset = current.savedGroupSets.find((item) => item.id === presetId);
    if (!preset) return { ok: false, reason: "missing-preset" };
    setGroupRows(classId, preset.groups, "teacher-group");
    return { ok: true, preset };
  };
  const resourcesForStudent = (classId, studentId) => classState(classId).audienceRows
    .filter((row) => row.audienceType === "whole-class" || row.audienceIds.includes(String(studentId)))
    .flatMap((row) => row.resources);
  const copyPlan = (sourceClassId, targetClassId) => {
    const source = classState(sourceClassId);
    return updateAudienceRows(targetClassId, structuredClone(source.audienceRows));
  };
  const removeSaved = (classId, resourceId) => {
    const current = classState(classId);
    return update(classId, { saved: current.saved.filter((item) => item.id !== resourceId), prepared: current.prepared?.id === resourceId ? null : current.prepared });
  };
  const release = (classId, trigger) => {
    const current = classState(classId);
    if (!current.prepared || current.activeResources.some((item) => item.id === current.prepared.id) || current.prepared.release !== trigger) return { ok: false, reason: "not-due" };
    return push(classId);
  };
  return { read: classState, prepare, push, pushSaved, replaceActive, addSlot, removeSlot, stop, removeSaved, release, addAudienceRow, removeAudienceRow, updateAudience, configureAssignment, setGroupRows, saveGroupSet, applyGroupSet, resourcesForStudent, copyPlan };
}
