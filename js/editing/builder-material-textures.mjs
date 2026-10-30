const materialColors=new Map([
  [0xcccccc,'stone'],[0x808080,'stone'],[0x999999,'stone'],
  [0x8b4513,'wood'],[0x654321,'wood'],[0xb22222,'brick'],
  [0x228b22,'grass'],[0x1e90ff,'water'],[0xffd700,'gold']
]);
export const builderMaterialKind=color=>materialColors.get(Number(color)) || null;

// Grayscale textures multiply the existing block color. Saved color values stay unchanged.
export function drawMaterialTexture(canvas,kind){
  canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');
  let seed=8137;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const gray=value=>`rgb(${value},${value},${value})`;
  const rect=(x,y,w,h,value)=>{ctx.fillStyle=gray(value);ctx.fillRect(x,y,w,h);};
  rect(0,0,64,64,kind==='gold'?228:218);
  if(kind==='stone'){
    for(let y=0;y<64;y+=16)for(let x=-16;x<64;x+=32){const offset=(y/16)%2?16:0;rect(x+offset,y,31,15,182+Math.floor(random()*55));rect(x+offset,y,31,1,244);rect(x+offset,y+14,31,2,140);rect(x+offset+30,y,2,16,150);}
    for(let i=0;i<150;i++)rect(Math.floor(random()*64),Math.floor(random()*64),1+Math.floor(random()*3),1,145+Math.floor(random()*105));
  }else if(kind==='wood'){
    for(let x=0;x<64;x+=16){rect(x,0,1,64,115);rect(x+1,0,1,64,250);}
    for(let i=0;i<55;i++){const x=Math.floor(random()*64);rect(x,Math.floor(random()*64),1,5+Math.floor(random()*23),150+Math.floor(random()*90));}
    ctx.strokeStyle=gray(120);ctx.lineWidth=1;
    for(const [x,y]of [[10,18],[39,47]]){ctx.beginPath();ctx.ellipse(x,y,3,7,0,0,Math.PI*2);ctx.stroke();}
  }else if(kind==='brick'){
    rect(0,0,64,64,120);
    for(let y=0;y<64;y+=16)for(let x=-16;x<64;x+=32){const offset=(y/16)%2?16:0;rect(x+offset+1,y+1,29,13,190+Math.floor(random()*45));rect(x+offset+2,y+2,27,1,250);rect(x+offset+2,y+12,27,1,160);}
    for(let i=0;i<95;i++)rect(Math.floor(random()*64),Math.floor(random()*64),1,1,160+Math.floor(random()*80));
  }else if(kind==='grass'){
    for(let i=0;i<550;i++){const x=Math.floor(random()*64),y=Math.floor(random()*64);rect(x,y,1+Math.floor(random()*3),2+Math.floor(random()*5),130+Math.floor(random()*125));}
  }else if(kind==='water'){
    for(let y=0;y<64;y+=8){for(let x=0;x<64;x++){const wave=Math.round(Math.sin(x/7+y)*2);rect(x,y+wave,1,2,240);rect(x,y+wave+3,1,2,174);}}
    for(let i=0;i<35;i++)rect(Math.floor(random()*64),Math.floor(random()*64),3,1,255);
  }else if(kind==='gold'){
    rect(0,0,64,2,255);rect(0,0,2,64,255);rect(0,62,64,2,135);rect(62,0,2,64,135);
    for(let i=0;i<85;i++)rect(Math.floor(random()*64),Math.floor(random()*64),3+Math.floor(random()*12),1,193+Math.floor(random()*62));
    for(const x of [5,55])for(const y of [5,55]){rect(x,y,4,4,140);rect(x,y,3,1,255);}
  }
  return canvas;
}

export function createBuilderMaterialTextures({THREE,document}){
  const cache=new Map();const originals=new WeakMap();
  const get=kind=>{
    if(!cache.has(kind)){
      const canvas=drawMaterialTexture(document.createElement('canvas'),kind);
      const texture=new THREE.CanvasTexture(canvas);
      texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
      texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
      texture.userData={builderMaterialTexture:true};
      cache.set(kind,{canvas,texture});
    }
    return cache.get(kind);
  };
  const textureForColor=color=>{const kind=builderMaterialKind(color);return kind?get(kind).texture:null;};
  const apply=object=>{
    const material=object?.material;
    if(!material || Array.isArray(material) || !material.color?.getHex)return false;
    if(!originals.has(material))originals.set(material,material.map || null);
    const original=originals.get(material);
    // Preserve authored image materials on imported objects.
    if(original && !original.userData?.builderMaterialTexture)return false;
    const texture=textureForColor(material.color.getHex());
    if(material.map!==texture){material.map=texture;material.needsUpdate=true;}
    return !!texture;
  };
  return {apply,textureForColor,swatchBackground(color){const kind=builderMaterialKind(color);return kind?'url("'+get(kind).canvas.toDataURL()+'")':'';}};
}
