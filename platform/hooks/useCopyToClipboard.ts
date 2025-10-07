/**
 * useCopyToClipboard Hook
 * Kullanım: Text'i panoya kopyalama
 * Bağımlılıklar: ToastContext (optional)
 */

import { useState, useCallback } from 'react'
import { useToast } from '@/context/ToastContext'
import { useLanguage } from '@/context/LanguageContext'

interface CopyToClipboardResult {
  copied: boolean
  copyToClipboard: (text: string, showToast?: boolean) => Promise<boolean>
  resetCopied: () => void
}

export const useCopyToClipboard = (): CopyToClipboardResult => {
  const [copied, setCopied] = useState(false)
  const { success, error } = useToast()
  const { t } = useLanguage()

  const copyToClipboard = useCallback(
    async (text: string, showToast: boolean = true): Promise<boolean> => {
      try {
        // Modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          setCopied(true)

          if (showToast) {
            success(t.toast?.success?.copied || 'Copied to clipboard')
          }

          // Reset after 2 seconds
          setTimeout(() => setCopied(false), 2000)
          return true
        }

        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand('copy')
        textArea.remove()

        if (successful) {
          setCopied(true)
          if (showToast) {
            success(t.toast?.success?.copied || 'Copied to clipboard')
          }
          setTimeout(() => setCopied(false), 2000)
          return true
        }

        throw new Error('Copy command failed')
      } catch (err) {
        console.error('Failed to copy:', err)
        if (showToast) {
          error(t.toast?.error?.general || 'Failed to copy')
        }
        return false
      }
    },
    [success, error, t]
  )

  const resetCopied = useCallback(() => {
    setCopied(false)
  }, [])

  return {
    copied,
    copyToClipboard,
    resetCopied
  }
}
