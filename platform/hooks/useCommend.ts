/**
 * Crown Commend Hook
 * AI-powered YouTube comment generation
 */

import { useState, useCallback, useMemo } from 'react'

export type CommentLanguage = 'Turkish' | 'English' | 'Russian' | 'Chinese' | 'Japanese'

export type CommentStyle = 'supportive' | 'analytical' | 'humorous' | 'curious' | 'professional'

export interface VideoDetails {
  videoId: string
  title: string
  channelName: string
  channelId: string
  description: string
  thumbnailUrl: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  duration: number
  publishedAt: string | null
  subscriberCount?: number
}

export interface GenerateResponse {
  status: string
  generatedText: string
  videoDetails: VideoDetails
  processingTime: number
  hasTranscript: boolean
}

export interface PostResponse {
  status: string
  message: string
  commentId?: string
  postedAt?: string
  alreadyCommented?: boolean
}

export type CommendState = 'idle' | 'fetching' | 'generating' | 'posting' | 'success' | 'error'

export interface CommendError {
  code: string
  message: string
}

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/

export const useCommend = () => {
  const [state, setState] = useState<CommendState>('idle')
  const [videoUrl, setVideoUrl] = useState('')
  const [language, setLanguage] = useState<CommentLanguage>('Turkish')
  const [style, setStyle] = useState<CommentStyle>('supportive')
  const [generatedComment, setGeneratedComment] = useState<string | null>(null)
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [hasTranscript, setHasTranscript] = useState(false)
  const [error, setError] = useState<CommendError | null>(null)
  const [postResult, setPostResult] = useState<PostResponse | null>(null)

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim(), [])

  const isValidUrl = useMemo(() => {
    return YOUTUBE_URL_REGEX.test(videoUrl)
  }, [videoUrl])

  const reset = useCallback(() => {
    setState('idle')
    setGeneratedComment(null)
    setVideoDetails(null)
    setProcessingTime(null)
    setHasTranscript(false)
    setError(null)
    setPostResult(null)
  }, [])

  const generateComment = useCallback(async () => {
    if (!isValidUrl) {
      setError({ code: 'invalid_url', message: 'Please enter a valid YouTube URL' })
      setState('error')
      return
    }

    if (!apiBaseUrl) {
      setError({ code: 'no_api', message: 'API not configured' })
      setState('error')
      return
    }

    setState('generating')
    setError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/commend/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          language,
          commentStyle: style
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data: GenerateResponse = await response.json()

      setGeneratedComment(data.generatedText)
      setVideoDetails(data.videoDetails)
      setProcessingTime(data.processingTime)
      setHasTranscript(data.hasTranscript)
      setState('success')

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate comment'
      setError({ code: 'generate_failed', message })
      setState('error')
    }
  }, [videoUrl, language, style, isValidUrl, apiBaseUrl])

  const postComment = useCallback(async () => {
    if (!generatedComment || !videoUrl) {
      setError({ code: 'no_comment', message: 'No comment to post' })
      return
    }

    if (!apiBaseUrl) {
      setError({ code: 'no_api', message: 'API not configured' })
      return
    }

    setState('posting')
    setError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/commend/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          commentText: generatedComment
        })
      })

      // Handle already commented (409 Conflict)
      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({ detail: {} }))
        const detail = typeof errorData.detail === 'object' ? errorData.detail : { message: errorData.detail }
        setPostResult({
          status: 'success',
          message: detail.message || 'Already commented',
          alreadyCommented: true,
          commentId: detail.previousCommentId,
          postedAt: detail.postedAt
        })
        setState('success')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
      }

      const data: PostResponse = await response.json()
      setPostResult(data)
      setState('success')

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post comment'
      setError({ code: 'post_failed', message })
      setState('error')
    }
  }, [generatedComment, videoUrl, apiBaseUrl])

  const updateComment = useCallback((text: string) => {
    setGeneratedComment(text)
  }, [])

  return {
    // State
    state,
    videoUrl,
    language,
    style,
    generatedComment,
    videoDetails,
    processingTime,
    hasTranscript,
    error,
    postResult,
    isValidUrl,

    // Actions
    setVideoUrl,
    setLanguage,
    setStyle,
    generateComment,
    postComment,
    updateComment,
    reset
  }
}

export const COMMENT_STYLES: { id: CommentStyle; name: { tr: string; en: string }; description: { tr: string; en: string } }[] = [
  {
    id: 'supportive',
    name: { tr: 'Destekleyici', en: 'Supportive' },
    description: { tr: 'Pozitif ve teşvik edici', en: 'Positive and encouraging' }
  },
  {
    id: 'analytical',
    name: { tr: 'Analitik', en: 'Analytical' },
    description: { tr: 'Detaylı ve düşündürücü', en: 'Detailed and thought-provoking' }
  },
  {
    id: 'humorous',
    name: { tr: 'Esprili', en: 'Humorous' },
    description: { tr: 'Eğlenceli ve samimi', en: 'Fun and friendly' }
  },
  {
    id: 'curious',
    name: { tr: 'Meraklı', en: 'Curious' },
    description: { tr: 'Soru soran ve ilgili', en: 'Questioning and engaged' }
  },
  {
    id: 'professional',
    name: { tr: 'Profesyonel', en: 'Professional' },
    description: { tr: 'Resmi ve saygılı', en: 'Formal and respectful' }
  }
]

export const COMMENT_LANGUAGES: { code: CommentLanguage; name: string; flag: string }[] = [
  { code: 'Turkish', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'English', name: 'English', flag: '🇬🇧' },
  { code: 'Russian', name: 'Русский', flag: '🇷🇺' },
  { code: 'Chinese', name: '中文', flag: '🇨🇳' },
  { code: 'Japanese', name: '日本語', flag: '🇯🇵' }
]
