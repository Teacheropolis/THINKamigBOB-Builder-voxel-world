import test from "node:test";
import assert from "node:assert/strict";
import { createProductionIdentityClient, parseStudentLabels, productionIdentityConfiguration } from "../../platform/scripts/platform-production-identity.mjs";

test("production identity stays off on localhost even when requested", () => {
  const documentRef = { querySelector(selector) { return { content: selector.includes("client-id") ? "client-1" : "enabled" }; } };
  assert.equal(productionIdentityConfiguration({ documentRef, locationRef: { protocol: "http:", hostname: "127.0.0.1" } }).enabled, false);
  assert.equal(productionIdentityConfiguration({ documentRef, locationRef: { protocol: "https:", hostname: "platform.example.org" } }).googleEnabled, true);
});

test("student access remains separate from secure teacher sign-in", () => {
  const documentRef = { querySelector(selector) { return { content: selector.includes("client-id") ? "client-1" : selector.includes("student-access") ? "disabled" : "enabled" }; } };
  const configuration = productionIdentityConfiguration({ documentRef, locationRef: { protocol: "https:", hostname: "platform.example.org" } });
  assert.equal(configuration.googleEnabled, true);
  assert.equal(configuration.studentEnabled, false);
});

test("disabled client fails closed without making a network request", async () => {
  let calls = 0;
  const client = createProductionIdentityClient({ enabled: false, origin: "https://platform.example.org", fetchImpl: async () => { calls += 1; } });
  assert.deepEqual(await client.createClassroom({ name: "STEM", studentLabels: ["Avery"] }), { ok: false, reason: "setup-required" });
  assert.equal(calls, 0);
});

test("roster parsing trims lines and rejects unsafe classroom lists", () => {
  assert.deepEqual(parseStudentLabels(" Avery \n\n Jordan "), { ok: true, labels: ["Avery", "Jordan"] });
  assert.equal(parseStudentLabels("Avery\navery").reason, "duplicate-student-label");
  assert.equal(parseStudentLabels("").reason, "student-count");
});
