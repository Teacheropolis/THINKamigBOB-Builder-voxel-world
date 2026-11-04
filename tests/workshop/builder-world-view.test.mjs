import test from 'node:test';
import assert from 'node:assert/strict';
import {nextWorldChallenge,toggleWorldPanel} from '../../js/ui/builder-world-view-model.mjs';
test('the next challenge skips template-only items and completed work',()=>{
 const points=[{text:'Template includes walls',disabled:true},{text:'Build four towers',complete:true},{text:'Make an entrance',complete:false},{text:'Try a new idea',complete:false}];
 const result=nextWorldChallenge(points);assert.equal(result.next,points[2]);assert.equal(result.complete,1);assert.equal(result.total,3);
});
test('completed missions retain a friendly invitation to keep creating',()=>{
 const result=nextWorldChallenge([{text:'Build',complete:true}]);assert.equal(result.next,null);assert.equal(result.total,1);assert.match(result.text,/improvement/);
});
test('opening a different drawer replaces the prior drawer and selecting it again closes it',()=>{
 assert.equal(toggleWorldPanel(null,'blocks'),'blocks');assert.equal(toggleWorldPanel('blocks','tools'),'tools');assert.equal(toggleWorldPanel('tools','tools'),null);
});
