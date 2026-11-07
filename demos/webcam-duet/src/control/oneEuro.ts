class LowPass {
  private value?: number;
  next(v: number, alpha: number) { this.value = this.value === undefined ? v : alpha * v + (1 - alpha) * this.value; return this.value; }
  reset() { this.value = undefined; }
}
export class OneEuro {
  private x = new LowPass(); private dx = new LowPass(); private last?: number; private raw?: number;
  constructor(private minCutoff = 1.1, private beta = .035, private dCutoff = 1) {}
  filter(value: number, timestampMs: number) {
    const dt = this.last === undefined ? 1 / 60 : Math.max(.001, (timestampMs - this.last) / 1000); this.last = timestampMs;
    const alpha = (cutoff: number) => 1 / (1 + 1 / (2 * Math.PI * cutoff * dt));
    const derivative = this.raw === undefined ? 0 : (value - this.raw) / dt; this.raw = value;
    const edx = this.dx.next(derivative, alpha(this.dCutoff));
    return this.x.next(value, alpha(this.minCutoff + this.beta * Math.abs(edx)));
  }
  reset() { this.x.reset(); this.dx.reset(); this.last = undefined; this.raw = undefined; }
}
