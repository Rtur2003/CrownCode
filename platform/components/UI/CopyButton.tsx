/**
 * Copy Button Component
 * Kullanım: Text'i panoya kopyalama butonu
 * Bağımlılıklar: useCopyToClipboard hook
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

interface CopyButtonProps {
  text: string
  className?: string
  showToast?: boolean
  size?: number
  label?: string
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = '',
  showToast = true,
  size = 18,
  label
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard()

  const handleCopy = () => {
    copyToClipboard(text, showToast)
  }

  return (
    <button
      onClick={handleCopy}
      className={`copy-button ${copied ? 'copied' : ''} ${className}`}
      aria-label={label || 'Copy to clipboard'}
      title={label || 'Copy to clipboard'}
    >
      <motion.div
        initial={false}
        animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {copied ? <Check size={size} /> : <Copy size={size} />}
      </motion.div>
    </button>
  )
}
