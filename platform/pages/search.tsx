'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Search as SearchIcon, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { buildSearchItems } from '@/hooks/useSearch'
import Link from 'next/link'
import { motion } from 'motion/react'
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
      description: item.description ?? '',
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
      keywords={t.searchMeta?.keywords}
      noIndex
    >
      <div className={styles['search-page']}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={styles['search-header']}
        >
          <h1 className={styles['search-title']}>{sp.title}</h1>
          <p className={styles['search-subtitle']}>{sp.subtitle}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSearch}
          className={styles['search-form']}
        >
          <div className={styles['search-bar']}>
            <SearchIcon size={20} className={styles['search-icon']} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={sp.placeholder}
              className={styles['search-input']}
              autoFocus
            />
            <button type="submit" className={styles['search-button']}>
              {sp.button}
            </button>
          </div>
        </motion.form>

        {query ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <h2 className={styles['results-heading']}>
              {results.length > 0 ? `${results.length} ${sp.resultsFound}` : sp.noResults}
            </h2>

            <div className={styles['results-list']}>
              {results.map((result, index) => (
                <motion.div
                  key={result.url}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
                >
                  <Link href={result.url} className={styles['result-link']}>
                    <div className={`${styles['result-card']} ${styles[`result-card--${result.type}`]}`}>
                      <span className={styles['result-icon']}>{result.icon}</span>
                      <div className={styles['result-body']}>
                        <div className={styles['result-header']}>
                          <h3 className={styles['result-title']}>{result.title}</h3>
                          <span className={styles['result-badge']}>{sp.badges[result.type]}</span>
                        </div>
                        <p className={styles['result-description']}>{result.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={styles['empty-state']}
          >
            <SearchIcon size={40} className={styles['empty-icon']} />
            <p className={styles['empty-text']}>{sp.emptyState}</p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

export default SearchPage
