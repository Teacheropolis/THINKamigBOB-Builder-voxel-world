import {STUDENT_OBJECT_LIBRARY_KEY,OBJECT_LIMITS,readStudentObjects,saveStudentObject,validateStudentObject,guideImageFile,guideDimensions} from '../workshop/persistence/student-object-library.mjs';
const $=id=>document.getElementById(id),inWorkshop=()=>document.body.classList.contains('workshopMode')&&!document.body.classList.contains('starterScreenActive');
const editable=target=>target?.closest?.('input,textarea,select,[contenteditable="true"]');
const notify=text=>{const status=$('workshopGuideStatus');status.textContent=text;window.showThinkamigbobBuildToast?.(text);};
const panel=$('workshopPanelPlanTrace');panel.classList.remove('workshop-console-placeholder-section');
panel.innerHTML=`<h2>Build from a picture</h2><p class="guideIntro">Copy a picture, then press Ctrl+V (⌘V on Mac). Build over the faded guide.</p>
<div class="guideActions"><button id="workshopPasteGuide" type="button">📋 Paste picture</button><button id="workshopChooseGuide" type="button">Choose image</button><button id="workshopGuideSettings" type="button">Adjust guide</button></div>
<p id="workshopGuideStatus" role="status" aria-live="polite">The picture is a guide only. My Objects saves just your building pieces.</p>
<input id="workshopGuideFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp" hidden>`;
const settings=document.createElement('dialog');settings.id='workshopGuideDialog';settings.setAttribute('aria-labelledby','guideDialogTitle');settings.innerHTML=`<form method="dialog"><div class="guideHeading"><h2 id="guideDialogTitle">Your picture guide</h2><button type="button" id="guideCloseDialog" aria-label="Close picture guide settings">✕</button></div><p>Try Top View to build right over your picture.</p>
<label>Fade <input id="guideOpacity" type="range" min="10" max="80" value="35"><output id="guideOpacityValue">35%</output></label>
<label>Size <input id="guideSize" type="range" min="2" max="44" step="1" value="18"></label>
<label>Across <input id="guideX" type="range" min="-23" max="23" step=".5" value="0"></label>
<label>Forward / back <input id="guideZ" type="range" min="-23" max="23" step=".5" value="0"></label>
<label>Turn <input id="guideTurn" type="range" min="0" max="360" step="15" value="0"></label>
<label>Position <select id="guidePlane"><option value="flat">Flat on the table</option><option value="front">Standing up — front</option><option value="side">Standing up — side</option></select></label>
<div class="guideActions"><button id="guideTopView" type="button">Top View</button><button id="guideToggle" type="button">Hide guide</button><button id="guideRemove" type="button">Remove guide</button></div><p>The guide stays in this Workshop visit. It is never included in a library object or build file.</p></form>`;document.body.append(settings);
let guide=null,guideTexture=null,imageRatio={width:1,height:1},guideShown=true,loadGeneration=0;
function clearGuide(){loadGeneration++;if(guide){scene.remove(guide);guide.geometry.dispose();guide.material.dispose();}guideTexture?.dispose();guide=guideTexture=null;}
function syncGuide(){
 if(!guide)return;guide.visible=inWorkshop()&&guideShown;const span=Number($('guideSize').value),size=guideDimensions(imageRatio.width,imageRatio.height,span);guide.scale.set(size.width,size.height,1);guide.material.opacity=Number($('guideOpacity').value)/100;$('guideOpacityValue').value=$('guideOpacity').value+'%';
 const x=Number($('guideX').value),z=Number($('guideZ').value),turn=Number($('guideTurn').value)*Math.PI/180,plane=$('guidePlane').value;
 guide.rotation.set(plane==='flat'?-Math.PI/2:0,plane==='side'?Math.PI/2:0,0);
 if(plane==='flat')guide.rotation.z=turn;else guide.rotation.y+=turn;
 guide.position.set(x,plane==='flat'?-.485:size.height/2-.48,z);$('guideToggle').textContent=guideShown?'Hide guide':'Show guide';
}
async function loadGuide(file){
 if(!inWorkshop())return;
 if(!file||!/^image\/(png|jpeg|webp|gif|bmp)$/i.test(file.type)||file.size>20000000){notify('Choose a PNG, JPG, WebP, GIF, or BMP picture smaller than 20 MB.');return;}
 const generation=++loadGeneration,url=URL.createObjectURL(file),image=new Image();
 try{
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});
  if(generation!==loadGeneration||!inWorkshop())return;
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>64000000)throw Error();
  const scale=Math.min(1,1536/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  clearGuide();guideTexture=new THREE.CanvasTexture(canvas);guide=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:guideTexture,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  guide.name='Workshop picture guide';guide.userData.workshopNonInteractive=true;guide.userData.referenceImage=true;guide.raycast=()=>{};scene.add(guide);imageRatio={width:canvas.width,height:canvas.height};guideShown=true;
  for(const [id,value]of [['guideSize',18],['guideOpacity',35],['guideX',0],['guideZ',0],['guideTurn',0],['guidePlane','flat']])$(id).value=value;
  syncGuide();window.setWorkshopConsoleTab?.('plan-trace');$('workshopViewTop')?.click();notify('Picture ready! Build on top of it. Adjust guide changes its size and fade.');
 }catch{notify('That picture could not open. Try copying the image again or choose an image file.');}finally{URL.revokeObjectURL(url);}
}
document.addEventListener('paste',event=>{if(!inWorkshop()||editable(event.target)||document.querySelector('dialog[open]'))return;const file=guideImageFile(event.clipboardData?.items);if(file){event.preventDefault();loadGuide(file);}});
$('workshopPasteGuide').addEventListener('click',async()=>{
 try{if(!navigator.clipboard?.read)throw Error();const items=await navigator.clipboard.read();for(const item of items){const type=item.types.find(t=>/^image\//.test(t));if(type){const blob=await item.getType(type);return loadGuide(new File([blob],'clipboard-image',{type}));}}notify('Copy an image first, then press Ctrl+V or ⌘V.');}
 catch{notify('Press Ctrl+V (⌘V on Mac) to paste, or choose an image file.');}
});
$('workshopChooseGuide').addEventListener('click',()=>$('workshopGuideFile').click());$('workshopGuideFile').addEventListener('change',event=>{loadGuide(event.target.files[0]);event.target.value='';});
$('workshopGuideSettings').addEventListener('click',()=>{if(!guide){notify('Paste or choose a picture first.');return;}settings.showModal();});
for(const id of ['guideOpacity','guideSize','guideX','guideZ','guideTurn','guidePlane'])$(id).addEventListener('input',syncGuide);
$('guideTopView').addEventListener('click',()=>$('workshopViewTop')?.click());$('guideToggle').addEventListener('click',()=>{guideShown=!guideShown;syncGuide();});$('guideRemove').addEventListener('click',()=>{clearGuide();settings.close();notify('Picture guide removed. Your building pieces are unchanged.');});
new MutationObserver(()=>{syncGuide();if(!inWorkshop())settings.close();}).observe(document.body,{attributes:true,attributeFilter:['class']});
// My Objects contains only mesh geometry and colors, never a snapshot of the scene.
function describePart(object){
 const positions=object.geometry?.getAttribute('position');if(!positions)return null;
 const vector=v=>({x:v.x,y:v.y,z:v.z});const p=object.geometry.parameters;
 return {position:vector(object.position),rotation:vector(object.rotation),scale:vector(object.scale),color:object.material.color.getHex(),shape:object.userData.builderShape||null,dimensions:p?.width&&p?.height&&p?.depth?{width:p.width,height:p.height,depth:p.depth}:null,vertices:Array.from(positions.array),indices:object.geometry.index?Array.from(object.geometry.index.array):null};
}
const libraryDialog=document.createElement('dialog');libraryDialog.id='studentObjectDialog';libraryDialog.setAttribute('aria-labelledby','studentObjectTitle');libraryDialog.innerHTML=`<form method="dialog"><div class="guideHeading"><h2 id="studentObjectTitle">Save to My Objects</h2><button type="button" id="studentObjectCloseDialog" aria-label="Close My Objects">✕</button></div><p>Save the whole Workshop build, or just your selected pieces. The picture guide is left out.</p><label>Object name <input id="studentObjectName" maxlength="60" value="My invention" required></label><label>Pieces <select id="studentObjectScope"><option value="all">Whole Workshop build</option><option value="selected">Selected pieces only</option></select></label><div class="guideActions"><button type="button" id="studentObjectSave">Save to My Objects</button><button type="button" id="studentObjectDownload">Download object file</button></div><p id="studentObjectStatus" role="status"></p><p>My Objects stays in this browser on this device. Download an object file to keep a copy or use another computer.</p></form>`;document.body.append(libraryDialog);
function makeObject(){
 if(!inWorkshop())return null;
 const list=($('studentObjectScope').value==='selected'?selectedBlocks:blocks).filter(b=>b.parent===scene&&!b.userData?.referenceImage&&b.geometry&&b.material?.color);
 if(!list.length){$('studentObjectStatus').textContent='Build something first, or choose some pieces.';return null;}
 if(list.length>OBJECT_LIMITS.parts){$('studentObjectStatus').textContent='Choose a smaller group of pieces to save.';return null;}
 const bounds=new THREE.Box3();for(const block of list)bounds.union(new THREE.Box3().setFromObject(block));const center=bounds.getCenter(new THREE.Vector3());
 const parts=list.map(describePart);for(const p of parts){if(!p)return null;p.position.x-=center.x;p.position.y-=bounds.min.y;p.position.z-=center.z;}
 const object=validateStudentObject({schema:'bob-student-object',version:1,id:crypto.randomUUID(),name:$('studentObjectName').value.trim(),parts});if(!object)$('studentObjectStatus').textContent='Give your object a name and try a smaller group of pieces.';return object;
}
function downloadObject(object){const url=URL.createObjectURL(new Blob([JSON.stringify(object)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=object.name.replace(/[^a-z0-9-]+/gi,'-')+'.bobobject';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function openSave(){if(!inWorkshop())return;$('studentObjectStatus').textContent='';$('studentObjectScope').value=selectedBlocks.length?'selected':'all';libraryDialog.showModal();}
$('studentObjectSave').addEventListener('click',()=>{const object=makeObject();if(!object)return;const result=saveStudentObject(localStorage,object);$('studentObjectStatus').textContent=result.ok?'Saved! Return to Builder → Blocks → Objects & ideas → My Workshop Objects.':result.message;if(result.ok){renderLibrary();notify('Your object is ready in My Workshop Objects.');}});
$('studentObjectDownload').addEventListener('click',()=>{const object=makeObject();if(object){downloadObject(object);$('studentObjectStatus').textContent='Object file downloaded. The picture guide was left out.';}});
const saveButton=document.createElement('button');saveButton.type='button';saveButton.id='workshopSaveMyObject';saveButton.textContent='Save to My Objects';saveButton.addEventListener('click',openSave);$('workshopPanelProject').querySelector('.workshop-dashboard-controls').append(saveButton);
const quickSave=saveButton.cloneNode(true);quickSave.id='workshopGuideSaveObject';quickSave.addEventListener('click',openSave);panel.querySelector('.guideActions').append(quickSave);
const alwaysSave=saveButton.cloneNode(true);alwaysSave.id='workshopAlwaysSaveObject';alwaysSave.addEventListener('click',openSave);document.body.append(alwaysSave);
const shelf=document.createElement('section');shelf.id='studentObjectShelf';shelf.innerHTML='<h3>My Workshop Objects</h3><p>Your own creations, ready for your world.</p><div id="studentObjectList"></div><button type="button" id="studentObjectOpenFile">Open object file</button><input id="studentObjectFile" type="file" accept=".bobobject,application/json" hidden><p id="studentObjectLibraryStatus" role="status"></p>';$('toolbox').prepend(shelf);
function instantiate(part){
 const geometry=part.shape==='cube'&&part.dimensions?new THREE.BoxGeometry(part.dimensions.width,part.dimensions.height,part.dimensions.depth):new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices,3));geometry.setIndex(part.indices);geometry.deleteAttribute('normal');geometry.deleteAttribute('uv');geometry.computeVertexNormals();geometry.parameters=part.dimensions?{...part.dimensions}:{};
 const mesh=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color:part.color}));mesh.position.set(part.position.x,part.position.y,part.position.z);mesh.rotation.set(part.rotation.x,part.rotation.y,part.rotation.z);mesh.scale.set(part.scale.x,part.scale.y,part.scale.z);mesh.userData.studentPlaced=true;mesh.userData.studentObjectPart=true;if(part.shape)mesh.userData.builderShape=part.shape;return mesh;
}
function placeObject(value){
 const object=validateStudentObject(value);const status=$('studentObjectLibraryStatus');if(!object||document.body.classList.contains('starterScreenActive')||window.builderExploreActive){status.textContent='Open a build first.';return;}
 const candidates=object.parts.map(instantiate),group=new THREE.Group();candidates.forEach(m=>group.add(m));group.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3()),platform=new THREE.Box3().setFromObject(ground);const fit=Math.min(1,40/Math.max(size.x,size.z,size.y,.001));
 candidates.forEach(m=>{m.position.multiplyScalar(fit);m.scale.multiplyScalar(fit);m.updateMatrixWorld(true);});bounds=new THREE.Box3().setFromObject(group);size=bounds.getSize(new THREE.Vector3());
 const obstacles=blocks.filter(b=>b.parent===scene).map(b=>new THREE.Box3().setFromObject(b));let offset=null;
 const spots=[];for(let z=-24;z<=24;z++)for(let x=-24;x<=24;x++)spots.push({x,z});spots.sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z));for(const {x:px,z:pz}of spots){if(px-size.x/2<platform.min.x+.5||pz-size.z/2<platform.min.z+.5||px+size.x/2>platform.max.x-.5||pz+size.z/2>platform.max.z-.5)continue;const delta=new THREE.Vector3(px,platform.max.y-bounds.min.y,pz),placed=bounds.clone().translate(delta);if(!obstacles.some(b=>placed.intersectsBox(b))){offset=delta;break;}}
 if(!offset){status.textContent='Make a little room on the table, then add your object again.';candidates.forEach(m=>{m.geometry.dispose();m.material.dispose();});return;}
 for(const mesh of candidates){group.remove(mesh);mesh.position.add(offset);scene.add(mesh);blocks.push(mesh);}
 const recorded=recordWorkshopPlacementHistory(candidates);if(recorded?.ok===false){for(const mesh of candidates){scene.remove(mesh);blocks.splice(blocks.indexOf(mesh),1);mesh.geometry.dispose();mesh.material.dispose();}status.textContent='The object could not be added. Try again.';return;}
 redoBlocks.length=0;setWorkshopSelectedObjectsExact(candidates);updateUndoRedoButtons();checkBadge();window.scheduleStudentAutosave?.({meaningful:true});
 browser.close();status.textContent=object.name+' added. Drag the selected pieces together to move it. Undo removes this copy.';window.showThinkamigbobBuildToast?.(object.name+' added to your build.');
 if(!inWorkshop()){window.builderSharedOrbitTarget={x:offset.x,y:platform.max.y+size.y/2,z:offset.z};cameraDistance=Math.min(40,Math.max(9,Math.max(size.x,size.z)*2.5));cameraHeight=Math.max(5,size.y*1.2+2);updateCamera();$('toolbox').style.setProperty('display','none','important');}
}
function renderLibrary(){const list=$('studentObjectList');list.replaceChildren();const objects=readStudentObjects(localStorage);if(!objects.length){const p=document.createElement('p');p.textContent='Create something in Workshop, then choose Save to My Objects.';list.append(p);}for(const object of objects){const row=document.createElement('div');row.className='studentObjectRow';const add=document.createElement('button');add.type='button';add.textContent='＋ '+object.name;add.addEventListener('click',()=>placeObject(object));const file=document.createElement('button');file.type='button';file.textContent='💾';file.setAttribute('aria-label','Download '+object.name+' object file');file.addEventListener('click',()=>downloadObject(object));row.append(add,file);list.append(row);}}
$('studentObjectOpenFile').addEventListener('click',()=>$('studentObjectFile').click());$('studentObjectFile').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>OBJECT_LIMITS.fileBytes)throw Error();const object=validateStudentObject(JSON.parse(await file.text()));if(!object)throw Error();const result=saveStudentObject(localStorage,object);if(!result.ok){$('studentObjectLibraryStatus').textContent=result.message;return;}renderLibrary();$('studentObjectLibraryStatus').textContent='Object opened. Click its name to add a copy.';}catch{$('studentObjectLibraryStatus').textContent='That object file could not open. Your current build is unchanged.';}});
window.addEventListener('storage',event=>{if(event.key===STUDENT_OBJECT_LIBRARY_KEY)renderLibrary();});renderLibrary();
window.getStudentObjectPartRecord=block=>block.userData?.studentObjectPart?{workshopPart:describePart(block)}:{};
window.validateStudentObjectPart=part=>!!validateStudentObject({schema:'bob-student-object',version:1,id:'part',name:'Part',parts:[part]});
window.restoreStudentObjectPart=(block,part)=>{
 if(!window.validateStudentObjectPart(part))return false;const restored=instantiate(part);block.geometry.dispose();block.geometry=restored.geometry;block.position.copy(restored.position);block.rotation.copy(restored.rotation);block.scale.copy(restored.scale);block.userData={...block.userData,...restored.userData};restored.material.dispose();return true;
};
const browser=document.createElement('dialog');browser.id='studentObjectBrowser';browser.setAttribute('aria-label','My Workshop Objects');const close=document.createElement('button');close.type='button';close.textContent='Close My Objects';close.addEventListener('click',()=>browser.close());browser.append(close);document.body.append(browser);
browser.addEventListener('close',()=>$('toolbox').prepend(shelf));
const openObjects=document.createElement('button');openObjects.type='button';openObjects.textContent='My Objects';openObjects.addEventListener('click',()=>{renderLibrary();browser.append(shelf);browser.showModal();});$('workshopPanelProject').querySelector('.workshop-dashboard-controls').append(openObjects);

$('guideCloseDialog').addEventListener('click',()=>settings.close());$('studentObjectCloseDialog').addEventListener('click',()=>libraryDialog.close());libraryDialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();$('studentObjectSave').click();});settings.querySelector('form').addEventListener('submit',event=>event.preventDefault());
