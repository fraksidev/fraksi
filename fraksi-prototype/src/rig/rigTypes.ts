import type { Point2 } from "../math/point2";

export interface BodyDefinition {
  id: string;
  label?: string;
  initialPosition: Point2;
  initialRotation: number;
  rigid: boolean;
}

export interface JointDefinition {
  id: string;
  parentBodyId: string;
  childBodyId: string;
  type: "fixed" | "revolute";
  parentAnchor: Point2;
  childAnchor: Point2;
  minAngle?: number;
  maxAngle?: number;
}

export interface AttachmentDefinition {
  id: string;
  bodyId: string;
  localPosition: Point2;
  allowedModes: ReadonlyArray<"pin" | "target" | "rotate">;
}

export interface TwoLinkDefinition {
  id: string;
  baseAttachment: Point2;
  firstSegmentLength: number;
  secondSegmentLength: number;
}

export interface RigDefinition {
  bodies: BodyDefinition[];
  joints: JointDefinition[];
  attachments: AttachmentDefinition[];
  twoLinkConstraints: TwoLinkDefinition[];
}

