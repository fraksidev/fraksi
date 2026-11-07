# Webcam Duet implementation plan

## Reuse

- Preserve the `fraksi-prototype` server's authoritative room rules: one puppet
  per client, claims rejected when occupied, release on explicit leave or socket
  close, and the puppet's last pose retained across ownership changes.
- Keep the prototype's small JSON-over-WebSocket approach and full scene
  snapshots, adapted to a device-independent `ControlFrame` at a throttled rate.
- Preserve the architectural boundary between device input, normalized control,
  rig solving, and rendering described in `docs/FRAKSI_DESIGN_SCOPE.md`.

## New demo

- Build a self-contained Vite/TypeScript canvas demo under
  `demos/webcam-duet`, with its own server (`8899`) and client (`5191`) ports.
- Separate webcam tracking, control mapping/filtering, networking, rigging, and
  rendering into modules. Use MediaPipe Tasks Vision only inside tracking.
- Add data-driven temporary silhouette manifests, two-bone IK with secondary
  motion, interpolation, selection/viewer UI, camera/settings controls, reveal
  overlays, fullscreen, and keyboard synthetic input.
- Add unit tests for authoritative claiming/releasing and control-frame
  normalization, plus a three-session browser verification.

## Explicitly untouched

- `fraksi-prototype/src/**`
- `fraksi-prototype/public/**` and `fraksi-prototype/dist/**`
- `fraksi-prototype/package.json`, lockfile, configs, scripts, and documentation
- Existing prototype ports, behavior, and runtime commands

