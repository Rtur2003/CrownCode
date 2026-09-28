"""Release promos for the music site: one 9:16 edit per record, cut to the record itself.

Each promo is 16.8 s of the release's own audio (a single's strongest stretch,
or three or four tracks of an album or EP joined with crossfades), and five
scenes in the site's look (dark, warm, Bricolage Grotesque, a vinyl behind the
sleeve):
  1. the drop: a thin line listens in the dark, the sleeve lands on the first
     big hit and a record slides out from behind it and starts to turn
  2. the name: a single's title word by word, or an album's tracklist with the
     playing track lit (an EP whose titles make a sentence gets the words)
  3. the sleeve up close: detail shots of the cover, cut on hits
  4. on the site: the camera pushes in on the record's card on the music site
  5. out now: sleeve, title, "Listen on Spotify", the address

Inputs come from a manifest (see assets-src/video/music/promos.json): per
release a title, kind, year, cover, the site card title (screenshots from
capture-release-cards.py) and audio parts {file, start, sec[, label, no]}.

Usage (from platform/):
  python scripts/edit-release-promo.py --manifest assets-src/video/music/promos.json [--key before-dawn ...] [--stills 1,5,9]
Writes <manifest dir>/out/<key>-promo.mp4 and <key>-promo-phone.mp4.
"""
import argparse
import json
import textwrap
from pathlib import Path

import cv2
import numpy as np

from reelkit import audio, look, props, render, sound
from reelkit import type as tp
from reelkit.core import EASE, FPS, H, W, card, clamp, env, view, wobble

parser = argparse.ArgumentParser()
parser.add_argument('--manifest', required=True)
parser.add_argument('--key', action='append', default=[])
parser.add_argument('--stills')
args = parser.parse_args()

MAN_PATH = Path(args.manifest).resolve()
M = MAN_PATH.parent
MAN = json.loads(MAN_PATH.read_text(encoding='utf-8'))
CARDS = json.loads((M / 'site' / 'cards.json').read_text(encoding='utf-8'))
OUT = M / 'out'

# the site's faces
tp.register('display', M / 'fonts' / 'bricolage-800.woff')
tp.register('body', M / 'fonts' / 'bricolage-500.woff')
tp.register('italic', M / 'fonts' / 'newsreader-italic.woff')
CREAM = (243, 234, 216)
INK = (22, 17, 12)
LENGTH = 16.8
FADE = 0.3


def fit_lines(text, font, max_width, sizes=(150, 132, 116, 104, 92, 82, 72), max_lines=3):
    """The largest size at which `text` wraps into at most `max_lines` lines of `max_width`."""
    for size in sizes:
        words, lines, cur = text.split(), [], ''
        for w in words:
            trial = (cur + ' ' + w).strip()
            if tp.ink_width(tp.sprite(trial, font, size, CREAM), size) <= max_width:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        lines.append(cur)
        if len(lines) <= max_lines and all(tp.ink_width(tp.sprite(line, font, size, CREAM), size) <= max_width for line in lines):
            return size, lines
    return sizes[-1], textwrap.wrap(text, 18)


