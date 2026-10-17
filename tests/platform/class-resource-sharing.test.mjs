import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CLASS_RESOURCE_STORAGE_KEY, createClassResourceSharing } from "../../platform/scripts/class-resource-sharing.mjs";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test("resources are prepared, pushed, stopped, and isolated by class", () => {
  const store = createClassResourceSharing({ storage: memoryStorage(), now: () => 42 });
  assert.equal(store.prepare("a", { title: "Bridge Builder", type: "Builder", url: "../index.html", release: "manual" }).ok, true);
  assert.equal(store.push("a").resource.sharedAt, 42);
  assert.equal(store.read("b").active, null);
  store.stop("a");
  assert.equal(store.read("a").active, null);
  assert.equal(store.read("a").history.length, 1);
});

test("the student activity tray starts with four slots and can add more", () => {
  let clock = 100;
  const store = createClassResourceSharing({ storage: memoryStorage(), now: () => clock++ });
  for (const title of ["One", "Two", "Three", "Four"]) {
    store.prepare("a", { title, type: "Activity", url: `https://example.com/${title}`, release: "manual" });
    assert.equal(store.push("a").ok, true);
  }
  store.prepare("a", { title: "Five", type: "Activity", url: "https://example.com/five", release: "manual" });
  assert.equal(store.push("a").reason, "tray-full");
  assert.equal(store.addSlot("a").slotCount, 5);
  assert.equal(store.push("a").ok, true);
  assert.equal(store.read("a").activeResources.length, 5);
  store.prepare("a", { title: "Replacement", type: "Activity", url: "https://example.com/replacement", release: "manual" });
  assert.equal(store.push("a", 1).ok, true);
  assert.deepEqual(store.read("a").activeResources.map((item) => item.title), ["One", "Replacement", "Three", "Four", "Five"]);
  store.stop("a", 0);
  assert.deepEqual(store.read("a").activeResources.map((item) => item.title), ["Replacement", "Three", "Four", "Five"]);
  assert.equal(store.removeSlot("a").slotCount, 4);
  assert.equal(store.removeSlot("a").reason, "slot-in-use");
});

test("saved resources can be shown later or removed", () => {
  const store = createClassResourceSharing({ storage: memoryStorage(), now: () => 42 });
  const saved = store.prepare("a", { title: "Saved Builder", type: "Builder", url: "../index.html", release: "manual" }).resource;
  assert.equal(store.read("a").saved.length, 1);
  assert.equal(store.pushSaved("a", saved.id).ok, true);
  assert.equal(store.read("a").activeResources[0].title, "Saved Builder");
  store.removeSaved("a", saved.id);
  assert.equal(store.read("a").saved.length, 0);
});

test("a teacher can replace all visible resource choices together without a fixed maximum", () => {
  const store = createClassResourceSharing({ storage: memoryStorage(), now: () => 42 });
  const resources = ["One", "Two", "Three", "Four"].map((title) => ({ title, type: "Webpage", url: `https://example.com/${title}`, release: "manual" }));
  assert.equal(store.replaceActive("a", resources).ok, true);
  assert.deepEqual(store.read("a").activeResources.map((item) => item.title), ["One", "Two", "Three", "Four"]);
  assert.equal(store.replaceActive("a", [...resources, { title: "Five", type: "Webpage", url: "https://example.com/five" }]).ok, true);
  assert.equal(store.read("a").slotCount, 5);
});

test("scheduled resources release only for their selected trigger", () => {
  const store = createClassResourceSharing({ storage: memoryStorage() });
  store.prepare("a", { title: "Side Path", type: "Side Path", url: "https://example.com/path", release: "yellow" });
  assert.equal(store.release("a", "green").ok, false);
  assert.equal(store.release("a", "yellow").ok, true);
  assert.equal(store.release("a", "yellow").ok, false);
});

