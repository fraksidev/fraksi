# Next demo: `demos/shared-duet`

Status: architecture brief; no implementation started.

## Intent

Leave `fraksi-prototype` and `demos/webcam-duet` intact as working reference
baselines. Build `demos/shared-duet` by combining the prototype's general rig and
authority boundaries with the webcam duet's satisfying local instrument. The
new foundation should support explicit options without creating another set of
unrelated protocols, rooms, state models, and solvers.

Success means preserving the webcam duet's solo responsiveness and noise
control while establishing reusable foundations for later mouse, webcam, Leap,
touch, Canvas, and Three.js applications. Rapid-fire, cartoony accents are the
default motion goal; generic smoothness is not.

Networking, Canvas 2D, and Three.js are all in scope for this demo. Canvas and
Three.js must consume the same scene and canonical primary state, with only the
selected renderer active at runtime.

## Showcase sketch direction

`shared-duet` is a short feature-showcase sketch rather than one scene that
unnaturally uses every capability at once. The leading sequence is:

1. **Paper lobby.** Canvas renders the original two puppets in a
   camera-viewed-paper medium. The set contains a foreground door labeled
   “Shadow Stage.” The performers move their puppets behind the door while the
   Three.js code, transition assets, final set, and shaders prepare in the
   background.
2. **Falling between.** An authorized cue key atomically activates the prepared
   Three.js renderer and a swirling vertical/depth transition set. Each
   performer is temporarily routed to a varied “falling” puppet instance that
   can spin and descend as if moving into the screen. These are separate cast
   members and may use different mappings, but the human/source assignments do
   not change.
3. **Shadow stage.** A second cue activates a preloaded shadow-screen set,
   reroutes each performer to the original cast member, and places those puppets
   upright in the final Three.js scene. The transition first fades to a complete
   blackout; scene/cast/routing changes commit while hidden; then the shadow
   screen or projector illumination rises from dark to reveal the stage. Their
   ownership and selected control stations persist across the sequence.

A reset cue may return the room to the paper lobby for repeated demonstrations.
The cue operator is a minimal authorized capability in this demo, not the full
future director/stage-manager interface. A cue remains unavailable until every
required local presentation reports ready; failure leaves the current scene
running rather than revealing a blank or partially loaded transition.

This sequence deliberately demonstrates warm renderer/set switching, asset
preparation, multiple media, scene cues, cast substitution, stable performer
assignment, and source-to-target patch changes while retaining the webcam
duet's central two-person performance.

## What to preserve

### From `fraksi-prototype`

- Separation of device input, normalized controls, bindings, constraints,
  canonical state, networking, and rendering.
- Data-defined bodies, joints, local attachments, facing, and controls.
- Small deterministic primary solvers, staged constraint handling, explicit
  priorities, and residual/conflict diagnostics.
- Server-side ownership, validation, sequence rejection, canonical primary rig
  state, stable release, and observer snapshots.
- A renderer consuming canonical state rather than owning control authority.

### From `demos/webcam-duet`

- Browser-local camera inference; raw video and landmarks remain local.
- Calibration, One Euro filtering, adaptive static friction, and deliberate
  tracking-loss behavior.
- Aperture arm mapping, experimental independent-arm mapping, reversed input,
  keyboard fallback, and atomic two-hand solo ownership.
- Immediate local feedback, approximately 30 Hz network transmission, and
  render-rate motion between network updates.
- Two-arm playability, viewer mode, optional rods/reveal, and audience view.

The existing webcam renderer also applies a spring to each arm target and
interpolates depth. The successful feel therefore includes spring response,
and `shared-duet` should preserve the current arm spring as its initial
reference profile. It remains an explicit authored control response, not a
blanket instruction to smooth every channel.

## Performance character

- Primary body, joint, and controlled attachment motion uses an explicit
  response profile. Direct response is available; the initial shared-duet arm
  mapping preserves webcam-duet's spring response as the demonstrated default.
- One Euro filtering removes measurement noise while remaining velocity-aware.
- Adaptive static friction suppresses rest jitter but releases quickly for
  deliberate motion; it is not ordinary smoothing.
- The local performer renders predicted primary motion without network delay or
  an observer interpolation buffer.
- Remote presentation may use a short, bounded policy selected by the scene,
  but must preserve accents rather than ease every update into syrupy motion.
