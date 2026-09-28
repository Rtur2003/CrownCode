"""Drawn objects for music edits: a vinyl record, waveform bars, a marquee, a pill button."""
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from . import type as tp
from .core import H, W

def vinyl_disc(size: int, label: np.ndarray | None = None):
    """A record face (RGBA): black grooves, a soft sheen band, a label in the middle.

    Not cached here: the caller keeps the discs it needs (one label per record).
    """
    s = size
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    r = np.hypot(xx - s / 2, yy - s / 2) / (s / 2)
    img = np.zeros((s, s, 4), np.float32)
    base = 14 + 6 * np.sin(r * 260) * (r > 0.36) * (r < 0.97)  # grooves
    img[..., :3] = base[..., None]
    img[..., 3] = np.clip((1 - r) * s / 3, 0, 1) * 255
    rim = np.clip(1 - np.abs(r - 0.985) * 60, 0, 1)
    img[..., :3] += rim[..., None] * 30
    lab = r < 0.34
    if label is not None:
        ls = int(s * 0.68)
        lb = cv2.resize(label, (ls, ls), interpolation=cv2.INTER_AREA).astype(np.float32)
        o = (s - ls) // 2
        region = img[o:o + ls, o:o + ls, :3]
        m = lab[o:o + ls, o:o + ls, None]
        region[:] = region * (1 - m) + lb[..., :3] * m
    else:
        img[lab] = (40, 34, 26, 255)
    hole = r < 0.025
    img[hole, 3] = 0
    return img


def place_vinyl(canvas, disc, cx, cy, angle_deg, alpha=1.0, sheen=0.5):
    """Composite a spinning record; the sheen stays put while the grooves turn."""
    s = disc.shape[0]
    m = cv2.getRotationMatrix2D((s / 2, s / 2), angle_deg, 1.0)
    rot = cv2.warpAffine(disc, m, (s, s), flags=cv2.INTER_LINEAR)
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    ang = np.arctan2(yy - s / 2, xx - s / 2)
    rot[..., :3] += (np.clip(np.cos(2 * (ang - 0.7)), 0, 1) ** 6 * 38 * sheen)[..., None] * (rot[..., 3:4] / 255)
    x0, y0 = int(cx - s / 2), int(cy - s / 2)
    _paste(canvas, rot, x0, y0, alpha)


def _paste(canvas, rgba, x0, y0, alpha=1.0):
    h, w = rgba.shape[:2]
    ch, cw = canvas.shape[:2]
    sx0, sy0 = max(0, -x0), max(0, -y0)
    x1, y1 = min(cw, x0 + w), min(ch, y0 + h)
    if x1 <= max(0, x0) or y1 <= max(0, y0):
        return
    part = rgba[sy0:sy0 + (y1 - max(0, y0)), sx0:sx0 + (x1 - max(0, x0))]
    a = part[..., 3:4] / 255 * alpha
    region = canvas[max(0, y0):y1, max(0, x0):x1]
    region[:] = region * (1 - a) + part[..., :3] * a


def bars(canvas, energies, x0, x1, base_y, height, colour_bgr, alpha=0.9, mirror=True, width_share=0.55):
    """A row of rounded bars from band energies, rising from base_y (and falling if mirror)."""
    n = len(energies)
    step = (x1 - x0) / n
    bw = max(2, int(step * width_share))
    layer = np.zeros_like(canvas)
    for i, e in enumerate(energies):
        x = int(x0 + i * step + step / 2)
        h = max(3, int(height * (0.06 + 0.94 * min(1.0, e))))
        top = int(base_y - h)
        bottom = int(base_y + (h * 0.45 if mirror else 0))
        cv2.line(layer, (x, top), (x, bottom), colour_bgr, bw, cv2.LINE_AA)
    glow = cv2.resize(cv2.GaussianBlur(cv2.resize(layer, (W // 4, H // 4)), (0, 0), 2), (W, H))
    canvas += (layer * 0.85 + glow * 0.6) * alpha
    return canvas


def marquee(canvas, text, y, t, speed=90, size=64, colour=(243, 233, 216), alpha=0.18, font='display'):
    """Text scrolling right to left forever, like the site's marquee."""
    spr = tp.sprite(text + '   ', font, size, colour, shadow=0)
    w = tp.ink_width(spr, size) + size
    off = -((t * speed) % w)
    x = off
    while x < W:
        tp.blit(canvas, spr, x - tp.pad_of(size), y, alpha=alpha, anchor='left')
        x += w


def pill(text, font='body', size=36, fill=(243, 234, 216), ink=(22, 17, 12), pad=(40, 22), icon=None):
    """A rounded button like the site's 'Listen to this record' (RGBA)."""
    key = ('pill', text, font, size, fill, ink)
    if key in tp._cache:
        return tp._cache[key]
    f = ImageFont.truetype(str(tp.FONTS / tp.FONT[font]), size)
    tw = f.getlength(text)
    asc, desc = f.getmetrics()
    w, h = int(tw + 2 * pad[0] + (size * 1.2 if icon else 0)), int(asc + desc + 2 * pad[1] * 0.8)
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=fill + (255,))
    x = pad[0]
    if icon == 'play':
        cy = h / 2
        d.polygon([(x, cy - size * 0.32), (x, cy + size * 0.32), (x + size * 0.55, cy)], fill=ink + (255,))
        x += size * 1.2
    d.text((x, (h - asc - desc) / 2), text, font=f, fill=ink + (255,))
    out = np.asarray(img).copy()
    tp._cache[key] = out
    return out
