"""The Atlas tour: every CrownCode project in one route, cut to Bass Persuades.

Grammar of a chapter (one bar): land on the world on the downbeat with its
number and name, dive into the planet as the screen floods with the world's
colour, come up inside the project's page, whip out on the last half beat
into the flight to the next world. Crown Fortune takes two bars: its wheel
stops on the song's big hit at 12.1 s, and the gap after it is a slow dark
flight to Crown Dreams, which lands as the chorus starts. The last world pulls
back over the whole route, the route becomes a wall of live pages, and the
wall ends on the lockup.

Footage:
  --atlas DIR   atlas-shots-en.mp4/.json (capture-atlas-shots.py)
  --pages DIR   tour-<plan>-en.mp4/.json (capture-page-tour.py: ml-toolkit fortune dreams commend vote noir)
  --auris DIR   auris-shot-ui-en.mp4, auris-shot-world-en.mp4, events-ui-en.json (capture-auris-reel.py)
Music: --music, a clip whose beat 0 is at --first-beat, at --bpm.

Usage (from platform/):
  python scripts/edit-atlas-tour.py --atlas DIR --pages DIR --auris DIR --music song.mp3 \
      --out assets-src/video/atlas/atlas-tour-en.mp4 [--stills 1,4.5,9]
Writes <out>, <out>-nomusic.mp4, <out>-preview.mp4 (under 30 MB) and <out>-phone.mp4.
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np

from reelkit import core, look, render, sound
from reelkit import type as tp
from reelkit.core import EASE, FPS, H, W, Footage, card, clamp, env, region, soft_background, view, wobble

parser = argparse.ArgumentParser()
parser.add_argument('--atlas', required=True)
parser.add_argument('--pages', required=True)
parser.add_argument('--auris', required=True)
parser.add_argument('--music', required=True)
parser.add_argument('--out', required=True)
parser.add_argument('--bpm', type=float, default=121.27)
parser.add_argument('--first-beat', type=float, default=0.248)
parser.add_argument('--end', type=float, default=29.9)
parser.add_argument('--stills')
args = parser.parse_args()

P = 60 / args.bpm
END = args.end
N = int(round(END * FPS))


def b(k: float) -> float:
    """Song (and edit) time of beat k."""
    return args.first_beat + k * P


# ── footage ─────────────────────────────────────────────────────────────
atlas_meta = json.loads((Path(args.atlas) / 'atlas-shots-en.json').read_text(encoding='utf-8'))
ATLAS = Footage(Path(args.atlas) / 'atlas-shots-en.mp4')
EV = {name: t for t, name in atlas_meta['events']}
WORLDS = atlas_meta['worlds']
ACCENT = [look.hex_bgr(w['accent']) for w in WORLDS]
PAGES = {name: Footage(Path(args.pages) / f'tour-{name}-en.mp4') for name in ('ml-toolkit', 'fortune', 'dreams', 'commend', 'vote', 'noir')}
PAGE_EV = {name: {e[1]: e[0] for e in json.loads((Path(args.pages) / f'tour-{name}-en.json').read_text(encoding='utf-8'))['events']}
           for name in PAGES}
AURIS_UI = Footage(Path(args.auris) / 'auris-shot-ui-en.mp4')
AURIS_WORLD = Footage(Path(args.auris) / 'auris-shot-world-en.mp4')
E_AI = next(t for t, n in json.loads((Path(args.auris) / 'events-ui-en.json').read_text(encoding='utf-8'))['events'] if n == 'mode:ai')

# ── words ───────────────────────────────────────────────────────────────
SECTOR = ['IS THIS SONG AI?', 'AUDIO DATASET TOOLS', 'A WHEEL AND 22 CARDS', 'A DREAM JOURNAL THAT READS',
          'YOUTUBE COMMENTS, DRAFTED', 'A WINDOWS VOTING APP', 'A RESTAURANT TEMPLATE', 'A PRIVATE DESKTOP TRACKER']
FACT = ['11 MODELS VOTE', 'AUGMENT · CONVERT · ORGANIZE', 'RESETS AT MIDNIGHT', 'THEMES · SYMBOLS · MOOD',
        'PASTE A LINK · GET A COMMENT', 'SELENIUM · PARALLEL WINDOWS', '4 PAGES · REACT 19', 'ON GITHUB']
COUNT = len(WORLDS)

# ── timeline ────────────────────────────────────────────────────────────
# Chapters: world index, the bar it lands on, and its page shot(s):
# (from beat, to beat, footage, source from, source to, mode, params)
#   bleed: full-frame page, params (cy, zoom from, zoom to)
#   macro: a detail, params (cx, cy, zoom from, zoom to)
#   card:  a tilted card over the soft page, params (box, pose from, pose to)
CH = [
    (0, 2, [(9.75, 11.5, 'auris', E_AI + 1.2, E_AI + 2.0, 'card',
             ((0.03, 0.40, 0.97, 0.71), (8, -28, 3, 0, -60, 0.95), (3, -6, 0, 0, -60, 1.08)))]),
    (1, 3, [(13.75, 15.5, 'ml-toolkit', 2.3, 3.3, 'bleed', (0.5, 1.02, 1.1))]),
    (2, 4, [(17.75, 20, 'fortune', 0.1, 0.95, 'bleed', (0.45, 1.0, 1.1)),
            (20, 24, 'fortune', 1.0, 5.0, 'macro', (0.5, 0.5, 1.5, 1.7)),
            (24, 26.3, 'fortune', 5.3, 7.0, 'macro', (0.5, 0.62, 1.25, 1.4))]),
    (3, 7, [(29.75, 31.5, 'dreams', 2.4, 3.3, 'macro', (0.5, 0.27, 1.5, 1.7))]),
    (4, 8, [(33.75, 35.5, 'commend', 0.8, 2.5, 'macro', (0.5, 0.36, 1.45, 1.6))]),
    (5, 9, [(37.75, 39.5, 'vote', 0.2, 1.2, 'bleed', (0.42, 1.0, 1.12))]),
    (6, 10, [(41.75, 43.5, 'noir', 2.2, 3.7, 'bleed', (0.5, 1.02, 1.08))]),
    (7, 11, []),
]
GAP = (26.3, 28)            # beats: after the wheel the song drops out, a slow dark flight
PULLBACK = (46, 48)          # Kognita: the camera backs off over the whole route
WALL = (48, 56)
LOCKUP = 56


def page_frame(name, t):
    if name == 'auris':
        return AURIS_UI.at(t)
    return PAGES[name].at(t)


def atlas_segment(t):
    """Which atlas moment is on screen at t, as (source time, speed, dive 0..1, world or None)."""
    if t < b(7.5):
        u = clamp((t - b(0)) / (b(7.5) - b(0)))
        return EV['hold'] + (EV['travel:1'] - 0.05 - EV['hold']) * u, 1.0, 0.0, None
    for w, bar, _ in CH:
        k = 4 * bar
        if w == 3:
            start = b(GAP[0])   # Crown Dreams is flown to through the gap
        else:
            start = b(k - 0.5)
        if start <= t < b(k):  # flight in
            u = (t - start) / (b(k) - start)
            span = EV[f'dwell:{w + 1}'] - EV[f'travel:{w + 1}']
            return EV[f'travel:{w + 1}'] + span * EASE['io'](u), span / (b(k) - start), 0.0, w
        if w == COUNT - 1 and b(k) <= t < b(PULLBACK[0]):  # the last world: dwell, then drift toward the outro
            return EV[f'dwell:{w + 1}'] + 1.3 * (t - b(k)) / (b(PULLBACK[0]) - b(k)), 1.3, 0.0, w
        if b(k) <= t < b(k + 1.25):
            u = (t - b(k)) / (b(k + 1.25) - b(k))
            return EV[f'dwell:{w + 1}'] + 0.62 * u, 1.0, 0.0, w
        if w < COUNT - 1 and b(k + 1.25) <= t < b(k + 1.75):
            u = (t - b(k + 1.25)) / (b(k + 1.75) - b(k + 1.25))
            return EV[f'dive:{w + 1}'] + 0.7 * u, 0.7 / (b(k + 1.75) - b(k + 1.25)), u, w
    if b(PULLBACK[0]) <= t:
        u = clamp((t - b(PULLBACK[0])) / (b(PULLBACK[1]) - b(PULLBACK[0])))
        return EV['pullback'] + 1.8 * EASE['soft'](u), 1.0, 0.0, COUNT - 1
    return None


def page_shot(t):
    for w, bar, shots in CH:
        for s in shots:
            if b(s[0]) <= t < b(s[1]):
                return w, s
    return None


def chapter_at(t):
    """The chapter whose title/HUD dot is live."""
    live = None
    for w, bar, _ in CH:
        if t >= b(4 * bar) - 0.02:
            live = (w, bar)
    return live


# ── drawing ─────────────────────────────────────────────────────────────

def draw_page(t, fi, w, shot):
    k0, k1, name, s0, s1, mode, par = shot
    u = (t - b(k0)) / (b(k1) - b(k0))
    src = s0 + (s1 - s0) * u
    speed = (s1 - s0) / (b(k1) - b(k0))
    foot = AURIS_UI if name == 'auris' else PAGES[name]
    raw = foot.blurred(src, speed)
    if mode == 'bleed':
        cy, z0, z1 = par
        img, _ = view(raw, 0.5, cy, z0 + (z1 - z0) * EASE['soft'](u))
    elif mode == 'macro':
        cx, cy, z0, z1 = par
        img, _ = view(raw, cx, cy, z0 + (z1 - z0) * EASE['soft'](u))
    else:
        box, p0, p1 = par
        pe = EASE['out'](u)
        pose = tuple(a + (c - a) * pe for a, c in zip(p0, p1))
        bg_src = AURIS_WORLD.at(src) if name == 'auris' else raw
        img = soft_background(bg_src, dim=0.5)
        img = card(region(raw, box), pose, img, sheen=u, edge=ACCENT[w])
    # entering: the world's colour drains off the page as it zooms in
    enter = clamp((t - b(k0)) / 0.2) if shot is first_shot(w) else 1.0
    if enter < 1:
        img = look.zoom_blur(img, (1 - enter) * 0.8)
        img = img * enter + np.array(ACCENT[w], np.float32) * 0.62 * (1 - enter)
    # leaving: a vertical whip on the last shot of the chapter
    if shot is last_shot(w):
        out = clamp((t - (b(k1) - 0.12)) / 0.12)
        img = look.whip(img, out)
    return img


def first_shot(w):
    return CH[w][2][0] if CH[w][2] else None


def last_shot(w):
    return CH[w][2][-1] if CH[w][2] else None


def draw_atlas(t, fi, seg):
    src, speed, dive, w = seg
    raw = ATLAS.blurred(src, speed * 0.9)
    z, cy = 1.0, 0.5
    if t < b(7.5):
        z, cy = 1.0 + 0.12 * EASE['soft'](clamp(t / b(7.5))), 0.56
    img, _ = view(raw, 0.5, cy, z)
    if speed > 2.2 and dive == 0:  # a fast flight: blur along the move
        img = look.whip(img, min(0.55, (speed - 2.2) / 5), vertical=False)
    if dive > 0:
        img = look.zoom_blur(img, dive * 0.7)
        centre = (W / 2, H * 0.36)  # where the world sits while the camera dwells
        img = look.flood(img, (dive - 0.3) / 0.7, centre, tuple(c * 0.62 for c in ACCENT[w]))
    if b(GAP[0]) <= t < b(GAP[1]):  # the gap: dark, slow, bars in
        g = clamp((t - b(GAP[0])) / 0.25)
        img *= 1 - 0.55 * g
    return img


def draw_wall(t, fi):
    u = clamp((t - b(WALL[0])) / (b(WALL[0] + 4) - b(WALL[0])))
    later = clamp((t - b(WALL[0] + 4)) / (b(WALL[1]) - b(WALL[0] + 4)))
    tw, th, gap = 360, 640, 36
    gw, gh = 3 * tw + 2 * gap, 3 * th + 2 * gap
    flat = np.full((gh, gw, 3), 8, np.float32)
    feeds = [('auris', E_AI + 1.0, 2.6), ('ml-toolkit', 0.2, 4.8), ('fortune', 1.0, 4.0), ('dreams', 0.3, 6.5), ('atlas', 0, 0),
             ('commend', 0.6, 4.4), ('vote', 0.2, 4.8), ('noir', 0.3, 4.8), ('kognita', 0, 0)]
    for i, (name, s0, span) in enumerate(feeds):
        r, c = divmod(i, 3)
        loc = (t - b(WALL[0])) * 0.9
        if name == 'atlas':
            frame = ATLAS.at(EV['pullback'] + 1.8 + min(0.8, loc * 0.3))
        elif name == 'kognita':
            frame = ATLAS.at(EV['dwell:8'] + (loc % 0.6))
        else:
            frame = page_frame(name, s0 + (loc % span))
        tile = cv2.resize(frame, (tw, th), interpolation=cv2.INTER_AREA).astype(np.float32)
        pop = env(t, b(WALL[0] + 0.5 * i), 0.25)
        tile = tile * (0.92 + 0.4 * pop)
        y0, x0 = r * (th + gap), c * (tw + gap)
        flat[y0:y0 + th, x0:x0 + tw] = tile
        if name != 'atlas':
            idx = {'auris': 0, 'ml-toolkit': 1, 'fortune': 2, 'dreams': 3, 'commend': 4, 'vote': 5, 'noir': 6, 'kognita': 7}[name]
            lab = tp.sprite(f'{idx + 1:02d}  {WORLDS[idx]["name"].upper()}', 'mono', 24, (243, 233, 216), tracking=0.1)
            lh, lw = lab.shape[:2]
            ly, lx = y0 + th - lh - 6, x0 + 4
            a = lab[..., 3:4] / 255
            flat[ly:ly + lh, lx:lx + lw] = flat[ly:ly + lh, lx:lx + lw] * (1 - a) + lab[..., 2::-1] * a
            edge = np.array(ACCENT[idx], np.float32)
            flat[y0:y0 + 3, x0:x0 + tw] = edge * (0.4 + 0.6 * pop)
    # the camera starts inside the centre tile and pulls back over the wall
    s0 = W / tw
    e = EASE['soft'](u)
    scale = s0 + (0.88 - s0) * e - 0.06 * later
    pose = (16 * e, -12 * e + 4 * later, -5 * e + 2 * later, 0, 20 * e, scale * tw * 3 / gw * gw / 900)
    canvas = np.full((H, W, 3), 6, np.float32)
    canvas = card(flat, pose, canvas, width=900, radius=6, edge=None, shadow=0.5)
    # it opens on the sharp full-frame route and dissolves into the wall as it pulls back
    if u < 0.3:
        full, _ = view(ATLAS.at(EV['pullback'] + 1.8), 0.5, 0.5, 1.0)
        mix = EASE['io'](u / 0.3)
        canvas = full * (1 - mix) + look.zoom_blur(canvas, (0.3 - u) * 1.5) * mix
    return canvas


def draw_titles(img, t):
    live = chapter_at(t)
    if not live:
        return
    w, bar = live
    k = 4 * bar
    on = t - b(k)
    if w == COUNT - 1:
        off_start, off_end = b(PULLBACK[0]) - 0.1, b(PULLBACK[0] + 1)
    else:
        off_start, off_end = b(k + 1.2), b(k + 1.5)
    if on < 0 or t >= off_end:
        return
    out = clamp((t - off_start) / (off_end - off_start))
    lift = -60 * EASE['in'](out)
    fade = 1 - out
    colour = WORLDS[w]['accent']
    rgb = tuple(int(colour[i:i + 2], 16) for i in (1, 3, 5))
    x = 70
    eyebrow = tp.sprite(f'{w + 1:02d} / {COUNT:02d}', 'mono', 32, rgb, tracking=0.12)
    tp.blit(img, eyebrow, x - tp.pad_of(32), 1262 + lift, alpha=fade * clamp(on / 0.12), anchor='left')
    name = WORLDS[w]['name'].upper()
    size = tp.fit(name, 'display', 128, 930, tracking=0.03)
    spr = tp.sprite(name, 'display', size, tp.CREAM, tracking=0.03)
    rise = EASE['out'](clamp((on - 0.04) / 0.28))
    tp.blit(img, spr, x - tp.pad_of(size), 1360 + lift + 30 * (1 - rise), alpha=fade, rise=rise, anchor='left')
    tp.rule(img, x, 1446 + lift, tp.ink_width(spr, size) * 0.6, EASE['out'](clamp((on - 0.1) / 0.35)) * fade, rgb, 3)
    sector = tp.sprite(SECTOR[w], 'mono', 28, tp.MUTED, tracking=0.14)
    tp.blit(img, sector, x - tp.pad_of(28), 1492 + lift, alpha=fade * clamp((on - 0.16) / 0.2), anchor='left')


def fact_span(t):
    for w, bar, shots in CH:
        since, until = (b(shots[0][0]), b(shots[-1][1])) if shots else (b(4 * bar + 0.6), b(PULLBACK[0] + 1))
        if since <= t < until:
            return w, since, until
    return None


def draw_fact(img, t):
    """One line of what the project does, in the HUD row while its page is on screen."""
    span = fact_span(t)
    if not span:
        return
    w, since, until = span
    a = clamp((t - since - 0.08) / 0.12) * clamp((until - 0.1 - t) / 0.1)
    colour = WORLDS[w]['accent']
    rgb = tuple(int(colour[i:i + 2], 16) for i in (1, 3, 5))
    tp.blit(img, tp.plate(FACT[w], rgb, 26), 58, 214, alpha=a, anchor='left')


def draw_hud(img, t):
    a = clamp((t - b(7.8)) / 0.3) * clamp((b(WALL[0]) - t) / 0.3)
    if a <= 0:
        return
    span = fact_span(t)
    mark = 1.0 if not span else 1 - clamp((t - span[1]) / 0.1) * clamp((span[2] - t) / 0.1)
    tp.blit(img, tp.sprite('CROWNCODE', 'mono', 26, tp.CREAM, tracking=0.2), 70 - tp.pad_of(26), 214, alpha=0.75 * a * mark, anchor='left')
    live = chapter_at(t)
    x0, x1, y = 700, 1010, 214
    img[y:y + 2, x0:x1] = img[y:y + 2, x0:x1] * (1 - 0.35 * a) + np.array((107, 171, 214), np.float32) * 0.35 * a
    for i in range(COUNT):
        x = int(x0 + (x1 - x0) * i / (COUNT - 1))
        done = live is not None and i <= live[0]
        colour = np.array(ACCENT[i] if done else (60, 70, 80), np.float32)
        r = 7 if live is not None and i == live[0] else 5
        cv2.circle(img, (x, y + 1), r, (colour * a + img[y, x] * (1 - a)).tolist(), -1, cv2.LINE_AA)


def draw_open(img, t):
    """Eyebrow, the name, a line of what it is."""
    if t >= b(7.6):
        return
    out = clamp((t - b(7.25)) / (b(7.6) - b(7.25)))
    fade = 1 - out
    eyebrow = tp.sprite(f'{COUNT} PROJECTS · ONE ROUTE', 'mono', 30, tp.AMBER, tracking=0.18)
    tp.blit(img, eyebrow, W / 2, 1300, alpha=clamp((t - b(2)) / 0.2) * fade, reveal=clamp((t - b(2)) / 0.5))
    # the name comes up letter by letter on the bar
    name = 'CROWNCODE'
    size = tp.fit(name, 'display', 150, 900)
    widths = [tp.ink_width(tp.sprite(ch, 'display', size, tp.CREAM), size) for ch in name]
    track = 6
    total = sum(widths) + track * (len(name) - 1)
    x = W / 2 - total / 2
    for i, ch in enumerate(name):
        on = t - (b(4) + i * 0.045)
        rise = EASE['out'](clamp(on / 0.3))
        spr = tp.sprite(ch, 'display', size, tp.CREAM)
        tp.blit(img, spr, x - tp.pad_of(size), 1405 + 40 * (1 - rise), alpha=fade * clamp(on / 0.1), rise=rise, anchor='left')
        x += widths[i] + track
    line = tp.sprite('Independent work across sound, data and the web.', 'serif', 40, tp.MUTED)
    tp.blit(img, line, W / 2, 1505, alpha=clamp((t - b(6)) / 0.3) * fade)


def draw_lockup(img, t):
    u = t - b(LOCKUP)
    if u < 0:
        return
    f = lambda d: EASE['out'](clamp((u - d) / 0.45))  # noqa: E731
    size = tp.fit('CROWNCODE', 'display', 150, 900, tracking=0.03)
    tp.blit(img, tp.sprite('CROWNCODE', 'display', size, tp.CREAM, tracking=0.03), W / 2, 820 + 24 * (1 - f(0)), alpha=f(0), rise=f(0))
    tp.blit(img, tp.sprite('Independent work across sound, data and the web.', 'serif', 42, tp.AMBER), W / 2, 960, alpha=f(0.15))
    tp.blit(img, tp.sprite('hasan-arthur-altuntas.xyz', 'mono', 34, tp.CREAM, tracking=0.06), W / 2, 1070, alpha=f(0.3))
    tp.blit(img, tp.sprite(f'{COUNT} projects · free to try', 'serif', 38, tp.MUTED), W / 2, 1135, alpha=f(0.4))


# Hits: beat, zoom punch, shake px, colour split px, flash amount
HITS = [(8, .05, 6, 4, .15), (12, .04, 4, 3, .1), (16, .04, 4, 3, .1), (24, .12, 18, 9, .35), (28, .12, 16, 8, .3),
        (32, .04, 4, 3, .1), (36, .04, 4, 3, .1), (40, .04, 4, 3, .1), (44, .04, 4, 3, .1), (48, .06, 6, 5, .2), (56, .03, 0, 2, .1)]


def render_frame(fi):
    t = fi / FPS
    shake = split = flash = punch = 0.0
    for k, zp, sh, sp, fa in HITS:
        punch += zp * env(t, b(k), 0.11)
        shake += sh * env(t, b(k), 0.22)
        split += sp * env(t, b(k), 0.16)
        flash = max(flash, fa * env(t, b(k), 0.1))

    if t >= b(WALL[0]):
        img = draw_wall(t, fi)
    else:
        shot = page_shot(t)
        if shot:
            img = draw_page(t, fi, *shot)
        else:
            seg = atlas_segment(t)
            img = draw_atlas(t, fi, seg) if seg else np.zeros((H, W, 3), np.float32)
    if punch or shake:
        m = np.array([[1 + punch, 0, -W * punch / 2 + shake * wobble(t, 1)], [0, 1 + punch, -H * punch / 2 + shake * wobble(t, 4)]], np.float32)
        img = cv2.warpAffine(img, m, (W, H), borderMode=cv2.BORDER_REFLECT)

    img = look.grade(img, 'warm')
    img = look.bloom(img, 175, 0.35)
    img = look.split(img, split)
    if t < b(0):
        img *= clamp(t / b(0))
    if b(GAP[0]) <= t < b(GAP[1]):
        img = look.bars(img, clamp((t - b(GAP[0])) / 0.2) * clamp((b(GAP[1]) - t) / 0.15))
    if t >= b(LOCKUP):
        img *= 1 - 0.72 * EASE['out'](clamp((t - b(LOCKUP)) / 0.5))
    if t > END - 0.4:
        img *= max(0.0, (END - t) / 0.4)
    img = look.vignette(img, 0.9)
    if b(7.8) <= t < b(WALL[0]):
        img = look.top_shade(img, 0.72 * clamp((t - b(7.8)) / 0.3) * clamp((b(WALL[0]) - t) / 0.3))
    img = img * (1 - flash) + 255 * flash * 0.9
    img = look.grain(img, fi, 3.5)

    draw_open(img, t)
    draw_titles(img, t)
    draw_fact(img, t)
    draw_hud(img, t)
    draw_lockup(img, t)
    return np.clip(img, 0, 255).astype(np.uint8)


# ── sound ───────────────────────────────────────────────────────────────

def soundtrack():
    fx = sound.Sfx(END)
    for w, bar, shots in CH:
        k = 4 * bar
        fx.whoosh(b(k) - 0.01, 0.4 if w != 3 else 0.8, 0.13)
        if w < COUNT - 1:
            fx.dive(b(k + 1.25), 0.4, 0.22)
        for s in shots:
            fx.click(b(s[0]), 0.06)
    fx.tick_run(b(20), b(24) - b(20), 24, 0.03)            # the wheel
    fx.impact(b(24), 0.5, 60)                               # it stops on the hit
    fx.riser(b(GAP[0]), b(GAP[1]), 0.14)
    fx.whoosh(b(PULLBACK[0]), 0.5, 0.1)
    fx.impact(b(28), 0.6, 50)
    fx.type_keys(b(33.9), b(35.3), 24, 0.04)                 # typing the link
    for i in range(9):
        fx.click(b(WALL[0] + 0.5 * i), 0.045, 1500 + 90 * i)
    fx.whoosh(b(WALL[0]), 0.6, 0.12)
    fx.bell(b(LOCKUP) + 0.03, (62, 69, 74, 78), 0.035)
    music = sound.load_music(Path(args.music), END)
    return music + np.vstack([fx.out, fx.out]), np.vstack([fx.out, fx.out])


def main():
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    if args.stills:
        print(render.stills(render_frame, [float(v) for v in args.stills.split(',')], out.with_suffix('.stills.jpg')))
        return
    silent = out.with_name(out.stem + '-video.mp4')
    enc = render.Encoder(silent)
    for fi in range(N):
        enc.write(render_frame(fi))
        if fi % 60 == 0:
            print(f'{fi}/{N}', flush=True)
    enc.close()
    with_song, bare = soundtrack()
    for mix, level, dst in ((with_song, -13.0, out), (bare, -10.0, out.with_name(out.stem + '-nomusic.mp4'))):
        wav = dst.with_suffix('.wav')
        sound.write_wav(wav, sound.master(mix, level))
        render.mux(silent, wav, dst)
        wav.unlink()
        print(dst)
    silent.unlink()
    render.lighter(out, out.with_name(out.stem + '-preview.mp4'))
    render.lighter(out, out.with_name(out.stem + '-phone.mp4'), height=1280, crf=26, maxrate='3M')
    print('done')


if __name__ == '__main__':
    main()
