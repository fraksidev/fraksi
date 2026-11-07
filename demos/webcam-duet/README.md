# Fraksi Webcam Duet

A self-contained two-performer webcam shadow-puppetry demo. It uses an
authoritative WebSocket room, normalized control frames, MediaPipe Tasks Vision
in the browser, and a Canvas 2D articulated puppet renderer. Webcam pixels and
raw landmarks never leave the performer browser.

## Run locally

Requires Node.js 20+.

```bash
cd /Users/brianstokes/Development/fraksi/demos/webcam-duet
npm install
npm run dev
```

Open `http://localhost:5191` in separate browser sessions. The room server uses
port `8899`; these intentionally differ from `fraksi-prototype` (`5173` and
`8787`) so both can run together. Camera access works on localhost or HTTPS.

The first two guests claim Ember and Tide. Later guests select **Enter as
viewer**. Disconnecting or **Leave** releases the puppet while retaining its
last pose, so a handoff never jumps.

Choose **Solo · both hands** while both puppets are free to claim them
atomically. MediaPipe tracks two hands: the anatomical left hand performs Ember
on the left and the anatomical right hand performs Tide on the right. Leaving
solo mode releases both puppets together.

## Camera and recording

Select a puppet, choose **Start camera**, hold one hand in frame, and press
**Recalibrate** at a comfortable neutral depth. The palm moves and leans the
body; thumb and index control the arms. Reverse the assignment in settings.
The preview is optional and never appears behind the stage.

**Arms: aperture** is the default pinch-above-head and full-spread controller.
The experimental **Arms: independent** mapping remains available from the same
toggle for comparison.

Either anatomical hand can operate either puppet. Palm lean is calibrated in
mirrored screen space, so left/right movement does not change with handedness
or with the puppet's facing direction.

Adaptive static friction holds very small position, lean, depth, and finger-
aperture fluctuations at rest. The friction radius collapses during deliberate
movement, preserving quick bounces and turns without adding smoothing delay.

- `R`: toggle the reveal overlay and performer identities
- `U`: remove/restore all recording UI in one key
- **Show rods**, **Fullscreen**, and **Preview** are independent toggles
- **Audience view** mirrors the completed stage into a silhouette-treated
  front-of-screen preview in the same animation frame; it does not run another
  tracking or network pass.

Choose **Test with keyboard** to avoid camera permission. Arrow keys move the
body, Q/E lean, and W/A/S/D exercise the arms.

## Verification

```bash
npm test
npm run build
npm run test:room # while npm run dev is running
```

Temporary silhouette policy and replacement notes are in `assets/README.md`.
The implementation/reuse boundary is documented in `PLAN.md`.
