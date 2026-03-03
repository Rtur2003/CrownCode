/** @type {import('next').NextConfig} */
const deploymentTarget = process.env.DEPLOYMENT_TARGET || 'static'
const isStaticExport = deploymentTarget === 'static'

const nextConfig = {
  reactStrictMode: true,
  
  // ESLint now runs during builds (ignoreDuringBuilds removed).

  // Image optimization
  images: {
    // For static export mode, keep next/image unoptimized.
    // For server mode, Next can optimize images at runtime.
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hasanarthuraltuntas.xyz',
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

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configuration if needed
    if (!dev && !isServer) {
      // Bundle analyzer in production
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        )
      }
    }

    return config
  },

  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output configuration for Netlify
  ...(isStaticExport
    ? {
        output: 'export',
        distDir: 'out',
      }
    : {}),
  trailingSlash: false, // Changed to false for better sitemap compatibility

  // Compression
  compress: true,

  // PWA configuration placeholder
  // This can be extended with next-pwa plugin
}

module.exports = nextConfig
