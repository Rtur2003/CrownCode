"""Record the 9:16 AURIS reel (1080x1920, 30 fps) from the running site.

The analyses in the reel use DEMO data: the backend is replaced in the
page by a stand-in that answers like /api/analyze/jobs, so nothing is
uploaded and no model runs. The first file comes back AI (81 %), the
second human (22 %). Don't present the numbers as a real song's result.

Time is driven frame by frame (Playwright's fake clock for JS and
requestAnimationFrame, and the Web Animations API for CSS), so the WebGL
world, the step list and every transition move at real speed in the
video however slowly the frames are captured.

Output (video, events) goes to --out, which git ignores; frames go to the
OS temp dir and are deleted once the video is encoded.

Usage (from platform/, with `npm run dev` on :3000):
  python scripts/capture-auris-reel.py [--lang tr|en] [--out assets-src/video/auris]
Then: python scripts/generate-auris-reel-sound.py --events <out>/events.json
Requires playwright (python) and ffmpeg.
"""
import argparse
import datetime
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--lang', default='tr')
parser.add_argument('--out', default='assets-src/video/auris')
parser.add_argument('--base', default='http://localhost:3000')
args = parser.parse_args()

FPS = 30
W, H = 540, 960  # CSS px; captured at 2x
OUT = Path(args.out)
# Frames are scratch (~350 MB); they live in the OS temp dir and go once encoded.
FRAMES = Path(tempfile.gettempdir()) / f'auris-reel-frames-{args.lang}'
URL = f"{args.base}{'/en' if args.lang == 'en' else ''}/ai-music-detection"

CAPTIONS = {
    'tr': {
        'drop': 'Şarkıyı dünyanın üstüne bırak',
        'run': 'Sunucuda modeller tek tek çalışır',
        'verdict': 'Sonuç, eşiğe göre ne kadar uzakta',
        'human': 'İnsan yapımıysa dünya yeşile döner',
        'report': '11 model ne dedi, hangi ölçüm neyi etkiledi',
        'end_q': 'Bu şarkıyı yapay zekâ mı yaptı?',
        'end_s': 'Ücretsiz, üyelik yok',
    },
    'en': {
        'drop': 'Drop a song on the world',
        'run': 'The models run one by one on the server',
        'verdict': 'The result, and how far it is from the threshold',
        'human': 'If people made it, the world turns green',
        'report': 'What 11 models said, and which measurement mattered',
        'end_q': 'Was this song made with AI?',
        'end_s': 'Free, no sign-up',
    },
}[args.lang]

# ── in-page helpers: demo backend, captions, clocked CSS animations ──────

