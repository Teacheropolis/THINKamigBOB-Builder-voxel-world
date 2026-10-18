const DEFAULT_PORT = 8783;

export function createPB002JClasswideClient({ windowRef = window, fetchImpl = windowRef.fetch.bind(windowRef), port = DEFAULT_PORT } = {}) {
  const baseUrl = `${windowRef.location.protocol}//${windowRef.location.hostname}:${port}/api/pb-002j/v1`;
  let teacherKey = "";
  let revision = 0;
  let classContextId = "";

  async function request(path, options = {}) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      ...options,
    });
    const body = await response.json().catch(() => ({ error: "invalid-service-response" }));
    if (!response.ok) throw Object.assign(new Error(body.error ?? "prototype-service-error"), { status: response.status, body });
    if (Number.isInteger(body.revision)) revision = body.revision;
    return body;
  }

  return Object.freeze({
    health: async () => {
      const result = await request("/health");
      classContextId = result.classContextId ?? "";
      return result;
    },
    projection: () => request("/projection"),
    connectTeacher: async (key) => {
      teacherKey = String(key ?? "").trim();
      if (!teacherKey) throw new Error("teacher-key-required");
      return request("/catalog", { headers: { Authorization: `Bearer ${teacherKey}` } });
    },
    configure: (configuration) => request("/configuration", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${teacherKey}`,
        "Content-Type": "application/json",
        "If-Match": String(revision),
        "X-PB-002J-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(configuration),
    }),
    withdraw: () => request("/withdrawals", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${teacherKey}`,
        "Content-Type": "application/json",
        "If-Match": String(revision),
        "X-PB-002J-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({ activityId: "pb002j-am-g05-005", activityVersion: 2 }),
    }),
    clearTeacherKey() { teacherKey = ""; },
    getRevision: () => revision,
    getClassContextId: () => classContextId,
  });
}
