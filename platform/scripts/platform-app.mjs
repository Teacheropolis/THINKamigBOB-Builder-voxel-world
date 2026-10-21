import {
  DEVELOPMENT_FIXTURE_ACCESS,
  DEVELOPMENT_FIXTURE_NOTICE,
  findClassByCode,
  getClassById,
  getClassForTeacher,
  getClassesForTeacher,
  getDevelopmentIdentifier,
  getRosterForClass,
  getStudentById,
  getTeacherById,
  validateStudentIdentifier,
  validateTeacherCredentials,
} from "./platform-fixtures.mjs";
import { createSessionStore, PLATFORM_ROLES } from "./platform-session.mjs";
import { customLetters as CURSIVE_STROKE_LETTERS } from "./cursive-strokes.mjs";
import {
  createLessonTimer,
  formatLessonTime,
  LESSON_TIMER_STATES,
  MAX_LESSON_MINUTES,
  MIN_LESSON_MINUTES,
} from "./lesson-timer.mjs";
import { createBrowserClassTimerSchedule, evaluateTimerPhases, recommendedTimerPhases, TIMER_SOUND_OPTIONS, WEEKDAYS } from "./class-timer-schedule.mjs";
import {
  createTeacherMemoStore,
  TEACHER_MEMO_COLORS,
  TEACHER_MEMO_MAX_CHARACTERS,
  TEACHER_MEMO_SIZES,
  TEACHER_MEMO_STYLES,
} from "./teacher-memo.mjs";
import {
  createStudentDisplayModeStore,
  STUDENT_DISPLAY_MODES,
} from "./student-display-mode.mjs";
import {
  createTodaysMissionStore,
  TODAYS_MISSION_AVAILABILITY,
  TODAYS_MISSION_FOCUS_MAX_CHARACTERS,
  TODAYS_MISSION_TITLE_MAX_CHARACTERS,
} from "./todays-mission.mjs";
import { createPB002JClasswideClient } from "./pb-002j-classwide-client.mjs";
import { createPB002JClasswideController } from "./pb-002j-classwide-controller.mjs";
import { createEvidenceFoundation, EVIDENCE_TYPES, PILOT_ACTIVITY, PILOT_TEACHER_EVIDENCE } from "./evidence-foundation.mjs";
import { createEvidenceDriveSetup, DRIVE_SETUP_STATUS, PILOT_DRIVE_DESTINATION } from "./evidence-drive-setup.mjs";
import { createEvidenceUploadClient } from "./evidence-upload-client.mjs";
import { createEvidenceGovernanceDraft, EVIDENCE_GOVERNANCE_OPTIONS, EVIDENCE_GOVERNANCE_STATUS } from "./evidence-governance.mjs";
import { createEvidenceGovernanceSimulation, GOVERNANCE_SIMULATION_STATUS } from "./evidence-governance-simulation.mjs";
import { createGoogleConnectionPreview, GOOGLE_CONNECTION_PREVIEW_STATUS, GOOGLE_DRIVE_FILE_SCOPE } from "./evidence-google-connection-preview.mjs";
import { assessGoogleOAuthReadiness, GOOGLE_OAUTH_ENDPOINTS } from "./evidence-google-oauth-readiness.mjs";
import { createProductionIdentityClient, parseStudentLabels, productionIdentityConfiguration } from "./platform-production-identity.mjs";
import { createClassroomLessonClient } from "./classroom-lesson-client.mjs";
import { generateAllNameBobLimericks, generateClassNameBobLimerick, generateNameBobs, generateStudentNameBobLimerick, retryNameBob } from "./namebob-generator.mjs";
import { createBrowserMessageLibrary } from "./message-library.mjs";
import { createBrowserClassSetupProfiles } from "./class-setup-profiles.mjs";
import { CLASS_RESOURCE_STORAGE_KEY, createClassResourceSharing, RESOURCE_RELEASES, RESOURCE_TYPES } from "./class-resource-sharing.mjs?v=preview-20261004-7";
import { ACTIVITY_DIRECTIONS_STORAGE_KEY, createActivityDirections } from "./activity-directions.mjs?v=preview-20261016-2";
import {
  CAPTAINS_LOG_PRESET_PROMPTS,
  CAPTAINS_LOG_ASSIGNMENT_OPTIONS,
  CAPTAINS_LOG_SCHEDULE_OPTIONS,
  CAPTAINS_LOG_WEEKDAYS,
  captainLogCoachingQuestions,
  createWeeklyReflections,
  REFLECTION_ACTIVITY_RATING_OPTIONS,
  REFLECTION_BADGE_OPTIONS,
  REFLECTION_HELP_OPTIONS,
  REFLECTION_HELP_OTHER_OPTIONS,
  REFLECTION_IMPROVEMENT_OPTIONS,
  REFLECTION_PROGRESS_OPTIONS,
  reflectionActivityWindowStart,
  WEEKLY_REFLECTION_STORAGE_KEY,
} from "./weekly-reflections.mjs";
import { matchAutomaticVisual } from "./automatic-visuals.mjs";
import { createVoiceMeterStore, rmsToVoiceLevel, voiceMeterState, VOICE_METER_LEVELS } from "./voice-meter.mjs?v=preview-20261004-1";
import { createWhiteboardObject, duplicateWhiteboardObject, hitTestObjects, moveWhiteboardObject, objectBounds, resizeWhiteboardObject } from "./whiteboard-objects.mjs";

export const ROUTES = Object.freeze({
  WELCOME: "/welcome",
  PREVIEW_TEACHER: "/preview/teacher",
  PREVIEW_CLASSROOM_DEMO: "/preview/classroom-demo",
  PREVIEW_STUDENT: "/preview/student",
  TEACHER_LOGIN: "/teacher/login",
  TEACHER_CREATE: "/teacher/create",
  TEACHER_RECOVERY: "/teacher/recovery",
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_CLASSES: "/teacher/classes",
  STUDENT_ENTRY: "/student/entry",
  STUDENT_ROSTER: "/student/roster",
  STUDENT_IDENTIFIER: "/student/identifier",
  STUDENT_DASHBOARD: "/student/dashboard",
});

const root = document.querySelector("#platform-root");
const STUDENT_VOCABULARY = Object.freeze({
  attempt: "Something you try in order to learn what happens.",
  attempts: "Things you try in order to learn what happens.",
  challenge: "Something difficult that gives you a chance to learn.",
  evidence: "Facts, observations, or results that support your thinking.",
  improve: "To make something work better than it did before.",
  limitation: "A part that cannot yet do everything you want it to do.",
  opportunity: "A chance to try, learn, or make something better.",
  outcome: "What happened as a result of an action or test.",
  progress: "Movement toward a goal, even when the work is not finished.",
  reveal: "To show something that was not clear before.",
  uncertainty: "Not knowing yet what will happen or which answer is best.",
  unexpected: "Different from what you thought would happen.",
});
const STUDENT_NAMEPLATE_STORAGE_KEY = "thinkamigbob.student-nameplate.v1";
const CAPTAINS_LOG_EDITOR_WEEK_KEY = "thinkamigbob.captains-log-editor-weeks.v1";
const STUDENT_NAMEPLATE_FONTS = Object.freeze(["slab", "classic", "cursive", "playful"]);
const STUDENT_NAMEPLATE_BACKGROUNDS = Object.freeze(["cream", "brass", "blue", "green", "parchment"]);
const BIRD_CHIRPING_SOUND_URL = new URL("./assets/sounds/bird-chirping-loswin23.mp3", window.location.href).href;
const GUITAR_LOOP_SOUND_URL = new URL("./assets/sounds/guitar-loop-time-ending-idoberg.mp3", window.location.href).href;
const CHOIR_TRANSITION_SOUND_URL = new URL("./assets/sounds/choir-heavenly-transition-floraphonic.mp3", window.location.href).href;
const DRUM_LOOP_SOUND_URL = new URL("./assets/sounds/drum-loop-kamhunt.mp3", window.location.href).href;
const TRAP_LOOP_DRUMS_SOUND_URL = new URL("./assets/sounds/trap-loop-drums-kamhunt.mp3", window.location.href).href;
const SOFT_PIANO_SOUND_URL = new URL("./assets/sounds/soft-piano-royalty-free-music.mp3", window.location.href).href;
const CARDINAL_SOUND_URL = new URL("./assets/sounds/cardinal-freesound-community.mp3", window.location.href).href;
const session = createSessionStore(window.sessionStorage);
const lessonTimer = createLessonTimer({ storage: window.sessionStorage });
const classTimerSchedule = createBrowserClassTimerSchedule(window);
const teacherMemo = createTeacherMemoStore({ storage: window.sessionStorage });
const messageLibrary = createBrowserMessageLibrary(window);
const pilotTeacherClasses = getClassesForTeacher("teacher-preview-1");
let classSetupProfiles = createBrowserClassSetupProfiles(window, pilotTeacherClasses.map((item) => item.id));
const classResourceSharing = createClassResourceSharing({ storage: window.localStorage });
const activityDirections = createActivityDirections({ storage: window.localStorage });
const weeklyReflections = createWeeklyReflections({ storage: window.localStorage });
const voiceMeter = createVoiceMeterStore({ storage: window.sessionStorage });
const todaysMission = createTodaysMissionStore({ storage: window.sessionStorage });
const studentDisplayMode = createStudentDisplayModeStore({ storage: window.sessionStorage });
const pb002jClasswide = createPB002JClasswideController({ client: createPB002JClasswideClient({ windowRef: window }) });
const evidenceFoundation = createEvidenceFoundation({ storage: window.sessionStorage });
const evidenceDriveSetup = createEvidenceDriveSetup({ storage: window.sessionStorage });
const evidenceUploadClient = createEvidenceUploadClient({ brokerOrigin: window.location.port === "8784" ? window.location.origin : "http://127.0.0.1:8784" });
const evidenceGovernance = createEvidenceGovernanceDraft({ storage: window.sessionStorage });
const evidenceGovernanceSimulation = createEvidenceGovernanceSimulation({ storage: window.sessionStorage });
const googleConnectionPreview = createGoogleConnectionPreview({ storage: window.sessionStorage });
const productionIdentityConfig = productionIdentityConfiguration();
const productionIdentity = createProductionIdentityClient({ enabled: productionIdentityConfig.enabled, origin: window.location.origin });
const classroomLesson = createClassroomLessonClient({ serviceOrigin: window.location.origin });
let classroomLessonServiceNotice = "";
let productionStudentClassLabels = [];
let productionStudentDisplayLabel = "";
const PRODUCTION_CURRENT_CLASS_KEY = "thinkamigbob.production.current-class.v1";
let productionTeacherClasses = [];

function productionClassRecord(classroom = {}) {
  const id = String(classroom.id || classroom.classId || "");
  const name = String(classroom.name || "Classroom");
  return { ...classroom, id, displayName: name, periodLabel: "", teacherId: session.read().teacherId };
}

function setProductionTeacherClasses(classrooms = [], preferredClassId = "") {
  productionTeacherClasses = classrooms.map(productionClassRecord).filter((item) => item.id);
  classSetupProfiles = createBrowserClassSetupProfiles(window, productionTeacherClasses.map((item) => item.id));
  const saved = preferredClassId || window.sessionStorage.getItem(PRODUCTION_CURRENT_CLASS_KEY) || "";
  const selected = productionTeacherClasses.some((item) => item.id === saved) ? saved : productionTeacherClasses[0]?.id || "";
  if (selected) window.sessionStorage.setItem(PRODUCTION_CURRENT_CLASS_KEY, selected);
}

function lessonResourceForService(resource = {}, fallbackTitle = "Lesson resource") {
  const mediaType = String(resource.mediaType || "webpage");
  const type = mediaType === "image" ? "image" : mediaType === "youtube" ? "video" : "link";
  let url = String(resource.url || "").trim();
  try { url = new URL(url, window.location.href).href; } catch {}
  return { type, label: String(resource.title || fallbackTitle).trim().slice(0, 100), url };
}

function lessonResourceFromService(resource = {}) {
  const url = String(resource.url || "");
  const mediaType = resource.type === "image" ? "image" : resource.type === "video" && /(?:youtube\.com|youtu\.be)/i.test(url) ? "youtube" : "webpage";
  return { mediaType, title: String(resource.label || ""), url };
}

function lessonStepForService(card, order = 0) {
  return {
    id: card.id,
    title: card.title,
    directions: card.directions,
    resources: (card.resources || []).map((resource) => lessonResourceForService(resource, card.title)),
    status: card.status === "released" ? "released" : "draft",
    order,
  };
}

function lessonStepFromService(step = {}) {
  return {
    id: step.id,
    title: step.title,
    directions: step.directions,
    resources: (step.resources || []).map(lessonResourceFromService),
    status: step.status === "released" ? "released" : "draft",
    createdAt: Number(step.updatedAt) || Date.now(),
    updatedAt: Number(step.updatedAt) || Date.now(),
    releasedAt: Number(step.releasedAt) || null,
  };
}

async function saveLessonStepToService(classId, card) {
  if (!productionIdentityConfig.enabled || !classId || !card) return { ok: true, localPreview: true };
  const cards = activityDirections.read(classId).cards;
  const order = Math.max(0, cards.findIndex((item) => item.id === card.id));
  const result = await classroomLesson.saveStep({ classId, step: lessonStepForService(card, order) });
  classroomLessonServiceNotice = result.ok ? "Saved securely for this class." : "Saved in this browser, but the classroom service could not be reached.";
  return result;
}

async function loadLessonStepsFromService(state = session.read()) {
  if (!productionIdentityConfig.enabled) return { ok: true, localPreview: true };
  const classId = state.role === PLATFORM_ROLES.STUDENT ? state.classId : currentTeacherClass(state.teacherId)?.id;
  if (!classId) return { ok: false, error: "class-not-selected" };
  const result = state.role === PLATFORM_ROLES.STUDENT ? await classroomLesson.studentSteps() : await classroomLesson.teacherSteps(classId);
  if (!result.ok) { classroomLessonServiceNotice = "The secure classroom service is temporarily unavailable."; return result; }
  const steps = Array.isArray(result.steps) ? result.steps : [];
  if (state.role === PLATFORM_ROLES.STUDENT) productionStudentClassLabels = Array.isArray(result.studentLabels) ? result.studentLabels : [];
  if (state.role === PLATFORM_ROLES.STUDENT) productionStudentDisplayLabel = String(result.studentLabel || "").trim();
  activityDirections.replaceCards(classId, steps.map(lessonStepFromService));
  classroomLessonServiceNotice = state.role === PLATFORM_ROLES.STUDENT ? "Teacher directions loaded." : "Lesson steps loaded securely.";
  return result;
}
let oneTimeClassroomCodes = null;
let evidenceDraft = null;
let evidenceNotice = "";
let teacherEvidenceFilter = "All";
let teacherEvidenceSelection = PILOT_TEACHER_EVIDENCE[0]?.id ?? "";
let evidenceTeacherRuntimeKey = "";
let teacherLiveEvidence = [];
let teacherLiveEvidenceSelection = "";
let teacherLiveEvidencePreviewUrl = "";
let teacherLiveEvidenceNotice = "No live fictional submissions loaded yet.";
let teacherLiveEvidenceFilters = { studentId: "All", activity: "All", evidenceType: "All" };
const MISSIONS_FIRST_REMINDER = "Missions First! Read your directions before opening Builder or Workshop.";
const MISSION_FOCUS_OPTIONS = Object.freeze([
  "Learn what today's mission is asking us to do.",
  "Build, test, and make one thoughtful improvement.",
  "Use evidence to explain what worked and what changed.",
  "Work together, solve problems, and share our thinking.",
  "Reflect on what we learned and what we would try next.",
]);
const CUSTOM_MISSION_FOCUS = "custom";
const LESSON_TIMER_DISPLAY_SESSION_KEY = "thinkamigbob.pb002b.lesson-timer-display.v1";
const CLASSROOM_DEMO_SESSION_KEY = "thinkamigbob.classroom-demo.v1";
const PRESENTATION_TIMER_VIEW_KEY = "thinkamigbob.presentation-timer-view.v1";
const STUDENT_DISPLAY_VOICE_METER_SESSION_KEY = "thinkamigbob.student-display.voice-meter.v1";
const WHITEBOARD_SESSION_KEY = "thinkamigbob.classroom-whiteboard.v1";
const WHITEBOARD_OBJECT_SESSION_KEY = "thinkamigbob.classroom-whiteboard-objects.v1";
const WHITEBOARD_PAGES_SESSION_KEY = "thinkamigbob.classroom-whiteboard-pages.v1";
const WHITEBOARD_VIEW_SESSION_KEY = "thinkamigbob.classroom-whiteboard-view.v1";
const WHITEBOARD_LIBRARY_KEY = "thinkamigbob.classroom-whiteboard-library.v1";
const WHITEBOARD_BOB_MEASUREMENT_COACH_KEY = "thinkamigbob.whiteboard-bob-measurement-coach.v1";
const TEACHER_ASSIGNED_RESEARCH_KEY = "thinkamigbob.teacher-assigned-research.v1";
const TEACHER_RESEARCH_LINK_BANK_KEY = "thinkamigbob.teacher-research-link-bank.v1";
const DO_NOW_POSTS_KEY = "thinkamigbob.do-now-posts.v1";
const DO_NOW_LIVE_KEY = "thinkamigbob.do-now-live.v1";
const CLASSROOM_BOB_DISPLAY_KEY = "thinkamigbob.classroom-bob-display.v1";
const CLASSROOM_BOB_DAILY_MENU_KEY = "thinkamigbob.classroom-bob-daily-menu.v1";
const CLASSROOM_BOB_UNLOCK_KEY = "thinkamigbob.classroom-bob-unlocks.v1";
const CLASSROOM_BOB_DAILY_KEY = "thinkamigbob.classroom-bob-daily.v1";
const BOB_POSE_COUNT = 200;
const VOICE_METER_HISTORY_KEY = "thinkamigbob.voice-meter-history.v1";
const VOICE_METER_ACTIVITY_KEY = "thinkamigbob.voice-meter-activity.v1";
const VOICE_METER_STAR_GOAL_KEY = "thinkamigbob.voice-meter-star-goal.v1";
const VOICE_METER_WEEKLY_STAR_GOAL_KEY = "thinkamigbob.voice-meter-weekly-star-goal.v1";
const VOICE_METER_DISPLAY_MODE_KEY = "thinkamigbob.voice-meter-display-mode.v1";
const VOICE_METER_ACTIVITIES = Object.freeze([
  { key: "teacher-led", label: "Teacher-led instruction", icon: "👩‍🏫", target: 58 },
  { key: "independent", label: "Independent seat work", icon: "🤫", target: 22 },
  { key: "collaborative", label: "Collaborative activity", icon: "👥", target: 68 },
]);
const WHITEBOARD_EMOJI_STAMPS = Object.freeze([
  { category: "Faces and feelings", emojis: [["😀", "Grinning"], ["😃", "Happy"], ["😊", "Smiling"], ["😂", "Laughing"], ["🤩", "Excited"], ["🥳", "Celebrating"], ["😍", "Love it"], ["🤔", "Thinking"], ["🧐", "Investigating"], ["😮", "Surprised"], ["😎", "Confident"], ["😅", "Phew"], ["😕", "Confused"], ["😢", "Sad"], ["😴", "Tired"], ["🤯", "Mind blown"]] },
  { category: "Hands and people", emojis: [["👍", "Thumbs up"], ["👎", "Thumbs down"], ["👏", "Applause"], ["🙌", "Celebrate"], ["✋", "Raised hand"], ["👋", "Wave"], ["🤝", "Teamwork"], ["💪", "Strong"], ["🙏", "Thank you"], ["👀", "Look"], ["🧠", "Brain"], ["🗣️", "Speaking"], ["👩‍🔬", "Scientist"], ["👨‍🔬", "Scientist"], ["👩‍🏭", "Builder"], ["👨‍🏭", "Builder"]] },
  { category: "STEM and school", emojis: [["🔬", "Microscope"], ["🔭", "Telescope"], ["🧪", "Test tube"], ["🧫", "Petri dish"], ["⚗️", "Lab flask"], ["🧬", "DNA"], ["🧲", "Magnet"], ["⚙️", "Gear"], ["🛠️", "Tools"], ["🔧", "Wrench"], ["🔩", "Bolt"], ["📐", "Triangle ruler"], ["📏", "Ruler"], ["✏️", "Pencil"], ["📚", "Books"], ["💡", "Idea"], ["🤖", "Robot"], ["🚀", "Rocket"], ["🛰️", "Satellite"], ["💻", "Computer"]] },
  { category: "Nature and weather", emojis: [["☀️", "Sun"], ["🌤️", "Partly cloudy"], ["🌧️", "Rain"], ["⛈️", "Storm"], ["❄️", "Snow"], ["🌈", "Rainbow"], ["🔥", "Fire"], ["💧", "Water"], ["🌊", "Wave"], ["🌱", "Seedling"], ["🌳", "Tree"], ["🌻", "Sunflower"], ["🌎", "Earth"], ["🌙", "Moon"], ["⭐", "Star"]] },
  { category: "Animals", emojis: [["🐶", "Dog"], ["🐱", "Cat"], ["🐭", "Mouse"], ["🐰", "Rabbit"], ["🦊", "Fox"], ["🐻", "Bear"], ["🐼", "Panda"], ["🦁", "Lion"], ["🐸", "Frog"], ["🐵", "Monkey"], ["🐔", "Chicken"], ["🐧", "Penguin"], ["🦉", "Owl"], ["🦋", "Butterfly"], ["🐝", "Bee"], ["🐢", "Turtle"], ["🐙", "Octopus"], ["🐠", "Fish"]] },
  { category: "Food and objects", emojis: [["🍎", "Apple"], ["🍕", "Pizza"], ["🍪", "Cookie"], ["🧁", "Cupcake"], ["🥤", "Drink"], ["⚽", "Soccer ball"], ["🏀", "Basketball"], ["🎨", "Art"], ["🎵", "Music"], ["🎲", "Game die"], ["🧩", "Puzzle"], ["🎯", "Target"], ["🏆", "Trophy"], ["🎁", "Gift"], ["⏰", "Clock"], ["🔔", "Bell"]] },
  { category: "Marks and symbols", emojis: [["✅", "Complete"], ["❌", "Incorrect"], ["⭐", "Star"], ["❤️", "Heart"], ["💛", "Yellow heart"], ["💚", "Green heart"], ["💙", "Blue heart"], ["💜", "Purple heart"], ["❗", "Important"], ["❓", "Question"], ["➡️", "Right arrow"], ["⬅️", "Left arrow"], ["⬆️", "Up arrow"], ["⬇️", "Down arrow"], ["➕", "Plus"], ["➖", "Minus"], ["💯", "One hundred"], ["✨", "Sparkles"]] },
]);
const knownRoutes = new Set(Object.values(ROUTES));
let lessonTimerPresentationInterval = null;
let lessonTimerDisplayTrigger = null;
let activitySideTimer = { durationSeconds: 300, remainingSeconds: 300, status: "ready", endsAt: 0 };
let stopwatchSeconds = 0;
let stopwatchInterval = null;
let namePickerRemovedStudentIds = new Set();
let namePickerRotation = 0;
let smartboardDrag = null;
let lastTimerPhaseKey = null;
let lastTimerStatus = null;
let lastStudentPhaseKey = null;
let studentPhasePopupTimeout = null;
let studentTimerPopout = null;
let classroomPresentationWindow = null;
let classroomCompanionWindow = null;
let doNowDraft = null;
const smartboardToolPopouts = new Map();
let memoFormatRevision = Date.now();
let memoSelectionRange = null;
let memoTypingFormat = null;
let pendingScrollTarget = "";
let pendingOpenClassResourceEditor = false;
let reflectionRecognition = null;
let voiceMeterAudioContext = null;
let voiceMeterStream = null;
let voiceMeterAnimationFrame = null;
let voiceMeterDisplayTrigger = null;
let voiceMeterUsage = null;
let voiceBobState = "green";
let voiceBobStateChangedAt = 0;
let floatingBobCornerIndex = 0;
let floatingBobIdleSet = 1;
let floatingBobRoamingInterval = null;
let floatingBobGreenSince = Date.now();
let floatingBobPoseBag = [];
let floatingBobLastPose = -1;
let floatingBobUnlockMessageUntil = 0;
let floatingBobUnlockMessage = "";
let teacherComparisonClassId = "";
let whiteboardDisplayTrigger = null;
let whiteboardUndoStack = [];
let whiteboardRedoStack = [];
let whiteboardDrawing = null;
let whiteboardObjects = [];
let whiteboardPages = [];
let whiteboardCurrentPageIndex = 0;
let whiteboardPageDock = "left";
let whiteboardSelectedObjectId = "";
let whiteboardClipboard = null;
let whiteboardGridUnit = "plain";
let whiteboardBackground = { type: "white", color1: "#ffffff", color2: "#d8edf5", imageSrc: "", element: null };
let whiteboardRulerUnit = "none";
let whiteboardZoom = 100;
let whiteboardRuler = { x: 40, y: 420, length: 600, angle: 0, sides: "both" };
let whiteboardPendingDimension = null;
let whiteboardDrawingTitle = "Workshop Drawing";
let whiteboardControlsDock = "top";
let whiteboardControlsHidden = false;
let whiteboardLassoPoints = [];
let whiteboardLassoBounds = null;
let whiteboardSelectionDownload = "";
let whiteboardContextPoint = null;
let whiteboardDeleteNextObject = false;
let pixelStudio = { size: 16, bits: 4, frames: [], sourceFrames: [], frameIndex: 0, pixels: [], drawing: false, palette: [] };
let pixelStudioPreviewTimer = null;

function lessonTimerDisplayIsStoredOpen() {
  try {
    return window.sessionStorage.getItem(LESSON_TIMER_DISPLAY_SESSION_KEY) === "open";
  } catch {
    return false;
  }
}

function classroomDemoModeIsEnabled() {
  try { return window.sessionStorage.getItem(CLASSROOM_DEMO_SESSION_KEY) === "enabled"; }
  catch { return false; }
}

function setClassroomDemoMode(enabled) {
  try {
    if (enabled) window.sessionStorage.setItem(CLASSROOM_DEMO_SESSION_KEY, "enabled");
    else window.sessionStorage.removeItem(CLASSROOM_DEMO_SESSION_KEY);
  } catch {
    // Demo content can still render for the current navigation.
  }
}

function seedClassroomDemo() {
  const classId = "class-preview-1";
  const now = Date.now();
  classSetupProfiles.select(classId);
  todaysMission.save({
    title: "Build and Test a Weight-Bearing Bridge",
    focus: "Use evidence from testing to strengthen one part of your bridge design.",
    builder: TODAYS_MISSION_AVAILABILITY.AVAILABLE,
    workshop: TODAYS_MISSION_AVAILABILITY.AVAILABLE,
  });
  teacherMemo.save("Welcome engineers! Review your team plan, test carefully, and record one improvement before cleanup.", { color: "light-blue", size: "extra-large", style: "bold" });
  classResourceSharing.replaceActive(classId, [
    { id: "demo-mission-bridge", type: "Mission Activity", title: "Bridge Strength Challenge", url: "https://example.test/bridge-strength", release: "class-start" },
    { id: "demo-builder", type: "Builder", title: "Digital Bridge Builder", url: "https://example.test/bridge-builder", release: "green" },
    { id: "demo-side-path", type: "Side Path", title: "Why Triangles Make Structures Strong", url: "https://example.test/triangle-structures", release: "manual" },
    { id: "demo-reflection", type: "Webpage", title: "Bridge Test Reflection", url: "https://example.test/bridge-reflection", release: "red" },
  ]);
  const schedule = classTimerSchedule.read();
  classTimerSchedule.save({ ...schedule, enabled: false, durationMinutes: 52, pomodoroEnabled: true, phases: recommendedTimerPhases(52) });
  lessonTimer.startScheduled(52, 31 * 60 + 24);
  classSetupProfiles.save(classId, { schedule: classTimerSchedule.read(), memo: teacherMemo.read(), mission: todaysMission.read(), readiness: { mission: "new", timer: "saved", safeguards: "saved" } });
  const whiteboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="100%" height="100%" fill="#f9fcfd"/><path d="M0 54H960M0 108H960M0 162H960M0 216H960M0 270H960M0 324H960M0 378H960M0 432H960M0 486H960M96 0V540M192 0V540M288 0V540M384 0V540M480 0V540M576 0V540M672 0V540M768 0V540M864 0V540" stroke="#d8e7ec"/><text x="40" y="55" font-family="Arial" font-size="30" font-weight="700" fill="#123346">Bridge Test: Team Design Review</text><path d="M160 390L300 230L440 390L580 230L720 390M160 390H720" fill="none" stroke="#16698e" stroke-width="14" stroke-linejoin="round"/><path d="M135 410H745" stroke="#2d7d5b" stroke-width="12"/><text x="235" y="465" font-family="Arial" font-size="24" fill="#2d7d5b">Add triangle braces before the second test</text></svg>`;
  const boardImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(whiteboardSvg)}`;
  writeWhiteboardLibrary([{ id: "demo-whiteboard", title: "Bridge Test Review", classId, scheduleType: "none", day: "", date: "", studentDisplay: true, gridUnit: "cm", rulerUnit: "metric", image: boardImage, displayImage: boardImage, objects: [], savedAt: now - 18 * 60 * 1000 }, ...readWhiteboardLibrary().filter((board) => board.id !== "demo-whiteboard")]);
  const voiceHistory = [
    { classId, usedAt: now - 24 * 60 * 60 * 1000, activityMode: "collaborative", durationSeconds: 2380, detectedSeconds: { "teacher-led": 720, independent: 510, collaborative: 1150 }, goalSeconds: 2380, loudSeconds: 265, average: 43, peak: 76 },
    { classId, usedAt: now - 3 * 24 * 60 * 60 * 1000, activityMode: "teacher-led", durationSeconds: 2250, detectedSeconds: { "teacher-led": 1080, independent: 390, collaborative: 780 }, goalSeconds: 2250, loudSeconds: 510, average: 51, peak: 84 },
    { classId: "class-preview-2", usedAt: now - 24 * 60 * 60 * 1000, activityMode: "collaborative", durationSeconds: 2310, detectedSeconds: { "teacher-led": 600, independent: 330, collaborative: 1380 }, goalSeconds: 2310, loudSeconds: 620, average: 58, peak: 89 },
  ];
  try { window.localStorage.setItem(VOICE_METER_HISTORY_KEY, JSON.stringify(voiceHistory)); } catch {}
}

function storeLessonTimerDisplayOpen(isOpen) {
  try {
    if (isOpen) {
      window.sessionStorage.setItem(LESSON_TIMER_DISPLAY_SESSION_KEY, "open");
    } else {
      window.sessionStorage.removeItem(LESSON_TIMER_DISPLAY_SESSION_KEY);
    }
  } catch {
    // The current page can still open and close the display without persistence.
  }
}

function studentDisplayVoiceMeterIsEnabled() {
  try {
    return window.sessionStorage.getItem(STUDENT_DISPLAY_VOICE_METER_SESSION_KEY) === "enabled";
  } catch {
    return false;
  }
}

function storeStudentDisplayVoiceMeterEnabled(isEnabled) {
  try {
    if (isEnabled) window.sessionStorage.setItem(STUDENT_DISPLAY_VOICE_METER_SESSION_KEY, "enabled");
    else window.sessionStorage.removeItem(STUDENT_DISPLAY_VOICE_METER_SESSION_KEY);
  } catch {
    // The option still works for the current rendered page without persistence.
  }
}

function readWhiteboardLibrary() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WHITEBOARD_LIBRARY_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((board) => board?.id && board?.title && board?.image).slice(0, 12) : [];
  } catch {
    return [];
  }
}

function writeWhiteboardLibrary(boards) {
  try { window.localStorage.setItem(WHITEBOARD_LIBRARY_KEY, JSON.stringify(boards.slice(0, 12))); return true; }
  catch { return false; }
}

function readVoiceMeterHistory() {
  try {
    const value = JSON.parse(window.localStorage.getItem(VOICE_METER_HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, 100) : [];
  } catch { return []; }
}

function readVoiceMeterActivity() {
  try {
    const key = window.localStorage.getItem(VOICE_METER_ACTIVITY_KEY);
    return VOICE_METER_ACTIVITIES.find((item) => item.key === key) ?? VOICE_METER_ACTIVITIES[0];
  } catch { return VOICE_METER_ACTIVITIES[0]; }
}

function readVoiceMeterStarGoal() {
  try { return Math.max(50, Math.min(100, Number(window.localStorage.getItem(VOICE_METER_STAR_GOAL_KEY)) || 80)); }
  catch { return 80; }
}

function readVoiceMeterWeeklyStarGoal() {
  try { return Math.max(1, Math.min(5, Number(window.localStorage.getItem(VOICE_METER_WEEKLY_STAR_GOAL_KEY)) || 3)); }
  catch { return 3; }
}

function readVoiceMeterDisplayMode() {
  try { return window.localStorage.getItem(VOICE_METER_DISPLAY_MODE_KEY) === "prediction" ? "prediction" : "basic"; }
  catch { return "basic"; }
}

function predictedLearningType(level) {
  if (level <= 22) return { icon: "🤫", label: "Independent work pattern" };
  if (level <= 58) return { icon: "👩‍🏫", label: "Likely one-speaker instruction" };
  return { icon: "👥", label: "Collaborative sound pattern" };
}

function soundGoalPercentage(items) {
  const total = items.reduce((sum, item) => sum + (Number(item.goalSeconds) || Number(item.durationSeconds) || 0), 0);
  const loud = items.reduce((sum, item) => sum + (Number(item.loudSeconds) || 0), 0);
  return total ? Math.max(0, Math.min(100, Math.round((total - loud) / total * 100))) : null;
}

function startOfLocalWeek(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.getTime();
}

function voiceActivityMinutes(history, classId) {
  const totals = { "teacher-led": 0, independent: 0, collaborative: 0 };
  history.filter((item) => item.classId === classId).forEach((item) => {
    const detected = item.detectedSeconds;
    if (detected && typeof detected === "object") Object.keys(totals).forEach((key) => { totals[key] += Number(detected[key]) || 0; });
    else if (item.activityMode && Object.hasOwn(totals, item.activityMode)) totals[item.activityMode] += Number(item.durationSeconds) || 0;
  });
  return totals;
}

function voiceActivitySummary(history, classId, { editable = true } = {}) {
  const classHistory = history.filter((item) => item.classId === classId);
  const totals = voiceActivityMinutes(history, classId);
  const latest = classHistory[0];
  const starGoal = readVoiceMeterStarGoal();
  const weeklyStarGoal = readVoiceMeterWeeklyStarGoal();
  const today = Date.now();
  const thisWeekStart = startOfLocalWeek(today);
  const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = classHistory.filter((item) => Number(item.usedAt) >= thisWeekStart);
  const lastWeek = classHistory.filter((item) => Number(item.usedAt) >= lastWeekStart && Number(item.usedAt) < thisWeekStart);
  const latestDateKey = latest ? new Date(latest.usedAt).toLocaleDateString() : "";
  const latestDay = latest ? classHistory.filter((item) => new Date(item.usedAt).toLocaleDateString() === latestDateKey) : [];
  const lastUsedPercentage = soundGoalPercentage(latestDay);
  const thisWeekPercentage = soundGoalPercentage(thisWeek);
  const lastWeekPercentage = soundGoalPercentage(lastWeek);
  const weeklyDifference = thisWeekPercentage != null && lastWeekPercentage != null ? thisWeekPercentage - lastWeekPercentage : null;
  const days = new Map();
  thisWeek.forEach((item) => { const key = new Date(item.usedAt).toLocaleDateString(); days.set(key, [...(days.get(key) || []), item]); });
  const earnedWeekdays = new Set([...days.values()].filter((items) => (soundGoalPercentage(items) ?? 0) >= starGoal).map((items) => (new Date(items[0].usedAt).getDay() + 6) % 7).filter((index) => index < 5));
  const stars = earnedWeekdays.size;
  const goalAchieved = lastUsedPercentage != null && lastUsedPercentage >= starGoal;
  const minutes = (seconds) => seconds ? `${Math.max(1, Math.round(seconds / 60))} min` : "0 min";
  const resultLabel = lastUsedPercentage >= 90 ? "Excellent sound balance" : goalAchieved ? "Sound goal achieved" : lastUsedPercentage >= 65 ? "Almost there" : "Try adjusting the goal or microphone sensitivity";
  const comparison = weeklyDifference == null ? "A comparison will appear after both weeks have data." : weeklyDifference >= 0 ? `This week is ${weeklyDifference}% higher than last week 🎉` : `This week is ${Math.abs(weeklyDifference)}% below last week. Let’s try for one more star tomorrow.`;
  const weekdayStars = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => `<span data-earned="${earnedWeekdays.has(index)}"><b>${earnedWeekdays.has(index) ? "★" : "☆"}</b><small>${day}</small></span>`).join("");
  const activityDetails = `<details class="platform-voice-activity-details"><summary>Activity minutes and sound patterns</summary><div class="platform-voice-history-summary"><div><span>👩‍🏫</span><strong>${minutes(totals["teacher-led"])}</strong><small>Likely teacher-led</small></div><div><span>🤫</span><strong>${minutes(totals.independent)}</strong><small>Independent</small></div><div><span>👥</span><strong>${minutes(totals.collaborative)}</strong><small>Collaborative</small></div></div><p>The meter estimates sound patterns; it does not identify individual speakers.</p></details>`;
  if (!latest) return `<p>No voice-meter sessions have been saved yet.</p>${activityDetails}`;
  return `<section class="platform-voice-motivation"><div class="platform-voice-today-result" data-result="${goalAchieved ? "achieved" : "progress"}"><small>Last monitored · ${escapeHtml(latestDateKey)}</small><strong>${lastUsedPercentage}%</strong><span>${goalAchieved ? "🙂" : "🌱"} ${resultLabel}</span></div><div class="platform-voice-weekly-progress"><div><strong>${stars} of ${weeklyStarGoal} goal days</strong><small>This week · ${thisWeekPercentage == null ? "No data" : `${thisWeekPercentage}% within goal`}</small></div><div class="platform-voice-weekday-stars" aria-label="${stars} daily sound-goal stars this week">${weekdayStars}</div><p>${comparison}</p></div></section>${activityDetails}${editable ? `<details class="platform-voice-goal-settings"><summary>Adjust Sound Goals</summary><label>Award a daily star at <input type="number" min="50" max="100" step="1" value="${starGoal}" data-voice-star-goal>% within goal</label><label>Weekly goal <input type="number" min="1" max="5" step="1" value="${weeklyStarGoal}" data-voice-weekly-star-goal> successful days</label><p>Activity thresholds are selected automatically. Microphone sensitivity remains available in the Voice Meter.</p></details>` : ""}`;
}

function recordVoiceMeterUse() {
  if (!voiceMeterUsage?.count) { voiceMeterUsage = null; return; }
  const state = session.read();
  const classId = currentTeacherClass(state.teacherId)?.id;
  if (!classId) { voiceMeterUsage = null; return; }
  const history = readVoiceMeterHistory();
  history.unshift({ classId, usedAt: Date.now(), activityMode: voiceMeterUsage.activityMode, durationSeconds: Math.max(1, Math.round((Date.now() - voiceMeterUsage.startedAt) / 1000)), detectedSeconds: voiceMeterUsage.detectedSeconds, goalSeconds: Math.round(voiceMeterUsage.goalMilliseconds / 1000), loudSeconds: Math.round(voiceMeterUsage.loudMilliseconds / 1000), average: Math.round(voiceMeterUsage.total / voiceMeterUsage.count), peak: voiceMeterUsage.peak });
  try { window.localStorage.setItem(VOICE_METER_HISTORY_KEY, JSON.stringify(history.slice(0, 100))); } catch {}
  voiceMeterUsage = null;
}

function beginVoiceMeterUsage(activity = readVoiceMeterActivity()) {
  const now = Date.now();
  voiceMeterUsage = { startedAt: now, lastSampleAt: now, previousLevel: 0, activityMode: activity.key, target: activity.target, total: 0, count: 0, peak: 0, goalMilliseconds: 0, loudMilliseconds: 0, detectedSeconds: { "teacher-led": 0, independent: 0, collaborative: 0 } };
}

function segmentActiveVoiceMeter(activity) {
  if (!voiceMeterStream) return;
  recordVoiceMeterUse();
  beginVoiceMeterUsage(activity);
}

function readClassroomBobDisplay() {
  try {
    const setting = { placement: "move", earnMinutes: 5, dailyUnlockLimit: 6, ...JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DISPLAY_KEY) || "{}"), enabled: readClassroomBobDailyMenu().enabled };
    setting.earnMinutes = Math.min(30, Math.max(1, Number(setting.earnMinutes) || 5));
    setting.dailyUnlockLimit = Math.min(10, Math.max(1, Number(setting.dailyUnlockLimit) || 6));
    return setting;
  } catch { return { enabled: false, placement: "move", earnMinutes: 5, dailyUnlockLimit: 6 }; }
}

function readClassroomBobDailyMenu() {
  const classId = currentDoNowClassId(), today = localBobRewardDate();
  try {
    const all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_MENU_KEY) || "{}");
    const saved = all[classId];
    return saved?.date === today ? { enabled: Boolean(saved.enabled), menuHidden: Boolean(saved.menuHidden) } : { enabled: false, menuHidden: true };
  } catch { return { enabled: false, menuHidden: true }; }
}

function writeClassroomBobDailyMenu(state) {
  const classId = currentDoNowClassId();
  let all = {}; try { all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_MENU_KEY) || "{}"); } catch {}
  all[classId] = { date: localBobRewardDate(), enabled: Boolean(state.enabled), menuHidden: Boolean(state.menuHidden) };
  window.localStorage.setItem(CLASSROOM_BOB_DAILY_MENU_KEY, JSON.stringify(all));
}

function readClassroomBobUnlocks() {
  const classId = currentDoNowClassId();
  try { const all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_UNLOCK_KEY) || "{}"); return Math.min(BOB_POSE_COUNT, Math.max(2, Number(all[classId]) || 2)); } catch { return 2; }
}

function writeClassroomBobUnlocks(count) {
  const classId = currentDoNowClassId();
  let all = {}; try { all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_UNLOCK_KEY) || "{}"); } catch {}
  all[classId] = Math.min(BOB_POSE_COUNT, Math.max(2, count)); window.localStorage.setItem(CLASSROOM_BOB_UNLOCK_KEY, JSON.stringify(all));
}

function localBobRewardDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function readClassroomBobDailyProgress() {
  const classId = currentDoNowClassId(), today = localBobRewardDate();
  try {
    const all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_KEY) || "{}");
    const saved = all[classId];
    return saved?.date === today ? { date: today, earned: Math.max(0, Number(saved.earned) || 0) } : { date: today, earned: 0 };
  } catch { return { date: today, earned: 0 }; }
}

function writeClassroomBobDailyProgress(progress) {
  const classId = currentDoNowClassId();
  let all = {}; try { all = JSON.parse(window.localStorage.getItem(CLASSROOM_BOB_DAILY_KEY) || "{}"); } catch {}
  all[classId] = { date: localBobRewardDate(), earned: Math.max(0, Number(progress.earned) || 0) };
  window.localStorage.setItem(CLASSROOM_BOB_DAILY_KEY, JSON.stringify(all));
}

function updateBobRewardOutputs() {
  const setting = readClassroomBobDisplay(), progress = readClassroomBobDailyProgress();
  document.querySelectorAll("[data-bob-unlock-count]").forEach((output) => { output.textContent = String(readClassroomBobUnlocks()); });
  document.querySelectorAll("[data-bob-daily-earned]").forEach((output) => { output.textContent = String(Math.min(progress.earned, setting.dailyUnlockLimit)); });
  document.querySelectorAll("[data-bob-daily-limit-output]").forEach((output) => { output.textContent = String(setting.dailyUnlockLimit); });
}

function shuffledBobPoses(count) {
  const values = Array.from({ length: count }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) { const target = Math.floor(Math.random() * (index + 1)); [values[index], values[target]] = [values[target], values[index]]; }
  if (values.length > 1 && values[0] === floatingBobLastPose) [values[0], values[1]] = [values[1], values[0]];
  return values;
}

function nextUnlockedBobPose() {
  const unlocked = readClassroomBobUnlocks();
  floatingBobPoseBag = floatingBobPoseBag.filter((pose) => pose < unlocked && pose !== floatingBobLastPose);
  if (!floatingBobPoseBag.length) floatingBobPoseBag = shuffledBobPoses(unlocked);
  const pose = floatingBobPoseBag.shift() ?? 0; floatingBobLastPose = pose; return pose;
}

function applyUnlockedBobPose(bobs, requestedPose = null) {
  const pose = requestedPose ?? nextUnlockedBobPose(), sheet = Math.floor(pose / 25) + 1, cell = pose % 25;
  const column = cell % 5, row = Math.floor(cell / 5);
  const imageUrl = new URL(`../../assets/images/characters/bob-unlocks-${String(sheet).padStart(2, "0")}.webp?v=232`, import.meta.url).href;
  bobs.forEach((bob) => {
    bob.classList.add("is-unlocked-pose");
    bob.style.setProperty("--bob-pose-sheet", `url("${imageUrl}")`);
    bob.style.setProperty("--bob-pose-x", `${column * 25}%`);
    bob.style.setProperty("--bob-pose-y", `${row * 25}%`);
  });
}

function updateBobUnlockProgress(meterState) {
  const now = Date.now();
  if (meterState !== "green") { floatingBobGreenSince = now; return; }
  const setting = readClassroomBobDisplay(), current = readClassroomBobUnlocks(), progress = readClassroomBobDailyProgress(), dailyLimit = Math.min(10, Math.max(1, Number(setting.dailyUnlockLimit) || 6)), required = Math.max(1, Number(setting.earnMinutes) || 5) * 60000;
  if (progress.earned >= dailyLimit) { floatingBobGreenSince = now; return; }
  if (current >= BOB_POSE_COUNT || now - floatingBobGreenSince < required) return;
  writeClassroomBobUnlocks(current + 1); writeClassroomBobDailyProgress({ earned: progress.earned + 1 }); floatingBobGreenSince = now; floatingBobPoseBag.push(current);
  floatingBobUnlockMessage = progress.earned + 1 >= dailyLimit ? `New Bob pose unlocked! Today’s goal is complete: ${dailyLimit} of ${dailyLimit}.` : `New Bob pose unlocked! ${current + 1} of ${BOB_POSE_COUNT}.`;
  floatingBobUnlockMessageUntil = now + 6000; updateBobRewardOutputs();
}

function scheduleNextBobMove() {
  if (floatingBobRoamingInterval !== null) window.clearTimeout(floatingBobRoamingInterval);
  const delay = Math.max(6000, 28000 - readClassroomBobUnlocks() * 110);
  floatingBobRoamingInterval = window.setTimeout(() => { relocateFloatingBob(); scheduleNextBobMove(); }, delay);
}

function classroomBobCorners(placement = readClassroomBobDisplay().placement) {
  if (placement === "top") return ["top-left", "top-right"];
  if (placement === "bottom") return ["bottom-left", "bottom-right"];
  return ["bottom-right", "top-left"];
}

function applyClassroomBobDisplay() {
  const setting = readClassroomBobDisplay();
  const corners = classroomBobCorners(setting.placement);
  floatingBobCornerIndex %= corners.length;
  const activeBobs = [];
  for (const documentRef of [document, classroomPresentationWindow?.document].filter(Boolean)) {
    documentRef.querySelectorAll(".platform-floating-voice-bob").forEach((bob) => { bob.hidden = !setting.enabled; bob.dataset.corner = corners[floatingBobCornerIndex]; if (setting.enabled && bob.dataset.meterState === "green") activeBobs.push(bob); });
  }
  if (activeBobs.length) applyUnlockedBobPose(activeBobs);
}

function installClassroomDisplayChoices() {
  const tools = document.querySelector(".platform-live-lesson-tools");
  if (!tools) return;
  const thisScreen = tools.querySelector('[data-action="open-timer-display"]');
  const separateScreen = tools.querySelector('[data-action="open-classroom-presentation-window"]');
  if (thisScreen) thisScreen.textContent = "Present on This Screen";
  if (separateScreen) separateScreen.textContent = "Open Separate Classroom Screen";
  if (!tools.querySelector(".platform-classroom-bob-controls")) {
    const setting = readClassroomBobDisplay();
    const dailyMenu = readClassroomBobDailyMenu();
    const daily = readClassroomBobDailyProgress();
    tools.querySelector("#classroom-display-help")?.insertAdjacentHTML("beforebegin", `<fieldset class="platform-classroom-bob-controls" data-menu-hidden="${dailyMenu.menuHidden}"><legend>Bob on the classroom display</legend><label class="platform-classroom-bob-toggle"><input type="checkbox" data-classroom-bob-enabled${setting.enabled ? " checked" : ""}> Show Bob</label><label class="platform-classroom-bob-hide-menu"><input type="checkbox" data-classroom-bob-menu-hidden> <span data-classroom-bob-menu-label>${dailyMenu.menuHidden ? "Show menu" : "Hide menu"}</span></label><div class="platform-classroom-bob-settings"><label>Movement<select data-classroom-bob-placement><option value="move"${setting.placement === "move" ? " selected" : ""}>Bottom to top corner</option><option value="top"${setting.placement === "top" ? " selected" : ""}>Top corners only</option><option value="bottom"${setting.placement === "bottom" ? " selected" : ""}>Bottom corners only</option></select></label><label>Earn pose every <input type="number" min="1" max="30" value="${Number(setting.earnMinutes) || 5}" data-classroom-bob-earn-minutes> min</label><label>Daily limit <input type="number" min="1" max="10" value="${Math.min(10, Math.max(1, Number(setting.dailyUnlockLimit) || 6))}" data-classroom-bob-daily-limit></label><p><strong>Today: <output data-bob-daily-earned>${Math.min(daily.earned, setting.dailyUnlockLimit)}</output>/<output data-bob-daily-limit-output>${setting.dailyUnlockLimit}</output></strong></p><p><strong><output data-bob-unlock-count>${readClassroomBobUnlocks()}</output>/${BOB_POSE_COUNT}</strong> unlocked</p></div></fieldset>`);
  }
}

function readDoNowPosts() {
  try { return JSON.parse(window.localStorage.getItem(DO_NOW_POSTS_KEY) || "[]"); } catch { return []; }
}

function writeDoNowPosts(posts) {
  window.localStorage.setItem(DO_NOW_POSTS_KEY, JSON.stringify(posts.slice(0, 40)));
}

function blankDoNowPost(classId = "") {
  return {
    id: `do-now-${Date.now()}`, classId, classIds: classId ? [classId] : [], title: "Today’s Do Now", schedule: "class-start", weekday: new Date().getDay(), date: "", animation: "top-left",
    backgroundType: "gradient", background1: "#fff4cf", background2: "#dceff4", image: "",
    boxes: [
      { id: "box-1", text: "Welcome! Read the prompt and get started.", color: "#12384d", size: 42, font: "Arial", bold: true, italic: false, underline: false, backgroundType: "gradient", background1: "#ffffff", background2: "#fff4cf" },
      { id: "box-2", text: "Write or sketch your first idea.", color: "#176b55", size: 30, font: "Verdana", bold: false, italic: false, underline: false, backgroundType: "solid", background1: "#ffffff", background2: "#ffffff" },
    ], savedAt: Date.now(), live: false,
  };
}

function currentDoNowClassId() {
  const state = session.read();
  return currentTeacherClass(state.teacherId)?.id || state.classId || "class-preview-1";
}

function doNowCardMarkup(box, index, animation = "top-left") {
  const background = box.backgroundType === "gradient" ? `linear-gradient(135deg, ${box.background1}, ${box.background2})` : box.background1;
  return `<article class="platform-do-now-card" data-do-now-animation="${escapeHtml(animation)}" style="--do-now-index:${index};--do-now-card-background:${escapeHtml(background)};--do-now-text:${escapeHtml(box.color)};--do-now-size:${Number(box.size)}px;--do-now-font:${escapeHtml(box.font)};--do-now-weight:${box.bold ? "700" : "400"};--do-now-style:${box.italic ? "italic" : "normal"};--do-now-decoration:${box.underline ? "underline" : "none"}">${escapeHtml(box.text).replaceAll("\n", "<br>")}</article>`;
}

function doNowPresentationMarkup(post, { controls = true } = {}) {
  const background = post.backgroundType === "gradient" ? `linear-gradient(135deg, ${post.background1}, ${post.background2})` : post.background1;
  return `<section class="platform-do-now-presentation" data-do-now-presentation style="--do-now-background:${escapeHtml(background)}" role="dialog" aria-label="Do Now Post"><header><p>DO NOW</p><h2>${escapeHtml(post.title)}</h2>${controls ? `<div><button type="button" data-action="edit-do-now">Edit</button><button type="button" data-action="hide-do-now">Hide</button></div>` : ""}</header><div class="platform-do-now-stage">${post.boxes.map((box, index) => doNowCardMarkup(box, index, post.animation || "top-left")).join("")}${post.image ? `<img src="${escapeHtml(post.image)}" alt="Do Now visual">` : ""}</div></section>`;
}

function readLiveDoNow() {
  try { return JSON.parse(window.sessionStorage.getItem(DO_NOW_LIVE_KEY) || "null"); } catch { return null; }
}

function syncDoNowPresentation(post = readLiveDoNow()) {
  for (const documentRef of [document, classroomPresentationWindow?.document].filter(Boolean)) {
    documentRef.querySelectorAll("#platform-student-timer-display > [data-do-now-presentation], #platform-second-window-display > [data-do-now-presentation], body > [data-do-now-presentation]").forEach((node) => node.remove());
    if (!post) continue;
    const host = documentRef.querySelector("#platform-student-timer-display") || documentRef.body;
    host.insertAdjacentHTML("beforeend", doNowPresentationMarkup(post, { controls: documentRef === document }));
    if (host.hidden) host.hidden = false;
  }
}

function showDoNow(post) {
  const live = { ...post, live: true };
  window.sessionStorage.setItem(DO_NOW_LIVE_KEY, JSON.stringify(live));
  syncDoNowPresentation(live);
}

function scheduledDoNowForClass(classId) {
  const now = new Date();
  return readDoNowPosts().filter((post) => (post.classIds || [post.classId]).includes(classId) && post.schedule !== "manual").find((post) => post.schedule === "class-start" || (post.schedule === "weekday" && Number(post.weekday) === now.getDay()) || (post.schedule === "date" && post.date === now.toISOString().slice(0, 10))) || null;
}

function doNowEditorMarkup(post) {
  post.classIds = post.classIds?.length ? post.classIds : [post.classId || currentDoNowClassId()];
  const state = session.read();
  const teacherClasses = getClassesForTeacher(state.teacherId);
  const classes = teacherClasses.length ? teacherClasses : [{ id: currentDoNowClassId(), periodLabel: "Current class", displayName: "Current class" }];
  const posts = readDoNowPosts().filter((item) => (item.classIds || [item.classId]).includes(currentDoNowClassId()));
  const classChoices = classes.map((item) => `<label><input type="checkbox" data-do-now-class value="${escapeHtml(item.id)}"${post.classIds.includes(item.id) ? " checked" : ""}> ${escapeHtml(item.periodLabel)} — ${escapeHtml(item.displayName)}</label>`).join("");
  const boxEditors = post.boxes.map((box, index) => `<fieldset class="platform-do-now-box-editor" data-do-now-box="${index}"><legend>Text box ${index + 1}</legend><textarea rows="3" data-do-now-field="text">${escapeHtml(box.text)}</textarea><div class="platform-do-now-format-row"><label>Text color<input type="color" data-do-now-field="color" value="${escapeHtml(box.color)}"></label><label>Size<input type="range" min="18" max="72" data-do-now-field="size" value="${Number(box.size)}"><output>${Number(box.size)} px</output></label><label>Font<select data-do-now-field="font">${["Arial", "Verdana", "Courier New", "Comic Sans MS"].map((font) => `<option${font === box.font ? " selected" : ""}>${font}</option>`).join("")}</select></label><button type="button" data-action="do-now-toggle-format" data-format="bold" aria-pressed="${box.bold}"><b>B</b></button><button type="button" data-action="do-now-toggle-format" data-format="italic" aria-pressed="${box.italic}"><i>I</i></button><button type="button" data-action="do-now-toggle-format" data-format="underline" aria-pressed="${box.underline}"><u>U</u></button></div><div class="platform-do-now-format-row"><label>Text box background<select data-do-now-field="backgroundType"><option value="solid"${box.backgroundType === "solid" ? " selected" : ""}>Solid color</option><option value="gradient"${box.backgroundType === "gradient" ? " selected" : ""}>Gradient</option></select></label><label>Color 1<input type="color" data-do-now-field="background1" value="${box.background1}"></label><label>Color 2<input type="color" data-do-now-field="background2" value="${box.background2}"></label><button type="button" data-action="remove-do-now-box"${post.boxes.length < 2 ? " disabled" : ""}>Remove</button></div></fieldset>`).join("");
  return `<div class="platform-do-now-editor" data-do-now-editor role="dialog" aria-modal="true" aria-labelledby="do-now-editor-title"><div class="platform-do-now-editor-panel"><header><div><p class="platform-command-label">Start-of-class display</p><h2 id="do-now-editor-title">Do Now Post</h2></div><button type="button" data-action="close-do-now-editor">×</button></header><div class="platform-do-now-editor-grid"><section class="platform-do-now-controls"><label>Post title<input data-do-now-root-field="title" value="${escapeHtml(post.title)}"></label><fieldset class="platform-do-now-class-list"><legend>Use this post in</legend>${classChoices}</fieldset><label>Animation<select data-do-now-root-field="animation"><option value="top-left"${(post.animation || "top-left") === "top-left" ? " selected" : ""}>Top to bottom and left to right</option><option value="bottom-right"${post.animation === "bottom-right" ? " selected" : ""}>Bottom to top and right to left</option><option value="fade"${post.animation === "fade" ? " selected" : ""}>Fade only</option><option value="none"${post.animation === "none" ? " selected" : ""}>No animation</option></select></label><div class="platform-do-now-format-row"><label>Post background<select data-do-now-root-field="backgroundType"><option value="solid"${post.backgroundType === "solid" ? " selected" : ""}>Solid color</option><option value="gradient"${post.backgroundType === "gradient" ? " selected" : ""}>Gradient</option></select></label><label>Color 1<input type="color" data-do-now-root-field="background1" value="${post.background1}"></label><label>Color 2<input type="color" data-do-now-root-field="background2" value="${post.background2}"></label></div>${boxEditors}<button type="button" data-action="add-do-now-box">+ Add Text Box</button><div class="platform-do-now-image-drop" tabindex="0">Paste an image here (Ctrl/Command + V), or <label>choose an image<input type="file" accept="image/*" data-do-now-image hidden></label>${post.image ? `<img src="${escapeHtml(post.image)}" alt="Pasted Do Now visual"><button type="button" data-action="remove-do-now-image">Remove image</button>` : ""}</div><fieldset><legend>When should it appear?</legend><label><input type="radio" name="doNowSchedule" value="class-start"${post.schedule === "class-start" ? " checked" : ""}> At the beginning of every class</label><label><input type="radio" name="doNowSchedule" value="weekday"${post.schedule === "weekday" ? " checked" : ""}> On weekday <select data-do-now-root-field="weekday">${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day, index) => `<option value="${index}"${Number(post.weekday) === index ? " selected" : ""}>${day}</option>`).join("")}</select></label><label><input type="radio" name="doNowSchedule" value="date"${post.schedule === "date" ? " checked" : ""}> On date <input type="date" data-do-now-root-field="date" value="${post.date || ""}"></label><label><input type="radio" name="doNowSchedule" value="manual"${post.schedule === "manual" ? " checked" : ""}> Show only when I choose</label></fieldset><div class="platform-do-now-actions"><button type="button" data-action="save-do-now">Save Post</button><button type="button" data-action="show-do-now">Save & Show Now</button><button type="button" data-action="copy-do-now">Copy Post</button><button type="button" data-action="hide-do-now">Hide from Class</button></div><label>Saved posts<select data-do-now-saved><option value="">Choose a saved post</option>${posts.map((item) => `<option value="${item.id}"${item.id === post.id ? " selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></label><button type="button" data-action="load-do-now">Open Saved Post</button><button type="button" data-action="delete-do-now">Delete Saved Post</button><p data-do-now-status role="status">Changes appear in the preview immediately.</p></section><section class="platform-do-now-preview"><h3>Live preview</h3>${doNowPresentationMarkup(post, { controls: false })}</section></div></div></div>`;
}

function openDoNowEditor(post = null) {
  doNowDraft = structuredClone(post || blankDoNowPost(currentDoNowClassId()));
  if (doNowDraft.animation === "bottom-right") doNowDraft.animation = "top-left";
  document.querySelector("[data-do-now-editor]")?.remove();
  root.insertAdjacentHTML("beforeend", doNowEditorMarkup(doNowDraft));
  document.querySelector('[data-do-now-root-field="animation"] option[value="bottom-right"]')?.remove();
}

function updateDoNowDraftFromEditor(editor) {
  if (!doNowDraft || !editor) return;
  editor.querySelectorAll("[data-do-now-root-field]").forEach((field) => { doNowDraft[field.dataset.doNowRootField] = field.type === "range" ? Number(field.value) : field.value; });
  doNowDraft.schedule = editor.querySelector('[name="doNowSchedule"]:checked')?.value || "manual";
  doNowDraft.classIds = [...editor.querySelectorAll("[data-do-now-class]:checked")].map((input) => input.value);
  editor.querySelectorAll("[data-do-now-box]").forEach((fieldset) => {
    const box = doNowDraft.boxes[Number(fieldset.dataset.doNowBox)];
    fieldset.querySelectorAll("[data-do-now-field]").forEach((field) => { box[field.dataset.doNowField] = field.type === "range" ? Number(field.value) : field.value; });
  });
  const preview = editor.querySelector(".platform-do-now-preview");
  if (preview) preview.innerHTML = `<h3>Live preview</h3>${doNowPresentationMarkup(doNowDraft, { controls: false })}`;
  if (readLiveDoNow()) showDoNow(doNowDraft);
}

function saveDoNowDraft(show = false) {
  const editor = document.querySelector("[data-do-now-editor]");
  updateDoNowDraftFromEditor(editor);
  if (!doNowDraft.classIds?.length) { const status = editor?.querySelector("[data-do-now-status]"); if (status) status.textContent = "Choose at least one class for this post."; return; }
  doNowDraft.classId = doNowDraft.classIds[0]; doNowDraft.savedAt = Date.now();
  const posts = readDoNowPosts().filter((item) => item.id !== doNowDraft.id); posts.unshift(structuredClone(doNowDraft)); writeDoNowPosts(posts);
  if (show) showDoNow(doNowDraft);
  const status = editor?.querySelector("[data-do-now-status]"); if (status) status.textContent = show ? "Saved and showing on the classroom display now." : "Do Now Post saved for this class.";
}

function currentClassPlanMarkup(classId, teacherId) {
  const resourceState = classResourceSharing.read(classId);
  const resources = resourceState.audienceRows.flatMap((row) => row.resources).filter(Boolean);
  const uniqueResources = [...new Map(resources.map((item) => [item.id || `${item.type}-${item.title}`, item])).values()];
  const access = [...new Set(uniqueResources.map((item) => item.type))];
  const effectiveTimerSchedule = classTimerSchedule.readEffective();
  const timer = currentScheduledLessonTimerState();
  const memo = teacherMemo.read();
  const latestBoard = readWhiteboardLibrary().filter((board) => board.classId === classId || board.classId === "all").sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))[0];
  const voiceActivity = readVoiceMeterActivity();
  const voiceDisplayMode = readVoiceMeterDisplayMode();
  const voiceIsOn = Boolean(voiceMeterStream);
  const liveVoiceBody = `<div class="platform-current-plan-live-voice" data-voice-display-mode="${voiceDisplayMode}"><div class="platform-live-voice-heading"><strong data-voice-prediction>${predictedLearningType(0).icon} ${predictedLearningType(0).label}</strong><small>Goal: ${escapeHtml(voiceActivity.label)}</small></div><p class="platform-live-voice-status" data-live-voice-status data-state="${voiceIsOn ? "on" : "off"}"><span aria-hidden="true"></span> Voice Meter is ${voiceIsOn ? "on and listening" : "off"}</p><div class="platform-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%; --voice-threshold: ${voiceActivity.target}%"><div class="platform-voice-meter-scale" aria-hidden="true"><span>Ready</span><span>Close</span><span>Too loud</span></div><div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span><i class="platform-voice-threshold-marker" title="Expected threshold"></i></div><p><strong data-voice-meter-output>0</strong><span aria-hidden="true"> / 100</span></p></div><label>Meter view<select data-voice-meter-display-mode><option value="basic"${voiceDisplayMode === "basic" ? " selected" : ""}>Basic volume</option><option value="prediction"${voiceDisplayMode === "prediction" ? " selected" : ""}>Predicted learning type + threshold</option></select></label><div class="platform-live-voice-actions"><button type="button" data-action="voice-meter-start"${voiceIsOn ? " disabled" : ""}>Turn Voice Meter On</button><button type="button" data-action="voice-meter-stop"${voiceIsOn ? "" : " disabled"}>Turn Off</button><button type="button" data-action="open-voice-meter-display">Open Class View</button></div></div>`;
  const presentationToolControls = `<details class="platform-more-classroom-tools platform-more-classroom-tools-standalone"><summary><span aria-hidden="true">＋</span> More Classroom Tools</summary><div class="platform-live-lesson-tools" aria-labelledby="live-lesson-tools-title"><p class="platform-command-label" id="live-lesson-tools-title">Additional tools</p><div class="platform-live-lesson-tool-buttons"><button type="button" data-action="open-timer-display">Present on This Screen</button><button type="button" data-action="open-amig-anchor-chart">AMIG Anchor Chart</button><button type="button" data-action="open-do-now-editor">Do Now Post</button><button type="button" data-action="open-captains-log-planner">Exit Ticket</button><button type="button" data-action="open-name-picker-display">Name Picker</button><button type="button" data-action="open-timer-popout">Floating Timer</button></div><p id="classroom-display-help" class="platform-live-lesson-tool-help">Classroom Display opens a separate student-facing window for a projector or smartboard.</p><p data-classroom-window-status role="status"></p></div></details>`;
  const timerVisual = effectiveTimerSchedule.pomodoroEnabled ? presentationTimerVisualState(timer) : currentTimerVisualState(timer);
  const timerPhase = timerVisual.active ? timerVisual.phase : null;
  const phaseKey = effectiveTimerSchedule.pomodoroEnabled ? `<ol class="platform-current-plan-phase-key" aria-label="Today’s Pomodoro phases">${effectiveTimerSchedule.phases.map((phase) => `<li data-phase-color="${escapeHtml(phase.color)}"><i aria-hidden="true"></i><span><strong>${escapeHtml(phase.name)}</strong><small>Starts at ${phase.startMinute === 0 ? "class start" : `minute ${phase.startMinute}`}</small></span></li>`).join("")}</ol>` : "";
  const timerBody = `<div class="platform-current-plan-timer-widget" data-class-timer-kind="${effectiveTimerSchedule.pomodoroEnabled ? "pomodoro" : "standard"}"><div class="platform-current-plan-timer-wheel" data-timer-ring data-active-phases="${effectiveTimerSchedule.pomodoroEnabled ? "true" : "false"}" style="${timerRingStyle(timerVisual)}"><output data-timer-remaining data-timer-phase-color="${timerPhase?.color ?? "default"}">${formatLessonTime(timer.remainingSeconds)}</output></div><div class="platform-current-plan-timer-details"><strong data-timer-phase-name>${escapeHtml(timerPhase?.name ?? "Today’s Engineering Time")}</strong><span data-current-plan-timer>${escapeHtml(timer.status)} · ${formatLessonTime(timer.remainingSeconds)}</span><small data-current-plan-timer-mode>${effectiveTimerSchedule.pomodoroEnabled ? "Class Pomodoro Timer · Pomodoro phases are shown by default." : "Standard class timer."}</small></div><div class="platform-current-plan-timer-controls" aria-label="Live timer controls"><button type="button" data-action="timer-subtract-minute">− 1 min</button><button type="button" data-action="timer-add-minute">+ 1 min</button><button type="button" data-action="timer-start-or-resume">Start</button><button type="button" data-action="timer-pause">Pause</button><button type="button" data-action="timer-end">End</button><button type="button" data-action="timer-reset">Reset</button></div>${phaseKey}</div>`;
  const card = (key, title, body, className = "", actionLabel = "Edit", live = false, editAction = "open-current-plan-editor") => `<article class="${className}" data-plan-card="${key}"${live ? ` data-live="true"` : ""}><button type="button" class="platform-current-plan-card-title" data-action="${editAction}" data-current-plan-editor="${key}">${title}<span aria-hidden="true">${actionLabel} ›</span></button>${body}</article>`;
  const lessonDetails = `<details class="platform-current-plan-details" data-current-plan-details><summary>View Lesson Details and Live Status</summary><div class="platform-current-plan-grid">${card("activities", "Assigned activities", `<p class="platform-current-plan-status">${uniqueResources.length ? uniqueResources.map((item) => escapeHtml(item.title)).join(" • ") : "Not set"}</p>`, "platform-current-plan-textured", "Edit", uniqueResources.length > 0)}${card("access", "Students can work in", `<p class="platform-current-plan-status">${access.length ? access.map(escapeHtml).join(" • ") : "Not set"}</p>`, "platform-current-plan-textured", "Edit", access.length > 0)}${card("message", "Current message", `<p class="platform-current-plan-status">${memo.text ? escapeHtml(memo.text) : "Not set"}</p>`, "platform-current-plan-textured", "Edit", Boolean(memo.text))}${card("whiteboard", "Latest whiteboard", `${latestBoard ? `<img src="${escapeHtml(latestBoard.displayImage || latestBoard.image)}" alt="Thumbnail of ${escapeHtml(latestBoard.title)}"><p>${escapeHtml(latestBoard.title)} · ${new Date(latestBoard.savedAt).toLocaleDateString()}</p>` : `<p>No saved whiteboard history yet.</p>`}`, "platform-current-plan-whiteboard platform-current-plan-textured")}${card("voice", "Live Voice Meter", liveVoiceBody, "platform-current-plan-live-voice-card", "History", voiceIsOn)}</div></details>`;
  return `<div id="teacher-live-lesson-dashboard" class="platform-current-class-plan-stack"><section class="platform-current-class-plan platform-current-class-plan-compact" aria-label="Run today’s class controls">${lessonDetails}${presentationToolControls}<div class="platform-current-plan-featured">${card("timer", "Today’s Engineering Time", timerBody, "platform-current-plan-timer-card", "Edit Schedule", timer.status === LESSON_TIMER_STATES.RUNNING || timer.status === LESSON_TIMER_STATES.PAUSED, "open-class-schedule-quick")}</div><div class="platform-current-plan-modal" data-current-plan-modal data-current-class-id="${escapeHtml(classId)}" data-current-teacher-id="${escapeHtml(teacherId)}" hidden><div class="platform-current-plan-modal-backdrop" data-action="close-current-plan-editor"></div><section role="dialog" aria-modal="true" aria-labelledby="current-plan-editor-title"><header><h3 id="current-plan-editor-title">Quick edit</h3><button type="button" data-action="close-current-plan-editor" aria-label="Close quick editor">×</button></header><div data-current-plan-editor-content></div><button class="platform-return-current-plan" type="button" data-action="return-current-plan">Return to Today’s Class Plan</button></section></div></section></div>`;
}

function currentClassPlanEditorMarkup(category, classId, teacherId) {
  const resourceState = classResourceSharing.read(classId);
  const resourceEntries = resourceState.audienceRows.flatMap((row) => row.resources.map((resource, index) => resource ? { resource, row, index } : null).filter(Boolean));
  const memo = teacherMemo.read();
  const timer = lessonTimer.read();
  const boards = readWhiteboardLibrary().filter((board) => board.classId === classId || board.classId === "all").sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0));
  const history = readVoiceMeterHistory();
  const classes = getClassesForTeacher(teacherId);
  if (category === "activities") return `<p>Uncheck an activity to remove it from the live student tray.</p><div class="platform-current-plan-editor-list">${resourceEntries.length ? resourceEntries.map(({ resource, row, index }) => `<label><input type="checkbox" data-current-plan-resource-toggle data-resource-row-id="${escapeHtml(row.id)}" data-resource-index="${index}" checked><span><strong>${escapeHtml(resource.title)}</strong><small>${escapeHtml(resource.type)} · ${escapeHtml(row.audienceType === "whole-class" ? "Whole class" : row.audienceLabel || "Selected students")}</small></span></label>`).join("") : `<p>No activities are currently assigned.</p>`}</div><button type="button" data-action="current-plan-open-resources">Add or reorganize activities</button>`;
  if (category === "access") return `<p>Student access is created automatically from the resources you assign.</p><div class="platform-current-plan-editor-list">${resourceEntries.length ? resourceEntries.map(({ resource, row }) => `<p><strong>${escapeHtml(resource.type)}</strong><br>${escapeHtml(resource.title)} · ${escapeHtml(row.audienceType === "whole-class" ? "Whole class" : row.audienceLabel || "Selected students")}</p>`).join("") : `<p>No student resources are live.</p>`}</div><button type="button" data-action="current-plan-open-resources">Change resource access</button>`;
  if (category === "message") return `<label class="platform-current-plan-message">Message shown to students<textarea maxlength="${TEACHER_MEMO_MAX_CHARACTERS}" data-current-plan-message>${escapeHtml(memo.text)}</textarea></label><div class="platform-current-plan-editor-actions"><button type="button" data-action="save-current-plan-message">Save Message</button><button type="button" data-action="clear-current-plan-message">Clear Message</button><button type="button" data-action="open-message-board-quick">Formatting and saved messages</button></div><p data-current-plan-editor-status role="status"></p>`;
  if (category === "timer") return `<p class="platform-current-plan-timer-large" data-current-plan-timer>${escapeHtml(timer.status)} · ${formatLessonTime(timer.remainingSeconds)}</p><div class="platform-current-plan-editor-actions"><button type="button" data-action="timer-start">Start</button><button type="button" data-action="timer-pause">Pause</button><button type="button" data-action="timer-resume">Resume</button><button type="button" data-action="timer-subtract-minute">− 1 minute</button><button type="button" data-action="timer-add-minute">+ 1 minute</button><button type="button" data-action="timer-reset">Reset</button></div><button type="button" data-action="open-today-timer-tools">Open full timer settings</button>`;
  if (category === "whiteboard") return `${boards[0] ? `<img class="platform-current-plan-editor-board" src="${escapeHtml(boards[0].displayImage || boards[0].image)}" alt="Latest saved whiteboard"><p><strong>${escapeHtml(boards[0].title)}</strong> · saved ${new Date(boards[0].savedAt).toLocaleString()}</p>` : `<p>No saved whiteboard is available yet.</p>`}<button type="button" data-action="open-whiteboard">Open Whiteboard</button>`;
  const classHistory = history.filter((item) => item.classId === classId).slice(0, 5);
  return `<p>The meter estimates classroom sound patterns only. It cannot identify a speaker and never records audio.</p>${voiceActivitySummary(history, classId)}<div class="platform-current-plan-editor-list">${classHistory.length ? classHistory.map((item) => `<p><strong>${new Date(item.usedAt).toLocaleDateString()}</strong><br>${escapeHtml(VOICE_METER_ACTIVITIES.find((activity) => activity.key === item.activityMode)?.label || "Classroom sound session")} · ${Math.ceil(item.durationSeconds / 60)} min · ${(soundGoalPercentage([item]) ?? 0) >= readVoiceMeterStarGoal() ? "🙂 Goal achieved" : "Louder than expected"}</p>`).join("") : `<p>No voice-meter sessions have been saved yet.</p>`}</div><label>Compare with another class<select data-class-plan-comparison><option value="">Choose a class</option>${classes.filter((item) => item.id !== classId).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.periodLabel)} — ${escapeHtml(item.displayName)}</option>`).join("")}</select></label>`;
}

function refreshCurrentClassPlan() {
  const current = document.querySelector(".platform-current-class-plan-stack");
  const state = session.read();
  const classId = currentTeacherClass(state.teacherId)?.id;
  if (current && classId) current.outerHTML = currentClassPlanMarkup(classId, state.teacherId);
}

function closeCurrentClassPlanEditor() {
  const modal = document.querySelector("[data-current-plan-modal]");
  if (modal) modal.hidden = true;
}

function whiteboardScheduleLabel(board) {
  if (board.scheduleType === "date" && board.date) {
    const [year, month, day] = board.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? board.date : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  if (board.scheduleType === "weekly" && board.day && board.day !== "any") return `Every ${board.day}`;
  return "No schedule";
}

function scheduledWhiteboardFor(classId, occurrence, now = new Date()) {
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return readWhiteboardLibrary().find((board) => board.studentDisplay === true
    && (board.classId === "all" || board.classId === classId)
    && ((board.scheduleType === "weekly" && board.day === occurrence.weekday)
      || (board.scheduleType === "date" && board.date === localDate))) ?? null;
}

function currentRoute() {
  return window.location.hash.replace(/^#/, "").replace(/\/$/, "") || ROUTES.WELCOME;
}

function navigate(route, { replace = false } = {}) {
  const nextHash = `#${route}`;
  if (replace) {
    window.location.replace(nextHash);
  } else if (window.location.hash === nextHash) {
    render();
  } else {
    window.location.hash = route;
  }
}

function guardRoute(route, state) {
  const isTeacherRoute = route.startsWith("/teacher/");
  const isStudentRoute = route.startsWith("/student/");

  if (state.role === PLATFORM_ROLES.TEACHER && isStudentRoute) return ROUTES.TEACHER_DASHBOARD;
  if (state.role === PLATFORM_ROLES.STUDENT && isTeacherRoute) return ROUTES.STUDENT_DASHBOARD;
  if (route === ROUTES.TEACHER_DASHBOARD && state.role !== PLATFORM_ROLES.TEACHER) return ROUTES.TEACHER_LOGIN;
  if (route === ROUTES.TEACHER_CLASSES && state.role !== PLATFORM_ROLES.TEACHER) return ROUTES.TEACHER_LOGIN;
  if (route === ROUTES.STUDENT_DASHBOARD && state.role !== PLATFORM_ROLES.STUDENT) return ROUTES.STUDENT_ENTRY;
  if (route === ROUTES.STUDENT_ROSTER && !state.pendingClassId) return ROUTES.STUDENT_ENTRY;
  if (route === ROUTES.STUDENT_IDENTIFIER && (!state.pendingClassId || !state.pendingStudentId)) {
    return state.pendingClassId ? ROUTES.STUDENT_ROSTER : ROUTES.STUDENT_ENTRY;
  }
  return route;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readTeacherAssignedResearch(classId) {
  try { const all = JSON.parse(window.localStorage.getItem(TEACHER_ASSIGNED_RESEARCH_KEY) || "{}"); const saved = all[classId] || {}; return { topic: String(saved.topic || ""), links: Array.isArray(saved.links) ? saved.links.slice(0, 6) : [] }; }
  catch { return { topic: "", links: [] }; }
}

function writeTeacherAssignedResearch(classId, research) {
  const all = (() => { try { return JSON.parse(window.localStorage.getItem(TEACHER_ASSIGNED_RESEARCH_KEY) || "{}"); } catch { return {}; } })();
  all[classId] = research;
  window.localStorage.setItem(TEACHER_ASSIGNED_RESEARCH_KEY, JSON.stringify(all));
}

function teacherAssignedResearchLinksText(research) { return research.links.map((link) => `${link.title} | ${link.url}`).join("\n"); }
function parseTeacherAssignedResearchLinks(value) {
  const links = [];
  for (const line of String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 6)) {
    const separator = line.indexOf("|"), title = separator >= 0 ? line.slice(0, separator).trim() : "Approved research resource", rawUrl = (separator >= 0 ? line.slice(separator + 1) : line).trim();
    try { const url = new URL(rawUrl); if (url.protocol !== "https:") throw new Error(); links.push({ title: title.slice(0, 80) || "Approved research resource", url: url.href }); } catch { return { ok: false, reason: `Check this link: ${rawUrl}` }; }
  }
  return { ok: true, links };
}

function readTeacherResearchLinkBank() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(TEACHER_RESEARCH_LINK_BANK_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((group) => group?.id && group?.title && Array.isArray(group.links)).slice(0, 24) : [];
  } catch { return []; }
}

function writeTeacherResearchLinkBank(groups) {
  window.localStorage.setItem(TEACHER_RESEARCH_LINK_BANK_KEY, JSON.stringify(groups.slice(0, 24)));
}

function teacherResearchLinkBankMarkup(groups, assignedResearch) {
  if (!groups.length) return `<p class="platform-research-bank-empty">No saved link groups yet. Create one below for a topic you expect to use again.</p>`;
  return groups.map((group) => {
    const isAssigned = group.title === assignedResearch.topic && group.links.length === assignedResearch.links.length && group.links.every((link, index) => link.url === assignedResearch.links[index]?.url);
    return `<article class="platform-research-bank-card">
      <div><h4>${escapeHtml(group.title)}</h4>${group.topic ? `<p>${escapeHtml(group.topic)}</p>` : ""}<small>${group.links.length} approved link${group.links.length === 1 ? "" : "s"}</small></div>
      <ul>${group.links.map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.title)}</a></li>`).join("")}</ul>
      <div class="platform-actions"><button type="button" data-action="assign-research-bank-group" data-research-group-id="${escapeHtml(group.id)}"${isAssigned ? " disabled" : ""}>${isAssigned ? "Assigned to This Class" : "Assign to This Class"}</button><button type="button" data-action="delete-research-bank-group" data-research-group-id="${escapeHtml(group.id)}">Delete Group</button></div>
    </article>`;
  }).join("");
}

function memoSegmentsMarkup(state) {
  const segments = state.segments?.length ? state.segments : [{ text: state.text, color: state.color, size: state.size, style: state.style }];
  return segments.map((segment) => `<span data-memo-color="${segment.color}" data-memo-size="${segment.size}" data-memo-style="${segment.style}">${escapeHtml(segment.text)}</span>`).join("");
}

function currentEvidenceActivity() {
  return todaysMission.read().title || PILOT_ACTIVITY;
}

function currentTeacherClass(teacherId) {
  if (productionIdentityConfig.enabled && productionTeacherClasses.length) {
    const selected = window.sessionStorage.getItem(PRODUCTION_CURRENT_CLASS_KEY);
    return productionTeacherClasses.find((item) => item.id === selected) ?? productionTeacherClasses[0];
  }
  const classes = getClassesForTeacher(teacherId);
  const selected = classSetupProfiles.read().currentClassId;
  return classes.find((item) => item.id === selected) ?? classes[0] ?? getClassForTeacher(teacherId);
}

function preserveCurrentClassSetup(classId) {
  if (!classId) return;
  const current = classSetupProfiles.profile(classId) ?? {};
  classSetupProfiles.save(classId, { ...current, schedule: classTimerSchedule.read(), memo: teacherMemo.read(), mission: todaysMission.read() });
}

function classReadiness(classId) {
  return { mission: "previous", timer: "saved", safeguards: "saved", ...(classSetupProfiles.profile(classId)?.readiness ?? {}) };
}

function currentRotationWeek(classId) {
  const saved = Number(classSetupProfiles.profile(classId)?.rotationWeek);
  if (Number.isInteger(saved) && saved >= 1 && saved <= 7) return saved;
  return weeklyReflections.activeCaptainLogWeek(classId);
}

function saveCurrentRotationWeek(classId, requestedWeek) {
  const week = Math.max(1, Math.min(7, Number(requestedWeek) || 1));
  const profile = classSetupProfiles.profile(classId) ?? {};
  classSetupProfiles.save(classId, { ...profile, rotationWeek: week });
  weeklyReflections.setActiveCaptainLogWeek(classId, week);
  return week;
}

function automaticGoalsForClass(classId) {
  const classRecord = getClassById(classId);
  const resources = classResourceSharing.read(classId).audienceRows.flatMap((row) => row.resources);
  const goals = [];
  if (resources.some((item) => /design a space bedroom/i.test(item?.title))) goals.push("Build a Shelter");
  resources.forEach((item) => {
    if (item?.title && !/design a space bedroom/i.test(item.title)) goals.push(`Complete and reflect on ${item.title}`);
  });
  if (!goals.length && Number(classRecord?.grade || 5) === 5) goals.push("Build a Shelter");
  return [...new Set(goals)].slice(0, 6);
}

function iCanGoal(goal) {
  const text = String(goal || "").trim().replace(/[.]+$/, "");
  if (!text) return "";
  if (/^I can\b/i.test(text)) return `${text}.`;
  return `I can ${text.charAt(0).toLowerCase()}${text.slice(1)}.`;
}

function suggestedClassTimeline(classId) {
  const profile = classSetupProfiles.profile(classId) ?? {};
  const duration = Math.max(15, Number(profile.schedule?.durationMinutes || classTimerSchedule.read().durationMinutes) || 45);
  const launch = Math.max(3, Math.round(duration * 0.15));
  const reflect = Math.max(5, Math.round(duration * 0.2));
  const work = Math.max(5, duration - launch - reflect);
  return `${launch} min launch · ${work} min work time · ${reflect} min reflection`;
}

function todaysGoalInputsMarkup(classId) {
  const profile = classSetupProfiles.profile(classId) ?? {};
  const automatic = automaticGoalsForClass(classId);
  const goals = (profile.todayGoalsMode === "custom" ? (profile.todayGoals ?? []) : automatic).map(iCanGoal).filter(Boolean);
  return `<div class="platform-quick-goals" data-quick-goals data-goals-mode="${profile.todayGoalsMode === "custom" ? "custom" : "automatic"}"><div><h4>Today’s “I Can” Goals</h4><p>${profile.todayGoalsMode === "custom" ? "Teacher-edited student goals" : "Suggested automatically from the class grade, mission goal, and selected activities"}</p><p class="platform-quick-goals-timeline"><strong>Suggested timeline:</strong> ${escapeHtml(suggestedClassTimeline(classId))}</p></div><div data-quick-goal-list>${goals.length ? goals.map((goal, index) => `<label>I Can Goal ${index + 1}<span><input name="todayGoal" maxlength="90" value="${escapeHtml(goal)}"><button type="button" data-action="delete-quick-goal" aria-label="Delete I Can goal ${index + 1}">Delete</button></span></label>`).join("") : `<p data-no-quick-goals>No goal is currently assigned.</p>`}</div><button type="button" data-action="add-quick-goal">+ Add an I Can Goal</button></div>`;
}

function blankClassSchedule() {
  return { enabled: false, weekdays: [...WEEKDAYS], startTime: "08:00", durationMinutes: 45, timeZone: "America/New_York", yellowSound: "Bird Chirping", redSound: "Cardinal", endSound: "Choir — Heavenly Transition", pomodoroEnabled: false, phases: recommendedTimerPhases(45) };
}

function activateClassSetup(classId) {
  const profile = classSetupProfiles.profile(classId);
  classTimerSchedule.save(profile?.schedule ?? blankClassSchedule());
  if (profile?.memo?.text) teacherMemo.save(profile.memo.text, profile.memo); else teacherMemo.clear();
  if (profile?.mission?.title) todaysMission.save(profile.mission); else todaysMission.clear();
  if (!profile) preserveCurrentClassSetup(classId);
}

function ensureClassSetupProfile(classId) {
  if (classId && !classSetupProfiles.profile(classId)) preserveCurrentClassSetup(classId);
}

const TEACHER_WEBPAGE_CATALOG = Object.freeze([
  { category: "Missions", title: "STEM Missions Home", detail: "Main starting page for the STEM Missions website.", url: "https://sites.google.com/ravennaschools.us/steminbobwarts/home-start" },
  { category: "Grade Hubs", title: "Grade 3/4 Mission Hub", detail: "Activity library page for Grade 3 and Grade 4 classes.", url: "https://sites.google.com/ravennaschools.us/steminbobwarts/grade-34" },
  { category: "Grade Hubs", title: "Grade 5/6 Mission Hub", detail: "Activity library page for Grade 5 and Grade 6 classes.", url: "https://sites.google.com/ravennaschools.us/steminbobwarts/grade-5" },
  { category: "Tools", title: "STEM Builder", detail: "Open the THINKamigBOB design-and-build workspace.", url: "../index.html" },
]);

function classSetupSharingMarkup(teacherId, location) {
  const classes = getClassesForTeacher(teacherId);
  const current = currentTeacherClass(teacherId);
  return `<section class="platform-class-setup-sharing${location === "manage" ? " platform-manage-step" : ""}" data-class-sharing-location="${location}"${location === "manage" ? ' data-manage-step="3"' : ""} aria-labelledby="class-sharing-${location}">
    ${location === "manage" ? `<div class="platform-manage-step-heading"><span aria-hidden="true">3</span><div>` : ""}<p class="platform-command-label">Reuse classroom settings</p>
    <h3 id="class-sharing-${location}">Share Classroom Setup</h3>
    ${location === "manage" ? `<p>Save time by copying only the settings you choose.</p></div></div>` : ""}
    <label>Current class<select data-current-teacher-class>${classes.map((item) => `<option value="${item.id}"${item.id === current?.id ? " selected" : ""}>${escapeHtml(item.periodLabel)} — ${escapeHtml(item.displayName)}</option>`).join("")}</select></label>
    <fieldset><legend>Apply to</legend>${classes.filter((item) => item.id !== current?.id).map((item) => `<label><input type="checkbox" data-class-setup-target value="${item.id}"> ${escapeHtml(item.periodLabel)} — ${escapeHtml(item.displayName)}</label>`).join("")}<label><input type="checkbox" data-class-setup-all> All other classes</label></fieldset>
    <fieldset><legend>Copy only</legend><label><input type="checkbox" data-class-setup-component="timer" checked> Timer schedule, Pomodoro phases, and sounds</label><label><input type="checkbox" data-class-setup-component="memo" checked> Teacher Memo and presentation formatting</label><label><input type="checkbox" data-class-setup-component="resources" checked> Today’s resource slots and audiences</label><label><input type="checkbox" data-class-setup-component="reflection" checked> What I Learned Today Requirement</label></fieldset>
    <button type="button" data-action="apply-class-setup">Apply Selected Setup</button>
    <p data-class-setup-status role="status" aria-live="polite">Nothing is copied until you confirm.</p>
    ${location === "manage" ? `<a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">← Back to Today</a>` : ""}
  </section>`;
}

function classResourceTeacherMarkup(classId) {
  const state = classResourceSharing.read(classId);
  const roster = getRosterForClass(classId);
  const prepared = state.prepared ?? { title: "", type: "Mission Activity", url: "", release: "manual" };
  const pickerOpen = ["Mission Activity", "Side Path", "Webpage"].includes(prepared.type);
  const releaseLabels = { manual: "Push manually", "class-start": "At class start", purple: "Blue starter phase", green: "Green main activity", yellow: "Gold five-minute warning", red: "Red cleanup or exit" };
  const groupRows = state.audienceRows.filter((row) => ["teacher-group", "random-group"].includes(row.audienceType));
  const groupedStudentIds = new Set(groupRows.flatMap((row) => row.audienceIds));
  const groupStudentList = (row, assignedOnly = false) => roster.filter((student) => !assignedOnly || row.audienceIds.includes(student.id)).map((student) => `<label class="platform-group-student${row.audienceIds.includes(student.id) ? " is-assigned" : ""}" draggable="true" data-group-student-id="${escapeHtml(student.id)}"><input type="checkbox" data-resource-audience-student data-resource-row-id="${escapeHtml(row.id)}" value="${escapeHtml(student.id)}"${row.audienceIds.includes(student.id) ? " checked" : ""}> ${escapeHtml(student.displayName)}</label>`).join("");
  const audienceRows = state.audienceRows.map((row, rowIndex) => {
    const selectedNames = roster.filter((student) => row.audienceIds.includes(student.id)).map((student) => student.displayName);
    const audienceSummary = row.audienceType === "whole-class" ? "Whole class" : selectedNames.length ? selectedNames.join(", ") : "Choose students";
    const slots = `<div class="platform-class-resource-tray" aria-label="Activity slots for ${escapeHtml(audienceSummary)}">${Array.from({ length: row.slotCount }, (_, index) => { const item = row.resources[index]; const lastEmpty = !item && index === row.slotCount - 1; return `<article><button class="platform-resource-slot-button" type="button" data-action="edit-resource-slot" data-resource-row-id="${escapeHtml(row.id)}" data-resource-slot-index="${index}"><span class="platform-command-label">Slot ${index + 1}</span>${item ? `<strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.type)}</small>` : `<strong>Choose a resource</strong><small>Click this slot to add one</small>`}</button>${item ? `<label class="platform-active-resource-choice"><input type="checkbox" data-active-resource-toggle data-resource-row-id="${escapeHtml(row.id)}" data-resource-index="${index}" checked> Show to ${escapeHtml(audienceSummary)}</label>` : ""}${lastEmpty && row.slotCount > 4 ? `<button type="button" data-action="remove-resource-slot" data-resource-row-id="${escapeHtml(row.id)}">Delete Empty Slot</button>` : ""}</article>`; }).join("")}</div>`;
    const groupName = ["teacher-group", "random-group"].includes(row.audienceType) ? `<label class="platform-group-name">Group name<input data-resource-group-name data-resource-row-id="${escapeHtml(row.id)}" value="${escapeHtml(row.audienceLabel)}" placeholder="Example: Blue Team"></label>` : "";
    const picker = row.audienceType === "whole-class" ? "" : row.audienceType === "students"
      ? `<fieldset class="platform-resource-student-picker"><legend>Choose individual students</legend>${groupStudentList(row)}</fieldset>`
      : `<fieldset class="platform-resource-student-picker platform-group-dropzone${row.audienceType === "random-group" ? " is-random-group" : ""}" data-group-drop-row-id="${escapeHtml(row.id)}"><legend>${row.audienceType === "random-group" ? `Students randomly assigned to ${escapeHtml(row.audienceLabel)}` : `Choose students for ${escapeHtml(row.audienceLabel)}`}</legend><p>${row.audienceType === "random-group" ? "Only this group’s assigned students appear here. Drag students between group rows to adjust the random result." : "The full class roster appears here. Click names to add them, or drag a student here from another group."}</p>${groupStudentList(row, row.audienceType === "random-group")}</fieldset>`;
    const assignmentControl = rowIndex === 0 ? `<p class="platform-primary-assignment-label"><strong>Main assignment:</strong> ${escapeHtml(row.audienceType === "whole-class" ? "Whole class" : row.audienceType === "students" ? "Individual students" : row.audienceType === "teacher-group" ? "Teacher-chosen groups" : "Random groups")}</p>` : `<label>Exception assignment method<select data-resource-audience-type data-resource-row-id="${escapeHtml(row.id)}"><option value="whole-class"${row.audienceType === "whole-class" ? " selected" : ""}>Whole class</option><option value="students"${row.audienceType === "students" ? " selected" : ""}>Individual students</option><option value="teacher-group"${row.audienceType === "teacher-group" ? " selected" : ""}>Teacher-chosen group</option><option value="random-group"${row.audienceType === "random-group" ? " selected" : ""}>Random group</option></select></label>`;
    return `<section class="platform-resource-audience-row${row.audienceType === "random-group" ? " platform-random-group-row" : ""}" data-resource-audience-row="${escapeHtml(row.id)}"><div class="platform-resource-audience-heading"><div><p class="platform-command-label">${rowIndex === 0 ? "Main resource assignment" : row.audienceType === "random-group" ? "Randomly created exception group" : `Different assignment ${rowIndex}`}</p><h4>${escapeHtml(row.audienceType === "whole-class" ? "Whole class" : row.audienceLabel || audienceSummary)}</h4>${row.audienceType !== "whole-class" ? `<p>${escapeHtml(selectedNames.length ? selectedNames.join(", ") : "No students selected yet")}</p>` : ""}</div>${rowIndex ? `<button type="button" data-action="remove-resource-audience" data-resource-row-id="${escapeHtml(row.id)}">Remove This Assignment</button>` : ""}</div>${assignmentControl}${groupName}${picker}${slots}<button class="platform-add-resource-slot" type="button" data-action="add-resource-slot" data-resource-row-id="${escapeHtml(row.id)}">+ Add an Additional Slot</button></section>`;
  }).join("");
  const usesGroups = ["teacher-group", "random-group"].includes(state.assignmentMode) || groupRows.length > 0;
  const groupTools = usesGroups ? `<section class="platform-resource-group-builder"><p class="platform-command-label">Group setup</p><h4>Create or Reuse Groups</h4><p>This area creates group rows. Student membership and resources are managed in the rows below.</p><div class="platform-random-group-controls"><label>Students per random group<input type="number" min="1" max="${Math.max(1, roster.length)}" value="3" data-random-group-size></label><button type="button" data-action="build-random-groups">Create Random Groups</button><button type="button" data-action="add-teacher-group">+ Create a Teacher-Chosen Group</button></div>${groupRows.length ? `<div class="platform-unassigned-students" data-group-drop-row-id="unassigned"><strong>Not assigned to a group</strong>${roster.filter((student) => !groupedStudentIds.has(student.id)).map((student) => `<span draggable="true" data-group-student-id="${escapeHtml(student.id)}">${escapeHtml(student.displayName)}</span>`).join("") || `<span>Everyone is assigned.</span>`}</div>` : ""}<div class="platform-group-preset-controls"><label>Name these group settings<input data-group-set-name maxlength="60" placeholder="Example: Workshop Teams"></label><button type="button" data-action="save-group-set">Save Group Settings</button>${state.savedGroupSets.length ? `<label>Reuse past group settings<select data-saved-group-set><option value="">Choose saved groups</option>${state.savedGroupSets.map((set) => `<option value="${escapeHtml(set.id)}">${escapeHtml(set.name)}</option>`).join("")}</select></label><button type="button" data-action="apply-group-set">Use Saved Groups</button>` : ""}</div></section>` : "";
  const assignmentChooser = `<section class="platform-resource-assignment-chooser"><h4>How do you want today’s resources assigned?</h4><label>Main assignment method<select data-resource-plan-mode><option value="whole-class"${state.assignmentMode === "whole-class" ? " selected" : ""}>Whole class</option><option value="students"${state.assignmentMode === "students" ? " selected" : ""}>Individual students</option><option value="teacher-group"${state.assignmentMode === "teacher-group" ? " selected" : ""}>Teacher-chosen groups</option><option value="random-group"${state.assignmentMode === "random-group" ? " selected" : ""}>Random groups</option></select></label><label>Will any students need resources assigned a different way?<select data-resource-exceptions-enabled><option value="no"${state.exceptionsEnabled ? "" : " selected"}>No</option><option value="yes"${state.exceptionsEnabled ? " selected" : ""}>Yes</option></select></label>${state.exceptionsEnabled ? `<div class="platform-resource-exception-controls"><label>Different assignment method<select data-resource-exception-type>${[["whole-class", "Whole class"], ["students", "Individual students"], ["teacher-group", "Teacher-chosen group"], ["random-group", "Random group"]].filter(([value]) => value !== state.assignmentMode).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label><button type="button" data-action="add-resource-exception">+ Add Different Assignment</button></div>` : ""}</section>`;
  return `<section id="teacher-todays-resources" class="platform-command-card platform-class-resource-sharing platform-visual-zone platform-zone-create" data-class-resource-teacher aria-labelledby="class-resource-title">
    <p class="platform-command-label">Prepare and assign</p>
    <h2 id="class-resource-title">Today’s Resources</h2>
    ${assignmentChooser}
    ${groupTools}
    ${audienceRows}
    <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-sharing">Share Resource Settings With Other Classes</a>
    <details class="platform-class-resource-editor">
      <summary hidden>Choose a resource</summary>
      <h4>Choose a Resource for the Selected Slot</h4>
      <p>Select a catalog activity or add another resource. Saving updates the slot you clicked.</p>
    <form data-form="class-resource" novalidate>
      <input type="hidden" name="rowId" value="whole-class"><input type="hidden" name="slot" value="0">
      <label>Resource type<select name="type" data-class-resource-type>${RESOURCE_TYPES.map((type) => `<option${prepared.type === type ? " selected" : ""}>${type}</option>`).join("")}</select></label>
      <section class="platform-resource-picker" data-resource-picker data-picker-mode="${prepared.type === "Side Path" ? "side-path" : "mission"}"${pickerOpen ? "" : " hidden"} aria-label="Activity library">
        <div data-resource-picker-mission${prepared.type === "Mission Activity" ? "" : " hidden"}>
          <p class="platform-command-label">Mission Activity library</p><h4>Choose a grade and weekly goal</h4>
          <div class="platform-resource-grade-row" aria-label="Grade level"><button type="button" disabled>Grade 3 · catalog pending</button><button type="button" disabled>Grade 4 · catalog pending</button><button type="button" aria-pressed="true">Grade 5</button></div>
          <div class="platform-resource-browser-list" aria-label="Grade 5 weekly goals">
            <article class="platform-resource-browser-item" tabindex="0"><strong>Weekly Goal: Build a Shelter</strong><span>Hover or focus to see activities</span>
              <div class="platform-resource-browser-children"><button type="button" data-action="select-catalog-resource" data-resource-type="Mission Activity" data-resource-title="Design a Space Bedroom" data-resource-url="https://docs.google.com/presentation/d/1GzkVODaIdAweiSCuFxJC3NOAQEE8GmwdMO7z05Inx64/edit?usp=drivesdk"><strong>Design a Space Bedroom</strong><span>Hover for the quick preparation view</span><span class="platform-resource-activity-detail"><b>Goal:</b> Design a usable shelter space.<br><b>Materials:</b> basic design supplies; paper planning or a teacher-approved model.</span></button></div>
            </article>
          </div>
        </div>
        <div data-resource-picker-side-path${prepared.type === "Side Path" ? "" : " hidden"}>
          <p class="platform-command-label">Side Path library</p><h4>Choose a Side Path</h4><p>Hover or keyboard-focus a path to preview its verified activities.</p>
          <div class="platform-resource-browser-list">${["Create", "Design", "Build", "Think", "Code"].map((topic) => `<article class="platform-resource-browser-item" tabindex="0"><strong>${topic}</strong><span>Hover or focus to view activities</span><div class="platform-resource-browser-children"><p>No verified ${topic} activities have been imported yet.</p></div></article>`).join("")}</div>
        </div>
        <div data-resource-picker-webpage${prepared.type === "Webpage" ? "" : " hidden"}>
          <p class="platform-command-label">Teacher webpage library</p><h4>Choose the pages students may use</h4><p>Search or filter this private teacher list. Students see only the pages you select.</p>
          <div class="platform-resource-webpage-tools">
            <label>Find a page<input type="search" data-webpage-search placeholder="Search page names"></label>
            <label>Page group<select data-webpage-category><option value="all">All page groups</option>${[...new Set(TEACHER_WEBPAGE_CATALOG.map((page) => page.category))].map((category) => `<option value="${escapeHtml(category.toLowerCase())}">${escapeHtml(category)}</option>`).join("")}</select></label>
          </div>
          <div class="platform-resource-webpage-list">
            ${TEACHER_WEBPAGE_CATALOG.map((page, index) => `<article data-webpage-catalog-item data-webpage-category-value="${escapeHtml(page.category.toLowerCase())}" data-webpage-search-value="${escapeHtml(`${page.title} ${page.category} ${page.detail}`.toLowerCase())}"><label><input type="checkbox" data-webpage-selection value="${index}"${state.activeResources.some((resource) => resource.type === "Webpage" && resource.url === page.url) ? " checked" : ""}><span><small>${escapeHtml(page.category)}</small><strong>${escapeHtml(page.title)}</strong><span>${escapeHtml(page.detail)}</span></span></label></article>`).join("")}
          </div>
          <p data-webpage-empty hidden>No pages match that search. You can add the page address below.</p>
          <div class="platform-resource-webpage-actions"><button type="button" data-action="show-selected-webpages">Show Selected Pages to Students</button><button type="button" data-action="use-custom-webpage">Add Another Webpage</button></div>
          <p class="platform-resource-webpage-note">For another page from your website, choose <b>Add Another Webpage</b>, then enter its name and address in the fields below.</p>
        </div>
      </section>
      <details class="platform-custom-resource-fields" data-custom-resource-fields><summary>Add a resource that is not listed</summary>
        <label>Student-facing title<input name="title" maxlength="80" value="${escapeHtml(prepared.title)}" placeholder="Example: Bridge Design Builder"></label>
        <label>Resource address<input name="url" type="url" value="${escapeHtml(prepared.url)}" placeholder="https://… or platform path"></label>
        <p>The address is needed only for a custom page. Catalog pages already have their addresses saved.</p>
      </details>
      <label>Release<select name="release">${RESOURCE_RELEASES.map((release) => `<option value="${release}"${prepared.release === release ? " selected" : ""}>${releaseLabels[release]}</option>`).join("")}</select></label>
      <div class="platform-class-resource-actions"><button type="button" data-action="prepare-class-resource">Save for Later</button><button type="button" data-action="push-class-resource">Show on Student Page</button></div>
      <p data-class-resource-status role="status">${state.audienceRows.some((row) => row.resources.length) ? "Resource assignments are ready. Click any slot to add or change its resource." : state.prepared ? `Ready: ${escapeHtml(prepared.title)} · ${escapeHtml(releaseLabels[prepared.release])}` : "Click a slot above to begin."}</p>
    </form>
    <details class="platform-class-resource-saved"><summary>Saved for Later (${state.saved.length})</summary><div>${state.saved.length ? state.saved.map((item) => `<article><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.type)}</small></span><button type="button" data-action="push-saved-resource" data-resource-id="${escapeHtml(item.id)}">Show Next</button><button type="button" data-action="remove-saved-resource" data-resource-id="${escapeHtml(item.id)}">Remove</button></article>`).join("") : `<p>No saved activities yet.</p>`}</div></details>
    </details>
    <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today’s Class Plan</button>
  </section>`;
}

function classResourceStudentMarkup(classId, studentId) {
  const activeResources = classResourceSharing.resourcesForStudent(classId, studentId);
  return `<section id="student-lesson-resources" class="platform-student-shared-resource" aria-labelledby="student-shared-resource-title" data-class-resource-student>
    <p class="platform-student-section-label">Activities and resources</p>
    <h3 id="student-shared-resource-title">Lesson Resources</h3>
    ${activeResources.length ? `<div class="platform-student-activity-tray">${activeResources.map((active) => { const automaticVisual = matchAutomaticVisual({ title: active.title, type: active.type }); return `<article><img class="platform-automatic-resource-visual" src="${escapeHtml(automaticVisual.src)}" alt="${escapeHtml(automaticVisual.alt)}"><p><strong>${escapeHtml(active.title)}</strong><small>${escapeHtml(active.type)}</small></p><a class="platform-button platform-button-primary" href="${escapeHtml(active.url)}" target="_blank" rel="noopener noreferrer"><span class="platform-rainbow-button-text">Open ${escapeHtml(active.title)}</span></a></article>`; }).join("")}</div><p>Choose the activity your teacher directed you to open.</p>` : `<p class="platform-student-empty-state">Your teacher has not shared an activity yet.</p><p>Keep Student Home open; activities pushed from a teacher tab on this same platform address will appear automatically.</p>`}
  </section>`;
}

function directionResourceMarkup(resource, title) {
  if (resource.mediaType === "image") return `<img class="platform-direction-image" src="${escapeHtml(resource.url)}" alt="Visual for ${escapeHtml(title)}">`;
  if (resource.mediaType === "google-slides") {
    const previewUrl = resource.url.replace(/\/edit(?:\?.*)?$/i, "/preview").replace(/\/view(?:\?.*)?$/i, "/preview");
    return `<iframe class="platform-direction-embed" src="${escapeHtml(previewUrl)}" title="${escapeHtml(title)} slides" loading="lazy" allowfullscreen></iframe>`;
  }
  if (resource.mediaType === "youtube") {
    const match = resource.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/i);
    if (match) return `<iframe class="platform-direction-embed" src="https://www.youtube-nocookie.com/embed/${escapeHtml(match[1])}" title="${escapeHtml(title)} video" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }
  const fallbackLabels = { pdf: "PDF", youtube: "video", builder: "Builder", "mission-activity": "mission activity", "side-path": "Side Path", webpage: "webpage" };
  return `<a class="platform-button platform-button-secondary" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(resource.title || fallbackLabels[resource.mediaType] || "resource")}</a>`;
}
function directionMediaMarkup(card) {
  const resources = card.resources?.length ? card.resources : card.url && card.mediaType !== "none" ? [{ mediaType: card.mediaType, url: card.url }] : [];
  return resources.length ? `<div class="platform-direction-resources">${resources.map((resource) => directionResourceMarkup(resource, card.title)).join("")}</div>` : "";
}
function directionResourceEditorRow(resource = { mediaType: "image", url: "" }) {
  const labels = { image: "Image", "google-slides": "Google Slides", youtube: "YouTube video", pdf: "PDF", webpage: "Webpage", builder: "STEM Builder", "mission-activity": "Mission Activity", "side-path": "Side Path" };
  return `<div class="platform-direction-resource-row"><label>Type<select name="resourceType">${Object.entries(labels).map(([value, label]) => `<option value="${value}"${resource.mediaType === value ? " selected" : ""}>${label}</option>`).join("")}</select></label><label>Student-facing title<input name="resourceTitle" maxlength="100" placeholder="Example: Bridge design slides" value="${escapeHtml(resource.title || "")}"></label><label>Link or platform address<input name="resourceUrl" type="text" placeholder="https://… or ../index.html" value="${escapeHtml(resource.url || "")}"></label><div class="platform-direction-actions"><button type="button" data-action="move-direction-resource" data-offset="-1" aria-label="Move resource up">↑</button><button type="button" data-action="move-direction-resource" data-offset="1" aria-label="Move resource down">↓</button><button type="button" data-action="remove-direction-resource">Remove</button></div></div>`;
}

function activityDirectionsTeacherMarkup(classId) {
  const state = activityDirections.read(classId);
  const cards = state.cards.map((card, index) => `<article class="platform-direction-card" data-direction-card-id="${escapeHtml(card.id)}" data-status="${card.status}">
    <div><span class="platform-direction-number">${index + 1}</span><span class="platform-direction-status">${card.status === "released" ? "Visible to students" : "Draft — teacher only"}</span></div>
    <h4>${escapeHtml(card.title)}</h4><p>${escapeHtml(card.directions)}</p>${directionMediaMarkup(card)}
    <div class="platform-direction-actions"><button type="button" data-action="edit-direction-card" data-direction-id="${escapeHtml(card.id)}">Edit</button>${card.status === "released" ? `<button type="button" data-action="withdraw-direction-card" data-direction-id="${escapeHtml(card.id)}">Withdraw</button>` : `<button type="button" data-action="release-direction-card" data-direction-id="${escapeHtml(card.id)}">Release</button>`}<details class="platform-direction-more"><summary>More</summary><div><button type="button" data-action="duplicate-direction-card" data-direction-id="${escapeHtml(card.id)}">Duplicate</button><button type="button" data-action="move-direction-card" data-direction-id="${escapeHtml(card.id)}" data-direction-offset="-1"${index === 0 ? " disabled" : ""}>Move Up</button><button type="button" data-action="move-direction-card" data-direction-id="${escapeHtml(card.id)}" data-direction-offset="1"${index === state.cards.length - 1 ? " disabled" : ""}>Move Down</button><button type="button" data-action="remove-direction-card" data-direction-id="${escapeHtml(card.id)}">Delete</button></div></details></div>
  </article>`).join("");
  return `<section class="platform-command-card platform-activity-directions platform-visual-zone platform-zone-create" data-activity-directions-teacher aria-labelledby="activity-directions-title">
    <p class="platform-command-label">Directions, activities, and resources together</p><h2 id="activity-directions-title">Lesson Steps</h2>
    <p>Add each step as the lesson develops, then attach everything students need directly to that step. Draft steps stay private until you release them.</p>
    <label class="platform-activity-title">Activity title<input data-activity-directions-title maxlength="100" value="${escapeHtml(state.title)}"></label>
    <div class="platform-direction-list">${cards || `<p class="platform-student-empty-state">No direction cards yet. Add the first card below.</p>`}</div>
    <details class="platform-direction-editor"><summary>Add or Edit a Lesson Step</summary>
      <form data-form="activity-direction" novalidate><input type="hidden" name="id">
        <label>Card title<input name="title" maxlength="100" placeholder="Example: Step 1 — Investigate" required></label>
        <label>Directions<textarea name="directions" maxlength="2000" rows="4" placeholder="Tell students exactly what to do next." required></textarea></label>
        <fieldset class="platform-direction-resource-editor"><legend>Activities and resources for this step</legend><p>Attach slides, images, video, webpages, Builder, a mission activity, or a Side Path. Students will find each item directly under these directions.</p><div data-direction-resource-list></div><button type="button" data-action="add-direction-resource">+ Add an Activity or Resource</button></fieldset>
        <label>Student visibility<select name="visibility"><option value="draft">Keep private draft</option><option value="released">Show to students</option></select></label>
        <div class="platform-direction-actions"><button type="button" data-action="save-direction-card">Save Lesson Step</button><button type="reset" data-action="cancel-direction-edit">Clear</button></div>
        <p data-activity-direction-status role="status">${escapeHtml(classroomLessonServiceNotice || "Choose whether students can see this step, then save it.")}</p>
      </form>
    </details>
  </section>`;
}

function activityDirectionsStudentMarkup(classId) {
  const state = activityDirections.read(classId), cards = activityDirections.releasedForStudents(classId);
  return `<section class="platform-activity-directions platform-activity-directions-student platform-student-zone platform-student-zone-now" aria-labelledby="student-directions-title">
    <p class="platform-student-section-label">Teacher directions</p><h2 id="student-directions-title">${escapeHtml(state.title)}</h2>
    ${cards.length ? `<ol class="platform-student-direction-list">${cards.map((card) => `<li><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.directions)}</p>${directionMediaMarkup(card)}</li>`).join("")}</ol>` : `<p class="platform-student-empty-state">Your teacher has not released any directions yet.</p>`}
  </section>`;
}

function assignedResearchTeacherMarkup(assignedResearch, researchLinkBank, className) {
  return `<section class="platform-assigned-research platform-assigned-research-teacher" aria-labelledby="assigned-research-teacher-title">
    <div><p class="platform-command-label">Approved research step</p><h3 id="assigned-research-teacher-title">Approved Research</h3><p>Add a topic and trusted links to today’s lesson. Students never receive an open Google search box.</p></div>
    <form data-form="teacher-assigned-research" novalidate>
      <label>Research topic<input name="topic" maxlength="140" value="${escapeHtml(assignedResearch.topic)}" placeholder="Example: how bridges support weight for kids"></label>
      <button type="button" data-action="preview-assigned-google-search">Preview This Topic in Google</button>
      <label>Approved links—one per line<textarea name="links" rows="5" placeholder="Bridge article | https://example.org/bridge-article">${escapeHtml(teacherAssignedResearchLinksText(assignedResearch))}</textarea><small>Use: Resource title | https://website-address</small></label>
      <div class="platform-actions"><button type="submit">Add to Today’s Lesson</button><button type="button" data-action="clear-assigned-research">Remove from Lesson</button></div>
      <p data-assigned-research-status role="status">${assignedResearch.links.length ? `${assignedResearch.links.length} approved link${assignedResearch.links.length === 1 ? "" : "s"} included for ${escapeHtml(className)}.` : "No approved research links are included in today’s lesson."}</p>
    </form>
    <details class="platform-research-link-bank"><summary>Open Approved Link Bank</summary><div><p class="platform-command-label">Reusable teacher library</p><h4 id="research-link-bank-title">Approved Link Bank</h4><p>Reuse a trusted group of links in this lesson.</p></div><div class="platform-research-bank-grid">${teacherResearchLinkBankMarkup(researchLinkBank, assignedResearch)}</div><details class="platform-research-bank-create"><summary>Create a New Link Group</summary><form data-form="teacher-research-link-bank" novalidate><label>Group title<input name="title" maxlength="80" placeholder="Example: Bridges and Structures" required></label><label>Topic or description<input name="topic" maxlength="140" placeholder="Example: How bridges support weight"></label><label>Approved links—one per line<textarea name="links" rows="5" placeholder="Bridge article | https://example.org/bridge-article" required></textarea><small>Use: Resource title | https://website-address</small></label><div class="platform-actions"><button type="submit">Save Group to Link Bank</button></div><p data-research-bank-status role="status">You can save up to 24 groups in this browser.</p></form></details></details>
  </section>`;
}

function todaysLessonTeacherMarkup(classId, assignedResearch, researchLinkBank, className) {
  const state = activityDirections.read(classId), resources = state.cards.flatMap((card) => card.resources || []).length;
  return `<section id="teacher-todays-lesson" class="platform-todays-lesson platform-visual-zone platform-zone-create" aria-labelledby="todays-lesson-title"><header class="platform-todays-lesson-heading"><p class="platform-command-label">Build and release as students learn</p><h2 id="todays-lesson-title">Today’s Lesson</h2><p>${state.cards.length} lesson step${state.cards.length === 1 ? "" : "s"} · ${resources} attached activit${resources === 1 ? "y or resource" : "ies and resources"} · ${assignedResearch.links.length} approved research link${assignedResearch.links.length === 1 ? "" : "s"}</p><div class="platform-todays-lesson-actions"><button type="button" data-action="add-lesson-step">+ Add Lesson Step</button><a class="platform-button platform-button-secondary" href="#${ROUTES.PREVIEW_STUDENT}" target="_blank" rel="noopener">Preview as Student</a></div></header><div class="platform-todays-lesson-sections"><details data-lesson-builder="steps" open><summary>Lesson Steps, Activities, and Resources</summary>${activityDirectionsTeacherMarkup(classId)}</details><details data-lesson-builder="research"><summary>Approved Research</summary>${assignedResearchTeacherMarkup(assignedResearch, researchLinkBank, className)}</details></div></section>`;
}

function readStudentNameplate(studentId) {
  const fallback = { font: "slab", background: "cream", color: "#173247" };
  try {
    const all = JSON.parse(window.localStorage.getItem(STUDENT_NAMEPLATE_STORAGE_KEY) || "{}");
    const saved = all[studentId] || {};
    return {
      font: STUDENT_NAMEPLATE_FONTS.includes(saved.font) ? saved.font : fallback.font,
      background: STUDENT_NAMEPLATE_BACKGROUNDS.includes(saved.background) ? saved.background : fallback.background,
      color: /^#[0-9a-f]{6}$/i.test(saved.color) ? saved.color : fallback.color,
    };
  } catch { return fallback; }
}

function writeStudentNameplate(studentId, preferences) {
  try {
    const all = JSON.parse(window.localStorage.getItem(STUDENT_NAMEPLATE_STORAGE_KEY) || "{}");
    all[studentId] = preferences;
    window.localStorage.setItem(STUDENT_NAMEPLATE_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

function studentNameplateMarkup(studentId, studentName, className, rawStudentName) {
  const preferences = readStudentNameplate(studentId);
  const selected = (value, current) => value === current ? " selected" : "";
  const classLabels = productionStudentClassLabels.length ? productionStudentClassLabels : [];
  const rosterIndex = classLabels.findIndex((label) => label === rawStudentName);
  const limerick = generateStudentNameBobLimerick(rawStudentName, rosterIndex >= 0 ? rosterIndex : null);
  const limerickMarkup = limerick.ok ? `<p class="platform-student-nameplate-limerick">${escapeHtml(limerick.limerick).replaceAll("\n", "<br>")}</p>` : "";
  return `<section class="platform-student-orientation platform-student-nameplate-bg-${preferences.background} platform-student-nameplate-font-${preferences.font}" style="--student-name-color:${preferences.color}" data-student-nameplate data-student-id="${escapeHtml(studentId)}" aria-labelledby="student-orientation-title"><h2 id="student-orientation-title">${studentName}</h2><p class="platform-student-class">${className}</p>${limerickMarkup}<details class="platform-student-nameplate-customizer"><summary>Customize my nameplate</summary><div><label>Fancy text<select data-student-nameplate-control="font"><option value="slab" style="font-family:'Roboto Slab',Rockwell,Georgia,serif"${selected("slab", preferences.font)}>Inventor</option><option value="classic" style="font-family:Georgia,'Times New Roman',serif;font-style:italic"${selected("classic", preferences.font)}>Classic</option><option value="cursive" style="font-family:'School Cursive',cursive"${selected("cursive", preferences.font)}>Cursive</option><option value="playful" style="font-family:'Comic Sans MS','Comic Sans',cursive"${selected("playful", preferences.font)}>Playful</option></select></label><label>Background<select data-student-nameplate-control="background"><option value="cream"${selected("cream", preferences.background)}>Cream</option><option value="brass"${selected("brass", preferences.background)}>Brass</option><option value="blue"${selected("blue", preferences.background)}>Blue Steel</option><option value="green"${selected("green", preferences.background)}>Workshop Green</option><option value="parchment"${selected("parchment", preferences.background)}>Old Map</option></select></label><label>Name color<input type="color" value="${preferences.color}" data-student-nameplate-control="color"></label></div><p>Changes save automatically.</p></details></section>`;
}

function studentClassLimerickMarkup(classId) {
  const fixtureLabels = getRosterForClass(classId).map((student) => student.displayName);
  const labels = productionStudentClassLabels.length ? productionStudentClassLabels : fixtureLabels;
  const result = generateClassNameBobLimerick(labels);
  if (!result.ok) return "";
  return `<details class="platform-student-class-limerick"><summary>🎩 Our Class Limerick</summary><div><p>${escapeHtml(result.limerick).replaceAll("\n", "<br>")}</p><button class="platform-student-listen-button" type="button" data-action="read-student-section" aria-pressed="false">Listen</button></div></details>`;
}

function todaysLessonStudentMarkup(classId, studentId, assignedResearch, locked = false) {
  const releasedSidePath = activityDirections.releasedForStudents(classId).flatMap((card) => card.resources ?? []).find((resource) => resource.mediaType === "side-path" && resource.url);
  const assignedSidePath = classResourceSharing.resourcesForStudent(classId, studentId).find((resource) => resource.type === "Side Path" && resource.url);
  const currentSidePath = releasedSidePath ?? assignedSidePath;
  const sidePathType = currentSidePath?.title || currentSidePath?.type || "Teacher choice";
  const sidePathLaunch = currentSidePath ? `<a class="platform-school-start-launch-link platform-school-start-launch-link-side-path" href="${escapeHtml(currentSidePath.url)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">SP</span><strong>SIDE PATH</strong><small>${escapeHtml(sidePathType)}</small></a>` : `<button class="platform-school-start-launch-link platform-school-start-launch-link-side-path is-unavailable" type="button" disabled aria-label="Side Path locked"><span aria-hidden="true">SP</span><strong>SIDE PATH</strong><small>🔒 Locked</small></button>`;
  const researchMarkup = assignedResearch.topic || assignedResearch.links.length ? `<section class="platform-assigned-research platform-assigned-research-student" aria-labelledby="assigned-research-student-title"><p class="platform-student-section-label">Teacher links</p><h3 id="assigned-research-student-title">Research</h3>${assignedResearch.topic ? `<p>${escapeHtml(assignedResearch.topic)}</p>` : ""}${assignedResearch.links.length ? `<div class="platform-assigned-research-links">${assignedResearch.links.map((link) => `<button type="button" data-action="open-assigned-research" data-research-url="${escapeHtml(link.url)}">${escapeHtml(link.title)}</button>`).join("")}</div>` : ""}</section>` : "";
  return `<section class="platform-todays-lesson-student platform-student-zone platform-student-zone-now platform-student-trail-stop platform-student-trail-stop-right${locked ? " is-captains-log-locked" : ""}" id="student-todays-activities" aria-labelledby="student-todays-lesson-title"${locked ? " aria-disabled=\"true\"" : ""}>${locked ? `<p class="platform-student-prompt-gate">🔒 Finish the Captain’s Log that is due before continuing. Listen and accessibility tools are still available.</p>` : ""}<div class="platform-student-step-heading"><img src="./assets/images/student-path/inventors-workshop-brass-badge.png" alt=""><div class="platform-student-step-title"><p class="platform-student-section-label">Step 2</p><h2 id="student-todays-lesson-title">Inventor’s Workshop</h2></div></div><p>Follow the mission orders. Use the machines you need.</p>${activityDirectionsStudentMarkup(classId)}<section class="platform-school-start-launcher platform-school-start-launcher-inline" aria-labelledby="school-start-launcher-title"><h3 id="school-start-launcher-title">Auxiliary Machines</h3><p class="platform-school-start-launcher-subheading">Extra Activities</p><div class="platform-school-start-launch-grid">${sidePathLaunch}<a class="platform-school-start-launch-link platform-school-start-launch-link-builder" href="../index.html" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">SB</span><strong>STEM BUILDER</strong><small>Build</small></a><a class="platform-school-start-launch-link platform-school-start-launch-link-workshop" href="http://192.168.1.252:8000" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">SW</span><strong>STEM WORKSHOP</strong><small>Open</small></a></div><button class="platform-student-listen-button" type="button" data-action="read-student-launches" data-side-path-assigned="${currentSidePath ? "true" : "false"}" aria-pressed="false">Listen</button></section>${researchMarkup}</section>`;
}

function captainLogThinkingHelp(promptId = "") {
  const directions = {
    "week-1-ask": "Name one thing that surprised you. Tell what happened. Then write one question you have now.",
    "week-2-make": "Choose one attempt that went differently than you expected. Tell what you tried, what happened, and what it taught you.",
    "week-3-improve": "Pick one part you will or could improve. Name the change you would make and explain why it may help.",
    "week-4-grow": "Think of one hard or unclear moment. Explain how it changed your idea or helped you learn.",
    "week-5-evidence": "Choose one observation, result, or piece of data. Explain what it shows your idea cannot do yet—or what you could try next.",
    "week-6-explain": "Tell what you planned, what actually happened, and what you learned from the difference.",
    "week-7-next": "Name one way you made progress. Then explain one way the work could become even better.",
  };
  return directions[promptId] ?? "Tell what happened. Add one detail or piece of evidence. Explain what you learned and what you could try next.";
}

function captainLogThinkingHelpMarkup(promptId) {
  return `<div class="platform-captains-log-thinking-help"><button type="button" data-action="toggle-captains-log-thinking-help" aria-expanded="false">Show what I need to think about</button><p hidden>${escapeHtml(captainLogThinkingHelp(promptId))}</p></div>`;
}

function adaptiveCaptainLogPrompt(entry, level = "starting") {
  const preset = CAPTAINS_LOG_PRESET_PROMPTS.find((item) => item.id === entry?.promptId);
  return preset?.[level] ?? entry?.prompt ?? preset?.prompt ?? "";
}

function captainLogLevelLabel(level) {
  return level === "stretching" ? "Stretching" : level === "growing" ? "Growing" : "Starting";
}

function captainsLogStudentWeekMarkup(classId, studentId) {
  const plan = weeklyReflections.captainLogWeekPlan(classId);
  const questionLevel = weeklyReflections.studentQuestionLevel(classId, studentId);
  const completed = weeklyReflections.responses(classId, studentId);
  const completedIds = new Set(completed.map((item) => item.promptId).filter(Boolean));
  const entries = CAPTAINS_LOG_WEEKDAYS.map((slot) => ({ slot, ...plan.days[slot] })).filter((item) => item.enabled);
  const required = Number(plan.required ?? weeklyReflections.requirement(classId));
  const done = Math.min(required, completed.length);
  const remaining = Math.max(0, required - done);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayIndex = CAPTAINS_LOG_WEEKDAYS.indexOf(today);
  const unfinishedAssigned = entries.filter((item) => (item.assignment ?? item.slot) !== "Daily student choice" && !completedIds.has(item.promptId));
  const choiceNeeded = Math.max(0, remaining - unfinishedAssigned.length);
  const todayAssigned = unfinishedAssigned.filter((item) => (item.assignment ?? item.slot) === today);
  const futureAssigned = unfinishedAssigned.filter((item) => CAPTAINS_LOG_WEEKDAYS.indexOf(item.assignment ?? item.slot) > todayIndex);
  const timeline = [];
  if (!remaining) timeline.push("All done for this week!");
  else {
    if (todayAssigned.length) timeline.push(`Today: complete ${todayAssigned.length === 1 ? "the assigned prompt" : `${todayAssigned.length} assigned prompts`}.`);
    else if (choiceNeeded > 0) timeline.push("Today: complete one choice prompt.");
    futureAssigned.forEach((item) => timeline.push(`${item.assignment ?? item.slot}: complete the assigned prompt.`));
    const plannedToday = todayAssigned.length ? 0 : Math.min(1, choiceNeeded);
    const reservedDays = new Set(futureAssigned.map((item) => item.assignment ?? item.slot));
    CAPTAINS_LOG_WEEKDAYS.slice(Math.max(0, todayIndex + 1)).filter((day) => !reservedDays.has(day)).slice(0, Math.max(0, choiceNeeded - plannedToday)).forEach((day) => timeline.push(`${day}: complete one different choice prompt.`));
  }
  const assignedEntries = entries.filter((item) => (item.assignment ?? item.slot) !== "Daily student choice");
  const choiceEntries = entries.filter((item) => (item.assignment ?? item.slot) === "Daily student choice");
  const assignedPrompts = assignedEntries.map((item) => {
    const assignment = item.assignment ?? item.slot;
    const isDone = completedIds.has(item.promptId);
    const number = CAPTAINS_LOG_WEEKDAYS.indexOf(item.slot) + 1;
    const label = isDone ? "✓ Done" : assignment === today ? `Today · ${assignment}` : assignment;
    return `<li class="${isDone ? "is-complete" : ""}"><span aria-hidden="true">${isDone ? "✓" : "●"}</span><div><strong>Prompt ${number} · ${escapeHtml(label)}</strong><p>${escapeHtml(adaptiveCaptainLogPrompt(item, questionLevel))}</p>${captainLogThinkingHelpMarkup(item.promptId)}</div></li>`;
  }).join("");
  const choiceRequired = Math.max(0, required - assignedEntries.length);
  const choiceCompleted = choiceEntries.filter((item) => completedIds.has(item.promptId)).length;
  const choiceRemaining = Math.max(0, choiceRequired - choiceCompleted);
  const choiceTaskNumbers = Array.from({ length: choiceRequired }, (_, index) => assignedEntries.length + index + 1);
  const choiceTaskLabel = choiceTaskNumbers.length === 1 ? `Prompt ${choiceTaskNumbers[0]}` : `Prompts ${choiceTaskNumbers.slice(0, -1).join(", ")}${choiceTaskNumbers.length > 2 ? "," : ""} and ${choiceTaskNumbers.at(-1)}`;
  const choiceGroup = choiceEntries.length && choiceRequired ? `<li class="platform-captains-log-choice-task${choiceRemaining === 0 ? " is-complete" : ""}"><span aria-hidden="true">${choiceRemaining === 0 ? "✓" : "◇"}</span><div><strong>${choiceTaskLabel} - choose ${choiceRequired} from these choices</strong>${choiceRemaining === 0 ? `<small>✓ Choice complete</small>` : choiceCompleted ? `<small>${choiceCompleted} chosen · ${choiceRemaining} left</small>` : ""}<ul>${choiceEntries.map((item, index) => { const isDone = completedIds.has(item.promptId); return `<li class="${isDone ? "is-complete" : ""}"><strong>Choice ${String.fromCharCode(65 + index)}${isDone ? " · Used" : ""}</strong><p>${escapeHtml(adaptiveCaptainLogPrompt(item, questionLevel))}</p>${captainLogThinkingHelpMarkup(item.promptId)}</li>`; }).join("")}</ul></div></li>` : "";
  return `<section class="platform-captains-log-week-map" aria-labelledby="captains-log-week-map-title"><div><h3 id="captains-log-week-map-title">Your Week</h3><p><strong>${done} of ${required} done</strong> · ${remaining} left</p></div><p class="platform-captains-log-level" data-captains-log-level="${questionLevel}">Bob’s question level: <strong>${captainLogLevelLabel(questionLevel)}</strong></p><p class="platform-captains-log-week-instruction">Complete the assigned prompts and ${choiceRequired ? `choose ${choiceRequired} more` : "follow the assigned days"}.</p><ol>${assignedPrompts}${choiceGroup}</ol><div class="platform-captains-log-student-timeline"><strong>Suggested plan</strong>${timeline.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div></section>`;
}

function studentReflectionMarkup(reflectionStatus, teacherActivities, reflectionOptions, classId) {
  if (!reflectionStatus.required) return "";
  const due = new Date(reflectionActivityWindowStart(new Date()) + (6 * 24 * 60 * 60 * 1000));
  const dueLabel = due.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  const plan = weeklyReflections.captainLogPlan(classId);
  const choices = weeklyReflections.captainLogChoices(classId, session.read().studentId);
  const questionLevel = weeklyReflections.studentQuestionLevel(classId, session.read().studentId);
  const weekMap = captainsLogStudentWeekMarkup(classId, session.read().studentId);
  const promptChoice = choices.length > 1
    ? `<label class="platform-student-prompt-choice">Choose a prompt<select name="promptId" required><option value="">Choose one</option>${choices.map((item) => `<option value="${escapeHtml(item.promptId)}">${escapeHtml(adaptiveCaptainLogPrompt(item, questionLevel))}</option>`).join("")}</select></label>${captainLogThinkingHelpMarkup("")}`
    : `<input type="hidden" name="promptId" value="${escapeHtml(choices[0]?.promptId ?? plan.promptId)}"><p class="platform-captains-log-prompt"><strong>${escapeHtml(adaptiveCaptainLogPrompt(choices[0] ?? plan, questionLevel))}</strong></p>${captainLogThinkingHelpMarkup(choices[0]?.promptId ?? plan.promptId)}`;
  const availableToday = weeklyReflections.captainLogAvailableToday(classId) && choices.length;
  return `<section class="platform-student-reflection platform-student-reflection-inline platform-student-zone platform-student-zone-review platform-student-trail-stop platform-student-trail-stop-right" data-reflection-state="${reflectionStatus.state}" aria-labelledby="reflection-check-title"><p class="platform-student-section-label">Step 4</p><div class="platform-student-step-heading"><img src="./assets/images/student-path/captains-log-brass-badge.png" alt=""><h2 id="reflection-check-title">Captain’s Log</h2></div><p class="platform-student-status" data-weekly-reflection-status>${reflectionStatus.remaining === 0 ? `Done! ${reflectionStatus.completed} finished this week.` : `Exit ticket · ${reflectionStatus.remaining} left this week · Due ${escapeHtml(dueLabel)}.`}</p>${weekMap}${reflectionStatus.remaining === 0 ? "" : availableToday ? `<details class="platform-student-reflection-form"><summary>Open Captain’s Log</summary><form data-form="weekly-reflection" data-coaching-started-at="${Date.now()}" novalidate>${promptChoice}<label for="weekly-reflection-activity">Activity Worked On Today</label><select id="weekly-reflection-activity" name="activityChoice" required><option value="">Choose an activity</option>${teacherActivities.map((activity) => `<option value="${escapeHtml(activity)}">${escapeHtml(activity)}</option>`).join("")}<option value="__other__">Other activity — type my own</option></select><label data-reflection-other-activity hidden>Type the activity name<input name="activityOther" maxlength="120"></label><label for="weekly-reflection-progress">Mission Progress</label><select id="weekly-reflection-progress" name="progress" required>${reflectionOptions(REFLECTION_PROGRESS_OPTIONS)}</select><label for="weekly-reflection-response">Your answer</label><textarea id="weekly-reflection-response" name="explanation" minlength="10" maxlength="500" required></textarea><button class="platform-reflection-speech-button" type="button" data-action="reflection-dictate" aria-pressed="false">Speak Answer</button><button class="platform-reflection-speech-stop" type="button" data-action="reflection-dictate-stop" hidden>Stop Speaking</button><p class="platform-reflection-speech-status" data-reflection-speech-status role="status">Type or speak.</p><label>Did you improve your idea?<select name="improved" required>${reflectionOptions(REFLECTION_IMPROVEMENT_OPTIONS)}</select></label><label>Badge<select name="badge" required>${reflectionOptions(REFLECTION_BADGE_OPTIONS)}</select></label><label>Need help next class?<select name="help" required>${reflectionOptions(REFLECTION_HELP_OPTIONS)}</select></label><label>Could you help someone?<select name="helpOther" required>${reflectionOptions(REFLECTION_HELP_OTHER_OPTIONS)}</select></label><label>How did it go?<select name="rating" required>${reflectionOptions(REFLECTION_ACTIVITY_RATING_OPTIONS)}</select></label><section class="platform-bob-coaching" data-bob-coaching hidden aria-labelledby="bob-coaching-title"><h3 id="bob-coaching-title">Bob’s Next Questions</h3><p>Show a little more of your thinking.</p><div data-bob-coaching-questions></div></section><button type="submit" data-weekly-reflection-submit>Continue with Bob</button><p class="platform-error" data-weekly-reflection-error role="alert" hidden></p></form></details>` : `<p class="platform-student-status">No Captain’s Log is due today. Check the plan above for your next prompt.</p>`}</section>`;
}

function captainsLogPlannerMarkup(classId) {
  const editorWeek = captainLogEditorWeek(classId), activeWeek = currentRotationWeek(classId);
  const plan = weeklyReflections.captainLogWeekPlan(classId, editorWeek), library = weeklyReflections.captainLogLibrary();
  const required = Number(plan.required ?? weeklyReflections.requirement(classId));
  const choices = [...CAPTAINS_LOG_PRESET_PROMPTS, ...library.map((item) => ({ ...item, label: "Saved" }))];
  const state = session.read();
  const classes = productionIdentityConfig.enabled && productionTeacherClasses.length ? productionTeacherClasses : getClassesForTeacher(state.teacherId);
  const otherClasses = classes.filter((item) => item.id !== classId);
  const dayRows = CAPTAINS_LOG_WEEKDAYS.map((day, index) => {
    const entry = plan.days[day], selectedId = choices.some((item) => item.id === entry.promptId) ? entry.promptId : "custom";
    const hasPromptSelection = Boolean(entry.promptId || entry.prompt);
    const custom = hasPromptSelection && selectedId === "custom";
    const assignment = CAPTAINS_LOG_ASSIGNMENT_OPTIONS.includes(entry.assignment) ? entry.assignment : "";
    return `<div class="platform-captains-log-day" data-captains-log-day="${day}"><label class="platform-captains-log-day-toggle"><input type="checkbox" name="enabled-${day}"${entry.enabled ? " checked" : ""}> <strong>Prompt ${index + 1}</strong></label><label class="platform-captains-log-choice">Choose prompt<select name="promptId-${day}" data-captains-log-prompt-choice><option value=""${hasPromptSelection ? "" : " selected"} disabled>Select or create a prompt…</option><option value="custom"${custom ? " selected" : ""}>Create a new prompt</option>${choices.map((item) => `<option value="${escapeHtml(item.id)}"${selectedId === item.id ? " selected" : ""}>${item.week ? "" : "Library · "}${escapeHtml(item.label)} — ${escapeHtml(item.prompt)}</option>`).join("")}</select></label><label class="platform-captains-log-assignment">Offer this prompt<select name="assignment-${day}"><option value=""${assignment ? "" : " selected"} disabled>Choose a day or student choice…</option>${CAPTAINS_LOG_ASSIGNMENT_OPTIONS.map((option) => `<option value="${option}"${assignment === option ? " selected" : ""}>${option}</option>`).join("")}</select></label><div class="platform-captains-log-custom-row" data-captains-log-custom-row${custom ? "" : " hidden"}><label>Prompt text<input name="prompt-${day}" value="${escapeHtml(entry.prompt)}" minlength="5" maxlength="240"></label><label class="platform-captains-log-library-choice"><input type="checkbox" name="save-${day}"> Save to library</label></div></div>`;
  }).join("");
  const enabledCount = CAPTAINS_LOG_WEEKDAYS.filter((day) => plan.days[day].enabled).length;
  const assignedCount = CAPTAINS_LOG_WEEKDAYS.filter((day) => plan.days[day].enabled && (plan.days[day].assignment ?? day) !== "Daily student choice").length;
  return `<details id="teacher-captains-log-planner" class="platform-command-card platform-captains-log-planner" data-captains-log-editor-week="${editorWeek}"><summary><span><strong>Plan Exit Tickets</strong><small>Captain’s Log prompts, weekly goal, and class copies</small></span><b>${required} required</b></summary><div class="platform-captains-log-planner-body"><p class="platform-command-label">Exit tickets</p><h3 id="captains-log-planner-title">Plan the Captain’s Log</h3><p>Each class keeps seven separate five-day plans. Editing a future week does not change what students see.</p><div class="platform-captains-log-week-controls"><label>Edit plan for<select data-captains-log-editor-week>${CAPTAINS_LOG_PRESET_PROMPTS.map((item) => `<option value="${item.week}"${editorWeek === item.week ? " selected" : ""}>Week ${item.week}</option>`).join("")}</select></label><p><strong>Students are on Week ${activeWeek}.</strong> Change the Current Rotation Week in Class Setup.</p><button class="platform-button platform-button-secondary" type="button" data-action="clear-captains-log-week">Start Week ${editorWeek} Blank</button></div><form data-form="captains-log-week-plan" novalidate><input type="hidden" name="week" value="${editorWeek}"><div class="platform-captains-log-weekly-goal"><label>Weekly Goal<strong>Students complete</strong><span><select name="required" data-captains-log-required>${[0,1,2,3,4,5].map((count) => `<option value="${count}"${required === count ? " selected" : ""}>${count}</option>`).join("")}</select> different Captain’s Logs this week.</span></label><p data-captains-log-summary><strong>${required} required · ${enabledCount} prompts available</strong><span>${assignedCount} assigned to specific days · ${enabledCount - assignedCount} student choices</span></p></div><div class="platform-captains-log-days">${dayRows}</div><button type="submit">Save Week ${editorWeek} Plan</button><p data-captains-log-status role="status">Week ${editorWeek}: ${enabledCount} Captain’s Log${enabledCount === 1 ? "" : "s"} planned.${editorWeek === activeWeek ? " This is the class’s current rotation week." : ` Students are currently on Week ${activeWeek}.`}</p></form>${otherClasses.length ? `<details class="platform-captains-log-copy"><summary>Copy Week ${editorWeek} to other classes</summary><fieldset><legend>Copy to</legend>${otherClasses.map((item) => `<label><input type="checkbox" data-captains-log-copy-target value="${escapeHtml(item.id)}"> ${escapeHtml(item.periodLabel || item.displayName)}${item.periodLabel ? ` — ${escapeHtml(item.displayName)}` : ""}</label>`).join("")}</fieldset><button type="button" data-action="copy-captains-log-week">Copy Week ${editorWeek} Plan</button><p data-captains-log-copy-status role="status">Choose one or more classes.</p></details>` : ""}${library.length ? `<details class="platform-captains-log-library"><summary>My Prompt Library (${library.length})</summary>${library.map((item) => `<div><span>${escapeHtml(item.prompt)}</span><button type="button" data-action="delete-captains-log-prompt" data-prompt-id="${escapeHtml(item.id)}">Delete</button></div>`).join("")}</details>` : ""}</div></details>`;
}

function weeklyReflectionTeacherMarkup(classId) {
  const required = weeklyReflections.requirement(classId);
  return `<section class="platform-classroom-setup platform-weekly-reflection-setup" aria-labelledby="weekly-reflection-setup-title">
    <p class="platform-command-label">Weekly reflection</p>
    <h3 id="weekly-reflection-setup-title">What I Learned Today Requirement</h3>
    <p>Choose how many reflections each student should complete during the current Monday–Sunday week.</p>
    <form data-form="weekly-reflection-requirement" novalidate>
      <label>Responses required this week<select name="required">${[0, 1, 2, 3, 4, 5].map((count) => `<option value="${count}"${required === count ? " selected" : ""}>${count}</option>`).join("")}</select></label>
      <button type="submit">Save Weekly Requirement</button>
      <p data-weekly-reflection-teacher-status role="status">Current requirement: ${required} response${required === 1 ? "" : "s"} per student this week.</p>
    </form>
  </section>`;
}

function evidenceCaptureMarkup() {
  const activity = escapeHtml(currentEvidenceActivity());
  const items = evidenceFoundation.timeline();
  const draft = evidenceDraft;
  const inputAccept = draft?.type === EVIDENCE_TYPES.VIDEO ? "video/*" : draft?.type === EVIDENCE_TYPES.MORE ? "*/*" : "image/*";
  const needsFile = draft && draft.type !== EVIDENCE_TYPES.REFLECTION;
  return `
    <div class="platform-evidence-workspace">
      <div class="platform-evidence-context"><span>Current activity</span><strong>${activity}</strong><small>Added automatically to new evidence</small></div>
      <div class="platform-evidence-actions" aria-label="Add evidence">
        ${["Photo", "Screenshot", "Video", "Reflection", "More Evidence"].map((type) => `<button type="button" data-action="evidence-start" data-evidence-type="${type}">${type}</button>`).join("")}
        <button class="platform-button platform-button-secondary" type="button" data-action="evidence-open-log">Open Evidence Log</button>
      </div>
      ${draft ? `<section class="platform-evidence-capture" aria-labelledby="evidence-capture-title">
        <p class="platform-stem-work-label">Capture</p><h4 id="evidence-capture-title">Add ${escapeHtml(draft.type)}</h4>
        ${needsFile ? `<label class="platform-evidence-file">Choose ${draft.type.toLowerCase()}<input data-evidence-file type="file" accept="${inputAccept}" ${draft.type === EVIDENCE_TYPES.PHOTO ? "capture=\"environment\"" : ""}></label>` : `<label for="evidence-reflection">What did you try, notice, or change?</label><textarea id="evidence-reflection" data-evidence-reflection maxlength="600" rows="4">${escapeHtml(draft.detail || "")}</textarea>`}
        <div class="platform-evidence-preview" data-evidence-preview>
          ${draft.previewUrl ? (draft.type === EVIDENCE_TYPES.VIDEO ? `<video src="${draft.previewUrl}" controls></video>` : draft.type === EVIDENCE_TYPES.MORE ? `<p><strong>${escapeHtml(draft.fileName)}</strong><br>${escapeHtml(draft.detail)}</p>` : `<img src="${draft.previewUrl}" alt="Preview of evidence ready to save">`) : `<p>${draft.detail ? escapeHtml(draft.detail) : "Your preview will appear here before anything is saved."}</p>`}
        </div>
        <div class="platform-actions"><button class="platform-button platform-button-primary" type="button" data-action="evidence-save">Save Evidence</button>${draft.hasSelection ? `<button class="platform-button platform-button-secondary" type="button" data-action="evidence-retake">Retake</button>` : ""}<button class="platform-button platform-button-secondary" type="button" data-action="evidence-cancel">Cancel</button></div>
        <p class="platform-error" data-evidence-error role="alert" hidden></p>
      </section>` : ""}
      <p class="platform-evidence-notice" role="status" aria-live="polite">${escapeHtml(evidenceNotice)}</p>
      <section class="platform-evidence-log" id="student-evidence-log" aria-labelledby="evidence-log-title">
        <div><p class="platform-stem-work-label">Fictional pilot data</p><h4 id="evidence-log-title">Evidence Timeline</h4></div>
        <ol>${items.map((item) => `<li><span class="platform-evidence-type">${escapeHtml(item.type)}</span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.activity)} · ${escapeHtml(item.time)}</p><small>${escapeHtml(item.detail)}</small></div></li>`).join("")}</ol>
      </section>
      <p class="platform-evidence-boundary">Fictional pilot only. Photo and Screenshot use the teacher-owned Drive when the local pilot service is running; all other evidence remains in this browser session.</p>
    </div>`;
}

function teacherEvidenceReviewMarkup() {
  const visible = teacherEvidenceFilter === "All"
    ? PILOT_TEACHER_EVIDENCE
    : PILOT_TEACHER_EVIDENCE.filter((item) => item.type === teacherEvidenceFilter);
  const selected = PILOT_TEACHER_EVIDENCE.find((item) => item.id === teacherEvidenceSelection);
  return `
    <div class="platform-teacher-evidence-review" data-teacher-evidence-review>
      <div class="platform-teacher-evidence-heading">
        <div><p class="platform-command-label">Fictional classroom preview</p><h3 id="teacher-evidence-review-title">Student Evidence</h3></div>
        <label>Show evidence type
          <select data-teacher-evidence-filter>
            ${["All", ...Object.values(EVIDENCE_TYPES)].map((type) => `<option value="${type}"${teacherEvidenceFilter === type ? " selected" : ""}>${type}</option>`).join("")}
          </select>
        </label>
      </div>
      <p>Browse sample evidence without assigning grades, leaving comments, or recording whether a teacher viewed it.</p>
      <div class="platform-teacher-evidence-layout">
        <ul class="platform-teacher-evidence-list" aria-label="Fictional student evidence">
          ${visible.length ? visible.map((item) => `<li><button type="button" data-action="teacher-evidence-open" data-evidence-id="${item.id}" aria-pressed="${item.id === teacherEvidenceSelection}"><span>${escapeHtml(item.student)} · ${escapeHtml(item.type)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.time)}</small></button></li>`).join("") : "<li><p>No fictional evidence matches this filter.</p></li>"}
        </ul>
        <section class="platform-teacher-evidence-detail" aria-labelledby="teacher-evidence-detail-title" tabindex="-1">
          ${selected ? `<p class="platform-evidence-type">${escapeHtml(selected.type)}</p><h4 id="teacher-evidence-detail-title">${escapeHtml(selected.title)}</h4><p><strong>${escapeHtml(selected.student)}</strong> · ${escapeHtml(selected.activity)}</p><div class="platform-teacher-evidence-artifact" aria-label="Fictional evidence preview">${escapeHtml(selected.detail)}</div><small>${escapeHtml(selected.time)}</small>` : `<h4 id="teacher-evidence-detail-title">Choose fictional evidence</h4><p>Select an item to preview it.</p>`}
        </section>
      </div>
      <p class="platform-evidence-boundary">Preview only. No real student accounts, files, Google Drive, grades, comments, automated messages, or teacher-review history are connected.</p>
    </div>`;
}

function teacherLiveEvidenceMarkup() {
  const choices = (field) => ["All", ...new Set(teacherLiveEvidence.map((item) => item[field]).filter(Boolean))];
  const visible = teacherLiveEvidence.filter((item) => Object.entries(teacherLiveEvidenceFilters).every(([field, value]) => value === "All" || item[field] === value));
  const selected = visible.find((item) => item.id === teacherLiveEvidenceSelection);
  const displayType = (item) => item.evidenceType || "Photo";
  const savedLabel = (item) => item.savedAt ? new Date(item.savedAt).toLocaleString() : "Saved in pilot Drive";
  return `<div class="platform-live-evidence" data-live-evidence-inbox>
    <div class="platform-actions"><button class="platform-button platform-button-secondary" type="button" data-action="evidence-teacher-refresh">Refresh Live Evidence</button></div>
    <p role="status" aria-live="polite">${escapeHtml(teacherLiveEvidenceNotice)}</p>
    ${teacherLiveEvidence.length ? `<div class="platform-live-evidence-filters" aria-label="Filter persistent fictional evidence">
      ${[["studentId", "Student"], ["activity", "Activity"], ["evidenceType", "Evidence type"]].map(([field, label]) => `<label>${label}<select data-live-evidence-filter="${field}">${choices(field).map((value) => `<option value="${escapeHtml(value)}"${teacherLiveEvidenceFilters[field] === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>`).join("")}
    </div><div class="platform-teacher-evidence-layout"><ul class="platform-teacher-evidence-list" aria-label="Persistent fictional evidence">
      ${visible.length ? visible.map((item) => `<li><button type="button" data-action="evidence-teacher-live-open" data-evidence-id="${escapeHtml(item.id)}" aria-pressed="${item.id === teacherLiveEvidenceSelection}"><span>${escapeHtml(item.studentId)} · ${escapeHtml(displayType(item))}</span><strong>${escapeHtml(displayType(item))} evidence</strong><small>${escapeHtml(item.activity)} · ${escapeHtml(savedLabel(item))}</small></button></li>`).join("") : "<li>No evidence matches these filters.</li>"}
    </ul><section class="platform-teacher-evidence-detail" aria-label="Live fictional evidence preview">
      ${selected ? `<p class="platform-evidence-type">Live Drive pilot</p><h4>${escapeHtml(displayType(selected))} evidence</h4><p>${escapeHtml(selected.studentId)} · ${escapeHtml(selected.activity)} · ${escapeHtml(savedLabel(selected))}</p><small class="platform-live-evidence-filename">Drive file: ${escapeHtml(selected.name)}</small>${teacherLiveEvidencePreviewUrl ? `<img class="platform-live-evidence-preview" src="${teacherLiveEvidencePreviewUrl}" alt="Fictional student visual evidence preview" tabindex="-1">` : `<p>Choose this item to load its protected visual preview.</p>`}` : `<p>Select a live submission to preview it.</p>`}
    </section></div>` : ""}
  </div>`;
}

function governanceSimulationMarkup({ policyReady }) {
  const state = evidenceGovernanceSimulation.read();
  const selected = teacherLiveEvidence.find((item) => item.id === teacherLiveEvidenceSelection) || PILOT_TEACHER_EVIDENCE.find((item) => item.id === teacherEvidenceSelection) || PILOT_TEACHER_EVIDENCE[0];
  const evidenceId = selected?.id || "fictional-evidence-preview";
  const evidenceLabel = selected?.name || selected?.title || "Fictional visual evidence";
  const pending = state.status === GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN;
  const finished = [GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH, GOVERNANCE_SIMULATION_STATUS.REJECTED, GOVERNANCE_SIMULATION_STATUS.CANCELED].includes(state.status);
  const statusMessages = {
    [GOVERNANCE_SIMULATION_STATUS.EMPTY]: policyReady ? "Ready to simulate a teacher request. No Drive file will change." : "Save the governance draft before starting a simulation.",
    [GOVERNANCE_SIMULATION_STATUS.PENDING_ADMIN]: "Pending fictional administrator review. The evidence remains unchanged.",
    [GOVERNANCE_SIMULATION_STATUS.APPROVED_FOR_TRASH]: "Approved for recoverable-trash simulation. No Drive file was moved or deleted.",
    [GOVERNANCE_SIMULATION_STATUS.REJECTED]: "Request rejected. The evidence remains unchanged.",
    [GOVERNANCE_SIMULATION_STATUS.CANCELED]: "Request canceled. The evidence remains unchanged.",
  };
  return `<div data-governance-simulation>
    <p class="platform-command-label">Fictional approval workflow · no Drive changes</p>
    <h3 id="governance-simulation-title">Governance Enforcement Simulation</h3>
    <p>Practice the lowest-support approval path before production: teacher request, administrator decision, recoverable trash, and an audit history.</p>
    <p class="platform-governance-selected"><strong>Selected fictional evidence:</strong> ${escapeHtml(evidenceLabel)}</p>
    ${state.status === GOVERNANCE_SIMULATION_STATUS.EMPTY ? `<form data-form="governance-simulation-request" novalidate>
      <input type="hidden" name="evidenceId" value="${escapeHtml(evidenceId)}"><input type="hidden" name="evidenceLabel" value="${escapeHtml(evidenceLabel)}">
      <label>Reason for the request<textarea name="reason" maxlength="240" required placeholder="Example: Course ended and the approved retention period has passed"></textarea></label>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="exportOffered" value="yes" required><span>Confirm that a teacher export was offered before this request.</span></label>
      <button type="submit"${policyReady ? "" : " disabled"}>Submit Fictional Request</button>
    </form>` : ""}
    ${pending ? `<form data-form="governance-simulation-decision" novalidate>
      <label>Fictional reviewer label<input name="reviewer" maxlength="80" placeholder="Example: District administrator" required></label>
      <label>Decision note<textarea name="note" maxlength="240" required></textarea></label>
      <div class="platform-actions"><button type="submit" name="decision" value="approve">Approve Recoverable Trash</button><button type="submit" name="decision" value="reject">Reject Request</button><button type="button" data-action="governance-simulation-cancel">Cancel Request</button></div>
    </form>` : ""}
    ${finished ? `<button type="button" data-action="governance-simulation-reset">Start Another Simulation</button>` : ""}
    <p class="platform-error" data-governance-simulation-error role="alert" hidden></p>
    <p class="platform-evidence-governance-status" data-state="${pending ? "pending" : finished ? "saved" : "draft-required"}" data-governance-simulation-status role="status" aria-live="polite">${statusMessages[state.status]}</p>
    <h4>Simulation audit history</h4>
    ${state.audit.length ? `<ol class="platform-governance-audit">${state.audit.map((item) => `<li><strong>${escapeHtml(item.action.replaceAll("_", " "))}</strong><span>${escapeHtml(item.detail)}</span><small>${escapeHtml(new Date(item.at).toLocaleString())}</small></li>`).join("")}</ol>` : "<p>No simulated governance events yet.</p>"}
    <p class="platform-evidence-boundary"><strong>Production boundary:</strong> this workflow never deletes, trashes, moves, or exports a real Google Drive file.</p>
  </div>`;
}

function googleConnectionPreviewMarkup() {
  const state = googleConnectionPreview.read();
  const productionReadiness = assessGoogleOAuthReadiness();
  const consentOpen = state.status === GOOGLE_CONNECTION_PREVIEW_STATUS.CONSENT_PREVIEW;
  const connected = state.status === GOOGLE_CONNECTION_PREVIEW_STATUS.CONNECTED_PREVIEW;
  return `<div data-google-connection-preview>
    <p class="platform-command-label">Production experience preview · teacher only</p>
    <h3 id="google-connection-preview-title">Connect Teacher Google Drive</h3>
    <p>This is the intended low-support subscription flow. It demonstrates what teachers will see after production OAuth is configured.</p>
    <div class="platform-google-connection-summary">
      <p><strong>Teacher:</strong> Signs in and approves once</p>
      <p><strong>Students:</strong> No Google sign-in or Drive permission</p>
      <p><strong>Access:</strong> Only files created or selected through THINKamigBOB</p>
    </div>
    ${!consentOpen && !connected ? `<button type="button" data-action="google-connection-preview-begin">Preview Connect Google Drive</button>` : ""}
    ${consentOpen ? `<form data-form="google-connection-preview" novalidate>
      <div class="platform-google-consent-preview" role="group" aria-labelledby="google-consent-preview-title">
        <h4 id="google-consent-preview-title">Permission preview</h4>
        <p>THINKamigBOB would request permission to create and manage only its own evidence files—not view the teacher’s entire Drive.</p>
        <code>${GOOGLE_DRIVE_FILE_SCOPE}</code>
      </div>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="teacherConfirmed" value="yes"> I understand that the teacher—not students—authorizes this connection.</label>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="studentBoundaryConfirmed" value="yes"> Students will join THINKamigBOB without Google accounts or Drive permissions.</label>
      <div class="platform-actions"><button type="submit">Simulate Teacher Approval</button><button type="button" data-action="google-connection-preview-cancel">Cancel</button></div>
    </form>` : ""}
    ${connected ? `<div class="platform-google-connected-preview"><strong>Connection preview complete</strong><p>Future folder: ${escapeHtml(state.folderName)}</p><p>Narrow permission: <code>drive.file</code></p><button type="button" data-action="google-connection-preview-disconnect">Disconnect Preview</button></div>` : ""}
    <p class="platform-error" data-google-connection-preview-error role="alert" hidden></p>
    <p class="platform-evidence-drive-status" data-state="${connected ? "prepared" : "not-configured"}" role="status" aria-live="polite">${connected ? "Preview connected for this browser session. No Google account or Drive data was accessed." : consentOpen ? "Review the narrow teacher permission and student boundary." : "Not connected. Production Google OAuth credentials have not been configured."}</p>
    <details class="platform-google-oauth-readiness">
      <summary>Production connection readiness: ${productionReadiness.readyCount}/${productionReadiness.totalCount} gates complete</summary>
      <ul>${productionReadiness.gates.map((gate) => `<li data-state="${gate.ready ? "ready" : "pending"}"><span aria-hidden="true">${gate.ready ? "✓" : "○"}</span>${escapeHtml(gate.label)}</li>`).join("")}</ul>
      <p>The production service will use server endpoints for status, connection, callback, and disconnect. OAuth secrets and teacher refresh tokens must never enter browser code.</p>
      <small>Connection start: <code>${GOOGLE_OAUTH_ENDPOINTS.start}</code></small>
    </details>
    <p class="platform-evidence-boundary">Preview only. No OAuth token, Google identity, school account, or Drive file is created or stored.</p>
  </div>`;
}

function shell(content, { title, eyebrow = "Platform Foundation", subtitle = "", headingAction = "", signedIn = false, teacherContext = null } = {}) {
  document.title = `${title} | THINKamigBOB`;
  const activeTeacherRoute = currentRoute();
  return `
    <header class="platform-header">
      <a class="platform-brand" href="#${ROUTES.WELCOME}" aria-label="THINKamigBOB Platform home">
        <span class="platform-brand-mark" aria-hidden="true">BOB</span>
        <span class="platform-brand-copy">
          <strong>THINKamigBOB</strong>
          <small>STEM Learning Platform</small>
          ${teacherContext ? `<span class="platform-amig-meaning" aria-label="AMIG means Ask, Make, Improve, Grow"><b>AMIG</b><span>Ask <i aria-hidden="true">•</i> Make <i aria-hidden="true">•</i> Improve <i aria-hidden="true">•</i> Grow</span></span>` : ""}
        </span>
      </a>
      ${teacherContext ? `
        <nav class="platform-teacher-menu" aria-label="Teacher tools">
          <details class="platform-teacher-menu-category${activeTeacherRoute === ROUTES.TEACHER_DASHBOARD ? " is-active" : ""}"><summary>Today</summary><div class="platform-teacher-menu-panel"><strong class="platform-teacher-menu-heading">Teacher Command Center</strong><a href="#${ROUTES.TEACHER_DASHBOARD}">Run Today’s Class</a><a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-todays-resources">Today’s Resources</a><a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-live-lesson-dashboard">Live Lesson Dashboard</a></div></details>
          <details class="platform-teacher-menu-category${activeTeacherRoute === ROUTES.TEACHER_CLASSES ? " is-active" : ""}"><summary>Classes</summary><div class="platform-teacher-menu-panel"><strong class="platform-teacher-menu-heading">Manage Classes</strong><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-schedule">Class Schedule</a><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-sharing">Share Setup &amp; Messages</a><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-create-classroom">Create Classroom &amp; Add Students</a><a href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-setup-tools">Connections &amp; Safeguards</a></div></details>
          <details class="platform-teacher-menu-category"><summary>Evidence</summary><div class="platform-teacher-menu-panel"><a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-evidence-tools">Student Evidence</a></div></details>
          <details class="platform-teacher-menu-category"><summary>Account</summary><div class="platform-teacher-menu-panel"><button type="button" data-action="reserved-nav" data-label="Settings">Settings</button><button type="button" data-action="sign-out">Sign Out</button></div></details>
        </nav>
      ` : signedIn ? '<button class="platform-button platform-button-quiet" type="button" data-action="sign-out">Sign out</button>' : ""}
    </header>
    ${teacherContext ? `<aside class="platform-teacher-context" aria-label="Current teacher and class"><span><small>Teacher</small><strong>${escapeHtml(teacherContext.teacherName)}</strong></span><span><small>Current class</small><strong>${escapeHtml(teacherContext.className)}</strong></span><span><small>Current period</small><strong>${escapeHtml(teacherContext.periodLabel)}</strong></span></aside>` : ""}
    <main id="platform-main" class="platform-main" tabindex="-1">
      <div class="platform-page-heading">
        <p class="platform-eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        ${subtitle || headingAction ? `<div class="platform-page-heading-bottom">
          ${subtitle ? `<p class="platform-page-subtitle">${escapeHtml(subtitle)}</p>` : ""}
          ${headingAction}
        </div>` : ""}
      </div>
      ${content}
    </main>
    <footer class="platform-footer">PB-001 development preview • Production accounts and persistent identity are not yet connected.</footer>
  `;
}

function fixtureNotice(details = "") {
  return `
    <aside class="platform-dev-notice" aria-label="Development fixture notice">
      <strong>Development preview</strong>
      <p>${escapeHtml(DEVELOPMENT_FIXTURE_NOTICE)}</p>
      ${details}
    </aside>
  `;
}

function welcomeView() {
  return shell(`
    <section class="platform-hero">
      <p class="platform-lead">A clear starting point for teachers and students.</p>
      <div class="platform-entry-grid">
        <article class="platform-entry-card">
          <span class="platform-card-icon" aria-hidden="true">T</span>
          <h2>Teachers</h2>
          <p>Open the development login or review the future account-creation path.</p>
          <div class="platform-actions">
            <a class="platform-button platform-button-primary" href="#${ROUTES.PREVIEW_TEACHER}">Open Teacher Preview — No Sign-In</a>
            <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Teacher Login</a>
            <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CREATE}">Create Teacher Account</a>
          </div>
        </article>
        <article class="platform-entry-card">
          <span class="platform-card-icon" aria-hidden="true">S</span>
          <h2>Students</h2>
          <p>Enter with a class code, select your roster name, and use your private identifier.</p>
          <div class="platform-actions"><a class="platform-button platform-button-primary" href="#${ROUTES.PREVIEW_STUDENT}">Open Student Preview — No Codes</a><a class="platform-button platform-button-secondary" href="#${ROUTES.STUDENT_ENTRY}">Student Entry</a></div>
        </article>
      </div>
    </section>
  `, { title: "Welcome" });
}

function teacherLoginView() {
  const access = `<details><summary>Show development test access</summary><dl><dt>Email</dt><dd><code>${escapeHtml(DEVELOPMENT_FIXTURE_ACCESS.teacherEmail)}</code></dd><dt>Password</dt><dd><code>${escapeHtml(DEVELOPMENT_FIXTURE_ACCESS.teacherPassword)}</code></dd></dl></details>`;
  return shell(`
    <div class="platform-form-layout">
      <section class="platform-panel platform-production-entry" aria-labelledby="teacher-production-entry-title">
        <p class="platform-context-label">Production sign-in foundation</p>
        <h2 id="teacher-production-entry-title">Continue with Google</h2>
        <p>Teachers will sign in with Google. Drive access is requested separately only when a teacher chooses to connect Evidence.</p>
        <div data-production-google-signin></div>
        ${productionIdentityConfig.googleEnabled ? "" : '<button class="platform-button platform-button-primary" type="button" disabled aria-describedby="teacher-production-entry-status">Continue with Google</button>'}
        <p id="teacher-production-entry-status" class="platform-entry-status">${productionIdentityConfig.googleEnabled ? "Ready for secure Google sign-in." : "Setup required. No Google sign-in request will run in this local pilot."}</p>
      </section>
      <form class="platform-panel platform-form" data-form="teacher-login" novalidate>
        <p class="platform-context-label">Local fictional pilot</p>
        <a class="platform-button platform-button-primary platform-preview-entry-button" href="#${ROUTES.PREVIEW_TEACHER}">Open Teacher Preview — No Sign-In</a>
        <p class="platform-entry-status">Uses fictional local preview data only. No Google account or password is needed.</p>
        <hr>
        <div class="platform-field">
          <label for="teacher-email">Email</label>
          <input id="teacher-email" name="email" type="email" autocomplete="username" required>
        </div>
        <div class="platform-field">
          <label for="teacher-password">Password</label>
          <input id="teacher-password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Continue to Teacher Dashboard</button>
        <div class="platform-text-links">
          <a href="#${ROUTES.TEACHER_RECOVERY}">Forgot password?</a>
          <a href="#${ROUTES.WELCOME}">Back to Welcome</a>
        </div>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Teacher Login", eyebrow: "Teacher entry" });
}

function teacherCreateView() {
  return shell(`
    <section class="platform-panel platform-shell-message">
      <h2>Teacher account creation is reserved</h2>
      <p>Production registration requires an approved authentication service. No account will be created in PB-001.</p>
      <div class="platform-actions">
        <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Go to Teacher Login</a>
        <a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </div>
    </section>
  `, { title: "Create Teacher Account", eyebrow: "Future account service" });
}

function teacherRecoveryView() {
  return shell(`
    <section class="platform-panel platform-shell-message">
      <h2>Password recovery is reserved</h2>
      <p>Email verification and password recovery require an approved authentication service. No recovery message will be sent in PB-001.</p>
      <div class="platform-actions">
        <a class="platform-button platform-button-primary" href="#${ROUTES.TEACHER_LOGIN}">Return to Teacher Login</a>
        <a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </div>
    </section>
  `, { title: "Password Recovery", eyebrow: "Future account service" });
}

function studentEntryView() {
  const access = `<details><summary>Show development class code</summary><p><code>${escapeHtml(DEVELOPMENT_FIXTURE_ACCESS.classCode)}</code></p></details>`;
  return shell(`
    <div class="platform-form-layout">
      <form class="platform-panel platform-production-entry" data-form="production-student-entry" aria-labelledby="student-production-entry-title" novalidate>
        <p class="platform-context-label">Production classroom entry foundation</p>
        <h2 id="student-production-entry-title">Enter your classroom</h2>
        <p>Students will use a class code and their individual student code. Students will not sign in to Google.</p>
        <div class="platform-field">
          <label for="production-class-code">Class Code</label>
          <input id="production-class-code" name="classCode" type="text"${productionIdentityConfig.studentEnabled ? "" : " disabled"} autocomplete="off" autocapitalize="characters" placeholder="Provided by teacher" required>
        </div>
        <div class="platform-field">
          <label for="production-student-code">Student Code</label>
          <input id="production-student-code" name="studentCode" type="password"${productionIdentityConfig.studentEnabled ? "" : " disabled"} autocomplete="off" placeholder="Private student code" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit"${productionIdentityConfig.studentEnabled ? "" : " disabled"}>Open Student Dashboard</button>
        <p class="platform-entry-status">${productionIdentityConfig.studentEnabled ? "Ready for your teacher-provided codes." : "Student sign-in is not open yet. Continue with the fictional pilot entry beside this preview."}</p>
      </form>
      <form class="platform-panel platform-form" data-form="student-entry" novalidate>
        <p class="platform-context-label">Local fictional pilot</p>
        <button class="platform-button platform-button-primary platform-preview-entry-button" type="button" data-action="open-student-preview">Open Student Preview — No Codes</button>
        <p class="platform-entry-status">Opens the fictional Ada Rivera preview in Preview STEM Class.</p>
        <hr>
        <p>Ask your teacher for your class code.</p>
        <div class="platform-field">
          <label for="class-code">Class Code</label>
          <input id="class-code" name="classCode" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" maxlength="24" required>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Find My Class</button>
        <a class="platform-back-link" href="#${ROUTES.WELCOME}">Back to Welcome</a>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Student Entry", eyebrow: "Step 1 of 3" });
}

function classroomSetupMarkup() {
  const classroom = oneTimeClassroomCodes;
  return `<section id="teacher-create-classroom" class="platform-command-card platform-classroom-setup platform-manage-step" aria-labelledby="classroom-setup-title" data-classroom-setup data-manage-step="1">
    <div class="platform-manage-step-heading"><span aria-hidden="true">1</span><div><p class="platform-command-label">Start here</p><h3 id="classroom-setup-title">Create a Class &amp; Add Students</h3><p>Give the class a name, then type or paste one student name per line.</p></div></div>
    <form data-form="production-classroom-setup" novalidate>
      <label for="production-classroom-name">Class name</label>
      <input id="production-classroom-name" name="name" maxlength="100"${productionIdentityConfig.enabled ? "" : " disabled"} required placeholder="Example: STEM Lab — Period 2">
      <label for="production-student-labels">Student Names <small>1–40; one per line</small></label>
      <textarea id="production-student-labels" name="studentLabels" rows="7"${productionIdentityConfig.enabled ? "" : " disabled"} required placeholder="Ava&#10;Liam&#10;Mia"></textarea>
      <small class="platform-field-help">These names appear on student sign-in and each student’s home page.</small>
      <details class="platform-optional-class-tools">
        <summary><span>🎩 Optional: Make Funny NameBobs &amp; Limericks</span><small>Open only if you want playful student names.</small></summary>
        <div>
          <div class="platform-namebob-actions"><button type="button" data-action="generate-namebobs"${productionIdentityConfig.enabled ? "" : " disabled"}>Generate Funny NameBobs</button><span>The generated list stays editable.</span></div>
          <div class="platform-namebob-retry">
            <label for="production-namebob-retry">Try a different NameBob <small>Enter one student's first name</small></label>
            <div><input id="production-namebob-retry" name="retryName" maxlength="24"${productionIdentityConfig.enabled ? "" : " disabled"} placeholder="Example: Ava"><button type="button" data-action="retry-namebob"${productionIdentityConfig.enabled ? "" : " disabled"}>Retry This Name</button></div>
          </div>
          <p class="platform-namebob-help">Each label keeps the student's first name and adds a funny rhyming Bob name, such as Savannah Bobanana, Miley SmileyBob, or Mariela Bobarella. Every student in the class gets a different Bob name.</p>
          <div class="platform-namebob-retry platform-namebob-limerick">
            <label>Make funny limericks <small>Creates one for the whole class and one for every student</small></label>
            <div><button type="button" data-action="generate-class-namebob-limerick"${productionIdentityConfig.enabled ? "" : " disabled"}>Make Class + Student Limericks</button></div>
            <blockquote data-namebob-limerick-output hidden></blockquote>
          </div>
        </div>
      </details>
      <p class="platform-entry-status" data-namebob-status role="status" aria-live="polite">Paste a class list, then generate NameBobs—or enter your own labels.</p>
      <button class="platform-manage-primary-action" type="submit"${productionIdentityConfig.enabled ? "" : " disabled"}>Create Class &amp; Student Codes</button>
      <p class="platform-error" data-error role="alert" hidden></p>
      <p class="platform-entry-status" role="status" aria-live="polite">${productionIdentityConfig.enabled ? "Ready. Codes will be shown once after the class is created." : "Setup preview only. Production identity stays off on localhost and no classroom will be created."}</p>
    </form>
    ${classroom ? `<section class="platform-code-sheet" aria-labelledby="classroom-code-sheet-title">
      <p class="platform-code-warning">Print this sheet now. Student codes are shown once and are not saved in the browser.</p>
      <h4 id="classroom-code-sheet-title">${escapeHtml(classroom.name)}</h4>
      <p class="platform-class-code"><span>Class code</span><strong>${escapeHtml(classroom.classCode)}</strong></p>
      <table><thead><tr><th>Student</th><th>Private student code</th></tr></thead><tbody>${classroom.students.map((student) => `<tr><td>${escapeHtml(student.displayLabel)}</td><td><code>${escapeHtml(student.studentCode)}</code></td></tr>`).join("")}</tbody></table>
      <div class="platform-actions platform-code-sheet-actions"><button type="button" data-action="print-classroom-codes">Print Code Sheet</button><button type="button" data-action="close-classroom-codes">Close &amp; Hide Codes</button></div>
    </section>` : ""}
    <a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">← Back to Today</a>
  </section>`;
}

function studentRosterView(state) {
  const classRecord = getClassById(state.pendingClassId);
  const roster = classRecord ? getRosterForClass(classRecord.id) : [];
  const rosterButtons = roster.map((student) => `
    <button class="platform-roster-button" type="button" data-action="select-student" data-student-id="${escapeHtml(student.id)}">
      ${escapeHtml(student.displayName)}
    </button>
  `).join("");
  return shell(`
    <section class="platform-panel">
      <p class="platform-context-label">${escapeHtml(classRecord?.displayName ?? "Preview class")}</p>
      <h2>Select your name</h2>
      <p>Choose only your own roster name.</p>
      <div class="platform-roster-grid">${rosterButtons}</div>
      <a class="platform-back-link" href="#${ROUTES.STUDENT_ENTRY}">Use a different class code</a>
    </section>
  `, { title: "Roster Selection", eyebrow: "Step 2 of 3" });
}

function studentIdentifierView(state) {
  const student = getStudentById(state.pendingStudentId);
  const identifier = getDevelopmentIdentifier(state.pendingStudentId);
  const access = `<details><summary>Show this fictional student’s test identifier</summary><p><code>${escapeHtml(identifier)}</code></p></details>`;
  return shell(`
    <div class="platform-form-layout">
      <form class="platform-panel platform-form" data-form="student-identifier" novalidate>
        <p class="platform-context-label">Selected student</p>
        <h2>${escapeHtml(student?.displayName ?? "Student")}</h2>
        <div class="platform-field">
          <label for="private-identifier">Private Identifier</label>
          <input id="private-identifier" name="identifier" type="password" inputmode="numeric" autocomplete="off" maxlength="20" required aria-describedby="identifier-help">
          <small id="identifier-help">Enter the private identifier provided by your teacher.</small>
        </div>
        <p class="platform-error" data-error role="alert" hidden></p>
        <button class="platform-button platform-button-primary" type="submit">Open Student Dashboard</button>
        <a class="platform-back-link" href="#${ROUTES.STUDENT_ROSTER}">Choose a different name</a>
      </form>
      ${fixtureNotice(access)}
    </div>
  `, { title: "Private Identifier", eyebrow: "Step 3 of 3" });
}

function teacherSetupMarkup() {
  const driveSetupState = evidenceDriveSetup.read();
  const driveSetupPrepared = driveSetupState.status === DRIVE_SETUP_STATUS.PREPARED;
  const governanceState = evidenceGovernance.read();
  const governanceSaved = governanceState.status === EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED;
  const governanceOptions = (field, placeholder) => `<option value="">${placeholder}</option>${EVIDENCE_GOVERNANCE_OPTIONS[field].map((value) => `<option value="${escapeHtml(value)}"${governanceState[field] === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  return `
    <section class="platform-command-card platform-evidence-drive-setup" aria-labelledby="evidence-drive-setup-title">
      <p class="platform-command-label">Drive readiness · fictional pilot</p>
      <h3 id="evidence-drive-setup-title">Pilot Drive Connection</h3>
      <p>The fictional Apps Script pilot is connected. This form prepares a future production school connection; it does not authorize a real teacher account.</p>
      <dl class="platform-evidence-drive-destination">
        <div><dt>Pilot folder</dt><dd><a href="${PILOT_DRIVE_DESTINATION.folderUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(PILOT_DRIVE_DESTINATION.folderName)}</a></dd></div>
        <div><dt>Account</dt><dd>${escapeHtml(PILOT_DRIVE_DESTINATION.accountLabel)}</dd></div>
        <div><dt>Connection</dt><dd>Persistent fictional review validated</dd></div>
      </dl>
      <form data-form="evidence-drive-setup" novalidate>
        <label for="evidence-drive-folder-name">Teacher-owned destination folder name</label>
        <input id="evidence-drive-folder-name" name="folderName" maxlength="80" value="${escapeHtml(driveSetupState.folderName)}" required>
        <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="privacyConfirmed" value="yes"${driveSetupPrepared ? " checked" : ""}> Keep student uploads private to authorized classroom staff; students must never browse other students’ files.</label>
        <button type="submit">Prepare Future School Connection</button>
        <p class="platform-error" data-evidence-drive-error role="alert" hidden></p>
        <p class="platform-evidence-drive-status" data-evidence-drive-status data-state="${driveSetupPrepared ? "prepared" : "not-configured"}" role="status" aria-live="polite">${driveSetupPrepared ? `Future setup prepared for “${escapeHtml(driveSetupState.folderName)}.” Production administrator OAuth is still required.` : "Fictional pilot connected. Production school Google OAuth is not configured."}</p>
      </form>
      <ul class="platform-evidence-drive-gates" aria-label="Requirements before real uploads">
        <li>Teacher-authorized Apps Script pilot endpoint is deployed</li>
        <li>Active upload secret remains outside student-facing source code</li>
        <li>Server-side upload broker so student devices receive no teacher credentials</li>
        <li>Retention, deletion, audit, and recovery rules</li>
      </ul>
    </section>
    <section class="platform-command-card platform-google-connection-preview" aria-labelledby="google-connection-preview-title">
      ${googleConnectionPreviewMarkup()}
    </section>
    <section class="platform-command-card platform-evidence-governance" aria-labelledby="evidence-governance-title">
      <p class="platform-command-label">Evidence governance · policy foundation</p>
      <h3 id="evidence-governance-title">Evidence Governance Draft</h3>
      <p>Document proposed safeguards before any real account connection. This draft does not delete, move, export, or change any Drive file.</p>
      <form data-form="evidence-governance" novalidate>
        <label>Retention rule<select name="retention" required>${governanceOptions("retention", "Choose a retention rule")}</select></label>
        <label>Deletion authority<select name="deletionAuthority" required>${governanceOptions("deletionAuthority", "Choose who may approve deletion")}</select></label>
        <label>Recovery safeguard<select name="recovery" required>${governanceOptions("recovery", "Choose a recovery safeguard")}</select></label>
        <label>Export safeguard<select name="exportRule" required>${governanceOptions("exportRule", "Choose an export safeguard")}</select></label>
        <button type="submit">Save Governance Draft</button>
        <p class="platform-error" data-evidence-governance-error role="alert" hidden></p>
        <p class="platform-evidence-governance-status" data-evidence-governance-status data-state="${governanceSaved ? "saved" : "draft-required"}" role="status" aria-live="polite">${governanceSaved ? "Governance draft saved for this browser session. It is not an enforced policy." : "Draft required. School and legal approval are still required before real evidence use."}</p>
      </form>
    </section>
    <section class="platform-command-card platform-governance-simulation" aria-labelledby="governance-simulation-title">
      ${governanceSimulationMarkup({ policyReady: governanceSaved })}
    </section>`;
}

function classTimerScheduleMarkup(classId = "class-preview-1", { showBackToToday = true } = {}) {
  const schedule = classTimerSchedule.read();
  const rotationWeek = currentRotationWeek(classId);
  const library = messageLibrary.read();
  const timeZones = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"];
  const soundOptions = (selected) => TIMER_SOUND_OPTIONS.map((sound) => `<option value="${sound}"${selected === sound ? " selected" : ""}>${sound}</option>`).join("");
  return `<section id="teacher-class-schedule" class="platform-classroom-setup platform-class-timer-schedule platform-manage-step" aria-labelledby="class-timer-schedule-title" data-manage-step="2">
    <div class="platform-manage-step-heading"><span aria-hidden="true">2</span><div><p class="platform-command-label">Set it once</p><h3 id="class-timer-schedule-title">Class Schedule</h3><p>Choose when this class meets. Detailed timer options are available below.</p></div></div>
    <form data-form="class-timer-schedule" novalidate>
      <label class="platform-current-rotation-week"><strong>Current Rotation Week</strong><select name="rotationWeek" data-current-rotation-week>${CAPTAINS_LOG_PRESET_PROMPTS.map((item) => `<option value="${item.week}"${rotationWeek === item.week ? " selected" : ""}>Week ${item.week}</option>`).join("")}</select><small>Captain’s Log and student activities follow this class week automatically.</small></label>
      <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="enabled" value="yes"${schedule.enabled ? " checked" : ""}> Automatically run the timer on scheduled school days.</label>
      <fieldset><legend>Weekdays</legend>${WEEKDAYS.map((day) => `<label><input type="checkbox" name="weekdays" value="${day}"${schedule.weekdays.includes(day) ? " checked" : ""}> ${day}</label>`).join("")}</fieldset>
      <label>Class start time<input type="time" name="startTime" value="${schedule.startTime}" required></label>
      <label>Class duration in minutes<input type="number" name="durationMinutes" min="${MIN_LESSON_MINUTES}" max="${MAX_LESSON_MINUTES}" step="1" value="${schedule.durationMinutes}" required></label>
      <label>Time zone<select name="timeZone">${timeZones.map((zone) => `<option value="${zone}"${schedule.timeZone === zone ? " selected" : ""}>${zone.replaceAll("_", " ")}</option>`).join("")}</select></label>
      <details class="platform-optional-class-tools platform-schedule-options">
        <summary><span>Optional Timer &amp; Message Settings</span><small>Pomodoro stages, sounds, and scheduled messages</small></summary>
        <div>
      <div class="platform-pomodoro-choice">
        <label class="platform-evidence-drive-confirmation"><input type="checkbox" name="pomodoroEnabled" value="yes"${schedule.pomodoroEnabled ? " checked" : ""}> <strong>Use a color-coded Pomodoro class timer</strong></label>
        <p>Break the class into four visible stages: <strong>Blue</strong> for the opening, <strong>green</strong> for work time, <strong>gold</strong> for the warning, and <strong>red</strong> for wrap-up. The colors and stage names appear on the Teacher Command Center, floating timer, and Classroom Display.</p>
      </div>
      <fieldset class="platform-class-timer-phases"><legend>Pomodoro stages and start times</legend>
        ${schedule.phases.map((phase, index) => `<div data-phase-color="${phase.color}"><span>${phase.color === "purple" ? "blue" : phase.color === "yellow" ? "gold" : phase.color}</span><label>Phase name<input name="phaseName" maxlength="40" value="${escapeHtml(phase.name)}" required></label><label>Starts at minute<input type="number" name="phaseStart" data-phase-start="${phase.key}" min="0" max="${Math.max(0, schedule.durationMinutes - 1)}" step="1" value="${phase.startMinute}"${index === 0 ? " readonly" : ""} required></label></div>`).join("")}
      </fieldset>
      <button class="platform-button platform-button-secondary" type="button" data-action="timer-recommend-phases">Use Recommended Phase Times</button>
      <fieldset class="platform-timer-sound-settings"><legend>Timer sounds</legend>
        <div><label>When yellow begins<select name="yellowSound">${soundOptions(schedule.yellowSound)}</select><input type="file" name="yellowSoundFile" accept="audio/*" aria-label="Upload a custom yellow phase sound"><small>${schedule.yellowCustomAudio ? "Custom sound saved in this browser." : "Optional custom audio, 750 KB maximum."}</small></label><button type="button" data-action="timer-test-sound" data-sound-field="yellowSound">Test</button></div>
        <div><label>When red begins<select name="redSound">${soundOptions(schedule.redSound)}</select><input type="file" name="redSoundFile" accept="audio/*" aria-label="Upload a custom red phase sound"><small>${schedule.redCustomAudio ? "Custom sound saved in this browser." : "Optional custom audio, 750 KB maximum."}</small></label><button type="button" data-action="timer-test-sound" data-sound-field="redSound">Test</button></div>
        <div><label>When the timer ends<select name="endSound">${soundOptions(schedule.endSound)}</select><input type="file" name="endSoundFile" accept="audio/*" aria-label="Upload a custom timer completion sound"><small>${schedule.endCustomAudio ? "Custom sound saved in this browser." : "Optional custom audio, 750 KB maximum."}</small></label><button type="button" data-action="timer-test-sound" data-sound-field="endSound">Test</button></div>
      </fieldset>
      <fieldset id="teacher-shared-message-library" class="platform-message-schedule"><legend>Shared Message Library</legend>
        <p>Create reusable messages, then choose which message starts with this class timer on each weekday.</p>
        <section class="platform-class-message-creator" aria-labelledby="class-message-creator-title">
          <h4 id="class-message-creator-title">Create and Save a Message</h4>
          <p>Messages saved here also appear in the Today-page Saved Message Library.</p>
          <label>Message title<input type="text" maxlength="60" data-class-message-title placeholder="Example: Monday warm-up"></label>
          <label>Message text<textarea maxlength="240" data-class-message-text placeholder="Type the message students should see."></textarea></label>
          <div class="platform-class-message-formatting">
            <label>Text color<select data-class-message-color>${TEACHER_MEMO_COLORS.map((value) => `<option value="${value}">${value.replaceAll("-", " ")}</option>`).join("")}</select></label>
            <label>Text size<select data-class-message-size>${TEACHER_MEMO_SIZES.map((value) => `<option value="${value}"${value === "extra-large" ? " selected" : ""}>${value.replaceAll("-", " ")}</option>`).join("")}</select></label>
            <label>Text style<select data-class-message-style>${TEACHER_MEMO_STYLES.map((value) => `<option value="${value}"${value === "bold" ? " selected" : ""}>${value.replaceAll("-", " + ")}</option>`).join("")}</select></label>
          </div>
          <button type="button" data-action="save-class-message">Save Message to Shared Library</button>
          <p data-class-message-status role="status" aria-live="polite">${library.messages.length} shared message${library.messages.length === 1 ? "" : "s"} available.</p>
        </section>
        <details class="platform-class-message-library"><summary>View Shared Message Library (${library.messages.length})</summary><div>${library.messages.length ? library.messages.map((message) => `<article><span><strong>${escapeHtml(message.title)}</strong><small>${escapeHtml(message.text)}</small></span><button type="button" data-action="delete-saved-message" data-message-id="${message.id}">Delete</button></article>`).join("") : `<p>No saved messages yet. Create one above or on the Today page.</p>`}</div></details>
        ${WEEKDAYS.map((day) => `<label>${day}<select data-message-assignment="${day}"><option value="">No automatic message</option>${library.messages.map((message) => `<option value="${message.id}"${library.assignments[`${classId}|${day}`] === message.id ? " selected" : ""}>${escapeHtml(message.title)}</option>`).join("")}</select></label>`).join("")}
        <button type="button" data-action="save-message-assignments" data-class-id="${escapeHtml(classId)}">Save Message Schedule</button>
      </fieldset>
        </div>
      </details>
      <button type="submit">Save Class Schedule</button>
      ${showBackToToday ? `<a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">← Back to Today</a>` : ""}
      <p class="platform-error" data-class-timer-schedule-error role="alert" hidden></p>
      <p class="platform-evidence-drive-status" data-class-timer-schedule-status role="status" aria-live="polite">${schedule.enabled ? `Scheduled for ${schedule.weekdays.join(", ")} at ${schedule.startTime} for ${schedule.durationMinutes} minutes.` : "Automatic timer is off. Manual timer controls remain available."}</p>
    </form>
  </section>`;
}

function saveQuickClassTimerSchedule(form) {
  if (!form) return { ok: false };
  const data = new FormData(form);
  const existing = classTimerSchedule.read();
  const phaseNames = data.getAll("phaseName");
  const phaseStarts = data.getAll("phaseStart");
  const result = classTimerSchedule.save({
    ...existing,
    enabled: data.get("enabled") === "yes",
    weekdays: data.getAll("weekdays"),
    startTime: String(data.get("startTime") ?? existing.startTime),
    durationMinutes: Number(data.get("durationMinutes")),
    timeZone: String(data.get("timeZone") ?? existing.timeZone),
    yellowSound: String(data.get("yellowSound") ?? existing.yellowSound),
    redSound: String(data.get("redSound") ?? existing.redSound),
    endSound: String(data.get("endSound") ?? existing.endSound),
    pomodoroEnabled: data.get("pomodoroEnabled") === "yes",
    phases: existing.phases.map((phase, index) => ({ ...phase, name: String(phaseNames[index] ?? phase.name), startMinute: Number(phaseStarts[index] ?? phase.startMinute) })),
  });
  const status = form.querySelector("[data-class-timer-schedule-status]");
  const error = form.querySelector("[data-class-timer-schedule-error]");
  if (result.ok) {
    preserveCurrentClassSetup(currentTeacherClass(session.read().teacherId)?.id);
    if (status) status.textContent = `${result.schedule.pomodoroEnabled ? "Pomodoro timer" : "Standard timer"} saved automatically at ${result.schedule.durationMinutes} minutes.`;
    if (error) { error.textContent = ""; error.hidden = true; }
  } else if (error) {
    error.textContent = result.reason === "invalid-phases" ? "Choose increasing Pomodoro phase times that occur before the class ends." : "Finish this schedule setting to save it.";
    error.hidden = false;
  }
  return result;
}

function applyScheduledClassTimer(classId = "class-preview-1") {
  const occurrence = classTimerSchedule.activeOccurrence();
  if (!occurrence.active || classTimerSchedule.wasApplied(occurrence.occurrence)) return occurrence;
  const current = lessonTimer.read();
  if (current.status === LESSON_TIMER_STATES.RUNNING || current.status === LESSON_TIMER_STATES.PAUSED) {
    classTimerSchedule.markApplied(occurrence.occurrence);
    return { ...occurrence, active: false, reason: "manual-timer-active" };
  }
  const result = lessonTimer.startScheduled(occurrence.durationMinutes, occurrence.remainingSeconds);
  if (result.ok) {
    const assigned = messageLibrary.assigned(classId, occurrence.weekday);
    if (assigned) teacherMemo.save(assigned.text, assigned);
    const board = scheduledWhiteboardFor(classId, occurrence);
    if (board?.displayImage || board?.image) {
      const memo = teacherMemo.read();
      teacherMemo.save(memo.text || board.title, { ...memo, image: board.displayImage || board.image });
    }
    classTimerSchedule.markApplied(occurrence.occurrence);
  }
  return occurrence;
}

function currentScheduledLessonTimerState() {
  const schedule = classTimerSchedule.readEffective();
  let state = lessonTimer.read();
  if (state.status === LESSON_TIMER_STATES.READY && state.durationSeconds !== schedule.durationMinutes * 60) {
    lessonTimer.setDuration(schedule.durationMinutes);
    state = lessonTimer.read();
  }
  return state;
}

function timerRingStyle(scheduleState) {
  if (!scheduleState?.active || !scheduleState.phase) return "--timer-elapsed:0%;--timer-main-start:20%;--timer-warning-start:70%;--timer-red-start:80%;";
  return `--timer-elapsed:${scheduleState.elapsedPercent}%;--timer-main-start:${scheduleState.mainStartPercent}%;--timer-warning-start:${scheduleState.warningStartPercent}%;--timer-red-start:${scheduleState.redStartPercent}%;`;
}

function presentationTimerViewMode() {
  if (classTimerSchedule.readEffective().pomodoroEnabled) return "pomodoro";
  const today = new Date().toISOString().slice(0, 10);
  try {
    const stored = JSON.parse(window.localStorage.getItem(PRESENTATION_TIMER_VIEW_KEY) ?? "null");
    if (stored?.date === today && ["regular", "pomodoro"].includes(stored.mode)) return stored.mode;
  } catch {
    // Fall back to the saved class setting when temporary display preferences are unavailable.
  }
  return classTimerSchedule.readEffective().pomodoroEnabled ? "pomodoro" : "regular";
}

function setPresentationTimerViewMode(mode) {
  if (!["regular", "pomodoro"].includes(mode)) return;
  if (classTimerSchedule.readEffective().pomodoroEnabled && mode !== "pomodoro") return;
  try {
    window.localStorage.setItem(PRESENTATION_TIMER_VIEW_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), mode }));
  } catch {
    // The view still changes for this render even when browser storage is unavailable.
  }
  syncLessonTimerPresentation();
}

function presentationTimerVisualState(timerState) {
  if (presentationTimerViewMode() === "regular") return { active: false, phase: null, fiveMinuteWarning: false, elapsedPercent: 0, mainStartPercent: 20, warningStartPercent: 70, redStartPercent: 80 };
  const schedule = { ...classTimerSchedule.readEffective(), pomodoroEnabled: true };
  const phaseState = evaluateTimerPhases(schedule, Math.max(0, timerState.durationSeconds - timerState.remainingSeconds));
  return { ...phaseState, active: true, manual: true };
}

function syncPresentationTimerViewControls(documentRef = document) {
  const mode = presentationTimerViewMode();
  const visual = presentationTimerVisualState(lessonTimer.read());
  documentRef.querySelectorAll("[data-timer-view-mode]").forEach((button) => {
    const selected = button.dataset.timerViewMode === mode;
    button.setAttribute("aria-pressed", String(selected));
  });
  documentRef.querySelectorAll('[data-smartboard-tool="timer"]').forEach((tool) => {
    tool.dataset.timerView = mode;
    tool.style.setProperty("--timer-elapsed", `${visual.elapsedPercent ?? 0}%`);
    tool.style.setProperty("--timer-main-start", `${visual.mainStartPercent ?? 20}%`);
    tool.style.setProperty("--timer-warning-start", `${visual.warningStartPercent ?? 70}%`);
    tool.style.setProperty("--timer-red-start", `${visual.redStartPercent ?? 80}%`);
  });
  documentRef.querySelectorAll("[data-timer-view-status]").forEach((status) => {
    status.textContent = mode === "pomodoro" ? "Showing today’s Pomodoro wheel." : "Showing today’s solid-color timer.";
  });
}

function currentTimerVisualState(timerState, scheduledState = classTimerSchedule.activeOccurrence()) {
  if (scheduledState.active) return scheduledState;
  if (timerState.status !== LESSON_TIMER_STATES.RUNNING && timerState.status !== LESSON_TIMER_STATES.PAUSED) return scheduledState;
  const phaseState = evaluateTimerPhases(classTimerSchedule.readEffective(), timerState.durationSeconds - timerState.remainingSeconds);
  return phaseState.phase ? { ...phaseState, active: true, manual: true } : scheduledState;
}

function smartboardToolSwitcherMarkup() {
  return "";
}

function currentActivitySideTimer() {
  if (activitySideTimer.status === "running") {
    activitySideTimer.remainingSeconds = Math.max(0, Math.ceil((activitySideTimer.endsAt - Date.now()) / 1000));
    if (activitySideTimer.remainingSeconds === 0) activitySideTimer.status = "complete";
  }
  return activitySideTimer;
}

function syncActivitySideTimerPresentation() {
  const timer = currentActivitySideTimer();
  for (const documentRef of [document, classroomPresentationWindow?.document].filter(Boolean)) {
    documentRef.querySelectorAll("[data-activity-side-timer-output]").forEach((output) => { output.textContent = formatLessonTime(timer.remainingSeconds); });
    documentRef.querySelectorAll("[data-activity-side-timer-status]").forEach((status) => { status.textContent = timer.status === "complete" ? "Time is up" : timer.status === "running" ? "Activity timer running" : timer.status === "paused" ? "Activity timer paused" : "Ready for a class activity"; });
    documentRef.querySelectorAll('[data-action="activity-side-timer-start"]').forEach((button) => { button.disabled = timer.status === "running"; });
    documentRef.querySelectorAll('[data-action="activity-side-timer-pause"]').forEach((button) => { button.disabled = timer.status !== "running"; });
  }
}

function handleActivitySideTimerAction(action) {
  const name = action.dataset.action;
  if (!name?.startsWith("activity-side-timer-")) return false;
  const timer = currentActivitySideTimer();
  if (name === "activity-side-timer-set") {
    const minutes = Math.max(1, Math.min(60, Number(action.dataset.activityMinutes || action.closest("[data-smartboard-tool]")?.querySelector("[data-activity-side-timer-minutes]")?.value || 5)));
    activitySideTimer = { durationSeconds: minutes * 60, remainingSeconds: minutes * 60, status: "ready", endsAt: 0 };
  }
  if (name === "activity-side-timer-start") { activitySideTimer.status = "running"; activitySideTimer.endsAt = Date.now() + Math.max(1, timer.remainingSeconds) * 1000; }
  if (name === "activity-side-timer-pause" && timer.status === "running") { currentActivitySideTimer(); activitySideTimer.status = "paused"; activitySideTimer.endsAt = 0; }
  if (name === "activity-side-timer-reset") activitySideTimer = { ...activitySideTimer, remainingSeconds: activitySideTimer.durationSeconds, status: "ready", endsAt: 0 };
  syncActivitySideTimerPresentation();
  return true;
}

function namePickerMarkup(roster) {
  const students = roster.map((student) => `<li data-name-picker-student="${escapeHtml(student.id)}"><span>${escapeHtml(student.displayName)}</span><button type="button" data-action="name-picker-toggle-student" data-student-id="${escapeHtml(student.id)}">Remove</button></li>`).join("");
  return `<aside class="platform-smartboard-tool platform-name-picker-tool" data-smartboard-tool="names" hidden style="left: 24%; top: 8%; width: min(28rem, 82vw);"><header data-smartboard-drag-handle><strong>Name Picker</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Name Picker">×</button></header><div class="platform-name-picker-wheel-wrap"><div class="platform-name-picker-pointer" aria-hidden="true"></div><div class="platform-name-picker-wheel" data-name-picker-wheel style="--name-picker-rotation: 0deg"><output data-name-picker-result>Ready</output></div></div><p data-name-picker-count>${roster.length} students on the wheel</p><div class="platform-name-picker-actions"><button type="button" data-action="name-picker-spin">Spin the Wheel</button><button type="button" data-action="name-picker-readd-all">Re-add Everyone</button></div><label class="platform-name-picker-auto-remove"><input type="checkbox" data-name-picker-auto-remove> Remove the selected student after each spin</label><details><summary>Remove or re-add students</summary><ul class="platform-name-picker-roster">${students}</ul></details><p data-name-picker-status role="status">All students are available.</p>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Name Picker"></span></aside>`;
}

function updateNamePickerView(documentRef = document) {
  documentRef.querySelectorAll('[data-smartboard-tool="names"]').forEach((tool) => {
    const rows = [...tool.querySelectorAll("[data-name-picker-student]")];
    const available = rows.filter((row) => !namePickerRemovedStudentIds.has(row.dataset.namePickerStudent));
    rows.forEach((row) => {
      const removed = namePickerRemovedStudentIds.has(row.dataset.namePickerStudent);
      row.dataset.removed = String(removed);
      const button = row.querySelector('[data-action="name-picker-toggle-student"]');
      if (button) button.textContent = removed ? "Re-add" : "Remove";
    });
    const count = tool.querySelector("[data-name-picker-count]");
    if (count) count.textContent = `${available.length} ${available.length === 1 ? "student" : "students"} on the wheel`;
    const spin = tool.querySelector('[data-action="name-picker-spin"]');
    if (spin) spin.disabled = available.length === 0;
    const wheel = tool.querySelector("[data-name-picker-wheel]");
    if (wheel) wheel.dataset.availableCount = String(available.length);
  });
}

function syncNamePickerViews() {
  updateNamePickerView(document);
  if (classroomPresentationWindow && !classroomPresentationWindow.closed) updateNamePickerView(classroomPresentationWindow.document);
}

function handleNamePickerAction(action, documentRef = document) {
  if (!action?.dataset.action?.startsWith("name-picker-")) return false;
  const tool = action.closest('[data-smartboard-tool="names"]');
  if (!tool) return true;
  if (action.dataset.action === "name-picker-toggle-student") {
    const id = action.dataset.studentId;
    if (namePickerRemovedStudentIds.has(id)) namePickerRemovedStudentIds.delete(id);
    else namePickerRemovedStudentIds.add(id);
    tool.querySelector("[data-name-picker-status]").textContent = namePickerRemovedStudentIds.has(id) ? "Student removed from the wheel." : "Student re-added to the wheel.";
    syncNamePickerViews();
  }
  if (action.dataset.action === "name-picker-readd-all") {
    namePickerRemovedStudentIds.clear();
    tool.querySelector("[data-name-picker-status]").textContent = "Everyone has been re-added.";
    syncNamePickerViews();
  }
  if (action.dataset.action === "name-picker-spin") {
    const available = [...tool.querySelectorAll("[data-name-picker-student]")].filter((row) => !namePickerRemovedStudentIds.has(row.dataset.namePickerStudent));
    if (!available.length) return true;
    const selected = available[Math.floor(Math.random() * available.length)];
    const name = selected.querySelector("span")?.textContent || "Selected student";
    const wheel = tool.querySelector("[data-name-picker-wheel]");
    namePickerRotation += 1440 + Math.floor(Math.random() * 360);
    if (wheel) { wheel.style.setProperty("--name-picker-rotation", `${namePickerRotation}deg`); wheel.dataset.spinning = "true"; }
    action.disabled = true;
    tool.querySelector("[data-name-picker-status]").textContent = "The wheel is spinning…";
    documentRef.defaultView?.setTimeout(() => {
      if (wheel) wheel.dataset.spinning = "false";
      const output = tool.querySelector("[data-name-picker-result]");
      if (output) output.textContent = name;
      tool.querySelector("[data-name-picker-status]").textContent = `${name} was selected.`;
      if (tool.querySelector("[data-name-picker-auto-remove]")?.checked) namePickerRemovedStudentIds.add(selected.dataset.namePickerStudent);
      syncNamePickerViews();
    }, 1050);
  }
  return true;
}

function teacherDashboardView(state) {
  const teacher = getTeacherById(state.teacherId);
  const classRecord = currentTeacherClass(state.teacherId);
  const classRoster = classRecord ? getRosterForClass(classRecord.id) : [];
  ensureClassSetupProfile(classRecord?.id);
  const teacherName = teacher?.displayName ?? (productionIdentityConfig.enabled ? "Signed-in Teacher" : "Preview Teacher");
  const className = classRecord?.displayName ?? "Class not selected";
  const periodLabel = classRecord?.periodLabel ?? "Period not selected";
  const previewIgnoresScheduleClock = state.teacherId === "teacher-preview-1" && !classroomDemoModeIsEnabled();
  const scheduledTimer = previewIgnoresScheduleClock ? { active: false, reason: "teacher-preview" } : applyScheduledClassTimer(classRecord?.id);
  const effectiveTimerSchedule = classTimerSchedule.readEffective();
  const storedTimerState = lessonTimer.read();
  if (previewIgnoresScheduleClock && storedTimerState.status !== LESSON_TIMER_STATES.RUNNING && storedTimerState.status !== LESSON_TIMER_STATES.PAUSED && storedTimerState.durationSeconds !== effectiveTimerSchedule.durationMinutes * 60) lessonTimer.setDuration(effectiveTimerSchedule.durationMinutes);
  const timerState = lessonTimer.read();
  const timerVisualState = effectiveTimerSchedule.pomodoroEnabled ? presentationTimerVisualState(timerState) : currentTimerVisualState(timerState, scheduledTimer);
  const timerMinutes = Math.max(1, Math.round(timerState.durationSeconds / 60));
  const memoState = teacherMemo.read();
  const savedMessages = messageLibrary.read().messages;
  const memoText = escapeHtml(memoState.text);
  const hasMemo = Boolean(memoState.text);
  const missionState = todaysMission.read();
  const hasMission = Boolean(missionState.title);
  const missionVisual = matchAutomaticVisual({ title: missionState.title, detail: missionState.focus, type: "Mission" });
  const hasMessageContent = hasMemo || hasMission;
  const selectedDisplayMode = studentDisplayMode.read({ hasMemo: hasMessageContent });
  const showStudentTimer = selectedDisplayMode !== STUDENT_DISPLAY_MODES.MESSAGE;
  const showStudentMemo = hasMemo && selectedDisplayMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showStudentMission = hasMission && selectedDisplayMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showStudentMessage = showStudentMission || showStudentMemo;
  const studentDisplayClass = showStudentTimer && showStudentMessage
    ? "platform-student-display-combined"
    : showStudentMessage ? "platform-student-display-message-only" : "platform-student-display-timer-only";
  const builderAvailable = missionState.builder === TODAYS_MISSION_AVAILABILITY.AVAILABLE;
  const workshopAvailable = missionState.workshop === TODAYS_MISSION_AVAILABILITY.AVAILABLE;
  const readiness = classReadiness(classRecord?.id);
  const setupProfile = classSetupProfiles.profile(classRecord?.id);
  const planReady = Boolean(setupProfile?.planningWindow?.savedAt);
  const timerReady = readiness.timer !== "off";
  const selectedVoiceLevel = voiceMeter.read();
  const selectedVoiceActivity = readVoiceMeterActivity();
  const selectedVoiceSensitivity = voiceMeter.readSensitivity();
  const savedWhiteboards = readWhiteboardLibrary();
  const floatingWhiteboard = savedWhiteboards[0];
  const assignedResearch = readTeacherAssignedResearch(classRecord?.id);
  const researchLinkBank = readTeacherResearchLinkBank();
  return shell(`
    <div class="platform-command-layout platform-command-layout-no-sidebar">
      ${classroomDemoModeIsEnabled() ? `<aside class="platform-classroom-demo-banner"><div><p class="platform-command-label">Populated mock view</p><strong>Fictional classroom-use data is active</strong><span>Explore the dashboard as if this class has been using the platform.</span></div><a class="platform-button platform-button-secondary" href="#${ROUTES.PREVIEW_TEACHER}">Return to Regular Preview</a></aside>` : ""}
      <section class="platform-today-board" aria-label="Today">
        <section class="platform-teacher-overview platform-visual-zone platform-zone-today" aria-labelledby="teacher-overview-title">
          <div>
            <p class="platform-command-label">Teacher workspace</p>
            <h2 id="teacher-overview-title">Run today’s class</h2>
            <p>Plan the mission, manage the room, and review student evidence from one place.</p>
          </div>
          <div class="platform-teacher-overview-status platform-run-class-actions" aria-label="Run class actions">
            <div class="platform-lesson-readiness-items">
              <button class="platform-set-todays-plan" type="button" data-action="${planReady ? "open-current-plan-details" : "open-class-readiness"}"${planReady ? ` aria-controls="teacher-live-lesson-dashboard"` : ` data-readiness-focus="mission"`}><i aria-hidden="true">${planReady ? "✓" : "!"}</i> ${planReady ? `Review Today’s Plan${classSetupProfiles.profile(classRecord?.id)?.planningWindow?.label ? ` · ${escapeHtml(classSetupProfiles.profile(classRecord?.id).planningWindow.label)}` : ""}` : "Set Today’s Plan"}</button>
            </div>
            <button class="platform-start-classroom-display" type="button" data-action="open-classroom-presentation-window" aria-describedby="classroom-display-help">Start Classroom Display</button>
            <a class="platform-button platform-button-secondary platform-preview-student-view" href="#${ROUTES.PREVIEW_STUDENT}" target="_blank" rel="noopener">Preview Student View — No Code</a>
          </div>
          <nav class="platform-command-center-flow" aria-label="Teacher Command Center tasks">
            <a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-live-lesson-dashboard"><span>1</span><strong>Run Class</strong><small>Timer, display, and live tools</small></a>
            <a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-todays-lesson"><span>2</span><strong>Build Lesson</strong><small>Steps, activities, and resources</small></a>
            <a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-captains-log-planner"><span>3</span><strong>Plan Exit Tickets</strong><small>Captain’s Log prompts</small></a>
            <a href="#${ROUTES.TEACHER_DASHBOARD}" data-action="open-teacher-dashboard-section" data-scroll-target="teacher-evidence-tools"><span>4</span><strong>Review Work</strong><small>Student evidence and progress</small></a>
          </nav>
          <form class="platform-class-readiness-panel" data-form="class-readiness" hidden>
            <div class="platform-class-readiness-heading"><div><p class="platform-command-label">Quick class setup</p><h3>Ready ${escapeHtml(className)} for today</h3><p>Choose a plan and duration, then apply.</p></div><button type="button" data-action="close-class-readiness">Close</button></div>
            <section class="platform-quick-setup-choice" aria-labelledby="quick-setup-plan-title"><span aria-hidden="true">1</span><label id="quick-setup-plan-title">What does this class need today?<select name="mission" data-readiness-setting="mission"><option value="previous"${readiness.mission === "previous" ? " selected" : ""}>Use the current plan</option><option value="new"${readiness.mission === "new" ? " selected" : ""}>Start a new mission</option><option value="none"${readiness.mission === "none" ? " selected" : ""}>No mission today</option></select></label></section>
            <fieldset class="platform-planning-range"><legend><span aria-hidden="true">2</span> How long should this plan be used?</legend><label><input type="radio" name="planningRange" value="today" checked> Today</label><label><input type="radio" name="planningRange" value="week"> This week</label><label><input type="radio" name="planningRange" value="seven-weeks"> Seven-week unit</label><p>You can change any day later.</p></fieldset>
            <details class="platform-quick-setup-optional"><summary>Add or change learning goals <small>Optional</small></summary>${todaysGoalInputsMarkup(classRecord?.id)}</details>
            <div class="platform-quick-setup-review"><span aria-hidden="true">3</span><div><strong>Apply these choices</strong><p>${planReady ? "Your current plan is ready to reuse." : "Choose a plan to prepare the student view."} ${timerReady ? "The saved class timer is ready." : "The timer can be adjusted after setup."}</p></div><button type="button" data-action="save-class-readiness" aria-label="Apply Quick Class Setup">Apply to Class</button></div>
            <div class="platform-todays-mission-confirmation" data-readiness-no-mission-confirmation hidden role="dialog" aria-modal="true" aria-labelledby="readiness-no-mission-title"><div class="platform-todays-mission-confirmation-panel"><h4 id="readiness-no-mission-title">Remove today’s mission?</h4><p>The selected mission is <strong data-readiness-current-mission>${escapeHtml(missionState.title || "No mission selected")}</strong>. Are you sure you want no mission for this class today?</p><div class="platform-todays-mission-confirmation-actions"><button type="button" data-action="keep-readiness-mission">Keep Selected Mission</button><button type="button" data-action="confirm-readiness-no-mission">Use No Mission Today</button></div></div></div>
          </form>
          <section class="platform-message-board-quick-panel" data-message-board-quick-panel hidden>
            <div class="platform-message-board-quick-heading"><div><p class="platform-command-label">Quick class communication</p><h3>Message Board for ${escapeHtml(className)}</h3></div><button type="button" data-action="close-message-board-quick">Close Message Board</button></div>
            <div data-message-board-quick-host></div>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today’s Class Plan</button>
          </section>
          <section class="platform-message-board-quick-panel" data-class-schedule-quick-panel hidden>
            <div class="platform-message-board-quick-heading"><div><p class="platform-command-label">Quick class setup</p><h3>Schedule for ${escapeHtml(className)}</h3></div><button type="button" data-action="close-class-schedule-quick">Close Class Schedule</button></div>
            <div data-class-schedule-quick-host></div>
            <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-sharing">Choose What to Share With Other Classes</a>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today’s Class Plan</button>
          </section>
          ${currentClassPlanMarkup(classRecord?.id, state.teacherId)}
        </section>
        <div data-class-schedule-storage hidden>${classTimerScheduleMarkup(classRecord?.id, { showBackToToday: false })}</div>
        <div class="platform-today-primary-grid" id="teacher-today-tools">
          <div class="platform-workspace-heading" id="teacher-classroom-tools" hidden>
            <p class="platform-command-label">Today’s classroom</p>
            <h2>Presentation Tools</h2>
            <div class="platform-workspace-heading-action-row">
              <p>These are the controls you are most likely to use during class.</p>
              <div class="platform-workspace-heading-actions">
                <button type="button" data-action="open-message-board-quick">Quick Message Board</button>
                <button type="button" data-action="open-whiteboard">Open Whiteboard</button>
                <button type="button" data-action="open-classroom-presentation-window">Open Separate Classroom Screen</button>
              </div>
              <p data-classroom-window-status role="status"></p>
            </div>
          </div>
          ${todaysLessonTeacherMarkup(classRecord?.id, assignedResearch, researchLinkBank, className)}
          <div class="platform-todays-resources-panel" data-todays-resources-panel hidden>
            ${classResourceTeacherMarkup(classRecord?.id)}
          </div>
          ${captainsLogPlannerMarkup(classRecord?.id)}
          <section id="teacher-timer-card" class="platform-command-card platform-command-card-timer" hidden>
            <p class="platform-command-label">Class timing</p>
            <h3>Today’s Class Timer</h3>
            <p class="platform-current-timer-phase">Current phase: <strong data-timer-phase-name>${escapeHtml(timerVisualState.phase?.name ?? "Today's Engineering Time")}</strong></p>
            <p class="platform-class-timer-auto-status">${scheduledTimer.active ? "Running from today’s saved class schedule." : "Manual controls are ready; an active saved schedule will start automatically."}</p>
            <p class="platform-timer-warning" data-timer-warning role="status" aria-live="polite"${timerVisualState.fiveMinuteWarning ? "" : " hidden"}>Five minutes until cleanup or the ending activity.</p>
            <div class="platform-lesson-timer" aria-label="Lesson Timer">
              <output class="platform-timer-remaining" data-timer-remaining data-timer-phase-color="${timerVisualState.phase?.color ?? "default"}" aria-live="off">${formatLessonTime(timerState.remainingSeconds)}</output>
              <p class="platform-timer-state">Timer state: <strong data-timer-state>${escapeHtml(timerState.status)}</strong></p>
              <div class="platform-timer-controls" aria-label="Teacher Lesson Timer controls">
                <button type="button" data-action="timer-start">Start</button>
                <button type="button" data-action="timer-pause">Pause</button>
                <button type="button" data-action="timer-resume">Resume</button>
                <button type="button" data-action="timer-reset">Reset</button>
                <button type="button" data-action="timer-end">End</button>
              </div>
              <div class="platform-timer-adjustments" aria-label="Teacher Timer Adjustment controls">
                <button type="button" data-action="timer-subtract-minute">Subtract 1 minute</button>
                <button type="button" data-action="timer-add-minute">Add 1 minute</button>
              </div>
              <details class="platform-alternate-timers">
                <summary>Start a Different Timer</summary>
                <p>Open one choice below. Starting it will replace the current class countdown.</p>
                <details name="teacher-quick-timer"><summary>Instant Timer</summary><div>${[1, 3, 5, 10, 15].map((minutes) => `<button type="button" data-action="instant-timer" data-instant-minutes="${minutes}">${minutes} min</button>`).join("")}</div></details>
                <details name="teacher-quick-timer"><summary>Stopwatch</summary><output data-stopwatch-output>${formatLessonTime(stopwatchSeconds)}</output><div><button type="button" data-action="stopwatch-start">Start</button><button type="button" data-action="stopwatch-pause">Pause</button><button type="button" data-action="stopwatch-reset">Reset</button></div></details>
                <details name="teacher-quick-timer"><summary>Custom Countdown</summary><form class="platform-timer-duration" data-form="lesson-timer-duration" novalidate><label for="lesson-duration">Minutes</label><div><input id="lesson-duration" name="duration" type="number" inputmode="numeric" min="${MIN_LESSON_MINUTES}" max="${MAX_LESSON_MINUTES}" step="1" value="${timerMinutes}" data-timer-duration><button type="submit" data-timer-set>Set Countdown</button></div><p class="platform-error platform-timer-error" data-timer-error role="alert" hidden></p></form><button type="button" data-action="timer-start">Start Countdown</button></details>
              </details>
              <details class="platform-timer-display-settings">
                <summary>Display and Settings</summary>
              <div class="platform-timer-schedule-links">
                <a class="platform-button platform-button-secondary" href="#${ROUTES.TEACHER_CLASSES}" data-action="open-manage-classes-section" data-scroll-target="teacher-class-schedule">Change Schedule — Pomodoro intervals and timer sounds</a>
                <details>
                  <summary>Change for Today</summary>
                  <form data-form="timer-today-override" novalidate>
                    <label>Today’s duration<input type="number" name="durationMinutes" min="16" max="${MAX_LESSON_MINUTES}" value="${effectiveTimerSchedule.durationMinutes}" required></label>
                    ${effectiveTimerSchedule.phases.slice(1).map((phase) => `<label>${escapeHtml(phase.name)} starts at minute<input type="number" name="phaseStart" min="1" max="${effectiveTimerSchedule.durationMinutes - 1}" value="${phase.startMinute}" required></label>`).join("")}
                    <button type="submit">Apply for Today Only</button>
                    <p class="platform-error" data-timer-today-error role="alert" hidden></p>
                  </form>
                </details>
              </div>
              <div class="platform-timer-display-actions" aria-labelledby="timer-display-actions-title">
                <h4 id="timer-display-actions-title">Show students the timer</h4>
                <p>Open a compact timer window to place beside lesson materials or on a second display.</p>
                <button type="button" data-action="open-timer-popout">Open Separate Student Timer Window</button>
                <details>
                  <summary>Full-screen Presentation</summary>
                  <p class="platform-student-display-guidance">Show the timer, message, or both. Add the Voice Meter when needed. Each tool can also be opened as a movable window from the vertical tool rail.</p>
                  <div class="platform-student-display-mode-controls" role="group" aria-label="Student Display content">
                    <button type="button" data-action="select-presentation-mode" data-presentation-mode="${STUDENT_DISPLAY_MODES.COMBINED}" aria-pressed="${selectedDisplayMode === STUDENT_DISPLAY_MODES.COMBINED}">Timer + Message</button>
                    <button type="button" data-action="select-presentation-mode" data-presentation-mode="${STUDENT_DISPLAY_MODES.MESSAGE}" aria-pressed="${selectedDisplayMode === STUDENT_DISPLAY_MODES.MESSAGE}"${hasMessageContent ? "" : " disabled"}>Message only</button>
                    <button type="button" data-action="select-presentation-mode" data-presentation-mode="${STUDENT_DISPLAY_MODES.TIMER}" aria-pressed="${selectedDisplayMode === STUDENT_DISPLAY_MODES.TIMER}">Timer only</button>
                  </div>
                  <label class="platform-student-display-addon"><input type="checkbox" data-student-display-voice-meter${studentDisplayVoiceMeterIsEnabled() ? " checked" : ""}> Add the live Voice Meter to this display</label>
                  <p class="platform-student-display-addon-note">The browser will request microphone access when the display opens. Audio is analyzed live and is never recorded.</p>
                  <button class="platform-student-display-button" type="button" data-action="open-timer-display">Open Full-Screen Student Display</button>
                  <button type="button" data-action="open-voice-meter-display">Voice Meter Only — Full Screen</button>
                </details>
              </div>
              </details>
              <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today’s Class Plan</button>
            </div>
          </section>
          <section class="platform-command-card platform-command-card-voice-meter" aria-labelledby="voice-meter-title" hidden>
            <p class="platform-command-label">Classroom sound</p>
            <h3 id="voice-meter-title">Classroom Voice Meter</h3>
            <label for="voice-meter-activity">Classroom activity</label>
            <select id="voice-meter-activity" data-voice-meter-activity>
              ${VOICE_METER_ACTIVITIES.map((activity) => `<option value="${activity.key}"${selectedVoiceActivity.key === activity.key ? " selected" : ""}>${activity.icon} ${activity.label}</option>`).join("")}
            </select>
            <p class="platform-voice-meter-guidance">Teacher-led mode estimates one sustained dominant voice. It cannot identify the teacher or save anyone’s voice.</p>
            <label for="voice-meter-target">Expected voice level</label>
            <select id="voice-meter-target" data-voice-meter-target>
              ${VOICE_METER_LEVELS.map((level) => `<option value="${level.key}"${selectedVoiceLevel.key === level.key ? " selected" : ""}>${level.icon} ${level.label}</option>`).join("")}
            </select>
            <label class="platform-voice-sensitivity" for="voice-meter-sensitivity">Microphone sensitivity <output data-voice-sensitivity-value>${selectedVoiceSensitivity}%</output><input id="voice-meter-sensitivity" type="range" min="50" max="150" step="5" value="${selectedVoiceSensitivity}" data-voice-sensitivity><span><small>Less reactive</small><small>More reactive</small></span></label>
            <div class="platform-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%">
              <div class="platform-voice-meter-scale" aria-hidden="true"><span>Ready</span><span>Close</span><span>Too loud</span></div>
              <div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span></div>
              <p><strong data-voice-meter-output>0</strong><span aria-hidden="true"> / 100</span></p>
            </div>
            <div class="platform-voice-meter-actions">
              <button type="button" data-action="voice-meter-start">Start Voice Meter</button>
              <button type="button" data-action="voice-meter-stop" disabled>Stop Voice Meter</button>
              <button type="button" data-action="open-voice-meter-display">Open Large Class Voice Meter</button>
            </div>
            <p data-voice-meter-status role="status">Choose the expected level, then start the meter.</p>
            <p class="platform-voice-meter-privacy">Audio is analyzed live in this browser and is never recorded or saved.</p>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today’s Class Plan</button>
          </section>
          <div data-message-board-home hidden>
          <section id="teacher-message-board" class="platform-command-card platform-command-card-memo">
            <p class="platform-command-label">Class communication</p>
            <h3>Teacher Memo</h3>
            <form class="platform-teacher-memo-form" data-form="teacher-memo" novalidate>
              <label for="teacher-memo-editor">Class-wide message or agenda</label>
              <div class="platform-teacher-memo-toolbar" role="toolbar" aria-label="Format selected memo text">
                <select data-memo-format="color" aria-label="Selected text color">${TEACHER_MEMO_COLORS.map((value) => `<option value="${value}"${memoState.color === value ? " selected" : ""}>${value.replaceAll("-", " ")}</option>`).join("")}</select>
                <select data-memo-format="size" aria-label="Selected text size">${TEACHER_MEMO_SIZES.map((value) => `<option value="${value}"${memoState.size === value ? " selected" : ""}>${value.replaceAll("-", " ")}</option>`).join("")}</select>
                <select data-memo-format="style" aria-label="Selected text style">${TEACHER_MEMO_STYLES.map((value) => `<option value="${value}"${memoState.style === value ? " selected" : ""}>${value.replaceAll("-", " + ")}</option>`).join("")}</select>
                <button type="button" data-action="apply-memo-format">Apply to Selected Text</button>
              </div>
              <div id="teacher-memo-editor" class="platform-teacher-memo-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-describedby="teacher-memo-guidance teacher-memo-count" data-teacher-memo-editor>${memoSegmentsMarkup(memoState)}</div>
              <textarea name="memo" data-teacher-memo hidden>${memoText}</textarea>
              <div class="platform-teacher-memo-meta">
                <small id="teacher-memo-guidance">Plain text for the whole class.</small>
                <small id="teacher-memo-count"><span data-teacher-memo-count>${memoState.text.length}</span>/${TEACHER_MEMO_MAX_CHARACTERS}</small>
              </div>
              <label>Optional image<input type="file" accept="image/*" data-memo-image-file></label>
              <input type="hidden" name="memoImage" value="${escapeHtml(memoState.image)}">
              <div class="platform-teacher-memo-actions">
                <button type="submit">Save Memo</button>
                <button type="button" data-action="clear-teacher-memo"${memoState.text ? "" : " disabled"}>Clear Memo</button>
              </div>
              <p class="platform-error platform-teacher-memo-error" data-teacher-memo-error role="alert" hidden></p>
              <p class="platform-teacher-memo-status" data-teacher-memo-status data-state="${memoState.text ? "saved" : "empty"}" role="status" aria-live="polite">${memoState.text ? "Saved for refresh and Student Display." : "No memo saved yet."}</p>
            </form>
            <div class="platform-teacher-memo-saved">
              <p class="platform-command-label">Current class message</p>
              <p data-teacher-memo-saved>${memoState.text ? memoSegmentsMarkup(memoState) : "No class message saved."}</p>
              ${memoState.image ? `<img class="platform-memo-image-preview" src="${escapeHtml(memoState.image)}" alt="Teacher-added memo visual">` : ""}
            </div>
            <div class="platform-message-library" aria-labelledby="message-library-title">
              <h4 id="message-library-title">Saved Message Library</h4>
              <label>Message title<input type="text" maxlength="60" data-message-library-title placeholder="Example: Monday warm-up"></label>
              <button type="button" data-action="save-message-to-library"${hasMemo ? "" : " disabled"}>Save Current Message for Later</button>
              <p data-message-library-status role="status" aria-live="polite">${savedMessages.length} of 20 messages saved in this browser.</p>
              <div class="platform-message-library-list">${savedMessages.length ? savedMessages.map((message) => `<article><strong>${escapeHtml(message.title)}</strong><p>${escapeHtml(message.text)}</p><div><button type="button" data-action="use-saved-message" data-message-id="${message.id}">Use Today</button><button type="button" data-action="delete-saved-message" data-message-id="${message.id}">Delete</button></div></article>`).join("") : "<p>No saved messages yet.</p>"}</div>
            </div>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today’s Class Plan</button>
          </section>
          </div>
          <section id="teacher-evidence-tools" class="platform-optional-dashboard-section platform-visual-zone platform-zone-review" data-optional-dashboard-section hidden>
          <div class="platform-workspace-heading">
            <p class="platform-command-label">Student work</p>
            <h2>Launch and review evidence</h2>
            <p>Start an evidence activity, then review protected visual submissions.</p>
            <button type="button" data-action="close-optional-dashboard-section">Close Evidence Tools</button>
            <button class="platform-return-current-plan" type="button" data-action="return-to-current-class-plan">Return to Today’s Class Plan</button>
          </div>
          <section id="teacher-evidence-launch" class="platform-command-card platform-evidence-launch-card" aria-labelledby="evidence-launch-title">
            <p class="platform-command-label">Evidence 2.0 pilot foundation</p>
            <h3 id="evidence-launch-title">Launch Evidence to Students</h3>
            <p>Publish <strong>${escapeHtml(currentEvidenceActivity())}</strong> to the local fictional pilot. The runtime key authorizes this launch but is never saved by the browser.</p>
            <label for="evidence-teacher-runtime-key">Local pilot teacher key</label>
            <input id="evidence-teacher-runtime-key" type="password" autocomplete="off" data-evidence-teacher-key placeholder="Paste the memory-only key">
            <button type="button" data-action="evidence-teacher-launch">Launch Fictional Evidence Pilot</button>
            <p data-evidence-launch-status role="status" aria-live="polite">Start the local evidence pilot service, then launch. No real student accounts are connected.</p>
            <h4>Live Evidence Inbox</h4>
    <p>Refresh to retrieve protected fictional visual evidence from the configured teacher-owned Drive folder.</p>
            ${teacherLiveEvidenceMarkup()}
          </section>
          <section class="platform-command-card platform-teacher-evidence-card" aria-labelledby="teacher-evidence-review-title">
            ${teacherEvidenceReviewMarkup()}
          </section>
          </section>
        </div>
      </section>
    </div>
    <section id="platform-student-timer-display" class="platform-student-timer-display ${studentDisplayClass}" role="dialog" aria-modal="true" aria-labelledby="${showStudentTimer ? "student-timer-title" : "student-message-title"}" tabindex="-1" hidden>
      <p class="platform-student-display-brand">THINKamigBOB</p>
      <div class="platform-student-engineering-time" data-student-engineering-time${showStudentTimer ? "" : " hidden"}>
        <h2 id="student-timer-title" data-timer-phase-name>${escapeHtml(timerVisualState.phase?.name ?? "Today's Engineering Time")}</h2>
        <div class="platform-student-round-timer" data-timer-ring data-active-phases="${timerVisualState.phase ? "true" : "false"}" style="${timerRingStyle(timerVisualState)}">
          <output data-timer-remaining data-timer-phase-color="${timerVisualState.phase?.color ?? "default"}">${formatLessonTime(timerState.remainingSeconds)}</output>
        </div>
        <p class="platform-timer-warning" data-timer-warning role="status" aria-live="polite"${timerVisualState.fiveMinuteWarning ? "" : " hidden"}>Five minutes until cleanup or the ending activity.</p>
      </div>
      <aside class="platform-student-voice-meter" data-student-voice-meter data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%" aria-label="Classroom voice level" hidden>
        <p>${selectedVoiceLevel.icon} ${escapeHtml(selectedVoiceLevel.label)}</p>
        <div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span></div>
        <output data-voice-meter-output>0</output>
      </aside>
      <div class="platform-student-display-image-slot" data-student-image-slot hidden></div>
      <div class="platform-student-memo" data-student-memo data-memo-color="${memoState.color}" data-memo-size="${memoState.size}" data-memo-style="${memoState.style}"${showStudentMemo ? "" : " hidden"}>
        <h3 id="student-message-title">Class Message</h3>
        <p data-student-memo-text>${memoSegmentsMarkup(memoState)}</p>
        ${memoState.image ? `<img class="platform-student-memo-image" src="${escapeHtml(memoState.image)}" alt="Teacher-added class message visual">` : ""}
      </div>
      <div class="platform-student-mission" data-student-mission${showStudentMission ? "" : " hidden"}>
        <h3 id="student-mission-title">Today's Mission</h3>
        <img class="platform-automatic-mission-visual" src="${escapeHtml(missionVisual.src)}" alt="${escapeHtml(missionVisual.alt)}">
        <h4 data-student-mission-title>${escapeHtml(missionState.title)}</h4>
        <p data-student-mission-focus${missionState.focus === missionState.title ? " hidden" : ""}>${escapeHtml(missionState.focus)}</p>
        <p data-student-mission-builder>Builder: ${builderAvailable ? "Available today" : "Not part of today's mission"}</p>
        <p data-student-mission-workshop>Workshop: ${workshopAvailable ? "Available today" : "Not part of today's mission"}</p>
        <p class="platform-missions-first-reminder">${MISSIONS_FIRST_REMINDER}</p>
      </div>
      <aside class="platform-smartboard-tool platform-amig-anchor-chart" data-smartboard-tool="amig" hidden style="left: 8%; top: 7%; width: min(58rem, 80vw);">
        <header data-smartboard-drag-handle><strong>AMIG — How We Learn in STEM</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close AMIG Anchor Chart">×</button></header>
        <div class="platform-amig-anchor-intro"><b>AMIG</b><span>Ask <i aria-hidden="true">•</i> Make <i aria-hidden="true">•</i> Improve <i aria-hidden="true">•</i> Grow</span></div>
        <div class="platform-amig-cycle" aria-label="AMIG learning cycle moves clockwise from Ask to Make to Improve to Grow">
          <span class="platform-amig-cycle-ring" aria-hidden="true"></span>
          <p class="platform-amig-cycle-center"><strong>STEM</strong><span>Learning Cycle</span></p>
          <ol class="platform-amig-anchor-steps">
            <li data-amig-step="ask"><b>A</b><div><h3>Ask</h3><p>Notice and wonder.</p></div></li>
            <li data-amig-step="make"><b>M</b><div><h3>Make</h3><p>Build and try.</p></div></li>
            <li data-amig-step="improve"><b>I</b><div><h3>Improve</h3><p>Test and make it better.</p></div></li>
            <li data-amig-step="grow"><b>G</b><div><h3>Grow</h3><p>Share and try again.</p></div></li>
          </ol>
        </div>
        <p class="platform-amig-anchor-reminder">Every try helps your ideas grow.</p>
        ${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize AMIG Anchor Chart"></span>
      </aside>
      <aside class="platform-smartboard-tool" data-smartboard-tool="timer" data-timer-view="${presentationTimerViewMode()}" hidden style="left: 3%; top: 12%;"><header data-smartboard-drag-handle><strong>Timer</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Timer tool">×</button></header><div class="platform-timer-view-choice" role="group" aria-label="Timer face for today"><button type="button" data-action="timer-view-mode" data-timer-view-mode="regular" aria-pressed="${presentationTimerViewMode() === "regular"}">Solid Color</button><button type="button" data-action="timer-view-mode" data-timer-view-mode="pomodoro" aria-pressed="${presentationTimerViewMode() === "pomodoro"}">Pomodoro Wheel</button></div><small data-timer-view-status>${presentationTimerViewMode() === "pomodoro" ? "Showing today’s Pomodoro wheel." : "Showing today’s solid-color timer."}</small><div class="platform-floating-timer-face"><output class="platform-smartboard-timer" data-timer-remaining>${formatLessonTime(timerState.remainingSeconds)}</output></div><div class="platform-floating-timer-controls"><button type="button" data-action="timer-subtract-minute">− 1 min</button><button type="button" data-action="timer-add-minute">+ 1 min</button><button type="button" data-action="timer-pause">Pause</button><button type="button" data-action="timer-end">Stop</button><button type="button" data-action="timer-start-or-resume">Start</button><button type="button" data-action="timer-reset">Reset</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Timer window"></span></aside>
      <aside class="platform-smartboard-tool platform-activity-side-timer" data-smartboard-tool="activity-timer" hidden style="right: 4%; top: 14%;"><header data-smartboard-drag-handle><strong>Activity Side Timer</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Activity Side Timer">×</button></header><p class="platform-activity-side-timer-note">Independent timer — the class timer keeps running.</p><output data-activity-side-timer-output>${formatLessonTime(currentActivitySideTimer().remainingSeconds)}</output><p data-activity-side-timer-status>Ready for a class activity</p><div class="platform-activity-side-timer-presets"><button type="button" data-action="activity-side-timer-set" data-activity-minutes="1">1 min</button><button type="button" data-action="activity-side-timer-set" data-activity-minutes="3">3 min</button><button type="button" data-action="activity-side-timer-set" data-activity-minutes="5">5 min</button><button type="button" data-action="activity-side-timer-set" data-activity-minutes="10">10 min</button></div><label>Custom minutes<input type="number" min="1" max="60" value="5" data-activity-side-timer-minutes></label><button type="button" data-action="activity-side-timer-set">Set Custom Time</button><div class="platform-activity-side-timer-controls"><button type="button" data-action="activity-side-timer-start">Start</button><button type="button" data-action="activity-side-timer-pause" disabled>Pause</button><button type="button" data-action="activity-side-timer-reset">Reset</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Activity Side Timer"></span></aside>
      <aside class="platform-smartboard-tool" data-smartboard-tool="message" hidden style="right: 3%; top: 12%;"><header data-smartboard-drag-handle><strong>Quick Message</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Message tool">×</button></header><div class="platform-smartboard-message" data-student-memo-text>${memoState.text ? memoSegmentsMarkup(memoState) : "No message is ready yet."}</div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Message window"></span></aside>
      <aside class="platform-smartboard-tool" data-smartboard-tool="stopwatch" hidden style="left: 35%; top: 18%;"><header data-smartboard-drag-handle><strong>Stopwatch</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Stopwatch tool">×</button></header><output class="platform-smartboard-timer" data-stopwatch-output>${formatLessonTime(stopwatchSeconds)}</output><div><button type="button" data-action="stopwatch-start">Start</button><button type="button" data-action="stopwatch-pause">Pause</button><button type="button" data-action="stopwatch-reset">Reset</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Stopwatch window"></span></aside>
      <aside class="platform-smartboard-tool platform-smartboard-voice-tool" data-smartboard-tool="voice" hidden style="right: 16%; top: 18%;"><header data-smartboard-drag-handle><strong>Voice Meter</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Voice Meter tool">×</button></header><label class="platform-smartboard-voice-choice">Choose the voice level<select data-voice-meter-target aria-label="Expected voice level on the classroom Voice Meter">${VOICE_METER_LEVELS.map((level) => `<option value="${level.key}"${selectedVoiceLevel.key === level.key ? " selected" : ""}>${level.icon} ${level.label}</option>`).join("")}</select></label><p data-large-voice-level-label>${selectedVoiceLevel.icon} ${escapeHtml(selectedVoiceLevel.label)}</p><div class="platform-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%"><div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span></div><output data-voice-meter-output>0</output></div><div><button type="button" data-action="voice-meter-start">Start</button><button type="button" data-action="voice-meter-stop" disabled>Pause</button><button type="button" data-action="open-voice-meter-display">Full Screen</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Voice Meter window"></span></aside>
      ${namePickerMarkup(classRoster)}
      <aside class="platform-smartboard-tool platform-floating-whiteboard" data-smartboard-tool="whiteboard" hidden style="left: 8%; top: 8%; width: min(46rem, 82vw); height: min(34rem, 72vh);"><header data-smartboard-drag-handle><strong>Whiteboard</strong><button type="button" data-action="close-smartboard-tool" aria-label="Close Whiteboard window">×</button></header><div class="platform-floating-whiteboard-board">${floatingWhiteboard ? `<img src="${escapeHtml(floatingWhiteboard.displayImage || floatingWhiteboard.image)}" alt="Latest whiteboard: ${escapeHtml(floatingWhiteboard.title)}">` : `<p>Your whiteboard will appear here. Open the full board to draw.</p>`}</div><div class="platform-floating-whiteboard-functions"><button type="button" data-action="open-whiteboard">Open Full Whiteboard and Tools</button></div>${smartboardToolSwitcherMarkup()}<span class="platform-smartboard-resize-handle" data-smartboard-resize-handle aria-label="Resize Whiteboard window"></span></aside>
      <details class="platform-smartboard-tool-tray" aria-label="Smartboard presentation tools"><summary>Tools</summary><div class="platform-smartboard-tool-options"><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="amig">AMIG Chart</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="timer">Class Timer</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="activity-timer">Activity Side Timer</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="stopwatch">Stopwatch</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="message">Message</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="voice">Voice Meter</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="names">Name Picker</button><button type="button" data-action="toggle-smartboard-tool" data-smartboard-tool-name="whiteboard">Whiteboard</button><button type="button" class="platform-smartboard-reset-tools" data-action="reset-smartboard-tools">Reset Positions</button></div></details>
    </section>
    <aside class="platform-floating-voice-bob" data-voice-bob data-meter-state="green" data-corner="${classroomBobCorners()[floatingBobCornerIndex % classroomBobCorners().length]}" data-idle-set="${floatingBobIdleSet}" role="img" aria-label="Bob is calm and happy."${readClassroomBobDisplay().enabled ? "" : " hidden"}><span data-voice-bob-message>Bob is calm and happy.</span></aside>
    <section id="platform-large-voice-meter-display" class="platform-large-voice-meter-display" data-voice-display-mode="${readVoiceMeterDisplayMode()}" role="dialog" aria-modal="true" aria-labelledby="large-voice-meter-title" tabindex="-1" hidden>
      <p class="platform-student-display-brand">THINKamigBOB</p>
      <h2 id="large-voice-meter-title">Classroom Voice Meter</h2>
      <p class="platform-large-voice-target" data-large-voice-level-label>${selectedVoiceLevel.icon} ${escapeHtml(selectedVoiceLevel.label)}</p>
      <p class="platform-large-voice-prediction" data-voice-prediction>🤫 Independent work pattern</p>
      <label class="platform-large-voice-selector">Meter view<select data-voice-meter-display-mode><option value="basic"${readVoiceMeterDisplayMode() === "basic" ? " selected" : ""}>Basic volume</option><option value="prediction"${readVoiceMeterDisplayMode() === "prediction" ? " selected" : ""}>Predicted learning type + threshold</option></select></label>
      <label class="platform-large-voice-selector">Change expected voice level
        <select data-voice-meter-target aria-label="Expected voice level on large display">
          ${VOICE_METER_LEVELS.map((level) => `<option value="${level.key}"${selectedVoiceLevel.key === level.key ? " selected" : ""}>${level.icon} ${level.label}</option>`).join("")}
        </select>
      </label>
      <label class="platform-large-voice-selector platform-voice-sensitivity">Microphone sensitivity <output data-voice-sensitivity-value>${selectedVoiceSensitivity}%</output><input type="range" min="50" max="150" step="5" value="${selectedVoiceSensitivity}" data-voice-sensitivity><span><small>Less reactive</small><small>More reactive</small></span></label>
      <div class="platform-large-voice-meter" data-voice-meter data-meter-state="green" style="--voice-meter-level: 0%; --voice-threshold: ${selectedVoiceActivity.target}%">
        <div class="platform-large-voice-bob-panel"><div class="platform-large-voice-bob" data-voice-bob data-meter-state="green" role="img" aria-label="Bob is calm and happy."></div><strong data-voice-bob-message>Bob is calm and happy.</strong></div>
        <div class="platform-large-voice-reading"><div class="platform-large-voice-scale" aria-hidden="true"><span>Ready</span><span>Getting loud</span><span>Too loud</span></div><div class="platform-voice-meter-track"><span class="platform-voice-meter-fill"></span><i class="platform-voice-threshold-marker" title="Expected threshold"></i></div><output data-voice-meter-output aria-label="Current classroom voice level">0</output></div>
      </div>
      <div class="platform-large-voice-controls" aria-label="Large Voice Meter controls">
        <button type="button" data-action="voice-meter-start">Start Voice Meter</button>
        <button type="button" data-action="voice-meter-stop" data-meter-stop-message="Voice Meter paused. Press Start Voice Meter to resume." disabled>Pause Voice Meter</button>
        <button type="button" data-action="close-voice-meter-display">Close Class Voice Meter</button>
      </div>
    </section>
    <section id="platform-classroom-whiteboard" class="platform-classroom-whiteboard" data-page-dock="left" role="dialog" aria-modal="true" aria-labelledby="classroom-whiteboard-title" tabindex="-1" hidden>
      <header class="platform-whiteboard-header">
        <div><p class="platform-command-label">Classroom tool</p><h2 id="classroom-whiteboard-title">Whiteboard</h2></div>
        <div class="platform-whiteboard-header-actions"><label>Menu position<select data-whiteboard-controls-dock><option value="top">Top</option><option value="left">Left side</option><option value="right">Right side</option><option value="bottom">Bottom</option></select></label><button type="button" data-action="whiteboard-toggle-controls" aria-expanded="true">Hide Board Menus</button><button type="button" data-action="whiteboard-present" title="Show full-screen on this teacher device">Present Board</button><button type="button" data-action="whiteboard-show-students" title="Send the current board to the separate classroom display">Show on Student Display</button><button type="button" data-action="close-whiteboard">Close Whiteboard</button></div>
      </header>
      <button class="platform-whiteboard-exit-presentation" type="button" data-action="whiteboard-exit-presentation" hidden>Exit Presentation</button>
      <label class="platform-whiteboard-page-dock-control">Pages<select data-whiteboard-page-dock aria-label="Page thumbnails position"><option value="left">Show left</option><option value="right">Show right</option><option value="hidden">Hide</option></select></label>
      <nav class="platform-whiteboard-quick-actions" aria-label="Whiteboard quick actions">
        <details class="platform-whiteboard-quick-menu" data-whiteboard-primary-tool="select"><summary><span aria-hidden="true">➤</span><small>Select</small></summary><div data-whiteboard-select-panel>
          <button type="button" data-action="whiteboard-tool-select" data-whiteboard-quick-tool="select" aria-pressed="true">Select and move</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="lasso-select">Lasso parts to keep or remove</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">↶</span><small>History</small></summary><div><button type="button" data-action="whiteboard-undo">Undo</button><button type="button" data-action="whiteboard-redo">Redo</button></div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">⌫</span><small>Erase</small></summary><div>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="eraser">Eraser</button>
          <label>Eraser thickness<input type="range" data-whiteboard-eraser-size min="12" max="140" value="40"><output data-whiteboard-eraser-size-output>40</output></label>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="erase-object">Erase object</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span class="platform-whiteboard-color-chip" data-whiteboard-color-chip style="--whiteboard-selected-color:#12384d" aria-hidden="true"></span><small>Color</small></summary><div data-whiteboard-color-panel><button type="button" data-action="whiteboard-eyedropper">◉ Eyedropper — match a screen color</button></div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">▤</span><small>Background</small></summary><div class="platform-whiteboard-background-panel"><label>Background type<select data-whiteboard-background-type><option value="white">Plain white</option><option value="solid">Solid color</option><option value="gradient">Gradient</option><option value="image">Image</option></select></label><label>First color<input type="color" data-whiteboard-background-color-1 value="#ffffff"></label><label>Second gradient color<input type="color" data-whiteboard-background-color-2 value="#d8edf5"></label><label>Background image<input type="file" data-whiteboard-background-image accept="image/*"></label><button type="button" data-action="whiteboard-apply-background">Apply Background</button></div></details>
        <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="fill" title="Fill a closed shape with the selected color"><span class="platform-whiteboard-paint-can-icon" data-whiteboard-paint-can-icon style="--whiteboard-selected-color:#12384d" aria-hidden="true"><svg viewBox="0 0 28 24"><path class="platform-whiteboard-paint-can-body" d="M5 8h15l-2 12H7L5 8Z"/><path d="M4 7h17M7 8c0-7 11-7 11 0M20 12l4 4 2-2-4-4"/></svg></span><small>Paint Can</small></button>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-primary-tool="pen"><summary><span aria-hidden="true">✎</span><small>Pen</small></summary><div data-whiteboard-pen-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pen">Pen</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="calligraphy">Calligraphy pen</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="brush">Brush strokes</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="highlighter">Highlighter</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">╱</span><small>Line</small></summary><div data-whiteboard-line-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="line">Line</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="arrow">Arrow</button>
          <label>Line thickness<input type="range" data-whiteboard-line-size min="2" max="32" value="6"><output data-whiteboard-line-size-output>6</output></label>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">□○△</span><small>Shapes</small></summary><div data-whiteboard-shapes-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="rectangle">Rectangle</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="ellipse">Circle or oval</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="triangle">Triangle</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="diamond">Diamond</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pentagon">Pentagon</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="hexagon">Hexagon</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="star">Star</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">◇</span><small>3D Shapes</small></summary><div>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="cube">Cube</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="rectangular-prism">Rectangular prism</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="triangular-prism">Triangular prism</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="hexagonal-prism">Hexagonal prism</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="cylinder">Cylinder</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="cone">Cone</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pyramid">Pyramid</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="sphere">Sphere</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="hemisphere">Hemisphere</button>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="pull-3d">Make selected object 3D</button>
          <label>3D thickness<input type="range" data-whiteboard-3d-depth min="10" max="120" value="24"><output data-whiteboard-3d-depth-output>24</output></label>
          <fieldset class="platform-whiteboard-face-colors"><legend>3D face colors</legend><label>Front<input type="color" data-whiteboard-3d-front-color value="#287da0"></label><label>Side<input type="color" data-whiteboard-3d-side-color value="#f0a52b"></label><label>Top or back<input type="color" data-whiteboard-3d-top-color value="#55a875"></label></fieldset>
          <button type="button" data-action="whiteboard-apply-all-3d-face-colors">Apply all face colors</button>
        </div></details>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-primary-tool="text"><summary data-action="whiteboard-activate-text"><span aria-hidden="true">T</span><small>Text</small></summary><div data-whiteboard-text-panel><label>Font<select data-whiteboard-text-font><option value="Arial">Arial</option><option value="Verdana">Verdana</option><option value="Courier New">Courier</option><option value="Comic Sans MS">Comic Sans</option><option value="School Cursive">School Cursive</option></select></label><div class="platform-whiteboard-font-examples" aria-label="Font examples"><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Arial" style="font-family:Arial">Arial — Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Verdana" style="font-family:Verdana">Verdana — Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Courier New" style="font-family:'Courier New'">Courier — Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="Comic Sans MS" style="font-family:'Comic Sans MS'">Comic Sans — Aa Bb Cc</button><button type="button" data-action="whiteboard-choose-text-font" data-text-font="School Cursive" style="font-family:'School Cursive'">School Cursive — Aa Bb Cc</button></div><label>Font color<input type="color" data-whiteboard-text-color value="#12384d"></label><button type="button" data-action="whiteboard-format-text" data-text-command="bold" aria-pressed="false"><b>Bold</b> (Ctrl+B)</button><button type="button" data-action="whiteboard-format-text" data-text-command="italic" aria-pressed="false"><i>Italic</i> (Ctrl+I)</button><button type="button" data-action="whiteboard-format-text" data-text-command="underline" aria-pressed="false"><u>Underline</u> (Ctrl+U)</button></div></details>
        <details class="platform-whiteboard-quick-menu"><summary><span aria-hidden="true">☺</span><small>Emoji</small></summary><div data-whiteboard-emoji-panel></div></details>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-measure-menu><summary><span aria-hidden="true">↔</span><small>Measure</small></summary><div data-whiteboard-measure-panel>
          <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="laser-dimension">Laser measure — select 2 points</button>
        </div></details>
        <button type="button" data-action="whiteboard-keyboard-help" title="Show keyboard and Chromebook shortcuts"><span aria-hidden="true">?</span><small>Help</small></button>
        <details class="platform-whiteboard-quick-menu" data-whiteboard-more-menu><summary><span aria-hidden="true">•••</span><small>More</small></summary><div class="platform-whiteboard-more-panel" data-whiteboard-more-panel><button type="button" data-action="whiteboard-open-pixel-studio">▦ Pixel Studio</button><button type="button" data-action="whiteboard-paste-system-image">Paste copied image</button><button type="button" data-action="whiteboard-remove-selection-background" title="Remove the background from the selected image">Remove Background</button></div></details>
      </nav>
      <div class="platform-whiteboard-controls" data-whiteboard-controls>
      <div class="platform-whiteboard-library" aria-label="Saved whiteboards">
        <label class="platform-whiteboard-library-primary">Board name<input type="text" data-whiteboard-title maxlength="60" placeholder="Example: Monday warm-up"></label>
        <label class="platform-whiteboard-library-primary">Class<select data-whiteboard-class><option value="all">All classes</option>${pilotTeacherClasses.map((item) => `<option value="${escapeHtml(item.id)}"${item.id === classRecord?.id ? " selected" : ""}>${escapeHtml(item.displayName)}</option>`).join("")}</select></label>
        <label class="platform-whiteboard-library-primary">Schedule<select data-whiteboard-schedule-type><option value="none">No schedule</option><option value="weekly">Repeats weekly</option><option value="date">Specific date</option></select></label>
        <label data-whiteboard-weekday-label hidden>Day<select data-whiteboard-day>${WEEKDAYS.map((day) => `<option value="${day}">${day}</option>`).join("")}</select></label>
        <label data-whiteboard-date-label hidden>Date<input type="date" data-whiteboard-date></label>
        <label class="platform-whiteboard-display-option"><input type="checkbox" data-whiteboard-student-display> Automatically show this board on the Student Display when its schedule begins</label>
        <button type="button" data-action="whiteboard-save-named">Save Board</button>
        <label class="platform-whiteboard-saved-list">Saved boards<select data-whiteboard-saved><option value="">Choose a saved board</option>${savedWhiteboards.map((board) => `<option value="${escapeHtml(board.id)}">${escapeHtml(board.title)} · ${escapeHtml(whiteboardScheduleLabel(board))}${board.studentDisplay ? " · Student Display" : ""}</option>`).join("")}</select></label>
        <button type="button" data-action="whiteboard-load">Load</button>
        <button type="button" data-action="whiteboard-delete">Delete</button>
      </div>
      <div class="platform-whiteboard-toolbar" role="toolbar" aria-label="Whiteboard drawing tools">
        <label>Graph paper<select data-whiteboard-grid><option value="plain">Plain white</option><option value="inch">Inches</option><option value="cm">Centimeters</option><option value="mm">Millimeters</option></select></label>
        <label>Ruler<select data-whiteboard-ruler><option value="none">No ruler</option><option value="english">English ruler — inches</option><option value="metric">Metric ruler — centimeters</option></select></label>
        <button type="button" data-action="whiteboard-quick-tool" data-whiteboard-quick-tool="ruler-adjust">Adjust Ruler — Move, rotate, or extend ruler</button>
        <label>Ruler markings<select data-whiteboard-ruler-sides><option value="both">Both sides</option><option value="top">One side</option></select></label>
        <label class="platform-whiteboard-compare-unit" data-whiteboard-compare-unit><span>“This is the same as…” unit</span><select data-whiteboard-dimension-compare disabled aria-label="Choose another unit for the selected measurement"><option value="mm">Millimeters</option><option value="cm">Centimeters</option><option value="m">Meters</option><option value="in">Inches</option><option value="ft">Feet</option><option value="yd">Yards</option></select></label>
        <label>Zoom<input type="range" data-whiteboard-zoom min="50" max="300" step="25" value="100"><output data-whiteboard-zoom-output>100%</output></label>
        <select data-whiteboard-tool hidden aria-hidden="true" tabindex="-1">
          ${["select", "lasso-select", "eraser", "erase-object", "fill", "pen", "calligraphy", "brush", "highlighter", "line", "arrow", "rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "star", "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere", "pull-3d", "text", "emoji-stamp", "laser-dimension", "ruler-adjust"].map((tool) => `<option value="${tool}"${tool === "select" ? " selected" : ""}>${tool}</option>`).join("")}
        </select>
        <span class="platform-whiteboard-lasso-actions" data-whiteboard-lasso-actions hidden><strong>Selected image actions</strong><button type="button" data-action="whiteboard-download-selection">Download Selection PNG</button></span>
        <label>Color<input type="color" data-whiteboard-color value="#12384d"></label>
        <label data-whiteboard-emoji-label>Choose an emoji<select data-whiteboard-emoji aria-label="Choose an emoji stamp">${WHITEBOARD_EMOJI_STAMPS.map((group) => `<optgroup label="${escapeHtml(group.category)}">${group.emojis.map(([emoji, name]) => `<option value="${emoji}">${emoji} ${escapeHtml(name)}</option>`).join("")}</optgroup>`).join("")}</select></label>
        <label>Line size<input type="range" data-whiteboard-size min="2" max="32" value="6"><output data-whiteboard-size-output>6</output></label>
        <label>Text background<select data-whiteboard-text-background><option value="transparent">Transparent</option><option value="white">White</option><option value="black">Black</option><option value="highlight-yellow">Yellow highlighter</option><option value="highlight-green">Green highlighter</option><option value="highlight-pink">Pink highlighter</option><option value="highlight-blue">Blue highlighter</option></select></label>
        <label>Cursive writing lines<select data-whiteboard-cursive-lines><option value="none">No lines</option><option value="wide">Wide ruled</option><option value="practice">Handwriting practice — 3 lines</option></select></label>
        <label>Cursive Coach<select data-whiteboard-cursive-coach><option value="off">Off</option><option value="letter">Model strokes after typing</option></select></label>
        <label class="platform-whiteboard-touch-practice-choice"><input type="checkbox" data-whiteboard-touch-practice> Let the student write this word by touch after typing</label>
        <label>Image<input type="file" data-whiteboard-image accept="image/*"></label>
        <span class="platform-whiteboard-youtube-control"><p>Find a video on YouTube, copy its link, then paste it here.</p><label>YouTube video link<input type="url" data-whiteboard-youtube-url placeholder="Paste a youtube.com or youtu.be link"></label><button type="button" data-action="whiteboard-paste-youtube">Paste Copied Link</button><button type="button" data-action="whiteboard-add-youtube">Add Video</button></span>
        <span class="platform-whiteboard-object-actions" role="group" aria-label="Selected object actions">
          <button type="button" data-action="whiteboard-copy">Copy</button><button type="button" data-action="whiteboard-paste">Paste</button><button type="button" data-action="whiteboard-duplicate">Duplicate</button><span class="platform-whiteboard-push-help-wrap"><button type="button" data-action="whiteboard-push-2d">Push Back to 2D</button><span class="platform-whiteboard-push-help" data-whiteboard-push-help role="status" hidden>Select the 3D shape, then use this button to return it to its original 2D shape.</span></span><button type="button" data-action="whiteboard-rotate-left">Rotate left</button><button type="button" data-action="whiteboard-rotate-right">Rotate right</button>
        </span>
        <button type="button" data-action="whiteboard-undo" disabled>Undo</button>
        <button type="button" data-action="whiteboard-redo" disabled>Redo</button>
        <button type="button" data-action="whiteboard-export">Export PNG</button>
        <button type="button" data-action="whiteboard-clear">Clear</button>
      </div>
      </div>
      <aside class="platform-whiteboard-pages" data-whiteboard-pages aria-label="Whiteboard pages"><div class="platform-whiteboard-page-heading"><button type="button" data-action="whiteboard-page-previous" title="Previous page">‹</button><span data-whiteboard-page-count>1 / 1</span><button type="button" data-action="whiteboard-page-next" title="Next page">›</button></div><div data-whiteboard-page-tabs></div><button type="button" data-action="whiteboard-page-add">+ Add Page</button><button type="button" data-action="whiteboard-page-duplicate">Duplicate</button><button type="button" data-action="whiteboard-page-rename">Rename</button><span class="platform-whiteboard-page-rename" data-whiteboard-page-rename hidden><label>Page name<input type="text" data-whiteboard-page-name maxlength="40"></label><button type="button" data-action="whiteboard-page-rename-save">Save</button><button type="button" data-action="whiteboard-page-rename-cancel">Cancel</button></span><span class="platform-whiteboard-page-order"><button type="button" data-action="whiteboard-page-left" title="Move page left">← Move</button><button type="button" data-action="whiteboard-page-right" title="Move page right">Move →</button></span><button type="button" data-action="whiteboard-page-delete">Delete Page</button></aside><div class="platform-whiteboard-surface"><canvas data-whiteboard-canvas tabindex="0" aria-label="Teacher classroom whiteboard drawing surface"></canvas></div>
      <p class="platform-whiteboard-status" data-whiteboard-status role="status" aria-live="polite">Drawings are saved in this browser session.</p>
      <div class="platform-whiteboard-context-menu" data-whiteboard-context-menu role="menu" hidden><button type="button" role="menuitem" data-action="whiteboard-copy-image">Copy Image</button><button type="button" role="menuitem" data-action="whiteboard-cut-image">Cut Image</button><button type="button" role="menuitem" data-action="whiteboard-paste-image">Paste Image</button><button type="button" role="menuitem" data-action="whiteboard-close-context-menu">Cancel</button></div>
      <aside class="platform-whiteboard-keyboard-help" data-whiteboard-keyboard-help role="dialog" aria-modal="true" aria-labelledby="whiteboard-keyboard-help-title" hidden>
        <div>
          <h3 id="whiteboard-keyboard-help-title">Whiteboard keyboard help</h3>
          <p>First click an object so its blue selection box and corner handles appear. Then use one of these commands.</p>
          <p><strong>Students:</strong> use the Chromebook <kbd>Ctrl</kbd> commands. <strong>Teachers:</strong> use <kbd>Ctrl</kbd> on Chromebook or Windows, or <kbd>Command</kbd> on Mac.</p>
          <dl>
            <div><dt>Copy</dt><dd><kbd>Ctrl</kbd> + <kbd>C</kbd> on student Chromebooks, teacher Chromebooks, or Windows<br><kbd>Command</kbd> + <kbd>C</kbd> on Mac</dd></div>
            <div><dt>Paste</dt><dd><kbd>Ctrl</kbd> + <kbd>V</kbd> or <kbd>Command</kbd> + <kbd>V</kbd></dd></div>
            <div><dt>Cut</dt><dd><kbd>Ctrl</kbd> + <kbd>X</kbd> or <kbd>Command</kbd> + <kbd>X</kbd></dd></div>
            <div><dt>Duplicate</dt><dd><kbd>Ctrl</kbd> + <kbd>D</kbd> or <kbd>Command</kbd> + <kbd>D</kbd></dd></div>
            <div><dt>Delete</dt><dd><kbd>Backspace</kbd> or <kbd>Delete</kbd></dd></div>
          </dl>
          <p>The Copy, Paste, Cut, Duplicate, Delete, Undo, and Redo buttons above the board do the same jobs without a keyboard.</p>
          <button type="button" data-action="whiteboard-close-keyboard-help">Close Help</button>
        </div>
      </aside>
      <aside class="platform-whiteboard-bob-coach" data-whiteboard-bob-coach data-state="intro" aria-live="polite" hidden>
        <img src="../assets/images/characters/thinker-bob-master.png" alt="Bob">
        <div class="platform-whiteboard-bob-coach-copy" data-whiteboard-bob-intro>
          <strong>Bob asks:</strong>
          <p>Do you want to compare this measurement to other measurements in the real world?</p>
          <div><button type="button" data-action="whiteboard-bob-directions">Yes—show me how</button><button type="button" data-action="whiteboard-bob-collapse">Not right now</button></div>
        </div>
        <div class="platform-whiteboard-bob-coach-copy" data-whiteboard-bob-directions hidden>
          <strong>Compare measurements with Bob</strong>
          <ol><li>Select the red measurement line or its label.</li><li>Open the <strong class="platform-whiteboard-compare-name">“This is the same as…” unit</strong> menu above the board.</li><li>Choose millimeters, centimeters, meters, inches, feet, or yards.</li><li>The comparison beneath the measurement updates automatically.</li></ol>
          <button type="button" data-action="whiteboard-bob-collapse">Got it</button>
        </div>
        <button class="platform-whiteboard-bob-mini" type="button" data-action="whiteboard-bob-open" aria-label="Open Bob's measurement comparison directions"><img src="../assets/images/characters/thinker-bob-master.png" alt=""><span>Compare measurements</span></button>
      </aside>
      <div class="platform-whiteboard-clear-confirmation" data-whiteboard-clear-confirmation role="alertdialog" aria-modal="true" aria-labelledby="whiteboard-clear-title" hidden>
        <div><h3 id="whiteboard-clear-title">Clear the entire whiteboard?</h3><p>This removes the current browser-session board.</p><button type="button" data-action="whiteboard-keep">Keep Board</button><button type="button" data-action="whiteboard-confirm-clear">Clear Board</button></div>
      </div>
      <div class="platform-whiteboard-lasso-confirmation" data-whiteboard-lasso-confirmation role="dialog" aria-modal="true" aria-labelledby="whiteboard-lasso-title" hidden>
        <div><h3 id="whiteboard-lasso-title">What would you like to do with this cutout?</h3><p>Use the cutout as a separate image, delete it, or replace it with a surrounding color sampled by the eyedropper.</p><button type="button" data-action="whiteboard-lasso-cancel">Cancel</button><button type="button" data-action="whiteboard-lasso-delete">Delete Cutout</button><button type="button" data-action="whiteboard-lasso-fill">Replace Cutout with Matched Color</button><button type="button" data-action="whiteboard-lasso-use">Use Cutout Image</button></div>
      </div>
      <div class="platform-pixel-studio" data-pixel-studio role="dialog" aria-modal="true" aria-labelledby="pixel-studio-title" hidden>
        <div class="platform-pixel-studio-panel"><header><div><p class="platform-command-label">Whiteboard creative tool</p><h3 id="pixel-studio-title">Pixel Studio</h3><p>Draw a sprite, turn a selected image into pixels, practice color-bit coding, or animate frames.</p><p><strong>GIF from a website:</strong> copy the GIF or its image address, then press Ctrl+V or Command+V here. If the website blocks copying, download it and use Upload GIF.</p></div><button type="button" data-action="pixel-close" aria-label="Close Pixel Studio">×</button></header>
          <nav class="platform-pixel-project-actions" aria-label="Pixel project file actions"><button type="button" data-action="pixel-new-project">New Pixel Project</button><button type="button" data-action="pixel-save-project">Save Project</button><label>Open Project<input type="file" data-pixel-project-file accept="application/json,.json"></label></nav>
          <div class="platform-pixel-status" role="status" aria-live="polite"><span data-pixel-status>Pixel Studio is ready.</span><a data-pixel-gif-fallback href="#" target="_blank" rel="noopener" hidden>Open the GIF address to download it</a></div>
          <div class="platform-pixel-levels" role="group" aria-label="Pixel Studio learning level"><button type="button" data-action="pixel-level" data-pixel-level="starter"><strong>Starter</strong><span>1-bit · 8×8</span></button><button type="button" data-action="pixel-level" data-pixel-level="creator" aria-pressed="true"><strong>Creator</strong><span>4-bit · 16×16</span></button><button type="button" data-action="pixel-level" data-pixel-level="advanced"><strong>Advanced</strong><span>8-bit · 64×64</span></button><button type="button" data-action="pixel-level" data-pixel-level="full-color"><strong>Full Color</strong><span>24-bit · 64×64</span></button></div>
          <div class="platform-pixel-studio-controls"><label>Exact grid size<select data-pixel-size><option value="8">8 × 8</option><option value="16" selected>16 × 16</option><option value="24">24 × 24</option><option value="32">32 × 32</option><option value="64">64 × 64</option></select></label><label>Exact color mode<select data-pixel-bits><option value="1">1-bit · 2 colors</option><option value="2">2-bit · 4 colors</option><option value="4" selected>4-bit · 16 colors</option><option value="8">8-bit · 256 colors</option><option value="24">Full Color · millions of colors</option></select></label><label>Pixel color<input type="color" data-pixel-color value="#12384d"></label><output data-pixel-code>Color code: 0000</output><button type="button" data-action="pixel-eyedropper">Eyedropper</button><button type="button" data-action="pixel-random-palette">Random Color Palette</button><div class="platform-pixel-image-convert"><button type="button" data-action="pixel-from-image">Pixelate Selected Whiteboard Image</button><small>First close Pixel Studio, click a pasted or uploaded image on the whiteboard, then reopen Pixel Studio and choose this button.</small></div><label class="platform-pixel-gif-upload">Upload a GIF file<input type="file" data-pixel-gif accept="image/gif"></label><div class="platform-pixel-gif-address"><label>GIF web address<input type="url" data-pixel-gif-url placeholder="Paste the GIF image address here"></label><button type="button" data-action="pixel-load-gif-url">Open GIF Address</button></div><button type="button" data-action="pixel-paste-gif">Read GIF from Clipboard</button><label class="platform-pixel-advanced-import"><input type="checkbox" data-pixel-import-more> Import up to 48 GIF frames instead of the recommended 12 (may run more slowly)</label><button type="button" data-action="pixel-clear">Clear Current Frame</button></div><section class="platform-pixel-palette" aria-labelledby="pixel-palette-title"><div><h4 id="pixel-palette-title">Color-bit palette</h4><p data-pixel-palette-help>Select any color code to draw. Use its color box to change that color everywhere in the animation.</p></div><div data-pixel-palette></div></section>
          <div class="platform-pixel-photo-option"><button type="button" data-action="pixel-photo-open" aria-expanded="false">Create a Still Image from One GIF Frame</button><small>Optional—the imported GIF remains a bit-based editable animation unless you choose this.</small></div><div class="platform-pixel-photo-tools" data-pixel-photo-tools hidden><div><h4>Optional still image</h4><p>Choose one frame under Animation frames, then select how that single frame should look.</p></div><label>Image treatment<select data-pixel-photo-treatment><option value="natural">Natural</option><option value="smooth">Smooth</option><option value="vivid">Vivid</option></select></label><button type="button" data-action="pixel-photo-board">Add This Frame as an Image</button><button type="button" data-action="pixel-photo-download">Download This Frame as PNG</button></div>
          <div class="platform-pixel-studio-workspace"><canvas data-pixel-canvas width="512" height="512" aria-label="Pixel drawing grid"></canvas><aside><h4>Animation frames</h4><div data-pixel-frames></div><button type="button" data-action="pixel-add-frame">+ Add Frame</button><button type="button" data-action="pixel-duplicate-frame">Duplicate Frame</button><button type="button" data-action="pixel-move-frame-left">Move Frame Earlier</button><button type="button" data-action="pixel-move-frame-right">Move Frame Later</button><button type="button" data-action="pixel-delete-frame">Delete Frame</button><label>Frame speed<input type="range" data-pixel-speed min="100" max="1200" step="100" value="400"><output data-pixel-speed-output>0.4 sec</output></label><canvas data-pixel-preview width="192" height="192" aria-label="Animated pixel preview"></canvas></aside></div>
          <footer><p data-pixel-export-note>PNG keeps all project colors. GIF supports no more than 256 colors per frame.</p><button type="button" data-action="pixel-add-board">Add Sprite to Whiteboard</button><button type="button" data-action="pixel-download-png">Download Full-Color PNG</button><button type="button" data-action="pixel-download-gif">Download Animated GIF</button><button type="button" data-action="pixel-close">Done</button></footer>
        </div>
      </div>
      <div class="platform-whiteboard-question" data-whiteboard-dimension-question role="dialog" aria-modal="true" aria-labelledby="whiteboard-dimension-question-title" hidden>
        <div><h3 id="whiteboard-dimension-question-title">Label this CAD measurement</h3><p>The two points are ready. Add the information students need.</p><p class="platform-whiteboard-measurement-tip" data-whiteboard-measurement-tip role="status" hidden></p>
          <label>What are you measuring?<select data-whiteboard-dimension-label><option value="Length">Length</option><option value="Width">Width</option><option value="Height">Height</option><option value="Diameter">Diameter</option><option value="Radius">Radius</option><option value="Spacing">Spacing</option><option value="custom">Add my own answer</option></select></label>
          <label data-whiteboard-dimension-custom-label hidden>Your label<input type="text" data-whiteboard-dimension-custom maxlength="50" placeholder="Example: Bridge span"></label>
          <label>Measurement unit<select data-whiteboard-dimension-unit><option value="in">Inches</option><option value="cm">Centimeters</option><option value="mm">Millimeters</option></select></label>
          <div><button type="button" data-action="whiteboard-dimension-cancel">Cancel</button><button type="button" data-action="whiteboard-dimension-save">Add CAD Dimension</button></div>
        </div>
      </div>
    </section>
  `, {
    title: "Teacher Command Center",
    eyebrow: "TODAY view",
    subtitle: "Class focus, organization, and readiness at a glance.",
    signedIn: true,
    teacherContext: { teacherName, className, periodLabel },
  });
}

function teacherClassesView(state) {
  const teacher = getTeacherById(state.teacherId);
  const classRecord = currentTeacherClass(state.teacherId);
  ensureClassSetupProfile(classRecord?.id);
  const teacherName = teacher?.displayName ?? (productionIdentityConfig.enabled ? "Signed-in Teacher" : "Preview Teacher");
  const className = classRecord?.displayName ?? "Class not selected";
  const periodLabel = classRecord?.periodLabel ?? "Period not selected";
  return shell(`
    <div class="platform-command-layout platform-command-layout-no-sidebar platform-class-management-layout">
      <main class="platform-class-management" aria-labelledby="class-management-title">
        <section class="platform-teacher-overview platform-class-management-intro platform-visual-zone platform-zone-settings">
          <div>
            <p class="platform-command-label">Teacher workspace</p>
            <h2 id="class-management-title">Manage Classes</h2>
            <p>Set up one class at a time. Follow the steps below; optional tools stay out of the way until you need them.</p>
          </div>
        </section>
        <nav class="platform-manage-class-flow" aria-label="Manage classes steps">
          <a href="#teacher-create-classroom"><span>1</span><strong>Class &amp; Students</strong><small>Create a roster</small></a>
          <a href="#teacher-class-schedule"><span>2</span><strong>Schedule &amp; Reflection</strong><small>Set times and weekly logs</small></a>
          <a href="#teacher-class-sharing"><span>3</span><strong>Reuse Setup</strong><small>Copy to other classes</small></a>
          <a href="#teacher-setup-tools"><span>4</span><strong>Connections</strong><small>Optional safeguards</small></a>
        </nav>
        ${classroomSetupMarkup()}
        ${classTimerScheduleMarkup(classRecord?.id)}
        <div class="platform-manage-reflection">${weeklyReflectionTeacherMarkup(classRecord?.id)}<a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">← Back to Today</a></div>
        <div id="teacher-class-sharing" tabindex="-1">${classSetupSharingMarkup(state.teacherId, "manage")}</div>
        <details class="platform-manage-advanced" id="teacher-setup-tools">
          <summary><span><b>4</b><strong>Connections &amp; Safeguards</strong></span><small>Optional school setup for Drive and evidence policies</small></summary>
          <div class="platform-today-primary-grid platform-class-management-setup">${teacherSetupMarkup()}</div>
          <a class="platform-button platform-button-secondary platform-back-to-today" href="#${ROUTES.TEACHER_DASHBOARD}">← Back to Today</a>
        </details>
      </main>
    </div>
  `, {
    title: "Manage Classes",
    eyebrow: "Teacher workspace",
    subtitle: "Classroom setup and student access.",
    signedIn: true,
    teacherContext: { teacherName, className, periodLabel },
  });
}

function studentTwoWeekCalendarMarkup() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const pastWeekStart = new Date(thisWeekStart);
  pastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const evidence = evidenceFoundation.timeline();
  const todayWork = evidence.filter((item) => /^(?:Today|Saved just now)/i.test(item.time));
  const yesterdayWork = evidence.filter((item) => /^Yesterday/i.test(item.time));
  const sameDay = (left, right) => left.toDateString() === right.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const calendarDays = [];
  const weekMarkup = (label, start) => `<div class="platform-student-calendar-week"><h3>${label}</h3><div class="platform-student-calendar-days">${Array.from({ length: 5 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const isToday = sameDay(date, today);
    const dayWork = isToday ? todayWork : sameDay(date, yesterday) ? yesterdayWork : [];
    const activities = [...new Set(dayWork.map((item) => item.activity).filter(Boolean))];
    const hasWork = activities.length > 0;
    const symbol = isToday ? "TODAY" : hasWork ? "SAVED" : "—";
    const meaning = isToday ? (hasWork ? "Today, work saved" : "Today") : hasWork ? "Work saved" : "No saved work";
    const dateLabel = date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const activityLabel = hasWork ? activities.join(", ") : "No saved work";
    calendarDays.push(`${dateLabel}. ${hasWork ? `Main activity: ${activityLabel}` : activityLabel}.`);
    return `<button class="platform-student-calendar-day${isToday ? " is-today" : ""}" type="button" data-action="open-student-calendar-day" data-calendar-date="${escapeHtml(dateLabel)}" data-calendar-activity="${escapeHtml(activityLabel)}" data-calendar-work="${hasWork}" data-calendar-today="${isToday}" data-calendar-url="#student-todays-activities" aria-label="${escapeHtml(dateLabel)}: ${meaning}${hasWork ? `. Main activity: ${activityLabel}. Select to open activity choices.` : ""}"><strong>${escapeHtml(date.toLocaleDateString(undefined, { weekday: "short" }))}</strong><span>${date.getDate()}</span><b aria-hidden="true">${symbol}</b></button>`;
  }).join("")}</div></div>`;
  const weeks = `${weekMarkup("Past Week", pastWeekStart)}${weekMarkup("This Week", thisWeekStart)}`;
  const defaultDate = new Date(today);
  if (today.getDay() === 0 || today.getDay() === 6) { defaultDate.setTime(thisWeekStart.getTime()); defaultDate.setDate(thisWeekStart.getDate() + 4); }
  const defaultWork = sameDay(defaultDate, today) ? todayWork : sameDay(defaultDate, yesterday) ? yesterdayWork : [];
  const defaultActivity = defaultWork.map((item) => item.activity).find(Boolean) || "No saved work";
  const defaultSymbol = sameDay(defaultDate, today) ? "TODAY" : defaultWork.length ? "SAVED" : "—";
  const defaultDateLabel = defaultDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return `<section class="platform-student-calendar platform-student-zone platform-student-zone-history" aria-labelledby="student-calendar-title"><h2 id="student-calendar-title">Mission Ledger</h2><p class="platform-student-calendar-key"><span>Today</span><span>Saved</span><span>None</span></p><p class="platform-sr-only">${escapeHtml(calendarDays.join(" "))}</p><div class="platform-student-calendar-weeks">${weeks}</div><div class="platform-student-calendar-detail" data-student-calendar-detail role="status"><strong>${defaultSymbol} ${escapeHtml(defaultDateLabel)}</strong><span>${escapeHtml(defaultActivity)}</span><a href="#student-todays-activities" data-student-calendar-activity-link${defaultActivity === "No saved work" ? " hidden" : ""}>Reopen Mission</a></div></section>`;
}

function studentDashboardView(state) {
  weeklyReflections.recordStudentVisit(state.classId, state.studentId);
  const student = getStudentById(state.studentId);
  const classRecord = getClassById(state.classId);
  const classResourceState = classResourceSharing.read(state.classId);
  const activeClassResources = classResourceState.activeResources;
  const assignedResearch = readTeacherAssignedResearch(state.classId);
  const reflectionStatus = weeklyReflections.status(state.classId, state.studentId);
  const captainLogObligations = weeklyReflections.captainLogObligations(state.classId, state.studentId);
  const promptGate = captainLogObligations.due;
  const timerState = currentScheduledLessonTimerState();
  const timerVisual = presentationTimerVisualState(timerState);
  const timerPhase = timerVisual.active ? timerVisual.phase : null;
  const activityWindowStart = reflectionActivityWindowStart(new Date());
  const sharedResourceActivities = (classResourceState.history ?? [])
    .filter((entry) => Number(entry.sharedAt) >= activityWindowStart && Number(entry.sharedAt) <= Date.now())
    .map((entry) => entry.title);
  const teacherActivities = [...new Set([
    ...weeklyReflections.activities(state.classId).map((entry) => entry.title),
    ...sharedResourceActivities,
    ...activeClassResources.map((resource) => resource.title),
    todaysMission.read().title,
  ].filter(Boolean))];
  const reflectionOptions = (options) => `<option value="">Choose one</option>${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}`;
  const assignedReflection = studentReflectionMarkup(reflectionStatus, teacherActivities, reflectionOptions, state.classId);
  const finishMarkup = assignedReflection || `<section class="platform-student-finish platform-student-zone platform-student-zone-review platform-student-trail-stop platform-student-trail-stop-right" aria-labelledby="reflection-check-title"><p class="platform-student-section-label">Step 4</p><div class="platform-student-step-heading"><img src="./assets/images/student-path/captains-log-brass-badge.png" alt=""><h2 id="reflection-check-title">Captain’s Log</h2></div><p>Mission complete for today!</p></section>`;
  const rawStudentName = productionStudentDisplayLabel || student?.displayName || "Student";
  const studentName = escapeHtml(rawStudentName);
  const className = escapeHtml(classRecord?.displayName ?? "Class not selected");
  return shell(`
    <div class="platform-student-home">
      ${state.studentId === "student-preview-1" ? `<aside class="platform-student-preview-banner"><div><strong>Student Preview — No Sign-In Code</strong><p>You are viewing fictional student Ada Rivera in Preview STEM Class. Work completed here is only preview data in this browser.</p></div><a class="platform-button platform-button-secondary" href="#${ROUTES.WELCOME}">Exit Student Preview</a></aside>` : ""}
      ${studentNameplateMarkup(state.studentId, studentName, className, rawStudentName)}
      ${studentClassLimerickMarkup(state.classId)}

      <aside class="platform-student-pomodoro-status" data-student-pomodoro-status aria-live="polite">
        <span class="platform-student-pomodoro-ring" data-timer-ring data-active-phases="${timerPhase ? "true" : "false"}" style="${timerRingStyle(timerVisual)}" aria-hidden="true"><i></i></span>
        <div><strong data-student-pomodoro-phase>${escapeHtml(timerPhase?.name ?? "Today’s Engineering Time")}</strong><small>Current class phase</small></div>
        <b data-student-pomodoro-time>${formatLessonTime(timerState.remainingSeconds)}</b>
      </aside>

      <section class="platform-student-quest-map" aria-labelledby="student-quest-map-title">
        <div class="platform-student-quest-map-heading">
          <h2 id="student-quest-map-title">Mission Route</h2>
          <p>Tap each step.</p>
        </div>
        <nav class="platform-student-quest-path" aria-label="Mission steps in order">
          <a class="platform-student-quest-stop is-current" href="#current-goal-title" data-action="open-student-quest-step" data-student-quest="look" aria-current="step"><span class="platform-student-quest-number">1</span><img class="platform-student-quest-icon" src="./assets/images/student-path/mission-briefing-brass-badge.png" alt=""><strong>Mission Briefing</strong><small data-student-quest-status>You are here</small></a>
          <a class="platform-student-quest-stop${promptGate ? " is-prompt-locked" : ""}" href="${promptGate ? "#reflection-check-title" : "#student-todays-activities"}" data-action="open-student-quest-step" data-student-quest="do"${promptGate ? " data-prompt-locked=\"true\"" : ""}><span class="platform-student-quest-number">2</span><img class="platform-student-quest-icon" src="./assets/images/student-path/inventors-workshop-brass-badge.png" alt=""><strong>Inventor’s Workshop</strong><small data-student-quest-status>${promptGate ? "🔒 Finish Log First" : "Next"}</small></a>
          <a class="platform-student-quest-stop${promptGate ? " is-prompt-locked" : ""}" href="${promptGate ? "#reflection-check-title" : "#evidence-connections-title"}" data-action="open-student-quest-step" data-student-quest="show"${promptGate ? " data-prompt-locked=\"true\"" : ""}><span class="platform-student-quest-number">3</span><img class="platform-student-quest-icon" src="./assets/images/student-path/evidence-vault-brass-badge.png" alt=""><strong>Evidence Vault</strong><small data-student-quest-status>${promptGate ? "🔒 Finish Log First" : "Then"}</small></a>
          <a class="platform-student-quest-stop" href="#reflection-check-title" data-action="open-student-quest-step" data-student-quest="finish"><span class="platform-student-quest-number">4</span><img class="platform-student-quest-icon" src="./assets/images/student-path/captains-log-brass-badge.png" alt=""><strong>Captain’s Log</strong><small data-student-quest-status>Last</small></a>
        </nav>
      </section>

      <section class="platform-student-goal platform-student-zone platform-student-zone-now platform-student-trail-stop platform-student-trail-stop-left" aria-labelledby="current-goal-title">
        <p class="platform-student-section-label">Step 1</p>
        <div class="platform-student-step-heading"><img src="./assets/images/student-path/mission-briefing-brass-badge.png" alt=""><h2 id="current-goal-title">Mission Briefing</h2></div>
        <div data-pb002j-current-goal>
          <p class="platform-student-empty-state">Checking your goal…</p>
        </div>
        <div class="platform-student-captains-log-brief" data-captains-log-obligation="${promptGate ? "due" : "clear"}">
          <strong>Captain’s Log: ${reflectionStatus.remaining} prompt${reflectionStatus.remaining === 1 ? "" : "s"} left this week</strong>
          <p>${promptGate ? captainLogObligations.choiceDue ? `Choose and finish ${captainLogObligations.choiceDue} prompt${captainLogObligations.choiceDue === 1 ? "" : "s"} today.` : "A prompt from a day you attended still needs to be finished." : reflectionStatus.remaining ? "Watch the class phase. Complete a prompt during the yellow phase or final 10 minutes." : "Your Captain’s Log is complete for this week."}</p>
          ${reflectionStatus.remaining ? `<button type="button" data-action="start-due-captains-log">Start Captain’s Log</button>` : ""}
        </div>
      </section>

      <a class="platform-student-trail-arrow platform-student-trail-arrow-right" href="#student-todays-activities" aria-label="Go to step 2, Inventor’s Workshop"><span>Next: Workshop</span><b aria-hidden="true">↘</b></a>

      ${todaysLessonStudentMarkup(state.classId, state.studentId, assignedResearch, promptGate)}

      <a class="platform-student-trail-arrow platform-student-trail-arrow-left" href="#evidence-connections-title" aria-label="Go to step 3, Evidence Vault"><span>Next: Evidence Vault</span><b aria-hidden="true">↙</b></a>

      <section class="platform-student-show platform-student-zone platform-student-zone-tools platform-student-trail-stop platform-student-trail-stop-left${promptGate ? " is-captains-log-locked" : ""}" aria-labelledby="evidence-connections-title" data-evidence-foundation${promptGate ? " aria-disabled=\"true\"" : ""}>
        ${promptGate ? `<p class="platform-student-prompt-gate">🔒 Finish the Captain’s Log that is due before adding evidence.</p>` : ""}
        <p class="platform-student-section-label">Step 3</p>
        <div class="platform-student-step-heading"><img src="./assets/images/student-path/evidence-vault-brass-badge.png" alt=""><h2 id="evidence-connections-title">Evidence Vault</h2></div>
        <p>Add evidence.</p>
        ${evidenceCaptureMarkup()}
      </section>

      <a class="platform-student-trail-arrow platform-student-trail-arrow-right" href="#reflection-check-title" aria-label="Go to step 4, Captain’s Log"><span>Next: Captain’s Log</span><b aria-hidden="true">↘</b></a>

      ${finishMarkup}

      <aside class="platform-student-captains-log-reminder" data-student-captains-log-reminder data-captains-log-due="${promptGate ? "true" : "false"}" role="dialog" aria-labelledby="captains-log-reminder-title" hidden>
        <h2 id="captains-log-reminder-title">Captain’s Log time</h2>
        <p>${reflectionStatus.remaining} prompt${reflectionStatus.remaining === 1 ? " is" : "s are"} still needed this week. Start the prompt that is due.</p>
        <div><button type="button" data-action="start-due-captains-log">Start Captain’s Log</button><button type="button" data-action="dismiss-captains-log-reminder">Not yet</button></div>
      </aside>
      <aside class="platform-student-captains-log-wrap-warning" data-student-captains-log-wrap-warning role="status" hidden><strong>About 6 minutes left</strong><span>Finish your answer and Bob’s questions.</span></aside>
      <aside class="platform-student-phase-change" data-student-phase-change role="dialog" aria-live="assertive" aria-labelledby="student-phase-change-title" hidden>
        <div class="platform-student-phase-change-ring" data-timer-ring data-active-phases="${timerPhase ? "true" : "false"}" style="${timerRingStyle(timerVisual)}"><output data-timer-remaining>${formatLessonTime(timerState.remainingSeconds)}</output></div>
        <p>Class phase changed</p><h2 id="student-phase-change-title" data-student-phase-change-title>${escapeHtml(timerPhase?.name ?? "Today’s Engineering Time")}</h2>
        <button type="button" data-action="dismiss-student-phase-change">Got it</button>
      </aside>

      <details class="platform-student-later">
        <summary>Archive Room</summary>
        <p>Calendar and saved work</p>
        ${studentTwoWeekCalendarMarkup()}
      <section class="platform-stem-work platform-student-zone platform-student-zone-work" aria-labelledby="stem-work-title">
        <div class="platform-student-section-heading">
          <p class="platform-student-section-label">Saved work</p>
          <h2 id="stem-work-title">My STEM Work</h2>
          <p>Open current or past work.</p>
        </div>
        <div class="platform-stem-work-layout">
          <section class="platform-stem-work-section platform-stem-work-current" aria-labelledby="current-work-title">
            <p class="platform-stem-work-label">Continue Current Work</p>
            <h3 id="current-work-title">Current Work</h3>
            <div class="platform-project-card-container" aria-labelledby="current-work-title">
              <p class="platform-student-empty-state">You do not have current work to continue yet.</p>
              <p>When a project is ready, you can return to it here.</p>
            </div>
          </section>
          <section class="platform-stem-work-history" aria-labelledby="work-history-title">
            <div class="platform-stem-work-history-heading">
              <p class="platform-stem-work-label">Your engineering journey</p>
              <h3 id="work-history-title">Look Back at Your Work</h3>
            </div>
            <div class="platform-stem-work-history-layout">
              <section class="platform-stem-work-section platform-stem-work-recent" aria-labelledby="recent-work-title">
                <p class="platform-stem-work-label">Recently active</p>
                <h4 id="recent-work-title">Recent Work</h4>
                <div class="platform-project-card-container" aria-labelledby="recent-work-title">
                  <p class="platform-student-empty-state">Your recent engineering work will appear here when it is available.</p>
                </div>
              </section>
              <section class="platform-stem-work-section platform-stem-work-previous" aria-labelledby="previous-work-title">
                <p class="platform-stem-work-label">Earlier projects</p>
                <h4 id="previous-work-title">Previous Work</h4>
                <div class="platform-project-card-container" aria-labelledby="previous-work-title">
                  <p class="platform-student-empty-state">Your earlier engineering work will appear here when it is available.</p>
                </div>
              </section>
            </div>
          </section>
        </div>
      </section>
      </details>
    </div>
  `, { title: "Student Home", eyebrow: "Student Dashboard", signedIn: true });
}

function viewForRoute(route, state) {
  switch (route) {
    case ROUTES.TEACHER_LOGIN: return teacherLoginView();
    case ROUTES.TEACHER_CREATE: return teacherCreateView();
    case ROUTES.TEACHER_RECOVERY: return teacherRecoveryView();
    case ROUTES.TEACHER_DASHBOARD: return teacherDashboardView(state);
    case ROUTES.TEACHER_CLASSES: return teacherClassesView(state);
    case ROUTES.STUDENT_ENTRY: return studentEntryView();
    case ROUTES.STUDENT_ROSTER: return studentRosterView(state);
    case ROUTES.STUDENT_IDENTIFIER: return studentIdentifierView(state);
    case ROUTES.STUDENT_DASHBOARD: return studentDashboardView(state);
    default: return welcomeView();
  }
}

function showFormError(form, message) {
  const error = form.querySelector("[data-error]");
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
  error.focus?.();
}

function playTimerSound(sound, customAudio = "") {
  if (!sound || sound === "None") return;
  if (sound === "Bird Chirping") {
    try {
      const player = new Audio(BIRD_CHIRPING_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
  if (sound === "Cardinal") {
    try {
      const player = new Audio(CARDINAL_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
  if (sound === "Guitar Loop — Time Ending") {
    try {
      const player = new Audio(GUITAR_LOOP_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
  if (sound === "Choir — Heavenly Transition") {
    try {
      const player = new Audio(CHOIR_TRANSITION_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
  if (sound === "Drum Loop") {
    try {
      const player = new Audio(DRUM_LOOP_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
  if (sound === "Trap Loop Drums") {
    try {
      const player = new Audio(TRAP_LOOP_DRUMS_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
  if (sound === "Soft Piano") {
    try {
      const player = new Audio(SOFT_PIANO_SOUND_URL);
      player.volume = 0.75;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
  if (sound === "Custom Upload" && customAudio) {
    try {
      const player = new Audio(customAudio);
      player.volume = 0.85;
      void player.play();
    } catch { /* Visual transitions remain available without browser audio. */ }
    return;
  }
}

function openStudentTimerPopout() {
  if (studentTimerPopout && !studentTimerPopout.closed) {
    studentTimerPopout.focus();
    syncStudentTimerPopout();
    return;
  }
  studentTimerPopout = window.open("", "thinkamigbob-student-timer", "popup=yes,width=460,height=540,resizable=yes");
  if (!studentTimerPopout) return;
  studentTimerPopout.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Student Timer · THINKamigBOB</title><style>
    *{box-sizing:border-box}html{color-scheme:dark;background:#142936}body{min-height:100vh;margin:0;display:grid;place-items:center;padding:clamp(8px,2.5vmin,18px);color:#fff;background:radial-gradient(circle at 50% 40%,#1f5268 0,#142936 68%);font-family:Arial,sans-serif;text-align:center;overflow:hidden}
    main{display:grid;justify-items:center;gap:clamp(5px,2vmin,14px);width:100%}p,h1{margin:0}.brand{color:#b9dce8;font-size:clamp(.72rem,2vmin,.9rem);font-weight:800;letter-spacing:.08em}.phase{font-size:clamp(1rem,4.5vmin,2.2rem)}
    .ring{position:relative;display:grid;width:min(84vw,66vh);aspect-ratio:1;place-items:center;border-radius:50%;background:#24779a;box-shadow:0 1rem 3rem #0008}
    .ring[data-active-phases="true"]{background:conic-gradient(from -90deg,#454f55 0 var(--timer-elapsed),transparent var(--timer-elapsed) 100%),conic-gradient(from -90deg,#17698e 0 var(--timer-main-start),#2d7d5b var(--timer-main-start) var(--timer-warning-start),#d4a017 var(--timer-warning-start) var(--timer-red-start),#b94a45 var(--timer-red-start) 100%)}
    .ring:before{position:absolute;inset:12%;border:2px solid #ffffff40;border-radius:50%;background:#142936;content:""}.time{position:relative;z-index:1;color:#fff;font-size:clamp(3rem,14vmin,8rem);font-weight:800;font-variant-numeric:tabular-nums}.warning{padding:.5rem .7rem;border:2px solid #c28b12;border-radius:.55rem;background:#704500d1;font-size:clamp(.75rem,2.5vmin,1rem);font-weight:800}.warning[hidden]{display:none}.resize-hint{color:#b9dce8;font-size:clamp(.65rem,1.8vmin,.8rem);font-weight:700}
  </style></head><body><main><p class="brand">THINKamigBOB</p><h1 class="phase">Today's Engineering Time</h1><div class="ring" data-active-phases="false"><output class="time">00:00</output></div><p class="warning" hidden>Five minutes until cleanup or the ending activity.</p><p class="resize-hint">Drag any corner of this window to resize the timer.</p></main></body></html>`);
  studentTimerPopout.document.close();
  syncStudentTimerPopout();
}

function syncStudentTimerPopout() {
  if (!studentTimerPopout || studentTimerPopout.closed) return;
  const state = currentScheduledLessonTimerState();
  const scheduled = classTimerSchedule.readEffective().pomodoroEnabled ? presentationTimerVisualState(state) : currentTimerVisualState(state);
  const phase = scheduled.active ? scheduled.phase : null;
  const documentRef = studentTimerPopout.document;
  const phaseName = documentRef.querySelector(".phase");
  const time = documentRef.querySelector(".time");
  const warning = documentRef.querySelector(".warning");
  const ring = documentRef.querySelector(".ring");
  if (phaseName) phaseName.textContent = phase?.name ?? "Today's Engineering Time";
  if (time) time.textContent = formatLessonTime(state.remainingSeconds);
  if (warning) warning.hidden = !scheduled.fiveMinuteWarning;
  if (ring) {
    ring.dataset.activePhases = phase ? "true" : "false";
    ring.style.setProperty("--timer-elapsed", `${scheduled.elapsedPercent ?? 0}%`);
    ring.style.setProperty("--timer-main-start", `${scheduled.mainStartPercent ?? 20}%`);
    ring.style.setProperty("--timer-warning-start", `${scheduled.warningStartPercent ?? 70}%`);
    ring.style.setProperty("--timer-red-start", `${scheduled.redStartPercent ?? 80}%`);
  }
}

function syncClassroomPresentationWindow() {
  if (!classroomPresentationWindow || classroomPresentationWindow.closed) return;
  const documentRef = classroomPresentationWindow.document;
  const timer = currentScheduledLessonTimerState();
  const visual = presentationTimerVisualState(timer);
  documentRef.querySelectorAll("[data-timer-remaining]").forEach((output) => { output.textContent = formatLessonTime(timer.remainingSeconds); });
  documentRef.querySelectorAll("[data-timer-phase-name]").forEach((label) => { label.textContent = visual.phase?.name ?? "Today's Engineering Time"; });
  documentRef.querySelectorAll("[data-timer-state]").forEach((label) => { label.textContent = timer.status; });
  documentRef.querySelectorAll("[data-timer-ring]").forEach((ring) => {
    ring.dataset.activePhases = visual.phase ? "true" : "false";
    ring.style.setProperty("--timer-elapsed", `${visual.elapsedPercent ?? 0}%`);
    ring.style.setProperty("--timer-main-start", `${visual.mainStartPercent ?? 20}%`);
    ring.style.setProperty("--timer-warning-start", `${visual.warningStartPercent ?? 70}%`);
    ring.style.setProperty("--timer-red-start", `${visual.redStartPercent ?? 80}%`);
  });
  documentRef.querySelectorAll("[data-timer-warning]").forEach((warning) => { warning.hidden = !visual.fiveMinuteWarning; });
  documentRef.querySelectorAll("[data-student-memo-text]").forEach((element) => { element.innerHTML = teacherMemo.read().text ? memoSegmentsMarkup(teacherMemo.read()) : "No message is ready yet."; });
  const memoState = teacherMemo.read();
  const selectedMode = studentDisplayMode.read({ hasMemo: Boolean(memoState.text || todaysMission.read().title) });
  const showTimer = selectedMode !== STUDENT_DISPLAY_MODES.MESSAGE;
  const showMemo = Boolean(memoState.text) && selectedMode !== STUDENT_DISPLAY_MODES.TIMER;
  const studentDisplay = documentRef.querySelector("#platform-second-window-display");
  const studentTimer = documentRef.querySelector("[data-student-engineering-time]");
  const studentMemo = documentRef.querySelector("[data-student-memo]");
  const imageSlot = documentRef.querySelector("[data-student-image-slot]");
  let studentImage = documentRef.querySelector(".platform-student-memo-image");
  if (memoState.image && !studentImage && studentMemo) {
    studentImage = documentRef.createElement("img");
    studentImage.className = "platform-student-memo-image";
    studentImage.alt = "Teacher whiteboard shared with students";
  }
  if (studentImage && memoState.image) studentImage.src = memoState.image;
  if (studentImage && !memoState.image) studentImage.remove();
  if (studentTimer) studentTimer.hidden = !showTimer;
  if (studentMemo) studentMemo.hidden = !showMemo;
  if (studentDisplay) {
    studentDisplay.classList.toggle("platform-student-display-combined", showTimer && showMemo);
    studentDisplay.classList.toggle("platform-student-display-message-only", !showTimer && showMemo);
    studentDisplay.classList.toggle("platform-student-display-timer-only", showTimer && !showMemo);
  }
  if (studentImage && studentMemo) {
    (showTimer && imageSlot ? imageSlot : studentMemo).append(studentImage);
    if (imageSlot) imageSlot.hidden = !showTimer;
  }
  const mission = todaysMission.read();
  documentRef.querySelectorAll("[data-student-mission-title]").forEach((element) => { element.textContent = mission.title; });
  documentRef.querySelectorAll("[data-student-mission-focus]").forEach((element) => { element.textContent = mission.focus; });
  const liveVoice = Number(document.querySelector("[data-voice-meter-output]")?.textContent ?? 0);
  const activity = readVoiceMeterActivity();
  const prediction = predictedLearningType(liveVoice);
  documentRef.querySelectorAll("[data-voice-meter]").forEach((meter) => { meter.style.setProperty("--voice-meter-level", `${liveVoice}%`); meter.style.setProperty("--voice-threshold", `${activity.target}%`); meter.dataset.meterState = voiceMeterState(liveVoice, activity.target); meter.querySelector("[data-voice-meter-output]")?.replaceChildren(String(liveVoice)); });
  documentRef.querySelectorAll("[data-voice-prediction]").forEach((label) => { label.textContent = `${prediction.icon} ${prediction.label}`; });
  documentRef.querySelectorAll("[data-voice-display-mode]").forEach((element) => { element.dataset.voiceDisplayMode = readVoiceMeterDisplayMode(); });
  syncPresentationTimerViewControls(documentRef);
}

function openClassroomPresentationWindow() {
  if (classroomPresentationWindow && !classroomPresentationWindow.closed) {
    classroomPresentationWindow.focus();
    syncClassroomPresentationWindow();
    return;
  }
  syncStudentDisplayPresentation();
  const source = document.querySelector("#platform-student-timer-display");
  if (!source) return;
  const classroomUrl = new URL(window.location.href);
  classroomUrl.searchParams.set("classroomDisplay", "1");
  classroomPresentationWindow = window.open(classroomUrl.href, "thinkamigbob-classroom-view");
  const status = document.querySelector("[data-classroom-window-status]");
  if (!classroomPresentationWindow) {
    if (status) status.textContent = "The Classroom Display was blocked. Allow new tabs for this platform, then try again.";
    return;
  }
  classroomPresentationWindow.addEventListener("load", () => syncClassroomPresentationWindow(), { once: true });
  if (status) status.textContent = "Classroom Display opened in a separate browser tab or window.";
  return;
  const clone = source.cloneNode(true);
  clone.hidden = false;
  clone.id = "platform-second-window-display";
  const stylesheetLinks = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .map((link) => link.href)
    .filter(Boolean)
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("");
  classroomPresentationWindow = window.open("", "thinkamigbob-classroom-view");

  if (!classroomPresentationWindow) { if (status) status.textContent = "The Classroom Display was blocked. Allow new tabs for this platform, then try again."; return; }
  classroomPresentationWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Classroom View · THINKamigBOB</title>${stylesheetLinks}<style>html,body{margin:0;min-height:100%;overflow:hidden}#platform-second-window-display{display:grid!important}</style></head><body class="platform-app"><details class="platform-classroom-window-controls" aria-label="Classroom Display window controls"><summary>Display</summary><div class="platform-classroom-window-options"><button type="button" data-action="fullscreen-classroom-display">Full Screen</button><details class="platform-classroom-split-control"><summary>Split Screen</summary><div><label>Webpage address<input type="url" data-classroom-companion-url inputmode="url" placeholder="Paste a webpage link"></label><button type="button" data-action="split-screen-classroom-display">Show Side by Side</button></div></details><span data-classroom-display-layout-status role="status"></span></div></details>${clone.outerHTML}</body></html>`);
  classroomPresentationWindow.document.close();
  const screenOptionsSummary = classroomPresentationWindow.document.querySelector(".platform-classroom-window-controls > summary");
  if (screenOptionsSummary) screenOptionsSummary.textContent = "Screen Options";
  const exitPresentationButton = classroomPresentationWindow.document.createElement("button");
  exitPresentationButton.type = "button";
  exitPresentationButton.className = "platform-classroom-exit-presentation";
  exitPresentationButton.dataset.action = "exit-classroom-fullscreen";
  exitPresentationButton.textContent = "Exit Full Screen";
  exitPresentationButton.hidden = true;
  classroomPresentationWindow.document.body.append(exitPresentationButton);
  installSmartboardToolGestures(classroomPresentationWindow.document);
  classroomPresentationWindow.document.addEventListener("change", (event) => {
    const voiceTarget = event.target.closest("[data-voice-meter-target]");
    if (!voiceTarget) return;
    const mainVoiceTarget = document.querySelector("[data-voice-meter-target]");
    if (!mainVoiceTarget) return;
    mainVoiceTarget.value = voiceTarget.value;
    mainVoiceTarget.dispatchEvent(new Event("change", { bubbles: true }));
    syncClassroomPresentationWindow();
  });
  classroomPresentationWindow.document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (handleNamePickerAction(action, classroomPresentationWindow.document)) return;
    if (handleActivitySideTimerAction(action)) return;
    if (action.dataset.action === "toggle-smartboard-tool") {
      const tool = classroomPresentationWindow.document.querySelector(`[data-smartboard-tool="${action.dataset.smartboardToolName}"]`);
      if (tool) {
        tool.hidden = !tool.hidden;
        if (!tool.hidden) {
          bringSmartboardToolForward(tool);
          keepSmartboardToolsOnScreen(classroomPresentationWindow.document);
        }
      }
    }
    if (action.dataset.action === "reset-smartboard-tools") resetSmartboardToolPositions(classroomPresentationWindow.document);
    if (action.dataset.action === "fullscreen-classroom-display") void toggleClassroomDisplayFullscreen(action);
    if (action.dataset.action === "exit-classroom-fullscreen") void exitClassroomDisplayFullscreen(action.ownerDocument);
    if (action.dataset.action === "split-screen-classroom-display") {
      if (classroomPresentationWindow.document.fullscreenElement) void classroomPresentationWindow.document.exitFullscreen();
      const layoutStatus = classroomPresentationWindow.document.querySelector("[data-classroom-display-layout-status]");
      const rawAddress = classroomPresentationWindow.document.querySelector("[data-classroom-companion-url]")?.value.trim() || "";
      let webpageUrl = "";
      try {
        const candidate = new URL(/^https?:\/\//i.test(rawAddress) ? rawAddress : `https://${rawAddress}`);
        if (!['http:', 'https:'].includes(candidate.protocol)) throw new Error("Unsupported webpage address");
        webpageUrl = candidate.href;
      } catch {
        if (layoutStatus) layoutStatus.textContent = "Paste a complete webpage address first.";
        return;
      }
      if (classroomCompanionWindow && !classroomCompanionWindow.closed) classroomCompanionWindow.location.href = webpageUrl;
      else classroomCompanionWindow = classroomPresentationWindow.open(webpageUrl, "thinkamigbob-classroom-companion", "popup=yes,width=900,height=760,resizable=yes");
      if (!classroomCompanionWindow) {
        if (layoutStatus) layoutStatus.textContent = "The webpage window was blocked. Allow pop-ups, then try again.";
        return;
      }
      const displayScreen = classroomPresentationWindow.screen;
      const screenLeft = Number(displayScreen.availLeft || 0);
      const screenTop = Number(displayScreen.availTop || 0);
      const screenWidth = Number(displayScreen.availWidth || displayScreen.width || 1200);
      const screenHeight = Number(displayScreen.availHeight || displayScreen.height || 760);
      const halfWidth = Math.floor(screenWidth / 2);
      try {
        classroomPresentationWindow.moveTo(screenLeft, screenTop);
        classroomPresentationWindow.resizeTo(halfWidth, screenHeight);
        classroomCompanionWindow.moveTo(screenLeft + halfWidth, screenTop);
        classroomCompanionWindow.resizeTo(screenWidth - halfWidth, screenHeight);
        classroomCompanionWindow.focus();
        classroomPresentationWindow.focus();
        if (layoutStatus) layoutStatus.textContent = "Classroom Display and webpage are side by side.";
      } catch {
        if (layoutStatus) layoutStatus.textContent = "The webpage is open. Use the smartboard window controls to place both windows side by side.";
      }
    }
    if (action.dataset.action === "popout-smartboard-tool") openSmartboardToolPopout(action.closest("[data-smartboard-tool]"));
    if (action.dataset.action === "fullscreen-smartboard-tool") {
      const tool = action.closest("[data-smartboard-tool]");
      toggleSmartboardToolMaximized(tool);
    }
    if (action.dataset.action === "close-smartboard-tool") action.closest("[data-smartboard-tool]").hidden = true;
    if (action.dataset.action === "timer-start") lessonTimer.start();
    if (action.dataset.action === "timer-start-or-resume") lessonTimer.read().status === LESSON_TIMER_STATES.PAUSED ? lessonTimer.resume() : lessonTimer.start();
    if (action.dataset.action === "timer-pause") lessonTimer.pause();
    if (action.dataset.action === "timer-resume") lessonTimer.resume();
    if (action.dataset.action === "timer-end") lessonTimer.end();
    if (action.dataset.action === "timer-reset") lessonTimer.reset();
    if (action.dataset.action === "timer-subtract-minute") lessonTimer.subtractMinute();
    if (action.dataset.action === "timer-add-minute") lessonTimer.addMinute();
    if (action.dataset.action === "timer-view-mode") setPresentationTimerViewMode(action.dataset.timerViewMode);
    if (action.dataset.action === "stopwatch-start" && stopwatchInterval === null) stopwatchInterval = window.setInterval(() => { stopwatchSeconds += 1; document.querySelectorAll("[data-stopwatch-output]").forEach((output) => { output.textContent = formatLessonTime(stopwatchSeconds); }); classroomPresentationWindow?.document.querySelectorAll("[data-stopwatch-output]").forEach((output) => { output.textContent = formatLessonTime(stopwatchSeconds); }); }, 1000);
    if (action.dataset.action === "stopwatch-pause" && stopwatchInterval !== null) { window.clearInterval(stopwatchInterval); stopwatchInterval = null; }
    if (action.dataset.action === "stopwatch-reset") { if (stopwatchInterval !== null) window.clearInterval(stopwatchInterval); stopwatchInterval = null; stopwatchSeconds = 0; classroomPresentationWindow.document.querySelectorAll("[data-stopwatch-output]").forEach((output) => { output.textContent = formatLessonTime(0); }); }
    if (action.dataset.action === "voice-meter-start") void startVoiceMeter();
    if (action.dataset.action === "voice-meter-stop") stopVoiceMeter("Voice Meter paused.");
    if (action.dataset.action === "open-whiteboard") document.querySelector('[data-action="open-whiteboard"]')?.click();
    syncLessonTimerPresentation();
  });
  classroomPresentationWindow.document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    classroomPresentationWindow.close();
    classroomPresentationWindow = null;
    if (status) status.textContent = "Classroom Display closed.";
  });
  syncClassroomPresentationWindow();
  applyClassroomBobDisplay();
  const scheduledPost = scheduledDoNowForClass(currentDoNowClassId());
  if (scheduledPost) showDoNow(scheduledPost);
  else if (readLiveDoNow()) syncDoNowPresentation();
  classroomPresentationWindow.focus();
  if (status) status.textContent = "Classroom Display opened in a separate browser tab or window.";
}

function standaloneClassroomDisplayRequested() {
  return new URLSearchParams(window.location.search).get("classroomDisplay") === "1";
}

function enterStandaloneClassroomDisplayMode() {
  if (!standaloneClassroomDisplayRequested()) return;
  const display = document.querySelector("#platform-student-timer-display");
  if (!display) return;
  display.hidden = false;
  document.body.classList.add("platform-standalone-classroom-display");
  if (!document.querySelector(".platform-classroom-window-controls")) {
    const controls = document.createElement("div");
    controls.className = "platform-classroom-window-controls";
    controls.setAttribute("aria-label", "Classroom Display screen options");
    controls.innerHTML = '<strong>Screen Options</strong><button type="button" data-action="fullscreen-classroom-display">Full Screen</button><span data-classroom-display-layout-status role="status"></span>';
    controls.querySelector('[data-action="fullscreen-classroom-display"]').addEventListener("click", (event) => {
      event.stopPropagation();
      void toggleClassroomDisplayFullscreen(event.currentTarget);
    });
    root.append(controls);
  }
  if (!document.querySelector(".platform-classroom-exit-presentation")) {
    const exit = document.createElement("button");
    exit.type = "button";
    exit.className = "platform-classroom-exit-presentation";
    exit.dataset.action = "exit-classroom-fullscreen";
    exit.textContent = "Exit Full Screen";
    exit.hidden = true;
    exit.addEventListener("click", (event) => {
      event.stopPropagation();
      void exitClassroomDisplayFullscreen(event.currentTarget.ownerDocument);
    });
    root.append(exit);
  }
  installSmartboardToolPopoutButtons(document);
  syncLessonTimerPresentation();
}

function syncLessonTimerPresentation() {
  const state = currentScheduledLessonTimerState();
  const scheduled = classTimerSchedule.readEffective().pomodoroEnabled ? presentationTimerVisualState(state) : currentTimerVisualState(state);
  const phase = scheduled.active ? scheduled.phase : null;
  const presentationScheduled = presentationTimerVisualState(state);
  const presentationPhase = presentationScheduled.active ? presentationScheduled.phase : null;
  const appState = session.read();
  if (appState.role === PLATFORM_ROLES.TEACHER && state.status === LESSON_TIMER_STATES.RUNNING) {
    const classId = currentTeacherClass(appState.teacherId)?.id;
    const released = classId && (classResourceSharing.release(classId, "class-start").ok || (phase?.color && classResourceSharing.release(classId, phase.color).ok));
    if (released) {
      const region = document.querySelector("[data-class-resource-teacher]");
      if (region) region.outerHTML = classResourceTeacherMarkup(classId);
    }
  }
  const sounds = classTimerSchedule.readEffective();
  const phaseKey = phase?.key ?? null;
  if (lastTimerPhaseKey !== null && phaseKey !== lastTimerPhaseKey) {
    if (phaseKey === "warning") playTimerSound(sounds.yellowSound, sounds.yellowCustomAudio);
    if (phaseKey === "ending") playTimerSound(sounds.redSound, sounds.redCustomAudio);
  }
  if (lastTimerStatus !== null && lastTimerStatus !== LESSON_TIMER_STATES.COMPLETE && state.status === LESSON_TIMER_STATES.COMPLETE) {
    playTimerSound(sounds.endSound, sounds.endCustomAudio);
  }
  lastTimerPhaseKey = phaseKey;
  lastTimerStatus = state.status;
  document.querySelectorAll("[data-timer-remaining]").forEach((element) => {
    element.textContent = formatLessonTime(state.remainingSeconds);
    element.dataset.timerPhaseColor = phase?.color ?? "default";
  });
  document.querySelectorAll("[data-timer-phase-name]").forEach((element) => {
    element.textContent = phase?.name ?? "Today's Engineering Time";
  });
  document.querySelectorAll("[data-timer-warning]").forEach((element) => {
    element.hidden = !scheduled.fiveMinuteWarning;
  });
  document.querySelectorAll("#platform-student-timer-display [data-timer-phase-name]").forEach((element) => {
    element.textContent = presentationPhase?.name ?? "Today's Engineering Time";
  });
  document.querySelectorAll("#platform-student-timer-display [data-timer-warning]").forEach((element) => {
    element.hidden = !presentationScheduled.fiveMinuteWarning;
  });
  document.querySelectorAll("#platform-student-timer-display [data-timer-remaining]").forEach((element) => {
    element.dataset.timerPhaseColor = presentationPhase?.color ?? "default";
  });
  document.querySelectorAll("[data-timer-ring]").forEach((element) => {
    element.dataset.activePhases = presentationPhase ? "true" : "false";
    element.style.setProperty("--timer-elapsed", `${presentationScheduled.elapsedPercent ?? 0}%`);
    element.style.setProperty("--timer-main-start", `${presentationScheduled.mainStartPercent ?? 20}%`);
    element.style.setProperty("--timer-warning-start", `${presentationScheduled.warningStartPercent ?? 70}%`);
    element.style.setProperty("--timer-red-start", `${presentationScheduled.redStartPercent ?? 80}%`);
  });
  document.querySelectorAll("[data-timer-state]").forEach((element) => {
    element.textContent = state.status;
  });
  document.querySelectorAll("[data-current-plan-timer]").forEach((element) => {
    element.textContent = `${state.status} · ${formatLessonTime(state.remainingSeconds)}`;
  });
  document.querySelectorAll("[data-student-pomodoro-status]").forEach((element) => {
    const studentPhase = presentationPhase ?? phase;
    const phaseName = element.querySelector("[data-student-pomodoro-phase]");
    const phaseTime = element.querySelector("[data-student-pomodoro-time]");
    if (phaseName) phaseName.textContent = studentPhase?.name ?? "Today’s Engineering Time";
    if (phaseTime) phaseTime.textContent = formatLessonTime(state.remainingSeconds);
  });
  if (appState.role === PLATFORM_ROLES.STUDENT) {
    const studentPhase = presentationPhase ?? phase;
    const studentPhaseKey = studentPhase?.key ?? null;
    if (state.status === LESSON_TIMER_STATES.RUNNING && lastStudentPhaseKey !== null && studentPhaseKey && studentPhaseKey !== lastStudentPhaseKey) {
      const popup = document.querySelector("[data-student-phase-change]");
      const title = popup?.querySelector("[data-student-phase-change-title]");
      if (title) title.textContent = studentPhase.name ?? "New class phase";
      if (popup) {
        popup.hidden = false;
        popup.querySelector("button")?.focus({ preventScroll: true });
        if (studentPhasePopupTimeout !== null) window.clearTimeout(studentPhasePopupTimeout);
        studentPhasePopupTimeout = window.setTimeout(() => { popup.hidden = true; studentPhasePopupTimeout = null; }, 7000);
      }
    }
    lastStudentPhaseKey = studentPhaseKey;
    const reminder = document.querySelector("[data-student-captains-log-reminder]");
    const yellowOrFinalTen = state.status === LESSON_TIMER_STATES.RUNNING && (presentationPhase?.key === "warning" || phase?.key === "warning" || state.remainingSeconds <= 600);
    if (reminder?.dataset.captainsLogDue === "true" && yellowOrFinalTen && reminder.dataset.dismissed !== "true") reminder.hidden = false;
    const wrapWarning = document.querySelector("[data-student-captains-log-wrap-warning]");
    const logOpen = Boolean(document.querySelector(".platform-student-reflection-form[open]"));
    if (wrapWarning) wrapWarning.hidden = !(logOpen && state.status === LESSON_TIMER_STATES.RUNNING && state.remainingSeconds <= 360 && state.remainingSeconds > 0);
  } else lastStudentPhaseKey = null;

  const controlRules = {
    "timer-start": state.status === LESSON_TIMER_STATES.READY,
    "timer-start-or-resume": state.status === LESSON_TIMER_STATES.READY || state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-pause": state.status === LESSON_TIMER_STATES.RUNNING,
    "timer-resume": state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-reset": state.status !== LESSON_TIMER_STATES.READY,
    "timer-end": state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-subtract-minute": state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED,
    "timer-add-minute": (state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED) &&
      state.remainingSeconds <= MAX_LESSON_MINUTES * 60 - 60,
  };
  Object.entries(controlRules).forEach(([action, enabled]) => {
    document.querySelectorAll(`[data-action="${action}"]`).forEach((button) => { button.disabled = !enabled; });
    if (classroomPresentationWindow && !classroomPresentationWindow.closed) {
      classroomPresentationWindow.document.querySelectorAll(`[data-action="${action}"]`).forEach((button) => { button.disabled = !enabled; });
    }
  });

  const durationInput = document.querySelector("[data-timer-duration]");
  const durationButton = document.querySelector("[data-timer-set]");
  const durationLocked = state.status === LESSON_TIMER_STATES.RUNNING || state.status === LESSON_TIMER_STATES.PAUSED;
  if (durationInput) durationInput.disabled = durationLocked;
  if (durationButton) durationButton.disabled = durationLocked;
  syncPresentationTimerViewControls();
  syncStudentTimerPopout();
  syncClassroomPresentationWindow();
  syncActivitySideTimerPresentation();
}

function syncTeacherMemoPresentation() {
  const state = teacherMemo.read();
  const field = document.querySelector("[data-teacher-memo]");
  const count = document.querySelector("[data-teacher-memo-count]");
  const clearButton = document.querySelector('[data-action="clear-teacher-memo"]');
  const saved = document.querySelector("[data-teacher-memo-saved]");
  const editor = document.querySelector("[data-teacher-memo-editor]");
  if (field) field.value = state.text;
  if (editor) editor.innerHTML = memoSegmentsMarkup(state);
  if (count) count.textContent = String(state.text.length);
  if (clearButton) clearButton.disabled = !state.text;
  if (saved) saved.innerHTML = state.text ? memoSegmentsMarkup(state) : "No class message saved.";
  document.querySelectorAll("[data-student-memo-text]").forEach((element) => { element.innerHTML = state.text ? memoSegmentsMarkup(state) : "No message is ready yet."; });
  const studentMemo = document.querySelector("[data-student-memo]");
  let studentImage = document.querySelector(".platform-student-memo-image");
  if (state.image && !studentImage && studentMemo) {
    studentImage = document.createElement("img");
    studentImage.className = "platform-student-memo-image";
    studentImage.alt = "Teacher-added class message visual";
    studentMemo.append(studentImage);
  }
  if (studentImage && state.image) studentImage.src = state.image;
  if (studentImage && !state.image) studentImage.remove();
  document.querySelectorAll("[data-student-memo]").forEach((element) => {
    element.dataset.memoColor = state.color;
    element.dataset.memoSize = state.size;
    element.dataset.memoStyle = state.style;
  });
  syncStudentDisplayPresentation();
  refreshCurrentClassPlan();
}

function memoEditorSegments(editor) {
  const defaults = teacherMemo.read();
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const segments = [];
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent ?? "";
    if (!text) continue;
    const format = { color: defaults.color, size: defaults.size, style: defaults.style };
    let winningPriority = -1;
    let ancestor = walker.currentNode.parentElement;
    while (ancestor && ancestor !== editor) {
      const priority = Number(ancestor.dataset.memoPriority ?? 0);
      if (priority >= winningPriority && ancestor.dataset.memoColor) {
        format.color = ancestor.dataset.memoColor;
        format.size = ancestor.dataset.memoSize ?? format.size;
        format.style = ancestor.dataset.memoStyle ?? format.style;
        winningPriority = priority;
      }
      ancestor = ancestor.parentElement;
    }
    const previous = segments.at(-1);
    if (previous && previous.color === format.color && previous.size === format.size && previous.style === format.style) previous.text += text;
    else segments.push({ text, ...format });
  }
  return segments;
}

function applyMemoFormatToSelection() {
  const editor = document.querySelector("[data-teacher-memo-editor]");
  const selection = window.getSelection();
  if (!editor) return false;
  const liveRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const range = liveRange && !selection.isCollapsed && editor.contains(liveRange.commonAncestorContainer)
    ? liveRange
    : memoSelectionRange?.cloneRange();
  if (!range || range.collapsed) return false;
  if (!editor.contains(range.commonAncestorContainer)) return false;
  const wrapper = document.createElement("span");
  wrapper.dataset.memoColor = document.querySelector('[data-memo-format="color"]')?.value ?? "white";
  wrapper.dataset.memoSize = document.querySelector('[data-memo-format="size"]')?.value ?? "extra-large";
  wrapper.dataset.memoStyle = document.querySelector('[data-memo-format="style"]')?.value ?? "bold";
  memoFormatRevision += 1;
  wrapper.dataset.memoPriority = String(memoFormatRevision);
  wrapper.append(range.extractContents());
  range.insertNode(wrapper);
  selection.removeAllRanges();
  memoSelectionRange = null;
  const hidden = document.querySelector("[data-teacher-memo]");
  if (hidden) hidden.value = editor.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS);
  return true;
}

function missionAvailabilityText(value) {
  return value === TODAYS_MISSION_AVAILABILITY.AVAILABLE
    ? "Available today"
    : "Not part of today's mission";
}

function missionFocusValue(form) {
  const choice = form.elements.focusChoice?.value ?? "";
  return choice === CUSTOM_MISSION_FOCUS ? (form.elements.focus?.value ?? "") : choice;
}

function syncMissionFocusChoice(form) {
  const choice = form.elements.focusChoice?.value ?? "";
  const custom = form.querySelector("[data-mission-custom-focus]");
  if (custom) custom.hidden = choice !== CUSTOM_MISSION_FOCUS;
}

function syncTodaysMissionPresentation() {
  const state = todaysMission.read();
  const hasMission = Boolean(state.title);
  const clearButton = document.querySelector('[data-action="clear-todays-mission"]');
  const saved = document.querySelector("[data-todays-mission-saved]");
  const values = {
    "[data-todays-mission-saved-title]": state.title,
    "[data-todays-mission-saved-focus]": state.focus,
    "[data-todays-mission-saved-builder]": `Builder: ${missionAvailabilityText(state.builder)}`,
    "[data-todays-mission-saved-workshop]": `Workshop: ${missionAvailabilityText(state.workshop)}`,
    "[data-student-mission-title]": state.title,
    "[data-student-mission-focus]": state.focus,
    "[data-student-mission-builder]": `Builder: ${missionAvailabilityText(state.builder)}`,
    "[data-student-mission-workshop]": `Workshop: ${missionAvailabilityText(state.workshop)}`,
  };
  if (clearButton) clearButton.disabled = !hasMission;
  if (saved) saved.hidden = !hasMission;
  Object.entries(values).forEach(([selector, text]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = hasMission ? text : "";
  });
  const studentFocus = document.querySelector("[data-student-mission-focus]");
  if (studentFocus) studentFocus.hidden = !hasMission || state.focus === state.title;
  syncStudentDisplayPresentation();
}

function syncStudentDisplayPresentation() {
  const hasMemo = Boolean(teacherMemo.read().text);
  const hasMission = Boolean(todaysMission.read().title);
  const hasMessageContent = hasMemo || hasMission;
  const selectedMode = studentDisplayMode.read({ hasMemo: hasMessageContent });
  const showTimer = selectedMode !== STUDENT_DISPLAY_MODES.MESSAGE;
  const showMemo = hasMemo && selectedMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showMission = hasMission && selectedMode !== STUDENT_DISPLAY_MODES.TIMER;
  const showMessage = showMemo || showMission;
  const display = document.querySelector("#platform-student-timer-display");
  const timer = document.querySelector("[data-student-engineering-time]");
  const memo = document.querySelector("[data-student-memo]");
  const mission = document.querySelector("[data-student-mission]");
  const imageSlot = document.querySelector("[data-student-image-slot]");
  const studentImage = display?.querySelector(".platform-student-memo-image");
  if (timer) timer.hidden = !showTimer;
  if (memo) memo.hidden = !showMemo;
  if (mission) mission.hidden = !showMission;
  if (display) {
    display.classList.toggle("platform-student-display-combined", showTimer && showMessage);
    display.classList.toggle("platform-student-display-message-only", !showTimer && showMessage);
    display.classList.toggle("platform-student-display-timer-only", showTimer && !showMessage);
    display.setAttribute("aria-labelledby", showTimer
      ? "student-timer-title"
      : showMission ? "student-mission-title" : "student-message-title");
    const combined = showTimer && showMessage;
    if (studentImage && imageSlot && memo) {
      (combined ? imageSlot : memo).append(studentImage);
      imageSlot.hidden = !combined;
    } else if (imageSlot) {
      imageSlot.hidden = true;
    }
  }
  document.querySelectorAll("[data-presentation-mode]").forEach((control) => {
    control.setAttribute("aria-pressed", String(control.dataset.presentationMode === selectedMode));
    if (control.dataset.presentationMode === STUDENT_DISPLAY_MODES.MESSAGE) {
      control.disabled = !hasMessageContent;
    }
  });
  window.requestAnimationFrame(fitStudentMemoPresentation);
}

function fitStudentMemoPresentation() {
  const display = document.querySelector("#platform-student-timer-display:not([hidden])");
  const memo = display?.querySelector("[data-student-memo]:not([hidden])");
  const text = memo?.querySelector("[data-student-memo-text]");
  const image = memo?.querySelector(".platform-student-memo-image");
  if (!display || !memo || !text) return;
  const combined = display.classList.contains("platform-student-display-combined");
  memo.style.maxHeight = combined ? "38vh" : "78vh";
  if (image) image.style.maxHeight = combined ? "16vh" : "38vh";
  const textLength = text.textContent?.length ?? 0;
  let fontSize = Math.min(combined ? window.innerHeight * 0.055 : window.innerHeight * 0.11, combined ? 48 : 112);
  if (textLength > 120) fontSize *= 0.62;
  else if (textLength > 70) fontSize *= 0.76;
  text.style.fontSize = `${Math.max(20, fontSize)}px`;
  for (let attempts = 0; attempts < 24 && memo.scrollHeight > memo.clientHeight; attempts += 1) {
    fontSize -= 2;
    text.style.fontSize = `${Math.max(18, fontSize)}px`;
  }
}

function manageLessonTimerPresentation(route) {
  if (lessonTimerPresentationInterval !== null) {
    window.clearInterval(lessonTimerPresentationInterval);
    lessonTimerPresentationInterval = null;
  }
  if (route !== ROUTES.TEACHER_DASHBOARD) return;
  syncLessonTimerPresentation();
  lessonTimerPresentationInterval = window.setInterval(syncLessonTimerPresentation, 250);
}

function restoreLessonTimerDisplay(route, state) {
  const isAuthorizedTeacherDashboard = route === ROUTES.TEACHER_DASHBOARD
    && state.role === PLATFORM_ROLES.TEACHER;
  if (!isAuthorizedTeacherDashboard) {
    if (state.role !== PLATFORM_ROLES.TEACHER) storeLessonTimerDisplayOpen(false);
    return false;
  }
  if (!lessonTimerDisplayIsStoredOpen()) return false;
  const display = document.querySelector("#platform-student-timer-display");
  if (!display) return false;
  display.hidden = false;
  return true;
}

function readTimerAudioFile(file) {
  if (!file || !file.size) return Promise.resolve("");
  if (!String(file.type).startsWith("audio/")) return Promise.reject(new Error("audio-type"));
  if (file.size > 750 * 1024) return Promise.reject(new Error("audio-size"));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")), { once: true });
    reader.addEventListener("error", () => reject(new Error("audio-read")), { once: true });
    reader.readAsDataURL(file);
  });
}

async function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  if (form.dataset.form === "teacher-research-link-bank") {
    const title = String(data.get("title") || "").trim(), topic = String(data.get("topic") || "").trim(), parsed = parseTeacherAssignedResearchLinks(data.get("links")), status = form.querySelector("[data-research-bank-status]");
    if (!title) { if (status) status.textContent = "Enter a title for this link group."; return; }
    if (!parsed.ok) { if (status) status.textContent = `${parsed.reason}. Use a complete secure address beginning with https://.`; return; }
    if (!parsed.links.length) { if (status) status.textContent = "Add at least one approved link to this group."; return; }
    const groups = readTeacherResearchLinkBank();
    if (groups.length >= 24) { if (status) status.textContent = "The link bank is full. Delete an older group before adding another."; return; }
    groups.unshift({ id: `research-${Date.now()}`, title: title.slice(0, 80), topic: topic.slice(0, 140), links: parsed.links });
    writeTeacherResearchLinkBank(groups);
    render();
    return;
  }
  if (form.dataset.form === "teacher-assigned-research") {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id, topic = String(data.get("topic") || "").trim(), parsed = parseTeacherAssignedResearchLinks(data.get("links")), status = form.querySelector("[data-assigned-research-status]");
    if (!classId || !topic) { if (status) status.textContent = "Enter a research topic before saving."; return; }
    if (!parsed.ok) { if (status) status.textContent = `${parsed.reason}. Use a complete secure address beginning with https://.`; return; }
    if (!parsed.links.length) { if (status) status.textContent = "Add at least one approved link before saving."; return; }
    writeTeacherAssignedResearch(classId, { topic: topic.slice(0, 140), links: parsed.links });
    if (status) status.textContent = `${parsed.links.length} approved link${parsed.links.length === 1 ? "" : "s"} saved in this browser for the current class.`;
    return;
  }
  if (form.dataset.form === "weekly-reflection-requirement") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const result = weeklyReflections.setRequirement(classId, Number(data.get("required")));
    const status = form.querySelector("[data-weekly-reflection-teacher-status]");
    if (status) status.textContent = result.ok ? `Saved: ${result.required} response${result.required === 1 ? "" : "s"} required this week.` : "Choose a requirement from 0 to 5.";
    return;
  }
  if (form.dataset.form === "captains-log-plan") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const promptId = String(data.get("promptId") || "custom");
    const selected = [...CAPTAINS_LOG_PRESET_PROMPTS, ...weeklyReflections.captainLogLibrary()].find((item) => item.id === promptId);
    const prompt = promptId === "custom" ? String(data.get("prompt") || "").trim() : String(selected?.prompt || data.get("prompt") || "").trim();
    const result = weeklyReflections.saveCaptainLogPlan(classId, { promptId, prompt, week: Number(data.get("week")), schedule: data.get("schedule"), required: Number(data.get("required")) });
    if (result.ok && data.get("saveToLibrary") === "on") weeklyReflections.saveCaptainLogPrompt(prompt);
    const status = form.querySelector("[data-captains-log-status]");
    if (status) status.textContent = result.ok ? `Saved: Week ${result.plan.week} · ${result.plan.schedule} · ${result.plan.required} log${result.plan.required === 1 ? "" : "s"} this week.` : "Add a prompt and choose a week, day, and number of logs.";
    if (result.ok) render();
    return;
  }
  if (form.dataset.form === "captains-log-week-plan") {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id, days = {};
    CAPTAINS_LOG_WEEKDAYS.forEach((day) => {
      const promptId = String(data.get(`promptId-${day}`) || "");
      const selected = [...CAPTAINS_LOG_PRESET_PROMPTS, ...weeklyReflections.captainLogLibrary()].find((item) => item.id === promptId);
      const prompt = promptId === "custom" ? String(data.get(`prompt-${day}`) || "").trim() : String(selected?.prompt || data.get(`prompt-${day}`) || "").trim();
      const enabled = data.get(`enabled-${day}`) === "on";
      days[day] = { enabled, promptId: promptId === "custom" ? `custom-${data.get("week")}-${day.toLowerCase()}` : promptId, prompt, assignment: String(data.get(`assignment-${day}`) || "") };
      if (enabled && data.get(`save-${day}`) === "on") weeklyReflections.saveCaptainLogPrompt(prompt);
    });
    const requestedGoal = Number(data.get("required"));
    const missingAssignment = CAPTAINS_LOG_WEEKDAYS.some((day) => days[day].enabled && !CAPTAINS_LOG_ASSIGNMENT_OPTIONS.includes(days[day].assignment));
    const missingPrompt = CAPTAINS_LOG_WEEKDAYS.some((day) => days[day].enabled && (!days[day].promptId || days[day].prompt.length < 5));
    const status = form.querySelector("[data-captains-log-status]");
    if (missingPrompt || missingAssignment) {
      if (status) status.textContent = missingPrompt ? "Choose or create a prompt for every checked row." : "Choose a day or Daily student choice for every checked prompt.";
      return;
    }
    const result = weeklyReflections.saveCaptainLogWeekPlan(classId, { week: Number(data.get("week")), days, required: requestedGoal });
    if (status) status.textContent = result.ok ? `Saved: students complete ${result.plan.required} of ${CAPTAINS_LOG_WEEKDAYS.filter((day) => days[day].enabled).length} available Captain’s Logs in Week ${result.plan.week}.` : result.reason === "goal-exceeds-prompts" ? `Add more prompts or lower the weekly goal. Students cannot complete ${requestedGoal} different logs with fewer available prompts.` : result.reason === "goal-below-assigned" ? "Raise the weekly goal or change some assigned-day prompts to student choices." : result.reason === "missing-assignment" ? "Choose a day or Daily student choice for every checked prompt." : "Choose or create a prompt for every checked row.";
    if (result.ok) render();
    return;
  }
  if (form.dataset.form === "weekly-reflection") {
    const state = session.read();
    const activityChoice = String(data.get("activityChoice") ?? "");
    if (form.dataset.coachingReady !== "true") {
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const elapsedSeconds = Math.max(0, (Date.now() - Number(form.dataset.coachingStartedAt || Date.now())) / 1000);
      const questions = captainLogCoachingQuestions({ explanation: data.get("explanation"), progress: data.get("progress"), improved: data.get("improved") }, { elapsedSeconds });
      const region = form.querySelector("[data-bob-coaching]");
      const list = form.querySelector("[data-bob-coaching-questions]");
      if (list) list.innerHTML = questions.map((item, index) => `<label data-coaching-question data-level="${item.level}" data-dok="${item.dok}" data-question="${escapeHtml(item.question)}"><strong>${index + 1}. ${escapeHtml(item.question)}</strong><textarea name="followUp" minlength="5" maxlength="300" required></textarea></label>`).join("");
      if (region) { region.hidden = false; region.dataset.coachingLevel = questions[0]?.level ?? "starting"; region.querySelector("p").textContent = `${captainLogLevelLabel(questions[0]?.level)} questions chosen from your response.`; }
      form.dataset.coachingElapsedSeconds = String(elapsedSeconds);
      form.dataset.coachingReady = "true";
      const submitButton = form.querySelector("[data-weekly-reflection-submit]");
      if (submitButton) submitButton.textContent = "Submit Captain’s Log";
      region?.scrollIntoView({ behavior: "smooth", block: "center" });
      region?.querySelector("textarea")?.focus({ preventScroll: true });
      return;
    }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const followUps = [...form.querySelectorAll("[data-coaching-question]")].map((label) => ({ dok: Number(label.dataset.dok), question: label.dataset.question, answer: label.querySelector("textarea")?.value }));
    const result = weeklyReflections.submit(state.classId, state.studentId, {
      activity: activityChoice === "__other__" ? data.get("activityOther") : activityChoice,
      promptId: data.get("promptId"),
      progress: data.get("progress"),
      explanation: data.get("explanation"),
      improved: data.get("improved"),
      badge: data.get("badge"),
      help: data.get("help"),
      helpOther: data.get("helpOther"),
      rating: data.get("rating"),
      followUps,
      elapsedSeconds: Number(form.dataset.coachingElapsedSeconds ?? 0),
    });
    if (!result.ok) {
      const error = form.querySelector("[data-weekly-reflection-error]");
      if (error) { error.hidden = false; error.textContent = "Choose an answer for every question and explain your learning with at least 10 characters."; }
      return;
    }
    render();
    return;
  }
  if (form.dataset.form === "production-student-entry") {
    void submitProductionStudentEntry(form, data);
    return;
  }
  if (form.dataset.form === "production-classroom-setup") {
    void submitProductionClassroom(form, data);
    return;
  }
  if (form.dataset.form === "evidence-governance") {
    const result = evidenceGovernance.save({ retention: data.get("retention"), deletionAuthority: data.get("deletionAuthority"), recovery: data.get("recovery"), exportRule: data.get("exportRule") });
    const error = form.querySelector("[data-evidence-governance-error]");
    const status = form.querySelector("[data-evidence-governance-status]");
    if (!result.ok) {
      if (status) status.textContent = "";
      if (error) { error.hidden = false; error.textContent = result.reason === "storage-unavailable" ? "The draft could not be saved in this browser." : "Choose every governance safeguard before saving the draft."; }
      return;
    }
    if (error) { error.hidden = true; error.textContent = ""; }
    if (status) { status.dataset.state = "saved"; status.textContent = "Governance draft saved for this browser session. It is not an enforced policy."; }
    renderGovernanceSimulation();
    return;
  }
  if (form.dataset.form === "governance-simulation-request") {
    const result = evidenceGovernanceSimulation.submit({ evidenceId: data.get("evidenceId"), evidenceLabel: data.get("evidenceLabel"), reason: data.get("reason"), exportOffered: data.get("exportOffered") === "yes" });
    if (!result.ok) {
      const error = document.querySelector("[data-governance-simulation-error]");
      if (error) { error.hidden = false; error.textContent = result.reason === "export-required" ? "Confirm that an export was offered before submitting." : result.reason === "reason-required" ? "Add a reason for the request." : "The fictional request could not be saved in this browser."; }
      return;
    }
    renderGovernanceSimulation();
    return;
  }
  if (form.dataset.form === "governance-simulation-decision") {
    const result = evidenceGovernanceSimulation.decide({ decision: data.get("decision"), reviewer: data.get("reviewer"), note: data.get("note") });
    if (!result.ok) {
      const error = document.querySelector("[data-governance-simulation-error]");
      if (error) { error.hidden = false; error.textContent = result.reason === "reviewer-required" ? "Add a fictional reviewer label." : result.reason === "note-required" ? "Add a decision note." : "Choose Approve or Reject to complete the simulation."; }
      return;
    }
    renderGovernanceSimulation();
    return;
  }
  if (form.dataset.form === "google-connection-preview") {
    const result = googleConnectionPreview.connect({ teacherConfirmed: data.get("teacherConfirmed") === "yes", studentBoundaryConfirmed: data.get("studentBoundaryConfirmed") === "yes" });
    if (!result.ok) {
      const error = document.querySelector("[data-google-connection-preview-error]");
      if (error) { error.hidden = false; error.textContent = result.reason === "teacher-confirmation-required" ? "Confirm that the teacher authorizes the connection." : "Confirm that students will not use Google accounts or Drive permissions."; }
      return;
    }
    renderGoogleConnectionPreview();
    return;
  }
  if (form.dataset.form === "evidence-drive-setup") {
    const result = evidenceDriveSetup.prepare({ folderName: data.get("folderName"), privacyConfirmed: data.get("privacyConfirmed") === "yes" });
    const error = form.querySelector("[data-evidence-drive-error]");
    const status = form.querySelector("[data-evidence-drive-status]");
    if (!result.ok) {
      if (error) {
        error.hidden = false;
        error.textContent = result.reason === "privacy-confirmation-required" ? "Confirm the classroom privacy boundary before preparing the connection." : result.reason === "storage-unavailable" ? "Setup could not be saved in this browser." : "Enter a folder name from 3 to 80 characters.";
      }
      return;
    }
    if (error) { error.hidden = true; error.textContent = ""; }
    if (status) {
      status.dataset.state = "prepared";
      status.textContent = `Future setup prepared for “${result.value.folderName}.” Production administrator OAuth is still required.`;
    }
    return;
  }

  if (form.dataset.form === "pb002j-teacher-connect" || form.dataset.form === "pb002j-configuration") {
    void pb002jClasswide.handleSubmit(form);
    return;
  }

  if (form.dataset.form === "teacher-login") {
    const teacher = validateTeacherCredentials(data.get("email"), data.get("password"));
    if (!teacher) return showFormError(form, "The email or password is not valid for this development preview.");
    session.signInTeacher(teacher.id);
    return navigate(ROUTES.TEACHER_DASHBOARD);
  }

  if (form.dataset.form === "student-entry") {
    const classCode = String(data.get("classCode") ?? "").trim();
    if (!classCode) return showFormError(form, "Enter your class code to continue.");
    const classRecord = findClassByCode(classCode);
    if (!classRecord) return showFormError(form, "That class code could not be found. Check the code and try again.");
    session.beginStudentEntry(classRecord.id);
    return navigate(ROUTES.STUDENT_ROSTER);
  }

  if (form.dataset.form === "student-identifier") {
    const state = session.read();
    const identifier = String(data.get("identifier") ?? "").trim();
    if (!identifier) return showFormError(form, "Enter your private identifier to continue.");
    const student = validateStudentIdentifier(state.pendingClassId, state.pendingStudentId, identifier);
    if (!student) return showFormError(form, "That private identifier is not valid. Check it and try again.");
    session.signInStudent(state.pendingClassId, student.id);
    return navigate(ROUTES.STUDENT_DASHBOARD);
  }

  if (form.dataset.form === "lesson-timer-duration") {
    const result = lessonTimer.setDuration(data.get("duration"));
    const error = form.querySelector("[data-timer-error]");
    if (!result.ok) {
      if (error) {
        error.textContent = `Enter a whole number from ${MIN_LESSON_MINUTES} to ${MAX_LESSON_MINUTES} minutes.`;
        error.hidden = false;
      }
      return;
    }
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    syncLessonTimerPresentation();
  }

  if (form.dataset.form === "class-timer-schedule") {
    const phaseNames = data.getAll("phaseName");
    const phaseStarts = data.getAll("phaseStart");
    const existingSchedule = classTimerSchedule.read();
    let customAudio;
    try {
      customAudio = {
        yellowCustomAudio: await readTimerAudioFile(data.get("yellowSoundFile")) || existingSchedule.yellowCustomAudio,
        redCustomAudio: await readTimerAudioFile(data.get("redSoundFile")) || existingSchedule.redCustomAudio,
        endCustomAudio: await readTimerAudioFile(data.get("endSoundFile")) || existingSchedule.endCustomAudio,
      };
    } catch (error) {
      const message = error.message === "audio-size" ? "Keep each custom sound at 750 KB or smaller." : "Choose a valid audio file for each custom sound.";
      const output = form.querySelector("[data-class-timer-schedule-error]");
      if (output) { output.textContent = message; output.hidden = false; }
      return;
    }
    const selectedSounds = [String(data.get("yellowSound")), String(data.get("redSound")), String(data.get("endSound"))];
    if (selectedSounds.some((sound, index) => sound === "Custom Upload" && !Object.values(customAudio)[index])) {
      const output = form.querySelector("[data-class-timer-schedule-error]");
      if (output) { output.textContent = "Upload an audio file before choosing Custom Upload."; output.hidden = false; }
      return;
    }
    const result = classTimerSchedule.save({
      enabled: data.get("enabled") === "yes",
      weekdays: data.getAll("weekdays"),
      startTime: String(data.get("startTime") ?? ""),
      durationMinutes: Number(data.get("durationMinutes")),
      timeZone: String(data.get("timeZone") ?? ""),
      yellowSound: String(data.get("yellowSound") ?? "None"),
      redSound: String(data.get("redSound") ?? "None"),
      endSound: String(data.get("endSound") ?? "None"),
      ...customAudio,
      pomodoroEnabled: data.get("pomodoroEnabled") === "yes",
      phases: [
        { name: phaseNames[0], startMinute: Number(phaseStarts[0]) },
        { name: phaseNames[1], startMinute: Number(phaseStarts[1]) },
        { name: phaseNames[2], startMinute: Number(phaseStarts[2]) },
        { name: phaseNames[3], startMinute: Number(phaseStarts[3]) },
      ],
    });
    const error = form.querySelector("[data-class-timer-schedule-error]");
    if (!result.ok) {
      if (error) {
        error.textContent = result.reason === "weekdays-required"
          ? "Choose at least one weekday when automatic timing is on."
          : result.reason === "invalid-time-zone" ? "Choose a valid time zone."
            : result.reason === "invalid-phases" ? "Use minute 0 for blue, choose green before the final five-minute gold warning, and start red before class ends."
              : "The schedule could not be saved.";
        error.hidden = false;
      }
      return;
    }
    const activeSchedule = classTimerSchedule.activeOccurrence();
    const previewIgnoresScheduleClock = session.read().teacherId === "teacher-preview-1" && !classroomDemoModeIsEnabled();
    if (activeSchedule.active && !previewIgnoresScheduleClock) {
      const timerResult = lessonTimer.startScheduled(activeSchedule.durationMinutes, activeSchedule.remainingSeconds);
      if (timerResult.ok) classTimerSchedule.markApplied(activeSchedule.occurrence);
    } else {
      lessonTimer.setDuration(result.schedule.durationMinutes);
    }
    const classId = currentTeacherClass(session.read().teacherId)?.id;
    if (classId) saveCurrentRotationWeek(classId, data.get("rotationWeek"));
    preserveCurrentClassSetup(classId);
    syncLessonTimerPresentation();
    return render();
  }

  if (form.dataset.form === "timer-today-override") {
    const durationMinutes = Number(data.get("durationMinutes"));
    const starts = data.getAll("phaseStart").map(Number);
    const base = classTimerSchedule.readEffective();
    const phases = base.phases.map((phase, index) => ({ ...phase, startMinute: index === 0 ? 0 : starts[index - 1] }));
    const result = classTimerSchedule.saveTodayOverride({ durationMinutes, phases, pomodoroEnabled: true });
    const error = form.querySelector("[data-timer-today-error]");
    if (!result.ok) {
      if (error) { error.textContent = "Use increasing phase start minutes that occur before today’s timer ends."; error.hidden = false; }
      return;
    }
    const active = classTimerSchedule.activeOccurrence();
    const current = lessonTimer.read();
    if (active.active) lessonTimer.startScheduled(active.durationMinutes, active.remainingSeconds);
    else if (current.status === LESSON_TIMER_STATES.RUNNING || current.status === LESSON_TIMER_STATES.PAUSED) {
      const elapsed = current.durationSeconds - current.remainingSeconds;
      lessonTimer.startScheduled(durationMinutes, Math.max(1, durationMinutes * 60 - elapsed));
    } else lessonTimer.setDuration(durationMinutes);
    return render();
  }

  if (form.dataset.form === "teacher-memo") {
    const editor = form.querySelector("[data-teacher-memo-editor]");
    const text = editor?.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS) ?? data.get("memo");
    const result = teacherMemo.save(text, {
      segments: editor ? memoEditorSegments(editor) : undefined,
      image: data.get("memoImage"),
    });
    const error = form.querySelector("[data-teacher-memo-error]");
    const status = form.querySelector("[data-teacher-memo-status]");
    if (!result.ok) {
      if (status) status.textContent = "";
      if (error) {
        error.textContent = result.reason === "too-long"
          ? `Keep the class message to ${TEACHER_MEMO_MAX_CHARACTERS} characters or fewer.`
          : "Enter a class message before saving.";
        error.hidden = false;
      }
      return;
    }
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    syncTeacherMemoPresentation();
    if (status) {
      status.dataset.state = "saved";
      status.textContent = "Saved for refresh and Student Display.";
    }
  }

  if (form.dataset.form === "todays-mission") {
    const goal = String(data.get("title") ?? "").trim();
    const result = todaysMission.save({
      title: goal,
      focus: goal,
      builder: form.elements.builder.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART,
      workshop: form.elements.workshop.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART,
    });
    const error = form.querySelector("[data-todays-mission-error]");
    const status = form.querySelector("[data-todays-mission-status]");
    const messages = {
      "missing-title": "Enter a mission title before saving.",
      "title-too-long": "Keep the mission title to 80 characters or fewer.",
      "missing-focus": "Enter a short classroom focus before saving.",
      "focus-too-long": "Keep the classroom focus to 180 characters or fewer.",
      "missing-builder": "Choose whether Builder is part of today's mission.",
      "missing-workshop": "Choose whether Workshop is part of today's mission.",
    };
    if (!result.ok) {
      if (status) status.textContent = "";
      if (error) {
        error.textContent = messages[result.reason] ?? "Today's Mission could not be saved.";
        error.hidden = false;
      }
      return;
    }
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (classId) weeklyReflections.recordActivity(classId, result.state.title);
    syncTodaysMissionPresentation();
    if (status) {
      status.dataset.state = "saved";
      status.textContent = "Today’s Plan is saved for this class and Student Display.";
    }
  }
}

async function submitProductionStudentEntry(form, data) {
  const classCode = String(data.get("classCode") || "").trim();
  const studentCode = String(data.get("studentCode") || "").trim();
  if (!classCode || !studentCode) return showFormError(form, "Enter both codes to continue.");
  const result = await productionIdentity.studentEntry({ classCode, studentCode });
  if (!result.ok) return showFormError(form, result.reason === "classroom-entry-not-recognized" ? "Those classroom codes were not recognized." : "Classroom entry is unavailable. Ask your teacher for help.");
  window.location.assign(result.value.redirect);
}

async function submitProductionClassroom(form, data) {
  const name = String(data.get("name") || "").trim();
  const parsed = parseStudentLabels(data.get("studentLabels"));
  if (name.length < 2) return showFormError(form, "Enter a class name.");
  if (!parsed.ok) {
    const messages = { "student-count": "Enter 1–40 student labels, one per line.", "student-label-too-long": "Keep each student label to 80 characters or fewer.", "duplicate-student-label": "Each student label must be unique." };
    return showFormError(form, messages[parsed.reason]);
  }
  const result = await productionIdentity.createClassroom({ name, studentLabels: parsed.labels });
  if (!result.ok) return showFormError(form, result.reason === "student-label-already-used" ? "One or more student labels are already used in another class. Generate the NameBobs again or edit the repeated label." : "The classroom could not be created. Sign in again or try later.");
  oneTimeClassroomCodes = result.value.classroom;
  setProductionTeacherClasses([productionClassRecord(result.value.classroom), ...productionTeacherClasses], result.value.classroom.classId);
  const region = document.querySelector("[data-classroom-setup]");
  if (region) region.outerHTML = classroomSetupMarkup();
  document.querySelector("#classroom-code-sheet-title")?.focus();
}

async function launchEvidencePilot() {
  const status = document.querySelector("[data-evidence-launch-status]");
  const keyInput = document.querySelector("[data-evidence-teacher-key]");
  evidenceTeacherRuntimeKey = keyInput?.value.trim() || evidenceTeacherRuntimeKey;
  if (status) status.textContent = "Launching the fictional evidence activity…";
  const result = await evidenceUploadClient.publishLaunch({ teacherKey: evidenceTeacherRuntimeKey, activity: currentEvidenceActivity() });
  if (keyInput) keyInput.value = "";
  if (status) status.textContent = result.ok
    ? `Launched: ${result.launch.activity}. Fictional students can now save Photo and Screenshot evidence to the pilot Drive folder.`
    : `Launch not completed (${result.reason}). Check that the local pilot service is running and paste its current teacher key.`;
}

function renderTeacherLiveEvidence() {
  const region = document.querySelector("[data-live-evidence-inbox]");
  if (region) region.outerHTML = teacherLiveEvidenceMarkup();
}

async function refreshTeacherLiveEvidence() {
  const keyInput = document.querySelector("[data-evidence-teacher-key]");
  evidenceTeacherRuntimeKey = keyInput?.value.trim() || evidenceTeacherRuntimeKey;
  teacherLiveEvidenceNotice = "Checking the protected fictional evidence inbox…";
  renderTeacherLiveEvidence();
  const result = await evidenceUploadClient.listEvidence({ teacherKey: evidenceTeacherRuntimeKey });
  if (!result.ok) {
    teacherLiveEvidenceNotice = `Live evidence unavailable (${result.reason}). Paste the current memory-only teacher key and try again.`;
    renderTeacherLiveEvidence();
    return;
  }
  teacherLiveEvidence = result.evidence;
  if (teacherLiveEvidencePreviewUrl) URL.revokeObjectURL(teacherLiveEvidencePreviewUrl);
  teacherLiveEvidencePreviewUrl = "";
  teacherLiveEvidenceSelection = teacherLiveEvidence[0]?.id || "";
  teacherLiveEvidenceNotice = teacherLiveEvidence.length
    ? `${teacherLiveEvidence.length} persistent fictional submission${teacherLiveEvidence.length === 1 ? "" : "s"} loaded from the teacher-owned Drive.`
    : "No fictional image submissions were found in the configured Drive folder.";
  renderTeacherLiveEvidence();
}

async function openTeacherLiveEvidence(evidenceId) {
  teacherLiveEvidenceSelection = evidenceId;
  if (teacherLiveEvidencePreviewUrl) URL.revokeObjectURL(teacherLiveEvidencePreviewUrl);
  teacherLiveEvidencePreviewUrl = "";
  teacherLiveEvidenceNotice = "Loading the protected visual preview…";
  renderTeacherLiveEvidence();
  const result = await evidenceUploadClient.loadEvidencePreview({ teacherKey: evidenceTeacherRuntimeKey, evidenceId });
  teacherLiveEvidenceNotice = result.ok ? "Protected fictional visual evidence loaded." : `Visual preview unavailable (${result.reason}).`;
  if (result.ok) teacherLiveEvidencePreviewUrl = URL.createObjectURL(result.blob);
  renderTeacherLiveEvidence();
  document.querySelector(".platform-live-evidence-preview")?.focus();
}

async function saveEvidenceDraft() {
  const error = document.querySelector("[data-evidence-error]");
  const detail = evidenceDraft?.type === EVIDENCE_TYPES.REFLECTION ? evidenceDraft.detail : evidenceDraft?.fileName;
  if (!evidenceDraft || !String(detail || "").trim()) {
    if (error) { error.hidden = false; error.textContent = "Add evidence before saving."; }
    return;
  }
  let driveEvidence = null;
  let driveFailure = "drive-upload-not-attempted";
  const canUpload = [EVIDENCE_TYPES.PHOTO, EVIDENCE_TYPES.SCREENSHOT].includes(evidenceDraft.type) && evidenceDraft.file;
  if (canUpload) {
    const state = session.read();
    const launch = await evidenceUploadClient.currentLaunch();
    driveFailure = launch.ok ? "fictional-student-session-required" : `launch-${launch.reason}`;
    if (launch.ok && state.studentId) {
      const ticket = await evidenceUploadClient.requestTicket({ launchId: launch.launch.id, studentId: state.studentId });
      driveFailure = ticket.ok ? "upload-not-completed" : `ticket-${ticket.reason}`;
      if (ticket.ok) {
        const upload = await evidenceUploadClient.uploadImage({ ticket: ticket.ticket, file: evidenceDraft.file, fileName: evidenceDraft.fileName, evidenceType: evidenceDraft.type });
        if (upload.ok) driveEvidence = upload.evidence;
        else driveFailure = `upload-${upload.reason}`;
      }
    }
  }
  const timelineDetail = driveEvidence ? `Teacher Drive pilot · ${driveEvidence.name}` : detail;
  const result = evidenceFoundation.save({ type: evidenceDraft.type, title: evidenceDraft.type === EVIDENCE_TYPES.REFLECTION ? "New reflection" : evidenceDraft.fileName, activity: currentEvidenceActivity(), detail: timelineDetail });
  if (!result.ok) {
    if (error) { error.hidden = false; error.textContent = result.reason === "storage-unavailable" ? "Evidence could not be saved in this browser. Try again." : "Add evidence before saving."; }
    return;
  }
  if (evidenceDraft.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
  evidenceDraft = null;
  evidenceNotice = driveEvidence
    ? "Evidence saved to the teacher-owned fictional pilot Drive and your timeline."
    : (canUpload ? `The Drive pilot was unavailable (${driveFailure}), so this evidence was saved only in your browser timeline.` : "Evidence saved to your pilot timeline.");
  renderEvidenceFoundation();
}

function updateVoiceMeterPresentation(value) {
  const threshold = readVoiceMeterActivity().target;
  const state = voiceMeterState(value, threshold);
  const now = Date.now();
  const previousBobState = voiceBobState;
  if (state !== voiceBobState && now - voiceBobStateChangedAt >= 2400) {
    voiceBobState = state;
    voiceBobStateChangedAt = now;
  }
  updateBobUnlockProgress(voiceBobState);
  const bobMessages = { green: "Bob is calm and happy.", yellow: "Bob is asking the class to quiet down.", red: "Bob is uncomfortable because the room is too loud." };
  document.querySelectorAll("[data-voice-meter]").forEach((meter) => {
    meter.style.setProperty("--voice-meter-level", `${value}%`);
    meter.dataset.meterState = state;
    const output = meter.querySelector("[data-voice-meter-output]");
    if (output) output.textContent = String(value);
  });
  document.querySelectorAll("[data-voice-bob-message]").forEach((label) => { label.textContent = voiceBobState === "green" && now < floatingBobUnlockMessageUntil ? floatingBobUnlockMessage : bobMessages[voiceBobState]; });
  document.querySelectorAll("[data-voice-bob]").forEach((bob) => { bob.dataset.meterState = voiceBobState; bob.dataset.poseUnlocked = String(voiceBobState === "green" && now < floatingBobUnlockMessageUntil); bob.setAttribute("aria-label", bobMessages[voiceBobState]); if (voiceBobState !== "green") bob.classList.remove("is-walking-out", "is-walking-in", "is-unlocked-pose"); });
  if (previousBobState !== voiceBobState && voiceBobState === "green") applyUnlockedBobPose([...document.querySelectorAll(".platform-floating-voice-bob")], Math.max(0, floatingBobLastPose));
  if (voiceBobState === "green") delete document.body.dataset.voiceFrame;
  else document.body.dataset.voiceFrame = voiceBobState;
  const prediction = predictedLearningType(value);
  document.querySelectorAll("[data-voice-prediction]").forEach((label) => { label.textContent = `${prediction.icon} ${prediction.label}`; });
}

function relocateFloatingBob() {
  const setting = readClassroomBobDisplay();
  const corners = classroomBobCorners(setting.placement);
  const bobs = [document, classroomPresentationWindow?.document].filter(Boolean).flatMap((documentRef) => [...documentRef.querySelectorAll(".platform-floating-voice-bob")]);
  if (!setting.enabled || !bobs.length || bobs.some((bob) => bob.dataset.meterState !== "green" || bob.classList.contains("is-walking-out") || bob.classList.contains("is-walking-in"))) return;
  bobs.forEach((bob) => { bob.classList.remove("is-unlocked-pose"); bob.classList.add("is-walking-out"); });
  window.setTimeout(() => {
    const connectedBobs = bobs.filter((bob) => bob.isConnected && bob.dataset.meterState === "green");
    if (!connectedBobs.length) return;
    floatingBobCornerIndex = (floatingBobCornerIndex + 1) % corners.length;
    floatingBobIdleSet = (floatingBobIdleSet % 4) + 1;
    connectedBobs.forEach((bob) => { bob.dataset.corner = corners[floatingBobCornerIndex]; bob.dataset.idleSet = String(floatingBobIdleSet); bob.classList.remove("is-walking-out"); bob.classList.add("is-walking-in"); });
    window.setTimeout(() => { connectedBobs.forEach((bob) => bob.classList.remove("is-walking-in")); applyUnlockedBobPose(connectedBobs); }, 2800);
  }, 2800);
}

function whiteboardCanvas() {
  return document.querySelector("[data-whiteboard-canvas]");
}

function updateWhiteboardHistoryControls() {
  document.querySelectorAll('[data-action="whiteboard-undo"]').forEach((button) => { button.disabled = whiteboardUndoStack.length === 0; });
  document.querySelectorAll('[data-action="whiteboard-redo"]').forEach((button) => { button.disabled = whiteboardRedoStack.length === 0; });
}

function refreshWhiteboardLibraryOptions(selectedId = "") {
  const select = document.querySelector("[data-whiteboard-saved]");
  if (!select) return;
  const boards = readWhiteboardLibrary();
  select.innerHTML = `<option value="">Choose a saved board</option>${boards.map((board) => `<option value="${escapeHtml(board.id)}"${board.id === selectedId ? " selected" : ""}>${escapeHtml(board.title)} · ${escapeHtml(whiteboardScheduleLabel(board))}${board.studentDisplay ? " · Student Display" : ""}</option>`).join("")}`;
}

function setWhiteboardStatus(message) {
  const status = document.querySelector("[data-whiteboard-status]");
  if (status) status.textContent = message;
  const pixelStatus = document.querySelector("[data-pixel-status]");
  if (pixelStatus) pixelStatus.textContent = message;
}

function showWhiteboardBobMeasurementCoach() {
  const coach = document.querySelector("[data-whiteboard-bob-coach]");
  if (!coach) return;
  if (!coach.hidden && ["intro", "directions"].includes(coach.dataset.state)) return;
  let seen = false;
  try { seen = window.sessionStorage.getItem(WHITEBOARD_BOB_MEASUREMENT_COACH_KEY) === "seen"; } catch {}
  coach.hidden = false;
  coach.dataset.state = seen ? "collapsed" : "intro";
  coach.querySelector("[data-whiteboard-bob-intro]").hidden = seen;
  coach.querySelector("[data-whiteboard-bob-directions]").hidden = true;
  if (!seen) { try { window.sessionStorage.setItem(WHITEBOARD_BOB_MEASUREMENT_COACH_KEY, "seen"); } catch {} }
}

function setWhiteboardBobCoachState(state) {
  const coach = document.querySelector("[data-whiteboard-bob-coach]");
  if (!coach) return;
  coach.hidden = false; coach.dataset.state = state;
  coach.querySelector("[data-whiteboard-bob-intro]").hidden = state !== "intro";
  coach.querySelector("[data-whiteboard-bob-directions]").hidden = state !== "directions";
  const compareUnit = document.querySelector("[data-whiteboard-compare-unit]");
  if (compareUnit) compareUnit.dataset.bobHighlight = state === "directions" ? "true" : "false";
}

function syncWhiteboardDimensionCompareControl() {
  const control = document.querySelector("[data-whiteboard-dimension-compare]");
  if (!control) return;
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  control.disabled = selected?.type !== "dimension";
  if (selected?.type === "dimension") control.value = selected.compareUnit ?? (selected.unit === "mm" ? "cm" : "mm");
}

function whiteboardSnapshot(canvas = whiteboardCanvas()) {
  return canvas?.toDataURL("image/png") ?? "";
}

function whiteboardStudentDisplayImage(canvas = whiteboardCanvas()) {
  if (!canvas) return "";
  const preview = document.createElement("canvas");
  const scale = Math.min(1, 1200 / canvas.width, 720 / canvas.height);
  preview.width = Math.max(1, Math.round(canvas.width * scale));
  preview.height = Math.max(1, Math.round(canvas.height * scale));
  preview.getContext("2d").drawImage(canvas, 0, 0, preview.width, preview.height);
  return preview.toDataURL("image/jpeg", 0.78);
}

function serializableWhiteboardObjects() {
  return whiteboardObjects.map(({ element, ...object }) => object);
}

function newWhiteboardPage(title = "") {
  return { id: globalThis.crypto?.randomUUID?.() ?? `page-${Date.now()}-${Math.random()}`, title: title || `Page ${whiteboardPages.length + 1}`, objects: [] };
}

function syncCurrentWhiteboardPage() {
  if (!whiteboardPages.length) whiteboardPages = [newWhiteboardPage("Page 1")];
  const page = whiteboardPages[whiteboardCurrentPageIndex] ?? whiteboardPages[0];
  page.objects = structuredClone(serializableWhiteboardObjects());
  const canvas = whiteboardCanvas();
  if (canvas) {
    const preview = document.createElement("canvas"); preview.width = 160; preview.height = 90;
    const context = preview.getContext("2d"); context.fillStyle = "#fff"; context.fillRect(0, 0, preview.width, preview.height); context.drawImage(canvas, 0, 0, preview.width, preview.height);
    page.thumbnail = preview.toDataURL("image/jpeg", 0.68);
  }
}

function renderWhiteboardPageStrip() {
  const strip = document.querySelector("[data-whiteboard-pages]");
  if (!strip) return;
  strip.querySelector("[data-whiteboard-page-tabs]").innerHTML = whiteboardPages.map((page, index) => `<button type="button" data-action="whiteboard-page-select" data-whiteboard-page-index="${index}" aria-current="${index === whiteboardCurrentPageIndex ? "page" : "false"}">${page.thumbnail ? `<img src="${escapeHtml(page.thumbnail)}" alt="">` : `<span class="platform-whiteboard-page-blank" aria-hidden="true"></span>`}<strong>${escapeHtml(page.title || `Page ${index + 1}`)}</strong></button>`).join("");
  const count = strip.querySelector("[data-whiteboard-page-count]");
  if (count) count.textContent = `${whiteboardCurrentPageIndex + 1} / ${whiteboardPages.length}`;
  strip.querySelector('[data-action="whiteboard-page-previous"]').disabled = whiteboardCurrentPageIndex === 0;
  strip.querySelector('[data-action="whiteboard-page-next"]').disabled = whiteboardCurrentPageIndex >= whiteboardPages.length - 1;
  strip.querySelector('[data-action="whiteboard-page-left"]').disabled = whiteboardCurrentPageIndex === 0;
  strip.querySelector('[data-action="whiteboard-page-right"]').disabled = whiteboardCurrentPageIndex >= whiteboardPages.length - 1;
  strip.querySelector('[data-action="whiteboard-page-delete"]').disabled = whiteboardPages.length <= 1;
}

function openWhiteboardPage(index, { save = true } = {}) {
  if (!Number.isInteger(index) || index < 0 || index >= whiteboardPages.length || index === whiteboardCurrentPageIndex) return;
  if (save) syncCurrentWhiteboardPage();
  whiteboardCurrentPageIndex = index;
  whiteboardObjects = structuredClone(whiteboardPages[index].objects ?? []);
  whiteboardSelectedObjectId = "";
  whiteboardUndoStack = [];
  whiteboardRedoStack = [];
  hydrateWhiteboardImages(() => renderWhiteboardObjects());
  renderWhiteboardObjects();
  renderWhiteboardPageStrip();
  saveWhiteboard();
  updateWhiteboardHistoryControls();
  setWhiteboardStatus(`Showing ${whiteboardPages[index].title}.`);
}

function cloneEditableWhiteboardObject(object) {
  if (!object) return null;
  const { element, ...editable } = object;
  return structuredClone(editable);
}

function saveWhiteboard(canvas = whiteboardCanvas()) {
  if (!canvas) return;
  try {
    syncCurrentWhiteboardPage();
    window.sessionStorage.setItem(WHITEBOARD_SESSION_KEY, whiteboardSnapshot(canvas));
    window.sessionStorage.setItem(WHITEBOARD_OBJECT_SESSION_KEY, JSON.stringify(serializableWhiteboardObjects()));
    window.sessionStorage.setItem(WHITEBOARD_PAGES_SESSION_KEY, JSON.stringify({ currentPageIndex: whiteboardCurrentPageIndex, pages: whiteboardPages }));
    window.sessionStorage.setItem(WHITEBOARD_VIEW_SESSION_KEY, JSON.stringify({ gridUnit: whiteboardGridUnit, rulerUnit: whiteboardRulerUnit, zoom: whiteboardZoom, ruler: whiteboardRuler, title: whiteboardDrawingTitle, controlsDock: whiteboardControlsDock, controlsHidden: whiteboardControlsHidden, pageDock: whiteboardPageDock, background: { type: whiteboardBackground.type, color1: whiteboardBackground.color1, color2: whiteboardBackground.color2, imageSrc: whiteboardBackground.imageSrc } }));
    renderWhiteboardPageStrip();
  } catch {
    const status = document.querySelector("[data-whiteboard-status]");
    if (status) status.textContent = "The board is working, but this browser could not save a recovery copy.";
  }
}

function paintWhiteboardSnapshot(snapshot, canvas = whiteboardCanvas(), afterPaint = null) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (!snapshot) { afterPaint?.(); return; }
  const image = new Image();
  image.onload = () => { context.drawImage(image, 0, 0, canvas.width, canvas.height); afterPaint?.(); };
  image.src = snapshot;
}

function pushWhiteboardHistory() {
  whiteboardUndoStack.push(JSON.stringify(serializableWhiteboardObjects()));
  if (whiteboardUndoStack.length > 30) whiteboardUndoStack.shift();
  whiteboardRedoStack = [];
  updateWhiteboardHistoryControls();
}

function whiteboardPoint(event, canvas) {
  const bounds = canvas.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
}

function refreshPendingWhiteboardTextEntryStyle() {
  const entry = document.querySelector("[data-whiteboard-text-entry]");
  const canvas = whiteboardCanvas();
  if (!entry || !canvas) return;
  const scaleX = canvas.clientWidth / canvas.width, scaleY = canvas.clientHeight / canvas.height;
  const size = Math.max(22, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 5);
  const fontFamily = document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial";
  const backgroundName = document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent";
  const guide = fontFamily === "School Cursive" ? document.querySelector("[data-whiteboard-cursive-lines]")?.value ?? "none" : "none";
  entry.dataset.cursiveGuide = guide;
  entry.style.fontFamily = `"${fontFamily}"`;
  entry.style.fontSize = `${size * scaleY}px`;
  entry.style.lineHeight = "1.22";
  entry.style.fontWeight = document.querySelector('[data-text-command="bold"]')?.getAttribute("aria-pressed") === "true" ? "700" : "400";
  entry.style.fontStyle = document.querySelector('[data-text-command="italic"]')?.getAttribute("aria-pressed") === "true" ? "italic" : "normal";
  entry.style.textDecoration = document.querySelector('[data-text-command="underline"]')?.getAttribute("aria-pressed") === "true" ? "underline" : "none";
  entry.style.color = backgroundName === "black" ? "#ffffff" : document.querySelector("[data-whiteboard-text-color]")?.value ?? "#12384d";
  entry.style.backgroundColor = whiteboardTextBackground(backgroundName) || "transparent";
  entry.style.width = `${Math.min(canvas.clientWidth - entry.offsetLeft - 4, Math.max(180 * scaleX, (entry.value.length + 2) * size * 0.55 * scaleX))}px`;
  entry.style.height = `${Math.max(38, size * 1.55 * scaleY)}px`;
  entry.style.minHeight = entry.style.height;
}

function openPencilGripTutorial() {
  document.querySelector("[data-pencil-grip-tutorial]")?.remove();
  const tutorial = document.createElement("div");
  tutorial.className = "platform-pencil-grip-tutorial"; tutorial.dataset.pencilGripTutorial = "true";
  tutorial.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="pencil-grip-title"><button type="button" class="platform-pencil-grip-close" aria-label="Close pencil grip tutorial">×</button><h3 id="pencil-grip-title">How to hold a pencil for cursive writing</h3><img src="./assets/images/whiteboard/proper-pencil-grip.jpg" alt="Close view of a relaxed tripod pencil grip"><ol><li>Rest the pencil on the side of the middle finger.</li><li>Hold it gently between the thumb and index finger.</li><li>Keep all three fingers curved and relaxed.</li><li>Let the side of the hand glide across the paper.</li></ol></section>`;
  const close = () => tutorial.remove();
  tutorial.addEventListener("click", (event) => { if (event.target === tutorial || event.target.closest(".platform-pencil-grip-close")) close(); });
  document.body.append(tutorial); tutorial.querySelector("button")?.focus();
}

function updateWhiteboardCursiveCoach() {
  const entry = document.querySelector("[data-whiteboard-text-entry]");
  const surface = entry?.parentElement;
  surface?.querySelector("[data-whiteboard-cursive-coach-preview]")?.remove();
  const mode = document.querySelector("[data-whiteboard-cursive-coach]")?.value ?? "off";
  const font = document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial";
  const text = entry?.value ?? "";
  if (!entry || !surface || mode === "off" || font !== "School Cursive" || !text) { refreshPendingWhiteboardTextEntryStyle(); return; }
  const coach = document.createElement("aside");
  coach.className = "platform-whiteboard-pencil-grip-photo"; coach.dataset.whiteboardCursiveCoachPreview = "true";
  coach.innerHTML = `<button type="button" aria-label="Open the pencil grip tutorial"><img src="./assets/images/whiteboard/proper-pencil-grip.jpg" alt="A hand demonstrating a tripod pencil grip while writing"><small>Relaxed tripod pencil grip<br>Click for tutorial</small></button>`;
  coach.querySelector("button")?.addEventListener("click", openPencilGripTutorial);
  coach.style.left = "8px";
  coach.style.top = "8px";
  surface.append(coach);
  window.setTimeout(() => coach.classList.add("is-fading"), 5800);
  window.setTimeout(() => coach.remove(), 6600);
}

function showWhiteboardCursiveModel(text, object, canvas, onComplete) {
  const surface = canvas.parentElement;
  if (!surface || !text) return;
  surface.querySelector("[data-whiteboard-cursive-model]")?.remove();
  const modeledLetters = [...text].reduce((letters, character, sourceIndex, sourceCharacters) => {
    if (/^[A-Za-z]$/.test(character)) letters.push({
      character,
      connectsFromPrevious: sourceIndex > 0 && /^[A-Za-z]$/.test(sourceCharacters[sourceIndex - 1]),
      connectsToNext: sourceIndex < sourceCharacters.length - 1 && /^[A-Za-z]$/.test(sourceCharacters[sourceIndex + 1]),
    });
    return letters;
  }, []);
  if (!modeledLetters.length) return;
  const model = document.createElement("aside");
  model.className = "platform-whiteboard-cursive-model"; model.dataset.whiteboardCursiveModel = "true";
  const scaleX = canvas.clientWidth / canvas.width, scaleY = canvas.clientHeight / canvas.height;
  model.style.left = `${Math.max(4, object.x * scaleX)}px`; model.style.top = `${Math.max(4, object.y * scaleY)}px`;
  model.innerHTML = `<strong data-whiteboard-cursive-model-title>Watch each letter form</strong><svg data-whiteboard-cursive-model-svg viewBox="-12 -5 58 42" aria-live="polite"><g class="platform-whiteboard-cursive-guides" aria-hidden="true"><line x1="-12" x2="46" y1="-4" y2="-4"/><line class="is-midline" x1="-12" x2="46" y1="8" y2="8"/><line x1="-12" x2="46" y1="17" y2="17"/></g></svg>`;
  surface.append(model);
  const modelTitle = model.querySelector("[data-whiteboard-cursive-model-title]");
  const modelSvg = model.querySelector("[data-whiteboard-cursive-model-svg]");
  const penSpeedMillisecondsPerUnit = 45;
  const pauseAfterLetter = 800;
  const playLetter = (index) => {
    if (!model.isConnected || !modelTitle || !modelSvg) return;
    if (index >= modeledLetters.length) {
      const replay = window.confirm("The cursive letter model is complete. Would you like to replay it once more?");
      model.remove();
      if (replay) showWhiteboardCursiveModel(text, object, canvas, onComplete);
      else onComplete?.();
      return;
    }
    const { character, connectsFromPrevious, connectsToNext } = modeledLetters[index];
    const isUppercase = /^[A-Z]$/.test(character);
    const glyph = isUppercase ? null : CURSIVE_STROKE_LETTERS[character];
    const letterStrokes = isUppercase
      ? `<text class="platform-whiteboard-cursive-capital" x="0" y="9">${escapeHtml(character)}</text>`
      : glyph?.paths.map((path) => path.dot
        ? `<circle class="platform-whiteboard-cursive-dot" cx="${path.dot.cx}" cy="${path.dot.cy}" r="${path.dot.r}"/>`
        : `<path pathLength="1" d="${path.d}"/>`).join("") || "";
    modelTitle.textContent = `Letter ${index + 1} of ${modeledLetters.length}: ${character}`;
    modelSvg.setAttribute("aria-label", `${connectsFromPrevious ? "How to continue from the previous letter and form" : "How to begin at the baseline and form"} the cursive letter ${character}`);
    const previousLetter = modelSvg.querySelector("[data-cursive-letter-active]");
    modelSvg.insertAdjacentHTML("beforeend", `<g data-cursive-letter-active transform="translate(12 8)">${letterStrokes}</g>`);
    const currentLetter = [...modelSvg.querySelectorAll("[data-cursive-letter-active]")].at(-1);
    if (currentLetter) {
      const drawnPaths = [...currentLetter.querySelectorAll("path")];
      const firstDrawnPath = drawnPaths[0];
      const lastDrawnPath = drawnPaths.at(-1);
      const capitalBounds = currentLetter.querySelector("text")?.getBBox();
      const pathStart = firstDrawnPath?.getPointAtLength(0);
      const pathEndpoint = lastDrawnPath?.getPointAtLength(lastDrawnPath.getTotalLength());
      const entryEndX = pathStart?.x ?? 0;
      const entryEndY = pathStart?.y ?? 9;
      const entryStartX = entryEndX - 6;
      const previousEndpointY = Number(previousLetter?.dataset.cursiveExitY);
      const entryStartY = connectsFromPrevious && Number.isFinite(previousEndpointY) ? previousEndpointY : 9;
      if (!isUppercase) currentLetter.insertAdjacentHTML("afterbegin", `<path class="platform-whiteboard-cursive-entry${connectsFromPrevious ? " platform-whiteboard-cursive-incoming" : ""}" pathLength="1" d="M ${entryStartX} ${entryStartY} C ${entryStartX + 2} ${entryStartY}, ${entryEndX - 2} ${entryEndY}, ${entryEndX} ${entryEndY}"/>`);
      currentLetter.dataset.cursiveEntryX = String(entryStartX);
      currentLetter.dataset.cursiveExitX = String(pathEndpoint?.x ?? (capitalBounds ? capitalBounds.x + capitalBounds.width : 0));
      currentLetter.dataset.cursiveExitY = String(pathEndpoint?.y ?? 9);
      if (previousLetter) {
        const previousBounds = previousLetter.getBBox();
        const previousEndpointX = Number(previousLetter.dataset.cursiveExitX) || previousBounds.x + previousBounds.width;
        previousLetter.setAttribute("transform", `translate(${12 + entryStartX - previousEndpointX} 8)`);
        previousLetter.removeAttribute("data-cursive-letter-active");
        previousLetter.classList.add("is-fading");
        window.setTimeout(() => previousLetter.remove(), 800);
      }
    }
    let elapsedDrawingTime = 0;
    currentLetter?.querySelectorAll("path, circle, text").forEach((stroke) => {
      const isPath = stroke.tagName.toLowerCase() === "path";
      const isDot = stroke.tagName.toLowerCase() === "circle";
      const duration = isPath
        ? Math.max(650, Math.min(2200, stroke.getTotalLength() * penSpeedMillisecondsPerUnit))
        : isDot ? 180 : 1100;
      stroke.style.setProperty("--stroke-delay", `${elapsedDrawingTime}ms`);
      stroke.style.setProperty("--stroke-duration", `${duration}ms`);
      elapsedDrawingTime += duration;
    });
    window.setTimeout(() => playLetter(index + 1), elapsedDrawingTime + pauseAfterLetter);
  };
  playLetter(0);
}

function openCursiveTouchPractice(text) {
  document.querySelector("[data-cursive-touch-practice]")?.remove();
  const practice = document.createElement("section");
  practice.className = "platform-cursive-touch-practice";
  practice.dataset.cursiveTouchPractice = "true";
  practice.setAttribute("role", "dialog"); practice.setAttribute("aria-modal", "true"); practice.setAttribute("aria-labelledby", "cursive-touch-title");
  practice.innerHTML = `<header><div><p class="platform-command-label">Touch Writing Practice</p><h2 id="cursive-touch-title">Write “${escapeHtml(text)}”</h2></div><button type="button" data-touch-close aria-label="Close touch writing practice">Close</button></header><main><section class="platform-cursive-touch-model" data-touch-model-panel><span>Your cursive model</span><strong data-touch-model>${escapeHtml(text)}</strong></section><div class="platform-cursive-touch-options"><label>Writing paper<select data-touch-paper><option value="wide" selected>Wide ruled</option><option value="practice">Handwriting practice — 3 lines</option><option value="none">No lines</option></select></label><label>Writing help<select data-touch-help required><option value="" selected>Choose before writing</option><option value="model">Show the modeled writing while I write</option><option value="independent">Try without help</option></select></label><span data-touch-ready>Choose writing help to unlock the touch area.</span><button type="button" data-touch-previous>← Previous space</button><span data-touch-page-count>Space 1 of 1</span><button type="button" data-touch-next>Next space →</button><button type="button" data-touch-add-page>+ New writing space</button></div><section class="platform-cursive-touch-pages is-locked" data-touch-pages aria-label="Finger writing area"></section><div class="platform-cursive-touch-actions"><button type="button" data-touch-clear>Clear this space</button><button type="button" class="platform-button-primary" data-touch-finish>I'm done writing</button></div><section class="platform-cursive-touch-result" data-touch-result hidden></section></main>`;
  document.body.append(practice);
  const pages = [];
  let currentPageIndex = 0, activeStroke = null, paper = "wide", traceMode = false, helpChoice = "";
  const pagesRegion = practice.querySelector("[data-touch-pages]");
  const pageCount = practice.querySelector("[data-touch-page-count]");
  const drawPaper = (context, canvas) => {
    context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
    if (paper === "wide") { context.strokeStyle = "#8bc4dc"; context.lineWidth = 3; [115, 225, 335].forEach((y) => { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }); }
    if (paper === "practice") { [28, 142, 256].forEach((top) => { context.strokeStyle = "#76b6d0"; context.lineWidth = 2; context.setLineDash([]); context.beginPath(); context.moveTo(0, top); context.lineTo(canvas.width, top); context.moveTo(0, top + 76); context.lineTo(canvas.width, top + 76); context.stroke(); context.setLineDash([10, 9]); context.beginPath(); context.moveTo(0, top + 38); context.lineTo(canvas.width, top + 38); context.stroke(); }); context.setLineDash([]); }
    if (traceMode) { context.save(); context.globalAlpha = 0.16; context.fillStyle = "#12384d"; context.font = '110px "School Cursive", cursive'; context.fillText(text, 35, 215); context.restore(); }
  };
  const renderPage = (page) => {
    const context = page.canvas.getContext("2d"); drawPaper(context, page.canvas); context.strokeStyle = "#12384d"; context.lineWidth = 8; context.lineCap = "round"; context.lineJoin = "round";
    page.strokes.forEach((stroke) => { if (!stroke.length) return; context.beginPath(); context.moveTo(stroke[0].x, stroke[0].y); stroke.slice(1).forEach((point) => context.lineTo(point.x, point.y)); context.stroke(); });
  };
  const showPage = (index) => { currentPageIndex = index; pages.forEach((page, pageIndex) => { page.canvas.hidden = pageIndex !== index; }); pageCount.textContent = `Space ${index + 1} of ${pages.length}`; practice.querySelector("[data-touch-previous]").disabled = index === 0; practice.querySelector("[data-touch-next]").disabled = index === pages.length - 1; };
  const addPage = () => {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 370; canvas.setAttribute("aria-label", `Touch writing space ${pages.length + 1}`); canvas.style.touchAction = "none"; canvas.style.setProperty("--touch-canvas-width", `${canvas.width}px`);
    const page = { canvas, strokes: [], inkLength: 0, minX: Infinity, maxX: -Infinity }; pages.push(page); pagesRegion.append(canvas); renderPage(page); showPage(pages.length - 1);
    const pointFromEvent = (event) => { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; };
    canvas.addEventListener("pointerdown", (event) => { if (!helpChoice) return; event.preventDefault(); canvas.setPointerCapture(event.pointerId); activeStroke = [pointFromEvent(event)]; page.strokes.push(activeStroke); });
    canvas.addEventListener("pointermove", (event) => { if (!activeStroke) return; event.preventDefault(); const point = pointFromEvent(event), previous = activeStroke.at(-1); activeStroke.push(point); page.inkLength += Math.hypot(point.x - previous.x, point.y - previous.y); page.minX = Math.min(page.minX, point.x); page.maxX = Math.max(page.maxX, point.x); if (point.x > canvas.width - 40) { canvas.width += 800; canvas.style.setProperty("--touch-canvas-width", `${canvas.width}px`); } renderPage(page); if (point.x > pagesRegion.scrollLeft + pagesRegion.clientWidth - 90) pagesRegion.scrollTo({ left: point.x - pagesRegion.clientWidth + 140, behavior: "smooth" }); });
    const stop = () => { activeStroke = null; }; canvas.addEventListener("pointerup", stop); canvas.addEventListener("pointercancel", stop);
  };
  addPage();
  practice.querySelector("[data-touch-paper]").addEventListener("change", (event) => { paper = event.target.value; pages.forEach(renderPage); });
  practice.querySelector("[data-touch-help]").addEventListener("change", (event) => { helpChoice = event.target.value; pagesRegion.classList.toggle("is-locked", !helpChoice); practice.querySelector("[data-touch-model-panel]").hidden = helpChoice === "independent"; practice.querySelector("[data-touch-ready]").textContent = helpChoice ? "Touch writing is ready." : "Choose writing help to unlock the touch area."; });
  practice.querySelector("[data-touch-previous]").addEventListener("click", () => showPage(Math.max(0, currentPageIndex - 1)));
  practice.querySelector("[data-touch-next]").addEventListener("click", () => showPage(Math.min(pages.length - 1, currentPageIndex + 1)));
  practice.querySelector("[data-touch-add-page]").addEventListener("click", addPage);
  practice.querySelector("[data-touch-clear]").addEventListener("click", () => { const page = pages[currentPageIndex]; page.strokes = []; page.inkLength = 0; page.minX = Infinity; page.maxX = -Infinity; renderPage(page); });
  practice.querySelector("[data-touch-finish]").addEventListener("click", () => {
    const totalInk = pages.reduce((sum, page) => sum + page.inkLength, 0); const writtenWidth = pages.reduce((sum, page) => sum + Math.max(0, page.maxX - page.minX), 0);
    const difficultToRead = totalInk < Math.max(180, text.length * 24) || writtenWidth < Math.min(280, text.length * 20);
    const result = practice.querySelector("[data-touch-result]");
    result.hidden = false; result.innerHTML = `<h3>Your writing</h3><div class="platform-cursive-touch-submission">${pages.map((page, index) => `<figure><img src="${page.canvas.toDataURL("image/png")}" alt="Touch writing page ${index + 1}"><figcaption>Page ${index + 1}</figcaption></figure>`).join("")}</div>${difficultToRead ? `<aside class="platform-cursive-touch-bob"><strong>Bob's suggestion</strong><p>Some of this writing is difficult to read. Rewatch how the model is written, trace the typed cursive once, and then try writing it again.</p><button type="button" data-touch-rewatch>Rewatch model writing</button><button type="button" data-touch-trace>Trace the typed writing</button></aside>` : `<p class="platform-cursive-touch-success">Your touch writing is saved below the cursive model.</p>`}`;
    practice.querySelector("[data-touch-rewatch]")?.addEventListener("click", () => { const model = practice.querySelector("[data-touch-model]"); model.classList.remove("is-replaying"); window.requestAnimationFrame(() => model.classList.add("is-replaying")); });
    practice.querySelector("[data-touch-trace]")?.addEventListener("click", () => { traceMode = true; addPage(); result.hidden = true; });
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  practice.querySelector("[data-touch-close]").addEventListener("click", () => practice.remove());
  practice.focus();
}

function openWhiteboardTextEntry(point, canvas) {
  const surface = canvas.parentElement;
  if (!surface) return;
  surface.querySelector("[data-whiteboard-text-entry]")?.remove();
  const entry = document.createElement("textarea");
  entry.className = "platform-whiteboard-text-entry";
  entry.dataset.whiteboardTextEntry = "true";
  entry.maxLength = 120;
  entry.placeholder = "Type here";
  entry.setAttribute("aria-label", "Type whiteboard text at this location");
  const scaleX = canvas.clientWidth / canvas.width;
  const scaleY = canvas.clientHeight / canvas.height;
  entry.style.left = `${Math.max(4, Math.min(canvas.clientWidth - 230, point.x * scaleX))}px`;
  entry.style.top = `${Math.max(4, Math.min(canvas.clientHeight - 55, point.y * scaleY))}px`;
  let finished = false;
  let returnReminderTimer = null;
  const scheduleReturnReminder = () => {
    window.clearTimeout(returnReminderTimer);
    surface.querySelector("[data-whiteboard-return-reminder]")?.remove();
    returnReminderTimer = window.setTimeout(() => {
      if (!entry.isConnected || !entry.value.trim()) return;
      const reminder = document.createElement("p");
      reminder.className = "platform-whiteboard-return-reminder"; reminder.dataset.whiteboardReturnReminder = "true"; reminder.setAttribute("role", "alert");
      reminder.textContent = "Press Return to complete this line of text.";
      reminder.style.left = entry.style.left; reminder.style.top = `${entry.offsetTop + entry.offsetHeight + 6}px`;
      surface.append(reminder);
    }, 10000);
  };
  const close = () => { if (finished) return; finished = true; window.clearTimeout(returnReminderTimer); surface.querySelector("[data-whiteboard-return-reminder]")?.remove(); surface.querySelector("[data-whiteboard-cursive-coach-preview]")?.remove(); surface.querySelector("[data-whiteboard-live-cursive]")?.remove(); entry.remove(); canvas.focus({ preventScroll: true }); };
  const commit = () => {
    if (finished) return;
    const value = entry.value.trim().slice(0, 120);
    if (!value) { close(); setWhiteboardStatus("Text placement canceled."); return; }
    pushWhiteboardHistory();
    const size = Math.max(22, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 5);
    const object = createWhiteboardObject("text", { text: value, x: point.x, y: point.y, width: Math.min(canvas.width - point.x, Math.max(180, value.length * size * 0.55)), height: size * 1.3, fontSize: size, fontFamily: document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial", color: document.querySelector("[data-whiteboard-text-color]")?.value ?? document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d", background: document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent", cursiveGuide: document.querySelector("[data-whiteboard-cursive-lines]")?.value ?? "none", bold: document.querySelector('[data-text-command="bold"]')?.getAttribute("aria-pressed") === "true", italic: document.querySelector('[data-text-command="italic"]')?.getAttribute("aria-pressed") === "true", underline: document.querySelector('[data-text-command="underline"]')?.getAttribute("aria-pressed") === "true", rotation: 0 });
    const shouldModelCursive = object.fontFamily === "School Cursive" && document.querySelector("[data-whiteboard-cursive-coach]")?.value !== "off";
    const touchPractice = object.fontFamily === "School Cursive" && document.querySelector("[data-whiteboard-touch-practice]")?.checked;
    whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; close(); renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls(); setWhiteboardStatus(shouldModelCursive || touchPractice ? "Text added. Watch each cursive stroke and letter connection." : "Text added at the selected spot. Drag it to reposition it.");
    if (touchPractice) window.requestAnimationFrame(() => showWhiteboardCursiveModel(value, object, canvas, () => openCursiveTouchPractice(value)));
    else if (shouldModelCursive) window.requestAnimationFrame(() => showWhiteboardCursiveModel(value, object, canvas));
  };
  entry.addEventListener("blur", (event) => {
    if (entry.value.trim()) { commit(); return; }
    if (event.relatedTarget?.closest?.(".platform-whiteboard-quick-actions")) return;
    window.requestAnimationFrame(() => { if (entry.isConnected) entry.focus({ preventScroll: true }); });
  });
  entry.addEventListener("input", () => { refreshPendingWhiteboardTextEntryStyle(); updateWhiteboardCursiveCoach(); scheduleReturnReminder(); });
  entry.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); setWhiteboardStatus("Text placement canceled."); }
    else if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); commit(); }
  });
  surface.append(entry);
  refreshPendingWhiteboardTextEntryStyle();
  scheduleReturnReminder();
  window.requestAnimationFrame(() => { if (entry.isConnected) entry.focus({ preventScroll: true }); });
  setWhiteboardStatus("Type directly on the board. Press Enter or click elsewhere to finish; Escape cancels.");
}

function cancelPendingWhiteboardTextEntry() {
  document.querySelector("[data-whiteboard-cursive-coach-preview]")?.remove();
  document.querySelector("[data-whiteboard-live-cursive]")?.remove();
  document.querySelector("[data-whiteboard-text-entry]")?.remove();
}

function whiteboardRichTextRuns(html, fallbackText, fallbackSize = 36, fallbackColor = "#12384d", fallbackFont = "Arial") {
  if (!html) return [{ text: fallbackText ?? "", bold: true, italic: false, underline: false, size: fallbackSize, color: fallbackColor, fontFamily: fallbackFont }];
  const template = document.createElement("template");
  template.innerHTML = html;
  const runs = [];
  const visit = (node, style) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) { runs.push({ ...style, text: node.textContent }); return; }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase(), next = { ...style };
    if (["b", "strong"].includes(tag)) next.bold = true;
    if (["i", "em"].includes(tag)) next.italic = true;
    if (tag === "u") next.underline = true;
    if (node.getAttribute("color")) next.color = node.getAttribute("color");
    if (node.style?.color) next.color = node.style.color;
    if (node.getAttribute("face")) next.fontFamily = node.getAttribute("face");
    if (node.style?.fontFamily) next.fontFamily = node.style.fontFamily.replace(/["']/g, "");
    const size = Number(node.dataset?.textSize || node.style?.fontSize?.replace("px", "")); if (size) next.size = size;
    node.childNodes.forEach((child) => visit(child, next));
  };
  template.content.childNodes.forEach((node) => visit(node, { bold: false, italic: false, underline: false, size: fallbackSize, color: fallbackColor, fontFamily: fallbackFont }));
  return runs.length ? runs : [{ text: fallbackText ?? "", bold: true, italic: false, underline: false, size: fallbackSize, color: fallbackColor, fontFamily: fallbackFont }];
}

function openWhiteboardRichTextEditor(object, canvas) {
  const surface = canvas.parentElement; if (!surface || object?.type !== "text" || object.emojiStamp) return;
  surface.querySelector("[data-whiteboard-rich-editor]")?.remove();
  const editor = document.createElement("section"); editor.className = "platform-whiteboard-rich-editor"; editor.dataset.whiteboardRichEditor = "true";
  editor.style.left = `${Math.max(4, object.x * canvas.clientWidth / canvas.width)}px`; editor.style.top = `${Math.max(4, object.y * canvas.clientHeight / canvas.height)}px`;
  editor.innerHTML = `<div class="platform-whiteboard-rich-toolbar"><button type="button" data-rich-command="bold" title="Bold (Ctrl+B)"><b>B</b></button><button type="button" data-rich-command="italic" title="Italic (Ctrl+I)"><i>I</i></button><button type="button" data-rich-command="underline" title="Underline (Ctrl+U)"><u>U</u></button><label>Font <select data-rich-font>${["Arial","Verdana","Courier New","Comic Sans MS","School Cursive"].map((font) => `<option value="${font}"${font === (object.fontFamily ?? "Arial") ? " selected" : ""}>${font}</option>`).join("")}</select></label><label>Font color <input type="color" data-rich-color value="${escapeHtml(object.color ?? "#12384d")}"></label><label>Size <select data-rich-size>${[18,24,30,36,48,60,72].map((size) => `<option value="${size}"${size === Math.round((object.fontSize ?? 36) * (object.textScale ?? 1)) ? " selected" : ""}>${size}</option>`).join("")}</select></label><button type="button" data-rich-done>Done</button></div><div class="platform-whiteboard-rich-content" contenteditable="true" role="textbox" aria-label="Edit and format whiteboard text"></div>`;
  const content = editor.querySelector("[contenteditable]"); content.innerHTML = object.richHtml || escapeHtml(object.text);
  editor.querySelectorAll("[data-rich-command]").forEach((button) => button.addEventListener("mousedown", (event) => { event.preventDefault(); document.execCommand(button.dataset.richCommand); content.focus(); }));
  editor.querySelector("[data-rich-color]").addEventListener("input", (event) => { content.focus(); document.execCommand("foreColor", false, event.target.value); });
  editor.querySelector("[data-rich-font]").addEventListener("change", (event) => { content.focus(); document.execCommand("fontName", false, event.target.value); });
  editor.querySelector("[data-rich-size]").addEventListener("change", (event) => { content.focus(); document.execCommand("fontSize", false, "7"); content.querySelectorAll('font[size="7"]').forEach((node) => { node.removeAttribute("size"); node.dataset.textSize = event.target.value; node.style.fontSize = `${event.target.value}px`; }); });
  const save = () => { object.richHtml = content.innerHTML; object.text = content.textContent.trim().slice(0, 120); object.fontSize = Number(editor.querySelector("[data-rich-size]").value); object.fontFamily = editor.querySelector("[data-rich-font]").value; object.color = editor.querySelector("[data-rich-color]").value; object.textScale = 1; object.height = Math.max(object.height, object.fontSize * 1.4); pushWhiteboardHistory(); editor.remove(); renderWhiteboardObjects(canvas); saveWhiteboard(canvas); setWhiteboardStatus("Formatted text saved."); canvas.focus(); };
  editor.querySelector("[data-rich-done]").addEventListener("click", save); surface.append(editor); content.focus();
}

function drawWhiteboardGrid(context, canvas) {
  if (whiteboardGridUnit === "plain") return;
  const minor = whiteboardGridUnit === "inch" ? 24 : whiteboardGridUnit === "cm" ? 37.8 : 3.78;
  const majorEvery = whiteboardGridUnit === "inch" ? 4 : whiteboardGridUnit === "cm" ? 1 : 10;
  for (let index = 0, x = 0; x <= canvas.width; index += 1, x += minor) {
    context.beginPath(); context.strokeStyle = index % majorEvery === 0 ? "#83aec0" : "#d5e8ef"; context.lineWidth = index % majorEvery === 0 ? 1.4 : 0.55; context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke();
  }
  for (let index = 0, y = 0; y <= canvas.height; index += 1, y += minor) {
    context.beginPath(); context.strokeStyle = index % majorEvery === 0 ? "#83aec0" : "#d5e8ef"; context.lineWidth = index % majorEvery === 0 ? 1.4 : 0.55; context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke();
  }
}

function drawWhiteboardTitleBar(context, canvas) {
  if (whiteboardGridUnit === "plain") return;
  const unitLabel = whiteboardGridUnit === "inch" ? "English · inches" : whiteboardGridUnit === "cm" ? "Metric · centimeters" : "Metric · millimeters";
  const scaleLabel = whiteboardGridUnit === "inch" ? "Major: 1 in · Minor: 1/4 in" : whiteboardGridUnit === "cm" ? "Major grid: 1 cm" : "Major: 1 cm · Minor: 1 mm";
  const width = Math.min(410, canvas.width * 0.44), height = 102, x = canvas.width - width - 12, y = canvas.height - height - 12;
  context.save(); context.globalAlpha = 0.96; context.fillStyle = "#ffffff"; context.strokeStyle = "#12384d"; context.lineWidth = 2; context.fillRect(x, y, width, height); context.strokeRect(x, y, width, height);
  context.beginPath(); context.moveTo(x, y + 48); context.lineTo(x + width, y + 48); context.moveTo(x + width * 0.62, y + 48); context.lineTo(x + width * 0.62, y + height); context.stroke();
  context.fillStyle = "#12384d"; context.font = "800 19px sans-serif"; context.fillText(whiteboardDrawingTitle || "Workshop Drawing", x + 10, y + 30, width - 20);
  context.font = "700 12px sans-serif"; context.fillText(unitLabel, x + 10, y + 69, width * 0.58); context.fillText(scaleLabel, x + 10, y + 89, width * 0.58); context.fillText("DATE", x + width * 0.65, y + 65); context.font = "600 13px sans-serif"; context.fillText(new Date().toLocaleDateString(), x + width * 0.65, y + 87); context.restore();
}

function drawWhiteboardRuler(context, canvas) {
  if (whiteboardRulerUnit === "none") return;
  const metric = whiteboardRulerUnit === "metric";
  const unit = whiteboardPixelsPerUnit(metric ? "cm" : "in");
  const subdivisions = metric ? 10 : 8;
  const width = Math.max(150, whiteboardRuler.length);
  const tickSpacing = unit / subdivisions, totalTicks = Math.floor(width / tickSpacing);
  const height = 62;
  context.save(); context.translate(whiteboardRuler.x, whiteboardRuler.y); context.rotate(whiteboardRuler.angle); context.globalAlpha = 0.94; context.fillStyle = "#fff1a8"; context.strokeStyle = "#6b5312"; context.lineWidth = 2; context.fillRect(0, 0, width, height); context.strokeRect(0, 0, width, height); context.fillStyle = "#3e320d"; context.font = "700 13px sans-serif";
  for (let tickIndex = 0; tickIndex <= totalTicks; tickIndex += 1) {
    const tickX = tickIndex * tickSpacing, tick = tickIndex % subdivisions;
    const length = tick === 0 ? 28 : tick % (subdivisions / 2) === 0 ? 20 : tick % (subdivisions / 4) === 0 ? 15 : 10;
    if (tick === 0) context.fillText(String(tickIndex / subdivisions), tickX + 3, 43);
    context.beginPath(); context.moveTo(tickX, 0); context.lineTo(tickX, length); context.stroke();
    if (whiteboardRuler.sides === "both") { context.beginPath(); context.moveTo(tickX, height); context.lineTo(tickX, height - length); context.stroke(); }
  }
  context.beginPath(); context.moveTo(width, 0); context.lineTo(width, 12); if (whiteboardRuler.sides === "both") { context.moveTo(width, height); context.lineTo(width, height - 12); } context.stroke();
  context.fillText(metric ? "cm" : "in", width - 25, 43);
  if (document.querySelector("[data-whiteboard-tool]")?.value === "ruler-adjust") { context.fillStyle = "#087ba0"; context.fillRect(width - 7, height / 2 - 7, 14, 14); context.beginPath(); context.arc(width, -24, 8, 0, Math.PI * 2); context.fill(); context.strokeStyle = "#087ba0"; context.beginPath(); context.moveTo(width, 0); context.lineTo(width, -16); context.stroke(); }
  context.restore();
}

function whiteboardTextBackground(value) {
  return ({ white: "#ffffff", black: "#111820", "highlight-yellow": "rgba(255, 226, 88, 0.62)", "highlight-green": "rgba(116, 219, 148, 0.58)", "highlight-pink": "rgba(255, 145, 196, 0.58)", "highlight-blue": "rgba(105, 196, 235, 0.58)" })[value] ?? "";
}

function drawWhiteboardCursiveGuides(context, object) {
  if (object.fontFamily !== "School Cursive" || !["wide", "practice"].includes(object.cursiveGuide)) return;
  const left = -object.width / 2 - 6, right = object.width / 2 + 6, top = -object.height / 2, bottom = object.height / 2;
  context.save(); context.lineWidth = 1.5; context.strokeStyle = "rgba(64, 142, 190, 0.72)";
  if (object.cursiveGuide === "wide") {
    const spacing = Math.max(26, (object.fontSize ?? 36) * (object.textScale ?? 1) * 1.35);
    for (let y = bottom - 3; y >= top; y -= spacing) { context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke(); }
  } else {
    [top + 3, bottom - 3].forEach((y) => { context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke(); });
    context.setLineDash([7, 5]); context.strokeStyle = "rgba(207, 82, 82, 0.68)"; context.beginPath(); context.moveTo(left, 0); context.lineTo(right, 0); context.stroke();
  }
  context.restore();
}

function traceWhiteboardPath(context, points, offsetX = 0, offsetY = 0) {
  if (!points?.length) return;
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x + offsetX, point.y + offsetY) : context.moveTo(point.x + offsetX, point.y + offsetY));
  context.stroke();
}

function drawWhiteboardCalligraphyRibbon(context, object) {
  const points = object.points ?? [];
  if (!points.length) return;
  const nibSize = object.size ?? 10;
  const nibAngle = -Math.PI / 4;
  const nibX = Math.cos(nibAngle) * nibSize * 0.5;
  const nibY = Math.sin(nibAngle) * nibSize * 0.5;
  context.save();
  context.fillStyle = object.color ?? "#12384d";
  if (points.length === 1) {
    context.beginPath(); context.ellipse(points[0].x, points[0].y, nibSize * 0.52, Math.max(1.5, nibSize * 0.16), nibAngle, 0, Math.PI * 2); context.fill(); context.restore(); return;
  }
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x + nibX, point.y + nibY) : context.moveTo(point.x + nibX, point.y + nibY));
  [...points].reverse().forEach((point) => context.lineTo(point.x - nibX, point.y - nibY));
  context.closePath(); context.fill();
  context.restore();
}

function drawWhiteboardPath(context, object) {
  const points = object.points ?? [];
  if (object.strokeStyle === "eraser") {
    context.save(); context.globalCompositeOperation = "destination-out"; context.strokeStyle = "rgba(0,0,0,1)"; context.fillStyle = "rgba(0,0,0,1)"; context.globalAlpha = 1; context.lineWidth = object.size ?? 40; context.lineCap = "round"; context.lineJoin = "round";
    if (points.length === 1) { context.beginPath(); context.arc(points[0].x, points[0].y, context.lineWidth / 2, 0, Math.PI * 2); context.fill(); }
    else traceWhiteboardPath(context, points);
    context.restore(); return;
  }
  if (object.strokeStyle === "calligraphy") {
    drawWhiteboardCalligraphyRibbon(context, object);
    return;
  }
  if (object.strokeStyle === "brush") {
    context.save();
    context.lineCap = "round"; context.lineJoin = "round"; context.globalAlpha *= 0.5; context.lineWidth = Math.max(3, (object.size ?? 18) * 0.62);
    traceWhiteboardPath(context, points);
    const bristleOffsets = [-0.34, -0.18, 0, 0.19, 0.36];
    bristleOffsets.forEach((offset, index) => {
      context.globalAlpha = (object.opacity ?? 1) * (0.34 + index * 0.08);
      context.lineWidth = Math.max(1.25, (object.size ?? 18) * (index % 2 ? 0.09 : 0.055));
      traceWhiteboardPath(context, points, offset * (object.size ?? 18), Math.sin(index * 1.7) * (object.size ?? 18) * 0.13);
    });
    context.restore();
    return;
  }
  traceWhiteboardPath(context, points);
}

function whiteboardYouTubeId(value) {
  try {
    const url = new URL(String(value).trim());
    const host = url.hostname.replace(/^www\./, "");
    const candidate = host === "youtu.be" ? url.pathname.slice(1).split("/")[0] : host.endsWith("youtube.com") ? (url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/)?.[1]) : "";
    return /^[A-Za-z0-9_-]{6,15}$/.test(candidate ?? "") ? candidate : "";
  } catch { return ""; }
}

function addWhiteboardYouTubeVideo(videoId) {
  const canvas = whiteboardCanvas();
  if (!videoId || !canvas) return false;
  pushWhiteboardHistory();
  const width = Math.min(640, canvas.width * 0.7), height = width * 9 / 16;
  const object = createWhiteboardObject("youtube", { videoId, x: (canvas.width - width) / 2, y: Math.max(20, (canvas.height - height) / 2), width, height });
  whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls();
  setWhiteboardStatus("YouTube video added. Use its header to move it and the corner handle to resize it.");
  return true;
}

function syncWhiteboardYouTubeOverlays(canvas = whiteboardCanvas()) {
  const surface = canvas?.parentElement;
  if (!canvas || !surface) return;
  surface.querySelectorAll("[data-whiteboard-youtube-overlay]").forEach((overlay) => overlay.remove());
  const scaleX = canvas.clientWidth / canvas.width, scaleY = canvas.clientHeight / canvas.height;
  whiteboardObjects.filter((object) => object.type === "youtube" && object.videoId).forEach((object) => {
    const overlay = document.createElement("section"); overlay.className = "platform-whiteboard-youtube-overlay"; overlay.dataset.whiteboardYoutubeOverlay = object.id;
    const place = () => { overlay.style.left = `${object.x * scaleX}px`; overlay.style.top = `${object.y * scaleY}px`; overlay.style.width = `${object.width * scaleX}px`; overlay.style.height = `${object.height * scaleY}px`; };
    overlay.innerHTML = `<header data-youtube-drag><strong>YouTube Video</strong><span>Drag to move</span></header><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(object.videoId)}" title="YouTube video on the whiteboard" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><button type="button" data-youtube-resize aria-label="Resize YouTube video"></button>`;
    place(); surface.append(overlay);
    const begin = (event, mode) => { event.preventDefault(); const start = { x: event.clientX, y: event.clientY, objectX: object.x, objectY: object.y, width: object.width, height: object.height }; event.currentTarget.setPointerCapture(event.pointerId); whiteboardSelectedObjectId = object.id;
      const move = (moveEvent) => { const dx = (moveEvent.clientX - start.x) / scaleX, dy = (moveEvent.clientY - start.y) / scaleY; if (mode === "move") { object.x = Math.max(0, start.objectX + dx); object.y = Math.max(0, start.objectY + dy); } else { object.width = Math.max(240, start.width + dx); object.height = Math.max(170, start.height + dy); } place(); };
      const end = () => { event.currentTarget.removeEventListener("pointermove", move); event.currentTarget.removeEventListener("pointerup", end); saveWhiteboard(canvas); renderWhiteboardObjects(canvas); };
      event.currentTarget.addEventListener("pointermove", move); event.currentTarget.addEventListener("pointerup", end);
    };
    overlay.querySelector("[data-youtube-drag]").addEventListener("pointerdown", (event) => begin(event, "move"));
    overlay.querySelector("[data-youtube-resize]").addEventListener("pointerdown", (event) => begin(event, "resize"));
  });
}

function traceWhiteboardPolygon(context, object, sides, innerRatio = 1) {
  const centerX = object.x + object.width / 2, centerY = object.y + object.height / 2;
  const points = innerRatio < 1 ? sides * 2 : sides;
  for (let index = 0; index < points; index += 1) {
    const radiusScale = innerRatio < 1 && index % 2 ? innerRatio : 1;
    const angle = -Math.PI / 2 + index * Math.PI * 2 / points;
    const x = centerX + Math.cos(angle) * object.width / 2 * radiusScale;
    const y = centerY + Math.sin(angle) * object.height / 2 * radiusScale;
    if (index) context.lineTo(x, y); else context.moveTo(x, y);
  }
  context.closePath();
}

function drawWhiteboard3DShape(context, object) {
  const bounds = objectBounds(object), x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;
  const depth = Math.min(Math.min(width, height) * 0.45, Math.max(10, object.depth ?? Math.min(width, height) * 0.22));
  context.beginPath();
  if (["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism"].includes(object.type)) {
    context.rect(x, y + depth, width - depth, height - depth);
    context.moveTo(x, y + depth); context.lineTo(x + depth, y); context.lineTo(x + width, y); context.lineTo(x + width - depth, y + depth);
    context.moveTo(x + width, y); context.lineTo(x + width, y + height - depth); context.lineTo(x + width - depth, y + height);
  } else if (object.type === "cylinder") {
    context.ellipse(x + width / 2, y + depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2);
    context.moveTo(x, y + depth / 2); context.lineTo(x, y + height - depth / 2);
    context.moveTo(x + width, y + depth / 2); context.lineTo(x + width, y + height - depth / 2);
    context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2);
  } else if (object.type === "cone") {
    context.moveTo(x + width / 2, y); context.lineTo(x, y + height - depth / 2);
    context.moveTo(x + width / 2, y); context.lineTo(x + width, y + height - depth / 2);
    context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2);
  } else if (object.type === "pyramid") {
    context.moveTo(x + width / 2, y); context.lineTo(x, y + height - depth); context.lineTo(x + width / 2, y + height); context.lineTo(x + width, y + height - depth); context.closePath();
    context.moveTo(x + width / 2, y); context.lineTo(x + width / 2, y + height);
  } else if (object.type === "sphere" || object.type === "hemisphere") {
    context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    context.moveTo(x, y + height / 2); context.bezierCurveTo(x + width * 0.2, y + height * 0.35, x + width * 0.8, y + height * 0.35, x + width, y + height / 2);
    if (object.type === "sphere") { context.moveTo(x + width / 2, y); context.bezierCurveTo(x + width * 0.35, y + height * 0.2, x + width * 0.35, y + height * 0.8, x + width / 2, y + height); }
  }
  context.stroke();
  const faceColors = { front: object.faceColors?.front ?? object.color ?? "#12384d", side: object.faceColors?.side ?? object.color ?? "#287da0", top: object.faceColors?.top ?? object.color ?? "#6aa9bf" };
  const strokeFace = (face, trace, fillTrace = trace) => { const color = faceColors[face]; context.save(); if (object.faceColors?.[face]) { context.save(); context.globalAlpha = 0.2; context.fillStyle = color; context.beginPath(); fillTrace(); context.fill(); context.restore(); } context.strokeStyle = color; context.beginPath(); trace(); context.stroke(); context.restore(); };
  if (["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism"].includes(object.type)) {
    strokeFace("front", () => context.rect(x, y + depth, width - depth, height - depth));
    strokeFace("top", () => { context.moveTo(x, y + depth); context.lineTo(x + depth, y); context.lineTo(x + width, y); context.lineTo(x + width - depth, y + depth); context.closePath(); });
    strokeFace("side", () => { context.moveTo(x + width - depth, y + depth); context.lineTo(x + width, y); context.lineTo(x + width, y + height - depth); context.lineTo(x + width - depth, y + height); context.closePath(); });
    if (object.type === "triangular-prism") strokeFace("front", () => { context.moveTo(x, y + height - depth); context.lineTo(x + (width - depth) / 2, y + depth); context.lineTo(x + width - depth, y + height - depth); context.closePath(); });
    if (object.type === "hexagonal-prism") strokeFace("front", () => { context.moveTo(x, y + height / 2); context.lineTo(x + depth, y + depth); context.lineTo(x + width - depth, y + depth); context.lineTo(x + width, y + height / 2); context.closePath(); });
  } else if (object.type === "cylinder") {
    strokeFace("top", () => context.ellipse(x + width / 2, y + depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2));
    strokeFace("side", () => { context.moveTo(x, y + depth / 2); context.lineTo(x, y + height - depth / 2); context.moveTo(x + width, y + depth / 2); context.lineTo(x + width, y + height - depth / 2); }, () => { context.moveTo(x, y + depth / 2); context.lineTo(x, y + height - depth / 2); context.lineTo(x + width, y + height - depth / 2); context.lineTo(x + width, y + depth / 2); context.closePath(); });
    strokeFace("front", () => context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2));
  } else if (object.type === "pyramid") {
    strokeFace("front", () => { context.moveTo(x + width / 2, y); context.lineTo(x, y + height - depth); context.lineTo(x + width / 2, y + height); context.closePath(); });
    strokeFace("side", () => { context.moveTo(x + width / 2, y); context.lineTo(x + width / 2, y + height); context.lineTo(x + width, y + height - depth); context.closePath(); });
    strokeFace("top", () => { context.moveTo(x, y + height - depth); context.lineTo(x + width / 2, y + height); context.lineTo(x + width, y + height - depth); context.closePath(); });
  } else if (object.type === "cone") {
    strokeFace("side", () => { context.moveTo(x + width / 2, y); context.lineTo(x, y + height - depth / 2); context.moveTo(x + width / 2, y); context.lineTo(x + width, y + height - depth / 2); }, () => { context.moveTo(x + width / 2, y); context.lineTo(x, y + height - depth / 2); context.lineTo(x + width, y + height - depth / 2); context.closePath(); });
    strokeFace("front", () => context.ellipse(x + width / 2, y + height - depth / 2, width / 2, depth / 2, 0, 0, Math.PI * 2));
  } else if (["sphere", "hemisphere"].includes(object.type)) {
    strokeFace("front", () => context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2));
    strokeFace("side", () => { context.moveTo(x + width / 2, y); context.bezierCurveTo(x + width * 0.35, y + height * 0.2, x + width * 0.35, y + height * 0.8, x + width / 2, y + height); });
    strokeFace("top", () => { context.moveTo(x, y + height / 2); context.bezierCurveTo(x + width * 0.2, y + height * 0.35, x + width * 0.8, y + height * 0.35, x + width, y + height / 2); });
  }
  if (object.shapeLabel) {
    const name = ({ "rectangular-prism": "Rectangular Prism", "triangular-prism": "Triangular Prism", "hexagonal-prism": "Hexagonal Prism", cylinder: "Cylinder", pyramid: "Pyramid", hemisphere: "Hemisphere" })[object.type] ?? "3D Shape";
    context.save();
    context.font = "800 18px sans-serif";
    const labelWidth = context.measureText(name).width + 20;
    const labelX = x + width / 2 - labelWidth / 2, labelY = y + height + 8;
    context.fillStyle = "rgba(255,255,255,0.94)"; context.strokeStyle = "#12384d"; context.lineWidth = 1.5;
    context.fillRect(labelX, labelY, labelWidth, 30); context.strokeRect(labelX, labelY, labelWidth, 30);
    context.fillStyle = "#12384d"; context.fillText(name, labelX + 10, labelY + 21);
    context.restore();
  }
}

function whiteboardPixelsPerUnit(unit) {
  return ({ mm: 3.78, cm: 37.8, m: 3780, in: 96, ft: 1152, yd: 3456 })[unit] ?? 37.8;
}

function whiteboardDimensionValue(object, unit = object.unit) {
  return Math.hypot(object.width, object.height) / whiteboardPixelsPerUnit(unit);
}

function suggestedWhiteboardDimensionLabel(start, end) {
  const dx = Math.abs(end.x - start.x), dy = Math.abs(end.y - start.y);
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (selected && ["ellipse", "cylinder", "sphere"].includes(selected.type)) {
    const bounds = objectBounds(selected), center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const startAtCenter = Math.hypot(start.x - center.x, start.y - center.y) <= Math.min(bounds.width, bounds.height) * 0.18;
    const endAtCenter = Math.hypot(end.x - center.x, end.y - center.y) <= Math.min(bounds.width, bounds.height) * 0.18;
    if (startAtCenter || endAtCenter) return { label: "Radius", tip: "A radius goes from the center of a round shape to its outside edge." };
    return { label: "Diameter", tip: "A diameter crosses a round shape from one outside edge to the opposite outside edge." };
  }
  if (dy > dx * 1.35) return { label: "Height", tip: "Look at the direction of the laser. A mostly vertical measurement usually describes height." };
  if (dx > dy * 1.35) return { label: "Length", tip: "Look at the direction of the laser. A mostly horizontal measurement usually describes length." };
  return { label: "Length", tip: "The laser follows the longest direction between the two selected points, so length is the clearest general label." };
}

function drawWhiteboardDimension(context, object) {
  const x2 = object.x + object.width, y2 = object.y + object.height, angle = Math.atan2(object.height, object.width);
  const annotationOffset = Number(object.annotationOffset ?? 18);
  const normalX = -Math.sin(angle) * annotationOffset, normalY = Math.cos(angle) * annotationOffset;
  context.save(); context.strokeStyle = object.color ?? "#b52222"; context.fillStyle = object.color ?? "#b52222"; context.lineWidth = object.size ?? 3;
  context.beginPath(); context.moveTo(object.x, object.y); context.lineTo(object.x + normalX, object.y + normalY); context.moveTo(x2, y2); context.lineTo(x2 + normalX, y2 + normalY); context.moveTo(object.x + normalX, object.y + normalY); context.lineTo(x2 + normalX, y2 + normalY); context.stroke();
  const arrow = (x, y, direction) => { context.beginPath(); context.moveTo(x, y); context.lineTo(x + 12 * Math.cos(direction + 0.5), y + 12 * Math.sin(direction + 0.5)); context.lineTo(x + 12 * Math.cos(direction - 0.5), y + 12 * Math.sin(direction - 0.5)); context.closePath(); context.fill(); };
  arrow(object.x + normalX, object.y + normalY, angle); arrow(x2 + normalX, y2 + normalY, angle + Math.PI);
  const value = whiteboardDimensionValue(object); const digits = object.unit === "mm" ? 0 : 2; const text = `${object.label || "Length"}: ${value.toFixed(digits)} ${object.unit}`;
  const compareUnit = object.compareUnit ?? (object.unit === "mm" ? "cm" : "mm"); const compareValue = whiteboardDimensionValue(object, compareUnit); const compareDigits = compareUnit === "mm" ? 0 : compareUnit === "m" ? 3 : 2; const comparison = `This is the same as ${compareValue.toFixed(compareDigits)} ${compareUnit}`;
  context.font = "700 18px sans-serif"; const textWidth = Math.max(context.measureText(text).width, context.measureText(comparison).width); const midX = (object.x + x2) / 2 + normalX, midY = (object.y + y2) / 2 + normalY; context.translate(midX, midY); context.rotate(angle); context.fillStyle = "rgba(255,255,255,0.94)"; context.fillRect(-textWidth / 2 - 7, -25, textWidth + 14, 49); context.fillStyle = object.color ?? "#b52222"; context.fillText(text, -textWidth / 2, -6); context.font = "600 15px sans-serif"; context.fillText(comparison, -textWidth / 2, 15);
  const drawUnitKey = (unit, y, color) => { const keyLength = whiteboardPixelsPerUnit(unit); context.save(); context.strokeStyle = color; context.fillStyle = color; context.lineWidth = 2; context.beginPath(); context.moveTo(-keyLength / 2, y); context.lineTo(keyLength / 2, y); context.moveTo(-keyLength / 2, y - 6); context.lineTo(-keyLength / 2, y + 6); context.moveTo(keyLength / 2, y - 6); context.lineTo(keyLength / 2, y + 6); context.stroke(); context.font = "700 13px sans-serif"; const keyText = `1 ${unit}`; const keyTextWidth = context.measureText(keyText).width; context.fillStyle = "rgba(255,255,255,0.94)"; context.fillRect(-keyTextWidth / 2 - 4, y + 5, keyTextWidth + 8, 18); context.fillStyle = color; context.fillText(keyText, -keyTextWidth / 2, y + 18); context.restore(); };
  drawUnitKey(object.unit, 39, object.color ?? "#b52222"); drawUnitKey(compareUnit, 71, "#1769aa"); context.restore();
}

function drawWhiteboardLaserPreview(context) {
  const start = whiteboardPendingDimension?.start;
  const end = whiteboardPendingDimension?.end ?? whiteboardPendingDimension?.current;
  if (!start) return;
  context.save();
  if (end) {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = "rgba(255, 76, 76, 0.48)";
    context.lineWidth = 8;
    context.shadowColor = "#ff1f1f";
    context.shadowBlur = 18;
    context.stroke();
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = "rgba(255, 238, 238, 0.96)";
    context.lineWidth = 2;
    context.shadowBlur = 7;
    context.stroke();
  }
  const glow = context.createRadialGradient(start.x, start.y, 1, start.x, start.y, 22);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.18, "rgba(255,48,48,1)");
  glow.addColorStop(0.52, "rgba(255,31,31,0.5)");
  glow.addColorStop(1, "rgba(255,31,31,0)");
  context.fillStyle = glow;
  context.shadowColor = "#ff1f1f";
  context.shadowBlur = 14;
  context.beginPath();
  context.arc(start.x, start.y, 22, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(start.x, start.y, 3, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function whiteboardPointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index], b = polygon[previous];
    const crosses = (a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 0.0001) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function updateWhiteboardLassoBounds() {
  if (whiteboardLassoPoints.length < 3) { whiteboardLassoBounds = null; return; }
  const xs = whiteboardLassoPoints.map((point) => point.x), ys = whiteboardLassoPoints.map((point) => point.y);
  whiteboardLassoBounds = { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(1, Math.max(...xs) - Math.min(...xs)), height: Math.max(1, Math.max(...ys) - Math.min(...ys)) };
}

function whiteboardLassoObjectIds() {
  return whiteboardObjects.filter((object) => { const bounds = objectBounds(object); return bounds && whiteboardPointInPolygon({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }, whiteboardLassoPoints); }).map((object) => object.id);
}

function whiteboardLassoIntersectingObjectIds() {
  if (!whiteboardLassoBounds) return [];
  const area = whiteboardLassoBounds;
  return whiteboardObjects.filter((object) => { const bounds = objectBounds(object); return bounds && bounds.x < area.x + area.width && bounds.x + bounds.width > area.x && bounds.y < area.y + area.height && bounds.y + bounds.height > area.y; }).map((object) => object.id);
}

function clearWhiteboardLassoChoice() {
  whiteboardLassoPoints = []; whiteboardLassoBounds = null; whiteboardSelectionDownload = "";
  const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]"); if (dialog) dialog.hidden = true;
  renderWhiteboardObjects();
}

function useWhiteboardLassoCutout() {
  const result = whiteboardSelectionCanvas();
  if (!result) return false;
  const selectedIds = new Set(whiteboardLassoIntersectingObjectIds()), source = result.canvas.toDataURL("image/png"), image = new Image();
  pushWhiteboardHistory(); whiteboardObjects = whiteboardObjects.filter((object) => !selectedIds.has(object.id));
  const cutout = createWhiteboardObject("image", { x: result.bounds.x, y: result.bounds.y, width: result.bounds.width, height: result.bounds.height, src: source, element: image, lassoCutout: true, rotation: 0 });
  whiteboardObjects.push(cutout); whiteboardSelectedObjectId = cutout.id; whiteboardSelectionDownload = source; whiteboardLassoPoints = []; whiteboardLassoBounds = null;
  image.addEventListener("load", () => { renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); }, { once: true }); image.src = source;
  const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]"); if (dialog) dialog.hidden = true;
  setWhiteboardStatus("Cutout created as a separate movable image."); return true;
}

function deleteWhiteboardLassoCutout() {
  if (!whiteboardLassoBounds || whiteboardLassoPoints.length < 3) return false;
  const object = whiteboardObjects.find((item) => item.type === "image" && item.element && whiteboardLassoIntersectingObjectIds().includes(item.id));
  if (!object) { clearWhiteboardLassoChoice(); setWhiteboardStatus("Place the lasso over an image before choosing Delete Cutout."); return false; }
  const width = object.element.naturalWidth || Math.max(1, Math.round(object.width)), height = object.element.naturalHeight || Math.max(1, Math.round(object.height));
  const source = document.createElement("canvas"); source.width = width; source.height = height;
  const context = source.getContext("2d"); context.drawImage(object.element, 0, 0, width, height); context.globalCompositeOperation = "destination-out"; context.beginPath();
  whiteboardLassoPoints.forEach((point, index) => { const x = (point.x - object.x) / object.width * width, y = (point.y - object.y) / object.height * height; if (index) context.lineTo(x, y); else context.moveTo(x, y); });
  context.closePath(); context.fill(); context.globalCompositeOperation = "source-over";
  const result = source.toDataURL("image/png"), image = new Image(); pushWhiteboardHistory(); object.src = result; object.element = image; object.backgroundRemoved = true;
  whiteboardLassoPoints = []; whiteboardLassoBounds = null; const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]"); if (dialog) dialog.hidden = true;
  image.addEventListener("load", () => { renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); }, { once: true }); image.src = result;
  setWhiteboardStatus("The area inside the lasso was deleted. Use Undo to restore it."); return true;
}

function fillWhiteboardLassoCutout(color) {
  if (!whiteboardLassoBounds || whiteboardLassoPoints.length < 3) return false;
  const intersectingIds = whiteboardLassoIntersectingObjectIds();
  const object = whiteboardObjects.find((item) => item.type === "image" && item.element && intersectingIds.includes(item.id));
  if (!object) { clearWhiteboardLassoChoice(); setWhiteboardStatus("Place the lasso over an image before replacing its cutout color."); return false; }
  const width = object.element.naturalWidth || Math.max(1, Math.round(object.width)), height = object.element.naturalHeight || Math.max(1, Math.round(object.height));
  const source = document.createElement("canvas"); source.width = width; source.height = height;
  const context = source.getContext("2d"); context.drawImage(object.element, 0, 0, width, height); context.fillStyle = color; context.beginPath();
  whiteboardLassoPoints.forEach((point, index) => { const x = (point.x - object.x) / object.width * width, y = (point.y - object.y) / object.height * height; if (index) context.lineTo(x, y); else context.moveTo(x, y); });
  context.closePath(); context.fill();
  const result = source.toDataURL("image/png"), image = new Image(); pushWhiteboardHistory(); object.src = result; object.element = image;
  whiteboardLassoPoints = []; whiteboardLassoBounds = null; const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]"); if (dialog) dialog.hidden = true;
  image.addEventListener("load", () => { renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); }, { once: true }); image.src = result;
  setWhiteboardStatus(`The cutout was replaced with the matched color ${color}. Use Undo to restore it.`); return true;
}

function whiteboardSelectionCanvas({ removeBackground = false } = {}) {
  const canvas = whiteboardCanvas();
  if (!canvas || !whiteboardLassoBounds || whiteboardLassoPoints.length < 3) return null;
  const bounds = { x: Math.max(0, Math.floor(whiteboardLassoBounds.x)), y: Math.max(0, Math.floor(whiteboardLassoBounds.y)), width: Math.max(1, Math.ceil(whiteboardLassoBounds.width)), height: Math.max(1, Math.ceil(whiteboardLassoBounds.height)) };
  const savedPoints = whiteboardLassoPoints; whiteboardLassoPoints = []; renderWhiteboardObjects(canvas);
  const selection = document.createElement("canvas"); selection.width = bounds.width; selection.height = bounds.height;
  const context = selection.getContext("2d"); context.save(); context.beginPath(); savedPoints.forEach((point, index) => index ? context.lineTo(point.x - bounds.x, point.y - bounds.y) : context.moveTo(point.x - bounds.x, point.y - bounds.y)); context.closePath(); context.clip(); context.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height); context.restore();
  whiteboardLassoPoints = savedPoints; renderWhiteboardObjects(canvas);
  if (removeBackground) {
    const pixels = context.getImageData(0, 0, selection.width, selection.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const red = pixels.data[index], green = pixels.data[index + 1], blue = pixels.data[index + 2];
      const light = (red + green + blue) / 3 > 218, neutral = Math.max(red, green, blue) - Math.min(red, green, blue) < 38;
      if (light && neutral) pixels.data[index + 3] = 0;
    }
    context.putImageData(pixels, 0, 0);
  }
  return { canvas: selection, bounds };
}

async function copySelectedWhiteboardObjectAsImage() {
  const canvas = whiteboardCanvas();
  const object = whiteboardObjects.find((item) => item.id === whiteboardSelectedObjectId);
  if (!canvas || !object) { setWhiteboardStatus("Right-click a whiteboard object before choosing Copy Image."); return; }
  const bounds = objectBounds(object), padding = object.type === "image" ? 0 : 12;
  const crop = { x: Math.max(0, Math.floor(bounds.x - padding)), y: Math.max(0, Math.floor(bounds.y - padding)), width: Math.max(1, Math.ceil(bounds.width + padding * 2)), height: Math.max(1, Math.ceil(bounds.height + padding * 2)) };
  const imageCanvas = document.createElement("canvas"); imageCanvas.width = crop.width; imageCanvas.height = crop.height;
  if (object.type === "image" && object.element) imageCanvas.getContext("2d").drawImage(object.element, 0, 0, crop.width, crop.height);
  else {
    const selectedId = whiteboardSelectedObjectId, savedLasso = whiteboardLassoPoints; whiteboardSelectedObjectId = ""; whiteboardLassoPoints = []; renderWhiteboardObjects(canvas);
    imageCanvas.getContext("2d").drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    whiteboardSelectedObjectId = selectedId; whiteboardLassoPoints = savedLasso; renderWhiteboardObjects(canvas);
  }
  whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((item) => item.id === object.id));
  try {
    const blob = await new Promise((resolve) => imageCanvas.toBlob(resolve, "image/png"));
    if (!blob || !navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("clipboard-image-unavailable");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setWhiteboardStatus("Image copied. Paste it into a document, message, or another supported app.");
  } catch {
    setWhiteboardStatus("The browser blocked image clipboard access. The object was copied for Ctrl+V inside this whiteboard.");
  }
}

function downloadWhiteboardImage(source, name = "whiteboard-image.png") {
  const link = document.createElement("a"); link.download = name; link.href = source; link.click();
}

const PIXEL_PALETTE = ["#000000", "#ffffff", "#12384d", "#287da0", "#55a875", "#f0a52b", "#c83b32", "#7449a8", "#f4d35e", "#ee8fb3", "#7bdff2", "#b2f7a5", "#8d6e63", "#9aa7ad", "#243b75", "#f7f3e8"];
const PIXEL_8_BIT_PALETTE = Array.from({ length: 256 }, (_, value) => { const r = Math.round(((value >> 5) & 7) * 255 / 7), g = Math.round(((value >> 2) & 7) * 255 / 7), b = Math.round((value & 3) * 255 / 3); return `#${[r,g,b].map((part) => part.toString(16).padStart(2,"0")).join("")}`; });
function freshPixelFrame(size = pixelStudio.size) { return Array(size * size).fill("#ffffff00"); }
function pixelColorDistance(a, b) { const rgb = (value) => value.match(/[\da-f]{2}/gi)?.map((part) => parseInt(part, 16)) ?? [0, 0, 0]; const aa = rgb(a), bb = rgb(b); return aa.reduce((sum, value, index) => sum + (value - bb[index]) ** 2, 0); }
function pixelPalette() { const count = pixelStudio.bits === 24 ? 16 : 2 ** pixelStudio.bits; if (!pixelStudio.palette.length) pixelStudio.palette = [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)]; return pixelStudio.palette.slice(0, count); }
function nearestPixelColor(color) { if (pixelStudio.bits === 24) return String(color).slice(0, 7).toLowerCase(); return pixelPalette().reduce((best, candidate) => pixelColorDistance(color, candidate) < pixelColorDistance(color, best) ? candidate : best, pixelPalette()[0]); }
function pixelColorLabel(index) { return pixelStudio.bits === 24 ? pixelPalette()[index].toUpperCase() : index.toString(2).padStart(pixelStudio.bits, "0"); }
function randomPixelPalette() { const count = pixelStudio.bits === 24 ? 16 : Math.min(16, 2 ** pixelStudio.bits), next = Array.from({ length: count }, (_, index) => { if (pixelStudio.bits === 1) return index ? "#ffffff" : "#000000"; const hue = Math.round((index * 360 / count + Math.random() * 28) % 360), saturation = 55 + Math.round(Math.random() * 35), lightness = 32 + Math.round(Math.random() * 45); const temporary = document.createElement("canvas").getContext("2d"); temporary.fillStyle = `hsl(${hue} ${saturation}% ${lightness}%)`; temporary.fillRect(0, 0, 1, 1); const [r,g,b] = temporary.getImageData(0,0,1,1).data; return `#${[r,g,b].map((value) => value.toString(16).padStart(2,"0")).join("")}`; }); pixelStudio.palette = [...next, ...pixelStudio.palette.slice(count)]; if (pixelStudio.bits !== 24) pixelStudio.frames = pixelStudio.frames.map((frame) => frame.map((color) => color.endsWith("00") ? color : nearestPixelColor(color))); pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; renderPixelStudio(); }
function pixelFrameCanvas(frame = pixelStudio.pixels, scale = 16) { const canvas = document.createElement("canvas"); canvas.width = pixelStudio.size * scale; canvas.height = pixelStudio.size * scale; const context = canvas.getContext("2d"); context.imageSmoothingEnabled = false; frame.forEach((color, index) => { if (color.endsWith("00")) return; context.fillStyle = color; context.fillRect(index % pixelStudio.size * scale, Math.floor(index / pixelStudio.size) * scale, scale, scale); }); return canvas; }
function saveCurrentPixelFrame() { pixelStudio.frames[pixelStudio.frameIndex] = [...pixelStudio.pixels]; }
function renderPixelStudio() {
  const canvas = document.querySelector("[data-pixel-canvas]"); if (!canvas) return;
  const context = canvas.getContext("2d"), cell = canvas.width / pixelStudio.size; context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
  pixelStudio.pixels.forEach((color, index) => { if (!color.endsWith("00")) { context.fillStyle = color; context.fillRect(index % pixelStudio.size * cell, Math.floor(index / pixelStudio.size) * cell, cell, cell); } });
  context.strokeStyle = "rgba(18,56,77,.22)"; context.lineWidth = 1; for (let line = 0; line <= pixelStudio.size; line += 1) { const point = Math.round(line * cell) + .5; context.beginPath(); context.moveTo(point, 0); context.lineTo(point, canvas.height); context.stroke(); context.beginPath(); context.moveTo(0, point); context.lineTo(canvas.width, point); context.stroke(); }
  const frames = document.querySelector("[data-pixel-frames]"); if (frames) frames.innerHTML = pixelStudio.frames.map((frame, index) => `<button type="button" data-action="pixel-select-frame" data-pixel-frame="${index}" aria-pressed="${index === pixelStudio.frameIndex}"><img src="${pixelFrameCanvas(frame, 4).toDataURL()}" alt="Frame ${index + 1}"><span>${index + 1}</span></button>`).join("");
  const palette = document.querySelector("[data-pixel-palette]"), visiblePalette = pixelPalette().slice(0, 16); if (palette) palette.innerHTML = visiblePalette.map((color, index) => `<label class="platform-pixel-palette-color"><button type="button" data-action="pixel-select-color" data-pixel-palette-index="${index}" style="--pixel-palette-color:${color}" aria-label="Select ${pixelColorLabel(index)}"></button><code>${pixelColorLabel(index)}</code><input type="color" data-pixel-palette-color="${index}" value="${color}" aria-label="Change ${pixelColorLabel(index)}"></label>`).join("");
  const paletteHelp = document.querySelector("[data-pixel-palette-help]"); if (paletteHelp) paletteHelp.textContent = pixelStudio.bits <= 4 ? `All ${2 ** pixelStudio.bits} colors available in ${pixelStudio.bits}-bit color are shown. Select one to draw or change its color box.` : pixelStudio.bits === 8 ? "The 8-bit canvas uses 256 colors for image detail. Its first 16 drawing colors are shown and editable here." : "Full Color preserves the many colors in a photograph. These 16 colors are convenient drawing shortcuts; the color picker can choose any color.";
  const preview = document.querySelector("[data-pixel-preview]"); if (preview) { const previewContext = preview.getContext("2d"); previewContext.imageSmoothingEnabled = false; previewContext.clearRect(0, 0, preview.width, preview.height); previewContext.drawImage(pixelFrameCanvas(pixelStudio.frames[pixelStudio.frameIndex] ?? pixelStudio.pixels, 4), 0, 0, preview.width, preview.height); }
}
function startPixelStudioPreview() { window.clearInterval(pixelStudioPreviewTimer); let index = 0; pixelStudioPreviewTimer = window.setInterval(() => { const preview = document.querySelector("[data-pixel-preview]"); if (!preview || document.querySelector("[data-pixel-studio]")?.hidden) return; const context = preview.getContext("2d"); context.imageSmoothingEnabled = false; context.clearRect(0, 0, preview.width, preview.height); context.drawImage(pixelFrameCanvas(pixelStudio.frames[index % pixelStudio.frames.length], 4), 0, 0, preview.width, preview.height); index += 1; }, Number(document.querySelector("[data-pixel-speed]")?.value ?? 400)); }
function openPixelStudio() { if (!pixelStudio.frames.length) { pixelStudio.pixels = freshPixelFrame(); pixelStudio.frames = [[...pixelStudio.pixels]]; pixelStudio.frameIndex = 0; } const dialog = document.querySelector("[data-pixel-studio]"); if (dialog) { dialog.hidden = false; const canvas = dialog.querySelector("[data-pixel-canvas]"), gifInput = dialog.querySelector("[data-pixel-gif]"); if (gifInput && !gifInput.dataset.pixelUploadBound) { gifInput.dataset.pixelUploadBound = "true"; gifInput.addEventListener("change", async (event) => { event.stopPropagation(); const input = event.currentTarget, file = input.files?.[0]; if (!file) return; const uploadLabel = input.closest("label"); setWhiteboardStatus(`Selected ${file.name}. Opening the GIF now…`); if (uploadLabel) uploadLabel.dataset.loading = "true"; input.disabled = true; try { await importPixelGif(file); } catch { setWhiteboardStatus("The selected GIF could not be opened. Try a smaller GIF or update Chrome on the Chromebook."); } finally { input.disabled = false; input.value = ""; if (uploadLabel) delete uploadLabel.dataset.loading; } }); } if (canvas && !canvas.dataset.pixelBound) { canvas.dataset.pixelBound = "true"; canvas.addEventListener("pointerdown", (event) => { event.preventDefault(); pixelStudio.drawing = true; canvas.setPointerCapture(event.pointerId); setPixelAtEvent(event); }); canvas.addEventListener("pointermove", (event) => { if (pixelStudio.drawing) setPixelAtEvent(event); }); const stop = () => { pixelStudio.drawing = false; }; canvas.addEventListener("pointerup", stop); canvas.addEventListener("pointercancel", stop); } renderPixelStudio(); startPixelStudioPreview(); canvas?.focus(); } }
function setPixelAtEvent(event) { const canvas = event.currentTarget, rect = canvas.getBoundingClientRect(), x = Math.floor((event.clientX - rect.left) / rect.width * pixelStudio.size), y = Math.floor((event.clientY - rect.top) / rect.height * pixelStudio.size); if (x < 0 || y < 0 || x >= pixelStudio.size || y >= pixelStudio.size) return; const color = nearestPixelColor(document.querySelector("[data-pixel-color]")?.value ?? "#12384d"); pixelStudio.pixels[y * pixelStudio.size + x] = color; saveCurrentPixelFrame(); renderPixelStudio(); }
function selectedImageToPixels() { const object = whiteboardObjects.find((item) => item.id === whiteboardSelectedObjectId && item.type === "image"); if (!object) { setWhiteboardStatus("Select a pasted or uploaded image first, then reopen Pixel Studio."); return; } const image = object.element; if (!image?.complete) return; const sample = document.createElement("canvas"); sample.width = pixelStudio.size; sample.height = pixelStudio.size; const context = sample.getContext("2d", { willReadFrequently: true }); context.drawImage(image, 0, 0, pixelStudio.size, pixelStudio.size); const data = context.getImageData(0, 0, sample.width, sample.height).data; pixelStudio.pixels = Array.from({ length: pixelStudio.size ** 2 }, (_, index) => data[index * 4 + 3] < 24 ? "#ffffff00" : nearestPixelColor(`#${[0,1,2].map((offset) => data[index * 4 + offset].toString(16).padStart(2, "0")).join("")}`)); saveCurrentPixelFrame(); renderPixelStudio(); setWhiteboardStatus("The selected image was turned into editable pixels."); }
function imageDataToPixelFrame(data) { return Array.from({ length: pixelStudio.size ** 2 }, (_, index) => data[index * 4 + 3] < 24 ? "#ffffff00" : nearestPixelColor(`#${[0,1,2].map((offset) => data[index * 4 + offset].toString(16).padStart(2, "0")).join("")}`)); }
async function importPixelGif(file) {
  if (!file || (file.type !== "image/gif" && !/\.gif$/i.test(file.name ?? ""))) { setWhiteboardStatus("That file is not a GIF. Choose a file whose name ends in .gif."); return false; }
  if (typeof window.ImageDecoder !== "function") { setWhiteboardStatus("This browser version cannot separate animated GIF frames. Update Chrome on the Chromebook, then try the file again."); return false; }
  try {
    setWhiteboardStatus("Opening the GIF and separating its frames…");
    const decoder = new window.ImageDecoder({ data: await file.arrayBuffer(), type: "image/gif" }); await decoder.tracks.ready; const importLimit = document.querySelector("[data-pixel-import-more]")?.checked ? 48 : 12, availableFrames = decoder.tracks.selectedTrack?.frameCount ?? 1, frameCount = Math.min(importLimit, availableFrames), frames = [], sourceFrames = [];
    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) { const decoded = await decoder.decode({ frameIndex }); const original = document.createElement("canvas"), originalWidth = decoded.image.displayWidth || decoded.image.codedWidth || pixelStudio.size, originalHeight = decoded.image.displayHeight || decoded.image.codedHeight || pixelStudio.size, scale = Math.min(1, 1600 / Math.max(originalWidth, originalHeight)); original.width = Math.max(1, Math.round(originalWidth * scale)); original.height = Math.max(1, Math.round(originalHeight * scale)); original.getContext("2d").drawImage(decoded.image, 0, 0, original.width, original.height); sourceFrames.push(original.toDataURL("image/png")); const sample = document.createElement("canvas"); sample.width = pixelStudio.size; sample.height = pixelStudio.size; const context = sample.getContext("2d", { willReadFrequently: true }); context.imageSmoothingEnabled = false; context.drawImage(decoded.image, 0, 0, pixelStudio.size, pixelStudio.size); frames.push(imageDataToPixelFrame(context.getImageData(0, 0, pixelStudio.size, pixelStudio.size).data)); decoded.image.close(); }
    decoder.close(); pixelStudio.frames = frames.length ? frames : [freshPixelFrame()]; pixelStudio.sourceFrames = sourceFrames; pixelStudio.frameIndex = 0; pixelStudio.pixels = [...pixelStudio.frames[0]]; renderPixelStudio(); startPixelStudioPreview(); setWhiteboardStatus(`${pixelStudio.frames.length} GIF frame${pixelStudio.frames.length === 1 ? "" : "s"} from ${file.name} opened as a bit-based editable animation.${availableFrames > frameCount ? ` The GIF has ${availableFrames} frames; turn on Advanced GIF import to open up to 48.` : ""}`); return true;
  } catch { setWhiteboardStatus(`The file ${file.name} could not be separated into frames. Try a smaller GIF or another GIF file.`); return false; }
}
function gifUrlFromClipboardText(value, isHtml = false) { const text = String(value ?? "").trim(); if (!text) return ""; if (isHtml) { const documentCopy = new DOMParser().parseFromString(text, "text/html"); const sources = [...documentCopy.querySelectorAll("img")].flatMap((image) => [image.currentSrc, image.src, image.getAttribute("data-src")]).filter(Boolean); return sources.find((source) => /^https?:\/\//i.test(source) && /\.gif(?:$|[?#])/i.test(source)) ?? sources.find((source) => /^https?:\/\//i.test(source)) ?? ""; } const match = text.match(/https?:\/\/[^\s<>"']+/i); return match?.[0] ?? ""; }
async function importPixelGifUrl(url) {
  const fallback = document.querySelector("[data-pixel-gif-fallback]"), button = document.querySelector('[data-action="pixel-load-gif-url"]');
  if (fallback) fallback.hidden = true;
  if (button) button.disabled = true;
  try {
    const parsed = new URL(String(url ?? "").trim());
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("invalid-address");
    if (fallback) fallback.href = parsed.href;
    setWhiteboardStatus("Checking the GIF address and downloading its frames…");
    const response = await fetch(parsed.href, { mode: "cors" });
    if (!response.ok) throw new Error("download-blocked");
    const blob = await response.blob(), bytes = new Uint8Array(await blob.slice(0, 6).arrayBuffer()), signature = String.fromCharCode(...bytes);
    if (!signature.startsWith("GIF8")) { setWhiteboardStatus("This address is not a direct GIF file. Open it below, then download the GIF and use Upload GIF file."); if (fallback) fallback.hidden = false; return false; }
    await importPixelGif(new File([blob], "copied-website.gif", { type: "image/gif" }));
    return true;
  } catch (error) {
    const invalid = error?.message === "invalid-address";
    setWhiteboardStatus(invalid ? "Enter a complete GIF address beginning with http:// or https://." : "This website prevents Pixel Studio from downloading the GIF directly. Open it below, save the GIF, then use Upload GIF file.");
    if (fallback && !invalid && fallback.href && fallback.getAttribute("href") !== "#") fallback.hidden = false;
    return false;
  } finally { if (button) button.disabled = false; }
}
async function pastePixelGif() {
  try {
    if (!navigator.clipboard?.read) throw new Error(); const items = await navigator.clipboard.read();
    for (const item of items) if (item.types.includes("image/gif")) { await importPixelGif(await item.getType("image/gif")); return; }
    for (const item of items) if (item.types.includes("text/html")) { const url = gifUrlFromClipboardText(await (await item.getType("text/html")).text(), true); if (url) { await importPixelGifUrl(url); return; } }
    for (const item of items) if (item.types.includes("text/plain")) { const url = gifUrlFromClipboardText(await (await item.getType("text/plain")).text()); if (url) { await importPixelGifUrl(url); return; } }
    if (items.some((item) => item.types.some((type) => type.startsWith("image/")))) setWhiteboardStatus("The website copied only a still picture of the GIF. Copy its image address, or download and upload the GIF."); else setWhiteboardStatus("No GIF was found. Copy the GIF or its image address, then paste again.");
  } catch { setWhiteboardStatus("Clipboard access was blocked. Press Ctrl+V or Command+V directly in Pixel Studio, or use Upload GIF."); }
}
function addPixelSpriteToWhiteboard() { const board = whiteboardCanvas(); if (!board) return; const source = pixelFrameCanvas(pixelStudio.pixels, 16).toDataURL("image/png"), image = new Image(); image.onload = () => { pushWhiteboardHistory(); const size = Math.min(320, board.width * .4, board.height * .5); const object = createWhiteboardObject("image", { x: (board.width - size) / 2, y: (board.height - size) / 2, width: size, height: size, src: source, element: image, pixelArt: true }); whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("Pixel sprite added to the whiteboard. It can be moved and resized."); }; image.src = source; }
async function pixelGifFrameImage() { const source = pixelStudio.sourceFrames?.[pixelStudio.frameIndex], treatment = document.querySelector("[data-pixel-photo-treatment]")?.value ?? "natural", image = new Image(); image.src = source || pixelFrameCanvas(pixelStudio.pixels, 24).toDataURL("image/png"); await image.decode(); const longest = Math.max(image.naturalWidth, image.naturalHeight), scale = Math.min(4, Math.max(1, 1200 / longest)), canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale)); const context = canvas.getContext("2d"); context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high"; context.filter = treatment === "smooth" ? "blur(.35px) saturate(1.05)" : treatment === "vivid" ? "contrast(1.12) saturate(1.2)" : "none"; context.drawImage(image, 0, 0, canvas.width, canvas.height); return canvas; }
async function addPixelGifFrameImageToWhiteboard() { const board = whiteboardCanvas(); if (!board) return; const canvas = await pixelGifFrameImage(), source = canvas.toDataURL("image/png"), image = new Image(); image.onload = () => { pushWhiteboardHistory(); const scale = Math.min(1, board.width * .55 / image.naturalWidth, board.height * .6 / image.naturalHeight), width = image.naturalWidth * scale, height = image.naturalHeight * scale; const object = createWhiteboardObject("image", { x: (board.width - width) / 2, y: (board.height - height) / 2, width, height, src: source, element: image, pixelArt: false }); whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("The selected GIF frame was added as a smooth image on the whiteboard."); }; image.src = source; }
function downloadPixelStudio(source, name) { const link = document.createElement("a"); link.href = source; link.download = name; link.click(); if (String(source).startsWith("blob:")) window.setTimeout(() => URL.revokeObjectURL(source), 1000); }
function newPixelProject({ confirmFirst = true } = {}) { const hasWork = pixelStudio.frames.some((frame) => frame.some((color) => !color.endsWith("00"))); if (confirmFirst && hasWork && !window.confirm("Start a new Pixel Studio project? Save this project first if you want to keep it.")) return false; pixelStudio = { size: 16, bits: 4, frames: [], sourceFrames: [], frameIndex: 0, pixels: [], drawing: false, palette: [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)] }; pixelStudio.pixels = freshPixelFrame(); pixelStudio.frames = [[...pixelStudio.pixels]]; const size = document.querySelector("[data-pixel-size]"), bits = document.querySelector("[data-pixel-bits]"), speed = document.querySelector("[data-pixel-speed]"); if (size) size.value = "16"; if (bits) bits.value = "4"; if (speed) speed.value = "400"; document.querySelectorAll("[data-pixel-level]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.pixelLevel === "creator"))); renderPixelStudio(); startPixelStudioPreview(); setWhiteboardStatus("A new Creator pixel project is ready."); return true; }
function savePixelProjectFile() { saveCurrentPixelFrame(); const speed = Number(document.querySelector("[data-pixel-speed]")?.value ?? 400), project = { type: "thinkamigbob-pixel-project", version: 1, size: pixelStudio.size, bits: pixelStudio.bits, palette: pixelStudio.palette, frames: pixelStudio.frames, frameIndex: pixelStudio.frameIndex, speed }; downloadPixelStudio(URL.createObjectURL(new Blob([JSON.stringify(project)], { type: "application/json" })), "pixel-studio-project.json"); setWhiteboardStatus("Pixel Studio project saved. Open this file later to continue editing."); }
async function openPixelProjectFile(file) { try { const project = JSON.parse(await file.text()); const validSize = [8,16,24,32,64].includes(project.size), validBits = [1,2,4,8,24].includes(project.bits), validFrames = Array.isArray(project.frames) && project.frames.length >= 1 && project.frames.length <= 120 && project.frames.every((frame) => Array.isArray(frame) && frame.length === project.size ** 2 && frame.every((color) => /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(color))); if (project.type !== "thinkamigbob-pixel-project" || !validSize || !validBits || !validFrames) throw new Error(); pixelStudio.size = project.size; pixelStudio.bits = project.bits; pixelStudio.palette = Array.isArray(project.palette) && project.palette.length >= 16 ? [...project.palette.slice(0,256), ...PIXEL_8_BIT_PALETTE].slice(0,256) : [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)]; pixelStudio.frames = project.frames; pixelStudio.frameIndex = Math.min(project.frames.length - 1, Math.max(0, Number(project.frameIndex) || 0)); pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; const size = document.querySelector("[data-pixel-size]"), bits = document.querySelector("[data-pixel-bits]"), speed = document.querySelector("[data-pixel-speed]"); if (size) size.value = String(pixelStudio.size); if (bits) bits.value = String(pixelStudio.bits); if (speed) speed.value = String(Math.min(1200, Math.max(100, Number(project.speed) || 400))); document.querySelectorAll("[data-pixel-level]").forEach((button) => button.setAttribute("aria-pressed", "false")); renderPixelStudio(); startPixelStudioPreview(); setWhiteboardStatus(`${pixelStudio.frames.length}-frame Pixel Studio project opened.`); } catch { setWhiteboardStatus("That file is not a valid Pixel Studio project."); } }
function gifLzw(indices, minimumCodeSize) { const clear = 1 << minimumCodeSize, end = clear + 1; let codeSize = minimumCodeSize + 1, next = end + 1, dictionary = new Map(), bytes = [], currentByte = 0, bit = 0; const write = (code) => { for (let i = 0; i < codeSize; i += 1) { currentByte |= ((code >> i) & 1) << bit; bit += 1; if (bit === 8) { bytes.push(currentByte); currentByte = 0; bit = 0; } } }; const reset = () => { dictionary = new Map(); codeSize = minimumCodeSize + 1; next = end + 1; }; reset(); write(clear); let prefix = String(indices[0] ?? 0); for (let i = 1; i < indices.length; i += 1) { const symbol = indices[i], key = `${prefix},${symbol}`; if (dictionary.has(key)) prefix = String(dictionary.get(key)); else { write(Number(prefix)); if (next < 4096) { dictionary.set(key, next++); if (next === (1 << codeSize) && codeSize < 12) codeSize += 1; } else { write(clear); reset(); } prefix = String(symbol); } } write(Number(prefix)); write(end); if (bit) bytes.push(currentByte); return bytes; }
function animatedPixelGif() { const palette = [...pixelStudio.palette, ...PIXEL_8_BIT_PALETTE].slice(0, 256), bytes = [], word = (value) => [value & 255, value >> 8 & 255], text = (value) => [...value].map((character) => character.charCodeAt(0)), paletteIndex = (color) => palette.reduce((best, candidate, index) => pixelColorDistance(color, candidate) < pixelColorDistance(color, palette[best]) ? index : best, 0); bytes.push(...text("GIF89a"), ...word(pixelStudio.size), ...word(pixelStudio.size), 0xf7, 0, 0); palette.forEach((color) => bytes.push(...(color.match(/[\da-f]{2}/gi) ?? ["00","00","00"]).map((part) => parseInt(part, 16)))); bytes.push(0x21,0xff,0x0b,...text("NETSCAPE2.0"),3,1,0,0,0); const delay = Math.max(2, Math.round(Number(document.querySelector("[data-pixel-speed]")?.value ?? 400) / 10)); pixelStudio.frames.forEach((frame) => { const indices = frame.map((color) => color.endsWith("00") ? 1 : paletteIndex(color)); const compressed = gifLzw(indices, 8); bytes.push(0x21,0xf9,4,4,...word(delay),0,0,0x2c,0,0,0,0,...word(pixelStudio.size),...word(pixelStudio.size),0,8); for (let i = 0; i < compressed.length; i += 255) { const block = compressed.slice(i, i + 255); bytes.push(block.length, ...block); } bytes.push(0); }); bytes.push(0x3b); return URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "image/gif" })); }

function removeSelectedWhiteboardImageBackground(object) {
  if (object?.type !== "image" || !object.element) return false;
  const source = document.createElement("canvas"), width = object.element.naturalWidth || Math.max(1, Math.round(object.width)), height = object.element.naturalHeight || Math.max(1, Math.round(object.height));
  source.width = width; source.height = height;
  const context = source.getContext("2d"); context.drawImage(object.element, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const red = pixels.data[index], green = pixels.data[index + 1], blue = pixels.data[index + 2];
    const light = (red + green + blue) / 3 > 218, neutral = Math.max(red, green, blue) - Math.min(red, green, blue) < 38;
    if (light && neutral) pixels.data[index + 3] = 0;
  }
  context.putImageData(pixels, 0, 0);
  const result = source.toDataURL("image/png"), image = new Image();
  pushWhiteboardHistory(); object.src = result; object.backgroundRemoved = true; object.element = image;
  image.addEventListener("load", () => { renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); }, { once: true }); image.src = result;
  setWhiteboardStatus("Image background removed. The transparent PNG can now be copied or downloaded.");
  if (window.confirm("The image background was removed. Would you like to download the transparent PNG?")) downloadWhiteboardImage(result, "whiteboard-image-no-background.png");
  return true;
}

function pasteWhiteboardClipboard(point = null) {
  if (!whiteboardClipboard) { setWhiteboardStatus("Copy or cut a whiteboard object before pasting."); return false; }
  pushWhiteboardHistory();
  let copy = duplicateWhiteboardObject(whiteboardClipboard);
  if (point) {
    const bounds = objectBounds(copy);
    copy = moveWhiteboardObject(copy, point.x - (bounds.x + bounds.width / 2), point.y - (bounds.y + bounds.height / 2));
  }
  whiteboardObjects.push(copy); whiteboardSelectedObjectId = copy.id;
  hydrateWhiteboardImages(() => renderWhiteboardObjects()); renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls();
  setWhiteboardStatus("Copied image pasted onto the board."); return true;
}

function addClipboardImageToWhiteboard(blob, point = null) {
  if (!blob || !String(blob.type).startsWith("image/")) { setWhiteboardStatus("The clipboard does not contain an image."); return false; }
  if (blob.size > 6 * 1024 * 1024) { setWhiteboardStatus("The copied image is too large. Use an image smaller than 6 MB."); return false; }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const canvas = whiteboardCanvas(), image = new Image();
    if (!canvas) return;
    image.addEventListener("load", () => {
      pushWhiteboardHistory();
      const scale = Math.min((canvas.width * 0.7) / image.width, (canvas.height * 0.7) / image.height, 1), width = image.width * scale, height = image.height * scale;
      const x = point ? Math.max(0, point.x - width / 2) : (canvas.width - width) / 2, y = point ? Math.max(0, point.y - height / 2) : (canvas.height - height) / 2;
      const object = createWhiteboardObject("image", { x, y, width, height, src: String(reader.result), element: image });
      whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls();
      setWhiteboardStatus("Copied image pasted onto the board. Drag it to move or resize it.");
    }, { once: true });
    image.src = String(reader.result);
  }, { once: true });
  reader.readAsDataURL(blob);
  return true;
}

async function pasteSystemClipboardImage() {
  if (!navigator.clipboard?.read) { setWhiteboardStatus("Use Ctrl+V or Command+V to paste the copied image into the whiteboard."); return false; }
  try {
    const items = await navigator.clipboard.read();
    const item = items.find((entry) => entry.types.some((type) => type.startsWith("image/")));
    const type = item?.types.find((value) => value.startsWith("image/"));
    if (!item || !type) { setWhiteboardStatus("Copy an image first, then choose Paste copied image."); return false; }
    return addClipboardImageToWhiteboard(await item.getType(type));
  } catch { setWhiteboardStatus("The browser blocked the Paste button. Press Ctrl+V or Command+V while the whiteboard is open."); return false; }
}

function cutSelectedWhiteboardObject() {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (!selected) { setWhiteboardStatus("Select a whiteboard object before cutting it."); return false; }
  whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((object) => object.id === selected.id));
  pushWhiteboardHistory(); whiteboardObjects = whiteboardObjects.filter((object) => object.id !== selected.id); whiteboardSelectedObjectId = "";
  renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("Object cut. Right-click or press Ctrl+V or Command+V to paste it."); return true;
}

function duplicateSelectedWhiteboardObject() {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (!selected) { setWhiteboardStatus("Select a whiteboard object before duplicating it."); return false; }
  pushWhiteboardHistory(); const copy = duplicateWhiteboardObject(serializableWhiteboardObjects().find((object) => object.id === selected.id)); whiteboardObjects.push(copy); whiteboardSelectedObjectId = copy.id;
  hydrateWhiteboardImages(() => renderWhiteboardObjects()); renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("Selected object duplicated."); return true;
}

function deleteSelectedWhiteboardObject() {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (!selected) { setWhiteboardStatus("Select a whiteboard object before deleting it."); return false; }
  pushWhiteboardHistory(); whiteboardObjects = whiteboardObjects.filter((object) => object.id !== selected.id); whiteboardSelectedObjectId = "";
  renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("Selected object deleted. Use Undo to restore it."); return true;
}

function formatSelectedWhiteboardText(command) {
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (selected?.type !== "text" || selected.emojiStamp) { setWhiteboardStatus("Select a text box before changing its formatting."); return false; }
  pushWhiteboardHistory(); selected.richHtml = "";
  if (["bold", "italic", "underline"].includes(command)) selected[command] = !selected[command];
  if (command === "font") selected.fontFamily = document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial";
  if (command === "color") selected.color = document.querySelector("[data-whiteboard-text-color]")?.value ?? "#12384d";
  renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("Text formatting updated."); return true;
}

function activateWhiteboardTextTool(message = "Text is active. Click anywhere on the whiteboard to start typing.") {
  whiteboardDeleteNextObject = false;
  const tool = document.querySelector("[data-whiteboard-tool]");
  if (tool) { tool.value = "text"; tool.dispatchEvent(new Event("change", { bubbles: true })); }
  document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", "false"));
  whiteboardCanvas()?.focus({ preventScroll: true }); setWhiteboardStatus(message);
}

function connectedWhiteboardObjectIds(seed) {
  if (!seed) return new Set();
  const editable = whiteboardObjects.filter((object) => object.strokeStyle !== "eraser");
  const connected = new Set([seed.id]);
  const queue = [seed];
  const touches = (first, second) => {
    const a = objectBounds(first), b = objectBounds(second), padding = Math.max(8, Number(first.size ?? 0) / 2, Number(second.size ?? 0) / 2);
    return a.x <= b.x + b.width + padding && a.x + a.width + padding >= b.x && a.y <= b.y + b.height + padding && a.y + a.height + padding >= b.y;
  };
  while (queue.length) {
    const current = queue.shift();
    editable.forEach((candidate) => { if (!connected.has(candidate.id) && touches(current, candidate)) { connected.add(candidate.id); queue.push(candidate); } });
  }
  return connected;
}

function isAccidentalWhiteboardDot(object) {
  if (!object || object.strokeStyle === "eraser" || object.emojiStamp) return false;
  if (object.type === "path") return (object.points?.length ?? 0) < 2;
  if (["line", "arrow", ...WHITEBOARD_CLOSED_2D_SHAPES, "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(object.type)) return Math.hypot(Number(object.width ?? 0), Number(object.height ?? 0)) < 5;
  return false;
}

function makeWhiteboardObject3D(object, depth = 24) {
  const typeMap = { rectangle: "rectangular-prism", ellipse: "cylinder", triangle: "pyramid" };
  const normalizedDepth = Math.max(10, Math.min(120, Number(depth) || 24));
  return typeMap[object.type]
    ? { ...object, type: typeMap[object.type], original2DType: object.type, shapeLabel: true, depth: normalizedDepth }
    : { ...object, original2DType: object.type, extruded3D: true, depth: normalizedDepth };
}

const WHITEBOARD_CLOSED_2D_SHAPES = Object.freeze(["rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "star"]);
const WHITEBOARD_3D_SHAPES = Object.freeze(["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"]);

function bisectWhiteboardShapeWithLine(line) {
  if (!line || line.type !== "line") return false;
  const x1 = line.x, y1 = line.y, x2 = line.x + line.width, y2 = line.y + line.height;
  if (Math.hypot(x2 - x1, y2 - y1) < 20) return false;
  const lineBounds = { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
  const candidate = [...whiteboardObjects].reverse().find((object) => {
    if (object.id === line.id || ![...WHITEBOARD_CLOSED_2D_SHAPES, ...WHITEBOARD_3D_SHAPES].includes(object.type)) return false;
    const bounds = objectBounds(object);
    if (lineBounds.x > bounds.x + bounds.width || lineBounds.x + lineBounds.width < bounds.x || lineBounds.y > bounds.y + bounds.height || lineBounds.y + lineBounds.height < bounds.y) return false;
    const signed = (x, y) => (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
    const corners = [[bounds.x, bounds.y], [bounds.x + bounds.width, bounds.y], [bounds.x, bounds.y + bounds.height], [bounds.x + bounds.width, bounds.y + bounds.height]].map(([x, y]) => signed(x, y));
    return Math.min(...corners) < 0 && Math.max(...corners) > 0;
  });
  if (!candidate) return false;
  const bounds = objectBounds(candidate), normalizedCut = { x1: (x1 - bounds.x) / bounds.width, y1: (y1 - bounds.y) / bounds.height, x2: (x2 - bounds.x) / bounds.width, y2: (y2 - bounds.y) / bounds.height };
  const base = structuredClone(serializableWhiteboardObjects().find((object) => object.id === candidate.id)); delete base.id; delete base.type;
  const fragments = [-1, 1].map((cutSide) => createWhiteboardObject("shape-fragment", { ...base, sourceType: candidate.type, cutSide, normalizedCut }));
  whiteboardObjects = whiteboardObjects.filter((object) => object.id !== candidate.id && object.id !== line.id); whiteboardObjects.push(...fragments); whiteboardSelectedObjectId = fragments[0].id;
  return true;
}

function flattenWhiteboard3DShape(object) {
  if (object.type === "shape-fragment") {
    const flatType = { cube: "rectangle", "rectangular-prism": "rectangle", "triangular-prism": "triangle", "hexagonal-prism": "hexagon", cylinder: "ellipse", cone: "triangle", pyramid: "triangle", sphere: "ellipse", hemisphere: "ellipse" }[object.sourceType];
    if (!flatType) return [];
    const restored = { ...object, sourceType: flatType };
    delete restored.original2DType; delete restored.shapeLabel; delete restored.depth; delete restored.extruded3D; delete restored.faceColors;
    return [restored];
  }
  if (object.original2DType) {
    const restored = { ...object, type: object.original2DType };
    delete restored.original2DType; delete restored.shapeLabel; delete restored.depth; delete restored.extruded3D;
    return [restored];
  }
  if (!["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(object.type)) return [];
  const { id, type, original2DType, shapeLabel, depth, extruded3D, ...style } = object;
  const bounds = objectBounds(object), gap = 24;
  const part = (partType, values) => createWhiteboardObject(partType, { ...style, rotation: 0, ...values });
  if (["sphere", "hemisphere"].includes(type)) return [part("ellipse", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height })];
  if (type === "triangular-prism") return [part("triangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }), part("triangle", { x: bounds.x + bounds.width + gap, y: bounds.y, width: bounds.width, height: bounds.height })];
  if (type === "hexagonal-prism") return [part("hexagon", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }), part("hexagon", { x: bounds.x + bounds.width + gap, y: bounds.y, width: bounds.width, height: bounds.height })];
  if (type === "cylinder") return [
    part("rectangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("ellipse", { x: bounds.x + bounds.width + gap, y: bounds.y, width: bounds.width, height: Math.max(24, bounds.width * 0.42) }),
  ];
  if (type === "cone") return [
    part("triangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("ellipse", { x: bounds.x + bounds.width + gap, y: bounds.y + bounds.height - Math.max(24, bounds.width * 0.42), width: bounds.width, height: Math.max(24, bounds.width * 0.42) }),
  ];
  if (type === "pyramid") return [
    part("triangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("rectangle", { x: bounds.x + bounds.width + gap, y: bounds.y + bounds.height - Math.max(36, bounds.height * 0.42), width: bounds.width, height: Math.max(36, bounds.height * 0.42) }),
  ];
  const sideWidth = type === "cube" ? bounds.width : Math.max(36, Number(object.depth ?? bounds.width * 0.35));
  return [
    part("rectangle", { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
    part("rectangle", { x: bounds.x + bounds.width + gap, y: bounds.y, width: sideWidth, height: bounds.height }),
  ];
}

function drawWhiteboardExtrusion(context, object) {
  if (!object.extruded3D) return;
  const depth = Math.max(10, Math.min(48, Number(object.depth ?? 24)));
  const layers = Math.max(5, Math.min(14, Math.ceil(depth / 3)));
  const bounds = objectBounds(object);
  for (let layer = layers; layer >= 1; layer -= 1) {
    const ratio = layer / layers, offset = depth * ratio;
    const gradient = context.createLinearGradient(bounds.x, bounds.y, bounds.x + bounds.width + depth, bounds.y + bounds.height + depth);
    gradient.addColorStop(0, object.faceColors?.top ?? "rgba(255,255,255,0.96)"); gradient.addColorStop(0.34, object.faceColors?.side ?? object.color ?? "#287da0"); gradient.addColorStop(1, object.faceColors?.side ?? "#082b3b");
    context.save(); context.translate(offset, offset); context.globalAlpha = 0.055 + 0.045 * ratio; context.strokeStyle = gradient; context.fillStyle = gradient; context.lineWidth = Math.max(2, Number(object.size ?? 6) * 0.72); context.lineCap = "round"; context.lineJoin = "round";
    if (object.type === "path") drawWhiteboardPath(context, { ...object, opacity: 1, extruded3D: false });
    else if (object.type === "line" || object.type === "arrow") { context.beginPath(); context.moveTo(object.x, object.y); context.lineTo(object.x + object.width, object.y + object.height); context.stroke(); }
    else if (object.type === "text") {
      context.translate(object.x + object.width / 2, object.y + object.height / 2); context.rotate(object.rotation ?? 0);
      if (whiteboardTextBackground(object.background)) context.fillRect(-object.width / 2 - 8, -object.height / 2 - 5, object.width + 16, object.height + 10);
      context.font = `700 ${object.fontSize ?? 36}px sans-serif`; context.fillText(object.text ?? "", -object.width / 2, -object.height / 2 + (object.fontSize ?? 36));
    }
    else if (WHITEBOARD_CLOSED_2D_SHAPES.includes(object.type)) {
      context.beginPath();
      if (object.type === "rectangle") context.rect(object.x, object.y, object.width, object.height);
      if (object.type === "ellipse") context.ellipse(object.x + object.width / 2, object.y + object.height / 2, Math.abs(object.width / 2), Math.abs(object.height / 2), 0, 0, Math.PI * 2);
      if (object.type === "triangle") { context.moveTo(object.x + object.width / 2, object.y); context.lineTo(object.x + object.width, object.y + object.height); context.lineTo(object.x, object.y + object.height); context.closePath(); }
      if (object.type === "diamond") traceWhiteboardPolygon(context, object, 4);
      if (object.type === "pentagon") traceWhiteboardPolygon(context, object, 5);
      if (object.type === "hexagon") traceWhiteboardPolygon(context, object, 6);
      if (object.type === "star") traceWhiteboardPolygon(context, object, 5, 0.44);
      context.stroke();
    }
    context.restore();
  }
}

function drawWhiteboardShapeFragment(context, object) {
  const bounds = objectBounds(object), cut = object.normalizedCut;
  if (!cut) return;
  const x1 = bounds.x + cut.x1 * bounds.width, y1 = bounds.y + cut.y1 * bounds.height, x2 = bounds.x + cut.x2 * bounds.width, y2 = bounds.y + cut.y2 * bounds.height;
  const dx = x2 - x1, dy = y2 - y1, length = Math.max(1, Math.hypot(dx, dy)), ux = dx / length, uy = dy / length, nx = -uy * object.cutSide, ny = ux * object.cutSide, far = Math.max(4000, bounds.width * 8, bounds.height * 8);
  context.save(); context.beginPath(); context.moveTo(x1 - ux * far, y1 - uy * far); context.lineTo(x2 + ux * far, y2 + uy * far); context.lineTo(x2 + ux * far + nx * far, y2 + uy * far + ny * far); context.lineTo(x1 - ux * far + nx * far, y1 - uy * far + ny * far); context.closePath(); context.clip();
  const source = { ...object, type: object.sourceType };
  if (WHITEBOARD_3D_SHAPES.includes(source.type)) drawWhiteboard3DShape(context, source);
  else { context.beginPath(); if (source.type === "rectangle") context.rect(source.x, source.y, source.width, source.height); if (source.type === "ellipse") context.ellipse(source.x + source.width / 2, source.y + source.height / 2, Math.abs(source.width / 2), Math.abs(source.height / 2), 0, 0, Math.PI * 2); if (source.type === "triangle") { context.moveTo(source.x + source.width / 2, source.y); context.lineTo(source.x + source.width, source.y + source.height); context.lineTo(source.x, source.y + source.height); context.closePath(); } if (source.type === "diamond") traceWhiteboardPolygon(context, source, 4); if (source.type === "pentagon") traceWhiteboardPolygon(context, source, 5); if (source.type === "hexagon") traceWhiteboardPolygon(context, source, 6); if (source.type === "star") traceWhiteboardPolygon(context, source, 5, 0.44); if (source.fillColor) { context.fillStyle = source.fillColor; context.fill(); } context.stroke(); }
  context.restore();
  context.save(); context.strokeStyle = object.color ?? "#12384d"; context.lineWidth = object.size ?? 6; context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke(); context.restore();
}

function whiteboardFragmentCutSegment(object) {
  const bounds = objectBounds(object), cut = object.normalizedCut;
  if (!bounds || !cut) return null;
  const start = { x: bounds.x + cut.x1 * bounds.width, y: bounds.y + cut.y1 * bounds.height };
  const end = { x: bounds.x + cut.x2 * bounds.width, y: bounds.y + cut.y2 * bounds.height };
  const dx = end.x - start.x, dy = end.y - start.y;
  if (Math.hypot(dx, dy) < 1) return null;
  const points = [];
  const add = (t) => { const point = { x: start.x + dx * t, y: start.y + dy * t }; if (point.x >= bounds.x - 0.5 && point.x <= bounds.x + bounds.width + 0.5 && point.y >= bounds.y - 0.5 && point.y <= bounds.y + bounds.height + 0.5 && !points.some((item) => Math.hypot(item.x - point.x, item.y - point.y) < 1)) points.push(point); };
  if (Math.abs(dx) > 0.001) { add((bounds.x - start.x) / dx); add((bounds.x + bounds.width - start.x) / dx); }
  if (Math.abs(dy) > 0.001) { add((bounds.y - start.y) / dy); add((bounds.y + bounds.height - start.y) / dy); }
  if (points.length < 2) return null;
  let pair = [points[0], points[1]], greatest = 0;
  points.forEach((first) => points.forEach((second) => { const distance = Math.hypot(second.x - first.x, second.y - first.y); if (distance > greatest) { greatest = distance; pair = [first, second]; } }));
  return { start: pair[0], end: pair[1], length: greatest };
}

function whiteboardRulerLocalPoint(point) {
  const dx = point.x - whiteboardRuler.x, dy = point.y - whiteboardRuler.y, cosine = Math.cos(-whiteboardRuler.angle), sine = Math.sin(-whiteboardRuler.angle);
  return { x: dx * cosine - dy * sine, y: dx * sine + dy * cosine };
}

function whiteboardResizeCorner(bounds, point) {
  const corners = { nw: { x: bounds.x, y: bounds.y }, ne: { x: bounds.x + bounds.width, y: bounds.y }, sw: { x: bounds.x, y: bounds.y + bounds.height }, se: { x: bounds.x + bounds.width, y: bounds.y + bounds.height } };
  return Object.entries(corners).find(([, corner]) => Math.hypot(point.x - corner.x, point.y - corner.y) <= 22)?.[0] ?? "";
}

function resizeWhiteboardObjectFromCorner(object, corner, dx, dy) {
  const bounds = objectBounds(object);
  let left = bounds.x, top = bounds.y, right = bounds.x + bounds.width, bottom = bounds.y + bounds.height;
  if (corner.includes("w")) left = Math.min(right - 12, left + dx);
  if (corner.includes("e")) right = Math.max(left + 12, right + dx);
  if (corner.includes("n")) top = Math.min(bottom - 12, top + dy);
  if (corner.includes("s")) bottom = Math.max(top + 12, bottom + dy);
  if (["ellipse", "sphere", "hemisphere", "cube"].includes(object.type)) {
    const side = Math.max(12, Math.max(right - left, bottom - top));
    if (corner.includes("w")) left = right - side; else right = left + side;
    if (corner.includes("n")) top = bottom - side; else bottom = top + side;
  }
  let resized = resizeWhiteboardObject(object, right - left, bottom - top);
  if (object.type === "path") resized = moveWhiteboardObject(resized, left - bounds.x, top - bounds.y);
  else resized = { ...resized, x: left, y: top, width: right - left, height: bottom - top };
  if (object.type === "text" && !object.emojiStamp) resized.textScale = Math.max(0.25, Math.min(4, (object.textScale ?? 1) * ((bottom - top) / Math.max(12, bounds.height))));
  return resized;
}

function drawWhiteboardSelectionMeasurements(context, object) {
  const bounds = objectBounds(object);
  if (!bounds) return;
  const centerX = bounds.x + bounds.width / 2, centerY = bounds.y + bounds.height / 2;
  context.save(); context.strokeStyle = "#b52222"; context.fillStyle = "#b52222"; context.lineWidth = 2.5; context.font = "800 16px sans-serif";
  const label = (text, x, y) => { const width = context.measureText(text).width + 12; context.fillStyle = "rgba(255,255,255,0.96)"; context.fillRect(x - width / 2, y - 16, width, 22); context.strokeStyle = "rgba(181,34,34,0.35)"; context.strokeRect(x - width / 2, y - 16, width, 22); context.fillStyle = "#b52222"; context.fillText(text, x - width / 2 + 6, y); };
  if (object.type === "shape-fragment") {
    const segment = whiteboardFragmentCutSegment(object);
    if (segment) {
      const dx = segment.end.x - segment.start.x, dy = segment.end.y - segment.start.y, length = Math.max(1, segment.length);
      const normal = { x: -dy / length * 26 * object.cutSide, y: dx / length * 26 * object.cutSide };
      const acuteAngle = Math.max(1, Math.min(89, Math.round(Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI)));
      label(`${acuteAngle}°`, segment.start.x + normal.x, segment.start.y + normal.y);
      label(`${180 - acuteAngle}°`, segment.end.x + normal.x, segment.end.y + normal.y);
    }
    if (["ellipse", "cylinder", "sphere", "hemisphere", "cone"].includes(object.sourceType)) {
      const radius = Math.min(bounds.width, bounds.height) / 2;
      context.beginPath(); context.moveTo(centerX, centerY); context.lineTo(centerX + radius, centerY); context.stroke();
      context.beginPath(); context.arc(centerX, centerY, 4, 0, Math.PI * 2); context.fill();
      label(`r = ${Math.round(radius)}`, centerX + radius / 2, centerY - 12);
    }
    context.restore(); return;
  }
  if (["ellipse", "sphere", "hemisphere"].includes(object.type)) {
    const radius = Math.min(bounds.width, bounds.height) / 2;
    context.beginPath(); context.moveTo(centerX, centerY); context.lineTo(centerX + radius, centerY); context.stroke();
    context.beginPath(); context.arc(centerX, centerY, 4, 0, Math.PI * 2); context.fill();
    label(`r = ${Math.round(radius)}`, centerX + radius / 2, centerY - 12);
  }
  if (["cylinder", "cone"].includes(object.type)) {
    const radius = bounds.width / 2;
    label(`r = ${Math.round(radius)}`, centerX, bounds.y + bounds.height + 34);
  }
  if (["triangle", "pyramid", "cone", "triangular-prism"].includes(object.type)) {
    const points = [{ x: 0, y: -bounds.height / 2 }, { x: bounds.width / 2, y: bounds.height / 2 }, { x: -bounds.width / 2, y: bounds.height / 2 }];
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const angleAt = (a, b, c) => Math.acos(Math.max(-1, Math.min(1, (distance(a, b) ** 2 + distance(a, c) ** 2 - distance(b, c) ** 2) / (2 * distance(a, b) * distance(a, c))))) * 180 / Math.PI;
    context.translate(centerX, centerY); context.rotate(object.rotation ?? 0);
    points.forEach((point, index) => { const degrees = Math.round(angleAt(point, points[(index + 1) % 3], points[(index + 2) % 3])); const length = Math.max(1, Math.hypot(point.x, point.y)); const outwardX = point.x / length * 32, outwardY = point.y / length * 32; label(`${degrees}°`, point.x + outwardX, point.y + outwardY); });
  } else if (["rectangle", "cube", "rectangular-prism"].includes(object.type)) {
    context.translate(centerX, centerY); context.rotate(object.rotation ?? 0); label("90°", -bounds.width / 2 - 24, -bounds.height / 2 - 16); label("90°", bounds.width / 2 + 24, bounds.height / 2 + 28);
  } else if (["diamond", "pentagon", "hexagon", "star", "hexagonal-prism"].includes(object.type)) {
    const sideCount = object.type === "diamond" ? 4 : object.type === "pentagon" ? 5 : object.type === "star" ? 10 : 6;
    const innerRatio = object.type === "star" ? 0.44 : 1;
    const points = Array.from({ length: sideCount }, (_, index) => { const scale = object.type === "star" && index % 2 ? innerRatio : 1, angle = -Math.PI / 2 + index * Math.PI * 2 / sideCount; return { x: Math.cos(angle) * bounds.width / 2 * scale, y: Math.sin(angle) * bounds.height / 2 * scale }; });
    const angleAt = (previous, point, next) => { const a = Math.atan2(previous.y - point.y, previous.x - point.x), b = Math.atan2(next.y - point.y, next.x - point.x); let degrees = Math.abs((b - a) * 180 / Math.PI); if (degrees > 180) degrees = 360 - degrees; return Math.round(degrees); };
    context.translate(centerX, centerY); context.rotate(object.rotation ?? 0);
    points.forEach((point, index) => { const length = Math.max(1, Math.hypot(point.x, point.y)), offset = object.type === "star" && index % 2 ? 20 : 32; label(`${angleAt(points[(index + points.length - 1) % points.length], point, points[(index + 1) % points.length])}°`, point.x + point.x / length * offset, point.y + point.y / length * offset); });
  }
  const rotationDegrees = Math.round((object.rotation ?? 0) * 180 / Math.PI);
  if (rotationDegrees && [...WHITEBOARD_CLOSED_2D_SHAPES, "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(object.type)) {
    context.restore(); context.save(); context.strokeStyle = "#b52222"; context.fillStyle = "#b52222"; context.lineWidth = 2.5; context.font = "800 16px sans-serif";
    const radius = Math.max(bounds.width, bounds.height) / 2 + 24; context.beginPath(); context.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (object.rotation ?? 0)); context.stroke(); label(`${rotationDegrees}°`, centerX, centerY - radius - 14);
  }
  context.restore();
}

function renderWhiteboardObjects(canvas = whiteboardCanvas()) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (whiteboardBackground.type === "gradient") { const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height); gradient.addColorStop(0, whiteboardBackground.color1); gradient.addColorStop(1, whiteboardBackground.color2); context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height); }
  else { context.fillStyle = whiteboardBackground.type === "solid" ? whiteboardBackground.color1 : "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); }
  if (whiteboardBackground.type === "image" && whiteboardBackground.element) context.drawImage(whiteboardBackground.element, 0, 0, canvas.width, canvas.height);
  drawWhiteboardGrid(context, canvas);
  for (const object of whiteboardObjects) {
    drawWhiteboardExtrusion(context, object);
    context.save(); context.globalAlpha = object.opacity ?? 1; context.strokeStyle = object.faceColors?.front ?? object.color ?? "#12384d"; context.fillStyle = object.faceColors?.front ?? object.color ?? "#12384d"; context.lineWidth = object.size ?? 6; context.lineCap = "round"; context.lineJoin = "round";
    if (object.rotation && !["text", "image", "path", "dimension"].includes(object.type)) { const bounds = objectBounds(object), centerX = bounds.x + bounds.width / 2, centerY = bounds.y + bounds.height / 2; context.translate(centerX, centerY); context.rotate(object.rotation); context.translate(-centerX, -centerY); }
    if (object.type === "path") drawWhiteboardPath(context, object);
    else if (object.type === "text") { const angle = object.rotation ?? 0, background = whiteboardTextBackground(object.background), textScale = object.textScale ?? 1; context.translate(object.x + object.width / 2, object.y + object.height / 2); context.rotate(angle); if (background) { context.fillStyle = background; context.fillRect(-object.width / 2 - 8, -object.height / 2 - 5, object.width + 16, object.height + 10); } drawWhiteboardCursiveGuides(context, object); let cursorX = -object.width / 2; const baseline = object.height / 2 - Math.max(3, (object.fontSize ?? 36) * textScale * 0.12); whiteboardRichTextRuns(object.richHtml, object.text, object.fontSize, object.background === "black" ? "#ffffff" : object.color, object.fontFamily ?? "Arial").forEach((run) => { const runSize = run.size * textScale, runFont = run.fontFamily || object.fontFamily || "Arial"; context.font = `${object.italic || run.italic ? "italic " : ""}${object.bold || run.bold ? "700" : "400"} ${runSize}px "${runFont}"`; context.fillStyle = run.color; context.fillText(run.text, cursorX, baseline); const width = context.measureText(run.text).width; if (object.underline || run.underline) context.fillRect(cursorX, baseline + 3, width, Math.max(1.5, runSize / 18)); cursorX += width; }); }
    else if (object.type === "image" && object.element) { context.translate(object.x + object.width / 2, object.y + object.height / 2); context.rotate(object.rotation ?? 0); context.drawImage(object.element, -object.width / 2, -object.height / 2, object.width, object.height); }
    else if (object.type === "youtube") { context.fillStyle = "#111820"; context.fillRect(object.x, object.y, object.width, object.height); context.strokeStyle = "#ffffff"; context.lineWidth = 4; context.strokeRect(object.x + 2, object.y + 2, object.width - 4, object.height - 4); context.fillStyle = "#ff0033"; context.beginPath(); context.roundRect(object.x + object.width / 2 - 42, object.y + object.height / 2 - 30, 84, 60, 14); context.fill(); context.fillStyle = "#ffffff"; context.beginPath(); context.moveTo(object.x + object.width / 2 - 10, object.y + object.height / 2 - 18); context.lineTo(object.x + object.width / 2 + 22, object.y + object.height / 2); context.lineTo(object.x + object.width / 2 - 10, object.y + object.height / 2 + 18); context.closePath(); context.fill(); }
    else if (object.type === "dimension") drawWhiteboardDimension(context, object);
    else if (object.type === "line" || object.type === "arrow") { context.beginPath(); context.moveTo(object.x, object.y); context.lineTo(object.x + object.width, object.y + object.height); context.stroke(); if (object.type === "arrow") { const angle = Math.atan2(object.height, object.width); context.beginPath(); context.moveTo(object.x + object.width, object.y + object.height); context.lineTo(object.x + object.width - 18 * Math.cos(angle - 0.55), object.y + object.height - 18 * Math.sin(angle - 0.55)); context.moveTo(object.x + object.width, object.y + object.height); context.lineTo(object.x + object.width - 18 * Math.cos(angle + 0.55), object.y + object.height - 18 * Math.sin(angle + 0.55)); context.stroke(); } }
    else if (object.type === "shape-fragment") drawWhiteboardShapeFragment(context, object);
    else if (WHITEBOARD_3D_SHAPES.includes(object.type)) drawWhiteboard3DShape(context, object);
    else { context.beginPath(); if (object.type === "rectangle") context.rect(object.x, object.y, object.width, object.height); if (object.type === "ellipse") context.ellipse(object.x + object.width / 2, object.y + object.height / 2, Math.abs(object.width / 2), Math.abs(object.height / 2), 0, 0, Math.PI * 2); if (object.type === "triangle") { context.moveTo(object.x + object.width / 2, object.y); context.lineTo(object.x + object.width, object.y + object.height); context.lineTo(object.x, object.y + object.height); context.closePath(); } if (object.type === "diamond") traceWhiteboardPolygon(context, object, 4); if (object.type === "pentagon") traceWhiteboardPolygon(context, object, 5); if (object.type === "hexagon") traceWhiteboardPolygon(context, object, 6); if (object.type === "star") traceWhiteboardPolygon(context, object, 5, 0.44); if (object.fillColor && !object.extruded3D) { context.fillStyle = object.fillColor; context.fill(); } context.stroke(); }
    context.restore();
  }
  const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
  if (selected) { const bounds = objectBounds(selected); context.save(); context.setLineDash([8, 6]); context.strokeStyle = "#087ba0"; context.lineWidth = 3; context.strokeRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12); context.setLineDash([]); context.fillStyle = "#ffffff"; context.strokeStyle = "#087ba0"; context.lineWidth = 3; [[bounds.x, bounds.y], [bounds.x + bounds.width, bounds.y], [bounds.x, bounds.y + bounds.height], [bounds.x + bounds.width, bounds.y + bounds.height]].forEach(([x, y]) => { context.fillRect(x - 7, y - 7, 14, 14); context.strokeRect(x - 7, y - 7, 14, 14); }); context.restore(); drawWhiteboardSelectionMeasurements(context, selected); }
  drawWhiteboardTitleBar(context, canvas);
  drawWhiteboardRuler(context, canvas);
  drawWhiteboardLaserPreview(context);
  if (whiteboardLassoPoints.length) { context.save(); context.beginPath(); whiteboardLassoPoints.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); if (whiteboardLassoPoints.length > 2 && !whiteboardDrawing) context.closePath(); context.setLineDash([10, 7]); context.strokeStyle = "#d31324"; context.lineWidth = 3; context.shadowColor = "#ffffff"; context.shadowBlur = 4; context.stroke(); context.restore(); }
  syncWhiteboardYouTubeOverlays(canvas);
}

function hydrateWhiteboardImages(after = null) {
  const images = whiteboardObjects.filter((object) => object.type === "image" && object.src && !object.element);
  if (!images.length) { after?.(); return; }
  let remaining = images.length;
  images.forEach((object) => { const image = new Image(); image.onload = () => { object.element = image; remaining -= 1; if (!remaining) after?.(); }; image.src = object.src; });
}

function applyWhiteboardZoom(canvas = whiteboardCanvas()) {
  if (!canvas) return;
  canvas.style.width = `${whiteboardZoom}%`;
  canvas.style.height = `${whiteboardZoom}%`;
  const output = document.querySelector("[data-whiteboard-zoom-output]");
  const control = document.querySelector("[data-whiteboard-zoom]");
  if (output) output.textContent = `${whiteboardZoom}%`;
  if (control) control.value = String(whiteboardZoom);
}

function applyWhiteboardControlsLayout({ resizeCanvas = false } = {}) {
  const display = document.querySelector("#platform-classroom-whiteboard");
  if (!display) return;
  display.dataset.controlsDock = whiteboardControlsDock;
  display.dataset.controlsHidden = String(whiteboardControlsHidden);
  display.dataset.pageDock = whiteboardPageDock;
  const dock = display.querySelector("[data-whiteboard-controls-dock]"); if (dock) dock.value = whiteboardControlsDock;
  const pageDock = display.querySelector("[data-whiteboard-page-dock]"); if (pageDock) pageDock.value = whiteboardPageDock;
  const toggle = display.querySelector('[data-action="whiteboard-toggle-controls"]');
  if (toggle) { toggle.textContent = whiteboardControlsHidden ? "Show Board Menus" : "Hide Board Menus"; toggle.setAttribute("aria-expanded", String(!whiteboardControlsHidden)); }
  if (resizeCanvas) window.requestAnimationFrame(() => {
    const canvas = whiteboardCanvas(), surface = canvas?.parentElement;
    if (!canvas || !surface) return;
    canvas.width = Math.max(900, Math.round(surface.clientWidth || 900)); canvas.height = Math.max(520, Math.round(surface.clientHeight || 520));
    renderWhiteboardObjects(canvas); applyWhiteboardZoom(canvas);
  });
}

function mountWhiteboard() {
  const canvas = whiteboardCanvas();
  if (!canvas || canvas.dataset.mounted === "true") return;
  canvas.dataset.mounted = "true";
  const quickActions = document.querySelector(".platform-whiteboard-quick-actions");
  const drawingToolbar = document.querySelector(".platform-whiteboard-toolbar");
  if (quickActions && drawingToolbar) {
    const selectPanel = quickActions.querySelector("[data-whiteboard-select-panel]");
    const penPanel = quickActions.querySelector("[data-whiteboard-pen-panel]");
    const textPanel = quickActions.querySelector("[data-whiteboard-text-panel]");
    const emojiPanel = quickActions.querySelector("[data-whiteboard-emoji-panel]");
    const measurePanel = quickActions.querySelector("[data-whiteboard-measure-panel]");
    const morePanel = quickActions.querySelector("[data-whiteboard-more-panel]");
    const measurementControls = [
      drawingToolbar.querySelector("[data-whiteboard-grid]")?.closest("label"),
      drawingToolbar.querySelector("[data-whiteboard-ruler]")?.closest("label"),
      drawingToolbar.querySelector('[data-whiteboard-quick-tool="ruler-adjust"]'),
      drawingToolbar.querySelector("[data-whiteboard-ruler-sides]")?.closest("label"),
      drawingToolbar.querySelector("[data-whiteboard-compare-unit]"),
      drawingToolbar.querySelector("[data-whiteboard-zoom]")?.closest("label")
    ].filter(Boolean);
    const selectControls = [drawingToolbar.querySelector("[data-whiteboard-image]")?.closest("label"), drawingToolbar.querySelector(".platform-whiteboard-youtube-control"), drawingToolbar.querySelector(".platform-whiteboard-object-actions"), drawingToolbar.querySelector("[data-whiteboard-lasso-actions]")].filter(Boolean);
    const shapeControls = [drawingToolbar.querySelector(".platform-whiteboard-push-help-wrap")].filter(Boolean);
    const colorControls = [drawingToolbar.querySelector("[data-whiteboard-color]")?.closest("label")].filter(Boolean);
    const penControls = [drawingToolbar.querySelector("[data-whiteboard-size]")?.closest("label")].filter(Boolean);
    const textControls = [drawingToolbar.querySelector("[data-whiteboard-text-background]")?.closest("label"), drawingToolbar.querySelector("[data-whiteboard-cursive-lines]")?.closest("label"), drawingToolbar.querySelector("[data-whiteboard-cursive-coach]")?.closest("label"), drawingToolbar.querySelector("[data-whiteboard-touch-practice]")?.closest("label")].filter(Boolean);
    const emojiControls = [drawingToolbar.querySelector("[data-whiteboard-emoji-label]")].filter(Boolean);
    drawingToolbar.querySelectorAll('[data-action="whiteboard-undo"], [data-action="whiteboard-redo"]').forEach((button) => button.remove());
    selectPanel?.append(...selectControls);
    document.querySelector("[data-whiteboard-shapes-panel]")?.append(...shapeControls);
    document.querySelector("[data-whiteboard-color-panel]")?.append(...colorControls);
    penPanel?.append(...penControls);
    textPanel?.append(...textControls);
    emojiPanel?.append(...emojiControls);
    measurePanel?.append(...measurementControls);
    morePanel?.append(...drawingToolbar.children);
    drawingToolbar.remove();
  }
  document.querySelectorAll(".platform-whiteboard-quick-menu").forEach((menu) => {
    let closeTimer = null;
    const cancelClose = () => { if (closeTimer) window.clearTimeout(closeTimer); closeTimer = null; };
    const scheduleClose = () => { cancelClose(); closeTimer = window.setTimeout(() => { if (!menu.matches(":hover, :focus-within")) menu.removeAttribute("open"); }, 300); };
    menu.addEventListener("mouseenter", () => { cancelClose(); menu.open = true; });
    menu.addEventListener("mouseleave", scheduleClose);
    menu.addEventListener("focusout", scheduleClose);
    menu.querySelector("summary")?.addEventListener("click", () => {
      const primaryTool = menu.dataset.whiteboardPrimaryTool;
      if (!primaryTool) return;
      if (primaryTool !== "text") cancelPendingWhiteboardTextEntry();
      whiteboardDeleteNextObject = false;
      const tool = document.querySelector("[data-whiteboard-tool]");
      if (tool) { tool.value = primaryTool; tool.dispatchEvent(new Event("change", { bubbles: true })); }
      document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === primaryTool)));
      whiteboardCanvas()?.focus({ preventScroll: true }); setWhiteboardStatus(primaryTool === "select" ? "Select and move is active." : primaryTool === "text" ? "Text is active. Click anywhere on the whiteboard to start typing." : "Pen is active. Drag anywhere on the whiteboard to draw.");
    });
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      document.querySelectorAll(".platform-whiteboard-quick-menu[open]").forEach((other) => { if (other !== menu) other.removeAttribute("open"); });
      const bounds = menu.querySelector("summary")?.getBoundingClientRect();
      const panel = menu.querySelector(":scope > div");
      if (bounds && panel) {
        const panelWidth = Math.min(menu.matches("[data-whiteboard-more-menu]") ? 448 : 240, window.innerWidth - 16);
        menu.style.setProperty("--quick-menu-left", `${Math.max(8, Math.min(window.innerWidth - panelWidth - 8, bounds.left))}px`);
        menu.style.setProperty("--quick-menu-top", `${bounds.bottom - 1}px`);
      }
    });
  });
  const surface = canvas.parentElement; canvas.width = Math.max(900, Math.round(surface.clientWidth || 900)); canvas.height = Math.max(520, Math.round(surface.clientHeight || 520));
  try {
    const pageState = JSON.parse(window.sessionStorage.getItem(WHITEBOARD_PAGES_SESSION_KEY) ?? "null");
    if (Array.isArray(pageState?.pages) && pageState.pages.length) {
      whiteboardPages = pageState.pages.map((page, index) => ({ id: page.id || `page-${index}`, title: String(page.title || `Page ${index + 1}`).slice(0, 40), objects: Array.isArray(page.objects) ? page.objects : [] }));
      whiteboardCurrentPageIndex = Math.min(Math.max(0, Number(pageState.currentPageIndex) || 0), whiteboardPages.length - 1);
      whiteboardObjects = structuredClone(whiteboardPages[whiteboardCurrentPageIndex].objects);
    } else {
      whiteboardObjects = JSON.parse(window.sessionStorage.getItem(WHITEBOARD_OBJECT_SESSION_KEY) ?? "[]");
      whiteboardPages = [{ ...newWhiteboardPage("Page 1"), objects: structuredClone(whiteboardObjects) }];
      whiteboardCurrentPageIndex = 0;
    }
  } catch { whiteboardObjects = []; whiteboardPages = [newWhiteboardPage("Page 1")]; whiteboardCurrentPageIndex = 0; }
  try { const view = JSON.parse(window.sessionStorage.getItem(WHITEBOARD_VIEW_SESSION_KEY) ?? "{}"); whiteboardGridUnit = ["plain", "inch", "cm", "mm"].includes(view.gridUnit) ? view.gridUnit : "plain"; whiteboardRulerUnit = ["none", "english", "metric"].includes(view.rulerUnit) ? view.rulerUnit : "none"; whiteboardZoom = Math.min(300, Math.max(50, Number(view.zoom) || 100)); whiteboardRuler = view.ruler && typeof view.ruler === "object" ? { ...whiteboardRuler, ...view.ruler } : { ...whiteboardRuler, y: canvas.height - 92 }; whiteboardDrawingTitle = String(view.title || "Workshop Drawing").slice(0, 60); whiteboardControlsDock = ["top", "left", "right", "bottom"].includes(view.controlsDock) ? view.controlsDock : "top"; whiteboardControlsHidden = Boolean(view.controlsHidden); whiteboardPageDock = ["left", "right", "hidden"].includes(view.pageDock) ? view.pageDock : "left"; if (view.background) whiteboardBackground = { ...whiteboardBackground, ...view.background, element: null }; } catch { whiteboardGridUnit = "plain"; whiteboardRulerUnit = "none"; whiteboardZoom = 100; whiteboardDrawingTitle = "Workshop Drawing"; whiteboardControlsDock = "top"; whiteboardControlsHidden = false; whiteboardPageDock = "left"; }
  if (whiteboardBackground.imageSrc) { const backgroundImage = new Image(); backgroundImage.onload = () => { whiteboardBackground.element = backgroundImage; renderWhiteboardObjects(); }; backgroundImage.src = whiteboardBackground.imageSrc; }
  const gridControl = document.querySelector("[data-whiteboard-grid]"); const rulerControl = document.querySelector("[data-whiteboard-ruler]"); const rulerSides = document.querySelector("[data-whiteboard-ruler-sides]"); if (gridControl) gridControl.value = whiteboardGridUnit; if (rulerControl) rulerControl.value = whiteboardRulerUnit; if (rulerSides) rulerSides.value = whiteboardRuler.sides; applyWhiteboardControlsLayout({ resizeCanvas: true }); applyWhiteboardZoom(canvas);
  if (!whiteboardObjects.length) { let legacy = ""; try { legacy = window.sessionStorage.getItem(WHITEBOARD_SESSION_KEY) ?? ""; } catch {} if (legacy) whiteboardObjects = [createWhiteboardObject("image", { x: 0, y: 0, width: canvas.width, height: canvas.height, src: legacy })]; }
  whiteboardObjects = whiteboardObjects.filter((object) => !isAccidentalWhiteboardDot(object));
  if (whiteboardPages[whiteboardCurrentPageIndex]) whiteboardPages[whiteboardCurrentPageIndex].objects = structuredClone(serializableWhiteboardObjects());
  renderWhiteboardPageStrip(); hydrateWhiteboardImages(() => renderWhiteboardObjects(canvas)); renderWhiteboardObjects(canvas);
  try { if (window.sessionStorage.getItem(WHITEBOARD_BOB_MEASUREMENT_COACH_KEY) === "seen") showWhiteboardBobMeasurementCoach(); } catch {}
  const start = (event) => {
    if (event.button !== undefined && event.button !== 0) return; event.preventDefault(); canvas.focus({ preventScroll: true });
    const point = whiteboardPoint(event, canvas), tool = document.querySelector("[data-whiteboard-tool]")?.value ?? "select";
    const selected = hitTestObjects(whiteboardObjects.filter((object) => object.strokeStyle !== "eraser"), point);
    const activeSelected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    const activeResizeCorner = activeSelected && activeSelected.type !== "dimension" ? whiteboardResizeCorner(objectBounds(activeSelected), point) : "";
    if (!whiteboardDeleteNextObject && activeSelected && activeResizeCorner) {
      pushWhiteboardHistory(); whiteboardDrawing = { tool: "select", objectId: activeSelected.id, start: point, original: cloneEditableWhiteboardObject(activeSelected), resize: true, resizeCorner: activeResizeCorner };
      canvas.setPointerCapture?.(event.pointerId); setWhiteboardStatus("Drag the selected corner to resize the object."); return;
    }
    if (!selected && whiteboardSelectedObjectId) { whiteboardSelectedObjectId = ""; syncWhiteboardDimensionCompareControl(); renderWhiteboardObjects(canvas); }
    if (whiteboardDeleteNextObject) {
      if (!selected) { setWhiteboardStatus("Delete is ready. Click the object you want to remove."); return; }
      pushWhiteboardHistory(); whiteboardObjects = whiteboardObjects.filter((object) => object.id !== selected.id); whiteboardSelectedObjectId = ""; whiteboardDeleteNextObject = false;
      const selectTool = document.querySelector("[data-whiteboard-tool]"); if (selectTool) { selectTool.value = "select"; selectTool.dispatchEvent(new Event("change", { bubbles: true })); }
      document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === "select")));
      renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls(); setWhiteboardStatus("Object deleted. Select and move is active again."); return;
    }
    const directTools = !["lasso-select", "emoji-stamp", "pull-3d", "laser-dimension", "fill", "eraser", "erase-object"].includes(tool);
    if (directTools && whiteboardRulerUnit !== "none") {
      const local = whiteboardRulerLocalPoint(point);
      const nearExtend = Math.hypot(local.x - whiteboardRuler.length, local.y - 31) < 28;
      const nearRotate = Math.hypot(local.x - whiteboardRuler.length, local.y + 24) < 28;
      const onRuler = local.x >= 0 && local.x <= whiteboardRuler.length && local.y >= 0 && local.y <= 62;
      if (nearExtend || nearRotate || onRuler) {
        whiteboardDrawing = { tool: "ruler-adjust", mode: nearRotate ? "rotate" : nearExtend ? "extend" : "move", start: point, originalRuler: structuredClone(whiteboardRuler) };
        canvas.setPointerCapture?.(event.pointerId); setWhiteboardStatus("Ruler selected directly. Drag to place it where you want."); return;
      }
    }
    if (tool === "text") {
      openWhiteboardTextEntry(point, canvas); return;
    }
    if (tool === "lasso-select") {
      whiteboardLassoPoints = [point]; whiteboardLassoBounds = null; whiteboardSelectionDownload = "";
      whiteboardDrawing = { tool, start: point }; canvas.setPointerCapture?.(event.pointerId); renderWhiteboardObjects(canvas); setWhiteboardStatus("Drag around the work you want to turn into an image."); return;
    }
    if (tool === "emoji-stamp") {
      const emoji = document.querySelector("[data-whiteboard-emoji]")?.value || "😀";
      const fontSize = Math.max(42, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 3);
      pushWhiteboardHistory();
      const stamp = createWhiteboardObject("text", { text: emoji, emojiStamp: true, x: point.x - fontSize / 2, y: point.y - fontSize / 2, width: fontSize * 1.25, height: fontSize * 1.25, fontSize, color: "#12384d", background: "transparent", rotation: 0 });
      whiteboardObjects.push(stamp); whiteboardSelectedObjectId = stamp.id; renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls();
      setWhiteboardStatus(`${emoji} emoji stamped. Drag it to move, resize, rotate, copy, or delete it.`); return;
    }
    if (tool === "pull-3d") {
      if (!selected || ![...WHITEBOARD_CLOSED_2D_SHAPES, "text", "path", "line", "arrow"].includes(selected.type) || selected.strokeStyle === "eraser") { setWhiteboardStatus("Select a shape, highlighted text box, drawing, or line to make it 3D."); return; }
      pushWhiteboardHistory(); whiteboardSelectedObjectId = selected.id; whiteboardDrawing = { tool, objectId: selected.id, start: point, original: cloneEditableWhiteboardObject(selected) }; canvas.setPointerCapture?.(event.pointerId); return;
    }
    if (tool === "laser-dimension") {
      if (!whiteboardPendingDimension?.start) { whiteboardPendingDimension = { start: point, current: point, attempts: 0 }; renderWhiteboardObjects(canvas); setWhiteboardStatus("Laser point 1 selected. Move the glowing laser to the second point, then select it."); return; }
      whiteboardPendingDimension.end = point;
      whiteboardPendingDimension.current = point;
      renderWhiteboardObjects(canvas);
      const unit = whiteboardGridUnit === "inch" ? "in" : whiteboardGridUnit === "mm" ? "mm" : "cm";
      const unitControl = document.querySelector("[data-whiteboard-dimension-unit]"); if (unitControl) unitControl.value = unit;
      const tip = document.querySelector("[data-whiteboard-measurement-tip]"); if (tip) { tip.hidden = true; tip.textContent = ""; }
      const question = document.querySelector("[data-whiteboard-dimension-question]"); if (question) question.hidden = false;
      setWhiteboardStatus("Two points selected. Answer the measurement question to add the CAD dimension.");
      return;
    }
    if (tool === "ruler-adjust") {
      if (whiteboardRulerUnit === "none") { setWhiteboardStatus("Choose an English or metric ruler first."); return; }
      const local = whiteboardRulerLocalPoint(point);
      const nearExtend = Math.hypot(local.x - whiteboardRuler.length, local.y - 31) < 28;
      const nearRotate = Math.hypot(local.x - whiteboardRuler.length, local.y + 24) < 28;
      if (nearExtend || nearRotate || (local.x >= 0 && local.x <= whiteboardRuler.length && local.y >= 0 && local.y <= 62)) {
        whiteboardDrawing = { tool, mode: nearRotate ? "rotate" : nearExtend ? "extend" : "move", start: point, originalRuler: structuredClone(whiteboardRuler) };
      }
      return;
    }
    if (tool === "select") { whiteboardSelectedObjectId = selected?.id ?? ""; if (selected) { pushWhiteboardHistory(); const bounds = objectBounds(selected); const resizeCorner = selected.type !== "dimension" ? whiteboardResizeCorner(bounds, point) : ""; whiteboardDrawing = { tool, objectId: selected.id, start: point, original: cloneEditableWhiteboardObject(selected), resize: Boolean(resizeCorner), resizeCorner }; if (selected.type === "dimension") setWhiteboardStatus("Drag the red measurement to the object perimeter, or choose its comparison unit above."); } syncWhiteboardDimensionCompareControl(); renderWhiteboardObjects(canvas); return; }
    if (tool === "fill") { if (selected && [...WHITEBOARD_CLOSED_2D_SHAPES, "cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(selected.type)) { pushWhiteboardHistory(); selected.fillColor = document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d"; whiteboardSelectedObjectId = selected.id; renderWhiteboardObjects(canvas); saveWhiteboard(canvas); setWhiteboardStatus("Shape filled. Use Undo to restore its previous color."); } else setWhiteboardStatus("Use the Paint Can on a closed 2D or 3D shape."); return; }
    if (tool === "erase-object") {
      if (!selected) { setWhiteboardStatus("Click a connected drawing, line, or filled shape to erase the whole object."); return; }
      const connectedIds = connectedWhiteboardObjectIds(selected);
      pushWhiteboardHistory(); whiteboardObjects = whiteboardObjects.filter((object) => !connectedIds.has(object.id)); whiteboardSelectedObjectId = "";
      renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls(); setWhiteboardStatus(`${connectedIds.size === 1 ? "Object" : "Connected objects"} erased. Use Undo to restore ${connectedIds.size === 1 ? "it" : "them"}.`); return;
    }
    if (tool === "eraser") {
      pushWhiteboardHistory();
      const size = Number(document.querySelector("[data-whiteboard-eraser-size]")?.value ?? 40);
      const object = createWhiteboardObject("path", { points: [point], color: "#ffffff", size, opacity: 1, strokeStyle: "eraser" });
      whiteboardObjects.push(object); whiteboardSelectedObjectId = "";
      whiteboardDrawing = { tool, objectId: object.id, start: point };
      canvas.setPointerCapture?.(event.pointerId);
      renderWhiteboardObjects(canvas);
      setWhiteboardStatus("Drag the eraser across anything you want to remove."); return;
    }
    pushWhiteboardHistory(); const color = document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d", size = Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6);
    const isDrawingStroke = ["pen", "calligraphy", "brush", "highlighter"].includes(tool);
    const strokeSize = tool === "highlighter" ? size * 2.5 : tool === "brush" ? size * 3 : tool === "calligraphy" ? size * 1.6 : size;
    const object = isDrawingStroke ? createWhiteboardObject("path", { points: [point], color, size: strokeSize, opacity: tool === "highlighter" ? 0.3 : tool === "brush" ? 0.78 : 1, strokeStyle: tool }) : createWhiteboardObject(tool, { x: point.x, y: point.y, width: 1, height: 1, color, size });
    whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; whiteboardDrawing = { tool, objectId: object.id, start: point }; canvas.setPointerCapture?.(event.pointerId);
  };
  const move = (event) => {
    const point = whiteboardPoint(event, canvas);
    if (!whiteboardDrawing) {
      const tool = document.querySelector("[data-whiteboard-tool]")?.value ?? "select";
      if (tool === "laser-dimension" && whiteboardPendingDimension?.start && !whiteboardPendingDimension?.end) { whiteboardPendingDimension.current = point; renderWhiteboardObjects(canvas); }
      return;
    }
    event.preventDefault();
    if (whiteboardDrawing.tool === "lasso-select") { whiteboardLassoPoints.push(point); renderWhiteboardObjects(canvas); return; }
    if (whiteboardDrawing.tool === "ruler-adjust") {
      const original = whiteboardDrawing.originalRuler;
      if (whiteboardDrawing.mode === "move") { whiteboardRuler.x = original.x + point.x - whiteboardDrawing.start.x; whiteboardRuler.y = original.y + point.y - whiteboardDrawing.start.y; }
      else if (whiteboardDrawing.mode === "rotate") whiteboardRuler.angle = Math.atan2(point.y - original.y, point.x - original.x);
      else { const dx = point.x - original.x, dy = point.y - original.y; whiteboardRuler.length = Math.max(150, Math.min(canvas.width * 1.5, dx * Math.cos(original.angle) + dy * Math.sin(original.angle))); }
      renderWhiteboardObjects(canvas); return;
    }
    const index = whiteboardObjects.findIndex((object) => object.id === whiteboardDrawing.objectId);
    if (index < 0) return;
    const object = whiteboardObjects[index];
    if (whiteboardDrawing.tool === "pull-3d") {
      const depth = Math.max(10, Math.min(120, Math.hypot(point.x - whiteboardDrawing.start.x, point.y - whiteboardDrawing.start.y)));
      whiteboardObjects[index] = makeWhiteboardObject3D(whiteboardDrawing.original, depth);
      renderWhiteboardObjects(canvas); return;
    }
    if (whiteboardDrawing.tool === "select") {
      const dx = point.x - whiteboardDrawing.start.x, dy = point.y - whiteboardDrawing.start.y;
      let updated;
      if (whiteboardDrawing.original.type === "dimension" && !whiteboardDrawing.resize) {
        const angle = Math.atan2(whiteboardDrawing.original.height, whiteboardDrawing.original.width);
        updated = { ...whiteboardDrawing.original, annotationOffset: Number(whiteboardDrawing.original.annotationOffset ?? 18) + dx * -Math.sin(angle) + dy * Math.cos(angle) };
      } else updated = whiteboardDrawing.resize ? resizeWhiteboardObjectFromCorner(whiteboardDrawing.original, whiteboardDrawing.resizeCorner, dx, dy) : moveWhiteboardObject(whiteboardDrawing.original, dx, dy);
      if (updated.emojiStamp && whiteboardDrawing.resize) updated.fontSize = Math.max(18, updated.height / 1.25);
      if (object.element) updated.element = object.element;
      whiteboardObjects[index] = updated;
    } else if (object.type === "path") object.points.push(point);
    else { object.width = point.x - whiteboardDrawing.start.x; object.height = point.y - whiteboardDrawing.start.y; }
    renderWhiteboardObjects(canvas);
  };
  const end = () => { if (!whiteboardDrawing) return; const completedTool = whiteboardDrawing.tool, completedObjectId = whiteboardDrawing.objectId; whiteboardDrawing = null; if (completedTool === "lasso-select") { updateWhiteboardLassoBounds(); renderWhiteboardObjects(canvas); const dialog = document.querySelector("[data-whiteboard-lasso-confirmation]"); if (whiteboardLassoBounds && dialog) { dialog.hidden = false; dialog.querySelector('[data-action="whiteboard-lasso-use"]')?.focus(); } setWhiteboardStatus(whiteboardLassoBounds ? "Cutout ready. Choose whether to use it or delete the selected image." : "Draw a larger loop around the work you want to select."); return; } const completedObject = whiteboardObjects.find((object) => object.id === completedObjectId); if (completedTool === "line" && bisectWhiteboardShapeWithLine(completedObject)) { renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls(); setWhiteboardStatus("Shape divided into two independently editable objects along the line."); return; } if (isAccidentalWhiteboardDot(completedObject)) { whiteboardObjects = whiteboardObjects.filter((object) => object.id !== completedObjectId); whiteboardSelectedObjectId = ""; renderWhiteboardObjects(canvas); saveWhiteboard(canvas); setWhiteboardStatus("No mark added. Drag on the board to draw a line or shape."); return; } saveWhiteboard(canvas); setWhiteboardStatus(completedTool === "eraser" ? "Eraser stroke saved. Use Undo to restore the erased area." : "Board saved. Select any object to move, resize, copy, or delete it."); };
  canvas.addEventListener("pointerdown", start); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("dblclick", (event) => { const selected = hitTestObjects(whiteboardObjects.filter((object) => object.strokeStyle !== "eraser"), whiteboardPoint(event, canvas)); if (selected?.type === "text" && !selected.emojiStamp) { event.preventDefault(); whiteboardSelectedObjectId = selected.id; openWhiteboardRichTextEditor(selected, canvas); } });
  canvas.addEventListener("contextmenu", (event) => {
    const point = whiteboardPoint(event, canvas), selected = hitTestObjects(whiteboardObjects.filter((object) => object.strokeStyle !== "eraser"), point);
    if (!selected && !whiteboardClipboard) return;
    event.preventDefault(); whiteboardContextPoint = point;
    if (selected) { whiteboardSelectedObjectId = selected.id; syncWhiteboardDimensionCompareControl(); renderWhiteboardObjects(canvas); }
    const menu = document.querySelector("[data-whiteboard-context-menu]");
    if (menu) { menu.hidden = false; menu.style.left = `${Math.min(event.clientX, window.innerWidth - 180)}px`; menu.style.top = `${Math.min(event.clientY, window.innerHeight - 170)}px`; menu.querySelector('[data-action="whiteboard-copy-image"]').disabled = !selected; menu.querySelector('[data-action="whiteboard-cut-image"]').disabled = !selected; menu.querySelector('[data-action="whiteboard-paste-image"]').disabled = !whiteboardClipboard; menu.querySelector("button:not([disabled])")?.focus(); }
    setWhiteboardStatus(selected ? "Object selected. Choose Copy Image, Cut Image, or Paste Image." : "Choose Paste Image to place the copied object here.");
  });
  updateWhiteboardHistoryControls();
}

function stopVoiceMeter(message = "Voice Meter stopped. No audio was saved.") {
  if (voiceMeterAnimationFrame) window.cancelAnimationFrame(voiceMeterAnimationFrame);
  voiceMeterAnimationFrame = null;
  voiceMeterStream?.getTracks().forEach((track) => track.stop());
  voiceMeterStream = null;
  if (voiceMeterAudioContext && voiceMeterAudioContext.state !== "closed") void voiceMeterAudioContext.close();
  voiceMeterAudioContext = null;
  recordVoiceMeterUse();
  document.querySelectorAll("[data-student-voice-meter]").forEach((meter) => { meter.hidden = true; });
  document.querySelectorAll('[data-action="voice-meter-start"]').forEach((button) => { button.disabled = false; });
  document.querySelectorAll('[data-action="voice-meter-stop"]').forEach((button) => { button.disabled = true; });
  const status = document.querySelector("[data-voice-meter-status]");
  if (status) status.textContent = message;
  document.querySelectorAll("[data-live-voice-status]").forEach((label) => { label.dataset.state = "off"; label.innerHTML = `<span aria-hidden="true"></span> Voice Meter is off`; });
  voiceBobState = "green"; voiceBobStateChangedAt = 0; floatingBobGreenSince = Date.now();
  updateVoiceMeterPresentation(0);
  refreshCurrentClassPlan();
}

async function startVoiceMeter() {
  const status = document.querySelector("[data-voice-meter-status]");
  if (!navigator.mediaDevices?.getUserMedia) {
    if (status) status.textContent = "Voice Meter is not supported in this browser. Open the platform in Chrome.";
    return;
  }
  if (status) status.textContent = "Requesting microphone permission…";
  try {
    voiceMeterStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceBobStateChangedAt = 0; floatingBobGreenSince = Date.now();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    voiceMeterAudioContext = new AudioContextClass();
    const analyser = voiceMeterAudioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.72;
    voiceMeterAudioContext.createMediaStreamSource(voiceMeterStream).connect(analyser);
    beginVoiceMeterUsage();
    const samples = new Uint8Array(analyser.fftSize);
    document.querySelectorAll("[data-student-voice-meter]").forEach((meter) => { meter.hidden = !studentDisplayVoiceMeterIsEnabled(); });
    document.querySelectorAll('[data-action="voice-meter-start"]').forEach((button) => { button.disabled = true; });
    document.querySelectorAll('[data-action="voice-meter-stop"]').forEach((button) => { button.disabled = false; });
    if (status) status.textContent = "Voice Meter is listening. Audio is analyzed live and never saved.";
    document.querySelectorAll("[data-live-voice-status]").forEach((label) => { label.dataset.state = "on"; label.innerHTML = `<span aria-hidden="true"></span> Voice Meter is on and listening`; });
    const sample = () => {
      if (!voiceMeterAudioContext || !voiceMeterStream) return;
      analyser.getByteTimeDomainData(samples);
      const level = Math.max(0, Math.min(100, Math.round(rmsToVoiceLevel(samples) * voiceMeter.readSensitivity() / 100)));
      const sampledAt = Date.now();
      const elapsed = Math.min(250, Math.max(0, sampledAt - voiceMeterUsage.lastSampleAt));
      const change = Math.abs(level - voiceMeterUsage.previousLevel);
      const detectedMode = level <= 22 ? "independent" : (level <= 58 && change <= 9 ? "teacher-led" : "collaborative");
      voiceMeterUsage.detectedSeconds[detectedMode] += elapsed / 1000;
      voiceMeterUsage.goalMilliseconds += elapsed;
      if (level > voiceMeterUsage.target) voiceMeterUsage.loudMilliseconds += elapsed;
      voiceMeterUsage.lastSampleAt = sampledAt;
      voiceMeterUsage.previousLevel = level;
      voiceMeterUsage.total += level;
      voiceMeterUsage.count += 1;
      voiceMeterUsage.peak = Math.max(voiceMeterUsage.peak, level);
      updateVoiceMeterPresentation(level);
      voiceMeterAnimationFrame = window.requestAnimationFrame(sample);
    };
    sample();
  } catch {
    stopVoiceMeter("Microphone permission is blocked. Allow microphone access, then try again.");
  }
}

async function startReflectionDictation(button) {
  const form = button.closest('[data-form="weekly-reflection"]');
  const field = form?.elements.explanation;
  const status = form?.querySelector("[data-reflection-speech-status]");
  const stopButton = form?.querySelector('[data-action="reflection-dictate-stop"]');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!form || !field || !status) return;
  if (!Recognition) {
    status.textContent = "Speak Answer is not supported in this browser. Open the platform in Chrome or type your answer.";
    return;
  }
  if (reflectionRecognition) {
    reflectionRecognition.stop();
    return;
  }
  button.disabled = true;
  button.setAttribute("aria-pressed", "true");
  status.textContent = "Requesting microphone permission…";
  try {
    if (navigator.mediaDevices?.getUserMedia) {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());
    }
  } catch {
    button.disabled = false;
    button.setAttribute("aria-pressed", "false");
    status.textContent = "Microphone permission is blocked. Allow microphone access in the browser, then try again.";
    return;
  }
  const recognition = new Recognition();
  reflectionRecognition = recognition;
  const answerBeforeListening = field.value.trim();
  recognition.lang = document.documentElement.lang || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  button.hidden = true;
  if (stopButton) stopButton.hidden = false;
  status.textContent = "Start speaking now — listening.";
  recognition.onresult = (event) => {
    const spoken = Array.from(event.results ?? [])
      .filter((result) => result.isFinal !== false)
      .map((result) => String(result?.[0]?.transcript ?? "").trim())
      .filter(Boolean)
      .join(" ");
    if (!spoken) return;
    field.value = `${answerBeforeListening}${answerBeforeListening ? " " : ""}${spoken}`.slice(0, 500);
    field.focus();
    status.textContent = "Your spoken answer was added. Check it before submitting.";
  };
  recognition.onerror = (event) => {
    const permissionError = event.error === "not-allowed" || event.error === "service-not-allowed";
    status.textContent = permissionError
      ? "Microphone permission is blocked. Allow microphone access in the browser, then try again."
      : "I couldn't hear that. Try again or type your answer.";
  };
  recognition.onend = () => {
    reflectionRecognition = null;
    button.disabled = false;
    button.hidden = false;
    if (stopButton) stopButton.hidden = true;
    button.setAttribute("aria-pressed", "false");
    if (status.textContent === "Start speaking now — listening.") status.textContent = "Listening stopped. No words were added; try again or type your answer.";
  };
  try {
    recognition.start();
  } catch {
    reflectionRecognition = null;
    button.disabled = false;
    button.hidden = false;
    if (stopButton) stopButton.hidden = true;
    button.setAttribute("aria-pressed", "false");
    status.textContent = "Speak Answer could not start. Try Chrome or type your answer.";
  }
}

function closeQuickMessageBoard() {
  const panel = document.querySelector("[data-message-board-quick-panel]");
  const home = document.querySelector("[data-message-board-home]");
  const board = document.querySelector("#teacher-message-board");
  if (home && board) home.append(board);
  if (panel) panel.hidden = true;
}

function closeQuickClassSchedule() {
  const panel = document.querySelector("[data-class-schedule-quick-panel]");
  const storage = document.querySelector("[data-class-schedule-storage]");
  const schedule = document.querySelector("#teacher-class-schedule");
  if (storage && schedule) storage.append(schedule);
  if (panel) panel.hidden = true;
}

async function handleClick(event) {
  const lockedRegion = event.target.closest(".is-captains-log-locked");
  const lockedControl = event.target.closest("a, button, input, select, textarea");
  const lockedAction = lockedControl?.dataset.action ?? "";
  const allowedWhileLocked = lockedAction.startsWith("read-") || lockedControl?.classList.contains("platform-student-listen-button");
  if (lockedRegion && lockedControl && !allowedWhileLocked) {
    event.preventDefault();
    document.querySelector("#reflection-check-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.promptLocked === "true") {
    event.preventDefault();
    document.querySelector("#reflection-check-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action.dataset.action === "start-due-captains-log") {
    const reminder = document.querySelector("[data-student-captains-log-reminder]");
    if (reminder) reminder.hidden = true;
    const form = document.querySelector(".platform-student-reflection-form");
    if (form) form.open = true;
    document.querySelector("#reflection-check-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => form?.querySelector("select, textarea, input")?.focus(), 350);
    return;
  }
  if (action.dataset.action === "open-captains-log-planner") {
    const planner = document.querySelector(".platform-captains-log-planner");
    if (planner) planner.open = true;
    planner?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => planner?.querySelector("[data-captains-log-editor-week]")?.focus(), 350);
    return;
  }
  if (action.dataset.action === "dismiss-captains-log-reminder") {
    const reminder = action.closest("[data-student-captains-log-reminder]");
    if (reminder) { reminder.hidden = true; reminder.dataset.dismissed = "true"; }
    return;
  }
  if (action.dataset.action === "dismiss-student-phase-change") {
    const popup = action.closest("[data-student-phase-change]");
    if (popup) popup.hidden = true;
    if (studentPhasePopupTimeout !== null) window.clearTimeout(studentPhasePopupTimeout);
    studentPhasePopupTimeout = null;
    return;
  }
  if (action.dataset.action === "show-vocabulary-definition") {
    const word = action.dataset.vocabularyWord;
    const help = document.querySelector("[data-student-vocabulary-help]");
    const wordLabel = help?.querySelector("[data-student-vocabulary-word]");
    const definition = help?.querySelector("[data-student-vocabulary-definition]");
    if (wordLabel) wordLabel.textContent = action.textContent;
    if (definition) definition.textContent = STUDENT_VOCABULARY[word] ?? "Ask your teacher about this word.";
    if (help) { help.hidden = false; help.querySelector("button")?.focus(); }
    return;
  }
  if (action.dataset.action === "close-vocabulary-definition") {
    const help = action.closest("[data-student-vocabulary-help]");
    if (help) help.hidden = true;
    return;
  }
  if (action.dataset.action === "toggle-captains-log-thinking-help") {
    const help = action.nextElementSibling;
    const opening = Boolean(help?.hidden);
    if (help) help.hidden = !opening;
    action.setAttribute("aria-expanded", String(opening));
    action.textContent = opening ? "Hide what I need to think about" : "Show what I need to think about";
    return;
  }
  if (action.dataset.action === "generate-namebobs") {
    const form = action.closest('[data-form="production-classroom-setup"]');
    const textarea = form?.elements.studentLabels;
    const status = form?.querySelector("[data-namebob-status]");
    if (!textarea) return;
    const usedLabels = productionTeacherClasses.flatMap((classroom) => Array.isArray(classroom.studentLabels) ? classroom.studentLabels : []);
    const generated = generateNameBobs(textarea.value, { usedLabels });
    if (!generated.labels.length) {
      if (status) status.textContent = "Enter or paste at least one student first name.";
      textarea.focus();
      return;
    }
    textarea.value = generated.labels.join("\n");
    if (status) status.textContent = `${generated.labels.length} unique NameBob${generated.labels.length === 1 ? "" : "s"} generated. Review or edit them before creating the class.`;
    textarea.focus();
    return;
  }
  if (action.dataset.action === "retry-namebob") {
    const form = action.closest('[data-form="production-classroom-setup"]');
    const textarea = form?.elements.studentLabels;
    const retryInput = form?.elements.retryName;
    const status = form?.querySelector("[data-namebob-status]");
    if (!textarea || !retryInput) return;
    const usedLabels = productionTeacherClasses.flatMap((classroom) => Array.isArray(classroom.studentLabels) ? classroom.studentLabels : []);
    const result = retryNameBob(retryInput.value, textarea.value.split(/\r?\n/), { usedLabels });
    if (!result.ok) {
      if (status) status.textContent = result.reason === "student-not-found" ? "That first name is not in the generated list. Check the spelling and try again." : "Enter one student's first name to retry it.";
      retryInput.focus();
      return;
    }
    textarea.value = result.labels.join("\n");
    retryInput.value = "";
    if (status) status.textContent = `${result.firstName}'s new NameBob is ${result.label}. Retry again or keep it.`;
    retryInput.focus();
    return;
  }
  if (action.dataset.action === "generate-class-namebob-limerick") {
    const form = action.closest('[data-form="production-classroom-setup"]');
    const textarea = form?.elements.studentLabels;
    const output = form?.querySelector("[data-namebob-limerick-output]");
    const status = form?.querySelector("[data-namebob-status]");
    if (!textarea || !output) return;
    const result = generateAllNameBobLimericks(textarea.value.split(/\r?\n/));
    if (!result.ok) {
      output.hidden = true;
      if (status) status.textContent = "Enter or paste the class names first.";
      textarea.focus();
      return;
    }
    output.textContent = [`OUR CLASS LIMERICK\n${result.limerick}`, ...result.studentLimericks.map((item) => `${item.label}\n${item.limerick}`)].join("\n\n");
    output.hidden = false;
    if (status) status.textContent = `Created one class limerick and ${result.studentLimericks.length} student limericks.`;
    action.focus();
    return;
  }
  if (action.dataset.action === "open-student-quest-step") {
    const map = action.closest(".platform-student-quest-map");
    map?.querySelectorAll(".platform-student-quest-stop").forEach((stop, index) => {
      const status = stop.querySelector("[data-student-quest-status]");
      stop.classList.toggle("is-current", stop === action);
      if (stop === action) {
        stop.setAttribute("aria-current", "step");
        if (status) status.textContent = "You are here";
      } else {
        stop.removeAttribute("aria-current");
        if (status) status.textContent = index < Number(action.querySelector(".platform-student-quest-number")?.textContent || 1) - 1 ? "Visited" : index === 3 ? "Finish here" : index === 2 ? "Then" : "Next";
      }
    });
    return;
  }
  if (action.dataset.action === "open-student-calendar-day") {
    const detail = action.closest(".platform-student-calendar")?.querySelector("[data-student-calendar-detail]");
    if (!detail) return;
    const symbol = action.dataset.calendarToday === "true" ? "TODAY" : action.dataset.calendarWork === "true" ? "SAVED" : "—";
    detail.querySelector("strong").textContent = `${symbol} ${action.dataset.calendarDate}`;
    detail.querySelector("span").textContent = action.dataset.calendarWork === "true" ? `Main activity: ${action.dataset.calendarActivity}` : "No saved work";
    const activityLink = detail.querySelector("[data-student-calendar-activity-link]");
    if (activityLink) { activityLink.hidden = action.dataset.calendarWork !== "true"; activityLink.href = action.dataset.calendarUrl || "#student-todays-activities"; }
    action.closest(".platform-student-calendar-days")?.querySelectorAll(".is-selected").forEach((day) => day.classList.remove("is-selected"));
    action.classList.add("is-selected");
    return;
  }
  if (action.dataset.action === "read-student-section") {
    const section = action.closest("section, article, details");
    if (!section || !("speechSynthesis" in window)) { action.textContent = "Listening unavailable"; return; }
    if (window.speechSynthesis.speaking && action.getAttribute("aria-pressed") === "true") {
      window.speechSynthesis.cancel();
      action.setAttribute("aria-pressed", "false");
      action.textContent = "Listen";
      return;
    }
    window.speechSynthesis.cancel();
    document.querySelectorAll('[data-action="read-student-section"][aria-pressed="true"]').forEach((button) => { button.setAttribute("aria-pressed", "false"); button.textContent = "Listen"; });
    const copy = section.cloneNode(true);
    copy.querySelectorAll("section, article, nav, form, details, button, [aria-hidden='true'], [hidden]").forEach((element) => element.remove());
    const text = copy.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    const message = new SpeechSynthesisUtterance(text);
    message.rate = 0.86;
    message.onend = () => { action.setAttribute("aria-pressed", "false"); action.textContent = "Listen"; };
    action.setAttribute("aria-pressed", "true");
    action.textContent = "■ Stop";
    window.speechSynthesis.speak(message);
    return;
  }
  if (action.dataset.action === "read-student-launches") {
    const status = action.closest(".platform-school-start-launcher")?.querySelector("[data-student-launch-listen-status]");
    if (!("speechSynthesis" in window)) { if (status) status.textContent = "Listening is not available on this device."; return; }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      action.setAttribute("aria-pressed", "false");
      action.textContent = "Listen";
      if (status) status.textContent = "Reading stopped.";
      return;
    }
    const sidePathWords = action.dataset.sidePathAssigned === "true" ? "Current Side Path. Open your assigned directions." : "Current Side Path is not assigned yet.";
    const message = new SpeechSynthesisUtterance(`${sidePathWords} STEM Builder. Build and test your idea. STEM Workshop. Open your class workshop.`);
    message.rate = 0.86;
    message.onend = () => { action.setAttribute("aria-pressed", "false"); action.textContent = "Listen"; if (status) status.textContent = "Choose the tool you need."; };
    action.setAttribute("aria-pressed", "true");
    action.textContent = "■ Stop";
    if (status) status.textContent = "Reading the choices aloud.";
    window.speechSynthesis.speak(message);
    return;
  }
  if (action.dataset.action === "open-do-now-editor" || action.dataset.action === "edit-do-now") { openDoNowEditor(readLiveDoNow() || readDoNowPosts().find((item) => item.classId === currentDoNowClassId()) || null); return; }
  if (action.dataset.action === "close-do-now-editor") { action.closest("[data-do-now-editor]")?.remove(); return; }
  if (action.dataset.action === "save-do-now") { saveDoNowDraft(false); return; }
  if (action.dataset.action === "show-do-now") { saveDoNowDraft(true); return; }
  if (action.dataset.action === "copy-do-now") { updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]")); doNowDraft = { ...structuredClone(doNowDraft), id: `do-now-${Date.now()}`, title: `${doNowDraft.title} — Copy`, savedAt: Date.now(), live: false }; openDoNowEditor(doNowDraft); const status = document.querySelector("[data-do-now-status]"); if (status) status.textContent = "Copy created. Change it as needed, then save it."; return; }
  if (action.dataset.action === "hide-do-now") { window.sessionStorage.removeItem(DO_NOW_LIVE_KEY); syncDoNowPresentation(null); return; }
  if (action.dataset.action === "add-do-now-box") { updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]")); doNowDraft.boxes.push({ id: `box-${Date.now()}`, text: "Add your next direction.", color: "#12384d", size: 28, font: "Arial", bold: false, italic: false, underline: false, backgroundType: "solid", background1: "#ffffff", background2: "#ffffff" }); openDoNowEditor(doNowDraft); return; }
  if (action.dataset.action === "remove-do-now-box") { updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]")); doNowDraft.boxes.splice(Number(action.closest("[data-do-now-box]")?.dataset.doNowBox), 1); openDoNowEditor(doNowDraft); return; }
  if (action.dataset.action === "do-now-toggle-format") { const box = doNowDraft?.boxes[Number(action.closest("[data-do-now-box]")?.dataset.doNowBox)]; if (box) { box[action.dataset.format] = !box[action.dataset.format]; action.setAttribute("aria-pressed", String(box[action.dataset.format])); updateDoNowDraftFromEditor(action.closest("[data-do-now-editor]")); } return; }
  if (action.dataset.action === "remove-do-now-image") { if (doNowDraft) doNowDraft.image = ""; openDoNowEditor(doNowDraft); return; }
  if (action.dataset.action === "load-do-now") { const id = action.closest("[data-do-now-editor]")?.querySelector("[data-do-now-saved]")?.value; const post = readDoNowPosts().find((item) => item.id === id); if (post) openDoNowEditor(post); return; }
  if (action.dataset.action === "delete-do-now") { const editor = action.closest("[data-do-now-editor]"), id = editor?.querySelector("[data-do-now-saved]")?.value; if (id && window.confirm("Delete this saved Do Now Post?")) { writeDoNowPosts(readDoNowPosts().filter((item) => item.id !== id)); openDoNowEditor(); } return; }
  if (handleNamePickerAction(action, document)) return;
  if (handleActivitySideTimerAction(action)) return;
  if (action.dataset.action === "assign-research-bank-group") { const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id, group = readTeacherResearchLinkBank().find((item) => item.id === action.dataset.researchGroupId); if (!classId || !group) return; writeTeacherAssignedResearch(classId, { topic: group.title, links: group.links }); render(); return; }
  if (action.dataset.action === "delete-research-bank-group") { const group = readTeacherResearchLinkBank().find((item) => item.id === action.dataset.researchGroupId); if (!group || !window.confirm(`Delete the link group “${group.title}”?`)) return; writeTeacherResearchLinkBank(readTeacherResearchLinkBank().filter((item) => item.id !== group.id)); render(); return; }
  if (action.dataset.action === "preview-assigned-google-search") { const topic = action.closest("form")?.elements.topic?.value.trim(); if (!topic) { action.closest("form")?.elements.topic?.focus(); return; } window.open(`https://www.google.com/search?q=${encodeURIComponent(topic)}`, "_blank", "noopener"); return; }
  if (action.dataset.action === "clear-assigned-research") { const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id, form = action.closest("form"); if (!classId || !form) return; writeTeacherAssignedResearch(classId, { topic: "", links: [] }); form.reset(); form.querySelector("[data-assigned-research-status]").textContent = "Teacher-Assigned Research was cleared for this class in this browser."; return; }
  if (action.dataset.action === "open-assigned-research") { const state = session.read(), approved = readTeacherAssignedResearch(state.classId).links.find((link) => link.url === action.dataset.researchUrl), status = action.closest(".platform-assigned-research")?.querySelector("[data-assigned-research-student-status]"); if (!approved) { if (status) status.textContent = "This resource is not currently approved by your teacher."; return; } const width = Math.max(480, Math.floor(screen.availWidth / 2)), height = screen.availHeight, researchWindow = window.open(approved.url, "thinkamigbob-assigned-research", `popup=yes,width=${width},height=${height},left=${width},top=0,resizable=yes`); if (!researchWindow) { if (status) status.textContent = "The browser blocked the research window. Allow pop-ups for this platform, then try again."; return; } try { window.moveTo(0, 0); window.resizeTo(width, height); } catch {} if (status) status.textContent = `${approved.title} opened. Your browser may ask you to place the windows side by side.`; const closedCheck = window.setInterval(() => { if (!researchWindow.closed) return; window.clearInterval(closedCheck); try { window.moveTo(0, 0); window.resizeTo(screen.availWidth, screen.availHeight); } catch {} if (status?.isConnected) status.textContent = "The research resource closed. The platform is ready to use full screen again."; }, 1000); return; }
  if (action.dataset.action === "whiteboard-activate-text") { activateWhiteboardTextTool(); return; }
  if (action.dataset.action === "whiteboard-format-text") {
    if (!formatSelectedWhiteboardText(action.dataset.textCommand)) action.setAttribute("aria-pressed", String(action.getAttribute("aria-pressed") !== "true"));
    activateWhiteboardTextTool(); refreshPendingWhiteboardTextEntryStyle(); return;
  }
  if (action.dataset.action === "whiteboard-choose-text-font") {
    const font = action.dataset.textFont, fontControl = document.querySelector("[data-whiteboard-text-font]"); if (fontControl) fontControl.value = font;
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "text" && !selected.emojiStamp) formatSelectedWhiteboardText("font");
    activateWhiteboardTextTool(`${font} selected. Click anywhere on the whiteboard to start typing.`); refreshPendingWhiteboardTextEntryStyle();
    return;
  }
  if (action.closest("[data-class-resource-teacher]") || action.dataset.action?.startsWith("timer-") || action.dataset.action === "instant-timer") window.setTimeout(refreshCurrentClassPlan, 0);
  if (action.dataset.action === "open-current-plan-editor") {
    const modal = action.closest(".platform-current-class-plan")?.querySelector("[data-current-plan-modal]")
      ?? document.querySelector("[data-current-plan-modal]");
    const content = modal?.querySelector("[data-current-plan-editor-content]");
    const title = modal?.querySelector("#current-plan-editor-title");
    const state = session.read();
    const classId = modal?.dataset.currentClassId || currentTeacherClass(state.teacherId)?.id || state.classId;
    const teacherId = modal?.dataset.currentTeacherId || state.teacherId;
    if (!modal || !content || !title || !classId) return;
    const labels = { activities: "Edit Assigned Activities", access: "Student Resource Access", message: "Edit Current Message", timer: "Adjust Today’s Timer", whiteboard: "Latest Whiteboard", voice: "Voice Meter History" };
    title.textContent = labels[action.dataset.currentPlanEditor] || "Quick edit";
    content.innerHTML = currentClassPlanEditorMarkup(action.dataset.currentPlanEditor, classId, teacherId);
    modal.dataset.editorCategory = action.dataset.currentPlanEditor;
    modal.hidden = false;
    modal.querySelector('[data-action="close-current-plan-editor"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-current-plan-editor") {
    closeCurrentClassPlanEditor();
    document.querySelector(`[data-current-plan-editor="${action.closest("[data-current-plan-modal]")?.dataset.editorCategory || ""}"]`)?.focus();
    return;
  }
  if (action.dataset.action === "return-current-plan") {
    closeCurrentClassPlanEditor();
    const plan = document.querySelector(".platform-current-class-plan");
    plan?.scrollIntoView({ behavior: "smooth", block: "start" });
    plan?.querySelector(`[data-current-plan-editor="${action.closest("[data-current-plan-modal]")?.dataset.editorCategory || ""}"]`)?.focus();
    return;
  }
  if (action.dataset.action === "return-to-current-class-plan") {
    closeCurrentClassPlanEditor();
    closeQuickMessageBoard();
    closeQuickClassSchedule();
    const readinessPanel = document.querySelector('[data-form="class-readiness"]');
    if (readinessPanel) readinessPanel.hidden = true;
    const resourcesPanel = document.querySelector("[data-todays-resources-panel]");
    if (resourcesPanel) resourcesPanel.hidden = true;
    const plan = document.querySelector(".platform-current-class-plan");
    plan?.scrollIntoView({ behavior: "smooth", block: "start" });
    plan?.querySelector("#current-class-plan-title")?.focus?.();
    return;
  }
  if (action.dataset.action === "current-plan-open-resources") {
    closeCurrentClassPlanEditor();
    const resources = document.querySelector("#teacher-todays-resources");
    const resourcesPanel = resources?.closest("[data-todays-resources-panel]");
    if (resourcesPanel) resourcesPanel.hidden = false;
    resources?.scrollIntoView({ behavior: "smooth", block: "start" });
    resources?.querySelector("#class-resource-title")?.focus({ preventScroll: true });
    return;
  }
  if (action.dataset.action === "save-current-plan-message") {
    const modal = action.closest("[data-current-plan-modal]");
    const value = modal?.querySelector("[data-current-plan-message]")?.value ?? "";
    const result = teacherMemo.save(value);
    const status = modal?.querySelector("[data-current-plan-editor-status]");
    if (status) status.textContent = result.ok ? "Message saved and displayed." : value.trim() ? `Keep the message to ${TEACHER_MEMO_MAX_CHARACTERS} characters or fewer.` : "Type a message before saving.";
    if (result.ok) syncTeacherMemoPresentation();
    return;
  }
  if (action.dataset.action === "clear-current-plan-message") {
    teacherMemo.clear();
    syncTeacherMemoPresentation();
    const modal = action.closest("[data-current-plan-modal]");
    const field = modal?.querySelector("[data-current-plan-message]");
    const status = modal?.querySelector("[data-current-plan-editor-status]");
    if (field) field.value = "";
    if (status) status.textContent = "Message cleared.";
    return;
  }
  if (["open-message-board-quick", "open-whiteboard", "open-today-timer-tools"].includes(action.dataset.action)) closeCurrentClassPlanEditor();
  if (action.dataset.action === "open-teacher-preview") {
    session.signInTeacher("teacher-preview-1");
    navigate(ROUTES.TEACHER_DASHBOARD);
    return;
  }
  if (action.dataset.action === "open-student-preview") {
    session.signInStudent("class-preview-1", "student-preview-1");
    navigate(ROUTES.STUDENT_DASHBOARD);
    return;
  }
  if (action.dataset.action === "open-current-plan-details") {
    const details = document.querySelector("[data-current-plan-details]");
    if (details) {
      closeQuickMessageBoard();
      closeQuickClassSchedule();
      document.querySelector("[data-form='class-readiness']")?.setAttribute("hidden", "");
      details.open = true;
      details.scrollIntoView({ behavior: "smooth", block: "start" });
      details.querySelector("summary")?.focus();
    }
    return;
  }
  if (action.dataset.action === "open-class-readiness") {
    const panel = document.querySelector("[data-form='class-readiness']");
    if (panel) {
      const state = session.read();
      const classId = currentTeacherClass(state.teacherId)?.id;
      const goals = panel.querySelector("[data-quick-goals]");
      if (classId && goals?.dataset.goalsMode === "automatic") goals.outerHTML = todaysGoalInputsMarkup(classId);
      closeQuickMessageBoard();
      closeQuickClassSchedule();
      panel.hidden = false;
      panel.querySelector(`[data-readiness-setting="${action.dataset.readinessFocus}"]`)?.focus();
    }
    return;
  }
  if (action.dataset.action === "open-today-timer-tools") {
    const card = document.querySelector("#teacher-timer-card");
    const adjuster = card?.querySelector(".platform-timer-display-settings");
    if (adjuster) adjuster.open = true;
    card?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action.dataset.action === "toggle-smartboard-tool") {
    const display = action.closest("#platform-student-timer-display");
    installSmartboardToolPopoutButtons(document);
    const tool = display?.querySelector(`[data-smartboard-tool="${action.dataset.smartboardToolName}"]`);
    if (tool) {
      tool.hidden = !tool.hidden;
      if (!tool.hidden) {
        bringSmartboardToolForward(tool);
        keepSmartboardToolsOnScreen(document);
      }
    }
    return;
  }
  if (action.dataset.action === "reset-smartboard-tools") {
    resetSmartboardToolPositions(action.ownerDocument || document);
    return;
  }
  if (action.dataset.action === "fullscreen-classroom-display") {
    void toggleClassroomDisplayFullscreen(action);
    return;
  }
  if (action.dataset.action === "exit-classroom-fullscreen") {
    void exitClassroomDisplayFullscreen(action.ownerDocument);
    return;
  }
  if (action.dataset.action === "popout-smartboard-tool") {
    openSmartboardToolPopout(action.closest("[data-smartboard-tool]"));
    return;
  }
  if (action.dataset.action === "fullscreen-smartboard-tool") {
    toggleSmartboardToolMaximized(action.closest("[data-smartboard-tool]"));
    return;
  }
  if (action.dataset.action === "close-smartboard-tool") {
    const tool = action.closest("[data-smartboard-tool]");
    if (tool) {
      tool.hidden = true;
      const display = tool.closest("#platform-student-timer-display[data-tool-only]");
      if (display) { display.hidden = true; delete display.dataset.toolOnly; }
    }
    return;
  }
  if (action.dataset.action === "open-message-board-quick") {
    const settings = document.querySelector("[data-form='class-readiness']");
    const panel = document.querySelector("[data-message-board-quick-panel]");
    const host = panel?.querySelector("[data-message-board-quick-host]");
    const board = document.querySelector("#teacher-message-board");
    if (settings) settings.hidden = true;
    closeQuickClassSchedule();
    if (panel && host && board) {
      panel.hidden = false;
      host.append(board);
    }
    return;
  }
  if (action.dataset.action === "open-class-schedule-quick") {
    const settings = document.querySelector("[data-form='class-readiness']");
    const panel = document.querySelector("[data-class-schedule-quick-panel]");
    const host = panel?.querySelector("[data-class-schedule-quick-host]");
    const schedule = document.querySelector("#teacher-class-schedule");
    if (settings) settings.hidden = true;
    closeQuickMessageBoard();
    if (panel && host && schedule) {
      panel.hidden = false;
      host.append(schedule);
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      schedule.querySelector('[name="durationMinutes"]')?.focus({ preventScroll: true });
    }
    return;
  }
  if (action.dataset.action === "close-class-schedule-quick") {
    closeQuickClassSchedule();
    document.querySelector('[data-action="open-class-schedule-quick"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-message-board-quick") {
    closeQuickMessageBoard();
    document.querySelector('[data-action="open-message-board-quick"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-class-readiness") {
    const panel = document.querySelector("[data-form='class-readiness']");
    if (panel) panel.hidden = true;
    return;
  }
  if (action.dataset.action === "add-quick-goal") {
    const goals = action.closest("[data-quick-goals]");
    const list = goals?.querySelector("[data-quick-goal-list]");
    if (!goals || !list) return;
    goals.dataset.goalsMode = "custom";
    list.querySelector("[data-no-quick-goals]")?.remove();
    const index = list.querySelectorAll('[name="todayGoal"]').length;
    list.insertAdjacentHTML("beforeend", `<label>I Can Goal ${index + 1}<span><input name="todayGoal" maxlength="90" value="I can "><button type="button" data-action="delete-quick-goal" aria-label="Delete I Can goal ${index + 1}">Delete</button></span></label>`);
    list.querySelectorAll('[name="todayGoal"]')[index]?.focus();
    return;
  }
  if (action.dataset.action === "delete-quick-goal") {
    const goals = action.closest("[data-quick-goals]");
    const list = goals?.querySelector("[data-quick-goal-list]");
    action.closest("label")?.remove();
    if (goals) goals.dataset.goalsMode = "custom";
    if (list && !list.querySelector('[name="todayGoal"]')) list.innerHTML = `<p data-no-quick-goals>No goal is currently assigned.</p>`;
    return;
  }
  if (action.dataset.action === "keep-readiness-mission") {
    const form = action.closest("[data-form='class-readiness']");
    const confirmation = form?.querySelector("[data-readiness-no-mission-confirmation]");
    if (confirmation) confirmation.hidden = true;
    if (form?.elements.mission) form.elements.mission.value = "previous";
    form?.elements.mission?.focus();
    return;
  }
  if (action.dataset.action === "confirm-readiness-no-mission") {
    const form = action.closest("[data-form='class-readiness']");
    const confirmation = form?.querySelector("[data-readiness-no-mission-confirmation]");
    if (confirmation) confirmation.hidden = true;
    if (form) form.dataset.noMissionConfirmed = "true";
    form?.querySelector('[data-action="save-class-readiness"]')?.click();
    return;
  }
  if (action.dataset.action === "save-class-readiness") {
    const form = action.closest("[data-form='class-readiness']");
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (!form || !classId) return;
    const missionChoice = form.elements.mission.value;
    const planningRange = String(form.elements.planningRange?.value || "today");
    const planningWindows = { today: { label: "Today", schoolDays: 1 }, week: { label: "This week", schoolDays: 5 }, "seven-weeks": { label: "7 weeks", schoolDays: 35 } };
    const selectedWindow = planningWindows[planningRange] || planningWindows.today;
    const planningWindow = { ...selectedWindow, scope: planningRange, startsOn: new Date().toISOString().slice(0, 10), savedAt: Date.now() };
    if (missionChoice === "previous") {
      classSetupProfiles.save(classId, { ...(classSetupProfiles.profile(classId) ?? {}), planningWindow });
      render();
      return;
    }
    const currentMission = todaysMission.read();
    if (missionChoice === "none" && currentMission.title && form.dataset.noMissionConfirmed !== "true") {
      const confirmation = form.querySelector("[data-readiness-no-mission-confirmation]");
      const missionName = confirmation?.querySelector("[data-readiness-current-mission]");
      if (missionName) missionName.textContent = currentMission.title;
      if (confirmation) { confirmation.hidden = false; confirmation.querySelector('[data-action="keep-readiness-mission"]')?.focus(); }
      return;
    }
    delete form.dataset.noMissionConfirmed;
    const readiness = { ...classReadiness(classId), mission: missionChoice };
    const profile = classSetupProfiles.profile(classId) ?? {};
    const goalsRegion = form.querySelector("[data-quick-goals]");
    const todayGoals = [...form.querySelectorAll('[name="todayGoal"]')].map((input) => iCanGoal(input.value)).filter(Boolean).slice(0, 6);
    const todayGoalsMode = goalsRegion?.dataset.goalsMode === "custom" ? "custom" : "automatic";
    classSetupProfiles.save(classId, { ...profile, readiness, todayGoals, todayGoalsMode, planningWindow });
    if (readiness.mission === "none" || !todayGoals.length) todaysMission.clear();
    else {
      const resources = classResourceSharing.read(classId).audienceRows.flatMap((row) => row.resources).filter(Boolean);
      todaysMission.save({ title: todayGoals[0], focus: todayGoals.join(" • "), builder: resources.some((item) => item.type === "Builder") ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART, workshop: resources.some((item) => item.type === "Workshop") ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART });
    }
    if (readiness.timer !== "saved") classTimerSchedule.save({ ...classTimerSchedule.read(), enabled: false });
    if (readiness.mission === "new") {
      pendingScrollTarget = "teacher-todays-resources";
      pendingOpenClassResourceEditor = true;
    }
    render();
    return;
  }
  if (action.dataset.action === "select-catalog-resource") {
    const form = action.closest('[data-form="class-resource"]');
    if (!form) return;
    form.elements.type.value = action.dataset.resourceType;
    form.elements.title.value = action.dataset.resourceTitle;
    form.elements.url.value = action.dataset.resourceUrl;
    const status = form.querySelector("[data-class-resource-status]");
    if (status) status.textContent = `Selected: ${action.dataset.resourceTitle}. Choose Save for Later or Show on Student Page.`;
    form.elements.title.focus();
    return;
  }
  if (action.dataset.action === "use-custom-webpage") {
    const form = action.closest('[data-form="class-resource"]');
    if (!form) return;
    form.elements.type.value = "Webpage";
    form.elements.title.value = "";
    form.elements.url.value = "";
    const customFields = form.querySelector("[data-custom-resource-fields]");
    if (customFields) customFields.open = true;
    const status = form.querySelector("[data-class-resource-status]");
    if (status) status.textContent = "Enter the page name and address below. Students will not see it until you choose Show on Student Page.";
    form.elements.title.focus();
    return;
  }
  if (action.dataset.action === "add-resource-slot") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const result = classResourceSharing.addSlot(classId, action.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status && result.ok) status.textContent = `Slot ${result.slotCount} added. Choose another resource when ready.`;
    return;
  }
  if (action.dataset.action === "remove-resource-slot") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const result = classResourceSharing.removeSlot(classId, action.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status) status.textContent = result.ok ? `Empty Slot ${result.slotCount + 1} deleted.` : "Uncheck the resource in the last slot before deleting that slot.";
    return;
  }
  if (action.dataset.action === "edit-resource-slot") {
    const region = action.closest("[data-class-resource-teacher]");
    const editor = region?.querySelector(".platform-class-resource-editor");
    const form = editor?.querySelector('[data-form="class-resource"]');
    if (!editor || !form) return;
    form.elements.rowId.value = action.dataset.resourceRowId;
    form.elements.slot.value = action.dataset.resourceSlotIndex;
    editor.open = true;
    return;
  }
  if (action.dataset.action === "add-resource-audience") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    classResourceSharing.addAudienceRow(classId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "add-resource-exception") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const type = region?.querySelector("[data-resource-exception-type]")?.value;
    if (!classId || !region || !type) return;
    const row = classResourceSharing.addAudienceRow(classId);
    const label = type === "whole-class" ? "Whole class" : type === "students" ? "Selected students" : type === "teacher-group" ? "Exception Group" : "Random Exception Group";
    classResourceSharing.updateAudience(classId, row.id, { audienceType: type, audienceIds: [], audienceLabel: label });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "add-teacher-group") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const row = classResourceSharing.addAudienceRow(classId);
    const groupNumber = classResourceSharing.read(classId).audienceRows.filter((item) => ["teacher-group", "random-group"].includes(item.audienceType)).length + 1;
    classResourceSharing.updateAudience(classId, row.id, { audienceType: "teacher-group", audienceIds: [], audienceLabel: `Group ${groupNumber}` });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "build-random-groups") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const roster = [...getRosterForClass(classId)].sort(() => Math.random() - 0.5);
    const requestedSize = Number(region.querySelector("[data-random-group-size]")?.value);
    const size = Math.max(1, Math.min(roster.length || 1, Number.isFinite(requestedSize) ? requestedSize : 3));
    const groupCount = Math.max(1, Math.ceil(roster.length / size));
    const groups = Array.from({ length: groupCount }, (_, index) => ({ name: `Random Group ${index + 1}`, audienceIds: [] }));
    roster.forEach((student, index) => groups[index % groupCount].audienceIds.push(student.id));
    classResourceSharing.setGroupRows(classId, groups, "random-group");
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "save-group-set") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const result = classResourceSharing.saveGroupSet(classId, region.querySelector("[data-group-set-name]")?.value);
    if (result.ok) region.outerHTML = classResourceTeacherMarkup(classId);
    else {
      const status = region.querySelector("[data-class-resource-status]");
      if (status) status.textContent = "Name the group settings and create at least one group before saving.";
    }
    return;
  }
  if (action.dataset.action === "apply-group-set") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const presetId = region?.querySelector("[data-saved-group-set]")?.value;
    if (!classId || !region || !presetId) return;
    classResourceSharing.applyGroupSet(classId, presetId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "remove-resource-audience") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    classResourceSharing.removeAudienceRow(classId, action.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "randomize-resource-audience") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const shuffled = [...getRosterForClass(classId)].sort(() => Math.random() - 0.5);
    const count = Math.max(1, Math.ceil(shuffled.length / 2));
    classResourceSharing.updateAudience(classId, action.dataset.resourceRowId, { audienceType: "random-group", audienceIds: shuffled.slice(0, count).map((student) => student.id), audienceLabel: "Random group" });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  if (action.dataset.action === "show-selected-webpages") {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const form = region?.querySelector('[data-form="class-resource"]');
    const selected = [...(region?.querySelectorAll("[data-webpage-selection]:checked") ?? [])];
    if (!classId || !region || !form) return;
    const catalogUrls = new Set(TEACHER_WEBPAGE_CATALOG.map((page) => page.url));
    const retained = classResourceSharing.read(classId).activeResources.filter((resource) => resource.type !== "Webpage" || !catalogUrls.has(resource.url));
    const selectedPages = selected.map((input, selectionIndex) => {
      const page = TEACHER_WEBPAGE_CATALOG[Number(input.value)];
      return page ? { id: `webpage-${Date.now()}-${selectionIndex}`, type: "Webpage", title: page.title, url: page.url, release: form.elements.release.value } : null;
    }).filter(Boolean);
    classResourceSharing.replaceActive(classId, [...retained, ...selectedPages]);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status) status.textContent = selected.length ? `${selected.length} webpage${selected.length === 1 ? " is" : "s are"} now available to students.` : "Catalog webpages were removed from the student page.";
    return;
  }
  if (action.dataset.action === "whiteboard-quick-tool") {
    whiteboardDeleteNextObject = false;
    const tool = document.querySelector("[data-whiteboard-tool]");
    const nextTool = action.dataset.whiteboardQuickTool;
    if (nextTool !== "text") cancelPendingWhiteboardTextEntry();
    if (nextTool === "pull-3d") {
      const selectedIndex = whiteboardObjects.findIndex((object) => object.id === whiteboardSelectedObjectId);
      const selected = whiteboardObjects[selectedIndex];
      if (selected && [...WHITEBOARD_CLOSED_2D_SHAPES, "text", "path", "line", "arrow"].includes(selected.type) && selected.strokeStyle !== "eraser" && !selected.original2DType) {
        const depth = Number(document.querySelector("[data-whiteboard-3d-depth]")?.value ?? 24);
        const connectedIds = WHITEBOARD_CLOSED_2D_SHAPES.includes(selected.type) ? connectedWhiteboardObjectIds(selected) : new Set([selected.id]);
        const connectedShapes = whiteboardObjects.filter((object) => connectedIds.has(object.id) && WHITEBOARD_CLOSED_2D_SHAPES.includes(object.type) && !object.original2DType);
        const objectsToPull = connectedShapes.length > 1 ? connectedShapes : [selected];
        const idsToPull = new Set(objectsToPull.map((object) => object.id));
        pushWhiteboardHistory(); whiteboardObjects = whiteboardObjects.map((object) => idsToPull.has(object.id) ? makeWhiteboardObject3D(object, depth) : object); renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus(objectsToPull.length > 1 ? `${objectsToPull.length} connected 2D shapes are now one 3D assembly with thickness ${depth}.` : `Selected object is now 3D with thickness ${depth}. Use Push Back to 2D to reverse it.`); return;
      }
    }
    if (tool && nextTool) {
      tool.value = nextTool;
      tool.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === nextTool)));
      const label = action.textContent?.trim() || action.title || "Whiteboard tool";
      setWhiteboardStatus(`${label} is active.`);
    }
    whiteboardCanvas()?.focus({ preventScroll: true });
    return;
  }
  if (action.dataset.action === "whiteboard-open-pixel-studio") { openPixelStudio(); return; }
  if (action.dataset.action === "pixel-new-project") { newPixelProject(); return; }
  if (action.dataset.action === "pixel-save-project") { savePixelProjectFile(); return; }
  if (action.dataset.action === "pixel-level") { const levels = { starter: { size: 8, bits: 1 }, creator: { size: 16, bits: 4 }, advanced: { size: 64, bits: 8 }, "full-color": { size: 64, bits: 24 } }, level = levels[action.dataset.pixelLevel]; if (!level) return; const hasWork = pixelStudio.frames.some((frame) => frame.some((color) => !color.endsWith("00"))); if (hasWork && !window.confirm("Changing learning level starts a new pixel project. Continue?")) return; pixelStudio.size = level.size; pixelStudio.bits = level.bits; pixelStudio.palette = [...PIXEL_PALETTE, ...PIXEL_8_BIT_PALETTE.slice(16)]; pixelStudio.pixels = freshPixelFrame(); pixelStudio.frames = [[...pixelStudio.pixels]]; pixelStudio.sourceFrames = []; pixelStudio.frameIndex = 0; const size = document.querySelector("[data-pixel-size]"), bits = document.querySelector("[data-pixel-bits]"); if (size) size.value = String(level.size); if (bits) bits.value = String(level.bits); document.querySelectorAll("[data-pixel-level]").forEach((button) => button.setAttribute("aria-pressed", String(button === action))); renderPixelStudio(); startPixelStudioPreview(); setWhiteboardStatus(`${action.textContent.trim()} mode is ready.`); return; }
  if (action.dataset.action === "pixel-close") { const dialog = document.querySelector("[data-pixel-studio]"); if (dialog) dialog.hidden = true; window.clearInterval(pixelStudioPreviewTimer); setWhiteboardStatus("Pixel Studio closed. Your frames are kept while this whiteboard is open."); return; }
  if (action.dataset.action === "pixel-clear") { pixelStudio.pixels = freshPixelFrame(); saveCurrentPixelFrame(); renderPixelStudio(); return; }
  if (action.dataset.action === "pixel-from-image") { selectedImageToPixels(); return; }
  if (action.dataset.action === "pixel-paste-gif") { void pastePixelGif().finally(() => document.querySelector("[data-pixel-gif-url]")?.focus()); return; }
  if (action.dataset.action === "pixel-load-gif-url") { const field = document.querySelector("[data-pixel-gif-url]"), url = field?.value.trim(); if (!url) { setWhiteboardStatus("Paste a GIF image address into the box first."); field?.focus(); return; } void importPixelGifUrl(url); return; }
  if (action.dataset.action === "pixel-add-frame") { saveCurrentPixelFrame(); pixelStudio.frames.push(freshPixelFrame()); pixelStudio.sourceFrames?.push(""); pixelStudio.frameIndex = pixelStudio.frames.length - 1; pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; renderPixelStudio(); startPixelStudioPreview(); return; }
  if (action.dataset.action === "pixel-duplicate-frame") { saveCurrentPixelFrame(); pixelStudio.frames.splice(pixelStudio.frameIndex + 1, 0, [...pixelStudio.pixels]); pixelStudio.sourceFrames?.splice(pixelStudio.frameIndex + 1, 0, pixelStudio.sourceFrames[pixelStudio.frameIndex] ?? ""); pixelStudio.frameIndex += 1; pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; renderPixelStudio(); startPixelStudioPreview(); return; }
  if (action.dataset.action === "pixel-delete-frame") { if (pixelStudio.frames.length === 1) { pixelStudio.pixels = freshPixelFrame(); pixelStudio.frames[0] = [...pixelStudio.pixels]; pixelStudio.sourceFrames = []; } else { pixelStudio.frames.splice(pixelStudio.frameIndex, 1); pixelStudio.sourceFrames?.splice(pixelStudio.frameIndex, 1); pixelStudio.frameIndex = Math.min(pixelStudio.frameIndex, pixelStudio.frames.length - 1); pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; } renderPixelStudio(); startPixelStudioPreview(); return; }
  if (action.dataset.action === "pixel-move-frame-left" || action.dataset.action === "pixel-move-frame-right") { saveCurrentPixelFrame(); const offset = action.dataset.action.endsWith("left") ? -1 : 1, nextIndex = pixelStudio.frameIndex + offset; if (nextIndex >= 0 && nextIndex < pixelStudio.frames.length) { [pixelStudio.frames[pixelStudio.frameIndex], pixelStudio.frames[nextIndex]] = [pixelStudio.frames[nextIndex], pixelStudio.frames[pixelStudio.frameIndex]]; if (pixelStudio.sourceFrames?.length) [pixelStudio.sourceFrames[pixelStudio.frameIndex], pixelStudio.sourceFrames[nextIndex]] = [pixelStudio.sourceFrames[nextIndex], pixelStudio.sourceFrames[pixelStudio.frameIndex]]; pixelStudio.frameIndex = nextIndex; pixelStudio.pixels = [...pixelStudio.frames[nextIndex]]; renderPixelStudio(); startPixelStudioPreview(); } return; }
  if (action.dataset.action === "pixel-select-frame") { saveCurrentPixelFrame(); pixelStudio.frameIndex = Number(action.dataset.pixelFrame); pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; renderPixelStudio(); return; }
  if (action.dataset.action === "pixel-add-board") { saveCurrentPixelFrame(); addPixelSpriteToWhiteboard(); return; }
  if (action.dataset.action === "pixel-photo-open") { const tools = document.querySelector("[data-pixel-photo-tools]"), opening = Boolean(tools?.hidden); if (tools) tools.hidden = !opening; action.setAttribute("aria-expanded", String(opening)); setWhiteboardStatus(opening ? "Still-image options opened. Choose a GIF frame before adding or downloading it." : "Still-image options closed. Pixel Studio remains in bit-animation mode."); return; }
  if (action.dataset.action === "pixel-photo-board") { void addPixelGifFrameImageToWhiteboard(); return; }
  if (action.dataset.action === "pixel-photo-download") { void pixelGifFrameImage().then((canvas) => { downloadPixelStudio(canvas.toDataURL("image/png"), `gif-frame-${pixelStudio.frameIndex + 1}.png`); setWhiteboardStatus("The selected GIF frame was downloaded as a smooth PNG image."); }); return; }
  if (action.dataset.action === "pixel-download-png") { saveCurrentPixelFrame(); downloadPixelStudio(pixelFrameCanvas(pixelStudio.pixels, 24).toDataURL("image/png"), "pixel-sprite.png"); return; }
  if (action.dataset.action === "pixel-download-gif") { saveCurrentPixelFrame(); const source = animatedPixelGif(); downloadPixelStudio(source, "pixel-animation.gif"); window.setTimeout(() => URL.revokeObjectURL(source), 1000); setWhiteboardStatus(pixelStudio.bits === 24 ? "Animated GIF downloaded. GIF format reduced each Full Color frame to no more than 256 colors." : "Animated pixel GIF downloaded."); return; }
  if (action.dataset.action === "pixel-eyedropper") { if (typeof window.EyeDropper !== "function") { setWhiteboardStatus("The eyedropper is unavailable here. Choose a pixel color instead."); return; } new window.EyeDropper().open().then(({ sRGBHex }) => { const input = document.querySelector("[data-pixel-color]"); if (input) { input.value = sRGBHex; input.dispatchEvent(new Event("change", { bubbles: true })); } }).catch(() => {}); return; }
  if (action.dataset.action === "pixel-random-palette") { randomPixelPalette(); setWhiteboardStatus(`A new random ${pixelStudio.bits}-bit color palette was generated.`); return; }
  if (action.dataset.action === "pixel-select-color") { const color = pixelPalette()[Number(action.dataset.pixelPaletteIndex)], input = document.querySelector("[data-pixel-color]"); if (input && color) { input.value = color; input.dispatchEvent(new Event("change", { bubbles: true })); } return; }
  if (action.dataset.action === "whiteboard-tool-select") { cancelPendingWhiteboardTextEntry(); whiteboardDeleteNextObject = false; const tool = document.querySelector("[data-whiteboard-tool]"); if (tool) { tool.value = "select"; tool.dispatchEvent(new Event("change", { bubbles: true })); } document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === "select"))); whiteboardCanvas()?.focus({ preventScroll: true }); setWhiteboardStatus("Select and move is active."); return; }
  if (action.dataset.action === "whiteboard-paste-youtube") {
    const field = document.querySelector("[data-whiteboard-youtube-url]");
      navigator.clipboard.readText().then((copied) => {
        if (field) field.value = copied;
        if (whiteboardYouTubeId(copied)) setWhiteboardStatus("YouTube link pasted. Choose Add YouTube Video.");
        else setWhiteboardStatus("The copied text is not a recognized YouTube video link.");
      }).catch(() => {
        setWhiteboardStatus("Clipboard access was blocked. Paste the YouTube link into the link box instead.");
        field?.focus();
      });
      return;
  }
  if (action.dataset.action === "whiteboard-add-youtube") {
    const field = document.querySelector("[data-whiteboard-youtube-url]"), videoId = whiteboardYouTubeId(field?.value ?? ""), canvas = whiteboardCanvas();
    if (!videoId || !canvas) { setWhiteboardStatus("Enter a valid YouTube video link, including youtube.com or youtu.be."); field?.focus(); return; }
    addWhiteboardYouTubeVideo(videoId); if (field) field.value = ""; return;
  }
  if (action.dataset.action === "whiteboard-cut") { cutSelectedWhiteboardObject(); whiteboardCanvas()?.focus({ preventScroll: true }); return; }
  if (action.dataset.action === "whiteboard-copy-image") { const menu = document.querySelector("[data-whiteboard-context-menu]"); if (menu) menu.hidden = true; void copySelectedWhiteboardObjectAsImage(); return; }
  if (action.dataset.action === "whiteboard-cut-image") { const menu = document.querySelector("[data-whiteboard-context-menu]"); if (menu) menu.hidden = true; cutSelectedWhiteboardObject(); return; }
  if (action.dataset.action === "whiteboard-paste-image") { const menu = document.querySelector("[data-whiteboard-context-menu]"); if (menu) menu.hidden = true; pasteWhiteboardClipboard(whiteboardContextPoint); return; }
  if (action.dataset.action === "whiteboard-paste-system-image") { void pasteSystemClipboardImage(); return; }
  if (action.dataset.action === "whiteboard-close-context-menu") { const menu = document.querySelector("[data-whiteboard-context-menu]"); if (menu) menu.hidden = true; return; }
  if (action.dataset.action === "whiteboard-toggle-controls") {
    whiteboardControlsHidden = !whiteboardControlsHidden; applyWhiteboardControlsLayout({ resizeCanvas: true }); saveWhiteboard();
    setWhiteboardStatus(whiteboardControlsHidden ? "Board menus hidden. The canvas now uses the extra space." : "Board menus expanded."); return;
  }
  if (action.dataset.action === "whiteboard-remove-selection-background") {
    const selectedImage = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId && object.type === "image");
    if (selectedImage) { try { removeSelectedWhiteboardImageBackground(selectedImage); } catch { setWhiteboardStatus("This image could not remove its background. Try pasting or uploading it again."); } return; }
    if (!whiteboardLassoBounds) { setWhiteboardStatus("Choose Lasso select for image and drag around the work first."); return; }
    try {
      const selectedIds = new Set(whiteboardLassoObjectIds());
      const result = whiteboardSelectionCanvas({ removeBackground: true });
      if (!result) return;
      pushWhiteboardHistory(); whiteboardSelectionDownload = result.canvas.toDataURL("image/png");
      whiteboardObjects = whiteboardObjects.filter((object) => !selectedIds.has(object.id));
      const image = createWhiteboardObject("image", { x: result.bounds.x, y: result.bounds.y, width: result.bounds.width, height: result.bounds.height, src: whiteboardSelectionDownload, backgroundRemoved: true, rotation: 0 });
      whiteboardObjects.push(image); whiteboardSelectedObjectId = image.id; whiteboardLassoPoints = []; whiteboardLassoBounds = null;
      hydrateWhiteboardImages(() => renderWhiteboardObjects()); renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls();
      setWhiteboardStatus("Background removed. The selection is now one movable image. Use Undo if light details were removed.");
    } catch { setWhiteboardStatus("This selection could not remove its background. Try a smaller selection or an uploaded image from this device."); }
    return;
  }
  if (action.dataset.action === "whiteboard-lasso-use") { useWhiteboardLassoCutout(); return; }
  if (action.dataset.action === "whiteboard-lasso-delete") { deleteWhiteboardLassoCutout(); return; }
  if (action.dataset.action === "whiteboard-lasso-fill") {
    if (typeof window.EyeDropper !== "function") { const currentColor = document.querySelector("[data-whiteboard-color]")?.value ?? "#ffffff"; fillWhiteboardLassoCutout(currentColor); setWhiteboardStatus("Eyedropper is unavailable, so the cutout was replaced with the current toolbar color."); return; }
    new window.EyeDropper().open().then(({ sRGBHex }) => { const color = document.querySelector("[data-whiteboard-color]"); if (color) { color.value = sRGBHex; color.dispatchEvent(new Event("input", { bubbles: true })); } fillWhiteboardLassoCutout(sRGBHex); }).catch(() => setWhiteboardStatus("Color matching canceled. The image was not changed.")); return;
  }
  if (action.dataset.action === "whiteboard-lasso-cancel") { clearWhiteboardLassoChoice(); setWhiteboardStatus("Cutout canceled. The board was not changed."); return; }
  if (action.dataset.action === "whiteboard-eyedropper") {
    if (typeof window.EyeDropper !== "function") { setWhiteboardStatus("The eyedropper is not supported in this browser. Use the color picker instead."); return; }
    new window.EyeDropper().open().then(({ sRGBHex }) => { const color = document.querySelector("[data-whiteboard-color]"); if (!color) return; color.value = sRGBHex; color.dispatchEvent(new Event("input", { bubbles: true })); color.dispatchEvent(new Event("change", { bubbles: true })); setWhiteboardStatus(`${sRGBHex} matched from the screen.`); }).catch(() => setWhiteboardStatus("Eyedropper canceled. The current color was kept."));
    return;
  }
  if (action.dataset.action === "whiteboard-apply-background") {
    const type = document.querySelector("[data-whiteboard-background-type]")?.value ?? "white";
    if (type === "image" && !whiteboardBackground.imageSrc) { setWhiteboardStatus("Choose a background image first."); return; }
    whiteboardBackground.type = ["white", "solid", "gradient", "image"].includes(type) ? type : "white";
    whiteboardBackground.color1 = document.querySelector("[data-whiteboard-background-color-1]")?.value ?? "#ffffff";
    whiteboardBackground.color2 = document.querySelector("[data-whiteboard-background-color-2]")?.value ?? "#d8edf5";
    renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus(`${whiteboardBackground.type === "white" ? "Plain white" : whiteboardBackground.type === "solid" ? "Solid color" : whiteboardBackground.type === "gradient" ? "Gradient" : "Image"} background applied.`); return;
  }
  if (action.dataset.action === "whiteboard-download-selection") {
    try {
      if (!whiteboardSelectionDownload) {
        const result = whiteboardSelectionCanvas();
        if (!result) { setWhiteboardStatus("Use Lasso select for image and drag around the work before downloading."); return; }
        whiteboardSelectionDownload = result.canvas.toDataURL("image/png");
      }
      const link = document.createElement("a"); link.download = "whiteboard-selection.png"; link.href = whiteboardSelectionDownload; link.click();
      setWhiteboardStatus("Selected work downloaded as a PNG image.");
    } catch { setWhiteboardStatus("The selected image could not be downloaded from this browser."); }
    return;
  }
  if (action.dataset.action === "whiteboard-bob-directions") { setWhiteboardBobCoachState("directions"); return; }
  if (action.dataset.action === "whiteboard-bob-collapse") { setWhiteboardBobCoachState("collapsed"); return; }
  if (action.dataset.action === "whiteboard-bob-open") { setWhiteboardBobCoachState("directions"); return; }
  if (action.dataset.action === "whiteboard-dimension-cancel") {
    whiteboardPendingDimension = null;
    const question = document.querySelector("[data-whiteboard-dimension-question]"); if (question) question.hidden = true;
    renderWhiteboardObjects();
    setWhiteboardStatus("CAD measurement canceled.");
    return;
  }
  if (action.dataset.action === "whiteboard-dimension-save") {
    if (!whiteboardPendingDimension?.start || !whiteboardPendingDimension?.end) return;
    let choice = document.querySelector("[data-whiteboard-dimension-label]")?.value ?? "Length";
    const custom = document.querySelector("[data-whiteboard-dimension-custom]")?.value.trim();
    const suggestion = suggestedWhiteboardDimensionLabel(whiteboardPendingDimension.start, whiteboardPendingDimension.end);
    const tip = document.querySelector("[data-whiteboard-measurement-tip]");
    if (choice !== "custom" && choice !== suggestion.label) {
      whiteboardPendingDimension.attempts = Number(whiteboardPendingDimension.attempts ?? 0) + 1;
      if (whiteboardPendingDimension.attempts < 2) {
        if (tip) { tip.hidden = false; tip.textContent = `Try again. Tip: ${suggestion.tip}`; }
        setWhiteboardStatus("That label does not match the two laser points yet. Use the tip and try again.");
        return;
      }
      choice = suggestion.label;
      const labelControl = document.querySelector("[data-whiteboard-dimension-label]"); if (labelControl) labelControl.value = choice;
      if (tip) { tip.hidden = false; tip.textContent = `The most logical answer is ${suggestion.label}. ${suggestion.tip}`; }
    }
    const label = choice === "custom" ? custom : choice;
    if (!label) { setWhiteboardStatus("Add your own measurement label before continuing."); return; }
    const unit = document.querySelector("[data-whiteboard-dimension-unit]")?.value ?? "cm";
    const { start, end } = whiteboardPendingDimension; pushWhiteboardHistory();
    const dimension = createWhiteboardObject("dimension", { x: start.x, y: start.y, width: end.x - start.x, height: end.y - start.y, annotationOffset: 18, label, unit, compareUnit: unit === "mm" ? "cm" : unit === "cm" ? "mm" : "cm", color: "#b52222", size: 3 });
    whiteboardObjects.push(dimension); whiteboardSelectedObjectId = dimension.id;
    whiteboardRulerUnit = unit === "in" ? "english" : "metric"; whiteboardRuler.x = Math.min(start.x, end.x); whiteboardRuler.y = Math.max(40, Math.min(start.y, end.y) - 82); whiteboardRuler.angle = Math.atan2(end.y - start.y, end.x - start.x); whiteboardRuler.length = Math.max(150, Math.hypot(end.x - start.x, end.y - start.y));
    const rulerControl = document.querySelector("[data-whiteboard-ruler]"); if (rulerControl) rulerControl.value = whiteboardRulerUnit;
    whiteboardPendingDimension = null; const question = document.querySelector("[data-whiteboard-dimension-question]"); if (question) question.hidden = true;
    syncWhiteboardDimensionCompareControl(); renderWhiteboardObjects(); saveWhiteboard(); showWhiteboardBobMeasurementCoach(); setWhiteboardStatus(`CAD dimension added: ${label}. ${suggestion.tip}`);
    return;
  }
  if (action.dataset.action === "open-whiteboard") {
    const display = document.querySelector("#platform-classroom-whiteboard");
    if (display) {
      whiteboardDisplayTrigger = action;
      display.hidden = false;
      mountWhiteboard();
      display.focus();
    }
    return;
  }
  if (action.dataset.action === "whiteboard-keyboard-help") {
    const help = document.querySelector("[data-whiteboard-keyboard-help]");
    if (help) { help.hidden = false; help.querySelector("button")?.focus(); }
    return;
  }
  if (action.dataset.action === "whiteboard-close-keyboard-help") {
    const help = document.querySelector("[data-whiteboard-keyboard-help]");
    if (help) help.hidden = true;
    document.querySelector('[data-action="whiteboard-keyboard-help"]')?.focus();
    return;
  }
  if (action.dataset.action === "close-whiteboard") {
    const display = document.querySelector("#platform-classroom-whiteboard");
    if (display) display.hidden = true;
    whiteboardDisplayTrigger?.focus();
    whiteboardDisplayTrigger = null;
    return;
  }
  if (action.dataset.action === "whiteboard-show-students") {
    const canvas = whiteboardCanvas();
    if (!canvas) return;
    const title = document.querySelector("[data-whiteboard-title]")?.value.trim() || "Whiteboard";
    const currentMemo = teacherMemo.read();
    const result = teacherMemo.save(title, { ...currentMemo, image: whiteboardStudentDisplayImage(canvas) });
    if (!result.ok || !result.state.image) { setWhiteboardStatus("The board could not be prepared for the Student Display. Try exporting it as a PNG."); return; }
    studentDisplayMode.select(STUDENT_DISPLAY_MODES.MESSAGE, { hasMemo: true });
    syncTeacherMemoPresentation();
    openClassroomPresentationWindow();
    syncClassroomPresentationWindow();
    setWhiteboardStatus("The current board is now showing on the Student Display. Click again after drawing to update it.");
    return;
  }
  if (action.dataset.action === "whiteboard-present" || action.dataset.action === "whiteboard-exit-presentation") {
    const display = document.querySelector("#platform-classroom-whiteboard");
    if (display) {
      const presenting = action.dataset.action === "whiteboard-present";
      display.dataset.presentation = String(presenting);
      const exit = display.querySelector("[data-action=\"whiteboard-exit-presentation\"]");
      if (exit) exit.hidden = !presenting;
      if (!presenting) display.focus();
    }
    return;
  }
  if (action.dataset.action === "whiteboard-page-select") {
    openWhiteboardPage(Number(action.dataset.whiteboardPageIndex));
    return;
  }
  if (action.dataset.action === "whiteboard-page-previous" || action.dataset.action === "whiteboard-page-next") {
    openWhiteboardPage(whiteboardCurrentPageIndex + (action.dataset.action === "whiteboard-page-next" ? 1 : -1));
    return;
  }
  if (action.dataset.action === "whiteboard-page-add") {
    syncCurrentWhiteboardPage();
    whiteboardPages.push(newWhiteboardPage());
    openWhiteboardPage(whiteboardPages.length - 1, { save: false });
    setWhiteboardStatus("A new blank page was added.");
    return;
  }
  if (action.dataset.action === "whiteboard-page-duplicate") {
    syncCurrentWhiteboardPage();
    const source = whiteboardPages[whiteboardCurrentPageIndex];
    const copy = { id: globalThis.crypto?.randomUUID?.() ?? `page-${Date.now()}`, title: `${source.title} copy`.slice(0, 40), objects: structuredClone(source.objects) };
    whiteboardPages.splice(whiteboardCurrentPageIndex + 1, 0, copy);
    openWhiteboardPage(whiteboardCurrentPageIndex + 1, { save: false });
    setWhiteboardStatus("The current page was duplicated.");
    return;
  }
  if (action.dataset.action === "whiteboard-page-rename") {
    const page = whiteboardPages[whiteboardCurrentPageIndex];
    const rename = document.querySelector("[data-whiteboard-page-rename]");
    const input = rename?.querySelector("[data-whiteboard-page-name]");
    if (rename && input) { rename.hidden = false; input.value = page.title; input.focus(); input.select(); }
    return;
  }
  if (action.dataset.action === "whiteboard-page-rename-save") {
    const rename = document.querySelector("[data-whiteboard-page-rename]");
    const title = rename?.querySelector("[data-whiteboard-page-name]")?.value.trim().slice(0, 40);
    if (title) { whiteboardPages[whiteboardCurrentPageIndex].title = title; rename.hidden = true; renderWhiteboardPageStrip(); saveWhiteboard(); setWhiteboardStatus(`Page renamed to ${title}.`); }
    return;
  }
  if (action.dataset.action === "whiteboard-page-rename-cancel") {
    const rename = document.querySelector("[data-whiteboard-page-rename]");
    if (rename) rename.hidden = true;
    return;
  }
  if (action.dataset.action === "whiteboard-page-left" || action.dataset.action === "whiteboard-page-right") {
    syncCurrentWhiteboardPage();
    const destination = whiteboardCurrentPageIndex + (action.dataset.action === "whiteboard-page-right" ? 1 : -1);
    if (destination < 0 || destination >= whiteboardPages.length) return;
    [whiteboardPages[whiteboardCurrentPageIndex], whiteboardPages[destination]] = [whiteboardPages[destination], whiteboardPages[whiteboardCurrentPageIndex]];
    whiteboardCurrentPageIndex = destination;
    renderWhiteboardPageStrip(); saveWhiteboard(); setWhiteboardStatus("Page order updated.");
    return;
  }
  if (action.dataset.action === "whiteboard-page-delete") {
    if (whiteboardPages.length <= 1 || !window.confirm(`Delete ${whiteboardPages[whiteboardCurrentPageIndex].title}?`)) return;
    whiteboardPages.splice(whiteboardCurrentPageIndex, 1);
    whiteboardCurrentPageIndex = Math.min(whiteboardCurrentPageIndex, whiteboardPages.length - 1);
    whiteboardObjects = structuredClone(whiteboardPages[whiteboardCurrentPageIndex].objects ?? []);
    whiteboardSelectedObjectId = ""; whiteboardUndoStack = []; whiteboardRedoStack = [];
    hydrateWhiteboardImages(() => renderWhiteboardObjects()); renderWhiteboardObjects(); renderWhiteboardPageStrip(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("Page deleted.");
    return;
  }
  if (action.dataset.action === "whiteboard-save-named") {
    const canvas = whiteboardCanvas();
    const titleField = document.querySelector("[data-whiteboard-title]");
    const title = titleField?.value.trim();
    if (!canvas || !title) { setWhiteboardStatus("Add a board name before saving."); return; }
    const scheduleType = document.querySelector("[data-whiteboard-schedule-type]")?.value ?? "none";
    const date = document.querySelector("[data-whiteboard-date]")?.value ?? "";
    const studentDisplay = Boolean(document.querySelector("[data-whiteboard-student-display]")?.checked);
    if (scheduleType === "date" && !date) { setWhiteboardStatus("Choose the specific date before saving."); return; }
    if (studentDisplay && scheduleType === "none") { setWhiteboardStatus("Choose a weekly schedule or specific date for automatic Student Display use."); return; }
    whiteboardDrawingTitle = title;
    renderWhiteboardObjects(canvas);
    syncCurrentWhiteboardPage();
    const boards = readWhiteboardLibrary();
    const board = { id: globalThis.crypto?.randomUUID?.() ?? `board-${Date.now()}`, title, classId: document.querySelector("[data-whiteboard-class]")?.value ?? "all", scheduleType, day: scheduleType === "weekly" ? (document.querySelector("[data-whiteboard-day]")?.value ?? WEEKDAYS[0]) : "", date: scheduleType === "date" ? date : "", studentDisplay, gridUnit: whiteboardGridUnit, rulerUnit: whiteboardRulerUnit, ruler: structuredClone(whiteboardRuler), background: { type: whiteboardBackground.type, color1: whiteboardBackground.color1, color2: whiteboardBackground.color2, imageSrc: whiteboardBackground.imageSrc }, image: whiteboardSnapshot(canvas), displayImage: studentDisplay ? whiteboardStudentDisplayImage(canvas) : "", objects: serializableWhiteboardObjects(), pages: structuredClone(whiteboardPages), currentPageIndex: whiteboardCurrentPageIndex, savedAt: Date.now() };
    boards.unshift(board);
    if (!writeWhiteboardLibrary(boards)) { setWhiteboardStatus("This board is too large for browser storage. Export it as a PNG instead."); return; }
    refreshWhiteboardLibraryOptions(board.id);
    setWhiteboardStatus(`Saved “${title}” for later use.`);
    refreshCurrentClassPlan();
    return;
  }
  if (action.dataset.action === "whiteboard-load") {
    const id = document.querySelector("[data-whiteboard-saved]")?.value;
    const board = readWhiteboardLibrary().find((item) => item.id === id);
    if (!board) { setWhiteboardStatus("Choose a saved board to load."); return; }
    pushWhiteboardHistory();
    if (Array.isArray(board.pages) && board.pages.length) {
      whiteboardPages = structuredClone(board.pages);
      whiteboardCurrentPageIndex = Math.min(Math.max(0, Number(board.currentPageIndex) || 0), whiteboardPages.length - 1);
      whiteboardObjects = structuredClone(whiteboardPages[whiteboardCurrentPageIndex].objects ?? []);
    } else {
      whiteboardObjects = Array.isArray(board.objects) && board.objects.length ? structuredClone(board.objects) : [createWhiteboardObject("image", { x: 0, y: 0, width: whiteboardCanvas().width, height: whiteboardCanvas().height, src: board.image })];
      whiteboardPages = [{ ...newWhiteboardPage("Page 1"), objects: structuredClone(whiteboardObjects) }];
      whiteboardCurrentPageIndex = 0;
    }
    whiteboardGridUnit = ["plain", "inch", "cm", "mm"].includes(board.gridUnit) ? board.gridUnit : "plain";
    whiteboardBackground = { type: "white", color1: "#ffffff", color2: "#d8edf5", imageSrc: "", element: null, ...(board.background ?? {}) };
    if (whiteboardBackground.imageSrc) { const backgroundImage = new Image(); backgroundImage.onload = () => { whiteboardBackground.element = backgroundImage; renderWhiteboardObjects(); }; backgroundImage.src = whiteboardBackground.imageSrc; }
    whiteboardRulerUnit = ["none", "english", "metric"].includes(board.rulerUnit) ? board.rulerUnit : "none";
    whiteboardRuler = board.ruler && typeof board.ruler === "object" ? { ...whiteboardRuler, ...board.ruler } : whiteboardRuler;
    whiteboardDrawingTitle = board.title || "Workshop Drawing";
    const gridControl = document.querySelector("[data-whiteboard-grid]"); const rulerControl = document.querySelector("[data-whiteboard-ruler]"); const rulerSides = document.querySelector("[data-whiteboard-ruler-sides]");
    if (gridControl) gridControl.value = whiteboardGridUnit; if (rulerControl) rulerControl.value = whiteboardRulerUnit; if (rulerSides) rulerSides.value = whiteboardRuler.sides;
    whiteboardSelectedObjectId = ""; renderWhiteboardPageStrip(); hydrateWhiteboardImages(() => { renderWhiteboardObjects(); saveWhiteboard(); }); renderWhiteboardObjects();
    const title = document.querySelector("[data-whiteboard-title]");
    if (title) title.value = board.title;
    const scheduleType = document.querySelector("[data-whiteboard-schedule-type]");
    const weekday = document.querySelector("[data-whiteboard-day]");
    const date = document.querySelector("[data-whiteboard-date]");
    const studentDisplay = document.querySelector("[data-whiteboard-student-display]");
    if (scheduleType) scheduleType.value = board.scheduleType === "date" ? "date" : board.scheduleType === "weekly" && board.day && board.day !== "any" ? "weekly" : "none";
    if (weekday && board.day && board.day !== "any") weekday.value = board.day;
    if (date) date.value = board.date ?? "";
    if (studentDisplay) studentDisplay.checked = board.studentDisplay === true;
    if (scheduleType) scheduleType.dispatchEvent(new Event("change", { bubbles: true }));
    setWhiteboardStatus(`Loaded “${board.title}”.`);
    return;
  }
  if (action.dataset.action === "whiteboard-delete") {
    const id = document.querySelector("[data-whiteboard-saved]")?.value;
    const boards = readWhiteboardLibrary();
    const board = boards.find((item) => item.id === id);
    if (!board) { setWhiteboardStatus("Choose a saved board to delete."); return; }
    writeWhiteboardLibrary(boards.filter((item) => item.id !== id));
    refreshWhiteboardLibraryOptions();
    setWhiteboardStatus(`Deleted the saved copy of “${board.title}”. The open board was not cleared.`);
    return;
  }
  if (action.dataset.action === "whiteboard-export") {
    const canvas = whiteboardCanvas();
    if (!canvas) return;
    const title = document.querySelector("[data-whiteboard-title]")?.value.trim() || "classroom-whiteboard";
    const link = document.createElement("a");
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "classroom-whiteboard"}.png`;
    link.href = whiteboardSnapshot(canvas);
    link.click();
    setWhiteboardStatus("Whiteboard exported as a PNG image.");
    return;
  }
  if (action.dataset.action === "whiteboard-add-text") {
    const canvas = whiteboardCanvas();
    const field = document.querySelector("[data-whiteboard-text]");
    const text = field?.value.trim();
    if (!canvas || !text) return;
    pushWhiteboardHistory();
    const size = Math.max(22, Number(document.querySelector("[data-whiteboard-size]")?.value ?? 6) * 5);
    const object = createWhiteboardObject("text", { text, x: 35, y: Math.min(canvas.height - 80, 30 + whiteboardObjects.length * 24), width: Math.min(canvas.width - 70, Math.max(180, text.length * size * 0.55)), height: size * 1.3, fontSize: size, fontFamily: document.querySelector("[data-whiteboard-text-font]")?.value ?? "Arial", color: document.querySelector("[data-whiteboard-text-color]")?.value ?? document.querySelector("[data-whiteboard-color]")?.value ?? "#12384d", background: document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent", cursiveGuide: document.querySelector("[data-whiteboard-cursive-lines]")?.value ?? "none", bold: document.querySelector('[data-text-command="bold"]')?.getAttribute("aria-pressed") === "true", italic: document.querySelector('[data-text-command="italic"]')?.getAttribute("aria-pressed") === "true", underline: document.querySelector('[data-text-command="underline"]')?.getAttribute("aria-pressed") === "true", rotation: 0 });
    whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; field.value = ""; renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls();
    return;
  }
  if (action.dataset.action === "whiteboard-apply-text-background") {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type !== "text") { setWhiteboardStatus("Select a text object before applying a text background."); return; }
    pushWhiteboardHistory(); selected.background = document.querySelector("[data-whiteboard-text-background]")?.value ?? "transparent"; renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus("Text background updated."); return;
  }
  if (action.dataset.action === "whiteboard-apply-all-3d-face-colors") {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    const is3D = Boolean(selected?.extruded3D || ["cube", "rectangular-prism", "triangular-prism", "hexagonal-prism", "cylinder", "cone", "pyramid", "sphere", "hemisphere"].includes(selected?.type));
    if (!selected || !is3D) { setWhiteboardStatus("Select a 3D shape before changing its face colors."); return; }
    const faceColors = { front: document.querySelector("[data-whiteboard-3d-front-color]")?.value ?? "#287da0", side: document.querySelector("[data-whiteboard-3d-side-color]")?.value ?? "#f0a52b", top: document.querySelector("[data-whiteboard-3d-top-color]")?.value ?? "#55a875" };
    pushWhiteboardHistory(); selected.faceColors = faceColors; renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); setWhiteboardStatus("Front, side, and top or back face colors updated together."); return;
  }
  if (["whiteboard-copy", "whiteboard-paste", "whiteboard-duplicate", "whiteboard-push-2d", "whiteboard-rotate-left", "whiteboard-rotate-right", "whiteboard-delete-object"].includes(action.dataset.action)) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (action.dataset.action === "whiteboard-copy") { if (selected) { whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((object) => object.id === selected.id)); if (selected.type === "image") void copySelectedWhiteboardObjectAsImage(); else setWhiteboardStatus("Selected object copied."); } else setWhiteboardStatus("Select an object first."); return; }
    if (action.dataset.action === "whiteboard-paste") { if (!whiteboardClipboard) { setWhiteboardStatus("Copy an object before pasting."); return; } pushWhiteboardHistory(); const copy = duplicateWhiteboardObject(whiteboardClipboard); whiteboardObjects.push(copy); whiteboardSelectedObjectId = copy.id; hydrateWhiteboardImages(() => renderWhiteboardObjects()); saveWhiteboard(); return; }
    if (!selected && action.dataset.action === "whiteboard-delete-object") { whiteboardDeleteNextObject = true; whiteboardCanvas()?.focus({ preventScroll: true }); setWhiteboardStatus("Delete is ready. Click the next object you want to remove."); return; }
    if (!selected) { setWhiteboardStatus("Select an object first."); return; }
    if (action.dataset.action === "whiteboard-push-2d") {
      const flattened = flattenWhiteboard3DShape(selected);
      if (!flattened.length) { setWhiteboardStatus("Select a 3D object first."); return; }
      pushWhiteboardHistory();
      const selectedIndex = whiteboardObjects.findIndex((object) => object.id === selected.id);
      whiteboardObjects.splice(selectedIndex, 1, ...flattened); whiteboardSelectedObjectId = flattened[0]?.id ?? "";
      renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus(flattened.length > 1 ? `The 3D shape was unfolded into ${flattened.length} editable 2D shapes.` : "The object was pushed back to its original 2D form."); return;
    }
    if (["whiteboard-rotate-left", "whiteboard-rotate-right"].includes(action.dataset.action)) {
      if (["path", "dimension"].includes(selected.type)) { setWhiteboardStatus("Rotation is available for images, text, lines, arrows, and 2D or 3D shapes."); return; }
      pushWhiteboardHistory(); selected.rotation = (selected.rotation ?? 0) + (action.dataset.action === "whiteboard-rotate-left" ? -Math.PI / 12 : Math.PI / 12); renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus("Selected object rotated 15 degrees."); return;
    }
    pushWhiteboardHistory();
    if (action.dataset.action === "whiteboard-duplicate") { const copy = duplicateWhiteboardObject(selected); whiteboardObjects.push(copy); whiteboardSelectedObjectId = copy.id; hydrateWhiteboardImages(() => renderWhiteboardObjects()); }
    else { whiteboardObjects = whiteboardObjects.filter((object) => object.id !== selected.id); whiteboardSelectedObjectId = ""; }
    renderWhiteboardObjects(); saveWhiteboard(); return;
  }
  if (action.dataset.action === "whiteboard-undo" || action.dataset.action === "whiteboard-redo") {
    const canvas = whiteboardCanvas();
    if (!canvas) return;
    const source = action.dataset.action === "whiteboard-undo" ? whiteboardUndoStack : whiteboardRedoStack;
    const target = action.dataset.action === "whiteboard-undo" ? whiteboardRedoStack : whiteboardUndoStack;
    const snapshot = source.pop();
    if (!snapshot) return;
    target.push(JSON.stringify(serializableWhiteboardObjects()));
    whiteboardObjects = JSON.parse(snapshot); whiteboardSelectedObjectId = ""; hydrateWhiteboardImages(() => renderWhiteboardObjects(canvas)); renderWhiteboardObjects(canvas); saveWhiteboard(canvas); updateWhiteboardHistoryControls();
    return;
  }
  if (action.dataset.action === "whiteboard-clear") {
    const confirmation = document.querySelector("[data-whiteboard-clear-confirmation]");
    if (confirmation) confirmation.hidden = false;
    return;
  }
  if (action.dataset.action === "whiteboard-keep") {
    const confirmation = document.querySelector("[data-whiteboard-clear-confirmation]");
    if (confirmation) confirmation.hidden = true;
    return;
  }
  if (action.dataset.action === "whiteboard-confirm-clear") {
    const canvas = whiteboardCanvas();
    if (canvas) { pushWhiteboardHistory(); whiteboardObjects = []; whiteboardSelectedObjectId = ""; renderWhiteboardObjects(canvas); saveWhiteboard(canvas); }
    whiteboardRedoStack = [];
    updateWhiteboardHistoryControls();
    const confirmation = document.querySelector("[data-whiteboard-clear-confirmation]");
    if (confirmation) confirmation.hidden = true;
    return;
  }
  if (action.dataset.action === "voice-meter-start") {
    void startVoiceMeter();
    return;
  }
  if (action.dataset.action === "voice-meter-stop") {
    stopVoiceMeter(action.dataset.meterStopMessage);
    return;
  }
  if (action.dataset.action === "open-voice-meter-display") {
    const display = document.querySelector("#platform-large-voice-meter-display");
    if (display) {
      voiceMeterDisplayTrigger = action;
      display.hidden = false;
      display.focus();
    }
    return;
  }
  if (action.dataset.action === "close-voice-meter-display") {
    const display = document.querySelector("#platform-large-voice-meter-display");
    if (display) display.hidden = true;
    voiceMeterDisplayTrigger?.focus();
    voiceMeterDisplayTrigger = null;
    return;
  }
  if (action.dataset.action === "reflection-dictate") {
    void startReflectionDictation(action);
    return;
  }
  if (action.dataset.action === "reflection-dictate-stop") {
    reflectionRecognition?.stop();
    const status = action.closest("form")?.querySelector("[data-reflection-speech-status]");
    if (status) status.textContent = "Stopping…";
    return;
  }
  if (action.dataset.action === "open-manage-classes-section") {
    event.preventDefault();
    pendingScrollTarget = action.dataset.scrollTarget ?? "";
    navigate(ROUTES.TEACHER_CLASSES);
    return;
  }
  if (action.dataset.action === "open-teacher-dashboard-section") {
    event.preventDefault();
    pendingScrollTarget = action.dataset.scrollTarget ?? "";
    navigate(ROUTES.TEACHER_DASHBOARD);
    return;
  }
  if (action.dataset.action === "add-lesson-step") {
    const builder = document.querySelector('[data-lesson-builder="steps"]');
    const editor = builder?.querySelector(".platform-direction-editor");
    if (builder) builder.open = true;
    if (editor) editor.open = true;
    editor?.querySelector('[name="title"]')?.focus();
    return;
  }
  if (["save-direction-card", "save-release-direction-card", "edit-direction-card", "release-direction-card", "withdraw-direction-card", "duplicate-direction-card", "move-direction-card", "remove-direction-card", "cancel-direction-edit"].includes(action.dataset.action)) {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-activity-directions-teacher]") ?? document.querySelector("[data-activity-directions-teacher]");
    const form = region?.querySelector('[data-form="activity-direction"]');
    if (!classId || !region || !form) return;
    const id = action.dataset.directionId;
    if (["save-direction-card", "save-release-direction-card"].includes(action.dataset.action)) {
      const resources = [...form.querySelectorAll("[data-direction-resource-list] .platform-direction-resource-row")].map((row) => ({ mediaType: row.querySelector('[name="resourceType"]').value, title: row.querySelector('[name="resourceTitle"]').value.trim(), url: row.querySelector('[name="resourceUrl"]').value.trim() })).filter((item) => item.url);
      const result = activityDirections.saveCard(classId, { id: form.elements.id.value, title: form.elements.title.value, directions: form.elements.directions.value, resources });
      if (!result.ok) { const output = form.querySelector("[data-activity-direction-status]"); if (output) output.textContent = result.reason === "missing-media" ? "Add a secure https link for the selected media." : "Add both a card title and student directions."; return; }
      const visibility = form.elements.visibility?.value || (action.dataset.action === "save-release-direction-card" ? "released" : "draft");
      if (visibility === "released") activityDirections.release(classId, result.card.id); else activityDirections.withdraw(classId, result.card.id);
      const savedCard = activityDirections.read(classId).cards.find((item) => item.id === result.card.id);
      action.disabled = true;
      await saveLessonStepToService(classId, savedCard);
    }
    if (action.dataset.action === "edit-direction-card") {
      const card = activityDirections.read(classId).cards.find((item) => item.id === id);
      if (!card) return;
      form.elements.id.value = card.id; form.elements.title.value = card.title; form.elements.directions.value = card.directions;
      if (form.elements.visibility) form.elements.visibility.value = card.status;
      const resourceList = form.querySelector("[data-direction-resource-list]"); if (resourceList) resourceList.innerHTML = (card.resources || []).map(directionResourceEditorRow).join("");
      form.closest("details").open = true; form.elements.title.focus(); return;
    }
    if (action.dataset.action === "release-direction-card") {
      activityDirections.release(classId, id);
      action.disabled = true;
      await saveLessonStepToService(classId, activityDirections.read(classId).cards.find((item) => item.id === id));
    }
    if (action.dataset.action === "withdraw-direction-card") {
      activityDirections.withdraw(classId, id);
      action.disabled = true;
      await saveLessonStepToService(classId, activityDirections.read(classId).cards.find((item) => item.id === id));
    }
    if (action.dataset.action === "duplicate-direction-card") activityDirections.duplicate(classId, id);
    if (action.dataset.action === "move-direction-card") activityDirections.move(classId, id, Number(action.dataset.directionOffset));
    if (action.dataset.action === "remove-direction-card") activityDirections.remove(classId, id);
    region.outerHTML = activityDirectionsTeacherMarkup(classId);
    return;
  }
  if (["add-direction-resource", "remove-direction-resource", "move-direction-resource"].includes(action.dataset.action)) {
    const list = action.closest('[data-form="activity-direction"]')?.querySelector("[data-direction-resource-list]"); if (!list) return;
    if (action.dataset.action === "add-direction-resource") list.insertAdjacentHTML("beforeend", directionResourceEditorRow());
    if (action.dataset.action === "remove-direction-resource") action.closest(".platform-direction-resource-row")?.remove();
    if (action.dataset.action === "move-direction-resource") { const row = action.closest(".platform-direction-resource-row"), offset = Number(action.dataset.offset), sibling = offset < 0 ? row?.previousElementSibling : row?.nextElementSibling; if (row && sibling) offset < 0 ? list.insertBefore(row, sibling) : list.insertBefore(sibling, row); }
    return;
  }
  if (action.dataset.action === "close-optional-dashboard-section") {
    const section = action.closest("[data-optional-dashboard-section]");
    if (section) section.hidden = true;
    document.querySelector("#teacher-classroom-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (["prepare-class-resource", "push-class-resource", "hide-class-resource", "push-saved-resource", "remove-saved-resource"].includes(action.dataset.action)) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = action.closest("[data-class-resource-teacher]");
    const form = region?.querySelector('[data-form="class-resource"]');
    if (!classId || !region || !form) return;
    let result = { ok: true };
    if (["prepare-class-resource", "push-class-resource"].includes(action.dataset.action)) {
      const result = classResourceSharing.prepare(classId, { type: form.elements.type.value, title: form.elements.title.value, url: form.elements.url.value, release: form.elements.release.value });
      if (!result.ok) {
        const status = region.querySelector("[data-class-resource-status]");
        if (status) status.textContent = "Add a title and a safe http(s) or platform resource address.";
        return;
      }
    }
    if (action.dataset.action === "push-class-resource") result = classResourceSharing.push(classId, form.elements.slot.value, form.elements.rowId.value);
    if (action.dataset.action === "hide-class-resource") classResourceSharing.stop(classId, action.dataset.resourceIndex, action.dataset.resourceRowId);
    if (action.dataset.action === "push-saved-resource") result = classResourceSharing.pushSaved(classId, action.dataset.resourceId, form.elements.slot.value, form.elements.rowId.value);
    if (action.dataset.action === "remove-saved-resource") classResourceSharing.removeSaved(classId, action.dataset.resourceId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    if (!result.ok && result.reason === "tray-full") {
      const status = document.querySelector("[data-class-resource-status]");
      if (status) status.textContent = "Every current slot is full. Choose Add an Additional Slot, replace a slot, or uncheck a resource.";
    }
    return;
  }
  if (action.dataset.action === "print-classroom-codes") {
    window.print();
    return;
  }
  if (action.dataset.action === "timer-recommend-phases") {
    const form = action.closest('form[data-form="class-timer-schedule"]');
    const duration = Number(form?.querySelector('[name="durationMinutes"]')?.value);
    const recommended = recommendedTimerPhases(duration);
    recommended.forEach((phase) => {
      const input = form?.querySelector(`[data-phase-start="${phase.key}"]`);
      if (input) input.value = String(phase.startMinute);
    });
    return;
  }
  if (action.dataset.action === "timer-test-sound") {
    const form = action.closest("form");
    const selected = form?.querySelector(`[name="${action.dataset.soundField}"]`)?.value;
    if (selected === "Custom Upload") {
      const fileField = form?.querySelector(`[name="${action.dataset.soundField}File"]`);
      const stored = classTimerSchedule.read()[action.dataset.soundField.replace("Sound", "CustomAudio")];
      void readTimerAudioFile(fileField?.files?.[0]).then((audio) => playTimerSound(selected, audio || stored)).catch(() => {
        const output = form?.querySelector("[data-class-timer-schedule-error]");
        if (output) { output.textContent = "Choose a valid custom audio file of 750 KB or smaller."; output.hidden = false; }
      });
    } else playTimerSound(selected);
    return;
  }
  if (action.dataset.action === "close-classroom-codes") {
    oneTimeClassroomCodes = null;
    const region = document.querySelector("[data-classroom-setup]");
    if (region) region.outerHTML = classroomSetupMarkup();
    return;
  }
  if (action.dataset.action === "evidence-start") {
    evidenceDraft = { type: action.dataset.evidenceType, detail: "", fileName: "", file: null, previewUrl: "", hasSelection: false };
    evidenceNotice = "";
    renderEvidenceFoundation();
    document.querySelector("#evidence-capture-title")?.focus();
    return;
  }
  if (action.dataset.action === "evidence-teacher-launch") {
    void launchEvidencePilot();
    return;
  }
  if (action.dataset.action === "evidence-teacher-refresh") {
    void refreshTeacherLiveEvidence();
    return;
  }
  if (action.dataset.action === "evidence-teacher-live-open") {
    void openTeacherLiveEvidence(action.dataset.evidenceId);
    return;
  }
  if (action.dataset.action === "governance-simulation-cancel") {
    evidenceGovernanceSimulation.cancel();
    renderGovernanceSimulation();
    return;
  }
  if (action.dataset.action === "governance-simulation-reset") {
    evidenceGovernanceSimulation.reset();
    renderGovernanceSimulation();
    return;
  }
  if (action.dataset.action === "google-connection-preview-begin") {
    googleConnectionPreview.begin();
    renderGoogleConnectionPreview();
    return;
  }
  if (action.dataset.action === "google-connection-preview-cancel") {
    googleConnectionPreview.cancel();
    renderGoogleConnectionPreview();
    return;
  }
  if (action.dataset.action === "google-connection-preview-disconnect") {
    googleConnectionPreview.disconnect();
    renderGoogleConnectionPreview();
    return;
  }
  if (action.dataset.action === "teacher-evidence-open") {
    teacherEvidenceSelection = action.dataset.evidenceId;
    renderTeacherEvidenceReview();
    document.querySelector(".platform-teacher-evidence-detail")?.focus();
    return;
  }
  if (action.dataset.action === "evidence-retake") {
    if (evidenceDraft?.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
    evidenceDraft = { ...evidenceDraft, detail: "", fileName: "", file: null, previewUrl: "", hasSelection: false };
    evidenceNotice = "Ready for another capture. Nothing was saved.";
    renderEvidenceFoundation();
    return;
  }
  if (action.dataset.action === "evidence-cancel") {
    if (evidenceDraft?.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
    evidenceDraft = null;
    evidenceNotice = "Capture canceled. Nothing was saved.";
    renderEvidenceFoundation();
    return;
  }
  if (action.dataset.action === "evidence-open-log") {
    document.querySelector("#student-evidence-log")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("#evidence-log-title")?.focus();
    return;
  }
  if (action.dataset.action === "evidence-save") {
    void saveEvidenceDraft();
    return;
  }
  if (action.dataset.action === "sign-out") {
    stopVoiceMeter();
    storeLessonTimerDisplayOpen(false);
    lessonTimer.clear();
    session.signOut();
    teacherMemo.clear();
    todaysMission.clear();
    studentDisplayMode.clear();
    navigate(ROUTES.WELCOME, { replace: true });
    if (studentTimerPopout && !studentTimerPopout.closed) studentTimerPopout.close();
    studentTimerPopout = null;
    if (classroomPresentationWindow && !classroomPresentationWindow.closed) classroomPresentationWindow.close();
    classroomPresentationWindow = null;
    if (productionIdentityConfig.enabled) void productionIdentity.signOut();
    pb002jClasswide.signOut();
  }
  if (action.dataset.action === "pb002j-withdraw") {
    void pb002jClasswide.handleWithdraw();
  }
  if (action.dataset.action === "reserved-nav") {
    const status = document.querySelector("#teacher-nav-status");
    if (status) status.textContent = `${action.dataset.label}: Coming in future build.`;
  }
  if (action.dataset.action === "select-student") {
    const state = session.read();
    const student = getStudentById(action.dataset.studentId);
    if (!student || student.classId !== state.pendingClassId) return navigate(ROUTES.STUDENT_ENTRY, { replace: true });
    session.selectStudent(student.id);
    navigate(ROUTES.STUDENT_IDENTIFIER);
  }
  if (action.dataset.action === "instant-timer") {
    lessonTimer.setDuration(Number(action.dataset.instantMinutes));
    lessonTimer.start();
    syncLessonTimerPresentation();
    return;
  }
  if (action.dataset.action === "stopwatch-start") {
    if (stopwatchInterval === null) stopwatchInterval = window.setInterval(() => {
      stopwatchSeconds += 1;
      document.querySelectorAll("[data-stopwatch-output]").forEach((output) => { output.textContent = formatLessonTime(stopwatchSeconds); });
    }, 1000);
    return;
  }
  if (action.dataset.action === "stopwatch-pause") {
    if (stopwatchInterval !== null) window.clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    return;
  }
  if (action.dataset.action === "stopwatch-reset") {
    if (stopwatchInterval !== null) window.clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchSeconds = 0;
    document.querySelectorAll("[data-stopwatch-output]").forEach((output) => { output.textContent = formatLessonTime(0); });
    return;
  }
  if (action.dataset.action === "timer-view-mode") {
    setPresentationTimerViewMode(action.dataset.timerViewMode);
    return;
  }
  if (action.dataset.action === "timer-start-or-resume") {
    lessonTimer.read().status === LESSON_TIMER_STATES.PAUSED ? lessonTimer.resume() : lessonTimer.start();
    syncLessonTimerPresentation();
    return;
  }
  const timerActions = {
    "timer-start": () => lessonTimer.start(),
    "timer-pause": () => lessonTimer.pause(),
    "timer-resume": () => lessonTimer.resume(),
    "timer-reset": () => lessonTimer.reset(),
    "timer-end": () => lessonTimer.end(),
    "timer-subtract-minute": () => lessonTimer.subtractMinute(),
    "timer-add-minute": () => lessonTimer.addMinute(),
  };
  if (timerActions[action.dataset.action]) {
    timerActions[action.dataset.action]();
    syncLessonTimerPresentation();
  }
  if (action.dataset.action === "clear-teacher-memo") {
    teacherMemo.clear();
    syncTeacherMemoPresentation();
    const error = document.querySelector("[data-teacher-memo-error]");
    const status = document.querySelector("[data-teacher-memo-status]");
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    if (status) {
      status.dataset.state = "empty";
      status.textContent = "Memo cleared. No memo is currently saved.";
    }
  }
  if (action.dataset.action === "apply-memo-format") {
    if (!applyMemoFormatToSelection()) {
      const status = document.querySelector("[data-teacher-memo-status]");
      if (status) status.textContent = "Highlight some memo text, then apply formatting.";
    }
  }
  if (action.dataset.action === "apply-class-setup") {
    const section = action.closest(".platform-class-setup-sharing");
    const currentId = classSetupProfiles.read().currentClassId;
    preserveCurrentClassSetup(currentId);
    const all = section?.querySelector("[data-class-setup-all]")?.checked;
    const targets = all
      ? pilotTeacherClasses.filter((item) => item.id !== currentId).map((item) => item.id)
      : [...(section?.querySelectorAll("[data-class-setup-target]:checked") ?? [])].map((input) => input.value);
    const components = Object.fromEntries([...(section?.querySelectorAll("[data-class-setup-component]") ?? [])].map((input) => [input.dataset.classSetupComponent, input.checked]));
    const targetNames = pilotTeacherClasses.filter((item) => targets.includes(item.id)).map((item) => item.periodLabel).join(", ");
    if (!targets.length || (!components.timer && !components.memo && !components.resources && !components.reflection)) {
      const status = section?.querySelector("[data-class-setup-status]");
      if (status) status.textContent = "Choose at least one class and one setup type.";
      return;
    }
    if (!window.confirm(`Apply the selected setup to ${targetNames}? Unselected settings will remain unchanged.`)) return;
    classSetupProfiles.copy(currentId, targets, components);
    if (components.resources) targets.forEach((classId) => classResourceSharing.copyPlan(currentId, classId));
    if (components.reflection) {
      const required = weeklyReflections.requirement(currentId);
      targets.forEach((classId) => weeklyReflections.setRequirement(classId, required));
    }
    const status = section?.querySelector("[data-class-setup-status]");
    if (status) status.textContent = `Setup copied to ${targetNames}.`;
  }
  if (action.dataset.action === "save-message-to-library") {
    const title = document.querySelector("[data-message-library-title]")?.value ?? "";
    const memo = teacherMemo.read();
    const result = messageLibrary.save({ title, ...memo });
    if (!result.ok) {
      const status = document.querySelector("[data-message-library-status]");
      if (status) status.textContent = result.reason === "limit" ? "The 20-message library is full." : "Add a title and save a memo first.";
      return;
    }
    render();
  }
  if (action.dataset.action === "save-class-message") {
    const region = action.closest(".platform-class-message-creator");
    const result = messageLibrary.save({
      title: region?.querySelector("[data-class-message-title]")?.value ?? "",
      text: region?.querySelector("[data-class-message-text]")?.value ?? "",
      color: region?.querySelector("[data-class-message-color]")?.value ?? "white",
      size: region?.querySelector("[data-class-message-size]")?.value ?? "extra-large",
      style: region?.querySelector("[data-class-message-style]")?.value ?? "bold",
    });
    if (!result.ok) {
      const status = region?.querySelector("[data-class-message-status]");
      if (status) status.textContent = result.reason === "limit" ? "The shared library is full. Delete an older message first." : "Add both a message title and message text.";
      return;
    }
    render();
    return;
  }
  if (action.dataset.action === "use-saved-message") {
    const message = messageLibrary.read().messages.find((item) => item.id === action.dataset.messageId);
    if (message) { teacherMemo.save(message.text, message); render(); }
  }
  if (action.dataset.action === "delete-saved-message") {
    if (window.confirm("Delete this saved message?")) { messageLibrary.remove(action.dataset.messageId); render(); }
  }
  if (action.dataset.action === "delete-captains-log-prompt") {
    if (window.confirm("Delete this Captain’s Log prompt from My Library?")) { weeklyReflections.deleteCaptainLogPrompt(action.dataset.promptId); render(); }
  }
  if (action.dataset.action === "clear-captains-log-week") {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id;
    const section = action.closest(".platform-captains-log-planner");
    const editorWeek = Number(section?.dataset.captainsLogEditorWeek);
    if (window.confirm(`Start Week ${editorWeek} blank? This clears the five prompt selections and weekly goal for this class.`)) {
      weeklyReflections.clearCaptainLogWeekPlan(classId, editorWeek);
      render();
    }
    return;
  }
  if (action.dataset.action === "copy-captains-log-week") {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id;
    const section = action.closest(".platform-captains-log-planner");
    const targets = [...section.querySelectorAll("[data-captains-log-copy-target]:checked")].map((input) => input.value);
    const editorWeek = Number(section.dataset.captainsLogEditorWeek);
    const result = weeklyReflections.copyCaptainLogWeekPlan(classId, targets, CAPTAINS_LOG_WEEKDAYS, editorWeek);
    const status = section.querySelector("[data-captains-log-copy-status]");
    if (status) status.textContent = result.ok ? `Copied the five-day plan to ${result.copied} class${result.copied === 1 ? "" : "es"}.` : "Choose at least one other class.";
    return;
  }
  if (action.dataset.action === "save-message-assignments") {
    document.querySelectorAll("[data-message-assignment]").forEach((select) => messageLibrary.assign(action.dataset.classId, select.dataset.messageAssignment, select.value));
    render();
  }
  if (action.dataset.action === "clear-todays-mission") {
    const confirmation = document.querySelector("[data-todays-mission-confirmation]");
    if (confirmation && confirmation.hidden) {
      confirmation.hidden = false;
      confirmation.querySelector('[data-action="keep-todays-mission"]')?.focus();
    }
  }
  if (action.dataset.action === "keep-todays-mission") {
    closeTodaysMissionClearConfirmation();
  }
  if (action.dataset.action === "confirm-clear-todays-mission") {
    if (action.disabled) return;
    action.disabled = true;
    todaysMission.clear();
    syncTodaysMissionPresentation();
    const form = document.querySelector('[data-form="todays-mission"]');
    if (form) {
      form.elements.title.value = "";
      form.querySelectorAll('input[type="checkbox"]').forEach((control) => {
        control.checked = false;
      });
    }
    const titleCount = document.querySelector("[data-todays-mission-title-count]");
    const focusCount = document.querySelector("[data-todays-mission-focus-count]");
    const error = document.querySelector("[data-todays-mission-error]");
    const status = document.querySelector("[data-todays-mission-status]");
    if (titleCount) titleCount.textContent = "0";
    if (focusCount) focusCount.textContent = "0";
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    if (status) {
      status.dataset.state = "empty";
      status.textContent = "Today’s Plan cleared. No plan is currently saved.";
    }
    closeTodaysMissionClearConfirmation({ restoreFocus: false });
  }
  if (action.dataset.action === "select-presentation-mode") {
    const hasMessageContent = Boolean(teacherMemo.read().text || todaysMission.read().title);
    const result = studentDisplayMode.select(action.dataset.presentationMode, { hasMemo: hasMessageContent });
    if (result.ok) syncStudentDisplayPresentation();
  }
  if (action.dataset.action === "open-amig-anchor-chart") {
    openClassroomPresentationWindow();
    const chart = classroomPresentationWindow?.document.querySelector('[data-smartboard-tool="amig"]');
    if (chart) {
      chart.hidden = false;
      bringSmartboardToolForward(chart);
      chart.focus?.();
    }
    const status = document.querySelector("[data-classroom-window-status]");
    if (status && chart) status.textContent = "The AMIG Anchor Chart is showing on the Classroom Display.";
  }
  if (action.dataset.action === "open-timer-display") {
    syncStudentDisplayPresentation();
    const display = document.querySelector("#platform-student-timer-display");
    if (display) {
      lessonTimerDisplayTrigger = action;
      storeLessonTimerDisplayOpen(true);
      display.hidden = false;
      display.focus();
      window.requestAnimationFrame(fitStudentMemoPresentation);
      if (studentDisplayVoiceMeterIsEnabled() && !voiceMeterStream) void startVoiceMeter();
    }
  }
  if (action.dataset.action === "open-name-picker-display") {
    syncStudentDisplayPresentation();
    installSmartboardToolPopoutButtons(document);
    const display = document.querySelector("#platform-student-timer-display");
    const picker = display?.querySelector('[data-smartboard-tool="names"]');
    if (picker && display) {
      picker.hidden = false;
      updateNamePickerView(document);
      display.dataset.toolOnly = "names";
      display.hidden = false;
      installSmartboardPopoutFullscreenButton(picker, document);
      picker.focus?.();
    }
  }
  if (action.dataset.action === "open-timer-popout") {
    openStudentTimerPopout();
  }
  if (action.dataset.action === "open-classroom-presentation-window") {
    openClassroomPresentationWindow();
  }
}

function renderEvidenceFoundation() {
  const region = document.querySelector("[data-evidence-foundation]");
  if (!region) return;
  const workspace = region.querySelector(".platform-evidence-workspace");
  if (workspace) workspace.outerHTML = evidenceCaptureMarkup();
}

function renderTeacherEvidenceReview() {
  const region = document.querySelector("[data-teacher-evidence-review]");
  if (region) region.outerHTML = teacherEvidenceReviewMarkup();
}

function renderGovernanceSimulation() {
  const region = document.querySelector("[data-governance-simulation]");
  if (!region) return;
  const policyReady = evidenceGovernance.read().status === EVIDENCE_GOVERNANCE_STATUS.DRAFT_SAVED;
  region.outerHTML = governanceSimulationMarkup({ policyReady });
}

function renderGoogleConnectionPreview() {
  const region = document.querySelector("[data-google-connection-preview]");
  if (region) region.outerHTML = googleConnectionPreviewMarkup();
}

function render() {
  const requestedRoute = currentRoute();
  if (!knownRoutes.has(requestedRoute)) return navigate(ROUTES.WELCOME, { replace: true });
  if (requestedRoute === ROUTES.PREVIEW_CLASSROOM_DEMO) {
    setClassroomDemoMode(true);
    session.signInTeacher("teacher-preview-1");
    seedClassroomDemo();
    return navigate(ROUTES.TEACHER_DASHBOARD, { replace: true });
  }
  if (requestedRoute === ROUTES.PREVIEW_TEACHER) {
    setClassroomDemoMode(false);
    session.signInTeacher("teacher-preview-1");
    lessonTimer.setDuration(classTimerSchedule.readEffective().durationMinutes);
    return navigate(ROUTES.TEACHER_DASHBOARD, { replace: true });
  }
  if (requestedRoute === ROUTES.PREVIEW_STUDENT) {
    session.signInStudent("class-preview-1", "student-preview-1");
    return navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
  }
  const state = session.read();
  const allowedRoute = guardRoute(requestedRoute, state);
  if (allowedRoute !== requestedRoute) return navigate(allowedRoute, { replace: true });
  root.innerHTML = viewForRoute(allowedRoute, state);
  root.querySelector('[data-action="clear-captains-log-week"]')?.remove();
  root.querySelector("#captains-log-planner-title")?.insertAdjacentHTML("afterend", `
    <details class="platform-captains-log-evaluation-evidence">
      <summary>What the Principal Wants to See</summary>
      <div class="platform-captains-log-evaluation-body">
        <section>
          <h3>Purpose of the activity</h3>
          <p>Every result gives students something to notice, explain, and improve. Captain’s Log makes student thinking visible, builds reflection into the learning cycle, and gives the teacher timely evidence for planning the next lesson.</p>
        </section>
        <section>
          <h3>Evidence aligned to Ohio’s Accomplished level</h3>
          <p>Use this as a planning and evidence guide—not as a guarantee of an evaluation rating. Ohio districts may add local requirements.</p>
          <ul>
            <li><strong>Standards and measurable goals:</strong> identify the learning standard, success criteria, and the thinking students will demonstrate in the selected prompt.</li>
            <li><strong>Knowledge of individual students:</strong> use Starting, Growing, and Stretching prompts intentionally, based on prior responses and readiness—not as fixed student labels.</li>
            <li><strong>Responsive differentiation:</strong> provide accessible entry points, vocabulary support, and deeper follow-up questions while preserving the same rigorous learning goal.</li>
            <li><strong>Formative assessment:</strong> review responses for class and individual patterns, misconceptions, evidence use, and changes in student thinking.</li>
            <li><strong>Feedback and questioning:</strong> document how teacher or Bob follow-up questions prompted students to explain, support, revise, or extend their thinking.</li>
            <li><strong>Instructional adjustment:</strong> connect the evidence to a specific next action—reteaching, regrouping, a new model, added practice, or greater challenge—and check whether it worked.</li>
            <li><strong>Student ownership:</strong> show students using feedback and reflection to name progress, revise work, and choose a productive next step.</li>
            <li><strong>Collaboration and communication:</strong> share appropriate learning evidence with students, families, colleagues, or support staff to plan for individual needs.</li>
          </ul>
        </section>
        <section>
          <h3>Accomplished-level wording for lesson plans</h3>
          <div class="platform-captains-log-evaluation-copy">
            <p><strong>Planning:</strong> “I selected this Captain’s Log prompt to collect standards-aligned evidence of students’ ability to explain their process, use evidence, and identify a next step.”</p>
            <p><strong>Differentiation:</strong> “Students work toward the same learning goal through responsive Starting, Growing, or Stretching questions. Prompt level and support are adjusted from current response evidence.”</p>
            <p><strong>Assessment:</strong> “I will analyze individual responses and class patterns to identify strengths, misconceptions, and readiness for extension.”</p>
            <p><strong>Next instruction:</strong> “The evidence will determine who needs reteaching, a different representation, targeted feedback, regrouping, or additional challenge. I will review the next response to evaluate the impact of that adjustment.”</p>
            <p><strong>Student ownership:</strong> “Students will use feedback to explain what changed in their thinking, revise their work, and name the next action they will take.”</p>
          </div>
        </section>
        <section>
          <h3>Save as evaluation evidence</h3>
          <ul>
            <li>The standard, learning target, success criteria, and selected prompt.</li>
            <li>Anonymous before-and-after response examples from more than one readiness level.</li>
            <li>A brief class-trend note plus the individual needs you identified.</li>
            <li>The instructional change you made and evidence showing its effect.</li>
            <li>Examples of student revision, self-reflection, and use of feedback.</li>
          </ul>
        </section>
      </div>
    </details>`);
  if (allowedRoute === ROUTES.TEACHER_DASHBOARD) { installClassroomDisplayChoices(); applyClassroomBobDisplay(); }
  if (allowedRoute === ROUTES.TEACHER_LOGIN) mountProductionGoogleSignIn();
  if (allowedRoute === ROUTES.TEACHER_DASHBOARD) pb002jClasswide.mount(root, "teacher");
  if (allowedRoute === ROUTES.STUDENT_DASHBOARD) pb002jClasswide.mount(root, "student");
  if (allowedRoute === ROUTES.STUDENT_DASHBOARD) installStudentReadAloudControls();
  if (allowedRoute === ROUTES.STUDENT_DASHBOARD) installStudentVocabularyHelp();
  manageLessonTimerPresentation(allowedRoute);
  if (allowedRoute === ROUTES.TEACHER_DASHBOARD) {
    syncStudentDisplayPresentation();
    updateNamePickerView(document);
    enterStandaloneClassroomDisplayMode();
  }
  const studentDisplayRestored = restoreLessonTimerDisplay(allowedRoute, state);
  window.requestAnimationFrame(() => {
    const scrollTarget = pendingScrollTarget ? document.querySelector(`#${pendingScrollTarget}`) : null;
    if (scrollTarget) {
      const resourcesPanel = scrollTarget.closest("[data-todays-resources-panel]");
      if (resourcesPanel) resourcesPanel.hidden = false;
      if (scrollTarget.matches("[data-optional-dashboard-section]")) scrollTarget.hidden = false;
      if (scrollTarget.matches(".platform-captains-log-planner")) scrollTarget.open = true;
      if (pendingOpenClassResourceEditor) {
        const resourceEditor = scrollTarget.querySelector(".platform-class-resource-editor");
        if (resourceEditor) resourceEditor.open = true;
        pendingOpenClassResourceEditor = false;
      }
      pendingScrollTarget = "";
      scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      scrollTarget.querySelector("h3")?.focus({ preventScroll: true });
    } else if (studentDisplayRestored) {
      document.querySelector("#platform-student-timer-display")?.focus({ preventScroll: true });
    } else {
      document.querySelector("#platform-main")?.focus({ preventScroll: true });
    }
  });
}

function installStudentReadAloudControls() {
  root.querySelectorAll(".platform-student-home section, .platform-student-home article").forEach((section) => {
    if (section.matches(".platform-school-start-launcher") || section.querySelector(":scope > .platform-student-section-listen")) return;
    const heading = section.querySelector(":scope > h2, :scope > h3, :scope > h4, :scope > div > h2, :scope > div > h3, :scope > div > h4");
    if (!heading) return;
    const readable = [...section.childNodes].some((node) => node.nodeType === Node.TEXT_NODE ? node.textContent.trim() : node.matches?.("p, div:not(:has(section, article)), ul, ol"));
    if (!readable) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "platform-student-section-listen";
    button.dataset.action = "read-student-section";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Listen to ${heading.textContent.trim()}`);
    button.textContent = "Listen";
    heading.insertAdjacentElement("afterend", button);
  });
}

function installStudentVocabularyHelp() {
  const home = root.querySelector(".platform-student-home");
  if (!home) return;
  const words = Object.keys(STUDENT_VOCABULARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  const walker = document.createTreeWalker(home, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.textContent.trim() || !parent || parent.closest("button, a, input, textarea, select, option, script, style, [data-no-vocabulary-help]")) return NodeFilter.FILTER_REJECT;
      pattern.lastIndex = 0;
      return pattern.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    pattern.lastIndex = 0;
    for (const match of node.textContent.matchAll(pattern)) {
      fragment.append(document.createTextNode(node.textContent.slice(lastIndex, match.index)));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "platform-student-vocabulary-word";
      button.dataset.action = "show-vocabulary-definition";
      button.dataset.vocabularyWord = match[0].toLowerCase();
      button.setAttribute("aria-label", `${match[0]}. Show meaning.`);
      button.textContent = match[0];
      fragment.append(button);
      lastIndex = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(node.textContent.slice(lastIndex)));
    node.replaceWith(fragment);
  });
  home.insertAdjacentHTML("beforeend", '<aside class="platform-student-vocabulary-help" data-student-vocabulary-help role="dialog" aria-labelledby="student-vocabulary-word" hidden data-no-vocabulary-help><button type="button" data-action="close-vocabulary-definition" aria-label="Close word meaning">×</button><strong id="student-vocabulary-word" data-student-vocabulary-word></strong><p data-student-vocabulary-definition></p></aside>');
}

function mountProductionGoogleSignIn() {
  if (!productionIdentityConfig.googleEnabled) return;
  const target = document.querySelector("[data-production-google-signin]");
  if (!target) return;
  const renderButton = () => {
    if (!globalThis.google?.accounts?.id || !target.isConnected) return;
    globalThis.google.accounts.id.initialize({ client_id: productionIdentityConfig.clientId, ux_mode: "redirect", login_uri: `${window.location.origin}/api/auth/v1/google` });
    globalThis.google.accounts.id.renderButton(target, { type: "standard", theme: "outline", size: "large", text: "continue_with", width: 280 });
  };
  if (globalThis.google?.accounts?.id) return renderButton();
  if (document.querySelector('script[data-production-google-identity]')) return;
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.dataset.productionGoogleIdentity = "true";
  script.addEventListener("load", renderButton, { once: true });
  document.head.append(script);
}

root.addEventListener("submit", handleSubmit);
root.addEventListener("click", handleClick);
root.addEventListener("click", (event) => {
  const action = event.target.closest?.('[data-action="open-name-picker-display"]');
  if (!action) return;
  const display = document.querySelector("#platform-student-timer-display");
  const picker = display?.querySelector('[data-smartboard-tool="names"]');
  if (!display || !picker) return;
  installSmartboardToolPopoutButtons(document);
  picker.hidden = false;
  updateNamePickerView(document);
  display.dataset.toolOnly = "names";
  display.hidden = false;
  installSmartboardPopoutFullscreenButton(picker, document);
  picker.focus?.();
});
root.addEventListener("pointerover", (event) => {
  if (!window.matchMedia("(hover: hover)").matches) return;
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (!category || category.contains(event.relatedTarget)) return;
  document.querySelectorAll(".platform-teacher-menu-category[open]").forEach((item) => { if (item !== category) item.open = false; });
  category.open = true;
});
root.addEventListener("pointerout", (event) => {
  if (!window.matchMedia("(hover: hover)").matches) return;
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (!category || category.contains(event.relatedTarget)) return;
  category.open = false;
});
root.addEventListener("focusin", (event) => {
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (category) category.open = true;
});
root.addEventListener("focusout", (event) => {
  const category = event.target instanceof Element ? event.target.closest(".platform-teacher-menu-category") : null;
  if (category && !category.contains(event.relatedTarget)) category.open = false;
});
function closeTodaysMissionClearConfirmation({ restoreFocus = true } = {}) {
  const confirmation = document.querySelector("[data-todays-mission-confirmation]");
  if (!confirmation || confirmation.hidden) return;
  confirmation.hidden = true;
  const confirmButton = confirmation.querySelector('[data-action="confirm-clear-todays-mission"]');
  if (confirmButton) confirmButton.disabled = false;
  if (restoreFocus) document.querySelector('[data-action="clear-todays-mission"]')?.focus();
}

function handleTodaysMissionEdit(event) {
  const missionForm = event.target.closest('[data-form="todays-mission"]');
  if (missionForm) {
    const title = missionForm.elements.title?.value ?? "";
    const focus = title;
    const builder = missionForm.elements.builder.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART;
    const workshop = missionForm.elements.workshop.checked ? TODAYS_MISSION_AVAILABILITY.AVAILABLE : TODAYS_MISSION_AVAILABILITY.NOT_PART;
    const saved = todaysMission.read();
    const titleCount = missionForm.querySelector("[data-todays-mission-title-count]");
    const focusCount = missionForm.querySelector("[data-todays-mission-focus-count]");
    const error = missionForm.querySelector("[data-todays-mission-error]");
    const status = missionForm.querySelector("[data-todays-mission-status]");
    if (titleCount) titleCount.textContent = String(title.length);
    if (focusCount) focusCount.textContent = String(focus.length);
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    if (status) {
      const hasUnsavedChanges = title.trim() !== saved.title || focus.trim() !== saved.focus ||
        builder !== saved.builder || workshop !== saved.workshop;
      status.dataset.state = hasUnsavedChanges ? "unsaved" : (saved.title ? "saved" : "empty");
      status.textContent = hasUnsavedChanges
        ? "Unsaved changes. Save before refreshing or opening Student Display."
        : (saved.title
            ? "Today’s Plan is saved for this class and Student Display."
            : "No plan has been prepared for this class today.");
    }
    return true;
  }
  return false;
}

let smartboardToolZIndex = 30;
const SMARTBOARD_TOOL_DEFAULT_STYLES = Object.freeze({
  timer: "left: 3%; top: 12%;",
  message: "right: 3%; top: 12%;",
  stopwatch: "left: 35%; top: 18%;",
  voice: "right: 16%; top: 18%;",
  names: "left: 24%; top: 8%; width: min(28rem, 82vw);",
  whiteboard: "left: 8%; top: 8%; width: min(46rem, 82vw); height: min(34rem, 72vh);",
});

function bringSmartboardToolForward(tool) {
  if (!tool) return;
  smartboardToolZIndex += 1;
  tool.style.zIndex = String(smartboardToolZIndex);
}

function keepSmartboardToolsOnScreen(documentRef = document) {
  const view = documentRef.defaultView || window;
  const margin = 8;
  documentRef.querySelectorAll("[data-smartboard-tool]:not([hidden])").forEach((tool) => {
    if (documentRef.fullscreenElement === tool) return;
    tool.style.maxWidth = `${Math.max(220, view.innerWidth - margin * 2)}px`;
    tool.style.maxHeight = `${Math.max(150, view.innerHeight - margin * 2)}px`;
    let rect = tool.getBoundingClientRect();
    if (rect.width > view.innerWidth - margin * 2) tool.style.width = `${view.innerWidth - margin * 2}px`;
    if (rect.height > view.innerHeight - margin * 2) tool.style.height = `${view.innerHeight - margin * 2}px`;
    rect = tool.getBoundingClientRect();
    const left = Math.max(margin, Math.min(rect.left, view.innerWidth - rect.width - margin));
    const top = Math.max(margin, Math.min(rect.top, view.innerHeight - rect.height - margin));
    if (Math.abs(left - rect.left) > 0.5 || Math.abs(top - rect.top) > 0.5) {
      tool.style.right = "auto";
      tool.style.left = `${left}px`;
      tool.style.top = `${top}px`;
    }
  });
}

function resetSmartboardToolPositions(documentRef = document) {
  documentRef.querySelectorAll("[data-smartboard-tool]").forEach((tool) => {
    const initialStyle = tool.dataset.smartboardDefaultStyle ?? SMARTBOARD_TOOL_DEFAULT_STYLES[tool.dataset.smartboardTool] ?? "";
    tool.setAttribute("style", initialStyle);
    tool.style.zIndex = "";
  });
}

function installSmartboardToolPopoutButtons(documentRef = document) {
  documentRef.querySelectorAll("[data-smartboard-tool]").forEach((tool) => {
    const header = tool.querySelector("[data-smartboard-drag-handle]");
    const close = header?.querySelector('[data-action="close-smartboard-tool"]');
    if (!header || !close || header.querySelector('[data-action="popout-smartboard-tool"], [data-action="fullscreen-smartboard-tool"]')) return;
    const button = documentRef.createElement("button");
    button.type = "button";
    button.dataset.action = "fullscreen-smartboard-tool";
    button.className = "platform-smartboard-fullscreen-button";
    button.setAttribute("aria-label", `Show ${tool.dataset.smartboardTool} tool full screen`);
    button.title = "Fill the Classroom Display with this tool";
    button.textContent = "Full Screen";
    header.insertBefore(button, close);
  });
}

function toggleSmartboardToolMaximized(tool) {
  if (!tool) return;
  const maximized = !tool.classList.contains("platform-smartboard-tool-maximized");
  if (maximized) {
    bringSmartboardToolForward(tool);
    tool.dataset.smartboardRestoreStyle = tool.style.cssText;
    tool.classList.add("platform-smartboard-tool-maximized");
    for (const [property, value] of [["inset", "0"], ["width", "100vw"], ["height", "100vh"], ["max-width", "none"], ["max-height", "none"], ["z-index", "300"]]) tool.style.setProperty(property, value, "important");
  } else {
    tool.classList.remove("platform-smartboard-tool-maximized");
    tool.style.cssText = tool.dataset.smartboardRestoreStyle || SMARTBOARD_TOOL_DEFAULT_STYLES[tool.dataset.smartboardTool] || "";
    delete tool.dataset.smartboardRestoreStyle;
  }
  const button = tool.querySelector('[data-action="fullscreen-smartboard-tool"]');
  if (button) {
    button.textContent = maximized ? "Restore" : "Full Screen";
    button.setAttribute("aria-pressed", String(maximized));
    button.title = maximized ? "Return this tool to its window" : "Fill the Classroom Display with this tool";
  }
}

async function toggleClassroomDisplayFullscreen(button) {
  const displayWindow = button?.ownerDocument?.defaultView;
  const displayDocument = button?.ownerDocument;
  if (!displayWindow || !displayDocument) return;
  const status = displayDocument.querySelector("[data-classroom-display-layout-status]");
  if (displayDocument.body.classList.contains("platform-classroom-presentation-mode") || displayDocument.fullscreenElement) return exitClassroomDisplayFullscreen(displayDocument);
  displayDocument.body.classList.add("platform-classroom-presentation-mode");
  displayDocument.body.dataset.classroomRestoreWindow = JSON.stringify({
    left: displayWindow.screenX,
    top: displayWindow.screenY,
    width: displayWindow.outerWidth,
    height: displayWindow.outerHeight,
  });
  const exitButton = displayDocument.querySelector("[data-action='exit-classroom-fullscreen']");
  if (exitButton) exitButton.hidden = false;
  const screen = displayWindow.screen;
  try {
    displayWindow.moveTo(Number(screen.availLeft || 0), Number(screen.availTop || 0));
    displayWindow.resizeTo(Number(screen.availWidth || screen.width), Number(screen.availHeight || screen.height));
  } catch {}
  try {
    await displayDocument.documentElement.requestFullscreen({ navigationUI: "hide" });
    if (status) status.textContent = "Classroom Display is full screen.";
  } catch {
    if (status) status.textContent = "The Classroom Display window was expanded to fill the smartboard.";
  }
}

async function exitClassroomDisplayFullscreen(displayDocument) {
  if (!displayDocument) return;
  if (displayDocument.fullscreenElement) {
    try { await displayDocument.exitFullscreen(); } catch {}
  }
  displayDocument.body.classList.remove("platform-classroom-presentation-mode");
  const displayWindow = displayDocument.defaultView;
  try {
    const restoreWindow = JSON.parse(displayDocument.body.dataset.classroomRestoreWindow || "null");
    if (restoreWindow && displayWindow) {
      displayWindow.moveTo(restoreWindow.left, restoreWindow.top);
      displayWindow.resizeTo(restoreWindow.width, restoreWindow.height);
    }
  } catch {}
  delete displayDocument.body.dataset.classroomRestoreWindow;
  const exitButton = displayDocument.querySelector("[data-action='exit-classroom-fullscreen']");
  if (exitButton) exitButton.hidden = true;
  const status = displayDocument.querySelector("[data-classroom-display-layout-status]");
  if (status) status.textContent = "Full-screen presentation mode closed.";
}

function smartboardToolSource(name) {
  if (classroomPresentationWindow && !classroomPresentationWindow.closed) {
    const tool = classroomPresentationWindow.document.querySelector(`[data-smartboard-tool="${name}"]`);
    if (tool) return tool;
  }
  return document.querySelector(`[data-smartboard-tool="${name}"]`);
}

function syncSmartboardToolPopout(name) {
  const popout = smartboardToolPopouts.get(name);
  const source = smartboardToolSource(name);
  if (!popout || popout.closed || !source) return;
  const target = popout.document.querySelector("[data-smartboard-tool]");
  if (!target) return;
  target.innerHTML = source.innerHTML;
  target.querySelector('[data-action="popout-smartboard-tool"]')?.remove();
  installSmartboardPopoutFullscreenButton(target, popout.document);
}

function installSmartboardPopoutFullscreenButton(tool, documentRef) {
  const header = tool?.querySelector("header");
  const close = header?.querySelector('[data-action="close-smartboard-tool"]');
  if (!header || !close || header.querySelector('[data-action="fullscreen-smartboard-tool"]')) return;
  const button = documentRef.createElement("button");
  button.type = "button";
  button.dataset.action = "fullscreen-smartboard-tool";
  button.className = "platform-smartboard-fullscreen-button";
  button.textContent = "Full Screen";
  header.insertBefore(button, close);
}

function openSmartboardToolPopout(sourceTool) {
  const name = sourceTool?.dataset.smartboardTool;
  if (!name) return null;
  const existing = smartboardToolPopouts.get(name);
  if (existing && !existing.closed) { existing.focus(); syncSmartboardToolPopout(name); return existing; }
  const title = sourceTool.querySelector("header strong")?.textContent?.trim() || "Presentation Tool";
  const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => `<link rel="stylesheet" href="${escapeHtml(link.href)}">`).join("");
  const clone = sourceTool.cloneNode(true);
  clone.hidden = false;
  clone.removeAttribute("style");
  clone.querySelector('[data-action="popout-smartboard-tool"]')?.remove();
  installSmartboardPopoutFullscreenButton(clone, clone.ownerDocument);
  const sourceWindow = sourceTool.ownerDocument?.defaultView || window;
  const popout = sourceWindow.open("", `thinkamigbob-tool-${name}`, "popup=yes,width=520,height=640,resizable=yes");
  if (!popout) return null;
  smartboardToolPopouts.set(name, popout);
  popout.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · THINKamigBOB</title>${styles}<style>html,body{margin:0;min-height:100%;background:#dce9ee}.platform-smartboard-tool{position:relative!important;inset:auto!important;display:grid!important;width:auto!important;min-height:calc(100vh - 1rem);max-height:none!important;margin:.5rem}.platform-smartboard-resize-handle,.platform-floating-tool-switcher{display:none!important}</style></head><body class="platform-app">${clone.outerHTML}</body></html>`);
  popout.document.close();
  popout.document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "close-smartboard-tool") { popout.close(); return; }
    if (action.dataset.action === "fullscreen-smartboard-tool") {
      if (popout.document.fullscreenElement) void popout.document.exitFullscreen();
      else void popout.document.documentElement.requestFullscreen();
      return;
    }
    const source = smartboardToolSource(name);
    const candidates = [...(source?.querySelectorAll(`[data-action="${action.dataset.action}"]`) || [])];
    const matching = candidates.find((candidate) => !action.dataset.studentId || candidate.dataset.studentId === action.dataset.studentId) || candidates[0];
    matching?.click();
    window.setTimeout(() => syncSmartboardToolPopout(name), 40);
    window.setTimeout(() => syncSmartboardToolPopout(name), 1150);
  });
  popout.addEventListener("beforeunload", () => smartboardToolPopouts.delete(name));
  popout.focus();
  return popout;
}

function installSmartboardToolGestures(eventTarget) {
  const documentRef = eventTarget.nodeType === 9 ? eventTarget : eventTarget.ownerDocument;
  installSmartboardToolPopoutButtons(documentRef);
  eventTarget.querySelectorAll?.("[data-smartboard-tool]").forEach((tool) => {
    if (!tool.dataset.smartboardDefaultStyle) tool.dataset.smartboardDefaultStyle = tool.getAttribute("style") || "";
  });
  eventTarget.addEventListener("pointerdown", (event) => {
    const resizeHandle = event.target.closest?.("[data-smartboard-resize-handle]");
    const dragHandle = event.target.closest?.("[data-smartboard-drag-handle]");
    const handle = resizeHandle || dragHandle;
    const tool = handle?.closest("[data-smartboard-tool]");
    if (!handle || !tool || (!resizeHandle && event.target.closest("button"))) return;
    if (tool.dataset.smartboardDefaultStyle === undefined) tool.dataset.smartboardDefaultStyle = SMARTBOARD_TOOL_DEFAULT_STYLES[tool.dataset.smartboardTool] ?? tool.getAttribute("style") ?? "";
    const view = eventTarget.defaultView || window;
    const bounds = { left: 0, top: 0, width: view.innerWidth, height: view.innerHeight };
    const rect = tool.getBoundingClientRect();
    bringSmartboardToolForward(tool);
    smartboardDrag = {
      tool,
      mode: resizeHandle ? "resize" : "move",
      pointerId: event.pointerId,
      handle,
      bounds,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  eventTarget.addEventListener("pointermove", (event) => {
    if (!smartboardDrag || smartboardDrag.pointerId !== event.pointerId) return;
    const { tool, bounds } = smartboardDrag;
    if (smartboardDrag.mode === "resize") {
      const width = Math.max(220, Math.min(bounds.width - smartboardDrag.startLeft, smartboardDrag.startWidth + event.clientX - smartboardDrag.startX));
      const height = Math.max(150, Math.min(bounds.height - smartboardDrag.startTop - 52, smartboardDrag.startHeight + event.clientY - smartboardDrag.startY));
      tool.style.width = `${width}px`;
      tool.style.height = `${height}px`;
      tool.style.maxHeight = "none";
    } else {
      const left = Math.max(0, Math.min(bounds.width - tool.offsetWidth, event.clientX - smartboardDrag.offsetX));
      const top = Math.max(0, Math.min(bounds.height - tool.offsetHeight, event.clientY - smartboardDrag.offsetY));
      tool.style.right = "auto";
      tool.style.left = `${left}px`;
      tool.style.top = `${top}px`;
    }
    event.preventDefault();
  });

  const endGesture = (event) => {
    if (smartboardDrag && event.pointerId === smartboardDrag.pointerId) smartboardDrag = null;
  };
  eventTarget.addEventListener("pointerup", endGesture);
  eventTarget.addEventListener("pointercancel", endGesture);
  const view = documentRef.defaultView || window;
  if (!documentRef.documentElement.dataset.smartboardResizeGuard) {
    documentRef.documentElement.dataset.smartboardResizeGuard = "true";
    view.addEventListener("resize", () => keepSmartboardToolsOnScreen(documentRef));
  }
}

installSmartboardToolGestures(root);

root.addEventListener("dragstart", (event) => {
  const student = event.target.closest("[data-group-student-id]");
  if (!student || !event.dataTransfer) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", student.dataset.groupStudentId);
});

root.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-group-drop-row-id]")) event.preventDefault();
});

root.addEventListener("drop", (event) => {
  const dropzone = event.target.closest("[data-group-drop-row-id]");
  const studentId = event.dataTransfer?.getData("text/plain");
  if (!dropzone || !studentId) return;
  event.preventDefault();
  const sessionState = session.read();
  const classId = currentTeacherClass(sessionState.teacherId)?.id;
  const region = dropzone.closest("[data-class-resource-teacher]");
  if (!classId || !region) return;
  const current = classResourceSharing.read(classId);
  current.audienceRows.filter((row) => ["teacher-group", "random-group"].includes(row.audienceType)).forEach((row) => {
    const audienceIds = row.audienceIds.filter((id) => id !== studentId);
    if (dropzone.dataset.groupDropRowId === row.id) audienceIds.push(studentId);
    classResourceSharing.updateAudience(classId, row.id, { audienceIds: [...new Set(audienceIds)] });
  });
  region.outerHTML = classResourceTeacherMarkup(classId);
});

root.addEventListener("change", (event) => {
  const studentNameplateControl = event.target.closest?.("[data-student-nameplate-control]");
  if (studentNameplateControl) {
    const nameplate = studentNameplateControl.closest("[data-student-nameplate]");
    const font = nameplate?.querySelector('[data-student-nameplate-control="font"]')?.value || "slab";
    const background = nameplate?.querySelector('[data-student-nameplate-control="background"]')?.value || "cream";
    const color = nameplate?.querySelector('[data-student-nameplate-control="color"]')?.value || "#173247";
    if (!nameplate || !STUDENT_NAMEPLATE_FONTS.includes(font) || !STUDENT_NAMEPLATE_BACKGROUNDS.includes(background) || !/^#[0-9a-f]{6}$/i.test(color)) return;
    STUDENT_NAMEPLATE_FONTS.forEach((value) => nameplate.classList.remove(`platform-student-nameplate-font-${value}`));
    STUDENT_NAMEPLATE_BACKGROUNDS.forEach((value) => nameplate.classList.remove(`platform-student-nameplate-bg-${value}`));
    nameplate.classList.add(`platform-student-nameplate-font-${font}`, `platform-student-nameplate-bg-${background}`);
    nameplate.style.setProperty("--student-name-color", color);
    writeStudentNameplate(nameplate.dataset.studentId, { font, background, color });
    return;
  }
  const activityTitle = event.target.closest?.("[data-activity-directions-title]");
  if (activityTitle) { const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id; if (classId) activityDirections.setTitle(classId, activityTitle.value); return; }
  const rotationWeek = event.target.closest?.("[data-current-rotation-week]");
  if (rotationWeek) {
    const classId = currentTeacherClass(session.read().teacherId)?.id;
    if (classId) {
      const week = saveCurrentRotationWeek(classId, rotationWeek.value);
      const status = rotationWeek.closest("form")?.querySelector("[data-class-timer-schedule-status]");
      if (status) status.textContent = `Current Rotation Week saved as Week ${week}. Captain’s Log and student activities now follow Week ${week}.`;
    }
    return;
  }
  if (event.target.matches?.("[data-classroom-bob-enabled], [data-classroom-bob-menu-hidden], [data-classroom-bob-placement], [data-classroom-bob-earn-minutes], [data-classroom-bob-daily-limit]")) {
    const controls = document.querySelector(".platform-classroom-bob-controls"), enabledInput = document.querySelector("[data-classroom-bob-enabled]"), menuInput = document.querySelector("[data-classroom-bob-menu-hidden]");
    const enabled = enabledInput?.checked ?? false;
    let menuHidden = controls?.dataset.menuHidden === "true";
    if (event.target.matches("[data-classroom-bob-enabled]")) menuHidden = !enabled;
    if (event.target.matches("[data-classroom-bob-menu-hidden]")) menuHidden = !menuHidden;
    if (!enabled) menuHidden = true;
    if (controls) controls.dataset.menuHidden = String(menuHidden);
    if (menuInput) menuInput.checked = false;
    const placement = document.querySelector("[data-classroom-bob-placement]")?.value || "move", earnMinutes = Math.min(30, Math.max(1, Number(document.querySelector("[data-classroom-bob-earn-minutes]")?.value) || 5)), dailyUnlockLimit = Math.min(10, Math.max(1, Number(document.querySelector("[data-classroom-bob-daily-limit]")?.value) || 6));
    window.localStorage.setItem(CLASSROOM_BOB_DISPLAY_KEY, JSON.stringify({ placement, earnMinutes, dailyUnlockLimit }));
    writeClassroomBobDailyMenu({ enabled, menuHidden });
    const menuLabel = document.querySelector("[data-classroom-bob-menu-label]");
    if (menuLabel) menuLabel.textContent = menuHidden ? "Show menu" : "Hide menu";
    floatingBobCornerIndex = 0; floatingBobGreenSince = Date.now(); updateBobRewardOutputs(); applyClassroomBobDisplay(); scheduleNextBobMove(); return;
  }
  const doNowImage = event.target.closest?.("[data-do-now-image]");
  if (doNowImage) { const file = doNowImage.files?.[0]; if (file?.type.startsWith("image/") && file.size <= 6 * 1024 * 1024) { const reader = new FileReader(); reader.addEventListener("load", () => { doNowDraft.image = String(reader.result); openDoNowEditor(doNowDraft); }, { once: true }); reader.readAsDataURL(file); } return; }
  if (event.target.closest?.("[data-do-now-editor]")) { updateDoNowDraftFromEditor(event.target.closest("[data-do-now-editor]")); return; }
  const quickScheduleSetting = event.target.closest('form[data-form="class-timer-schedule"] [name="enabled"], form[data-form="class-timer-schedule"] [name="weekdays"], form[data-form="class-timer-schedule"] [name="startTime"], form[data-form="class-timer-schedule"] [name="timeZone"], form[data-form="class-timer-schedule"] [name="pomodoroEnabled"], form[data-form="class-timer-schedule"] [name="phaseName"], form[data-form="class-timer-schedule"] [name="phaseStart"], form[data-form="class-timer-schedule"] [name="yellowSound"], form[data-form="class-timer-schedule"] [name="redSound"], form[data-form="class-timer-schedule"] [name="endSound"]');
  if (quickScheduleSetting) {
    const result = saveQuickClassTimerSchedule(quickScheduleSetting.closest("form"));
    if (result.ok && lessonTimer.read().status === LESSON_TIMER_STATES.READY) lessonTimer.setDuration(result.schedule.durationMinutes);
    syncLessonTimerPresentation();
    return;
  }
  const pixelProjectFile = event.target.closest("[data-pixel-project-file]");
  if (pixelProjectFile) { const file = pixelProjectFile.files?.[0]; pixelStudio.sourceFrames = []; if (file) void openPixelProjectFile(file); pixelProjectFile.value = ""; return; }
  const pixelGif = event.target.closest("[data-pixel-gif]");
  if (pixelGif) return;
  const pixelSize = event.target.closest("[data-pixel-size]");
  if (pixelSize) { const nextSize = Number(pixelSize.value); if (nextSize !== pixelStudio.size && window.confirm("Changing the grid size starts a new pixel drawing. Continue?")) { pixelStudio.size = nextSize; pixelStudio.pixels = freshPixelFrame(); pixelStudio.frames = [[...pixelStudio.pixels]]; pixelStudio.frameIndex = 0; renderPixelStudio(); startPixelStudioPreview(); } else pixelSize.value = String(pixelStudio.size); return; }
  const pixelBits = event.target.closest("[data-pixel-bits]");
  if (pixelBits) { pixelStudio.bits = Number(pixelBits.value); pixelStudio.frames = pixelStudio.frames.map((frame) => frame.map((color) => color.endsWith("00") ? color : nearestPixelColor(color))); pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; renderPixelStudio(); return; }
  const paletteColor = event.target.closest("[data-pixel-palette-color]");
  if (paletteColor) { const index = Number(paletteColor.dataset.pixelPaletteColor), oldColor = pixelPalette()[index], newColor = paletteColor.value; pixelStudio.palette[index] = newColor; pixelStudio.frames = pixelStudio.frames.map((frame) => frame.map((color) => color === oldColor ? newColor : color)); pixelStudio.pixels = [...pixelStudio.frames[pixelStudio.frameIndex]]; const drawingColor = document.querySelector("[data-pixel-color]"); if (drawingColor?.value.toLowerCase() === oldColor.toLowerCase()) drawingColor.value = newColor; renderPixelStudio(); setWhiteboardStatus(pixelStudio.bits === 24 ? `${oldColor} was replaced with ${newColor} throughout the animation.` : `Color code ${index.toString(2).padStart(pixelStudio.bits, "0")} was changed throughout the animation.`); return; }
  const pixelColor = event.target.closest("[data-pixel-color]");
  if (pixelColor) { const code = document.querySelector("[data-pixel-code]"), paletteIndex = pixelPalette().indexOf(nearestPixelColor(pixelColor.value)); if (code) code.textContent = pixelStudio.bits === 24 ? `Full Color RGB: ${pixelColor.value.toUpperCase()}` : `Color code: ${Math.max(0, paletteIndex).toString(2).padStart(pixelStudio.bits, "0")}`; return; }
  const whiteboardBackgroundImage = event.target.closest("[data-whiteboard-background-image]");
  if (whiteboardBackgroundImage) {
    const file = whiteboardBackgroundImage.files?.[0];
    if (!file) return;
    if (!String(file.type).startsWith("image/") || file.size > 6 * 1024 * 1024) { setWhiteboardStatus("Choose a background image no larger than 6 MB."); whiteboardBackgroundImage.value = ""; return; }
    const reader = new FileReader(); reader.addEventListener("load", () => { const image = new Image(); image.addEventListener("load", () => { whiteboardBackground = { ...whiteboardBackground, type: "image", imageSrc: String(reader.result), element: image }; const type = document.querySelector("[data-whiteboard-background-type]"); if (type) type.value = "image"; renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus("Image background applied."); }, { once: true }); image.src = String(reader.result); }, { once: true }); reader.readAsDataURL(file); whiteboardBackgroundImage.value = ""; return;
  }
  if (event.target.closest("[data-whiteboard-text-font]")) { if (whiteboardSelectedObjectId) formatSelectedWhiteboardText("font"); activateWhiteboardTextTool(`${event.target.value} selected. Click anywhere on the whiteboard to start typing.`); refreshPendingWhiteboardTextEntryStyle(); return; }
  if (event.target.closest("[data-whiteboard-text-color]")) { if (whiteboardSelectedObjectId) formatSelectedWhiteboardText("color"); activateWhiteboardTextTool("Font color selected. Click anywhere on the whiteboard to start typing."); refreshPendingWhiteboardTextEntryStyle(); return; }
  if (event.target.closest("[data-class-resource-teacher]")) window.setTimeout(refreshCurrentClassPlan, 0);
  const planResourceToggle = event.target.closest("[data-current-plan-resource-toggle]");
  if (planResourceToggle) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (!classId) return;
    classResourceSharing.stop(classId, planResourceToggle.dataset.resourceIndex, planResourceToggle.dataset.resourceRowId);
    refreshCurrentClassPlan();
    return;
  }
  const classComparison = event.target.closest("[data-class-plan-comparison]");
  if (classComparison) {
    teacherComparisonClassId = classComparison.value;
    render();
    return;
  }
  const planMode = event.target.closest("[data-resource-plan-mode]");
  if (planMode) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = planMode.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const current = classResourceSharing.read(classId);
    classResourceSharing.configureAssignment(classId, planMode.value, current.exceptionsEnabled);
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const exceptionsEnabled = event.target.closest("[data-resource-exceptions-enabled]");
  if (exceptionsEnabled) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = exceptionsEnabled.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const current = classResourceSharing.read(classId);
    classResourceSharing.configureAssignment(classId, current.assignmentMode, exceptionsEnabled.value === "yes");
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const groupName = event.target.closest("[data-resource-group-name]");
  if (groupName) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    if (!classId) return;
    classResourceSharing.updateAudience(classId, groupName.dataset.resourceRowId, { audienceLabel: groupName.value.trim() || "Unnamed group" });
    return;
  }
  const audienceType = event.target.closest("[data-resource-audience-type]");
  if (audienceType) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = audienceType.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const type = audienceType.value;
    classResourceSharing.updateAudience(classId, audienceType.dataset.resourceRowId, { audienceType: type, audienceIds: type === "whole-class" ? [] : undefined, audienceLabel: type === "whole-class" ? "Whole class" : type === "students" ? "Selected students" : type === "teacher-group" ? "Teacher group" : "Random group" });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const audienceStudent = event.target.closest("[data-resource-audience-student]");
  if (audienceStudent) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = audienceStudent.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    const resourceState = classResourceSharing.read(classId);
    const row = resourceState.audienceRows.find((item) => item.id === audienceStudent.dataset.resourceRowId);
    if (audienceStudent.checked && ["teacher-group", "random-group"].includes(row?.audienceType)) {
      resourceState.audienceRows.filter((item) => item.id !== row.id && ["teacher-group", "random-group"].includes(item.audienceType)).forEach((item) => {
        classResourceSharing.updateAudience(classId, item.id, { audienceIds: item.audienceIds.filter((id) => id !== audienceStudent.value) });
      });
    }
    const audienceIds = new Set(row?.audienceIds ?? []);
    if (audienceStudent.checked) audienceIds.add(audienceStudent.value); else audienceIds.delete(audienceStudent.value);
    classResourceSharing.updateAudience(classId, audienceStudent.dataset.resourceRowId, { audienceIds: [...audienceIds] });
    region.outerHTML = classResourceTeacherMarkup(classId);
    return;
  }
  const activeResourceToggle = event.target.closest("[data-active-resource-toggle]");
  if (activeResourceToggle && !activeResourceToggle.checked) {
    const state = session.read();
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = activeResourceToggle.closest("[data-class-resource-teacher]");
    if (!classId || !region) return;
    classResourceSharing.stop(classId, activeResourceToggle.dataset.resourceIndex, activeResourceToggle.dataset.resourceRowId);
    region.outerHTML = classResourceTeacherMarkup(classId);
    const status = document.querySelector("[data-class-resource-status]");
    if (status) status.textContent = "Resource removed from the student page.";
    return;
  }
  const webpageSelection = event.target.closest("[data-webpage-selection]");
  if (webpageSelection) {
    const picker = webpageSelection.closest("[data-resource-picker-webpage]");
    const selectedCount = picker?.querySelectorAll("[data-webpage-selection]:checked").length ?? 0;
    const status = webpageSelection.closest("[data-class-resource-teacher]")?.querySelector("[data-class-resource-status]");
    if (status) status.textContent = `${selectedCount} webpage choice${selectedCount === 1 ? "" : "s"} selected. Choose Show Selected Pages to Students when ready.`;
    return;
  }
  const webpageCategory = event.target.closest("[data-webpage-category]");
  if (webpageCategory) {
    webpageCategory.closest("[data-resource-picker-webpage]")?.querySelector("[data-webpage-search]")?.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  const controlsDock = event.target.closest("[data-whiteboard-controls-dock]");
  if (controlsDock) {
    whiteboardControlsDock = ["top", "left", "right", "bottom"].includes(controlsDock.value) ? controlsDock.value : "top";
    applyWhiteboardControlsLayout({ resizeCanvas: true }); saveWhiteboard(); setWhiteboardStatus(`Board menus moved to the ${whiteboardControlsDock}.`); return;
  }
  const pageDock = event.target.closest("[data-whiteboard-page-dock]");
  if (pageDock) {
    whiteboardPageDock = ["left", "right", "hidden"].includes(pageDock.value) ? pageDock.value : "left";
    applyWhiteboardControlsLayout({ resizeCanvas: true }); saveWhiteboard(); setWhiteboardStatus(whiteboardPageDock === "hidden" ? "Page thumbnails hidden." : `Page thumbnails moved to the ${whiteboardPageDock}.`); return;
  }
  const textBackground = event.target.closest("[data-whiteboard-text-background]");
  if (textBackground) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "text") { pushWhiteboardHistory(); selected.background = textBackground.value; renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); }
    refreshPendingWhiteboardTextEntryStyle();
    setWhiteboardStatus(`${textBackground.options[textBackground.selectedIndex].text} text background selected.`); return;
  }
  const cursiveLines = event.target.closest("[data-whiteboard-cursive-lines]");
  if (cursiveLines) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "text") { pushWhiteboardHistory(); selected.cursiveGuide = cursiveLines.value; renderWhiteboardObjects(); saveWhiteboard(); updateWhiteboardHistoryControls(); }
    refreshPendingWhiteboardTextEntryStyle();
    setWhiteboardStatus(`${cursiveLines.options[cursiveLines.selectedIndex].text} selected for School Cursive text.`); return;
  }
  const cursiveCoach = event.target.closest("[data-whiteboard-cursive-coach]");
  if (cursiveCoach) { updateWhiteboardCursiveCoach(); setWhiteboardStatus(cursiveCoach.value === "off" ? "Cursive Coach is off." : `${cursiveCoach.options[cursiveCoach.selectedIndex].text} is active.`); return; }
  const emojiChoice = event.target.closest("[data-whiteboard-emoji]");
  if (emojiChoice) {
    const tool = document.querySelector("[data-whiteboard-tool]");
    if (tool) { tool.value = "emoji-stamp"; tool.dispatchEvent(new Event("change", { bubbles: true })); }
    setWhiteboardStatus(`${emojiChoice.value} selected. Click the whiteboard to place it.`);
    return;
  }
  const whiteboardTool = event.target.closest("[data-whiteboard-tool]");
  if (whiteboardTool) {
    document.querySelectorAll("[data-whiteboard-quick-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.whiteboardQuickTool === whiteboardTool.value)));
    const emojiLabel = document.querySelector("[data-whiteboard-emoji-label]");
    if (emojiLabel) emojiLabel.hidden = false;
    const lassoActions = document.querySelector("[data-whiteboard-lasso-actions]");
    if (lassoActions) lassoActions.hidden = whiteboardTool.value !== "lasso-select";
    const help = document.querySelector("[data-whiteboard-push-help]");
    if (help) help.hidden = whiteboardTool.value !== "pull-3d";
    if (whiteboardTool.value === "pull-3d") setWhiteboardStatus("Pull a rectangle, oval, or triangle into 3D. The highlighted Push Back to 2D button restores it later.");
    return;
  }
  const dimensionCompare = event.target.closest("[data-whiteboard-dimension-compare]");
  if (dimensionCompare) {
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.type === "dimension") { pushWhiteboardHistory(); selected.compareUnit = dimensionCompare.value; renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus(`Dimension comparison changed to ${dimensionCompare.options[dimensionCompare.selectedIndex].text}.`); }
    return;
  }
  const dimensionLabel = event.target.closest("[data-whiteboard-dimension-label]");
  if (dimensionLabel) {
    const custom = document.querySelector("[data-whiteboard-dimension-custom-label]");
    if (custom) custom.hidden = dimensionLabel.value !== "custom";
    return;
  }
  const whiteboardGrid = event.target.closest("[data-whiteboard-grid]");
  if (whiteboardGrid) {
    whiteboardGridUnit = whiteboardGrid.value;
    renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus(`${whiteboardGrid.options[whiteboardGrid.selectedIndex].text} graph paper selected.`);
    return;
  }
  const whiteboardRuler = event.target.closest("[data-whiteboard-ruler]");
  if (whiteboardRuler) {
    whiteboardRulerUnit = whiteboardRuler.value;
    renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus(whiteboardRulerUnit === "none" ? "Ruler hidden." : `${whiteboardRuler.options[whiteboardRuler.selectedIndex].text} shown on the board.`);
    return;
  }
  const whiteboardRulerSides = event.target.closest("[data-whiteboard-ruler-sides]");
  if (whiteboardRulerSides) {
    whiteboardRuler.sides = whiteboardRulerSides.value === "top" ? "top" : "both";
    renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus(whiteboardRuler.sides === "both" ? "Ruler measurements shown on both sides." : "Ruler measurements shown on one side.");
    return;
  }
  const whiteboardScheduleType = event.target.closest("[data-whiteboard-schedule-type]");
  if (whiteboardScheduleType) {
    const usesDate = whiteboardScheduleType.value === "date";
    const usesWeekday = whiteboardScheduleType.value === "weekly";
    const weekdayLabel = document.querySelector("[data-whiteboard-weekday-label]");
    const dateLabel = document.querySelector("[data-whiteboard-date-label]");
    if (weekdayLabel) weekdayLabel.hidden = !usesWeekday;
    if (dateLabel) dateLabel.hidden = !usesDate;
    return;
  }
  const whiteboardImage = event.target.closest("[data-whiteboard-image]");
  if (whiteboardImage) {
    const file = whiteboardImage.files?.[0];
    if (!file) return;
    if (!String(file.type).startsWith("image/") || file.size > 3 * 1024 * 1024) {
      setWhiteboardStatus("Choose an image file no larger than 3 MB.");
      whiteboardImage.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const canvas = whiteboardCanvas();
      if (!canvas) return;
      const image = new Image();
      image.onload = () => {
        pushWhiteboardHistory();
        const scale = Math.min((canvas.width * 0.7) / image.width, (canvas.height * 0.7) / image.height, 1);
        const width = image.width * scale;
        const height = image.height * scale;
        const object = createWhiteboardObject("image", { x: (canvas.width - width) / 2, y: (canvas.height - height) / 2, width, height, src: String(reader.result), element: image });
        whiteboardObjects.push(object); whiteboardSelectedObjectId = object.id; renderWhiteboardObjects(canvas);
        saveWhiteboard(canvas);
        setWhiteboardStatus("Image added to the board. Use Undo to remove it.");
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    whiteboardImage.value = "";
    return;
  }
  const studentDisplayVoiceMeter = event.target.closest("[data-student-display-voice-meter]");
  if (studentDisplayVoiceMeter) {
    storeStudentDisplayVoiceMeterEnabled(studentDisplayVoiceMeter.checked);
    document.querySelectorAll("[data-student-voice-meter]").forEach((meter) => {
      meter.hidden = !studentDisplayVoiceMeter.checked || !voiceMeterStream;
    });
    return;
  }
  const voiceTarget = event.target.closest("[data-voice-meter-target]");
  if (voiceTarget) {
    const result = voiceMeter.setLevel(voiceTarget.value);
    const activityKey = result.level.key === "team" ? "collaborative" : (["silent", "whisper"].includes(result.level.key) ? "independent" : "teacher-led");
    const activity = VOICE_METER_ACTIVITIES.find((item) => item.key === activityKey) ?? VOICE_METER_ACTIVITIES[0];
    try { window.localStorage.setItem(VOICE_METER_ACTIVITY_KEY, activity.key); } catch {}
    segmentActiveVoiceMeter(activity);
    const status = document.querySelector("[data-voice-meter-status]");
    if (status) status.textContent = result.ok ? `Expected level: ${result.level.label}.` : "Choose a supported voice level.";
    document.querySelectorAll("[data-voice-meter-target]").forEach((select) => { select.value = result.level.key; });
    document.querySelectorAll("[data-student-voice-meter] > p").forEach((label) => { label.textContent = `${result.level.icon} ${result.level.label}`; });
    document.querySelectorAll("[data-large-voice-level-label]").forEach((label) => { label.textContent = `${result.level.icon} ${result.level.label}`; });
    document.querySelectorAll("[data-voice-meter-activity]").forEach((select) => { select.value = activity.key; });
    document.querySelectorAll("[data-voice-meter]").forEach((meter) => { meter.style.setProperty("--voice-threshold", `${activity.target}%`); });
    updateVoiceMeterPresentation(Number(document.querySelector("[data-voice-meter-output]")?.textContent ?? 0));
    return;
  }
  const voiceActivity = event.target.closest("[data-voice-meter-activity]");
  if (voiceActivity) {
    const activity = VOICE_METER_ACTIVITIES.find((item) => item.key === voiceActivity.value) ?? VOICE_METER_ACTIVITIES[0];
    try { window.localStorage.setItem(VOICE_METER_ACTIVITY_KEY, activity.key); } catch {}
    segmentActiveVoiceMeter(activity);
    const matchingLevel = { "teacher-led": "partner", independent: "whisper", collaborative: "team" }[activity.key];
    const result = voiceMeter.setLevel(matchingLevel);
    document.querySelectorAll("[data-voice-meter-target]").forEach((select) => { select.value = result.level.key; });
    document.querySelectorAll("[data-large-voice-level-label]").forEach((label) => { label.textContent = `${result.level.icon} ${result.level.label}`; });
    document.querySelectorAll("[data-voice-meter]").forEach((meter) => { meter.style.setProperty("--voice-threshold", `${activity.target}%`); });
    const status = document.querySelector("[data-voice-meter-status]");
    if (status) status.textContent = `${activity.label} selected. The louder-than-expected threshold is set automatically.`;
    return;
  }
  const voiceStarGoal = event.target.closest("[data-voice-star-goal]");
  if (voiceStarGoal) {
    const percentage = Math.max(50, Math.min(100, Math.round(Number(voiceStarGoal.value) || 80)));
    try { window.localStorage.setItem(VOICE_METER_STAR_GOAL_KEY, String(percentage)); } catch {}
    refreshCurrentClassPlan();
    return;
  }
  const voiceWeeklyStarGoal = event.target.closest("[data-voice-weekly-star-goal]");
  if (voiceWeeklyStarGoal) {
    const days = Math.max(1, Math.min(5, Math.round(Number(voiceWeeklyStarGoal.value) || 3)));
    try { window.localStorage.setItem(VOICE_METER_WEEKLY_STAR_GOAL_KEY, String(days)); } catch {}
    refreshCurrentClassPlan();
    return;
  }
  const voiceDisplayMode = event.target.closest("[data-voice-meter-display-mode]");
  if (voiceDisplayMode) {
    const mode = voiceDisplayMode.value === "prediction" ? "prediction" : "basic";
    try { window.localStorage.setItem(VOICE_METER_DISPLAY_MODE_KEY, mode); } catch {}
    document.querySelectorAll("[data-voice-display-mode]").forEach((element) => { element.dataset.voiceDisplayMode = mode; });
    document.querySelectorAll("[data-voice-meter-display-mode]").forEach((select) => { select.value = mode; });
    return;
  }
  const reflectionActivity = event.target.closest('[data-form="weekly-reflection"] [name="activityChoice"]');
  if (reflectionActivity) {
    const form = reflectionActivity.closest("form");
    const other = form?.querySelector("[data-reflection-other-activity]");
    const input = other?.querySelector("input");
    const usesOther = reflectionActivity.value === "__other__";
    if (other) other.hidden = !usesOther;
    if (input) {
      input.required = usesOther;
      if (usesOther) input.focus();
      else input.value = "";
    }
    return;
  }
  const captainWeekSetting = event.target.closest('[data-form="captains-log-week-plan"] [name^="enabled-"], [data-form="captains-log-week-plan"] [name^="assignment-"], [data-captains-log-required]');
  if (captainWeekSetting) {
    const form = captainWeekSetting.closest("form");
    const enabledRows = [...form.querySelectorAll("[data-captains-log-day]")].filter((row) => row.querySelector('[name^="enabled-"]')?.checked);
    const assigned = enabledRows.filter((row) => row.querySelector('[name^="assignment-"]')?.value !== "Daily student choice").length;
    const required = Number(form.elements.required?.value || 0);
    const summary = form.querySelector("[data-captains-log-summary]");
    if (summary) summary.innerHTML = `<strong>${required} required · ${enabledRows.length} prompts available</strong><span>${assigned} assigned to specific days · ${enabledRows.length - assigned} student choices</span>${required > enabledRows.length ? `<em>Add ${required - enabledRows.length} more prompt${required - enabledRows.length === 1 ? "" : "s"} or lower the weekly goal.</em>` : required < assigned ? `<em>Raise the weekly goal to at least ${assigned}, or change an assigned prompt to Student Choice.</em>` : ""}`;
    return;
  }
  const captainPromptChoice = event.target.closest('[data-form="captains-log-plan"] [name="promptId"]');
  if (captainPromptChoice) {
    const form = captainPromptChoice.closest("form");
    const prompt = [...CAPTAINS_LOG_PRESET_PROMPTS, ...weeklyReflections.captainLogLibrary()].find((item) => item.id === captainPromptChoice.value);
    if (prompt) {
      form.elements.prompt.value = prompt.prompt;
      if (prompt.week) form.elements.week.value = String(prompt.week);
    } else {
      form.elements.prompt.value = "";
      form.elements.prompt.focus();
    }
    return;
  }
  const captainDayPromptChoice = event.target.closest("[data-captains-log-prompt-choice]");
  if (captainDayPromptChoice) {
    const row = captainDayPromptChoice.closest("[data-captains-log-day]");
    const prompt = [...CAPTAINS_LOG_PRESET_PROMPTS, ...weeklyReflections.captainLogLibrary()].find((item) => item.id === captainDayPromptChoice.value);
    const input = row?.querySelector(`[name="prompt-${row.dataset.captainsLogDay}"]`);
    const customRow = row?.querySelector("[data-captains-log-custom-row]");
    if (input) input.value = prompt?.prompt ?? "";
    if (customRow) customRow.hidden = captainDayPromptChoice.value !== "custom";
    if (captainDayPromptChoice.value === "custom") input?.focus();
    return;
  }
  const captainEditorWeek = event.target.matches?.("select[data-captains-log-editor-week]") ? event.target : null;
  if (captainEditorWeek) {
    const state = session.read(), classId = currentTeacherClass(state.teacherId)?.id;
    setCaptainLogEditorWeek(classId, Number(captainEditorWeek.value));
    render();
    return;
  }
  const resourceType = event.target.closest("[data-class-resource-type]");
  if (resourceType) {
    const form = resourceType.closest('[data-form="class-resource"]');
    const defaults = resourceType.value === "Builder"
      ? { title: "STEM Builder", url: "../index.html" }
      : resourceType.value === "Workshop"
        ? { title: "STEM Workshop", url: "http://192.168.1.252:8000" }
        : null;
    if (defaults && form) {
      form.elements.title.value = defaults.title;
      form.elements.url.value = defaults.url;
    }
    const picker = form?.querySelector("[data-resource-picker]");
    const missionPicker = picker?.querySelector("[data-resource-picker-mission]");
    const sidePathPicker = picker?.querySelector("[data-resource-picker-side-path]");
    const webpagePicker = picker?.querySelector("[data-resource-picker-webpage]");
    if (picker) {
      picker.hidden = !["Mission Activity", "Side Path", "Webpage"].includes(resourceType.value);
      picker.dataset.pickerMode = resourceType.value === "Side Path" ? "side-path" : resourceType.value === "Webpage" ? "webpage" : "mission";
    }
    if (missionPicker) missionPicker.hidden = resourceType.value !== "Mission Activity";
    if (sidePathPicker) sidePathPicker.hidden = resourceType.value !== "Side Path";
    if (webpagePicker) webpagePicker.hidden = resourceType.value !== "Webpage";
    return;
  }
  const currentClass = event.target.closest("[data-current-teacher-class]");
  if (currentClass) {
    const previousId = classSetupProfiles.read().currentClassId;
    preserveCurrentClassSetup(previousId);
    classSetupProfiles.select(currentClass.value);
    activateClassSetup(currentClass.value);
    render();
    return;
  }
  const allClasses = event.target.closest("[data-class-setup-all]");
  if (allClasses) {
    allClasses.closest(".platform-class-setup-sharing")?.querySelectorAll("[data-class-setup-target]").forEach((input) => { input.checked = allClasses.checked; });
    return;
  }
  if (event.target.closest("[data-memo-format]")) {
    memoTypingFormat = {
      color: document.querySelector('[data-memo-format="color"]')?.value ?? "white",
      size: document.querySelector('[data-memo-format="size"]')?.value ?? "extra-large",
      style: document.querySelector('[data-memo-format="style"]')?.value ?? "bold",
    };
    const status = document.querySelector("[data-teacher-memo-status]");
    if (status) status.textContent = `New typing will use ${memoTypingFormat.color.replaceAll("-", " ")}, ${memoTypingFormat.size.replaceAll("-", " ")}, ${memoTypingFormat.style.replaceAll("-", " ")}. Highlight existing text and choose Apply to change it.`;
    return;
  }
  const memoImage = event.target.closest("[data-memo-image-file]")?.files?.[0];
  if (memoImage) {
    const status = document.querySelector("[data-teacher-memo-status]");
    if (!String(memoImage.type).startsWith("image/") || memoImage.size > 500 * 1024) {
      if (status) status.textContent = "Choose an image no larger than 500 KB.";
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const hidden = document.querySelector('[name="memoImage"]');
      if (hidden) hidden.value = String(reader.result ?? "");
      if (status) status.textContent = "Image ready. Save the memo to keep it.";
    }, { once: true });
    reader.readAsDataURL(memoImage);
    return;
  }
  const liveEvidenceFilter = event.target.closest("[data-live-evidence-filter]");
  if (liveEvidenceFilter) {
    teacherLiveEvidenceFilters = { ...teacherLiveEvidenceFilters, [liveEvidenceFilter.dataset.liveEvidenceFilter]: liveEvidenceFilter.value };
    const visible = teacherLiveEvidence.filter((item) => Object.entries(teacherLiveEvidenceFilters).every(([field, value]) => value === "All" || item[field] === value));
    teacherLiveEvidenceSelection = visible[0]?.id || "";
    if (teacherLiveEvidencePreviewUrl) URL.revokeObjectURL(teacherLiveEvidencePreviewUrl);
    teacherLiveEvidencePreviewUrl = "";
    renderTeacherLiveEvidence();
    return;
  }
  const teacherFilter = event.target.closest("[data-teacher-evidence-filter]");
  if (teacherFilter) {
    teacherEvidenceFilter = teacherFilter.value;
    const visible = teacherEvidenceFilter === "All" ? PILOT_TEACHER_EVIDENCE : PILOT_TEACHER_EVIDENCE.filter((item) => item.type === teacherEvidenceFilter);
    teacherEvidenceSelection = visible[0]?.id ?? "";
    renderTeacherEvidenceReview();
    return;
  }
  const file = event.target.closest("[data-evidence-file]")?.files?.[0];
  if (file && evidenceDraft) {
    if (evidenceDraft.previewUrl) URL.revokeObjectURL(evidenceDraft.previewUrl);
    evidenceDraft.fileName = file.name;
    evidenceDraft.file = file;
    evidenceDraft.detail = `${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB`;
    evidenceDraft.previewUrl = URL.createObjectURL(file);
    evidenceDraft.hasSelection = true;
    renderEvidenceFoundation();
    return;
  }
  handleTodaysMissionEdit(event);
});

root.addEventListener("beforeinput", (event) => {
  const editor = event.target.closest("[data-teacher-memo-editor]");
  if (!editor || !memoTypingFormat || event.inputType !== "insertText" || !event.data) return;
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return;
  event.preventDefault();
  if (editor.innerText.length >= TEACHER_MEMO_MAX_CHARACTERS && range.collapsed) return;
  range.deleteContents();
  const span = document.createElement("span");
  span.dataset.memoColor = memoTypingFormat.color;
  span.dataset.memoSize = memoTypingFormat.size;
  span.dataset.memoStyle = memoTypingFormat.style;
  memoFormatRevision += 1;
  span.dataset.memoPriority = String(memoFormatRevision);
  span.textContent = event.data;
  range.insertNode(span);
  range.setStartAfter(span);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  const hidden = document.querySelector("[data-teacher-memo]");
  if (hidden) hidden.value = editor.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS);
  const count = document.querySelector("[data-teacher-memo-count]");
  if (count) count.textContent = String(hidden?.value.length ?? 0);
  const status = document.querySelector("[data-teacher-memo-status]");
  if (status) {
    status.dataset.state = "unsaved";
    status.textContent = "Unsaved changes. Save before refreshing or opening Student Display.";
  }
});

root.addEventListener("input", (event) => {
  if (event.target.closest?.("[data-do-now-editor]")) { const editor = event.target.closest("[data-do-now-editor]"); const range = event.target.matches('input[type="range"]') ? event.target : null; if (range) range.nextElementSibling && (range.nextElementSibling.textContent = `${range.value} px`); updateDoNowDraftFromEditor(editor); return; }
  const pixelSpeed = event.target.closest("[data-pixel-speed]");
  if (pixelSpeed) { const output = document.querySelector("[data-pixel-speed-output]"); if (output) output.textContent = `${(Number(pixelSpeed.value) / 1000).toFixed(1)} sec`; startPixelStudioPreview(); return; }
  const pixelColor = event.target.closest("[data-pixel-color]");
  if (pixelColor) { pixelColor.dispatchEvent(new Event("change", { bubbles: true })); return; }
  const voiceSensitivity = event.target.closest("[data-voice-sensitivity]");
  if (voiceSensitivity) {
    const sensitivity = voiceMeter.setSensitivity(voiceSensitivity.value);
    document.querySelectorAll("[data-voice-sensitivity]").forEach((input) => { input.value = String(sensitivity); });
    document.querySelectorAll("[data-voice-sensitivity-value]").forEach((output) => { output.textContent = `${sensitivity}%`; });
    const status = document.querySelector("[data-voice-meter-status]");
    if (status) status.textContent = sensitivity === 100 ? "Sensitivity is set to normal." : sensitivity < 100 ? "Sensitivity reduced for a louder room or microphone." : "Sensitivity increased for a quieter room or microphone.";
    return;
  }
  const quickGoal = event.target.closest('[name="todayGoal"]');
  if (quickGoal) {
    const goals = quickGoal.closest("[data-quick-goals]");
    if (goals) goals.dataset.goalsMode = "custom";
    return;
  }
  const webpageSearch = event.target.closest("[data-webpage-search]");
  if (webpageSearch) {
    const picker = webpageSearch.closest("[data-resource-picker-webpage]");
    const category = picker?.querySelector("[data-webpage-category]")?.value ?? "all";
    const query = webpageSearch.value.trim().toLowerCase();
    let visible = 0;
    picker?.querySelectorAll("[data-webpage-catalog-item]").forEach((item) => {
      const matches = (!query || item.dataset.webpageSearchValue.includes(query)) && (category === "all" || item.dataset.webpageCategoryValue === category);
      item.hidden = !matches;
      if (matches) visible += 1;
    });
    const empty = picker?.querySelector("[data-webpage-empty]");
    if (empty) empty.hidden = visible > 0;
    return;
  }
  const whiteboardTitle = event.target.closest("[data-whiteboard-title]");
  if (whiteboardTitle) {
    whiteboardDrawingTitle = whiteboardTitle.value.trim() || "Workshop Drawing";
    renderWhiteboardObjects();
    return;
  }
  const whiteboardZoomControl = event.target.closest("[data-whiteboard-zoom]");
  if (whiteboardZoomControl) {
    whiteboardZoom = Math.min(300, Math.max(50, Number(whiteboardZoomControl.value) || 100));
    applyWhiteboardZoom(); saveWhiteboard(); setWhiteboardStatus(`Zoom set to ${whiteboardZoom}%.`);
    return;
  }
  const whiteboardSize = event.target.closest("[data-whiteboard-size]");
  if (whiteboardSize) {
    const output = document.querySelector("[data-whiteboard-size-output]");
    if (output) output.textContent = whiteboardSize.value;
    return;
  }
  const whiteboardColor = event.target.closest("[data-whiteboard-color]");
  if (whiteboardColor) {
    const chip = document.querySelector("[data-whiteboard-color-chip]");
    const paintCan = document.querySelector("[data-whiteboard-paint-can-icon]");
    if (chip) chip.style.setProperty("--whiteboard-selected-color", whiteboardColor.value);
    if (paintCan) paintCan.style.setProperty("--whiteboard-selected-color", whiteboardColor.value);
    return;
  }
  const whiteboardLineSize = event.target.closest("[data-whiteboard-line-size]");
  if (whiteboardLineSize) {
    const size = document.querySelector("[data-whiteboard-size]");
    const output = document.querySelector("[data-whiteboard-line-size-output]");
    if (size) { size.value = whiteboardLineSize.value; size.dispatchEvent(new Event("input", { bubbles: true })); }
    if (output) output.textContent = whiteboardLineSize.value;
    return;
  }
  const whiteboardEraserSize = event.target.closest("[data-whiteboard-eraser-size]");
  if (whiteboardEraserSize) {
    const output = document.querySelector("[data-whiteboard-eraser-size-output]");
    if (output) output.textContent = whiteboardEraserSize.value;
    return;
  }
  const whiteboard3DDepth = event.target.closest("[data-whiteboard-3d-depth]");
  if (whiteboard3DDepth) {
    const depth = Number(whiteboard3DDepth.value);
    const output = document.querySelector("[data-whiteboard-3d-depth-output]");
    if (output) output.textContent = String(depth);
    const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
    if (selected?.original2DType) { selected.depth = depth; renderWhiteboardObjects(); saveWhiteboard(); setWhiteboardStatus(`3D thickness set to ${depth}.`); }
    return;
  }
  const scheduleDuration = event.target.closest('form[data-form="class-timer-schedule"] [name="durationMinutes"]');
  if (scheduleDuration) {
    const form = scheduleDuration.closest("form");
    const duration = Number(scheduleDuration.value);
    recommendedTimerPhases(duration).forEach((phase) => {
      const input = form?.querySelector(`[data-phase-start="${phase.key}"]`);
      if (input) { input.value = String(phase.startMinute); input.max = String(Math.max(0, duration - 1)); }
    });
    if (Number.isInteger(duration) && duration >= MIN_LESSON_MINUTES && duration <= MAX_LESSON_MINUTES) {
      const currentSchedule = classTimerSchedule.read();
      const saved = classTimerSchedule.save({ ...currentSchedule, durationMinutes: duration, phases: recommendedTimerPhases(duration) });
      if (saved.ok) {
        preserveCurrentClassSetup(currentTeacherClass(session.read().teacherId)?.id);
        const status = form?.querySelector("[data-class-timer-schedule-status]");
        if (status) status.textContent = `Class duration saved automatically at ${duration} minutes.`;
      }
    }
    if (Number.isInteger(duration) && duration >= MIN_LESSON_MINUTES && duration <= MAX_LESSON_MINUTES && lessonTimer.read().status === LESSON_TIMER_STATES.READY) {
      lessonTimer.setDuration(duration);
      syncLessonTimerPresentation();
    }
    return;
  }
  const reflection = event.target.closest("[data-evidence-reflection]");
  if (reflection && evidenceDraft) {
    evidenceDraft.detail = reflection.value;
    const preview = document.querySelector("[data-evidence-preview]");
    if (preview) preview.innerHTML = `<p>${escapeHtml(reflection.value || "Your preview will appear here before anything is saved.")}</p>`;
    return;
  }
  if (handleTodaysMissionEdit(event)) return;
  const editor = event.target.closest("[data-teacher-memo-editor]");
  const field = editor ? document.querySelector("[data-teacher-memo]") : event.target.closest("[data-teacher-memo]");
  if (!field) return;
  if (editor) field.value = editor.innerText.slice(0, TEACHER_MEMO_MAX_CHARACTERS);
  const count = document.querySelector("[data-teacher-memo-count]");
  const error = document.querySelector("[data-teacher-memo-error]");
  const status = document.querySelector("[data-teacher-memo-status]");
  if (count) count.textContent = String(field.value.length);
  if (error) {
    error.textContent = "";
    error.hidden = true;
  }
  if (status) {
    const savedText = teacherMemo.read().text;
    const hasUnsavedChanges = field.value.trim() !== savedText;
    status.dataset.state = hasUnsavedChanges ? "unsaved" : (savedText ? "saved" : "empty");
    status.textContent = hasUnsavedChanges
      ? "Unsaved changes. Save before refreshing or opening Student Display."
      : (savedText ? "Saved for refresh and Student Display." : "No memo saved yet.");
  }
});
window.addEventListener("hashchange", () => {
  stopVoiceMeter();
  render();
});
window.addEventListener("storage", (event) => {
  if (![CLASS_RESOURCE_STORAGE_KEY, ACTIVITY_DIRECTIONS_STORAGE_KEY, WEEKLY_REFLECTION_STORAGE_KEY].includes(event.key)) return;
  const state = session.read();
  if (currentRoute() === ROUTES.STUDENT_DASHBOARD && state.role === PLATFORM_ROLES.STUDENT) render();
  if (currentRoute() === ROUTES.TEACHER_DASHBOARD && state.role === PLATFORM_ROLES.TEACHER) {
    const classId = currentTeacherClass(state.teacherId)?.id;
    const region = document.querySelector("[data-class-resource-teacher]");
    if (classId && region) region.outerHTML = classResourceTeacherMarkup(classId);
    const directionsRegion = document.querySelector("[data-activity-directions-teacher]");
    if (classId && directionsRegion) directionsRegion.outerHTML = activityDirectionsTeacherMarkup(classId);
  }
});
window.addEventListener("resize", () => window.requestAnimationFrame(fitStudentMemoPresentation));
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  const editor = document.querySelector("[data-teacher-memo-editor]");
  if (!editor || !selection?.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  if (editor.contains(range.commonAncestorContainer)) memoSelectionRange = range.cloneRange();
});
document.addEventListener("keydown", (event) => {
  const openWhiteboard = document.querySelector("#platform-classroom-whiteboard:not([hidden])");
  const typingTarget = event.target instanceof Element && event.target.closest("textarea, [contenteditable='true'], input:not([type='button']):not([type='range']):not([type='color'])");
  const shortcutKey = (event.ctrlKey || event.metaKey) && !event.altKey ? event.key.toLowerCase() : "";
  if (openWhiteboard && !typingTarget && ["b", "i", "u"].includes(shortcutKey)) {
    event.preventDefault(); formatSelectedWhiteboardText({ b: "bold", i: "italic", u: "underline" }[shortcutKey]); return;
  }
  if (openWhiteboard && !typingTarget && ["c", "x", "d"].includes(shortcutKey)) {
    event.preventDefault();
    if (shortcutKey === "c") {
      const selected = whiteboardObjects.find((object) => object.id === whiteboardSelectedObjectId);
      if (!selected) { setWhiteboardStatus("Select a whiteboard object before copying it."); return; }
      whiteboardClipboard = structuredClone(serializableWhiteboardObjects().find((object) => object.id === selected.id));
      if (selected.type === "image") void copySelectedWhiteboardObjectAsImage(); else setWhiteboardStatus("Selected object copied. Press Ctrl+V or Command+V to paste it."); return;
    }
    if (shortcutKey === "x") { cutSelectedWhiteboardObject(); return; }
    if (shortcutKey === "d") { duplicateSelectedWhiteboardObject(); return; }
  }
  if (openWhiteboard && !typingTarget && (event.key === "Backspace" || event.key === "Delete")) {
    if (!whiteboardSelectedObjectId) return;
    event.preventDefault(); deleteSelectedWhiteboardObject(); return;
  }
  if (event.key !== "Escape") return;
  const whiteboard = document.querySelector("#platform-classroom-whiteboard:not([hidden])");
  if (whiteboard) {
    event.preventDefault();
    const keyboardHelp = whiteboard.querySelector("[data-whiteboard-keyboard-help]:not([hidden])");
    const contextMenu = whiteboard.querySelector("[data-whiteboard-context-menu]:not([hidden])");
    const confirmation = whiteboard.querySelector("[data-whiteboard-clear-confirmation]:not([hidden])");
    const lassoConfirmation = whiteboard.querySelector("[data-whiteboard-lasso-confirmation]:not([hidden])");
    const pixelDialog = whiteboard.querySelector("[data-pixel-studio]:not([hidden])");
    const dimensionQuestion = whiteboard.querySelector("[data-whiteboard-dimension-question]:not([hidden])");
    if (pixelDialog) { pixelDialog.hidden = true; window.clearInterval(pixelStudioPreviewTimer); setWhiteboardStatus("Pixel Studio closed. Your frames are kept while this whiteboard is open."); }
    else if (keyboardHelp) keyboardHelp.hidden = true;
    else if (contextMenu) contextMenu.hidden = true;
    else if (lassoConfirmation) { clearWhiteboardLassoChoice(); setWhiteboardStatus("Cutout canceled. The board was not changed."); }
    else if (dimensionQuestion) { dimensionQuestion.hidden = true; whiteboardPendingDimension = null; renderWhiteboardObjects(); setWhiteboardStatus("CAD measurement canceled."); }
    else if (confirmation) confirmation.hidden = true;
    else if (whiteboard.dataset.presentation === "true") {
      whiteboard.dataset.presentation = "false";
      const exit = whiteboard.querySelector('[data-action="whiteboard-exit-presentation"]');
      if (exit) exit.hidden = true;
      whiteboard.focus();
    }
    else {
      whiteboard.hidden = true;
      whiteboardDisplayTrigger?.focus();
      whiteboardDisplayTrigger = null;
    }
    return;
  }
  const voiceDisplay = document.querySelector("#platform-large-voice-meter-display:not([hidden])");
  if (voiceDisplay) {
    event.preventDefault();
    voiceDisplay.hidden = true;
    voiceMeterDisplayTrigger?.focus();
    voiceMeterDisplayTrigger = null;
    return;
  }
  const missionConfirmation = document.querySelector("[data-todays-mission-confirmation]:not([hidden])");
  if (missionConfirmation) {
    event.preventDefault();
    closeTodaysMissionClearConfirmation();
    return;
  }
  const display = document.querySelector("#platform-student-timer-display:not([hidden])");
  if (!display) return;
  storeLessonTimerDisplayOpen(false);
  display.hidden = true;
  const focusTarget = lessonTimerDisplayTrigger?.isConnected
    ? lessonTimerDisplayTrigger
    : document.querySelector('[data-action="open-timer-display"]');
  lessonTimerDisplayTrigger = null;
  focusTarget?.focus();
});
document.addEventListener("paste", (event) => {
  const doNowEditor = document.querySelector("[data-do-now-editor]");
  if (doNowEditor && !(event.target instanceof Element && event.target.closest("textarea, input, [contenteditable='true']"))) {
    const imageItem = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith("image/"));
    const imageFile = imageItem?.getAsFile();
    if (imageFile) { event.preventDefault(); const reader = new FileReader(); reader.addEventListener("load", () => { doNowDraft.image = String(reader.result); openDoNowEditor(doNowDraft); }, { once: true }); reader.readAsDataURL(imageFile); return; }
  }
  const openWhiteboard = document.querySelector("#platform-classroom-whiteboard:not([hidden])");
  const openPixelStudio = document.querySelector("[data-pixel-studio]:not([hidden])");
  if (openPixelStudio) {
    const gifItem = [...(event.clipboardData?.items || [])].find((item) => item.type === "image/gif");
    const gifFile = gifItem?.getAsFile();
    if (gifFile) { event.preventDefault(); void importPixelGif(gifFile); return; }
    const htmlUrl = gifUrlFromClipboardText(event.clipboardData?.getData("text/html"), true), textUrl = gifUrlFromClipboardText(event.clipboardData?.getData("text/plain"));
    if (htmlUrl || textUrl) { event.preventDefault(); void importPixelGifUrl(htmlUrl || textUrl); return; }
    const stillImage = [...(event.clipboardData?.items || [])].some((item) => item.type.startsWith("image/"));
    if (stillImage) { event.preventDefault(); setWhiteboardStatus("The website copied only one still frame. Copy the GIF image address, or download and upload the GIF."); return; }
  }
  const typingTarget = event.target instanceof Element && event.target.closest("textarea, [contenteditable='true'], input");
  if (!openWhiteboard || typingTarget) return;
  const imageItem = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith("image/"));
  const blob = imageItem?.getAsFile();
  if (blob) { event.preventDefault(); addClipboardImageToWhiteboard(blob); return; }
  if (whiteboardClipboard) { event.preventDefault(); pasteWhiteboardClipboard(); }
});
async function startPlatform() {
  if (productionIdentityConfig.enabled) {
    const result = await productionIdentity.session();
    if (result.ok && result.value.teacher?.id) {
      session.signInTeacher(result.value.teacher.id);
      const classrooms = await productionIdentity.listClassrooms();
      if (classrooms.ok) setProductionTeacherClasses(classrooms.value.classrooms);
    }
    else if (result.ok && result.value.student?.id && result.value.student?.classId) session.signInStudent(result.value.student.classId, result.value.student.id);
    else if (result.ok) session.signOut();
    if (result.ok && (result.value.teacher?.id || result.value.student?.id)) await loadLessonStepsFromService(session.read());
  }
  render();
  enterStandaloneClassroomDisplayMode();
  if (floatingBobRoamingInterval === null) scheduleNextBobMove();
}

void startPlatform();
function captainLogEditorWeek(classId) {
  try { return Math.max(1, Math.min(7, Number(JSON.parse(window.localStorage.getItem(CAPTAINS_LOG_EDITOR_WEEK_KEY) || "{}")[classId] ?? weeklyReflections.activeCaptainLogWeek(classId)))); }
  catch { return weeklyReflections.activeCaptainLogWeek(classId); }
}

function setCaptainLogEditorWeek(classId, week) {
  try { const all = JSON.parse(window.localStorage.getItem(CAPTAINS_LOG_EDITOR_WEEK_KEY) || "{}"); all[classId] = Number(week); window.localStorage.setItem(CAPTAINS_LOG_EDITOR_WEEK_KEY, JSON.stringify(all)); }
  catch {}
}
