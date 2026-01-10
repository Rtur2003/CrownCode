/**
 * useSearch Hook
 * Kullanım: Global search functionality
 * Bağımlılıklar: useLanguage
 */

import { useState, useCallback, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/router'

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

  // Define searchable items
  const searchItems: SearchItem[] = useMemo(() => [
    // Pages
    {
      id: 'home',
      title: t.search?.pages?.home || 'Home',
      href: '/',
      category: 'pages' as const
    },
    {
      id: 'ai-music',
      title: t.search?.pages?.aiMusic || 'AI Music Detection',
      href: '/ai-music-detection',
      category: 'pages' as const
    },
    {
      id: 'ml-toolkit',
      title: t.search?.pages?.mlToolkit || 'ML Toolkit',
      href: '/data-manipulation',
      category: 'pages' as const
    },
    {
      id: 'projects',
      title: t.search?.pages?.projects || 'Projects',
      href: '/#products',
      category: 'pages' as const
    },
    // Features
    {
      id: 'upload',
      title: t.search?.features?.upload || 'Upload File',
      description: 'Upload audio file for analysis',
      href: '/ai-music-detection#upload',
      category: 'features' as const
    },
    {
      id: 'url-analysis',
      title: t.search?.features?.urlAnalysis || 'URL Analysis',
      description: 'Analyze from URL',
      href: '/ai-music-detection#url',
      category: 'features' as const
    },
    {
      id: 'data-augmentation',
      title: t.search?.features?.dataAugmentation || 'Data Augmentation',
      description: 'Augment your dataset',
      href: '/data-manipulation',
      category: 'features' as const
    }
  ], [t])

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
