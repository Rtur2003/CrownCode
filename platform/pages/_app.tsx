/**
 * Next.js App Component
 * Kullanım: Tüm sayfalar için global wrapper
 * Bağımlılıklar: LanguageProvider, ToastProvider, ErrorBoundary, LazyMotion, fonts, global styles
 */

import React, { useEffect, useSyncExternalStore, lazy, Suspense } from 'react'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import { LazyMotion } from 'motion/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/context/ToastContext'
import { ToastContainer } from '@/components/UI/Toast/ToastContainer'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { JobPill } from '@/components/Auris/JobPill'
import { AppShell } from '@/components/Layout/AppShell'
import { ADSENSE_CLIENT_ID, ADS_ENABLED } from '@/config/ads'
import { imFell, imFellItalic, jetbrainsMono, portmanteau } from '@/styles/fonts'
import '@/styles/globals.css'

// Dynamic imports for better code splitting - load modals only when needed
const ShortcutsModal = lazy(() => import('@/components/KeyboardShortcuts/ShortcutsModal').then(m => ({ default: m.ShortcutsModal })))
const SearchModal = lazy(() => import('@/components/Search/SearchModal').then(m => ({ default: m.SearchModal })))
const ExternalLinkWarning = lazy(() => import('@/components/ExternalLink/ExternalLinkWarning').then(m => ({ default: m.ExternalLinkWarning })))
const SponsorModal = lazy(() => import('@/components/Sponsor/SponsorModal').then(m => ({ default: m.SponsorModal })))

// Motion's animation features arrive in their own chunk after hydration.
const loadMotionFeatures = () => import('@/config/motion-features').then(m => m.default)

const emptySubscribe = () => () => {}

function MyApp({ Component, pageProps }: AppProps) {
  const modalsReady = useSyncExternalStore(emptySubscribe, () => true, () => false)

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <ErrorBoundary>
      {ADS_ENABLED && (
        <Script
          id="google-adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      )}
      {/* Font families are exposed as CSS variables on :root so the
          design tokens in styles/base/variables.css can reference them. */}
      <style jsx global>{`
        :root {
          --font-im-fell: ${imFell.style.fontFamily};
          --font-im-fell-italic: ${imFellItalic.style.fontFamily};
          --font-portmanteau: ${portmanteau.style.fontFamily};
          --font-jetbrains-mono: ${jetbrainsMono.style.fontFamily};
        }
      `}</style>
      {/* The site ships a single dark palette (color-scheme: dark in
          _document), so there is no theme provider or pre-paint theme script. */}
      <LanguageProvider>
        <LazyMotion features={loadMotionFeatures} strict>
          <ToastProvider>
            <AppShell>
              <Component {...pageProps} />
            </AppShell>
            <ToastContainer />
            {/* AURIS jobs outlive their page; this links back while one runs */}
            <JobPill />
            {/* Mount modals only after first user interaction to avoid eager chunk loading */}
            {modalsReady && (
              <Suspense fallback={null}>
                <ShortcutsModal />
                <SearchModal />
                <ExternalLinkWarning />
                <SponsorModal />
              </Suspense>
            )}
          </ToastProvider>
        </LazyMotion>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default MyApp

/**
 * Web Vitals reporting for performance monitoring
 * Tracks Core Web Vitals: LCP, INP, CLS, FCP, TTFB
 */
interface WebVitalMetric {
  name: string
  value: number
  rating: string
  delta: number
  id: string
}

export function reportWebVitals(metric: WebVitalMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    })
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify({
      name: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      id: metric.id,
      page: window.location.pathname,
    })

    // Use sendBeacon for reliable delivery without blocking navigation
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/vitals', body)
    }
  }
}
