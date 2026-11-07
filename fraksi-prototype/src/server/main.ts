import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";
import {
  isClientMessage,
  type ClientMessage,
  type ServerMessage
} from "../network/protocol";
import { AuthoritativeScene } from "./authoritativeScene";

const port = Number(process.env.FRAKSI_WS_PORT ?? 8787);
const host = process.env.FRAKSI_WS_HOST ?? "0.0.0.0";
const scene = new AuthoritativeScene();
const clients = new Map<WebSocket, string>();
const server = new WebSocketServer({ host, port });

function send(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function broadcastScene(): void {
  const message: ServerMessage = { type: "scene.snapshot", scene: scene.snapshot() };
  for (const socket of clients.keys()) send(socket, message);
}

function parseMessage(data: WebSocket.RawData): ClientMessage | null {
  try {
    const value: unknown = JSON.parse(data.toString());
    return isClientMessage(value) ? value : null;
  } catch {
    return null;
  }
}

server.on("connection", (socket) => {
  const clientId = randomUUID();
  clients.set(socket, clientId);
  send(socket, { type: "session.welcome", clientId, scene: scene.snapshot() });

  socket.on("message", (data) => {
    const message = parseMessage(data);
    if (!message) {
      send(socket, { type: "error", message: "Invalid message." });
      return;
    }

    if (message.type === "puppet.claim") {
      if (scene.claim(clientId, message.puppetId)) {
        send(socket, { type: "puppet.claimed", puppetId: message.puppetId });
        broadcastScene();
      } else {
        send(socket, {
          type: "claim.rejected",
          puppetId: message.puppetId,
          reason: "That puppet is no longer available."
        });
        send(socket, { type: "scene.snapshot", scene: scene.snapshot() });
      }
      return;
    }

    if (message.type === "control.sample") {
      if (scene.applyControl(clientId, message.sample)) broadcastScene();
      return;
    }

    if (message.type === "scene.leave") {
      scene.leave(clientId);
      send(socket, { type: "scene.left" });
      broadcastScene();
    }
  });

  socket.on("close", () => {
    scene.leave(clientId);
    clients.delete(socket);
    broadcastScene();
  });
});

console.log(`Fraksi scene server listening on ws://${host}:${port}`);
