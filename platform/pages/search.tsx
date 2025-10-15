import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Search as SearchIcon, ExternalLink, Music, Database } from 'lucide-react'
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
  const { language } = useLanguage()
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<SearchResult[]>([])

  // All searchable content
  const searchableContent: SearchResult[] = useMemo(() => [
    {
      title: language === 'tr' ? 'AI Müzik Tespiti' : 'AI Music Detection',
      description: language === 'tr'
        ? 'Yapay zeka ile üretilmiş müziği tespit etme platformu. Demo arayüzü ile analiz yapın.'
        : 'AI-generated music detection platform. Analyze with demo interface.',
      url: '/ai-music-detection',
      type: 'project',
      icon: <Music size={20} />
    },
    {
      title: language === 'tr' ? 'Veri Manipülasyonu & ML Toolkit' : 'Data Manipulation & ML Toolkit',
      description: language === 'tr'
        ? 'Makine öğrenimi için veri hazırlama araçları. Görüntü ve ses verisi manipülasyonu.'
        : 'Data preparation tools for machine learning. Image and audio data manipulation.',
      url: '/data-manipulation',
      type: 'project',
      icon: <Database size={20} />
    },
    {
      title: 'CrownCode Platform',
      description: language === 'tr'
        ? 'Açık kaynak proje sergisi ve demo uygulamalar platformu.'
        : 'Open-source project showcase and demo applications platform.',
      url: '/',
      type: 'page',
      icon: <ExternalLink size={20} />
    }
  ], [language])

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

  // Get query from URL
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
      title={`${language === 'tr' ? 'Arama' : 'Search'}: ${query || ''} - CrownCode`}
      description={language === 'tr'
        ? 'CrownCode platformunda proje ve içerik arama.'
        : 'Search projects and content on CrownCode platform.'}
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
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {language === 'tr' ? 'Arama' : 'Search'}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem'
          }}>
            {language === 'tr'
              ? 'CrownCode platformunda proje ve içerik arayın'
              : 'Search for projects and content on CrownCode platform'}
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
            background: 'var(--card-bg)',
            padding: '0.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <SearchIcon
              size={24}
              style={{
                margin: 'auto 0.5rem',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'tr' ? 'Ara...' : 'Search...'}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1.1rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {language === 'tr' ? 'Ara' : 'Search'}
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
              color: 'var(--text-primary)'
            }}>
              {results.length > 0
                ? language === 'tr'
                  ? `${results.length} sonuç bulundu`
                  : `Found ${results.length} result${results.length !== 1 ? 's' : ''}`
                : language === 'tr'
                  ? 'Sonuç bulunamadı'
                  : 'No results found'}
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
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fbbf24'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(251, 191, 36, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#fbbf24' }}>{result.icon}</span>
                        <h3 style={{
                          fontSize: '1.25rem',
                          color: 'var(--text-primary)',
                          margin: 0
                        }}>
                          {result.title}
                        </h3>
                        <span style={{
                          marginLeft: 'auto',
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(251, 191, 36, 0.1)',
                          color: '#fbbf24',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {result.type}
                        </span>
                      </div>
                      <p style={{
                        color: 'var(--text-secondary)',
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
              color: 'var(--text-secondary)'
            }}
          >
            <SearchIcon size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem' }}>
              {language === 'tr'
                ? 'Aramaya başlamak için yukarıdaki alana bir şeyler yazın'
                : 'Start typing in the search box above to find projects and content'}
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

export default SearchPage
