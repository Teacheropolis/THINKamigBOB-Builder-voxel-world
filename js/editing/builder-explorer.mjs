const RADIUS=.27,HEIGHT=1.7,EPSILON=1e-6;
const body=p=>({min:{x:p.x-RADIUS,y:p.y,z:p.z-RADIUS},max:{x:p.x+RADIUS,y:p.y+HEIGHT,z:p.z+RADIUS}});
const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>EPSILON);
export const explorerBodyBounds=body;
export function explorerSpawn(platform,obstacles){
  const centerX=(platform.min.x+platform.max.x)/2,centerZ=(platform.min.z+platform.max.z)/2;
  const candidates=[{x:centerX,z:Math.min(platform.max.z-RADIUS,centerZ+10)}];
  for(let z=platform.max.z-1;z>=platform.min.z+1;z-=2)for(let x=platform.min.x+1;x<=platform.max.x-1;x+=2)candidates.push({x,z});
  for(const candidate of candidates){
    let y=platform.max.y;
    for(const b of obstacles){if(candidate.x+RADIUS>b.min.x && candidate.x-RADIUS<b.max.x && candidate.z+RADIUS>b.min.z && candidate.z-RADIUS<b.max.z)y=Math.max(y,b.max.y);}
    const p={...candidate,y};if(!obstacles.some(b=>overlap(body(p),b)))return p;
  }
  return null;
}
export function createBuilderExplorer({spawn,platform,obstacles=[],speed=4}){
  let position={...spawn},velocityY=0,grounded=true,jumpHeld=false;
  function reset(){position={...spawn};velocityY=0;grounded=true;jumpHeld=false;return read();}
  function read(){return {...position,grounded,velocityY};}
  function step(input={},elapsed=0,yaw=0){
    const dt=Math.max(0,Math.min(.05,Number.isFinite(elapsed)?elapsed:0));
    const amount=v=>typeof v==='number'?Math.max(0,Math.min(1,v)):(v?1:0);
    let forward=amount(input.forward)-amount(input.backward),right=amount(input.right)-amount(input.left);
    const length=Math.hypot(forward,right);if(length>1){forward/=length;right/=length;}
    if(input.jump && !jumpHeld && grounded){velocityY=5.8;grounded=false;}
    jumpHeld=!!input.jump;velocityY-=15*dt;
    const delta={x:(right*Math.cos(yaw)-forward*Math.sin(yaw))*speed*dt,z:(-right*Math.sin(yaw)-forward*Math.cos(yaw))*speed*dt,y:velocityY*dt};
    const count=Math.max(1,Math.ceil(Math.max(Math.abs(delta.x),Math.abs(delta.y),Math.abs(delta.z))/.08));
    grounded=false;
    for(let i=0;i<count;i++){
      for(const axis of ['x','z','y']){
        const change=delta[axis]/count;
        if(axis==='y' && velocityY===0)continue;
        let next={...position,[axis]:position[axis]+change};
        if(axis!=='y')next[axis]=Math.max(platform.min[axis]+RADIUS,Math.min(platform.max[axis]-RADIUS,next[axis]));
        if(axis==='y' && next.y<platform.max.y){next.y=platform.max.y;velocityY=0;grounded=true;}
        for(const obstacle of obstacles){
          if(!overlap(body(next),obstacle))continue;
          if(axis==='y'){
            next.y=change<0?obstacle.max.y:obstacle.min.y-HEIGHT;
            if(change<0)grounded=true;
            velocityY=0;
          }else next[axis]=change>0?obstacle.min[axis]-RADIUS:obstacle.max[axis]+RADIUS;
        }
        position=next;
      }
    }
    return read();
  }
  return {step,reset,read,eyeHeight:1.5};
}
