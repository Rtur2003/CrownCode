import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/images/showroom')
const SIZE = 1024
const CENTER = SIZE / 2
const RADIUS = 446

function random(seed) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function line(points, closed = false) {
  return `M ${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}${closed ? ' Z' : ''}`
}

function sweep(y, phase = 0, amplitude = 16, tilt = -0.1) {
  const points = []
  for (let x = 35; x <= 995; x += 11) {
    const t = x / SIZE
    points.push([x, y + Math.sin(t * 11 + phase) * amplitude + Math.sin(t * 27 + phase * 0.72) * amplitude * 0.22 + (x - 512) * tilt])
  }
  return line(points)
}

function loop(cx, cy, rx, ry, phase, wobble = 7) {
  const points = []
  for (let i = 0; i < 96; i++) {
    const a = i * Math.PI * 2 / 96
    const distortion = Math.sin(a * 5 + phase) * wobble + Math.sin(a * 11 - phase * 1.7) * wobble * 0.42
    points.push([cx + Math.cos(a) * (rx + distortion), cy + Math.sin(a) * (ry + distortion * 0.7)])
  }
  return line(points, true)
}

function grains(seed, count, color, opacity = 0.14) {
  const next = random(seed)
  const marks = []
  for (let i = 0; i < count; i++) {
    const a = next() * Math.PI * 2
    const r = Math.sqrt(next()) * RADIUS * 0.97
    const x = CENTER + Math.cos(a) * r
    const y = CENTER + Math.sin(a) * r
    const size = 0.4 + next() * (i % 11 === 0 ? 2.2 : 1.1)
    marks.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${color}" opacity="${(opacity * (0.3 + next() * 0.7)).toFixed(2)}"/>`)
  }
  return marks.join('')
}

function sharedTerrain(seed, metal) {
  const next = random(seed)
  const strokes = []
  for (let i = 0; i < 33; i++) {
    const y = 110 + i * 25 + next() * 10
    strokes.push(`<path d="${sweep(y, i * 0.24, 13 + next() * 15, -0.05)}" fill="none" stroke="${i % 7 === 0 ? metal : '#8f8070'}" stroke-width="${i % 7 === 0 ? 1.2 : 0.55}" opacity="${i % 7 === 0 ? 0.18 : 0.09}"/>`)
  }
  return `${strokes.join('')}${grains(seed + 137, 1150, '#d6b891', 0.16)}`
}

function auris() {
  const strips = []
  for (let i = 0; i < 37; i++) {
    const y = 199 + i * 17
    const amp = 3 + (Math.sin(i * 0.82) + 1) * 5 + (i > 13 && i < 25 ? 10 : 0)
    const color = i % 9 === 0 ? '#ebbb78' : i % 3 === 0 ? '#b5774e' : '#67574a'
    strips.push(`<path d="${sweep(y, i * 0.62, amp, -0.12)}" fill="none" stroke="${color}" stroke-width="${i % 9 === 0 ? 2.6 : 1.15}" opacity="${i % 9 === 0 ? 0.62 : 0.36}"/>`)
  }
  const notes = []
  for (let i = 0; i < 68; i++) {
    const x = 185 + i * 10.2
    const height = 9 + 28 * Math.abs(Math.sin(i * 0.51) * Math.cos(i * 0.17))
    const y = 512 + Math.sin(i * 0.55) * 20
    notes.push(`<path d="M ${x.toFixed(1)} ${(y - height).toFixed(1)} V ${(y + height).toFixed(1)}" stroke="#dcaa70" stroke-width="${i % 9 === 0 ? 2 : 0.8}" opacity="${i % 9 === 0 ? 0.47 : 0.22}"/>`)
  }
  return `<g transform="rotate(-11 512 512)">${strips.join('')}${notes.join('')}</g>`
}

