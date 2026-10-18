export const VOICE_METER_STORAGE_KEY = "thinkamigbob.voice-meter.v1";

export const VOICE_METER_LEVELS = Object.freeze([
  { key: "silent", label: "Silent work", icon: "🤫", target: 12 },
  { key: "whisper", label: "Whisper voices", icon: "🗣️", target: 28 },
  { key: "partner", label: "Partner voices", icon: "👥", target: 48 },
  { key: "team", label: "Team discussion", icon: "👨‍👩‍👧‍👦", target: 68 },
]);

export function createVoiceMeterStore({ storage } = {}) {
  const readState = () => {
    try {
      const value = JSON.parse(storage?.getItem(VOICE_METER_STORAGE_KEY) || "null");
      return { level: value?.level, sensitivity: Math.max(50, Math.min(150, Number(value?.sensitivity) || 100)) };
    } catch {
      return { level: null, sensitivity: 100 };
    }
  };
  const read = () => {
    const key = readState().level;
    return VOICE_METER_LEVELS.find((item) => item.key === key) ?? VOICE_METER_LEVELS[2];
  };
  const setLevel = (key) => {
    const level = VOICE_METER_LEVELS.find((item) => item.key === key);
    if (!level) return { ok: false, level: read() };
    try { storage?.setItem(VOICE_METER_STORAGE_KEY, JSON.stringify({ ...readState(), level: level.key })); } catch { /* Memory-only use still works. */ }
    return { ok: true, level };
  };
  const readSensitivity = () => readState().sensitivity;
  const setSensitivity = (value) => {
    const sensitivity = Math.max(50, Math.min(150, Math.round(Number(value) || 100)));
    try { storage?.setItem(VOICE_METER_STORAGE_KEY, JSON.stringify({ ...readState(), level: read().key, sensitivity })); } catch { /* Memory-only use still works. */ }
    return sensitivity;
  };
  return Object.freeze({ read, setLevel, readSensitivity, setSensitivity });
}

export function voiceMeterState(value, target) {
  const level = Math.max(0, Math.min(100, Number(value) || 0));
  const ceiling = Math.max(0, Math.min(100, Number(target) || 0));
  if (level <= ceiling) return "green";
  if (level <= ceiling + 14) return "yellow";
  return "red";
}

export function rmsToVoiceLevel(samples) {
  if (!samples?.length) return 0;
  const rms = Math.sqrt(samples.reduce((sum, sample) => {
    const centered = (sample - 128) / 128;
    return sum + centered * centered;
  }, 0) / samples.length);
  return Math.max(0, Math.min(100, Math.round(rms * 230)));
}
