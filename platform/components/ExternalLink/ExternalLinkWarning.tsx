/**
 * External Link Warning Component
 * Shows a warning modal when users click external links
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
  const { t } = useLanguage()
  const el = t.externalLink

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

    if (!link) {
      return
    }

    const href = link.getAttribute('href')
    if (!href) {
      return
    }

    // Skip internal links and non-http links
    if (!href.startsWith('http')) {
      return
    }

    // Check if external
    if (isExternalLink(href)) {
      e.preventDefault()
      e.stopPropagation()
      setTargetUrl(href)
      setIsOpen(true)
    }
  }, [isExternalLink])

  useEffect(() => {
    if (!enabled) {
      return
    }

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
            role="dialog"
            aria-modal="true"
            aria-labelledby="external-link-title"
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
              aria-label={t.aria?.closeModal || 'Close'}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="external-link-icon">
              <AlertTriangle size={48} />
            </div>

            {/* Title */}
            <h3 id="external-link-title" className="external-link-title">{el.title}</h3>

            {/* Description */}
            <p className="external-link-description">{el.description}</p>

            {/* URL Display */}
            <div className="external-link-url">
              <ExternalLink size={16} />
              <span>{targetUrl}</span>
            </div>

            {/* Note */}
            <p className="external-link-note">{el.note}</p>

            {/* Buttons */}
            <div className="external-link-buttons">
              <button
                type="button"
                className="external-link-btn primary"
                onClick={handleContinue}
              >
                <ExternalLink size={18} />
                {el.continue}
              </button>
              <button
                type="button"
                className="external-link-btn secondary"
                onClick={handleClose}
              >
                {el.cancel}
              </button>
            </div>

            {/* Tip */}
            <div className="external-link-tip">
              <ShieldAlert size={14} />
              <span>{el.tip}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExternalLinkWarning
