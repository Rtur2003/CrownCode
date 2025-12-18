// Netlify proxy for unified analysis. It forwards multipart requests to an external inference service.
// Heavy work (yt-dlp, ffmpeg, model) should live in the external service, not on Netlify.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const targetBase = process.env.INFERENCE_API_URL || process.env.NEXT_PUBLIC_API_URL
  if (!targetBase) {
    return { statusCode: 500, body: JSON.stringify({ errors: ['backend_not_configured'] }) }
  }

  const target = targetBase.endsWith('/api/analyze')
    ? targetBase
    : `${targetBase.replace(/\/$/, '')}/api/analyze`

  const contentType = event.headers['content-type'] || event.headers['Content-Type']
  if (!contentType || !contentType.toLowerCase().includes('multipart/form-data')) {
    return { statusCode: 400, body: JSON.stringify({ errors: ['unsupported_media_type'] }) }
  }

  const bodyBuffer = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8')

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: bodyBuffer
    })

    const text = await response.text()
    return {
      statusCode: response.status,
      body: text,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json'
      }
    }
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        errors: ['backend_unreachable'],
        message: 'Failed to reach inference service'
      })
    }
  }
}
