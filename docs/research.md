# Research questions and documented ideas

These are questions or proposals, not implemented capabilities unless
`status.md` says otherwise.

## Performance evaluation

- Can one performer sustain two distinct, responsive characters at once?
- Can multiple performers share or hand off a character without visible jumps?
- Which continuous controls best preserve liveness, intention, rhythm, status,
  contrast, attention, and reaction?
- How do articulation complexity, authored constraints, resistance, lag, and
  unresolved tension change performance style?
- Do performers invent useful coordination conventions, and how quickly do
  observers attribute intention or emotion?
- How do mouse, physical rod, Leap, webcam hand tracking, touch, and other
  stations compare as expressive instruments?
- Which minimal remote-presentation policy preserves rapid cartoony accents
  without exposing distracting network jitter?
- With two performer laptops and two observer laptops, how differently do the
  performers and audience perceive timing when each performer sees immediate
  local prediction but observers see both puppets through a matched buffer?
- Do close reactions, handoffs, apparent contact, and synchronized accents read
  consistently from performer and observer views, or do they require explicit
  timing/rehearsal affordances?

## Control and solving

- When are staged analytic solvers sufficient, and when are FABRIK/CCD,
  iterative projection, PBD/XPBD, or weighted optimization justified?
- What policies best resolve conflicting constraints: priority, weighting,
  compliance, sliding, yielding, joint limits, rest preference, or detachment?
- How should shared, assisted, overlapping, or partial-target ownership work?
- Which takeover modes—relative clutch, absolute pickup, weighted assist, soft
  convergence, impulse, or velocity—produce readable handoffs?
- Should the prototype's dormant rigid-fit, priority, bend, and release controls
  be restored for study or retired from the active UI?

## Webcam instrument

- Does aperture control or independent thumb/index control produce the more
  playable two-arm vocabulary? The independent mode is explicitly experimental.
- How well do calibration, One Euro filtering, adaptive static friction, and
  tracking-loss behavior preserve intention without over-smoothing?
- Can a single webcam reliably support one-hand-per-character solo performance
  across lighting, camera, handedness, occlusion, and device variation?
- What should performers see versus observers: rods, identities, reveal lines,
  mirrored audience view, or a clean silhouette-only stage?
- How do webcam-duet's mapping, filtering, static friction, arm-target spring
  coefficients, and depth interpolation each contribute to its satisfying
  feel, and which parameters can change without weakening it?

## Control-signal layer

- Which small set of typed source and target-port semantics permits useful
  mouse, webcam, Leap, MIDI, and recorded-input interchange without reducing
  every device to an undifferentiated number stream?
- Which processors belong to source conditioning, reusable patch FX, authored
  puppet mechanics, or renderer-local presentation, and how can the system
  prevent accidental double filtering?
- How should stateful FX seed or transfer their history when one source takes
  over from another so the target neither jumps nor inherits stale momentum?
- Which routing and mixing policies are needed beyond exclusive takeover:
  split control, assist, weighted mix, gates, side chains, and cue-driven patch
  changes?
- What ring-buffer duration and sampling policy preserves velocity and
  interpolation evidence without adding latency or unbounded memory use?
- How should patch permissions interact with room ownership when sources can
  address puppets, props, scenery, cameras, sound, or external outputs?

## Shared stage model

- Which properties belong to a persistent stage versus a scene, renderer view,
  or output adapter?
- Which semantic properties adequately describe a presentation medium across
  engines: screen and light geometry, paper/transparency material, rod layer,
  occlusion, projection, flattening, texture, or camera relationship?
- Which media should both Canvas and Three.js support, and when is a declared
  Three.js-only treatment preferable to a misleading Canvas approximation?
- How should the Three.js shadow-screen prototype, Canvas camera-viewed paper
  stage, and a future overhead-projector treatment become comparable medium
  profiles without erasing their deliberate visual differences?
- How should scenery and props become controllable targets without treating them
  as puppets or adding special cases to the room?
- What canonical view information is genuinely shared between Canvas and
  Three.js, and what must remain renderer-specific?
- When should cameras become explicit scene objects, and how much of the next
  demo's fixed three-scene cue sequence should remain reusable before Fraksi
  risks turning into a clip-authoring system?
- What asset manifest and cache policy best shares semantic artwork identities
  while allowing different Canvas and Three.js representations?
- What warm renderer/set memory budget is safe on the M1 Max and iPad Mini, and
  when should prepared textures, geometry, and decoded images be evicted?
- Which preparation work—image decode, geometry creation, shader compilation,
  GPU upload, first layout—must be forced before a switch can honestly be called
  instant?
