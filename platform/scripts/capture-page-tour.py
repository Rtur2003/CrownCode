"""Record a scripted tour of a project page as raw footage for edits.

Each plan is a list of steps on one page: hold, scroll to a heading (by its
text), click a control, type into a field. Time is driven frame by frame
(Playwright's fake clock for JS and requestAnimationFrame, the Web
Animations API for CSS), so animations run at real speed in the video
however slowly frames are captured. Scrolls ease in and out.

Output (--out, default assets-src/video/shots, which git ignores): tour-<plan>-<lang>.mp4, all-intra at
1620x2880 (540x960 CSS at 3x) so an editor can seek any frame and zoom in,
and tour-<plan>-<lang>.json with the time each step starts.

Usage (from platform/, with `npm run dev` on :3000):
  python scripts/capture-page-tour.py --plan fortune [--plan dreams ...] [--lang en] [--out DIR]
  python scripts/capture-page-tour.py --list
Requires playwright (python) and ffmpeg.
"""
import argparse
import datetime
import json
import re
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

# name -> (path, steps). Steps: ('hold', s) · ('to', heading text, offset px, s) ·
# ('by', px, s) · ('click', control text, 0) · ('type', field hint, text, chars per s)
PLANS = {
    'ml-toolkit': ('/data-manipulation', [
        ('hold', 1.2), ('to', 'Data Augmentation', -150, 1.2), ('hold', 1.0), ('to', 'Dataset Organization', -330, 1.0), ('hold', 0.8)]),
    'fortune': ('/crown-fortune', [
        ('hold', 1.0), ('click', 'Spin', 0), ('hold', 4.3), ('by', 380, 0.8), ('hold', 1.8)]),
    'dreams': ('/crown-dreams', [
        ('hold', 1.2), ('to', 'Lucid Mastery', -130, 1.1), ('hold', 1.0), ('to', 'Recent Dreams', -110, 1.0), ('hold', 0.7),
        ('to', 'Weekly Activity', -220, 1.2), ('hold', 1.0)]),
    'commend': ('/crown-commend', [
        ('hold', 0.8), ('type', 'youtube', 'https://youtube.com/watch?v=Zx7rK2mQ9aL', 26), ('hold', 0.7),
        ('to', 'Features', -90, 1.1), ('hold', 1.0)]),
    'vote': ('/crown-vote', [
        ('hold', 1.3), ('to', 'Selenium', -170, 1.1), ('hold', 0.8), ('to', 'Download Application', -150, 1.1), ('hold', 0.9)]),
    'noir': ('/noir-grain', [
        ('hold', 1.0), ('to', 'Pages', -40, 1.3), ('hold', 0.8), ('by', 700, 1.2), ('hold', 0.8)]),
}

parser = argparse.ArgumentParser()
parser.add_argument('--plan', action='append', default=[])
parser.add_argument('--list', action='store_true')
parser.add_argument('--lang', default='en')
parser.add_argument('--out', default='assets-src/video/shots')
parser.add_argument('--base', default='http://localhost:3000')
parser.add_argument('--scale', type=float, default=3)
args = parser.parse_args()

FPS = 30
W, H = 540, 960

SETUP = r"""
(() => {
  const style = document.createElement('style')
  style.textContent = 'nextjs-portal { display: none !important; } html { scroll-behavior: auto !important; }'
  document.head.appendChild(style)
  window.__syncAnimations = () => {
    const now = performance.now()
    for (const a of document.getAnimations()) {
      if (a.__t0 === undefined) { a.__t0 = now; a.pause() }
      a.currentTime = Math.max(0, now - a.__t0)
    }
  }
  const all = () => [...document.querySelectorAll('h1,h2,h3,h4,p,span,strong,button,label,a')]
  window.__findText = (text) => {
    const t = text.toLowerCase()
    return all().find((e) => e.textContent.trim().toLowerCase().startsWith(t) && e.textContent.trim().length < t.length + 40)
  }
  window.__topOf = (text) => {
    const el = window.__findText(text)
    return el ? el.getBoundingClientRect().top + scrollY : null
  }
  window.__clickText = (text) => {
    const t = text.toLowerCase()
    const el = [...document.querySelectorAll('button')].find((b) =>
      (b.getAttribute('aria-label') || b.textContent || '').toLowerCase().includes(t) && !b.disabled)
    if (el) el.click()
    return Boolean(el)
  }
  window.__field = (hint) => {
    const h = hint.toLowerCase()
    return [...document.querySelectorAll('input, textarea')].find((i) =>
      ((i.placeholder || '') + ' ' + (i.name || '') + ' ' + (i.type || '')).toLowerCase().includes(h))
  }
})()
"""


