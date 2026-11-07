import type { Pose2DControlSample } from "../controls/controlTypes";
import type { CanonicalRigState } from "../runtime/rigState";

export type PuppetId = "character-a" | "character-b";

export interface SceneSnapshot {
  revision: number;
  puppets: CanonicalRigState[];
  owners: Record<PuppetId, string | null>;
}

export type ClientMessage =
  | { type: "puppet.claim"; puppetId: PuppetId }
  | { type: "control.sample"; sample: Pose2DControlSample }
  | { type: "scene.leave" };

export type ServerMessage =
  | { type: "session.welcome"; clientId: string; scene: SceneSnapshot }
  | { type: "scene.snapshot"; scene: SceneSnapshot }
  | { type: "puppet.claimed"; puppetId: PuppetId }
  | { type: "claim.rejected"; puppetId: PuppetId; reason: string }
  | { type: "scene.left" }
  | { type: "error"; message: string };

export function isPuppetId(value: unknown): value is PuppetId {
  return value === "character-a" || value === "character-b";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isControlSample(value: unknown): value is Pose2DControlSample {
  if (!isRecord(value) || !isRecord(value.position)) return false;
  return (
    typeof value.controlId === "string" &&
    (value.phase === "start" || value.phase === "move" || value.phase === "end") &&
    Number.isInteger(value.sequence) &&
    typeof value.timestamp === "number" &&
    Number.isFinite(value.timestamp) &&
    typeof value.position.x === "number" &&
    Number.isFinite(value.position.x) &&
    typeof value.position.y === "number" &&
    Number.isFinite(value.position.y)
  );
}

export function isClientMessage(value: unknown): value is ClientMessage {
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (value.type === "scene.leave") return true;
  if (value.type === "puppet.claim") return isPuppetId(value.puppetId);
  return value.type === "control.sample" && isControlSample(value.sample);
}
