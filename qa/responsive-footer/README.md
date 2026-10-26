# Responsive footer, 0.3.1

On 0.3.0 at 320x480, About occupied x12/y378/129.52x36. Ride occupied
x15/y391/91x35; both its center and the Respawn center hit About instead of the
game buttons. At 360x640, Ride was also covered. At 320x480 on 0.3.1, About
occupies y436..472 and Ride y343..378, with no overlap.

The new v4 source reserves 48 pixels plus the safe-area bottom inset at widths
up to 1000 pixels. Lower groups use the individual CSS translate property so
their existing transforms remain intact. Drawing-tool scroll space and dialog
bounds account for the footer. A short-landscape rule preserves Lean, status and
drawing tools at 480x320. Transient notices use their own height to stay below the
header; toast opacity/transform animation remains, while responsive placement
snaps during rotation. The canvas still fills the exact viewport.

```
python tools/polish.py
node --test tests/about-discovery/contract.cjs
node tools/responsive-audit.mjs index.html PATH_TO_0.3.0/index.html OUTPUT_DIR
node tools/verify.mjs
```

The responsive audit passed 14 initial sizes and their rotations, from 320x480
and 568x320 through 1280x800. It checks primary controls, expanded drawing tools,
parked/riding About disclosure returns, preserved track data, five native dialog
layout/return fixtures with all content controls, visible transient notices and
rotation. Above 1000 pixels it compares exact geometry against 0.3.0. Multiline
inline links are hit-tested using their rendered line fragments, since an
aggregate bounding-box center can lie in whitespace.

The About template, original prose and shared component pins remain unchanged.
Only the contract's game hash changes to the reviewed new game bytes; all four
assertions and the remote CI workflow/browser suite remain intact.

Local tests use fresh owned muted headless browsers and existing DOM/game hooks,
with no physical or injected pointer/keyboard input, OS focus changes, clipboard,
network joins or audio testing. Native dialog cases are presentation fixtures;
they avoid invoking dialog focus/network handlers. Native touch gestures and
physical mobile devices are not qualified. The existing remote CI separately
qualifies the original interaction and media checks on the exact PR commit.
