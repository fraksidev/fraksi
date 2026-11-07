import type { Point2 } from "../math/point2";

/** Maintains the control-to-target offset established at acquisition. */
export class RelativePositionBinding {
  private controlAtAcquisition: Point2 = { x: 0, y: 0 };
  private targetAtAcquisition: Point2 = { x: 0, y: 0 };
  private acquired = false;

  acquire(control: Point2, target: Point2): void {
    this.controlAtAcquisition = { ...control };
    this.targetAtAcquisition = { ...target };
    this.acquired = true;
  }

  resolve(control: Point2): Point2 {
    if (!this.acquired) {
      throw new Error("Cannot resolve a control binding before acquisition.");
    }
    return {
      x: this.targetAtAcquisition.x + control.x - this.controlAtAcquisition.x,
      y: this.targetAtAcquisition.y + control.y - this.controlAtAcquisition.y
    };
  }

  release(): void {
    this.acquired = false;
  }

  get active(): boolean {
    return this.acquired;
  }
}
