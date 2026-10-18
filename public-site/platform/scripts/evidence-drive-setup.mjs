export const DRIVE_SETUP_STATUS = Object.freeze({
  NOT_CONFIGURED: "not-configured",
  PREPARED: "prepared",
});

export const PILOT_DRIVE_DESTINATION = Object.freeze({
  folderId: "1LEb7tIqisBKNEvtLhGGRpW3PKB8OIY74",
  folderUrl: "https://drive.google.com/drive/folders/1LEb7tIqisBKNEvtLhGGRpW3PKB8OIY74",
  folderName: "THINKamigBOB Student Evidence Pilot",
  accountLabel: "teacheropolis@gmail.com",
  uploadEndpoint: "https://script.google.com/macros/s/AKfycbyKaeDz1c4xGSItQ-kHZpqqVe3dCinC7_1Jn88GQSJcoFybCv3vGHGti7F-HRrgdfntcw/exec",
  status: "PERSISTENT_FICTIONAL_REVIEW_VALIDATED",
});

const STORAGE_KEY = "thinkamigbob.evidence-drive-setup.v1";

export function createEvidenceDriveSetup({ storage } = {}) {
  function empty() {
    return { status: DRIVE_SETUP_STATUS.NOT_CONFIGURED, folderName: PILOT_DRIVE_DESTINATION.folderName };
  }

  function read() {
    if (!storage) return empty();
    try {
      const value = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
      if (value?.status !== DRIVE_SETUP_STATUS.PREPARED || typeof value.folderName !== "string") return empty();
      return { status: value.status, folderName: value.folderName };
    } catch {
      return empty();
    }
  }

  function prepare({ folderName, privacyConfirmed }) {
    const normalized = String(folderName || "").trim();
    if (normalized.length < 3 || normalized.length > 80) return { ok: false, reason: "invalid-folder-name" };
    if (!privacyConfirmed) return { ok: false, reason: "privacy-confirmation-required" };
    const value = { status: DRIVE_SETUP_STATUS.PREPARED, folderName: normalized };
    if (!storage) return { ok: true, value };
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(value));
      return { ok: true, value };
    } catch {
      return { ok: false, reason: "storage-unavailable" };
    }
  }

  return Object.freeze({ read, prepare });
}
