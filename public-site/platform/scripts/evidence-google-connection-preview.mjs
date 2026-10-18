export const GOOGLE_CONNECTION_PREVIEW_STATUS = Object.freeze({
  NOT_CONNECTED: "NOT_CONNECTED",
  CONSENT_PREVIEW: "CONSENT_PREVIEW",
  CONNECTED_PREVIEW: "CONNECTED_PREVIEW",
});

export const GOOGLE_DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const STORAGE_KEY = "thinkamigbob.google-connection-preview.v1";

export function createGoogleConnectionPreview({ storage } = {}) {
  let memory = { version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED };

  function read() {
    try {
      const value = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
      if (value?.version === 1 && Object.values(GOOGLE_CONNECTION_PREVIEW_STATUS).includes(value.status)) return { ...value };
    } catch {
      // The in-memory preview remains usable for this page load.
    }
    return { ...memory };
  }

  function save(value) {
    memory = value;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(value));
      return { ok: true, value: { ...value } };
    } catch {
      return { ok: false, reason: "storage-unavailable" };
    }
  }

  return Object.freeze({
    read,
    begin() {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED) return { ok: false, reason: "already-started" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW });
    },
    connect({ teacherConfirmed, studentBoundaryConfirmed } = {}) {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW) return { ok: false, reason: "consent-not-open" };
      if (!teacherConfirmed) return { ok: false, reason: "teacher-confirmation-required" };
      if (!studentBoundaryConfirmed) return { ok: false, reason: "student-boundary-required" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.CONNECTED_PREVIEW, scope: GOOGLE_DRIVE_FILE_SCOPE, folderName: "THINKamigBOB Student Evidence" });
    },
    cancel() {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW) return { ok: false, reason: "consent-not-open" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED });
    },
    disconnect() {
      if (read().status !== GOOGLE_CONNECTION_PREVIEW_STATUS.CONNECTED_PREVIEW) return { ok: false, reason: "not-connected" };
      return save({ version: 1, status: GOOGLE_CONNECTION_PREVIEW_STATUS.NOT_CONNECTED });
    },
  });
}
