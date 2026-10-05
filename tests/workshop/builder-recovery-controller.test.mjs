import test from "node:test";
import assert from "node:assert/strict";
import {
  BUILDER_RECOVERY_KEY,
  LEGACY_RECOVERY_KEY_V1,
  LEGACY_RECOVERY_KEY_V2,
  createBuilderRecoveryController,
  createStableBuilderRecoveryId,
  validateBuilderRecoveryCollection,
  validateBuilderRecoveryState
} from "../../js/persistence/builder-recovery-controller.mjs";

class MemoryStorage{
  constructor(initial={}){ this.values=new Map(Object.entries(initial)); this.failWrites=false; }
  getItem(key){ return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key,value){ if(this.failWrites) throw new Error("quota"); this.values.set(key,String(value)); }
}

function state(overrides={}){
  return {
    version:1,selectedStartWorld:"buildCastle",projectName:"Castle Lab",savedAt:100,
    blocks:[{shape:"cube",x:0,y:0.5,z:0,color:0xffffff,sx:1,sy:1,sz:1,rotationY:0}],
    favorites:[{id:"favorite-1",label:"Tower",action:"placeTower"}],
    checklist:[true,false],selectedShape:"cube",selectedSpaceDestination:null,
    skyVehicle:"plane",engineeringGridVisible:true,...overrides
  };
}

function harness({storage=new MemoryStorage(),clock={value:1000},debounceMs=50}={}){
  let current=state();
  const statuses=[];
  const timers=[];
  const controller=createBuilderRecoveryController({storage,now:()=>clock.value,debounceMs,
    capture:()=>structuredClone(current),restore:value=>{ current=value; },
    onStatus:value=>statuses.push(value),setTimeout:fn=>{ timers.push(fn); return timers.length; },clearTimeout:()=>{}});
  return {controller,storage,clock,statuses,timers,get current(){ return current; },set current(value){ current=value; }};
}

test("deep validation rejects unsupported and nonfinite Builder state",()=>{
  assert.ok(validateBuilderRecoveryState(state()));
  assert.equal(validateBuilderRecoveryState(state({selectedShape:"cylinder"})),null);
  assert.equal(validateBuilderRecoveryState(state({blocks:[{shape:"cube",x:NaN,y:0,z:0,color:1}]})),null);
  assert.equal(validateBuilderRecoveryState(state({favorites:[{id:"x",label:"x",action:7}]})),null);
});

test("fallback identities are stable for inputs and distinct by sequence",()=>{
  const noUuid={};
  assert.equal(createStableBuilderRecoveryId("project",{crypto:noUuid,now:10,sequence:1,entropy:"x"}),
    createStableBuilderRecoveryId("project",{crypto:noUuid,now:10,sequence:1,entropy:"x"}));
  assert.notEqual(createStableBuilderRecoveryId("project",{crypto:noUuid,now:10,sequence:1}),
    createStableBuilderRecoveryId("project",{crypto:noUuid,now:10,sequence:2}));
});

test("multiple recovered projects in one mission retain distinct identities",()=>{
  const h=harness();
  assert.equal(h.controller.initialize(),true);
  h.controller.beginProject({missionKey:"buildCastle",projectName:"North Tower"});
  h.controller.schedule({meaningful:true});
  assert.equal(h.controller.flush(),true);
  h.clock.value++;
  h.current=state({projectName:"South Tower"});
  h.controller.beginProject({missionKey:"buildCastle",projectName:"South Tower"});
  h.controller.schedule({meaningful:true});
  assert.equal(h.controller.flush(),true);
  const records=h.controller.list();
  assert.equal(records.length,2);
  assert.equal(new Set(records.map(item=>item.projectId)).size,2);
  assert.equal(new Set(records.map(item=>item.recoveryId)).size,2);
});

