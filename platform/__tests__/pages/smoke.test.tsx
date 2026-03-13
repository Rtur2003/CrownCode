import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'

// Mock IntersectionObserver (used by next/link prefetching)
beforeAll(() => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })
  window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
})

// Mock next/router (pages router)
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  }),
}))

// Mock next/navigation (safety net – no longer actively imported)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/head
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

// Non-DOM prop list to filter out from framer-motion
const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap',
  'whileInView', 'viewport', 'variants', 'layout', 'layoutId', 'onAnimationComplete',
  'whileFocus', 'whileDrag', 'drag', 'dragConstraints', 'dragElastic',
])

function filterProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {}
  for (const key of Object.keys(props)) {
    if (!MOTION_PROPS.has(key)) {
      filtered[key] = props[key]
    }
  }
  return filtered
}

// Create a proxy-based motion mock that works for any HTML element
const motionHandler: ProxyHandler<object> = {
  get(_target, prop: string) {
    return function MotionComponent({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
      return React.createElement(prop, filterProps(props), children)
    }
  },
}

jest.mock('framer-motion', () => ({
  motion: new Proxy({}, motionHandler),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useAnimation: () => ({ start: jest.fn() }),
  useInView: () => true,
}))

// Shared variable for motion handler
const motionHandlerRef = motionHandler

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('Page Smoke Tests', () => {
  describe('Home Page (/)', () => {
    it('renders without crashing', async () => {
      const HomePage = (await import('@/pages/index')).default
      const { container } = renderWithProviders(<HomePage />)
      expect(container).toBeTruthy()
    })

    it('renders the CrownCode title', async () => {
      const HomePage = (await import('@/pages/index')).default
      renderWithProviders(<HomePage />)
      expect(screen.getByText('CrownCode')).toBeInTheDocument()
    })
  })

  describe('Crown Commend Page (/crown-commend)', () => {
    it('renders without crashing', async () => {
      const CrownCommendPage = (await import('@/pages/crown-commend/index')).default
      const { container } = renderWithProviders(<CrownCommendPage />)
      expect(container).toBeTruthy()
    })

    it('renders the Crown Commend title', async () => {
      const CrownCommendPage = (await import('@/pages/crown-commend/index')).default
      renderWithProviders(<CrownCommendPage />)
      expect(screen.getByText('Crown Commend')).toBeInTheDocument()
    })
  })

  describe('Search Page (/search)', () => {
    it('renders without crashing', async () => {
      const SearchPage = (await import('@/pages/search')).default
      const { container } = renderWithProviders(<SearchPage />)
      expect(container).toBeTruthy()
    })

    it('renders the search input', async () => {
      const SearchPage = (await import('@/pages/search')).default
      renderWithProviders(<SearchPage />)
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('Creator Studio Page (/creator-studio)', () => {
    it('renders without crashing', async () => {
      const CreatorStudioPage = (await import('@/pages/creator-studio/index')).default
      const { container } = renderWithProviders(<CreatorStudioPage />)
      expect(container).toBeTruthy()
    })

    it('renders the Creator Studio title', async () => {
      const CreatorStudioPage = (await import('@/pages/creator-studio/index')).default
      renderWithProviders(<CreatorStudioPage />)
      // Title is "Creator Studio" in both EN and TR locales
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('Analysis History Page (/analysis-history)', () => {
    it('renders without crashing', async () => {
      const AnalysisHistoryPage = (await import('@/pages/analysis-history/index')).default
      const { container } = renderWithProviders(<AnalysisHistoryPage />)
      expect(container).toBeTruthy()
    })

    it('renders the Analysis History title', async () => {
      const AnalysisHistoryPage = (await import('@/pages/analysis-history/index')).default
      renderWithProviders(<AnalysisHistoryPage />)
      // TR: "Analiz Geçmişi", EN: "Analysis History"
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('renders long input text without layout break', async () => {
      const longInput = 'https://www.youtube.com/watch?v=' + 'a'.repeat(300)
      const entry = { id: 'test-long-input', input: longInput, result: { score: 0.9 }, timestamp: Date.now() }
      localStorage.setItem('crowncode:last-analysis', JSON.stringify([entry]))

      const AnalysisHistoryPage = (await import('@/pages/analysis-history/index')).default
      const { container } = renderWithProviders(<AnalysisHistoryPage />)

      const inputText = container.querySelector('[class*="entry-input-text"]')
      expect(inputText).toBeInTheDocument()
      expect(inputText?.textContent).toBe(longInput)
    })
  })

  describe('System Status Page (/system-status)', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response)
      )
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('renders without crashing', async () => {
      const SystemStatusPage = (await import('@/pages/system-status/index')).default
      let container: HTMLElement
      await act(async () => {
        const result = renderWithProviders(<SystemStatusPage />)
        container = result.container
      })
      expect(container!).toBeTruthy()
    })

    it('renders the System Status heading', async () => {
      const SystemStatusPage = (await import('@/pages/system-status/index')).default
      await act(async () => {
        renderWithProviders(<SystemStatusPage />)
      })
      // TR: "Sistem Durumu", EN: "System Status"
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })

    it('shows last-checked timestamp after health check completes', async () => {
      const SystemStatusPage = (await import('@/pages/system-status/index')).default
      await act(async () => {
        renderWithProviders(<SystemStatusPage />)
      })
      // TR default: "Son kontrol"
      await waitFor(() => {
        expect(screen.getByText(/Son kontrol/)).toBeInTheDocument()
      })
    })

    it('shows no-external-backend label when NEXT_PUBLIC_API_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_API_URL
      const SystemStatusPage = (await import('@/pages/system-status/index')).default
      await act(async () => {
        renderWithProviders(<SystemStatusPage />)
      })
      // TR: "Harici backend yapılandırılmadı"
      await waitFor(() => {
        expect(screen.getByText(/Harici backend/)).toBeInTheDocument()
      })
    })

    it('shows degraded state when some services fail', async () => {
      let callCount = 0
      global.fetch = jest.fn(() => {
        callCount++
        // First call succeeds, second fails
        if (callCount <= 1) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response)
        }
        return Promise.reject(new Error('timeout'))
      })

      const SystemStatusPage = (await import('@/pages/system-status/index')).default
      await act(async () => {
        renderWithProviders(<SystemStatusPage />)
      })
      // TR: "Kısmi bozulma tespit edildi"
      await waitFor(() => {
        expect(screen.getByText(/Kısmi bozulma/)).toBeInTheDocument()
      })
    })
  })
})
