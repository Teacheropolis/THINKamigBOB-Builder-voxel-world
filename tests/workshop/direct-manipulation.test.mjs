import test from 'node:test';
import assert from 'node:assert/strict';
import {selectionRectangle,enclosedObjects,snappedTranslation,installDirectManipulation} from '../../js/editing/direct-manipulation.mjs';

function harness(){
  class Target{
    listeners=new Map();
    addEventListener(type,fn){const list=this.listeners.get(type)||[];list.push(fn);this.listeners.set(type,list);}
    removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)||[]).filter(f=>f!==fn));}
    fire(type,values={}){const event={type,target:canvas,button:0,detail:1,clientX:0,clientY:0,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...values};for(const fn of this.listeners.get(type)||[]){fn(event);if(event.stopped)break;}return event;}
  }
  const doc=new Target(),canvas=new Target(),win=new Target();
  const timers=new Map();let timer=0,selection=[],moves=[],deleted=[],replayed=0,cancelled=0,finished=0,active=true;
  win.setTimeout=fn=>{timers.set(++timer,fn);return timer;};win.clearTimeout=id=>timers.delete(id);
  win.MouseEvent=class{constructor(type,props){Object.assign(this,props);this.type=type;}preventDefault(){}stopImmediatePropagation(){this.stopped=true;}};
  canvas.dispatchEvent=e=>{doc.fire(e.type,e);if(!e.stopped)replayed++;};
  const a={id:'a'},b={id:'b'},groundTargets=[];
  const controller=installDirectManipulation({canvas,document:doc,window:win,isActive:()=>active,
    pick:e=>e.clientX>=40 && e.clientX<=60?a:null,getSelection:()=>selection,setSelection:s=>{selection=s;},
    projectObjects:()=>[{object:a,bounds:{left:40,right:60,top:40,bottom:60}},{object:b,bounds:{left:70,right:90,top:40,bottom:60}}],
    groundPoint:(e,hit)=>{groundTargets.push(hit);return {x:e.clientX/10,z:e.clientY/10};},beginMove:objects=>({objects}),
    previewMove:(move,delta)=>{moves.push(delta);return delta.x<10;},finishMove:()=>{finished++;return true;},
    cancelMove:()=>{cancelled++;},deleteBlock:object=>deleted.push(object),
    showRectangle(){},hideRectangle(){},announce(){}});
  return {doc,canvas,win,a,b,controller,timers,moves,deleted,groundTargets,get selected(){return selection;},get replayed(){return replayed;},get cancelled(){return cancelled;},get finished(){return finished;},setActive:v=>{active=v;},flush(){for(const [id,fn]of [...timers]){timers.delete(id);fn();}}};
}

test('marquee selection encloses full objects, supports reverse drawing and excludes partial intersections',()=>{
 const r=selectionRectangle({x:100,y:100},{x:10,y:10});
 assert.deepEqual(enclosedObjects(r,[{object:'inside',bounds:{left:20,top:20,right:80,bottom:80}},{object:'partial',bounds:{left:0,top:20,right:80,bottom:80}},{object:'behind',bounds:null}]),['inside']);
});
test('group movement uses a single snapped translation without changing internal spacing',()=>{
 assert.deepEqual(snappedTranslation({x:1.5,z:-3},{x:4.7,z:0.6},1),{x:3,z:4});
 assert.deepEqual(snappedTranslation({x:0,z:0},{x:.24,z:-.51},.25),{x:.25,z:-.5});
 assert.equal(snappedTranslation(null,{x:1,z:1}),null);
});
test('double-click deletes the hit block without replaying either placement click',()=>{
 const h=harness();
 for(const detail of [1,2]){h.doc.fire('mousedown',{clientX:50,detail});h.doc.fire('mouseup',{clientX:50,detail});h.doc.fire('click',{clientX:50,detail});}
 h.doc.fire('dblclick',{clientX:50,detail:2});h.flush();
 assert.deepEqual(h.deleted,[h.a]);assert.equal(h.replayed,0);
});
test('single block click replays the established placement behavior once',()=>{
 const h=harness();h.doc.fire('mousedown',{clientX:50});h.doc.fire('mouseup',{clientX:50});h.doc.fire('click',{clientX:50});h.flush();assert.equal(h.replayed,1);
});
test('box drag selects both enclosed blocks and dragging either moves the group once',()=>{
 const h=harness();h.doc.fire('mousedown',{clientX:10,clientY:10});h.doc.fire('mousemove',{clientX:100,clientY:100});h.doc.fire('mouseup',{clientX:100,clientY:100});h.flush();assert.deepEqual(h.selected,[h.a,h.b]);
 h.doc.fire('mousedown',{clientX:50,clientY:50});h.doc.fire('mousemove',{clientX:80,clientY:60});h.doc.fire('mouseup',{clientX:80,clientY:60});
 assert.deepEqual(h.selected,[h.a,h.b]);assert.deepEqual(h.moves,[{x:3,z:1}]);assert.equal(h.finished,1);
});
test('Escape, pointer cancellation and loss of readiness cancel unfinished movement',()=>{
 for(const reason of ['escape','pointer','inactive']){
  const h=harness();h.doc.fire('mousedown',{clientX:50});h.doc.fire('mousemove',{clientX:80});
  if(reason==='escape')h.doc.fire('keydown',{key:'Escape'});
  if(reason==='pointer')h.canvas.fire('pointercancel');
  if(reason==='inactive'){h.setActive(false);h.doc.fire('mousemove',{clientX:90});}
  assert.equal(h.cancelled,1);assert.equal(h.finished,0);assert.deepEqual(h.selected,[]);
 }
});
test('invalid drop restores the group; Alt-drag and UI controls retain their input',()=>{
 const h=harness();h.doc.fire('mousedown',{clientX:50});h.doc.fire('mousemove',{clientX:180});h.doc.fire('mouseup',{clientX:180});assert.equal(h.cancelled,1);assert.equal(h.finished,0);
 assert.equal(h.doc.fire('mousedown',{clientX:50,altKey:true}).stopped,undefined);
 assert.equal(h.doc.fire('mousedown',{target:{},clientX:50}).stopped,undefined);
});
test('opening a UI control cancels a deferred placement',()=>{
 const h=harness();h.doc.fire('click',{clientX:50});h.doc.fire('mousedown',{target:{}});h.flush();assert.equal(h.replayed,0);
});
test('marquee does not select occluded blocks even when their bounds fit',()=>{const bounds={left:20,top:20,right:80,bottom:80};assert.deepEqual(enclosedObjects({left:0,top:0,right:100,bottom:100},[{object:'front',bounds,visible:true},{object:'hidden',bounds,visible:false}]),['front']);});
test('Escape clears a finished selection, not only an active gesture',()=>{const h=harness();h.doc.fire('mousedown',{clientX:10,clientY:10});h.doc.fire('mousemove',{clientX:100,clientY:100});h.doc.fire('mouseup',{clientX:100,clientY:100});h.flush();assert.equal(h.selected.length,2);h.doc.fire('keydown',{key:'Escape'});assert.deepEqual(h.selected,[]);});

test('drag projection uses the same clicked block elevation at both ends',()=>{const h=harness();h.doc.fire('mousedown',{clientX:50,clientY:50});h.doc.fire('mousemove',{clientX:80,clientY:60});h.doc.fire('mouseup',{clientX:80,clientY:60});assert.ok(h.groundTargets.length>=2);assert.ok(h.groundTargets.every(hit=>hit===h.a));});