- Springs, drag, bounce, or damping exist only when authored for a particular
  control or element. This includes responsive primary control followers, such
  as webcam-duet's arms, as well as rubber-band tails, dangling appendages,
  loose clothing, hair, and similar secondary mechanisms.
- A spring is not imposed globally. Its coefficients and role belong to the
  puppet or mapping, and its behavior must still pass rapid accent, reversal,
  stopping, and latency tests.

## Proposed foundation boundaries

Create a small workspace of shareable libraries. Start with the boundaries that
have demonstrated reuse pressure:

1. **Core domain types** — math, timestamps/sequences, stage/scene/cast identity,
   and scalar, boolean, `vec2`, pose, and event signal values. Demo-specific
   schemas compose these primitives rather than putting anatomical names in the
   core.
2. **Source processing** — device-independent calibration helpers, One Euro
   filters, adaptive static friction, acquisition-relative bindings, and
   explicit reset/tracking-loss policies. Device landmark interpretation stays
   in station adapters.
3. **Control-signal layer** — typed source and target ports, capability
   descriptions, patches, routing, bounded sample histories, takeover policies,
   and composable processors or “FX.” A patch connects a source to puppet,
   prop, scenery, or later camera ports without either side knowing the other's
   device or implementation.
4. **Rig and primary solver** — authored bodies, joints, attachments, target
   port contracts, canonical transforms, deterministic geometric solving, and
   diagnostics. Canonical signal FX may shape primary targets before solving;
   authored physical mechanics remain rig behavior, while cosmetic secondary
   presentation dynamics remain a separate stage.
5. **Room core** — clients, role/capability authorization, performer-slot claims,
   target leases, atomic multi-claims, release/disconnect behavior, pose
   retention, and pluggable ownership policy. The shared core addresses cast
   instances by ID and does not assume exactly two targets even though the first
   composition is a duet. The first demo needs performer/viewer roles plus one
   minimal cue capability; later production roles must not require a replacement
   room model.
6. **Versioned protocol** — one shared WebSocket/JSON message family for session,
   source capabilities, target ports, claims, patch activation, signal updates,
   canonical state, cues, and errors. Transport, encoding, and semantics remain
   separable.
7. **Stage model** — renderer-independent stage coordinates, scene contents,
   cast instances, props/scenery, and runtime state.
8. **Adapters** — webcam, mouse/touch, keyboard, and future Leap/MIDI stations;
   Canvas and Three.js views. Adapters depend on core contracts, not one another.

Avoid a universal plugin framework initially. Introduce an option only where a
current demo proves two useful choices exist.

A likely initial layout is:

```text
packages/
  core/              # math, controls, stage/medium/scene/cast state
  control/           # source calibration, filters, friction, loss policies
  signal/            # ports, patches, routing, buffers, processors, takeover
  rig/               # target ports, authored mechanics, solvers, diagnostics
  protocol/          # versioned messages and runtime validation
  room/              # ownership and authoritative scene transitions
  presentation/      # renderer contract, coordinator, assets, transitions/FX
  render-canvas/     # Canvas adapter
  render-three/      # Three.js adapter
  station-webcam/    # MediaPipe-specific acquisition and mapping
  station-pointer/   # mouse/touch adapter
  station-keyboard/  # deterministic fallback/testing adapter

demos/shared-duet/   # composition, UI, manifests, and demo policies
```

Package boundaries are organizational and test boundaries, not invitations to
runtime indirection. Prefer direct typed imports and plain data. Compile a patch
to a stable execution plan when it changes; do not put a dynamic plugin
registry, general event bus, reflection, graph discovery, or allocation-heavy
channel traversal in the frame loop.

## Stage, medium, scene, and cast model

Use these terms consistently:

- **Stage** — the persistent performance space: coordinate convention, bounds,
  entrances/exits, presentation surface, and available view configurations. A
  proscenium is one possible stage, not a requirement. A stage selects a
  presentation medium but is not itself a rendering engine.
- **Presentation medium** — the theatrical and optical apparatus being
  simulated: for example a lit shadow screen, camera-viewed paper cut-outs with
  rods behind them, or an overhead projector with transparencies. It defines
  meaningful visual relationships such as screen, light, paper, rods,
  projection, occlusion, and flattening without prescribing Canvas or Three.js
  draw calls.
