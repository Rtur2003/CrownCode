#!/usr/bin/env node
/**
 * Record the CrownCode Atlas journey as a 9:16 reel (1080×1920, 30 fps, H.264).
 *
 * Uses the homepage's deterministic capture mode (`/?atlas-capture`, which
 * exposes `window.__atlas`): camera progress, scene time and the closing
 * pull-back are set per frame, and requestAnimationFrame is stepped by hand,
 * so every frame is rendered exactly once and the result is reproducible.
 * Captions are a DOM overlay drawn from the page's own world list, so a new
 * catalog entry shows up in the reel without editing this script.
 *
 * Usage (a dev or prod server running, from platform/):
 *   node scripts/capture-atlas-reel.mjs [baseUrl] [--lang tr|en] [--out file.mp4] [--audio file.wav] [--keep-frames]
 * Defaults: http://localhost:3000, tr, assets-src/video/atlas-reel-9x16.mp4
 * Audio: --audio muxes a soundtrack (scripts/generate-reel-soundtrack.py
 * writes one locked to this timeline); without it the audio track is silent.
 * Writes the mp4 plus a poster .jpg next to it. Needs ffmpeg on PATH and
 * Playwright (`npm i -g playwright` or PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs).
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const base = (args.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3000').replace(/\/$/, '')
const lang = flag('lang', 'tr') === 'en' ? 'en' : 'tr'
const out = path.resolve(root, flag('out', 'assets-src/video/atlas-reel-9x16.mp4'))
const keepFrames = args.includes('--keep-frames')
const audio = flag('audio', '') ? path.resolve(root, flag('audio', '')) : ''
/** `--stills 0.5,6.2` renders just those moments (seconds) as PNGs, for checking the layout. */
const stills = flag('stills', '')?.split(',').filter(Boolean).map(Number) ?? []

const FPS = 30
// CSS viewport at 2× = 1080×1920 device pixels (portrait framing in the scene).
const VIEW = { width: 540, height: 960, scale: 2 }

// Timeline (seconds): hold on the intro, then a move + a dwell per world.
const T = { intro: 1.3, travel: 1.1, dwell: 0.75, outro: 2.4 }

const COPY = {
  tr: { tagline: 'Ses, veri ve web üzerine bağımsız işler.', end: 'Atlas · rotanın sonu', route: (n) => `${n} dünya, tek rota.` },
  en: { tagline: 'Independent work across sound, data and the web.', end: 'Atlas · end of route', route: (n) => `${n} worlds, one route.` },
}

async function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/node22/lib/node_modules/playwright/index.mjs']
  for (const c of candidates.filter(Boolean)) {
    try {
      return await import(path.isAbsolute(c) ? pathToFileURL(c).href : c)
    } catch {
      // try the next one
    }
  }
  throw new Error('Playwright not found: npm i -g playwright, or set PLAYWRIGHT_MODULE')
}

const clamp = (x) => Math.min(1, Math.max(0, x))
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/**
 * Scene state at time t. `s` is the station coordinate (0 = intro,
 * 1..count = worlds, count + 1 = outro); `target` is the scroll progress the
 * scene expects. Travels map onto the eased middle of each stationEase
 * segment (0.14..0.86), so the camera glides between still dwells.
 */
function timeline(t, count) {
  const stations = count + 2
  const segments = stations - 1
  const toTarget = (k, tau) => (k + (tau <= 0 ? 0 : tau >= 1 ? 1 : 0.14 + 0.72 * tau)) / segments
  let clock = t - T.intro
  if (clock < 0) {return { s: 0, target: 0, exit: 0 }}
  for (let k = 0; k < segments; k++) {
    if (clock < T.travel) {
      const tau = clock / T.travel
      return { s: k + smoothstep(0, 1, tau), target: toTarget(k, tau), exit: 0 }
    }
    clock -= T.travel
    const dwell = k + 1 < segments ? T.dwell : T.outro
    if (clock < dwell || k + 1 === segments) {
      // The last stop drifts back and up over the whole route.
      const exit = k + 1 === segments ? 0.55 * smoothstep(0, T.outro, clock) : 0
      return { s: k + 1, target: (k + 1) / segments, exit }
    }
    clock -= dwell
  }
  return { s: segments, target: 1, exit: 0.55 }
}

