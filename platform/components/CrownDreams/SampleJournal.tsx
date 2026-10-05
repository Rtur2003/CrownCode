'use client'

import React, { useId, useMemo, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { fill } from '@/components/Auris/format'
import { DREAM_TYPES, DREAM_TYPE_LABELS, SAMPLE_DREAMS, type DreamType } from '@/data/dreams'
import styles from '@/styles/pages/crown-dreams.module.css'

const EXCERPT_LENGTH = 110

const excerpt = (text: string) => (text.length <= EXCERPT_LENGTH ? text : `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`)

/** The sample entries as a numbered journal: each opens in place, nothing else on the page depends on it. */
export const SampleJournal: React.FC = () => {
  const { t, language } = useLanguage()
  const J = t.crownDreams.journal
  const D = t.crownDreams.detail
  const emotions = t.crownDreams.analyzer.emotions as Record<string, string>
  const baseId = useId()
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<DreamType | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SAMPLE_DREAMS
      .map((dream, index) => ({ dream, number: index + 1 }))
      .filter(({ dream }) => kind === 'all' || dream.type === kind)
      .filter(({ dream }) => {
        if (!q) {return true}
        const haystack = language === 'tr'
          ? [dream.title, dream.content, ...dream.symbols]
          : [dream.titleEn, dream.contentEn, ...dream.symbolsEn]
        return haystack.some(text => text.toLowerCase().includes(q))
      })
  }, [query, kind, language])

  const lucidCount = SAMPLE_DREAMS.filter(d => d.type === 'lucid').length

  return (
    <section className={styles.section} aria-labelledby="journal-title">
      <div className={styles.sectionHead}>
        <h2 id="journal-title">{J.title}</h2>
        <p>{J.note}</p>
        <p className={styles.hint}>{fill(J.count, { n: SAMPLE_DREAMS.length, lucid: lucidCount })}</p>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.tools}>
          <label htmlFor={`${baseId}-search`} className="sr-only">{J.searchLabel}</label>
          <input
            id={`${baseId}-search`}
            type="search"
            className={styles.search}
            placeholder={J.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <div className={styles.filters} role="group" aria-label={J.filterLabel}>
            {(['all', ...DREAM_TYPES] as const).map(type => (
              <button
                key={type}
                type="button"
                className={styles.filter}
                aria-pressed={kind === type}
                onClick={() => setKind(type)}
              >
                {type === 'all' ? J.filterAll : DREAM_TYPE_LABELS[type][language]}
              </button>
            ))}
          </div>
        </div>

        {entries.length === 0 ? (
          <p className={styles.empty}>{J.noDreams}</p>
        ) : (
          <ol className={styles.entries}>
            {entries.map(({ dream, number }) => {
              const open = openId === dream.id
              const panelId = `${baseId}-${dream.id}`
              const title = language === 'tr' ? dream.title : dream.titleEn
              const content = language === 'tr' ? dream.content : dream.contentEn
              const symbols = language === 'tr' ? dream.symbols : dream.symbolsEn
              return (
                <li key={dream.id} className={styles.entry} data-open={open ? 'true' : undefined}>
                  <button
                    type="button"
                    className={styles.entryHead}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : dream.id)}
                  >
                    <span className={styles.number}>{fill(J.entry, { n: String(number).padStart(2, '0') })}</span>
                    <span className={styles.entryTitle}>{title}</span>
                    <span className={styles.kind}>{DREAM_TYPE_LABELS[dream.type][language]}</span>
                  </button>

                  {!open && <p className={styles.excerpt}>{excerpt(content)}</p>}

                  <div id={panelId} className={styles.detail} hidden={!open}>
                    <p className={styles.full}>{content}</p>

                    <dl className={styles.facts}>
                      <div><dt>{D.clarity}</dt><dd>{dream.clarity} / 5</dd></div>
                      <div><dt>{D.lucidity}</dt><dd>{language === 'en' ? `${dream.lucidity}%` : `%${dream.lucidity}`}</dd></div>
                      <div><dt>{D.duration}</dt><dd>{dream.duration} {D.durationUnit}</dd></div>
                    </dl>

                    <dl className={styles.margins}>
                      <div><dt>{D.emotions}</dt><dd>{dream.emotions.map(e => emotions[e] ?? e).join(', ')}</dd></div>
                      <div><dt>{D.symbols}</dt><dd>{symbols.join(', ')}</dd></div>
                    </dl>

                    <h3 className={styles.readingLabel}>{D.reading}</h3>
                    <p className={styles.interpretation}>{language === 'tr' ? dream.reading : dream.readingEn}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}

export default SampleJournal
