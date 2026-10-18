import {
  PB002J_ACTIVITY_ID,
  PB002J_ACTIVITY_VERSION,
  PB002J_DIRECTIONS_URL,
  PB002J_GOAL_ID,
  PB002J_WEEK_ID,
} from "./pb-002j-classwide-contract.mjs";

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function errorMessage(error) {
  const messages = {
    "teacher-key-required": "Enter the temporary teacher key shown when the classroom service started.",
    "invalid-week-selection": "Select Week 1 before saving class availability.",
    "invalid-goal-selection": "Select Goal 1 before saving class availability.",
    "invalid-availability-mode": "Choose whether students may choose or the teacher assigns the activity.",
    "invalid-specific-activity": "Choose Design a Space Bedroom for this class.",
    "stale-revision": "The class configuration changed. Review the current state and try again.",
  };
  return messages[error?.message] ?? "The classroom prototype service is unavailable. No activity was made available.";
}

export function createPB002JClasswideController({ client }) {
  let state = { service: "checking", catalog: null, projection: null, message: "", error: "" };
  let mountedRoot = null;
  let mountedRole = null;

  function renderTeacher() {
    const target = mountedRoot?.querySelector("[data-pb002j-teacher]");
    if (!target) return;
    const projection = state.projection;
    const active = projection?.status === "ready" ? projection.primaryStartChoices[0] : null;
    if (state.service !== "ready") {
      target.innerHTML = `<p class="platform-student-empty-state">Class-wide activity service unavailable.</p><p>Start the approved memory-only classroom service to configure this prototype.</p>`;
      return;
    }
    if (!state.catalog) {
      target.innerHTML = `
        <form data-form="pb002j-teacher-connect" class="platform-pb002j-form">
          <label for="pb002j-teacher-key">Temporary teacher key</label>
          <input id="pb002j-teacher-key" name="teacherKey" type="password" autocomplete="off" required>
          <button type="submit">Connect Class Activity Controls</button>
          <p class="platform-pb002j-help">The key stays only in this page and is cleared on sign-out or reload.</p>
          <p class="platform-error" role="alert" data-pb002j-error>${escapeHtml(state.error)}</p>
        </form>`;
      return;
    }
    target.innerHTML = `
      <form data-form="pb002j-configuration" class="platform-pb002j-form" novalidate>
        <div class="platform-pb002j-activity-summary">
          <p class="platform-command-label">Grade 5 • Goal 1: Build a Shelter</p>
          <h4>Design a Space Bedroom</h4>
          <a href="${PB002J_DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer">Review approved Activity Directions</a>
        </div>
        <fieldset><legend>Week or weeks</legend>
          <label><input type="checkbox" name="weekIds" value="${PB002J_WEEK_ID}"${active ? " checked" : ""}> Week 1</label>
        </fieldset>
        <fieldset><legend>Goal or goals</legend>
          <label><input type="checkbox" name="goalIds" value="${PB002J_GOAL_ID}"${active ? " checked" : ""}> Goal 1: Build a Shelter</label>
        </fieldset>
        <fieldset><legend>Activity choice for this class</legend>
          <label><input type="radio" name="availabilityMode" value="student-choice"${active?.availabilityMode === "student-choice" ? " checked" : ""}> Students may choose an activity</label>
          <label><input type="radio" name="availabilityMode" value="specific-activity"${active?.availabilityMode === "specific-activity" ? " checked" : ""}> Assign a specific activity</label>
        </fieldset>
        <label for="pb002j-specific-activity">Specific activity</label>
        <select id="pb002j-specific-activity" name="selectedActivityId">
          <option value="">Choose an activity when assigning one</option>
          <option value="${PB002J_ACTIVITY_ID}"${active?.availabilityMode === "specific-activity" ? " selected" : ""}>Design a Space Bedroom</option>
        </select>
        <p class="platform-pb002j-help">This prototype currently contains one approved activity. More teacher-approved activities will appear as their catalog records are ready.</p>
        <div class="platform-pb002j-unavailable" aria-label="Activity tool availability">
          <strong>Builder: Unavailable for this activity</strong>
          <strong>Workshop: Unavailable for this activity</strong>
        </div>
        <button type="submit">Save Class Availability</button>
        ${active ? '<button type="button" data-action="pb002j-withdraw">Remove Class Availability</button>' : ""}
        <p class="platform-error" role="alert" data-pb002j-error>${escapeHtml(state.error)}</p>
        <p role="status" aria-live="polite">${escapeHtml(state.message || (active ? "This activity is available to the class for this service session." : "No PB-002J activity is currently available."))}</p>
      </form>`;
  }

  function renderStudent() {
    const goal = mountedRoot?.querySelector("[data-pb002j-current-goal]");
    const choices = mountedRoot?.querySelector("[data-pb002j-available-missions]");
    if (!goal || !choices) return;
    if (state.service !== "ready") {
      goal.innerHTML = '<p class="platform-student-empty-state">Current Goal is temporarily unavailable.</p><p>No activity will be shown until the classroom service is ready.</p>';
      choices.innerHTML = '<p class="platform-student-empty-state">Available Missions cannot be checked right now.</p><p>Ask your teacher before starting a new activity.</p>';
      return;
    }
    const choice = state.projection?.status === "ready" ? state.projection.primaryStartChoices[0] : null;
    if (!choice) {
      goal.innerHTML = '<p class="platform-student-empty-state">No current goal is available yet.</p><p>Your teacher has not made a prototype activity available.</p>';
      choices.innerHTML = '<p class="platform-student-empty-state">No new missions are available right now.</p><p>Only teacher-confirmed activities appear here.</p>';
      return;
    }
    goal.innerHTML = `<p class="platform-student-goal-name">YOUR MISSION: ${escapeHtml(choice.goal.title)}</p><p>${escapeHtml(choice.title)}</p>`;
    choices.innerHTML = `
      <article class="platform-pb002j-student-choice">
        <p class="platform-mission-choice-label">Grade ${choice.grade} • ${escapeHtml(choice.goal.title)}</p>
        <h4>${escapeHtml(choice.title)}</h4>
        <p>${choice.availabilityMode === "specific-activity" ? "Your teacher selected this activity for the class." : "Choose from the activities your teacher made available."}</p>
        <a class="platform-button platform-button-primary" href="${escapeHtml(choice.directionsUrl)}" target="_blank" rel="noopener noreferrer">Open Activity Directions</a>
        <p><strong>Builder and Workshop are not available for this activity.</strong></p>
        <p>Add evidence to your Student Engineering Notebook / Evidence Portfolio at the location your teacher identifies.</p>
      </article>`;
  }

  function renderMounted() {
    if (mountedRole === "teacher") renderTeacher();
    if (mountedRole === "student") renderStudent();
  }

  async function refreshProjection() {
    try {
      await client.health();
      state = { ...state, service: "ready", projection: await client.projection(), error: "" };
    } catch (error) {
      state = { ...state, service: "unavailable", projection: null, error: errorMessage(error) };
    }
    renderMounted();
  }

  return Object.freeze({
    mount(root, role) {
      mountedRoot = root;
      mountedRole = role;
      renderMounted();
      void refreshProjection();
    },
    async handleSubmit(form) {
      const data = new FormData(form);
      try {
        if (form.dataset.form === "pb002j-teacher-connect") {
          const result = await client.connectTeacher(data.get("teacherKey"));
          state = { ...state, catalog: result.catalog, error: "", message: "Teacher controls connected." };
        } else if (form.dataset.form === "pb002j-configuration") {
          const result = await client.configure({
            classContextId: client.getClassContextId(),
            activityId: PB002J_ACTIVITY_ID,
            activityVersion: PB002J_ACTIVITY_VERSION,
            weekIds: data.getAll("weekIds"),
            goalIds: data.getAll("goalIds"),
            availabilityMode: data.get("availabilityMode"),
            selectedActivityId: data.get("selectedActivityId") || null,
            directionsUrl: PB002J_DIRECTIONS_URL,
            evidenceDestination: "Student Engineering Notebook / Evidence Portfolio",
            builderAvailable: false,
            workshopAvailable: false,
          });
          state = { ...state, projection: result.projection, error: "", message: "Design a Space Bedroom is now available to this class." };
        }
      } catch (error) {
        state = { ...state, error: errorMessage(error), message: "" };
      }
      renderMounted();
    },
    async handleWithdraw() {
      try {
        const result = await client.withdraw();
        state = { ...state, projection: result.projection, error: "", message: "Class availability removed. Student Start choices are now empty." };
      } catch (error) {
        state = { ...state, error: errorMessage(error), message: "" };
      }
      renderMounted();
    },
    signOut() { client.clearTeacherKey(); state = { service: "checking", catalog: null, projection: null, message: "", error: "" }; },
  });
}
