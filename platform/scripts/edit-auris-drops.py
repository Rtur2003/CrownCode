"""Second AURIS edit: two drops, two verdicts.

Cut for MONTAGEM GUERREIRO (Super Slowed): a groove, a break, the first drop
on beat 15, a groove, a gap, the second drop on beat 31. The AI result lands
on the first drop and the human one on the second. Same footage as
edit-auris-reel.py (capture-auris-reel.py --angle ui and --angle world),
cut differently: the page floats over the world as a tilted card, shots
ramp their speed inside each beat, the world wears a ring drawn from the
song's own spectrum, and the two verdicts end side by side.

The analyses on screen are the capture's DEMO data (81 % and 22 %), labelled
"sample analysis".

Usage (from platform/):
  python scripts/edit-auris-drops.py --shots DIR --music guerreiro.mp3 --voice DIR \
      --out assets-src/video/auris/auris-drops-en.mp4 [--stills 1,5,10.4]
--voice holds hook, ear, drop, vote, verdict, person, bio (.wav); a missing
line keeps its caption and stays silent. Writes <out>, <out>-nomusic.mp4 and
<out>-preview.mp4 (under 30 MB). --stills writes a contact sheet instead.
Requires numpy, scipy, opencv-python, pillow, librosa and ffmpeg.
"""
import argparse
import json
import re
import subprocess
import wave
from collections import OrderedDict
from pathlib import Path

import cv2
import librosa
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.signal import butter, fftconvolve, sosfilt

parser = argparse.ArgumentParser()
parser.add_argument('--shots', required=True)
parser.add_argument('--music', required=True)
parser.add_argument('--voice', required=True)
parser.add_argument('--out', required=True)
parser.add_argument('--lang', default='en')
parser.add_argument('--bpm', type=float, default=87.59)
parser.add_argument('--first-beat', type=float, default=0.052, help='song time of beat 0')
parser.add_argument('--end-beat', type=float, default=41)
parser.add_argument('--stills')
args = parser.parse_args()

FPS = 30
W, H = 1080, 1920
SR = 48000
FONTS = Path(__file__).resolve().parent.parent / 'styles' / 'fonts'
FONT = {'display': 'portmanteau-regular.woff2', 'serif': 'im-fell-double-pica-regular.woff2', 'mono': 'jetbrains-mono-500.woff2'}
CREAM, AMBER, GREEN, MUTED = (243, 233, 216), (242, 180, 95), (143, 192, 171), (187, 168, 143)
P = 60 / args.bpm


def k(beat: float) -> float:
    """Edit time of a beat. The edit runs on the song's own clock."""
    return args.first_beat + beat * P


END = int(k(args.end_beat) * FPS) / FPS
N = int(round(END * FPS))
shots_dir = Path(args.shots)
events = json.loads((shots_dir / f'events-ui-{args.lang}.json').read_text(encoding='utf-8'))['events']
E_AI = next(t for t, n in events if n == 'mode:ai')
E_HUMAN = next(t for t, n in events if n == 'mode:human')

# ── footage ─────────────────────────────────────────────────────────────


class Footage:
    def __init__(self, path: Path):
        self.cap = cv2.VideoCapture(str(path))
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.pos = -2
        self.cache: OrderedDict = OrderedDict()

    def at(self, t: float) -> np.ndarray:
        i = int(np.clip(round(t * FPS), 0, self.n - 1))
        if i in self.cache:
            self.cache.move_to_end(i)
            return self.cache[i]
        if i != self.pos + 1:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, img = self.cap.read()
        if not ok:
            raise SystemExit(f'cannot read frame {i}')
        self.pos = i
        self.cache[i] = img
        if len(self.cache) > 14:
            self.cache.popitem(last=False)
        return img


FOOT = {a: Footage(shots_dir / f'auris-shot-{a}-{args.lang}.mp4') for a in ('ui', 'world')}
SRC_W = FOOT['world'].at(0).shape[1]
PLANET_R = 0.185  # sphere radius as a share of the source width


