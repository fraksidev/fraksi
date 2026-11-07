import type { Point2 } from "../math/point2";
import { transformPoint } from "../math/point2";
import { getAttachment, getTwoLinkConstraint } from "../rig/shadowPuppetRig";
import type { BendDirection } from "../twoBoneIk";

export interface Transform2D {
  position: Point2;
  rotation: number;
}

export interface ConstraintSettings {
  id: string;
  enabled: boolean;
  priority: number;
  solveStage: number;
}

export interface PositionConstraintState extends ConstraintSettings {
  target: Point2;
}

export interface RigidFitConstraintState extends ConstraintSettings {
  localAttachments: Point2[];
  targets: Point2[];
}

export interface ReachConstraintState extends ConstraintSettings {
  target: Point2;
  bendDirection: BendDirection;
}

export interface ConstraintDiagnostic {
  residualDistance: number;
  conflicted: boolean;
  suppressed: boolean;
}

export interface RigDiagnostics {
  activeRootConstraintId: string | null;
  rootPosition: ConstraintDiagnostic;
  rootFit: ConstraintDiagnostic;
  reach: ConstraintDiagnostic & {
    reachedTarget: Point2;
  };
}

export interface CanonicalRigState {
  id: string;
  facingDirection: 1 | -1;
  root: Transform2D;
  joints: {
    rootJointAngle: number;
    intermediateJointAngle: number;
  };
  controls: {
    bodyRodHandle: Point2;
    endpointRodHandle: Point2;
  };
  constraints: {
    rootPosition: PositionConstraintState;
    rootFit: RigidFitConstraintState;
    reach: ReachConstraintState;
  };
  diagnostics: RigDiagnostics;
}

export interface CreateRigStateOptions {
  id: string;
  facingDirection?: 1 | -1;
  position: Point2;
  rotation: number;
  endpointHandleOffset: Point2;
  bendDirection: BendDirection;
}

export function createRigState(options: CreateRigStateOptions): CanonicalRigState {
  const facingDirection = options.facingDirection ?? 1;
  const root = { position: { ...options.position }, rotation: options.rotation };
  const bodyRod = getAttachment("body-rod").localPosition;
  const fitAttachments = [
    getAttachment("body-fit-a").localPosition,
    getAttachment("body-fit-b").localPosition
  ].map((point) => ({ x: point.x * facingDirection, y: point.y }));
  const chain = getTwoLinkConstraint("primary-reach");
  const endpointLocal = {
    x: facingDirection * (
      chain.baseAttachment.x + chain.firstSegmentLength + chain.secondSegmentLength
    ),
    y: chain.baseAttachment.y
  };
  const endpointTarget = transformPoint(endpointLocal, root.position, root.rotation);

  return {
    id: options.id,
    facingDirection,
    root,
    joints: { rootJointAngle: 0, intermediateJointAngle: 0 },
    controls: {
      bodyRodHandle: transformPoint(
        {
          x: facingDirection * (bodyRod.x + 0.9),
          y: bodyRod.y + 0.45
        },
        root.position,
        root.rotation
      ),
      endpointRodHandle: {
        x: endpointTarget.x + options.endpointHandleOffset.x,
        y: endpointTarget.y + options.endpointHandleOffset.y
      }
    },
    constraints: {
      rootPosition: {
        id: `${options.id}:root-position`,
        enabled: true,
        priority: 10,
        solveStage: 30,
        target: { ...root.position }
      },
      rootFit: {
        id: `${options.id}:root-fit`,
        enabled: false,
        priority: 20,
        solveStage: 30,
        localAttachments: fitAttachments.map((point) => ({ ...point })),
        targets: fitAttachments.map((point) =>
          transformPoint(point, root.position, root.rotation)
        )
      },
      reach: {
        id: `${options.id}:reach`,
        enabled: true,
        priority: 10,
        solveStage: 50,
        target: endpointTarget,
        bendDirection: options.bendDirection
      }
    },
    diagnostics: {
      activeRootConstraintId: null,
      rootPosition: { residualDistance: 0, conflicted: false, suppressed: false },
      rootFit: { residualDistance: 0, conflicted: false, suppressed: false },
      reach: {
        residualDistance: 0,
        conflicted: false,
        suppressed: false,
        reachedTarget: { ...endpointTarget }
      }
    }
  };
}
