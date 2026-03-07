import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_BODY_SIZE = 4096

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

  let metric: { name?: string; value?: unknown; rating?: string; id?: string; page?: string }
  try {
    metric = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (!metric.name || metric.value === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, value' })
  }

  // Log to server stdout for collection by log aggregators
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
