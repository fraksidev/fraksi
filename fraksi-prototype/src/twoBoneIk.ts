import type { Point2 } from "./math/point2";

export type BendDirection = 1 | -1;

export interface TwoBoneIkResult {
  rootJointAngle: number;
  intermediateJointAngle: number;
  intermediatePoint: Point2;
  reachedTarget: Point2;
  residual: Point2;
  residualDistance: number;
  reachable: boolean;
}

const EPSILON = 1e-8;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Solves a two-link chain whose root joint is at the origin and whose rest
 * segments point along +X. All inputs and outputs use the same 2D space.
 */
export function solveTwoBoneIk(
  target: Point2,
  firstSegmentLength: number,
  secondSegmentLength: number,
  bend: BendDirection
): TwoBoneIkResult {
  if (firstSegmentLength <= 0 || secondSegmentLength <= 0) {
    throw new Error("Two-bone IK lengths must be positive.");
  }

  const targetDistance = Math.hypot(target.x, target.y);
  const minimumReach = Math.abs(firstSegmentLength - secondSegmentLength);
  const maximumReach = firstSegmentLength + secondSegmentLength;
  const solveDistance = clamp(targetDistance, minimumReach, maximumReach);
  const direction = targetDistance > EPSILON
    ? Math.atan2(target.y, target.x)
    : 0;
  const reachedTarget = {
    x: Math.cos(direction) * solveDistance,
    y: Math.sin(direction) * solveDistance
  };

  const rootJointCosine = clamp(
    (firstSegmentLength ** 2 + solveDistance ** 2 - secondSegmentLength ** 2) /
      (2 * firstSegmentLength * Math.max(solveDistance, EPSILON)),
    -1,
    1
  );
  const rootJointAngle = direction + bend * Math.acos(rootJointCosine);
  const intermediatePoint = {
    x: Math.cos(rootJointAngle) * firstSegmentLength,
    y: Math.sin(rootJointAngle) * firstSegmentLength
  };
  const lowerWorldAngle = Math.atan2(
    reachedTarget.y - intermediatePoint.y,
    reachedTarget.x - intermediatePoint.x
  );
  const intermediateJointAngle = Math.atan2(
    Math.sin(lowerWorldAngle - rootJointAngle),
    Math.cos(lowerWorldAngle - rootJointAngle)
  );
  const residual = {
    x: target.x - reachedTarget.x,
    y: target.y - reachedTarget.y
  };
  const residualDistance = Math.hypot(residual.x, residual.y);

  return {
    rootJointAngle,
    intermediateJointAngle,
    intermediatePoint,
    reachedTarget,
    residual,
    residualDistance,
    reachable: residualDistance <= 1e-6
  };
}
