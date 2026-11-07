# Fraksi Design Scope

## Purpose

Fraksi is an experimental architecture for live, collaborative digital performance.

Its first application is virtual puppetry, especially flat cut-out and shadow-puppet forms rendered in Three.js and later Unreal Engine. The broader system is intended to support performers controlling characters, props, scenery, cameras, lighting, sound, projection, effects, robots, and other stage outputs.

Fraksi is not primarily an animation-authoring system, motion-capture recorder, or cost-reduction pipeline. Its central question is:

> How can digital systems preserve and extend the liveness, responsiveness, shared agency, and expressive constraints of puppetry and related performance traditions?

The system should enable performances created in the moment rather than assembled primarily from pre-authored animation clips.

## Core Design Principles

### 1. Performance first

The system should be judged by whether performers can create convincing character relationships, rhythm, attention, status, contrast, timing, and reaction in real time.

A minimal but important benchmark is:

- one performer;
- one character on each hand;
- two characters able to converse, listen, react, interrupt, dance, oppose one another, and remain alive simultaneously.

Visual realism is secondary to expressive readability.

### 2. Continuous control before canned action

Prefer continuous signals such as position, orientation, velocity, acceleration, pressure, trigger depth, pinch distance, finger gait rhythm, twist, attention direction, tension, and constraint weight.

Discrete triggers remain appropriate for theatrical state changes such as explosions, transformations, swallowing another character, changing props, switching control modes, or attaching and releasing constraints.

The trigger should initiate a condition or state. Continuous performance should shape how that condition unfolds whenever practical.

### 3. Controllers are not characters

Controller hardware, performer inputs, control routing, rig mechanics, and rendered outputs must remain decoupled.

The architecture should not assume:

```text
one controller -> one performer -> one character
```

Instead:

```text
performer station
    -> normalized expressive controls
    -> temporary bindings
    -> constraints or behavior channels
    -> characters, props, scenery, or stage systems
```

A Leap Motion device, Valve Index controller, Antilatency tracker, custom rod, MIDI controller, touch surface, mocap suit, camera tracker, or future device should be replaceable without redesigning the puppet rig.

### 4. Control ownership is dynamic

Performers may operate separate characters, share one character, temporarily assist another performer, take control of one limb or behavior, move from a character to a prop or scenic element, hand off control during a performance, or share authority with procedural behavior or automation.

The unit of routing is not necessarily a whole character. It may be a rigid body, attachment point, limb endpoint, mouth, eyebrow, behavior parameter, prop, light, camera, or effect.

### 5. Puppet mechanics are authored, not inferred as anatomy

Fraksi should not assume a human skeleton.

A rig is composed from rigid bodies or cut-out pieces, pivots and joints, local attachment points, constraints, coupling rules, spring or dynamic elements, solve stages, and visual artwork.

The same framework should support a Richard Bradshaw-style side-view cutout, a Chinese shadow puppet with many rods, a two-link arm, a triangular lower-body gait, a dancing foam tube, a chair, a bird, a dragon, moving scenery, or abstract forms.

Labels such as `head` or `leftArm` may exist for authoring and debugging, but generic solver code must operate on bodies, joints, attachments, controls, and constraints.

### 6. Constraints are expressive

A rod does not merely rotate a joint. It establishes a temporary relationship between a performer control and some point or behavior in the rig.

Attachments may be pinned, targeted, rotated, sliding, pushing, elastic, weighted, shared, or released.

When constraints conflict, the system should use explicit policies such as priority, weighting, compliance, sliding, yielding, joint limits, rest-pose preference, detachment, or staged solving.

Slight lag, resistance, opposition, and unresolved tension may be artistically valuable.

### 7. The architecture should support instruments, not only interfaces

Physical affordances matter.

A rod resting on a slanted acrylic plane may provide friction, tactile reference, leverage, inertia, a stable performance plane, and repeatable muscle memory.

Hand tracking may supplement physical controls through pinch, finger walking, hand aperture, wrist roll, gestural triggers, or inferred rod vectors.

The system should preserve useful physical qualities rather than treating all input as abstract coordinates.

## Architectural Layers

```text
Tracking and Device Layer
    ->
Performer Station Adapters
    ->
Normalized Control Streams
    ->
Routing and Binding Layer
    ->
Constraint and Behavior Runtime
    ->
Rig and Scene Adapters
    ->
Three.js, Unreal, lighting, sound, projection, robotics, etc.
```

### Tracking and Device Layer

Examples include Leap Motion Controller 1 or 2, Valve Index controllers, Antilatency, Vive Trackers, camera or marker tracking, custom IMU rods or mitts, touch surfaces, MIDI or MPE controllers, and recorded performance data.

This layer may be device-specific.

### Performer Station Adapter

A station converts hardware-specific data into normalized controls.

Example normalized capabilities:

