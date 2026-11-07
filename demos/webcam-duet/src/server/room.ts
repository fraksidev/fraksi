import { normalizeFrame, restFrame } from "../control/normalize";
import { PUPPET_IDS, type ControlFrame, type PuppetId, type RoomSnapshot } from "../shared/protocol";

export class AuthoritativeRoom {
  private revision = 0;
  private audience = new Set<string>();
  private owners = new Map<PuppetId, string>();
  private frames = new Map(PUPPET_IDS.map((id) => [id, restFrame(id)]));
  private timestamps = new Map<PuppetId, number>();

  join(clientId: string) { this.audience.add(clientId); this.revision++; }
  claim(clientId: string, puppetId: PuppetId) {
    if (this.puppetFor(clientId) || this.owners.has(puppetId)) return false;
    this.owners.set(puppetId, clientId); this.revision++; return true;
  }
  claimSolo(clientId:string){
    if(this.puppetFor(clientId)||PUPPET_IDS.some(id=>this.owners.has(id)))return false;
    PUPPET_IDS.forEach(id=>this.owners.set(id,clientId));this.revision++;return true;
  }
  apply(clientId: string, input: ControlFrame) {
    if (this.owners.get(input.puppetId) !== clientId) return false;
    if (input.performerId !== clientId || input.timestamp <= (this.timestamps.get(input.puppetId) ?? -1)) return false;
    const frame = normalizeFrame(input); this.frames.set(frame.puppetId, frame); this.timestamps.set(frame.puppetId, frame.timestamp); this.revision++; return true;
  }
  leave(clientId: string) {
    this.audience.delete(clientId); const puppetIds = PUPPET_IDS.filter(id=>this.owners.get(id)===clientId);
    if (!puppetIds.length) { this.revision++; return false; }
    puppetIds.forEach(id=>{this.owners.delete(id);this.timestamps.delete(id)}); this.revision++; return true;
  }
  snapshot(): RoomSnapshot {
    const puppet = (id: PuppetId) => ({ id, ownerId: this.owners.get(id) ?? null, frame: this.frames.get(id)! });
    return { revision: this.revision, audience: this.audience.size, puppets: { ember: puppet("ember"), tide: puppet("tide") } };
  }
  private puppetFor(clientId: string) { return PUPPET_IDS.find((id) => this.owners.get(id) === clientId) ?? null; }
}
