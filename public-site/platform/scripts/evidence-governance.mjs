export const EVIDENCE_GOVERNANCE_STATUS = Object.freeze({ DRAFT_REQUIRED: "DRAFT_REQUIRED", DRAFT_SAVED: "DRAFT_SAVED" });

export const EVIDENCE_GOVERNANCE_OPTIONS = Object.freeze({
  retention: Object.freeze(["School policy required", "End of school year", "30 days after course ends"]),
  deletionAuthority: Object.freeze(["Administrator approval required", "Teacher request plus administrator approval"]),
  recovery: Object.freeze(["Move to recoverable trash before permanent deletion"]),
  exportRule: Object.freeze(["Teacher export offered before deletion"]),
});

export function createEvidenceGovernanceDraft({ storage } = {}) {
  const key = "thinkamigbob.evidence-governance-draft.v1";
  const empty = { status: EVIDENCE_GOVERNANCE_STATUS.DRAFT_REQUIRED, retention: "", deletionAuthority: "", recovery: "", exportRule: "" };
  let memory = { ...empty };

  function read() {
    try {
      const value = JSON.parse(storage?.getItem(key) || "null");
      if (value?.version === 1 && value.status === EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED) return { ...value };
    } catch {
      // The in-memory draft remains available for this page load.
    }
    return { ...memory };
  }

  return Object.freeze({
    read,
    save(value = {}) {
      for (const field of Object.keys(EVIDENCE_GOVERNANCE_OPTIONS)) {
        if (!EVIDENCE_GOVERNANCE_OPTIONS[field].includes(value[field])) return { ok: false, reason: `invalid-${field}` };
      }
      const draft = { version: 1, status: EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED, retention: value.retention, deletionAuthority: value.deletionAuthority, recovery: value.recovery, exportRule: value.exportRule };
      memory = draft;
      try { storage?.setItem(key, JSON.stringify(draft)); } catch { return { ok: false, reason: "storage-unavailable" }; }
      return { ok: true, value: { ...draft } };
    },
  });
}
