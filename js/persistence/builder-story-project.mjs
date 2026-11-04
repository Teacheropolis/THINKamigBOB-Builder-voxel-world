export const STORY_FILE_LIMIT=64*1024*1024;
const durations=new Set(['auto','0.5','1','3','5','8','12','20']);
function pngSize(url){
 if(typeof url!=='string'||url.length>3*1024*1024||!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(url))return false;
 try{const bytes=atob(url.split(',')[1].slice(0,44));const u=i=>((bytes.charCodeAt(i)*16777216)+(bytes.charCodeAt(i+1)<<16)+(bytes.charCodeAt(i+2)<<8)+bytes.charCodeAt(i+3));return bytes.slice(0,8)==='\x89PNG\r\n\x1a\n'&&bytes.slice(12,16)==='IHDR'&&u(16)===800&&u(20)===450;}catch{return false;}
}
export function validateStoryProject(value){
 if(!value||value.app!=='THINKamigBOB Story'||value.version!==1||value.width!==800||value.height!==450||typeof value.name!=='string'||value.name.length>60||!Array.isArray(value.frames)||value.frames.length<1||value.frames.length>24)throw Error('This is not a supported Story file.');
 let total=0;const frames=value.frames.map(f=>{
  if(!f||!pngSize(f.image)||typeof f.caption!=='string'||f.caption.length>180||!['top','middle','bottom'].includes(f.position)||!durations.has(f.duration))throw Error('A scene in this Story file is not supported.');
  total+=f.image.length;return {image:f.image,caption:f.caption,position:f.position,duration:f.duration};
 });if(total>STORY_FILE_LIMIT)throw Error('This Story file is too large.');
 return {app:value.app,version:1,width:800,height:450,name:value.name,selected:Number.isInteger(value.selected)?Math.max(0,Math.min(value.selected,frames.length-1)):0,frames};
}
export function createStoryProject({name,selected,frames}){return validateStoryProject({app:'THINKamigBOB Story',version:1,width:800,height:450,name:name.trim().slice(0,60)||'My story',selected,frames:frames.map(f=>({image:typeof f.image==='string'?f.image:f.image.src,caption:f.caption,position:f.position,duration:f.duration}))});}
export function parseStoryProject(text){if(typeof text!=='string'||text.length>STORY_FILE_LIMIT)throw Error('Choose a Story file smaller than 64 MB.');return validateStoryProject(JSON.parse(text));}
