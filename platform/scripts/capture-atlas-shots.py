"""Record the Atlas as raw footage for edits: no captions, no controls.

Same deterministic capture mode as capture-atlas-reel.mjs (`/?atlas-capture`
exposes window.__atlas; requestAnimationFrame is stepped by hand), but the
timeline is built for cutting: a hold on the whole route, then for every
world a flight in, a dwell and a dive into the planet, and at the end the
camera pulls back over the route. The dive is the scene's own "enter world"
move, made deterministic by setting its start time relative to each frame.

Output (--out, default assets-src/video/shots, which git ignores): atlas-shots-<lang>.mp4, all-intra at
1080x1920 so an editor can seek any frame, and atlas-shots-<lang>.json with
the time every flight, dwell and dive starts.

Usage (from platform/, with `npm run dev` on :3000):
  python scripts/capture-atlas-shots.py [--lang en|tr] [--out DIR] [--scale 2] [--stills 1,5.2]
Requires playwright (python) and ffmpeg.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--lang', default='en')
parser.add_argument('--out', default='assets-src/video/shots')
parser.add_argument('--base', default='http://localhost:3000')
parser.add_argument('--scale', type=float, default=2)
parser.add_argument('--stills', help='comma-separated seconds: write just those frames as PNGs')
args = parser.parse_args()

FPS = 30
W, H = 540, 960
HOLD, TRAVEL, DWELL, DIVE, OUTRO = 3.0, 1.3, 0.7, 0.8, 2.6

HIDE = """
  header.header, [class*=panel], [class*=strip], [class*=labels], [class*=scrim], [class*=poster],
  [class*=warp], [class*=dim], nextjs-portal, .skip-link { display: none !important; }
  html, body { overflow: hidden !important; }
"""
MANUAL_RAF = """
(() => {
  const native = window.requestAnimationFrame.bind(window)
  const nativeCancel = window.cancelAnimationFrame.bind(window)
  let manual = false, queue = new Map(), id = 1e7
  window.requestAnimationFrame = (cb) => { if (!manual) return native(cb); queue.set(++id, cb); return id }
  window.cancelAnimationFrame = (i) => { if (!queue.delete(i)) nativeCancel(i) }
  window.__reelManual = () => { manual = true }
  window.__reelStep = (ts) => { const q = queue; queue = new Map(); q.forEach((cb) => cb(ts)) }
})()
"""


def smoothstep(x: float) -> float:
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def plan(count: int):
    """Per-frame (target, exit, dive 0..1) and the event list."""
    segments = count + 1
    frames, events = [], []

    def run(seconds, fn, name=None):
        if name:
            events.append([round(len(frames) / FPS, 3), name])
        n = int(round(seconds * FPS))
        for i in range(n):
            frames.append(fn(i / max(1, n - 1)))

    run(HOLD, lambda u: (0.0, 0.0, 0.0), 'hold')
    for w in range(1, count + 1):
        k = w - 1
        run(TRAVEL, lambda u, k=k: ((k + 0.14 + 0.72 * u) / segments, 0.0, 0.0), f'travel:{w}')
        run(DWELL, lambda u, w=w: (w / segments, 0.0, 0.0), f'dwell:{w}')
        if w < count:  # the last world links out of the site: no dive
            run(DIVE, lambda u, w=w: (w / segments, 0.0, min(1.0, u * DIVE / 0.7)), f'dive:{w}')
    run(TRAVEL, lambda u: ((count + 0.14 + 0.72 * u) / segments, 0.0, 0.0), 'travel:outro')
    run(OUTRO, lambda u: (1.0, 0.55 * smoothstep(u), 0.0), 'pullback')
    return frames, events


def main() -> None:
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    video = out / f'atlas-shots-{args.lang}.mp4'
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = browser.new_context(viewport={'width': W, 'height': H}, device_scale_factor=args.scale, locale=args.lang)
        # No hot reloads mid-recording.
        ctx.route_web_socket(re.compile(r'/_next/(hmr|webpack-hmr|turbopack-hmr)'), lambda ws: None)
        ctx.add_init_script(MANUAL_RAF)
        page = ctx.new_page()
        page.goto(f"{args.base}{'/en' if args.lang == 'en' else ''}?atlas-capture", wait_until='networkidle', timeout=180000)
        page.wait_for_selector('[class*=canvasReady]', timeout=120000)
        worlds = page.evaluate("""() => [...document.querySelectorAll('[class*=indexList] a[id^=project-]')].map((a) => ({
          id: a.id.replace('project-', ''), name: a.querySelector('strong')?.textContent?.trim() ?? '',
          accent: a.style.getPropertyValue('--world') || '#d6ab6b', href: a.getAttribute('href') }))""")
        if not worlds:
            raise SystemExit('could not read the world list')
        page.add_style_tag(content=HIDE)
        page.wait_for_timeout(3500)  # textures upload and shaders compile on the normal loop
        page.evaluate('window.__reelManual()')
        frames, events = plan(len(worlds))
        if args.stills:
            for s in (float(v) for v in args.stills.split(',')):
                f = min(len(frames) - 1, int(round(s * FPS)))
                target, exit_, dive = frames[f]
                page.evaluate("""({ target, exit, dive, time, ts }) => {
                  Object.assign(window.__atlas, { target, exit, time, highlight: -1, warp: dive > 0 ? performance.now() - dive * 700 : 0 })
                  window.__reelStep(ts)
                }""", {'target': target, 'exit': exit_, 'dive': dive, 'time': 2 + s, 'ts': 1e5 + s * 1000})
                page.screenshot(path=str(out / f'atlas-still-{s:.2f}.png'), timeout=180_000)
            print(json.dumps(events))
            return
        enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-',
                                '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-g', '1', '-pix_fmt', 'yuv420p', str(video)],
                               stdin=subprocess.PIPE)
        for f, (target, exit_, dive) in enumerate(frames):
            t = f / FPS
            page.evaluate("""({ target, exit, dive, time, ts }) => {
              Object.assign(window.__atlas, { target, exit, time, highlight: -1, warp: dive > 0 ? performance.now() - dive * 700 : 0 })
              window.__reelStep(ts)
            }""", {'target': target, 'exit': exit_, 'dive': dive, 'time': 2 + t, 'ts': 1e5 + t * 1000})
            enc.stdin.write(page.screenshot(timeout=180_000))
            if f % 60 == 0:
                print(f'{f}/{len(frames)}', flush=True)
        enc.stdin.close()
        if enc.wait():
            raise SystemExit('ffmpeg failed')
        browser.close()
    (out / f'atlas-shots-{args.lang}.json').write_text(json.dumps({'fps': FPS, 'frames': len(frames), 'worlds': worlds,
                                                                   'events': events}, indent=1), encoding='utf-8')
    print(video, len(frames), 'frames')


if __name__ == '__main__':
    main()