- **Scene** — one configured dramatic situation on a stage: scenery, props,
  set selection, cast placements, available/default control patches, and
  scene-specific presentation policies.
- **Set** — a reusable arrangement of scenery and props on a stage, with common
  asset identities and renderer-specific realizations. Changing the set need
  not recreate or release the cast.
- **Cast** — the puppet instances available to the running performance or room,
  not objects owned by a renderer or a single scene. Each cast member has an
  instance ID, references a reusable puppet definition, supplies a role/initial
  pose, and is the target of ownership and control. Scenes place cast members
  by ID, allowing the same live cast to continue across sets or scene cuts.
- **Performer slot** — the durable assignment held by a person/source across a
  sketch. A slot's active patch may target the original puppet in one scene, a
  transition variant in another, and the original puppet again without asking
  the performer to reclaim each cast member.
- **Puppet definition** — reusable authored artwork, bodies, joints,
  attachments, typed control ports, behavior channels, and optional mechanical
  or secondary dynamics. It does not reference webcam, mouse, Leap, or another
  station implementation.
- **Prop/scenery definition and instance** — authored objects referenced by a
  scene; they may later become controllable through the same target model.
- **Camera** — a later view definition over a stage. Renderers may initially
  provide one default view without making cameras part of control authority.
- **Sketch** — an ordered or cued composition of scenes. The first shared duet
  uses only the minimal form required for the paper-lobby, falling-transition,
  and shadow-stage sequence; a general show-authoring system remains later work.

Definitions are reusable authored data. Cast instances, claims, patches, and
canonical pose belong to the running performance/room; scenes reference cast
placements and sets reference scenery/prop instances. The room claims target
instance IDs, never hard-coded character names.

Conceptually:

```ts
interface StageDefinition {
  id: string;
  bounds: Bounds2D;
  coordinateSystem: "y-down" | "y-up";
  mediumId: string;
  views: ViewDefinition[];
}

interface PresentationMediumDefinition {
  id: string;
  family: "shadow-screen" | "camera-paper" | "overhead-projector";
  lighting: LightingTreatment;
  layering: LayeringTreatment;
  rods: RodTreatment;
  requiredCapabilities: RendererCapability[];
}

interface PerformanceDefinition {
  id: string;
  cast: CastMemberDefinition[];
  performerSlots: PerformerSlotDefinition[];
  initialSceneId: string;
}

interface PerformerSlotDefinition {
  id: string;
  initialCastMemberId: string;
  allowedPatchIds: string[];
}

interface SketchDefinition {
  id: string;
  sceneIds: string[];
  cues: CueDefinition[];
}

interface SetDefinition {
  id: string;
  stageId: string;
  scenery: SceneObjectInstance[];
  props: SceneObjectInstance[];
  assetBundleIds: string[];
}

interface SceneDefinition {
  id: string;
  stageId: string;
  setId: string;
  castPlacements: CastPlacementDefinition[];
  availablePatchIds: string[];
  presentation: PresentationPolicy;
}

interface CastPlacementDefinition {
  castMemberId: string;
  transform: Transform2D;
  layer?: string;
}

interface CastMemberDefinition {
  id: string;
  puppetDefinitionId: string;
  role?: string;
  initialPose: Transform2D;
  secondaryDynamics?: SecondaryDynamicsDefinition[];
}

interface ControlPatchDefinition {
  id: string;
  sourceProfileId: string;
  routes: SignalRouteDefinition[];
  processors: SignalProcessorDefinition[];
  takeover: TakeoverPolicy;
}
```

These interfaces are directional, not finalized API. Validate them against the
actual shared duet before generalizing beyond its fixed showcase sketch to
branching cue structures or multiple cameras.

The medium is renderer-independent in intent but renderer-dependent in
realization. Canvas and Three.js each implement the medium treatments they can
support. A renderer must advertise compatibility; it must not silently replace
an unsupported overhead-projector or shadow treatment with an unrelated look.
Renderer-specific shader, light, material, and compositing details remain in
the render adapter or namespaced view configuration rather than entering
canonical scene or rig state.

## Renderer, set, and asset switching

