const finitePoint=p=>p && ['x','y','z'].every(axis=>Number.isFinite(p[axis]));
export function dominantFace(normal){
  if(!finitePoint(normal))return null;
  const axis=['x','y','z'].reduce((best,key)=>Math.abs(normal[key])>Math.abs(normal[best])?key:best,'x');
  return Math.abs(normal[axis])>0?{axis,sign:normal[axis]>=0?1:-1}:null;
}
export function overlaps(left,right,epsilon=1e-5){
  return ['x','y','z'].every(axis=>Math.min(left.max[axis],right.max[axis])-Math.max(left.min[axis],right.min[axis])>epsilon);
}
export function facePlacement({point,normal,bounds,ground=false,obstacles=[],platform}){
  if(!finitePoint(point) || !finitePoint(bounds?.min) || !finitePoint(bounds?.max))return {valid:false};
  const face=ground?{axis:'y',sign:1}:dominantFace(normal);
  if(!face)return {valid:false};
  const snap=axis=>ground?Math.round(point[axis]):Math.round(point[axis]-(bounds.min[axis]+.5))+(bounds.min[axis]+.5);
  const position={x:snap('x'),y:Math.max(0,snap('y')),z:snap('z')};
  if(ground)position.y=bounds.max.y+.5;
  else position[face.axis]=(face.sign>0?bounds.max[face.axis]:bounds.min[face.axis])+face.sign*.5;
  const candidate={min:{},max:{}};
  for(const axis of ['x','y','z']){candidate.min[axis]=position[axis]-.5;candidate.max[axis]=position[axis]+.5;}
  const inside=platform && candidate.min.x>=platform.min.x-1e-5 && candidate.max.x<=platform.max.x+1e-5 &&
    candidate.min.z>=platform.min.z-1e-5 && candidate.max.z<=platform.max.z+1e-5 && candidate.min.y>=platform.max.y-1e-5;
  return {valid:!!inside && !obstacles.some(other=>overlaps(candidate,other)),position,face,bounds:candidate};
}
