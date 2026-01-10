/**
 * useFileUpload Hook
 * 
 * Reusable hook for handling file uploads with validation
 * and progress tracking.
 */
import { useState, useCallback } from 'react'

export interface FileValidationOptions {
  maxSizeMB?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

export interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  uploadedFile: File | null
}

export function useFileUpload(validationOptions?: FileValidationOptions) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null,
  })

  const validateFile = useCallback((file: File): string | null => {
    const maxSizeMB = validationOptions?.maxSizeMB || 100
    const allowedTypes = validationOptions?.allowedTypes || []
    const allowedExtensions = validationOptions?.allowedExtensions || []

    // Size validation
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit`
    }

    // Type validation
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`
    }

    // Extension validation
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(`.${extension}`)) {
        return `File extension is not allowed. Allowed: ${allowedExtensions.join(', ')}`
      }
    }

    return null
  }, [validationOptions])

  const handleFileUpload = useCallback(async (
    file: File,
    uploadFn?: (file: File, onProgress?: (progress: number) => void) => Promise<void>
  ): Promise<boolean> => {
    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: validationError,
        uploadedFile: null,
      })
      return false
    }

    // Start upload
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      uploadedFile: file,
    })

    try {
      if (uploadFn) {
        await uploadFn(file, (progress) => {
          setUploadState(prev => ({ ...prev, progress }))
        })
      }

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        uploadedFile: file,
      })
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        uploadedFile: null,
      })
      return false
    }
  }, [validateFile])

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null,
    })
  }, [])

  return {
    uploadState,
    handleFileUpload,
    resetUpload,
    validateFile,
  }
}
