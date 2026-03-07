import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_BODY_SIZE = 8192

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  res.setHeader('Cache-Control', 'no-store')

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

  // Log to server stderr for collection by log aggregators
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
