# Significant decisions

## Performance and architecture

- **Performance first.** Fraksi is for live, continuous, shared performance,
  not primarily clip assembly, generic motion capture, or photorealism.
- **Layer the system.** Tracking/device APIs, normalized source signals,
  patch/routing/FX, target bindings, constraints/behavior, canonical state,
  networking, and rendering remain separate. Controllers are not characters,
  and Unreal/Three.js/Canvas are output adapters rather than canonical runtimes.
- **Author mechanics explicitly.** Rigs consist of bodies, local attachment
  coordinates, joints, constraints, priorities, and solve stages rather than a
  presumed human skeleton. Generic solver APIs avoid anatomical assumptions.
- **Prefer understandable staged solvers.** Use analytic or small deterministic
  solutions appropriate to the problem before generalized optimization, and
  expose artistic behaviors rather than solver terminology.

## Control and networking

- **Puppets do not own controller stacks.** Puppets expose typed target ports
  and authored mechanics. Stations expose normalized source signals. A separate
  patch layer routes mouse, webcam, Leap, MIDI, recorded, or network sources to
  puppets, props, scenery, and later cameras.
- **Signal processing is a first-class layer.** Patches may contain explicit
  processors or “FX,” bounded histories, and acquisition/takeover policy. Patch
  changes compile outside the frame loop; runtime execution stays typed,
  allocation-conscious, and deterministic where it affects canonical state.
- **Continuous controls are latest-value signals, not unbounded event queues.**
  Short ring-buffer history supports filtering, velocity, interpolation, and
  replay diagnostics without accumulating stale gestures. Discrete cues use a
  separate bounded ordered queue.
- **Targets own canonical state.** Acquisition uses relative offsets so a new
  controller or performer does not make an object jump.
- **The server is authoritative.** Both current demos grant ownership and accept
  control on the server, retain final pose after release, and broadcast shared
  state to performers and viewers.
- **WebSocket and JSON are the initial transport/encoding.** Protocol semantics
  should remain separable from transport and encoding. Complete snapshots are a
  deliberate simple starting point, not a final optimization decision.
- **Ownership is currently exclusive.** The prototype grants at most one puppet
  per client; the webcam duet additionally supports an atomic solo claim of both
  puppets. Shared/assist ownership remains research work.

## Current applications

- **Keep the webcam demo self-contained initially.** It reused the prototype's
  authoritative-room rules and architectural boundaries without modifying or
  importing the prototype. Shared-package extraction was deferred.
- **Perform camera inference locally.** Webcam pixels and raw landmarks remain
  in the browser; only normalized control frames are sent to the server.
- **Use accessible fallback input.** The webcam demo includes keyboard control
  so room, mapping, and rendering work can proceed without camera permission.
- **Treat current webcam silhouettes as temporary.** Replacement art requires
  recorded artist, tradition/cultural context, license, source, and attribution.
- **AI is authoring assistance, not the live performer.** It may propose pieces,
  pivots, textures, or mappings, but the puppeteer decides mechanics and control.

## Next demo direction

- **Preserve both current applications as reference baselines.** Do not refactor
  either onto new shared packages while defining the next demo.
- **Build the next demo from shared foundations.** Combine the prototype's
  layered rig/authority architecture with the webcam duet's local mapping,
  filtering, static friction, solo ownership, and immediate responsiveness.
- **Protect local feel with hybrid authority.** Device processing and immediate
  prediction stay local; the server owns claims, active patches, accepted
  source signals, canonical processor/binding state, and deterministic primary
  pose. Cosmetic secondary dynamics remain view-local unless they become
  mechanically significant.
- **Prove options before generalizing.** Shared contracts may support multiple
  stations, mappings, claim policies, and renderers, but should not begin as a
  universal plugin system. See `next-demo-brief.md`.
- **The next application is `demos/shared-duet`.** It consumes new reusable
  libraries while both existing applications remain unchanged references.
- **Responsiveness outranks generic smoothness.** Primary controlled motion is
  optimized for rapid cartoony accents. One Euro and adaptive static friction
  handle measurement noise. The successful webcam-duet arm spring is preserved
  as the initial authored primary response profile; springs may also drive
  secondary mechanics, but are never applied as universal smoothing.
- **Canvas and Three.js are peer render adapters.** Both consume the same
  stage/scene/cast and canonical pose state, and only the selected renderer runs.
- **Use Stage, Scene, and Cast as domain boundaries.** A stage defines the
  performance space, a scene supplies scenery/props/cast configuration, and cast
  members are controllable puppet instances. Cameras and multi-scene sketches
  may extend this model later.
- **Separate presentation medium from renderer.** A stage selects the
  theatrical/optical model—such as shadow screen, camera-viewed paper, or
  overhead projector—while Canvas or Three.js implements that model according
  to declared capabilities. Medium choice never changes control authority or
  canonical pose.
- **Networking is part of shared-duet.** It includes performer/viewer ownership,
  atomic solo claims, authoritative state, release, and pose-preserving handoff
  rather than remaining a later integration.
