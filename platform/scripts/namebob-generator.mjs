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

const RHYMING_BOB_FORMS = Object.freeze({
  savannah: Object.freeze(["Bobanana", "Bob Cabana", "BananaBob"]),
  lydia: Object.freeze(["Bobbedia", "Giddy-a-Bob", "Bobblydia"]),
  miley: Object.freeze(["SmileyBob", "WileyBob", "Bob Smiley"]),
  siamara: Object.freeze(["Bob Tiara", "Bob-a-Rama", "TiaraBob"]),
  mariela: Object.freeze(["Bobarella", "Bob Umbrella", "MarshmallowBobella"]),
  faith: Object.freeze(["Bob-the-Eighth", "Great-Faith-Bob", "Bob of Great Faith"]),
});

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

function rhymingBobForms(firstName) {
  const exact = RHYMING_BOB_FORMS[firstName.toLocaleLowerCase()] || [];
  const lower = firstName.toLocaleLowerCase();
  const soundBased = lower.endsWith("y") || lower.endsWith("ie")
    ? ["SillyBob", "SmileyBob", "WigglyBob"]
    : lower.endsWith("a")
      ? ["Bob-a-Rama", "Bob Cabana", "Bobanana"]
      : lower.endsWith("an")
        ? ["Bob-the-Can-Do-Man", "Bob Fan", "Bob-a-Plan"]
        : lower.endsWith("er")
          ? ["SuperBob", "BuilderBob", "WhirringBob"]
          : ["Bobble-Doodle", "Bob Kaboom", "Bobbity-Bop"];
  return [...new Set([...exact, ...soundBased, ...BOB_FORMS])];
}

export function generateNameBobs(value, { usedLabels = [], usedBobLastNames = [] } = {}) {
  const lines = Array.isArray(value) ? value : String(value || "").split(/\r?\n/);
  const firstNames = lines.map(firstNameFromRosterLine).filter(Boolean);
  const used = new Set(usedLabels.map((label) => String(label).trim().toLocaleLowerCase()).filter(Boolean));
  const bobLastNames = new Set(usedBobLastNames.map(bobLastName).filter(Boolean));
  const labels = [];

  for (const [index, firstName] of firstNames.entries()) {
    const seed = stableNumber(`${firstName}-${index}`);
    const forms = rhymingBobForms(firstName);
    let label = "";
    for (let attempt = 0; attempt < forms.length && !label; attempt += 1) {
      const formIndex = attempt < 3 ? attempt : (seed + attempt) % forms.length;
      const candidate = boundedLabel(`${firstName} ${forms[formIndex]}`);
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

function joinedNames(names) {
  if (names.length < 2) return names[0] || "the Bob crew";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

export function generateClassNameBobLimerick(currentLabels) {
  const labels = Array.from(currentLabels || [], (label) => boundedLabel(label)).filter(Boolean).slice(0, 40);
  if (!labels.length) return Object.freeze({ ok: false, reason: "class-names-required", limerick: "", labels: Object.freeze([]) });
  const stanzas = [];
  for (let index = 0; index < labels.length; index += 4) {
    const crew = labels.slice(index, index + 4);
    const lead = crew[0];
    const helpers = joinedNames(crew.slice(1));
    const endings = [
      [`${lead} arrived with a plan,`, `${helpers} all joined in and ran.`, "Their gizmo went POP!", "But the Bob crew would not stop,", "So they fixed it—and cheered, “Yes, we can!”"],
      [`A workshop starred ${lead},`, `${helpers} built something clever to try.`, "It wobbled—ker-plunk!", "Then launched a brass trunk,", "And the Bob crew yelled, “One more try!”"],
      [`Our inventors began with ${lead},`, `${helpers} made the next great machine.`, "It rattled and spun,", "Then declared testing fun,", "What a brilliant Bob team to be seen!"],
    ];
    stanzas.push(endings[stableNumber(crew.join("|")) % endings.length].join("\n"));
  }
  return Object.freeze({ ok: true, labels: Object.freeze(labels), limerick: stanzas.join("\n\n") });
}

const STUDENT_LIMERICKS = Object.freeze([
  (name) => `${name} came in with a plan,\nAnd built the best gadget they can.\nIt rattled—ker-pop!\nBut they would not stop,\nThen fixed it and shouted, “It ran!”`,
  (name) => `${name} made a machine,\nThe funniest ever yet seen.\nIt flashed a bright light,\nThen zoomed out of sight,\nAnd landed on one jelly bean!`,
  (name) => `${name} worked with a crew,\nOn a rocket painted bright blue.\nIt wobbled around,\nThen bounced on the ground,\nSo they tested and built version two!`,
]);

export function generateStudentNameBobLimerick(nameValue) {
  const label = boundedLabel(nameValue);
  if (!label || !/bob/i.test(label)) return Object.freeze({ ok: false, reason: "namebob-required", label: "", limerick: "" });
  return Object.freeze({ ok: true, label, limerick: STUDENT_LIMERICKS[stableNumber(label) % STUDENT_LIMERICKS.length](label) });
}

export function generateAllNameBobLimericks(currentLabels) {
  const classResult = generateClassNameBobLimerick(currentLabels);
  if (!classResult.ok) return Object.freeze({ ...classResult, studentLimericks: Object.freeze([]) });
  const studentLimericks = classResult.labels.map((label) => generateStudentNameBobLimerick(label)).filter((result) => result.ok);
  return Object.freeze({ ...classResult, studentLimericks: Object.freeze(studentLimericks) });
}
