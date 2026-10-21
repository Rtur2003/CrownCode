'use client'

import React, { useCallback, useId, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/data-manipulation.module.css'

interface FileUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

// The backend accepts anything that decodes; this is what the picker offers.
const ACCEPT = 'audio/*,.mp3,.wav,.flac,.m4a,.ogg,.opus,.aac'

/** Audio files in, by drop or by the picker. The real input stays for keyboard and screen readers. */
export const FileUploader: React.FC<FileUploaderProps> = ({ files, onFilesChange }) => {
  const { t } = useLanguage()
  const U = t.mlToolkit.fileUploader
  const inputId = useId()
  const [dragging, setDragging] = useState(false)

  const add = useCallback((incoming: File[]) => {
    const audio = incoming.filter(file => file.type.startsWith('audio/') || /\.(mp3|wav|flac|m4a|ogg|opus|aac)$/i.test(file.name))
    if (audio.length) {onFilesChange([...files, ...audio])}
  }, [files, onFilesChange])

  return (
    <div>
      <div
        className={styles.drop}
        data-dragging={dragging ? 'true' : undefined}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(Array.from(e.dataTransfer.files)) }}
      >
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = '' }}
        />
        <label htmlFor={inputId} className={styles.dropLabel}>
          <strong>{U.audio.title}</strong>
          <span>{U.subtitle}</span>
          <small>{U.audio.hint}</small>
        </label>
      </div>

      {files.length > 0 && (
        <ul className={styles.files} aria-label={U.filesUploaded}>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <button
                type="button"
                className={world.link}
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
              >
                ×<span className="sr-only"> {t.aria.removeFile.replace('{{name}}', file.name)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileUploader
