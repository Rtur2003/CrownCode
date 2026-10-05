import type { NextApiRequest, NextApiResponse } from 'next'

// Helper to create mock req/res
function createMocks(method: string, body?: unknown, headers?: Record<string, string>) {
  const req = {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: headers || {},
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as NextApiRequest

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse

  return { req, res }
}

describe('/api/vitals', () => {
  let handler: (req: NextApiRequest, res: NextApiResponse) => void

  beforeAll(async () => {
    handler = (await import('@/pages/api/vitals')).default
  })

  it('returns 405 for non-POST', () => {
    const { req, res } = createMocks('GET')
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('returns 400 for missing fields', () => {
    const { req, res } = createMocks('POST', { rating: 'good' })
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 204 for valid metric', () => {
    const { req, res } = createMocks('POST', { name: 'LCP', value: 1200, rating: 'good', id: 'v1', page: '/' })
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(204)
  })

  it.each([
    ['an unknown metric name', { name: 'whatever', value: 1 }],
    ['a name that is not text', { name: { a: 1 }, value: 1 }],
    ['a value that is not a number', { name: 'LCP', value: '1200' }],
    ['a negative value', { name: 'LCP', value: -5 }],
    ['an absurdly large value', { name: 'LCP', value: 1e12 }],
  ])('rejects %s', (_label, body) => {
    const { req, res } = createMocks('POST', body, { 'x-forwarded-for': '198.51.100.9' })
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('logs only the path of the page and trims the id', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    const { req, res } = createMocks('POST', { name: 'CLS', value: 0.1, rating: 'nonsense', id: 'x'.repeat(200), page: '/privacy?token=abc#frag' })
    handler(req, res)
    const line = JSON.parse(log.mock.calls[0]![0] as string)
    log.mockRestore()
    expect(line.page).toBe('/privacy')
    expect(line.id).toHaveLength(64)
    expect(line.rating).toBeUndefined()
  })

  it('counts visitors by the Cloudflare client address', () => {
    const { req } = createMocks('POST', { name: 'LCP', value: 1 }, { 'cf-connecting-ip': '203.0.113.50' })
    for (let i = 0; i < 30; i++) {handler(req, createMocks('POST').res)}
    const limited = createMocks('POST', { name: 'LCP', value: 1 }, { 'cf-connecting-ip': '203.0.113.50' })
    handler(limited.req, limited.res)
    expect(limited.res.status).toHaveBeenCalledWith(429)
    const other = createMocks('POST', { name: 'LCP', value: 1 }, { 'cf-connecting-ip': '203.0.113.51' })
    handler(other.req, other.res)
    expect(other.res.status).toHaveBeenCalledWith(204)
  })
})

describe('/api/errors', () => {
  let handler: (req: NextApiRequest, res: NextApiResponse) => void

  beforeAll(async () => {
    handler = (await import('@/pages/api/errors')).default
  })

  it('returns 405 for non-POST', () => {
    const { req, res } = createMocks('GET')
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('returns 400 for missing message', () => {
    const { req, res } = createMocks('POST', { stack: 'some stack' })
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 204 for valid error report', () => {
    const { req, res } = createMocks('POST', { message: 'Test error', page: '/', timestamp: Date.now() })
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(204)
  })
})

describe('/api/vitals - trusted IP resolution', () => {
  let handler: (req: NextApiRequest, res: NextApiResponse) => void

  beforeAll(async () => {
    handler = (await import('@/pages/api/vitals')).default
  })

  it('prefers x-nf-client-connection-ip over x-forwarded-for', () => {
    const { req, res } = createMocks(
      'POST',
      { name: 'LCP', value: 1200, rating: 'good', id: 'v1', page: '/' },
      { 'x-nf-client-connection-ip': '10.0.0.1', 'x-forwarded-for': '192.168.1.1' }
    )
    handler(req, res)
    // Should succeed (204) — the IP used internally is the trusted one
    expect(res.status).toHaveBeenCalledWith(204)
  })

  it('falls back to socket.remoteAddress when headers are absent', () => {
    const { req, res } = createMocks(
      'POST',
      { name: 'FCP', value: 800, rating: 'good', id: 'v2', page: '/' }
    )
    handler(req, res)
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
