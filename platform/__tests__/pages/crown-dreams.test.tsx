/* eslint-disable @typescript-eslint/no-non-null-assertion -- tests index into arrays they just built */
import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { SAMPLE_DREAMS } from '@/data/dreams'

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/crown-dreams',
    query: {},
    asPath: '/crown-dreams',
    locale: 'en',
    push: jest.fn(),
    replace: jest.fn(),
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  }),
}))

jest.mock('next/head', () => ({ children }: { children: React.ReactNode }) => <>{children}</>)

jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => (
  <a href={href}>{children}</a>
))

// The header animates with motion and watches scroll position; neither matters here.
const MOTION_ONLY = new Set(['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'variants', 'layout', 'layoutId'])
const motionHandler: ProxyHandler<object> = {
  get: (_target, tag: string) =>
    function MotionStandIn({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
      const dom = Object.fromEntries(Object.entries(props).filter(([key]) => !MOTION_ONLY.has(key)))
      return React.createElement(tag, dom, children)
    },
}
const motionValue = (initial: unknown) => ({ get: () => initial, set: () => undefined, on: () => () => undefined })

jest.mock('motion/react', () => ({
  motion: new Proxy({}, motionHandler),
  m: new Proxy({}, motionHandler),
  LazyMotion: ({ children }: React.PropsWithChildren) => <>{children}</>,
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useAnimation: () => ({ start: jest.fn() }),
  useInView: () => true,
  useReducedMotion: () => false,
  useScroll: () => ({ scrollYProgress: motionValue(0) }),
  useMotionValueEvent: () => undefined,
  useMotionValue: (initial: unknown) => motionValue(initial),
  useSpring: (source: unknown) => motionValue(source),
  useTransform: (_source: unknown, _input: unknown, output: unknown[]) => motionValue(Array.isArray(output) ? output[0] : output),
}))

beforeAll(() => {
  window.IntersectionObserver = jest.fn().mockReturnValue({
    observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
  }) as unknown as typeof IntersectionObserver
})

const analysis = {
  emotions: ['fear', 'wonder', 'not-a-real-emotion'],
  themes: ['falling', 'water'],
  symbols: ['moon'],
  interpretation: 'A reading of the dream.',
  lucidityIndicator: true,
}

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as unknown as Response

const renderPage = async () => {
  const Page = (await import('@/pages/crown-dreams/index')).default
  return render(<LanguageProvider><Page /></LanguageProvider>)
}

const write = (text: string) => {
  fireEvent.change(screen.getByLabelText('Your dream'), { target: { value: text } })
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test'
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_API_URL
  jest.restoreAllMocks()
})

describe('Crown Dreams page', () => {
  it('has one h1 naming the product, not a greeting', async () => {
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Crown Dreams' })).toBeInTheDocument()
  })

  it('says next to the journal that it is sample data', async () => {
    await renderPage()
    expect(screen.getByText(/sample data written for this page/i)).toBeInTheDocument()
    expect(screen.getByText(`${SAMPLE_DREAMS.length} sample dreams, ${SAMPLE_DREAMS.filter(d => d.type === 'lucid').length} of them lucid.`)).toBeInTheDocument()
  })

  it('shows no invented statistics or gamified ranks', async () => {
    await renderPage()
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/streak|Explorer|Mastery|milestone|Nexus|247/i)
  })

  describe('writing a dream', () => {
    it('keeps the button off until there are 10 characters', async () => {
      await renderPage()
      const button = screen.getByRole('button', { name: 'Read my dream' })
      expect(button).toBeDisabled()
      write('too short')
      expect(button).toBeDisabled()
      write('long enough to be a dream')
      expect(button).toBeEnabled()
    })

    it('sends the text and shows the reading, dropping emotions it does not know', async () => {
      const fetchMock = jest.fn().mockResolvedValue(jsonResponse(analysis))
      global.fetch = fetchMock
      await renderPage()
      write('I was falling into dark water under the moon')
      fireEvent.click(screen.getByRole('button', { name: 'Read my dream' }))

      expect(await screen.findByText('A reading of the dream.')).toBeInTheDocument()
      expect(fetchMock.mock.calls[0]![0]).toBe('https://api.example.test/api/dreams/analyze')
      const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string)
      expect(body).toEqual({ dreamText: 'I was falling into dark water under the moon', language: 'English' })

      expect(screen.getByText('Fear, Wonder')).toBeInTheDocument()
      expect(screen.getByText('falling, water')).toBeInTheDocument()
      expect(screen.getByText('The text suggests you knew you were dreaming.')).toBeInTheDocument()
    })

    it('shows a mapped message when the service is rate limited', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        jsonResponse({ detail: { code: 'rate_limit_exceeded', message: 'raw backend text' } }, 429),
      )
      await renderPage()
      write('a dream that is long enough')
      fireEvent.click(screen.getByRole('button', { name: 'Read my dream' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests. Please wait a moment.')
    })

    it('treats a malformed response as a failed analysis', async () => {
      global.fetch = jest.fn().mockResolvedValue(jsonResponse({ emotions: 'fear', interpretation: 5 }))
      await renderPage()
      write('a dream that is long enough')
      fireEvent.click(screen.getByRole('button', { name: 'Read my dream' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Analysis failed. Please try again.')
    })

    it('lets the reader write another once a reading is shown', async () => {
      global.fetch = jest.fn().mockResolvedValue(jsonResponse(analysis))
      await renderPage()
      write('a dream that is long enough')
      fireEvent.click(screen.getByRole('button', { name: 'Read my dream' }))
      await screen.findByText('A reading of the dream.')
      fireEvent.click(screen.getByRole('button', { name: 'Write another' }))
      await waitFor(() => expect(screen.queryByText('A reading of the dream.')).not.toBeInTheDocument())
    })

    it('limits the text to what the backend accepts', async () => {
      await renderPage()
      expect(screen.getByLabelText('Your dream')).toHaveAttribute('maxlength', '4000')
    })
  })

  describe('sample journal', () => {
    it('lists every sample dream, collapsed, with its number', async () => {
      await renderPage()
      const entries = screen.getAllByRole('button', { expanded: false }).filter(b => /^No\. \d\d/.test(b.textContent ?? ''))
      expect(entries).toHaveLength(SAMPLE_DREAMS.length)
      expect(entries[0]).toHaveTextContent('No. 01')
    })

    it('opens one entry at a time and closes it again', async () => {
      await renderPage()
      const first = screen.getByRole('button', { name: /The extra room/ })
      const second = screen.getByRole('button', { name: /The missed train/ })

      fireEvent.click(first)
      expect(first).toHaveAttribute('aria-expanded', 'true')
      expect(document.getElementById(first.getAttribute('aria-controls')!)).toBeVisible()

      fireEvent.click(second)
      expect(first).toHaveAttribute('aria-expanded', 'false')
      expect(second).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(second)
      expect(second).toHaveAttribute('aria-expanded', 'false')
    })

    it('filters by kind', async () => {
      await renderPage()
      const group = screen.getByRole('group', { name: 'Filter by kind' })
      fireEvent.click(within(group).getByRole('button', { name: 'Lucid' }))
      expect(within(group).getByRole('button', { name: 'Lucid' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: /Too many lines on my hand/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /The extra room/ })).not.toBeInTheDocument()
    })

    it('searches titles, text and symbols', async () => {
      await renderPage()
      const search = screen.getByRole('searchbox', { name: 'Search the sample dreams' })
      fireEvent.change(search, { target: { value: 'tooth' } })
      expect(screen.getByRole('button', { name: /A tooth in the meeting/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /The missed train/ })).not.toBeInTheDocument()

      fireEvent.change(search, { target: { value: 'nothing like this' } })
      expect(screen.getByText('No sample dream matches.')).toBeInTheDocument()
    })
  })
})
