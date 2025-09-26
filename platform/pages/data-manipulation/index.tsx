// =========================================================================
// AUDIO DATASET TOOLS PAGE - AUDIO DATA PREPARATION & PROCESSING
// =========================================================================
// Specialized interface for audio dataset preparation and processing for AI
// music detection research. Provides tools for audio augmentation, format
// conversion, and dataset organization.
//
// Features:
// - Audio file upload and batch processing
// - Audio format conversion (MP3, WAV, FLAC)
// - Audio augmentation (pitch, tempo, noise)
// - Dataset organization and labeling
// - Quality control and validation
// - Export functionality for training datasets
//
// @author Hasan Arthur Altuntaş
// @version 1.0.0
// @since 2025-01-01
// =========================================================================

import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { MainLayout } from '@/components/Layout/MainLayout'
import {
  Upload,
  RefreshCw,
  Music,
  FolderOpen,
  Settings,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const AudioDatasetPage: NextPage = () => {
  const { t } = useLanguage()

  const tools = [
    {
      id: 'upload',
      title: t.audioDataset.tools.upload.title,
      description: t.audioDataset.tools.upload.description,
      icon: Upload,
      gradient: 'from-blue-400 to-blue-600',
      status: 'available'
    },
    {
      id: 'convert',
      title: t.audioDataset.tools.convert.title,
      description: t.audioDataset.tools.convert.description,
      icon: RefreshCw,
      gradient: 'from-green-400 to-green-600',
      status: 'available'
    },
    {
      id: 'augment',
      title: t.audioDataset.tools.augment.title,
      description: t.audioDataset.tools.augment.description,
      icon: Music,
      gradient: 'from-purple-400 to-purple-600',
      status: 'available'
    },
    {
      id: 'organize',
      title: t.audioDataset.tools.organize.title,
      description: t.audioDataset.tools.organize.description,
      icon: FolderOpen,
      gradient: 'from-orange-400 to-orange-600',
      status: 'available'
    }
  ]

  return (
    <MainLayout
      title={`${t.audioDataset.title} - CrownCode Platform`}
      description={t.audioDataset.subtitle}
      keywords="audio dataset, data preparation, audio processing, AI music detection, dataset tools"
    >
      <div className="page-container">
        <div className="content-wrapper">
          {/* Header Section */}
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="header-badge">
              <Settings size={16} />
              <span>Audio Dataset Tools</span>
            </div>

            <h1 className="page-title">
              {t.audioDataset.title}
            </h1>

            <p className="page-subtitle">
              {t.audioDataset.subtitle}
            </p>

            <div className="demo-notice">
              <span className="demo-badge">{t.audioDataset.demo.badge}</span>
              <span className="demo-text">{t.audioDataset.demo.notice}</span>
            </div>
          </motion.div>

          {/* Tools Grid */}
          <motion.div
            className="tools-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {tools.map((tool, index) => {
              const Icon = tool.icon

              return (
                <motion.div
                  key={tool.id}
                  className="tool-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="tool-header">
                    <div className={`tool-icon bg-gradient-to-r ${tool.gradient}`}>
                      <Icon size={24} />
                    </div>
                    <div className="tool-status">
                      {tool.status === 'available' ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <AlertCircle size={16} className="text-orange-400" />
                      )}
                    </div>
                  </div>

                  <div className="tool-content">
                    <h3 className="tool-title">{tool.title}</h3>
                    <p className="tool-description">{tool.description}</p>
                  </div>

                  <div className="tool-footer">
                    <button className="tool-button" disabled>
                      <span>Interface Demo</span>
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Features Overview */}
          <motion.div
            className="features-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="features-content">
              <h2>Platform Özellikleri</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <Upload size={20} />
                  <span>Toplu dosya yükleme</span>
                </div>
                <div className="feature-item">
                  <RefreshCw size={20} />
                  <span>Format dönüştürme</span>
                </div>
                <div className="feature-item">
                  <Music size={20} />
                  <span>Ses artırma teknikleri</span>
                </div>
                <div className="feature-item">
                  <Download size={20} />
                  <span>Dışa aktarma</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          color: #ffffff;
          padding: 2rem 0;
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: #38bdf8;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #38bdf8 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .page-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .demo-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .demo-badge {
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #f97316;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .demo-text {
          color: #64748b;
          font-size: 0.875rem;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .tool-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 1rem;
          padding: 2rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .tool-card:hover {
          border-color: #38bdf8;
          box-shadow: 0 20px 40px rgba(56, 189, 248, 0.1);
        }

        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .tool-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .tool-content {
          margin-bottom: 2rem;
        }

        .tool-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .tool-description {
          color: #94a3b8;
          line-height: 1.6;
        }

        .tool-footer {
          text-align: center;
        }

        .tool-button {
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: not-allowed;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        .features-section {
          text-align: center;
          padding: 3rem 0;
        }

        .features-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #ffffff;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #94a3b8;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 0.5rem;
        }

        .feature-item svg {
          color: #38bdf8;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .tools-grid {
            grid-template-columns: 1fr;
          }

          .demo-notice {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </MainLayout>
  )
}

export default AudioDatasetPage