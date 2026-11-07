# Project status

Last inspected: 2026-11-06.

Fraksi currently contains two self-contained research applications. Both use
TypeScript and an in-memory authoritative WebSocket server, but they do not
share packages or runtime state.

## Planned, not implemented

- `demos/shared-duet` is specified in `next-demo-brief.md` as a third application
  built on new shared libraries. It is intended to preserve rapid, cartoony
  motion and webcam-duet's authored arm spring response; support additional
  puppet-authored secondary mechanics, both Canvas 2D and Three.js render
  adapters, reusable Stage, Scene, and Cast concepts, and a presentation-medium
  definition distinct from the selected renderer. A separate typed signal layer
  is planned to route controller-independent sources through bounded buffers and
  explicit FX to puppet, prop, and scenery ports. The planned presentation layer
  keeps cast state above the renderers and supports measured warm switching
  between Canvas/Three.js and multiple prepared sets. The leading demo scenario
  is a fixed three-scene showcase: Canvas paper lobby and “Shadow Stage” door,
  Three.js falling/swirl transition with varied puppet instances, then the
  original cast revealed in a Three.js shadow stage through a synchronized
  blackout and authored screen/projector-light cue.
- No `shared-duet` application or shared package workspace exists yet. The two
  current applications remain unchanged reference baselines.

## Verified in this inspection

- `fraksi-prototype`: `npm run build` passed.
- `fraksi-prototype`: `npm run test:network` passed against the running server.
  The script exercised two clients claiming separate puppets, authoritative
  movement propagation, release, and preservation of the other owner's claim.
- `demos/webcam-duet`: `npm test` passed all 13 tests covering normalization,
  hand mappings, adaptive static friction, exclusive ownership, solo claiming,
  release, and pose preservation.
- `demos/webcam-duet`: `npm run build` passed.
- `demos/webcam-duet`: `npm run test:room` passed against the running server.
  It exercised two performers plus a viewer, claim rejection, pose propagation,
  release, reclaim, and stable pose handoff.
- Git was clean before these documentation edits: `main` tracked `origin/main`
  at `0f2d8ab` (`Initial Fraksi research prototypes`).

The prototype build reports a non-failing warning that its minified JavaScript
chunk exceeds 500 kB.

## `fraksi-prototype`

### Implemented

- Three.js orthographic shadow stage with two fixed articulated puppets facing
  one another, data-defined bodies/joints/attachments, and a warm screen shader.
- Pointer/touch-event adapter for whole-puppet translation and an endpoint rod.
- Engine-independent two-link IK, 2D rigid fitting, staged root/reach solving,
  reflected rig instances, acquisition-relative bindings, and residual/conflict
  diagnostics.
- Authoritative JSON-over-WebSocket server on port `8787`. It owns canonical
  state, validates messages and monotonically increasing sequences, grants one
  puppet per client, retains the last pose on release, and broadcasts complete
  snapshots.
- Browser clients can observe, hover/select an available puppet, manipulate
  only their claim, leave without interrupting the other performer, and retry a
  dropped connection. Rods, handles, targets, and diagnostics are visible only
  to the local owner.

### Partial or not currently exposed

- Rigid-fit state, priorities, bend direction, reach release, and their
  diagnostics exist in the runtime/view, but the current network client exposes
  only root and endpoint manipulation. The prototype README's interaction list
  describes older buttons that are no longer present.
- The network smoke test covers room behavior but not Three.js rendering,
  pointer hit testing, touch behavior, hover appearance, or the leave UI.
- There are no unit tests for IK, rigid fitting, facing reflection, or staged
  solving.

### Known limitations

- One in-memory room with two hard-coded puppets; no persistence, authentication,
  authorization beyond socket ownership, TLS, deployment configuration, or
  reconnect identity/grace period.
- Full scene snapshots are sent for accepted updates; there is no measured
  backpressure policy, interpolation buffer, or protocol versioning.
- No recording/replay, OSC, Leap input, Unreal adapter, sliding attachment, or
  general multi-performer handoff implementation.

### Run and check

```bash
cd fraksi-prototype
npm install
npm run dev                 # Vite 5173; WebSocket server 8787
npm run build
```

With `npm run dev` or `npm run start:server` running in another terminal:

```bash
npm run test:network
```

## `demos/webcam-duet`

### Implemented

- Canvas 2D stage with two fixed temporary silhouettes, articulated two-link
  arms with spring-driven target response, optional rods/reveal overlay,
  fullscreen UI,
  keyboard input, camera preview, and a mirrored audience preview.
- Browser-local MediaPipe hand-landmark integration for up to two hands. The
  mapping layer normalizes palm position, lean, depth, pinch/aperture, and arm
  targets; it includes calibration, One Euro filtering, adaptive static
  friction, tracking-loss behavior, reversed assignment, and experimental
  independent-arm mapping.
- Authoritative JSON-over-WebSocket room on port `8899` with two exclusive
  puppet claims, viewers, atomic two-puppet solo claims, normalized frames,
  timestamp rejection, complete snapshots, release on leave/disconnect, and
  preservation of the last pose.
- Client-side local prediction/update and an approximately 30 Hz send cap.
  Camera pixels and raw landmarks are not included in network frames.

### Implemented in code but not exercised in this inspection

- Browser UI and rendering, physical webcam permission/capture, MediaPipe GPU
  inference, two-hand solo performance, keyboard performance, tracking loss,
  fullscreen, reveal controls, and audience preview.
- MediaPipe WASM/model and Google Fonts are loaded from external CDNs. Camera
  use requires a secure browser context (`localhost` or HTTPS); LAN HTTP alone
  is insufficient for normal camera permission behavior.

### Known limitations

- One in-memory room with two hard-coded puppets and temporary programmatic
  artwork; no persistence, authentication, TLS/WSS deployment, named rooms,
  reconnect identity, protocol versioning, or recording/export.
- Despite the README heading “Camera and recording,” the code only hides UI for
  a clean view; it does not record a performance.
- The two applications duplicate room/protocol concepts rather than sharing a
  package. The webcam demo intentionally began self-contained.
- The renderer and main client are compact and difficult to evolve safely;
  browser/device coverage is not automated.

### Run and check

Requires Node.js 20 or newer.

```bash
cd demos/webcam-duet
npm install
npm run dev                 # Vite 5191; WebSocket server 8899
npm test
npm run build
```

With `npm run dev` or `npm run start:server` running in another terminal:

```bash
npm run test:room
```
