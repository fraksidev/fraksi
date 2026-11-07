import type { Point2 } from "../math/point2";
import type { Pose2DControlSample } from "./controlTypes";

type ProjectPointer = (clientX: number, clientY: number) => Point2;
type SelectControl = (position: Point2) => string | null;
type SampleListener = (sample: Pose2DControlSample) => void;

/** Browser-specific adapter that emits normalized 2D pose samples. */
export class PointerStation {
  private activeControlId: string | null = null;
  private sequence = 0;
  private readonly element: HTMLElement;
  private readonly projectPointer: ProjectPointer;
  private readonly selectControl: SelectControl;
  private readonly onSample: SampleListener;

  constructor(
    element: HTMLElement,
    projectPointer: ProjectPointer,
    selectControl: SelectControl,
    onSample: SampleListener
  ) {
    this.element = element;
    this.projectPointer = projectPointer;
    this.selectControl = selectControl;
    this.onSample = onSample;
    element.addEventListener("pointerdown", this.handlePointerDown);
    element.addEventListener("pointermove", this.handlePointerMove);
    element.addEventListener("pointerup", this.handlePointerEnd);
    element.addEventListener("pointercancel", this.handlePointerEnd);
  }

  private emit(
    controlId: string,
    phase: Pose2DControlSample["phase"],
    position: Point2
  ): void {
    this.onSample({
      controlId,
      phase,
      position,
      sequence: this.sequence++,
      timestamp: performance.now()
    });
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.activeControlId) return;

    const position = this.projectPointer(event.clientX, event.clientY);
    const controlId = this.selectControl(position);
    if (!controlId) return;

    this.activeControlId = controlId;
    this.element.setPointerCapture(event.pointerId);
    this.emit(controlId, "start", position);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.activeControlId) return;
    const position = this.projectPointer(event.clientX, event.clientY);
    this.emit(this.activeControlId, "move", position);
  };

  private readonly handlePointerEnd = (event: PointerEvent): void => {
    if (!this.activeControlId) return;
    const position = this.projectPointer(event.clientX, event.clientY);
    this.emit(this.activeControlId, "end", position);
    this.activeControlId = null;

    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }
  };
}
