import { NextResponse, type NextRequest } from 'next/server'
import { evaluateRequestPolicy } from '@/config/request-policy'

/**
 * Edge Middleware (runs on Cloudflare Workers via @opennextjs/cloudflare).
 *
 * 1. Permanently redirects plain http:// (and www.) requests to canonical https://
 *    so Googlebot does not crawl HTTP duplicates under "Alternate page with proper canonical".
 * 2. Returns 410 Gone for legacy SearchAction placeholder URLs (/search?q={search_term_string}).
 */
export function middleware(request: NextRequest) {
  const decision = evaluateRequestPolicy({
    url: request.url,
    hostHeader: request.headers.get('host'),
    forwardedProto: request.headers.get('x-forwarded-proto'),
    cfVisitor: request.headers.get('cf-visitor'),
  })

  if (decision.kind === 'redirect') {
    return NextResponse.redirect(decision.location, decision.status)
  }

  if (decision.kind === 'gone') {
    return new NextResponse('Gone', {
      status: decision.status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
