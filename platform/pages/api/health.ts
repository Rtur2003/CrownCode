/**
 * Health Check API Endpoint
 * Returns application health status and system information
 *
 * @route GET /api/health
 */

import type { NextApiRequest, NextApiResponse } from 'next'

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    api: boolean
    memory: {
      used: number
      limit: number
      percentage: number
    }
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
      uptime: process.uptime(),
      checks: {
        api: false,
        memory: {
          used: 0,
          limit: 0,
          percentage: 0
        }
      }
    })
  }

  try {
    // Get memory usage
    const memoryUsage = process.memoryUsage()
    const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
    const memoryPercentage = Math.round((usedMemoryMB / totalMemoryMB) * 100)

    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (memoryPercentage > 90) {
      status = 'unhealthy'
    } else if (memoryPercentage > 75) {
      status = 'degraded'
    }

    const response: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: Math.round(process.uptime()),
      checks: {
        api: true,
        memory: {
          used: usedMemoryMB,
          limit: totalMemoryMB,
          percentage: memoryPercentage
        }
      }
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    return res.status(200).json(response)
  } catch (error) {
    console.error('[Health Check Error]:', error)

    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: {
        api: false,
        memory: {
          used: 0,
          limit: 0,
          percentage: 0
        }
      }
    })
  }
}