Instant switching is a presentation concern, not a room or rig transition. A
single coordinator owns `requestAnimationFrame` and calls exactly one active
renderer with the current immutable presentation snapshot. Render adapters do
not own control response, spring, cast, claim, or room state. Canvas 2D and
WebGL use separate stacked surfaces because a canvas context cannot be safely
changed between those modes; activation swaps surface visibility on a frame
boundary.

Support two preparation paths:

- **Cold:** dynamically load renderer code and fetch/decode its asset bundle.
  This minimizes initial memory and download cost but the first switch is not
  instant and must expose loading/readiness/error state.
- **Warm:** preload code and assets, initialize the hidden surface, compile
  shaders or pipelines with one preparation frame, then suspend it. A prepared
  renderer can activate on the next animation frame. While suspended it runs no
  frame loop, input handlers, physics, or timers; its cost is retained memory
  and, for Three.js, GPU resources.

Use warm switching for the comparison experiment. Keep the previous renderer
or set active until the requested replacement reports ready, then atomically
activate it with the same cast pose, FX state, ownership, scene revision, view,
and clock. Asset bundles have stable semantic IDs plus Canvas and Three.js
variants, reference-counted cache entries, readiness/error state, and explicit
disposal. Instrument fetch, decode, shader preparation, switch time, frame
time, and retained memory where the browser exposes it.

Set switching follows the same prepare/activate protocol but does not replace
the cast. A simple set change retains world pose; a scene cut may provide an
explicit placement transition. Renderer choice can initially be local for
comparison. A later synchronized production cue should carry a future effective
timestamp and capability/fallback policy rather than assuming every client can
prepare the same renderer or medium.

## Presentation effects and lighting cues

Keep **presentation FX** distinct from control-signal FX and from authored stage
lighting:

- A transition effect such as fade/blackout, wipe, or color wash modifies the
  composed output and can conceal an atomic renderer/scene/cast swap.
- A lighting cue changes an authored stage target such as lamp, projector, or
  screen illumination and therefore belongs to canonical scene presentation
  state.
- Renderer-specific image effects such as bloom, depth of field, film grain, or
  shadow treatment remain adapter capabilities behind renderer-neutral effect
  requests where a shared meaning exists.

For the showcase landing, fade the shared presentation overlay to full black,
commit the final Three.js scene and original-cast routing, set the shadow-stage
illumination to zero, remove the safety overlay while the stage remains dark,
then ramp the actual screen/projector illumination to its authored level. If a
material or background cannot become fully dark through lighting, the overlay
remains responsible for the final opacity curve.

The first demo needs only a small timestamped effect contract—`blackout`/`fade`
plus stage illumination—not a general post-FX plugin library. The browser view
can implement the blackout once above the stacked Canvas/WebGL surfaces, which
also avoids rendering both engines for a crossfade. A future recorder that
captures an individual canvas rather than the composed browser view will need
equivalent Canvas and Three.js implementations of the same semantic effect.

For later Three.js image effects, keep its post-processing types inside the
Three adapter. WebGL `EffectComposer`/passes and the newer WebGPU render pipeline
are different implementation paths, so neither should leak into scene, cue, or
protocol contracts.

## Authority and latency model

Use a hybrid model:

```text
raw device data
  -> local station mapping/calibration/filtering
  -> normalized source signals
  -> local predicted patch/FX + binding + deterministic primary solve
  -> immediate local render

normalized source signals
  -> authoritative room validation/ownership
  -> authoritative patch/FX + binding + deterministic primary solve
  -> timestamped canonical state broadcast
  -> remote render/interpolation and local reconciliation
```

- **Local-only:** camera frames, landmarks, calibration baselines, filters,
  static-friction state, device confidence handling, and immediate prediction.
- **Server-authoritative:** identity for the connection, claims, accepted
  sequences, active source-to-target patches, accepted source signals,
  deterministic processor/binding/primary-response state, primary rig
  transforms/joints, release, and final retained pose.
- **Presentation-local by default:** trailing cloth, shadows, rod display,
  camera treatment, and other secondary motion that does not affect constraints
  or interaction. An authored spring that drives a primary arm or attachment is
  canonical response state, not merely a renderer effect.
- **Canonical only when necessary:** any dynamics that affect collisions,
  attachments, shared control, scoring, recording semantics, or future physical
  outputs must move into a deterministic fixed-step stage.

