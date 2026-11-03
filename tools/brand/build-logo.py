"""
KONTABURE logo builder.

Redraws the supplied logo reference as clean vector geometry:
  * the K monogram (stem + arm, leg, three rising bars) on a 118 x 100 grid,
    with the white channel around the bars derived by offsetting the bars
    (so the gap is constant and its curves are concentric);
  * the wordmark from Poppins ExtraBold outlines, with the logo's signature
    crossbar-less "A" built from Poppins' V turned upside down.

Writes SVG logos and favicon artwork to assets/brand/ and a JSON file with the
path data used by the website (sprite symbols and the intro animation).

Usage: python tools/brand/build-logo.py   (needs fonttools + brotli)
"""
import json
import math
import os

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'brand')
# Poppins ExtraBold, used only to draw the wordmark (not shipped as a web font)
FONT = os.path.join(ROOT, 'tools', 'brand', 'poppins-800-latin.woff2')

FOREST = '#123C34'
EMERALD = '#00B88A'
IVORY = '#F7F7F2'


def f(n):
    s = f'{n:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def rounded(points):
    """points: list of (x, y, r). Returns a closed path with circular-arc corners."""
    n = len(points)
    cmds = []
    for i in range(n):
        x, y, r = points[i]
        px, py, _ = points[i - 1]
        nx, ny, _ = points[(i + 1) % n]
        v1 = (px - x, py - y)
        v2 = (nx - x, ny - y)
        l1 = math.hypot(*v1)
        l2 = math.hypot(*v2)
        u1 = (v1[0] / l1, v1[1] / l1)
        u2 = (v2[0] / l2, v2[1] / l2)
        cosang = max(-1, min(1, u1[0] * u2[0] + u1[1] * u2[1]))
        ang = math.acos(cosang)
        if r <= 0 or ang < 1e-3:
            pt = (x, y)
            cmds.append(('L', pt, None))
            continue
        d = r / math.tan(ang / 2)
        d = min(d, l1 * 0.49, l2 * 0.49)
        rr = d * math.tan(ang / 2)
        a = (x + u1[0] * d, y + u1[1] * d)
        b = (x + u2[0] * d, y + u2[1] * d)
        cross = u1[0] * u2[1] - u1[1] * u2[0]
        sweep = 0 if cross > 0 else 1
        cmds.append(('LA', a, (rr, sweep, b)))
    out = []
    for j, (kind, pt, arc) in enumerate(cmds):
        op = 'M' if j == 0 else 'L'
        out.append(f'{op}{f(pt[0])} {f(pt[1])}')
        if kind == 'LA':
            rr, sweep, b = arc
            out.append(f'A{f(rr)} {f(rr)} 0 0 {sweep} {f(b[0])} {f(b[1])}')
    return ''.join(out) + 'Z'


# ---------------------------------------------------------------- the K monogram
G = 6.0                 # white channel around the bars
SLOPE = 0.6             # rise of the bar tops (the "growth" line)
TOP0 = 77.0             # bar 1 top at x = 0
BARS = [(0.0, 16.6), (22.2, 38.8), (44.4, 61.0)]
R_BAR = 4.0

def bar_top(x):
    return TOP0 - SLOPE * x

bars = []
for x0, x1 in BARS:
    bars.append(rounded([(x0, 100, 1.4), (x0, bar_top(x0), R_BAR), (x1, bar_top(x1), R_BAR), (x1, 100, 1.4)]))

off = G / math.cos(math.atan(SLOPE))
VX = BARS[-1][1] + G                       # vertical edge of the bite
bite_y = lambda x: TOP0 - off - SLOPE * x  # bite diagonal
ARM = 118.0                                # arm edge: x + y = 118
F_y = ARM - VX
upper = rounded([
    (0, 0, 6), (39, 0, 4), (39, 35, 0), (74, 0, 1.2), (118, 0, 6),
    (VX, F_y, 1.2), (VX, bite_y(VX), R_BAR + G), (0, bite_y(0), 1.2),
])
leg_top = F_y + G * 0.95
leg = rounded([(VX, leg_top, 5), (118, 100, 5), (VX, 100, 5)])

