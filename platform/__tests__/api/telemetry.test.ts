import type { NextApiRequest, NextApiResponse } from 'next'

// Helper to create mock req/res
function createMocks(method: string, body?: unknown) {
  const req = {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
