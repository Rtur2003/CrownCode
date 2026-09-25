import React, { ReactNode } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useLanguage } from '@/context/LanguageContext'
import {
  APP_SCHEMA,
  AUTHOR_NAME,
  DEFAULT_LOCALE,
  GITHUB_URL,
  HREFLANG,
  LOCALES,
  MUSIC_SITE_URL,
  OG_LOCALE,
  SITE_NAME,
  SITE_URL,
  localizedUrl,
  normalizePath,
} from '@/config/site'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import { Header } from './Header'
import { Footer } from './Footer'
import { RouteBadge } from './RouteBadge'

interface MainLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  keywords?: string
  /** Absolute URL or site-relative path of the social preview image. */
  image?: string
  /** Internal-search results, personal data and error pages stay out of the index. */
  noIndex?: boolean
  /** Extra page-specific schema.org nodes merged into the page's JSON-LD graph. */
  schema?: Record<string, unknown>[]
}

const DEFAULT_TITLE = 'CrownCode | Hasan Arthur Altuntaş'
const DEFAULT_DESCRIPTION = 'Hasan Arthur Altuntaş’s independent projects across sound, data and the web.'
const DEFAULT_OG_IMAGE = '/og/default.jpg'

const OG_IMAGES: Record<string, string> = {
  '/ai-music-detection': '/og/ai-music-detection.jpg',
  '/data-manipulation': '/og/data-manipulation.jpg',
  '/creator-studio': '/og/creator-studio.jpg',
  '/crown-commend': '/og/crown-commend.jpg',
  '/crown-fortune': '/og/crown-fortune.jpg',
  '/crown-dreams': '/og/crown-dreams.jpg',
  '/crown-vote': '/og/crown-vote.jpg',
  '/noir-grain': '/og/noir-grain.jpg',
}

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

/** Page name for breadcrumbs: the part of the title before the brand suffix. */
const shortName = (title: string) => title.split(/\s[|–—-]\s/)[0]?.trim() || title

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image,
  noIndex = false,
  schema = [],
}) => {
  const { language, t } = useLanguage()
  const router = useRouter()
  const path = normalizePath(router.asPath)
  const pathname = router.pathname
  const isHomePage = pathname === '/'

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = localizedUrl(path, language)
  const imagePath = image ?? OG_IMAGES[pathname] ?? DEFAULT_OG_IMAGE
  const imageUrl = imagePath.startsWith('http') ? imagePath : `${SITE_URL}${imagePath}`
  const inLanguage = HREFLANG[language]

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: AUTHOR_NAME,
    alternateName: 'Rthur',
    url: SITE_URL,
    image: `${SITE_URL}/hasan-arthur-profile.jpg`,
    jobTitle: language === 'tr' ? 'Bilgisayar Mühendisliği Öğrencisi' : 'Computer Engineering Student',
    affiliation: { '@type': 'CollegeOrUniversity', name: 'Düzce Üniversitesi' },
    sameAs: [GITHUB_URL, MUSIC_SITE_URL],
  }

  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: LOCALES.map((l) => HREFLANG[l]),
    publisher: { '@id': PERSON_ID },
  }

  const graph: Record<string, unknown>[] = []

  if (isHomePage) {
    graph.push(website, person, {
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#page`,
      url: canonicalUrl,
      name: fullTitle,
      description,
      inLanguage,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': PERSON_ID },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: PRODUCT_CATALOG.map((entry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: resolveProduct(entry, t).title,
          url: entry.href.startsWith('http') ? entry.href : localizedUrl(entry.href, language),
        })),
      },
    })
  } else if (!noIndex) {
    graph.push({
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#page`,
      url: canonicalUrl,
      name: fullTitle,
      description,
      inLanguage,
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: localizedUrl('/', language) },
          { '@type': 'ListItem', position: 2, name: shortName(title), item: canonicalUrl },
        ],
      },
    })

    const app = APP_SCHEMA[pathname]
    if (app) {
      graph.push({
        '@type': app.type ?? 'WebApplication',
        '@id': `${canonicalUrl}#app`,
        name: shortName(title),
        description,
        url: canonicalUrl,
        image: imageUrl,
        applicationCategory: app.category,
        operatingSystem: app.os,
        inLanguage,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@id': PERSON_ID },
        mainEntityOfPage: { '@id': `${canonicalUrl}#page` },
      })
    }
  }

  graph.push(...schema)
  // Nodes referenced by @id must exist in the same graph for validators.
  if (!isHomePage && graph.length > 0) {
    graph.push(person)
  }

  const jsonLd = graph.length > 0
    ? JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
    : null

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="author" content={AUTHOR_NAME} />
        <meta
          name="robots"
          content={noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
        />

        {/* Each language has its own URL, so canonical is self-referencing
            and hreflang ties the pair together. Noindexed pages carry
            neither: they shouldn't consolidate signals anywhere. */}
        {!noIndex && <link rel="canonical" href={canonicalUrl} />}
        {!noIndex && LOCALES.map((locale) => (
          <link key={`hreflang-${locale}`} rel="alternate" hrefLang={HREFLANG[locale]} href={localizedUrl(path, locale)} />
        ))}
        {!noIndex && <link key="hreflang-x-default" rel="alternate" hrefLang="x-default" href={localizedUrl(path, DEFAULT_LOCALE)} />}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={fullTitle} />
        <meta property="og:locale" content={OG_LOCALE[language]} />
        {LOCALES.filter((l) => l !== language).map((l) => (
          <meta key={`og-locale-${l}`} property="og:locale:alternate" content={OG_LOCALE[l]} />
        ))}

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />

        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd }}
          />
        )}
      </Head>

      <a href="#main-content" className="skip-link">
        {t.aria?.skipToContent ?? (language === 'tr' ? 'İçeriğe geç' : 'Skip to content')}
      </a>
      <div className="app-container">
        <Header />
        {/* Project pages: back to their world in the atlas, or on to the next one. */}
        <RouteBadge />
        <main id="main-content" className="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default MainLayout
