const freezeResult = (value) => Object.freeze(value);

export function createSmartBoardNotebookView({
  screen,
  measurementDisplay,
  learningDisplay,
  notebookDisplay,
  openControl,
  backControl,
  source,
  target,
  controlsConnected = false,
} = {}) {
  if (!screen?.dataset || !measurementDisplay || !learningDisplay || !notebookDisplay?.dataset) {
    throw new TypeError("Smart Board Notebook display roots are required.");
  }
  if (!openControl || !backControl) {
    throw new TypeError("Smart Board Notebook controls are required.");
  }
  const sourceKeys = ["assistant", "selection", "unit", "width", "length", "height"];
  const targetKeys = ["selection", "unit", "width", "length", "height", "groupNote"];
  if (sourceKeys.some((key) => !source?.[key]) || targetKeys.some((key) => !target?.[key])) {
    throw new TypeError("Complete Notebook source and target fields are required.");
  }

  let selected = false;
  let mode = "measurements";

  const setControls = () => {
    if (!controlsConnected) {
      openControl.hidden = true;
      openControl.disabled = true;
      backControl.hidden = true;
      backControl.disabled = true;
      return;
    }
    const notebookVisible = mode === "notebook";
    openControl.hidden = notebookVisible || !selected;
    openControl.disabled = notebookVisible || !selected;
    backControl.hidden = !notebookVisible;
    backControl.disabled = !notebookVisible;
  };

  const copyAuthoritativeContent = () => {
    if (!selected || source.assistant.dataset.measurementState !== "measured") {
      return freezeResult({ ok: false, code: "SELECTION_REQUIRED" });
    }
    target.selection.textContent = source.selection.textContent;
    target.unit.textContent = source.unit.textContent;
    target.width.textContent = source.width.textContent;
    target.length.textContent = source.length.textContent;
    target.height.textContent = source.height.textContent;
    const selectionCount = Number(source.assistant.dataset.selectionCount);
    target.groupNote.textContent = selectionCount > 1
      ? "This design record describes the full selected group."
      : "This design record describes the selected object.";
    return freezeResult({ ok: true, code: "CONTENT_COPIED" });
  };

  const showMeasurements = () => {
    const idempotent = mode === "measurements" && notebookDisplay.hidden === true;
    mode = "measurements";
    screen.dataset.notebookMode = "measurements";
    notebookDisplay.dataset.notebookState = "inactive";
    notebookDisplay.hidden = true;
    learningDisplay.hidden = true;
    measurementDisplay.hidden = false;
    setControls();
    return freezeResult({ ok: true, code: idempotent ? "IDEMPOTENT" : "MEASUREMENTS_VISIBLE" });
  };

  const showNotebook = () => {
    const copied = copyAuthoritativeContent();
    if (!copied.ok) return copied;
    const idempotent = mode === "notebook" && notebookDisplay.hidden === false;
    mode = "notebook";
    screen.dataset.notebookMode = "notebook";
    notebookDisplay.dataset.notebookState = "active";
    measurementDisplay.hidden = true;
    learningDisplay.hidden = true;
    notebookDisplay.hidden = false;
    setControls();
    return freezeResult({ ok: true, code: idempotent ? "IDEMPOTENT" : "NOTEBOOK_VISIBLE" });
  };

  const reset = () => {
    selected = false;
    showMeasurements();
    return freezeResult({ ok: true, code: "RESET" });
  };

  const syncSelection = ({ hasSelection } = {}) => {
    selected = hasSelection === true;
    if (!selected) return reset();
    if (mode === "notebook") copyAuthoritativeContent();
    setControls();
    return freezeResult({ ok: true, code: "SYNCED", hasSelection: true });
  };

  notebookDisplay.hidden = true;
  notebookDisplay.dataset.notebookState = "inactive";
  screen.dataset.notebookMode = "measurements";
  setControls();

  return Object.freeze({
    showMeasurements,
    showNotebook,
    reset,
    syncSelection,
    copyAuthoritativeContent,
    getSnapshot() {
      return freezeResult({ mode, selected, controlsConnected });
    },
  });
}
