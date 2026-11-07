import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { ControlFrame, PuppetId, Point } from "../shared/protocol";
import { normalizeFrame } from "./normalize";
import { OneEuro } from "./oneEuro";
import { StaticFriction1D, StaticFriction2D } from "./staticFriction";

const dist = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
export type ArmControlMode = "independent" | "aperture";
export function armPoseFromAperture(aperture: number): [Point, Point] {
  const open = clamp01((aperture - .12) / 1.28);
  const eased = open * open * (3 - 2 * open);
  // At full aperture the targets sit approximately one complete two-bone
  // chain beyond each shoulder, so IK resolves to long, nearly straight arms
  // instead of the bent-elbow shrug produced by a merely lateral hand target.
  const x = .12 + 2.43 * eased;
  const y = -1.52 + 1.07 * eased;
  return [{ x: -x, y }, { x, y }];
}
export function screenPalmRoll(wrist: Point, middle: Point) {
  return Math.atan2(middle.y-wrist.y,(1-middle.x)-(1-wrist.x));
}
export function independentArmPose(thumb: Point,index: Point,reversed=false): [Point,Point] {
  const shape=(finger:Point,side:number):Point=>({x:side*.58+finger.x*1.3,y:finger.y*1.12});
  const thumbArm=shape(thumb,-1),indexArm=shape(index,1);
  return reversed?[indexArm,thumbArm]:[thumbArm,indexArm];
}
export class HandMapper {
  private baseline = .18; private rollBaseline?: number; private lastSeen = 0; private last?: ControlFrame;
  private filters = [new OneEuro(9,.35,2),new OneEuro(9,.35,2),new OneEuro(1.5,.05),new OneEuro(5,.18),new OneEuro(5,.18),new OneEuro(5,.18),new OneEuro(5,.18)];
  private rotationFilter = new OneEuro(5.5, .16, 1.5);
  private positionFriction=new StaticFriction2D(.0045,18);
  private rotationFriction=new StaticFriction1D(.014,10);
  private depthFriction=new StaticFriction1D(.012,12);
  private apertureFriction=new StaticFriction1D(.025,10);
  constructor(private reversed = false,private armMode:ArmControlMode="aperture") {}
  setReversed(value: boolean) { this.reversed = value; }
  setArmMode(value:ArmControlMode){this.armMode=value;this.filters.slice(3).forEach(filter=>filter.reset());}
  recalibrate(landmarks?: NormalizedLandmark[]) { if (landmarks) { this.baseline = Math.max(.04, dist(landmarks[5], landmarks[17])); this.rollBaseline = this.rawRoll(landmarks); } this.filters.forEach((f) => f.reset()); this.rotationFilter.reset();this.positionFriction.reset();this.rotationFriction.reset();this.depthFriction.reset();this.apertureFriction.reset(); }
  map(landmarks: NormalizedLandmark[], performerId: string, puppetId: PuppetId, now: number): ControlFrame {
    const palm = { x: (landmarks[0].x + landmarks[5].x + landmarks[9].x + landmarks[17].x) / 4, y: (landmarks[0].y + landmarks[5].y + landmarks[9].y + landmarks[17].y) / 4 };
    const body = { x: 1 - palm.x, y: palm.y };
    const rawRoll = this.rawRoll(landmarks); this.rollBaseline ??= rawRoll;
    // Roll is measured in mirrored screen space along the palm's longitudinal
    // axis. It therefore follows the visible lean for either anatomical hand
    // and does not need a puppet-facing or handedness sign switch.
    const roll = this.angleDelta(rawRoll, this.rollBaseline);
    const handSize = Math.max(.035, dist(landmarks[5], landmarks[17]));
    const aperture=this.apertureFriction.filter(dist(landmarks[4],landmarks[8])/handSize,now);
    const local=(landmark:NormalizedLandmark):Point=>{const point={x:1-landmark.x,y:landmark.y},dx=(point.x-body.x)/handSize,dy=(point.y-body.y)/handSize,cos=Math.cos(-roll),sin=Math.sin(-roll);return{x:dx*cos-dy*sin,y:dx*sin+dy*cos};};
    const independent=independentArmPose(local(landmarks[4]),local(landmarks[8]),this.reversed);
    const aperturePose=armPoseFromAperture(aperture);
    const [a,b]=this.armMode==="independent"?independent:(this.reversed?[aperturePose[1],aperturePose[0]]:aperturePose);
    const vals = [body.x, body.y, handSize / this.baseline, a.x, a.y, b.x, b.y];
    const f = vals.map((v, i) => this.filters[i].filter(v, now));
    const stablePosition=this.positionFriction.filter({x:f[0],y:f[1]},now);
    const [leftArm, rightArm] = [{ x: f[3], y: f[4] }, { x: f[5], y: f[6] }];
    this.lastSeen = now;
    this.last = normalizeFrame({ performerId, puppetId, timestamp: now, body: { x: stablePosition.x, y: stablePosition.y, rotation: this.rotationFriction.filter(this.rotationFilter.filter(roll, now),now), depth: this.depthFriction.filter((f[2] - .65) / .8,now) }, handles: { leftArm, rightArm }, gestures: {} });
    return this.last;
  }
  private rawRoll(landmarks: NormalizedLandmark[]) {
    const wrist=landmarks[0],middle=landmarks[9];
    return screenPalmRoll(wrist,middle);
  }
  private angleDelta(a: number, b: number) { return Math.atan2(Math.sin(a-b),Math.cos(a-b)); }
  duringLoss(now: number): ControlFrame | null {
    if (!this.last) return null; const elapsed = now - this.lastSeen;
    if (elapsed < 320) return { ...this.last, timestamp: now };
    if (elapsed > 1400) return null;
    const t = (elapsed - 320) / 1080, ease = t * t * (3 - 2 * t), x = this.last.puppetId === "ember" ? .34 : .66;
    return normalizeFrame({ ...this.last, timestamp: now, body: { x: this.last.body.x + (x - this.last.body.x) * ease, y: this.last.body.y + (.58 - this.last.body.y) * ease, rotation: this.last.body.rotation * (1 - ease), depth: this.last.body.depth + (.48 - this.last.body.depth) * ease } });
  }
}
