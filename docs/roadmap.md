# Roadmap

This is a decision aid, not a claim that every item is committed. Ordering
within **Next** and **Later** is undecided unless noted.

## Now

- Preserve the two verified baselines documented in `status.md`.
- Treat both existing applications as reference baselines and maintain the
  agreed architecture and acceptance criteria for the third application in
  `next-demo-brief.md` before implementation begins.
- Correct documentation when it diverges from current interaction behavior;
  the prototype README currently describes controls no longer exposed.
- Manually evaluate the webcam duet with real cameras, two physical performers,
  at least two observer laptops, touch devices, tracking loss, and the audience
  view; these paths are present but were not exercised in the current
  verification.
- Define acceptance measurements and devices for preserving webcam-duet's solo
  responsiveness in the next demo. This requires project-owner input.

## Next — candidates, priority undecided

- Capture performance findings from simultaneous two-character use and compare
  mouse, keyboard, webcam, and future hand-tracking instruments.
- Add focused tests around prototype IK, rigid fitting, reflection, staged
  constraints, and client/server protocol validation.
- Build shared protocol, room, source processing, typed signal routing/FX,
  stage/medium/scene/cast, primary-rig, Canvas, and Three.js foundations for
  `demos/shared-duet` without migrating either existing application. Extract
  only boundaries justified by the two working references.
- Define the initial presentation-medium profile and explicit renderer
  capability contract, preserving the distinction between a medium's artistic
  intent and its Canvas or Three.js implementation.
- Use the same shared-duet cast, controls, and networking to compare live Canvas
  and Three.js switching in the agreed paper-lobby → falling/swirl → shadow-stage
  showcase sketch. Include stable performer slots, original and transition cast,
  three set/asset bundles, a minimal cue key/reset, shared blackout transition,
  authored shadow-stage illumination ramp, and measurements for cold load, warm
  preparation, frame-boundary activation, retained memory, and frame cost. This
  is the agreed next-demo scenario; its priority is decided.
- Harden a selected demo for use beyond a trusted LAN: HTTPS/WSS, deployment
  configuration, room identity, reconnect policy, backpressure, and observable
  diagnostics.
- Replace temporary webcam-duet silhouettes with licensed or commissioned art
  and recorded provenance.
- Evaluate whether dormant prototype modes (rigid fit, priorities, bend/release)
  should return to the UI or be removed from the current milestone.

## Later — research directions, priority undecided

- Recording and deterministic replay.
- Sketch cues and cuts between scenes, including later multi-panel compositions
  of several live Fraksi browser performances.
- Matchmaking and ephemeral room lifecycle for formats such as Fraksi roulette.
- Synchronized, preloaded audio cues for lip-sync and music-driven performance;
  optional WebRTC live-media adapters only where a format requires them.
- Director/stage-manager production control with role authorization, multiview,
  transactional cue stack, scene/set changes, scenery/camera/light/sound ports,
  readiness reporting, and atomic control-patch reassignment.
- Dynamic/shared ownership, assisted control, overlap periods, and graceful
  handoffs below the whole-character level.
- Sliding, elastic, weighted, pushing, spring, and other expressive constraints;
  longer chains and connected-graph solvers when staged analytic solvers prove
  insufficient.
- Additional station adapters such as Leap Motion, physical rods, MIDI/MPE,
  trackers, touch surfaces, and recorded control streams.
- Additional presentation media, including a Three.js overhead-projector
  treatment and further shadow-screen or camera-viewed cut-out experiments.
- OSC compatibility and Unreal output adapters, followed by other stage,
  lighting, sound, projection, robotic, or installation outputs.
- Authoring assistance for silhouette segmentation, pivots, attachments,
  textures, rig simplification, and mapping proposals, with human authorship of
  puppet mechanics retained.