test("valid legacy v1 and v2 recoveries migrate without deleting their originals",()=>{
  const legacyOne=state({selectedStartWorld:"buildPlayground",projectName:"Play",savedAt:10});
  const legacyTwo=state({selectedStartWorld:"buildCastle",projectName:"Castle",savedAt:20});
  const storage=new MemoryStorage({
    [LEGACY_RECOVERY_KEY_V1]:JSON.stringify(legacyOne),
    [LEGACY_RECOVERY_KEY_V2]:JSON.stringify({version:2,builds:{buildCastle:legacyTwo}})
  });
  const h=harness({storage});
  assert.equal(h.controller.initialize(),true);
  assert.equal(h.controller.list().length,2);
  assert.ok(storage.getItem(LEGACY_RECOVERY_KEY_V1));
  assert.ok(storage.getItem(LEGACY_RECOVERY_KEY_V2));
  assert.ok(validateBuilderRecoveryCollection(JSON.parse(storage.getItem(BUILDER_RECOVERY_KEY))));
});

test("invalid current recovery data fails closed without overwrite",()=>{
  const original=JSON.stringify({schema:"newer-data",version:99,records:[]});
  const storage=new MemoryStorage({[BUILDER_RECOVERY_KEY]:original});
  const h=harness({storage});
  assert.equal(h.controller.initialize(),false);
  assert.equal(h.controller.schedule({meaningful:true}),false);
  assert.equal(storage.getItem(BUILDER_RECOVERY_KEY),original);
  assert.equal(h.statuses.at(-1).message,"Recovery Failed");
});

test("failed writes never announce recovery success and remain retryable",()=>{
  const h=harness();
  h.controller.initialize();
  h.controller.beginProject({missionKey:"buildCastle"});
  h.controller.schedule({meaningful:true});
  h.storage.failWrites=true;
  assert.equal(h.controller.flush(),false);
  assert.equal(h.statuses.at(-1).message,"Recovery Failed");
  assert.equal(h.statuses.some(item=>item.message==="Recovery Saved"),false);
  h.storage.failWrites=false;
  assert.equal(h.controller.flush(),true);
  assert.equal(h.controller.list()[0].dirty,true);
});

test("meaningful changes are dirty, nonmeaningful sync is not, and manual Save creates a separate checkpoint",()=>{
  const h=harness();
  h.controller.initialize();
  h.controller.beginProject({missionKey:"buildCastle"});
  h.controller.schedule({meaningful:false});
  h.controller.flush();
  assert.equal(h.controller.list()[0].dirty,false);
  h.controller.schedule({meaningful:true});
  h.controller.flush();
  assert.equal(h.controller.list()[0].dirty,true);
  assert.equal(h.controller.markManualSaveCheckpoint(),true);
  const saved=h.controller.list()[0];
  assert.equal(saved.dirty,false);
  assert.equal(saved.checkpointRevision,saved.revision);
});

test("debounced recovery can be flushed immediately and reports timestamped success",()=>{
  const h=harness();
  h.controller.initialize();
  h.controller.beginProject({missionKey:"buildCastle"});
  assert.equal(h.controller.schedule({meaningful:true}),true);
  assert.equal(h.statuses.at(-1).message,"Saving…");
  assert.equal(h.controller.flush(),true);
  assert.equal(h.statuses.at(-1).message,"Recovery Saved");
  assert.equal(h.statuses.at(-1).timestamp,1000);
});

test("reload and next-day recovery retains exact validated project metadata",()=>{
  const storage=new MemoryStorage();
  const first=harness({storage,clock:{value:1000}});
  first.controller.initialize();
  first.current=state({projectName:"Day One"});
  first.controller.beginProject({missionKey:"buildCastle",projectName:"Day One"});
  first.controller.schedule({meaningful:true});
  first.controller.flush();
  const nextDay=harness({storage,clock:{value:86401000}});
  assert.equal(nextDay.controller.initialize(),true);
  const recovered=nextDay.controller.list()[0];
  assert.equal(recovered.projectName,"Day One");
  assert.equal(recovered.missionKey,"buildCastle");
  assert.equal(recovered.updatedAt,1000);
  assert.deepEqual(recovered.state.blocks,state().blocks);
});