# ---------------------------------------------------------------- wordmark
font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
cap = font['OS/2'].sCapHeight
CAP_U = 55.0                      # cap height in logo units (55% of the mark height)
s = CAP_U / cap
BASE = (100 + CAP_U) / 2          # vertically centred on the mark
GAP = 23.0                        # space between mark and wordmark
TRACK = 2.4                       # letter spacing in logo units

letters = []
x = 118 + GAP
for ch in 'KONTABURE':
    gname = cmap[ord('V' if ch == 'A' else ch)]
    glyph = gs[gname]
    pen = SVGPathPen(gs, ntos=f)
    if ch == 'A':
        # Λ: Poppins V turned upside down (same stroke weights as the alphabet)
        tp = TransformPen(pen, (s, 0, 0, s, x, BASE - cap * s))
    else:
        tp = TransformPen(pen, (s, 0, 0, -s, x, BASE))
    glyph.draw(tp)
    letters.append({'ch': ch, 'd': pen.getCommands()})
    x += glyph.width * s + TRACK
WORD_END = x - TRACK
# trim the last glyph's right side bearing for a tight box
last = gs[cmap[ord('E')]]
rsb = last.width - font['glyf'][cmap[ord('E')]].xMax if 'glyf' in font else 0
WIDTH = math.ceil(WORD_END - rsb * s + 0.5)

data = {
    'mark': {'upper': upper, 'leg': leg, 'bars': bars, 'width': 118, 'height': 100},
    'letters': letters,
    'width': WIDTH,
    'height': 100,
    'wordStart': 118 + GAP,
    'colors': {'forest': FOREST, 'emerald': EMERALD, 'ivory': IVORY},
}
os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, 'logo-paths.json'), 'w') as fh:
    json.dump(data, fh, indent=1)

word_d = ''.join(l['d'] for l in letters)
bars_d = ''.join(bars)


def lockup_svg(k_fill, bar_fill, title='KONTABURE'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} 100" role="img" aria-label="{title}">'
            f'<title>{title}</title>'
            f'<path fill="{k_fill}" d="{upper}{leg}"/><path fill="{bar_fill}" d="{bars_d}"/>'
            f'<path fill="{k_fill}" d="{word_d}"/></svg>\n')


def mark_svg(k_fill, bar_fill):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 118 100" role="img" aria-label="KONTABURE">'
            f'<path fill="{k_fill}" d="{upper}{leg}"/><path fill="{bar_fill}" d="{bars_d}"/></svg>\n')


def favicon_svg():
    # mark on a forest tile; 128 x 128 with the mark centred
    sc = 0.66
    tx = (128 - 118 * sc) / 2
    ty = (128 - 100 * sc) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">'
            f'<rect width="128" height="128" rx="28" fill="{FOREST}"/>'
            f'<g transform="translate({f(tx)} {f(ty)}) scale({sc})">'
            f'<path fill="{IVORY}" d="{upper}{leg}"/><path fill="{EMERALD}" d="{bars_d}"/></g></svg>\n')


files = {
    'kontabure-logo.svg': lockup_svg(FOREST, EMERALD),
    'kontabure-logo-reverse.svg': lockup_svg(IVORY, EMERALD),
    'kontabure-mark.svg': mark_svg(FOREST, EMERALD),
    'kontabure-mark-reverse.svg': mark_svg(IVORY, EMERALD),
    'favicon.svg': favicon_svg(),
}
for name, svg in files.items():
    with open(os.path.join(OUT, name), 'w') as fh:
        fh.write(svg)
print('lockup width', WIDTH, '| cap height units', CAP_U, '| files:', ', '.join(files))
