// Unified analysis gateway (mock/preview). Real integrations (yt-dlp/model) should be wired to the providers.
const { promises: fs } = require('fs')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // NOTE: Netlify Functions cannot parse multipart by default; here we return a fixed preview response.
  // In real usage, move this to a full server or add multipart parsing + external service calls.
  const now = Date.now()
  const seed = (now % 1000) / 1000
  const isAIGenerated = seed > 0.5
  const confidence = Number((0.55 + seed * 0.35).toFixed(3))

  const result = {
    isAIGenerated,
    confidence,
    processingTime: 0.4,
    modelVersion: 'gateway-preview-v1',
    decisionSource: 'preview',
    source: {
      kind: 'file',
      fileName: 'preview',
      fileSizeBytes: 0,
      mimeType: 'application/octet-stream'
    },
    features: {
      spectralRegularity: Number(((seed + 0.17) % 1).toFixed(3)),
      temporalPatterns: Number(((seed + 0.43) % 1).toFixed(3)),
      harmonicStructure: Number(((seed + 0.71) % 1).toFixed(3)),
      artificialIndicators: [
        'Preview-only decision based on fingerprint.',
        'No model inference was available at request time.'
      ]
    },
    audioInfo: {
      duration: 0,
      sampleRate: 44100,
      bitrate: 192,
      format: 'PREVIEW'
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ result, warnings: ['gateway_mock_preview'] })
  }
}
