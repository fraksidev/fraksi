import { describe, expect, it } from "vitest";
import { AuthoritativeRoom } from "../src/server/room";
import { restFrame } from "../src/control/normalize";

describe("authoritative puppet ownership",()=>{
  it("claims exclusively, releases on leave, and preserves the final pose",()=>{const r=new AuthoritativeRoom();r.join("one");r.join("two");expect(r.claim("one","ember")).toBe(true);expect(r.claim("two","ember")).toBe(false);const f={...restFrame("ember","one"),timestamp:10,body:{...restFrame("ember").body,x:.81}};expect(r.apply("one",f)).toBe(true);expect(r.leave("one")).toBe(true);expect(r.snapshot().puppets.ember.ownerId).toBeNull();expect(r.snapshot().puppets.ember.frame.body.x).toBe(.81);expect(r.claim("two","ember")).toBe(true);expect(r.snapshot().puppets.ember.frame.body.x).toBe(.81)});
  it("does not accept control from viewers or another owner",()=>{const r=new AuthoritativeRoom();r.join("one");r.join("two");r.claim("one","tide");expect(r.apply("two",{...restFrame("tide","two"),timestamp:1})).toBe(false)});
  it("atomically claims and releases both puppets for solo mode",()=>{const r=new AuthoritativeRoom();r.join("solo");expect(r.claimSolo("solo")).toBe(true);expect(r.snapshot().puppets.ember.ownerId).toBe("solo");expect(r.snapshot().puppets.tide.ownerId).toBe("solo");expect(r.claim("other","ember")).toBe(false);r.leave("solo");expect(r.snapshot().puppets.ember.ownerId).toBeNull();expect(r.snapshot().puppets.tide.ownerId).toBeNull()});
  it("rejects solo mode unless both puppets are free",()=>{const r=new AuthoritativeRoom();r.claim("one","ember");expect(r.claimSolo("solo")).toBe(false);expect(r.snapshot().puppets.tide.ownerId).toBeNull()});
});
