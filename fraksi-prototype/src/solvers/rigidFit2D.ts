import type { Point2 } from "../math/point2";

export interface RigidFit2DResult {
  position: Point2;
  rotation: number;
  residuals: Point2[];
  residualDistance: number;
  degenerate: boolean;
}

function centroid(points: readonly Point2[]): Point2 {
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / points.length, y: total.y / points.length };
}

/** Finds the least-squares rigid transform from local points to target points. */
export function solveRigidFit2D(
  localPoints: readonly Point2[],
  targetPoints: readonly Point2[]
): RigidFit2DResult {
  if (localPoints.length < 2 || localPoints.length !== targetPoints.length) {
    throw new Error("Rigid fitting requires matching point sets of length two or more.");
  }

  const localCenter = centroid(localPoints);
  const targetCenter = centroid(targetPoints);
  let dot = 0;
  let cross = 0;
  let spread = 0;

  for (let index = 0; index < localPoints.length; index += 1) {
    const local = localPoints[index];
    const target = targetPoints[index];
    if (!local || !target) continue;
    const lx = local.x - localCenter.x;
    const ly = local.y - localCenter.y;
    const tx = target.x - targetCenter.x;
    const ty = target.y - targetCenter.y;
    dot += lx * tx + ly * ty;
    cross += lx * ty - ly * tx;
    spread += lx * lx + ly * ly;
  }

  const degenerate = spread <= 1e-10 || Math.hypot(dot, cross) <= 1e-10;
  const rotation = degenerate ? 0 : Math.atan2(cross, dot);
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const position = {
    x: targetCenter.x - (localCenter.x * cosine - localCenter.y * sine),
    y: targetCenter.y - (localCenter.x * sine + localCenter.y * cosine)
  };
  const residuals = localPoints.map((local, index) => {
    const target = targetPoints[index];
    if (!target) return { x: 0, y: 0 };
    const solvedX = position.x + local.x * cosine - local.y * sine;
    const solvedY = position.y + local.x * sine + local.y * cosine;
    return { x: target.x - solvedX, y: target.y - solvedY };
  });
  const residualDistance = Math.sqrt(
    residuals.reduce(
      (sum, residual) => sum + residual.x ** 2 + residual.y ** 2,
      0
    )
  );

  return { position, rotation, residuals, residualDistance, degenerate };
}

