import type { NextApiRequest, NextApiResponse } from 'next'
import { adsTxtLine } from '@/config/ads'

/**
 * Dynamically serves /ads.txt (via next.config.js rewrite) when
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID is configured, preventing invalid fake IDs in production.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const line = adsTxtLine()
  if (!line) {
    res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send('# AdSense publisher ID not configured yet (set NEXT_PUBLIC_ADSENSE_CLIENT_ID).\n')
    return
  }

  res.status(200)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  res.send(line)
}
