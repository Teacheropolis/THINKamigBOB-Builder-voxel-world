export function wheelNavigation(event){
 const unit=event.deltaMode===1?16:event.deltaMode===2?600:1;
 return {travel:Math.max(-2,Math.min(2,-event.deltaY*unit*(event.ctrlKey?.025:.012))),turn:Math.max(-.22,Math.min(.22,-event.deltaX*unit*.002))};
}
export function touchNavigation(before,after){
 const center=p=>({x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2});const a=center(before),b=center(after),distance=p=>Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
 return {dx:b.x-a.x,dy:b.y-a.y,travel:Math.max(-1,Math.min(1,(distance(after)-distance(before))*.035))};
}
export function installCanvasNavigation({document,canvas,isExplore,isBuild,onTravel,onLook,onBuild,onGestureStart}){
 const own=e=>e.target===canvas&&(isExplore()||isBuild());const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};let last=null;
 document.addEventListener('wheel',event=>{if(!own(event))return;const delta=wheelNavigation(event);if(isExplore()){onTravel(delta.travel);onLook(delta.turn,0);}else onBuild({zoom:-delta.travel,dx:0,dy:0});consume(event);},{capture:true,passive:false});
 const points=event=>Array.from(event.touches).slice(0,2).map(t=>({x:t.clientX,y:t.clientY}));
 document.addEventListener('touchstart',event=>{if(!own(event)||event.touches.length<2)return;last=points(event);onGestureStart();consume(event);},{capture:true,passive:false});
 document.addEventListener('touchmove',event=>{if(!own(event)||event.touches.length<2)return;const next=points(event);if(last){const delta=touchNavigation(last,next);if(isExplore()){onTravel(delta.travel);onLook(-delta.dx*.004,-delta.dy*.003);}else onBuild({zoom:-delta.travel,dx:delta.dx,dy:delta.dy});}last=next;consume(event);},{capture:true,passive:false});
 for(const name of ['touchend','touchcancel'])document.addEventListener(name,event=>{if(!last)return;consume(event);if(event.touches.length<2){last=null;onGestureStart();}},{capture:true,passive:false});
}
