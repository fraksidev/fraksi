# Fraksi Shadow Puppet Study

A Vite + TypeScript + Three.js research prototype for direct manipulation of a flat shadow-puppet rig.

## Run

```bash
npm install
npm run dev
```

This starts the authoritative WebSocket scene server on port `8787` and Vite
on port `5173`. Open the network URL printed by Vite on each performer laptop,
normally:

```text
http://<server-lan-ip>:5173
```

Hover and click an available puppet to claim it. Each connected browser sees
the same server-owned pose state. **Leave scene** releases the local performer's
puppet without interrupting anyone else; the released puppet keeps its last pose.

## Interaction

- Drag either colored rod handle to target that character's articulated endpoint.
- In direct mode, click or touch near a character to drag its complete hierarchy.
- Toggle bend direction and endpoint release independently for characters A and B.
- Cycle **Body** through direct, two-handle, and priority-test modes. Gold handles
  drive rigid fitting; red lines show unreachable or conflicting constraints.

## Current structure

- `src/main.ts` — scene composition and Three.js adapter
- `src/controls/` — browser input normalized to 2D pose samples
- `src/bindings/` — acquisition-relative control bindings
- `src/constraints/` — control targets interpreted as rig constraints
- `src/rig/` — data-driven bodies, joints, attachments, and chain dimensions
- `src/runtime/` — canonical rig state and explicit staged solving
- `src/view/` — Three.js adapters that consume canonical state
- `src/solvers/` and `src/twoBoneIk.ts` — engine-independent planar solvers
- `src/puppet.ts` — flat puppet pieces and pivot hierarchy
- `src/screen.ts` — warm illuminated projection-screen shader
- `src/stage.css` — full-window layout

## Next likely steps

1. Evaluate simultaneous two-character performance and control release.
2. Refine priorities and constraint ownership from those findings.
3. Add sliding attachments only after this staged runtime is understood.
