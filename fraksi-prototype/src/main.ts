import * as THREE from "three";
import "./stage.css";
import type { Pose2DControlSample } from "./controls/controlTypes";
import { PointerStation } from "./controls/pointerStation";
import type { Point2 } from "./math/point2";
import type {
  ClientMessage,
  PuppetId,
  SceneSnapshot,
  ServerMessage
} from "./network/protocol";
import { createRigState, type CanonicalRigState } from "./runtime/rigState";
import { buildProjectionScreen } from "./screen";
import { buildPuppetView } from "./view/puppetView";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing #app element.");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171411);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, 0.1, 100);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

const stage = new THREE.Group();
scene.add(stage);
const screen = buildProjectionScreen();
screen.position.set(0, 0, -0.5);
stage.add(screen);

const initialStates = [
  createRigState({
    id: "character-a",
    position: { x: -2.25, y: -0.2 },
    rotation: -0.08,
    endpointHandleOffset: { x: -0.75, y: -0.75 },
    bendDirection: 1
  }),
  createRigState({
    id: "character-b",
    facingDirection: -1,
    position: { x: 0.45, y: -0.2 },
    rotation: 0.08,
    endpointHandleOffset: { x: 0.75, y: -0.75 },
    bendDirection: -1
  })
];
const views = new Map<PuppetId, ReturnType<typeof buildPuppetView>>([
  ["character-a", buildPuppetView(stage, initialStates[0]!, 0x5f91a8)],
  ["character-b", buildPuppetView(stage, initialStates[1]!, 0x9568a8)]
]);

let socket: WebSocket | null = null;
let clientId: string | null = null;
let sceneSnapshot: SceneSnapshot | null = null;
let hoveredPuppetId: PuppetId | null = null;
let claimPending = false;

const controls = document.createElement("div");
controls.className = "controls";
const status = document.createElement("div");
status.className = "connection-status";
status.textContent = "Connecting to scene…";
const leaveButton = document.createElement("button");
leaveButton.className = "control-button leave-button";
leaveButton.type = "button";
leaveButton.textContent = "Leave scene";
leaveButton.hidden = true;
controls.append(status, leaveButton);
app.appendChild(controls);

function puppetId(value: string): PuppetId | null {
  return value === "character-a" || value === "character-b" ? value : null;
}

function stateFor(id: PuppetId): CanonicalRigState | null {
  return sceneSnapshot?.puppets.find((state) => state.id === id) ?? null;
}

function localPuppetId(): PuppetId | null {
  if (!clientId || !sceneSnapshot) return null;
  for (const id of ["character-a", "character-b"] as const) {
    if (sceneSnapshot.owners[id] === clientId) return id;
  }
  return null;
}

function updateInterface(): void {
  const owned = localPuppetId();
  leaveButton.hidden = owned === null;
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    status.textContent = "Scene server disconnected";
  } else if (owned) {
    status.textContent = `Performing puppet ${owned === "character-a" ? "A" : "B"}`;
  } else if (claimPending) {
    status.textContent = "Claiming puppet…";
  } else if (sceneSnapshot && Object.values(sceneSnapshot.owners).every(Boolean)) {
    status.textContent = "Watching — both puppets are claimed";
  } else {
    status.textContent = "Hover and click an available puppet";
  }

  for (const id of ["character-a", "character-b"] as const) {
    const owner = sceneSnapshot?.owners[id] ?? null;
    const view = views.get(id);
    view?.setControlsVisible(id === owned);
    view?.setAppearance(
      id === owned
        ? "owned"
        : owner
          ? "remote"
          : id === hoveredPuppetId
            ? "hovered"
            : "normal"
    );
  }
}

