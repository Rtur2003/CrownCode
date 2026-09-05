'use client'

import React from 'react'
import { motion } from 'motion/react'
import { FileAudio } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export type AudioTargetFormat = 'wav' | 'mp3' | 'flac' | 'ogg'

export interface FormatConvertOptions {
  targetFormat: AudioTargetFormat
  bitrateKbps: number
}

interface FormatConverterProps {
  options: FormatConvertOptions
  onChange: (options: FormatConvertOptions) => void
}

const TARGET_FORMATS: { id: AudioTargetFormat; label: string; lossy: boolean }[] = [
  { id: 'wav', label: 'WAV', lossy: false },
  { id: 'mp3', label: 'MP3', lossy: true },
  { id: 'flac', label: 'FLAC', lossy: false },
  { id: 'ogg', label: 'OGG', lossy: true },
]

const BITRATE_OPTIONS = [128, 192, 256, 320]

export const FormatConverter: React.FC<FormatConverterProps> = ({ options, onChange }) => {
  const { t } = useLanguage()
  const selectedFormat = TARGET_FORMATS.find((f) => f.id === options.targetFormat)

  return (
    <div className="format-converter">
      <div className="options-header">
        <h3 className="options-title">{t.mlToolkit.formatConverter.title}</h3>
      </div>

      <div className="format-grid">
        {TARGET_FORMATS.map((format) => {
          const isSelected = options.targetFormat === format.id
          return (
            <motion.button
              key={format.id}
              type="button"
              onClick={() => onChange({ ...options, targetFormat: format.id })}
              className={`format-card ${isSelected ? 'format-selected' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileAudio size={20} className="format-icon" />
              <span className="format-label">{format.label}</span>
              <span className="format-badge">
                {format.lossy ? t.mlToolkit.formatConverter.lossy : t.mlToolkit.formatConverter.lossless}
              </span>
            </motion.button>
          )
        })}
      </div>

      {selectedFormat?.lossy && (
        <div className="bitrate-row">
          <label className="bitrate-label" htmlFor="bitrate-select">
            {t.mlToolkit.formatConverter.bitrateLabel}
          </label>
          <select
            id="bitrate-select"
            className="bitrate-select"
            value={options.bitrateKbps}
            onChange={(e) => onChange({ ...options, bitrateKbps: Number(e.target.value) })}
          >
            {BITRATE_OPTIONS.map((kbps) => (
              <option key={kbps} value={kbps}>
                {kbps} kbps
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default FormatConverter
