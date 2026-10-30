import {nextWorldChallenge,toggleWorldPanel} from './builder-world-view-model.mjs';
import {setMissionCheckpointComplete} from '../guidance/bob-mission-journey-guidance.mjs';

const doc=document,win=window;
const root=doc.createElement('div');root.id='builderWorldView';
root.innerHTML=`
<nav id="worldDock" class="worldUI" aria-label="Builder toolkit">
 <button type="button" data-world-panel="blocks" aria-controls="builderWorldDrawer" aria-expanded="false"><span class="worldDockIcon" aria-hidden="true">🧱</span>Blocks</button>
 <button type="button" data-world-panel="tools" aria-controls="builderWorldDrawer" aria-expanded="false"><span class="worldDockIcon" aria-hidden="true">🛠</span>Tools</button>
 <button type="button" data-world-panel="build" aria-controls="builderWorldDrawer" aria-expanded="false"><span class="worldDockIcon" aria-hidden="true">📁</span>My Build</button>
</nav>
<section id="builderWorldDrawer" class="worldUI" aria-labelledby="worldDrawerTitle" hidden>
 <div class="worldDrawerHeading"><h2 id="worldDrawerTitle">Blocks</h2><button type="button" id="worldCloseDrawer" aria-label="Close tools drawer">✕</button></div>
 <div class="worldDrawerBody">
  <section id="worldBlocksPanel" hidden><div id="worldShapeMount"></div><button type="button" id="worldDoorShortcut">🚪 Add a door</button><button type="button" id="worldObjectsShortcut">📦 Objects &amp; ideas</button></section>
  <section id="worldColorsPanel" hidden><div id="worldPaletteMount"></div></section>
  <section id="worldToolsPanel" hidden><p id="worldSelectionSummary" role="status">0 blocks selected</p><div id="worldBuildToolsMount"></div><div class="worldActionGrid"><button type="button" id="worldMultiSelect" aria-pressed="false">Select multiple</button><button type="button" id="worldClearSelection">Clear selection</button><button type="button" id="worldDuplicate">Duplicate</button></div><p>Click a block to select it. Use Select multiple or Shift-click to add blocks. Drag a box around visible blocks, then drag the selection to move it. Escape clears selection.</p><h3>Fix and finish</h3><div id="worldUtilitiesMount"></div></section>
  <section id="worldBuildPanel" hidden><div id="worldProjectActions" class="worldActionGrid"></div><label class="worldSkyLabel" for="worldSkyFlyer">Sky flyer</label><select id="worldSkyFlyer"><option value="off">Off — clear sky</option><option value="blimp">Blimp</option><option value="plane">Plane</option><option value="glider">Glider</option><option value="parachute">Parachute</option></select><h3>Your world</h3><div id="worldNavigationActions" class="worldActionGrid"></div><div id="worldMissionMount"></div></section>
  <section id="worldProgressPanel" hidden><h3>Go somewhere</h3><div id="worldSettingsActions" class="worldActionGrid"></div><h3>Automatic saving</h3><div id="worldSaveStatusMount"></div><p>Build changes save automatically in this browser on this device. Find them under Resume on the mission page.</p><p>Use Save my build for a file you can keep, share, or open on another device. Use Save Story to keep editable scenes on your computer, and Open Story to continue later. Download GIF makes a copy to share.</p><button type="button" id="worldSettingsSave">Save my build to a file</button><h3>Your progress</h3><div id="worldProgressMount"></div><button type="button" id="worldReviewBadges">See my badges</button></section>
 </div>
</section>
<nav id="worldCameraNav" class="worldUI" aria-label="View and board position"><div id="worldViewActions"></div><div id="worldPositionActions"></div><div id="worldHistoryActions"></div></nav>
<aside id="worldChallengeCard" class="worldUI" aria-labelledby="worldChallengeTitle">
 <div class="worldChallengeHeader"><div><h2 id="worldChallengeTitle">Your next challenge</h2><p id="worldChallengeProgress"></p></div><button type="button" id="worldToggleChallenge" aria-expanded="true" aria-controls="worldChallengeBody" aria-label="Hide challenge">⌃</button></div>
 <div id="worldChallengeBody"><p id="worldChallengeText"></p><div class="worldChallengeActions"><button type="button" id="worldChallengeHear">🔊 Hear It</button><button type="button" id="worldChallengeShow">Show Me</button><button type="button" id="worldChallengeDone">✓ Done</button></div><button type="button" id="worldFullMission">See the full mission →</button></div>
</aside>
<button id="worldBobButton" class="worldUI" type="button" aria-label="Ask BOB for help" aria-controls="worldBobDrawer" aria-expanded="false"><span class="worldBobPortrait" aria-hidden="true"></span><span>Ask BOB</span></button>
<div id="worldBobHint" class="worldUI">Need a building tip?</div>
<section id="worldBobDrawer" class="worldUI" aria-labelledby="worldBobTitle" hidden>
 <div class="worldDrawerHeading"><h2 id="worldBobTitle">Hi! Let’s build.</h2><button type="button" id="worldCloseBob" aria-label="Close BOB help">✕</button></div>
 <p id="worldBobTip">Try one idea. Make one change. See what happens!</p><div class="worldBobQuickActions"><button type="button" id="worldBobHintAction">Give me a hint</button><button type="button" id="worldBobReadAction">Read my challenge</button></div><div id="worldBobControlsMount"></div>
</section>
<div id="worldStatusToast" class="worldUI" role="status" aria-live="polite" hidden></div>`;
doc.body.append(root);
root.querySelector('#worldSkyFlyer').addEventListener('change',event=>{try{localStorage.setItem('thinkamigbob-sky-flyer',event.target.value);}catch{}win.setSkyBannerVehicle?.(event.target.value);});
win.setSkyBannerVehicle?.('off');
const $=id=>doc.getElementById(id);
let panel=null,focusOwner=null,closingFromCanvas=false,challenge=null,installed=false,guideRequested=false,toastTimer=0;
const isBuilding=()=>!doc.body.classList.contains('starterScreenActive')&&!doc.body.classList.contains('workshopMode')&&!win.builderExploreActive;
const launchers=()=>[...root.querySelectorAll('[data-world-panel]'),$('worldBobButton'),$('worldProgressButton')].filter(Boolean);
const titles={blocks:'Choose your blocks',tools:'Your tools',build:'My Build',progress:'Settings & progress',colors:'More block colors'};
function syncCanvasOwner(){win.builderWorldUIBlocksCanvas=!!panel||closingFromCanvas;}
function showPanel(next,owner){
 panel=next;root.dataset.openPanel=panel||'';if(owner)focusOwner=owner;
 $('builderWorldDrawer').hidden=!panel||panel==='bob';$('worldBobDrawer').hidden=panel!=='bob';
 for(const key of ['blocks','tools','build','progress','colors'])$('world'+key[0].toUpperCase()+key.slice(1)+'Panel').hidden=panel!==key;
 $('worldDrawerTitle').textContent=titles[panel]||'Your tools';
 doc.body.classList.toggle('worldDrawerOpen',!!panel);$('worldBobHint').hidden=panel==='bob';
 launchers().forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.worldPanel===panel || (button.id==='worldBobButton'&&panel==='bob') || (button.id==='worldProgressButton'&&panel==='progress'))));
 const palette=$('builderMoreBlocks');if(palette)palette.hidden=panel!=='colors';
 $('builderOpenMoreBlocks')?.setAttribute('aria-expanded',String(panel==='colors'));
 if(panel==='bob')prepareBobText();
 syncCanvasOwner();
}
function closePanel(restore=false){showPanel(null);if(restore)focusOwner?.focus({preventScroll:true});}
function toggle(panelName,owner){showPanel(toggleWorldPanel(panel,panelName),owner);}
function prepareBobText(){
 const welcome=$('thinkerBobPanel');
 [...welcome?.children||[]].filter(node=>node.id!=='readerHighlightBox' && /Welcome, Builder|I.m THINKer BOB|Think.*Build.*Discover/.test(node.textContent)).forEach(node=>node.dataset.worldWelcome='true');
 const reader=$('audioPowerLabel');if(reader)for(const node of reader.childNodes)if(node.nodeType===3&&node.textContent.trim())node.textContent=' Read aloud';
}
function restoreSharedControls(){
 const status=$('builderRecoveryStatus'),statusMount=$('worldSaveStatusMount');if(status&&statusMount&&status.parentElement!==statusMount)statusMount.append(status);
 const project=$('worldProjectActions');for(const id of ['builderSaveButton','builderOpenButton']){const button=$(id);if(project&&button&&button.parentElement!==project)project.append(button);}
 const history=$('worldHistoryActions');for(const id of ['undoButton','redoButton']){const button=$(id);if(history&&button&&button.parentElement!==history)history.append(button);}
 const holder=$('worldUtilitiesMount')?.querySelector('.dashboardUtilityButtons'),help=$('helpButton');
 if(holder&&help&&help.parentElement!==holder)holder.append(help);
}
function closeObjectLibrary(){
 const toolbox=$('toolbox');if(toolbox)toolbox.style.setProperty('display','none','important');
 $('floatingToolbox')?.classList.remove('objectLibraryOpen');$('toolboxButton')?.setAttribute('aria-expanded','false');
}

