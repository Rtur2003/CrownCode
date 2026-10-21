import React from 'react'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { LanguageToggle } from '@/components/Navigation/LanguageSelector'

jest.mock('next/router', () => {
  const router = { pathname: '/search', query: {}, asPath: '/search?q=old', locale: 'en', events: { on: jest.fn(), off: jest.fn() } }
  return { useRouter: () => router, default: router }
})
jest.mock('next/link', () => jest.requireActual('@/test-utils/pageMocks').linkModule())
jest.mock('motion/react', () => jest.requireActual('@/test-utils/pageMocks').motionModule())

const toggle = (
  <LanguageProvider>
    <LanguageToggle />
  </LanguageProvider>
)

describe('LanguageToggle links', () => {
  afterEach(() => window.history.replaceState({}, '', '/'))

  it('links to the bare path when the URL has no query, whatever the router remembers', () => {
    render(toggle)
    screen.getAllByRole('link').forEach(link => expect(link).toHaveAttribute('href', '/search'))
  })

  it('keeps the search and hash of the page it is on once the browser has them', () => {
    window.history.replaceState({}, '', '/search?q=hello%20world#top')
    render(toggle)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    links.forEach(link => expect(link).toHaveAttribute('href', '/search?q=hello%20world#top'))
  })
})