def view(img, cx, cy, z, ow=W, oh=H, rz=0.0, dx=0.0, dy=0.0):
    """Look at (cx, cy) of a source frame; zoom 1 fits the source width to the edit width."""
    s = W / img.shape[1] * z
    a = np.deg2rad(rz)
    c, sn = np.cos(a) * s, np.sin(a) * s
    px, py = cx * img.shape[1], cy * img.shape[0]
    m = np.array([[c, -sn, ow / 2 + dx - c * px + sn * py], [sn, c, oh / 2 + dy - sn * px - c * py]], np.float32)
    out = cv2.warpAffine(img, m, (ow, oh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return out.astype(np.float32), m


# ── the cut ─────────────────────────────────────────────────────────────
EASE = {
    'lin': lambda u: u,
    'out': lambda u: 1 - (1 - u) ** 3,
    'in': lambda u: u ** 3,
    'io': lambda u: u * u * (3 - 2 * u),
    # Speed ramp inside a shot: fast in, slow through the middle, fast out.
    'vel': lambda u: u + 0.8 * np.sin(2 * np.pi * u) / (2 * np.pi),
}

REGION = {  # parts of the page, as (x0, y0, x1, y1) of the ui frame
    'title': (0.03, 0.37, 0.97, 0.67), 'dropzone': (0.03, 0.66, 0.97, 0.95), 'steps': (0.03, 0.42, 0.97, 0.80),
    'verdict': (0.03, 0.40, 0.97, 0.71), 'votes': (0.03, 0.06, 0.97, 0.86), 'dropzone-2': (0.03, 0.42, 0.97, 0.69), 'votes-low': (0.03, 0.30, 0.97, 0.86),
    'shap': (0.03, 0.05, 0.97, 0.60), 'shap-close': (0.03, 0.15, 0.97, 0.47),
}
# world: (kind, from beat, to beat, source from, to, time ease, framing from, to, framing ease)   framing = (cx, cy, zoom, roll)
# card:  (kind, from beat, to beat, source from, to, time ease, region, pose from, to, pose ease) pose = (rx, ry, rz, x, y, scale)
# split: (kind, from beat, to beat, AI source from, to, human source from, to)
CUT = [
    ('world', -1, 2, 0.0, 1.2, 'lin', (0.5, 0.5, 1.85, -2), (0.5, 0.5, 1.55, 2), 'out'),
    ('card', 2, 4, 0.4, 1.9, 'lin', 'title', (8, 38, -4, 120, 0, 0.9), (4, 10, -1, 0, 0, 1.12), 'out'),
    ('world', 4, 6, 1.2, 2.1, 'lin', (0.5, 0.5, 1.1, -3), (0.5, 0.5, 1.2, 3), 'io'),
    ('card', 6, 8, 2.2, 3.28, 'lin', 'dropzone', (35, -12, 3, 0, 80, 0.85), (18, -4, 0, 0, 0, 1.08), 'out'),
    ('world', 8, 10, 2.3, 3.26, 'lin', (0.5, 0.5, 1.25, 0), (0.5, 0.5, 1.6, 0), 'in'),
    ('world', 10, 11, 3.3, 4.3, 'out', (0.5, 0.5, 1.08, 0), (0.5, 0.5, 1.16, 0), 'out'),
    ('card', 11, 12, 5.2, 6.6, 'vel', 'steps', (10, -25, 2, 0, 0, 0.95), (6, -8, 0, 0, 0, 1.0), 'out'),
    ('world', 12, 13, 6.6, 8.0, 'vel', (0.5, 0.56, 1.7, 0), (0.5, 0.56, 1.8, 0), 'out'),
    ('card', 13, 14, 8.0, 9.6, 'vel', 'steps', (8, 22, -2, 0, 0, 0.95), (4, 8, 0, 0, 0, 1.02), 'out'),
    ('world', 14, 15, 9.7, E_AI - 0.02, 'out', (0.5, 0.5, 1.2, 0), (0.5, 0.5, 1.9, 0), 'in'),
    # drop one: AI
    ('world', 15, 16, E_AI, E_AI + 0.68, 'lin', (0.5, 0.5, 1.08, 0), (0.5, 0.5, 1.14, 0), 'out'),
    ('world', 16, 17, E_AI + 0.7, E_AI + 1.3, 'lin', (0.5, 0.47, 1.9, 0), (0.5, 0.47, 2.1, 0), 'out'),
    ('card', 17, 18, E_AI + 1.4, E_AI + 2.1, 'lin', 'verdict', (6, -30, 3, 0, 0, 1.0), (3, -8, 0, 0, 0, 1.15), 'out'),
    ('world', 18, 19, E_AI + 2.1, E_AI + 2.8, 'lin', (0.5, 0.5, 1.1, -2), (0.5, 0.5, 1.2, 2), 'io'),
    # why
    ('card', 19, 21, 23.0, 23.8, 'lin', 'votes', (16, 0, 0, 0, 40, 0.86), (10, 0, 0, 0, -20, 0.92), 'out'),
    ('card', 21, 23, 23.8, 24.4, 'vel', 'votes-low', (4, -20, 2, 0, 0, 1.0), (2, -6, 0, 0, 0, 1.1), 'out'),
    ('card', 23, 25, 25.6, 26.2, 'lin', 'shap', (12, 18, -2, 0, 0, 0.9), (6, 6, 0, 0, -20, 0.98), 'out'),
    ('card', 25, 27, 26.2, 26.85, 'lin', 'shap-close', (2, -14, 1, 0, 0, 1.15), (0, -4, 0, 0, 0, 1.25), 'out'),
    # the second song
    ('card', 27, 28, 14.9, 15.28, 'lin', 'dropzone-2', (30, 10, -2, 0, 60, 0.9), (16, 2, 0, 0, 0, 1.05), 'out'),
    ('world', 28, 29, 15.3, 16.4, 'out', (0.5, 0.5, 1.08, 0), (0.5, 0.5, 1.16, 0), 'out'),
    ('world', 29, 31, 16.4, E_HUMAN - 0.02, 'out', (0.5, 0.5, 1.15, 0), (0.5, 0.5, 1.85, 0), 'in'),
    # drop two: human
    ('world', 31, 32, E_HUMAN, E_HUMAN + 0.68, 'lin', (0.5, 0.5, 1.08, 0), (0.5, 0.5, 1.14, 0), 'out'),
    ('world', 32, 33, E_HUMAN + 0.7, E_HUMAN + 1.3, 'lin', (0.5, 0.47, 1.9, 0), (0.5, 0.47, 2.1, 0), 'out'),
    ('split', 33, 99, E_AI + 1.0, 13.9, E_HUMAN + 1.3, E_HUMAN + 7.4),
]
IRIS = {6, 27}                               # shots that open as a widening circle
GRADE = [(-1, 15, 'warm'), (15, 19, 'ai'), (19, 27, 'warm'), (27, 31, 'cool'), (31, 33, 'human'), (33, 99, 'warm')]
LETTERBOX = [(14, 19), (30, 33)]
BLACKOUT = [15, 31]                           # the last frames before these beats go dark
# Hits: beat, zoom punch, shake px, colour split px, flash colour, flash amount, glitch
HITS = [(2, .03, 0, 2, None, 0, 0), (6, .03, 0, 2, None, 0, 0), (10, .08, 12, 5, CREAM, .25, 0),
        *[(b, .04, 3, 3, None, 0, 0) for b in (11, 12, 13, 14)],
        (15, .22, 28, 14, AMBER, .7, 1), (16, .05, 6, 4, None, 0, 0), (17, .05, 6, 4, None, 0, 0), (18, .05, 6, 4, None, 0, 0),
        *[(b, .03, 3, 2, None, 0, 0) for b in (19, 21, 23, 25, 27)],
        (28, .08, 12, 5, CREAM, .25, 0), (31, .2, 24, 12, GREEN, .55, 1), (32, .05, 6, 4, None, 0, 0),
        (33, .06, 8, 6, CREAM, .18, .5)]

# ── words ───────────────────────────────────────────────────────────────
LINES = [  # voice file, start, caption, colour per word
    ('hook', 0.12, 'AI can make a whole song now.', {'AI': AMBER}),
    ('ear', 2.95, "You can't tell by ear anymore.", {'ear': AMBER}),
    ('drop', 5.62, 'Drop the song on the world.', {'world.': AMBER}),
    ('vote', 7.60, 'Eleven models cast a vote.', {'Eleven': AMBER}),
    ('verdict', 9.36, 'And the verdict...', {}),
    ('why', k(23) + 0.1, 'It shows you why.', {'why.': AMBER}),
    ('person', 18.75, 'Did a person make this song, or an AI?', {'person': GREEN, 'AI?': AMBER}),
    ('bio', 24.35, 'Try it with your own song. Link in bio.', {'Link': AMBER, 'in': AMBER, 'bio.': AMBER}),
]
BIG = [(15, 16, 'AI', 300, AMBER), (31, 32, 'HUMAN', 190, GREEN)]
COUNTERS = [(16, 17, 81), (32, 33, 22)]
FACTS = [(18, 19, '9 OF 11 MODELS SAID AI')]
TAGS = [(15, 19, 'SAMPLE ANALYSIS', 250), (19, 23, '11 MODEL VOTES', 235), (23, 27, 'WHY IT SAID AI · SHAP', 235),
        (31, 33, 'SAMPLE ANALYSIS', 250)]


def syllables(word: str) -> int:
    return max(1, len(re.findall(r'[aeiouy]+', word.lower().removesuffix('e'))))


def load_voice(key: str):
    path = Path(args.voice) / f'{key}.wav'
    if not path.exists():
        return None
    y, _ = librosa.load(path, sr=SR, mono=True)
    return librosa.effects.trim(y, top_db=38)[0]


VOICE = {key: load_voice(key) for key, *_ in LINES}


# ── type ────────────────────────────────────────────────────────────────
_sprites: dict = {}


def sprite(text, font, size, colour, tracking=0.0, shadow=0.9):
    key = (text, font, size, colour, tracking, shadow)
    if key in _sprites:
        return _sprites[key]
    f = ImageFont.truetype(str(FONTS / FONT[font]), size)
    asc, desc = f.getmetrics()
    pad = int(size * 0.4)
    widths = [f.getlength(ch) for ch in text]
    tw = sum(widths) + tracking * size * (len(text) - 1) if tracking else f.getlength(text)
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


def plate(text):
    key = ('plate', text)
    if key in _sprites:
        return _sprites[key]
    f = ImageFont.truetype(str(FONTS / FONT['mono']), 30)
    tw = sum(f.getlength(ch) + 6 for ch in text) - 6
    asc, desc = f.getmetrics()
    img = Image.new('RGBA', (int(tw) + 60, asc + desc + 34), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, img.width - 1, img.height - 1), radius=18, fill=(12, 11, 10, 215), outline=(214, 171, 107, 90), width=2)
    x = 30
    for ch in text:
        d.text((x, 17), ch, font=f, fill=AMBER + (255,))
        x += f.getlength(ch) + 6
    _sprites[key] = np.asarray(img).copy()
    return _sprites[key]


def blit(frame, spr, cx, cy, alpha=1.0, scale=1.0, reveal=1.0):
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


def chunks(key, start, text, colours):
    """A line split into beats of one or two words, each with the time it appears."""
    v = VOICE[key]
    words = text.split()
    syl = np.array([syllables(w) for w in words], float)
    dur = len(v) / SR if v is not None else syl.sum() / 3.2
    at = start + dur * 0.95 * np.concatenate([[0], np.cumsum(syl)[:-1]]) / syl.sum() - 0.03
    out, cur = [], []
    for i, w in enumerate(words):
        loud = w in colours
        joins = loud and len(cur) == 1 and len(words[cur[0]]) <= 3 and words[cur[0]] not in colours
        if cur and not joins and (loud or len(cur) == 2 or words[cur[-1]] in colours):
            out.append(cur)
            cur = []
        cur.append(i)
    out.append(cur)
    return [([words[i] for i in c], at[c[0]]) for c in out], start + dur


CHUNKS = {key: chunks(key, start, text, colours) for key, start, text, colours in LINES}
TIMELINE = sorted((at, words, colours, CHUNKS[key][1]) for key, _, _, colours in LINES for words, at in CHUNKS[key][0])


def chunk_sprites(words, colours):
    """(sprite, inked width) per word."""
    parts = []
    for w in words:
        size = 112 if w in colours else 96
        spr = sprite(w.upper().strip('.?,'), 'display', size, colours[w], tracking=0.02) if w in colours else sprite(w, 'serif', size, CREAM)
        parts.append((spr, spr.shape[1] - 2 * int(size * 0.4)))
    return parts


def draw_words(frame, t):
    if any(k(b0) <= t < k(b1) for b0, b1, *_ in BIG + COUNTERS + FACTS):
        return
    y = 1470
    for n, (at, words, colours, end) in enumerate(TIMELINE):
        # one chunk at a time: the next one, from any line, takes over
        nxt = min(TIMELINE[n + 1][0] if n + 1 < len(TIMELINE) else END, end + 0.3)
        if at <= t < nxt:
            u = (t - at) / 0.13
            pop = 1.0 if u >= 1 else 1 + 0.2 * (1 - u) ** 2 - 0.06 * np.sin(np.pi * min(1.0, u))
            alpha = min(1.0, (t - at) / 0.05) * min(1.0, (nxt - t) / 0.06)
            parts = chunk_sprites(words, colours)
            gap = 30
            x = W / 2 - (sum(w for _, w in parts) + gap * (len(parts) - 1)) / 2 * pop
            for p, w in parts:
                blit(frame, p, x + w / 2 * pop, y, alpha=alpha, scale=pop)
                x += (w + gap) * pop
            return


def draw_type(frame, t):
    draw_words(frame, t)
    for b0, b1, text, size, colour in BIG:
        if k(b0) <= t < k(b1):
            u = (t - k(b0)) / (k(b1) - k(b0))
            e = 1 - (1 - min(1.0, u * 5)) ** 3
            blit(frame, sprite(text, 'display', size, colour, tracking=0.04), W / 2, 1450, scale=1.25 - 0.25 * e, reveal=min(1.0, u * 8))
    for b0, b1, target in COUNTERS:
        if k(b0) <= t < k(b1):
            u = (t - k(b0)) / 0.55
            n = int(round(target * (1 - (1 - min(1.0, u)) ** 3)))
            lock = 1.0 if u < 1 else 1 + 0.1 * np.exp(-(u - 1) * 8)
            blit(frame, sprite(f'{n}%', 'display', 290, CREAM, tracking=0.02), W / 2, 1440, scale=lock)
            blit(frame, sprite('AI PROBABILITY', 'mono', 34, CREAM, tracking=0.16), W / 2, 1640, alpha=min(1.0, u * 3) * 0.9)
    for b0, b1, text in FACTS:
        if k(b0) <= t < k(b1):
            u = (t - k(b0)) / (k(b1) - k(b0))
            blit(frame, sprite(text, 'mono', 42, AMBER, tracking=0.12), W / 2, 1470, reveal=min(1.0, u * 4))
    for b0, b1, text, y in TAGS:
        if k(b0) <= t < k(b1):
            a = np.clip((t - k(b0)) / 0.15, 0, 1) * np.clip((k(b1) - t) / 0.1, 0, 1)
            blit(frame, plate(text), W / 2, y, alpha=a)
    if t >= k(33):  # the two verdicts, then the end card over them
        u = t - k(33)
        e = lambda d: 1 - (1 - np.clip((u - d) / 0.3, 0, 1)) ** 3  # noqa: E731
        end = np.clip((t - k(35)) / 0.4, 0, 1)
        for x, word, colour, pct, d in ((W / 4, 'AI', AMBER, '81%', 0.0), (3 * W / 4, 'HUMAN', GREEN, '22%', 0.12)):
            blit(frame, sprite(word, 'display', 84, colour, tracking=0.04), x, 1340 - 30 * (1 - e(d)), alpha=e(d) * (1 - end))
            blit(frame, sprite(pct, 'display', 150, CREAM), x, 1480 - 30 * (1 - e(d + 0.06)), alpha=e(d + 0.06) * (1 - end))
        if end > 0:
            f = lambda d: 1 - (1 - np.clip((t - k(35) - d) / 0.4, 0, 1)) ** 3  # noqa: E731
            blit(frame, sprite('AURIS', 'display', 210, CREAM, tracking=0.02), W / 2, 760 - 20 * (1 - f(0)), alpha=f(0))
            blit(frame, sprite('Was this song made with AI?', 'serif', 60, AMBER), W / 2, 925, alpha=f(0.12))
            blit(frame, sprite('hasan-arthur-altuntas.xyz', 'mono', 34, CREAM, tracking=0.06), W / 2, 1040, alpha=f(0.24))
            blit(frame, sprite('free · no sign-up', 'serif', 42, MUTED), W / 2, 1105, alpha=f(0.3))


# ── the song's spectrum, for the ring around the world ─────────────────
def spectrum_frames() -> np.ndarray:
    y, sr = librosa.load(args.music, sr=22050, mono=True)
    hop = sr // FPS
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    f = librosa.fft_frequencies(sr=sr, n_fft=2048)
    edges = np.geomspace(45, 9000, 49)
    bins = [np.flatnonzero((f >= a) & (f < b)) if np.any((f >= a) & (f < b)) else [np.argmin(np.abs(f - a))]
            for a, b in zip(edges[:-1], edges[1:])]
    bands = np.stack([S[i].mean(0) for i in bins], 1)
    bands = np.log1p(bands * 20)
    bands /= np.percentile(bands, 98, axis=0, keepdims=True) + 1e-6
    out = np.zeros_like(bands)
    for i in range(len(bands)):  # fast attack, slow release
        prev = out[i - 1] if i else bands[0]
        out[i] = np.where(bands[i] > prev, bands[i], prev * 0.82 + bands[i] * 0.18)
    return np.clip(out, 0, 1.2)


SPECTRUM = spectrum_frames()


def halo(frame, fi, cx, cy, r, colour, strength=1.0):
    """Spectrum bars around the planet, mirrored left and right, added as light."""
    if fi >= len(SPECTRUM):
        return
    e = SPECTRUM[fi]
    layer = np.zeros((H, W, 3), np.float32)
    n = len(e)
    for side in (-1, 1):
        for i, v in enumerate(e):
            a = np.pi / 2 + side * (i + 0.5) / n * np.pi
            r0, r1 = r * 1.1, r * (1.14 + 0.55 * v)
            p0 = (int(cx + r0 * np.cos(a)), int(cy + r0 * np.sin(a)))
            p1 = (int(cx + r1 * np.cos(a)), int(cy + r1 * np.sin(a)))
            cv2.line(layer, p0, p1, colour[::-1], 3, cv2.LINE_AA)
    glow = cv2.GaussianBlur(cv2.resize(layer, (W // 4, H // 4)), (0, 0), 2.5)
    frame += (layer * 0.55 + cv2.resize(glow, (W, H)) * 0.9) * strength


# ── shots ───────────────────────────────────────────────────────────────
_masks: dict = {}


def card_mask(w, h, radius=26):
    key = (w, h)
    if key not in _masks:
        m = np.zeros((h, w), np.uint8)
        cv2.rectangle(m, (radius, 0), (w - radius, h), 255, -1)
        cv2.rectangle(m, (0, radius), (w, h - radius), 255, -1)
        for x, y in ((radius, radius), (w - radius - 1, radius), (radius, h - radius - 1), (w - radius - 1, h - radius - 1)):
            cv2.circle(m, (x, y), radius, 255, -1, cv2.LINE_AA)
        edge = m.astype(np.float32) / 255 - cv2.erode(m, np.ones((5, 5), np.uint8)).astype(np.float32) / 255
        _masks[key] = (m.astype(np.float32) / 255, edge)
    return _masks[key]


def rot(rx, ry, rz):
    x, y, z = np.deg2rad([rx, ry, rz])
    Rx = np.array([[1, 0, 0], [0, np.cos(x), -np.sin(x)], [0, np.sin(x), np.cos(x)]])
    Ry = np.array([[np.cos(y), 0, np.sin(y)], [0, 1, 0], [-np.sin(y), 0, np.cos(y)]])
    Rz = np.array([[np.cos(z), -np.sin(z), 0], [np.sin(z), np.cos(z), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


def source_time(spec, t):
    b0, b1, s0, s1, ease = spec[1], spec[2], spec[3], spec[4], spec[5]
    u = np.clip((t - k(b0)) / (k(b1) - k(b0)), 0, 1)
    return s0 + (s1 - s0) * EASE[ease](u), u


def sample(angle, spec, t):
    """A source frame, blurred along time where the shot runs fast."""
    src, _ = source_time(spec, t)
    ahead, _ = source_time(spec, t + 1 / FPS)
    speed = (ahead - src) * FPS
    if speed < 1.6:
        return FOOT[angle].at(src)
    taps = [FOOT[angle].at(src - j * (speed / FPS) / 3).astype(np.float32) for j in range(3)]
    return np.mean(taps, axis=0).astype(np.uint8)


def shot_world(spec, t, fi, zoom, dx, dy):
    _, u = source_time(spec, t)
    fe = EASE[spec[8]](u)
    cx, cy, z, rz = (a + (b - a) * fe for a, b in zip(spec[6], spec[7]))
    img, m = view(sample('world', spec, t), cx, cy, z * zoom, rz=rz, dx=dx, dy=dy)
    pc = m @ np.array([0.5 * SRC_W, 0.5 * FOOT['world'].at(0).shape[0], 1.0])
    return img, (pc[0], pc[1], PLANET_R * W * z * zoom)


def shot_card(spec, t, zoom, dx, dy):
    src, u = source_time(spec, t)
    x0, y0, x1, y1 = REGION[spec[6]]
    ui = sample('ui', spec, t)
    h, w = ui.shape[:2]
    crop = ui[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]
    cw = 900
    ch = int(cw * crop.shape[0] / crop.shape[1])
    card = cv2.resize(crop, (cw, ch), interpolation=cv2.INTER_AREA).astype(np.float32)
    mask, edge = card_mask(cw, ch)
    # a slow sheen across the glass, and a hairline edge
    gx = np.linspace(0, 1, cw)[None, :] + np.linspace(0, 0.6, ch)[:, None]
    card += (np.clip(1 - np.abs(gx - (0.2 + 1.1 * u)) * 5, 0, 1) * 14)[..., None]
    card = card * (1 - edge[..., None] * 0.6) + np.array(AMBER[::-1], np.float32) * edge[..., None] * 0.6
    pe = EASE[spec[9]](u)
    rx, ry, rz, tx, ty, sc = (a + (b - a) * pe for a, b in zip(spec[7], spec[8]))
    sc *= zoom
    F = 1500.0
    corners = np.array([[-cw / 2, -ch / 2, 0], [cw / 2, -ch / 2, 0], [cw / 2, ch / 2, 0], [-cw / 2, ch / 2, 0]]) * sc
    p = corners @ rot(rx, ry, rz).T
    z = p[:, 2] + F
    dst = np.stack([W / 2 + tx + dx + F * p[:, 0] / z, H / 2 + ty + dy + F * p[:, 1] / z], 1).astype(np.float32)
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]]), dst)
    face = cv2.warpPerspective(card, M, (W, H), flags=cv2.INTER_LINEAR)
    a = cv2.warpPerspective(mask, M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
    # behind the card: the world at the same moment, out of focus
    bg = FOOT['world'].at(src)
    bg = cv2.resize(bg, (W // 6, H // 6), interpolation=cv2.INTER_AREA)
    bg = cv2.resize(cv2.GaussianBlur(bg, (0, 0), 3), (W, H)).astype(np.float32) * 0.42
    shadow = cv2.GaussianBlur(cv2.resize(a, (W // 4, H // 4)), (0, 0), 7)
    shadow = cv2.resize(shadow, (W, H))
    shadow = np.roll(shadow, 40, axis=0)[..., None]
    bg *= 1 - 0.6 * shadow
    return bg * (1 - a) + face * a


def shot_split(spec, t, fi):
    u = t - k(spec[1])
    span = k(args.end_beat) - k(spec[1])
    out = np.zeros((H, W, 3), np.float32)
    for side, (s0, s1) in enumerate(((spec[3], spec[4]), (spec[5], spec[6]))):
        src = s0 + (s1 - s0) * min(1.0, u / span)
        img, _ = view(FOOT['world'].at(src), 0.5, 0.5, 1.08 + 0.05 * u / span, ow=W // 2, oh=H)
        out[:, side * W // 2:(side + 1) * W // 2] = img
    # the seam: a line that draws itself down the middle
    grow = int(H * min(1.0, u / 0.35))
    out[:grow, W // 2 - 2:W // 2 + 2] = np.array(CREAM[::-1], np.float32) * 0.85
    return out


def shot_at(t):
    for i, s in enumerate(CUT):
        if k(s[1]) <= t < k(s[2]):
            return i, s
    return len(CUT) - 1, CUT[-1]


def render_shot(i, spec, t, fi, zoom, dx, dy):
    kind = spec[0]
    if kind == 'world':
        img, planet = shot_world(spec, t, fi, zoom, dx, dy)
        return img, planet
    if kind == 'card':
        return shot_card(spec, t, zoom, dx, dy), None
    return shot_split(spec, t, fi), None


# ── look ────────────────────────────────────────────────────────────────
def lut(r, g, bl):
    x = np.arange(256) / 255
    y = 0.5 + (x - 0.5) * 1.08
    y = y * y * (3 - 2 * y) * 0.3 + y * 0.7
    y = 0.016 + 0.984 * np.clip(y, 0, 1)
    return np.stack([np.clip(y * c, 0, 1) * 255 for c in (bl, g, r)], axis=-1).astype(np.uint8).reshape(256, 1, 3)


LUTS = {'warm': lut(1.02, 1.0, 0.95), 'ai': lut(1.08, 1.0, 0.86), 'human': lut(0.94, 1.05, 1.02), 'cool': lut(0.97, 1.0, 1.03)}
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIGNETTE = 1 - 0.4 * np.clip(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2, 0, 1) ** 1.3
CAPTION = np.exp(-((yy - 1470) / 230) ** 2)


def env(t, t0, decay):
    return float(np.exp(-(t - t0) / decay)) if t >= t0 else 0.0


def wobble(t, seed):
    return np.sin(t * 51 + seed) * 0.6 + np.sin(t * 87 + seed * 2.3) * 0.4


def glitch(img, fi, amount):
    rng = np.random.default_rng(fi * 7 + 3)
    y = 0
    while y < H:
        h = int(rng.integers(18, 140))
        if rng.random() < 0.55:
            img[y:y + h] = np.roll(img[y:y + h], int(rng.integers(-60, 60) * amount), axis=1)
        y += h
    return img


def render(fi):
    t = fi / FPS
    i, spec = shot_at(t)
    zoom = 1.0
    shake = split = flash = 0.0
    flash_colour, glitchy = None, 0.0
    for b, zp, sh, sp, fc, fa, gl in HITS:
        zoom += zp * env(t, k(b), 0.11)
        shake += sh * env(t, k(b), 0.22)
        split += sp * env(t, k(b), 0.16)
        glitchy = max(glitchy, gl * (1.0 if 0 <= t - k(b) < 0.12 else 0.0))
        if fc and fa * env(t, k(b), 0.12) > flash:
            flash, flash_colour = fa * env(t, k(b), 0.12), fc
    dx, dy = shake * wobble(t, 1.0), shake * wobble(t, 4.0)
    img, planet = render_shot(i, spec, t, fi, zoom, dx, dy)

    if i in IRIS and t - k(spec[1]) < 0.25:  # open from the previous shot as a widening circle
        u = (t - k(spec[1])) / 0.25
        prev, _ = render_shot(i - 1, CUT[i - 1], t, fi, zoom, dx, dy)
        r = (1 - (1 - u) ** 3) * 1150
        d = np.sqrt((xx - W / 2) ** 2 + (yy - H / 2) ** 2)
        m = np.clip((r - d) / 14, 0, 1)[..., None]
        img = prev * (1 - m) + img * m
        ring = np.clip(1 - np.abs(d - r) / 5, 0, 1)[..., None]
        img = img * (1 - ring) + np.array(AMBER[::-1], np.float32) * ring

    grade = next(g for g0, g1, g in GRADE if k(g0) <= t < k(g1))
    if planet is not None:
        colour = {'ai': AMBER, 'human': GREEN, 'cool': GREEN}.get(grade, AMBER)
        halo(img, fi, *planet, colour, strength=0.8 if grade in ('ai', 'human') else 0.55)
    img = cv2.LUT(np.clip(img, 0, 255).astype(np.uint8), LUTS[grade]).astype(np.float32)

    # bloom on highlights
    hi = np.clip(img - 170, 0, None)
    hi = cv2.resize(cv2.GaussianBlur(cv2.resize(hi, (W // 4, H // 4)), (0, 0), 5), (W, H))
    img += hi * 0.45

    s = int(round(split))
    if s:
        img[..., 0] = np.roll(img[..., 0], s, axis=1)
        img[..., 2] = np.roll(img[..., 2], -s, axis=1)
    if glitchy:
        img = glitch(img, fi, glitchy)

    light = VIGNETTE.copy()
    if any(start - 0.05 <= t < CHUNKS[key][1] + 0.35 for key, start, _, _ in LINES) or any(k(b0) <= t < k(b1) for b0, b1, *_ in BIG + COUNTERS + FACTS):
        light *= 1 - 0.55 * CAPTION
    dim = 1.0
    for b in BLACKOUT:
        if k(b) - P / 2 <= t < k(b):
            dim *= 1 - 0.9 * ((t - (k(b) - P / 2)) / (P / 2)) ** 1.6
    if t < 0.12:
        dim *= t / 0.12
    if t >= k(35):
        dim *= 1 - 0.55 * min(1.0, (t - k(35)) / 0.4)
    if t > END - 0.35:
        dim *= max(0.0, (END - t) / 0.35)
    img *= (light * dim)[..., None]
    if flash_colour:
        img = img * (1 - flash) + np.array(flash_colour[::-1], np.float32) * flash

    for b0, b1 in LETTERBOX:  # bars slide in for the verdicts
        if k(b0) - 0.2 <= t < k(b1) + 0.2:
            e = min(np.clip((t - (k(b0) - 0.2)) / 0.2, 0, 1), np.clip((k(b1) + 0.2 - t) / 0.2, 0, 1))
            bar = int(170 * (1 - (1 - e) ** 3))
            if bar:
                img[:bar] *= 0.04
                img[H - bar:] *= 0.04
                img[bar - 1:bar] = np.array(AMBER[::-1], np.float32) * 0.35
                img[H - bar:H - bar + 1] = np.array(AMBER[::-1], np.float32) * 0.35

    grain = np.random.default_rng(fi).normal(0, 4.0, (H // 2, W // 2)).astype(np.float32)
    img += cv2.resize(grain, (W, H), interpolation=cv2.INTER_NEAREST)[..., None]
    draw_type(img, t)
    return np.clip(img, 0, 255).astype(np.uint8)


# ── sound ───────────────────────────────────────────────────────────────
TOTAL = int(END * SR)
tt = np.arange(TOTAL) / SR
rng = np.random.default_rng(20260928)


def fit(x):
    out = np.zeros(TOTAL)
    out[:min(TOTAL, len(x))] = x[:TOTAL]
    return out


def voice_track():
    out = np.zeros(TOTAL)
    room = rng.standard_normal(int(0.3 * SR)) * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.07)
    for key, start, _, _ in LINES:
        v = VOICE[key]
        if v is None:
            continue
        v = sosfilt(butter(2, 90, 'high', fs=SR, output='sos'), v)
        v = v + 0.3 * sosfilt(butter(2, [2300, 5200], 'band', fs=SR, output='sos'), v)
        v = v + 0.15 * sosfilt(butter(2, 180, 'low', fs=SR, output='sos'), v)
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


def music_track():
    y, _ = librosa.load(args.music, sr=SR, mono=False)
    y = np.atleast_2d(y)
    if y.shape[0] == 1:
        y = np.vstack([y, y])
    y = np.stack([fit(c) for c in y])
    return y * np.clip((END - tt) / 0.9, 0, 1)


def sfx_track():
    out = np.zeros(TOTAL)
    noise = rng.standard_normal(TOTAL)

    def envelope(t0, attack, decay):
        return np.clip((tt - t0 + attack) / attack, 0, 1) * np.exp(-np.maximum(0, tt - t0) / decay)

    def whoosh(t_peak, dur=0.35, g=0.14):
        i0, i1 = max(0, int((t_peak - dur) * SR)), min(TOTAL, int((t_peak + 0.12) * SR))
        seg = noise[i0:i1]
        x = np.linspace(0, 1, len(seg))
        lo = sosfilt(butter(2, [300, 1400], 'band', fs=SR, output='sos'), seg)
        hi = sosfilt(butter(2, [1400, 7000], 'band', fs=SR, output='sos'), seg)
        knee = dur / (dur + 0.12)
        shape = np.where(x < knee, (x / knee) ** 2, np.exp(-(x - knee) * 30))
        out[i0:i1] += (lo * (1 - x) + hi * x) * shape * g

    def impact(t0, g=1.0, low=48):
        sweep = low + 60 * np.exp(-np.maximum(0, tt - t0) / 0.05)
        out[:] += np.sin(2 * np.pi * np.cumsum(sweep) / SR) * envelope(t0, 0.003, 0.6) * 0.55 * g
        out[:] += sosfilt(butter(2, 2500, 'high', fs=SR, output='sos'), noise) * envelope(t0, 0.001, 0.03) * 0.25 * g
        out[:] += sosfilt(butter(2, 400, 'low', fs=SR, output='sos'), noise) * envelope(t0, 0.002, 0.18) * 0.5 * g

    def crackle(t0, g=0.12):  # the glitch: three short digital bursts
        for j, d in enumerate((0.0, 0.045, 0.1)):
            burst = np.sign(np.sin(2 * np.pi * (900 + 400 * j) * tt)) * envelope(t0 + d, 0.001, 0.018)
            out[:] += burst * g

    def click(t0, g=0.07):
        out[:] += sosfilt(butter(2, [2500, 6500], 'band', fs=SR, output='sos'), noise) * envelope(t0, 0.001, 0.006) * g * 3
        out[:] += np.sin(2 * np.pi * 1850 * tt) * envelope(t0, 0.001, 0.02) * g

    def riser(t0, t1, g=0.15):
        i0, i1 = int(t0 * SR), int(t1 * SR)
        seg = noise[i0:i1]
        rise = np.zeros_like(seg)
        for c in range(12):
            a, z = int(c / 12 * len(seg)), int((c + 1) / 12 * len(seg))
            centre = 400 * (7000 / 400) ** ((c + 0.5) / 12)
            rise[a:z] = sosfilt(butter(2, [centre * 0.7, centre * 1.4], 'band', fs=SR, output='sos'), seg[a:z])
        out[i0:i1] += rise * np.linspace(0, 1, len(seg)) ** 2.2 * g

    def bell(t0, notes, g=0.04):
        for m in notes:
            fq = 440 * 2 ** ((m - 69) / 12)
            for ratio, w, dec in ((1, 1.0, 1.2), (2.0, 0.25, 0.6), (2.76, 0.15, 0.4)):
                out[:] += np.sin(2 * np.pi * fq * ratio * tt) * envelope(t0, 0.004, dec) * w * g

    for b in (2, 6, 11, 13, 17, 19, 21, 23, 25, 27, 33):
        whoosh(k(b) - 0.01)
    impact(k(10), 0.45, 70)
    impact(k(28), 0.45, 70)
    for b in (11, 12, 13, 14):
        for j in range(3):
            click(k(b) + j * P / 3)
    riser(k(13), k(15))
    riser(k(29.5), k(31), 0.13)
    for b in (15, 31):
        impact(k(b), 1.0, 44)
        crackle(k(b))
    for b in (16, 32):  # the counters tick as they climb
        for j in range(22):
            click(k(b) + 0.55 * (1 - (1 - j / 22) ** 0.5), 0.035)
    bell(k(31) + 0.02, (74, 78, 81, 85), 0.03)
    bell(k(35) + 0.05, (62, 69, 74), 0.035)
    return out


def master(x, rms_db):
    win = int(0.4 * SR)
    loud = np.sqrt(np.convolve(np.mean(x ** 2, axis=0), np.ones(win) / win, 'same')).max()
    x = x / loud * 10 ** (rms_db / 20)
    x = np.tanh(x * 1.15) / np.tanh(1.15)
    return x / max(1.0, np.abs(x).max() / 0.89)


def write_wav(path, x):
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x.T * 32767).astype(np.int16).tobytes())


def main():
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    if args.stills:
        tiles = []
        for t in [float(v) for v in args.stills.split(',')]:
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
                            '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-maxrate', '14M',
                            '-bufsize', '28M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', str(silent)], stdin=subprocess.PIPE)
    for fi in range(N):
        enc.stdin.write(render(fi).tobytes())
        if fi % 60 == 0:
            print(f'{fi}/{N}', flush=True)
    enc.stdin.close()
    if enc.wait():
        raise SystemExit('ffmpeg failed')

    voice, sfx, music = voice_track(), sfx_track(), music_track()
    active = np.convolve(np.abs(voice), np.ones(1440) / 1440, 'same')
    duck = np.convolve(1 - 0.6 * np.clip(active / 0.02, 0, 1), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
    with_song = music * duck + np.vstack([voice, voice]) + np.vstack([sfx, sfx])
    no_song = np.vstack([voice, voice]) + np.vstack([sfx, sfx]) * 0.8
    wav_song, wav_bare = out.with_name(out.stem + '.wav'), out.with_name(out.stem + '-nomusic.wav')
    write_wav(wav_song, master(with_song, -11.0))
    write_wav(wav_bare, master(no_song, -15.0))
    for wav, dst in ((wav_song, out), (wav_bare, out.with_name(out.stem + '-nomusic.mp4'))):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(silent), '-i', str(wav), '-c:v', 'copy',
                        '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', str(dst)], check=True)
        wav.unlink()
        print(dst)
    silent.unlink()
    # a lighter copy that fits a phone upload
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(out), '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
                    '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart',
                    str(out.with_name(out.stem + '-preview.mp4'))], check=True)
    print(out.with_name(out.stem + '-preview.mp4'))


if __name__ == '__main__':
    main()
