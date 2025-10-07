/**
 * Next.js App Component
 * Kullanım: Tüm sayfalar için global wrapper
 * Bağımlılıklar: ThemeProvider, LanguageProvider, ToastProvider, ErrorBoundary, LoadingScreen, global styles
 */

import React, { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/context/ToastContext'
import { ToastContainer } from '@/components/UI/Toast/ToastContainer'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { ShortcutsModal } from '@/components/KeyboardShortcuts/ShortcutsModal'
import { SearchModal } from '@/components/Search/SearchModal'
import { LoadingScreen } from '@/components/Loading/LoadingScreen'
import '@/styles/globals.css'

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
            <ShortcutsModal />
            <SearchModal />
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default MyApp
