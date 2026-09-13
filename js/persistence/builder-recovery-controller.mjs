export const BUILDER_RECOVERY_SCHEMA="THINKamigBOB Builder Recovery";
export const BUILDER_RECOVERY_VERSION=3;
export const BUILDER_RECOVERY_KEY="thinkamigbob-builder-recoveries-v3";
export const LEGACY_RECOVERY_KEY_V1="thinkamigbob-student-autosave-v1";
export const LEGACY_RECOVERY_KEY_V2="thinkamigbob-student-autosaves-v2";

const MAX_RECORDS=250;
const MAX_BLOCKS=20000;
const MAX_TEXT=240;
const SHAPES=new Set(["cube","sphere","trianglePrism"]);

function plainObject(value){
  if(!value || typeof value!=="object" || Array.isArray(value)) return false;
  const prototype=Object.getPrototypeOf(value);
  return prototype===Object.prototype || prototype===null;
}

function safeText(value,max=MAX_TEXT){
  return typeof value==="string" && value.length<=max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
}

function finite(value){ return typeof value==="number" && Number.isFinite(value); }

function validFavorite(value){
  return plainObject(value) && safeText(value.id,120) && safeText(value.label) &&
    safeText(value.action,500);
}

function validBlock(value){
  if(!plainObject(value)) return false;
  const shape=value.shape || "cube";
  const sx=value.sx==null ? 1 : value.sx;
  const sy=value.sy==null ? 1 : value.sy;
  const sz=value.sz==null ? 1 : value.sz;
  const rotationY=value.rotationY==null ? 0 : value.rotationY;
  return [value.x,value.y,value.z,value.color,sx,sy,sz,rotationY].every(finite) &&
    Number.isInteger(value.color) && value.color>=0 && value.color<=0xffffff &&
    sx>0 && sy>0 && sz>0 && SHAPES.has(shape);
}

export function validateBuilderRecoveryState(value){
  if(!plainObject(value) || value.version!==1 || !safeText(value.selectedStartWorld,100) ||
    value.selectedStartWorld.length===0 || !Array.isArray(value.blocks) ||
    value.blocks.length>MAX_BLOCKS || !value.blocks.every(validBlock) ||
    !Array.isArray(value.favorites) || value.favorites.length>500 ||
    !value.favorites.every(validFavorite) || !Array.isArray(value.checklist) ||
    value.checklist.length>100 || !value.checklist.every(item=>typeof item==="boolean") ||
    !safeText(value.projectName || "",60) || !SHAPES.has(value.selectedShape || "cube") ||
    ![null,"moon","mars"].includes(value.selectedSpaceDestination ?? null) ||
    !["plane","rocket"].includes(value.skyVehicle || "plane") ||
    typeof value.engineeringGridVisible!=="boolean" || !finite(value.savedAt) || value.savedAt<0){
    return null;
  }
  return structuredClone(value);
}

function validId(value){ return safeText(value,120) && /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(value); }

export function validateBuilderRecoveryRecord(value){
  if(!plainObject(value) || !validId(value.recoveryId) || !validId(value.projectId) ||
    !safeText(value.missionKey,100) || !safeText(value.projectName || "",60) ||
    !finite(value.createdAt) || !finite(value.updatedAt) || value.createdAt<0 ||
    value.updatedAt<value.createdAt || !Number.isSafeInteger(value.revision) || value.revision<0 ||
    !Number.isSafeInteger(value.checkpointRevision) || value.checkpointRevision<0 ||
    value.checkpointRevision>value.revision || typeof value.dirty!=="boolean") return null;
  const state=validateBuilderRecoveryState(value.state);
  if(!state || state.selectedStartWorld!==value.missionKey) return null;
  return {...structuredClone(value),state};
}

export function validateBuilderRecoveryCollection(value){
  if(!plainObject(value) || value.schema!==BUILDER_RECOVERY_SCHEMA ||
    value.version!==BUILDER_RECOVERY_VERSION || !Array.isArray(value.records) ||
    value.records.length>MAX_RECORDS) return null;
  const records=[];
  const recoveryIds=new Set();
  const projectIds=new Set();
  for(const candidate of value.records){
    const record=validateBuilderRecoveryRecord(candidate);
    if(!record || recoveryIds.has(record.recoveryId) || projectIds.has(record.projectId)) return null;
    recoveryIds.add(record.recoveryId);
    projectIds.add(record.projectId);
    records.push(record);
  }
  return {schema:BUILDER_RECOVERY_SCHEMA,version:BUILDER_RECOVERY_VERSION,records};
}

function hashText(value){
  let hash=2166136261;
  for(let index=0;index<value.length;index++){
    hash^=value.charCodeAt(index);
    hash=Math.imul(hash,16777619);
  }
  return (hash>>>0).toString(36);
}

