/**
 * External Link Warning Component
 * Shows a warning modal when users click external links
 * Cross-pollinated from my_music_page
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ExternalLink, X, ShieldAlert } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ExternalLinkWarningProps {
  enabled?: boolean
  trustedDomains?: string[]
}

export const ExternalLinkWarning: React.FC<ExternalLinkWarningProps> = ({
  enabled = true,
  trustedDomains = ['hasanarthuraltuntas.xyz', 'hasanarthuraltuntas.com.tr', 'github.com', 'localhost']
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const { language } = useLanguage()

  const t = {
    title: language === 'tr' ? 'Harici Bağlantı Uyarısı' : 'External Link Warning',
    description: language === 'tr'
      ? 'Bu bağlantı sizi harici bir web sitesine yönlendirecek:'
      : 'This link will take you to an external website:',
    note: language === 'tr'
      ? 'Bu bağlantının güvenli olduğundan emin misiniz?'
      : 'Are you sure this link is safe?',
    continue: language === 'tr' ? 'Devam Et' : 'Continue',
    cancel: language === 'tr' ? 'İptal' : 'Cancel',
    tip: language === 'tr'
      ? 'Harici siteler CrownCode tarafından kontrol edilmez.'
      : 'External sites are not controlled by CrownCode.'
  }

  const isExternalLink = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      return !trustedDomains.some(domain =>
        hostname === domain || hostname.endsWith(`.${domain}`)
      )
    } catch {
      return false
    }
  }, [trustedDomains])

  const handleLinkClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const link = target.closest('a')

    if (!link) return

    const href = link.getAttribute('href')
    if (!href) return

    // Skip internal links and non-http links
    if (!href.startsWith('http')) return

    // Check if external
    if (isExternalLink(href)) {
      e.preventDefault()
      e.stopPropagation()
      setTargetUrl(href)
      setIsOpen(true)
    }
  }, [isExternalLink])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('click', handleLinkClick, true)
    return () => {
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [enabled, handleLinkClick])

  const handleContinue = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
    setTargetUrl('')
  }

  const handleClose = () => {
    setIsOpen(false)
    setTargetUrl('')
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="external-link-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="external-link-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="external-link-close"
              onClick={handleClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="external-link-icon">
              <AlertTriangle size={48} />
            </div>

            {/* Title */}
            <h3 className="external-link-title">{t.title}</h3>

            {/* Description */}
            <p className="external-link-description">{t.description}</p>

            {/* URL Display */}
            <div className="external-link-url">
              <ExternalLink size={16} />
              <span>{targetUrl}</span>
            </div>

            {/* Note */}
            <p className="external-link-note">{t.note}</p>

            {/* Buttons */}
            <div className="external-link-buttons">
              <button
                className="external-link-btn primary"
                onClick={handleContinue}
              >
                <ExternalLink size={18} />
                {t.continue}
              </button>
              <button
                className="external-link-btn secondary"
                onClick={handleClose}
              >
                {t.cancel}
              </button>
            </div>

            {/* Tip */}
            <div className="external-link-tip">
              <ShieldAlert size={14} />
              <span>{t.tip}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExternalLinkWarning
