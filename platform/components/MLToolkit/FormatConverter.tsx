'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/data-manipulation.module.css'

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
  const F = t.mlToolkit.formatConverter
  const selected = TARGET_FORMATS.find(f => f.id === options.targetFormat)

  return (
    <div>
      <fieldset className={styles.checklist}>
        <legend className={world.fieldLabel}>{F.title}</legend>
        <div className={styles.formats}>
          {TARGET_FORMATS.map(format => (
            <label key={format.id} className={styles.format}>
              <input
                type="radio"
                name="target-format"
                checked={options.targetFormat === format.id}
                onChange={() => onChange({ ...options, targetFormat: format.id })}
              />
              <span>
                <strong>{format.label}</strong>
                <small>{format.lossy ? F.lossy : F.lossless}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {selected?.lossy && (
        <div className={world.field}>
          <label className={world.fieldLabel} htmlFor="bitrate-select">{F.bitrateLabel}</label>
          <select
            id="bitrate-select"
            className={world.select}
            value={options.bitrateKbps}
            onChange={(e) => onChange({ ...options, bitrateKbps: Number(e.target.value) })}
          >
            {BITRATE_OPTIONS.map(kbps => <option key={kbps} value={kbps}>{kbps} kbps</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

export default FormatConverter
