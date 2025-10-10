/**
 * Version API Endpoint
 * Returns application version and build information
 *
 * @route GET /api/version
 */

import type { NextApiRequest, NextApiResponse } from 'next'

interface VersionResponse {
  version: string
  buildDate: string
  nodeVersion: string
  nextVersion: string
  environment: string
  features: {
    aiAnalysis: boolean
    streamingPlatforms: boolean
    batchProcessing: boolean
    webVitals: boolean
    pwa: boolean
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VersionResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      version: '0.0.0',
      buildDate: new Date().toISOString(),
      nodeVersion: process.version,
      nextVersion: '14.2.33',
      environment: process.env.NODE_ENV || 'development',
      features: {
        aiAnalysis: false,
        streamingPlatforms: false,
        batchProcessing: false,
        webVitals: false,
        pwa: false
      }
    })
  }

  const response: VersionResponse = {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    nextVersion: '14.2.33',
    environment: process.env.NODE_ENV || 'development',
    features: {
      aiAnalysis: process.env.FEATURE_AI_ANALYSIS === 'true',
      streamingPlatforms: process.env.FEATURE_STREAMING_PLATFORMS === 'true',
      batchProcessing: process.env.FEATURE_BATCH_PROCESSING === 'true',
      webVitals: true, // Always enabled
      pwa: true // Always enabled
    }
  }

  // Cache for 1 hour in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  } else {
    res.setHeader('Cache-Control', 'no-cache')
  }

  return res.status(200).json(response)
}
