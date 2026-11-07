import type { Point } from "../shared/protocol";

// A play operator: motion inside a tiny radius sticks; outside it, the output
// follows at the radius boundary. Fast intentional movement reduces the radius
// further, so friction suppresses rest noise without behaving like smoothing.
export class StaticFriction1D {
  private output?:number;private input?:number;private time?:number;
  constructor(private radius:number,private velocityRelease=12){}
  filter(value:number,now:number){
    if(this.output===undefined){this.output=value;this.input=value;this.time=now;return value;}
    const dt=Math.max(.001,(now-(this.time??now))/1000),rawStep=Math.abs(value-(this.input??value)),speed=rawStep<=this.radius?0:rawStep/dt;
    const activeRadius=this.radius/(1+speed*this.velocityRelease),delta=value-this.output;
    if(Math.abs(delta)>activeRadius)this.output=value-Math.sign(delta)*activeRadius;
    this.input=value;this.time=now;return this.output;
  }
  reset(){this.output=undefined;this.input=undefined;this.time=undefined;}
}

export class StaticFriction2D {
  private output?:Point;private input?:Point;private time?:number;
  constructor(private radius:number,private velocityRelease=12){}
  filter(value:Point,now:number):Point{
    if(!this.output){this.output={...value};this.input={...value};this.time=now;return{...value};}
    const dt=Math.max(.001,(now-(this.time??now))/1000),rawDx=value.x-(this.input?.x??value.x),rawDy=value.y-(this.input?.y??value.y);
    const rawStep=Math.hypot(rawDx,rawDy),speed=rawStep<=this.radius?0:rawStep/dt,activeRadius=this.radius/(1+speed*this.velocityRelease);
    const dx=value.x-this.output.x,dy=value.y-this.output.y,distance=Math.hypot(dx,dy);
    if(distance>activeRadius){this.output={x:value.x-dx/distance*activeRadius,y:value.y-dy/distance*activeRadius};}
    this.input={...value};this.time=now;return{...this.output};
  }
  reset(){this.output=undefined;this.input=undefined;this.time=undefined;}
}
