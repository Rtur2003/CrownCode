import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
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

        {/* Structured Data - JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'CrownCode Platform',
              description: 'Central platform showcasing software projects, research work, and development processes',
              url: 'https://hasanarthuraltuntas.xyz',
              author: {
                '@type': 'Person',
                name: 'Hasan Arthur Altuntaş',
                url: 'https://github.com/Rtur2003'
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://hasanarthuraltuntas.xyz/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />

        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CrownCode',
              url: 'https://hasanarthuraltuntas.xyz',
              logo: 'https://hasanarthuraltuntas.xyz/logo-main.png',
              description: 'Open-source project showcase and demo applications platform',
              founder: {
                '@type': 'Person',
                name: 'Hasan Arthur Altuntaş',
                url: 'https://github.com/Rtur2003'
              },
              sameAs: [
                'https://github.com/Rtur2003',
                'https://hasanarthuraltuntas.com.tr'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Technical Support',
                availableLanguage: ['Turkish', 'English']
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
