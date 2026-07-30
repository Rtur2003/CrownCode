/**
 * useSearch Hook
 * Kullanım: Global search functionality
 * Bağımlılıklar: useLanguage
 */

import { useState, useCallback, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/router'
import { PRODUCT_CATALOG, SEARCH_REGISTRY, resolveProduct, resolveKey } from '@/config/product-catalog'

export interface SearchItem {
  id: string
  title: string
  description?: string
  href: string
  category: 'product' | 'feature' | 'page'
  icon?: string
}

/**
 * Build the full searchable item list from catalog + registry.
 * No hardcoded EN fallbacks — all strings resolved from locale keys.
 * Exported so /search page can reuse the same data without duplication.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSearchItems(t: Record<string, any>): SearchItem[] {
  const catalogItems: SearchItem[] = PRODUCT_CATALOG.map((entry) => {
    const resolved = resolveProduct(entry, t)
    return {
      id: entry.id,
      title: resolved.title,
      description: resolved.description,
      href: entry.href,
      category: 'product' as const,
    }
  })

  const registryItems: SearchItem[] = SEARCH_REGISTRY.map((entry) => {
    const item: SearchItem = {
      id: entry.id,
      title: resolveKey(t, entry.titleKey),
      href: entry.href,
      category: entry.category,
    }
    if (entry.descriptionKey) {
      item.description = resolveKey(t, entry.descriptionKey)
    }
    return item
  })

  return [...catalogItems, ...registryItems]
}

export const useSearch = () => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()
  const router = useRouter()

  const searchItems: SearchItem[] = useMemo(() => buildSearchItems(t), [t])

  // Search function
  const search = useCallback((searchQuery: string): SearchItem[] => {
    if (!searchQuery.trim()) {return searchItems}

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
