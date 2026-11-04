import test from 'node:test';import assert from 'node:assert/strict';
import {createStoryProject,parseStoryProject,validateStoryProject} from '../../js/persistence/builder-story-project.mjs';
const header=Buffer.alloc(33);header.set([137,80,78,71,13,10,26,10]);header.write('IHDR',12);header.writeUInt32BE(800,16);header.writeUInt32BE(450,20);
const image='data:image/png;base64,'+header.toString('base64');
const scene=(caption='A discovery')=>({image,caption,position:'top',duration:'5'});
test('editable project roundtrip retains clean source images, captions, ordering and per-frame timing',()=>{
 const saved=createStoryProject({name:' My experiment ',selected:1,frames:[scene('First'),{...scene('Second'),position:'bottom',duration:'auto'}]});const reopened=parseStoryProject(JSON.stringify(saved));assert.equal(reopened.name,'My experiment');assert.equal(reopened.selected,1);assert.deepEqual(reopened.frames,saved.frames);assert.equal(reopened.frames[0].image,image);
});
test('unsupported files and oversized image dimensions are rejected before image decoding',()=>{
 const good=createStoryProject({name:'Test',selected:0,frames:[scene()]});
 for(const bad of [{...good,version:2},{...good,frames:[]},{...good,frames:Array(25).fill(scene())},{...good,frames:[{...scene(),image:'https://example.com/image.png'}]},{...good,frames:[{...scene(),caption:'a'.repeat(181)}]},{...good,frames:[{...scene(),duration:'Infinity'}]}])assert.throws(()=>validateStoryProject(bad));
 const huge=Buffer.from(header);huge.writeUInt32BE(100000,16);assert.throws(()=>validateStoryProject({...good,frames:[{...scene(),image:'data:image/png;base64,'+huge.toString('base64')}]}));assert.throws(()=>parseStoryProject('not json'));
});
