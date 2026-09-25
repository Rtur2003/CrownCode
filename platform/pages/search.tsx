'use client'

import React, { useState, useMemo } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Search as SearchIcon, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { buildSearchItems } from '@/hooks/useSearch'
import Link from 'next/link'
import { m as motion } from 'motion/react'
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
  // The URL (?q=) is the source of truth for results; the input is a draft
  // until submitted, so results don't flicker while typing.
  const urlQuery = typeof router.query.q === 'string' ? router.query.q : ''
  const [query, setQuery] = useState<string>(urlQuery)
  const [syncedUrlQuery, setSyncedUrlQuery] = useState<string>(urlQuery)
  if (urlQuery !== syncedUrlQuery) {
    setSyncedUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

  const searchableContent: SearchResult[] = useMemo(() => {
    return buildSearchItems(t).map((item) => ({
      title: item.title,
      description: item.description ?? '',
      url: item.href,
      type: item.category,
      icon: <ExternalLink size={20} />,
    }))
  }, [t])

  const results = useMemo(() => {
    const needle = urlQuery.trim().toLocaleLowerCase()
    if (!needle) {return []}
    return searchableContent.filter(item =>
      item.title.toLocaleLowerCase().includes(needle) ||
      item.description.toLocaleLowerCase().includes(needle)
    )
  }, [urlQuery, searchableContent])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, undefined, { shallow: true })
    }
  }

  return (
    <MainLayout
      title={urlQuery ? `${sp.meta.title}: ${urlQuery}` : sp.meta.title}
      description={sp.meta.description}
      keywords={t.searchMeta?.keywords}
      noIndex
    >
      <div className={styles['search-page']}>
        <div className={`${styles['search-header']} enter-rise`}>
          <h1 className={styles['search-title']}>{sp.title}</h1>
          <p className={styles['search-subtitle']}>{sp.subtitle}</p>
        </div>

        <form
          role="search"
          onSubmit={handleSearch}
          className={`${styles['search-form']} enter-rise`}
          style={{ '--enter-delay': '0.08s' } as React.CSSProperties}
        >
          <div className={styles['search-bar']}>
            <SearchIcon size={20} className={styles['search-icon']} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={sp.placeholder}
              aria-label={sp.inputLabel}
              className={styles['search-input']}
              autoFocus
            />
            <button type="submit" className={styles['search-button']}>
              {sp.button}
            </button>
          </div>
        </form>

        {urlQuery ? (
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
