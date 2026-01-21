import React, { ReactNode } from 'react'
import Head from 'next/head'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  noCache?: boolean
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'CrownCode by Rthur - AURIS AI Music Detection Platform',
  description = 'AURIS - AI muzik tespiti ve veri manipulasyonu icin profesyonel platform. wav2vec2 tabanli derin ogrenme teknolojisi.',
  keywords = 'AURIS, AI, machine learning, music detection, data processing, web development, developer tools, CrownCode, Rthur, artificial intelligence',
  image = '/og-image.png',
  url = 'https://hasanarthuraltuntas.xyz',
  noCache = false,
}) => {
  const baseUrl = url || 'https://hasanarthuraltuntas.xyz'
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CrownCode",
    "description": description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Hasan Arthur Altuntaş (Rthur)",
      "url": "https://hasanarthuraltuntas.xyz"
    },
    "image": imageUrl,
    "url": baseUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "50"
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#e7c77a" />
        <meta name="author" content="Hasan Arthur Altuntaş (Rthur)" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Turkish" />
        <link rel="canonical" href={baseUrl} />

        {/* Cache Control - Dinamik içerik için */}
        {noCache && (
          <>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
          </>
        )}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="CrownCode" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="tr_TR" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:creator" content="@rthur" />
        <meta name="twitter:site" content="@crowncode" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <div className="app-container">
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default MainLayout
