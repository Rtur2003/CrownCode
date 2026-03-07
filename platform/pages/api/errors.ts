import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_BODY_SIZE = 8192
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

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

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too Many Requests' })
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  if (body.length > MAX_BODY_SIZE) {
    return res.status(413).json({ error: 'Payload Too Large' })
  }

  let errorReport: { message?: string; stack?: string; componentStack?: string; page?: string; timestamp?: number }
  try {
    errorReport = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (!errorReport.message) {
    return res.status(400).json({ error: 'Missing required field: message' })
  }

  console.error(
    JSON.stringify({
      type: 'client-error',
      message: errorReport.message,
      stack: errorReport.stack,
      componentStack: errorReport.componentStack,
      page: errorReport.page,
      timestamp: errorReport.timestamp,
      ts: Date.now(),
    })
  )

  return res.status(204).end()
}
