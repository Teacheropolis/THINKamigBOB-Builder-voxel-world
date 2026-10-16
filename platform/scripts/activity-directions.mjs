export const ACTIVITY_DIRECTIONS_STORAGE_KEY = "thinkamigbob.activity-directions.v1";
export const DIRECTION_MEDIA_TYPES = Object.freeze(["none", "image", "google-slides", "youtube", "pdf", "webpage"]);

function emptyState() { return { classes: {} }; }
function cleanText(value, limit) { return String(value ?? "").trim().slice(0, limit); }
function safeUrl(value) { return !value || (/^https:\/\//i.test(value) && !/[\u0000-\u001f]/.test(value)); }
function normalizeResource(value = {}) {
  const mediaType = DIRECTION_MEDIA_TYPES.includes(value.mediaType) && value.mediaType !== "none" ? value.mediaType : "webpage";
  return { mediaType, url: cleanText(value.url, 1500) };
}
function normalizeCard(value = {}) {
  const mediaType = DIRECTION_MEDIA_TYPES.includes(value.mediaType) ? value.mediaType : "none";
  const legacyResources = mediaType !== "none" && value.url ? [{ mediaType, url: value.url }] : [];
  const resources = (Array.isArray(value.resources) ? value.resources : legacyResources).map(normalizeResource).filter((item) => item.url);
  return {
    id: cleanText(value.id, 100),
    title: cleanText(value.title, 100),
    directions: cleanText(value.directions, 2000),
    mediaType,
    url: cleanText(value.url, 1500),
    resources,
    status: value.status === "released" ? "released" : "draft",
    createdAt: Number(value.createdAt) || 0,
    updatedAt: Number(value.updatedAt) || 0,
    releasedAt: Number(value.releasedAt) || null,
  };
}

export function createActivityDirections({ storage, now = () => Date.now() }) {
  const readAll = () => {
    try { return { ...emptyState(), ...JSON.parse(storage.getItem(ACTIVITY_DIRECTIONS_STORAGE_KEY) || "{}") }; }
    catch { return emptyState(); }
  };
  const writeAll = (state) => storage.setItem(ACTIVITY_DIRECTIONS_STORAGE_KEY, JSON.stringify(state));
  const read = (classId) => {
    const stored = readAll().classes[classId] ?? {};
    return { title: cleanText(stored.title || "Today’s Activity", 100), cards: Array.isArray(stored.cards) ? stored.cards.map(normalizeCard) : [] };
  };
  const write = (classId, value) => {
    const state = readAll();
    state.classes[classId] = { title: cleanText(value.title || "Today’s Activity", 100), cards: value.cards.map(normalizeCard) };
    writeAll(state);
    return read(classId);
  };
  const setTitle = (classId, title) => write(classId, { ...read(classId), title });
  const saveCard = (classId, input = {}) => {
    const current = read(classId);
    const card = normalizeCard({ ...input, id: input.id || `direction-${now()}`, createdAt: input.createdAt || now(), updatedAt: now() });
    if (!classId || !card.title || !card.directions) return { ok: false, reason: "missing-directions" };
    if (card.resources.some((item) => !safeUrl(item.url))) return { ok: false, reason: "missing-media" };
    const index = current.cards.findIndex((item) => item.id === card.id);
    const cards = [...current.cards];
    if (index >= 0) cards[index] = { ...cards[index], ...card, status: cards[index].status, releasedAt: cards[index].releasedAt };
    else cards.push(card);
    write(classId, { ...current, cards });
    return { ok: true, card };
  };
  const changeStatus = (classId, cardId, status) => {
    const current = read(classId), index = current.cards.findIndex((item) => item.id === cardId);
    if (index < 0) return { ok: false, reason: "missing-card" };
    const cards = current.cards.map((item, itemIndex) => itemIndex === index ? { ...item, status, updatedAt: now(), releasedAt: status === "released" ? now() : null } : item);
    write(classId, { ...current, cards });
    return { ok: true, card: cards[index] };
  };
  const release = (classId, cardId) => changeStatus(classId, cardId, "released");
  const withdraw = (classId, cardId) => changeStatus(classId, cardId, "draft");
  const duplicate = (classId, cardId) => {
    const current = read(classId), index = current.cards.findIndex((item) => item.id === cardId);
    if (index < 0) return { ok: false, reason: "missing-card" };
    const source = current.cards[index], copy = { ...source, id: `direction-${now()}`, title: `${source.title} copy`.slice(0, 100), status: "draft", createdAt: now(), updatedAt: now(), releasedAt: null };
    const cards = [...current.cards]; cards.splice(index + 1, 0, copy); write(classId, { ...current, cards });
    return { ok: true, card: copy };
  };
  const move = (classId, cardId, offset) => {
    const current = read(classId), index = current.cards.findIndex((item) => item.id === cardId), target = index + Number(offset);
    if (index < 0 || target < 0 || target >= current.cards.length) return { ok: false, reason: "edge" };
    const cards = [...current.cards]; [cards[index], cards[target]] = [cards[target], cards[index]]; write(classId, { ...current, cards });
    return { ok: true };
  };
  const remove = (classId, cardId) => {
    const current = read(classId); write(classId, { ...current, cards: current.cards.filter((item) => item.id !== cardId) }); return { ok: true };
  };
  const releasedForStudents = (classId) => read(classId).cards.filter((item) => item.status === "released");
  return Object.freeze({ read, setTitle, saveCard, release, withdraw, duplicate, move, remove, releasedForStudents });
}