- Which presentation effects have stable renderer-neutral meaning, which are
  medium-specific lighting cues, and which should remain Canvas- or
  Three.js-only capabilities?
- How should the same fade/blackout cue be reproduced in browser composition,
  canvas capture, Three.js output, and deterministic replay without requiring
  every renderer to use the same post-processing implementation?

## Future sketch concepts

### A call inside the computer

This is a later concept, not part of `demos/shared-duet`:

1. A puppet sees a desk and prop computer in three-quarter view, approaches,
   and sits down.
2. A sketch cue cuts to a new scene representing the computer display.
3. The display contains a familiar two-by-two videoconference grid. Each panel
   is a Fraksi browser participant with at least one puppet and optionally its
   own background scenery.

The concept would test hard scene cuts, sketch-level cueing, multiple view
panels, independent remote performers, per-panel scenery and framing, late
join/disconnect behavior, and composition of several live performances into
one screen. The preferred interpretation is one shared scene with four or more
carefully positioned cast members and scenic panel frames. Each browser renders
the same complete set while claiming one cast member, allowing eye-lines,
interruptions, synchronized reactions, and choreography across panel boundaries.
The room and cast model must therefore allow an arbitrary authored number of
targets even though `shared-duet` initially uses two.

Rendered video remains a useful optional scene-surface adapter for external
media, but it is not required to compose Fraksi participants: canonical shared
state is lower bandwidth, consistently rendered, and suitable for replay.

### Fraksi roulette

An ephemeral social-performance format could match visitors into a randomly
selected scene and cast, assign available puppets, and run a short encounter
before rotating participants. Unlike video chat roulette, participants appear
through puppets by default. This would require matchmaking, room lifecycle,
join/leave and absence behavior, consent/moderation policy, and clear recording
status. Optional live voice or video is a separate media capability rather than
part of puppet-state synchronization.

### Fraksi lip-sync battle

A performance format could cue a song or spoken track for multiple puppets and
compare or simply present their choreography and mouth performance. Recorded
audio should normally be preloaded and started from a shared timestamp so each
browser schedules it locally; sending a small cue over the room protocol is
preferable to streaming the same asset through WebSocket. Live voice, external
video, or media guests would instead call for a dedicated real-time media
transport such as WebRTC. Open issues include clock synchronization, late join,
pause/restart authority, scoring, recording, accessibility, and music rights.

## Director and stage-manager mode

A later production-control station could combine an overview/multiview with a
cue stack, scene/set/asset readiness, cast claims, live source levels, the patch
bay, and shared production-camera output. Authorized operators could prepare
and take scene or set changes; move scenery; operate cameras, lights, and sound;
and atomically reassign which source or control rig drives a puppet or other
target.

Treat this as a privileged room role and ordinary source/cue client, not logic
embedded in Canvas or Three.js. Scenery, camera, lighting, and sound expose
typed target ports; director controls and automation are sources routed through
the same patch layer. Patch changes use the same seeded takeover semantics as a
performer handoff.

Production cues need transactional phases such as **prepare**, **ready**,
**go/effective timestamp**, and **complete/fail**. The server validates role,
capability, expected room revision, target locks, and asset readiness before
committing a cue. Cue and patch history should be recordable for diagnosis and
replay. Open policy questions include performer notification or consent for
reassignment, manual override, undo/recovery, partial client readiness, and
what happens when a destination cannot support the selected medium or asset.

Keep the shared production camera distinct from each workstation's local
monitor view. A director may zoom or cut the audience output without disrupting
the framing a performer needs to operate their puppet.

## Platform and outputs

- How should recording/replay preserve normalized control, ownership, timing,
  and canonical state so performances can be re-rendered?
- Which semantic protocol concepts should remain stable across WebSocket, OSC,
  MIDI/MPE, ROS-like systems, Unreal, and other stage adapters?
- What buffering and interpolation belong in output adapters without moving
  routing or authority into the renderer?
- Which cues belong in the Fraksi room protocol—audio asset, start timestamp,
  pause, seek, scene cut—and which live audio/video streams should use a
  dedicated media transport?
- How should Fraksi expand from puppets to props, scenery, cameras, lighting,
  sound, projection, physical mechanisms, robots, and installations?

## Authoring assistance

- Can scanned drawings be segmented into useful overlapping cut-out candidates?
- Can tools propose pivots, attachment locations, textures, mappings, or rig
  simplifications while keeping mechanical and cultural judgment with people?
- What evaluation tasks best compare authored rigs and control mappings rather
  than merely geometric accuracy?
