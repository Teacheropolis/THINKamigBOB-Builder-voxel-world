// Rounded silver, brass and blue Inventor BOB, based on the Dance Lab artwork.
// Scene-only guide: never part of editable blocks or saved builds.
export function createBobAvatar(THREE,scene){
 const root=new THREE.Group();root.name='Inventor BOB';root.visible=false;scene.add(root);
 const mat=(color,shininess=80)=>new THREE.MeshPhongMaterial({color,shininess,specular:0x8294a5});
 const silver=mat(0x788a99),brass=mat(0xa87123),dark=mat(0x202b35),black=mat(0x07101e),white=mat(0xffffff),blue=new THREE.MeshPhongMaterial({color:0x007eea,emissive:0x004ca8,emissiveIntensity:.65,shininess:100});
 function sphere(parent,x,y,z,sx,sy,sz,material){const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
 function cylinder(parent,x,y,z,r,h,material,rotation=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),material);m.position.set(x,y,z);m.rotation.x=rotation;parent.add(m);return m;}
 function ring(parent,x,y,z,r,material){const m=new THREE.Mesh(new THREE.TorusGeometry(r,.025,8,24),material);m.position.set(x,y,z);parent.add(m);return m;}
 // Pear-shaped armor, gold waist and shoulder plates.
 sphere(root,0,.98,0,.36,.33,.25,silver);cylinder(root,0,.69,0,.25,.1,brass);sphere(root,0,.61,0,.25,.12,.18,dark);
 cylinder(root,0,1.28,0,.11,.14,dark);
 sphere(root,0,1.61,0,.4,.34,.32,silver);
 // Layered steel faceplate, helmet band and plated back create the published silhouette.
 sphere(root,0,1.54,-.075,.335,.26,.275,silver);
 for(const side of [-1,1]){sphere(root,side*.37,1.6,.01,.045,.2,.19,dark);sphere(root,side*.40,1.6,.01,.025,.18,.17,brass);}
 for(let i=0;i<10;i++){const angle=i*Math.PI/5;sphere(root,Math.sin(angle)*.28,1.81,Math.cos(angle)*.21,.014,.014,.014,dark);}
 for(const side of [-1,1])for(const y of [.85,1.13])sphere(root,side*.25,y,-.16,.018,.018,.018,brass);
 // Round ears and the riveted helmet seam wrap around the head.
 for(const side of [-1,1]){sphere(root,side*.38,1.6,0,.065,.17,.17,brass);sphere(root,side*.43,1.6,0,.035,.12,.12,dark);}
 for(let i=0;i<12;i++){const angle=i*Math.PI/6;sphere(root,Math.sin(angle)*.36,1.73,Math.cos(angle)*.27,.018,.018,.018,brass);}
 cylinder(root,0,1.99,0,.025,.16,dark);sphere(root,0,2.09,0,.065,.065,.065,blue);
 // Large blue eyes, dark pupils, bright highlights and a friendly curved smile.
 for(const side of [-1,1]){sphere(root,side*.14,1.62,-.275,.12,.13,.055,dark);sphere(root,side*.14,1.62,-.319,.09,.10,.025,blue);sphere(root,side*.14,1.63,-.342,.057,.069,.015,black);sphere(root,side*.16,1.67,-.355,.027,.027,.012,white);}
 const smilePoints=[];for(let i=0;i<=20;i++){const x=-.11+i*.011;smilePoints.push(new THREE.Vector3(x,1.43+.045*(x/.11)**2,-.277));}
 root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smilePoints),20,.009,6,false),dark));
 // The glowing B badge is visible on the front, with a matching back power core.
 for(const side of [-1,1]){sphere(root,0,1.0,side*.23,.15,.15,.025,dark);ring(root,0,1.0,side*.26,.145,brass);sphere(root,0,1.0,side*.26,.112,.112,.018,blue);}
 const badgeCanvas=document.createElement('canvas');badgeCanvas.width=badgeCanvas.height=128;const ctx=badgeCanvas.getContext('2d');ctx.fillStyle='#b9f4ff';ctx.font='bold 100px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('B',64,66);const badgeMap=new THREE.CanvasTexture(badgeCanvas);const badge=new THREE.Mesh(new THREE.PlaneGeometry(.19,.19),new THREE.MeshBasicMaterial({map:badgeMap,transparent:true,depthWrite:false}));badge.position.set(0,1,-.285);badge.rotation.y=Math.PI;root.add(badge);
 const limbs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.37,1.17,0);root.add(arm);
  sphere(arm,0,0,0,.13,.14,.14,brass);sphere(arm,side*.01,-.03,0,.11,.1,.14,silver);
  cylinder(arm,0,-.2,0,.075,.2,silver);sphere(arm,0,-.32,0,.08,.08,.08,dark);cylinder(arm,0,-.43,0,.105,.18,silver);cylinder(arm,0,-.35,0,.108,.035,brass);cylinder(arm,0,-.51,0,.108,.035,brass);ring(arm,0,-.43,-.09,.06,brass);sphere(arm,0,-.57,-.015,.105,.12,.10,silver);
  for(let finger=0;finger<3;finger++)sphere(arm,(finger-1)*.055,-.61,-.09,.023,.045,.025,brass);
  const leg=new THREE.Group();leg.position.set(side*.17,.61,0);root.add(leg);
  cylinder(leg,0,-.13,0,.105,.22,silver);sphere(leg,0,-.27,0,.12,.10,.11,dark);sphere(leg,0,-.27,-.1,.075,.075,.035,brass);sphere(leg,0,-.27,-.13,.05,.05,.02,blue);cylinder(leg,0,-.4,0,.11,.18,silver);sphere(leg,0,-.55,-.07,.17,.09,.25,brass);sphere(leg,0,-.53,-.08,.16,.095,.24,silver);
  limbs.push({arm,leg,side});
 }
 let phase=0;
 return {root,update(position,yaw,moving,dt){root.visible=true;root.position.set(position.x,position.y+.03,position.z);root.rotation.y=yaw;phase+=moving?dt*10:0;for(const {arm,leg,side}of limbs){const swing=moving?Math.sin(phase)*.45*side:0;arm.rotation.x=swing;leg.rotation.x=-swing;}},hide(){root.visible=false;}};
}
