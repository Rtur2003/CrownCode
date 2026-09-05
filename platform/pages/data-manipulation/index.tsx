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

import React, { useState, useEffect, useRef } from 'react'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'
import type { NextPage } from 'next'
import { motion, AnimatePresence } from 'motion/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import {
  RefreshCw,
  Music,
  FolderOpen,
  Waves,
  ArrowLeft,
  ArrowRight,
  Play,
  Download,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import FileUploader from '@/components/MLToolkit/FileUploader'
import AudioAugmentation, { AudioAugmentationOptions } from '@/components/MLToolkit/AudioAugmentation'
import FormatConverter, { FormatConvertOptions } from '@/components/MLToolkit/FormatConverter'
import DatasetMetadataResult, { DatasetEntryMetadata } from '@/components/MLToolkit/DatasetMetadataResult'
import ProcessLog, { LogEntry } from '@/components/MLToolkit/ProcessLog'

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
  const [convertOptions, setConvertOptions] = useState<FormatConvertOptions>({
    targetFormat: 'mp3',
    bitrateKbps: 192
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null)
  const [organizeResult, setOrganizeResult] = useState<DatasetEntryMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const prevObjectUrlRef = useRef<string | null>(null)

  const pushLog = (message: string, status: LogEntry['status']) => {
    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, message, status, timestamp: new Date() }])
  }

  // Revoke previous object URL when a new one is created or on unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current)
      }
    }
  }, [])

  const tools = [
    {
      id: 'augment' as ToolId,
      title: t.audioDataset.tools.augment.title,
      description: t.audioDataset.tools.augment.description,
      icon: Music,
      status: 'available'
    },
    {
      id: 'convert' as ToolId,
      title: t.audioDataset.tools.convert.title,
      description: t.audioDataset.tools.convert.description,
      icon: RefreshCw,
      status: 'available'
    },
    {
      id: 'organize' as ToolId,
      title: t.audioDataset.tools.organize.title,
      description: t.audioDataset.tools.organize.description,
      icon: FolderOpen,
      status: 'available'
    }
  ]

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setError(null)
    setOrganizeResult(null)
    setLogs([])
    if (processedFileUrl) {
      URL.revokeObjectURL(processedFileUrl)
      prevObjectUrlRef.current = null
      setProcessedFileUrl(null)
    }
    if (newFiles.length > 0) {
      pushLog(t.mlToolkit.logs.filesUploaded.replace('{count}', String(newFiles.length)), 'success')
    }
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      setError(t.audioDataset.interface.errors.selectFile)
      return
    }

    const isConvert = activeTool === 'convert'
    const isOrganize = activeTool === 'organize'
    const isAugment = !isConvert && !isOrganize

    if (isAugment && augmentOptions.mixAudio && files.length < 2) {
      setError(t.mlToolkit.audioOptions.mixAudioNeedsTwoFiles)
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessedFileUrl(null)
    setOrganizeResult(null)
    pushLog(t.mlToolkit.logs.processStarted, 'processing')

    // For MVP, we process the first file as primary; the second file (if
    // present) is only used when Mix Audio is enabled.
    const fileToProcess = files[0]
    const formData = new FormData()
    formData.append('file', fileToProcess)
    if (!isOrganize) {
      formData.append('options', JSON.stringify(isConvert ? convertOptions : augmentOptions))
    }
    if (isAugment && augmentOptions.mixAudio && files[1]) {
      formData.append('mix_file', files[1])
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        throw new Error('Backend API URL is not configured.')
      }
      const endpoint = isOrganize
        ? '/api/process/audio/organize'
        : isConvert
          ? '/api/process/audio/convert'
          : '/api/process/audio'
      const response = await fetchWithTimeout(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        timeout: 60_000,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: {} }))
        const detail = errData.detail
        const message = typeof detail === 'object' && detail?.message ? detail.message : (typeof detail === 'string' ? detail : t.audioDataset.interface.errors.processingFailed)
        throw new Error(message)
      }

      if (isOrganize) {
        const metadata: DatasetEntryMetadata = await response.json()
        setOrganizeResult(metadata)
        pushLog(t.mlToolkit.logs.allReady.replace('{count}', '1'), 'success')
        return
      }

      const blob = await response.blob()
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current)
      }
      const url = URL.createObjectURL(blob)
      prevObjectUrlRef.current = url
      setProcessedFileUrl(url)
      pushLog(t.mlToolkit.logs.allReady.replace('{count}', '1'), 'success')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t.audioDataset.interface.errors.unexpected
      setError(errorMessage)
      pushLog(errorMessage, 'error')
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
        <div className={styles['interface-header']}>
          <button
            onClick={() => {
              setActiveTool(null)
              setFiles([])
              if (processedFileUrl) {
                URL.revokeObjectURL(processedFileUrl)
                prevObjectUrlRef.current = null
              }
              setProcessedFileUrl(null)
              setOrganizeResult(null)
              setError(null)
              setLogs([])
            }}
            className={styles['back-button']}
          >
            <ArrowLeft size={20} />
            <span>{t.audioDataset.interface.backToTools}</span>
          </button>
          <h1 className={styles['interface-title']}>
            {tools.find(tool => tool.id === activeTool)?.title}
          </h1>
        </div>

        <div className={styles['interface-grid']}>
          <div className="left-panel">
            <h2 className={styles['section-title']}>{t.audioDataset.interface.step1}</h2>
            <FileUploader
              dataType="audio"
              files={files}
              onFilesChange={handleFilesChange}
            />
            
            {files.length > 0 && (
              <div className={styles['file-status']}>
                <span className="text-primary font-medium">{files[0].name}</span> {t.audioDataset.interface.selected}.
                {files.length > 1 && <span className="text-xs text-muted block mt-1">{t.audioDataset.interface.demoNote}</span>}
              </div>
            )}

            {logs.length > 0 && <ProcessLog logs={logs} />}
          </div>

          <div className="right-panel">
            <h2 className={styles['section-title']}>
              {activeTool === 'organize' ? t.mlToolkit.organizer.step2 : t.audioDataset.interface.step2}
            </h2>
            {activeTool === 'convert' ? (
              <FormatConverter
                options={convertOptions}
                onChange={setConvertOptions}
              />
            ) : activeTool === 'organize' ? (
              <p className={styles['file-status']}>{t.mlToolkit.organizer.description}</p>
            ) : (
              <AudioAugmentation
                options={augmentOptions}
                onChange={setAugmentOptions}
              />
            )}

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
                    {activeTool === 'organize' ? t.mlToolkit.organizer.analyze : t.audioDataset.interface.startProcessing}
                  </>
                )}
              </button>

              {activeTool === 'organize' && organizeResult && (
                <DatasetMetadataResult metadata={organizeResult} />
              )}

              {activeTool !== 'organize' && processedFileUrl && (
                <motion.a
                  href={processedFileUrl}
                  download={
                    activeTool === 'convert'
                      ? `converted-${files[0]?.name?.replace(/\.[^.]+$/, '') || 'audio'}.${convertOptions.targetFormat}`
                      : `processed-${files[0]?.name || 'audio'}.wav`
                  }
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
      keywords={t.dataManipulationMeta?.keywords || 'audio dataset, data preparation'}
    >
      <div className={styles['page-container']}>
        <div className={styles['content-wrapper']}>
          {!activeTool ? (
            <>
              <motion.div
                className={styles['workbench-intro']}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={styles['workbench-copy']}>
                  <span className={styles['header-badge']}>{t.audioDataset.title}</span>
                  <h1 className={styles['page-title']}>{t.audioDataset.title}</h1>
                  <p className={styles['page-subtitle']}>{t.audioDataset.subtitle}</p>
                </div>
                <div className={styles['workbench-waveform']} aria-hidden="true">
                  <Waves size={140} strokeWidth={1} />
                </div>
              </motion.div>

              {/* Pipeline strip: this is a literal sequential process
                  (upload -> augment -> convert -> organize), so a numbered
                  stage treatment reflects the real content instead of
                  decorating three unrelated feature cards identically. */}
              <div className={styles['pipeline-strip']} role="list" aria-label="Processing pipeline">
                {tools.map((tool, index) => {
                  const Icon = tool.icon
                  const isAvailable = tool.status === 'available'

                  return (
                    <React.Fragment key={tool.id}>
                      <motion.button
                        type="button"
                        role="listitem"
                        className={`${styles['pipeline-stage']} ${isAvailable ? styles['pipeline-stage--active'] : styles['pipeline-stage--locked']}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 * index }}
                        onClick={() => isAvailable && setActiveTool(tool.id)}
                        disabled={!isAvailable}
                      >
                        <span className={styles['pipeline-stage-index']}>{index + 1}</span>
                        <div className={styles['pipeline-stage-icon']}>
                          {isAvailable ? <Icon size={22} /> : <Lock size={18} />}
                        </div>
                        <div className={styles['pipeline-stage-copy']}>
                          <h3 className={styles['tool-title']}>{tool.title}</h3>
                          <p className={styles['tool-description']}>{tool.description}</p>
                        </div>
                        <span className={styles['pipeline-stage-status']}>
                          {isAvailable ? t.audioDataset.interface.openTool : t.audioDataset.interface.comingSoon}
                        </span>
                      </motion.button>
                      {index < tools.length - 1 && (
                        <div className={styles['pipeline-connector']} aria-hidden="true">
                          <ArrowRight size={18} />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </>
          ) : (
            <AnimatePresence mode="wait">
              {renderToolInterface()}
            </AnimatePresence>
          )}
        </div>
      </div>

    </MainLayout>
  )
}

export default AudioDatasetPage