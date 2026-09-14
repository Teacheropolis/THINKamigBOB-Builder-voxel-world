const SEQUENCE_ID="builder-mission-journey";
const CHECKPOINT_GEAR_AWARD=10;

function enabledCheckpoints(doc){
  return Array.from(doc.querySelectorAll("#challengeChecklist input")).filter(input=>!input.disabled);
}

function cleanText(node,fallback){
  const text=String(node?.textContent||"").replace(/\s+/g," ").trim();
  return text || fallback;
}

export function formatMissionTemplateItems(items=[]){
  const clean=items.map(item=>String(item||"").replace(/\s+/g," ").trim()).filter(Boolean);
  if(clean.length===0) return "";
  if(clean.length===1) return clean[0];
  if(clean.length===2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0,-1).join(", ")}, and ${clean.at(-1)}`;
}

export function setMissionCheckpointComplete(input,complete,{window:win=globalThis.window}={}){
  if(!input || input.disabled) return false;
  input.checked=!!complete;
  win?.syncChecklists?.("main");
  input.dispatchEvent(new win.Event("change",{bubbles:true}));
  return true;
}

export function getMissionJourneyProgress(doc=globalThis.document){
  const checkpoints=enabledCheckpoints(doc);
  const complete=checkpoints.filter(input=>input.checked).length;
  return Object.freeze({complete,total:checkpoints.length});
}

export function getMissionCheckpointGearAwardId({
  document:doc=globalThis.document,
  input,
  missionId="buildCastle",
}={}){
  if(!doc || !input || input.disabled) return "";
  const checkpoints=Array.from(doc.querySelectorAll("#challengeChecklist input"));
  const checkpointIndex=checkpoints.indexOf(input);
  const stableMissionId=String(missionId||"").trim();
  if(checkpointIndex<0 || !stableMissionId) return "";
  return `builder-mission-journey:${stableMissionId}:checkpoint:${checkpointIndex+1}`;
}

export function revealMissionJourney(info,{section="summary"}={}){
  info.classList.add("bobGuidanceChallengeReveal");
  info.dataset.bobMissionJourneySection=section;
  return ()=>{
    info.classList.remove("bobGuidanceChallengeReveal","bobGuidanceChallengeTemplateReveal");
    delete info.dataset.bobMissionJourneySection;
  };
}

function progressLabel(progress){
  return `MISSION JOURNEY — ${progress.complete} OF ${progress.total}`;
}

export function createMissionJourneySteps({document:doc=globalThis.document,info}={}){
  const checklist=doc.getElementById("challengeChecklist");
  const template=doc.getElementById("templateIncludesPanel");
  const more=doc.getElementById("moreChallenge");
  const progress=getMissionJourneyProgress(doc);
  const mission=cleanText(doc.getElementById("missionText"),"Review your current STEM mission.");
  const templateItems=Array.from(doc.querySelectorAll("#templateIncludesList li")).map(item=>cleanText(item,""));
  const formattedTemplate=formatMissionTemplateItems(templateItems);
  const templateSummary=formattedTemplate
    ? `Your starting template includes ${formattedTemplate}.`
    : cleanText(template,"Review the parts already waiting in your starting build.");
  const moreChallenge=cleanText(more,"Add your own creative engineering idea.");
  const checkpoints=enabledCheckpoints(doc);
  const incomplete=checkpoints.filter(input=>!input.checked);
  const completed=checkpoints.filter(input=>input.checked);
  const checkpointSteps=[...incomplete,...completed].map((input,index)=>{
    const label=input.closest("label");
    const wasComplete=input.checked;
    return {
      id:`mission-checkpoint-${index+1}`,target:label,title:wasComplete?"Completed Challenge":"Your Next Challenge",
      message:cleanText(label,"Complete this Mission challenge."),
      amigCategory:wasComplete?"Review your work":"Improve it",placement:"top",back:index!==0,
      showMe:true,actionLabel:wasComplete?"MARK NOT DONE":"I DID THIS ✓",guidanceType:"display",
      onAction:()=>setMissionCheckpointComplete(input,!wasComplete,{window:doc.defaultView||globalThis.window}),
      nextLabel:index<checkpoints.length-1?"NEXT CHALLENGE":"REVIEW MISSION",
      reveal:()=>revealMissionJourney(info,{section:"checkpoints"}),
    };
  });
  const progressStep={
    id:"mission-progress",target:"#builderMissionJourneyButton",title:"Mission Progress",
    message:()=>{
      const current=getMissionJourneyProgress(doc);
      return current.total && current.complete===current.total
        ? `All ${current.total} Mission checkpoints are complete. You can review or correct any challenge.`
        : `${current.complete} of ${current.total} Mission checkpoints are complete. Your Mission Journey updates as soon as you finish each challenge.`;
    },
    amigCategory:"Your progress",placement:"top",back:checkpointSteps.length>0,showMe:false,nextLabel:"REVIEW MISSION",
  };
  const reviewSteps=[
    {id:"mission-summary",target:info,title:"Mission Summary",message:mission,amigCategory:"Review",placement:"top",showMe:false,reveal:()=>revealMissionJourney(info,{section:"summary"})},
    {id:"starting-template",target:template,title:"Starting Template",message:templateSummary,amigCategory:"Review",placement:"top",showMe:false,reveal:()=>revealMissionJourney(info,{section:"template"})},
    {id:"more-challenge",target:more,title:"Want More Challenge?",message:moreChallenge,amigCategory:"Grow what you know",placement:"top",showMe:false,nextLabel:"BACK TO BUILD",reveal:()=>revealMissionJourney(info,{section:"more"})},
  ];
  return checkpointSteps.length ? [...checkpointSteps,progressStep,...reviewSteps] : [progressStep,...reviewSteps];
}

export function installBobMissionJourneyGuidance({
  window:win=globalThis.window,
  document:doc=globalThis.document,
  guidance=win?.bobGuidance,
  awardGears=win?.awardThinkamigbobGears,
  getMissionId=()=>String(win?.selectedStartWorld||"buildCastle"),
}={}){
  const button=doc?.getElementById("builderMissionJourneyButton");
  const info=doc?.getElementById("info");
  const root=doc?.getElementById("bobGuidanceRoot");
  if(!win||!doc||!guidance||!button||!info||!root) return Object.freeze({ok:false,code:"MISSING_OWNER"});

  const update=()=>{
    const progress=getMissionJourneyProgress(doc);
    button.textContent=progressLabel(progress);
    button.setAttribute("aria-label",`${progress.complete} of ${progress.total} Mission checkpoints complete. Open Mission Journey.`);
  };
  const open=()=>guidance.start({id:SEQUENCE_ID,steps:createMissionJourneySteps({document:doc,info})});

  button.addEventListener("click",open);
  doc.addEventListener("change",event=>{
    const input=event.target;
    if(!input?.closest?.("#challengeChecklist")) return;
    if(!input.disabled && input.checked && typeof awardGears==="function"){
      const id=getMissionCheckpointGearAwardId({document:doc,input,missionId:getMissionId()});
      if(id) awardGears({id,gears:CHECKPOINT_GEAR_AWARD});
    }
    update();
  });
  const observer=new win.MutationObserver(update);
  observer.observe(info,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["disabled","checked"]});
  root.addEventListener("bobguidance:complete",event=>{
    if(event.detail?.sequenceId===SEQUENCE_ID) button.focus({preventScroll:true});
  });
  root.addEventListener("bobguidance:cancel",event=>{
    if(event.detail?.sequenceId===SEQUENCE_ID) button.focus({preventScroll:true});
  });
  update();
  return Object.freeze({ok:true,update,open,destroy:()=>observer.disconnect()});
}
