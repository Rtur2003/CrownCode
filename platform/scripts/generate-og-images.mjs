// Builds the 1200×630 social preview cards in public/og/ from the atlas:
// the rendered poster for the site card, and each world's render on the
// atlas sky for project pages. Run after re-rendering the atlas assets:
//   node scripts/generate-og-images.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pub = (...p) => path.join(root, 'public', ...p)
const W = 1200
const H = 630

const CARDS = [
  { file: 'default', title: 'CrownCode', line: 'Sound · Data · Web' },
  { file: 'ai-music-detection', world: 'ai-music-detection', title: 'AURIS', line: 'AI Music Detection' },
  { file: 'data-manipulation', world: 'ml-toolkit', title: 'ML Toolkit', line: 'Audio Dataset Tools' },
  { file: 'creator-studio', world: 'ai-music-detection', title: 'Creator Studio', line: 'Tempo & Key-Matched Remix' },
  { file: 'crown-commend', world: 'crown-commend', title: 'Crown Commend', line: 'YouTube Comment Writer' },
  { file: 'crown-fortune', world: 'crown-fortune', title: 'Crown Destiny', line: 'Daily Fortune' },
  { file: 'crown-dreams', world: 'crown-dreams', title: 'Crown Dreams', line: 'Dream Journal' },
  { file: 'crown-vote', world: 'crown-vote', title: 'VOTRYX', line: 'Desktop Voting Automation' },
  { file: 'noir-grain', world: 'noir-grain', title: 'Noir & Grain', line: 'Cinematic Restaurant Template' },
]

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function overlay({ title, line }) {
  const size = title.length > 12 ? 92 : 112
  return Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#0b0a08" stop-opacity="0.96"/>
      <stop offset="0.52" stop-color="#0b0a08" stop-opacity="0.72"/>
      <stop offset="1" stop-color="#0b0a08" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" x2="1">
      <stop offset="0" stop-color="#f3dca0"/>
      <stop offset="1" stop-color="#c99347"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  <rect x="72" y="238" width="64" height="3" fill="url(#gold)"/>
  <text x="72" y="${238 + 24 + size}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" fill="#f4ede3" letter-spacing="-1">${escape(title)}</text>
  <text x="74" y="${238 + 24 + size + 62}" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-style="italic" fill="#e7c77a">${escape(line)}</text>
  <text x="74" y="${H - 64}" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#c8b9a7" letter-spacing="2">CROWNCODE · hasan-arthur-altuntas.xyz</text>
</svg>`)
}

fs.mkdirSync(pub('og'), { recursive: true })

const circle = Buffer.from('<svg width="112" height="112"><circle cx="56" cy="56" r="56"/></svg>')
const logo = await sharp(pub('logo-main.png'))
  .resize(112, 112)
  .composite([{ input: circle, blend: 'dest-in' }])
  .png()
  .toBuffer()

const WORLD = 470
const worldMask = Buffer.from(`<svg width="${WORLD}" height="${WORLD}"><circle cx="${WORLD / 2}" cy="${WORLD / 2}" r="${WORLD / 2}"/></svg>`)
const halo = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="h" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0.55" stop-color="#e7c77a" stop-opacity="0.22"/><stop offset="1" stop-color="#e7c77a" stop-opacity="0"/>
  </radialGradient></defs>
  <circle cx="${W - 300}" cy="${H / 2}" r="${WORLD * 0.72}" fill="url(#h)"/>
</svg>`)

for (const card of CARDS) {
  const layers = [{ input: overlay(card), top: 0, left: 0 }, { input: logo, top: 72, left: 68 }]
  let background
  if (card.world) {
    background = await sharp(pub('images/atlas/nebula.webp'))
      .extract({ left: 520, top: 160, width: 1200, height: 630 })
      .modulate({ brightness: 0.9 })
      .toBuffer()
    const world = await sharp(pub(`images/atlas/world-${card.world}.webp`))
      .resize(WORLD, WORLD)
      .composite([{ input: worldMask, blend: 'dest-in' }])
      .png()
      .toBuffer()
    layers.unshift({ input: halo, top: 0, left: 0 }, { input: world, top: (H - WORLD) / 2, left: W - 300 - WORLD / 2 })
  } else {
    background = await sharp(pub('images/atlas/poster.webp')).resize(W, H, { fit: 'cover', position: 'right' }).toBuffer()
  }
  const out = pub('og', `${card.file}.jpg`)
  await sharp(background)
    .composite(layers)
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(out)
  console.log(`${path.relative(root, out)}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`)
}
