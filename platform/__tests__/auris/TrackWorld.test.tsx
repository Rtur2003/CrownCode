/* eslint-disable @typescript-eslint/no-non-null-assertion -- tests index into data they have just built */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { TrackNow, TrackWorld, readingOf } from '@/components/Auris/TrackWorld'
import type { TrackSurface } from '@/components/Auris/trackSurface'
import type { Timeline, TimelineSegment } from '@/hooks/analysisTypes'

jest.mock('next/router', () => jest.requireActual('@/test-utils/pageMocks').routerModule('/ai-music-detection'))

const surface = (over: Partial<TrackSurface> = {}): TrackSurface => ({
  width: 4, height: 2, data: new Uint8Array(4 * 2 * 4), spanSec: 80, hasLean: true, hasRings: true, ...over,
})

const seg = (start: number, end: number, extra: Partial<TimelineSegment> = {}): TimelineSegment => ({
  index: 0, start, end, state: 'ok', probability: 0.5, isAi: false, margin: 0.5, ...extra,
})

const timeline: Timeline = {
  durationSec: 80, totalSec: 80, truncated: false, threshold: 0.5, peaks: [], summary: {} as Timeline['summary'],
  segments: [seg(0, 40, { isAi: true, probability: 0.81 }), seg(40, 80, { isAi: false, probability: 0.27 })],
}

const view = (props: Partial<React.ComponentProps<typeof TrackWorld>> = {}) => {
  const handlers = { onScrub: jest.fn(), onHear: jest.fn(), onStop: jest.fn() }
  render(
    <LanguageProvider>
      <TrackWorld surface={surface()} timeline={timeline} totalSec={80} at={0.25} playing={false} canHear {...handlers} {...props} />
    </LanguageProvider>,
  )
  return handlers
}

describe('readingOf', () => {
  it('says which way a scored stretch leaned, with the share on that side', () => {
    expect(readingOf(seg(0, 1, { isAi: true, probability: 0.8 }))).toEqual({ tone: 'ai', key: 'ai', p: 0.8 })
    const human = readingOf(seg(0, 1, { isAi: false, probability: 0.3 }))
    expect(human.tone).toBe('human')
    expect(human.p).toBeCloseTo(0.7)
  })

  it('tells silence from a stretch that was not read', () => {
    expect(readingOf(seg(0, 1, { state: 'silent' })).key).toBe('silent')
    expect(readingOf(seg(0, 1, { state: 'failed' })).key).toBe('none')
    expect(readingOf(undefined).key).toBe('none')
  })
})

describe('TrackWorld', () => {
  it('names the moment and what the models read there', () => {
    view({ at: 0.25 })
    expect(screen.getByRole('heading', { name: 'Your track, as a world' })).toBeInTheDocument()
    expect(screen.getByText('0:20')).toBeInTheDocument()
    expect(screen.getByText('Leaned AI, 81%')).toBeInTheDocument()
  })

  it('reads the other side of the track as human', () => {
    view({ at: 0.75 })
    expect(screen.getByText('1:00')).toBeInTheDocument()
    expect(screen.getByText('Leaned human, 73%')).toBeInTheDocument()
  })

  it('has a slider that is the same control as dragging the planet', () => {
    const { onScrub } = view({ at: 0.5 })
    const slider = screen.getByRole('slider', { name: 'Position in the track' })
    expect(slider).toHaveValue('500')
    expect(slider).toHaveAttribute('aria-valuetext', '0:40, Leaned human, 73%')
    fireEvent.change(slider, { target: { value: '750' } })
    expect(onScrub).toHaveBeenCalledWith(0.75)
  })

  it('plays the moment, and stops it again', () => {
    const { onHear } = view()
    fireEvent.click(screen.getByRole('button', { name: 'Hear this moment' }))
    expect(onHear).toHaveBeenCalledTimes(1)
  })

  it('offers stop while it plays', () => {
    const { onStop } = view({ playing: true })
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('has no play button when there is no audio kept for the track', () => {
    view({ canHear: false })
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows no reading at all when the models gave none for the track', () => {
    view({ surface: surface({ hasLean: false }), timeline: null })
    expect(screen.queryByText(/Leaned|Not read/)).toBeNull()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '0:20')
  })

  it('keeps the key to what the planet actually shows', () => {
    view({ surface: surface({ hasLean: false, hasRings: false }), timeline: null })
    const key = screen.getByText('How to read it').closest('details')!
    expect(key).toHaveTextContent('Raised ground is louder.')
    expect(key).not.toHaveTextContent('Amber')
    expect(key).not.toHaveTextContent('Fine rings')
  })

  it('says when the planet covers only the opening of a longer track', () => {
    view({ totalSec: 200 })
    expect(screen.getByText('The world shows the first 80 seconds of the track.')).toBeInTheDocument()
  })

  it('does not say it when the whole track is on the planet', () => {
    view({ totalSec: 80 })
    expect(screen.queryByText(/first 80 seconds/)).toBeNull()
  })
})

describe('TrackNow', () => {
  const caption = (props: Partial<React.ComponentProps<typeof TrackNow>> = {}) =>
    render(
      <LanguageProvider>
        <TrackNow surface={surface()} timeline={timeline} at={0.25} {...props} />
      </LanguageProvider>,
    )

  it('mirrors the moment over the planet, hidden from assistive technology', () => {
    const { container } = caption()
    const node = container.querySelector('p')!
    expect(node).toHaveAttribute('aria-hidden', 'true')
    expect(node).toHaveTextContent('0:20')
    expect(node).toHaveTextContent('Leaned AI, 81%')
  })

  it('shows only the time when the models gave no reading', () => {
    const { container } = caption({ surface: surface({ hasLean: false }), timeline: null })
    expect(container.querySelector('p')).toHaveTextContent(/^0:20$/)
  })
})
