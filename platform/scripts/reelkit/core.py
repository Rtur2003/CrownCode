"""Footage, framing and the moves every edit uses."""
from collections import OrderedDict
from pathlib import Path

import cv2
import numpy as np

FPS = 30
W, H = 1080, 1920

EASE = {
    'lin': lambda u: u,
    'out': lambda u: 1 - (1 - u) ** 3,
    'in': lambda u: u ** 3,
    'io': lambda u: u * u * (3 - 2 * u),
    # smootherstep: a camera move that starts and lands without a bump
    'soft': lambda u: u * u * u * (u * (u * 6 - 15) + 10),
    # fast in, slow through the middle, fast out: the velocity-edit ramp
    'vel': lambda u: u + 0.8 * np.sin(2 * np.pi * u) / (2 * np.pi),
    # overshoot and settle, for type that pops
    'back': lambda u: 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2,
}


def clamp(u, lo=0.0, hi=1.0):
    return min(hi, max(lo, u))


def env(t: float, t0: float, decay: float) -> float:
    """An exponential tail that starts at t0 (0 before it)."""
    return float(np.exp(-(t - t0) / decay)) if t >= t0 else 0.0


def wobble(t: float, seed: float) -> float:
    """Smooth pseudo-noise in about -1..1, for camera shake."""
    return np.sin(t * 51 + seed) * 0.6 + np.sin(t * 87 + seed * 2.3) * 0.4


class Footage:
    """Frame-exact reads from an all-intra video, with a small cache for motion blur taps."""

    def __init__(self, path: Path, cache: int = 16):
        self.path = Path(path)
        self.cap = cv2.VideoCapture(str(path))
        if not self.cap.isOpened():
            raise SystemExit(f'cannot open {path}')
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.pos = -2
        self.cache: OrderedDict = OrderedDict()
        self.size = cache
        self.shape = self.at(0).shape

    def at(self, t: float) -> np.ndarray:
        i = int(np.clip(round(t * FPS), 0, self.n - 1))
        if i in self.cache:
            self.cache.move_to_end(i)
            return self.cache[i]
        if i != self.pos + 1:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, img = self.cap.read()
        if not ok:
            raise SystemExit(f'cannot read frame {i} of {self.path.name}')
        self.pos = i
        self.cache[i] = img
        if len(self.cache) > self.size:
            self.cache.popitem(last=False)
        return img

    def blurred(self, t: float, speed: float) -> np.ndarray:
        """The frame at t, smeared over the time one output frame covers when the shot runs fast."""
        if speed < 1.6:
            return self.at(t)
        taps = [self.at(t - j * (speed / FPS) / 3).astype(np.float32) for j in range(3)]
        return np.mean(taps, axis=0).astype(np.uint8)


def view(img, cx, cy, z, ow=W, oh=H, rz=0.0, dx=0.0, dy=0.0):
    """Look at (cx, cy) of a frame. Zoom 1 fits the frame's width to the edit width."""
    s = W / img.shape[1] * z
    a = np.deg2rad(rz)
    c, sn = np.cos(a) * s, np.sin(a) * s
    px, py = cx * img.shape[1], cy * img.shape[0]
    m = np.array([[c, -sn, ow / 2 + dx - c * px + sn * py], [sn, c, oh / 2 + dy - sn * px - c * py]], np.float32)
    out = cv2.warpAffine(img, m, (ow, oh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return out.astype(np.float32), m


def region(img, box):
    """Crop (x0, y0, x1, y1), given as shares of the frame."""
    h, w = img.shape[:2]
    x0, y0, x1, y1 = box
    return img[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]


_masks: dict = {}


def rounded_mask(w, h, radius):
    key = (w, h, radius)
    if key not in _masks:
        m = np.zeros((h, w), np.uint8)
        cv2.rectangle(m, (radius, 0), (w - radius, h), 255, -1)
        cv2.rectangle(m, (0, radius), (w, h - radius), 255, -1)
        for x, y in ((radius, radius), (w - radius - 1, radius), (radius, h - radius - 1), (w - radius - 1, h - radius - 1)):
            cv2.circle(m, (x, y), radius, 255, -1, cv2.LINE_AA)
        edge = m.astype(np.float32) / 255 - cv2.erode(m, np.ones((5, 5), np.uint8)).astype(np.float32) / 255
        _masks[key] = (m.astype(np.float32) / 255, edge)
    return _masks[key]


def rotation(rx, ry, rz):
    x, y, z = np.deg2rad([rx, ry, rz])
    Rx = np.array([[1, 0, 0], [0, np.cos(x), -np.sin(x)], [0, np.sin(x), np.cos(x)]])
    Ry = np.array([[np.cos(y), 0, np.sin(y)], [0, 1, 0], [-np.sin(y), 0, np.cos(y)]])
    Rz = np.array([[np.cos(z), -np.sin(z), 0], [np.sin(z), np.cos(z), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


def card(face, pose, canvas, width=900, radius=26, edge=(107, 171, 214), sheen=None, shadow=0.6, alpha=1.0):
    """Lay a picture on the canvas as a tilted card with a hairline edge and a soft shadow.

    pose = (rx, ry, rz, x, y, scale): degrees, then offset from the centre in px.
    sheen, 0..1, runs a band of light across the card. Returns the canvas.
    """
    rx, ry, rz, tx, ty, sc = pose
    ch = int(width * face.shape[0] / face.shape[1])
    img = cv2.resize(face, (width, ch), interpolation=cv2.INTER_AREA).astype(np.float32)
    mask, rim = rounded_mask(width, ch, radius)
    if sheen is not None:
        gx = np.linspace(0, 1, width)[None, :] + np.linspace(0, 0.6, ch)[:, None]
        img += (np.clip(1 - np.abs(gx - (0.2 + 1.1 * sheen)) * 5, 0, 1) * 14)[..., None]
    if edge is not None:
        img = img * (1 - rim[..., None] * 0.6) + np.array(edge, np.float32) * rim[..., None] * 0.6
    F = 1500.0
    corners = np.array([[-width / 2, -ch / 2, 0], [width / 2, -ch / 2, 0], [width / 2, ch / 2, 0], [-width / 2, ch / 2, 0]]) * sc
    p = corners @ rotation(rx, ry, rz).T
    z = p[:, 2] + F
    oh, ow = canvas.shape[:2]
    dst = np.stack([ow / 2 + tx + F * p[:, 0] / z, oh / 2 + ty + F * p[:, 1] / z], 1).astype(np.float32)
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [width, 0], [width, ch], [0, ch]]), dst)
    warped = cv2.warpPerspective(img, M, (ow, oh), flags=cv2.INTER_LINEAR)
    a = cv2.warpPerspective(mask, M, (ow, oh), flags=cv2.INTER_LINEAR)[..., None] * alpha
    if shadow:
        sh = cv2.resize(cv2.GaussianBlur(cv2.resize(a, (ow // 4, oh // 4)), (0, 0), 7), (ow, oh))
        canvas *= 1 - shadow * np.roll(sh, 40, axis=0)[..., None]
    canvas[:] = canvas * (1 - a) + warped * a
    return canvas


def soft_background(img, dim=0.42, zoom=1.12):
    """A frame pushed out of focus and down, to sit behind cards and type."""
    small = cv2.resize(img, (W // 6, H // 6), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), 3)
    out, _ = view(cv2.resize(small, (W, H)), 0.5, 0.5, zoom)
    return out * dim
