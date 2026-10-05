/**
 * Runtime checks for JSON that comes back from the backend (and, behind it,
 * from Gemini). TypeScript interfaces are erased at runtime, so anything read
 * from a response is checked here before it reaches state or the screen.
 * Each parser returns the cleaned value, or null when the shape is wrong.
 */

import type { DreamAnalysisResult, DreamEmotion } from '@/hooks/useDreamAnalysis'
import type { GenerateResponse, PostResponse, VideoDetails } from '@/hooks/useCommend'

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

const text = (v: unknown, max: number): string | null =>
  typeof v === 'string' ? v.slice(0, max) : null

const finite = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

const stringList = (v: unknown, maxItems: number, maxLength: number): string[] | null => {
  if (!Array.isArray(v)) {return null}
  return v
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, maxItems)
    .map(item => item.slice(0, maxLength))
}

// ── Crown Dreams ────────────────────────────────────────────────────

const DREAM_EMOTIONS: ReadonlySet<string> = new Set<DreamEmotion>([
  'joy', 'fear', 'anxiety', 'sadness', 'anger', 'confusion',
  'peace', 'excitement', 'nostalgia', 'wonder', 'shame', 'love',
])

export const parseDreamAnalysis = (data: unknown): DreamAnalysisResult | null => {
  if (!isRecord(data)) {return null}
  const themes = stringList(data.themes, 12, 80)
  const symbols = stringList(data.symbols, 12, 80)
  const interpretation = text(data.interpretation, 4000)
  if (!Array.isArray(data.emotions) || !themes || !symbols || interpretation === null) {return null}
  if (typeof data.lucidityIndicator !== 'boolean') {return null}
  return {
    // A model that invents an emotion outside the set doesn't get it rendered.
    emotions: data.emotions.filter((e): e is DreamEmotion => typeof e === 'string' && DREAM_EMOTIONS.has(e)).slice(0, 12),
    themes,
    symbols,
    interpretation,
    lucidityIndicator: data.lucidityIndicator,
  }
}

// ── Crown Commend ───────────────────────────────────────────────────

const YOUTUBE_HOSTS: ReadonlySet<string> = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtu.be',
])
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

/** The 11-character video id of a YouTube link, or null. Same hosts and shapes the backend accepts. */
export const parseYouTubeVideoId = (raw: string): string | null => {
  const input = raw.trim()
  if (!input || input.length > 2048) {return null}
  let url: URL
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input}`)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {return null}
  if (url.username || url.password || url.port) {return null}
  const host = url.hostname.toLowerCase()
  if (!YOUTUBE_HOSTS.has(host)) {return null}

  let candidate: string | undefined
  if (host.endsWith('youtu.be')) {
    candidate = url.pathname.split('/')[1]
  } else if (url.pathname === '/watch') {
    candidate = url.searchParams.get('v') ?? undefined
  } else {
    const [, kind, id] = url.pathname.split('/')
    if (kind === 'embed' || kind === 'shorts') {candidate = id}
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null
}

/** Only YouTube's own thumbnail host is shown; the image optimizer allows nothing else. */
const thumbnail = (v: unknown): string | null => {
  if (typeof v !== 'string') {return null}
  try {
    const url = new URL(v)
    return url.protocol === 'https:' && url.hostname === 'i.ytimg.com' ? url.toString() : null
  } catch {
    return null
  }
}

const parseVideoDetails = (data: unknown): VideoDetails | null => {
  if (!isRecord(data)) {return null}
  const videoId = text(data.videoId, 32)
  const title = text(data.title, 500)
  if (videoId === null || title === null) {return null}
  const subscriberCount = finite(data.subscriberCount)
  return {
    videoId,
    title,
    channelName: text(data.channelName, 200) ?? '',
    channelId: text(data.channelId, 64) ?? '',
    description: text(data.description, 5000) ?? '',
    thumbnailUrl: thumbnail(data.thumbnailUrl),
    viewCount: finite(data.viewCount) ?? 0,
    likeCount: finite(data.likeCount) ?? 0,
    commentCount: finite(data.commentCount) ?? 0,
    duration: finite(data.duration) ?? 0,
    publishedAt: text(data.publishedAt, 64),
    ...(subscriberCount !== null ? { subscriberCount } : {}),
  }
}

export const MAX_COMMENT_LENGTH = 10_000

export const parsePostResponse = (data: unknown): PostResponse | null => {
  if (!isRecord(data)) {return null}
  const status = text(data.status, 32)
  const message = text(data.message, 500)
  if (status === null || message === null) {return null}
  const commentId = text(data.commentId, 128)
  const postedAt = text(data.postedAt, 64)
  return {
    status,
    message,
    ...(commentId !== null ? { commentId } : {}),
    ...(postedAt !== null ? { postedAt } : {}),
    ...(data.alreadyCommented === true ? { alreadyCommented: true } : {}),
  }
}

export const parseGenerateResponse = (data: unknown): GenerateResponse | null => {
  if (!isRecord(data)) {return null}
  const generatedText = text(data.generatedText, MAX_COMMENT_LENGTH)
  const status = text(data.status, 32)
  const videoDetails = parseVideoDetails(data.videoDetails)
  if (!generatedText || status === null || !videoDetails) {return null}
  return {
    status,
    generatedText,
    videoDetails,
    processingTime: finite(data.processingTime) ?? 0,
    hasTranscript: data.hasTranscript === true,
  }
}
