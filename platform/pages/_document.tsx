import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="_uAYFuA-3T0i19IF6PNXau841TDdLlyrMPJpIvQ4wYU" />

        {/* Google Fonts — IM Fell Double Pica (body) + JetBrains Mono; headings use local Portmanteau */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IM+Fell+Double+Pica:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* Favicon & Icons - Multiple sizes */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Colors - Brand identity */}
        <meta name="theme-color" content="#e7c77a" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0b0a08" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#e7c77a" />

        {/* Apple Mobile Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CrownCode" />

        {/* Security & Performance */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

        {/* Organization and WebSite JSON-LD live in MainLayout (homepage
            only) instead of here, so every page doesn't ship two
            contradictory copies of the same schema — Document renders on
            every route with no way to gate per-page, and duplicate/
            conflicting structured data is flagged by Google's own
            guidance rather than helping rich-result eligibility. */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
