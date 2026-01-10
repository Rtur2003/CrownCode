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
// @version 2.0.0
// @since 2025-01-10
// =========================================================================

import React, { useState } from 'react'
import type { NextPage } from 'next'
import { motion, AnimatePresence } from 'framer-motion'
import { MainLayout } from '@/components/Layout/MainLayout'
import {
  Upload,
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

import '@/styles/pages/data-manipulation.css'

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
      title: 'Audio Augmentation',
      description: 'Enhance your dataset with pitch shifting, speed changes, and noise injection.',
      icon: Music,
      gradient: 'from-primary to-secondary',
      status: 'available'
    },
    {
      id: 'convert' as ToolId,
      title: 'Format Converter',
      description: 'Convert audio files between formats (MP3, WAV, FLAC). (Coming Soon)',
      icon: RefreshCw,
      gradient: 'from-gray-500 to-gray-600',
      status: 'coming_soon'
    },
    {
      id: 'organize' as ToolId,
      title: 'Dataset Organizer',
      description: 'Organize and label your audio files for training. (Coming Soon)',
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
      setError('Please select a file first.')
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/process/audio`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Processing failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setProcessedFileUrl(url)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
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
        className="tool-interface"
      >
        <button 
          onClick={() => {
            setActiveTool(null)
            setFiles([])
            setProcessedFileUrl(null)
            setError(null)
          }}
          className="back-button"
        >
          <ArrowLeft size={20} />
          <span>Back to Tools</span>
        </button>

        <div className="interface-grid">
          <div className="left-panel">
            <h2 className="section-title">1. Upload Audio</h2>
            <FileUploader 
              dataType="audio" 
              onFilesSelected={handleFilesSelected} 
            />
            
            {files.length > 0 && (
              <div className="file-status">
                <span className="text-primary font-medium">{files[0].name}</span> selected.
                {files.length > 1 && <span className="text-xs text-muted block mt-1">(Only the first file will be processed in this demo)</span>}
              </div>
            )}
          </div>

          <div className="right-panel">
            <h2 className="section-title">2. Configure Augmentation</h2>
            <AudioAugmentation 
              options={augmentOptions} 
              onChange={setAugmentOptions} 
            />

            <div className="action-area">
              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <button 
                className={`process-button ${isProcessing ? 'processing' : ''}`}
                onClick={handleProcess}
                disabled={isProcessing || files.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    Start Processing
                  </>
                )}
              </button>

              {processedFileUrl && (
                <motion.a
                  href={processedFileUrl}
                  download={`processed-${files[0]?.name || 'audio'}.wav`}
                  className="download-button"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Download size={20} />
                  Download Result
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
      <div className="page-container">
        <div className="content-wrapper">
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="header-badge">
              <Settings size={16} />
              <span>Audio Dataset Tools</span>
            </div>

            <h1 className="page-title">
              {activeTool ? tools.find(t => t.id === activeTool)?.title : t.audioDataset.title}
            </h1>
            
            {!activeTool && (
              <p className="page-subtitle">
                {t.audioDataset.subtitle}
              </p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTool ? (
              renderToolInterface()
            ) : (
              <motion.div
                className="tools-grid"
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
                      className={`tool-card ${!isAvailable ? 'opacity-50 grayscale' : ''}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => isAvailable && setActiveTool(tool.id)}
                    >
                      <div className="tool-header">
                        <div className={`tool-icon bg-gradient-to-r ${tool.gradient}`}>
                          <Icon size={24} />
                        </div>
                      </div>

                      <div className="tool-content">
                        <h3 className="tool-title">{tool.title}</h3>
                        <p className="tool-description">{tool.description}</p>
                      </div>

                      <div className="tool-footer">
                         <span className="tool-action-text">
                           {isAvailable ? 'Open Tool →' : 'Coming Soon'}
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