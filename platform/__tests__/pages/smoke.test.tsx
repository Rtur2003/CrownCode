import React from 'react'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'

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
})
