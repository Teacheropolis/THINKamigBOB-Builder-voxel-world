import test from 'node:test';import assert from 'node:assert/strict';
import {buildingTipPool,nextBuildingTip} from '../../js/guidance/bob-building-tips.mjs';
test('tips follow the mission and only present object features',()=>{const pool=buildingTipPool('Dragon Lair',['water','wood']);assert(pool.some(s=>s.includes('dragon')));assert(pool.some(s=>s.includes('water')));assert(!pool.some(s=>s.includes('energy equipment')));});
test('tips never repeat immediately and handle extreme random value',()=>{assert.equal(nextBuildingTip(['a','b'],'a',()=>0),'b');assert.equal(nextBuildingTip(['a'],'a'),'a');});
