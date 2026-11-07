import type { Point2 } from "../math/point2";

export type ControlPhase = "start" | "move" | "end";

export interface Pose2DControlSample {
  controlId: string;
  phase: ControlPhase;
  position: Point2;
  sequence: number;
  timestamp: number;
}

