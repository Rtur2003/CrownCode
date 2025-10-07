/**
 * Custom Error Page
 * Kullanım: Next.js custom error page (500, etc.)
 * Bağımlılıklar: MainLayout, ErrorFallback
 */

import React from 'react'
import type { NextPage, NextPageContext } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'

interface ErrorProps {
  statusCode?: number
  title?: string
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode, title }) => {
  const isServerError = statusCode && statusCode >= 500
  const isClientError = statusCode && statusCode >= 400 && statusCode < 500

  const getErrorTitle = () => {
    if (title) return title
    if (statusCode === 404) return 'Sayfa Bulunamadı'
    if (isServerError) return 'Sunucu Hatası'
    if (isClientError) return 'İstek Hatası'
    return 'Bir Hata Oluştu'
  }

  const getErrorMessage = () => {
    if (statusCode === 404) {
      return 'Aradığınız sayfa bulunamadı.'
    }
    if (isServerError) {
      return 'Sunucumuzda bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'
    }
    if (isClientError) {
      return 'İsteğiniz işlenirken bir hata oluştu.'
    }
    return 'Beklenmeyen bir hata oluştu.'
  }

  return (
    <MainLayout
      title={`${statusCode || 'Error'} - ${getErrorTitle()}`}
      description={getErrorMessage()}
    >
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

            {/* Status Code */}
            {statusCode && (
              <motion.h1
                className="error-status-code"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                {statusCode}
              </motion.h1>
            )}

            {/* Title */}
            <h2 className="error-title">{getErrorTitle()}</h2>

            {/* Message */}
            <p className="error-message">{getErrorMessage()}</p>

            {/* Actions */}
            <div className="error-actions">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                <RefreshCcw size={18} />
                <span>Sayfayı Yenile</span>
              </button>

              <Link href="/" className="btn btn-secondary">
                <Home size={18} />
                <span>Ana Sayfaya Dön</span>
              </Link>
            </div>

            {/* Helpful Info for Server Errors */}
            {isServerError && (
              <div className="error-help-text">
                <p>
                  Sorun devam ederse, lütfen{' '}
                  <a
                    href="https://github.com/Rtur2003?tab=repositories"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="error-link"
                  >
                    GitHub
                  </a>
                  {' '}üzerinden bize ulaşın.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return statusCode !== undefined ? { statusCode } : {}
}

export default ErrorPage
