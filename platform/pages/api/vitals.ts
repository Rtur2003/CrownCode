import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_BODY_SIZE = 4096
const SAMPLE_RATE = parseFloat(process.env.VITALS_SAMPLE_RATE || '1')
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30

const ipHits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (ipHits.get(ip) || []).filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) return true
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

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
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
