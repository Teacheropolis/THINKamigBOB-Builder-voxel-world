const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function parseStudentLabels(value) {
  const labels = String(value ?? "").split(/\r?\n/).map((label) => label.trim()).filter(Boolean);
  if (labels.length < 1 || labels.length > 40) return { ok: false, reason: "student-count" };
  if (labels.some((label) => label.length > 80)) return { ok: false, reason: "student-label-too-long" };
  const normalized = labels.map((label) => label.toLocaleLowerCase());
  if (new Set(normalized).size !== normalized.length) return { ok: false, reason: "duplicate-student-label" };
  return { ok: true, labels };
}

export function productionIdentityConfiguration({ documentRef = document, locationRef = window.location } = {}) {
  const requested = documentRef.querySelector('meta[name="thinkamigbob-production-identity"]')?.content === "enabled";
  const studentRequested = documentRef.querySelector('meta[name="thinkamigbob-student-access"]')?.content === "enabled";
  const clientId = documentRef.querySelector('meta[name="thinkamigbob-google-signin-client-id"]')?.content?.trim() || "";
  const securePublicHost = locationRef.protocol === "https:" && !LOCAL_HOSTS.has(locationRef.hostname);
  const enabled = requested && securePublicHost;
  return Object.freeze({ enabled, studentEnabled: enabled && studentRequested, clientId, googleEnabled: enabled && Boolean(clientId) });
}

export function createProductionIdentityClient({ fetchImpl = globalThis.fetch, enabled = false, origin = globalThis.location?.origin } = {}) {
  async function request(path, options = {}) {
    if (!enabled) return { ok: false, reason: "setup-required" };
    try {
      const response = await fetchImpl(`${origin}${path}`, { credentials: "same-origin", ...options });
      const value = await response.json();
      return response.ok ? { ok: true, value } : { ok: false, reason: value.error || value.status || "request-failed", status: response.status };
    } catch {
      return { ok: false, reason: "service-unavailable" };
    }
  }

  return Object.freeze({
    studentEntry({ classCode, studentCode }) {
      return request("/api/auth/v1/student", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ classCode, studentCode }) });
    },
    createClassroom({ name, studentLabels }) {
      return request("/api/classrooms/v1", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, studentLabels }) });
    },
    listClassrooms() { return request("/api/classrooms/v1"); },
    session() { return request("/api/auth/v1/session"); },
    signOut() { return request("/api/auth/v1/signout", { method: "POST" }); },
  });
}