- `pose.2d`
- `pose.3d`
- `rod.ray`
- `rod.tip`
- `rod.twist`
- `trigger.analog`
- `pinch`
- `hand.aperture`
- `finger.walk`
- `mouth.open`
- `body.pose`
- `velocity`
- `acceleration`

A station should advertise capabilities rather than merely identify its brand or device model.

### Routing and Binding Layer

This layer manages performer identity, control identity, target discovery, temporary bindings, authority, shared control, priorities, acquisition, release, handoff, recording, and replay.

Bindings should be data-driven.

```ts
interface ControlBinding {
  id: string;
  controlId: string;
  targetId: string;
  attachmentId?: string;
  channel?: string;
  mode: "exclusive" | "shared" | "assist";
  constraintType:
    | "position"
    | "orientation"
    | "pose"
    | "slide"
    | "force"
    | "impulse"
    | "scalar";
  priority: number;
  weight: number;
  solveStage: number;
}
```

### Constraint and Behavior Runtime

This layer interprets controls as rigid-body placement, joint targets, two-point rigid fits, analytic IK, FABRIK or CCD chains, iterative constraint projection, springs, coupling or pulley actions, behavior modulation, and procedural secondary motion.

It must remain independent of Three.js, Unreal, or specific device APIs whenever practical.

### Engine and Stage Adapters

Initial targets are Three.js and Unreal Engine.

Possible future outputs include OSC-compatible media tools, lighting consoles through adapters, audio systems, projection mapping, cameras, stage automation, physical puppets or robots, and interactive installations.

Adapters should receive normalized, canonical state rather than duplicate control or handoff logic inside each renderer.

## Rig Data Model

A rig should be defined in data.

```ts
interface BodyDefinition {
  id: string;
  label?: string;
  initialPosition: [number, number];
  initialRotation: number;
  rigid: boolean;
  mass?: number;
}

interface JointDefinition {
  id: string;
  parentBodyId: string;
  childBodyId: string;
  type: "fixed" | "revolute" | "slider" | "spring";
  parentAnchor: [number, number];
  childAnchor: [number, number];
  minAngle?: number;
  maxAngle?: number;
  stiffness?: number;
  damping?: number;
}

interface AttachmentDefinition {
  id: string;
  bodyId: string;
  localPosition: [number, number];
  allowedModes: Array<
    "pin" |
    "target" |
    "rotate" |
    "slide" |
    "push"
  >;
}

interface RigDefinition {
  bodies: BodyDefinition[];
  joints: JointDefinition[];
  attachments: AttachmentDefinition[];
}
```

The Three.js scene hierarchy may represent transform propagation, but it must not be confused with the control hierarchy. Controls may bind to arbitrary bodies or attachments at any depth.

## Solver Philosophy

### Start with staged hierarchical solving

The initial solver should be intentionally understandable and art-directable.

Suggested stages:

```text
1. Read normalized control samples.
2. Build active constraints from bindings.
3. Identify primary anchors.
4. Solve root or rigid-body placement.
5. Update world transforms.
6. Solve child chains and articulated branches.
7. Apply joint limits.
8. Apply orientation targets.
9. Add secondary springs or dynamics.
10. Measure residual constraint error.
```

The stages should eventually be data-driven through numeric phases or solver dependencies, not methods named after human anatomy.

### Solver selection should depend on problem shape

```text
one positional attachment on a rigid body
    -> preserve angle or use twist, solve translation

two or more positional attachments on one rigid body
    -> weighted 2D rigid best fit / Kabsch

one endpoint on a two-link chain
    -> analytic two-link IK

one endpoint on a longer serial chain
    -> FABRIK or CCD

multiple effectors on a connected articulated graph
    -> weighted optimization or iterative projection

soft or contradictory constraints
    -> PBD or XPBD-style compliance

secondary dangling elements
    -> angular or positional springs
```

### Use local attachment coordinates

Solvers must operate on a local attachment point and desired world target. Do not assume the controlled point is the object origin.

### Expose artistic behavior, not solver jargon

Authoring tools should offer behaviors such as rigid handle, reach, pull string, loose joint, sliding contact, anchored pose, coupled arms, or dangling secondary part.

The implementation may use Kabsch, analytic IK, FABRIK, springs, or XPBD internally.

## Multi-Performer Handoffs

The controlled target owns the canonical state.

When a new performer acquires a target, do not immediately map their absolute controller pose onto the target. Establish an offset:

```text
outputNow =
  outputAtAcquisition
  * inverse(controllerAtAcquisition)
  * controllerNow
```

For scalar controls:

```text
output =
  outputAtAcquisition
  + controllerNow
  - controllerAtAcquisition
```

Supported takeover modes may include relative clutch, absolute pickup, weighted assist, anchored transfer, soft convergence, impulse-only, and velocity control.

Authority transfer and physical alignment are separate concerns.