function say(message){
 const toast=$('worldStatusToast');toast.textContent=message;toast.hidden=false;win.clearTimeout(toastTimer);
 toastTimer=win.setTimeout(()=>{toast.hidden=true;},2800);
}
function model(){
 const checkpoints=[...doc.querySelectorAll('#challengeChecklist input')].map(input=>({input,disabled:input.disabled,complete:input.checked,text:input.closest('label')?.textContent.replace(/\s+/g,' ').trim()||''}));
 return nextWorldChallenge(checkpoints);
}
function renderChallenge(){
 const result=model();challenge=result.next;
 if($('worldChallengeText').textContent!==result.text)$('worldChallengeText').textContent=result.text;
 $('worldChallengeProgress').textContent=result.total?`${result.complete} of ${result.total} complete`:'Make it your own';
 $('worldChallengeDone').hidden=!result.next;
}
function readChallenge(){
 if($('audioPowerToggle')?.checked===false){showPanel('bob',$('worldBobButton'));$('worldBobTip').textContent='Turn on Read aloud below, then choose Read my challenge.';return;}
 const text=model().text;
 if(typeof win.speakInfoOnly==='function')win.speakInfoOnly(text,'thinkerBob');else win.speakText?.(text,0,'thinkerBob');
}
function fullMission(){
 guideRequested=true;showPanel('build',$('worldFullMission'));$('builderMissionJourneyButton')?.click();
}
function action(caption,handler){const button=doc.createElement('button');button.type='button';button.textContent=caption;button.addEventListener('click',handler);return button;}
function proxy(caption,id){return action(caption,()=>{closePanel();$(id)?.click();});}
function updateProjectName(){
 const name=typeof builderProjectName==='string'&&builderProjectName.trim()?builderProjectName.trim():$('worldTitle')?.textContent.replace(/[🏰🧬🏗️🌕🌳]/gu,'').replace(/THINKamigBOB\s*/gi,'').replace(/\s+/g,' ').trim()||'My build';
 const field=$('worldProjectName');if(field&&field.textContent!==name){field.textContent=name;field.title=name;}
 const progress=win.getThinkamigbobGearProgressSnapshot?.();
 if(progress)$('worldProgressButton').setAttribute('aria-label','Settings and progress: '+(progress.totalGears??progress.total??0)+' gears');
}
function install(){
 if(installed)return true;
 const tools=$('builderRightToolsPanel'),bob=$('builderBobRightPanel'),header=$('builderGuidedCadHeader');
 const shapes=doc.querySelector('.dashboard139ShapeZone'),buildTools=doc.querySelector('.dashboard139BuildZone'),utilities=doc.querySelector('.dashboard139UtilityZone');
 const palette=$('builderMoreBlocks'),mission=$('builderMissionJourneyButton'),save=$('builderSaveButton'),open=$('builderOpenButton');
 if(!tools||!bob||!header||!shapes||!buildTools||!utilities||!palette||!mission||!save||!open||!$('builderChooseDoor')||!$('builderGearTotal')||!$('builderNextWorkshopUpgrade'))return false;
 installed=true;
 $('worldShapeMount').append(shapes);$('worldPaletteMount').append(palette);
 for(const [zone,label] of [[shapes,'Choose a shape'],[buildTools,'Move and change']]){const heading=zone.querySelector('.dashboard139ZoneLabel');if(heading){heading.className='worldSectionLabel';heading.textContent=label;}}
 const utilityLabel=utilities.querySelector('.dashboard139ZoneLabel');if(utilityLabel)utilityLabel.hidden=true;
 $('worldBuildToolsMount').append(buildTools);$('worldUtilitiesMount').append(utilities);
 save.textContent='Save my build';open.textContent='Open a build';$('worldProjectActions').append(save,open);
 $('worldSettingsActions').append(proxy('Open Workshop','workspaceModeSwitch'),proxy('Open a saved mission','builderOpenButton'),proxy('Choose a different mission','returnMissionsButton'),action('Open a saved story',()=>{closePanel();win.openBuilderStoryMaker?.();}));
 $('worldNavigationActions').append(proxy('My badges','badgeMessage'),proxy('My passport','openPassportFromBadge'),proxy('Go to Workshop','workspaceModeSwitch'),proxy('Choose a mission','returnMissionsButton'));
 $('worldMissionMount').append(mission);
 $('worldProgressMount').append($('builderGearTotal'),$('builderNextWorkshopUpgrade'));
 $('worldBobControlsMount').append(bob);
 [...$('thinkerBobPanel')?.children||[]].filter(node=>/Welcome, Builder|I.m THINKer BOB|Think.*Build.*Discover/.test(node.textContent)).forEach(node=>node.dataset.worldWelcome='true');
 const reader=$('audioPowerLabel');if(reader)for(const node of reader.childNodes)if(node.nodeType===3&&node.textContent.trim())node.textContent=' Read aloud';
 const brand=$('builderGuidedCadBrand');const project=doc.createElement('span');project.id='worldProjectName';header.append(project);
 const gear=action('⚙',()=>toggle('progress',gear));gear.id='worldProgressButton';gear.setAttribute('aria-label','Open Settings and progress');gear.setAttribute('aria-controls','builderWorldDrawer');gear.setAttribute('aria-expanded','false');header.append(gear);
 const undo=$('undoButton');if(undo){undo.innerHTML='↶ Undo<small>Fix a mistake</small>';undo.setAttribute('aria-label','Undo — Fix a mistake');}
 const redo=$('redoButton');if(redo)redo.textContent='↷ Redo';
 for(const [name,view]of [['Home view','home'],['From above','top'],['Front view','front'],['Right side','right']])$('worldViewActions').append(action(name,()=>{win.requestViewDicePreset?.(view);closePanel();}));
 for(const [label,change]of [['↶ Turn',()=>cameraAngle-=0.22],['Turn ↷',()=>cameraAngle+=0.22],['↑ Raise view',()=>cameraHeight=Math.min(30,cameraHeight+2)],['↓ Lower view',()=>cameraHeight=Math.max(2,cameraHeight-2)],['＋ Zoom in',()=>cameraDistance=Math.max(4,cameraDistance-2)],['− Zoom out',()=>cameraDistance=Math.min(80,cameraDistance+2)]])$('worldPositionActions').append(action(label,()=>{change();updateCamera();}));
 const more=$('builderOpenMoreBlocks');more.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();toggle('colors',more);},true);
 $('builderCloseMoreBlocks').addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();closePanel(true);},true);
 palette.addEventListener('click',event=>{if(event.target.closest('[data-block-color]'))closePanel();});
 $('blockShape').addEventListener('change',()=>closePanel());
 $('bottomBuildTools').addEventListener('click',event=>{if(event.target.closest('button'))closePanel();});
 $('worldDoorShortcut').addEventListener('click',()=>{closePanel();$('builderChooseDoor').click();});
 const library=$('reopenLibraryFromCoach');library?.addEventListener('click',()=>closePanel(),true);
 $('worldObjectsShortcut').addEventListener('click',event=>{closePanel();win.reopenObjectLibraryFromCoach?.(event);});
 const bobText=$('thinkerBobPanel');if(bobText)new MutationObserver(prepareBobText).observe(bobText,{childList:true,subtree:true,characterData:true});
 const message=$('toolMessage');if(message)new MutationObserver(()=>{const text=message.textContent.trim();if(isBuilding() && text && !/Tool message|Calm Mode|Saved build restored/.test(text))say(text);}).observe(message,{subtree:true,childList:true,characterData:true});
 const checklist=$('challengeChecklist');new MutationObserver(renderChallenge).observe(checklist,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled','checked']});
 $('worldTitle')&&new MutationObserver(()=>{updateProjectName();renderChallenge();}).observe($('worldTitle'),{childList:true,subtree:true,characterData:true});
 doc.body.classList.add('worldViewReady');restoreSharedControls();showPanel(null);updateProjectName();renderChallenge();
 win.setInterval(()=>{if(isBuilding()){restoreSharedControls();updateProjectName();renderChallenge();}},1200);
 return true;
}
root.querySelectorAll('[data-world-panel]').forEach(button=>button.addEventListener('click',()=>toggle(button.dataset.worldPanel,button)));
$('worldMultiSelect').addEventListener('click',()=>{const enabled=!win.builderMultiSelectMode;win.setBuilderMultipleSelection?.(enabled);$('worldMultiSelect').setAttribute('aria-pressed',String(enabled));say(enabled?'Click the blocks you want. Click one again to remove it.':'Click selects one block.');});
$('worldClearSelection').addEventListener('click',()=>{win.clearBuilderSelection?.();say('Selection cleared.');});
$('worldDuplicate').addEventListener('click',()=>{closePanel();win.duplicateBuilderSelection?.();});
$('worldBobButton').addEventListener('click',()=>toggle('bob',$('worldBobButton')));
$('worldCloseDrawer').addEventListener('click',()=>closePanel(true));$('worldCloseBob').addEventListener('click',()=>closePanel(true));
$('worldSettingsSave').addEventListener('click',()=>{closePanel();$('builderSaveButton')?.click();});
$('worldReviewBadges').addEventListener('click',()=>{closePanel();$('badgeMessage')?.click();});
$('worldChallengeHear').addEventListener('click',readChallenge);$('worldBobReadAction').addEventListener('click',readChallenge);
$('worldChallengeShow').addEventListener('click',fullMission);$('worldFullMission').addEventListener('click',fullMission);
$('worldBobHintAction').addEventListener('click',()=>{$('worldBobTip').textContent='Try one small part of your challenge first. Look at it from another side. If you want to change it, Undo is in Tools.';});
$('worldChallengeDone').addEventListener('click',()=>{
 if(!challenge?.input)return;
 setMissionCheckpointComplete(challenge.input,true,{window:win});renderChallenge();say('Nice work! One challenge complete.');
 const gear=doc.createElement('span');gear.id='worldGearCelebration';gear.setAttribute('aria-hidden','true');gear.textContent='⚙';root.append(gear);win.setTimeout(()=>gear.remove(),850);
});
$('worldToggleChallenge').addEventListener('click',()=>{const body=$('worldChallengeBody'),open=body.hidden;body.hidden=!open;$('worldToggleChallenge').setAttribute('aria-expanded',String(open));$('worldToggleChallenge').setAttribute('aria-label',open?'Hide challenge':'Show challenge');$('worldToggleChallenge').textContent=open?'⌃':'⌄';});
doc.addEventListener('change',event=>{if(event.target.closest?.('#challengeChecklist,#floatingChecklist'))renderChallenge();});
doc.addEventListener('pointerdown',event=>{if(panel && event.target===renderer.domElement){closingFromCanvas=true;closePanel();event.preventDefault();event.stopImmediatePropagation();}},true);
doc.addEventListener('pointerup',()=>{if(closingFromCanvas)win.setTimeout(()=>{closingFromCanvas=false;syncCanvasOwner();},0);},true);
doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel){closePanel(true);event.preventDefault();event.stopImmediatePropagation();}},true);
new MutationObserver(()=>{if(!installed)return;if(!isBuilding()){closingFromCanvas=false;closePanel();closeObjectLibrary();}else restoreSharedControls();}).observe(doc.body,{attributes:true,attributeFilter:['class']});
const guidanceRoot=$('bobGuidanceRoot');if(guidanceRoot)new MutationObserver(()=>{
 const snapshot=win.bobGuidance?.getSnapshot?.();
 if(doc.body.classList.contains('worldViewReady')&&snapshot?.active&&snapshot.sequenceId==='builder-first-mission-challenge'&&!guideRequested)win.bobGuidance.cancel('world-view-challenge-card');
 if(guidanceRoot.hidden&&guideRequested){guideRequested=false;closePanel();$('worldChallengeShow').focus({preventScroll:true});}
}).observe(guidanceRoot,{attributes:true,attributeFilter:['hidden']});
if(!install()){
 const observer=new MutationObserver(()=>{if(install())observer.disconnect();});observer.observe(doc.body,{childList:true,subtree:true});
 doc.addEventListener('DOMContentLoaded',()=>{if(install())observer.disconnect();},{once:true});
}
