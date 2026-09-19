# CLAUDE.md, INKRIDE

Single-file shared physics sketchbook (Line Rider lineage): draw ink tracks, ride them, crash. Live at https://tront.xyz/inkride/ (GitHub Pages, `main` root). ChatGPT writes the drops; this repo hosts them.

## Read first

- `index.html` is built from the newest drop in `versions/` by `tools/polish.py`. The drop is the source of truth; do not hand-edit `index.html`.
- The drop's own header comments ("an ink bench, not a dashboard", "no external fonts or assets") are the design brief. Keep it that way.

## Rules

- One static HTML file. No bundler, no npm, no CDN, no fonts. Canvas 2D, fixed-step position-based physics.
- Rooms use public MQTT brokers over WebSocket for discovery plus WebRTC between riders, and BroadcastChannel for same-origin tabs. No backend of ours. Online play is "experimental" until a real separate-network session has been played.
- `#solo` boots the solo playground (used by the harnesses). `?room=CODE` in the hash joins a room.
- No em dashes in player-facing strings or docs (code comments in the drop are left alone). Discord links are `tront.xyz/discord/`.
- Hosting edits live only in `tools/polish.py`: social meta and canonical after `<title>`, the em dash sweep. Anything else is a game change and belongs to the next drop.

## Workflow

1. New drop lands in `~/Downloads/inkride-vN.html`: copy it to `versions/`, point `tools/polish.py` at it (or pass the path), run it. The script aborts if an anchor is missing; fix the anchor, never hand-merge.
2. `node tools/verify.mjs` (13 checks: boot, tools, ride, respawn, storage, reload, console). Also accepts the live URL.
3. `node tools/og-shot.mjs` only if the look changed (solo bench, chrome hidden, zoom 144%, rider carving the starter track, brand + tagline overlay; `ZOOM=` and `SHOTS=` env). Bump `?v=N` on the og-image meta in `tools/polish.py` when the image changes.
4. Commit, push. Pages deploys in about a minute. Re-run `verify.mjs` against https://tront.xyz/inkride/.

## Public hooks

`window.INKRIDE`: `version`, `world`, `props`, `selection`, `events`, `riders` (id, name, slot, state, points with vx/vy, air, crashAge), `session` (room, public, role), `camera`, `stats`, `physicsTime`, `nativeStorage`, `select(ids)`, `edit`, `saveSlot`, `bookmark`, `resetProps`. Buttons: `#rideBtn`, `#respawnBtn`, `#ejectBtn`, `#kickBtn`, `#followBtn`, `#overviewBtn`, `#undoBtn`, `#redoBtn`, `#inviteBtn`, `#publicBtn`, `#joinCode`, `#joinBtn`. Tools are `button.tool[data-tool]`.

Harness driver notes: `tools/cdp.mjs` (zero-dep Chrome DevTools driver, real GPU, `--mute-audio`).