The runtime should support overlap periods, weight crossfades, shared control, safe acquisition feedback, offset reconciliation, event-masked transfers, and docking or park poses.

## Networking and Protocol Direction

The first implementation may use WebSocket carrying JSON messages.

Keep separate:

- transport;
- encoding;
- protocol semantics.

The important contribution is the semantic model, not inventing a new socket protocol.

Initial message families may include:

```text
station.hello
station.capabilities
station.heartbeat

target.register
target.state

control.acquire
control.granted
control.update
control.release

control.transfer.request
control.transfer.started
control.transfer.completed

session.start
session.stop
recording.start
recording.stop

error
```

Every high-rate update should include source ID, control or voice ID, target or binding ID, sequence number, timestamp, confidence, and normalized values.

OSC should be supported as a compatibility bridge for creative tools and earlier digital-puppetry research.

Fraksi may borrow ideas from OSC, MIDI 2.0 and MPE, ROS 2, game networking, sACN, and networked audio systems.

Fraksi should remain a semantic layer above these transports and adapters.

## Three.js Direction

Initial Three.js work should use:

- Vite
- TypeScript
- strict type checking
- an orthographic camera
- flat cut-out pieces
- `THREE.Group` or `Object3D` pivot nodes
- local attachment markers
- warm backlit or projector-like screen rendering
- visible diagnostics for controls, rods, pivots, targets, and residual error

Near-term milestones:

1. Static cut-out puppet and screen.
2. Whole-puppet dragging.
3. Independent hand target.
4. Analytic two-link arm IK.
5. Two attachments controlling one rigid body.
6. Generic data-driven rig definition.
7. Staged solver registry.
8. Sliding attachment.
9. Two simple characters controlled by one performer.
10. Leap-derived controls replacing mouse controls.
11. Recording and replay.
12. Multiple performer stations and dynamic bindings.

Do not over-smooth early prototypes. Evaluate direct control first.

## Unreal Direction

Unreal is an output adapter, not the canonical runtime.

Possible integration order:

1. Built-in OSC plugin for rapid prototypes.
2. Native WebSocket client in a small Fraksi Unreal plugin.
3. Buffered, timestamped channel state exposed to Blueprint and Control Rig.
4. Optional Fraksi Live Link source for skeletal, facial, and camera streams.

Fraksi should own controller normalization, routing, authority, handoffs, bindings, recording, and timestamps.

Unreal should own coordinate conversion, buffering and interpolation, engine object lookup, Control Rig integration, rendering, and stage output.

## AI and Asset Generation

AI is not required in the live performance path.

Useful offline or authoring applications include:

- segmenting a scanned drawing into cut-out candidates;
- proposing pivots and attachment points;
- generating textures and style variations;
- converting reference art to simple 3D assets;
- suggesting rig simplifications;
- analyzing rehearsal data;
- proposing control mappings.

The human operator should normally decide which shapes are distinct pieces, pivot placement, rod attachment locations, articulation count, coupled actions, solver behavior, and constraint priorities.

> Let the machine propose pieces. Let the puppeteer define how the puppet is played.

## Research and Evaluation Goals

Fraksi should be evaluated through performance tasks, not only latency or geometric accuracy.

Example studies:

- Can one performer sustain two distinct characters?
- Can two performers share one character without visible discontinuity?
- Can control move from character to prop gracefully?
- Which controls preserve perceived liveness?
- How does articulation complexity affect tone and performance style?
- Can identical visual puppets feel different under different control mappings?
- Do performers invent new coordination conventions?
- Does the instrument encourage improvisation?
- How quickly do observers attribute intention, emotion, or relationship?

Useful demonstration material includes two-character dialogue, lip-sync and choreography, status contrast, confident versus frantic motion, squash, recoil, bounce, two-against-one dynamics, explosions, transformations, and prop or scenery handoffs.

## Non-Goals for Early Versions

Avoid prematurely building:

- a universal humanoid skeleton;
- full-body motion-capture retargeting;
- photorealistic characters;
- AI-generated acting;
- a complete visual node editor;
- a production animation pipeline;
- binary network optimization before measurement;
- automatic rigging that removes the puppeteer’s judgment;
- generalized whole-body optimization before staged solvers fail.

## Coding Guidance for Agents

When modifying the repository:

- Preserve separation between device input, normalized controls, bindings, solver state, and rendering.
- Do not add Leap, OSC, or Unreal assumptions to generic rig and solver modules.
- Avoid anatomical names in reusable solver APIs.
- Prefer explicit data structures and small modules.
- Explain coordinate-space conversions.
- Use local attachment coordinates.
- Keep elapsed-time behavior frame-rate independent.
- Add diagnostics for unreachable or conflicting constraints.
- Run the TypeScript build after changes.
- Do not suppress type errors.
- Prefer deterministic, understandable solvers before generalized optimization.
- Treat current code as a research prototype, but keep it maintainable enough for multiple future experiments.
