export const PB002J_ACTIVITY_ID = "pb002j-am-g05-005";
export const PB002J_ACTIVITY_VERSION = 2;
export const PB002J_DIRECTIONS_URL = "https://docs.google.com/presentation/d/1GzkVODaIdAweiSCuFxJC3NOAQEE8GmwdMO7z05Inx64/edit?usp=drivesdk";
export const PB002J_SOURCE_SHA256 = "806c738a58f6b85c525b35865cf3711435fee4d4210f14213dcf99c653203dc7";
export const PB002J_ALLOWED_HEADERS = Object.freeze([
  "Authorization", "Content-Type", "If-Match", "X-PB-002J-Request-Id",
]);
export const PB002J_WEEK_ID = "week-1";
export const PB002J_GOAL_ID = "pb002j-goal-g05-001";
export const PB002J_AVAILABILITY_MODES = Object.freeze(["student-choice", "specific-activity"]);

export function validateCatalog(catalog) {
  const activity = catalog?.activities?.[0];
  const valid = catalog?.schemaVersion === 1 && catalog?.catalogVersion === 1 &&
    Array.isArray(catalog.activities) && catalog.activities.length === 1 &&
    activity?.id === PB002J_ACTIVITY_ID && activity?.version === PB002J_ACTIVITY_VERSION &&
    activity?.directions?.url === PB002J_DIRECTIONS_URL &&
    activity?.directions?.approvedSourceSha256 === PB002J_SOURCE_SHA256 &&
    activity?.availabilityApproved === true && activity?.builderAvailable === false &&
    activity?.workshopAvailable === false;
  return valid ? { ok: true, activity } : { ok: false, reason: "catalog-contract-mismatch" };
}

export function validateClassContextId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{12,96}$/.test(value);
}

export function validateConfiguration(value, catalog, expectedClassContextId) {
  const catalogResult = validateCatalog(catalog);
  if (!catalogResult.ok) return catalogResult;
  if (!validateClassContextId(value?.classContextId) || value.classContextId !== expectedClassContextId) {
    return { ok: false, reason: "invalid-class-context" };
  }
  if (value.activityId !== PB002J_ACTIVITY_ID || value.activityVersion !== PB002J_ACTIVITY_VERSION) {
    return { ok: false, reason: "unknown-or-unapproved-activity" };
  }
  if (!Array.isArray(value.weekIds) || value.weekIds.length !== 1 || value.weekIds[0] !== PB002J_WEEK_ID) {
    return { ok: false, reason: "invalid-week-selection" };
  }
  if (!Array.isArray(value.goalIds) || value.goalIds.length !== 1 || value.goalIds[0] !== PB002J_GOAL_ID) {
    return { ok: false, reason: "invalid-goal-selection" };
  }
  if (!PB002J_AVAILABILITY_MODES.includes(value.availabilityMode)) {
    return { ok: false, reason: "invalid-availability-mode" };
  }
  if (value.availabilityMode === "specific-activity" && value.selectedActivityId !== PB002J_ACTIVITY_ID) {
    return { ok: false, reason: "invalid-specific-activity" };
  }
  if (value.directionsUrl !== PB002J_DIRECTIONS_URL || value.builderAvailable !== false || value.workshopAvailable !== false) {
    return { ok: false, reason: "protected-availability-mismatch" };
  }
  if (value.evidenceDestination !== "Student Engineering Notebook / Evidence Portfolio") {
    return { ok: false, reason: "evidence-destination-mismatch" };
  }
  return { ok: true, configuration: structuredClone(value), activity: catalogResult.activity };
}

export function publicProjection({ revision = 0, configuration = null, catalog, withdrawn = false } = {}) {
  const catalogResult = validateCatalog(catalog);
  if (!catalogResult.ok || withdrawn || !configuration) {
    return { schemaVersion: 1, status: withdrawn ? "withdrawn" : "empty", revision, currentGoal: null, primaryStartChoices: [], sidePaths: [] };
  }
  const checked = validateConfiguration(configuration, catalog, configuration.classContextId);
  if (!checked.ok) {
    return { schemaVersion: 1, status: "unavailable", revision, currentGoal: null, primaryStartChoices: [], sidePaths: [] };
  }
  const activity = checked.activity;
  return {
    schemaVersion: 1,
    status: "ready",
    revision,
    currentGoal: { id: activity.goal.id, title: activity.goal.title, grade: activity.grade },
    primaryStartChoices: [{
      id: activity.id,
      version: activity.version,
      title: activity.title,
      grade: activity.grade,
      goal: activity.goal,
      directionsUrl: activity.directions.url,
      weekIds: [...configuration.weekIds],
      availabilityMode: configuration.availabilityMode,
      evidenceDestination: activity.evidence.destination,
      builderAvailable: false,
      workshopAvailable: false,
    }],
    sidePaths: [],
  };
}