class Promo:
    def __init__(self, spec):
        self.spec = spec
        self.key = spec['key']
        cover = cv2.imread(str(M / spec['cover']))
        self.cover = cv2.resize(cover, (1000, 1000), interpolation=cv2.INTER_AREA)
        self.accent = look.accent_from(self.cover)                  # BGR
        self.accent_rgb = tuple(self.accent[::-1])
        # audio: the parts joined, a breath of fade in, a longer fade out
        parts = [(audio.section(Path(p['file']) if Path(p['file']).is_absolute() else M / p['file'], p['start'], p['sec'] + FADE), p['sec'])
                 for p in spec['parts']]
        self.mix, self.starts = audio.stitch(parts, FADE)
        n = self.mix.shape[1]
        t = np.arange(n) / sound.SR
        self.mix *= np.clip(t / 0.05, 0, 1) * np.clip((LENGTH - t) / 0.8, 0, 1)
        self.hits = audio.hits(self.mix)
        self.bands = audio.spectrum(self.mix)
        self.loud = audio.loudness(self.mix)
        self.group = len(spec['parts']) > 1
        self.words = bool(spec.get('words'))
        # the site shot
        c = CARDS[spec['card']]
        self.site = cv2.imread(str(M / 'site' / c['file']))
        self.site_box = c['box']
        # a record with the sleeve as its label, and a blurred sleeve for the ground
        self.discs = {}
        big = cv2.resize(self.cover, (W // 5, W // 5), interpolation=cv2.INTER_AREA)
        big = cv2.GaussianBlur(big, (0, 0), 6)
        self.ground = cv2.resize(big, (int(W * 1.35), int(W * 1.35)), interpolation=cv2.INTER_LINEAR).astype(np.float32)
        self.details = self.pick_details(3)
        self.plan()

    def disc(self, size):
        if size not in self.discs:
            lab = cv2.cvtColor(self.cover, cv2.COLOR_BGR2BGRA)
            self.discs[size] = props.vinyl_disc(size, lab)
        return self.discs[size]

    def pick_details(self, count):
        """Busy parts of the sleeve, far enough apart to feel like different shots."""
        g = cv2.cvtColor(self.cover, cv2.COLOR_BGR2GRAY).astype(np.float32)
        lap = np.abs(cv2.Laplacian(g, cv2.CV_32F))
        cands = []
        for cy in np.linspace(0.3, 0.7, 5):
            for cx in np.linspace(0.3, 0.7, 5):
                x0, y0 = int((cx - 0.2) * 1000), int((cy - 0.2) * 1000)
                cands.append((float(lap[y0:y0 + 400, x0:x0 + 400].mean()), cx, cy))
        cands.sort(reverse=True)
        picked = []
        for s, cx, cy in cands:
            if all(np.hypot(cx - px, cy - py) > 0.22 for _, px, py in picked):
                picked.append((s, cx, cy))
            if len(picked) == count:
                break
        return [(cx, cy) for _, cx, cy in picked] or [(0.5, 0.5)]

    def snap(self, t, reach=0.3):
        return audio.snap(t, self.hits, reach)

    def plan(self):
        s = self.starts
        self.slam = self.snap(0.3, 0.3)
        if not self.group:
            self.b0, self.c0, self.d0, self.e0 = 2.4, self.snap(6.4), self.snap(10.4), 12.6
            self.cuts = [self.c0, self.snap(7.75), self.snap(9.1)]
        else:
            self.b0 = 2.4
            self.c0 = self.snap(s[-1] + 1.2)
            self.cuts = [self.c0, self.snap(self.c0 + 0.6)]
            self.d0 = self.c0 + 1.2
            self.e0 = self.d0 + 1.6

    # ── scenes ──────────────────────────────────────────────────────────
    def ground_frame(self, t, dim=0.42):
        drift = 0.5 + 0.03 * np.sin(t * 0.4)
        img, _ = view(self.ground, drift, 0.5, H / W * 1.02)  # fills the height of a square
        return img * dim

    def glow(self, img, cx, cy, radius, strength):
        yy, xx = look.yy, look.xx
        g = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * radius ** 2)))[..., None]
        return img + np.array(self.accent, np.float32) * g * strength

    def sleeve(self, img, cx, cy, size, pose=(0, 0, 0), pulse=0.0, alpha=1.0):
        rx, ry, rz = pose
        return card(self.cover, (rx, ry, rz, cx - W / 2, cy - H / 2, (size / 900) * (1 + pulse)), img, width=900, radius=14,
                    edge=None, shadow=0.55, alpha=alpha)

    def record(self, img, cx, cy, size, t, alpha=1.0):
        size = int(round(size / 20) * 20)  # a few sizes, drawn once each
        props.place_vinyl(img, self.disc(size), cx, cy, -t * 200, alpha)

    def pulse(self, t):
        return 0.018 * sum(env(t, h, 0.12) for h in self.hits if h <= t)

    def scene_hook(self, t, fi):
        img = np.zeros((H, W, 3), np.float32)
        if t < self.slam:  # before the hit: a line listening in the dark
            e = self.bands[min(fi, len(self.bands) - 1)]
            props.bars(img, e[::2], 240, 840, H * 0.5, 40, self.accent, alpha=0.7 * clamp(t / 0.3))
            return img
        u = t - self.slam
        img = self.ground_frame(t) * clamp(u / 0.25)
        slide = EASE['out'](clamp(u / 0.6))
        size = 720
        self.layout_sleeve(img, t, fi, (540, 900), size, 540 + 250 * slide, scale_in=clamp(u / 0.22))
        return img

    def layout_sleeve(self, img, t, fi, centre, size, disc_x, scale_in=1.0, pose=(0, 0, 0)):
        cx, cy = centre
        loud = self.loud[min(fi, len(self.loud) - 1)]
        img[:] = self.glow(img, cx, cy, size * 0.55, 0.18 + 0.35 * loud)
        self.record(img, disc_x, cy, int(size * 0.96), t, alpha=clamp(scale_in * 1.5))
        s = size * (1.14 - 0.14 * EASE['out'](scale_in))
        self.sleeve(img, cx, cy, s, pose, self.pulse(t))

    def scene_single(self, t, fi):
        img = self.ground_frame(t)
        m = EASE['soft'](clamp((t - self.b0) / 0.6))
        size = 720 - 150 * m
        cy = 900 - 230 * m
        self.layout_sleeve(img, t, fi, (540, cy), size, 540 + 250 - 60 * m)
        return img

    def scene_group(self, t, fi):
        img = self.ground_frame(t)
        m = EASE['soft'](clamp((t - self.b0) / 0.6))
        size = 720 - 300 * m
        cx = 540 - 250 * m
        cy = 900 - 330 * m
        self.layout_sleeve(img, t, fi, (cx, cy), size, cx + 250 - 40 * m, pose=(0, -10 * m, 0))
        return img

    def scene_detail(self, t, fi):
        i = max(k for k, c in enumerate(self.cuts) if t >= c)
        span = (self.cuts[i + 1] if i + 1 < len(self.cuts) else self.d0) - self.cuts[i]
        u = clamp((t - self.cuts[i]) / span)
        if i == 1:  # the record, close enough to see the grooves turn
            img = self.ground_frame(t, 0.25)
            loud = self.loud[min(fi, len(self.loud) - 1)]
            img = self.glow(img, 700, 980, 700, 0.12 + 0.25 * loud)
            props.place_vinyl(img, self.disc(1800), 760 - 60 * u, 960, -t * 200, 1.0, sheen=0.9)
            return img
        cx, cy = self.details[i % len(self.details)]
        z = 2.3 + 0.3 * EASE['soft'](u)
        half = H / (W / 1000 * z) / 1000 / 2      # half the visible height, as a share of the sleeve
        cy = min(max(cy, half), 1 - half)
        drift = (u - 0.5) * 0.04 * (1 if i % 2 else -1)
        img, _ = view(self.cover, cx + drift, cy, z)
        return img

    def scene_site(self, t, fi):
        u = EASE['soft'](clamp((t - self.d0) / (self.e0 - self.d0 + 0.3)))
        x0, y0, x1, y1 = self.site_box
        bw = x1 - x0
        z1 = min(2.2, 0.72 / bw)
        cx = 0.5 + ((x0 + x1) / 2 - 0.5) * u
        cy = 0.5 + ((y0 + y1) / 2 - 0.5) * u
        z = 1.0 + (z1 - 1.0) * u
        img, m = view(self.site, cx, cy, z)
        # a ring around the card, pulsing once it is close
        p0 = m @ np.array([x0 * self.site.shape[1], y0 * self.site.shape[0], 1.0])
        p1 = m @ np.array([x1 * self.site.shape[1], y1 * self.site.shape[0], 1.0])
        ring = clamp((u - 0.45) / 0.3)
        if ring > 0:
            pad = 10 + 8 * np.sin((t - self.d0) * 9) ** 2
            cv2.rectangle(img, (int(p0[0] - pad), int(p0[1] - pad)), (int(p1[0] + pad), int(p1[1] + pad)),
                          tuple(float(c) * ring for c in self.accent), 5, cv2.LINE_AA)
        return img

    def scene_end(self, t, fi):
        img = self.ground_frame(t, 0.5)
        u = clamp((t - self.e0) / 0.5)
        self.layout_sleeve(img, t, fi, (540, 690), 600, 540 + 210, scale_in=1.0)
        return img * (0.6 + 0.4 * u)

    # ── type ────────────────────────────────────────────────────────────
    def type_top(self, img, t):
        a = clamp((t - self.slam - 0.15) / 0.3) * (1 - clamp((t - self.c0 + 0.1) / 0.1)) if t < self.e0 else clamp((t - self.e0) / 0.4)
        if a <= 0:
            return
        name = tp.sprite(MAN['artist'], 'body', 42, CREAM)
        tp.blit(img, name, 70 - tp.pad_of(42), 250, alpha=a, anchor='left')
        dot_x = 70 + tp.ink_width(name, 42) + 10
        colour = [float(c * a + img[262, int(dot_x), k] * (1 - a)) for k, c in enumerate(self.accent)]
        cv2.circle(img, (int(dot_x), 262), 7, colour, -1, cv2.LINE_AA)
        spec = self.spec
        kind = f"{spec['kind']} · {spec['year']}" + (f" · {spec['tracks']} TRACKS" if spec.get('tracks') else '')
        tp.blit(img, tp.sprite(kind, 'mono', 26, self.accent_rgb, tracking=0.16), 70 - tp.pad_of(26), 312, alpha=a, anchor='left')

    def type_title(self, img, t, y_top, max_lines=3, reveal_from=None):
        spec = self.spec
        size, lines = fit_lines(spec['title'], 'display', 940, max_lines=max_lines)
        y = y_top
        if spec.get('over'):
            a = clamp((t - (reveal_from or 0)) / 0.3)
            tp.blit(img, tp.sprite(spec['over'], 'mono', 28, self.accent_rgb, tracking=0.16), 70 - tp.pad_of(28), y, alpha=a, anchor='left')
            y += 70
        k = 0
        for line in lines:
            words = line.split()
            x = 70
            for w in words:
                spr = tp.sprite(w, 'display', size, CREAM, tracking=-0.01)
                at = (reveal_from or 0) + 0.12 * k
                rise = EASE['out'](clamp((t - at) / 0.3))
                tp.blit(img, spr, x - tp.pad_of(size), y + size * 0.55 + 30 * (1 - rise), alpha=clamp((t - at) / 0.1), rise=rise, anchor='left')
                x += tp.ink_width(spr, size) + size * 0.24
                k += 1
            y += size * 0.98
        return y + size * 0.15

    def type_single(self, img, t, fi):
        y = self.type_title(img, t, 1150, reveal_from=self.b0 + 0.25)
        a = clamp((t - self.b0 - 0.9) / 0.4)
        tp.blit(img, tp.sprite(self.spec['tagline'], 'italic', 50, CREAM), 70 - tp.pad_of(50), y + 30, alpha=a * 0.9, anchor='left')
        e = self.bands[min(fi, len(self.bands) - 1)]
        props.bars(img, e[::2], 70, 1010, 1640, 70, self.accent, alpha=0.8 * a)

    def type_group(self, img, t, fi):
        spec = self.spec
        if self.words:
            return self.type_words(img, t, fi)
        y = self.type_title(img, t, 840, max_lines=2, reveal_from=self.b0 + 0.2)
        y = max(y, 1000)
        rows = spec['parts']
        live = max(i for i, s in enumerate(self.starts) if t >= s)
        for i, part in enumerate(rows):
            ry = y + 40 + i * 104
            on = clamp((t - (self.b0 + 0.35 + 0.08 * i)) / 0.3)
            if on <= 0:
                continue
            active = i == live
            since = t - max(self.starts[i], self.b0)
            if active:  # a lit bar behind the playing track
                grow = EASE['out'](clamp(since / 0.25))
                x1 = int(70 + 940 * grow)
                over = img[int(ry - 44):int(ry + 44), 58:x1]
                over[:] = over * 0.82 + np.array(self.accent, np.float32) * 0.18
                e = self.bands[min(fi, len(self.bands) - 1)]
                for j in range(3):
                    h = int(8 + 30 * min(1.0, e[6 + j * 9]))
                    cv2.line(img, (970 + j * 14, int(ry + 16)), (970 + j * 14, int(ry + 16 - h)), self.accent, 6, cv2.LINE_AA)
            a = on * (1.0 if active else 0.4)
            tp.blit(img, tp.sprite(f"{part.get('no') or i + 1:02d}", 'mono', 30, self.accent_rgb), 70 - tp.pad_of(30), ry, alpha=a, anchor='left')
            size = tp.fit(part['label'], 'body', 48, 760)
            tp.blit(img, tp.sprite(part['label'], 'body', size, CREAM), 150 - tp.pad_of(size), ry, alpha=a, anchor='left')
        if spec.get('tracks') and spec['tracks'] > len(rows):
            more = f"+ {spec['tracks'] - len(rows)} MORE"
            tp.blit(img, tp.sprite(more, 'mono', 26, CREAM, tracking=0.16), 150 - tp.pad_of(26), y + 40 + len(rows) * 104 - 10,
                    alpha=0.45 * clamp((t - self.b0 - 0.8) / 0.3), anchor='left')

    def type_words(self, img, t, fi):
        """together: the titles are a sentence, so each track gets its word."""
        live = max(i for i, s in enumerate(self.starts) if t >= s)
        word = self.spec['parts'][live]['label'].upper()
        at = max(self.starts[live], self.b0)
        pop = EASE['back'](clamp((t - at) / 0.28))
        size = tp.fit(word, 'display', 330, 940)
        colour = self.accent_rgb if live == len(self.starts) - 1 else CREAM
        tp.blit(img, tp.sprite(word, 'display', size, colour, tracking=-0.01), W / 2, 1250, alpha=clamp((t - at) / 0.08), scale=0.8 + 0.2 * pop)
        trail = ' · '.join(p['label'].upper() for p in self.spec['parts'][:live + 1])
        tp.blit(img, tp.sprite(trail, 'mono', 30, CREAM, tracking=0.14), W / 2, 1480, alpha=0.55)

    def type_detail(self, img, t):
        spec = self.spec
        if self.group:
            live = max(i for i, s in enumerate(self.starts) if t >= s)
            label = spec['parts'][live].get('label') or spec['title']
        else:
            label = spec['title']
        size = tp.fit(label, 'italic', 64, 900)
        tp.blit(img, tp.sprite(label, 'italic', size, CREAM), 70 - tp.pad_of(size), 1560, alpha=0.95, anchor='left')

    def type_site(self, img, t):
        a = clamp((t - self.d0) / 0.2) * clamp((self.e0 + 0.2 - t) / 0.2)
        tp.blit(img, tp.plate('ON THE SITE', self.accent_rgb, 28), W / 2, 300, alpha=a)
        tp.blit(img, tp.sprite(MAN['site'], 'mono', 34, CREAM, tracking=0.06), W / 2, 1600, alpha=a)

    def type_end(self, img, t):
        u = t - self.e0
        f = lambda d: EASE['out'](clamp((u - d) / 0.45))  # noqa: E731
        spec = self.spec
        size, lines = fit_lines(spec['title'], 'display', 900, sizes=(110, 96, 84, 72, 64), max_lines=2)
        y = 1150
        for line in lines:
            tp.blit(img, tp.sprite(line, 'display', size, CREAM, tracking=-0.01), W / 2, y + 20 * (1 - f(0.05)), alpha=f(0.05))
            y += size * 0.98
        tp.blit(img, tp.plate('OUT NOW', self.accent_rgb, 26), W / 2, 1050, alpha=f(0))
        tp.blit(img, props.pill('Listen on Spotify', 'body', 38, CREAM, INK, icon='play'), W / 2, y + 70, alpha=f(0.2), scale=0.94 + 0.06 * f(0.2))
        tp.blit(img, tp.sprite(MAN['site'], 'mono', 30, CREAM, tracking=0.06), W / 2, y + 170, alpha=0.8 * f(0.3))
        props.marquee(img, f"{spec['title']}  ·  {spec['kind']}  ·  {MAN['artist']}", 1760, t, 70, 60, CREAM, 0.1 * f(0.3))

    # ── frame ───────────────────────────────────────────────────────────
    def frame(self, fi):
        t = fi / FPS
        if t < self.b0:
            img = self.scene_hook(t, fi)
        elif t < self.c0:
            img = self.scene_group(t, fi) if self.group else self.scene_single(t, fi)
        elif t < self.d0:
            img = self.scene_detail(t, fi)
        elif t < self.e0:
            img = self.scene_site(t, fi)
        else:
            img = self.scene_end(t, fi)
            if t < self.e0 + 0.3:  # a short dissolve from the site
                mix = (t - self.e0) / 0.3
                img = img * mix + self.scene_site(t, fi) * (1 - mix)

        # cuts: a whip into the details, a zoom out of them
        if self.c0 - 0.12 <= t < self.c0 + 0.1:
            img = look.whip(img, 1 - abs(t - self.c0) / 0.12)
        if self.d0 - 0.15 <= t < self.d0 + 0.15:
            img = look.zoom_blur(img, 1 - abs(t - self.d0) / 0.15)
        punch = shake = split = flash = 0.0
        for h in [self.slam] + list(self.cuts):
            punch += 0.05 * env(t, h, 0.1)
            split += 7 * env(t, h, 0.14)
            flash = max(flash, 0.35 * env(t, h, 0.08) if h == self.slam else 0.12 * env(t, h, 0.08))
        shake = 14 * env(t, self.slam, 0.2)
        if punch or shake:
            m = np.array([[1 + punch, 0, -W * punch / 2 + shake * wobble(t, 1)], [0, 1 + punch, -H * punch / 2 + shake * wobble(t, 4)]], np.float32)
            img = cv2.warpAffine(img, m, (W, H), borderMode=cv2.BORDER_REFLECT)

        img = look.grade(img, 'neutral')
        img = look.bloom(img, 180, 0.3)
        img = look.split(img, split)
        img = look.vignette(img, 0.85)
        img = img * (1 - flash) + np.array(self.accent, np.float32) * flash
        if self.c0 <= t < self.d0 or t >= self.e0:  # darker at the bottom where type sits
            img[1350:] *= np.linspace(1, 0.45, H - 1350)[:, None, None]
        img = look.grain(img, fi, 3.5)

        self.type_top(img, t)
        if self.b0 <= t < self.c0:
            (self.type_group if self.group else self.type_single)(img, t, fi)
        elif self.c0 <= t < self.d0:
            self.type_detail(img, t)
        elif self.d0 <= t < self.e0 + 0.2:
            self.type_site(img, t)
        if t >= self.e0:
            self.type_end(img, t)
        if t > LENGTH - 0.45:
            img *= max(0.0, (LENGTH - t) / 0.45)
        if t < 0.08:
            img *= t / 0.08
        return np.clip(img, 0, 255).astype(np.uint8)

    def soundtrack(self):
        fx = sound.Sfx(LENGTH)
        fx.click(self.slam, 0.08, 900)                 # the needle
        i0 = int(self.slam * sound.SR)
        crackle = fx.noise[i0:i0 + int(0.5 * sound.SR)] * (np.random.default_rng(3).random(int(0.5 * sound.SR)) > 0.985)
        fx.out[i0:i0 + len(crackle)] += crackle * 0.05
        fx.whoosh(self.c0, 0.3, 0.06)
        fx.whoosh(self.d0, 0.35, 0.05)
        mix = self.mix[:, :fx.n]
        if mix.shape[1] < fx.n:
            mix = np.pad(mix, ((0, 0), (0, fx.n - mix.shape[1])))
        return mix + np.vstack([fx.out, fx.out])


def main():
    keys = args.key or [p['key'] for p in MAN['promos']]
    OUT.mkdir(parents=True, exist_ok=True)
    for spec in MAN['promos']:
        if spec['key'] not in keys:
            continue
        promo = Promo(spec)
        n = int(round(LENGTH * FPS))
        if args.stills:
            print(render.stills(promo.frame, [float(v) for v in args.stills.split(',')], OUT / f"{promo.key}.stills.jpg"))
            continue
        silent = OUT / f'{promo.key}-video.mp4'
        enc = render.Encoder(silent)
        for fi in range(n):
            enc.write(promo.frame(fi))
        enc.close()
        wav = OUT / f'{promo.key}.wav'
        sound.write_wav(wav, sound.master(promo.soundtrack(), -11.0))
        dst = OUT / f'{promo.key}-promo.mp4'
        render.mux(silent, wav, dst)
        wav.unlink()
        silent.unlink()
        render.lighter(dst, OUT / f'{promo.key}-promo-phone.mp4', height=1280, crf=24, maxrate='4M')
        print(dst, flush=True)


if __name__ == '__main__':
    main()
