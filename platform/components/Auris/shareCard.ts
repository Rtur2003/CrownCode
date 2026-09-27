/**
 * A result card (1080×1350, the portrait size feeds and stories take) drawn
 * on a canvas in the site's own type, for sharing a verdict. Shared through
 * the system share sheet where the browser can share files, downloaded
 * otherwise.
 */

import { AURIS_MODEL } from '@/config/auris-model'

export interface CardInput {
  language: string
  label: string
  verdict: string
  probability: number
  probabilityLabel: string
  modelLine: string
  threshold: number | null
  isAi: boolean
  note: string
  url: string
}

const W = 1080
const H = 1350
const AI = '#f2b45f'
const HUMAN = '#8fc0ab'

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = src
})

const pct = (language: string, v: number) => {
  const n = Math.round(v * 100)
  return language === 'en' ? `${n}%` : `%${n}`
}

/** Breaks text into lines that fit `max` px at the context's current font. */
const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number) => {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > max && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) {lines.push(line)}
  return lines
}

export const drawCard = async (input: CardInput): Promise<Blob> => {
  const display = cssVar('--font-portmanteau', 'Georgia')
  const serif = cssVar('--font-im-fell', 'Georgia')
  const mono = cssVar('--font-jetbrains-mono', 'monospace')
  await Promise.all([
    document.fonts.load(`120px ${display}`),
    document.fonts.load(`60px ${serif}`),
    document.fonts.load(`30px ${mono}`),
  ]).catch(() => {})

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) {throw new Error('no 2d context')}
  const tint = input.isAi ? AI : HUMAN

  ctx.fillStyle = '#07070a'
  ctx.fillRect(0, 0, W, H)

  // The world, cropped to its disc, tinted toward the verdict.
  try {
    const world = await loadImage('/images/auris/world-stage-portrait.webp')
    const size = 980
    ctx.save()
    ctx.globalAlpha = 0.95
    ctx.drawImage(world, (W - size) / 2, -150, size, size * (world.height / world.width))
    ctx.restore()
    ctx.save()
    ctx.globalCompositeOperation = 'color'
    ctx.globalAlpha = input.isAi ? 0.15 : 0.55
    ctx.fillStyle = tint
    ctx.fillRect(0, 0, W, 760)
    ctx.restore()
  } catch {
    // no image: the card still reads without it
  }
  const fadeDown = ctx.createLinearGradient(0, 380, 0, 820)
  fadeDown.addColorStop(0, 'rgba(7,7,10,0)')
  fadeDown.addColorStop(1, 'rgba(7,7,10,1)')
  ctx.fillStyle = fadeDown
  ctx.fillRect(0, 380, W, 440)
  ctx.fillStyle = '#07070a'
  ctx.fillRect(0, 820, W, H - 820)

  const left = 84
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#f3e9d8'
  ctx.font = `124px ${display}`
  ctx.fillText('AURIS', left, 700)

  ctx.font = `30px ${mono}`
  ctx.fillStyle = '#9c8a72'
  const label = input.label.length > 44 ? `${input.label.slice(0, 41)}…` : input.label
  ctx.fillText(label, left, 766)

  ctx.font = `64px ${serif}`
  ctx.fillStyle = tint
  let y = 850
  for (const line of wrap(ctx, input.verdict, W - left * 2)) {
    ctx.fillText(line, left, y)
    y += 70
  }

  // The number, big.
  y += 150
  ctx.font = `210px ${display}`
  ctx.fillStyle = '#f3e9d8'
  const number = pct(input.language, input.probability)
  ctx.fillText(number, left - 6, y)
  const numberWidth = ctx.measureText(number).width
  ctx.font = `38px ${serif}`
  ctx.fillStyle = '#e2d4c0'
  ctx.fillText(input.probabilityLabel, left + numberWidth + 30, y - 110)
  ctx.font = `26px ${mono}`
  ctx.fillStyle = '#9c8a72'
  ctx.fillText(input.modelLine, left + numberWidth + 30, y - 66)

  // Scale from human to AI with the threshold marked.
  y += 60
  const barW = W - left * 2
  const grad = ctx.createLinearGradient(left, 0, left + barW, 0)
  grad.addColorStop(0, 'rgba(143,192,171,0.8)')
  grad.addColorStop(0.48, '#3a2c20')
  grad.addColorStop(1, 'rgba(242,180,95,0.85)')
  ctx.fillStyle = grad
  ctx.fillRect(left, y, barW, 10)
  if (input.threshold !== null) {
    ctx.fillStyle = '#f6ecd9'
    ctx.fillRect(left + barW * input.threshold - 2, y - 12, 4, 34)
  }
  ctx.beginPath()
  ctx.arc(left + barW * input.probability, y + 5, 20, 0, Math.PI * 2)
  ctx.fillStyle = '#f6ecd9'
  ctx.fill()
  ctx.lineWidth = 7
  ctx.strokeStyle = '#07070a'
  ctx.stroke()

  y += 84
  ctx.font = `32px ${serif}`
  ctx.fillStyle = '#bba88f'
  ctx.fillText(input.note, left, y)

  ctx.font = `28px ${mono}`
  ctx.fillStyle = '#d6ab6b'
  ctx.fillText(input.url, left, H - 72)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#9c8a72'
  ctx.fillText(`AUC ${AURIS_MODEL.rocAuc.toFixed(3)}`, W - left, H - 72)

  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

/** System share sheet with the image when possible, a download otherwise. */
export const shareCard = async (blob: Blob, fileName: string, text: string, url: string): Promise<'shared' | 'saved' | 'cancelled'> => {
  const file = new File([blob], fileName, { type: 'image/png' })
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text, url })
      return 'shared'
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') {return 'cancelled'}
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  return 'saved'
}