const OVERLAY_CSS = `
  header.header, [class*=panel], [class*=strip], [class*=labels], [class*=scrim], [class*=poster],
  nextjs-portal, .skip-link { display: none !important; }
  html, body { overflow: hidden !important; }
  #reel { position: fixed; inset: 0; z-index: 99999; pointer-events: none; color: #f3e9d8;
    font-family: var(--font-family-base); }
  #reel .shade { position: absolute; inset: 0;
    background: linear-gradient(180deg, #07070a66 0%, #07070a00 16%, #07070a00 50%, #07070acc 78%, #07070af0 100%); }
  #reel .block { position: absolute; left: 34px; right: 72px; bottom: 236px; }
  #reel .eyebrow { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 0 0 14px; color: #d6ab6b;
    font-family: var(--font-family-mono); font-size: 13px; letter-spacing: .2em; text-transform: uppercase; }
  #reel .eyebrow b { color: var(--world, #d6ab6b); font-weight: 400; }
  #reel h1, #reel h2 { margin: 0; font-family: var(--font-family-heading); font-weight: 400; line-height: .95;
    letter-spacing: -.01em; color: #f3e9d8; text-shadow: 0 2px 24px #0009; }
  #reel h1 { font-size: 58px; }
  #reel [data-part=intro] { bottom: 212px; } /* clear of the crown in the opening shot */
  #reel h2 { font-size: 54px; }
  #reel p.lead { margin: 14px 0 0; color: #e6d8c5; font-size: 19px; line-height: 1.35; }
  #reel .url { margin: 20px 0 0; color: #d6ab6b; font-family: var(--font-family-mono); font-size: 15px; letter-spacing: .08em; }
  #reel .track { position: absolute; left: 34px; bottom: 198px; width: 236px; height: 12px; }
  #reel .track .line { position: absolute; left: 0; right: 0; top: 5.5px; height: 1px; background: #d6ab6b40; }
  #reel .track .fill { position: absolute; left: 0; top: 5.5px; height: 1px; width: 100%; background: #e7c77a;
    transform-origin: left; }
  #reel .track i { position: absolute; top: 2px; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%;
    border: 1px solid #d6ab6b88; background: #0d0b09; box-sizing: border-box; }
  #reel .track i.on { border-color: var(--world); background: var(--world); box-shadow: 0 0 12px var(--world); }
`

async function setup(context, count0) {
  const page = await context.newPage()
  page.on('pageerror', (e) => console.warn('[page]', e.message.slice(0, 160)))
  await page.goto(`${base}${lang === 'en' ? '/en' : '/'}?atlas-capture`, { waitUntil: 'networkidle', timeout: 180000 })
  await page.waitForSelector('[class*=canvasReady]', { timeout: 120000 })
  const worlds = await page.evaluate(() => [...document.querySelectorAll('[class*=indexList] a[id^=project-]')].map((a) => ({
    name: a.querySelector('strong')?.textContent?.trim() ?? '',
    sector: (a.querySelector('[class*=indexSector]')?.textContent ?? '').split(' · ').slice(0, -1).join(' · '),
    accent: a.style.getPropertyValue('--world') || '#d6ab6b',
  })))
  if (!worlds.length || (count0 && worlds.length !== count0)) {throw new Error('Could not read the world list from the page')}
  const copy = COPY[lang]
  const intro = await page.evaluate(() => ({
    eyebrow: document.querySelector('[class*=panel] [class*=eyebrow]')?.textContent ?? '',
    title: document.querySelector('#showroom-title')?.textContent ?? 'CrownCode',
  }))
  await page.addStyleTag({ content: OVERLAY_CSS })
  await page.evaluate(({ worlds, intro, tagline, end, route, host }) => {
    const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
    const n = worlds.length
    const pad = (i) => String(i).padStart(2, '0')
    const el = document.createElement('div')
    el.id = 'reel'
    el.innerHTML = `
      <div class="shade"></div>
      <div class="block" data-part="intro"><p class="eyebrow">${esc(intro.eyebrow)}</p><h1>${esc(intro.title)}</h1><p class="lead">${esc(tagline)}</p></div>
      ${worlds.map((w, i) => `<div class="block" data-part="w${i}" style="--world:${w.accent}"><p class="eyebrow"><b>${pad(i + 1)} / ${pad(n)}</b><span>${esc(w.sector)}</span></p><h2>${esc(w.name)}</h2></div>`).join('')}
      <div class="block" data-part="outro"><p class="eyebrow">${esc(end)}</p><h2>${esc(route)}</h2><p class="url">${esc(host)}</p></div>
      <div class="track" data-part="track"><span class="line"></span><span class="fill"></span>
        ${worlds.map((w, i) => `<i style="left:${(i / (n - 1)) * 100}%;--world:${w.accent}"></i>`).join('')}</div>`
    document.body.append(el)
  }, { worlds, intro, tagline: copy.tagline, end: copy.end, route: copy.route(worlds.length), host: 'hasan-arthur-altuntas.xyz' })
  await page.evaluate(`window.__reelPaint = ${paint.toString()}; window.__reelToken = ${Date.now()}`)
  await page.evaluate(() => document.fonts.ready)
  // Let textures upload and shaders compile with the normal loop, then take over.
  await page.waitForTimeout(3500)
  await page.evaluate(() => window.__reelManual())
  await page.waitForTimeout(200)
  return { page, worlds }
}

