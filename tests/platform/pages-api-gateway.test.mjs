import test from "node:test";
import assert from "node:assert/strict";
import { onRequest, PAGES_API_BINDINGS } from "../../functions/api/[[path]].js";

function service(name, calls) {
  return {
    async fetch(request) {
      calls.push([name, request.url, request.method]);
      return Response.json({ service: name });
    },
  };
}

test("Pages API gateway sends identity and classroom routes to the identity service", async () => {
  const calls = [];
  const env = { PLATFORM_IDENTITY: service("identity", calls), EVIDENCE_API: service("evidence", calls) };
  for (const path of ["/api/auth/v1/health", "/api/classrooms/v1/lesson-steps?classId=class-1"]) {
    const request = new Request(`https://thinkamigbob-platform.pages.dev${path}`);
    assert.deepEqual(await (await onRequest({ request, env })).json(), { service: "identity" });
  }
  assert.equal(calls.length, 2);
  assert.ok(calls.every(([name]) => name === "identity"));
});

test("Pages API gateway sends evidence routes to the evidence service", async () => {
  const calls = [];
  const env = { PLATFORM_IDENTITY: service("identity", calls), EVIDENCE_API: service("evidence", calls) };
  const request = new Request("https://thinkamigbob-platform.pages.dev/api/evidence/google/v1/health");
  assert.deepEqual(await (await onRequest({ request, env })).json(), { service: "evidence" });
  assert.deepEqual(calls, [["evidence", request.url, "GET"]]);
});

test("Pages API gateway fails closed when a binding is absent", async () => {
  const response = await onRequest({ request: new Request("https://thinkamigbob-platform.pages.dev/api/auth/v1/session"), env: {} });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "connection-setup-required" });
  assert.deepEqual(PAGES_API_BINDINGS, { identity: "PLATFORM_IDENTITY", evidence: "EVIDENCE_API" });
});
