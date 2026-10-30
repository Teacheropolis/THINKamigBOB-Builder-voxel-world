export function selectionRectangle(start, end) {
  return {left:Math.min(start.x,end.x),top:Math.min(start.y,end.y),
    right:Math.max(start.x,end.x),bottom:Math.max(start.y,end.y)};
}

export function enclosedObjects(rectangle, projected) {
  return projected.filter(({bounds,visible}) => visible!==false && bounds &&
    bounds.left>=rectangle.left && bounds.right<=rectangle.right &&
    bounds.top>=rectangle.top && bounds.bottom<=rectangle.bottom).map(item=>item.object);
}

export function snappedTranslation(start, end, increment=1) {
  if (!start || !end || !Number.isFinite(increment) || increment<=0) return null;
  const x=Math.round((end.x-start.x)/increment)*increment;
  const z=Math.round((end.z-start.z)/increment)*increment;
  return Number.isFinite(x) && Number.isFinite(z)
    ? {x:Number(x.toFixed(4)),z:Number(z.toFixed(4))} : null;
}

// Owns mouse gestures on the render canvas only; scene changes stay in the host adapters.
export function installDirectManipulation({canvas,document:doc,window:win,isActive,
  pick,getSelection,setSelection,projectObjects,groundPoint,beginMove,previewMove,
  finishMove,cancelMove,deleteBlock,showRectangle,hideRectangle,announce,
  selectClick=()=>false,prepareInteraction=()=>{},onGestureChange=()=>{},increment=()=>1,clickDelay=500}) {
  let gesture=null, pendingClick=null, pendingTimer=null, swallowClick=false;
  const listeners=[];
  const listen=(target,type,handler)=>{
    target.addEventListener(type,handler,true);
    listeners.push(()=>target.removeEventListener(type,handler,true));
  };
  const consume=event=>{event.preventDefault();event.stopImmediatePropagation();};
  const point=event=>({x:event.clientX,y:event.clientY});
  const cancelClick=()=>{
    if(pendingTimer!==null) win.clearTimeout(pendingTimer);
    pendingTimer=null;pendingClick=null;
  };
  const flushClick=()=>{
    if(!pendingClick)return;
    const saved=pendingClick;cancelClick();
    if(!isActive())return;
    const replay=new win.MouseEvent('click',{bubbles:true,cancelable:true,
      clientX:saved.clientX,clientY:saved.clientY,button:0,detail:1,
      shiftKey:saved.shiftKey,ctrlKey:saved.ctrlKey,metaKey:saved.metaKey});
    Object.defineProperty(replay,'directManipulationReplay',{value:true});
    canvas.dispatchEvent(replay);
  };
  const abort=()=>{
    if(!gesture)return;
    if(gesture.kind==='move' && gesture.move)cancelMove(gesture.move);
    if(gesture.started)setSelection(gesture.selection);
    gesture=null;hideRectangle();onGestureChange(false);
  };
  listen(doc,'mousedown',event=>{
    if(event.target!==canvas || event.button!==0 || event.altKey || !isActive()){cancelClick();return;}
    if(event.detail>=2)cancelClick();else flushClick();
    const hit=pick(event);
    gesture={start:point(event),last:point(event),hit,selection:getSelection().slice(),
      kind:hit?'move':'rectangle',started:false,additive:event.shiftKey,
      ground:groundPoint(event,hit)};
    prepareInteraction();consume(event);
  });
  listen(doc,'mousemove',event=>{
    if(!gesture)return;
    if(!isActive()){abort();return;}
    const current=point(event);gesture.last=current;
    if(!gesture.started && Math.hypot(current.x-gesture.start.x,current.y-gesture.start.y)<6)return;
    if(!gesture.started){
      cancelClick();gesture.started=true;onGestureChange(true);
      if(gesture.kind==='move'){
        const objects=gesture.selection.includes(gesture.hit)?gesture.selection:[gesture.hit];
        setSelection(objects);
        gesture.move=beginMove(objects);
        if(!gesture.move || !gesture.ground){abort();consume(event);return;}
      }
    }
    if(gesture.kind==='rectangle')showRectangle(selectionRectangle(gesture.start,current));
    else{
      const delta=snappedTranslation(gesture.ground,groundPoint(event,gesture.hit),increment());
      gesture.valid=!!delta && previewMove(gesture.move,delta);
    }
    consume(event);
  });
  listen(doc,'mouseup',event=>{
    if(!gesture)return;
    const completed=gesture;gesture=null;onGestureChange(false);
    if(!completed.started)return;
    if(!isActive()){
      if(completed.kind==='move')cancelMove(completed.move);
      setSelection(completed.selection);hideRectangle();consume(event);return;
    }
    if(completed.kind==='rectangle'){
      const enclosed=enclosedObjects(selectionRectangle(completed.start,point(event)),projectObjects());
      const objects=completed.additive?[...new Set([...completed.selection,...enclosed])]:enclosed;
      setSelection(objects);announce(objects.length+' block'+(objects.length===1?'':'s')+' selected. Drag a selected block to move the group.');
    }else if(!completed.valid || !finishMove(completed.move)){
      cancelMove(completed.move);announce('Move cancelled. Keep the group on the platform and clear of other objects.');
    }
    hideRectangle();swallowClick=true;
    win.setTimeout(()=>{swallowClick=false;},0);
    consume(event);
  });
  listen(doc,'click',event=>{
    if(event.directManipulationReplay || event.target!==canvas || !isActive())return;
    if(swallowClick){swallowClick=false;consume(event);return;}
    if(event.detail>=2){cancelClick();consume(event);return;}
    const hit=pick(event);if(selectClick(event,hit)){cancelClick();consume(event);return;}
    if(!hit)return;
    // Defer stacking on an existing block so a double-click cannot add two blocks first.
    cancelClick();pendingClick={clientX:event.clientX,clientY:event.clientY,
      shiftKey:event.shiftKey,ctrlKey:event.ctrlKey,metaKey:event.metaKey};
    pendingTimer=win.setTimeout(flushClick,clickDelay);consume(event);
  });
  listen(doc,'dblclick',event=>{
    if(event.target!==canvas || !isActive())return;
    cancelClick();abort();const block=pick(event);
    if(block)deleteBlock(block);
    consume(event);
  });
  listen(doc,'keydown',event=>{
    if(event.key==='Escape'&&isActive()){cancelClick();if(gesture){abort();consume(event);}else if(getSelection().length){setSelection([]);announce('Selection cleared.');consume(event);}}
  });
  listen(win,'blur',()=>{abort();cancelClick();});
  listen(canvas,'pointercancel',()=>{abort();cancelClick();});
  return {cancel(){abort();cancelClick();},dispose(){abort();cancelClick();listeners.forEach(remove=>remove());}};
}
