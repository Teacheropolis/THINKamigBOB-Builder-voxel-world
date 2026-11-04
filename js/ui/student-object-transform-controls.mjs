import {planObjectTransform,readObjectPose,applyObjectPose,objectPoseMatches} from '../editing/object-transforms.mjs';
window.readStudentObjectPose=readObjectPose;window.applyStudentObjectPose=applyObjectPose;window.matchesStudentObjectPose=objectPoseMatches;
const $=id=>document.getElementById(id),workshop=()=>document.body.classList.contains('workshopMode');
function announce(message){$('studentTransformStatus').textContent=message;$('toolMessage').textContent=message;window.showThinkamigbobBuildToast?.(message);}
function change(options){
 if(window.builderExploreActive||document.body.classList.contains('starterScreenActive'))return;
 if(workshop()&&window.getWorkshopCanonicalState?.()!=='READY'){announce('Wait for the Workshop to finish opening.');return;}
 if(workshopMoveIsPending()){announce('Finish moving your selection first.');return;}
 const selection=activeWorkshopBlocks(selectedBlocks);
 const plan=planObjectTransform(THREE,selection,options,new THREE.Box3().setFromObject(ground));if(!plan.ok){announce(plan.message);return;}
 const ledger=workshop()?workshopEditHistory:builderDirectEditHistory;if(!ledger){announce('The tools are still loading. Try again.');return;}
 const prepared=ledger.prepare({type:'TRANSFORM',entries:plan.entries,selection});if(!prepared.ok){announce('That change is not ready. Select the pieces again.');return;}
 for(const entry of plan.entries)applyObjectPose(entry.object,entry.afterPose);
 const result=ledger.commitPrepared(prepared.token);
 if(!result.ok){for(const entry of plan.entries)applyObjectPose(entry.object,entry.beforePose);ledger.cancelPrepared(prepared.token);announce('The change was cancelled. Your pieces are unchanged.');return;}
 for(const entry of plan.entries){entry.object.userData.studentObjectPart=true;if(!entry.object.geometry.parameters)entry.object.geometry.parameters={};}
 redoBlocks.length=0;setWorkshopSelectedObjectsExact(selection);syncWorkshopSelectionMeasurements();updateUndoRedoButtons();window.scheduleStudentAutosave?.({meaningful:true});
 announce(options.angle?'Object tipped upright. Use Undo to go back.':(options.factor>1?'Object made bigger.':'Object made smaller.')+' Use Undo to go back.');
}
const controls=document.createElement('section');controls.id='studentObjectTransformControls';controls.setAttribute('aria-label','Object size and standing position');
controls.innerHTML='<strong>Change your object</strong><p>Select one piece, or use Select multiple for the whole object.</p><div class="studentTransformButtons"><button type="button" id="studentObjectBigger">＋ Bigger</button><button type="button" id="studentObjectSmaller">− Smaller</button><button type="button" class="workshopTipObject" id="studentObjectTipForward">↥ Tip forward 90°</button><button type="button" class="workshopTipObject" id="studentObjectTipSide">↥ Tip sideways 90°</button></div><p id="studentTransformStatus" role="status" aria-live="polite"></p>';
document.body.append(controls);
$('studentObjectBigger').addEventListener('click',()=>change({factor:1.2}));$('studentObjectSmaller').addEventListener('click',()=>change({factor:1/1.2}));$('studentObjectTipForward').addEventListener('click',()=>change({axis:'x',angle:Math.PI/2}));$('studentObjectTipSide').addEventListener('click',()=>change({axis:'z',angle:Math.PI/2}));
function refresh(){controls.hidden=!activeWorkshopBlocks(selectedBlocks).length||window.builderExploreActive||document.body.classList.contains('starterScreenActive');}
new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['class']});window.setInterval(refresh,250);refresh();

const editStatus=$('toolMessage');if(editStatus)new MutationObserver(()=>{if(/Change undone|Change restored|Object change undone|Object change restored/.test(editStatus.textContent))$('studentTransformStatus').textContent=editStatus.textContent;}).observe(editStatus,{childList:true,subtree:true,characterData:true});
