import { Html, Head, Main, NextScript, type DocumentProps } from 'next/document'

export default function Document({ locale }: DocumentProps) {
  return (
    // i18n routing gives each render its locale, so <html lang> is correct
    // in the server HTML for both /… (tr) and /en/… pages.
    <Html lang={locale ?? 'tr'}>
      <Head>
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="_uAYFuA-3T0i19IF6PNXau841TDdLlyrMPJpIvQ4wYU" />

        {/* Fonts are self-hosted and preloaded by next/font (styles/fonts.ts). */}

        {/* Favicon & Icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Colors - Brand identity */}
        <meta name="theme-color" content="#e7c77a" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0b0a08" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="dark" />

        {/* Apple Mobile Web App */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CrownCode" />
        <meta name="format-detection" content="telephone=no" />

        {/* Per-page metadata and JSON-LD live in components/Layout/MainLayout. */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
