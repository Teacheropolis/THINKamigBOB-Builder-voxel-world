const vector=v=>({x:v.x,y:v.y,z:v.z});
export const readObjectPose=object=>({position:vector(object.position),rotation:vector(object.rotation),scale:vector(object.scale)});
export function applyObjectPose(object,pose){object.position.set(pose.position.x,pose.position.y,pose.position.z);object.rotation.set(pose.rotation.x,pose.rotation.y,pose.rotation.z);object.scale.set(pose.scale.x,pose.scale.y,pose.scale.z);object.updateMatrixWorld(true);}
export function objectPoseMatches(object,pose){return !!pose&&['position','rotation','scale'].every(key=>['x','y','z'].every(axis=>Math.abs(object[key][axis]-pose[key][axis])<1e-8));}
// Transform the selection as one model and keep its bottom on the same surface.
export function planObjectTransform(THREE,objects,{factor=1,axis='x',angle=0}={},platform){
 if(!objects.length||!Number.isFinite(factor)||factor<=0||!Number.isFinite(angle)||!['x','y','z'].includes(axis))return {ok:false,message:'Select the pieces you want to change first.'};
 const bounds=new THREE.Box3();objects.forEach(object=>{object.updateMatrixWorld(true);bounds.union(new THREE.Box3().setFromObject(object));});
 const pivot=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(axis==='x'?1:0,axis==='y'?1:0,axis==='z'?1:0),angle);
 const entries=objects.map(object=>{
  const beforePose=readObjectPose(object),candidate=object.clone();
  candidate.position.sub(pivot).multiplyScalar(factor).applyQuaternion(rotation).add(pivot);candidate.scale.multiplyScalar(factor);candidate.quaternion.premultiply(rotation);candidate.updateMatrixWorld(true);
  return {object,beforePose,candidate};
 });
 const nextBounds=new THREE.Box3();entries.forEach(({candidate})=>nextBounds.union(new THREE.Box3().setFromObject(candidate)));
 const lift=bounds.min.y-nextBounds.min.y;nextBounds.translate(new THREE.Vector3(0,lift,0));
 const nextSize=nextBounds.getSize(new THREE.Vector3());
 if(![nextSize.x,nextSize.y,nextSize.z].every(Number.isFinite)||Math.max(nextSize.x,nextSize.y,nextSize.z)<.2||nextSize.y>80||entries.some(({candidate})=>['x','y','z'].some(a=>candidate.scale[a]<.01||candidate.scale[a]>100))){return {ok:false,message:'That size is too small or too large. Try the other size button.'};}
 if(platform&&(nextBounds.min.x<platform.min.x-.001||nextBounds.max.x>platform.max.x+.001||nextBounds.min.z<platform.min.z-.001||nextBounds.max.z>platform.max.z+.001)){return {ok:false,message:'Move the object farther from the platform edge, then try again.'};}
 return {ok:true,entries:entries.map(({object,beforePose,candidate})=>{candidate.position.y+=lift;return {object,before:beforePose.position,after:vector(candidate.position),beforePose,afterPose:readObjectPose(candidate)};}),beforeSize:vector(size),afterSize:vector(nextSize)};
}
