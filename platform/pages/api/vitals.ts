import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_BODY_SIZE = 4096
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30
const MAX_TRACKED_IPS = 10_000

// Only the metrics the site reports are accepted, with bounded fields, so the
// endpoint can't be used to write arbitrary text into the logs.
const METRIC_NAMES = new Set(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB', 'Next.js-hydration', 'Next.js-route-change-to-render', 'Next.js-render'])
const RATINGS = new Set(['good', 'needs-improvement', 'poor'])
const MAX_ID_LENGTH = 64
const MAX_PAGE_LENGTH = 200

function clampSampleRate(raw: string | undefined): number {
  const parsed = parseFloat(raw || '1')
  if (isNaN(parsed) || parsed > 1) { return 1 }
  if (parsed < 0) { return 0 }
  return parsed
}

const SAMPLE_RATE = clampSampleRate(process.env.VITALS_SAMPLE_RATE)

// Best-effort limiter: each Worker isolate keeps its own map, so the real cap is
// per isolate. Vitals are low-value and sampled, so this is enough; anything that
// costs money per call needs a shared limiter instead.
const ipHits = new Map<string, number[]>()

function evictStaleEntries(): void {
  if (ipHits.size <= MAX_TRACKED_IPS) { return }
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
  for (const [ip, hits] of ipHits) {
    const fresh = hits.filter((t) => t > cutoff)
    if (fresh.length === 0) {
      ipHits.delete(ip)
    } else {
      ipHits.set(ip, fresh)
    }
  }
}

function isRateLimited(ip: string): boolean {
  evictStaleEntries()
  const now = Date.now()
  const hits = (ipHits.get(ip) || []).filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) {
    return true
  }
  hits.push(now)
  ipHits.set(ip, hits)
  return false
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.FEATURE_WEB_VITALS === 'false') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  res.setHeader('Cache-Control', 'no-store')

  // Sampling: skip a percentage of requests
  if (SAMPLE_RATE < 1 && Math.random() > SAMPLE_RATE) {
    return res.status(204).end()
  }

  // Prefer platform-specific trusted headers over spoofable x-forwarded-for
  const clientIp =
    (req.headers?.['cf-connecting-ip'] as string)?.trim() ||
    (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too Many Requests' })
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  if (body.length > MAX_BODY_SIZE) {
    return res.status(413).json({ error: 'Payload Too Large' })
  }

  let metric: { name?: unknown; value?: unknown; rating?: unknown; id?: unknown; page?: unknown }
  try {
    metric = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (!metric || typeof metric !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' })
  }
  if (typeof metric.name !== 'string' || !METRIC_NAMES.has(metric.name)) {
    return res.status(400).json({ error: 'Unknown metric name' })
  }
  if (typeof metric.value !== 'number' || !Number.isFinite(metric.value) || metric.value < 0 || metric.value > 1e7) {
    return res.status(400).json({ error: 'Invalid metric value' })
  }

  // The page is kept as a path only: no query string, no fragment.
  const page = typeof metric.page === 'string' ? metric.page.split(/[?#]/)[0]?.slice(0, MAX_PAGE_LENGTH) : undefined

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      type: 'web-vital',
      name: metric.name,
      value: metric.value,
      rating: typeof metric.rating === 'string' && RATINGS.has(metric.rating) ? metric.rating : undefined,
      id: typeof metric.id === 'string' ? metric.id.slice(0, MAX_ID_LENGTH) : undefined,
      page,
      ts: Date.now(),
    })
  )

  return res.status(204).end()
}
