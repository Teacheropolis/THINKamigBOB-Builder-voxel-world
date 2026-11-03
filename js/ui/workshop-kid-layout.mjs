const $=id=>document.getElementById(id),active=()=>document.body.classList.contains('workshopMode')&&!document.body.classList.contains('starterScreenActive');
const root=document.createElement('div');root.id='kidWorkshop';root.innerHTML=`
<aside id="kidWorkbench" aria-label="Workshop tools"><div class="kidPanelTitle"><span>⚙</span><div><strong>Your workbench</strong><small>Make an idea real.</small></div></div>
<nav id="kidToolTabs" aria-label="Choose Workshop tools"><button type="button" data-kid-pane="make" aria-pressed="true">🧱 Build</button><button type="button" data-kid-pane="objects" aria-pressed="false">📦 Objects</button><button type="button" data-kid-pane="picture" aria-pressed="false">🖼 Picture guide</button><button type="button" data-kid-pane="work" aria-pressed="false">💾 My work</button></nav>
<div id="kidToolPages">
<section id="kidMake" data-kid-page="make"><h2>1. Choose a shape</h2><div id="kidShapes"></div><h2>2. Choose a color</h2><div id="kidColors"></div><p class="kidQuiet">Scroll the colors for more choices.</p><div class="kidStep"><b>3. Click the grid to build.</b><span>Click a piece’s face to add another on top.</span></div></section>
<section id="kidObjects" data-kid-page="objects" hidden><h2>Add an object</h2><p>Pick an object. A copy will appear on your table.</p><div id="kidMyObjects"></div><div id="kidObjectCatalog"></div></section>
<section id="kidPicture" data-kid-page="picture" hidden><h2>Build from a picture</h2><div id="kidGuideMount"></div></section>
<section id="kidWork" data-kid-page="work" hidden><h2>Keep your ideas</h2><div class="kidExplanation"><b>Save to My Objects</b><span>Use the gold button at the top. Add your object to a Builder world later.</span></div><h3>Project files</h3><p>Save a project file to your computer so you can open it and keep working.</p><div id="kidFiles"></div></section>
</div><div id="kidHistory" aria-label="Fix a mistake"></div><details id="kidBob"><summary>🤖 BOB’s building tip</summary><p>Start with one shape. Try a color. Use Undo whenever you want to try again.</p></details></aside>
<nav id="kidLook" aria-label="Change your view"><strong>Look from</strong><div id="kidViews"></div></nav>
<div id="kidSelectionTools" aria-label="Choose pieces"><span>Choose</span><div id="kidPickButtons"></div></div>
<aside id="kidSelectionCard" aria-label="Change selected pieces" hidden><h2 id="kidSelectionTitle">Your selection</h2><p>Drag the highlighted pieces to move them.</p><dl id="kidMeasures"></dl><div id="kidChangeMount"></div><div id="kidOtherChanges"></div><div id="kidSelectionEnd"></div></aside>
<div id="kidInstruction" role="status" aria-live="polite"><span id="kidInstructionIcon" aria-hidden="true">💡</span><span id="kidToolHint">Choose a shape, then click the grid to add it.</span></div>`;
document.body.append(root);
let pane='make',mounted=false,selectionSignature='',shapeSignature='';const moved=[];
function mountNode(id,target){const node=typeof id==='string'?$(id):id;if(!node||!target)return;const anchor=document.createComment('Workshop control home');node.before(anchor);moved.push({node,anchor});target.append(node);return node;}
function label(button,text,hint){if(!button)return;button.textContent=text;button.setAttribute('aria-label',text);button.title=hint;button.dataset.kidHint=hint;button.setAttribute('aria-describedby','kidToolHint');}
function hint(text){$('kidToolHint').textContent=text;}
const hints={make:'Choose a shape, then click the grid to add it.',objects:'Choose an object to add a copy. Your own creations are in My Objects.',picture:'Copy an image and press Ctrl+V (⌘V on Mac), then build over the faded picture.',work:'Save to My Objects to use your invention in Builder. Save a project file to keep working later.'};
function showPane(next){pane=next;root.querySelectorAll('[data-kid-page]').forEach(node=>node.hidden=node.dataset.kidPage!==pane);root.querySelectorAll('[data-kid-pane]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.kidPane===pane)));if(next==='objects')window.refreshWorkshopObjectTiles?.();if(next==='picture')window.setWorkshopConsoleTab?.('plan-trace');hint(hints[next]);}
function mount(){
 if(mounted||!$('worldToolsPanel')||!$('workshopGuideSaveObject')||!$('studentObjectTransformControls')||!$('engineeringDrawerSolidColors')?.children.length||!window.refreshWorkshopObjectTiles)return;
 mounted=true;
 for(const [id,text,tip]of [['workshopShapeCube','▣ Box','Add a box. Click the grid or a piece’s face.'],['workshopShapeSphere','● Ball','Add a ball. Click the grid or a piece’s face.'],['workshopShapeWedge','◢ Ramp','Add a ramp. Click the grid or a piece’s face.']])label(mountNode(id,$('kidShapes')),text,tip);
 for(const [id,term]of [['workshopShapeCube','cube'],['workshopShapeSphere','sphere'],['workshopShapeWedge','wedge']]){const small=document.createElement('small');small.className='kidTerm';small.textContent=term;$(id).append(small);}
 const colors=mountNode('engineeringDrawerSolidColors',$('kidColors'));if(!colors.dataset.kidColorBound){colors.dataset.kidColorBound='true';colors.addEventListener('click',event=>{if(!active()||!root.contains(colors))return;const tile=event.target.closest('[data-engineering-color-value]');if(tile){window.chooseSimpleWorkshopColor?.(tile.dataset.engineeringColorValue);hint('Color chosen. Click the grid or a piece’s face to add your shape.');}});}
 mountNode('engineeringDrawerPartsObjectsContent',$('kidObjectCatalog'));
 const myObjects=$('workshopOpenMyObjects')||[...$('workshopPanelProject').querySelectorAll('button')].find(b=>b.textContent.trim()==='My Objects');if(myObjects)myObjects.id='workshopOpenMyObjects';label(mountNode(myObjects,$('kidMyObjects')),'My Objects →','Open the objects you made and saved on this device.');
 mountNode('workshopPanelPlanTrace',$('kidGuideMount'));
 for(const [id,text,tip]of [['workshopProjectSave','💾 Save project file','Download a file to your computer. Open it later to keep working.'],['workshopProjectOpen','📁 Open project file','Open a Workshop project file from your computer.'],['workshopProjectNew','＋ Start a new project','Begin a new Workshop. You can save your current work first.']])label(mountNode(id,$('kidFiles')),text,tip);
 for(const [id,text,tip]of [['workshopUndoButton','↶ Undo','Take back your last change. You can also press Ctrl+Z.'],['workshopRedoButton','↷ Redo','Bring back the change you undid.']])label(mountNode(id,$('kidHistory')),text,tip);
 const views=mountNode('workshopEngineeringViewControls',$('kidViews'));
 for(const [id,text,tip]of [['workshopViewHome','3D','Look at the table from an angle.'],['workshopViewTop','Above','Look straight down at your build.'],['workshopViewFront','Front','Look straight at the front of your build.'],['workshopViewRight','Side','Look at the right side of your build.']])label($(id),text,tip);
 const fit=mountNode('workshopFitSelection',$('kidSelectionEnd'));label(fit,'Zoom to selection','Bring your selected pieces into view.');if(!fit.dataset.kidFitBound){fit.dataset.kidFitBound='true';fit.addEventListener('click',()=>{if(active()&&root.contains(fit))window.fitWorkshopSelection?.();});}
 for(const [id,text,tip]of [['workshopSelectButton','Pick one','Click one piece to highlight it. Drag it to move it.'],['workshopSelectMultipleButton','Pick a group','Click several pieces or drag a box around them. Change the highlighted pieces together.']])label(mountNode(id,$('kidPickButtons')),text,tip);
 mountNode('studentObjectTransformControls',$('kidChangeMount'));
 for(const [id,text,tip]of [['studentObjectBigger','＋ Bigger','Make all the highlighted pieces bigger together.'],['studentObjectSmaller','− Smaller','Make all the highlighted pieces smaller together.'],['studentObjectTipForward','Tip forward','Tip a flat object onto its edge with a quarter turn.'],['studentObjectTipSide','Tip sideways','Stand your object on its other edge with a quarter turn.']])label($(id),text,tip);
 for(const [id,text,tip]of [['workshopRotateRightButton','↻ Turn 90°','Turn your selection around on the table.'],['workshopClearSelectionButton','Done choosing','Remove the highlight. Your pieces stay in place.'],['workshopDeleteButton','✕ Delete pieces','Remove the highlighted pieces. Undo can bring them back.']])label(mountNode(id,id==='workshopRotateRightButton'?$('kidOtherChanges'):$('kidSelectionEnd')),text,tip);
 label(mountNode('workshopQuickScreenshot',$('kidFiles')),'📷 Save a picture','Download a picture of your creation to share or add to a project.');
 label(mountNode('workshopQuickHelp',$('kidBob')),'More building help','Open the guide to the building tools.');
 // A precision option remains available without filling the main tool list.
 const precision=document.createElement('details');precision.id='kidPrecision';precision.innerHTML='<summary>📏 Grid & precision</summary><p>One large square is 1 cm. The grid helps you line pieces up.</p><div></div>';$('kidWork').append(precision);mountNode('workshopMeasurementControls',precision.lastElementChild);mountNode('workshopGridButton',precision.lastElementChild);
 root.querySelectorAll('#kidViews button').forEach(b=>{if(!['workshopViewHome','workshopViewTop','workshopViewFront','workshopViewRight'].includes(b.id))b.hidden=true;});
 $('engineeringDrawerPartsObjectsContent').hidden=false;
 document.body.classList.add('kidWorkshopReady');showPane('make');refresh();
}
function restore(){
 if(!mounted)return;
 for(const {node,anchor}of moved.reverse()){if(anchor.parentNode)anchor.replaceWith(node);}
 moved.length=0;mounted=false;document.body.classList.remove('kidWorkshopReady');$('kidPrecision')?.remove();
 // Restore Workshop-only elements hidden by the compact view picker.
 for(const id of ['workshopViewLeft','workshopViewBack','workshopViewBottom'])if($(id))$(id).hidden=false;
}
function format(n){return Number(n.toFixed(1)).toString();}
function refresh(){
 if(!active()){if(mounted)restore();return;}
 if(!mounted){mount();return;}
 const selection=activeWorkshopBlocks(selectedBlocks);$('kidSelectionCard').hidden=!selection.length;
 const next=(window.getWorkshopMeasurementUnit?.().unit||'cm')+':'+selection.length+':'+selection.map(o=>o.uuid+':'+[...o.position,...o.rotation.toArray().slice(0,3),...o.scale].join(',')).join('|');
 if(next!==selectionSignature){selectionSignature=next;if(selection.length){const bounds=new THREE.Box3();selection.forEach(o=>bounds.union(new THREE.Box3().setFromObject(o)));const size=bounds.getSize(new THREE.Vector3()),unit=window.getWorkshopMeasurementUnit?.().unit==='mm'?'mm':'cm',factor=unit==='mm'?10:1;$('kidSelectionTitle').textContent=selection.length===1?'1 piece selected':selection.length+' pieces selected';$('kidMeasures').replaceChildren(...[['Width',size.x],['Height',size.y],['Depth',size.z]].flatMap(([name,n])=>{const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=name;value.textContent=format(n*factor)+' '+unit;return [term,value];}));hint('Drag the highlighted pieces to move them. Use Bigger, Smaller, or Tip to change them.');}}
 const shape=selectedBlockShape;if(shape!==shapeSignature){shapeSignature=shape;if(!selection.length&&pane==='make')hint(hints.make);}
 if(pane==='objects'&&!$('engineeringDrawerPartsObjectsList').children.length)window.refreshWorkshopObjectTiles?.();
 // Native view changes and project resets may hide panels. Their compact owners decide visibility.
 if(pane==='picture')$('workshopPanelPlanTrace').hidden=false;
 $('engineeringDrawerPartsObjectsContent').hidden=false;
}
root.addEventListener('click',event=>{const tab=event.target.closest('[data-kid-pane]');if(tab){showPane(tab.dataset.kidPane);return;}const button=event.target.closest('button');if(button?.dataset.kidHint)hint(button.dataset.kidHint);});
for(const name of ['focusin','pointerover'])root.addEventListener(name,event=>{const button=event.target.closest('button');if(button?.dataset.kidHint)hint(button.dataset.kidHint);});
root.addEventListener('keydown',event=>{if(event.target.closest('input,textarea,select,[contenteditable="true"]'))return;if((event.ctrlKey||event.metaKey)&&['z','y'].includes(event.key.toLowerCase())){event.preventDefault();event.stopImmediatePropagation();if(event.key.toLowerCase()==='y'||event.shiftKey)redoLast();else undoLast();}});
new MutationObserver(()=>{if(active())mount();else restore();}).observe(document.body,{attributes:true,attributeFilter:['class']});window.setInterval(refresh,300);if(active())mount();
document.addEventListener('paste',event=>{if(active()&&!event.target.closest?.('input,textarea,[contenteditable="true"]')&&Array.from(event.clipboardData?.items||[]).some(item=>item.type.startsWith('image/')))showPane('picture');});
