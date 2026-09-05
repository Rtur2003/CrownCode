import React, { ReactNode } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useLanguage } from '@/context/LanguageContext'
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
  /** Internal-search-results and similar low-value pages should not be indexed. */
  noIndex?: boolean
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'CrownCode by Rthur - AURIS AI Music Detection Platform',
  description = 'AURIS - AI muzik tespiti ve veri manipulasyonu icin profesyonel platform. wav2vec2 tabanli derin ogrenme teknolojisi.',
  keywords = 'AURIS, AI, machine learning, music detection, data processing, web development, developer tools, CrownCode, Rthur, artificial intelligence',
  image = '/og-image.png',
  url = 'https://hasan-arthur-altuntas.xyz',
  noCache = false,
  noIndex = false,
}) => {
  const { language } = useLanguage()
  const router = useRouter()
  const siteOrigin = 'https://hasan-arthur-altuntas.xyz'
  const canonicalUrl = url || `${siteOrigin}${router.asPath.split('?')[0]}`
  const baseUrl = siteOrigin
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`
  const metaLanguage = language === 'tr' ? 'Turkish' : 'English'
  const ogLocale = language === 'tr' ? 'tr_TR' : 'en_US'

  const isHomePage = router.pathname === '/'
  const isAurisPage = router.pathname.startsWith('/ai-music-detection')

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CrownCode",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-main.png`,
    "description": "Open-source project showcase and demo applications platform",
    "founder": {
      "@type": "Person",
      "name": "Hasan Arthur Altuntas",
      "jobTitle": "Computer Engineering Student",
      "affiliation": {
        "@type": "EducationalOrganization",
        "name": "Duzce University"
      }
    },
    "sameAs": [
      "https://github.com/Rtur2003",
      "https://hasan-arthur-altuntas.com.tr"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Technical Support",
      "availableLanguage": ["Turkish", "English"]
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CrownCode Platform",
    "url": baseUrl,
    "description": description,
    "inLanguage": [language === 'tr' ? 'tr-TR' : 'en-US'],
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": isAurisPage ? "AURIS - AI Music Detection Engine" : "CrownCode",
    "description": description,
    "applicationCategory": isAurisPage ? "MultimediaApplication" : "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Hasan Arthur Altuntas",
      "url": baseUrl
    },
    "image": imageUrl,
    "url": canonicalUrl
  }

  const researchSchema = isAurisPage ? {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "name": "AURIS: AI Music Detection Using Multi-Tower Deep Learning Architecture",
    "author": {
      "@type": "Person",
      "name": "Hasan Arthur Altuntas",
      "affiliation": {
        "@type": "EducationalOrganization",
        "name": "Duzce University, Computer Engineering"
      }
    },
    "description": "Bachelor's thesis research on detecting AI-generated music using a 4-tower ensemble architecture with 49 acoustic features and vocal analysis.",
    "keywords": "AI music detection, deep learning, wav2vec2, audio fingerprinting, vocal analysis",
    "inLanguage": language === 'tr' ? 'tr-TR' : 'en-US',
    "url": canonicalUrl
  } : null

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      ...(isAurisPage ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "AURIS AI Music Detection",
        "item": `${baseUrl}/ai-music-detection`
      }] : [])
    ]
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
        <meta
          name="robots"
          content={noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
        />
        <meta name="language" content={metaLanguage} />
        <meta name="googlebot" content={noIndex ? 'noindex, follow' : 'index, follow'} />
        <link rel="canonical" href={canonicalUrl} />

        {/* No hreflang: the tr/en toggle is client-side state on one URL,
            not locale-specific routes, so per Google's own guidance a
            hreflang block here would point every locale at an identical
            URL — invalid, and Search Console would flag it as such. */}

        {/* Mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CrownCode" />
        <meta name="format-detection" content="telephone=no" />

        {/* Cache Control */}
        {noCache && (
          <>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
          </>
        )}

        {/* Open Graph */}
        <meta property="og:type" content={isAurisPage ? 'article' : 'website'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="CrownCode Platform" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta property="og:locale" content={ogLocale} />
        <meta property="og:locale:alternate" content={ogLocale === 'tr_TR' ? 'en_US' : 'tr_TR'} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:creator" content="@rthur" />
        <meta name="twitter:site" content="@crowncode" />

        {/* Structured Data — Organization */}
        {isHomePage && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
        )}

        {/* Structured Data — WebSite with SearchAction */}
        {isHomePage && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
        )}

        {/* Structured Data — Software */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />

        {/* Structured Data — Research / Scholarly Article */}
        {researchSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(researchSchema) }}
          />
        )}

        {/* Structured Data — Breadcrumb */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
