import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createVoiceMeterStore, rmsToVoiceLevel, voiceMeterState, VOICE_METER_LEVELS } from "../../platform/scripts/voice-meter.mjs";

function memoryStorage() { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }

test("voice levels persist and invalid choices fail closed", () => {
  const store = createVoiceMeterStore({ storage: memoryStorage() });
  assert.equal(store.read().key, "partner");
  assert.equal(store.setLevel("whisper").ok, true);
  assert.equal(store.read().key, "whisper");
  assert.equal(store.setLevel("invented").ok, false);
  assert.equal(store.readSensitivity(), 100);
  assert.equal(store.setSensitivity(135), 135);
  assert.equal(store.readSensitivity(), 135);
  assert.equal(store.setSensitivity(999), 150);
  assert.equal(VOICE_METER_LEVELS.length, 4);
});

test("meter classifies classroom volume without retaining audio", () => {
  assert.equal(voiceMeterState(20, 30), "green");
  assert.equal(voiceMeterState(40, 30), "yellow");
  assert.equal(voiceMeterState(60, 30), "red");
  assert.equal(rmsToVoiceLevel(new Uint8Array(64).fill(128)), 0);
  assert.ok(rmsToVoiceLevel(Uint8Array.from([0, 255, 0, 255])) > 90);
});

test("teacher and student display expose a private browser-only voice meter", () => {
  const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");
  for (const text of ["Classroom Voice Meter", "Start Voice Meter", "Stop Voice Meter", "Pause Voice Meter", "Open Large Class Voice Meter", "Close Class Voice Meter", "Audio is analyzed live in this browser and is never recorded or saved."]) assert.match(app, new RegExp(text));
  assert.match(app, /navigator\.mediaDevices\.getUserMedia\(\{ audio: true \}\)/);
  assert.match(app, /data-student-voice-meter/);
  assert.match(app, /id="platform-large-voice-meter-display"/);
  assert.match(app, /Expected voice level on large display/);
  assert.match(app, /Add the live Voice Meter to this display/);
  assert.match(app, /data-student-display-voice-meter/);
  assert.match(app, /studentDisplayVoiceMeterIsEnabled\(\) && !voiceMeterStream/);
  assert.match(app, /document\.querySelectorAll\("\[data-voice-meter-target\]"\)/);
  assert.match(app, /data-voice-sensitivity/);
  assert.match(app, /class="platform-floating-voice-bob"/);
  assert.match(app, /Bob is calm and happy/);
  assert.match(app, /Bob is asking the class to quiet down/);
  assert.match(app, /Bob is uncomfortable because the room is too loud/);
  assert.match(app, /voiceMeter\.readSensitivity\(\)/);
  assert.match(app, /voiceMeter\.setSensitivity/);
  assert.match(css, /\.platform-voice-meter-fill/);
  assert.match(css, /\.platform-voice-sensitivity/);
  assert.match(css, /\.platform-student-display-combined \.platform-student-voice-meter \{ grid-column: 1; grid-row: 3;/);
  assert.match(css, /\.platform-large-voice-meter \{[^}]*width: min\(88vw, 75rem\)/);
  assert.match(css, /\.platform-large-voice-controls \{[^}]*grid-template-columns: repeat\(3/);
  assert.match(css, /data-meter-state="red"/);
  assert.match(css, /bob-voice-meter-states\.png/);
  assert.match(css, /bob-idle-poses\.png/);
  assert.match(css, /bob-idle-poses-2\.png/);
  assert.match(css, /platform-bob-idle-poses 48s step-end infinite/);
  assert.match(css, /\.platform-floating-voice-bob\[data-meter-state="yellow"\]/);
  assert.match(css, /\.platform-floating-voice-bob\[data-meter-state="red"\]/);
  assert.match(app, /state !== voiceBobState && now - voiceBobStateChangedAt >= 2400/);
  assert.match(app, /document\.body\.dataset\.voiceFrame = voiceBobState/);
  assert.match(css, /data-voice-frame="yellow"/);
  assert.match(css, /data-voice-frame="red"/);
  assert.match(css, /platform-volume-frame-yellow/);
  assert.match(css, /platform-volume-frame-red/);
  assert.match(app, /floatingBobCorners = \["bottom-right", "top-left"\]/);
  assert.match(app, /setInterval\(relocateFloatingBob, 26000\)/);
  assert.match(app, /floatingBobIdleSet === 1 \? 2 : 1/);
  assert.match(css, /bob-walk-right\.png/);
  assert.match(css, /bob-walk-left\.png/);
  assert.match(css, /\.platform-floating-voice-bob\.is-walking-out/);
  assert.match(css, /\.platform-floating-voice-bob\.is-walking-in/);
  assert.match(css, /platform-bob-walk-out-right 2\.8s linear forwards/);
  assert.match(css, /transform 2200ms ease-in/);
});
