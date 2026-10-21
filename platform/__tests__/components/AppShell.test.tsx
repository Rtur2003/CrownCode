import React from 'react'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { AppShell } from '@/components/Layout/AppShell'
import { MainLayout } from '@/components/Layout/MainLayout'

jest.mock('next/router', () => jest.requireActual('@/test-utils/pageMocks').routerModule('/crown-vote'))
jest.mock('next/head', () => jest.requireActual('@/test-utils/pageMocks').headModule())
jest.mock('next/link', () => jest.requireActual('@/test-utils/pageMocks').linkModule())
jest.mock('motion/react', () => jest.requireActual('@/test-utils/pageMocks').motionModule())

beforeAll(() => jest.requireActual('@/test-utils/pageMocks').stubIntersectionObserver())

const page = (
  <MainLayout title="Crown Vote: VOTRYX">
    <p>page content</p>
  </MainLayout>
)

describe('AppShell', () => {
  it('mounts the header, footer and main landmark once, however many layouts render inside it', () => {
    render(<LanguageProvider><AppShell>{page}</AppShell></LanguageProvider>)

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(document.querySelectorAll('.skip-link')).toHaveLength(1)
    expect(screen.getByText('page content')).toBeInTheDocument()
  })

  it('puts the page inside the main landmark the skip link points at', () => {
    render(<LanguageProvider><AppShell>{page}</AppShell></LanguageProvider>)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    expect(main).toContainElement(screen.getByText('page content'))
  })

  it('leaves the first render without a transition class, so the page keeps its own entrance', () => {
    render(<LanguageProvider><AppShell>{page}</AppShell></LanguageProvider>)
    const wrapper = screen.getByRole('main').firstElementChild
    expect(wrapper?.className).toBe('')
  })
})

describe('MainLayout on its own', () => {
  it('still brings a header, footer and main landmark', () => {
    render(<LanguageProvider>{page}</LanguageProvider>)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })
})
