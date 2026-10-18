export const AUTOMATIC_VISUAL_CATALOG = Object.freeze([
  { file: "../assets/images/start mission button.png", name: "start mission button", tags: ["mission", "start", "activity"] },
  { file: "../assets/images/builder-header.png", name: "builder header", tags: ["builder", "build", "design", "create"] },
  { file: "../assets/images/builder-robot.png", name: "builder robot", tags: ["builder", "robot", "prototype"] },
  { file: "../assets/images/workshop/workshop-room-background.png", name: "workshop room", tags: ["workshop", "tools", "make"] },
  { file: "../assets/images/sky-banner-rocket.png", name: "sky banner rocket", tags: ["space", "rocket", "sky", "bedroom"] },
  { file: "../assets/images/desk.png", name: "design desk", tags: ["plan", "directions", "page", "webpage"] },
  { file: "../assets/images/workshop/production/engineering-smart-board/engineering-smart-board-production-v2-extended.png", name: "engineering smart board", tags: ["learn", "reflection", "evidence", "explain"] },
  { file: "../assets/images/characters/thinker-bob-master.png", name: "Thinker BOB", tags: ["help", "focus", "side", "path"] },
]);

function words(value) {
  return String(value ?? "").toLowerCase().replace(/\.[a-z0-9]+$/i, "").split(/[^a-z0-9]+/).filter((word) => word.length > 2);
}
function altFromName(name) {
  return `${name.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} visual support`;
}

export function matchAutomaticVisual({ title = "", detail = "", type = "" } = {}) {
  const query = new Set(words(`${title} ${detail}`));
  let best = null;
  for (const item of AUTOMATIC_VISUAL_CATALOG) {
    const matches = [...new Set([...words(item.name), ...item.tags])].filter((word) => query.has(word)).length;
    if (matches > 0 && (!best || matches > best.matches)) best = { item, matches };
  }
  const fallbackTag = String(type).toLowerCase();
  const item = best?.item
    ?? AUTOMATIC_VISUAL_CATALOG.find((entry) => entry.tags.includes(fallbackTag))
    ?? AUTOMATIC_VISUAL_CATALOG[0];
  return { src: item.file, alt: altFromName(item.name), matched: Boolean(best) };
}
