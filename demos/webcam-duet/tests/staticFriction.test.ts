import {describe,expect,it} from "vitest";
import {StaticFriction1D,StaticFriction2D} from "../src/control/staticFriction";

describe("adaptive static friction",()=>{
  it("holds tracking noise inside its rest radius",()=>{const friction=new StaticFriction2D(.01);expect(friction.filter({x:.5,y:.5},0)).toEqual({x:.5,y:.5});expect(friction.filter({x:.504,y:.497},16)).toEqual({x:.5,y:.5})});
  it("breaks away immediately for deliberate motion",()=>{const friction=new StaticFriction1D(.02,20);friction.filter(.5,0);expect(friction.filter(.7,16)).toBeGreaterThan(.69)});
  it("resets without retaining a previous rest pose",()=>{const friction=new StaticFriction1D(.02);friction.filter(.5,0);friction.reset();expect(friction.filter(.8,16)).toBe(.8)});
});