/** Per-frame overlay state, written straight to the DOM. Runs in the page, so self-contained. */
function paint({ s, count }) {
  const clamp = (x) => Math.min(1, Math.max(0, x))
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a))
    return t * t * (3 - 2 * t)
  }
  const nearest = Math.round(s)
  const dwell = 1 - smoothstep(0.1, 0.34, Math.abs(s - nearest))
  const set = (part, opacity, rise = 0) => {
    const el = document.querySelector(`#reel [data-part="${part}"]`)
    if (!el) {return}
    el.style.opacity = opacity.toFixed(3)
    el.style.transform = `translate3d(0, ${(rise * (1 - opacity)).toFixed(2)}px, 0)`
  }
  set('intro', nearest === 0 ? dwell : 0, 14)
  for (let i = 0; i < count; i++) {set(`w${i}`, nearest === i + 1 ? dwell : 0, 14)}
  set('outro', nearest === count + 1 ? dwell : 0, 14)
  const onRoute = smoothstep(0.15, 0.6, s) * (1 - smoothstep(count + 0.4, count + 0.85, s))
  set('track', onRoute)
  const fill = document.querySelector('#reel .fill')
  if (fill) {fill.style.transform = `scaleX(${clamp((s - 1) / (count - 1)).toFixed(4)})`}
  document.querySelectorAll('#reel .track i').forEach((dot, i) => dot.classList.toggle('on', s >= i + 1 - 0.35))
}

async function main() {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
  const context = await browser.newContext({ viewport: { width: VIEW.width, height: VIEW.height }, deviceScaleFactor: VIEW.scale, locale: lang })
  // No hot reloads mid-recording: the dev server's HMR socket goes nowhere.
  await context.routeWebSocket(/\/_next\/(hmr|webpack-hmr|turbopack-hmr)/, () => {})
  // Hand-stepped requestAnimationFrame: nothing renders between captures.
  await context.addInitScript(() => {
    const native = window.requestAnimationFrame.bind(window)
    const nativeCancel = window.cancelAnimationFrame.bind(window)
    let manual = false
    let queue = new Map()
    let id = 1e7
    window.requestAnimationFrame = (cb) => {
      if (!manual) {return native(cb)}
      queue.set(++id, cb)
      return id
    }
    window.cancelAnimationFrame = (i) => { if (!queue.delete(i)) {nativeCancel(i)} }
    window.__reelManual = () => { manual = true }
    window.__reelStep = (ts) => {
      const q = queue
      queue = new Map()
      q.forEach((cb) => cb(ts))
    }
  })

  const first = await setup(context)
  const worlds = first.worlds
  let page = first.page
  const count = worlds.length
  const segments = count + 1
  const duration = T.intro + segments * T.travel + (count) * T.dwell + T.outro
  const total = Math.round(duration * FPS)
  const todo = stills.length ? stills.map((t) => Math.round(t * FPS)) : Array.from({ length: total }, (_, f) => f)
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-reel-'))
  console.log(`${count} worlds · ${duration.toFixed(2)} s · ${total} frames → ${frames}`)

  const started = Date.now()
  for (const [n, f] of todo.entries()) {
    const t = f / FPS
    const { s, target, exit } = timeline(t, count)
    const token = () => page.evaluate(() => (window.__atlas && document.getElementById('reel') && window.__reelToken) || 0).catch(() => 0)
    // A reload between setting the frame and the screenshot would record a
    // half-loaded page: check the document is the same one on both sides.
    for (let attempt = 0; ; attempt++) {
      let before = await token()
      if (!before) {
        if (attempt > 3) {throw new Error(`page keeps resetting at frame ${f}`)}
        console.warn(`page reset at frame ${f}; setting up again`)
        await page.close().catch(() => {})
        ;({ page } = await setup(context, count))
        before = await token()
      }
      const drawn = await page.evaluate(({ target, exit, time, s, count, ts }) => {
        Object.assign(window.__atlas, { target, exit, time, highlight: -1, warp: 0 })
        window.__reelPaint({ s, count })
        window.__reelStep(ts)
        return true
      }, { target, exit, time: 2 + t, s, count, ts: 1e5 + t * 1000 }).catch(() => false)
      const shot = drawn && await page.screenshot({ path: path.join(frames, `${String(f).padStart(5, '0')}.png`) }).catch(() => null)
      if (shot && (await token()) === before) {break}
    }
    if (n % 30 === 0) {
      const rate = (Date.now() - started) / (n + 1)
      console.log(`frame ${f}/${total} · ${(rate / 1000).toFixed(2)} s/frame · ~${Math.round(((todo.length - n) * rate) / 60000)} min left`)
    }
  }
  await browser.close()
  if (stills.length) {
    console.log(`stills in ${frames}`)
    return
  }

  fs.mkdirSync(path.dirname(out), { recursive: true })
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', String(FPS), '-i', path.join(frames, '%05d.png'),
    ...(audio ? ['-i', audio] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']),
    '-map', '0:v', '-map', '1:a', '-shortest',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-level:v', '4.1',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-g', String(FPS * 2),
    '-c:a', 'aac', '-b:a', audio ? '192k' : '128k',
    '-movflags', '+faststart', out,
  ], { stdio: 'inherit' })
  // Cover: the intro title fully in, before the first move.
  const posterFrame = Math.round(Math.min(T.intro - 0.2, 1.0) * FPS)
  const poster = out.replace(/\.mp4$/, '.jpg')
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(frames, `${String(posterFrame).padStart(5, '0')}.png`), '-q:v', '2', poster], { stdio: 'inherit' })
  if (!keepFrames) {fs.rmSync(frames, { recursive: true, force: true })}
  console.log(`wrote ${path.relative(root, out)} and ${path.relative(root, poster)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
