"""Add the Turkish letters Portmanteau is missing (ı İ ş Ş ğ Ğ).

Portmanteau is a caps-only display face, so:
  ı          -> the existing dotless small-cap "i" glyph (cmap alias)
  ş / Ş      -> s / S + the font's own cedilla (placed like in ç / Ç)
  İ          -> I + one dot taken from the font's own dieresis
  ğ / Ğ      -> g / G + a drawn breve matched to the dieresis height

Usage (from platform/):
  python scripts/add-turkish-glyphs.py <source.ttf> styles/fonts/portmanteau-regular.woff2
The source TTF is the original Portmanteau file (see git history of
public/fonts/portmanteau-regular.ttf). Requires fonttools + brotli.
"""
import sys

from fontTools.pens.reverseContourPen import ReverseContourPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent, GlyphCoordinates
from fontTools.ttLib.tables.ttProgram import Program

UNICODES = (
    list(range(0x0000, 0x0100)) + list(range(0x0100, 0x0180))
    + [0x0131, 0x0152, 0x0153, 0x02BB, 0x02BC, 0x02C6, 0x02DA, 0x02DC]
    + list(range(0x2000, 0x2070))
    + [0x2074, 0x20AC, 0x20BA, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215, 0xFEFF, 0xFFFD]
)


def center_x(glyph, glyf):
    glyph.recalcBounds(glyf)
    return (glyph.xMin + glyph.xMax) / 2


def composite(base, mark, dx, dy):
    glyph = Glyph()
    glyph.numberOfContours = -1
    glyph.components = []
    for name, x, y in ((base, 0, 0), (mark, dx, dy)):
        comp = GlyphComponent()
        comp.glyphName, comp.x, comp.y, comp.flags = name, int(round(x)), int(round(y)), 0
        glyph.components.append(comp)
    glyph.components[0].flags = 0x0200  # USE_MY_METRICS: advance comes from the base letter
    return glyph


def single_dot(font):
    """Left dot of the dieresis: every contour left of the glyph's midline."""
    glyf = font['glyf']
    dieresis = glyf['dieresis']
    coords, end_pts, flags = dieresis.getCoordinates(glyf)
    mid = center_x(dieresis, glyf)
    kept, kept_flags, kept_ends, start = [], bytearray(), [], 0
    for end in end_pts:
        points, point_flags, start = list(coords[start:end + 1]), flags[start:end + 1], end + 1
        if max(x for x, _ in points) < mid:
            kept.extend(points)
            kept_flags.extend(point_flags)
            kept_ends.append(len(kept) - 1)
    glyph = Glyph()
    glyph.numberOfContours = len(kept_ends)
    glyph.coordinates = GlyphCoordinates(kept)
    glyph.endPtsOfContours = kept_ends
    glyph.flags = kept_flags
    glyph.program = Program()
    glyph.program.fromBytecode(b'')
    return glyph


def breve():
    """A crescent sized to the dieresis zone (y 830-975)."""
    pen = TTGlyphPen(None)
    outline = ReverseContourPen(pen)  # TrueType wants clockwise outer contours
    outline.moveTo((0, 965))
    outline.qCurveTo((18, 822), (160, 822))
    outline.qCurveTo((302, 822), (320, 965))
    outline.lineTo((262, 965))
    outline.qCurveTo((244, 878), (160, 878))
    outline.qCurveTo((76, 878), (58, 965))
    outline.closePath()
    return pen.glyph()


def main(source, target):
    font = TTFont(source)
    glyf, hmtx = font['glyf'], font['hmtx']
    order = font.getGlyphOrder()

    def add(name, glyph, advance_from):
        glyf[name] = glyph
        glyph.recalcBounds(glyf)
        hmtx[name] = (hmtx[advance_from][0], getattr(glyph, 'xMin', 0))
        if name not in order:
            order.append(name)

    add('dotaccent.tr', single_dot(font), 'dieresis')
    add('breve.tr', breve(), 'dieresis')
    font.setGlyphOrder(order)

    cedilla_c = next(c for c in glyf['ccedilla'].components if c.glyphName == 'cedilla')
    cedilla_offset = cedilla_c.x + center_x(glyf['cedilla'], glyf) - center_x(glyf['c'], glyf)
    for base, name in (('s', 'scedilla'), ('S', 'Scedilla')):
        dx = center_x(glyf[base], glyf) + cedilla_offset - center_x(glyf['cedilla'], glyf)
        add(name, composite(base, 'cedilla', dx, cedilla_c.y + 6), base)
    for base, name in (('g', 'gbreve'), ('G', 'Gbreve')):
        add(name, composite(base, 'breve.tr', center_x(glyf[base], glyf) - 160, 0), base)
    dot = glyf['dotaccent.tr']
    add('Idotaccent', composite('I', 'dotaccent.tr', center_x(glyf['I'], glyf) - center_x(dot, glyf), -6), 'I')
    font.setGlyphOrder(order)

    mapping = {0x015F: 'scedilla', 0x015E: 'Scedilla', 0x011F: 'gbreve', 0x011E: 'Gbreve',
               0x0130: 'Idotaccent', 0x0131: 'i'}
    for table in font['cmap'].tables:
        if table.isUnicode():
            table.cmap.update(mapping)
    font['maxp'].numGlyphs = len(order)
    # Per-glyph device metric tables don't know the new glyphs; browsers ignore them anyway.
    for tag in ('hdmx', 'LTSH', 'VDMX'):
        if tag in font:
            del font[tag]

    options = Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.notdef_outline = True
    subsetter = Subsetter(options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(target)
    print('wrote', target)


if __name__ == '__main__':
    main(*sys.argv[1:3])
