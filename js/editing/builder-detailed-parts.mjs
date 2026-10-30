export const DETAIL_KINDS=['stone','wood','metal','crystal','rock','foliage','water','lava','glass','solar','biology','rubber'];
export function detailKind(color,source=''){
 if(/Cell|Nucleus|DNA|Mitochondria|Chloroplast|Vacuole|Ribosome|Golgi|Lysosome|addER/.test(source))return 'biology';
 if([0x654321,0x8b4513,0xa0522d,0xdeb887].includes(color))return 'wood';
 if([0xff4500,0xff6347].includes(color)||(/Volcano/.test(source)&&color===0xff0000))return 'lava';
 if([0x228b22,0x32cd32,0xadff2f,0x55aa55,0x006400].includes(color))return 'foliage';
 if([0x1e90ff,0x0000ff,0x4169e1].includes(color))return /Solar|Satellite|FutureCity|EnergyCity|SpaceColony/.test(source)?'solar':'water';
 if([0x87cefa,0x87ceeb,0xadd8e6,0x00bfff].includes(color))return 'glass';
 if([0x555555,0x777777,0x333333].includes(color))return /Building|Rover|Satellite|Rocket|Car|Line|Battery|Rod|Turbine/.test(source)?'metal':'rock';
 if([0xffd700,0x808080,0xeeeeee,0xffffff,0xc0c0c0].includes(color))return 'metal';
 if([0xcccccc,0xaaaaaa,0x999999].includes(color))return 'stone';
 if([0x222222,0x000000].includes(color))return /Rover|Car/.test(source)?'rubber':'rock';
 return 'crystal';
}
export function validDetailRecord(value){return value===undefined || (value && DETAIL_KINDS.includes(value.kind) && typeof value.assembly==='string' && value.assembly.length<=100 && (value.geometry===undefined || (['sphere','cylinder'].includes(value.geometry.type) && ['radius','height','radiusTop','radiusBottom'].every(key=>value.geometry[key]===undefined || (Number.isFinite(value.geometry[key]) && value.geometry[key]>=0 && value.geometry[key]<=1000)))));}
export function createDetailedPartDecorator({THREE,document}){
 const textures=new Map();
 function texture(kind){
  if(textures.has(kind))return textures.get(kind);
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='#c7c7c7';x.fillRect(0,0,128,128);
  let seed=37;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  for(let i=0;i<1800;i++){const v=140+Math.floor(random()*100);x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(random()*128,random()*128,1+random()*3,1);}
  x.strokeStyle='#646464';x.lineWidth=kind==='stone'?3:1;
  if(kind==='stone'){for(let y=0;y<128;y+=32){x.beginPath();x.moveTo(0,y);x.lineTo(128,y);x.stroke();for(let a=(y/32%2)*32;a<128;a+=64){x.beginPath();x.moveTo(a,y);x.lineTo(a,y+32);x.stroke();}}}
  if(kind==='wood'){for(let i=0;i<26;i++){x.beginPath();const a=i*5;x.moveTo(a,0);for(let y=0;y<=128;y+=8)x.lineTo(a+Math.sin(y/15+i)*2,y);x.stroke();}for(const a of [27,91]){x.beginPath();x.ellipse(a,60,5,13,0,0,Math.PI*2);x.stroke();}}
  if(kind==='metal'){x.lineWidth=4;x.strokeRect(5,5,118,118);x.lineWidth=2;for(let y=38;y<100;y+=12){x.beginPath();x.moveTo(25,y);x.lineTo(103,y);x.stroke();}}
  if(kind==='crystal'){x.lineWidth=2;for(let a=0;a<128;a+=32){x.beginPath();x.moveTo(a,0);x.lineTo(a+30,64);x.lineTo(a,128);x.stroke();}}
  if(kind==='rock'||kind==='lava'){
   x.fillStyle=kind==='lava'?'#5e5e5e':'#9e9e9e';x.fillRect(0,0,128,128);
   for(let i=0;i<65;i++){const v=90+Math.floor(random()*90);x.fillStyle=`rgb(${v},${v},${v})`;x.beginPath();const a=random()*128,b=random()*128;x.moveTo(a,b);x.lineTo(a+random()*20,b+4);x.lineTo(a+5,b+random()*19);x.fill();}
   x.strokeStyle=kind==='lava'?'#ffffff':'#696969';x.lineWidth=kind==='lava'?4:1.2;
   for(let i=0;i<7;i++){x.beginPath();let a=random()*128,b=0;x.moveTo(a,b);for(let j=0;j<6;j++){a+=(random()-.5)*45;b+=24;x.lineTo(a,b);}x.stroke();}
  }
  if(kind==='foliage'){for(let i=0;i<95;i++){const a=random()*128,b=random()*128;x.fillStyle=i%2?'#929292':'#e5e5e5';x.beginPath();x.ellipse(a,b,4,9,random()*3,0,Math.PI*2);x.fill();x.strokeStyle='#616161';x.beginPath();x.moveTo(a,b-7);x.lineTo(a,b+7);x.stroke();}}
  if(kind==='water'||kind==='glass'){x.strokeStyle='#f6f6f6';x.lineWidth=2;for(let y=8;y<128;y+=14){x.beginPath();for(let a=0;a<=128;a+=4)x.lineTo(a,y+Math.sin(a/12+y)*3);x.stroke();}if(kind==='glass'){x.lineWidth=5;x.strokeStyle='#777777';x.strokeRect(4,4,120,120);x.beginPath();x.moveTo(64,0);x.lineTo(64,128);x.stroke();}}
  if(kind==='solar'){x.fillStyle='#9c9c9c';x.fillRect(0,0,128,128);x.strokeStyle='#eeeeee';x.lineWidth=2;for(let i=0;i<=128;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.moveTo(0,i);x.lineTo(128,i);x.stroke();}x.lineWidth=5;x.strokeRect(2,2,124,124);}
  if(kind==='biology'){x.strokeStyle='#777777';for(let i=0;i<20;i++){x.beginPath();x.ellipse(random()*128,random()*128,5+random()*12,4+random()*8,random()*3,0,Math.PI*2);x.stroke();}}
  if(kind==='rubber'){x.lineWidth=6;x.strokeStyle='#656565';for(let i=-128;i<256;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i+128,128);x.stroke();}}
  const t=new THREE.CanvasTexture(c);textures.set(kind,t);return t;
 }
 return function decorate(mesh,record){
  if(!validDetailRecord(record)||!record||!mesh?.geometry||mesh.userData.detailDecorated)return mesh;
  if(record.geometry){const g=record.geometry;if(g.type==='sphere')mesh.geometry=new THREE.SphereGeometry(Math.max(.01,g.radius||1),20,16);else mesh.geometry=new THREE.CylinderGeometry(g.radiusTop??1,g.radiusBottom??1,Math.max(.01,g.height||1),32);}
  const gp=mesh.geometry.parameters,geometry=mesh.geometry.type==='SphereGeometry'?{type:'sphere',radius:gp.radius}:mesh.geometry.type==='CylinderGeometry'?{type:'cylinder',radiusTop:gp.radiusTop,radiusBottom:gp.radiusBottom,height:gp.height}:undefined;
  mesh.userData.detailedPart={kind:record.kind,assembly:record.assembly,...(geometry?{geometry}:{})};mesh.userData.detailDecorated=true;
  const t=texture(record.kind),color=mesh.material.color.getHex();
  mesh.material=new THREE.MeshPhongMaterial({color,map:t,bumpMap:t,bumpScale:['stone','rock','wood'].includes(record.kind)?.12:.06,shininess:['metal','glass','solar','water','crystal'].includes(record.kind)?75:8,...(record.kind==='lava'?{emissive:color,emissiveIntensity:.3}:{})});
  const p=mesh.geometry.parameters,w=p.width||1,h=p.height||1,d=p.depth||1;
  if(mesh.geometry.type!=='BoxGeometry')return mesh;
  const accent=new THREE.MeshPhongMaterial({color:record.kind==='rock'?new THREE.Color(color).multiplyScalar(.8):record.kind==='wood'?0x493323:record.kind==='metal'?0x394954:0xb3b0a4,shininess:record.kind==='rock'?3:35});
  const add=(geometry,x,y,z)=>{const child=new THREE.Mesh(geometry,accent);child.position.set(x,y,z);child.raycast=()=>{};child.userData.detailDecoration=true;mesh.add(child);};
  if(record.kind==='metal'||record.kind==='wood'){
   for(const side of [-1,1])for(const a of [-1,1])for(const b of [-1,1])add(new THREE.SphereGeometry(.045,6,4),a*w*.36,b*h*.36,side*(d/2+.012));
   for(const y of [-h*.32,h*.32])for(const side of [-1,1])add(new THREE.BoxGeometry(w*.86,.07,.045),0,y,side*(d/2+.012));
  }else if(record.kind==='rock'){
   for(const side of [-1,1])for(let i=0;i<3;i++)add(new THREE.DodecahedronGeometry(Math.min(w,h)*.065,0),(i-1)*w*.27,(i%2-.5)*h*.4,side*(d/2+.012));
  }else if(['glass','solar'].includes(record.kind)){
   for(const a of [-1,1])add(new THREE.BoxGeometry(.055,h+.025,d+.025),a*w*.47,0,0);
   for(const b of [-1,1])add(new THREE.BoxGeometry(w+.025,.055,d+.025),0,b*h*.47,0);
  }else if(record.kind==='stone'&&h>1){
   for(const y of [-h/2+.06,h/2-.06])add(new THREE.BoxGeometry(w+.035,.12,d+.035),0,y,0);
  }
  return mesh;
 };
}
