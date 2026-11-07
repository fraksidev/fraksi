import type { Point } from "../shared/protocol";
export interface ArmPose { elbow: Point; hand: Point }
export function solveTwoBone(shoulder: Point, target: Point, upper: number, fore: number, bend: number): ArmPose {
  const dx = target.x - shoulder.x, dy = target.y - shoulder.y, raw = Math.hypot(dx, dy), d = Math.max(1, Math.min(upper + fore - .1, raw));
  const base = Math.atan2(dy, dx), cosine = Math.max(-1, Math.min(1, (upper * upper + d * d - fore * fore) / (2 * upper * d)));
  const a = base + bend * Math.acos(cosine);
  return { elbow: { x: shoulder.x + Math.cos(a) * upper, y: shoulder.y + Math.sin(a) * upper }, hand: { x: shoulder.x + Math.cos(base) * d, y: shoulder.y + Math.sin(base) * d } };
}
export class SpringPoint {
  value: Point; velocity = { x: 0, y: 0 };
  constructor(initial: Point) { this.value = { ...initial }; }
  step(target: Point, dt: number, bodyAcceleration: Point) {
    const stiffness = 125, damping = 14, lag = .018;
    for (const axis of ["x", "y"] as const) { const acceleration = (target[axis] - this.value[axis]) * stiffness - this.velocity[axis] * damping - bodyAcceleration[axis] * lag; this.velocity[axis] += acceleration * dt; this.value[axis] += this.velocity[axis] * dt; }
    return this.value;
  }
}
