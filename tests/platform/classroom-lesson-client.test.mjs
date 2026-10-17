import test from "node:test";
import assert from "node:assert/strict";
import { createClassroomLessonClient } from "../../platform/scripts/classroom-lesson-client.mjs";

test("classroom lesson client saves teacher steps and reads teacher or student projections", async () => {
  const calls = [];
  const client = createClassroomLessonClient({ serviceOrigin: "https://classroom.example", fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify(url.includes("classId=") ? { steps: [{ id: "teacher-step" }] } : options?.method === "POST" ? { step: { id: "saved-step" } } : { steps: [{ id: "student-step", status: "released" }] }), { status: options?.method === "POST" ? 201 : 200, headers: { "content-type": "application/json" } });
  } });
  assert.equal((await client.saveStep({ classId: "class-1", step: { title: "Build" } })).step.id, "saved-step");
  assert.equal((await client.teacherSteps("class-1")).steps[0].id, "teacher-step");
  assert.equal((await client.studentSteps()).steps[0].status, "released");
  assert.equal(calls.every((call) => call.options.credentials === "include" && call.options.cache === "no-store"), true);
  assert.deepEqual(JSON.parse(calls[0].options.body), { classId: "class-1", step: { title: "Build" } });
});

test("classroom lesson client returns a safe failure when the service is unavailable", async () => {
  const client = createClassroomLessonClient({ fetchImpl: async () => new Response(JSON.stringify({ error: "setup-required" }), { status: 503 }) });
  assert.deepEqual(await client.studentSteps(), { ok: false, status: 503, error: "setup-required" });
});
