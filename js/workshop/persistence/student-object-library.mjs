export const STUDENT_OBJECT_LIBRARY_KEY='thinkamigbob-my-workshop-objects-v1';
export const OBJECT_LIMITS=Object.freeze({objects:30,parts:1200,vertices:300000,fileBytes:12000000});
const finiteVector=(v,positive=false)=>v&&['x','y','z'].every(k=>Number.isFinite(v[k])&&Math.abs(v[k])<=10000&&(!positive||v[k]>0));
// Keep an explicit allowlist: guides, image URLs, textures, scripts and scene decorations cannot enter an object.
export function validateStudentObject(value){
 if(!value||value.schema!=='bob-student-object'||value.version!==1||typeof value.id!=='string'||value.id.length>100||typeof value.name!=='string'||!value.name.trim()||value.name.length>60||!Array.isArray(value.parts)||!value.parts.length||value.parts.length>OBJECT_LIMITS.parts)return null;
 let vertices=0;
 const parts=[];const vector=v=>({x:v.x,y:v.y,z:v.z});
 for(const p of value.parts){
  if(!p||!finiteVector(p.position)||!finiteVector(p.rotation)||!finiteVector(p.scale,true)||!Number.isInteger(p.color)||p.color<0||p.color>0xffffff||!Array.isArray(p.vertices)||!p.vertices.length||p.vertices.length%3)return null;
  vertices+=p.vertices.length/3;if(vertices>OBJECT_LIMITS.vertices||!p.vertices.every(n=>Number.isFinite(n)&&Math.abs(n)<=10000))return null;
  const count=p.vertices.length/3;
  if(p.indices!=null&&(!Array.isArray(p.indices)||p.indices.length>OBJECT_LIMITS.vertices*6||p.indices.length%3||!p.indices.every(n=>Number.isInteger(n)&&n>=0&&n<count)))return null;
  if(p.indices==null&&count%3)return null;
  const dimensions=p.dimensions&&['width','height','depth'].every(k=>Number.isFinite(p.dimensions[k])&&p.dimensions[k]>0&&p.dimensions[k]<=10000)?{width:p.dimensions.width,height:p.dimensions.height,depth:p.dimensions.depth}:null;
  parts.push({position:vector(p.position),rotation:vector(p.rotation),scale:vector(p.scale),color:p.color,vertices:p.vertices.slice(),indices:p.indices?.slice()??null,shape:['cube','sphere','trianglePrism'].includes(p.shape)?p.shape:null,dimensions});
 }
 return {schema:'bob-student-object',version:1,id:value.id,name:value.name.trim(),parts};
}
export function readStudentObjects(storage){
 try{const list=JSON.parse(storage.getItem(STUDENT_OBJECT_LIBRARY_KEY)||'[]');return Array.isArray(list)?list.slice(0,OBJECT_LIMITS.objects).map(validateStudentObject).filter(Boolean):[];}catch{return [];}
}
export function saveStudentObject(storage,value){
 const object=validateStudentObject(value);if(!object)return {ok:false,message:'This object could not be saved. Try a smaller build.'};
 const list=readStudentObjects(storage).filter(item=>item.id!==object.id);if(list.length>=OBJECT_LIMITS.objects)return {ok:false,message:'My Objects is full. Download an object file to keep this creation.'};
 try{storage.setItem(STUDENT_OBJECT_LIBRARY_KEY,JSON.stringify([...list,object]));return {ok:true,object};}catch{return {ok:false,message:'Your browser is out of saving space. Download an object file to keep your work.'};}
}
export function guideImageFile(items){return Array.from(items||[]).find(item=>/^image\/(png|jpeg|webp|gif|bmp)$/i.test(item.type||''))?.getAsFile?.()||null;}
export function guideDimensions(width,height,span=18){const ratio=width/height;return ratio>=1?{width:span,height:span/ratio}:{width:span*ratio,height:span};}
