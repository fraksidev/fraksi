import type { ControlFrame, Point, PuppetId } from "../shared/protocol";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
// Arm handles are puppet-local, palm-relative coordinates. Keeping them out of
// screen space makes the same finger shape produce the same arm pose at every
// puppet depth.
export function normalizePoint(p: Point): Point { return { x: clamp(p.x, -2.65, 2.65), y: clamp(p.y, -2.65, 2.65) }; }
export function normalizeFrame(frame: ControlFrame): ControlFrame {
  return {
    performerId: String(frame.performerId).slice(0, 80),
    puppetId: frame.puppetId,
    timestamp: Math.max(0, Number.isFinite(frame.timestamp) ? frame.timestamp : 0),
    body: {
      x: clamp(frame.body.x, 0.06, 0.94), y: clamp(frame.body.y, 0.12, 0.9),
      rotation: clamp(frame.body.rotation, -0.8, 0.8), depth: clamp(frame.body.depth, 0, 1)
    },
    handles: { leftArm: normalizePoint(frame.handles.leftArm), rightArm: normalizePoint(frame.handles.rightArm) },
    gestures: Object.fromEntries(Object.entries(frame.gestures).filter(([, v]) => typeof v === "boolean" || Number.isFinite(v)))
  };
}
export function restFrame(puppetId: PuppetId, performerId = "unclaimed"): ControlFrame {
  const left = puppetId === "ember";
  const x = left ? 0.34 : 0.66;
  return normalizeFrame({ performerId, puppetId, timestamp: 0, body: { x, y: 0.58, rotation: left ? -0.05 : 0.05, depth: .48 }, handles: { leftArm: { x: -1.05, y: -.05 }, rightArm: { x: 1.05, y: -.05 } }, gestures: {} });
}
