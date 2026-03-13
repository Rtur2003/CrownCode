'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Search as SearchIcon, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { buildSearchItems } from '@/hooks/useSearch'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from '@/styles/pages/search.module.css'

interface SearchResult {
  title: string
  description: string
  url: string
  type: 'product' | 'feature' | 'page'
  icon: React.ReactNode
}

const SearchPage: NextPage = () => {
  const router = useRouter()
  const { t } = useLanguage()
  const sp = t.searchPage
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<SearchResult[]>([])

  const searchableContent: SearchResult[] = useMemo(() => {
    return buildSearchItems(t).map((item) => ({
      title: item.title,
      description: item.description || '',
      url: item.href,
      type: item.category,
      icon: <ExternalLink size={20} />,
    }))
  }, [t])

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const lowercaseQuery = searchQuery.toLowerCase()
    const filtered = searchableContent.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    )

    setResults(filtered)
  }, [searchableContent])

  useEffect(() => {
    const urlQuery = router.query.q as string
    if (urlQuery) {
      setQuery(urlQuery)
      performSearch(urlQuery)
    }
  }, [router.query.q, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true })
      performSearch(query)
    }
  }

  return (
    <MainLayout
      title={`${sp.meta.title}: ${query || ''} - CrownCode`}
      description={sp.meta.description}
      keywords={t.searchMeta?.keywords || 'search, projects'}
    >
      <div className={styles['search-page']}>
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles['search-header']}
        >
          <h1 className={styles['search-title']}>
            {sp.title}
          </h1>
          <p className={styles['search-subtitle']}>
            {sp.subtitle}
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSearch}
          className={styles['search-form']}
        >
          <div className={styles['search-bar']}>
            <SearchIcon size={24} className={styles['search-icon']} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={sp.placeholder}
              className={styles['search-input']}
            />
            <button type="submit" className={styles['search-button']}>
              {sp.button}
            </button>
          </div>
        </motion.form>

        {/* Results */}
        {query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className={styles['results-heading']}>
              {results.length > 0
                ? `${results.length} ${sp.resultsFound}`
                : sp.noResults}
            </h2>

            <div className={styles['results-list']}>
              {results.map((result, index) => (
                <motion.div
                  key={result.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={result.url} className={styles['result-link']}>
                    <div className={styles['result-card']}>
                      <div className={styles['result-header']}>
                        <span className={styles['result-icon']}>{result.icon}</span>
                        <h3 className={styles['result-title']}>
                          {result.title}
                        </h3>
                        <span className={styles['result-badge']}>
                          {sp.badges[result.type]}
                        </span>
                      </div>
                      <p className={styles['result-description']}>
                        {result.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={styles['empty-state']}
          >
            <SearchIcon size={64} className={styles['empty-icon']} />
            <p className={styles['empty-text']}>
              {sp.emptyState}
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

export default SearchPage
