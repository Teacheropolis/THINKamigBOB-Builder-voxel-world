import test from "node:test";
import assert from "node:assert/strict";
import { createPlatformIdentityWorker } from "../../platform/integrations/cloudflare/platform-identity-worker.mjs";
import { PLATFORM_SESSION_COOKIE } from "../../platform/integrations/cloudflare/platform-auth-d1-repository.mjs";

const origin = "https://platform.example.org";
const token = Buffer.alloc(32, 3).toString("base64url");

test("public identity health reports readiness without exposing configuration", async () => {
  const worker = createPlatformIdentityWorker();
  const disabled = await worker.fetch(new Request(`${origin}/api/auth/v1/health`), {});
  assert.equal(disabled.status, 200);
  assert.deepEqual(await disabled.json(), { ok: true, productionReady: false });
  assert.equal(disabled.headers.get("cache-control"), "no-store");
  const enabled = await worker.fetch(new Request(`${origin}/api/auth/v1/health`), environment());
  assert.deepEqual(await enabled.json(), { ok: true, productionReady: true });
});

function environment() {
  return {
    PRODUCTION_ENABLED: "true",
    PLATFORM_ORIGIN: origin,
    GOOGLE_SIGNIN_CLIENT_ID: "client-1",
    STUDENT_ENTRY_RATE_LIMIT: { async limit() { return { success: true }; } },
    PLATFORM_AUTH: {
      async fetch(request) {
        const path = new URL(request.url).pathname;
        if (path.endsWith("teacher-session")) return Response.json({ token, expiresAt: Date.now() + 1000 }, { status: 201 });
        if (path.endsWith("student-session")) return Response.json({ token, expiresAt: Date.now() + 1000 }, { status: 201 });
        if (path.endsWith("lesson-steps")) return Response.json(request.method === "GET" ? { steps: [{ id: "lesson-1", status: "released" }] } : { step: { id: "lesson-1", status: "released" } }, { status: request.method === "GET" ? 200 : 201 });
        if (path.endsWith("classrooms")) return Response.json(request.method === "GET" ? { classrooms: [] } : { classroom: { classId: "class-1", name: "STEM Lab", classCode: "ABCDEFGH", students: [] } }, { status: request.method === "GET" ? 200 : 201 });
        if (path.endsWith("session")) return Response.json({ teacher: { id: "teacher-1" }, student: null });
        return Response.json({ revoked: true });
      },
    },
  };
}

test("teacher Google entry verifies double-submit CSRF and sets a secure platform session", async () => {
  const worker = createPlatformIdentityWorker({ verifierFactory: () => ({ async verify(value) { assert.equal(value, "signed-google-token"); return { subject: "google-1", hostedDomain: null }; } }) });
  const body = new URLSearchParams({ credential: "signed-google-token", g_csrf_token: "csrf-1" });
  const response = await worker.fetch(new Request(`${origin}/api/auth/v1/google`, { method: "POST", headers: { cookie: "g_csrf_token=csrf-1", "content-type": "application/x-www-form-urlencoded" }, body }), environment());
  assert.equal(response.status, 303);
  assert.match(response.headers.get("set-cookie"), new RegExp(`^${PLATFORM_SESSION_COOKIE}=`));
  assert.match(response.headers.get("location"), /#\/teacher\/dashboard$/);
  const denied = await worker.fetch(new Request(`${origin}/api/auth/v1/google`, { method: "POST", headers: { cookie: "g_csrf_token=wrong" }, body }), environment());
  assert.equal(denied.status, 403);
});

test("student classroom entry is same-origin and never uses Google", async () => {
  let verifierUsed = false;
  const worker = createPlatformIdentityWorker({ verifierFactory: () => { verifierUsed = true; return {}; } });
  const response = await worker.fetch(new Request(`${origin}/api/auth/v1/student`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ classCode: "ROOM-1", studentCode: "STUDENT-1" }) }), environment());
  assert.equal(response.status, 201);
  assert.equal((await response.json()).redirect, `${origin}/platform/index.html#/student/dashboard`);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
  assert.equal(verifierUsed, false);
  const crossOrigin = await worker.fetch(new Request(`${origin}/api/auth/v1/student`, { method: "POST", headers: { origin: "https://evil.example" }, body: "{}" }), environment());
  assert.equal(crossOrigin.status, 403);
});

test("signout revokes the server session and clears its cookie", async () => {
  const worker = createPlatformIdentityWorker();
  const response = await worker.fetch(new Request(`${origin}/api/auth/v1/signout`, { method: "POST", headers: { origin, cookie: `${PLATFORM_SESSION_COOKIE}=${token}` } }), environment());
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
});

test("public session bootstrap reflects the private HttpOnly session", async () => {
  const response = await createPlatformIdentityWorker().fetch(new Request(`${origin}/api/auth/v1/session`, { headers: { cookie: `${PLATFORM_SESSION_COOKIE}=${token}` } }), environment());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { teacher: { id: "teacher-1" }, student: null });
});

test("identity entry stays disabled without complete production configuration", async () => {
  const response = await createPlatformIdentityWorker().fetch(new Request(`${origin}/api/auth/v1/student`, { method: "POST" }), {});
  assert.equal(response.status, 503);
});

test("student entry rate limit fails before private credential validation", async () => {
  const limited = environment();
  limited.STUDENT_ENTRY_RATE_LIMIT = { async limit() { return { success: false }; } };
  const response = await createPlatformIdentityWorker().fetch(new Request(`${origin}/api/auth/v1/student`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ classCode: "ROOM-1", studentCode: "STUDENT-1" }) }), limited);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
});

test("teacher classroom setup remains authenticated through the private service", async () => {
  const worker = createPlatformIdentityWorker();
  const response = await worker.fetch(new Request(`${origin}/api/classrooms/v1`, { method: "POST", headers: { origin, cookie: `${PLATFORM_SESSION_COOKIE}=${token}` }, body: JSON.stringify({ name: "STEM Lab", studentLabels: ["Avery", "Jordan"] }) }), environment());
  assert.equal(response.status, 201);
  assert.equal((await response.json()).classroom.classCode, "ABCDEFGH");
});

test("shared lesson steps pass through the public same-origin classroom boundary", async () => {
  const worker = createPlatformIdentityWorker();
  const saved = await worker.fetch(new Request(`${origin}/api/classrooms/v1/lesson-steps`, { method: "POST", headers: { origin, cookie: `${PLATFORM_SESSION_COOKIE}=${token}` }, body: JSON.stringify({ classId: "class-1", step: { title: "Build", directions: "Build a bridge.", status: "released" } }) }), environment());
  assert.equal(saved.status, 201);
  assert.equal((await saved.json()).step.status, "released");
  const listed = await worker.fetch(new Request(`${origin}/api/classrooms/v1/lesson-steps`, { headers: { cookie: `${PLATFORM_SESSION_COOKIE}=${token}` } }), environment());
  assert.equal((await listed.json()).steps[0].id, "lesson-1");
  const denied = await worker.fetch(new Request(`${origin}/api/classrooms/v1/lesson-steps`, { method: "POST", headers: { origin: "https://evil.example" }, body: "{}" }), environment());
  assert.equal(denied.status, 403);
});