The local performer should not wait for a server echo and should not use the
same interpolation delay as observers. Server corrections should reconcile
small errors gently and snap only when authority or divergence requires it.

## State model

Keep these states distinct:

- **Device sample:** tracker-specific and private to a station adapter.
- **Normalized source signal:** stable semantic channels plus confidence,
  sequence, and source timestamp.
- **Performance assignment:** durable connection/source ownership of performer
  slots plus the current cue-authorized target leases.
- **Patch state:** active source-to-target routes, processor state, bounded
  histories, and acquisition/takeover state.
- **Binding/constraint targets:** acquisition-relative relationships between
  controls and authored rig attachments or behaviors.
- **Primary response state:** optional authored followers, including the
  shared-duet arm springs, evaluated deterministically before primary solving.
- **Canonical primary pose:** body transforms, joint values, diagnostics, and
  retained authoritative state.
- **Presentation state:** active renderer/set IDs, prepared-asset readiness,
  interpolation, and secondary dynamics owned by a view. It references but does
  not own the cast or canonical pose.
- **Sketch state:** active scene/cue revision, readiness, and effective clock;
  it coordinates atomic presentation and routing changes without becoming
  puppet state.

This prevents double filtering, distinguishes the control target from the
spring-responsive canonical pose, and keeps cosmetic presentation state out of
user intent and authoritative rig state.

## Control signals, patches, buffers, and FX

The signal layer is analogous to MIDI's independence from a particular
keyboard or sound generator, but it carries Fraksi-native typed values and
semantics. A station advertises source ports; a puppet, prop, or scenery object
advertises target ports. A patch connects compatible ports and inserts explicit
processors such as scale, invert, clamp, curve, mix, gate, static friction,
spring response, delay, or cue handling.

Puppet definitions own their mechanics and target-port contract, not their
controller stack. A webcam patch and a pointer patch may both drive the same
puppet ports. On takeover, the room changes the active patch; acquisition seeds
relative offsets and stateful processors from the current canonical target so
the mouse can continue where the webcam performer stopped without a jump.

Buffers have declared purposes and strict bounds:

- Continuous motion is latest-value state with only the short timestamped
  history needed for velocity, interpolation, filtering, or deterministic FX.
  Pending stale motion is overwritten rather than drained later.
- Discrete events and cues use an ordered bounded queue with explicit overflow
  behavior.
- Every stateful processor declares its latency, clock/fixed-step behavior, and
  reset, seed, transfer, bypass, and disconnect semantics.
- Patch edits and graph compilation occur outside the frame loop. The hot path
  executes a prevalidated plan over reusable storage without per-sample object
  allocation.

This layer may later expose authoring UI resembling a small signal patch bay,
but the first demo needs only manifest-defined patches and diagnostics.

## Options the foundation should permit

- Station: mouse/touch, keyboard, webcam, Leap, or recorded input.
- Control patch: compatible source/target routing, takeover policy, and an
  explicit ordered FX chain independent of puppet artwork and renderer.
- Renderer: Canvas 2D or Three.js from the first shared demo; other engines
  later. A prepared adapter may switch on a frame boundary without altering
  room, control, rig, cast, or scene state.
- Set: multiple scenery/prop asset bundles may place the same continuing cast;
  preparation and activation remain separate so loading never reveals a partial
  set or resets ownership.
- Presentation medium: shadow screen, camera-viewed paper cut-outs, or later an
  overhead-projector treatment. Medium choice changes the intended look and
  apparatus, not ownership, controls, canonical pose, or networking.
- Claim policy: exclusive performer slots with cue-driven target leases, atomic
  multi-slot solo, viewer, and eventually shared/assist policies.
- Room role: performer, observer, and a minimal cue operator now; later
  director/stage-manager capability profiles for general patch reassignment,
  scenery, camera, light, and sound.
- Sketch: the fixed three-scene showcase sequence and reset cue now; general
  timelines, branching, and show authoring later.
- Mapping: aperture, independent arms, direct endpoint, body pose, or authored
  behavior channels.
- Response/presentation: direct or authored spring primary response, bounded
  remote interpolation if chosen, explicitly authored secondary dynamics,
  timestamped transition FX, and stage lighting cues.
- Performance/scene/set configuration: continuing cast, stage, scenery, props,
  cast placements, available controls, initial ownership rules,
  renderer-neutral view data, and performer/observer diagnostics.

