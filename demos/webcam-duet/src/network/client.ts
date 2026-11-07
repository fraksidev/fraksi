import type { ClientMessage, PuppetId, RoomSnapshot, ServerMessage } from "../shared/protocol";

export class RoomClient extends EventTarget {
  socket?: WebSocket; clientId = ""; scene?: RoomSnapshot; connected = false;
  connect(url: string) {
    this.socket = new WebSocket(url);
    this.socket.onopen = () => { this.connected = true; this.emit("status"); };
    this.socket.onclose = () => { this.connected = false; this.emit("status"); setTimeout(() => this.connect(url), 1500); };
    this.socket.onmessage = (event) => { const m = JSON.parse(event.data) as ServerMessage; if (m.type === "session.welcome") this.clientId = m.clientId; if (m.type === "session.welcome" || m.type === "scene.snapshot") this.scene = m.scene; this.dispatchEvent(new CustomEvent("message", { detail: m })); };
  }
  send(message: ClientMessage) { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message)); }
  claim(id: PuppetId) { this.send({ type: "puppet.claim", puppetId: id }); }
  claimSolo(){this.send({type:"puppets.claim-solo"});}
  leave() { this.send({ type: "scene.leave" }); }
  private emit(type: string) { this.dispatchEvent(new Event(type)); }
}