function send(message: ClientMessage): void {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function handleServerMessage(message: ServerMessage): void {
  if (message.type === "session.welcome") {
    clientId = message.clientId;
    sceneSnapshot = message.scene;
  } else if (message.type === "scene.snapshot") {
    sceneSnapshot = message.scene;
  } else if (message.type === "puppet.claimed") {
    claimPending = false;
    hoveredPuppetId = null;
  } else if (message.type === "claim.rejected") {
    claimPending = false;
    status.textContent = message.reason;
  } else if (message.type === "scene.left") {
    claimPending = false;
    hoveredPuppetId = null;
  } else if (message.type === "error") {
    status.textContent = message.message;
  }
  updateInterface();
}

function connect(): void {
  const configuredUrl = import.meta.env.VITE_FRAKSI_WS_URL as string | undefined;
  const url = configuredUrl ?? `ws://${window.location.hostname}:8787`;
  socket = new WebSocket(url);
  socket.addEventListener("open", updateInterface);
  socket.addEventListener("message", (event) => {
    try {
      handleServerMessage(JSON.parse(String(event.data)) as ServerMessage);
    } catch {
      status.textContent = "Received an invalid scene message";
    }
  });
  socket.addEventListener("close", () => {
    clientId = null;
    sceneSnapshot = null;
    claimPending = false;
    updateInterface();
    window.setTimeout(connect, 1000);
  });
}

leaveButton.addEventListener("click", () => send({ type: "scene.leave" }));

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const controlPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.2);
const projectedPoint = new THREE.Vector3();

function projectPointer(clientX: number, clientY: number): Point2 {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (!raycaster.ray.intersectPlane(controlPlane, projectedPoint)) {
    throw new Error("Pointer ray does not intersect the puppet stage.");
  }
  return { x: projectedPoint.x, y: projectedPoint.y };
}

function distance(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function availablePuppetAt(position: Point2): PuppetId | null {
  if (!sceneSnapshot) return null;
  return (["character-a", "character-b"] as const)
    .filter((id) => !sceneSnapshot?.owners[id])
    .map((id) => ({ id, state: stateFor(id) }))
    .filter((entry): entry is { id: PuppetId; state: CanonicalRigState } => Boolean(entry.state))
    .sort(
      (a, b) => distance(position, a.state.root.position) - distance(position, b.state.root.position)
    )
    .find((entry) => distance(position, entry.state.root.position) <= 1.05)?.id ?? null;
}

renderer.domElement.addEventListener("pointermove", (event) => {
  if (localPuppetId() || claimPending) return;
  hoveredPuppetId = availablePuppetAt(projectPointer(event.clientX, event.clientY));
  updateInterface();
});

renderer.domElement.addEventListener("pointerleave", () => {
  hoveredPuppetId = null;
  updateInterface();
});

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (localPuppetId() || claimPending) return;
  const id = availablePuppetAt(projectPointer(event.clientX, event.clientY));
  if (!id) return;
  claimPending = true;
  send({ type: "puppet.claim", puppetId: id });
  updateInterface();
});

function selectControl(position: Point2): string | null {
  const id = localPuppetId();
  if (!id) return null;
  const state = stateFor(id);
  if (!state) return null;
  if (distance(position, state.controls.endpointRodHandle) <= 0.3) {
    return `${id}:endpoint`;
  }
  return distance(position, state.root.position) <= 1.15 ? `${id}:root` : null;
}

function handleControlSample(sample: Pose2DControlSample): void {
  send({ type: "control.sample", sample });
}

new PointerStation(
  renderer.domElement,
  projectPointer,
  selectControl,
  handleControlSample
);

function resize(): void {
  const aspect = window.innerWidth / window.innerHeight;
  const viewHeight = 6;
  camera.left = -(viewHeight * aspect) / 2;
  camera.right = (viewHeight * aspect) / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", resize);
resize();
connect();

function render(): void {
  requestAnimationFrame(render);
  const states = sceneSnapshot?.puppets ?? initialStates;
  for (const state of states) {
    const id = puppetId(state.id);
    if (id) views.get(id)?.update(state);
  }
  renderer.render(scene, camera);
}

render();
