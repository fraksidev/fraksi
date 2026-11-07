import { describe,expect,it } from "vitest";
import { armPoseFromAperture, independentArmPose, screenPalmRoll } from "../src/control/handMapper";

describe("thumb-index arm shaping",()=>{
  it("brings both hands together above the head for a pinch",()=>{const [left,right]=armPoseFromAperture(.12);expect(left.x).toBeCloseTo(-.12);expect(right.x).toBeCloseTo(.12);expect(left.y).toBeCloseTo(-1.52);expect(right.y).toBeCloseTo(-1.52)});
  it("uses the full two-bone reach for a fully open hand",()=>{const [left,right]=armPoseFromAperture(1.4);expect(left.x).toBeCloseTo(-2.55);expect(right.x).toBeCloseTo(2.55);expect(left.y).toBeCloseTo(-.45)});
});
describe("anatomy-independent palm lean",()=>{
  it("reports a visible left tilt as counterclockwise in mirrored screen space",()=>{const neutral=screenPalmRoll({x:.5,y:.8},{x:.5,y:.4});const left=screenPalmRoll({x:.5,y:.8},{x:.7,y:.45});const delta=Math.atan2(Math.sin(left-neutral),Math.cos(left-neutral));expect(delta).toBeLessThan(0)});
});
describe("independent finger controls",()=>{
  it("maps thumb and index to distinct body-relative arm targets",()=>{const [left,right]=independentArmPose({x:-.8,y:-.4},{x:.25,y:-1.25});expect(left).toEqual({x:-1.62,y:-.44800000000000006});expect(right.x).toBeCloseTo(.905);expect(right.y).toBeCloseTo(-1.4)});
  it("can reverse the finger-to-arm assignment",()=>{const normal=independentArmPose({x:-.8,y:-.4},{x:.25,y:-1.25});const reversed=independentArmPose({x:-.8,y:-.4},{x:.25,y:-1.25},true);expect(reversed).toEqual([normal[1],normal[0]])});
});
