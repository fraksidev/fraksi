import * as THREE from "three";
import { getAttachment, getJoint } from "./rig/shadowPuppetRig";

export interface ShadowPuppet {
  root: THREE.Group;
  silhouetteMaterial: THREE.MeshBasicMaterial;
  torsoAnchor: THREE.Object3D;
  handAnchor: THREE.Object3D;
  headPivot: THREE.Group;
  armPivot: THREE.Group;
  forearmPivot: THREE.Group;
}

const jointMaterial = new THREE.MeshBasicMaterial({
  color: 0x8f6b3d,
  side: THREE.DoubleSide
});

function createShapeMesh(
  shape: THREE.Shape,
  material: THREE.MeshBasicMaterial,
  z = 0
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    material
  );
  mesh.position.z = z;
  return mesh;
}

function createJoint(radius = 0.07): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    jointMaterial
  );
}

function torsoShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(-0.42, -0.82);
  shape.quadraticCurveTo(-0.56, -0.15, -0.48, 0.5);
  shape.quadraticCurveTo(-0.24, 0.86, 0.02, 0.9);
  shape.quadraticCurveTo(0.28, 0.84, 0.46, 0.46);
  shape.quadraticCurveTo(0.53, -0.2, 0.34, -0.82);
  shape.lineTo(-0.42, -0.82);
  shape.closePath();
  return shape;
}

function headShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(-0.27, -0.32);
  shape.quadraticCurveTo(-0.42, 0.0, -0.26, 0.34);
  shape.quadraticCurveTo(0.02, 0.53, 0.35, 0.26);
  shape.quadraticCurveTo(0.52, 0.03, 0.31, -0.25);
  shape.quadraticCurveTo(0.02, -0.43, -0.27, -0.32);
  shape.closePath();
  return shape;
}

function limbShape(length: number, width: number): THREE.Shape {
  const half = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(0, -half);
  shape.lineTo(length - width * 0.45, -half);
  shape.quadraticCurveTo(length, -half, length, 0);
  shape.quadraticCurveTo(length, half, length - width * 0.45, half);
  shape.lineTo(0, half);
  shape.closePath();
  return shape;
}

function handShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(-0.02, -0.14);
  shape.quadraticCurveTo(0.19, -0.2, 0.34, -0.05);
  shape.quadraticCurveTo(0.4, 0.05, 0.26, 0.12);
  shape.quadraticCurveTo(0.12, 0.22, -0.02, 0.11);
  shape.closePath();
  return shape;
}

function lowerBodyShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(-0.36, 0.22);
  shape.lineTo(0.35, 0.22);
  shape.lineTo(0.05, -0.72);
  shape.lineTo(-0.12, -0.72);
  shape.closePath();
  return shape;
}

export function buildShadowPuppet(): ShadowPuppet {
  const silhouetteMaterial = new THREE.MeshBasicMaterial({
    color: 0x090807,
    side: THREE.DoubleSide
  });
  const bodyRodAttachment = getAttachment("body-rod");
  const baseJoint = getJoint("base-joint");
  const intermediateJoint = getJoint("intermediate-joint");
  const endpointAttachment = getAttachment("endpoint");
  const root = new THREE.Group();
  root.name = "puppet-root";

  const lowerBodyPivot = new THREE.Group();
  lowerBodyPivot.name = "lower-body-pivot";
  lowerBodyPivot.position.set(0, -0.7, 0.01);
  lowerBodyPivot.add(createShapeMesh(lowerBodyShape(), silhouetteMaterial, 0.01));
  lowerBodyPivot.add(createJoint());
  root.add(lowerBodyPivot);

  const torso = createShapeMesh(torsoShape(), silhouetteMaterial, 0.04);
  torso.name = "torso";
  root.add(torso);

  const torsoAnchor = new THREE.Object3D();
  torsoAnchor.name = "torso-rod-anchor";
  torsoAnchor.position.set(
    bodyRodAttachment.localPosition.x,
    bodyRodAttachment.localPosition.y,
    0.12
  );
  torsoAnchor.add(createJoint(0.08));
  root.add(torsoAnchor);

  const headPivot = new THREE.Group();
  headPivot.name = "head-pivot";
  headPivot.position.set(0.02, 0.87, 0.07);
  headPivot.add(createShapeMesh(headShape(), silhouetteMaterial, 0.02));
  headPivot.add(createJoint());
  root.add(headPivot);

  const armPivot = new THREE.Group();
  armPivot.name = "arm-pivot";
  armPivot.position.set(
    baseJoint.parentAnchor.x,
    baseJoint.parentAnchor.y,
    0.08
  );
  armPivot.add(createShapeMesh(limbShape(0.78, 0.18), silhouetteMaterial, 0.02));
  armPivot.add(createJoint());
  root.add(armPivot);

  const forearmPivot = new THREE.Group();
  forearmPivot.name = "forearm-pivot";
  forearmPivot.position.set(
    intermediateJoint.parentAnchor.x,
    intermediateJoint.parentAnchor.y,
    0.03
  );
  forearmPivot.add(createShapeMesh(limbShape(0.68, 0.15), silhouetteMaterial, 0.02));
  forearmPivot.add(createJoint());
  armPivot.add(forearmPivot);

  const handPivot = new THREE.Group();
  handPivot.name = "hand-pivot";
  handPivot.position.set(0.66, 0, 0.03);
  handPivot.add(createShapeMesh(handShape(), silhouetteMaterial, 0.02));
  handPivot.add(createJoint(0.055));
  forearmPivot.add(handPivot);

  const handAnchor = new THREE.Object3D();
  handAnchor.name = "hand-rod-anchor";
  handAnchor.position.set(
    endpointAttachment.localPosition.x - handPivot.position.x,
    endpointAttachment.localPosition.y - handPivot.position.y,
    0.06
  );
  handAnchor.add(createJoint(0.065));
  handPivot.add(handAnchor);

  return {
    root,
    silhouetteMaterial,
    torsoAnchor,
    handAnchor,
    headPivot,
    armPivot,
    forearmPivot
  };
}