Options belong in manifests or explicit policies. They should not fork the
wire protocol or duplicate room implementations.

## Performance risks and mitigations

### Added round-trip latency

Moving all solving to the server would make the duet feel worse. Preserve local
prediction and use the same deterministic primary solver locally and on the
server. Interpolate remote/observer state only.

### Double filtering or dead zones

Server-side smoothing on already filtered controls would add lag and weaken
accents. Filter once at the station. The server validates/clamps but does not
smooth unless a later study demonstrates a separate network-jitter problem.

### Generalization overhead

Deep abstraction, allocation-heavy generic channel maps, and runtime dispatch
inside the camera/render loop could cause jitter. Keep hot-path structures
small and typed, reuse objects where measurement warrants it, and profile before
binary encoding or optimization.

### Signal backlog or hidden FX latency

A FIFO of every pointer or camera sample would replay stale gestures and make
fast performance feel delayed. Continuous ports use latest-value semantics plus
short bounded history; every processor exposes latency. Patch execution is
compiled when routing changes and measured as part of the performance budget.

### Divergent simulation

Client-local springs can differ slightly by frame rate. Primary control springs,
including the initial arm response, therefore use the same timestamped,
fixed-step implementation for local prediction and authoritative canonical
state. Cosmetic secondary springs may remain local. If secondary motion becomes
mechanically meaningful, move it into the same canonical response stage rather
than broadcasting incidental render frames.

### Reconciliation artifacts

Prediction and authority may disagree after packet delay, invalid input, or an
ownership change. Include server revision plus accepted source sequence, test
correction thresholds, and make acquisition/release transitions explicit.

### Reduced playability from a generic rig

A generic data model can obscure an instrument-specific mapping. Preserve
demo-authored mapping functions and named behavior channels on top of generic
primitives; do not force webcam hands into a skeletal abstraction.

### Canvas versus Three.js

Canvas is the demonstrated webcam-duet baseline. Three.js offers a scene graph,
richer materials, and a closer path to other engines, but adds bundle and GPU
complexity. Implement both as adapters over the same state. Establish parity in
Canvas first during development, then complete the Three.js adapter before the
shared-duet milestone is accepted. Only one adapter renders in a session, so
supporting both does not mean paying for both render loops.

Renderer parity means the same canonical pose and scene composition, not an
identical image for every medium. Canvas can provide a purposeful approximation
of a supported treatment; Three.js can use lights, materials, projection, and
depth where the medium benefits. Capability declarations and comparison scenes
make those differences explicit.

### Inactive renderer cost and first-use hitching

Letting each adapter own `requestAnimationFrame` would render twice and make the
inactive option expensive. The coordinator owns the sole loop and calls only
the active adapter. Warm alternatives retain memory but consume negligible
steady-state CPU/GPU work; cold alternatives save memory but cannot promise an
instant first switch. Shader compilation, image decode, and GPU upload occur in
the explicit preparation phase and are measured separately from activation.

### Protocol and snapshot cost

JSON and complete state are adequate for two puppets, but unbounded queued
updates can create stale motion. Preserve a send cap, add latest-update-wins
backpressure, send a full snapshot on join/recovery, and introduce deltas only
after measurement.

## Implementation sequence

1. Capture characterization fixtures for webcam-duet mapping/filter behavior
   without modifying the existing demo.
2. Create the package workspace and stage/medium/scene/cast, performer-slot,
   minimal sketch/cue, and typed source/target-port contracts beside both
   existing applications.
3. Implement and test the signal layer with compiled patches, bounded histories,
   deterministic FX, and jump-free webcam/pointer takeover fixtures.
4. Implement a new room and protocol once from those contracts, including
   exclusive performer-slot claims, cue-authorized target leases, atomic solo
   claims, viewers, minimal cue capability, release, and retained pose.
5. Build the Canvas paper-lobby scene and “Shadow Stage” door with keyboard,
   recorded-control input, the original cast, and the preserved webcam-duet arm
   spring profile as an explicit deterministic signal processor.
6. Add the webcam station using the preserved mapper/filter and arm-response
   parameters. Keep a direct profile available for diagnosis and comparison,
   not as the presumed replacement for the successful spring behavior.
