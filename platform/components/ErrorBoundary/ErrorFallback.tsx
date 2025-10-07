/**
 * Error Fallback Component
 * Kullanım: Error boundary fallback UI
 */

import React, { ErrorInfo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  resetError?: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError
}) => {
  const { t } = useLanguage()

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
            {t.toast?.error?.title || 'Error'}
          </h1>

          {/* Message */}
          <p className="error-message">
            {error?.message || t.toast?.error?.general || 'An unexpected error occurred'}
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
              <span>Reload Page</span>
            </button>

            <Link href="/" className="btn btn-secondary">
              <Home size={18} />
              <span>{t.nav.home}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
