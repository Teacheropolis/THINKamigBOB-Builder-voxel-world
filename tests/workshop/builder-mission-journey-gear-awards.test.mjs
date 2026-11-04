import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
  getMissionCheckpointGearAwardId,
  installBobMissionJourneyGuidance,
} from "../../js/guidance/bob-mission-journey-guidance.mjs";
import {createThinkamigbobGearProgress} from "../../js/progression/thinkamigbob-gear-progress.mjs";

const root=new URL("../../",import.meta.url);
const html=await readFile(new URL("index.html",root),"utf8");

function createStorage({failWrites=false}={}){
  const values=new Map();
  return {
    getItem:key=>values.get(key)??null,
    setItem(key,value){if(failWrites) throw new Error("storage unavailable");values.set(key,value);},
  };
}

function createHarness({missionId="buildCastle",storage=createStorage()}={}){
  const listeners=new Map();
  const rootListeners=new Map();
  const checklist={};
  const inputs=Array.from({length:3},(_,index)=>({
    checked:false,
    disabled:index===2,
    closest:selector=>selector==="#challengeChecklist"?checklist:null,
  }));
  const button={
    textContent:"",attributes:{},
    addEventListener(type,listener){listeners.set(`button:${type}`,listener);},
    setAttribute(name,value){this.attributes[name]=value;},focus(){},
  };
  const info={};
  const rootNode={addEventListener(type,listener){rootListeners.set(type,listener);}};
  const doc={
    getElementById:id=>({builderMissionJourneyButton:button,info,bobGuidanceRoot:rootNode,challengeChecklist:checklist}[id]??null),
    querySelectorAll:selector=>selector==="#challengeChecklist input"?inputs:[],
    addEventListener(type,listener){listeners.set(`document:${type}`,listener);},
  };
  class MutationObserver {observe(){} disconnect(){}}
  const progress=createThinkamigbobGearProgress({storage,thresholds:[20,50]});
  const win={MutationObserver,selectedStartWorld:missionId};
  const guidance={start:()=>({ok:true})};
  const result=installBobMissionJourneyGuidance({
    window:win,document:doc,guidance,
    awardGears:award=>progress.award(award),
    getMissionId:()=>win.selectedStartWorld,
  });
  const change=input=>listeners.get("document:change")({target:input});
  return {result,inputs,button,progress,win,change};
}

test("stable award identity combines canonical mission and checkpoint slot",()=>{
  const input={disabled:false};
  const doc={querySelectorAll:()=>[{disabled:false},input,{disabled:true}]};
  assert.equal(
    getMissionCheckpointGearAwardId({document:doc,input,missionId:"buildDragon"}),
    "builder-mission-journey:buildDragon:checkpoint:2",
  );
  assert.equal(getMissionCheckpointGearAwardId({document:doc,input:{},missionId:"buildDragon"}),"");
  input.disabled=true;
  assert.equal(getMissionCheckpointGearAwardId({document:doc,input,missionId:"buildDragon"}),"");
});

test("enabled checkpoint completion awards 10 Gears once and publishes header state",()=>{
  const harness=createHarness();
  const snapshots=[];
  harness.progress.subscribe(snapshot=>snapshots.push(snapshot));
  harness.inputs[0].checked=true;
  harness.change(harness.inputs[0]);
  assert.equal(harness.progress.getSnapshot().cumulativeGears,10);
  assert.equal(snapshots.at(-1).cumulativeGears,10);
  harness.change(harness.inputs[0]);
  harness.inputs[0].checked=false;
  harness.change(harness.inputs[0]);
  harness.inputs[0].checked=true;
  harness.change(harness.inputs[0]);
  assert.equal(harness.progress.getSnapshot().cumulativeGears,10);
});

test("mission identity separates awards while disabled and incomplete checkpoints award nothing",()=>{
  const harness=createHarness();
  harness.change(harness.inputs[0]);
  harness.inputs[2].checked=true;
  harness.change(harness.inputs[2]);
  assert.equal(harness.progress.getSnapshot().cumulativeGears,0);
  harness.inputs[0].checked=true;
  harness.change(harness.inputs[0]);
  harness.win.selectedStartWorld="buildDragon";
  harness.change(harness.inputs[0]);
  assert.equal(harness.progress.getSnapshot().cumulativeGears,20);
  assert.deepEqual(harness.progress.getSnapshot().newlyUnlocked,[]);
});

test("reload and reprocessing preserve idempotence through persisted award IDs",()=>{
  const storage=createStorage();
  const first=createHarness({storage});
  first.inputs[1].checked=true;
  first.change(first.inputs[1]);
  const second=createHarness({storage});
  second.inputs[1].checked=true;
  second.change(second.inputs[1]);
  assert.equal(second.progress.getSnapshot().cumulativeGears,10);
});

test("Gear persistence failure fails closed without changing cumulative total",()=>{
  const harness=createHarness({storage:createStorage({failWrites:true})});
  harness.inputs[0].checked=true;
  harness.change(harness.inputs[0]);
  assert.equal(harness.progress.getSnapshot().cumulativeGears,0);
});

test("Builder header exposes only the authoritative Gear owner's award path",()=>{
  assert.equal((html.match(/window\.awardThinkamigbobGears=/g)||[]).length,1);
  assert.match(html,/window\.awardThinkamigbobGears=function\(award\)\{ return progress\.award\(award\); \}/);
  assert.match(html,/installBobMissionJourneyGuidance\(\{guidance:controller\}\)/);
});
