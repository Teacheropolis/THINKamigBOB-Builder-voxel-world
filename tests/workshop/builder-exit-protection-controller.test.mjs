import test from "node:test";
import assert from "node:assert/strict";
import {
  BUILDER_RECOVERY_FAILURE_MESSAGE,
  createBuilderExitProtectionController
} from "../../js/persistence/builder-exit-protection-controller.mjs";

class FakeClassList{
  constructor(){ this.values=new Set(); }
  add(value){ this.values.add(value); }
  remove(value){ this.values.delete(value); }
  contains(value){ return this.values.has(value); }
}

class FakeElement{
  constructor(documentOwner){
    this.ownerDocument=documentOwner;
    this.hidden=true;
    this.disabled=false;
    this.textContent="";
    this.listeners=new Map();
  }
  addEventListener(type,listener){
    if(!this.listeners.has(type)) this.listeners.set(type,[]);
    this.listeners.get(type).push(listener);
  }
  dispatch(type,properties={}){
    const event={type,key:"",shiftKey:false,returnValue:undefined,prevented:false,stopped:false,
      preventDefault(){ this.prevented=true; },stopPropagation(){ this.stopped=true; },...properties};
    for(const listener of this.listeners.get(type) || []) listener(event);
    return event;
  }
  focus(){ this.ownerDocument.activeElement=this; }
}

function harness({dirty=true,flushes=[true],saveResult=true}={}){
  const documentOwner={activeElement:null,body:{classList:new FakeClassList()}};
  const dialog=new FakeElement(documentOwner);
  const status=new FakeElement(documentOwner);
  const cancelButton=new FakeElement(documentOwner);
  const saveButton=new FakeElement(documentOwner);
  const continueButton=new FakeElement(documentOwner);
  cancelButton.hidden=false;
  saveButton.hidden=false;
  continueButton.hidden=false;
  const focusOwner=new FakeElement(documentOwner);
  const announcements=[];
  const flushCalls=[];
  let actionCount=0;
  const recovery={
    getExitState:()=>({dirty,hasRecoverableWork:dirty,writable:true}),
    flush:options=>{ flushCalls.push(options); return flushes.length ? flushes.shift() : false; }
  };
  const controller=createBuilderExitProtectionController({recovery,dialog,status,cancelButton,saveButton,
    continueButton,document:documentOwner,announce:value=>announcements.push(value),
    saveProjectFile:()=>saveResult});
  const action=()=>{ actionCount++; return true; };
  return {controller,dialog,status,cancelButton,saveButton,continueButton,focusOwner,documentOwner,
    announcements,flushCalls,action,get actionCount(){ return actionCount; }};
}

test("Return and Workshop exits continue silently after a verified immediate recovery flush",()=>{
  const h=harness({flushes:[true]});
  assert.equal(h.controller.requestImmediate(h.action,h.focusOwner),true);
  assert.equal(h.actionCount,1);
  assert.equal(h.dialog.hidden,true);
  assert.deepEqual(h.flushCalls,[{feedback:false}]);
  assert.deepEqual(h.announcements,[]);
});

test("failed immediate recovery blocks navigation and offers the protected choices",()=>{
  const h=harness({flushes:[false]});
  assert.equal(h.controller.requestImmediate(h.action,h.focusOwner),false);
  assert.equal(h.actionCount,0);
  assert.equal(h.dialog.hidden,false);
  assert.equal(h.status.textContent,BUILDER_RECOVERY_FAILURE_MESSAGE);
  assert.equal(h.documentOwner.activeElement,h.cancelButton);
  assert.deepEqual(h.announcements,[BUILDER_RECOVERY_FAILURE_MESSAGE]);
});

test("dirty replacements use Cancel-first modal and Cancel preserves the action owner",()=>{
  const h=harness({dirty:true});
  assert.equal(h.controller.requestReplacement(h.action,h.focusOwner),true);
  assert.equal(h.actionCount,0);
  assert.equal(h.dialog.hidden,false);
  assert.equal(h.documentOwner.activeElement,h.cancelButton);
  h.cancelButton.dispatch("click");
  assert.equal(h.dialog.hidden,true);
  assert.equal(h.actionCount,0);
  assert.equal(h.documentOwner.activeElement,h.focusOwner);
});

test("Continue proceeds only after verified recovery and Save waits for portable-file confirmation",()=>{
  const continued=harness({flushes:[true]});
  continued.controller.requestReplacement(continued.action,continued.focusOwner);
  continued.continueButton.dispatch("click");
  assert.equal(continued.actionCount,1);
  assert.deepEqual(continued.flushCalls,[{feedback:true}]);

  const saved=harness({saveResult:true});
  saved.controller.requestReplacement(saved.action,saved.focusOwner);
  saved.saveButton.dispatch("click");
  assert.equal(saved.actionCount,0);
  assert.equal(saved.controller.getSnapshot().waitingForProjectSave,true);
  assert.equal(saved.controller.confirmProjectFileSaved(),true);
  assert.equal(saved.actionCount,1);
});

test("Escape and Tab stay inside the modal while native button activation remains authoritative",()=>{
  const h=harness();
  h.controller.requestReplacement(h.action,h.focusOwner);
  h.documentOwner.activeElement=h.continueButton;
  const tab=h.dialog.dispatch("keydown",{key:"Tab"});
  assert.equal(tab.prevented,true);
  assert.equal(h.documentOwner.activeElement,h.cancelButton);
  const escape=h.dialog.dispatch("keydown",{key:"Escape"});
  assert.equal(escape.prevented,true);
  assert.equal(escape.stopped,true);
  assert.equal(h.dialog.hidden,true);
});

test("beforeunload warns only when the last synchronous recovery attempt fails",()=>{
  const succeeds=harness({dirty:true,flushes:[true]});
  const successEvent={preventDefault(){ throw new Error("must not warn"); }};
  assert.equal(succeeds.controller.handleBeforeUnload(successEvent),false);

  const fails=harness({dirty:true,flushes:[false]});
  const event={returnValue:undefined,prevented:false,preventDefault(){ this.prevented=true; }};
  assert.equal(fails.controller.handleBeforeUnload(event),true);
  assert.equal(event.prevented,true);
  assert.equal(event.returnValue,"");
});
