import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../../platform/scripts/platform-app.mjs", import.meta.url), "utf8");
const css = readFileSync(new URL("../../platform/styles/platform.css", import.meta.url), "utf8");

test("original palette uses varied light and deep backgrounds", () => {
  assert.doesNotMatch(css, /platform-sunset/);
  for (const token of ["platform-blueprint", "platform-mint", "platform-purple", "platform-violet-soft", "platform-cream", "platform-charcoal"]) assert.match(css, new RegExp(`--${token}:`));
  assert.match(css, /\.platform-class-resource-sharing \{[^}]*var\(--platform-green\)[^}]*background: #f4faf7/);
  assert.match(css, /\.platform-resource-assignment-chooser \{[^}]*var\(--platform-blue\)[^}]*background: #e5f3f7/);
});

test("teacher actions use a calm semantic button hierarchy", () => {
  assert.match(css, /Calm action hierarchy/);
  assert.match(css, /data-action\^="save-"/);
  assert.match(css, /data-action\^="open-"/);
  assert.match(css, /data-action="open-classroom-presentation-window"/);
  assert.match(css, /data-action\^="remove-"/);
  assert.match(css, /button\[aria-pressed="true"\]/);
  assert.match(css, /button:disabled/);
});

test("teacher workspace uses layered surfaces to emphasize functions", () => {
  assert.match(css, /Polished teacher workspace/);
  assert.match(css, /\.platform-teacher-overview \{[\s\S]*?linear-gradient[\s\S]*?box-shadow/);
  assert.match(css, /\.platform-command-card, \.platform-rhythm-card \{[\s\S]*?linear-gradient[\s\S]*?box-shadow/);
  assert.match(css, /\.platform-quick-time-tools section:nth-child\(2\)/);
  assert.match(css, /\.platform-resource-slot-button \{[\s\S]*?linear-gradient/);
  assert.match(css, /button:not\(:disabled\):active/);
});

test("teacher and student workspaces use consistent visual zones for quick scanning", () => {
  for (const zone of ["platform-zone-today", "platform-zone-present", "platform-zone-create", "platform-zone-review", "platform-zone-settings"]) assert.match(css + app, new RegExp(zone));
  for (const label of ["What I’m Doing Now", "My Tools", "My Work", "Review"]) assert.match(app, new RegExp(label));
  for (const zone of ["platform-student-zone-now", "platform-student-zone-tools", "platform-student-zone-work", "platform-student-zone-review", "platform-student-zone-history"]) assert.match(app, new RegExp(zone));
  assert.match(css, /\.platform-student-area-map \{[^}]*grid-template-columns: repeat\(4/);
  assert.match(css, /#teacher-live-lesson-dashboard \.platform-current-class-plan/);
});

test("form placeholders are visibly stronger without matching entered text", () => {
  assert.match(css, /input::placeholder, \.platform-main textarea::placeholder \{[^}]*font-weight: 700[^}]*opacity: 1/);
});

test("text entry and selection fields use a calm cream surface", () => {
  assert.match(css, /--platform-input-cream: #fffaf0/);
  assert.match(css, /\.platform-main textarea \{[^}]*background-color: var\(--platform-input-cream\)/);
});

test("dropdown fields are visibly color coded", () => {
  assert.match(css, /\.platform-main select \{[^}]*border-color: #b88412[^}]*background-color: #fff3d6/);
  assert.match(css, /\.platform-main select:hover \{[^}]*background-color: #ffebbd/);
});

test("a separate classroom demo preview supplies realistic fictional usage data", () => {
  assert.match(app, /PREVIEW_CLASSROOM_DEMO: "\/preview\/classroom-demo"/);
  assert.match(app, /function seedClassroomDemo\(\)/);
  for (const content of ["Build and Test a Weight-Bearing Bridge", "Bridge Strength Challenge", "Digital Bridge Builder", "Bridge Test Review", "Fictional classroom-use data is active"]) assert.match(app, new RegExp(content));
  assert.match(app, /lessonTimer\.startScheduled\(52, 31 \* 60 \+ 24\)/);
  assert.match(app, /classroomDemoModeIsEnabled\(\)/);
  assert.match(css, /\.platform-classroom-demo-banner/);
});

test("teacher dashboard separates daily work and evidence while class management owns setup", () => {
  for (const id of ["teacher-today-tools", "teacher-classroom-tools", "teacher-evidence-tools", "teacher-setup-tools"]) assert.match(app, new RegExp(`id="${id}"`));
  for (const heading of ["Presentation Tools", "Launch and review evidence", "Connections and safeguards"]) assert.match(app, new RegExp(heading));
  assert.doesNotMatch(app, /Activities and access|Class-wide activity availability/);
  assert.match(app, /id="teacher-evidence-tools"[^>]*data-optional-dashboard-section hidden/);
  const today = app.slice(app.indexOf("function teacherDashboardView(state)"), app.indexOf("function teacherClassesView(state)"));
  const classes = app.slice(app.indexOf("function teacherClassesView(state)"), app.indexOf("function studentDashboardView(state)"));
  assert.doesNotMatch(today, /teacher-setup-tools|teacherSetupMarkup\(\)/);
  assert.match(classes, /teacher-setup-tools/);
  assert.match(classes, /teacherSetupMarkup\(\)/);
});

test("teacher dashboard provides a responsive categorized teacher menu and status", () => {
  assert.match(app, /class="platform-teacher-menu"/);
  for (const label of ["Today", "Classes", "Evidence", "Account", "Manage Classes"]) assert.match(app, new RegExp(`>${label}<`));
  for (const removed of ["Run Class", "Classroom", "Setup"]) assert.doesNotMatch(app, new RegExp(`>${removed}<`));
  assert.match(app, /platform-command-layout-no-sidebar/);
  assert.match(app, /class="platform-teacher-overview-status"/);
  assert.match(css, /\.platform-workspace-heading \{[^}]*grid-column:\s*1 \/ -1/);
  assert.match(css, /\.platform-evidence-launch-card \{ grid-column: 1 \/ -1; \}/);
  assert.match(css, /@media \(max-width: 800px\)[\s\S]*\.platform-teacher-overview \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.platform-teacher-overview-status \{ width: 100%; \}/);
  for (const label of ["Lesson readiness", "Plan ready", "Message ready", "Timer ready", "Start Classroom Display"]) assert.match(app, new RegExp(label));
  assert.match(css, /\.platform-teacher-menu \{[^}]*display: flex/);
  assert.match(css, /\.platform-teacher-menu-category:hover > \.platform-teacher-menu-panel/);
  assert.match(css, /\.platform-teacher-menu-category\.is-active > summary/);
  assert.match(app, /root\.addEventListener\("pointerover"[\s\S]*category\.open = true/);
  assert.match(app, /root\.addEventListener\("pointerout"[\s\S]*category\.open = false/);
});

test("Presentation Tools provide instant, stopwatch, and countdown timing", () => {
  for (const label of ["Today’s Class Timer", "Start a Different Timer", "Instant Timer", "Stopwatch", "Custom Countdown", "Display and Settings"]) assert.match(app, new RegExp(label));
  assert.match(app, /data-action="instant-timer"/);
  assert.match(app, /data-action="stopwatch-start"/);
  assert.match(app, /data-action="stopwatch-pause"/);
  assert.match(app, /data-action="stopwatch-reset"/);
  for (const label of ["Quick Message Board", "Full-screen Presentation", "Voice Meter Only — Full Screen"]) assert.match(app, new RegExp(label));
  assert.match(app, /Open Separate Classroom Screen/);
  assert.match(app, /data-action="open-classroom-presentation-window"/);
  assert.match(app, /function openClassroomPresentationWindow\(\)/);
  assert.match(app, /data-smartboard-tool="timer"/);
  assert.match(app, /data-smartboard-tool="message"/);
  assert.match(app, /data-smartboard-tool="voice"/);
  assert.match(app, /data-smartboard-tool="stopwatch"/);
  assert.match(app, /data-smartboard-tool="whiteboard"/);
  assert.match(app, /data-smartboard-tool="names"/);
  assert.match(app, /data-action="open-name-picker-display"/);
  assert.match(app, /data-action="name-picker-spin"/);
  assert.match(app, /data-action="name-picker-toggle-student"/);
  assert.match(app, /data-action="name-picker-readd-all"/);
  assert.match(app, /Remove the selected student after each spin/);
  assert.match(css, /\.platform-name-picker-wheel \{[^}]*repeating-conic-gradient/);
  assert.match(app, /function smartboardToolSwitcherMarkup\(\)/);
  assert.match(app, /Open Full Whiteboard and Tools/);
  assert.match(app, /Solid Color/);
  assert.match(app, /Pomodoro Wheel/);
  for (const action of ["timer-subtract-minute", "timer-add-minute", "timer-pause", "timer-end", "timer-start-or-resume", "timer-reset"]) assert.match(app, new RegExp(`data-action="${action}"`));
  assert.match(app, /data-timer-view-mode="regular"/);
  assert.match(app, /data-timer-view-mode="pomodoro"/);
  assert.match(app, /PRESENTATION_TIMER_VIEW_KEY/);
  assert.match(app, /function presentationTimerVisualState\(timerState\)/);
  assert.match(app, /data-action="toggle-smartboard-tool"/);
  assert.match(app, /data-action="close-smartboard-tool"/);
  assert.match(app, /data-smartboard-drag-handle/);
  assert.match(app, /data-smartboard-resize-handle/);
  assert.match(app, /function installSmartboardToolGestures\(eventTarget\)/);
  assert.match(app, /installSmartboardToolGestures\(classroomPresentationWindow\.document\)/);
  assert.match(app, /setPointerCapture/);
  assert.match(css, /\.platform-smartboard-tool \{[^}]*position: fixed/);
  assert.match(app, /data-action="reset-smartboard-tools"/);
  assert.match(app, /data-action = "popout-smartboard-tool"|dataset\.action = "popout-smartboard-tool"/);
  assert.match(app, /function openSmartboardToolPopout\(sourceTool\)/);
  assert.match(app, /sourceTool\.ownerDocument\?\.defaultView/);
  assert.match(app, /classroomPresentationWindow\.document\.addEventListener\("keydown"/);
  assert.match(app, /data-action = "fullscreen-smartboard-tool"|dataset\.action = "fullscreen-smartboard-tool"/);
  assert.match(app, /requestFullscreen/);
  assert.match(css, /\.platform-smartboard-tool \{[^}]*container-type: inline-size/);
  assert.match(css, /data-smartboard-tool="stopwatch"[^}]*font-size: clamp\(2rem, 12cqw, 6rem\)/);
  assert.match(css, /\.platform-smartboard-tool-tray \{[^}]*flex-direction: column/);
  assert.match(css, /data-smartboard-tool-name="message"/);
  assert.match(css, /data-smartboard-tool-name="voice"/);
  for (const tool of ["timer", "stopwatch", "message", "voice"]) assert.match(css, new RegExp(`data-smartboard-tool="${tool}"`));
  assert.match(css, /\.platform-timer-view-choice button\[aria-pressed="true"\]/);
  assert.match(css, /\.platform-smartboard-resize-handle \{[^}]*touch-action: none/);
  assert.match(css, /\.platform-floating-tool-switcher/);
  assert.match(css, /\.platform-floating-timer-face/);
  assert.match(css, /\.platform-floating-whiteboard-board/);
  assert.match(css, /@container \(min-width: 32rem\)/);
  assert.match(css, /platform-message-board-quick-panel\[data-message-board-quick-panel\]:not\(\[hidden\]\) \{[^}]*position: fixed/);
  assert.match(css, /\.platform-alternate-timers/);
  assert.match(css, /\.platform-timer-display-settings/);
});

test("scheduled Pomodoro classes use a Pomodoro class timer and an independent activity side timer", () => {
  for (const label of ["Class Pomodoro Timer", "Activity Side Timer", "Independent timer — the class timer keeps running.", "Set Custom Time"]) assert.match(app, new RegExp(label));
  assert.match(app, /if \(classTimerSchedule\.readEffective\(\)\.pomodoroEnabled\) return "pomodoro"/);
  assert.match(app, /data-class-timer-kind=/);
  assert.match(app, /data-smartboard-tool="activity-timer"/);
  assert.match(app, /function handleActivitySideTimerAction/);
  assert.match(app, /activitySideTimer\.endsAt/);
  assert.match(css, /\.platform-activity-side-timer \{/);
  assert.match(css, /background: #fff4c7/);
});

test("Run Today’s Class shows a compact live current plan", () => {
  for (const label of ["Classroom Controls", "More Classroom Tools", "View Lesson Details and Live Status", "Assigned activities", "Students can work in", "Current message", "Latest whiteboard", "Live Voice Meter", "Compare with"]) assert.match(app, new RegExp(label));
  assert.doesNotMatch(app, /<h3 id="current-class-plan-title">Live Lesson Dashboard<\/h3>/);
  assert.match(app, /platform-live-lesson-status/);
  assert.match(app, /platform-current-plan-featured/);
  assert.doesNotMatch(app, /Classroom Sound Goals/);
  for (const label of ["Present on This Screen", "Open Separate Classroom Screen", "Floating Timer", "Quick Message", "Whiteboard", "Voice Meter"]) assert.match(app, new RegExp(label));
  for (const label of ["Teacher-led instruction", "Independent seat work", "Collaborative activity", "Sound goal achieved", "Almost there"]) assert.match(app, new RegExp(label));
  assert.match(app, /data-voice-meter-activity/);
  assert.match(app, /detectedSeconds/);
  for (const label of ["Last monitored", "This week", "last week", "Award a daily star at"]) assert.match(app, new RegExp(label));
  assert.match(app, /data-voice-star-goal/);
  assert.match(app, /VOICE_METER_STAR_GOAL_KEY/);
  for (const label of ["Adjust Sound Goals", "Activity minutes and sound patterns", "goal days", "Excellent sound balance"]) assert.match(app, new RegExp(label));
  assert.match(css, /\.platform-voice-activity-details \{[^}]*border-top: 7px solid #176b4b[^}]*box-shadow:/);
  assert.match(css, /\.platform-voice-activity-details summary \{[^}]*color: #176b4b[^}]*background: linear-gradient/);
  assert.match(app, /data-voice-weekly-star-goal/);
  assert.match(app, /data-voice-meter-display-mode/);
  assert.match(app, /platform-voice-threshold-marker/);
  assert.match(app, /predictedLearningType/);
  assert.match(app, /platform-current-class-plan-stack/);
  assert.match(app, /segmentActiveVoiceMeter/);
  assert.match(app, /voiceMeterState\(value, threshold\)/);
  assert.match(app, /Voice Meter is \$\{voiceIsOn \? "on and listening" : "off"\}/);
  assert.match(app, /Turn Voice Meter On/);
  assert.doesNotMatch(app, /Student Activity Access Today/);
  assert.match(app, /data-class-plan-comparison/);
  assert.match(app, /readVoiceMeterHistory/);
  assert.match(app, /recordVoiceMeterUse/);
  assert.match(app, /data-current-plan-timer/);
  assert.match(app, /function currentScheduledLessonTimerState\(\)/);
  assert.match(app, /state\.status === LESSON_TIMER_STATES\.READY && state\.durationSeconds !== schedule\.durationMinutes \* 60/);
  assert.ok((app.match(/currentScheduledLessonTimerState\(\)/g) || []).length >= 5);
  assert.match(app, /Class duration saved automatically at \$\{duration\} minutes/);
  assert.match(app, /function saveQuickClassTimerSchedule\(form\)/);
  assert.match(app, /\$\{result\.schedule\.pomodoroEnabled \? "Pomodoro timer" : "Standard timer"\} saved automatically/);
  assert.match(app, /\[name="pomodoroEnabled"\][\s\S]*saveQuickClassTimerSchedule/);
  assert.match(app, /classTimerSchedule\.save\(\{ \.\.\.currentSchedule, durationMinutes: duration, phases: recommendedTimerPhases\(duration\) \}\)/);
  assert.match(app, /lessonTimer\.setDuration\(duration\);\s*syncLessonTimerPresentation\(\)/);
  assert.match(app, /"Edit Schedule"[\s\S]*?"open-class-schedule-quick"/);
  assert.match(app, /panel\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
  assert.match(app, /schedule\.querySelector\('\[name="durationMinutes"\]'\)\?\.focus/);
  assert.match(app, /platform-current-plan-timer-widget/);
  assert.match(app, /platform-current-plan-timer-wheel/);
  for (const action of ["timer-subtract-minute", "timer-add-minute", "timer-start-or-resume", "timer-pause", "timer-end", "timer-reset"]) assert.match(app, new RegExp(`data-action="${action}"`));
  assert.match(app, /editAction = "open-current-plan-editor"/);
  assert.match(app, /data-action="save-current-plan-message"/);
  assert.match(app, /data-action="return-current-plan"/);
  assert.ok((app.match(/data-action="return-to-current-class-plan"/g) || []).length >= 8);
  assert.match(app, /Return to Today’s Class Plan/);
  assert.match(app, /data-current-plan-resource-toggle/);
  assert.match(app, /currentClassPlanEditorMarkup/);
  assert.match(css, /\.platform-current-class-plan \{[^}]*border: 3px solid var\(--platform-green\)/);
  assert.match(css, /\.platform-current-plan-grid \{[^}]*grid-template-columns: repeat\(auto-fit/);
  assert.match(app, /platform-current-plan-textured/);
  assert.match(css, /\.platform-current-plan-grid \.platform-current-plan-textured \{[^}]*background-image:/);
  assert.match(css, /\.platform-live-lesson-tool-buttons button \{[^}]*border-top: 6px solid var\(--tool-accent[^}]*background: linear-gradient\(180deg, #fff/);
  for (const action of ["open-timer-display", "open-classroom-presentation-window", "open-name-picker-display", "open-timer-popout", "open-message-board-quick", "open-whiteboard", "open-voice-meter-display"]) {
    assert.match(css, new RegExp(`\\.platform-live-lesson-tool-buttons button\\[data-action="${action}"\\] \\{[^}]*--tool-accent:[^}]*border-top-color:[^}]*color:[^}]*background: linear-gradient`));
  }
  assert.match(app, /data-plan-card=/);
  assert.match(app, /data-live="true"/);
  assert.match(css, /article\[data-live="true"\]::after/);
  for (const card of ["activities", "access", "message", "timer", "whiteboard", "voice"]) assert.match(css, new RegExp(`data-plan-card="${card}"`));
  assert.match(css, /\.platform-current-plan-modal \{[^}]*position: fixed/);
  assert.match(css, /\.platform-current-plan-timer-card \{ grid-column: span 2; \}/);
  assert.match(css, /\.platform-current-plan-timer-controls \{[^}]*repeat\(6/);
  assert.match(css, /\.platform-return-current-plan \{[^}]*background: var\(--platform-green\)/);
});

test("Approved Research joins Today’s Lesson and gives students restricted launch controls", () => {
  for (const label of ["Today’s Lesson", "Approved Research", "Preview This Topic in Google", "Add to Today’s Lesson", "Research for This Lesson", "Students never receive an open Google search box"]) assert.match(app, new RegExp(label));
  assert.match(app, /TEACHER_ASSIGNED_RESEARCH_KEY/);
  assert.match(app, /parseTeacherAssignedResearchLinks/);
  assert.match(app, /data-form="teacher-assigned-research"/);
  assert.match(app, /data-action="open-assigned-research"/);
  assert.match(app, /https:\/\/www\.google\.com\/search\?q=/);
  assert.match(app, /readTeacherAssignedResearch\(state\.classId\)\.links\.find/);
  assert.match(app, /researchWindow\.closed/);
  assert.match(css, /\.platform-assigned-research/);
  assert.match(css, /\.platform-assigned-research-student \{[^}]*grid-column: 1 \/ -1/);
});

test("teacher can organize reusable approved links into titled topic groups", () => {
  for (const label of ["Approved Link Bank", "Create a New Link Group", "Save Group to Link Bank", "Assign to This Class", "Delete Group"]) assert.match(app, new RegExp(label));
  assert.match(app, /TEACHER_RESEARCH_LINK_BANK_KEY/);
  assert.match(app, /data-form="teacher-research-link-bank"/);
  assert.match(app, /data-action="assign-research-bank-group"/);
  assert.match(app, /data-action="delete-research-bank-group"/);
  assert.match(css, /\.platform-research-bank-grid/);
  assert.match(css, /\.platform-research-bank-card/);
});

test("teacher dashboard opens a clearly labeled no-code student preview in a separate tab", () => {
  for (const label of ["Preview Student View — No Code", "Student Preview — No Sign-In Code", "fictional student Ada Rivera", "only preview data in this browser", "Exit Student Preview"]) assert.match(app, new RegExp(label));
  assert.match(app, /href="#\$\{ROUTES\.PREVIEW_STUDENT\}" target="_blank"/);
  assert.match(app, /state\.studentId === "student-preview-1"/);
  assert.match(css, /\.platform-student-preview-banner \{[^}]*grid-column: 1 \/ -1/);
});
