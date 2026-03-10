'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileImage, FileAudio, X, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface FileUploaderProps {
  dataType: 'image' | 'audio'
  files: File[]
  onFilesChange: (files: File[]) => void
}

export const FileUploader: React.FC<FileUploaderProps> = ({ dataType, files, onFilesChange }) => {
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)

  const acceptedTypes = dataType === 'image'
    ? 'image/jpeg,image/png,image/jpg,image/webp'
    : 'audio/mpeg,audio/wav,audio/mp3,audio/ogg'

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (dataType === 'image') {
        return file.type.startsWith('image/')
      } else {
        return file.type.startsWith('audio/')
      }
    })

    onFilesChange([...files, ...validFiles])
  }, [dataType, files, onFilesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const dropped = Array.from(e.dataTransfer.files)
    handleFiles(dropped)
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files)
      handleFiles(selected)
    }
  }

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const Icon = dataType === 'image' ? FileImage : FileAudio

  return (
    <div className="file-uploader">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="file-input"
        />

        <label htmlFor="file-upload" className="upload-label">
          <Upload className="upload-icon" size={48} />
          <h3 className="upload-title">
            {dataType === 'image' ? t.mlToolkit.fileUploader.image.title : t.mlToolkit.fileUploader.audio.title}
          </h3>
          <p className="upload-subtitle">
            {t.mlToolkit.fileUploader.subtitle}
          </p>
          <span className="upload-hint">
            {dataType === 'image'
              ? t.mlToolkit.fileUploader.image.hint
              : t.mlToolkit.fileUploader.audio.hint
            }
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="selected-files">
          <div className="files-header">
            <h4 className="files-title">
              {t.mlToolkit.fileUploader.filesUploaded} ({files.length})
            </h4>
            <CheckCircle className="text-green-500" size={20} />
          </div>

          <div className="files-list">
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                className="file-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Icon size={20} className="file-icon" />
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="file-remove"
                  aria-label={(t.aria?.removeFile || 'Remove {{name}}').replace('{{name}}', file.name)}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader
