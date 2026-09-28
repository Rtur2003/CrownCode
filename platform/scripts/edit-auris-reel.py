"""Cut the AURIS edit for Instagram: two angles of one take, a song, a voice.

Footage comes from capture-auris-reel.py --angle ui and --angle world (the
same timeline, so the edit can cut between them at any point). The song is
a clip with a known tempo and drop: the edit starts eight bars before the
drop, the voice carries the build-up, the verdict lands on the drop, the
human result a bar later, then the report and the end card.

The analyses on screen are the capture's DEMO data (81 % and 22 %); the
edit labels them "örnek analiz".

Usage (from platform/):
  python scripts/edit-auris-reel.py --shots DIR --music song.mp3 --bpm 129.2 --drop 21.885 \
      --voice DIR --out assets-src/video/auris/auris-edit-tr.mp4 [--stills 0.5,7.5,15]
--voice holds l1.wav ... l7.wav; a missing line keeps its caption and stays silent.
Writes <out> (with the song) and <out>-nomusic.mp4 (voice and effects only, for
adding the song in Instagram's editor). --stills writes a contact sheet instead.
Requires numpy, scipy, opencv-python, pillow, librosa and ffmpeg.
"""
import argparse
import json
import subprocess
import wave
from pathlib import Path

import cv2
import librosa
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.signal import butter, fftconvolve, istft, sosfilt, stft

parser = argparse.ArgumentParser()
parser.add_argument('--shots', required=True)
parser.add_argument('--music', required=True)
parser.add_argument('--bpm', type=float, required=True)
parser.add_argument('--drop', type=float, required=True, help='seconds into --music where the drop hits')
parser.add_argument('--voice', required=True)
parser.add_argument('--out', required=True)
parser.add_argument('--lang', default='tr')
parser.add_argument('--stills')
args = parser.parse_args()

FPS = 30
W, H = 1080, 1920
SR = 48000
FONTS = Path(__file__).resolve().parent.parent / 'styles' / 'fonts'
FONT = {'display': 'portmanteau-regular.woff2', 'serif': 'im-fell-double-pica-regular.woff2', 'mono': 'jetbrains-mono-500.woff2'}
CREAM, AMBER, GREEN, MUTED = (243, 233, 216), (242, 180, 95), (143, 192, 171), (187, 168, 143)

P = 60 / args.bpm            # one beat
M0 = args.drop - 32 * P      # song time at the edit's first frame: eight bars before the drop


def b(k: float) -> float:
    """Edit time of beat k (beat 32 is the drop)."""
    return k * P


shots_dir = Path(args.shots)
music_len = librosa.get_duration(path=args.music) - M0
END = int((music_len - 0.02) * FPS) / FPS
N = int(round(END * FPS))

events = json.loads((shots_dir / 'events-ui.json').read_text(encoding='utf-8'))['events']


def event(name: str, after: float = 0.0) -> float:
    return next(t for t, n in events if n == name and t >= after)


E_AI = event('mode:ai')
E_HUMAN = event('mode:human')

# ── the cut ─────────────────────────────────────────────────────────────
# (from beat, to beat, angle, source from, source to, framing from, framing to, time ease, framing ease)
# Framing is (centre x, centre y, zoom) on the 1620x2880 source, zoom 1 = the whole frame.
EASE = {
    'lin': lambda u: u,
    'out': lambda u: 1 - (1 - u) ** 3,
    'in': lambda u: u ** 3,
    'io': lambda u: u * u * (3 - 2 * u),
}
CUT = [
    # the question
    (0, 4, 'world', 0.0, 1.9, (0.5, 0.5, 1.30), (0.5, 0.5, 1.50), 'lin', 'io'),
    (4, 8, 'ui', 0.3, 2.15, (0.31, 0.52, 1.75), (0.32, 0.52, 1.95), 'lin', 'out'),
    (8, 12, 'world', 2.2, 3.26, (0.5, 0.5, 1.05), (0.5, 0.5, 1.22), 'lin', 'io'),
    # the drop zone, then a whip into it
    (12, 15, 'ui', 2.25, 3.1, (0.32, 0.8, 2.2), (0.32, 0.8, 2.45), 'lin', 'out'),
    (15, 16, 'ui', 3.1, 3.29, (0.32, 0.8, 2.45), (0.2, 0.79, 3.6), 'lin', 'in'),
    # the song lands, the server works
    (16, 18, 'world', 3.3, 5.0, (0.5, 0.5, 1.0), (0.5, 0.5, 1.12), 'lin', 'out'),
    (18, 20, 'ui', 5.0, 5.95, (0.36, 0.62, 1.6), (0.36, 0.63, 1.72), 'lin', 'out'),
    # "eleven models vote": a cut on every beat
    (20, 21, 'ui', 22.9, 23.3, (0.5, 0.42, 1.15), (0.5, 0.40, 1.22), 'lin', 'out'),
    (21, 22, 'world', 6.0, 6.5, (0.5, 0.5, 1.35), (0.5, 0.5, 1.42), 'lin', 'out'),
    (22, 23, 'ui', 23.4, 23.8, (0.5, 0.62, 1.2), (0.5, 0.62, 1.27), 'lin', 'out'),
    (23, 24, 'ui', 7.05, 7.45, (0.33, 0.66, 1.9), (0.33, 0.66, 2.0), 'lin', 'out'),
    (24, 25, 'world', 7.6, 8.1, (0.5, 0.56, 1.7), (0.5, 0.56, 1.8), 'lin', 'out'),
    (25, 26, 'ui', 8.55, 8.95, (0.36, 0.66, 1.8), (0.36, 0.66, 1.9), 'lin', 'out'),
    (26, 27, 'world', 9.0, 9.4, (0.5, 0.5, 1.15), (0.5, 0.5, 1.22), 'lin', 'out'),
    (27, 28, 'ui', 9.6, 10.05, (0.36, 0.62, 1.6), (0.36, 0.62, 1.7), 'lin', 'out'),
    # the bar before the drop: time slows, the camera closes in
    (28, 32, 'world', 9.85, E_AI - 0.02, (0.5, 0.5, 1.1), (0.5, 0.5, 1.8), 'out', 'in'),
    # the drop: AI
    (32, 33, 'world', E_AI, E_AI + 0.7, (0.5, 0.5, 1.0), (0.5, 0.5, 1.08), 'lin', 'out'),
    (33, 34, 'ui', E_AI + 0.75, E_AI + 1.2, (0.39, 0.53, 1.4), (0.39, 0.53, 1.48), 'lin', 'out'),
    (34, 35, 'world', E_AI + 1.25, E_AI + 1.75, (0.5, 0.47, 1.9), (0.5, 0.47, 2.1), 'lin', 'out'),
    (35, 36, 'ui', E_AI + 1.75, E_AI + 2.2, (0.28, 0.56, 2.0), (0.28, 0.56, 2.1), 'lin', 'out'),
    # a bar later: human
    (36, 37, 'world', E_HUMAN, E_HUMAN + 0.7, (0.5, 0.5, 1.0), (0.5, 0.5, 1.08), 'lin', 'out'),
    (37, 38, 'ui', E_HUMAN + 0.75, E_HUMAN + 1.2, (0.39, 0.53, 1.4), (0.39, 0.53, 1.48), 'lin', 'out'),
    (38, 39, 'world', E_HUMAN + 1.25, E_HUMAN + 1.75, (0.5, 0.47, 1.9), (0.5, 0.47, 2.1), 'lin', 'out'),
    (39, 40, 'ui', E_HUMAN + 1.75, E_HUMAN + 2.2, (0.28, 0.56, 2.0), (0.28, 0.56, 2.1), 'lin', 'out'),
    # the report, fast
    (40, 44, 'ui', E_HUMAN + 2.25, E_HUMAN + 7.3, (0.5, 0.5, 1.2), (0.5, 0.5, 1.35), 'lin', 'lin'),
    # end card over the world
    (44, END / P, 'world', E_HUMAN + 4.2, E_HUMAN + 7.6, (0.5, 0.5, 1.0), (0.5, 0.5, 1.12), 'lin', 'out'),
]
GRADE = [(0, 32, 'warm'), (32, 36, 'ai'), (36, 40, 'human'), (40, 999, 'warm')]
WHIP = {15}  # shots that end in a zoom blur

# Hits: beat, zoom punch, shake px, colour split px, flash colour, flash amount.
HITS = [(4, .04, 0, 2, None, 0), (8, .04, 0, 2, None, 0), (12, .04, 0, 2, None, 0),
        (16, .10, 14, 6, CREAM, .22), (18, .04, 0, 2, None, 0),
        *[(k, .05, 4, 3, None, 0) for k in range(20, 28)],
        (32, .22, 26, 14, AMBER, .7), (33, .05, 6, 4, None, 0), (34, .06, 8, 5, None, 0), (35, .05, 6, 4, None, 0),
        (36, .16, 16, 8, GREEN, .5), (37, .05, 6, 4, None, 0), (38, .06, 8, 5, None, 0), (39, .05, 6, 4, None, 0),
        (40, .08, 8, 4, None, 0), (42, .05, 4, 3, None, 0), (44, .03, 0, 0, None, 0)]

# ── words ───────────────────────────────────────────────────────────────
LINES = {
    'l1': (0.12, 'Bu şarkıyı bir insan mı yaptı, yoksa yapay zekâ mı?', {'insan': GREEN, 'yapay': AMBER, 'zekâ': AMBER}),
    'l2': (3.78, 'Kulakla artık ayırt edemiyoruz.', {}),
    'l3': (5.66, 'Şarkıyı dünyaya bırak.', {'dünyaya': AMBER}),
    'l4': (7.62, 'Birkaç katman sesi ayrı ayrı dinliyor,', {}),
    'l5': (9.40, 'on bir model oy veriyor.', {'on': AMBER, 'bir': AMBER, 'model': AMBER}),
    'l6': (13.15, 'Ve sonuç...', {}),
    'l7': (20.62, 'Kendi şarkınla dene. Link profilde.', {'Link': AMBER, 'profilde.': AMBER}),
}
BIG = [  # beat from, beat to, text, font, size, colour, y, small line under it
    (32, 33, 'YAPAY ZEKÂ', 'display', 104, AMBER, 1240, None),
    (34, 35, '%81', 'display', 300, CREAM, 1250, 'YAPAY ZEKÂ OLASILIĞI'),
    (36, 37, 'İNSAN', 'display', 150, GREEN, 1240, None),
    (38, 39, '%22', 'display', 300, CREAM, 1250, 'YAPAY ZEKÂ OLASILIĞI'),
]
TAGS = [(32, 40, 'ÖRNEK ANALİZ'), (40, 44, '11 MODELİN OYU · SHAP AÇIKLAMASI')]


def syllables(word: str) -> int:
    return max(1, sum(ch in 'aeıioöuüâîûAEIİOÖUÜÂÎÛ' for ch in word))


def load_voice(key: str):
    path = Path(args.voice) / f'{key}.wav'
    if not path.exists():
        return None
    y, _ = librosa.load(path, sr=SR, mono=True)
    y, _ = librosa.effects.trim(y, top_db=38)
    return y


VOICE = {k: load_voice(k) for k in LINES}


def line_span(key: str) -> tuple[float, float]:
    start, text, _ = LINES[key]
    v = VOICE[key]
    dur = len(v) / SR if v is not None else sum(syllables(w) for w in text.split()) / 6.2
    return start, dur


# ── footage ─────────────────────────────────────────────────────────────

class Footage:
    def __init__(self, path: Path):
        self.cap = cv2.VideoCapture(str(path))
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.pos = -2
        self.last = None

    def at(self, t: float) -> np.ndarray:
        i = int(np.clip(round(t * FPS), 0, self.n - 1))
        if i == self.pos:
            return self.last
        if i != self.pos + 1:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, img = self.cap.read()
        if not ok:
            raise SystemExit(f'cannot read frame {i}')
        self.pos, self.last = i, img
        return img


FOOTAGE = {a: Footage(shots_dir / f'auris-shot-{a}-{args.lang}.mp4') for a in ('ui', 'world')}


def framed(img: np.ndarray, cx: float, cy: float, z: float, dx: float = 0, dy: float = 0) -> np.ndarray:
    h, w = img.shape[:2]
    cw, ch = w / z, h / z
    x0 = min(max(cx * w - cw / 2, 0), w - cw)
    y0 = min(max(cy * h - ch / 2, 0), h - ch)
    s = W / cw
    m = np.array([[s, 0, -x0 * s + dx], [0, s, -y0 * s + dy]], dtype=np.float32)
    return cv2.warpAffine(img, m, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)


# ── look ────────────────────────────────────────────────────────────────

def lut(r: float, g: float, bl: float) -> np.ndarray:
    x = np.arange(256) / 255
    y = 0.5 + (x - 0.5) * 1.07
    y = y * y * (3 - 2 * y) * 0.3 + y * 0.7
    y = 0.018 + 0.982 * np.clip(y, 0, 1)
    return np.stack([np.clip(y * k, 0, 1) * 255 for k in (bl, g, r)], axis=-1).astype(np.uint8).reshape(256, 1, 3)


LUTS = {'warm': lut(1.02, 1.0, 0.96), 'ai': lut(1.07, 1.0, 0.88), 'human': lut(0.95, 1.04, 1.02)}
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIGNETTE = 1 - 0.38 * np.clip(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2, 0, 1) ** 1.3
# A soft dark band behind captions, so they read over the page.
FROST = np.exp(-((yy - 1350) / 300) ** 2)[..., None]
BAND = 1 - 0.68 * FROST[..., 0]


def env(t: float, t0: float, decay: float) -> float:
    return float(np.exp(-(t - t0) / decay)) if t >= t0 else 0.0


def wobble(t: float, seed: float) -> float:
    return np.sin(t * 51 + seed) * 0.6 + np.sin(t * 87 + seed * 2.3) * 0.4


# ── type ────────────────────────────────────────────────────────────────
_sprites: dict = {}


