/**
 * Next.js App Component
 * Kullanım: Tüm sayfalar için global wrapper
 * Bağımlılıklar: ThemeProvider, LanguageProvider, ToastProvider, global styles
 */

import React from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/context/ToastContext'
import { ToastContainer } from '@/components/UI/Toast/ToastContainer'
import '@/styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      themes={['light', 'dark', 'system']}
    >
      <LanguageProvider>
        <ToastProvider>
          <Component {...pageProps} />
          <ToastContainer />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default MyApp
