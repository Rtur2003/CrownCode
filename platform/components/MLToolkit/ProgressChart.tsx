'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Database } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ProgressChartProps {
  current: number
  target: number
  original: number
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ current, target, original }) => {
  const { t } = useLanguage()
  const progress = Math.min((current / target) * 100, 100)
  const increase = current - original

  return (
    <div className="progress-chart">
      <div className="chart-header">
        <h3 className="chart-title">{t.mlToolkit.progress.title}</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon bg-blue-500">
            <Database size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t.mlToolkit.progress.original}</span>
            <span className="stat-value">{original.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon bg-purple-500">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t.mlToolkit.progress.current}</span>
            <span className="stat-value">{current.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon bg-green-500">
            <Target size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t.mlToolkit.progress.target}</span>
            <span className="stat-value">{target.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-header">
          <span className="progress-label">{t.mlToolkit.progress.progress}</span>
          <span className="progress-percentage">{progress.toFixed(1)}%</span>
        </div>

        <div className="progress-bar-track">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {increase > 0 && (
          <div className="progress-footer">
            <span className="increase-badge">
              {t.mlToolkit.progress.newData.replace('{count}', `+${increase.toLocaleString()}`)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressChart