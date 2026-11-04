import test from 'node:test';
import assert from 'node:assert/strict';
import {facePlacement,dominantFace} from '../../js/editing/builder-face-placement.mjs';
const cube={min:{x:-.5,y:-.5,z:-.5},max:{x:.5,y:.5,z:.5}};
const platform={min:{x:-25,y:-1.5,z:-25},max:{x:25,y:-.5,z:25}};
const place=(changes={})=>facePlacement({point:{x:0,y:0,z:0},normal:{x:0,y:1,z:0},bounds:cube,obstacles:[cube],platform,...changes});
test('places against top and all four side faces without overlapping the original block',()=>{
 for(const [normal,position] of [
 [{x:0,y:1,z:0},{x:0,y:1,z:0}],
 [{x:1,y:0,z:0},{x:1,y:0,z:0}],
 [{x:-1,y:0,z:0},{x:-1,y:0,z:0}],
 [{x:0,y:0,z:1},{x:0,y:0,z:1}],
 [{x:0,y:0,z:-1},{x:0,y:0,z:-1}]
 ]){const r=place({normal});assert.equal(r.valid,true);assert.deepEqual(r.position,position);}
});
test('ground placement rests on the platform surface and snaps consistently',()=>{
 const r=place({ground:true,bounds:platform,point:{x:3.3,y:-.5,z:-2.8},obstacles:[]});
 assert.equal(r.valid,true);assert.deepEqual(r.position,{x:3,y:0,z:-3});
});
test('rejects occupied positions, the platform edge and building through its underside',()=>{
 const above={min:{x:-.5,y:.5,z:-.5},max:{x:.5,y:1.5,z:.5}};
 assert.equal(place({obstacles:[cube,above]}).valid,false);
 assert.equal(place({ground:true,bounds:platform,point:{x:25,y:-.5,z:0}}).valid,false);
 assert.equal(place({normal:{x:0,y:-1,z:0}}).valid,false);
});
test('aligns with a shifted block and the face of a larger structure',()=>{
 const shifted={min:{x:0,y:-.5,z:0},max:{x:1,y:.5,z:1}};
 assert.deepEqual(place({bounds:shifted,point:{x:.8,y:.5,z:.7},obstacles:[shifted]}).position,{x:.5,y:1,z:.5});
 const wall={min:{x:-3,y:-.5,z:-.5},max:{x:3,y:2.5,z:.5}};
 const r=place({bounds:wall,normal:{x:0,y:0,z:1},point:{x:1.6,y:1.2,z:.5},obstacles:[wall]});
 assert.equal(r.valid,true);assert.deepEqual(r.position,{x:1.5,y:1,z:1});
});
test('invalid geometry and empty normals do not produce a valid placement',()=>{
 assert.equal(place({point:{x:NaN,y:0,z:0}}).valid,false);
 assert.equal(dominantFace({x:0,y:0,z:0}),null);
 assert.equal(place({normal:{x:0,y:0,z:0}}).valid,false);
});
