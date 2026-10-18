const RHYME_ONSETS = Object.freeze([
  "Z", "Br", "Fizz", "Whizz", "Zoom", "Kab", "Tink", "Wobbl", "Giggl", "Spark",
  "Turb", "Bumbl", "Doodl", "Razz", "Jazz", "Snazz", "Gizm", "Rock", "Noodl", "Pickl",
  "Zing", "Bing", "Boing", "Twinkl", "Wiggl", "Jiggl", "Fizzl", "Sizzl", "Dazzl", "Puzzl",
  "Bounc", "Whirl", "Zipp", "Bopp", "Tipp", "Flipp", "Skipp", "Chipp", "Quirk", "Sprinkl",
  "Crinkl", "Jingl", "Tingl", "Rumbl", "Tumb", "Bubbl", "Wack", "Zapp",
]);

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

function boundedLabel(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, 40).trim();
}

function bobLastName(value) {
  return String(value || "").trim().split(/\s+/).at(-1).toLocaleLowerCase();
}

function labelContainsName(label, firstName) {
  const wanted = firstName.toLocaleLowerCase();
  return cleanName(String(label || "").split(/\s+/)[0]).toLocaleLowerCase() === wanted;
}

function rhymeEnding(firstName) {
  const match = firstName.toLocaleLowerCase().match(/[aeiouy][a-z'’-]*$/i);
  return (match?.[0] || firstName.slice(-2)).slice(-10);
}

function rhymingBobLastName(firstName, choice) {
  return `Bob${RHYME_ONSETS[choice % RHYME_ONSETS.length]}${rhymeEnding(firstName)}`;
}

export function generateNameBobs(value, { usedLabels = [], usedBobLastNames = [] } = {}) {
  const lines = Array.isArray(value) ? value : String(value || "").split(/\r?\n/);
  const firstNames = lines.map(firstNameFromRosterLine).filter(Boolean);
  const used = new Set(usedLabels.map((label) => String(label).trim().toLocaleLowerCase()).filter(Boolean));
  const bobLastNames = new Set(usedBobLastNames.map(bobLastName).filter(Boolean));
  const labels = [];

  for (const [index, firstName] of firstNames.entries()) {
    const seed = stableNumber(`${firstName}-${index}`);
    let label = "";
    for (let attempt = 0; attempt < RHYME_ONSETS.length && !label; attempt += 1) {
      const candidate = boundedLabel(`${firstName} ${rhymingBobLastName(firstName, seed + attempt)}`);
      if (!used.has(candidate.toLocaleLowerCase()) && !bobLastNames.has(bobLastName(candidate))) label = candidate;
    }
    if (!label) {
      let number = 3;
      label = boundedLabel(`${firstName} Bob2`);
      while (used.has(label.toLocaleLowerCase()) || bobLastNames.has(bobLastName(label))) label = boundedLabel(`${firstName} Bob${number++}`);
    }
    used.add(label.toLocaleLowerCase());
    bobLastNames.add(bobLastName(label));
    labels.push(label);
  }
  return Object.freeze({ labels: Object.freeze(labels), sourceCount: lines.filter((line) => String(line).trim()).length });
}

export function retryNameBob(firstNameValue, currentLabels, { usedLabels = [] } = {}) {
  const firstName = firstNameFromRosterLine(firstNameValue);
  const labels = Array.from(currentLabels || [], (label) => String(label).trim()).filter(Boolean);
  if (!firstName) return Object.freeze({ ok: false, reason: "student-name-required", labels: Object.freeze(labels) });
  const index = labels.findIndex((label) => labelContainsName(label, firstName));
  if (index < 0) return Object.freeze({ ok: false, reason: "student-not-found", labels: Object.freeze(labels) });
  const otherLabels = labels.filter((_, labelIndex) => labelIndex !== index);
  const generated = generateNameBobs(firstName, { usedLabels: [...usedLabels, ...labels], usedBobLastNames: otherLabels });
  if (!generated.labels[0]) return Object.freeze({ ok: false, reason: "retry-unavailable", labels: Object.freeze(labels) });
  const retried = [...labels];
  retried[index] = generated.labels[0];
  return Object.freeze({ ok: true, firstName, label: retried[index], labels: Object.freeze(retried) });
}
