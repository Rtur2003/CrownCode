import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { LanguageProvider } from '@/context/LanguageContext'

expect.extend(toHaveNoViolations)

// Mock next/router
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

jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

// Framer-motion mock
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

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('Accessibility Tests', () => {
  describe('Footer', () => {
    it('has no axe violations', async () => {
      const { Footer } = await import('@/components/Layout/Footer')
      const { container } = renderWithProviders(<Footer />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Toast', () => {
    it('has no axe violations', async () => {
      const { Toast } = await import('@/components/UI/Toast/Toast')
      const mockToast = {
        id: '1',
        title: 'Test notification',
        message: 'Test message',
        type: 'info' as const,
        duration: 3000,
      }
      const { container } = renderWithProviders(
        <Toast toast={mockToast} onClose={jest.fn()} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Dialog landmarks', () => {
    afterEach(() => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    it('search modal renders no dialog when closed', async () => {
      const { SearchModal } = await import('@/components/Search/SearchModal')
      const { container } = renderWithProviders(<SearchModal />)
      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).toBeNull()
    })

    it('search modal renders role=dialog and aria-modal when open', async () => {
      jest.doMock('@/hooks/useSearch', () => ({
        useSearch: () => ({
          query: '',
          setQuery: jest.fn(),
          isOpen: true,
          openSearch: jest.fn(),
          closeSearch: jest.fn(),
          results: [],
          navigateToItem: jest.fn(),
        }),
      }))
      const { SearchModal } = await import('@/components/Search/SearchModal')
      const { container } = renderWithProviders(<SearchModal />)
      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).not.toBeNull()
      expect(dialog?.getAttribute('aria-modal')).toBe('true')
    })

    it('shortcuts modal renders no dialog when closed', async () => {
      const { ShortcutsModal } = await import('@/components/KeyboardShortcuts/ShortcutsModal')
      const { container } = renderWithProviders(<ShortcutsModal />)
      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).toBeNull()
    })
  })
})
