/**
 * ML Toolkit: one hook for the three audio tools (augment, convert, label).
 * Holds the chosen files, sends them to the backend, and keeps the result and a
 * short progress log. Every request is cancellable and a newer one wins.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE_URL } from '@/config/api'
import { fetchWithTimeout, isCallerAbort } from '@/hooks/useAsyncRequest'
import { fill } from '@/components/Auris/format'
import type { AudioAugmentationOptions } from '@/components/MLToolkit/AudioAugmentation'
import type { FormatConvertOptions } from '@/components/MLToolkit/FormatConverter'
import type { DatasetEntryMetadata } from '@/components/MLToolkit/DatasetMetadataResult'
import type { LogEntry } from '@/components/MLToolkit/ProcessLog'

export type ToolId = 'augment' | 'convert' | 'organize'
export type ToolState = 'idle' | 'processing' | 'done' | 'error'

/** The server refuses anything larger. Checked here first so a big file fails in a second, not after the upload. */
export const MAX_FILE_BYTES = 30 * 1024 * 1024

const REQUEST_TIMEOUT_MS = 150_000

const ENDPOINTS: Record<ToolId, string> = {
  augment: '/api/process/audio',
  convert: '/api/process/audio/convert',
  organize: '/api/process/audio/organize',
}

export interface DatasetToolMessages {
  selectFile: string
  processingFailed: string
  unexpected: string
  tooLarge: string
  invalidFile: string
  rateLimit: string
  busy: string
  unreachable: string
  mixNeedsTwo: string
  filesSelected: string
  processStarted: string
  done: string
}

export interface DatasetToolOptions {
  augment: AudioAugmentationOptions
  convert: FormatConvertOptions
}

const EXTENSION_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  opus: 'audio/ogg',
  aac: 'audio/aac',
}

const extensionOf = (name: string) => name.slice(name.lastIndexOf('.') + 1).toLowerCase()

/** The server only takes `audio/*`. Some browsers send nothing, or `video/ogg`, for files that are plainly audio. */
export const withAudioType = (file: File): File => {
  if (file.type.startsWith('audio/')) {return file}
  const type = EXTENSION_TYPES[extensionOf(file.name)]
  return type ? new File([file], file.name, { type, lastModified: file.lastModified }) : file
}

const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'audio'

export const downloadName = (tool: ToolId, file: File, options: DatasetToolOptions): string =>
  tool === 'convert'
    ? `${baseName(file.name)}.${options.convert.targetFormat}`
    : `${baseName(file.name)}-augmented.wav`

const newLogId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useDatasetTool = (messages: DatasetToolMessages) => {
  const [files, setFilesState] = useState<File[]>([])
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultName, setResultName] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<DatasetEntryMetadata | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const m = useMemo(() => messages, [messages])
  const requestRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const urlRef = useRef<string | null>(null)

  const log = useCallback((message: string, status: LogEntry['status']) => {
    setLogs(prev => [...prev, { id: newLogId(), message, status, timestamp: new Date() }])
  }, [])

  const dropResult = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setResultUrl(null)
    setResultName(null)
    setMetadata(null)
  }, [])

  /** Cancel anything in flight and clear what the last run left behind. */
  const reset = useCallback(() => {
    requestRef.current++
    abortRef.current?.abort()
    abortRef.current = null
    dropResult()
    setError(null)
    setLogs([])
    setState('idle')
  }, [dropResult])

  const setFiles = useCallback((next: File[]) => {
    reset()
    setFilesState(next)
    if (next.length > 0) {
      setLogs([{ id: newLogId(), message: fill(m.filesSelected, { count: next.length }), status: 'success', timestamp: new Date() }])
    }
  }, [reset, m.filesSelected])

  useEffect(() => () => {
    abortRef.current?.abort()
    if (urlRef.current) {URL.revokeObjectURL(urlRef.current)}
  }, [])

  const describeFailure = useCallback(async (response: Response, fileName: string): Promise<string> => {
    const detail = await response.json().then(body => body?.detail).catch(() => undefined)
    const code = typeof detail === 'object' && detail ? (detail as { code?: string }).code : undefined

    if (response.status === 413 || code === 'file_too_large') {return fill(m.tooLarge, { name: fileName })}
    if (response.status === 429 || code === 'rate_limit_exceeded') {return m.rateLimit}
    if (code === 'invalid_file_type') {return m.invalidFile}
    if (code === 'missing_mix_file') {return m.mixNeedsTwo}
    if (response.status === 503 || code === 'server_busy') {return m.busy}
    if (response.status === 502 || response.status === 504) {return m.unreachable}
    return m.processingFailed
  }, [m])

  const run = useCallback(async (tool: ToolId, options: DatasetToolOptions) => {
    if (files.length === 0) {
      setError(m.selectFile)
      setState('error')
      return
    }
    const primary = files[0]
    const oversize = files.slice(0, tool === 'augment' && options.augment.mixAudio ? 2 : 1).find(f => f.size > MAX_FILE_BYTES)
    if (oversize) {
      setError(fill(m.tooLarge, { name: oversize.name }))
      setState('error')
      return
    }
    const mixing = tool === 'augment' && options.augment.mixAudio
    if (mixing && files.length < 2) {
      setError(m.mixNeedsTwo)
      setState('error')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestRef.current
    const isStale = () => requestRef.current !== requestId

    dropResult()
    setError(null)
    setState('processing')
    log(m.processStarted, 'processing')

    const form = new FormData()
    form.append('file', withAudioType(primary))
    if (tool !== 'organize') {
      form.append('options', JSON.stringify(tool === 'convert' ? options.convert : options.augment))
    }
    if (mixing) {form.append('mix_file', withAudioType(files[1]))}

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${ENDPOINTS[tool]}`, {
        method: 'POST',
        body: form,
        timeout: REQUEST_TIMEOUT_MS,
        signal: controller.signal,
      })
      if (isStale()) {return}

      if (!response.ok) {
        const message = await describeFailure(response, primary.name)
        if (isStale()) {return}
        setError(message)
        setState('error')
        log(message, 'error')
        return
      }

      if (tool === 'organize') {
        const body = await response.json() as DatasetEntryMetadata
        if (isStale()) {return}
        setMetadata(body)
      } else {
        const blob = await response.blob()
        if (isStale()) {return}
        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setResultUrl(url)
        setResultName(downloadName(tool, primary, options))
      }
      setState('done')
      log(m.done, 'success')
    } catch (err) {
      if (isStale() || isCallerAbort(err, controller.signal)) {return}
      const message = err instanceof DOMException && err.name === 'TimeoutError' ? m.unreachable
        : err instanceof TypeError ? m.unreachable
        : m.unexpected
      setError(message)
      setState('error')
      log(message, 'error')
    }
  }, [files, m, dropResult, log, describeFailure])

  return { files, state, error, resultUrl, resultName, metadata, logs, setFiles, run, reset }
}
