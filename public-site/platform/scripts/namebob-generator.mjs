const BOB_FORMS = Object.freeze([
  "Bob", "Bobarella", "Bobzilla", "Bobbio", "Bobinator", "Bobtastic",
  "Bobaroo", "Bobster", "Bobonaut", "Bobasaurus", "Bobnado", "Bobomatic",
  "Bobmeister", "Bobkins", "Bobbity", "Bobble", "Bobadillo", "Bobapalooza",
  "Bobiverse", "Bobventure", "Bobberino", "Bobbo", "Bobbles", "Bobalicious",
  "Bobarooza", "Bobmobile", "Bobrocket", "Bobwhiz", "Boboodle", "Boborama",
  "Bobificent", "Bobmazing", "Bobbot", "Bobarooey", "Bobdoodle", "Bobkaboom",
  "Bobquake", "Bobstorm", "Bobshine", "Bobwizard", "Bobgadget", "Bobspark",
  "Bobzoom", "Bobwhirl", "Bobtopia", "Bobcraft", "Bobbolt", "Bobberry",
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

export function generateNameBobs(value, { usedLabels = [], usedBobLastNames = [] } = {}) {
  const lines = Array.isArray(value) ? value : String(value || "").split(/\r?\n/);
  const firstNames = lines.map(firstNameFromRosterLine).filter(Boolean);
  const used = new Set(usedLabels.map((label) => String(label).trim().toLocaleLowerCase()).filter(Boolean));
  const bobLastNames = new Set(usedBobLastNames.map(bobLastName).filter(Boolean));
  const labels = [];

  for (const [index, firstName] of firstNames.entries()) {
    const seed = stableNumber(`${firstName}-${index}`);
    let label = "";
    for (let attempt = 0; attempt < BOB_FORMS.length && !label; attempt += 1) {
      const candidate = boundedLabel(`${firstName} ${BOB_FORMS[(seed + attempt) % BOB_FORMS.length]}`);
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

const LIMERICKS = Object.freeze([
  (name) => `There once was ${name} with a plan,\nWho built a remarkable fan.\nIt spun round and round,\nThen bounced on the ground,\nSo they strengthened the fan—and it ran!`,
  (name) => `${name} worked with a crew,\nOn a rocket painted bright blue.\nIt sputtered “ka-POW!”\nThen chased a small cow,\nSo they built a much calmer one too!`,
  (name) => `${name} invented a chair,\nThat zoomed through the classroom air.\nIt wiggled with glee,\nThen climbed up a tree,\nAnd parked on a very shocked bear!`,
  (name) => `${name} made a machine,\nThe funniest ever yet seen.\nIt flashed a green light,\nThen launched out of sight,\nAnd landed in three jelly beans!`,
]);

export function generateNameBobLimerick(nameValue, currentLabels) {
  const query = String(nameValue || "").trim().toLocaleLowerCase();
  const labels = Array.from(currentLabels || [], (label) => String(label).trim()).filter(Boolean);
  if (!query) return Object.freeze({ ok: false, reason: "student-name-required" });
  const label = labels.find((candidate) => candidate.toLocaleLowerCase() === query || candidate.split(/\s+/)[0].toLocaleLowerCase() === query);
  if (!label) return Object.freeze({ ok: false, reason: "student-not-found" });
  const limerick = LIMERICKS[stableNumber(label) % LIMERICKS.length](label);
  return Object.freeze({ ok: true, label, limerick });
}
