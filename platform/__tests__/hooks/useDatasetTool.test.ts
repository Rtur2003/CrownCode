/* eslint-disable @typescript-eslint/no-non-null-assertion -- tests index into arrays they just built */
import { act, renderHook } from '@testing-library/react'
import {
  MAX_FILE_BYTES,
  downloadName,
  useDatasetTool,
  withAudioType,
  type DatasetToolMessages,
  type DatasetToolOptions,
} from '@/hooks/useDatasetTool'

const messages: DatasetToolMessages = {
  selectFile: 'select',
  processingFailed: 'failed',
  unexpected: 'unexpected',
  tooLarge: '{name} too large',
  invalidFile: 'invalid',
  rateLimit: 'rate',
  busy: 'busy',
  unreachable: 'unreachable',
  mixNeedsTwo: 'mix needs two',
  filesSelected: '{count} selected',
  processStarted: 'started',
  done: 'done',
}

const options: DatasetToolOptions = {
  augment: { pitchShift: true, speedChange: false, bassBoost: false, trimSilence: false, mixAudio: false, addNoise: false },
  convert: { targetFormat: 'mp3', bitrateKbps: 192 },
}

const audio = (name: string, type = 'audio/wav', size = 10) => {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

const response = (status: number, body: unknown = {}, blob?: Blob) =>
  ({
    ok: status < 400,
    status,
    json: async () => body,
    blob: async () => blob ?? new Blob(['wav']),
  }) as unknown as Response

const fetchMock = () => global.fetch as jest.Mock

beforeEach(() => {
  global.fetch = jest.fn()
  URL.createObjectURL = jest.fn(() => 'blob:result')
  URL.revokeObjectURL = jest.fn()
})

afterEach(() => jest.restoreAllMocks())

describe('withAudioType', () => {
  it('keeps a file that already says it is audio', () => {
    const file = audio('a.mp3', 'audio/mpeg')
    expect(withAudioType(file)).toBe(file)
  })

  it('fills the type from the extension when the browser sent none', () => {
    expect(withAudioType(audio('a.FLAC', '')).type).toBe('audio/flac')
    expect(withAudioType(audio('a.ogg', 'video/ogg')).type).toBe('audio/ogg')
  })

  it('leaves an unknown extension alone so the server can say no', () => {
    const file = audio('a.txt', '')
    expect(withAudioType(file)).toBe(file)
  })
})

describe('downloadName', () => {
  const file = audio('take 1.wav')
  it('uses the target format for a conversion', () => {
    expect(downloadName('convert', file, options)).toBe('take 1.mp3')
  })
  it('marks augmented output as wav', () => {
    expect(downloadName('augment', file, options)).toBe('take 1-augmented.wav')
  })
})

describe('useDatasetTool', () => {
  it('refuses to run with no file', async () => {
    const { result } = renderHook(() => useDatasetTool(messages))
    await act(async () => { await result.current.run('augment', options) })
    expect(result.current.error).toBe('select')
    expect(result.current.state).toBe('error')
    expect(fetchMock()).not.toHaveBeenCalled()
  })

  it('logs the selection', () => {
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav'), audio('b.wav')]))
    expect(result.current.logs.map(l => l.message)).toEqual(['2 selected'])
  })

  it('does not upload a file over the size limit', async () => {
    const big = audio('big.wav')
    Object.defineProperty(big, 'size', { value: MAX_FILE_BYTES + 1 })
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([big]))
    await act(async () => { await result.current.run('convert', options) })
    expect(result.current.error).toBe('big.wav too large')
    expect(fetchMock()).not.toHaveBeenCalled()
  })

  it('asks for a second file before mixing', async () => {
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav')]))
    await act(async () => {
      await result.current.run('augment', { ...options, augment: { ...options.augment, mixAudio: true } })
    })
    expect(result.current.error).toBe('mix needs two')
    expect(fetchMock()).not.toHaveBeenCalled()
  })

  it('sends the file and options to the augment endpoint and keeps the result', async () => {
    fetchMock().mockResolvedValue(response(200))
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.mp3', '')]))
    await act(async () => { await result.current.run('augment', options) })

    const [url, init] = fetchMock().mock.calls[0]! as [string, RequestInit]
    expect(url.endsWith('/api/process/audio')).toBe(true)
    const form = init.body as FormData
    expect((form.get('file') as File).type).toBe('audio/mpeg')
    expect(JSON.parse(form.get('options') as string).pitchShift).toBe(true)
    expect(form.get('mix_file')).toBeNull()

    expect(result.current.state).toBe('done')
    expect(result.current.resultUrl).toBe('blob:result')
    expect(result.current.resultName).toBe('a-augmented.wav')
  })

  it('attaches the second file when mixing', async () => {
    fetchMock().mockResolvedValue(response(200))
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav'), audio('b.wav')]))
    await act(async () => {
      await result.current.run('augment', { ...options, augment: { ...options.augment, mixAudio: true } })
    })
    const form = (fetchMock().mock.calls[0]![1] as RequestInit).body as FormData
    expect((form.get('mix_file') as File).name).toBe('b.wav')
  })

  it('reads metadata from the organize endpoint', async () => {
    const metadata = { durationSec: 12, tempoBpm: 120, key: 'C major', loudnessDb: -14, tags: ['calm'] }
    fetchMock().mockResolvedValue(response(200, metadata))
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav')]))
    await act(async () => { await result.current.run('organize', options) })
    expect((fetchMock().mock.calls[0]![0] as string).endsWith('/api/process/audio/organize')).toBe(true)
    expect(result.current.metadata).toEqual(metadata)
    expect(result.current.resultUrl).toBeNull()
  })

  it.each([
    [413, {}, 'a.wav too large'],
    [429, {}, 'rate'],
    [503, { detail: { code: 'server_busy' } }, 'busy'],
    [504, {}, 'unreachable'],
    [400, { detail: { code: 'invalid_file_type' } }, 'invalid'],
    [500, { detail: 'boom' }, 'failed'],
  ])('maps a %i response to a readable message', async (status, body, expected) => {
    fetchMock().mockResolvedValue(response(status, body))
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav')]))
    await act(async () => { await result.current.run('convert', options) })
    expect(result.current.error).toBe(expected)
    expect(result.current.state).toBe('error')
    expect(result.current.logs.at(-1)?.status).toBe('error')
  })

  it('says the server is unreachable when the network fails', async () => {
    fetchMock().mockRejectedValue(new TypeError('Failed to fetch'))
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav')]))
    await act(async () => { await result.current.run('convert', options) })
    expect(result.current.error).toBe('unreachable')
  })

  it('drops the previous result when the files change, and frees its URL', async () => {
    fetchMock().mockResolvedValue(response(200))
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav')]))
    await act(async () => { await result.current.run('augment', options) })
    expect(result.current.resultUrl).toBe('blob:result')

    act(() => result.current.setFiles([audio('b.wav')]))
    expect(result.current.resultUrl).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:result')
  })

  it('cancels a request in flight on reset and ignores its answer', async () => {
    let release: (r: Response) => void = () => undefined
    fetchMock().mockImplementation((_url: string, init: RequestInit) => new Promise<Response>((resolve, reject) => {
      release = resolve
      init.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
    }))
    const { result } = renderHook(() => useDatasetTool(messages))
    act(() => result.current.setFiles([audio('a.wav')]))

    let running: Promise<void> = Promise.resolve()
    act(() => { running = result.current.run('augment', options) })
    expect(result.current.state).toBe('processing')

    act(() => result.current.reset())
    release(response(200))
    await act(async () => { await running })

    expect(result.current.state).toBe('idle')
    expect(result.current.resultUrl).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
