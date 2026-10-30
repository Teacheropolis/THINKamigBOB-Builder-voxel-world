import test from 'node:test';
import assert from 'node:assert/strict';
import {builderMaterialKind,createBuilderMaterialTextures} from '../../js/editing/builder-material-textures.mjs';
function system(){
 const ctx={fillRect(){},beginPath(){},ellipse(){},stroke(){}};
 let made=0;
 return createBuilderMaterialTextures({THREE:{CanvasTexture:class{constructor(canvas){this.canvas=canvas;this.id=++made;}},NearestFilter:1,NearestMipmapLinearFilter:2,RepeatWrapping:3},document:{createElement:()=>({getContext:()=>ctx,toDataURL:()=> 'data:image/png;base64,test'})}});
}
const object=color=>({material:{color:{getHex:()=>color},map:null}});
test('each hotbar color resolves to its material and custom colors remain available',()=>{
 assert.deepEqual([0xcccccc,0x8b4513,0xb22222,0x228b22,0x1e90ff,0xffd700].map(builderMaterialKind),['stone','wood','brick','grass','water','gold']);
 assert.equal(builderMaterialKind(0xff00ff),null);
});
test('blocks and placement preview share cached textures while saved block colors stay unchanged',()=>{
 const textures=system(),a=object(0x8b4513),b=object(0x8b4513);
 textures.apply(a);textures.apply(b);
 assert.equal(a.material.map,b.material.map);
 assert.equal(a.material.map,textures.textureForColor(0x8b4513));
 assert.equal(a.material.color.getHex(),0x8b4513);
 const restored=object(a.material.color.getHex());textures.apply(restored);
 assert.equal(restored.material.map,a.material.map);
 assert.notEqual(textures.textureForColor(0xcccccc),a.material.map);
});
test('existing authored image materials are preserved',()=>{
 const textures=system(),mesh=object(0xcccccc),authored={name:'imported-image'};
 mesh.material.map=authored;assert.equal(textures.apply(mesh),false);assert.equal(mesh.material.map,authored);
});
test('changing a textured block to a custom color removes its old material pattern',()=>{
 const textures=system(),mesh=object(0xcccccc);textures.apply(mesh);assert.ok(mesh.material.map);
 mesh.material.color.getHex=()=>0xff00ff;textures.apply(mesh);assert.equal(mesh.material.map,null);
});
