import {explorerBodyBounds,explorerSpawn} from './builder-explorer.mjs';
const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-6);
export function sharedViewOrbit(position,direction,distance=10){
 const target={x:position.x+direction.x*distance,y:position.y+direction.y*distance,z:position.z+direction.z*distance};
 return {target,angle:Math.atan2(position.x-target.x,position.z-target.z),distance:Math.hypot(position.x-target.x,position.z-target.z),height:position.y};
}
export function sharedViewLook(direction){return {yaw:Math.atan2(-direction.x,-direction.z),pitch:Math.max(-1.15,Math.min(1.15,Math.asin(Math.max(-1,Math.min(1,direction.y)))))};}
export function explorerSpawnNear(platform,obstacles,eye,eyeHeight=1.5){
 const clamp=(v,k)=>Math.max(platform.min[k]+.28,Math.min(platform.max[k]-.28,v));
 const x=clamp(eye.x,'x'),z=clamp(eye.z,'z'),desiredFeet=eye.y-eyeHeight;
 const offsets=[[0,0]];for(let r=.5;r<=4;r+=.5)for(let i=0;i<16;i++)offsets.push([Math.cos(i*Math.PI/8)*r,Math.sin(i*Math.PI/8)*r]);
 for(const [dx,dz]of offsets){
  const point={x:clamp(x+dx,'x'),z:clamp(z+dz,'z')};
  const supports=[platform.max.y,...obstacles.filter(b=>point.x+.27>b.min.x&&point.x-.27<b.max.x&&point.z+.27>b.min.z&&point.z-.27<b.max.z&&b.max.y<=desiredFeet+.12).map(b=>b.max.y)].sort((a,b)=>b-a);
  for(const y of supports){const p={...point,y};if(!obstacles.some(b=>overlap(explorerBodyBounds(p),b)))return p;}
 }
 return explorerSpawn(platform,obstacles);
}
