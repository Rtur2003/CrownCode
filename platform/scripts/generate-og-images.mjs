// Builds the 1200×630 social preview cards in public/og/ from the project
// artwork. Run after changing artwork or project names:
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
  { file: 'default', art: 'images/showroom/crown-studio.webp', title: 'CrownCode', line: 'Sound · Data · Web' },
  { file: 'ai-music-detection', art: 'images/showroom/world-auris.webp', title: 'AURIS', line: 'AI Music Detection' },
  { file: 'data-manipulation', art: 'images/showroom/tape-study.webp', title: 'ML Toolkit', line: 'Audio Dataset Tools' },
  { file: 'creator-studio', art: 'images/auris/hero-wave.webp', title: 'Creator Studio', line: 'Tempo & Key-Matched Remix' },
  { file: 'crown-commend', art: 'images/showroom/world-commend.webp', title: 'Crown Commend', line: 'YouTube Comment Writer' },
  { file: 'crown-fortune', art: 'images/showroom/world-fortune.webp', title: 'Crown Destiny', line: 'Daily Fortune' },
  { file: 'crown-dreams', art: 'images/showroom/world-dreams.webp', title: 'Crown Dreams', line: 'Dream Journal' },
  { file: 'crown-vote', art: 'images/showroom/world-votryx.webp', title: 'VOTRYX', line: 'Desktop Voting Automation' },
  { file: 'noir-grain', art: 'images/noir-grain/hero.png', title: 'Noir & Grain', line: 'Cinematic Restaurant Template' },
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

for (const card of CARDS) {
  const background = await sharp(pub(card.art))
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .modulate({ brightness: 0.85 })
    .toBuffer()
  const out = pub('og', `${card.file}.jpg`)
  await sharp(background)
    .composite([
      { input: overlay(card), top: 0, left: 0 },
      { input: logo, top: 72, left: 68 },
    ])
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(out)
  console.log(`${path.relative(root, out)}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`)
}
