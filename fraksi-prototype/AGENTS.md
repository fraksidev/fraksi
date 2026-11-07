# Fraksi Coding Instructions

Before making architectural changes, read:

`docs/FRAKSI_DESIGN_SCOPE.md`

Treat that document as the long-term product and research direction. Current milestone instructions may narrow its scope but should not contradict its architectural boundaries.

## Required practices

* Keep device input separate from normalized controls.
* Keep normalized controls separate from bindings and constraints.
* Keep generic solver code independent of Three.js, Leap Motion, OSC, and Unreal.
* Use local attachment coordinates rather than assuming controls act at object origins.
* Avoid anatomical assumptions in reusable rig and solver APIs.
* Keep time-dependent behavior frame-rate independent.
* Preserve strict TypeScript checks.
* Run `npm run build` after changes.
* Do not suppress errors to make the build pass.
* Prefer small, understandable, deterministic implementations before generalized optimization.
* Include diagnostics for unreachable or conflicting constraints.

## Current development approach

Build Fraksi through small, playable milestones. Do not attempt to implement the complete architecture in one pass.
