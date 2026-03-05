/**
 * Crown Commend Hook
 * AI-powered YouTube comment generation
 */

import { useState, useCallback, useMemo, useRef } from 'react'

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

export interface CommendMessages {
  invalidUrl: string
  apiNotConfigured: string
  unknownError: string
  failedToGenerate: string
  noCommentToPost: string
  alreadyCommented: string
  failedToPost: string
}

const DEFAULT_MESSAGES: CommendMessages = {
  invalidUrl: 'Please enter a valid YouTube URL',
  apiNotConfigured: 'API not configured',
  unknownError: 'Unknown error',
  failedToGenerate: 'Failed to generate comment',
  noCommentToPost: 'No comment to post',
  alreadyCommented: 'Already commented',
  failedToPost: 'Failed to post comment'
}

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/

export const useCommend = (messages: Partial<CommendMessages> = {}) => {
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
  const requestIdRef = useRef(0)
  const i18nMessages = useMemo(
    () => ({ ...DEFAULT_MESSAGES, ...messages }),
    [messages]
  )

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
      setError({ code: 'invalid_url', message: i18nMessages.invalidUrl })
      setState('error')
      return
    }

    if (!apiBaseUrl) {
      setError({ code: 'no_api', message: i18nMessages.apiNotConfigured })
      setState('error')
      return
    }

    const currentRequestId = ++requestIdRef.current
    const isStale = () => requestIdRef.current !== currentRequestId

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

      if (isStale()) return

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: i18nMessages.unknownError }))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data: GenerateResponse = await response.json()

      if (isStale()) return

      setGeneratedComment(data.generatedText)
      setVideoDetails(data.videoDetails)
      setProcessingTime(data.processingTime)
      setHasTranscript(data.hasTranscript)
      setState('success')

    } catch (err) {
      if (isStale()) return
      const message = err instanceof Error ? err.message : i18nMessages.failedToGenerate
      setError({ code: 'generate_failed', message })
      setState('error')
    }
  }, [videoUrl, language, style, isValidUrl, apiBaseUrl, i18nMessages])

  const postComment = useCallback(async () => {
    if (!generatedComment || !videoUrl) {
      setError({ code: 'no_comment', message: i18nMessages.noCommentToPost })
      return
    }

    if (!apiBaseUrl) {
      setError({ code: 'no_api', message: i18nMessages.apiNotConfigured })
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
          message: detail.message || i18nMessages.alreadyCommented,
          alreadyCommented: true,
          commentId: detail.previousCommentId,
          postedAt: detail.postedAt
        })
        setState('success')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: i18nMessages.unknownError }))
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
      }

      const data: PostResponse = await response.json()
      setPostResult(data)
      setState('success')

    } catch (err) {
      const message = err instanceof Error ? err.message : i18nMessages.failedToPost
      setError({ code: 'post_failed', message })
      setState('error')
    }
  }, [generatedComment, videoUrl, apiBaseUrl, i18nMessages])

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

export const COMMENT_STYLES: { id: CommentStyle }[] = [
  { id: 'supportive' },
  { id: 'analytical' },
  { id: 'humorous' },
  { id: 'curious' },
  { id: 'professional' }
]

export const COMMENT_LANGUAGES: { code: CommentLanguage; name: string; flag: string }[] = [
  { code: 'Turkish', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'English', name: 'English', flag: '🇬🇧' },
  { code: 'Russian', name: 'Русский', flag: '🇷🇺' },
  { code: 'Chinese', name: '中文', flag: '🇨🇳' },
  { code: 'Japanese', name: '日本語', flag: '🇯🇵' }
]