def ease(u: float) -> float:
    u = min(1.0, max(0.0, u))
    return u * u * u * (u * (u * 6 - 15) + 10)  # smootherstep: soft start and stop


def record(pw, name: str) -> None:
    path, steps = PLANS[name]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    video = out / f'tour-{name}-{args.lang}.mp4'
    browser = pw.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = browser.new_context(viewport={'width': W, 'height': H}, device_scale_factor=args.scale, is_mobile=True,
                              has_touch=True, locale=args.lang)
    ctx.route_web_socket(re.compile(r'/_next/(hmr|webpack-hmr|turbopack-hmr)'), lambda ws: None)
    # The fortune wheel bumps a shared daily counter; the recording must not.
    ctx.route('**/api/fortune-counter', lambda r: r.fulfill(status=200, json={'success': True, 'count': 128}))
    page = ctx.new_page()
    page.clock.install()
    page.goto(f"{args.base}{'/en' if args.lang == 'en' else ''}{path}", wait_until='networkidle', timeout=180000)
    page.wait_for_timeout(2500)
    page.evaluate(SETUP)
    page.evaluate('document.fonts.ready')
    page.clock.pause_at(datetime.datetime.now() + datetime.timedelta(seconds=1))

    enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-g', '1', '-pix_fmt', 'yuv420p', str(video)],
                           stdin=subprocess.PIPE)
    frame = 0
    events = []

    def tick(scroll_y=None):
        nonlocal frame
        page.clock.run_for(round((frame + 1) * 1000 / FPS) - round(frame * 1000 / FPS))
        if scroll_y is not None:
            page.evaluate(f'window.scrollTo(0, {scroll_y:.1f})')
        page.evaluate('window.__syncAnimations()')
        enc.stdin.write(page.screenshot(timeout=180_000))
        frame += 1

    def scroll(to: float, seconds: float):
        start = page.evaluate('scrollY')
        top = page.evaluate('document.documentElement.scrollHeight - innerHeight')
        to = max(0.0, min(top, to))
        n = int(round(seconds * FPS))
        for i in range(n):
            tick(start + (to - start) * ease((i + 1) / n))

    for step in steps:
        events.append([round(frame / FPS, 3), step[0] + (f':{step[1]}' if len(step) > 1 and isinstance(step[1], str) else '')])
        kind = step[0]
        if kind == 'hold':
            for _ in range(int(round(step[1] * FPS))):
                tick()
        elif kind == 'to':
            y = page.evaluate(f'window.__topOf({json.dumps(step[1])})')
            if y is None:
                print(f'  {name}: no heading "{step[1]}", holding instead')
                y = page.evaluate('scrollY')
            scroll(y + step[2], step[3])
        elif kind == 'by':
            scroll(page.evaluate('scrollY') + step[1], step[2])
        elif kind == 'click':
            if not page.evaluate(f'window.__clickText({json.dumps(step[1])})'):
                print(f'  {name}: no control "{step[1]}"')
        elif kind == 'type':
            field = page.evaluate_handle(f'window.__field({json.dumps(step[1])})')
            if not page.evaluate('(f) => Boolean(f)', field):
                print(f'  {name}: no field "{step[1]}"')
                continue
            field.as_element().focus()
            per_char = FPS / step[3]
            acc = 0.0
            for ch in step[2]:
                page.keyboard.type(ch)
                acc += per_char
                while acc >= 1:
                    tick()
                    acc -= 1
    enc.stdin.close()
    if enc.wait():
        raise SystemExit('ffmpeg failed')
    browser.close()
    (out / f'tour-{name}-{args.lang}.json').write_text(json.dumps({'fps': FPS, 'frames': frame, 'path': path, 'events': events},
                                                                  indent=1), encoding='utf-8')
    print(video, frame, 'frames', f'{frame / FPS:.1f}s')


def main() -> None:
    if args.list or not args.plan:
        for name, (path, steps) in PLANS.items():
            print(f'{name:12} {path:22} {sum(s[-1] for s in steps if s[0] in ("hold", "to", "by")):.1f}s')
        return
    with sync_playwright() as pw:
        for name in args.plan:
            record(pw, name)


if __name__ == '__main__':
    main()
