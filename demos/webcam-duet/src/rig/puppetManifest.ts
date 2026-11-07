import type { PuppetId } from "../shared/protocol";
export interface PuppetManifest { id: PuppetId; name: string; identity: string; accent: string; body: { width: number; height: number; pivot: [number, number] }; arms: { shoulder: [number, number]; upper: number; fore: number; width: number }[] }
export const PUPPETS: Record<PuppetId, PuppetManifest> = {
  ember: { id: "ember", name: "Ember", identity: "#b64b3f", accent: "#f0a35b", body: { width: 104, height: 174, pivot: [52, 88] }, arms: [{ shoulder: [-42, -46], upper: 68, fore: 68, width: 20 }, { shoulder: [42, -46], upper: 68, fore: 68, width: 20 }] },
  tide: { id: "tide", name: "Tide", identity: "#287d79", accent: "#70b8a4", body: { width: 118, height: 158, pivot: [59, 82] }, arms: [{ shoulder: [-49, -38], upper: 72, fore: 63, width: 17 }, { shoulder: [49, -38], upper: 72, fore: 63, width: 17 }] }
};