7. Add local prediction and authoritative reconciliation.
8. Add the Three.js adapter, varied falling cast, swirling transition set, and
   final shadow-stage set over the same canonical performance state.
9. Add the one-loop renderer coordinator, asset manifests/cache, three prepared
   set bundles, cold/warm diagnostics, frame-boundary activation, fixed sketch
   cues, performer-slot rerouting, shared blackout/fade, final-stage illumination
   ramp, and reset.
10. Verify two performer laptops plus at least two observer laptops, solo
   dual-hand mode, release/handoff, tracking loss, and observer synchronization.
11. Verify rapid accents, stops, direction changes, and stillness under both
   renderers and under simulated latency/jitter.

Do not refactor either existing application onto the foundation during this
sequence. They remain comparison oracles until the new demo is proven.

## Acceptance evidence

- Existing applications continue to pass their current checks unchanged.
- Recorded identical control input produces matching primary poses locally and
  on the authoritative server.
- Characterization tests show no unintended change in One Euro, static-friction,
  aperture, calibration, or tracking-loss output.
- Solo input-to-local-render response is subjectively no worse than webcam-duet
  and meets a measured frame/latency budget chosen before implementation.
- The preserved arm spring still supports satisfying fast accents, reversals,
  and stops; its overshoot and settling are intentional and bounded rather than
  accidental generic smoothing. Rest jitter remains controlled.
- Four real browsers—two performers and two observers—show stable remote motion,
  exclusive claims, atomic solo claims, viewer state, release, and
  pose-preserving handoff. During renderer comparison, one performer/viewer pair
  uses Canvas and the other uses Three.js over the same canonical state.
- Each performer sees their own predicted puppet immediately and the partner's
  authoritative remote motion; observers see both puppets through one short,
  matched presentation buffer. Measured timing differences and visible contact
  disagreements are recorded rather than hidden by delaying local control.
- The performer remains responsive during latency/jitter simulation; observers
  remain smooth without delaying the local performer.
- Raw camera frames and landmarks never cross the network boundary.
- A mouse, keyboard, or recorded source can take over a puppet previously
  driven by webcam without puppet code knowing the source type and without a
  visible pose jump.
- Continuous signal buffers remain bounded and do not replay stale motion after
  load or network interruption; deterministic FX match in prediction and
  authority tests.
- The paper-lobby scene begins in Canvas with the original cast and readable
  “Shadow Stage” door. Three.js and both later sets prepare without running a
  second continuous render loop or interrupting performance.
- The transition cue activates only after readiness, switches renderer/set
  without a blank frame, and atomically routes each stable performer slot to its
  varied falling puppet. Both performers can spin/move their variants while
  observers see the same cue revision.
- The landing cue restores the original cast upright in the Three.js shadow
  stage without requiring a new claim or control-station selection. The swap is
  fully concealed at blackout and the authored shadow-screen/projector light
  reveals the new stage without a blank or partially prepared frame. Reset
  returns the room to the initial Canvas scene for another demonstration.
- Canvas and Three.js render the same canonical cast pose and scene composition
  within defined visual tolerances; switching renderer does not change network
  or ownership behavior.
- Once prepared, Canvas/Three.js and set switches commit on a frame boundary
  without resetting cast pose, claim, patch, spring/FX, or room state. Only the
  active renderer receives frame calls.
- Cold and warm load/prepare/switch timings and asset failures are visible in a
  diagnostic mode. An unavailable alternative leaves the current presentation
  running rather than exposing a partial set or blank stage.
- The stage names its presentation medium separately from its renderer. Each
  renderer either supplies a declared implementation of that medium or reports
  it as unsupported; visual fallback is never accidental.
- Performance, scene, and set manifests define the continuing cast, cast
  placements, scenery, and props without hard-coded character IDs in the room
  core. Changing set or scene does not implicitly release a performer-slot
  claim.

## Input still required

- The subjective and measured performance budget for “no worse than webcam
  duet,” using the same device/browser that produced the satisfying baseline.
- Exact artwork, transition duration, foreground-door occlusion behavior, and
  performer mapping for spinning/falling variants within the agreed showcase
  sequence.
- The warm renderer/set memory budget and acceptable cold preparation time on
  the MacBook and iPad targets; both will be measured before choosing cache and
  disposal defaults.
