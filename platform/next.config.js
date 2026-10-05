/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// The AURIS backend the browser talks to: NEXT_PUBLIC_API_URL, else the Space.
// Keep the fallback equal to DEFAULT_API_URL in config/api.ts (a test checks it).
const DEFAULT_API_URL = 'https://rthur2003-crowncode-backend.hf.space'

function apiOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).origin
  } catch {
    return new URL(DEFAULT_API_URL).origin
  }
}

// Content-Security-Policy for pages. Pages Router output has no executable
// inline script (__NEXT_DATA__ and the JSON-LD are data blocks), so script-src
// stays on 'self'. Style attributes (React inline styles, Motion) need
// 'unsafe-inline' in style-src. Production only: next dev needs eval for HMR.
// Roll it out report-only first with CSP_REPORT_ONLY=true.
function contentSecurityPolicy() {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://static.cloudflareinsights.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'media-src': ["'self'", 'blob:', 'data:'],
    'connect-src': ["'self'", 'blob:', 'data:', apiOrigin(), 'https://api.github.com', 'https://cloudflareinsights.com'],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  }
  return `${Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`).join('; ')}`
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  ...(process.env.NODE_ENV === 'production'
    ? [{
        key: process.env.CSP_REPORT_ONLY === 'true' ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
        value: contentSecurityPolicy(),
      }]
    : []),
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Turkish stays unprefixed, English is served from /en/* so both languages
  // get their own crawlable URL (hreflang in MainLayout points at them).
  // No Accept-Language redirect: search bots must see stable URLs.
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    localeDetection: false,
  },

  async headers() {
    const week = [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }]
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/fonts/:path*', locale: false, headers: week },
      { source: '/images/:path*', locale: false, headers: week },
      { source: '/tarot/:path*', locale: false, headers: week },
      { source: '/votryx/:path*', locale: false, headers: week },
      { source: '/og/:path*', locale: false, headers: week },
    ]
  },

  // Image optimization — running in server mode on Cloudflare Workers
  // (via @opennextjs/cloudflare), so next/image optimization stays enabled.
  images: {
    // Crown Commend's video thumbnail is the only remote image.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi_webp/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  compiler: {
    // Remove console.log in production, keep console.warn/error for telemetry
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['warn', 'error'] }
      : false,
  },

  trailingSlash: false, // Changed to false for better sitemap compatibility

  // Compression
  compress: true,
}

module.exports = withBundleAnalyzer(nextConfig)
