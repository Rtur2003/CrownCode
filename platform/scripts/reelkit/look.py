"""The finish: grade, grain, bloom, and the effects that sit on cuts."""
import cv2
import numpy as np

from .core import H, W

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
_vignette = 1 - 0.4 * np.clip(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2, 0, 1) ** 1.3


def hex_bgr(value: str):
    value = value.lstrip('#')
    r, g, b = (int(value[i:i + 2], 16) for i in (0, 2, 4))
    return (b, g, r)


def rgb_bgr(rgb):
    return tuple(rgb[::-1])


def accent_from(img_bgr, fallback=(107, 171, 214)):
    """The picture's most vivid colour that is not near-black or near-white (BGR)."""
    small = cv2.resize(img_bgr, (64, 64), interpolation=cv2.INTER_AREA).reshape(-1, 3).astype(np.float32)
    _, labels, centres = cv2.kmeans(small, 6, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0), 3,
                                    cv2.KMEANS_PP_CENTERS)
    best, score = None, -1.0
    for i, c in enumerate(centres):
        hsv = cv2.cvtColor(np.uint8([[c]]), cv2.COLOR_BGR2HSV)[0, 0] / np.array([180, 255, 255])
        if hsv[2] < 0.25 or (hsv[1] < 0.12 and hsv[2] > 0.9):
            continue
        share = float(np.mean(labels == i))
        sc = hsv[1] * 0.7 + hsv[2] * 0.3 + min(share, 0.3)
        if sc > score:
            best, score = c, sc
    if best is None:
        return fallback
    # lift it so it reads as light on a dark frame
    hsv = cv2.cvtColor(np.uint8([[best]]), cv2.COLOR_BGR2HSV)[0, 0].astype(np.float32)
    hsv[2] = max(hsv[2], 200)
    hsv[1] = min(max(hsv[1], 90), 200)
    return tuple(int(v) for v in cv2.cvtColor(np.uint8([[hsv]]), cv2.COLOR_HSV2BGR)[0, 0])


def lut(r, g, b, contrast=1.08):
    x = np.arange(256) / 255
    y = 0.5 + (x - 0.5) * contrast
    y = y * y * (3 - 2 * y) * 0.3 + y * 0.7
    y = 0.016 + 0.984 * np.clip(y, 0, 1)
    return np.stack([np.clip(y * c, 0, 1) * 255 for c in (b, g, r)], axis=-1).astype(np.uint8).reshape(256, 1, 3)


LUTS = {'warm': lut(1.02, 1.0, 0.95), 'neutral': lut(1.0, 1.0, 1.0), 'cool': lut(0.97, 1.0, 1.04)}


def grade(img, name='warm'):
    return cv2.LUT(np.clip(img, 0, 255).astype(np.uint8), LUTS[name]).astype(np.float32)


def vignette(img, strength=1.0):
    img *= (1 - (1 - _vignette) * strength)[..., None]
    return img


def grain(img, fi, amount=4.0):
    g = np.random.default_rng(fi).normal(0, amount, (H // 2, W // 2)).astype(np.float32)
    img += cv2.resize(g, (W, H), interpolation=cv2.INTER_NEAREST)[..., None]
    return img


def bloom(img, threshold=170, amount=0.45):
    hi = np.clip(img - threshold, 0, None)
    hi = cv2.resize(cv2.GaussianBlur(cv2.resize(hi, (W // 4, H // 4)), (0, 0), 5), (W, H))
    img += hi * amount
    return img


def split(img, px):
    """Colour split: blue one way, red the other."""
    s = int(round(px))
    if s:
        img[..., 0] = np.roll(img[..., 0], s, axis=1)
        img[..., 2] = np.roll(img[..., 2], -s, axis=1)
    return img


def glitch(img, fi, amount):
    """Horizontal slices knocked sideways."""
    rng = np.random.default_rng(fi * 7 + 3)
    y = 0
    while y < H:
        h = int(rng.integers(18, 140))
        if rng.random() < 0.55:
            img[y:y + h] = np.roll(img[y:y + h], int(rng.integers(-60, 60) * amount), axis=1)
        y += h
    return img


def flood(img, u, centre, colour, soft=60):
    """A disc of solid colour growing from `centre` until it fills the frame (u 0..1)."""
    if u <= 0:
        return img
    cx, cy = centre
    reach = np.hypot(max(cx, W - cx), max(cy, H - cy)) + soft
    r = reach * (1 - (1 - min(1.0, u)) ** 3)
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    m = np.clip((r - d) / soft, 0, 1)[..., None]
    c = np.array(colour, np.float32)
    rim = np.clip(1 - np.abs(d - r) / (soft * 1.5), 0, 1)[..., None] * 0.35
    return img * (1 - m) + c * m + 255 * rim * (1 - m)


def iris(img, prev, u, centre=(W / 2, H / 2), ring=None):
    """Open `img` over `prev` as a widening circle."""
    cx, cy = centre
    r = (1 - (1 - min(1.0, u)) ** 3) * np.hypot(max(cx, W - cx), max(cy, H - cy))
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    m = np.clip((r - d) / 14, 0, 1)[..., None]
    out = prev * (1 - m) + img * m
    if ring is not None:
        rim = np.clip(1 - np.abs(d - r) / 5, 0, 1)[..., None]
        out = out * (1 - rim) + np.array(ring, np.float32) * rim
    return out


def whip(img, amount, vertical=True):
    """Directional motion blur, for a whip pan across a cut (amount 0..1)."""
    if amount <= 0.02:
        return img
    k = max(3, int(amount * 240) | 1)
    return cv2.blur(img, (1, k) if vertical else (k, 1), borderType=cv2.BORDER_REFLECT)


def zoom_blur(img, amount, centre=(W / 2, H / 2)):
    """Radial blur toward a point, for zooming through a cut."""
    if amount <= 0.02:
        return img
    acc = np.zeros_like(img)
    n = 6
    for j in range(n):
        s = 1 + amount * 0.25 * j / (n - 1)
        m = np.array([[s, 0, centre[0] * (1 - s)], [0, s, centre[1] * (1 - s)]], np.float32)
        acc += cv2.warpAffine(img, m, (W, H), borderMode=cv2.BORDER_REFLECT)
    return acc / n


def leak(img, t, strength, colour=(80, 150, 255)):
    """A warm light leak drifting across the frame."""
    if strength <= 0.01:
        return img
    cx = W * (0.2 + 0.6 * (0.5 + 0.5 * np.sin(t * 1.3)))
    cy = H * (0.3 + 0.2 * np.cos(t * 0.9))
    g = np.exp(-(((xx - cx) / (W * 0.55)) ** 2 + ((yy - cy) / (H * 0.35)) ** 2))[..., None]
    return img + np.array(colour, np.float32) * g * strength


def top_shade(img, strength=0.7, depth=340):
    """Darken the top of the frame so a HUD reads over anything."""
    ramp = np.clip(1 - np.arange(depth) / depth, 0, 1) ** 1.6 * strength
    img[:depth] *= (1 - ramp)[:, None, None]
    return img


def bars(img, amount, height=170, line=(107, 171, 214)):
    """Letterbox bars sliding in (amount 0..1)."""
    bar = int(height * (1 - (1 - min(1.0, max(0.0, amount))) ** 3))
    if bar:
        img[:bar] *= 0.04
        img[H - bar:] *= 0.04
        img[bar - 1:bar] = np.array(line, np.float32) * 0.35
        img[H - bar:H - bar + 1] = np.array(line, np.float32) * 0.35
    return img
