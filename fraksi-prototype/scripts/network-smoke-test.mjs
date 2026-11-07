import WebSocket from "ws";

function nextMessage(socket, expectedType) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${expectedType}`)), 2000);
    const onMessage = (data) => {
      const message = JSON.parse(data.toString());
      if (message.type !== expectedType) return;
      clearTimeout(timeout);
      socket.off("message", onMessage);
      resolve(message);
    };
    socket.on("message", onMessage);
  });
}

function send(socket, message) {
  socket.send(JSON.stringify(message));
}

async function waitUntil(predicate, message) {
  const deadline = Date.now() + 2000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error(message);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

const first = new WebSocket("ws://127.0.0.1:8787");
const second = new WebSocket("ws://127.0.0.1:8787");
let latestSecondScene = null;
second.on("message", (data) => {
  const message = JSON.parse(data.toString());
  if (message.type === "session.welcome" || message.type === "scene.snapshot") {
    latestSecondScene = message.scene;
  }
});
const firstWelcomePromise = nextMessage(first, "session.welcome");
const secondWelcomePromise = nextMessage(second, "session.welcome");
const firstWelcome = await firstWelcomePromise;
const secondWelcome = await secondWelcomePromise;

send(first, { type: "puppet.claim", puppetId: "character-a" });
await nextMessage(first, "puppet.claimed");
send(second, { type: "puppet.claim", puppetId: "character-b" });
await nextMessage(second, "puppet.claimed");

const original = firstWelcome.scene.puppets.find((puppet) => puppet.id === "character-a");
if (!original) throw new Error("Puppet A missing from welcome snapshot");
const start = { x: original.root.position.x, y: original.root.position.y };
send(first, {
  type: "control.sample",
  sample: {
    controlId: "character-a:root",
    phase: "start",
    position: start,
    sequence: 0,
    timestamp: 0
  }
});
send(first, {
  type: "control.sample",
  sample: {
    controlId: "character-a:root",
    phase: "move",
    position: { x: start.x + 0.4, y: start.y + 0.2 },
    sequence: 1,
    timestamp: 1
  }
});

await waitUntil(
  () => Boolean(
    latestSecondScene &&
    latestSecondScene.puppets.find((puppet) => puppet.id === "character-a").root.position.x !== start.x
  ),
  "Remote client did not receive movement"
);
const moved = latestSecondScene.puppets.find((puppet) => puppet.id === "character-a");
if (Math.abs(moved.root.position.x - (start.x + 0.4)) > 1e-6) {
  throw new Error("Remote client did not receive authoritative movement");
}

send(first, { type: "scene.leave" });
await nextMessage(first, "scene.left");
await waitUntil(
  () => latestSecondScene?.owners["character-a"] === null,
  "Puppet A was not released"
);
if (latestSecondScene.owners["character-b"] !== secondWelcome.clientId) {
  throw new Error("Other performer ownership changed when puppet A left");
}

first.close();
second.close();
console.log("Network smoke test passed");