export function createStableBuilderRecoveryId(prefix="recovery",options={}){
  const cryptoOwner=options.crypto || globalThis.crypto;
  if(cryptoOwner && typeof cryptoOwner.randomUUID==="function") return `${prefix}:${cryptoOwner.randomUUID()}`;
  const seed=`${prefix}:${options.now ?? Date.now()}:${options.sequence ?? 0}:${options.entropy ?? "fallback"}`;
  return `${prefix}:${hashText(seed)}:${Number(options.sequence||0).toString(36)}`;
}

function parseJSON(storage,key){
  let raw;
  try{ raw=storage.getItem(key); }
  catch(error){ return {present:true,value:null,error}; }
  if(raw==null) return {present:false,value:null};
  try{ return {present:true,value:JSON.parse(raw)}; }
  catch(error){ return {present:true,value:null,error}; }
}

function legacyRecord(state,index){
  const valid=validateBuilderRecoveryState(state);
  if(!valid) return null;
  const token=hashText(`${valid.selectedStartWorld}:${valid.savedAt}:${index}`);
  return {
    recoveryId:`legacy-recovery:${token}`,
    projectId:`legacy-project:${token}`,
    missionKey:valid.selectedStartWorld,
    projectName:valid.projectName || "",
    createdAt:valid.savedAt,
    updatedAt:valid.savedAt,
    revision:1,
    checkpointRevision:0,
    dirty:true,
    state:valid
  };
}

export function collectValidLegacyBuilderRecoveries(storage){
  const records=[];
  const seen=new Set();
  const v2=parseJSON(storage,LEGACY_RECOVERY_KEY_V2);
  if(v2.present && plainObject(v2.value) && v2.value.version===2 && plainObject(v2.value.builds)){
    Object.keys(v2.value.builds).sort().forEach((key,index)=>{
      const state=v2.value.builds[key];
      if(state && state.selectedStartWorld===key){
        const record=legacyRecord(state,index);
        if(record && !seen.has(record.recoveryId)){ records.push(record); seen.add(record.recoveryId); }
      }
    });
  }
  const v1=parseJSON(storage,LEGACY_RECOVERY_KEY_V1);
  const record=legacyRecord(v1.value,records.length);
  if(record && !seen.has(record.recoveryId)) records.push(record);
  return records;
}

