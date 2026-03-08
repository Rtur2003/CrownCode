/**
 * useSearch Hook
 * Kullanım: Global search functionality
 * Bağımlılıklar: useLanguage
 */

import { useState, useCallback, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/router'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'

export interface SearchItem {
  id: string
  title: string
  description?: string
  href: string
  category: 'pages' | 'features'
  icon?: string
}

export const useSearch = () => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()
  const router = useRouter()

  // Build searchable items from the product catalog + static pages/features
  const searchItems: SearchItem[] = useMemo(() => {
    const catalogItems: SearchItem[] = PRODUCT_CATALOG.map((entry) => {
      const resolved = resolveProduct(entry, t)
      return {
        id: entry.id,
        title: resolved.title,
        description: resolved.description,
        href: entry.href,
        category: 'pages' as const,
      }
    })

    const staticItems: SearchItem[] = [
      {
        id: 'home',
        title: t.search?.pages?.home || 'Home',
        href: '/',
        category: 'pages' as const,
      },
      {
        id: 'projects',
        title: t.search?.pages?.projects || 'Projects',
        href: '/#products',
        category: 'pages' as const,
      },
      {
        id: 'url-analysis',
        title: t.search?.features?.urlAnalysis || 'URL Analysis',
        description: t.search?.features?.urlAnalysisDesc || 'Analyze a YouTube link',
        href: '/ai-music-detection#url',
        category: 'features' as const,
      },
      {
        id: 'data-augmentation',
        title: t.search?.features?.dataAugmentation || 'Data Augmentation',
        description: t.search?.features?.dataAugmentationDesc || 'Augment your dataset',
        href: '/data-manipulation',
        category: 'features' as const,
      },
      {
        id: 'creator-studio',
        title: t.creatorStudio?.title || 'Creator Studio',
        description: t.creatorStudio?.subtitle || 'Audio creation tools powered by AI',
        href: '/creator-studio',
        category: 'pages' as const,
      },
      {
        id: 'analysis-history',
        title: t.analysisHistory?.title || 'Analysis History',
        description: t.analysisHistory?.subtitle || 'Your recent analysis results',
        href: '/analysis-history',
        category: 'pages' as const,
      },
      {
        id: 'system-status',
        title: t.systemStatus?.title || 'System Status',
        description: t.systemStatus?.allOperational || 'Live status of CrownCode services',
        href: '/system-status',
        category: 'pages' as const,
      },
    ]

    return [...catalogItems, ...staticItems]
  }, [t])

  // Search function
  const search = useCallback((searchQuery: string): SearchItem[] => {
    if (!searchQuery.trim()) return searchItems

    const lowercaseQuery = searchQuery.toLowerCase()

    return searchItems.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(lowercaseQuery)
      const descriptionMatch = item.description?.toLowerCase().includes(lowercaseQuery)
      return titleMatch || descriptionMatch
    })
  }, [searchItems])

  // Get filtered results
  const results = useMemo(() => search(query), [query, search])

  // Navigate to item
  const navigateToItem = useCallback((item: SearchItem) => {
    router.push(item.href)
    setIsOpen(false)
    setQuery('')
  }, [router])

  // Open/close modal
  const openSearch = useCallback(() => setIsOpen(true), [])
  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  return {
    query,
    setQuery,
    isOpen,
    openSearch,
    closeSearch,
    results,
    navigateToItem,
    searchItems
  }
}