PAGE_SETUP = r"""
(() => {
  const STEPS = ['features', 'vocals', 'wav2vec2', 'clap', 'fst', 'xai', 'meta']
  window.__events = []
  const mark = (name) => window.__events.push([performance.now(), name])
  window.__mark = mark

  // Step timelines (s after the upload), shorter on the second run.
  const PLANS = {
    first: [[0, { features: 'running', vocals: 'running', wav2vec2: 'running', clap: 'running' }],
            [1.4, { clap: 'done' }], [2.1, { features: 'done' }], [2.9, { vocals: 'done', fst: 'running' }],
            [3.5, { wav2vec2: 'done' }], [4.4, { fst: 'done', xai: 'running' }], [5.0, { xai: 'done', meta: 'running' }],
            [5.5, { meta: 'done' }]],
    second: [[0, { features: 'running', vocals: 'running', wav2vec2: 'running', clap: 'running' }],
             [0.6, { clap: 'done' }], [1.0, { features: 'done', vocals: 'done' }], [1.4, { wav2vec2: 'done', fst: 'running' }],
             [1.9, { fst: 'done', xai: 'running' }], [2.2, { xai: 'done', meta: 'running' }], [2.5, { meta: 'done' }]],
  }
  const job = { t0: 0, plan: PLANS.first, end: 5.9, response: null }
  window.__job = job
  const snapshot = () => {
    const el = (performance.now() - job.t0) / 1000
    const state = Object.fromEntries(STEPS.map(s => [s, 'pending']))
    const secs = {}
    for (const [at, ch] of job.plan) if (el >= at) {
      Object.assign(state, ch)
      for (const k of Object.keys(ch)) if (ch[k] !== 'running') secs[k] = +(at * 1.7 + 0.3).toFixed(1)
    }
    const done = el >= job.end
    return { jobId: 'demo', status: done ? 'done' : 'running', phase: done ? 'done' : 'running', elapsedSec: el,
      steps: STEPS.map(id => ({ id, state: state[id], ...(secs[id] ? { seconds: secs[id] } : {}) })),
      response: done ? job.response : null }
  }
  const origFetch = window.fetch
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input.url
    if (url.includes('/api/analyze/jobs/demo')) {
      if (init && init.method === 'DELETE') return Promise.resolve(new Response('{}'))
      return Promise.resolve(new Response(JSON.stringify(snapshot()), { status: 200, headers: { 'content-type': 'application/json' } }))
    }
    if (url.includes('/api/health')) {
      return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'content-type': 'application/json' } }))
    }
    return origFetch(input, init)
  }
  class DemoXHR {
    constructor() { this.upload = {}; this.status = 0; this.response = null; this.responseType = ''; this.timeout = 0 }
    open() {}
    abort() { this.onabort && this.onabort() }
    send(form) {
      const total = form.get('file') ? form.get('file').size : 100
      let loaded = 0
      mark('upload')
      const tick = () => {
        loaded = Math.min(total, loaded + total / 8)
        this.upload.onprogress && this.upload.onprogress({ lengthComputable: true, loaded, total })
        if (loaded < total) { setTimeout(tick, 110) } else {
          this.upload.onload && this.upload.onload()
          job.t0 = performance.now()
          mark('processing')
          this.status = 202
          this.response = { jobId: 'demo', status: 'running', phase: 'running', steps: STEPS.map(id => ({ id, state: 'pending' })), elapsedSec: 0, response: null }
          setTimeout(() => this.onload && this.onload(), 30)
        }
      }
      setTimeout(tick, 120)
    }
  }
  window.XMLHttpRequest = DemoXHR

  // Demo result, shaped like the backend's AnalyzeResponse.
  const names = ['LightGBM', 'Deep MLP (512-256-128-64)', 'XGBoost', 'Residual MLP (3 blocks)', 'Gradient Boosting', 'Random Forest', 'Attention MLP', 'SVM (RBF)', 'MLP Neural Network', 'Logistic Regression', '1D-CNN']
  const mk = (name, label, labelEn, category, value, z, shap) => ({ name, label, labelEn, category, value, zScore: z, shapValue: shap, direction: shap > 0.001 ? 'towards_ai' : shap < -0.001 ? 'towards_human' : 'neutral', description: '' })
  const result = (ai) => {
    const p = ai ? 0.81 : 0.22
    const probs = ai ? [0.81, 0.77, 0.74, 0.7, 0.69, 0.66, 0.61, 0.58, 0.52, 0.41, 0.36] : [0.22, 0.18, 0.27, 0.31, 0.24, 0.35, 0.29, 0.41, 0.46, 0.55, 0.33]
    const s = ai ? 1 : -1
    const top = [
      mk('spectral_flatness_std', 'Düzlük Oynaklığı', 'Flatness Variability', 'spectral', 0.021, -1.8, 0.62 * s),
      mk('rms_dynamic_range', 'Dinamik Aralık', 'Dynamic Range', 'temporal', 8.2, -1.2, 0.41 * s),
      mk('onset_strength_std', 'Vuruş Gücü Sapması', 'Onset Strength Spread', 'rhythm', 1.9, 0.9, -0.28 * s),
      mk('pitch_std_cents', 'Perde Sapması', 'Pitch Spread', 'vocal', 38, -0.7, 0.19 * s),
      mk('chroma_entropy', 'Kroma Entropisi', 'Chroma Entropy', 'harmonic', 2.9, 0.4, -0.12 * s),
    ]
    return { warnings: [], errors: [], result: {
      isAIGenerated: ai, confidence: p, processingTime: ai ? 9.6 : 7.8, modelVersion: 'auris-v1-fusion', decisionSource: 'auris_xai_lightgbm', analysisMode: 'production',
      source: { kind: 'file', fileName: 'parca.wav', fileSizeBytes: 705644, mimeType: 'audio/wav' },
      features: { spectralRegularity: 0.6, temporalPatterns: 0.55, harmonicStructure: 0.5, artificialIndicators: [] },
      audioInfo: { duration: 8, analysedSec: 8, sampleRate: 44100, bitrate: 706, format: 'wav', channels: 2 },
      vocalAnalysis: { hasVocals: false },
      xai: { probability: p, threshold: 0.431577, baseProbability: 0.4, confidenceBand: { tier: 'strong', labelTr: 'Güçlü İşaret', labelEn: 'Strong', margin: 0.6 },
        modelVotes: names.map((n, i) => ({ name: n, probability: probs[i], vote: probs[i] >= (i === 0 ? 0.431577 : 0.5) ? 'ai' : 'human', available: true })),
        bestModel: 'LightGBM', topContributions: top, allFeatures: Object.fromEntries(top.map(c => [c.name, c])), featureCount: 47 },
      towerScores: { local_features: 0.55, wav2vec2: ai ? 0.72 : 0.28, xai_ensemble: p }, layers: { clap: { available: true, mode: 'heuristic_spectral' } },
    } }
  }
  window.__setRun = (which) => {
    job.plan = PLANS[which]; job.end = which === 'first' ? 5.9 : 2.8; job.response = result(which === 'first')
  }
  window.__setRun('first')

  // Audio the browser can decode and measure (drawn in the report's waveform).
  window.__makeFile = (name, seed) => {
    const sr = 22050, secs = 8, n = sr * secs
    const buf = new ArrayBuffer(44 + n * 4), v = new DataView(buf)
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true)
    v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 4, true)
    let r = seed
    const rnd = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296 - 0.5)
    for (let i = 0; i < n; i++) {
      const t = i / sr, beat = Math.exp(-((t * 2) % 1) * 9)
      const s = (Math.sin(2 * Math.PI * 110 * t) * 0.3 + Math.sin(2 * Math.PI * (220 + seed % 40) * t) * 0.2 * (0.6 + 0.4 * Math.sin(t * 1.3))
        + Math.sin(2 * Math.PI * 330 * t) * 0.1) * (0.5 + 0.5 * beat) + rnd() * 0.06 * beat
      v.setInt16(44 + i * 4, s * 30000, true); v.setInt16(46 + i * 4, s * 0.92 * 30000, true)
    }
    return new File([buf], name, { type: 'audio/wav' })
  }
  window.__drag = (phase, file) => {
    const stage = document.querySelector('[data-mode]')
    const dt = new DataTransfer(); dt.items.add(file)
    stage.dispatchEvent(new DragEvent(phase, { bubbles: true, cancelable: true, dataTransfer: dt }))
  }

  // Captions and end card: overlay for the reel only, in the site's type.
  const style = document.createElement('style')
  style.textContent = `
    header, [class*="RouteBadge"], [class*="badge"], .skip-link, footer { visibility: hidden !important; }
    nextjs-portal { display: none !important; }
    /* Once a song is dropped, the title steps aside so the world and the panel share the frame. */
    body.reel-compact [class*="kicker"], body.reel-compact h1, body.reel-compact [class*="lead"] { display: none !important; }
    body.reel-compact [class*="world"] { height: 440px !important; }
    #reel-cap { position: fixed; z-index: 99999; left: 22px; right: 22px; top: 26px; pointer-events: none; }
    #reel-cap p { margin: 0; padding: 10px 14px; display: inline-block; font-family: var(--font-family-base); font-size: 21px; line-height: 1.25;
      color: #f3e9d8; background: rgb(12 11 10 / .78); border: 1px solid #d6ab6b4d; border-radius: 12px; backdrop-filter: blur(8px);
      animation: capIn .5s cubic-bezier(.16,1,.3,1) both; }
    #reel-cap p b { font-family: var(--font-family-mono); font-weight: 400; font-size: 13px; color: #e0a15a; margin-right: 10px; letter-spacing: .1em; }
    @keyframes capIn { from { opacity: 0; transform: translateY(-10px); } }
    #reel-end { position: fixed; inset: 0; z-index: 99998; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
      background: radial-gradient(circle at 50% 42%, #1a120b 0, #07070a 62%); animation: endIn .9s ease both; }
    #reel-end h1 { font-family: var(--font-family-heading); font-weight: 400; font-size: 86px; color: #f3e9d8; margin: 0; letter-spacing: -.01em; }
    #reel-end h2 { font-family: var(--font-family-base); font-weight: 400; font-size: 30px; color: #e0a15a; margin: 14px 24px 0; }
    #reel-end p { font-family: var(--font-family-mono); font-size: 15px; letter-spacing: .06em; color: #bba88f; margin-top: 34px; }
    #reel-end small { font-family: var(--font-family-base); font-size: 19px; color: #e2d4c0; margin-top: 10px; }
    @keyframes endIn { from { opacity: 0; } }
  `
  document.head.appendChild(style)
  const cap = document.createElement('div'); cap.id = 'reel-cap'; document.body.appendChild(cap)
  window.__caption = (n, text) => { cap.innerHTML = text ? `<p>${n ? `<b>${n}</b>` : ''}${text}</p>` : '' }
  window.__end = (q, s, url) => {
    const el = document.createElement('div'); el.id = 'reel-end'
    el.innerHTML = `<h1>AURIS</h1><h2>${q}</h2><p>${url}</p><small>${s}</small>`
    document.body.appendChild(el)
  }

  // Watch the world's mode and the step list, for the sound track.
  const stage = document.querySelector('[data-mode]')
  let lastMode = stage.dataset.mode
  new MutationObserver(() => {
    if (stage.dataset.mode !== lastMode) { lastMode = stage.dataset.mode; mark('mode:' + lastMode) }
    document.querySelectorAll('li[data-state="done"]').forEach(li => { if (!li.__seen) { li.__seen = true; mark('step') } })
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mode', 'data-state'] })

  // CSS animations follow the fake clock.
  window.__syncAnimations = () => {
    const now = performance.now()
    for (const a of document.getAnimations()) {
      if (a.__t0 === undefined) { a.__t0 = now; a.pause() }
      a.currentTime = Math.max(0, now - a.__t0)
    }
  }
})()
"""


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def main() -> None:
    if FRAMES.exists():
        shutil.rmtree(FRAMES)
    FRAMES.mkdir(parents=True)
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = browser.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.clock.install()
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('[data-ready="true"]', timeout=60000)
        page.wait_for_timeout(1500)
        page.evaluate(PAGE_SETUP)
        page.clock.pause_at(datetime.datetime.now() + datetime.timedelta(seconds=1))

        frame = 0
        scroll = {'from': 0, 'to': 0, 'start': 0, 'dur': 1}

        def set_scroll(to: float, dur: float) -> None:
            scroll.update({'from': page.evaluate('scrollY'), 'to': to, 'start': frame, 'dur': max(1, dur * FPS)})

        def step(seconds: float) -> None:
            nonlocal frame
            for _ in range(int(round(seconds * FPS))):
                # Whole milliseconds per frame (33/34), so 30 frames make exactly one second.
                page.clock.run_for(round((frame + 1) * 1000 / FPS) - round(frame * 1000 / FPS))
                k = (frame - scroll['start']) / scroll['dur']
                if 0 <= k <= 1.0001:
                    y = scroll['from'] + (scroll['to'] - scroll['from']) * ease(k)
                    page.evaluate(f'window.scrollTo(0, {y:.1f})')
                page.evaluate('window.__syncAnimations()')
                page.screenshot(path=str(FRAMES / f'{frame:05d}.png'))
                frame += 1

        def at(name: str) -> None:
            page.evaluate(f'window.__mark({json.dumps(name)})')

        c = CAPTIONS
        # Idle: the world and the question.
        step(2.2)
        # 1. Drop.
        page.evaluate(f'window.__caption("1", {json.dumps(c["drop"])})')
        page.evaluate("window.__f1 = window.__makeFile('parca.wav', 7); window.__drag('dragenter', window.__f1)")
        at('hot')
        step(1.1)
        page.evaluate("window.__drag('drop', window.__f1); document.body.classList.add('reel-compact')")
        at('drop')
        step(1.0)
        # 2. The server works.
        page.evaluate(f'window.__caption("2", {json.dumps(c["run"])})')
        step(6.3)
        # 3. The verdict.
        page.evaluate(f'window.__caption("3", {json.dumps(c["verdict"])})')
        step(3.4)
        # A second song, made by people.
        page.evaluate('window.__caption("", "")')
        page.evaluate("window.__setRun('second')")
        page.evaluate("document.querySelectorAll('button').forEach(b => { if (/Yeni analiz|New analysis/.test(b.textContent)) b.click() })")
        step(0.8)
        page.evaluate("window.__f2 = window.__makeFile('parca-2.wav', 23); window.__drag('dragenter', window.__f2)")
        step(0.5)
        page.evaluate("window.__drag('drop', window.__f2)")
        at('drop')
        step(0.6)
        page.evaluate(f'window.__caption("", {json.dumps(c["human"])})')
        step(5.6)
        # The report.
        page.evaluate(f'window.__caption("", {json.dumps(c["report"])})')
        page.evaluate("document.body.classList.remove('reel-compact')")
        votes_y = page.evaluate("(() => { const h = [...document.querySelectorAll('h3')].find(x => /Model oyları|What the models say/.test(x.textContent)); return h ? h.getBoundingClientRect().top + scrollY - 70 : 1400 })()")
        set_scroll(votes_y, 1.6)
        step(2.6)
        why_y = page.evaluate("(() => { const h = [...document.querySelectorAll('h3')].find(x => /etkileyenler|drove|affected/.test(x.textContent)); return h ? h.getBoundingClientRect().top + scrollY - 70 : 2400 })()")
        set_scroll(why_y, 1.4)
        step(2.8)
        # End card.
        page.evaluate('window.__caption("", "")')
        page.evaluate(f'window.__end({json.dumps(c["end_q"])}, {json.dumps(c["end_s"])}, "hasan-arthur-altuntas.xyz/ai-music-detection")')
        at('end')
        step(3.2)

        events = page.evaluate('window.__events')
        t0 = events[0][0] if events else 0
        start = page.evaluate('performance.now()') - frame * 1000 / FPS
        (OUT / 'events.json').write_text(json.dumps({
            'fps': FPS, 'frames': frame,
            'events': [[round((t - start) / 1000, 3), name] for t, name in events],
        }, indent=1), encoding='utf-8')
        browser.close()

    video = OUT / f'auris-reel-9x16-{args.lang}-silent.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(FRAMES / '%05d.png'),
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(video)], check=True)
    shutil.rmtree(FRAMES, ignore_errors=True)
    print(video, frame, 'frames', f'{frame / FPS:.1f}s')


if __name__ == '__main__':
    main()
