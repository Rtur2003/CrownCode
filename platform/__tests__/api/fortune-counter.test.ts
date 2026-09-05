import type { NextApiRequest, NextApiResponse } from 'next'

function createMocks(method: string, headers?: Record<string, string>) {
  const req = {
    method,
    headers: headers || {},
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as NextApiRequest

  const jsonMock = jest.fn().mockReturnThis()
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jsonMock,
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse

  return { req, res, jsonMock }
}

describe('/api/fortune-counter', () => {
  it('returns 200 with a count and date on GET', async () => {
    jest.resetModules()
    const handler = (await import('@/pages/api/fortune-counter')).default
    const { req, res, jsonMock } = createMocks('GET')
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    const body = jsonMock.mock.calls[0][0]
    expect(typeof body.count).toBe('number')
    expect(typeof body.date).toBe('string')
  })

  it('the same-day cold-start baseline is deterministic, not re-randomized', async () => {
    // Simulates two separate serverless cold starts (fresh module state
    // each time, as would happen on two Lambda invocations) landing on
    // the same day — regression test for the bug where Math.random() in
    // getBaseCount() let the "daily counter" jump or drop on every cold
    // start instead of only ever growing.
    jest.resetModules()
    const handler1 = (await import('@/pages/api/fortune-counter')).default
    const { req: req1, res: res1, jsonMock: json1 } = createMocks('GET')
    await handler1(req1, res1)
    const count1 = json1.mock.calls[0][0].count

    jest.resetModules()
    const handler2 = (await import('@/pages/api/fortune-counter')).default
    const { req: req2, res: res2, jsonMock: json2 } = createMocks('GET')
    await handler2(req2, res2)
    const count2 = json2.mock.calls[0][0].count

    expect(count2).toBe(count1)
  })

  it('rejects requests over the rate limit', async () => {
    jest.resetModules()
    const handler = (await import('@/pages/api/fortune-counter')).default
    const ip = { 'x-forwarded-for': '203.0.113.9' }
    let lastStatus = 200
    for (let i = 0; i < 12; i++) {
      const { req, res } = createMocks('POST', ip)
      await handler(req, res)
      lastStatus = (res.status as jest.Mock).mock.calls.at(-1)?.[0]
    }
    expect(lastStatus).toBe(429)
  })
})
