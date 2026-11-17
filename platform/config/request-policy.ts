/**
 * Edge request policy helpers shared by middleware.ts and unit tests.
 *
 * Enforces canonical HTTPS + apex hostname on production traffic and retires
 * legacy JSON-LD SearchAction placeholder URLs (/search?q={search_term_string})
 * with HTTP 410 Gone so search crawlers purge them instead of re-crawling.
 */

export const CANONICAL_HOST = 'hasan-arthur-altuntas.xyz'

const PROD_HOSTS = new Set([CANONICAL_HOST, `www.${CANONICAL_HOST}`])
const PLACEHOLDER_QUERY_RE = /^\{[^{}]*\}$|^%7B.*%7D$/i

export interface RequestPolicyInput {
  url: string
  hostHeader?: string | null | undefined
  forwardedProto?: string | null | undefined
  cfVisitor?: string | null | undefined
}

export type RequestPolicyDecision =
  | { kind: 'redirect'; status: 301; location: string }
  | { kind: 'gone'; status: 410 }
  | { kind: 'next' }

function normalizeHost(rawHost: string | null | undefined, fallbackHost: string): string {
  return (rawHost || fallbackHost).split(',')[0].trim().split(':')[0].toLowerCase()
}

function detectScheme(input: RequestPolicyInput, fallbackProtocol: string): 'http' | 'https' {
  if (input.cfVisitor) {
    const match = input.cfVisitor.match(/"scheme"\s*:\s*"(https?)"/i)
    if (match?.[1]) {
      return match[1].toLowerCase() === 'https' ? 'https' : 'http'
    }
  }
  if (input.forwardedProto) {
    const proto = input.forwardedProto.split(',')[0].trim().toLowerCase()
    if (proto === 'http' || proto === 'https') {
      return proto
    }
  }
  return fallbackProtocol.replace(':', '').toLowerCase() === 'https' ? 'https' : 'http'
}

export function evaluateRequestPolicy(input: RequestPolicyInput): RequestPolicyDecision {
  const parsed = new URL(input.url)
  const host = normalizeHost(input.hostHeader, parsed.hostname)
  const isProd = PROD_HOSTS.has(host)

  if (isProd) {
    const scheme = detectScheme(input, parsed.protocol)
    if (scheme === 'http' || host !== CANONICAL_HOST) {
      return {
        kind: 'redirect',
        status: 301,
        location: `https://${CANONICAL_HOST}${parsed.pathname}${parsed.search}`,
      }
    }
  }

  const cleanPath =
    parsed.pathname.length > 1 && parsed.pathname.endsWith('/')
      ? parsed.pathname.slice(0, -1)
      : parsed.pathname

  if (cleanPath === '/search' || cleanPath === '/en/search') {
    const query = parsed.searchParams.get('q')?.trim() ?? ''
    if (PLACEHOLDER_QUERY_RE.test(query)) {
      return { kind: 'gone', status: 410 }
    }
  }

  return { kind: 'next' }
}
