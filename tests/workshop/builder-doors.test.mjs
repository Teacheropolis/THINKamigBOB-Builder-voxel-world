import test from 'node:test';
import assert from 'node:assert/strict';
import {doorOpenPose,doorPlacement,canCloseDoor} from '../../js/editing/builder-doors.mjs';
import {createBuilderExplorer} from '../../js/editing/builder-explorer.mjs';
const platform={min:{x:-25,y:-1.5,z:-25},max:{x:25,y:-.5,z:25}};
const place=overrides=>doorPlacement({point:{x:0,z:0},normal:{y:1},top:-.5,platform,...overrides});
test('door placements rest on the floor, rotate, and reject blocked or unsupported positions',()=>{
 const door=place();assert.equal(door.valid,true);assert.equal(door.position.y,.5);assert.equal(door.bounds.max.y,1.5);
 assert.ok(place({rotationY:Math.PI/2}).bounds.max.z===.5);
 assert.equal(place({obstacles:[door.bounds]}).valid,false);
 assert.equal(place({normal:{y:0}}).valid,false);
 assert.equal(place({point:{x:25,z:0}}).valid,false);
});
test('opening pivots around the same hinge for both orientations',()=>{
 for(const angle of [0,Math.PI/2]){
  const p={x:3,y:.5,z:4},open=doorOpenPose(p,angle);
  assert.ok(Math.abs((p.x-.5*Math.cos(angle))-(open.position.x-.5*Math.cos(open.rotationY)))<1e-9);
  assert.ok(Math.abs((p.z+.5*Math.sin(angle))-(open.position.z+.5*Math.sin(open.rotationY)))<1e-9);
 }
});
test('closing cannot trap a player in the doorway',()=>{
 const door=place().bounds;
 assert.equal(canCloseDoor(door,{min:{x:-.27,y:-.5,z:-.27},max:{x:.27,y:1.2,z:.27}}),false);
 assert.equal(canCloseDoor(door,{min:{x:2,y:-.5,z:2},max:{x:2.5,y:1.2,z:2.5}}),true);
});
test('a closed door stops walking and an open leaf permits passage',()=>{
 const closed=place().bounds,obstacles=[closed];
 const walker=createBuilderExplorer({spawn:{x:0,y:-.5,z:2},platform,obstacles});
 for(let i=0;i<100;i++)walker.step({forward:true},.01);
 assert.ok(walker.read().z>=.36-1e-5);
 const pose=doorOpenPose({x:0,y:.5,z:0},0);
 obstacles.splice(0,1,{min:{x:pose.position.x-.09,y:-.5,z:pose.position.z-.5},max:{x:pose.position.x+.09,y:1.5,z:pose.position.z+.5}});
 for(let i=0;i<100;i++)walker.step({forward:true},.01);
 assert.ok(walker.read().z< -1);
});
