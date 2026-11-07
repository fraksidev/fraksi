import type { Point2 } from "../math/point2";
import type { TwoLinkDefinition } from "../rig/rigTypes";
import {
  solveTwoBoneIk,
  type BendDirection,
  type TwoBoneIkResult
} from "../twoBoneIk";

export interface TargetConstraint {
  id: string;
  target: Point2;
  bendDirection: BendDirection;
}

/** The target must be expressed in the same local space as the chain base. */
export function solveTargetConstraint(
  constraint: TargetConstraint,
  definition: TwoLinkDefinition
): TwoBoneIkResult {
  return solveTwoBoneIk(
    {
      x: constraint.target.x - definition.baseAttachment.x,
      y: constraint.target.y - definition.baseAttachment.y
    },
    definition.firstSegmentLength,
    definition.secondSegmentLength,
    constraint.bendDirection
  );
}

