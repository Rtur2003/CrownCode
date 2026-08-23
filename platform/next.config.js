/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,

  // Image optimization — running in server mode on Cloudflare Workers
  // (via @opennextjs/cloudflare), so next/image optimization stays enabled.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hasan-arthur-altuntas.xyz',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
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

  // PWA configuration placeholder
  // This can be extended with next-pwa plugin
}

module.exports = withBundleAnalyzer(nextConfig)
