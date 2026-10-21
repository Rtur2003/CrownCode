/* eslint-disable @typescript-eslint/no-non-null-assertion -- tests index into arrays they just built */
import React from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/context/ToastContext'

jest.mock('next/router', () => jest.requireActual('@/test-utils/pageMocks').routerModule('/data-manipulation'))
jest.mock('next/head', () => jest.requireActual('@/test-utils/pageMocks').headModule())
jest.mock('next/link', () => jest.requireActual('@/test-utils/pageMocks').linkModule())
jest.mock('motion/react', () => jest.requireActual('@/test-utils/pageMocks').motionModule())

beforeAll(() => jest.requireActual('@/test-utils/pageMocks').stubIntersectionObserver())

const renderPage = async (load: () => Promise<{ default: React.ComponentType }>) => {
  const Page = (await load()).default
  return render(<LanguageProvider><ToastProvider><Page /></ToastProvider></LanguageProvider>)
}

const response = (status: number, body: unknown = {}) =>
  ({ ok: status < 400, status, json: async () => body, blob: async () => new Blob(['x']), headers: new Headers() }) as unknown as Response

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test'
  URL.createObjectURL = jest.fn(() => 'blob:result')
  URL.revokeObjectURL = jest.fn()
})

afterEach(() => jest.restoreAllMocks())

