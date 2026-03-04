// =========================================================================
// AUDIO DATASET TOOLS PAGE - AUDIO DATA PREPARATION & PROCESSING
// =========================================================================
// Specialized interface for audio dataset preparation and processing.
//
// Features:
// - Audio file upload
// - Audio augmentation (pitch, tempo, noise)
// - Backend processing integration
// - File download
//
// @author Hasan Arthur Altuntaş
// @version 2.1.0
// @since 2025-01-10
// =========================================================================

import React, { useState } from 'react'
import type { NextPage } from 'next'
import { motion, AnimatePresence } from 'framer-motion'
import { MainLayout } from '@/components/Layout/MainLayout'
import {
  RefreshCw,
  Music,
  FolderOpen,
  Settings,
  ArrowLeft,
  Play,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import FileUploader from '@/components/MLToolkit/FileUploader'
import AudioAugmentation, { AudioAugmentationOptions } from '@/components/MLToolkit/AudioAugmentation'

import styles from '@/styles/pages/data-manipulation.module.css'

type ToolId = 'upload' | 'convert' | 'augment' | 'organize'

const AudioDatasetPage: NextPage = () => {
  const { t } = useLanguage()
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [augmentOptions, setAugmentOptions] = useState<AudioAugmentationOptions>({
    pitchShift: false,
    speedChange: false,
    bassBoost: false,
    trimSilence: false,
    mixAudio: false,
    addNoise: false
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tools = [
    {
      id: 'augment' as ToolId,
      title: t.audioDataset.tools.augment.title,
      description: t.audioDataset.tools.augment.description,
      icon: Music,
      gradient: 'from-primary to-secondary',
      status: 'available'
    },
    {
      id: 'convert' as ToolId,
      title: t.audioDataset.tools.convert.title,
      description: t.audioDataset.tools.convert.description,
      icon: RefreshCw,
      gradient: 'from-gray-500 to-gray-600',
      status: 'coming_soon'
    },
    {
      id: 'organize' as ToolId,
      title: t.audioDataset.tools.organize.title,
      description: t.audioDataset.tools.organize.description,
      icon: FolderOpen,
      gradient: 'from-gray-500 to-gray-600',
      status: 'coming_soon'
    }
  ]

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setError(null)
    setProcessedFileUrl(null)
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      setError(t.audioDataset.interface.errors.selectFile)
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessedFileUrl(null)

    // For MVP, we process the first file only
    const fileToProcess = files[0]
    const formData = new FormData()
    formData.append('file', fileToProcess)
    formData.append('options', JSON.stringify(augmentOptions))

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        throw new Error('Backend API URL is not configured.')
      }
      const response = await fetch(`${apiUrl}/api/process/audio`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || t.audioDataset.interface.errors.processingFailed)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setProcessedFileUrl(url)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t.audioDataset.interface.errors.unexpected
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderToolInterface = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={styles['tool-interface']}
      >
        <button 
          onClick={() => {
            setActiveTool(null)
            setFiles([])
            setProcessedFileUrl(null)
            setError(null)
          }}
          className={styles['back-button']}
        >
          <ArrowLeft size={20} />
          <span>{t.audioDataset.interface.backToTools}</span>
        </button>

        <div className={styles['interface-grid']}>
          <div className="left-panel">
            <h2 className={styles['section-title']}>{t.audioDataset.interface.step1}</h2>
            <FileUploader 
              dataType="audio" 
              onFilesSelected={handleFilesSelected} 
            />
            
            {files.length > 0 && (
              <div className={styles['file-status']}>
                <span className="text-primary font-medium">{files[0].name}</span> {t.audioDataset.interface.selected}.
                {files.length > 1 && <span className="text-xs text-muted block mt-1">{t.audioDataset.interface.demoNote}</span>}
              </div>
            )}
          </div>

          <div className="right-panel">
            <h2 className={styles['section-title']}>{t.audioDataset.interface.step2}</h2>
            <AudioAugmentation 
              options={augmentOptions} 
              onChange={setAugmentOptions} 
            />

            <div className={styles['action-area']}>
              {error && (
                <div className={styles['error-message']}>
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <button 
                className={`${styles['process-button']} ${isProcessing ? 'processing' : ''}`}
                onClick={handleProcess}
                disabled={isProcessing || files.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {t.audioDataset.interface.processing}
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    {t.audioDataset.interface.startProcessing}
                  </>
                )}
              </button>

              {processedFileUrl && (
                <motion.a
                  href={processedFileUrl}
                  download={`processed-${files[0]?.name || 'audio'}.wav`}
                  className={styles['download-button']}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Download size={20} />
                  {t.audioDataset.interface.downloadResult}
                </motion.a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <MainLayout
      title={`${t.audioDataset.title} - CrownCode Platform`}
      description={t.audioDataset.subtitle}
      keywords="audio dataset, data preparation, audio processing, AI music detection, dataset tools"
    >
      <div className={styles['page-container']}>
        <div className={styles['content-wrapper']}>
          <motion.div
            className={styles['page-header']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles['header-badge']}>
              <Settings size={16} />
              <span>{t.audioDataset.title}</span>
            </div>

            <h1 className={styles['page-title']}>
              {activeTool ? tools.find(t => t.id === activeTool)?.title : t.audioDataset.title}
            </h1>
            
            {!activeTool && (
              <p className={styles['page-subtitle']}>
                {t.audioDataset.subtitle}
              </p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTool ? (
              renderToolInterface()
            ) : (
              <motion.div
                className={styles['tools-grid']}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {tools.map((tool, index) => {
                  const Icon = tool.icon
                  const isAvailable = tool.status === 'available'

                  return (
                    <motion.div
                      key={tool.id}
                      className={`${styles['tool-card']} ${!isAvailable ? 'opacity-50 grayscale' : ''}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => isAvailable && setActiveTool(tool.id)}
                    >
                      <div className="tool-header">
                        <div className={`${styles['tool-icon']} bg-gradient-to-r ${tool.gradient}`}>
                          <Icon size={24} />
                        </div>
                      </div>

                      <div className="tool-content">
                        <h3 className={styles['tool-title']}>{tool.title}</h3>
                        <p className={styles['tool-description']}>{tool.description}</p>
                      </div>

                      <div className={styles['tool-footer']}>
                         <span className={styles['tool-action-text']}>
                           {isAvailable ? t.audioDataset.interface.openTool : t.audioDataset.interface.comingSoon}
                         </span>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </MainLayout>
  )
}

export default AudioDatasetPage