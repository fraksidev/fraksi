import { PUPPETS } from "../rig/puppetManifest";
import { solveTwoBone, SpringPoint } from "../rig/solver";
import { restFrame } from "../control/normalize";
import type { ControlFrame, Point, PuppetId, RoomSnapshot } from "../shared/protocol";

interface LiveRig { current: ControlFrame; previous: Point; velocity: Point; arms: [SpringPoint, SpringPoint] }
interface RodLine { from:Point;to:Point;width:number }
export class StageRenderer {
  private ctx: CanvasRenderingContext2D;private audienceCtx?:CanvasRenderingContext2D; private rigs = new Map<PuppetId, LiveRig>(); private last = performance.now();
  reveal = false; rods = true; uiHidden = false; landmarks?: Point[];
  constructor(private canvas: HTMLCanvasElement,private audienceCanvas?:HTMLCanvasElement) { this.ctx = canvas.getContext("2d")!;this.audienceCtx=audienceCanvas?.getContext("2d")??undefined; for (const id of ["ember", "tide"] as PuppetId[]) { const f = restFrame(id); this.rigs.set(id, { current: f, previous: { x: f.body.x, y: f.body.y }, velocity: { x: 0, y: 0 }, arms: [new SpringPoint({x:f.handles.leftArm.x*72,y:f.handles.leftArm.y*72}), new SpringPoint({x:f.handles.rightArm.x*72,y:f.handles.rightArm.y*72})] }); } }
  render(scene?: RoomSnapshot) {
    const now = performance.now(), dt = Math.min(.033, (now - this.last) / 1000); this.last = now; this.resize();
    const c = this.ctx, w = this.canvas.width, h = this.canvas.height; c.clearRect(0, 0, w, h);
    for (const id of ["ember", "tide"] as PuppetId[]) { const target = scene?.puppets[id].frame ?? restFrame(id); this.drawPuppet(id, target, dt, w, h); }
    requestAnimationFrame(() => this.render(scene));
  }
  update(scene?: RoomSnapshot) { if (scene) (this as unknown as { scene?: RoomSnapshot }).scene = scene; }
  draw(scene?: RoomSnapshot) { const loop = () => { this.frame(scene); requestAnimationFrame(loop); }; loop(); }
  private frame(scene?: RoomSnapshot) { scene = (this as unknown as { scene?: RoomSnapshot }).scene ?? scene; const now = performance.now(), dt = Math.min(.033, (now - this.last) / 1000); this.last = now; this.resize(); this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); for (const id of ["ember", "tide"] as PuppetId[]) this.drawPuppet(id, scene?.puppets[id].frame ?? restFrame(id), dt, this.canvas.width, this.canvas.height);this.drawAudience(); }
  private drawPuppet(id: PuppetId, target: ControlFrame, dt: number, w: number, h: number) {
    const rig = this.rigs.get(id)!, manifest = PUPPETS[id], lerp = Math.min(1, dt * 10); const old = rig.current;
    rig.current = { ...target, body: { x: target.body.x, y: target.body.y, rotation: target.body.rotation, depth: old.body.depth + (target.body.depth-old.body.depth)*lerp }, handles: target.handles };
    const cx = rig.current.body.x*w, cy = rig.current.body.y*h, scale = (.75 + rig.current.body.depth*.55) * Math.min(w,h)/760;
    const vx = (rig.current.body.x-rig.previous.x)/Math.max(dt,.001), vy=(rig.current.body.y-rig.previous.y)/Math.max(dt,.001); const accel={x:(vx-rig.velocity.x)*w,y:(vy-rig.velocity.y)*h}; rig.velocity={x:vx,y:vy}; rig.previous={x:rig.current.body.x,y:rig.current.body.y};
    const handles = [rig.current.handles.leftArm, rig.current.handles.rightArm]; const screenHands:Point[]=[],rods:RodLine[]=[]; const c=this.ctx;
    c.save(); c.translate(cx,cy); c.rotate(rig.current.body.rotation); c.scale(scale,scale);
    c.shadowColor="rgba(44,15,8,.3)"; c.shadowBlur=8+rig.current.body.depth*24; c.shadowOffsetY=7+rig.current.body.depth*12;
    if(this.rods){
      const rodLength=Math.max(235,(h-cy)/scale+35);
      rods.push({from:{x:0,y:rodLength},to:{x:0,y:18},width:4});
    }
    for(let i=0;i<2;i++){
      const arm=manifest.arms[i], shoulder={x:arm.shoulder[0],y:arm.shoulder[1]};
      const localTarget={x:handles[i].x*72,y:handles[i].y*72};
      const spring=rig.arms[i].step(localTarget,dt,accel), pose=solveTwoBone(shoulder,spring,arm.upper,arm.fore,i===0?-1:1);
      const cos=Math.cos(rig.current.body.rotation),sin=Math.sin(rig.current.body.rotation);
      const handScreen={x:cx+(pose.hand.x*cos-pose.hand.y*sin)*scale,y:cy+(pose.hand.x*sin+pose.hand.y*cos)*scale};screenHands.push(handScreen);
      if(this.rods){
        const bottomScreen={x:handScreen.x+(i===0?-28:28)*scale,y:h+45};
        const dx=(bottomScreen.x-cx)/scale,dy=(bottomScreen.y-cy)/scale;
        const bottomLocal={x:dx*cos+dy*sin,y:-dx*sin+dy*cos};
        rods.push({from:bottomLocal,to:pose.hand,width:3});
      }
      c.strokeStyle=manifest.identity;c.lineWidth=arm.width;c.lineCap="round";c.beginPath();c.moveTo(shoulder.x,shoulder.y);c.lineTo(pose.elbow.x,pose.elbow.y);c.lineTo(pose.hand.x,pose.hand.y);c.stroke();c.fillStyle=manifest.accent;c.beginPath();c.arc(pose.elbow.x,pose.elbow.y,arm.width*.32,0,Math.PI*2);c.fill();
    }
    c.fillStyle=manifest.identity;c.beginPath();
    if(id==="ember"){c.moveTo(-48,72);c.quadraticCurveTo(-63,6,-42,-48);c.quadraticCurveTo(-24,-87,8,-94);c.lineTo(42,-84);c.lineTo(61,-70);c.lineTo(38,-62);c.quadraticCurveTo(48,-6,48,72);c.quadraticCurveTo(0,88,-48,72);}
    else{c.moveTo(50,72);c.quadraticCurveTo(64,4,42,-45);c.quadraticCurveTo(25,-87,-7,-94);c.lineTo(-39,-84);c.lineTo(-61,-69);c.lineTo(-38,-61);c.quadraticCurveTo(-49,-5,-50,72);c.quadraticCurveTo(0,90,50,72);}
    c.closePath();c.fill();c.shadowColor="transparent";c.fillStyle=manifest.accent;c.beginPath();c.arc(id==="ember"?18:-18,-76,id==="ember"?10:12,0,Math.PI*2);c.fill();c.fillStyle="#24120e";c.beginPath();c.arc(id==="ember"?31:-31,-78,3,0,Math.PI*2);c.fill();
    for(const rod of rods){c.strokeStyle="rgba(49,31,24,.82)";c.lineWidth=rod.width;c.lineCap="round";c.beginPath();c.moveTo(rod.from.x,rod.from.y);c.lineTo(rod.to.x,rod.to.y);c.stroke();c.fillStyle=manifest.accent;c.beginPath();c.arc(rod.to.x,rod.to.y,rod.width+1,0,Math.PI*2);c.fill();}
    c.restore();
    if(this.reveal){c.save();c.setLineDash([6,8]);c.strokeStyle=manifest.identity;c.globalAlpha=.65;c.lineWidth=2;for(const p of screenHands){c.beginPath();c.moveTo(p.x,p.y);c.lineTo(cx,cy);c.stroke();}c.setLineDash([]);c.globalAlpha=1;c.fillStyle=manifest.identity;c.font=`600 ${Math.max(13,w*.012)}px system-ui`;c.fillText(id==="ember"?"PERFORMER 1":"PERFORMER 2",cx-45,cy+125*scale);c.restore();}
  }
  private resize(){const dpr=Math.min(2,devicePixelRatio||1),r=this.canvas.getBoundingClientRect(),nw=Math.round(r.width*dpr),nh=Math.round(r.height*dpr);if(this.canvas.width!==nw||this.canvas.height!==nh){this.canvas.width=nw;this.canvas.height=nh;}}
  private drawAudience(){if(!this.audienceCanvas||!this.audienceCtx)return;const rect=this.audienceCanvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(this.audienceCanvas.width!==w||this.audienceCanvas.height!==h){this.audienceCanvas.width=w;this.audienceCanvas.height=h;}this.audienceCtx.setTransform(1,0,0,1,0,0);this.audienceCtx.clearRect(0,0,w,h);this.audienceCtx.translate(w,0);this.audienceCtx.scale(-1,1);this.audienceCtx.drawImage(this.canvas,0,0,w,h);}
}
