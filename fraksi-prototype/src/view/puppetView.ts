import * as THREE from "three";
import type { Point2 } from "../math/point2";
import { buildShadowPuppet } from "../puppet";
import type { CanonicalRigState } from "../runtime/rigState";

export interface PuppetView {
  update(state: CanonicalRigState): void;
  setAppearance(appearance: PuppetAppearance): void;
  setControlsVisible(visible: boolean): void;
}

export type PuppetAppearance =
  | "normal"
  | "hovered"
  | "owned"
  | "remote";

const rodMaterial = new THREE.LineBasicMaterial({
  color: 0x3d3227,
  transparent: true,
  opacity: 0.8
});
const residualMaterial = new THREE.LineBasicMaterial({
  color: 0xc64132,
  transparent: true,
  opacity: 0.95
});

function vector(point: Point2, z: number): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, z);
}

function createLine(material = rodMaterial): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(6), 3)
  );
  return new THREE.Line(geometry, material);
}

function updateLine(line: THREE.Line, start: THREE.Vector3, end: THREE.Vector3): void {
  const attribute = line.geometry.getAttribute("position");
  if (!(attribute instanceof THREE.BufferAttribute)) {
    throw new Error("Line position attribute is missing.");
  }
  attribute.setXYZ(0, start.x, start.y, start.z);
  attribute.setXYZ(1, end.x, end.y, end.z);
  attribute.needsUpdate = true;
  line.geometry.computeBoundingSphere();
}

function createCircle(radius: number, color: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CircleGeometry(radius, 32),
    new THREE.MeshBasicMaterial({ color })
  );
}

export function buildPuppetView(
  stage: THREE.Group,
  state: CanonicalRigState,
  handleColor: number
): PuppetView {
  const puppet = buildShadowPuppet();
  puppet.root.scale.x = state.facingDirection;
  stage.add(puppet.root);

  const bodyRod = createLine();
  const endpointRod = createLine();
  const reachResidual = createLine(residualMaterial);
  const rootConflictResidual = createLine(residualMaterial);
  const endpointHandle = createCircle(0.12, handleColor);
  const targetMaterial = new THREE.MeshBasicMaterial({ color: 0x4f8d67 });
  const targetMarker = new THREE.Mesh(
    new THREE.RingGeometry(0.1, 0.16, 32),
    targetMaterial
  );
  const fitMarkers = state.constraints.rootFit.targets.map(() =>
    createCircle(0.11, 0xd2a85f)
  );
  const fitResiduals = state.constraints.rootFit.targets.map(() =>
    createLine(residualMaterial)
  );
  const controlsGroup = new THREE.Group();
  controlsGroup.name = `${state.id}-controls`;
  controlsGroup.add(
    bodyRod,
    endpointRod,
    reachResidual,
    rootConflictResidual,
    endpointHandle,
    targetMarker,
    ...fitMarkers,
    ...fitResiduals
  );
  controlsGroup.visible = false;
  stage.add(controlsGroup);

  const bodyAttachmentWorld = new THREE.Vector3();
  const endpointWorld = new THREE.Vector3();
  const fitActual = new THREE.Vector3();

  return {
    setControlsVisible(visible): void {
      controlsGroup.visible = visible;
    },
    setAppearance(appearance): void {
      puppet.silhouetteMaterial.color.setHex(
        appearance === "hovered"
          ? 0x8f6329
          : appearance === "owned"
            ? 0x2e5360
            : appearance === "remote"
              ? 0x241b28
              : 0x090807
      );
    },
    update(nextState): void {
      puppet.root.position.set(
        nextState.root.position.x,
        nextState.root.position.y,
        0.15
      );
      puppet.root.rotation.z = nextState.root.rotation;
      puppet.headPivot.rotation.z = -0.06;
      puppet.armPivot.rotation.z = nextState.joints.rootJointAngle;
      puppet.forearmPivot.rotation.z = nextState.joints.intermediateJointAngle;
      puppet.root.updateWorldMatrix(true, true);
      puppet.torsoAnchor.getWorldPosition(bodyAttachmentWorld);
      puppet.handAnchor.getWorldPosition(endpointWorld);

      updateLine(
        bodyRod,
        vector(nextState.controls.bodyRodHandle, 1.6),
        bodyAttachmentWorld
      );
      updateLine(
        endpointRod,
        vector(nextState.controls.endpointRodHandle, 1.5),
        endpointWorld
      );
      updateLine(
        reachResidual,
        endpointWorld,
        vector(nextState.constraints.reach.target, endpointWorld.z)
      );
      reachResidual.visible = nextState.diagnostics.reach.residualDistance > 1e-6;
      updateLine(
        rootConflictResidual,
        vector(nextState.root.position, 0.3),
        vector(nextState.constraints.rootPosition.target, 0.3)
      );
      rootConflictResidual.visible =
        nextState.diagnostics.rootPosition.suppressed &&
        nextState.diagnostics.rootPosition.residualDistance > 1e-6;
      targetMaterial.color.setHex(!nextState.constraints.reach.enabled
        ? 0x77736b
        : nextState.diagnostics.reach.conflicted
          ? 0xc64132
          : 0x4f8d67);
      targetMarker.position.copy(vector(nextState.constraints.reach.target, 1.25));
      endpointHandle.position.copy(vector(nextState.controls.endpointRodHandle, 1.5));

      nextState.constraints.rootFit.localAttachments.forEach((local, index) => {
        const marker = fitMarkers[index];
        const residual = fitResiduals[index];
        const target = nextState.constraints.rootFit.targets[index];
        if (!marker || !residual || !target) return;
        fitActual.set(local.x, local.y, 0.25);
        puppet.root.localToWorld(fitActual);
        marker.position.copy(vector(target, 1.3));
        updateLine(residual, fitActual, vector(target, fitActual.z));
        marker.visible = nextState.constraints.rootFit.enabled;
        residual.visible =
          nextState.constraints.rootFit.enabled &&
          Math.hypot(fitActual.x - target.x, fitActual.y - target.y) > 1e-5;
      });

      bodyRod.visible = nextState.constraints.rootPosition.enabled;
    }
  };
}
