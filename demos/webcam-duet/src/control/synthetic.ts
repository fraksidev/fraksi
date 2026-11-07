import { restFrame } from "./normalize";
import type { ControlFrame, PuppetId } from "../shared/protocol";

export class SyntheticInput {
  private down = new Set<string>(); private frame?: ControlFrame;
  constructor() { addEventListener("keydown", this.onDown); addEventListener("keyup", this.onUp); }
  private onDown = (e: KeyboardEvent) => { if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "q", "e", "w", "a", "s", "d"].includes(e.key.toLowerCase())) e.preventDefault(); this.down.add(e.key.toLowerCase()); };
  private onUp = (e: KeyboardEvent) => this.down.delete(e.key.toLowerCase());
  sample(performerId: string, puppetId: PuppetId, now: number): ControlFrame {
    this.frame ??= restFrame(puppetId, performerId); const f = structuredClone(this.frame), step = .006;
    if (this.down.has("arrowleft")) f.body.x -= step; if (this.down.has("arrowright")) f.body.x += step;
    if (this.down.has("arrowup")) f.body.y -= step; if (this.down.has("arrowdown")) f.body.y += step;
    if (this.down.has("q")) f.body.rotation -= .018; if (this.down.has("e")) f.body.rotation += .018;
    if (this.down.has("a")) f.handles.leftArm.x -= step * 1.5; if (this.down.has("d")) f.handles.rightArm.x += step * 1.5;
    if (this.down.has("w")) { f.handles.leftArm.y -= step; f.handles.rightArm.y -= step; }
    if (this.down.has("s")) { f.handles.leftArm.y += step; f.handles.rightArm.y += step; }
    f.timestamp = now; f.performerId = performerId; this.frame = f; return f;
  }
}
