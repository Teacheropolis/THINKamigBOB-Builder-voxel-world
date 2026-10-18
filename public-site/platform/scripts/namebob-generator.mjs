const RHYME_FAMILIES = Object.freeze([
  [/ava$/i, ["Brava", "Java", "Zava"]],
  [/ella$/i, ["Stella", "Bella", "Zella"]],
  [/emma$/i, ["Gemma", "Zemma", "Tremma"]],
  [/lily$/i, ["Silly", "Chilly", "Frilly"]],
  [/(?:lee|leigh|li|ly)$/i, ["Glee", "Zippy", "Whirly"]],
  [/(?:ay|ae)$/i, ["Play", "Hooray", "Gear-Spray"]],
  [/(?:den|dan|don)$/i, ["Zingden", "Whirlin'", "Gearin'"]],
  [/(?:son|sen)$/i, ["Awesome", "Gearson", "Cheerson"]],
  [/(?:er|or)$/i, ["Whirrer", "Gearer", "Explorer"]],
  [/(?:in|en|yn)$/i, ["Grinnin'", "Spinnin'", "Winnin'"]],
  [/(?:ie|y)$/i, ["Zippy", "Happy", "Snappy"]],
  [/(?:a|ah)$/i, ["Ta-Da", "Hurrah", "Zing-Ah"]],
  [/(?:o|oh)$/i, ["Go-Go", "Yo-Yo", "Glow"]],
]);

const MADE_UP_ONSETS = Object.freeze(["Z", "Fizz", "Whizz", "B", "Gear", "Tink"]);

function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").replace(/[^\p{L}'’-]/gu, "").slice(0, 24);
}

export function firstNameFromRosterLine(value) {
  const line = String(value || "").trim();
  if (!line) return "";
  const commaParts = line.split(",").map((part) => part.trim()).filter(Boolean);
  const likelyFirst = commaParts.length > 1 ? commaParts[1] : line.split(/\t|\s+/)[0];
  const name = cleanName(String(likelyFirst || "").split(/\s+/)[0]);
  return name ? name.charAt(0).toLocaleUpperCase() + name.slice(1).toLocaleLowerCase() : "";
}

function stableNumber(value) {
  return [...String(value)].reduce((total, character) => ((total * 31) + character.codePointAt(0)) >>> 0, 7);
}

function madeUpRhyme(name, choice) {
  const match = name.match(/[aeiouy][a-z'’-]*$/i);
  const ending = match?.[0] || name.slice(-2);
  return `${MADE_UP_ONSETS[choice % MADE_UP_ONSETS.length]}${ending.toLocaleLowerCase()}`;
}

function rhymesFor(name) {
  const family = RHYME_FAMILIES.find(([pattern]) => pattern.test(name));
  if (family) return family[1];
  return MADE_UP_ONSETS.map((_, index) => madeUpRhyme(name, index));
}

function boundedLabel(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, 40).trim();
}

export function generateNameBobs(value, { usedLabels = [] } = {}) {
  const lines = Array.isArray(value) ? value : String(value || "").split(/\r?\n/);
  const firstNames = lines.map(firstNameFromRosterLine).filter(Boolean);
  const used = new Set(usedLabels.map((label) => String(label).trim().toLocaleLowerCase()).filter(Boolean));
  const labels = [];

  for (const [index, firstName] of firstNames.entries()) {
    const rhymes = rhymesFor(firstName);
    const seed = stableNumber(`${firstName}-${index}`);
    let label = "";
    for (let attempt = 0; attempt < 24 && !label; attempt += 1) {
      const rhyme = rhymes[(seed + attempt) % rhymes.length];
      const candidate = attempt % 2 === 0
        ? `${rhyme} ${firstName}Bob`
        : `${firstName}Bob ${rhyme}`;
      const bounded = boundedLabel(candidate);
      if (!used.has(bounded.toLocaleLowerCase())) label = bounded;
    }
    if (!label) {
      let number = 2;
      const base = boundedLabel(`${firstName}Bob`);
      label = base;
      while (used.has(label.toLocaleLowerCase())) label = boundedLabel(`${base} ${number++}`);
    }
    used.add(label.toLocaleLowerCase());
    labels.push(label);
  }
  return Object.freeze({ labels: Object.freeze(labels), sourceCount: lines.filter((line) => String(line).trim()).length });
}
