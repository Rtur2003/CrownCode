import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { LanguageProvider } from '@/context/LanguageContext'
import { SponsorModal } from '@/components/Sponsor/SponsorModal'
import {
  COOLDOWN_STORAGE_KEY,
  DISMISS_COOLDOWN_MS,
  SECOND_PAGE_DELAY_MS,
  SPONSORED_COOLDOWN_MS,
  isEligibleAutoRoute,
  isSponsorCooldownActive,
  openSponsorModal,
} from '@/components/Sponsor/sponsorPrompt'
import { NOINDEX_ROUTES, SPONSORS_URL } from '@/config/site'
import en from '@/locales/en.json'
import tr from '@/locales/tr.json'

expect.extend(toHaveNoViolations)

let mockPathname = '/'
let mockLocale: 'tr' | 'en' = 'tr'

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: mockPathname,
    asPath: mockPathname,
    locale: mockLocale,
    query: {},
    isReady: true,
    push: jest.fn(),
    replace: jest.fn(),
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  }),
}))

describe('SponsorModal', () => {
  beforeEach(() => {
    mockPathname = '/'
    mockLocale = 'tr'
    window.localStorage.clear()
    window.sessionStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('never opens synchronously on landing and opens when triggered manually', () => {
    render(<LanguageProvider><SponsorModal /></LanguageProvider>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    act(() => {
      openSponsorModal()
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    const sponsorLink = screen.getByRole('link', { name: tr.sponsorModal.primaryCta })
    expect(sponsorLink).toHaveAttribute('href', SPONSORS_URL)
    expect(screen.getByAltText(tr.sponsorModal.previewAlt)).toHaveAttribute('src', '/media/crowncode-showcase.webp')
  })

  it('sets a 14-day cooldown on dismiss and a 30-day cooldown on sponsor click', () => {
    render(<LanguageProvider><SponsorModal /></LanguageProvider>)
    const baseNow = Date.now()
    jest.setSystemTime(baseNow)

    act(() => {
      openSponsorModal()
    })

    fireEvent.click(screen.getByRole('button', { name: tr.sponsorModal.dismissCta }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(Number(window.localStorage.getItem(COOLDOWN_STORAGE_KEY))).toBeGreaterThanOrEqual(
      baseNow + DISMISS_COOLDOWN_MS - 1000,
    )
    expect(isSponsorCooldownActive(baseNow + 1000)).toBe(true)

    window.localStorage.clear()
    act(() => {
      openSponsorModal()
    })
    fireEvent.click(screen.getByRole('link', { name: tr.sponsorModal.primaryCta }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(Number(window.localStorage.getItem(COOLDOWN_STORAGE_KEY))).toBeGreaterThanOrEqual(
      baseNow + SPONSORED_COOLDOWN_MS - 1000,
    )
  })

  it('auto-opens after a second session route view following the gentle engagement delay', () => {
    const first = render(<LanguageProvider><SponsorModal /></LanguageProvider>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    first.unmount()

    mockPathname = '/ai-music-detection'
    render(<LanguageProvider><SponsorModal /></LanguageProvider>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(SECOND_PAGE_DELAY_MS + 50)
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('skips automatic triggering on privacy, terms and noindex routes', () => {
    expect(isEligibleAutoRoute('/', NOINDEX_ROUTES)).toBe(true)
    expect(isEligibleAutoRoute('/privacy', NOINDEX_ROUTES)).toBe(false)
    expect(isEligibleAutoRoute('/terms', NOINDEX_ROUTES)).toBe(false)
    expect(isEligibleAutoRoute('/search', NOINDEX_ROUTES)).toBe(false)
    expect(isEligibleAutoRoute('/system-status', NOINDEX_ROUTES)).toBe(false)
  })

  it('uses pure open-source sponsorship wording with zero regulated fundraising phrasing', () => {
    const forbidden = /bağış|yardım\s+topla|donation|donate/i
    expect(JSON.stringify(tr.sponsorModal)).not.toMatch(forbidden)
    expect(JSON.stringify(en.sponsorModal)).not.toMatch(forbidden)
    expect(JSON.stringify(tr.flMcpPage.hero.modals)).not.toMatch(forbidden)
    expect(JSON.stringify(en.flMcpPage.hero.modals)).not.toMatch(forbidden)
    expect(JSON.stringify(en.flMcpPage.commerceNotice)).not.toMatch(forbidden)
  })

  it('passes axe accessibility checks when open in English', async () => {
    jest.useRealTimers()
    mockLocale = 'en'
    const { container } = render(<LanguageProvider><SponsorModal /></LanguageProvider>)

    act(() => {
      openSponsorModal()
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
