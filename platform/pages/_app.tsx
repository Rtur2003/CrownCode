/**
 * Next.js App Component
 * Kullanım: Tüm sayfalar için global wrapper
 * Bağımlılıklar: ThemeProvider, LanguageProvider, ToastProvider, ErrorBoundary, LoadingScreen, global styles
 */

import React, { useState, useEffect, lazy, Suspense } from 'react'
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

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if this is first load
    const hasLoaded = sessionStorage.getItem('hasLoaded')
    if (hasLoaded) {
      setIsLoading(false)
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
            {/* Lazy load modals for better initial load performance */}
            <Suspense fallback={null}>
              <ShortcutsModal />
              <SearchModal />
            </Suspense>
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
export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    })
  }

  // Send to analytics in production (example)
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to analytics service
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_category: 'Web Vitals',
    // })
  }
}
