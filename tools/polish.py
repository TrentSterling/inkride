"""Build index.html from the latest ChatGPT drop in versions/ for hosting at https://tront.xyz/inkride/.
Exact bytes except: social meta + canonical after <title>, and em dashes out of player-facing strings.
Every replacement must match exactly once or the script aborts. Run from the repo root:
    python tools/polish.py [versions/inkride-v3.html]
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'versions' / 'inkride-v3.html'
DST = ROOT / 'index.html'
html = SRC.read_text(encoding='utf-8')
orig = html

def rep(old, new, count=1):
    global html
    n = html.count(old)
    if n != count:
        sys.exit(f'ABORT: expected {count} match(es), found {n} for: {old[:90]!r}')
    html = html.replace(old, new)

# ---- social meta + canonical ----
rep('<title>INKRIDE · The shared sketchbook</title>',
    '<title>INKRIDE · The shared sketchbook</title>\n'
    '<meta name="description" content="Draw ink tracks, ride them, crash beautifully. A shared physics sketchbook by Tront: solo, or in a room where everyone draws and rides together. Free in the browser, one HTML file.">\n'
    '<meta name="author" content="Trent Sterling (Tront)">\n'
    '<link rel="canonical" href="https://tront.xyz/inkride/">\n'
    '<meta property="og:type" content="website">\n'
    '<meta property="og:title" content="INKRIDE by Tront">\n'
    '<meta property="og:description" content="Draw ink tracks, ride them, crash beautifully. A shared physics sketchbook: solo or in a room with friends. Free in the browser.">\n'
    '<meta property="og:url" content="https://tront.xyz/inkride/">\n'
    '<meta property="og:image" content="https://tront.xyz/inkride/og-image.png?v=1">\n'
    '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">\n'
    '<meta name="twitter:card" content="summary_large_image">\n'
    '<meta name="twitter:title" content="INKRIDE by Tront">\n'
    '<meta name="twitter:description" content="Draw ink tracks, ride them, crash beautifully. A shared physics sketchbook: solo or in a room with friends. Free in the browser.">\n'
    '<meta name="twitter:image" content="https://tront.xyz/inkride/og-image.png?v=1">')

# ---- em dashes out of player-facing strings (code comments untouched) ----
rep('<span id="materialLabel">Ink</span><span>1—4</span>', '<span id="materialLabel">Ink</span><span>1 to 4</span>')
rep("publicRoom?'Public room — everyone joins automatically':'Private room code'", "publicRoom?'Public room: everyone joins automatically':'Private room code'")
rep("'Storage unavailable — export to keep your work.'", "'Storage unavailable. Export to keep your work.'")

left = [(i + 1, l[:120]) for i, l in enumerate(html.split('\n')) if '—' in l and not l.lstrip().startswith(('/*', '//', '*'))]
print('em-dash lines outside comments:', left)
DST.write_text(html, encoding='utf-8', newline='\n')
print(f'wrote {DST} ({len(orig)} -> {len(html)} bytes)')
# ---- SEO About block (prose, crosslinks, JSON-LD) so the page is not just a canvas to Google ----
import subprocess
subprocess.run([sys.executable, 'C:/trontstack/seo/about.py', 'inkride'], check=True)
