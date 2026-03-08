/**
 * Health Check API Endpoint
 * Returns application health status
 *
 * @route GET /api/health
 * Note: Active only when running in server deployment mode.
 * In static export mode (`DEPLOYMENT_TARGET=static`) this route is not served.
 */

import type { NextApiRequest, NextApiResponse } from 'next'

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    api: boolean
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      checks: { api: false }
    })
  }

  try {
    // Internal health check — memory-based status without exposing exact values
    const memoryUsage = process.memoryUsage()
    const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (memoryPercentage > 90) {
      status = 'unhealthy'
    } else if (memoryPercentage > 75) {
      status = 'degraded'
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    return res.status(200).json({
      status,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      checks: { api: true }
    })
  } catch (error) {
    console.error('[Health Check Error]:', error)

    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      checks: { api: false }
    })
  }
}
