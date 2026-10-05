import fs from 'fs'
import path from 'path'
import { DEFAULT_API_URL } from '@/config/api'

type Header = { key: string; value: string }
type NextConfig = { headers: () => Promise<Array<{ source: string; headers: Header[] }>>; images: { remotePatterns: Array<{ hostname: string; pathname: string }> } }

const load = (env: Record<string, string | undefined>): NextConfig => {
  const original = { ...process.env }
  Object.assign(process.env, env)
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {delete process.env[key]}
  }
  try {
    let config!: NextConfig
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      config = require('../../next.config.js')
    })
    return config
  } finally {
    process.env = original
  }
}

const pageHeaders = async (config: NextConfig) => (await config.headers()).find(h => h.source === '/:path*')!.headers
const csp = (headers: Header[]) => headers.find(h => h.key.startsWith('Content-Security-Policy'))

describe('Content-Security-Policy', () => {
  it('is sent in production, enforcing by default', async () => {
    const header = csp(await pageHeaders(load({ NODE_ENV: 'production', CSP_REPORT_ONLY: undefined })))
    expect(header?.key).toBe('Content-Security-Policy')
  })

  it('can be switched to report-only for a rollout', async () => {
    const header = csp(await pageHeaders(load({ NODE_ENV: 'production', CSP_REPORT_ONLY: 'true' })))
    expect(header?.key).toBe('Content-Security-Policy-Report-Only')
  })

  it('is left out in development, where HMR needs eval', async () => {
    expect(csp(await pageHeaders(load({ NODE_ENV: 'development' })))).toBeUndefined()
  })

  it('locks down the dangerous directives', async () => {
    const value = csp(await pageHeaders(load({ NODE_ENV: 'production' })))!.value
    expect(value).toContain("default-src 'self'")
    expect(value).toContain("object-src 'none'")
    expect(value).toContain("base-uri 'self'")
    expect(value).toContain("frame-ancestors 'none'")
    expect(value).not.toContain('unsafe-eval')
    expect(value).not.toMatch(/script-src[^;]*unsafe-inline/)
    expect(value).not.toMatch(/(^|[ ;])\*($|[ ;])/)
  })

  it('lets the page reach the configured backend and nothing broader', async () => {
    const value = csp(await pageHeaders(load({ NODE_ENV: 'production', NEXT_PUBLIC_API_URL: 'https://api.example.test/' })))!.value
    expect(value).toMatch(/connect-src[^;]*https:\/\/api\.example\.test(?=[ ;])/)
    expect(value).not.toContain('hf.space')
  })

  it('uses the same default backend as config/api.ts', async () => {
    const value = csp(await pageHeaders(load({ NODE_ENV: 'production', NEXT_PUBLIC_API_URL: undefined })))!.value
    expect(value).toContain(new URL(DEFAULT_API_URL).origin)
  })

  it('falls back to the default backend when the variable is not a URL', async () => {
    const value = csp(await pageHeaders(load({ NODE_ENV: 'production', NEXT_PUBLIC_API_URL: 'not a url' })))!.value
    expect(value).toContain(new URL(DEFAULT_API_URL).origin)
  })

  it('keeps the other security headers', async () => {
    const keys = (await pageHeaders(load({ NODE_ENV: 'production' }))).map(h => h.key)
    expect(keys).toEqual(expect.arrayContaining([
      'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security',
    ]))
  })
})

describe('next/image remote hosts', () => {
  it('allows only YouTube thumbnail paths', () => {
    const { remotePatterns } = load({ NODE_ENV: 'production' }).images
    expect(remotePatterns.every(p => p.hostname === 'i.ytimg.com')).toBe(true)
    expect(remotePatterns.map(p => p.pathname).sort()).toEqual(['/vi/**', '/vi_webp/**'])
  })
})

describe('service worker', () => {
  const sw = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'sw.js'), 'utf8')

  it('has no push or background-sync handlers: the site has no such feature', () => {
    expect(sw).not.toMatch(/addEventListener\(\s*'(push|sync|notificationclick)'/)
  })

  it('trims the dynamic cache after it writes to it', () => {
    expect(sw).toMatch(/async function remember[\s\S]*cache\.put[\s\S]*trimCache\(DYNAMIC_CACHE/)
  })

  it('refuses to install without the offline page but not over a missing icon', () => {
    expect(sw).toMatch(/await cache\.add\(OFFLINE_PAGE\)/)
    expect(sw).toMatch(/Promise\.allSettled/)
  })
})
