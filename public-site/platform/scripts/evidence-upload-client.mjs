export function createEvidenceUploadClient({ brokerOrigin, fetchImpl = globalThis.fetch } = {}) {
  if (!brokerOrigin || typeof fetchImpl !== "function") throw new Error("broker-origin-and-fetch-required");
  return Object.freeze({
    async publishLaunch({ teacherKey, activity }) {
      if (!teacherKey || !String(activity || "").trim()) return { ok: false, reason: "teacher-key-and-activity-required" };
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/launch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Evidence-Teacher-Key": teacherKey },
        body: JSON.stringify({ activity }),
      });
    },
    async currentLaunch() {
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/launch`, { method: "GET" });
    },
    async requestTicket({ launchId, studentId }) {
      if (!launchId || !studentId) return { ok: false, reason: "launch-and-student-required" };
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ launchId, studentId }),
      });
    },
    async listEvidence({ teacherKey }) {
      if (!teacherKey) return { ok: false, reason: "teacher-key-required" };
      return requestJson(fetchImpl, `${brokerOrigin}/api/evidence/v1/evidence`, { method: "GET", headers: { "X-Evidence-Teacher-Key": teacherKey } });
    },
    async loadEvidencePreview({ teacherKey, evidenceId }) {
      if (!teacherKey || !evidenceId) return { ok: false, reason: "teacher-key-and-evidence-required" };
      try {
        const response = await fetchImpl(`${brokerOrigin}/api/evidence/v1/evidence/${encodeURIComponent(evidenceId)}/content`, { headers: { "X-Evidence-Teacher-Key": teacherKey } });
        if (!response.ok) return { ok: false, reason: "preview-unavailable" };
        return { ok: true, blob: await response.blob() };
      } catch {
        return { ok: false, reason: "broker-unavailable" };
      }
    },
    async uploadImage({ ticket, file, fileName, evidenceType = "Photo" }) {
      if (!ticket || !file || !file.type?.startsWith("image/")) return { ok: false, reason: "valid-image-and-ticket-required" };
      try {
        const response = await fetchImpl(`${brokerOrigin}/api/evidence/v1/uploads`, {
          method: "POST",
          headers: { Authorization: `Bearer ${ticket}`, "Content-Type": file.type, "X-Evidence-Filename": fileName || file.name || "evidence-image", "X-Evidence-Type": evidenceType },
          body: file,
        });
        const result = await response.json();
        return response.ok && result.ok ? result : { ok: false, reason: result.error || "upload-failed" };
      } catch {
        return { ok: false, reason: "broker-unavailable" };
      }
    },
  });
}

async function requestJson(fetchImpl, url, options) {
  try {
    const response = await fetchImpl(url, options);
    const result = await response.json();
    return response.ok && result.ok ? result : { ok: false, reason: result.error || "pilot-service-request-failed" };
  } catch {
    return { ok: false, reason: "broker-unavailable" };
  }
}
