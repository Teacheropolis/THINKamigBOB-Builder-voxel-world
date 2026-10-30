// BOB is a scene-only guide: never included in editable blocks or saved builds.
export function createBobAvatar(THREE,scene){
 const root=new THREE.Group();root.name='Explore BOB';root.visible=false;scene.add(root);
 const material=color=>new THREE.MeshPhongMaterial({color,shininess:35});
 const brass=material(0xc49a49),coat=material(0x315758),skin=material(0xb7c8c9),dark=material(0x33302a),white=material(0xe6e1cd),lens=material(0x67d9df);
 function box(parent,w,h,d,x,y,z,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 box(root,.58,.62,.32,0,1.02,0,coat);box(root,.62,.1,.35,0,.75,0,brass);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.29,16,12),skin);head.position.set(0,1.55,0);root.add(head);box(root,.55,.1,.48,0,1.79,0,brass);box(root,.42,.2,.4,0,1.9,0,dark);
 for(const side of [-1,1]){box(root,.2,.16,.08,side*.13,1.6,-.24,brass);box(root,.13,.1,.09,side*.13,1.6,-.29,lens);box(root,.13,.1,.08,side*.17,1.4,-.24,white);}
 box(root,.16,.09,.07,0,1.43,-.25,white);box(root,.4,.4,.17,0,1.04,.23,dark);box(root,.18,.18,.05,.17,1.13,-.19,brass);
 const limbs=[];for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.4,1.28,0);root.add(arm);box(arm,.18,.46,.22,0,-.21,0,coat);box(arm,.18,.14,.22,0,-.49,0,skin);const leg=new THREE.Group();leg.position.set(side*.17,.72,0);root.add(leg);box(leg,.23,.48,.25,0,-.24,0,dark);box(leg,.25,.16,.35,0,-.64,-.04,dark);limbs.push({arm,leg,side});}
 let phase=0;
 return {root,update(position,yaw,moving,dt){root.visible=true;root.position.set(position.x,position.y+.02,position.z);root.rotation.y=yaw;phase+=moving?dt*10:0;for(const {arm,leg,side}of limbs){const swing=moving?Math.sin(phase)*.55*side:0;arm.rotation.x=swing;leg.rotation.x=-swing;}},hide(){root.visible=false;}};
}
