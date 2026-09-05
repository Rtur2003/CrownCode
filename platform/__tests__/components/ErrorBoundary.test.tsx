import React from 'react'
import { render, screen } from '@testing-library/react'
import Router from 'next/router'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'

// Real EventEmitter-like events object so `Router.events.emit(...)` in the
// test actually invokes the listener the boundary registered via `.on(...)`.
jest.mock('next/router', () => {
  const listeners: Record<string, Array<() => void>> = {}
  return {
    __esModule: true,
    default: {
      events: {
        on: (event: string, cb: () => void) => {
          listeners[event] = listeners[event] || []
          listeners[event].push(cb)
        },
        off: (event: string, cb: () => void) => {
          listeners[event] = (listeners[event] || []).filter((fn) => fn !== cb)
        },
        emit: (event: string) => {
          ;(listeners[event] || []).forEach((fn) => fn())
        },
      },
    },
  }
})

function Bomb(): React.ReactElement {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>fine</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('fine')).toBeInTheDocument()
  })

  it('shows the fallback after a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText('Bir Hata Oluştu')).toBeInTheDocument()
  })

  it('recovers automatically on SPA route change instead of staying stuck on the fallback', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText('Bir Hata Oluştu')).toBeInTheDocument()

    // Simulates what Next.js fires after any successful client-side
    // navigation (e.g. clicking the fallback's "Ana Sayfa" link).
    ;(Router.events.emit as (event: string) => void)('routeChangeComplete')

    // The boundary's own state resets; re-render with a non-throwing child
    // (as a real navigation would swap in a different page component).
    rerender(
      <ErrorBoundary>
        <div>next page</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('next page')).toBeInTheDocument()
    expect(screen.queryByText('Bir Hata Oluştu')).not.toBeInTheDocument()
  })
})
