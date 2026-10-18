export const CLASS_SETUP_PROFILES_KEY = "thinkamigbob.class-setup-profiles.v1";

const empty = (firstClassId = "") => ({ version: 1, currentClassId: firstClassId, profiles: {} });

export function createClassSetupProfiles({ storage, classIds = [] } = {}) {
  const allowed = new Set(classIds);
  const read = () => {
    try {
      const value = JSON.parse(storage?.getItem(CLASS_SETUP_PROFILES_KEY) || "null");
      if (!value || value.version !== 1) return empty(classIds[0]);
      const currentClassId = allowed.has(value.currentClassId) ? value.currentClassId : classIds[0] ?? "";
      const profiles = Object.fromEntries(Object.entries(value.profiles ?? {}).filter(([id]) => allowed.has(id)));
      return { version: 1, currentClassId, profiles };
    } catch { return empty(classIds[0]); }
  };
  const write = (state) => { storage?.setItem(CLASS_SETUP_PROFILES_KEY, JSON.stringify(state)); return state; };
  return Object.freeze({
    read,
    select(classId) { const state = read(); return allowed.has(classId) ? write({ ...state, currentClassId: classId }) : state; },
    save(classId, profile) { const state = read(); if (!allowed.has(classId)) return state; return write({ ...state, profiles: { ...state.profiles, [classId]: profile } }); },
    profile(classId) { return read().profiles[classId] ?? null; },
    copy(sourceId, targetIds, components) {
      const state = read(); const source = state.profiles[sourceId]; if (!source) return state; const profiles = { ...state.profiles };
      targetIds.filter((id) => allowed.has(id) && id !== sourceId).forEach((id) => {
        const current = profiles[id] ?? {};
        profiles[id] = { ...current, ...(components.timer ? { schedule: source.schedule } : {}), ...(components.memo ? { memo: source.memo } : {}) };
      });
      return write({ ...state, profiles });
    },
  });
}

export function createBrowserClassSetupProfiles(windowRef, classIds) {
  let storage; try { storage = windowRef?.localStorage; } catch { storage = undefined; }
  return createClassSetupProfiles({ storage, classIds });
}
