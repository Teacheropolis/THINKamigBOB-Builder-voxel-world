export function clickedSelection(selection,hit,additive=false){
 if(!hit)return [];
 if(!additive)return selection.length===1&&selection[0]===hit?[]:[hit];
 return selection.includes(hit)?selection.filter(object=>object!==hit):[...selection,hit];
}
export function duplicateOffset(bounds,obstacles,platform){
 const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-5);
 for(let distance=1;distance<=60;distance++)for(const [x,z]of [[distance,0],[-distance,0],[0,distance],[0,-distance],[distance,distance],[-distance,-distance]]){
  const shifted=bounds.map(b=>({min:{x:b.min.x+x,y:b.min.y,z:b.min.z+z},max:{x:b.max.x+x,y:b.max.y,z:b.max.z+z}}));
  if(shifted.every(b=>b.min.x>=platform.min.x&&b.max.x<=platform.max.x&&b.min.z>=platform.min.z&&b.max.z<=platform.max.z&&!obstacles.some(other=>overlap(b,other))))return {x,z};
 }
 return null;
}
