import { analyzeSource } from '@/hooks/analysisGateway'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('analysisGateway – analyzeSource', () => {
  const API_BASE = 'http://localhost:8000'

  it('returns backend_not_configured when apiBaseUrl is undefined', async () => {
    const { result, error } = await analyzeSource(undefined, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('backend_not_configured')
  })

  it('returns enterUrl when sourceType is youtube but url is missing', async () => {
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
    })
    expect(result).toBeNull()
    expect(error).toBe('enterUrl')
  })

  it('returns missingFile when sourceType is file but file is missing', async () => {
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'file',
    })
    expect(result).toBeNull()
    expect(error).toBe('missingFile')
  })

  it('returns fileTooLarge when file exceeds 30MB', async () => {
    const bigFile = new File(['x'], 'big.mp3', { type: 'audio/mpeg' })
    Object.defineProperty(bigFile, 'size', { value: 31 * 1024 * 1024 })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'file',
      file: bigFile,
    })
    expect(result).toBeNull()
    expect(error).toBe('fileTooLarge')
  })

  it('maps backend unsupported_source error to unsupportedSource', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ errors: ['unsupported_source'] }),
    })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('unsupportedSource')
  })

  it('maps backend missing_file error to missingFile', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ errors: ['missing_file'] }),
    })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('missingFile')
  })

  it('returns backend_unreachable on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('backend_unreachable')
  })

  it('returns backend_unreachable on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network failure'))
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('backend_unreachable')
  })

  it('returns backend_unexpected_response when result is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('backend_unexpected_response')
  })

  it('maps backend missing_url error to missingUrl', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ errors: ['missing_url'] }),
    })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('missingUrl')
  })

  it('maps backend invalid_source_type error to invalidSourceType', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ errors: ['invalid_source_type'] }),
    })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('invalidSourceType')
  })

  it('maps backend internal_error to internalError', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ errors: ['internal_error'] }),
    })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(result).toBeNull()
    expect(error).toBe('internalError')
  })

  it('normalizes missing analysisMode based on decisionSource', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          isAIGenerated: false,
          confidence: 0.85,
          processingTime: 1.2,
          modelVersion: 'v1',
          decisionSource: 'preview',
          source: { kind: 'youtube', url: 'x', normalizedUrl: 'x', videoId: 'abc' },
          features: { spectralRegularity: 0, temporalPatterns: 0, harmonicStructure: 0, artificialIndicators: [] },
          audioInfo: { duration: 30, sampleRate: 44100, bitrate: 128, format: 'mp3' },
        },
      }),
    })
    const { result, error } = await analyzeSource(API_BASE, {
      sourceType: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
    })
    expect(error).toBeNull()
    expect(result).not.toBeNull()
    expect(result!.analysisMode).toBe('preview')
  })
})
