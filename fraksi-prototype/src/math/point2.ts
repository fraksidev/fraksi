export interface Point2 {
  x: number;
  y: number;
}

export function distanceSquared(a: Point2, b: Point2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function transformPoint(point: Point2, position: Point2, rotation: number): Point2 {
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  return {
    x: position.x + point.x * cosine - point.y * sine,
    y: position.y + point.x * sine + point.y * cosine
  };
}

export function inverseTransformPoint(
  point: Point2,
  position: Point2,
  rotation: number
): Point2 {
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const x = point.x - position.x;
  const y = point.y - position.y;
  return {
    x: x * cosine + y * sine,
    y: -x * sine + y * cosine
  };
}