test("teacher and student views expose the browser-local push workflow", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  for (const text of ["Today’s Lesson", "Prepare and assign", "Today’s Resources", "How do you want today’s resources assigned", "Will any students need resources assigned a different way", "Whole class", "Individual students", "Teacher-chosen group", "Random group", "Add Different Assignment", "Choose a resource", "Share Resource Settings With Other Classes", "Add an Additional Slot", "Save for Later", "Show on Student Page", "Lesson Resources"]) assert.match(app, new RegExp(text));
  assert.match(app, /state\.audienceRows\.map/);
  assert.match(app, /Array\.from\(\{ length: row\.slotCount \}/);
  assert.match(app, /Slot \$\{index \+ 1\}/);
  assert.match(app, /data-action="edit-resource-slot"/);
  assert.match(app, /data-resource-audience-type/);
  assert.match(app, /data-resource-audience-student/);
  assert.match(app, /classResourceSharing\.resourcesForStudent/);
  assert.match(app, /classResourceSharing\.removeSlot/);
  for (const target of ["Activity", "Side Path", "Webpage", "Builder", "Workshop"]) assert.ok(app.includes("RESOURCE_TYPES") || app.includes(target));
  assert.match(app, /classResourceSharing\.release\(classId, "class-start"\)/);
  assert.match(app, /classResourceSharing\.release\(classId, phase\.color\)/);
  assert.match(app, /storage: window\.localStorage/);
  assert.match(app, /\[CLASS_RESOURCE_STORAGE_KEY, ACTIVITY_DIRECTIONS_STORAGE_KEY, WEEKLY_REFLECTION_STORAGE_KEY\]\.includes\(event\.key\)/);
  assert.match(app, /const classResourceState = classResourceSharing\.read\(state\.classId\)/);
  assert.match(app, /const activeClassResources = classResourceState\.activeResources/);
  assert.match(app, /classResourceState\.history/);
  assert.match(app, /platform-school-start-launcher-inline/);
  assert.equal(CLASS_RESOURCE_STORAGE_KEY, "thinkamigbob.class-resource-sharing.v1");
  assert.match(css, /\.platform-class-resource-sharing \{ grid-column: 1 \/ -1;/);
  assert.match(css, /\.platform-student-shared-resource \{ grid-column: 1 \/ -1;/);
  assert.match(css, /\.platform-student-activity-tray/);
  assert.match(app, /class="platform-rainbow-button-text">Open/);
  assert.match(css, /\.platform-rainbow-button-text \{[^}]*linear-gradient/);
  assert.match(css, /@keyframes platform-rainbow-text-pulse/);
});

test("resources can target the whole class, selected students, and copied class plans", () => {
  const store = createClassResourceSharing({ storage: memoryStorage(), now: () => 42 });
  assert.equal(store.read("a").audienceRows[0].audienceType, "whole-class");
  const row = store.addAudienceRow("a");
  store.updateAudience("a", row.id, { audienceType: "students", audienceIds: ["student-1"] });
  store.prepare("a", { title: "Choice Activity", type: "Activity", url: "https://example.com/choice", release: "manual" });
  assert.equal(store.push("a", 0, row.id).ok, true);
  assert.equal(store.resourcesForStudent("a", "student-1").some((item) => item.title === "Choice Activity"), true);
  assert.equal(store.resourcesForStudent("a", "student-2").some((item) => item.title === "Choice Activity"), false);
  assert.equal(store.copyPlan("a", "b").audienceRows.length, 2);
  assert.equal(store.read("b").audienceRows[1].resources[0].title, "Choice Activity");
});

test("named group settings can be saved and reused", () => {
  const store = createClassResourceSharing({ storage: memoryStorage(), now: () => 84 });
  store.setGroupRows("a", [
    { name: "Blue Team", audienceIds: ["student-1", "student-2"] },
    { name: "Gold Team", audienceIds: ["student-3"] },
  ]);
  const saved = store.saveGroupSet("a", "Workshop Teams");
  assert.equal(saved.ok, true);
  store.setGroupRows("a", [{ name: "Temporary", audienceIds: ["student-4"] }]);
  assert.equal(store.applyGroupSet("a", saved.preset.id).ok, true);
  assert.deepEqual(store.read("a").audienceRows.filter((row) => row.audienceType === "teacher-group").map((row) => row.audienceLabel), ["Blue Team", "Gold Team"]);
});

test("the main assignment method and optional exceptions are persisted", () => {
  const store = createClassResourceSharing({ storage: memoryStorage(), now: () => 90 });
  store.configureAssignment("a", "students", true);
  assert.equal(store.read("a").assignmentMode, "students");
  assert.equal(store.read("a").exceptionsEnabled, true);
  assert.equal(store.read("a").audienceRows[0].audienceType, "students");
  store.addAudienceRow("a");
  store.configureAssignment("a", "whole-class", false);
  assert.equal(store.read("a").audienceRows.length, 1);
});

test("teacher activity picker supports hover previews and click-to-fill selection", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  for (const text of ["Mission Activity library", "Choose a grade and weekly goal", "Grade 5", "Weekly Goal: Build a Shelter", "Design a Space Bedroom", "Side Path library", "Create", "Design", "Build", "Think", "Code"]) assert.match(app, new RegExp(text));
  assert.match(app, /data-action="select-catalog-resource"/);
  assert.match(app, /form\.elements\.title\.value = action\.dataset\.resourceTitle/);
  assert.match(app, /No verified \$\{topic\} activities have been imported yet/);
  assert.match(css, /\.platform-resource-browser-item:hover \.platform-resource-browser-children/);
  assert.match(css, /button:hover \.platform-resource-activity-detail/);
  assert.match(css, /font-size: clamp\(0\.95rem, 1\.25vw, 1\.08rem\)/);
});

test("teacher webpage picker searches, filters, batches, and keeps its catalog from students", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  for (const text of ["Teacher webpage library", "Choose the pages students may use", "Find a page", "Page group", "STEM Missions Home", "Grade 3/4 Mission Hub", "Grade 5/6 Mission Hub", "STEM Builder", "Show Selected Pages to Students", "Add Another Webpage", "Resource address", "needed only for a custom page"]) assert.match(app, new RegExp(text.replace(/[./]/g, "\\$&")));
  assert.match(app, /data-resource-picker-webpage/);
  assert.match(app, /data-webpage-search/);
  assert.match(app, /data-webpage-category/);
  assert.match(app, /data-action="show-selected-webpages"/);
  assert.match(app, /data-action="use-custom-webpage"/);
  assert.match(app, /data-active-resource-toggle/);
  assert.match(app, /classResourceSharing\.replaceActive/);
  assert.match(app, /webpagePicker\.hidden = resourceType\.value !== "Webpage"/);
  assert.match(css, /\.platform-resource-webpage-tools/);
  assert.match(css, /\.platform-resource-webpage-list/);
  const studentMarkup = app.slice(app.indexOf("function classResourceStudentMarkup"), app.indexOf("function weeklyReflectionTeacherMarkup"));
  assert.doesNotMatch(studentMarkup, /Webpage library|Grade 3\/4 Mission Hub|Grade 5\/6 Mission Hub/);
  assert.match(studentMarkup, /activeResources\.map/);
});