function ml() {
  const grid = []
  for (let i = -8; i <= 8; i++) {
    const x = 512 + i * 54
    grid.push(`<path d="M ${x} 85 C ${x - 90 - i * 10} 370 ${x + 65 + i * 6} 705 ${x} 950" fill="none" stroke="#9ba7a4" stroke-width="${i % 4 === 0 ? 1.7 : 0.9}" opacity="${i % 4 === 0 ? 0.48 : 0.29}"/>`)
  }
  for (let i = -7; i <= 7; i++) {
    const y = 512 + i * 51
    grid.push(`<path d="M 65 ${y} C 340 ${y + i * 16} 681 ${y - i * 14} 960 ${y}" fill="none" stroke="#8a9897" stroke-width="1" opacity="0.31"/>`)
  }
  const nodes = [[251,304],[335,346],[420,289],[483,413],[590,351],[686,428],[747,344],[278,560],[386,493],[507,567],[626,549],[737,598],[313,717],[440,667],[559,741],[680,688],[795,734]]
  const route = [[251,304],[335,346],[420,289],[483,413],[590,351],[686,428],[626,549],[737,598],[680,688],[559,741]]
  const link = `<path d="${line(route)}" fill="none" stroke="#d1b07d" stroke-width="2.4" opacity="0.68"/>`
  const dots = nodes.map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="${i % 4 === 0 ? 5.5 : 3}" fill="${i % 4 === 0 ? '#ddc29b' : '#728b88'}" opacity="0.74"/>`).join('')
  return `<g transform="rotate(-14 512 512)">${grid.join('')}${link}${dots}</g>`
}

function fortune() {
  const circles = [115,220,339,415].map((r,i) => `<circle cx="528" cy="498" r="${r}" fill="none" stroke="${i === 1 ? '#d4aa68' : '#ab8251'}" stroke-width="${i === 1 ? 2.2 : 1}" opacity="${i === 1 ? 0.6 : 0.4}"/>`).join('')
  const sectors = []
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 22
    const x = 528 + Math.cos(a) * 430
    const y = 498 + Math.sin(a) * 430
    sectors.push(`<path d="M 528 498 L ${x.toFixed(1)} ${y.toFixed(1)}" stroke="${i === 3 ? '#e4ba78' : '#b09572'}" stroke-width="${i === 3 ? 2.4 : 0.9}" opacity="${i === 3 ? 0.67 : 0.29}"/>`)
    const dotX = 528 + Math.cos(a + Math.PI / 22) * 277
    const dotY = 498 + Math.sin(a + Math.PI / 22) * 277
    sectors.push(`<circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="1.5" fill="#ead0a2" opacity="0.55"/>`)
  }
  return `<g transform="rotate(-18 512 512)">${sectors.join('')}${circles}<circle cx="528" cy="498" r="13" fill="#3b2e21" stroke="#dcab68" stroke-width="1.5" opacity="0.9"/></g>`
}

function dreams() {
  const contours = []
  for (let i = 0; i < 33; i++) {
    const rx = 24 + i * 14
    const ry = 15 + i * 11
    contours.push(`<path d="${loop(582 + Math.sin(i * 0.26) * 40, 460 + Math.cos(i * 0.2) * 25, rx, ry, i * 0.29, 4 + i * 0.27)}" fill="none" stroke="${i % 5 === 0 ? '#b0a0ad' : '#6c606d'}" stroke-width="${i % 5 === 0 ? 1.8 : 0.9}" opacity="${i % 5 === 0 ? 0.53 : 0.31}"/>`)
  }
  return `<g transform="rotate(-17 512 512)">${contours.join('')}<path d="M 255 515 C 365 366 501 437 610 343 C 710 271 790 339 842 406" fill="none" stroke="#d0afbe" stroke-width="2.2" opacity="0.37"/></g>`
}

function commend() {
  const bands = []
  for (let i = 0; i < 45; i++) {
    const y = 183 + i * 15
    const amp = 8 + 34 * Math.abs(Math.sin(i * 0.19))
    bands.push(`<path d="${sweep(y, i * 0.37, amp, -0.025)}" fill="none" stroke="${i % 7 === 0 ? '#e1ae8e' : i % 3 === 0 ? '#ae766b' : '#705452'}" stroke-width="${i % 7 === 0 ? 2 : 0.8}" opacity="${i % 7 === 0 ? 0.58 : 0.32}"/>`)
  }
  return `<g transform="rotate(-24 512 512)">${bands.join('')}<path d="${sweep(518, 4.2, 51, -0.025)}" fill="none" stroke="#e3bc9b" stroke-width="3.3" opacity="0.44"/></g>`
}

function votryx() {
  const next = random(3443)
  const zones = []
  for (let i = 0; i < 15; i++) {
    zones.push(`<path d="${loop(522, 496, 75 + i * 23, 52 + i * 18, i * 0.31, 8 + i * 0.3)}" fill="none" stroke="${i % 4 === 0 ? '#aeb58a' : '#7c886e'}" stroke-width="${i % 4 === 0 ? 1.4 : 0.7}" opacity="${i % 4 === 0 ? 0.32 : 0.2}"/>`)
  }
  const points = []
  for (let i = 0; i < 28; i++) {
    const a = next() * Math.PI * 2
    const r = 75 + next() * 300
    points.push([512 + Math.cos(a) * r, 512 + Math.sin(a) * r])
  }
  const routes = [[1,7,13,19,24],[3,9,17,22],[0,6,11,15,27]].map((route,i) => `<path d="${line(route.map(index => points[index]))}" fill="none" stroke="${i === 1 ? '#c4b18a' : '#9ba47b'}" stroke-width="${i === 1 ? 1.8 : 1.2}" stroke-dasharray="${i === 2 ? '3 8' : 'none'}" opacity="0.43"/>`).join('')
  const dots = points.map(([x,y],i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 6 === 0 ? 6 : 2.7}" fill="${i % 6 === 0 ? '#d7c49b' : '#9fa581'}" opacity="0.75"/>`).join('')
  return `<g transform="rotate(-12 512 512)">${zones.join('')}${routes}${dots}</g>`
}

