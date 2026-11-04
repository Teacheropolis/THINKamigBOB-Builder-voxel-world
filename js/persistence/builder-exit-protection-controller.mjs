const FAILURE_MESSAGE="Recovery failed. Stay here and try again, or save a project file.";

export function createBuilderExitProtectionController(options={}){
  const recovery=options.recovery;
  const dialog=options.dialog;
  const status=options.status;
  const cancelButton=options.cancelButton;
  const saveButton=options.saveButton;
  const continueButton=options.continueButton;
  const documentOwner=options.document || globalThis.document;
  const isBuilderActive=options.isBuilderActive || (()=>true);
  const announce=options.announce || (()=>{});
  const saveProjectFile=options.saveProjectFile || (()=>false);
  let pendingAction=null;
  let returnFocus=null;
  let waitingForProjectSave=false;

  function exitState(){
    return recovery && typeof recovery.getExitState==="function"
      ? recovery.getExitState()
      : Object.freeze({dirty:false,hasRecoverableWork:false,writable:false});
  }
  function activeElement(){ return documentOwner ? documentOwner.activeElement : null; }
  function focusCancel(){ if(cancelButton) cancelButton.focus({preventScroll:true}); }
  function open(action,focusOwner){
    pendingAction=action;
    returnFocus=focusOwner || activeElement();
    waitingForProjectSave=false;
    if(status) status.textContent="Choose how to protect your current project.";
    dialog.hidden=false;
    if(documentOwner && documentOwner.body) documentOwner.body.classList.add("builderExitProtectionOpen");
    focusCancel();
    return true;
  }
  function close({restoreFocus=true}={}){
    dialog.hidden=true;
    if(documentOwner && documentOwner.body) documentOwner.body.classList.remove("builderExitProtectionOpen");
    if(restoreFocus && returnFocus && typeof returnFocus.focus==="function"){
      returnFocus.focus({preventScroll:true});
    }
  }
  function fail(){
    waitingForProjectSave=false;
    if(dialog.hidden) open(pendingAction,returnFocus);
    if(status) status.textContent=FAILURE_MESSAGE;
    announce(FAILURE_MESSAGE);
    focusCancel();
    return false;
  }
  function verifiedFlush(feedback=false){
    return !!(recovery && typeof recovery.flush==="function" && recovery.flush({feedback}));
  }
  function finish(){
    const action=pendingAction;
    pendingAction=null;
    waitingForProjectSave=false;
    close({restoreFocus:false});
    return typeof action==="function" ? action() : true;
  }
  function requestImmediate(action,focusOwner){
    if(!isBuilderActive()) return typeof action==="function" ? action() : true;
    pendingAction=action;
    returnFocus=focusOwner || activeElement();
    if(verifiedFlush(false)) return finish();
    return fail();
  }
  function requestReplacement(action,focusOwner){
    if(!isBuilderActive() || !exitState().dirty){
      return typeof action==="function" ? action() : true;
    }
    return open(action,focusOwner);
  }
  function continueWithRecovery(){ return verifiedFlush(true) ? finish() : fail(); }
  function saveProject(){
    waitingForProjectSave=true;
    close({restoreFocus:false});
    if(saveProjectFile(returnFocus)!==false) return true;
    waitingForProjectSave=false;
    open(pendingAction,returnFocus);
    return false;
  }
  function confirmProjectFileSaved(){
    if(!waitingForProjectSave) return false;
    return finish();
  }
  function resumeAfterProjectFileSaveCancelled(){
    if(!waitingForProjectSave) return false;
    waitingForProjectSave=false;
    return open(pendingAction,returnFocus);
  }
  function cancel(){
    pendingAction=null;
    waitingForProjectSave=false;
    close({restoreFocus:true});
    return true;
  }
  function handleKeydown(event){
    if(dialog.hidden) return;
    if(event.key==="Escape"){
      event.preventDefault(); event.stopPropagation(); cancel(); return;
    }
    if(event.key!=="Tab") return;
    const controls=[cancelButton,saveButton,continueButton].filter(item=>item && !item.hidden && !item.disabled);
    if(!controls.length){ event.preventDefault(); return; }
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey && activeElement()===first){ event.preventDefault(); last.focus(); }
    else if(!event.shiftKey && activeElement()===last){ event.preventDefault(); first.focus(); }
  }
  function handleBeforeUnload(event){
    const state=exitState();
    if(!isBuilderActive() || !state.hasRecoverableWork) return false;
    if(verifiedFlush(false)) return false;
    event.preventDefault();
    event.returnValue="";
    return true;
  }

  if(!recovery || !dialog || !cancelButton || !saveButton || !continueButton){
    throw new TypeError("Builder exit protection requires recovery and dialog owners.");
  }
  cancelButton.addEventListener("click",cancel);
  saveButton.addEventListener("click",saveProject);
  continueButton.addEventListener("click",continueWithRecovery);
  dialog.addEventListener("keydown",handleKeydown);
  ["click","contextmenu","mousedown","mouseup","pointerdown","pointerup","pointercancel","touchstart","touchmove","touchend","touchcancel","wheel"].forEach(type=>{
    dialog.addEventListener(type,event=>event.stopPropagation(),{passive:type.startsWith("touch") || type==="wheel"});
  });

  return Object.freeze({requestImmediate,requestReplacement,confirmProjectFileSaved,resumeAfterProjectFileSaveCancelled,cancel,handleBeforeUnload,getSnapshot:()=>Object.freeze({open:!dialog.hidden,waitingForProjectSave,hasPendingAction:!!pendingAction})});
}

export {FAILURE_MESSAGE as BUILDER_RECOVERY_FAILURE_MESSAGE};
