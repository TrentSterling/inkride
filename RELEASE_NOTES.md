# INKRIDE 0.3.1

About no longer covers Ride and Respawn on narrow phones. Screens up to 1000
pixels wide reserve a footer for the existing disclosure, with riding controls,
status and drawing tools arranged above it. Open dialogs keep their controls
clear of the footer. Short landscape layouts retain Lean controls, and transient
messages remain below the header during rotation.

The canvas, physics, saved tracks, multiplayer and sound behavior are unchanged.
All About prose, links, cards and shared code are preserved. Desktop layouts above
1000 pixels keep their existing geometry. The new v4 source preserves v3.

See `qa/responsive-footer/README.md` for the before/after measurements and tests.
