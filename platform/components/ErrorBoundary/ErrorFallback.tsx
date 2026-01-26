/**
 * Error Fallback Component
 * Kullanım: Error boundary fallback UI
 *
 * NOT: Bu komponent LanguageProvider dışında render edilebilir,
 * bu yüzden useLanguage kullanmıyoruz - statik fallback metinleri kullanıyoruz.
 */

import React, { ErrorInfo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  resetError?: () => void
}

// Static fallback strings (no hooks - safe outside providers)
const FALLBACK_TEXT = {
  title: 'Bir Hata Oluştu',
  message: 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.',
  reload: 'Sayfayı Yenile',
  home: 'Ana Sayfa'
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError
}) => {

  const handleReload = () => {
    if (resetError) {
      resetError()
    }
    window.location.reload()
  }

  return (
    <div className="error-page">
      <div className="error-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="error-content"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="error-icon"
          >
            <AlertTriangle size={64} />
          </motion.div>

          {/* Title */}
          <h1 className="error-title">
            {FALLBACK_TEXT.title}
          </h1>

          {/* Message */}
          <p className="error-message">
            {error?.message || FALLBACK_TEXT.message}
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && errorInfo && (
            <details className="error-details">
              <summary>Technical Details (Dev Only)</summary>
              <pre className="error-stack">
                {error?.stack}
                {'\n\nComponent Stack:'}
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="error-actions">
            <button
              onClick={handleReload}
              className="btn btn-primary"
            >
              <RefreshCcw size={18} />
              <span>{FALLBACK_TEXT.reload}</span>
            </button>

            <Link href="/" className="btn btn-secondary">
              <Home size={18} />
              <span>{FALLBACK_TEXT.home}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
