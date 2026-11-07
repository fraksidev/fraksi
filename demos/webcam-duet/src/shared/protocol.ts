export type PuppetId = "ember" | "tide";

export interface Point { x: number; y: number }
export interface ControlFrame {
  performerId: string;
  puppetId: PuppetId;
  timestamp: number;
  body: { x: number; y: number; rotation: number; depth: number };
  handles: { leftArm: Point; rightArm: Point };
  gestures: Record<string, boolean | number>;
}
export interface PuppetState { id: PuppetId; ownerId: string | null; frame: ControlFrame }
export interface RoomSnapshot { revision: number; audience: number; puppets: Record<PuppetId, PuppetState> }

export type ClientMessage =
  | { type: "puppet.claim"; puppetId: PuppetId }
  | { type: "puppets.claim-solo" }
  | { type: "control.frame"; frame: ControlFrame }
  | { type: "scene.leave" };
export type ServerMessage =
  | { type: "session.welcome"; clientId: string; scene: RoomSnapshot }
  | { type: "scene.snapshot"; scene: RoomSnapshot }
  | { type: "puppet.claimed"; puppetId: PuppetId }
  | { type: "solo.claimed" }
  | { type: "claim.rejected"; puppetId: PuppetId; reason: string }
  | { type: "scene.left" }
  | { type: "error"; message: string };

export const PUPPET_IDS: PuppetId[] = ["ember", "tide"];
export const isPuppetId = (v: unknown): v is PuppetId => v === "ember" || v === "tide";
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const point = (v: unknown): v is Point => !!v && typeof v === "object" && finite((v as Point).x) && finite((v as Point).y);
export function isControlFrame(v: unknown): v is ControlFrame {
  if (!v || typeof v !== "object") return false;
  const f = v as ControlFrame;
  return typeof f.performerId === "string" && isPuppetId(f.puppetId) && finite(f.timestamp) &&
    !!f.body && finite(f.body.x) && finite(f.body.y) && finite(f.body.rotation) && finite(f.body.depth) &&
    !!f.handles && point(f.handles.leftArm) && point(f.handles.rightArm) && !!f.gestures && typeof f.gestures === "object";
}
export function isClientMessage(v: unknown): v is ClientMessage {
  if (!v || typeof v !== "object") return false;
  const m = v as ClientMessage;
  return m.type === "scene.leave" || m.type === "puppets.claim-solo" || (m.type === "puppet.claim" && isPuppetId(m.puppetId)) ||
    (m.type === "control.frame" && isControlFrame(m.frame));
}
