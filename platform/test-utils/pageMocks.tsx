/**
 * Stand-ins for the parts of Next.js and Motion that page tests don't exercise.
 * Used from inside jest.mock factories, e.g.
 *   jest.mock('next/router', () => require('@/test-utils/pageMocks').routerModule('/crown-vote'))
 */

import React from 'react'

export const routerModule = (pathname: string, locale = 'en') => {
  const router = {
    pathname,
    query: {},
    asPath: pathname,
    locale,
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  }
  return { useRouter: () => router, default: router }
}

export const headModule = () =>
  function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }

export const linkModule = () =>
  function Link({ children, href, ...rest }: React.PropsWithChildren<{ href: string } & Record<string, unknown>>) {
    const { prefetch: _prefetch, scroll: _scroll, locale: _locale, ...anchor } = rest
    return <a href={typeof href === 'string' ? href : String(href)} {...anchor}>{children}</a>
  }

const MOTION_ONLY = new Set([
  'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileInView', 'whileFocus',
  'viewport', 'variants', 'layout', 'layoutId', 'onAnimationComplete',
])

const motionHandler: ProxyHandler<object> = {
  get: (_target, tag: string) =>
    function MotionStandIn({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
      const dom = Object.fromEntries(Object.entries(props).filter(([key]) => !MOTION_ONLY.has(key)))
      return React.createElement(tag, dom, children)
    },
}

const motionValue = (initial: unknown) => ({ get: () => initial, set: () => undefined, on: () => () => undefined })

export const motionModule = () => ({
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
})

export const stubIntersectionObserver = () => {
  window.IntersectionObserver = jest.fn().mockReturnValue({
    observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
  }) as unknown as typeof IntersectionObserver
}
