/**
 * Next.js App Component
 * Kullanım: Tüm sayfalar için global wrapper
 * Bağımlılıklar: ThemeProvider, LanguageProvider, ToastProvider, ErrorBoundary, LoadingScreen, global styles
 */

import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/context/ToastContext'
import { ToastContainer } from '@/components/UI/Toast/ToastContainer'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { LoadingScreen } from '@/components/Loading/LoadingScreen'
import '@/styles/globals.css'

// Dynamic imports for better code splitting - load modals only when needed
const ShortcutsModal = lazy(() => import('@/components/KeyboardShortcuts/ShortcutsModal').then(m => ({ default: m.ShortcutsModal })))
const SearchModal = lazy(() => import('@/components/Search/SearchModal').then(m => ({ default: m.SearchModal })))
const ExternalLinkWarning = lazy(() => import('@/components/ExternalLink/ExternalLinkWarning').then(m => ({ default: m.ExternalLinkWarning })))

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [modalsReady, setModalsReady] = useState(false)

  // useLayoutEffect (not useEffect) so a returning visitor's correction
  // happens before the browser paints — avoids a one-frame flash of the
  // full-screen LoadingScreen on every navigation within the session.
  // The first render must still match SSR (always "loading"), so this
  // can't be a useState lazy initializer without causing a hydration
  // mismatch — sessionStorage isn't available on the server.
  useLayoutEffect(() => {
    if (sessionStorage.getItem('hasLoaded')) {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Defer modal chunk loading until first user interaction
    const activateModals = () => setModalsReady(true)
    window.addEventListener('keydown', activateModals, { once: true })
    window.addEventListener('click', activateModals, { once: true })

    // Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // eslint-disable-next-line no-console
          console.log('[SW] Service Worker registered:', registration.scope)
        })
        .catch((error) => {
           
          console.error('[SW] Service Worker registration failed:', error)
        })
    }

    return () => {
      window.removeEventListener('keydown', activateModals)
      window.removeEventListener('click', activateModals)
    }
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasLoaded', 'true')
    setIsLoading(false)
  }

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        themes={['light', 'dark', 'system']}
      >
        <LanguageProvider>
          <ToastProvider>
            {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
            <Component {...pageProps} />
            <ToastContainer />
            {/* Mount modals only after first user interaction to avoid eager chunk loading */}
            {modalsReady && (
              <Suspense fallback={null}>
                <ShortcutsModal />
                <SearchModal />
                <ExternalLinkWarning />
              </Suspense>
            )}
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default MyApp

/**
 * Web Vitals reporting for performance monitoring
 * Tracks Core Web Vitals: LCP, FID, CLS, FCP, TTFB
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