def sprite(text: str, font: str, size: int, colour, tracking: float = 0.0, shadow: float = 0.85) -> np.ndarray:
    key = (text, font, size, colour, tracking, shadow)
    if key in _sprites:
        return _sprites[key]
    f = ImageFont.truetype(str(FONTS / FONT[font]), size)
    asc, desc = f.getmetrics()
    pad = int(size * 0.4)
    if tracking:
        widths = [f.getlength(ch) for ch in text]
        tw = sum(widths) + tracking * size * (len(text) - 1)
    else:
        tw = f.getlength(text)
    img = Image.new('RGBA', (int(tw) + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if tracking:
        x = pad
        for ch, cw in zip(text, widths):
            d.text((x, pad), ch, font=f, fill=colour + (255,))
            x += cw + tracking * size
    else:
        d.text((pad, pad), text, font=f, fill=colour + (255,))
    if shadow:
        a = img.split()[3].filter(ImageFilter.GaussianBlur(size * 0.14)).point(lambda v: int(v * shadow))
        sh = Image.new('RGBA', img.size, (4, 4, 7, 0))
        sh.putalpha(a)
        img = Image.alpha_composite(sh, img)
    out = np.asarray(img).copy()
    _sprites[key] = out
    return out


def plate(text: str) -> np.ndarray:
    key = ('plate', text)
    if key in _sprites:
        return _sprites[key]
    f = ImageFont.truetype(str(FONTS / FONT['mono']), 30)
    tw = sum(f.getlength(ch) for ch in text) + 0.2 * 30 * (len(text) - 1)
    asc, desc = f.getmetrics()
    img = Image.new('RGBA', (int(tw) + 60, asc + desc + 34), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, img.width - 1, img.height - 1), radius=18, fill=(12, 11, 10, 215), outline=(214, 171, 107, 90), width=2)
    x = 30
    for ch in text:
        d.text((x, 17), ch, font=f, fill=AMBER + (255,))
        x += f.getlength(ch) + 6
    out = np.asarray(img).copy()
    _sprites[key] = out
    return out


def blit(frame: np.ndarray, spr: np.ndarray, cx: float, cy: float, alpha: float = 1.0, scale: float = 1.0, reveal: float = 1.0):
    if alpha <= 0.003:
        return
    if scale != 1.0:
        spr = cv2.resize(spr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR)
    h, w = spr.shape[:2]
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
    sx0, sy0 = max(0, -x0), max(0, -y0)
    x1, y1 = min(W, x0 + w), min(H, y0 + h)
    if x1 <= max(0, x0) or y1 <= max(0, y0):
        return
    s = spr[sy0:sy0 + (y1 - max(0, y0)), sx0:sx0 + (x1 - max(0, x0))].astype(np.float32)
    a = s[..., 3:4] / 255 * alpha
    if reveal < 1:
        cols = np.arange(sx0, sx0 + s.shape[1])
        a = a * np.clip((reveal * w - cols) / 30, 0, 1)[None, :, None]
    region = frame[max(0, y0):y1, max(0, x0):x1]
    region[:] = region * (1 - a) + s[..., 2::-1] * a


def caption_words(key: str):
    """Word sprites laid out in centred lines, with the time each word appears."""
    start, dur = line_span(key)
    _, text, colours = LINES[key]
    size = 92 if key == 'l1' else 78
    words = text.split()
    sprites = [sprite(w, 'serif', size, colours.get(w, CREAM)) for w in words]
    space = size * 0.26
    pad = int(size * 0.4)
    lines, cur, cur_w = [], [], 0.0
    for i, s in enumerate(sprites):
        w = s.shape[1] - 2 * pad
        if cur and cur_w + space + w > 900:
            lines.append((cur, cur_w))
            cur, cur_w = [], 0.0
        cur_w += (space if cur else 0) + w
        cur.append(i)
    lines.append((cur, cur_w))
    syl = np.array([syllables(w) for w in words], dtype=float)
    appear = start + dur * 0.93 * np.concatenate([[0], np.cumsum(syl)[:-1]]) / syl.sum() - 0.04
    placed = []
    line_h = size * 1.22
    top = 1350 - line_h * (len(lines) - 1) / 2
    for li, (idx, lw) in enumerate(lines):
        x = W / 2 - lw / 2
        for i in idx:
            w = sprites[i].shape[1] - 2 * pad
            placed.append((sprites[i], x + w / 2, top + li * line_h, appear[i]))
            x += w + space
    return start, start + dur, placed


CAPTIONS = {k: caption_words(k) for k in LINES}


def draw_type(frame: np.ndarray, t: float):
    keys = list(LINES)
    for n, key in enumerate(keys):
        start, end, placed = CAPTIONS[key]
        nxt = CAPTIONS[keys[n + 1]][0] if n + 1 < len(keys) else END
        hide = min(end + 0.45, nxt - 0.02)
        if not (start - 0.1 <= t < hide):
            continue
        out = np.clip((hide - t) / 0.12, 0, 1)
        for spr, x, y, at in placed:
            u = np.clip((t - at) / 0.16, 0, 1)
            e = 1 - (1 - u) ** 3
            blit(frame, spr, x, y + (1 - e) * 26, alpha=e * out, scale=0.94 + 0.06 * e)
    for k0, k1, text, font, size, colour, y, small in BIG:
        if b(k0) <= t < b(k1):
            u = (t - b(k0)) / (b(k1) - b(k0))
            e = 1 - (1 - min(1.0, u * 4)) ** 3
            blit(frame, sprite(text, font, size, colour, tracking=0.04), W / 2, y, alpha=1.0, scale=1.12 - 0.12 * e,
                 reveal=min(1.0, u * 7))
            if small:
                blit(frame, sprite(small, 'mono', 34, CREAM, tracking=0.16), W / 2, y + size * 0.6, alpha=e * 0.9)
    for k0, k1, text in TAGS:
        if b(k0) <= t < b(k1):
            a = np.clip((t - b(k0)) / 0.15, 0, 1) * np.clip((b(k1) - t) / 0.1, 0, 1)
            blit(frame, plate(text), W / 2, 318, alpha=a)
    if t >= b(44):
        u = t - b(44)
        e = lambda d: 1 - (1 - np.clip((u - d) / 0.4, 0, 1)) ** 3  # noqa: E731
        blit(frame, sprite('AURIS', 'display', 210, CREAM, tracking=0.02), W / 2, 820 - 20 * (1 - e(0)), alpha=e(0))
        blit(frame, sprite('Bu şarkıyı yapay zekâ mı yaptı?', 'serif', 60, AMBER), W / 2, 985, alpha=e(0.12))
        blit(frame, sprite('hasan-arthur-altuntas.xyz', 'mono', 34, CREAM, tracking=0.06), W / 2, 1105, alpha=e(0.24))
        blit(frame, sprite('ücretsiz · üyelik yok', 'serif', 42, MUTED), W / 2, 1172, alpha=e(0.3))


# ── frames ──────────────────────────────────────────────────────────────

def shot_at(t: float):
    for i, s in enumerate(CUT):
        if b(s[0]) <= t < b(s[1]):
            return i, s
    return len(CUT) - 1, CUT[-1]


def render(fi: int) -> np.ndarray:
    t = fi / FPS
    i, (k0, k1, angle, s0, s1, f0, f1, tease, fease) = shot_at(t)
    u = (t - b(k0)) / (b(k1) - b(k0))
    src = s0 + (s1 - s0) * EASE[tease](u)
    fe = EASE[fease](u)
    cx, cy, z = (a + (c - a) * fe for a, c in zip(f0, f1))

    punch = shake = split = flash = 0.0
    flash_colour = None
    for k, zp, sh, sp, fc, fa in HITS:
        e = env(t, b(k), 0.11)
        punch += zp * e
        shake += sh * env(t, b(k), 0.22)
        split += sp * env(t, b(k), 0.16)
        if fc and fa * env(t, b(k), 0.12) > flash:
            flash, flash_colour = fa * env(t, b(k), 0.12), fc
    z *= 1 + punch
    dx, dy = shake * wobble(t, 1.0), shake * wobble(t, 4.0)
    img_src = FOOTAGE[angle].at(src)
    if i in WHIP and u > 0.55:
        spread = (u - 0.55) / 0.45
        img = np.mean([framed(img_src, cx, cy, z * (1 + 0.07 * spread * j), dx, dy).astype(np.float32) for j in range(5)], axis=0)
    else:
        img = framed(img_src, cx, cy, z, dx, dy).astype(np.float32)
    grade = next(g for g0, g1, g in GRADE if b(g0) <= t < b(g1))
    img = cv2.LUT(np.clip(img, 0, 255).astype(np.uint8), LUTS[grade]).astype(np.float32)

    s = int(round(split))
    if s:
        img[..., 0] = np.roll(img[..., 0], s, axis=1)
        img[..., 2] = np.roll(img[..., 2], -s, axis=1)

    light = VIGNETTE.copy()
    if any(CAPTIONS[k][0] - 0.1 <= t < CAPTIONS[k][1] + 0.45 for k in LINES) and t < b(44):
        light *= BAND
        soft = cv2.resize(cv2.GaussianBlur(cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA), (0, 0), 3.5), (W, H))
        img = img * (1 - FROST) + soft * FROST
    dim = 1.0
    if b(31) <= t < b(32):              # the breath before the drop
        dim = 1 - 0.75 * ((t - b(31)) / P) ** 1.5
    if t < 0.15:
        dim *= t / 0.15
    if t >= b(44):                      # end card: the world steps back
        dim *= 1 - 0.62 * min(1.0, (t - b(44)) / 0.35)
    if t > END - 0.3:
        dim *= max(0.0, (END - t) / 0.3)
    img *= (light * dim)[..., None]
    if flash_colour:
        img = img * (1 - flash) + np.array(flash_colour[::-1], np.float32) * flash

    grain = np.random.default_rng(fi).normal(0, 4.0, (H // 2, W // 2)).astype(np.float32)
    img += cv2.resize(grain, (W, H), interpolation=cv2.INTER_NEAREST)[..., None]
    draw_type(img, t)
    return np.clip(img, 0, 255).astype(np.uint8)


# ── sound ───────────────────────────────────────────────────────────────
TOTAL = int(END * SR)
tt = np.arange(TOTAL) / SR
rng = np.random.default_rng(20260928)


def at_len(x: np.ndarray) -> np.ndarray:
    out = np.zeros(TOTAL)
    out[:min(TOTAL, len(x))] = x[:TOTAL]
    return out


def voice_track() -> np.ndarray:
    out = np.zeros(TOTAL)
    room = rng.standard_normal(int(0.32 * SR)) * np.exp(-np.arange(int(0.32 * SR)) / SR / 0.07)
    for key, (start, _, _) in LINES.items():
        v = VOICE[key]
        if v is None:
            continue
        v = sosfilt(butter(2, 90, 'high', fs=SR, output='sos'), v)
        v = v + 0.32 * sosfilt(butter(2, [2300, 5200], 'band', fs=SR, output='sos'), v)
        v = v + 0.18 * sosfilt(butter(2, 180, 'low', fs=SR, output='sos'), v)   # a little chest
        rms = np.sqrt(np.convolve(v ** 2, np.ones(960) / 960, 'same')) + 1e-7
        thr = np.percentile(rms, 70) * 0.8
        gain = np.where(rms > thr, (thr * (rms / thr) ** (1 / 2.6)) / rms, 1.0)
        v = v * np.convolve(gain, np.ones(480) / 480, 'same')
        v = np.tanh(v / np.abs(v).max() * 1.4) / np.tanh(1.4)
        v = v + fftconvolve(v, room)[:len(v)] * 0.012
        i0 = int(start * SR)
        n = min(len(v), TOTAL - i0)
        out[i0:i0 + n] += v[:n] * 0.5
    return out


def music_track() -> np.ndarray:
    y, _ = librosa.load(args.music, sr=SR, mono=False)
    y = np.atleast_2d(y)
    if y.shape[0] == 1:
        y = np.vstack([y, y])
    y = y[:, int(M0 * SR):]
    y = np.stack([at_len(c) for c in y])
    # The last bar before the drop closes down to a low-pass, then opens on the drop.
    f, frames_t, Z = stft(y, fs=SR, nperseg=2048, noverlap=1536)
    fc = np.full(frames_t.shape, 22000.0)
    k = (frames_t >= b(28)) & (frames_t < b(32))
    u = (frames_t[k] - b(28)) / (b(32) - b(28))
    fc[k] = np.exp(np.log(9000) + (np.log(320) - np.log(9000)) * u ** 1.6)
    mask = 1 / np.sqrt(1 + (f[:, None] / fc[None, :]) ** 8)
    _, y = istft(Z * mask[None], fs=SR, nperseg=2048, noverlap=1536)
    y = np.stack([at_len(c) for c in y])
    gain = np.ones(TOTAL)
    breath = (tt >= b(31.5)) & (tt < b(32))
    gain[breath] = 1 - 0.8 * ((tt[breath] - b(31.5)) / (b(32) - b(31.5)))
    gain *= np.clip((END - tt) / 0.6, 0, 1)
    return y * gain


def sfx_track() -> np.ndarray:
    out = np.zeros(TOTAL)
    noise = rng.standard_normal(TOTAL)

    def envelope(t0, attack, decay):
        return np.clip((tt - t0 + attack) / attack, 0, 1) * np.exp(-np.maximum(0, tt - t0) / decay)

    def whoosh(t_peak, dur=0.4, g=0.16):
        i0, i1 = int((t_peak - dur) * SR), int((t_peak + 0.12) * SR)
        seg = noise[i0:i1]
        x = np.linspace(0, 1, len(seg))
        lo = sosfilt(butter(2, [300, 1400], 'band', fs=SR, output='sos'), seg)
        hi = sosfilt(butter(2, [1400, 7000], 'band', fs=SR, output='sos'), seg)
        shape = np.where(x < dur / (dur + 0.12), (x / (dur / (dur + 0.12))) ** 2, np.exp(-(x - dur / (dur + 0.12)) * 30))
        out[i0:i1] += (lo * (1 - x) + hi * x) * shape * g

    def impact(t0, g=1.0, low=52):
        sweep = low + 60 * np.exp(-np.maximum(0, tt - t0) / 0.05)
        phase = 2 * np.pi * np.cumsum(sweep) / SR
        out[:] += np.sin(phase) * envelope(t0, 0.003, 0.55) * 0.55 * g
        crack = sosfilt(butter(2, 2500, 'high', fs=SR, output='sos'), noise) * envelope(t0, 0.001, 0.03)
        out[:] += crack * 0.25 * g
        body = sosfilt(butter(2, 400, 'low', fs=SR, output='sos'), noise) * envelope(t0, 0.002, 0.18)
        out[:] += body * 0.5 * g

    def click(t0, g=0.08):
        out[:] += sosfilt(butter(2, [2500, 6500], 'band', fs=SR, output='sos'), noise) * envelope(t0, 0.001, 0.006) * g * 3
        out[:] += np.sin(2 * np.pi * 1850 * tt) * envelope(t0, 0.001, 0.02) * g

    def bell(t0, notes, g=0.05):
        for m in notes:
            fq = 440 * 2 ** ((m - 69) / 12)
            for ratio, w, dec in ((1, 1.0, 1.2), (2.0, 0.25, 0.6), (2.76, 0.15, 0.4)):
                out[:] += np.sin(2 * np.pi * fq * ratio * tt) * envelope(t0, 0.004, dec) * w * g

    whoosh(b(16) - 0.02, 0.45, 0.2)
    impact(b(16), 0.45, 70)
    for k in range(20, 28):
        click(b(k))
    # riser into the drop
    i0, i1 = int(b(28) * SR), int(b(32) * SR)
    seg = noise[i0:i1]
    x = np.linspace(0, 1, len(seg))
    rise = np.zeros_like(seg)
    for c in range(12):
        a, z = int(c / 12 * len(seg)), int((c + 1) / 12 * len(seg))
        centre = 400 * (7000 / 400) ** ((c + 0.5) / 12)
        rise[a:z] = sosfilt(butter(2, [centre * 0.7, centre * 1.4], 'band', fs=SR, output='sos'), seg[a:z])
    out[i0:i1] += rise * x ** 2.2 * 0.16
    impact(b(32), 1.0, 46)
    whoosh(b(36) - 0.01, 0.3, 0.12)
    bell(b(36), (74, 78, 81, 85), 0.035)
    whoosh(b(40) - 0.01, 0.25, 0.1)
    whoosh(b(44), 0.5, 0.12)
    bell(b(44) + 0.05, (62, 69, 74), 0.04)
    return out


def master(x: np.ndarray, rms_db: float) -> np.ndarray:
    win = int(0.4 * SR)
    loud = np.sqrt(np.convolve(np.mean(x ** 2, axis=0), np.ones(win) / win, 'same')).max()
    x = x / loud * 10 ** (rms_db / 20)
    x = np.tanh(x * 1.15) / np.tanh(1.15)
    return x / max(1.0, np.abs(x).max() / 0.89)


def write_wav(path: Path, x: np.ndarray):
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x.T * 32767).astype(np.int16).tobytes())


