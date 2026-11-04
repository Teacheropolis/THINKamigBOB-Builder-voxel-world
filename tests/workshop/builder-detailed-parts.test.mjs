import test from 'node:test';
import assert from 'node:assert/strict';
import {detailKind,validDetailRecord} from '../../js/editing/builder-detailed-parts.mjs';
test('authored parts identify material families without changing the block palette',()=>{assert.equal(detailKind(0xcccccc),'stone');assert.equal(detailKind(0x654321),'wood');assert.equal(detailKind(0xffd700),'metal');});
test('saved detail metadata accepts supported parts and rejects malformed records',()=>{assert.ok(validDetailRecord(undefined));assert.ok(validDetailRecord({kind:'stone',assembly:'castle-1'}));assert.ok(!validDetailRecord({kind:'unknown',assembly:'x'}));assert.ok(!validDetailRecord({kind:'wood',assembly:42}));});

import {readFileSync} from 'node:fs';
import {DETAILED_LIBRARY_CREATORS,DETAILED_MISSION_CREATORS,installDetailedCatalog} from '../../js/editing/builder-detail-catalog.mjs';
import {starterDetailManifest} from '../../js/editing/builder-starter-detail-manifest.mjs';
test('every library action and mission launcher receives authored detail',()=>{
 const html=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
 for(const [,name]of html.matchAll(/onclick="((?:add|build)[A-Za-z]+)\(\)/g))assert.ok(DETAILED_LIBRARY_CREATORS.includes(name),name);
 for(const [,name]of html.matchAll(/chooseStartWorld\('(\w+)'/g))assert.ok(DETAILED_MISSION_CREATORS.includes(name),name);
});
test('dragon rock and lava use distinct surfaces and old dragon starter parts can be recognized',()=>{assert.equal(detailKind(0x777777,'buildDragonLair'),'rock');assert.equal(detailKind(0xff4500,'buildDragonLair'),'lava');assert.equal(detailKind(0x1e90ff,'addSolarArray'),'solar');assert.equal(detailKind(0x228b22,'addCellWall'),'biology');assert.ok(starterDetailManifest.buildDragonLair.length>=14);});
test('catalog catches direct mesh creation and restores the prior context after failures',()=>{
 const blocks=[],children=[],prior={assembly:'prior'},target={builderDetailContext:prior,addRocks(){blocks.push({isMesh:true,userData:{},material:{color:{getHex:()=>0x777777}}});throw Error('test failure');}},decorated=[];
 installDetailedCatalog({target,getBlocks:()=>blocks,getScene:()=>({children}),decorate:(m,r)=>decorated.push(r),resolve:detailKind});
 assert.throws(()=>target.addRocks());assert.equal(decorated[0].kind,'rock');assert.equal(target.builderDetailContext,prior);
});