function noir() {
  const flecks = grains(9404, 2200, '#ba8b59', 0.32)
  const fissures = []
  for (let i = 0; i < 7; i++) {
    const y = 209 + i * 104
    fissures.push(`<path d="${sweep(y, i * 0.89, 25 + i * 4, -0.18)}" fill="none" stroke="${i % 2 ? '#6d5746' : '#d7a46b'}" stroke-width="${i === 3 ? 3.1 : 1.3}" opacity="${i === 3 ? 0.67 : 0.32}"/>`)
  }
  const basalt = []
  for (let i = 0; i < 23; i++) {
    const x = 150 + i * 34
    basalt.push(`<path d="M ${x} 182 C ${x - 28} 355 ${x + 67} 486 ${x + 18} 828" fill="none" stroke="#a89175" stroke-width="0.9" opacity="0.12"/>`)
  }
  return `<g transform="rotate(-10 512 512)">${basalt.join('')}${fissures.join('')}${flecks}</g>`
}

function kognita() {
  const next = random(5405)
  const outer = []
  const inner = []
  for (let i = 0; i < 80; i++) {
    const a = next() * Math.PI * 2
    const r = Math.sqrt(next()) * (i < 35 ? 168 : 375)
    const p = [542 + Math.cos(a) * r, 492 + Math.sin(a) * r]
    ;(i < 35 ? inner : outer).push(p)
  }
  const links = []
  for (let i = 0; i < inner.length; i += 3) {
    const end = inner[(i * 7 + 5) % inner.length]
    links.push(`<path d="M ${inner[i][0].toFixed(1)} ${inner[i][1].toFixed(1)} L ${end[0].toFixed(1)} ${end[1].toFixed(1)}" stroke="#aab9b2" stroke-width="1" opacity="0.33"/>`)
  }
  const points = inner.map(([x,y],i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 5 === 0 ? 3.3 : 1.7}" fill="#cbd2bf" opacity="0.65"/>`).join('')
  const external = outer.map(([x,y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="#a5aea6" opacity="0.16"/>`).join('')
  return `${external}<circle cx="542" cy="492" r="188" fill="#151c1b" opacity="0.26"/><circle cx="542" cy="492" r="188" fill="none" stroke="#b7c5b9" stroke-width="2.2" opacity="0.56"/><circle cx="542" cy="492" r="202" fill="none" stroke="#8b9f94" stroke-width="0.7" opacity="0.32"/>${links.join('')}${points}`
}

function generic() {
  const contours = []
  for (let i = 0; i < 22; i++) {
    contours.push(`<path d="${loop(535, 485, 68 + i * 16, 55 + i * 13, i * 0.2, 7)}" fill="none" stroke="${i % 5 === 0 ? '#d0ae77' : '#8e7c65'}" stroke-width="${i % 5 === 0 ? 1.25 : 0.7}" opacity="${i % 5 === 0 ? 0.3 : 0.18}"/>`)
  }
  return contours.join('')
}

const worlds = {
  auris: { seed: 101, metal: '#c89264', accent: '#ad7350', surface: auris },
  ml: { seed: 211, metal: '#91a6a1', accent: '#6b827f', surface: ml },
  fortune: { seed: 307, metal: '#d6aa68', accent: '#ad824d', surface: fortune },
  dreams: { seed: 419, metal: '#a497a9', accent: '#716774', surface: dreams },
  commend: { seed: 503, metal: '#bc8275', accent: '#774d4b', surface: commend },
  votryx: { seed: 607, metal: '#a5ac82', accent: '#6e775b', surface: votryx },
  noir: { seed: 709, metal: '#bd925f', accent: '#594c40', surface: noir },
  kognita: { seed: 811, metal: '#a7b7ad', accent: '#687e77', surface: kognita },
  generic: { seed: 919, metal: '#c4a072', accent: '#88735c', surface: generic },
}

function svg(world) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
    <defs>
      <clipPath id="planet"><circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}"/></clipPath>
      <radialGradient id="base" cx="24%" cy="17%" r="86%">
        <stop offset="0" stop-color="#534231"/><stop offset="0.3" stop-color="#38312b"/><stop offset="0.62" stop-color="#272829"/><stop offset="1" stop-color="#1a1d1e"/>
      </radialGradient>
      <radialGradient id="tint" cx="31%" cy="24%" r="72%">
        <stop offset="0" stop-color="${world.accent}" stop-opacity="0.34"/><stop offset="0.48" stop-color="${world.accent}" stop-opacity="0.07"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f2d0a2" stop-opacity="0.18"/><stop offset="0.29" stop-color="#d5a87a" stop-opacity="0.025"/><stop offset="0.62" stop-color="#06090b" stop-opacity="0.07"/><stop offset="1" stop-color="#030506" stop-opacity="0.23"/>
      </linearGradient>
      <radialGradient id="terminator" cx="29%" cy="24%" r="77%">
        <stop offset="0.27" stop-color="#000" stop-opacity="0"/><stop offset="0.68" stop-color="#000" stop-opacity="0.03"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/>
      </radialGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f2d7a8" stop-opacity="0.75"/><stop offset="0.35" stop-color="${world.metal}" stop-opacity="0.28"/><stop offset="0.7" stop-color="#746957" stop-opacity="0.05"/><stop offset="1" stop-color="#040506" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#planet)">
      <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="url(#base)"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="url(#tint)"/>
      ${sharedTerrain(world.seed, world.metal)}
      ${world.surface()}
      <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="url(#light)"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="url(#terminator)"/>
    </g>
    <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS - 1.1}" fill="none" stroke="url(#edge)" stroke-width="2.5"/>
    <path d="M 109 327 A 446 446 0 0 1 635 84" fill="none" stroke="${world.metal}" stroke-width="3" opacity="0.45"/>
  </svg>`
}

const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',')
for (const [name, world] of Object.entries(worlds)) {
  if (only && !only.includes(name)) continue
  const target = path.join(root, `planet-${name}.webp`)
  await sharp(Buffer.from(svg(world)), { density: 96 })
    .resize(SIZE, SIZE)
    .webp({ quality: 85, effort: 5, alphaQuality: 100 })
    .toFile(target)
  const { width, height, channels } = await sharp(target).metadata()
  process.stdout.write(`${name}: ${width}x${height}, ${channels} channels, ${target}\n`)
}
