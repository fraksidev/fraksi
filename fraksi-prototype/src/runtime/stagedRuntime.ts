import { solveTargetConstraint } from "../constraints/targetConstraint";
import {
  inverseTransformPoint,
  transformPoint,
  type Point2
} from "../math/point2";
import { getTwoLinkConstraint } from "../rig/shadowPuppetRig";
import { solveRigidFit2D } from "../solvers/rigidFit2D";
import type { CanonicalRigState, Transform2D } from "./rigState";

const chainDefinition = getTwoLinkConstraint("primary-reach");

function distance(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function copyTransform(transform: Transform2D): Transform2D {
  return {
    position: { ...transform.position },
    rotation: transform.rotation
  };
}

function carryPoint(point: Point2, before: Transform2D, after: Transform2D): Point2 {
  return transformPoint(
    inverseTransformPoint(point, before.position, before.rotation),
    after.position,
    after.rotation
  );
}

/** Runs the current explicit stages. No dependency graph or iteration is implied. */
export function solveRigStages(state: CanonicalRigState): void {
  const beforeRoot = copyTransform(state.root);
  const rootCandidates = [state.constraints.rootPosition, state.constraints.rootFit]
    .filter((constraint) => constraint.enabled)
    .sort((a, b) => b.priority - a.priority);
  const activeRoot = rootCandidates[0];
  const hasRootConflict = rootCandidates.length > 1;

  state.diagnostics.activeRootConstraintId = activeRoot?.id ?? null;
  state.diagnostics.rootPosition.conflicted = hasRootConflict;
  state.diagnostics.rootFit.conflicted = hasRootConflict;
  state.diagnostics.rootPosition.suppressed =
    state.constraints.rootPosition.enabled && activeRoot !== state.constraints.rootPosition;
  state.diagnostics.rootFit.suppressed =
    state.constraints.rootFit.enabled && activeRoot !== state.constraints.rootFit;

  if (activeRoot === state.constraints.rootFit) {
    const fit = solveRigidFit2D(
      state.constraints.rootFit.localAttachments,
      state.constraints.rootFit.targets
    );
    state.root.position = fit.position;
    state.root.rotation = fit.rotation;
    state.diagnostics.rootFit.residualDistance = fit.residualDistance;
  } else if (activeRoot === state.constraints.rootPosition) {
    state.root.position = { ...state.constraints.rootPosition.target };
  }

  const rootChanged =
    distance(beforeRoot.position, state.root.position) > 1e-10 ||
    Math.abs(beforeRoot.rotation - state.root.rotation) > 1e-10;
  if (rootChanged) {
    state.constraints.reach.target = carryPoint(
      state.constraints.reach.target,
      beforeRoot,
      state.root
    );
    state.controls.endpointRodHandle = carryPoint(
      state.controls.endpointRodHandle,
      beforeRoot,
      state.root
    );
    state.controls.bodyRodHandle = carryPoint(
      state.controls.bodyRodHandle,
      beforeRoot,
      state.root
    );
  }

  state.diagnostics.rootPosition.residualDistance = distance(
    state.root.position,
    state.constraints.rootPosition.target
  );
  if (activeRoot !== state.constraints.rootFit) {
    const fit = solveRigidFit2D(
      state.constraints.rootFit.localAttachments,
      state.constraints.rootFit.targets
    );
    state.diagnostics.rootFit.residualDistance = fit.residualDistance;
  }

  if (!state.constraints.reach.enabled) {
    state.diagnostics.reach.suppressed = true;
    return;
  }

  const targetInRoot = inverseTransformPoint(
    state.constraints.reach.target,
    state.root.position,
    state.root.rotation
  );
  // Facing is an instance-level reflection. Convert the reflected target back
  // into the rig's canonical local space so the generic chain solver remains
  // independent of presentation orientation.
  const canonicalTarget = {
    x: targetInRoot.x * state.facingDirection,
    y: targetInRoot.y
  };
  const result = solveTargetConstraint(
    {
      id: state.constraints.reach.id,
      target: canonicalTarget,
      bendDirection: state.constraints.reach.bendDirection * state.facingDirection as -1 | 1
    },
    chainDefinition
  );
  state.joints.rootJointAngle = result.rootJointAngle;
  state.joints.intermediateJointAngle = result.intermediateJointAngle;
  state.diagnostics.reach.residualDistance = result.residualDistance;
  state.diagnostics.reach.reachedTarget = transformPoint(
    {
      x: state.facingDirection * (
        chainDefinition.baseAttachment.x + result.reachedTarget.x
      ),
      y: chainDefinition.baseAttachment.y + result.reachedTarget.y
    },
    state.root.position,
    state.root.rotation
  );
  state.diagnostics.reach.conflicted = !result.reachable;
  state.diagnostics.reach.suppressed = false;
}
