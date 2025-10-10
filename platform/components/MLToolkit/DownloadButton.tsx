'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface DownloadButtonProps {
  isReady: boolean
  fileCount: number
  onDownload: () => Promise<void>
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  isReady,
  fileCount,
  onDownload
}) => {
  const { t } = useLanguage()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleDownload = async () => {
    if (!isReady || isDownloading) { return }

    setIsDownloading(true)
    try {
      await onDownload()
      setIsComplete(true)
      setTimeout(() => setIsComplete(false), 3000)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const getButtonContent = () => {
    if (isComplete) {
      return (
        <>
          <CheckCircle size={20} />
          <span>{t.mlToolkit.download.downloaded}</span>
        </>
      )
    }

    if (isDownloading) {
      return (
        <>
          <Loader size={20} className="animate-spin" />
          <span>{t.mlToolkit.download.downloading}</span>
        </>
      )
    }

    return (
      <>
        <Download size={20} />
        <span>{t.mlToolkit.download.button.replace('{count}', fileCount.toString())}</span>
      </>
    )
  }

  return (
    <motion.button
      onClick={handleDownload}
      disabled={!isReady || isDownloading}
      className={`download-button ${isReady ? 'ready' : 'disabled'} ${isComplete ? 'complete' : ''}`}
      whileHover={isReady ? { scale: 1.02 } : {}}
      whileTap={isReady ? { scale: 0.98 } : {}}
    >
      {getButtonContent()}
    </motion.button>
  )
}

export default DownloadButton