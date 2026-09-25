"""Render the atlas poster images and per-world thumbnails from the live scene.

The homepage scene has a deterministic capture mode (`/?atlas-capture`):
the camera follows the scroll position without damping and time comes from
`window.__atlas.time`, so every render is reproducible.

Usage (dev or prod server running, from platform/):
  python scripts/capture-atlas-assets.py http://localhost:3000 public
Writes public/images/atlas/poster.webp, poster-portrait.webp and
world-<id>.webp. Requires Python Playwright (`playwright install chromium`).
"""
import io
import os
import sys
import time

from playwright.sync_api import sync_playwright
from PIL import Image
base, pub = sys.argv[1], sys.argv[2]
HIDE = """header.header, [class*=panel], [class*=strip], [class*=labels], [class*=scrim], nextjs-portal, .skip-link { display: none !important; }
[class*=poster] { display: none !important; }"""

def open_page(b, w, h, dpr):
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    pg.goto(base + '/?atlas-capture', wait_until='networkidle')
    pg.add_style_tag(content=HIDE)
    pg.wait_for_selector('[class*=canvasReady]', timeout=60000)
    info = pg.evaluate("""() => { const j = document.querySelector('#products'); return { top: j.getBoundingClientRect().top + scrollY, dist: j.offsetHeight - innerHeight, stations: j.querySelectorAll('[class*=snap]').length } }""")
    return pg, info

def go(pg, info, k, t=4.0):
    y = info['top'] + k / (info['stations'] - 1) * info['dist']
    pg.evaluate(f'window.__atlas.time = {t}; window.scrollTo(0, {y})')
    time.sleep(1.5)

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    # Posters (station 0)
    pg, info = open_page(b, 1920, 1080, 1)
    go(pg, info, 0)
    Image.open(io.BytesIO(pg.screenshot())).convert('RGB').save(os.path.join(pub, 'images', 'atlas', 'poster.webp'), quality=80, method=6)
    # Thumbnails from each world stop
    ids = pg.evaluate("() => [...document.querySelectorAll('[class*=indexList] a[id^=project-]')].map(a => a.id.replace('project-', ''))")
    for i, wid in enumerate(ids):
        go(pg, info, i + 1)
        pr = pg.evaluate(f'window.__atlas.projected[{i}]')
        shot = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
        r = pr['r'] * 1.06
        box = (int(pr['x'] - r), int(pr['y'] - r), int(pr['x'] + r), int(pr['y'] + r))
        shot.crop(box).resize((320, 320), Image.LANCZOS).save(os.path.join(pub, 'images', 'atlas', f'world-{wid}.webp'), quality=82, method=6)
        print(wid, box)
    pg.close()
    pg, info = open_page(b, 540, 960, 2)
    go(pg, info, 0)
    Image.open(io.BytesIO(pg.screenshot())).convert('RGB').save(os.path.join(pub, 'images', 'atlas', 'poster-portrait.webp'), quality=80, method=6)
    b.close()
print('done')
