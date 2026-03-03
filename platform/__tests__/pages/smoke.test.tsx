import React from 'react'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock next/head
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
    h1: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <h1 {...filterDomProps(props)}>{children}</h1>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <p {...filterDomProps(props)}>{children}</p>
    ),
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...filterDomProps(props)}>{children}</span>
    ),
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...filterDomProps(props)}>{children}</button>
    ),
    a: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <a {...filterDomProps(props)}>{children}</a>
    ),
    ul: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <ul {...filterDomProps(props)}>{children}</ul>
    ),
    li: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <li {...filterDomProps(props)}>{children}</li>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useAnimation: () => ({ start: jest.fn() }),
  useInView: () => true,
}))

// Filter out non-DOM props from framer-motion
function filterDomProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {}
  for (const key of Object.keys(props)) {
    if (
      !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'variants', 'layout', 'layoutId'].includes(key)
    ) {
      filtered[key] = props[key]
    }
  }
  return filtered
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

// Lazy import pages to avoid module-level errors
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
