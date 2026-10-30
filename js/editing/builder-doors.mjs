export function doorOpenPose(position,rotationY){
  const angle=rotationY+Math.PI/2;
  return {position:{x:position.x-.5*Math.cos(rotationY)+.5*Math.cos(angle),y:position.y,z:position.z+.5*Math.sin(rotationY)-.5*Math.sin(angle)},rotationY:angle};
}
export function doorPlacement({point,normal,top,platform,obstacles=[],rotationY=0}){
  if(!point || ![point.x,point.z,top,rotationY].every(Number.isFinite) || !normal || normal.y<.7)return {valid:false};
  const position={x:Math.round(point.x),y:top+1,z:Math.round(point.z)};
  const side=Math.abs(Math.sin(rotationY))>.5;
  const half={x:side?.09:.5,y:1,z:side?.5:.09};
  const bounds={min:{},max:{}};for(const axis of ['x','y','z']){bounds.min[axis]=position[axis]-half[axis];bounds.max[axis]=position[axis]+half[axis];}
  const overlap=(a,b)=>['x','y','z'].every(axis=>Math.min(a.max[axis],b.max[axis])-Math.max(a.min[axis],b.min[axis])>1e-5);
  const inside=bounds.min.x>=platform.min.x && bounds.max.x<=platform.max.x && bounds.min.z>=platform.min.z && bounds.max.z<=platform.max.z && bounds.min.y>=platform.max.y-1e-5;
  return {valid:inside && !obstacles.some(b=>overlap(bounds,b)),position,bounds,face:{axis:'y',sign:1}};
}
export function canCloseDoor(closedBounds,playerBounds){
  return !playerBounds || !['x','y','z'].every(axis=>Math.min(closedBounds.max[axis],playerBounds.max[axis])-Math.max(closedBounds.min[axis],playerBounds.min[axis])>1e-5);
}
