"""Screenshot release cards on the music site, with where each card sits.

For every title given, finds the card in the site's discography (the last
match on the page, below the "Discography" heading), scrolls it to the middle
of a phone screen, lets the smooth scroll settle, and writes a 3x screenshot
plus the card's box, so an edit can push in on it.

Usage (from platform/):
  python scripts/capture-release-cards.py --url https://hasan-arthur-altuntas.com.tr/ \
      --title "BEFORE DAWN" --title "NULL VECTOR" [--out assets-src/video/music/site]
Writes <out>/<slug>.png and adds to <out>/cards.json ({title: {file, box: [x0, y0, x1, y1] as shares}}).
Requires playwright (python).
"""
import argparse
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', required=True)
parser.add_argument('--title', action='append', required=True)
parser.add_argument('--out', default='assets-src/video/music/site')
parser.add_argument('--scale', type=float, default=3)
args = parser.parse_args()

W, H = 540, 960
FIND = r"""
(title) => {
  const t = title.toLowerCase().replace(/\s+/g, ' ')
  const heading = [...document.querySelectorAll('h1,h2,h3')].find((h) => /discography|diskografi/i.test(h.textContent))
  const floor = heading ? heading.getBoundingClientRect().top + scrollY : 0
  const hits = [...document.querySelectorAll('h3,h4,p,span,strong,a,div')].filter((e) => {
    if (e.children.length > 2) return false
    const s = e.textContent.trim().toLowerCase().replace(/\s+/g, ' ')
    return s.startsWith(t) && s.length < t.length + 90 && e.getBoundingClientRect().top + scrollY > floor
  })
  // the card: the nearest ancestor that also holds the cover image, and is card-sized
  // (the latest match that has one; a marquee repeating the title does not)
  for (const hit of hits.reverse()) {
    let el = hit
    while (el && !el.querySelector('img')) el = el.parentElement
    if (el && el.getBoundingClientRect().height < innerHeight * 0.7) {
      el.setAttribute('data-release-card', title)
      return true
    }
  }
  return null
}
"""


def slug(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:48]


def main() -> None:
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    index = out / 'cards.json'
    cards = json.loads(index.read_text(encoding='utf-8')) if index.exists() else {}
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = browser.new_context(viewport={'width': W, 'height': H}, device_scale_factor=args.scale, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.goto(args.url, wait_until='networkidle', timeout=120000)
        page.wait_for_timeout(4000)
        page.add_style_tag(content='nextjs-portal { display: none !important; }')
        for title in args.title:
            if not page.evaluate(FIND, title):
                print(f'  no card for "{title}"')
                continue
            card = page.locator(f'[data-release-card="{title}"]').first
            card.scroll_into_view_if_needed()
            page.evaluate("(t) => document.querySelector(`[data-release-card=\"${t}\"]`).scrollIntoView({ block: 'center' })", title)
            page.wait_for_timeout(1800)  # smooth scroll and lazy images settle
            box = card.bounding_box()
            name = slug(title) + '.png'
            page.screenshot(path=str(out / name))
            cards[title] = {'file': name, 'box': [round(box['x'] / W, 4), round(box['y'] / H, 4),
                                                  round((box['x'] + box['width']) / W, 4), round((box['y'] + box['height']) / H, 4)]}
            print(title, cards[title]['box'])
        browser.close()
    index.write_text(json.dumps(cards, indent=1, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()