describe('ML Toolkit page', () => {
  const choose = (name: string, type = '') => {
    const input = document.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['abc'], name, { type })] } })
  }

  beforeEach(() => {
    // ensureServer probes /api/health first; every other call is the tool itself.
    global.fetch = jest.fn((url: RequestInfo | URL) => Promise.resolve(response(String(url).includes('/health') ? 200 : 200)))
  })

  it('opens on augmentation with the options listed', async () => {
    await renderPage(() => import('@/pages/data-manipulation/index'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ML Toolkit')
    expect(screen.getByRole('checkbox', { name: /Pitch shift/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Process' })).toBeDisabled()
  })

  it('keeps the chosen file when the tool changes', async () => {
    await renderPage(() => import('@/pages/data-manipulation/index'))
    choose('take.flac')
    expect(screen.getByText('take.flac')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Conversion' }))
    expect(screen.getByText('take.flac')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.getByRole('button', { name: 'Process' })).toBeEnabled()
  })

  it('converts a file and offers the result under the new name', async () => {
    await renderPage(() => import('@/pages/data-manipulation/index'))
    choose('take.flac')
    fireEvent.click(screen.getByRole('button', { name: 'Conversion' }))
    fireEvent.click(screen.getByRole('button', { name: 'Process' }))

    const download = await screen.findByRole('link', { name: 'Download result' })
    expect(download).toHaveAttribute('download', 'take.mp3')
    expect(download).toHaveAttribute('href', 'blob:result')

    const call = (global.fetch as jest.Mock).mock.calls.find(([url]) => String(url).includes('/api/process/'))!
    expect(String(call[0])).toBe('https://api.example.test/api/process/audio/convert')
    const form = (call[1] as RequestInit).body as FormData
    expect((form.get('file') as File).type).toBe('audio/flac')
  })

  it('shows a readable message when the server asks for a pause', async () => {
    global.fetch = jest.fn((url: RequestInfo | URL) =>
      Promise.resolve(String(url).includes('/api/process/') ? response(429, { detail: { code: 'rate_limit_exceeded' } }) : response(200)))
    await renderPage(() => import('@/pages/data-manipulation/index'))
    choose('take.wav', 'audio/wav')
    fireEvent.click(screen.getByRole('button', { name: 'Process' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests')
  })

  it('shows the tags the labelling tool returns', async () => {
    global.fetch = jest.fn((url: RequestInfo | URL) =>
      Promise.resolve(String(url).includes('/organize')
        ? response(200, { durationSec: 65, tempoBpm: 120, key: 'C major', loudnessDb: -14, tags: ['calm', 'short-clip'] })
        : response(200)))
    await renderPage(() => import('@/pages/data-manipulation/index'))
    choose('take.wav', 'audio/wav')
    fireEvent.click(screen.getByRole('button', { name: 'Labelling' }))
    fireEvent.click(screen.getByRole('button', { name: 'Analyse' }))

    expect(await screen.findByText('calm, short-clip')).toBeInTheDocument()
    expect(screen.getByText('1:05')).toBeInTheDocument()
    expect(screen.getByText('120 BPM')).toBeInTheDocument()
  })
})

describe('Crown Vote page', () => {
  const release = {
    tag_name: 'v1.2.0',
    html_url: 'https://github.com/Rtur2003/VOTRYX/releases/tag/v1.2.0',
    draft: false,
    published_at: '2026-01-25T10:00:00Z',
    assets: [{ name: 'VOTRYX-Setup.exe', size: 5 * 1024 * 1024, browser_download_url: 'https://github.com/Rtur2003/VOTRYX/releases/download/v1.2.0/VOTRYX-Setup.exe' }],
  }

  it('links the installer from the newest published release', async () => {
    global.fetch = jest.fn().mockResolvedValue(response(200, [{ ...release, draft: true, tag_name: 'v9' }, release]))
    await renderPage(() => import('@/pages/crown-vote/index'))
    const button = await screen.findByRole('link', { name: 'Download for Windows' })
    await waitFor(() => expect(button).toHaveAttribute('href', release.assets[0]!.browser_download_url))
    expect(screen.getByText(/Version v1\.2\.0 · Size 5\.0 MB/)).toBeInTheDocument()
  })

  it('falls back to the releases page when GitHub does not answer', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await renderPage(() => import('@/pages/crown-vote/index'))
    expect(await screen.findByText(/could not be loaded from GitHub/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute('href', 'https://github.com/Rtur2003/VOTRYX/releases')
  })

  it('writes a config.json that stays inside the allowed ranges', async () => {
    global.fetch = jest.fn().mockResolvedValue(response(200, []))
    await renderPage(() => import('@/pages/crown-vote/index'))

    fireEvent.change(screen.getByLabelText('Pause Between Votes (seconds)'), { target: { value: '99' } })
    fireEvent.change(screen.getByLabelText('Max Errors'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const json = JSON.parse(document.querySelector('pre code')!.textContent!)
    expect(json.pause_between_votes).toBe(30)
    expect(json.max_errors).toBe(3)
  })

  it('will not offer a config for an address that is not a URL', async () => {
    global.fetch = jest.fn().mockResolvedValue(response(200, []))
    await renderPage(() => import('@/pages/crown-vote/index'))
    fireEvent.change(screen.getByLabelText('Target URL'), { target: { value: 'not a url' } })
    expect(screen.getByRole('button', { name: 'Download File' })).toBeDisabled()
    expect(screen.getByText(/starting with https/)).toBeInTheDocument()
  })
})

describe('Legal, error and showcase pages', () => {
  it('lists every privacy section and the contact address', async () => {
    await renderPage(() => import('@/pages/privacy'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Privacy Policy')
    for (const title of ['What is collected', 'What happens to what you send', 'On your device', 'Cookies']) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /contact@/ })).toHaveAttribute('href', expect.stringMatching(/^mailto:/))
  })

  it('names Google as the recipient of dream text and transcripts', async () => {
    await renderPage(() => import('@/pages/privacy'))
    expect(screen.getByText(/Gemini API/)).toBeInTheDocument()
  })

  it('links the source from the terms', async () => {
    await renderPage(() => import('@/pages/terms'))
    const section = screen.getByRole('heading', { name: 'Open source' }).closest('section')!
    expect(within(section).getByRole('link', { name: 'View on GitHub' })).toHaveAttribute('href', expect.stringContaining('github.com'))
  })

  it('offers ways out of a 404', async () => {
    await renderPage(() => import('@/pages/404'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
    expect(screen.getByRole('link', { name: 'Go to Home' })).toHaveAttribute('href', '/')
  })

  it('shows all four screenshots of Noir & Grain with captions', async () => {
    await renderPage(() => import('@/pages/noir-grain/index'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Noir & Grain')
    expect(screen.getAllByRole('figure')).toHaveLength(4)
    expect(screen.getByText('Reservation form')).toBeInTheDocument()
  })

  it('finds a project from the search page', async () => {
    const router = jest.requireMock('next/router').useRouter()
    router.query = { q: 'dreams' }
    await act(async () => { await renderPage(() => import('@/pages/search')) })
    expect(screen.getAllByRole('link').some(a => /dream/i.test(a.textContent ?? ''))).toBe(true)
  })
})
