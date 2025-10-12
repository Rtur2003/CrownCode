/**
 * Performance Monitor Hook
 * Kullanım: Sayfa performansını izlemek için
 * Bağımlılıklar: Web Performance API
 */

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const observePerformance = () => {
      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart
        }))
      }

      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        setMetrics(prev => ({
          ...prev,
          fcp: fcpEntry.startTime
        }))
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            setMetrics(prev => ({
              ...prev,
              lcp: lastEntry.startTime
            }))
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              setMetrics(prev => ({
                ...prev,
                fid: entry.processingStart - entry.startTime
              }))
            })
          })
          fidObserver.observe({ entryTypes: ['first-input'] })

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            })
            setMetrics(prev => ({
              ...prev,
              cls: clsValue
            }))
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })

          // Cleanup observers after page load
          window.addEventListener('load', () => {
            setTimeout(() => {
              lcpObserver.disconnect()
              fidObserver.disconnect()
              clsObserver.disconnect()
              setIsLoading(false)
            }, 5000)
          })
        } catch (error) {
          console.warn('Performance monitoring not supported:', error)
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    // Start monitoring after DOM is ready
    if (document.readyState === 'complete') {
      observePerformance()
    } else {
      window.addEventListener('load', observePerformance)
    }

    return () => {
      window.removeEventListener('load', observePerformance)
    }
  }, [])

  const getScore = (metric: keyof PerformanceMetrics): 'good' | 'needs-improvement' | 'poor' | null => {
    const value = metrics[metric]
    if (value === undefined) { return null }

    switch (metric) {
      case 'fcp':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
      case 'ttfb':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
      default:
        return null
    }
  }

  return { metrics, isLoading, getScore }
}

export default usePerformanceMonitor