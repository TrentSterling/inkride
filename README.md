# INKRIDE

**Shared ink. Bad landings.** Draw tracks in ink, ride them, crash beautifully. A physics sketchbook you can play alone or in a room where everyone draws and rides together.

**Play:** https://tront.xyz/inkride/

- Draw with the pen, ride with Space. Track, boost, bounce and scenery inks; ramp, bowl and loop presets; physical toys; select, cut, handles, snap.
- Rooms: one link, everyone in it draws on the same sheet and rides it together. Discovery over public MQTT brokers, riders over WebRTC, same-browser tabs over BroadcastChannel. No account, no server of ours.
- Sketches and bookmarks save in your browser; export and import to keep them.

Made by [Tront](https://tront.xyz). One HTML file, no dependencies, no external assets.

## Repo

| Path | What |
|---|---|
| `index.html` | The game as hosted. Built from the newest drop by `tools/polish.py` (social meta, canonical, em dash sweep). |
| `versions/` | The original drops, byte for byte. |
| `tools/` | `polish.py` (build), `verify.mjs` (headless smoke test), `og-shot.mjs` (renders `og-image.png` from the real game), `cdp.mjs` (zero-dep Chrome driver). |
| `CLAUDE.md` | Rules and workflow for working on this repo. |

```
python tools/polish.py                        # rebuild index.html from versions/
node tools/verify.mjs                         # 13 checks, headless Chrome
node tools/verify.mjs https://tront.xyz/inkride/
node tools/og-shot.mjs                        # regenerates og-image.png
```
