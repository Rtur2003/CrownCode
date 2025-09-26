/**
 * Lazy Load Hook
 * Kullanım: Komponentleri lazy loading ile yüklemek için
 * Bağımlılıklar: React.lazy, Suspense
 */

import { useState, useEffect, useRef } from 'react'

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const { threshold = 0.1, rootMargin = '100px' } = options
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true)
          setHasLoaded(true)
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, hasLoaded])

  return { elementRef, isInView, hasLoaded }
}

export default useLazyLoad