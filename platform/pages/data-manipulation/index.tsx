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

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 50%, var(--color-surface-elevated) 100%);
          color: var(--color-text-primary);
          padding: 2rem 0;
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(231, 199, 122, 0.12);
          border: 1px solid rgba(201, 147, 71, 0.45);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-3xl);
          color: var(--color-primary);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .page-subtitle {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .tool-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tool-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-5px);
          box-shadow: var(--shadow-glow);
        }

        .tool-icon {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1.5rem;
        }

        .tool-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .tool-description {
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .tool-action-text {
          color: var(--color-primary);
          font-weight: 600;
        }

        /* Interface Styles */
        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-secondary);
          margin-bottom: 2rem;
          transition: color 0.2s;
        }

        .back-button:hover {
          color: var(--color-primary);
        }

        .interface-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: var(--color-text-primary);
        }

        .action-area {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .process-button, .download-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          border-radius: var(--radius-lg);
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .process-button {
          background: var(--color-primary);
          color: var(--color-background);
        }

        .process-button:hover:not(:disabled) {
          background: var(--color-primary-hover);
        }

        .process-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .download-button {
          background: var(--color-success);
          color: white;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          border-radius: var(--radius-md);
        }

        .file-status {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--glass-bg);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .interface-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </MainLayout>
  )
}

export default AudioDatasetPage