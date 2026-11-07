import type { RigDefinition } from "./rigTypes";

export const shadowPuppetRig = {
  bodies: [
    {
      id: "body-root",
      label: "Body root",
      initialPosition: { x: -0.15, y: -0.15 },
      initialRotation: -0.08,
      rigid: true
    },
    {
      id: "segment-a",
      initialPosition: { x: 0.37, y: 0.5 },
      initialRotation: 0,
      rigid: true
    },
    {
      id: "segment-b",
      initialPosition: { x: 0.76, y: 0 },
      initialRotation: 0,
      rigid: true
    }
  ],
  joints: [
    {
      id: "base-joint",
      parentBodyId: "body-root",
      childBodyId: "segment-a",
      type: "revolute",
      parentAnchor: { x: 0.37, y: 0.5 },
      childAnchor: { x: 0, y: 0 }
    },
    {
      id: "intermediate-joint",
      parentBodyId: "segment-a",
      childBodyId: "segment-b",
      type: "revolute",
      parentAnchor: { x: 0.76, y: 0 },
      childAnchor: { x: 0, y: 0 }
    }
  ],
  attachments: [
    {
      id: "body-rod",
      bodyId: "body-root",
      localPosition: { x: 0.08, y: 0.15 },
      allowedModes: ["pin", "target"]
    },
    {
      id: "body-fit-a",
      bodyId: "body-root",
      localPosition: { x: -0.34, y: 0.18 },
      allowedModes: ["target"]
    },
    {
      id: "body-fit-b",
      bodyId: "body-root",
      localPosition: { x: 0.34, y: 0.18 },
      allowedModes: ["target"]
    },
    {
      id: "endpoint",
      bodyId: "segment-b",
      localPosition: { x: 0.94, y: 0 },
      allowedModes: ["target"]
    }
  ],
  twoLinkConstraints: [
    {
      id: "primary-reach",
      baseAttachment: { x: 0.37, y: 0.5 },
      firstSegmentLength: 0.76,
      secondSegmentLength: 0.94
    }
  ]
} satisfies RigDefinition;

export function getAttachment(id: string) {
  const attachment = shadowPuppetRig.attachments.find((item) => item.id === id);
  if (!attachment) throw new Error(`Unknown attachment: ${id}`);
  return attachment;
}

export function getBody(id: string) {
  const body = shadowPuppetRig.bodies.find((item) => item.id === id);
  if (!body) throw new Error(`Unknown body: ${id}`);
  return body;
}

export function getJoint(id: string) {
  const joint = shadowPuppetRig.joints.find((item) => item.id === id);
  if (!joint) throw new Error(`Unknown joint: ${id}`);
  return joint;
}

export function getTwoLinkConstraint(id: string) {
  const constraint = shadowPuppetRig.twoLinkConstraints.find(
    (item) => item.id === id
  );
  if (!constraint) throw new Error(`Unknown two-link constraint: ${id}`);
  return constraint;
}
