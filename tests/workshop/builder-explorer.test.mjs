import test from 'node:test';
import assert from 'node:assert/strict';
import {createBuilderExplorer,explorerSpawn} from '../../js/editing/builder-explorer.mjs';
const platform={min:{x:-25,y:-1.5,z:-25},max:{x:25,y:-.5,z:25}};
const wall={min:{x:-2,y:-.5,z:-2},max:{x:2,y:3,z:-1}};
const tick=(walker,input,seconds=1,yaw=0)=>{for(let i=0;i<seconds*100;i++)walker.step(input,.01,yaw);return walker.read();};
test('walks relative to the view and normalizes diagonal speed',()=>{
 const a=createBuilderExplorer({spawn:{x:0,y:-.5,z:5},platform});
 const b=createBuilderExplorer({spawn:{x:0,y:-.5,z:5},platform});
 const straight=tick(a,{forward:true}),diagonal=tick(b,{forward:true,right:true});
 assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z-5)-Math.abs(straight.z-5))<1e-6);
 const c=createBuilderExplorer({spawn:{x:0,y:-.5,z:5},platform});assert.ok(tick(c,{forward:true},1,Math.PI/2).x<-3.9);
});
test('solid walls block movement without blocking sliding along their face',()=>{
 const walker=createBuilderExplorer({spawn:{x:0,y:-.5,z:1},platform,obstacles:[wall]});
 const stopped=tick(walker,{forward:true},1);assert.ok(stopped.z>=-.730001);assert.equal(stopped.y,-.5);
 const slide=tick(walker,{forward:true,right:true},.3);assert.ok(slide.x>.8);
});
test('jump lands on a one-block step and gravity returns to the ground',()=>{
 const step={min:{x:-1,y:-.5,z:-1},max:{x:1,y:.5,z:0}};
 const walker=createBuilderExplorer({spawn:{x:0,y:-.5,z:.6},platform,obstacles:[step]});
 walker.step({jump:true},.01);const landed=tick(walker,{forward:true},.36);
 assert.ok(landed.y>.5);
 const standing=tick(walker,{},.6);assert.ok(Math.abs(standing.y-.5)<1e-6);assert.equal(standing.grounded,true);
 const ground=createBuilderExplorer({spawn:{x:0,y:-.5,z:2},platform});ground.step({jump:true},.01);assert.equal(tick(ground,{},1.2).y,-.5);
});
test('ceiling collision cancels upward velocity; a held jump does not repeat',()=>{
 const ceiling={min:{x:-2,y:1.5,z:-2},max:{x:2,y:2,z:2}};
 const walker=createBuilderExplorer({spawn:{x:0,y:-.5,z:0},platform,obstacles:[ceiling]});
 let peak=-.5;for(let i=0;i<150;i++)peak=Math.max(peak,walker.step({jump:true},.01).y);
 assert.ok(peak<=-.2+1e-6);assert.equal(walker.read().grounded,true);
});
test('platform edges are bounded, long frames are clamped, and reset returns to spawn',()=>{
 const walker=createBuilderExplorer({spawn:{x:24,y:-.5,z:0},platform});
 assert.ok(walker.step({right:true},100).x<=24.21);
 assert.ok(tick(walker,{right:true},2).x<=24.73+1e-6);
 assert.deepEqual(walker.reset(),{x:24,y:-.5,z:0,velocityY:0,grounded:true});
});
test('spawn starts on a supporting floor without intersecting it',()=>{
 const floor={min:{x:-20,y:-.5,z:-20},max:{x:20,y:.5,z:20}};
 const spawn=explorerSpawn(platform,[floor]);assert.equal(spawn.y,.5);
});
