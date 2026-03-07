import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_BODY_SIZE = 4096
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30
const MAX_TRACKED_IPS = 10_000

function clampSampleRate(raw: string | undefined): number {
  const parsed = parseFloat(raw || '1')
  if (isNaN(parsed) || parsed > 1) { return 1 }
  if (parsed < 0) { return 0 }
  return parsed
}

const SAMPLE_RATE = clampSampleRate(process.env.VITALS_SAMPLE_RATE)

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

  const clientIp = (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too Many Requests' })
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  if (body.length > MAX_BODY_SIZE) {
    return res.status(413).json({ error: 'Payload Too Large' })
  }

  let metric: { name?: string; value?: unknown; rating?: string; id?: string; page?: string }
  try {
    metric = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (!metric.name || metric.value === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, value' })
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      type: 'web-vital',
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      page: metric.page,
      ts: Date.now(),
    })
  )

  return res.status(204).end()
}
