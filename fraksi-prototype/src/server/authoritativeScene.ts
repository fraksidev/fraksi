import { RelativePositionBinding } from "../bindings/relativePositionBinding";
import type { Pose2DControlSample } from "../controls/controlTypes";
import type { Point2 } from "../math/point2";
import type { PuppetId, SceneSnapshot } from "../network/protocol";
import {
  createRigState,
  type CanonicalRigState
} from "../runtime/rigState";
import { solveRigStages } from "../runtime/stagedRuntime";

interface ControlSession {
  binding: RelativePositionBinding;
  state: CanonicalRigState;
  target: "root" | "endpoint";
}

function createInitialStates(): CanonicalRigState[] {
  return [
    createRigState({
      id: "character-a",
      position: { x: -2.25, y: -0.2 },
      rotation: -0.08,
      endpointHandleOffset: { x: -0.75, y: -0.75 },
      bendDirection: 1
    }),
    createRigState({
      id: "character-b",
      facingDirection: -1,
      position: { x: 0.45, y: -0.2 },
      rotation: 0.08,
      endpointHandleOffset: { x: 0.75, y: -0.75 },
      bendDirection: -1
    })
  ];
}

export class AuthoritativeScene {
  private readonly states = createInitialStates();
  private readonly owners = new Map<PuppetId, string>();
  private readonly activeControls = new Map<string, ControlSession>();
  private readonly lastSequences = new Map<string, number>();
  private revision = 0;

  constructor() {
    this.states.forEach(solveRigStages);
  }

  snapshot(): SceneSnapshot {
    return {
      revision: this.revision,
      puppets: this.states,
      owners: {
        "character-a": this.owners.get("character-a") ?? null,
        "character-b": this.owners.get("character-b") ?? null
      }
    };
  }

  claim(clientId: string, puppetId: PuppetId): boolean {
    if (this.puppetFor(clientId) || this.owners.has(puppetId)) return false;
    this.owners.set(puppetId, clientId);
    this.bumpRevision();
    return true;
  }

  leave(clientId: string): boolean {
    const puppetId = this.puppetFor(clientId);
    this.releaseControl(clientId);
    this.lastSequences.delete(clientId);
    if (!puppetId) return false;
    this.owners.delete(puppetId);
    this.bumpRevision();
    return true;
  }

  applyControl(clientId: string, sample: Pose2DControlSample): boolean {
    const puppetId = this.puppetFor(clientId);
    if (!puppetId || !sample.controlId.startsWith(`${puppetId}:`)) return false;
    if (!Number.isFinite(sample.position.x) || !Number.isFinite(sample.position.y)) {
      return false;
    }
    const lastSequence = this.lastSequences.get(clientId) ?? -1;
    if (!Number.isInteger(sample.sequence) || sample.sequence <= lastSequence) {
      return false;
    }
    this.lastSequences.set(clientId, sample.sequence);

    if (sample.phase === "start") {
      const session = this.createControlSession(puppetId, sample.controlId);
      if (!session) return false;
      session.binding.acquire(sample.position, this.sessionTarget(session));
      this.activeControls.set(clientId, session);
      return true;
    }

    const session = this.activeControls.get(clientId);
    if (!session || sample.controlId !== `${session.state.id}:${session.target}`) {
      return false;
    }
    if (sample.phase === "end") {
      this.releaseControl(clientId);
      return true;
    }

    const resolved = session.binding.resolve(sample.position);
    if (session.target === "root") {
      session.state.constraints.rootPosition.target = resolved;
    } else {
      const handle = session.state.controls.endpointRodHandle;
      session.state.constraints.reach.target.x += resolved.x - handle.x;
      session.state.constraints.reach.target.y += resolved.y - handle.y;
      session.state.controls.endpointRodHandle = resolved;
    }
    solveRigStages(session.state);
    this.bumpRevision();
    return true;
  }

  private createControlSession(
    puppetId: PuppetId,
    controlId: string
  ): ControlSession | null {
    const state = this.states.find((candidate) => candidate.id === puppetId);
    if (!state) return null;
    if (controlId === `${puppetId}:root`) {
      return { binding: new RelativePositionBinding(), state, target: "root" };
    }
    if (controlId === `${puppetId}:endpoint`) {
      return { binding: new RelativePositionBinding(), state, target: "endpoint" };
    }
    return null;
  }

  private sessionTarget(session: ControlSession): Point2 {
    return session.target === "root"
      ? session.state.constraints.rootPosition.target
      : session.state.controls.endpointRodHandle;
  }

  private releaseControl(clientId: string): void {
    this.activeControls.get(clientId)?.binding.release();
    this.activeControls.delete(clientId);
  }

  private puppetFor(clientId: string): PuppetId | null {
    for (const [puppetId, ownerId] of this.owners) {
      if (ownerId === clientId) return puppetId;
    }
    return null;
  }

  private bumpRevision(): void {
    this.revision += 1;
  }
}

