# Fraksi

Fraksi is an experimental architecture for live, collaborative digital
performance. Its first studies explore virtual shadow puppetry, continuous
performer control, shared character ownership, and browser-based performance
over authoritative WebSocket rooms.

## Projects

### `fraksi-prototype`

A Vite, TypeScript, and Three.js research prototype for direct manipulation of
two articulated flat puppets. Two browsers can claim separate puppets while an
authoritative WebSocket server owns their canonical state.

```bash
cd fraksi-prototype
npm install
npm run dev
```

See [`fraksi-prototype/README.md`](fraksi-prototype/README.md) and
[`fraksi-prototype/docs/FRAKSI_DESIGN_SCOPE.md`](fraksi-prototype/docs/FRAKSI_DESIGN_SCOPE.md).

### `demos/webcam-duet`

A two-performer webcam shadow-puppetry demo using browser-local MediaPipe hand
tracking, normalized control frames, an authoritative WebSocket room, and a
Canvas 2D articulated puppet renderer. Camera pixels and raw landmarks remain
in the performer browser.

```bash
cd demos/webcam-duet
npm install
npm run dev
```

See [`demos/webcam-duet/README.md`](demos/webcam-duet/README.md).

## Development

Each project is currently self-contained and has its own dependencies and npm
scripts. Run verification from the relevant project directory:

```bash
npm test        # where available
npm run build
```

The long-term product and research direction is documented in the Fraksi
design scope. Device input, normalized controls, bindings, constraints, solver
state, and rendering should remain separate architectural layers.

