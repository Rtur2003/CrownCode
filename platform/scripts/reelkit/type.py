"""Type in the site's own faces: Portmanteau, IM Fell Double Pica, JetBrains Mono."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .core import H, W

FONTS = Path(__file__).resolve().parents[2] / 'styles' / 'fonts'
FONT = {'display': 'portmanteau-regular.woff2', 'serif': 'im-fell-double-pica-regular.woff2',
        'italic': 'im-fell-double-pica-italic.woff2', 'mono': 'jetbrains-mono-500.woff2'}
CREAM, AMBER, MUTED, INK = (243, 233, 216), (242, 180, 95), (187, 168, 143), (12, 11, 10)

_cache: dict = {}


def pad_of(size: int) -> int:
    return int(size * 0.4)


def sprite(text, font, size, colour, tracking=0.0, shadow=0.85):
    """RGBA text with room around it for the shadow (pad_of(size) on every side)."""
    key = ('s', text, font, size, colour, tracking, shadow)
    if key in _cache:
        return _cache[key]
    f = ImageFont.truetype(str(FONTS / FONT[font]), size)
    asc, desc = f.getmetrics()
    pad = pad_of(size)
    widths = [f.getlength(ch) for ch in text]
    tw = sum(widths) + tracking * size * (len(text) - 1) if tracking else f.getlength(text)
    img = Image.new('RGBA', (int(tw) + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if tracking:
        x = pad
        for ch, cw in zip(text, widths):
            d.text((x, pad), ch, font=f, fill=tuple(colour) + (255,))
            x += cw + tracking * size
    else:
        d.text((pad, pad), text, font=f, fill=tuple(colour) + (255,))
    if shadow:
        a = img.split()[3].filter(ImageFilter.GaussianBlur(size * 0.14)).point(lambda v: int(v * shadow))
        sh = Image.new('RGBA', img.size, (4, 4, 7, 0))
        sh.putalpha(a)
        img = Image.alpha_composite(sh, img)
    out = np.asarray(img).copy()
    _cache[key] = out
    return out


def ink_width(spr, size):
    return spr.shape[1] - 2 * pad_of(size)


def fit(text, font, size, max_width, tracking=0.0, floor=40):
    """The largest size up to `size` at which the text's ink fits `max_width`."""
    while size > floor:
        if ink_width(sprite(text, font, size, CREAM, tracking), size) <= max_width:
            break
        size -= 4
    return size


def plate(text, colour=AMBER, size=30):
    """A mono label on a dark rounded plate, like the site's badges."""
    key = ('p', text, colour, size)
    if key in _cache:
        return _cache[key]
    f = ImageFont.truetype(str(FONTS / FONT['mono']), size)
    step = size * 0.2
    tw = sum(f.getlength(ch) + step for ch in text) - step
    asc, desc = f.getmetrics()
    img = Image.new('RGBA', (int(tw) + 2 * size, asc + desc + int(size * 1.1)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, img.width - 1, img.height - 1), radius=int(size * 0.6), fill=INK + (215,),
                        outline=tuple(colour) + (90,), width=2)
    x = size
    for ch in text:
        d.text((x, int(size * 0.55)), ch, font=f, fill=tuple(colour) + (255,))
        x += f.getlength(ch) + step
    out = np.asarray(img).copy()
    _cache[key] = out
    return out


def blit(frame, spr, x, y, alpha=1.0, scale=1.0, reveal=1.0, rise=1.0, anchor='center'):
    """Draw a sprite. anchor 'left' puts x at the ink's left edge (pad included).

    reveal wipes it in from the left; rise (0..1) unmasks it from the bottom up,
    like type coming up out of a slot.
    """
    if alpha <= 0.003:
        return
    if scale != 1.0:
        spr = cv2.resize(spr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR)
    h, w = spr.shape[:2]
    x0 = int(round(x - w / 2)) if anchor == 'center' else int(round(x))
    y0 = int(round(y - h / 2))
    sx0, sy0 = max(0, -x0), max(0, -y0)
    x1, y1 = min(W, x0 + w), min(H, y0 + h)
    if x1 <= max(0, x0) or y1 <= max(0, y0):
        return
    s = spr[sy0:sy0 + (y1 - max(0, y0)), sx0:sx0 + (x1 - max(0, x0))].astype(np.float32)
    a = s[..., 3:4] / 255 * alpha
    if reveal < 1:
        cols = np.arange(sx0, sx0 + s.shape[1])
        a = a * np.clip((reveal * w - cols) / 30, 0, 1)[None, :, None]
    if rise < 1:
        rows = np.arange(sy0, sy0 + s.shape[0])
        a = a * np.clip((rows - (1 - rise) * h) / 12, 0, 1)[:, None, None]
    region = frame[max(0, y0):y1, max(0, x0):x1]
    region[:] = region * (1 - a) + s[..., 2::-1] * a


def rule(frame, x, y, length, u, colour=AMBER, thickness=3):
    """A line drawing itself left to right (u 0..1)."""
    n = int(length * max(0.0, min(1.0, u)))
    if n > 0:
        frame[int(y):int(y) + thickness, int(x):int(x) + n] = np.array(colour[::-1], np.float32)
