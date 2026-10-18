async function requestJson(fetchImpl, url, options = {}) {
  const response = await fetchImpl(url, { credentials: "include", cache: "no-store", ...options });
  let payload = {};
  try { payload = await response.json(); } catch {}
  if (!response.ok) return { ok: false, status: response.status, error: payload.error || "classroom-service-unavailable" };
  return { ok: true, status: response.status, ...payload };
}

export function createClassroomLessonClient({ serviceOrigin = "", fetchImpl = fetch } = {}) {
  const endpoint = `${String(serviceOrigin).replace(/\/$/, "")}/api/classrooms/v1/lesson-steps`;
  return Object.freeze({
    saveStep({ classId, step }) {
      return requestJson(fetchImpl, endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ classId, step }),
      });
    },
    teacherSteps(classId) {
      return requestJson(fetchImpl, `${endpoint}?classId=${encodeURIComponent(classId)}`);
    },
    studentSteps() {
      return requestJson(fetchImpl, endpoint);
    },
  });
}
