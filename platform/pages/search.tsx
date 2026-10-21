import React, { useState, useMemo } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import { buildSearchItems } from '@/hooks/useSearch'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/search.module.css'

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

  const items = useMemo(() => buildSearchItems(t), [t])

  const results = useMemo(() => {
    const needle = urlQuery.trim().toLocaleLowerCase()
    if (!needle) {return []}
    return items.filter(item =>
      item.title.toLocaleLowerCase().includes(needle) ||
      (item.description ?? '').toLocaleLowerCase().includes(needle),
    )
  }, [urlQuery, items])

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
      <WorldPage world="kognita" planet={false} title={sp.title} lead={sp.subtitle}>
        <form role="search" onSubmit={handleSearch} className={styles.form}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={sp.placeholder}
            aria-label={sp.inputLabel}
            className={world.input}
            autoFocus
          />
          <button type="submit" className={world.primary}>{sp.button}</button>
        </form>

        <div aria-live="polite">
          {urlQuery ? (
            <>
              <h2 className={styles.heading}>
                {results.length > 0 ? `${results.length} ${sp.resultsFound}` : sp.noResults}
              </h2>
              <ul className={styles.results}>
                {results.map(result => (
                  <li key={result.href}>
                    <Link href={result.href} className={styles.result}>
                      <span className={styles.title}>{result.title}</span>
                      <span className={styles.badge}>{sp.badges[result.category]}</span>
                      {result.description && <span className={styles.description}>{result.description}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={world.hint}>{sp.emptyState}</p>
          )}
        </div>
      </WorldPage>
    </MainLayout>
  )
}

export default SearchPage