def main():
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    if args.stills:
        times = [float(v) for v in args.stills.split(',')]
        tiles = []
        for t in times:
            img = cv2.resize(render(int(round(t * FPS))), (360, 640), interpolation=cv2.INTER_AREA)
            cv2.putText(img, f'{t:.2f}', (8, 630), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            tiles.append(img)
        while len(tiles) % 6:
            tiles.append(np.zeros_like(tiles[0]))
        sheet = np.vstack([np.hstack(tiles[r:r + 6]) for r in range(0, len(tiles), 6)])
        cv2.imwrite(str(out.with_suffix('.stills.jpg')), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
        print(out.with_suffix('.stills.jpg'))
        return

    silent = out.with_name(out.stem + '-video.mp4')
    enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
                            '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-maxrate', '14M', '-bufsize', '28M',
                            '-pix_fmt', 'yuv420p', '-profile:v', 'high', str(silent)], stdin=subprocess.PIPE)
    for fi in range(N):
        enc.stdin.write(render(fi).tobytes())
        if fi % 60 == 0:
            print(f'{fi}/{N}', flush=True)
    enc.stdin.close()
    if enc.wait():
        raise SystemExit('ffmpeg failed')

    voice, sfx, music = voice_track(), sfx_track(), music_track()
    active = np.convolve(np.abs(voice), np.ones(1440) / 1440, 'same')
    duck = 1 - 0.6 * np.clip(active / 0.02, 0, 1)
    duck = np.convolve(duck, np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
    with_song = music * duck + np.vstack([voice, voice]) * 1.0 + np.vstack([sfx, sfx])
    no_song = np.vstack([voice, voice]) + np.vstack([sfx, sfx]) * 0.8
    wav_song, wav_bare = out.with_name(out.stem + '.wav'), out.with_name(out.stem + '-nomusic.wav')
    write_wav(wav_song, master(with_song, -11.0))
    write_wav(wav_bare, master(no_song, -12.0))
    for wav, dst in ((wav_song, out), (wav_bare, out.with_name(out.stem + '-nomusic.mp4'))):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(silent), '-i', str(wav), '-c:v', 'copy',
                        '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', str(dst)], check=True)
        wav.unlink()
        print(dst)
    silent.unlink()


if __name__ == '__main__':
    main()