export function createBuilderRecoveryController(options={}){
  const storage=options.storage;
  if(!storage) throw new TypeError("Builder recovery requires a storage owner.");
  const now=typeof options.now==="function" ? options.now : ()=>Date.now();
  const setTimer=options.setTimeout || globalThis.setTimeout;
  const clearTimer=options.clearTimeout || globalThis.clearTimeout;
  const debounceMs=Number.isFinite(options.debounceMs) ? Math.max(0,options.debounceMs) : 700;
  const capture=options.capture;
  const restore=options.restore;
  const onStatus=typeof options.onStatus==="function" ? options.onStatus : ()=>{};
  const onChange=typeof options.onChange==="function" ? options.onChange : ()=>{};
  let timer=0;
  let sequence=0;
  let activeRecoveryId="";
  let pendingMeaningful=false;
  let writable=true;
  let collection={schema:BUILDER_RECOVERY_SCHEMA,version:BUILDER_RECOVERY_VERSION,records:[]};

  function status(kind,message,timestamp=null){ onStatus(Object.freeze({kind,message,timestamp})); }
  function persist(candidate){
    const serialized=JSON.stringify(candidate);
    storage.setItem(BUILDER_RECOVERY_KEY,serialized);
    if(storage.getItem(BUILDER_RECOVERY_KEY)!==serialized) throw new Error("Builder recovery write could not be verified.");
  }
  function initialize(){
    const current=parseJSON(storage,BUILDER_RECOVERY_KEY);
    if(current.present){
      const validated=validateBuilderRecoveryCollection(current.value);
      if(!validated){ writable=false; status("failed","Recovery Failed"); return false; }
      collection=validated;
    }else{
      const migrated=collectValidLegacyBuilderRecoveries(storage);
      if(migrated.length){
        const candidate=validateBuilderRecoveryCollection({...collection,records:migrated});
        if(!candidate){ writable=false; status("failed","Recovery Failed"); return false; }
        try{ persist(candidate); collection=candidate; }
        catch(error){ writable=false; status("failed","Recovery Failed"); return false; }
      }
    }
    onChange(snapshot());
    return true;
  }
  function snapshot(){
    return Object.freeze({activeRecoveryId,records:collection.records.map(record=>Object.freeze(structuredClone(record)))});
  }
  function beginProject(details={}){
    const missionKey=String(details.missionKey || "buildCastle");
    const projectName=String(details.projectName || "").trim().slice(0,60);
    const timestamp=now();
    const projectIds=new Set(collection.records.map(record=>record.projectId));
    const recoveryIds=new Set(collection.records.map(record=>record.recoveryId));
    let projectId=validId(details.projectId) && !projectIds.has(details.projectId) ? details.projectId : "";
    let recoveryId=validId(details.recoveryId) && !recoveryIds.has(details.recoveryId) ? details.recoveryId : "";
    while(!projectId || projectIds.has(projectId)){
      projectId=createStableBuilderRecoveryId("project",{now:timestamp,sequence:sequence++});
    }
    while(!recoveryId || recoveryIds.has(recoveryId)){
      recoveryId=createStableBuilderRecoveryId("recovery",{now:timestamp,sequence:sequence++});
    }
    activeRecoveryId=recoveryId;
    collection.records.push({
      recoveryId:activeRecoveryId,projectId,missionKey,projectName,
      createdAt:timestamp,updatedAt:timestamp,revision:0,checkpointRevision:0,dirty:false,state:null
    });
    return Object.freeze({activeRecoveryId,projectId});
  }
  function useRecovery(recoveryId){
    const record=collection.records.find(item=>item.recoveryId===recoveryId);
    if(!record) return false;
    activeRecoveryId=recoveryId;
    onChange(snapshot());
    return true;
  }
  function schedule({meaningful=true}={}){
    if(!writable){ status("failed","Recovery Failed"); return false; }
    pendingMeaningful=pendingMeaningful || !!meaningful;
    status("saving","Saving…");
    if(timer) clearTimer(timer);
    timer=setTimer(()=>{ timer=0; flush(); },debounceMs);
    return true;
  }
  function flush({feedback=true}={}){
    if(timer){ clearTimer(timer); timer=0; }
    if(!writable){ status("failed","Recovery Failed"); return false; }
    if(typeof capture!=="function") return false;
    let state;
    try{ state=validateBuilderRecoveryState(capture()); }
    catch(error){ state=null; }
    if(!state){ status("failed","Recovery Failed"); return false; }
    let existing=collection.records.find(item=>item.recoveryId===activeRecoveryId);
    if(!existing){
      beginProject({missionKey:state.selectedStartWorld,projectName:state.projectName});
      existing=collection.records.find(item=>item.recoveryId===activeRecoveryId);
    }
    const timestamp=now();
    const revision=existing.revision+(pendingMeaningful ? 1 : 0);
    const updated={...existing,
      missionKey:state.selectedStartWorld,projectName:state.projectName,
      updatedAt:timestamp,revision,
      dirty:pendingMeaningful ? true : existing.dirty,
      state:{...state,savedAt:timestamp}
    };
    const candidate={...collection,records:collection.records.map(item=>item.recoveryId===activeRecoveryId ? updated : item)};
    const validated=validateBuilderRecoveryCollection(candidate);
    if(!validated){ status("failed","Recovery Failed"); return false; }
    try{ persist(validated); }
    catch(error){ status("failed","Recovery Failed"); return false; }
    collection=validated;
    pendingMeaningful=false;
    if(feedback) status("saved","Recovery Saved",timestamp);
    onChange(snapshot());
    return true;
  }
  function markManualSaveCheckpoint(){
    if(!writable){ status("failed","Recovery Failed"); return false; }
    let index=collection.records.findIndex(item=>item.recoveryId===activeRecoveryId);
    if(index<0){
      if(!flush({feedback:true})) return false;
      index=collection.records.findIndex(item=>item.recoveryId===activeRecoveryId);
      if(index<0) return false;
    }
    const candidate=structuredClone(collection);
    candidate.records[index].checkpointRevision=candidate.records[index].revision;
    candidate.records[index].dirty=false;
    const validated=validateBuilderRecoveryCollection(candidate);
    if(!validated){ status("failed","Recovery Failed"); return false; }
    try{ persist(validated); collection=validated; }
    catch(error){ status("failed","Recovery Failed"); return false; }
    onChange(snapshot());
    return true;
  }
  function restoreRecovery(recoveryId){
    const record=collection.records.find(item=>item.recoveryId===recoveryId);
    const valid=validateBuilderRecoveryRecord(record);
    if(!valid || typeof restore!=="function") return false;
    if(restore(structuredClone(valid.state),Object.freeze({...valid,state:undefined}))===false) return false;
    activeRecoveryId=recoveryId;
    onChange(snapshot());
    return true;
  }
  function list(){
    return collection.records.filter(record=>record.state).slice().sort((a,b)=>b.updatedAt-a.updatedAt)
      .map(record=>Object.freeze(structuredClone(record)));
  }
  function dispose(){ if(timer) clearTimer(timer); timer=0; }

  return Object.freeze({initialize,beginProject,useRecovery,schedule,flush,markManualSaveCheckpoint,restoreRecovery,list,snapshot,dispose});
}
