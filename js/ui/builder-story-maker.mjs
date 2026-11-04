import {createStoryProject,parseStoryProject,STORY_FILE_LIMIT} from '../persistence/builder-story-project.mjs';
import {suggestedStorySeconds,encodeStoryGif} from '../editing/builder-story-gif.mjs';
const doc=document,$=id=>doc.getElementById(id),frames=[];let selected=0,playing=false,timer=0,busy=false,dirty=false,pendingStory=null;
const launcher=doc.createElement('div');launcher.id='storyLauncher';launcher.innerHTML='<button id="storyCapture" type="button">📷 Capture scene</button><button id="storyOpen" type="button">Story GIF · 0</button><span id="storyNotice" role="status"></span>';doc.body.append(launcher);
const dialog=doc.createElement('dialog');dialog.id='storyMaker';dialog.setAttribute('aria-labelledby','storyTitle');dialog.innerHTML=`<header><div><h2 id="storyTitle">Your Story GIF</h2><p>Capture a scene. Add your words. Tell your story.</p></div><button id="storyClose" type="button" aria-label="Close story maker">✕</button></header><div class="storyButtons storyFileActions"><button id="storySaveProject" type="button">💾 Save Story</button><button id="storyOpenProject" type="button">📂 Open Story</button><input id="storyProjectFile" type="file" accept=".bobstory,application/json" hidden/><span id="storyFileHint">Save Story to keep editing later. Download GIF to share.</span></div><section id="storyReplace" hidden><p>Your current story has changes. Save Story first if you want to keep a copy. Open the selected file instead?</p><button id="storyReplaceYes" type="button">Open selected story</button><button id="storyReplaceCancel" type="button">Keep current story</button></section><div class="storyLayout"><section><canvas id="storyPreview" width="800" height="450" aria-label="Selected scene with caption"></canvas><p id="storyFrameLabel" aria-live="polite"></p><div class="storyButtons"><button id="storyPlay" type="button">▶ Preview story</button><button id="storyNextCapture" type="button">📷 Back to capture</button></div><div id="storyFrames" aria-label="Story frames"></div></section><section class="storyEditor"><label for="storyCaption">Words on this scene</label><textarea id="storyCaption" maxlength="180" rows="4" placeholder="Explain your discovery, tell a story, or label what you see…"></textarea><label for="storyPosition">Text position</label><select id="storyPosition"><option value="bottom">Bottom</option><option value="top">Top</option><option value="middle">Middle</option></select><label for="storySeconds">Time on screen</label><select id="storySeconds"><option value="auto">Suggested reading time</option><option value="0.5">0.5 seconds · 2 FPS</option><option value="1">1 second · 1 FPS</option><option value="3">3 seconds · 0.33 FPS</option><option value="5">5 seconds · 0.2 FPS</option><option value="8">8 seconds · 0.125 FPS</option><option value="12">12 seconds · 0.08 FPS</option><option value="20">20 seconds · 0.05 FPS</option></select><p id="storyTiming"></p><p class="storyTip">With text, try 3–8 seconds per scene (about 0.33–0.125 FPS). Longer explanations need more reading time. Without text, 1–2 FPS gives a quick tour.</p><div class="storyButtons"><button id="storyEarlier" type="button">← Earlier</button><button id="storyLater" type="button">Later →</button><button id="storyRemove" type="button">Remove scene</button></div><label for="storyName">Story name</label><input id="storyName" maxlength="60" value="My discovery story"/><button id="storyDownload" type="button">Download GIF ↓</button><p id="storyStatus" role="status">Up to 24 scenes. Save Story keeps editable scenes on your computer. Open Story brings them back. Your build is unchanged.</p></section></div>`;doc.body.append(dialog);
const capturePrompt=doc.createElement('dialog');capturePrompt.id='storyCapturePrompt';capturePrompt.setAttribute('aria-labelledby','storyCaptureQuestion');capturePrompt.innerHTML='<img id="storyCapturedImage" alt="Your captured scene"/><h2 id="storyCaptureQuestion">Do you want to write on this scene?</h2><div class="storyCaptureChoices"><button id="storyCaptureYes" type="button">Yes</button><button id="storyCaptureNo" type="button">No</button></div>';doc.body.append(capturePrompt);
function closeCapturePrompt(){capturePrompt.close();window.builderStoryEditorOpen=false;$('storyCapture').focus({preventScroll:true});}
$('storyCaptureYes').onclick=()=>{closeCapturePrompt();open();$('storyCaption').focus();};
$('storyCaptureNo').onclick=closeCapturePrompt;
capturePrompt.addEventListener('cancel',()=>{window.builderStoryEditorOpen=false;$('storyCapture').focus({preventScroll:true});});
const preview=$('storyPreview'),ctx=preview.getContext('2d');
const current=()=>frames[selected],seconds=f=>f.duration==='auto'?suggestedStorySeconds(f.caption):Number(f.duration);
function stop(){playing=false;clearTimeout(timer);$('storyPlay').textContent='▶ Preview story';}
function draw(f,target=ctx){
 target.fillStyle='#132b3a';target.fillRect(0,0,800,450);if(!f)return;target.drawImage(f.image,0,0,800,450);
 if(!f.caption.trim())return;
 target.font='700 25px system-ui, sans-serif';const lines=[];let line='';
 for(const word of f.caption.trim().split(/\s+/)){if(target.measureText(word).width>730){if(line){lines.push(line);line='';}let chunk='';for(const char of word){if(target.measureText(chunk+char).width>730){lines.push(chunk);chunk='';}chunk+=char;}line=chunk;}else if(target.measureText(line?line+' '+word:word).width>730){lines.push(line);line=word;}else line=line?line+' '+word:word;}if(line)lines.push(line);
 const h=lines.length*32+24,y=f.position==='top'?14:f.position==='middle'?(450-h)/2:450-h-14;
 target.fillStyle='rgba(8,22,34,.88)';target.fillRect(18,y,764,h);target.fillStyle='#fff';target.textBaseline='top';lines.forEach((text,i)=>target.fillText(text,35,y+12+i*32));
}
function timing(){const f=current();if(!f)return;const suggested=suggestedStorySeconds(f.caption),actual=seconds(f);$('storyTiming').textContent=`Suggested: ${suggested} seconds · ${(1/suggested).toFixed(2)} FPS. This scene: ${actual} seconds.${actual<suggested&&f.caption.trim()?' Try a longer time so readers can finish.':''}`;}
function render(){
 $('storyOpen').textContent=`Story GIF · ${frames.length}`;const f=current();draw(f);
 $('storyFrameLabel').textContent=f?`Scene ${selected+1} of ${frames.length}`:'Capture your first scene in Explore.';
 for(const id of ['storyCaption','storyPosition','storySeconds','storyRemove','storyPlay','storyDownload','storySaveProject'])$(id).disabled=!f||busy;
 $('storyCaption').value=f?.caption||'';$('storyPosition').value=f?.position||'bottom';$('storySeconds').value=f?.duration||'auto';
 $('storyEarlier').disabled=busy||!f||selected===0;$('storyLater').disabled=busy||!f||selected===frames.length-1;for(const id of ['storyNextCapture','storyClose','storyOpenProject'])$(id).disabled=busy;
 $('storyFrames').replaceChildren();frames.forEach((frame,i)=>{const b=doc.createElement('button');b.type='button';b.disabled=busy;b.setAttribute('aria-label',`Edit scene ${i+1}`);b.setAttribute('aria-pressed',String(i===selected));const img=doc.createElement('img');img.src=frame.image.src;img.alt='';b.append(img,doc.createTextNode(String(i+1)));b.onclick=()=>{stop();selected=i;render();};$('storyFrames').append(b);});timing();
}
function open(){stop();window.builderStoryEditorOpen=true;dialog.showModal();render();}
function close(){stop();dialog.close();window.builderStoryEditorOpen=false;}
async function capture(){
 if(!window.builderExploreActive||busy)return;if(frames.length>=24){open();$('storyStatus').textContent='Your story has 24 scenes. Remove a scene to capture another.';return;}
 renderer.render(scene,camera);const c=doc.createElement('canvas');c.width=800;c.height=450;const x=c.getContext('2d');
 // Fit the complete view without stretching it. Letterbox unusual screen shapes.
 x.fillStyle='#132b3a';x.fillRect(0,0,800,450);const scale=Math.min(800/renderer.domElement.width,450/renderer.domElement.height),w=renderer.domElement.width*scale,h=renderer.domElement.height*scale;x.drawImage(renderer.domElement,(800-w)/2,(450-h)/2,w,h);
 const image=new Image();image.src=c.toDataURL('image/png');await image.decode();frames.push({image,caption:'',position:'bottom',duration:'auto'});dirty=true;selected=frames.length-1;render();$('storyNotice').textContent=`Scene ${frames.length} captured!`;$('storyCapturedImage').src=image.src;window.builderStoryEditorOpen=true;capturePrompt.showModal();$('storyCaptureYes').focus();
}
$('storyCapture').onclick=capture;$('storyOpen').onclick=open;$('storyClose').onclick=close;$('storyNextCapture').onclick=close;dialog.addEventListener('cancel',event=>{if(busy){event.preventDefault();return;}stop();window.builderStoryEditorOpen=false;});
for(const [id,key]of [['storyCaption','caption'],['storyPosition','position'],['storySeconds','duration']])$(id).addEventListener('input',()=>{stop();if(current()){current()[key]=$(id).value;dirty=true;draw(current());timing();}});
$('storyEarlier').onclick=()=>{stop();if(selected){[frames[selected-1],frames[selected]]=[frames[selected],frames[selected-1]];selected--;dirty=true;render();}};
$('storyLater').onclick=()=>{stop();if(selected<frames.length-1){[frames[selected+1],frames[selected]]=[frames[selected],frames[selected+1]];selected++;dirty=true;render();}};
$('storyRemove').onclick=()=>{stop();frames.splice(selected,1);dirty=true;selected=Math.max(0,Math.min(selected,frames.length-1));render();};
$('storyPlay').onclick=()=>{if(playing){stop();render();return;}playing=true;$('storyPlay').textContent='■ Stop preview';let i=0;const tick=()=>{if(!playing)return;draw(frames[i]);$('storyFrameLabel').textContent=`Playing scene ${i+1} of ${frames.length}`;timer=setTimeout(()=>{i=(i+1)%frames.length;tick();},seconds(frames[i])*1000);};tick();};
$('storyDownload').onclick=async()=>{
 stop();busy=true;render();$('storyStatus').textContent='Making your GIF…';
 try{const rendered=[];for(const f of frames){draw(f);rendered.push({rgba:ctx.getImageData(0,0,800,450).data,seconds:seconds(f)});await new Promise(requestAnimationFrame);}
 const bytes=encodeStoryGif(800,450,rendered),url=URL.createObjectURL(new Blob([bytes],{type:'image/gif'})),a=doc.createElement('a');a.href=url;a.download=($('storyName').value.trim().replace(/[^a-zA-Z0-9 _-]/g,'').slice(0,60)||'My story')+'.gif';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('storyStatus').textContent='Your GIF is ready. It loops with the timing you chose. Save it for your project!';}
 catch(error){$('storyStatus').textContent='The GIF could not be made. Your scenes are still here. Try fewer scenes.';}
 finally{busy=false;render();}
};
let priorExplore=!!window.builderExploreActive;
new MutationObserver(()=>{const active=!!window.builderExploreActive;if(priorExplore&&!active){if(dialog.open)close();if(capturePrompt.open)closeCapturePrompt();}priorExplore=active;}).observe(doc.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('beforeunload',event=>{if(dirty&&frames.length){event.preventDefault();event.returnValue='';}});
render();

function downloadFile(blob,name){const url=URL.createObjectURL(blob),a=doc.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('storySaveProject').onclick=()=>{
 try{const project=createStoryProject({name:$('storyName').value,selected,frames});downloadFile(new Blob([JSON.stringify(project)],{type:'application/json'}),project.name.replace(/[^a-zA-Z0-9 _-]/g,'').slice(0,60)+'.bobstory');dirty=false;$('storyStatus').textContent='Story file downloaded. Keep the .bobstory file and use Open Story to continue later.';}
 catch(error){$('storyStatus').textContent='The story could not be saved. Your scenes are still here. Try again.';}
};
$('storyOpenProject').onclick=()=>{$('storyProjectFile').value='';$('storyProjectFile').click();};
$('storyName').addEventListener('input',()=>{dirty=true;});
function acceptStory(){
 if(!pendingStory)return;frames.splice(0,frames.length,...pendingStory.frames);selected=pendingStory.selected;$('storyName').value=pendingStory.name;pendingStory=null;dirty=false;$('storyReplace').hidden=true;render();$('storyStatus').textContent='Story opened! Edit the words, change the order, or capture more scenes in Explore. Save Story again when you finish.';
}
$('storyReplaceYes').onclick=acceptStory;$('storyReplaceCancel').onclick=()=>{pendingStory=null;$('storyReplace').hidden=true;$('storyStatus').textContent='Your current story is unchanged.';};
$('storyProjectFile').addEventListener('change',async()=>{
 const file=$('storyProjectFile').files[0];if(!file)return;stop();busy=true;render();$('storyStatus').textContent='Opening Story…';
 try{
  if(file.size>STORY_FILE_LIMIT)throw Error('File too large');const project=parseStoryProject(await file.text()),loaded=[];
  for(const f of project.frames){const image=new Image();image.src=f.image;await image.decode();if(image.naturalWidth!==800||image.naturalHeight!==450)throw Error('Invalid scene');loaded.push({...f,image});}
  pendingStory={...project,frames:loaded};if(dirty&&frames.length){$('storyReplace').hidden=false;$('storyStatus').textContent='The selected story is ready. Choose whether to replace your current story.';$('storyReplaceCancel').focus();}else acceptStory();
 }catch(error){pendingStory=null;$('storyReplace').hidden=true;$('storyStatus').textContent='That file could not be opened. Choose a .bobstory file saved by this app (up to 64 MB). Your current story is unchanged.';}
 finally{busy=false;render();}
});
window.openBuilderStoryMaker=()=>{open();};
const entry=doc.createElement('button');entry.type='button';entry.id='starterOpenStory';entry.textContent='OPEN A SAVED STORY';entry.onclick=open;doc.getElementById('starterProjectEntryRow')?.append(entry);
