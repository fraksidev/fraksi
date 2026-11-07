import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";
import { isClientMessage, type ServerMessage } from "../shared/protocol";
import { AuthoritativeRoom } from "./room";

const port = Number(process.env.WEBCAM_DUET_WS_PORT ?? 8899);
const host = process.env.WEBCAM_DUET_WS_HOST ?? "0.0.0.0";
const room = new AuthoritativeRoom();
const clients = new Map<WebSocket, string>();
const server = new WebSocketServer({ host, port });
const send = (ws: WebSocket, m: ServerMessage) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(m));
const broadcast = () => clients.forEach((_, ws) => send(ws, { type: "scene.snapshot", scene: room.snapshot() }));

server.on("connection", (ws) => {
  const clientId = randomUUID(); clients.set(ws, clientId); room.join(clientId);
  send(ws, { type: "session.welcome", clientId, scene: room.snapshot() }); broadcast();
  ws.on("message", (data) => {
    let raw: unknown; try { raw = JSON.parse(data.toString()); } catch { raw = null; }
    if (!isClientMessage(raw)) return void send(ws, { type: "error", message: "Invalid message." });
    if (raw.type === "puppet.claim") {
      if (room.claim(clientId, raw.puppetId)) send(ws, { type: "puppet.claimed", puppetId: raw.puppetId });
      else send(ws, { type: "claim.rejected", puppetId: raw.puppetId, reason: "That puppet is already performing." });
      return void broadcast();
    }
    if(raw.type==="puppets.claim-solo"){
      if(room.claimSolo(clientId))send(ws,{type:"solo.claimed"});
      else send(ws,{type:"claim.rejected",puppetId:"ember",reason:"Solo mode needs both puppets to be available."});
      return void broadcast();
    }
    if (raw.type === "control.frame") { if (room.apply(clientId, raw.frame)) broadcast(); return; }
    room.leave(clientId); send(ws, { type: "scene.left" }); broadcast();
  });
  ws.on("close", () => { room.leave(clientId); clients.delete(ws); broadcast(); });
});
console.log(`Webcam Duet room listening on ws://${host}:${port}`);
