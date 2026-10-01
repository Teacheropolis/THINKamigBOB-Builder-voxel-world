import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
  createMissionJourneySteps,
  formatMissionTemplateItems,
  setMissionCheckpointComplete,
} from "../../js/guidance/bob-mission-journey-guidance.mjs";

const root=new URL("../../",import.meta.url);
const html=await readFile(new URL("index.html",root),"utf8");
const source=await readFile(new URL("js/guidance/bob-mission-journey-guidance.mjs",root),"utf8");

test("compact Mission Journey control replaces the permanent challenge footprint",()=>{
  assert.equal((html.match(/id="builderMissionJourneyButton"/g)||[]).length,1);
  assert.match(html,/#info:not\(\.bobGuidanceChallengeReveal\)\{display:none!important\}/);
  assert.match(html,/#builderMissionJourneyButton\{[\s\S]*min-height:44px/);
  assert.match(html,/left:var\(--builder-swap-center-left\);right:var\(--builder-swap-center-right\);bottom:8px/);
});

test("progress uses enabled canonical checklist inputs without changing persistence",()=>{
  assert.match(source,/querySelectorAll\("#challengeChecklist input"\)/);
  assert.match(source,/filter\(input=>!input\.disabled\)/);
  assert.match(source,/checkpoints\.filter\(input=>input\.checked\)\.length/);
  assert.match(source,/MISSION JOURNEY — \$\{progress\.complete\} OF \$\{progress\.total\}/);
  assert.doesNotMatch(source,/localStorage|sessionStorage|setItem|checklist\.push/);
});

test("Mission Journey opens checkpoint-first and keeps optional mission review",()=>{
  for(const id of ["mission-summary","starting-template","more-challenge","mission-progress"]){
    assert.ok(source.includes(`id:"${id}"`),`missing ${id}`);
  }
  assert.match(source,/const incomplete=checkpoints\.filter\(input=>!input\.checked\)/);
  assert.match(source,/const completed=checkpoints\.filter\(input=>input\.checked\)/);
  assert.match(source,/\[\.\.\.incomplete,\.\.\.completed\]/);
  assert.match(source,/actionLabel:wasComplete\?"MARK NOT DONE":"I DID THIS ✓"/);
  assert.match(source,/message:\(\)=>\{/);
  assert.match(source,/const current=getMissionJourneyProgress\(doc\)/);
  assert.match(source,/All \$\{current\.total\} Mission checkpoints are complete/);
  assert.match(source,/guidance\.start\(\{id:SEQUENCE_ID,steps:createMissionJourneySteps/);
  assert.match(source,/guidanceType:"display"/);
  assert.match(source,/button\.focus\(\{preventScroll:true\}\)/);
});

test("Mission Journey hides legacy checkboxes but retains them as the only progress owner",()=>{
  assert.match(html,/\.bobGuidanceChallengeReveal #challengeChecklist input\[type="checkbox"\]\{display:none!important\}/);
  assert.match(source,/input\.checked=!!complete/);
  assert.match(source,/syncChecklists\?\.\("main"\)/);
  assert.match(source,/new win\.Event\("change",\{bubbles:true\}\)/);
  assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|setItem/);
});

test("checkpoint action updates the canonical checkbox and dispatches one bubbling change",()=>{
  const calls=[];
  class FakeEvent {
    constructor(type,options){this.type=type;this.bubbles=options?.bubbles===true;}
  }
  const input={checked:false,disabled:false,dispatchEvent:event=>calls.push(event)};
  const win={Event:FakeEvent,syncChecklists:source=>calls.push(source)};
  assert.equal(setMissionCheckpointComplete(input,true,{window:win}),true);
  assert.equal(input.checked,true);
  assert.equal(calls[0],"main");
  assert.equal(calls[1].type,"change");
  assert.equal(calls[1].bubbles,true);
  input.disabled=true;
  assert.equal(setMissionCheckpointComplete(input,false,{window:win}),false);
  assert.equal(input.checked,true);
  assert.equal(calls.length,2);
});

test("the final progress step reads the live 3 of 3 state after the last action",()=>{
  class FakeEvent { constructor(type,options){this.type=type;this.bubbles=options?.bubbles===true;} }
  const labels=Array.from({length:3},(_,index)=>({textContent:`Challenge ${index+1}`}));
  const inputs=labels.map((label,index)=>({
    checked:index<2,disabled:false,closest:()=>label,dispatchEvent:()=>{},
  }));
  const nodes={
    challengeChecklist:{},templateIncludesPanel:{textContent:"Foundation"},
    moreChallenge:{textContent:"Add your own idea."},missionText:{textContent:"Build it."},
  };
  const doc={
    defaultView:{Event:FakeEvent,syncChecklists:()=>{}},
    getElementById:id=>nodes[id]||null,
    querySelectorAll:selector=>selector==="#challengeChecklist input"?inputs:[],
  };
  const steps=createMissionJourneySteps({document:doc,info:{}});
  assert.equal(steps[0].actionLabel,"I DID THIS ✓");
  assert.equal(steps[0].onAction(),true);
  const progress=steps.find(step=>step.id==="mission-progress");
  assert.match(progress.message(),/All 3 Mission checkpoints are complete/);
});

test("starting-template narration uses readable punctuation and never counts as progress",()=>{
  assert.equal(formatMissionTemplateItems([]),"");
  assert.equal(formatMissionTemplateItems(["Foundation"]),"Foundation");
  assert.equal(formatMissionTemplateItems(["Foundation","walls"]),"Foundation and walls");
  assert.equal(
    formatMissionTemplateItems(["Foundation","walls","doorway","tower markers"]),
    "Foundation, walls, doorway, and tower markers",
  );
  assert.match(source,/querySelectorAll\("#templateIncludesList li"\)/);
  assert.match(source,/querySelectorAll\("#challengeChecklist input"\)/);
});

test("autosave restoration synchronizes from restored main checkboxes instead of stale duplicates",()=>{
  assert.match(html,/function syncChecklists\(source\)[\s\S]*if\(source === "main"\)[\s\S]*floatBoxes\[index\]\.checked = box\.checked/);
  assert.match(html,/state\.checklist\[index\][\s\S]{0,180}syncChecklists\("main"\)/);
});

test("compact control is Builder-only and bootstrap installs one owner",()=>{
  assert.match(html,/body\.starterScreenActive #builderMissionJourneyButton,[\s\S]*body\.workshopMode #builderMissionJourneyButton\{display:none!important\}/);
  assert.equal((html.match(/installBobMissionJourneyGuidance\(\{guidance:controller\}\)/g)||[]).length,1);
});
