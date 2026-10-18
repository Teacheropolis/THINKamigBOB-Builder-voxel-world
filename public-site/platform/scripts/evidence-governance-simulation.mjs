export const GOVERNANCE_SIMULATION_STATUS = Object.freeze({
  EMPTY: "EMPTY",
  PENDING_ADMIN: "PENDING_ADMIN",
  APPROVED_FOR_TRASH: "APPROVED_FOR_TRASH",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
});

const STORAGE_KEY = "thinkamigbob.evidence-governance-simulation.v1";
const FINAL_STATUSES = new Set([
  GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH,
  GOVERNANCE_SIMULATION_STATUS.REJECTED,
  GOVERNANCE_SIMULATION_STATUS.CANCELED,
]);

function clean(value, maximum = 240) {
  return String(value || "").trim().slice(0, maximum);
}

function emptyState() {
  return { version: 1, status: GOVERNANCE_SIMULATION_STATUS.EMPTY, request: null, audit: [] };
}

export function createEvidenceGovernanceSimulation({ storage, now = () => new Date().toISOString() } = {}) {
  let memory = emptyState();

  function persist(state) {
    memory = state;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function read() {
    try {
      const value = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
      if (value?.version === 1 && Array.isArray(value.audit)) return structuredClone(value);
    } catch {
      // Continue with the in-memory simulation for this page load.
    }
    return structuredClone(memory);
  }

  function event(action, detail) {
    return { action, detail, at: now() };
  }

  return Object.freeze({
    read,
    submit({ evidenceId, evidenceLabel, reason, exportOffered } = {}) {
      const current = read();
      if (current.status === GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN) return { ok: false, reason: "request-pending" };
      if (!clean(evidenceId) || !clean(evidenceLabel)) return { ok: false, reason: "evidence-required" };
      if (!clean(reason)) return { ok: false, reason: "reason-required" };
      if (exportOffered !== true) return { ok: false, reason: "export-required" };
      const request = { id: `simulation-${Date.now()}`, evidenceId: clean(evidenceId), evidenceLabel: clean(evidenceLabel), reason: clean(reason), exportOffered: true };
      const state = { version: 1, status: GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN, request, audit: [...current.audit, event("REQUEST_SUBMITTED", "Teacher requested administrator review; export was offered.")] };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    },
    decide({ decision, reviewer, note } = {}) {
      const current = read();
      if (current.status !== GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN) return { ok: false, reason: "no-pending-request" };
      if (!clean(reviewer)) return { ok: false, reason: "reviewer-required" };
      if (!clean(note)) return { ok: false, reason: "note-required" };
      if (!['approve', 'reject'].includes(decision)) return { ok: false, reason: "decision-required" };
      const approved = decision === "approve";
      const state = {
        ...current,
        status: approved ? GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH : GOVERNANCE_SIMULATION_STATUS.REJECTED,
        request: { ...current.request, reviewer: clean(reviewer, 80), reviewNote: clean(note) },
        audit: [...current.audit, event(approved ? "ADMIN_APPROVED" : "ADMIN_REJECTED", approved ? "Approved for a recoverable-trash simulation only." : "Request rejected; evidence remains unchanged.")],
      };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    },
    cancel() {
      const current = read();
      if (current.status !== GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN) return { ok: false, reason: "no-pending-request" };
      const state = { ...current, status: GOVERNANCE_SIMULATION_STATUS.CANCELED, audit: [...current.audit, event("REQUEST_CANCELED", "Teacher canceled the request; evidence remains unchanged.")] };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    },
    reset() {
      const current = read();
      if (!FINAL_STATUSES.has(current.status)) return { ok: false, reason: "simulation-not-finished" };
      const state = { ...emptyState(), audit: [...current.audit, event("SIMULATION_RESET", "Ready for another fictional governance request.")] };
      if (!persist(state)) return { ok: false, reason: "storage-unavailable" };
      return { ok: true, value: read() };
    },
  });
}
