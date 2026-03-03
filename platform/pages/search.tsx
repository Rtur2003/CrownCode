'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Search as SearchIcon, ExternalLink, Music, Database, Sparkles, Moon, MessageSquare, Vote } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface SearchResult {
  title: string
  description: string
  url: string
  type: 'project' | 'page'
  icon: React.ReactNode
}

const SearchPage: NextPage = () => {
  const router = useRouter()
  const { t } = useLanguage()
  const sp = t.searchPage
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<SearchResult[]>([])

  const items = t.products.items
  const searchableContent: SearchResult[] = useMemo(() => [
    {
      title: items.aiMusic.title,
      description: items.aiMusic.description,
      url: '/ai-music-detection',
      type: 'project',
      icon: <Music size={20} />
    },
    {
      title: items.mlToolkit.title,
      description: items.mlToolkit.description,
      url: '/data-manipulation',
      type: 'project',
      icon: <Database size={20} />
    },
    {
      title: items.fortune.title,
      description: items.fortune.description,
      url: '/crown-fortune',
      type: 'project',
      icon: <Sparkles size={20} />
    },
    {
      title: items.dreams.title,
      description: items.dreams.description,
      url: '/crown-dreams',
      type: 'project',
      icon: <Moon size={20} />
    },
    {
      title: items.commend.title,
      description: items.commend.description,
      url: '/crown-commend',
      type: 'project',
      icon: <MessageSquare size={20} />
    },
    {
      title: items.vote.title,
      description: items.vote.description,
      url: '/crown-vote',
      type: 'project',
      icon: <Vote size={20} />
    },
    {
      title: 'CrownCode Platform',
      description: t.hero.subtitle,
      url: '/',
      type: 'page',
      icon: <ExternalLink size={20} />
    }
  ], [items, t.hero.subtitle])

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
      keywords="search, arama, projeler, AI music detection, data manipulation"
    >
      <div style={{
        minHeight: '80vh',
        padding: '4rem 2rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '3rem', textAlign: 'center' }}
        >
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '1rem',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {sp.title}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '2rem'
          }}>
            {sp.subtitle}
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSearch}
          style={{ marginBottom: '3rem' }}
        >
          <div style={{
            display: 'flex',
            gap: '1rem',
            background: 'var(--glass-bg)',
            padding: '0.5rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <SearchIcon
              size={24}
              style={{
                margin: 'auto 0.5rem',
                color: 'var(--color-text-secondary)'
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={sp.placeholder}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1.1rem',
                color: 'var(--color-text-primary)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '1rem 2rem',
                background: 'var(--gradient-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
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
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              color: 'var(--color-text-primary)'
            }}>
              {results.length > 0
                ? `${results.length} ${sp.resultsFound}`
                : sp.noResults}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.map((result, index) => (
                <motion.div
                  key={result.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={result.url} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '1.5rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-primary)' }}>{result.icon}</span>
                        <h3 style={{
                          fontSize: '1.25rem',
                          color: 'var(--color-text-primary)',
                          margin: 0
                        }}>
                          {result.title}
                        </h3>
                        <span style={{
                          marginLeft: 'auto',
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(231, 199, 122, 0.12)',
                          color: 'var(--color-primary)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {result.type}
                        </span>
                      </div>
                      <p style={{
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        lineHeight: 1.6
                      }}>
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
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            <SearchIcon size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem' }}>
              {sp.emptyState}
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

export default SearchPage
