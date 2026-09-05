'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Music4, Gauge, Music2, Tag } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export interface DatasetEntryMetadata {
  durationSec: number
  tempoBpm: number
  key: string
  loudnessDb: number
  tags: string[]
}

interface DatasetMetadataResultProps {
  metadata: DatasetEntryMetadata
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const DatasetMetadataResult: React.FC<DatasetMetadataResultProps> = ({ metadata }) => {
  const { t } = useLanguage()
  const om = t.mlToolkit.organizer

  const stats = [
    { icon: Gauge, label: om.duration, value: formatDuration(metadata.durationSec) },
    { icon: Music2, label: om.tempo, value: metadata.tempoBpm > 0 ? `${metadata.tempoBpm} BPM` : om.noBeat },
    { icon: Music4, label: om.key, value: metadata.key },
    { icon: Tag, label: om.loudness, value: `${metadata.loudnessDb} dB` },
  ]

  return (
    <motion.div
      className="dataset-metadata-result"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="metadata-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="metadata-stat-box">
              <Icon size={18} className="metadata-stat-icon" />
              <div className="metadata-stat-content">
                <span className="metadata-stat-label">{stat.label}</span>
                <span className="metadata-stat-value">{stat.value}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="metadata-tags-row">
        <span className="metadata-tags-label">{om.autoTags}</span>
        <div className="metadata-tags-list">
          {metadata.tags.map((tag) => (
            <span key={tag} className="metadata-tag-pill">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default DatasetMetadataResult
