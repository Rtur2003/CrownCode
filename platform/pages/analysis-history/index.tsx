// Analysis History: what AURIS has analysed for this browser. The entries live in
// localStorage on this device; nothing here is fetched from a server.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import { useLocalHistory, HISTORY_KEYS } from '@/hooks/useLocalHistory'
import type { AnalysisResult } from '@/hooks/analysisTypes'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/analysis-history.module.css'

const AnalysisHistoryPage: NextPage = () => {
  const { t, language } = useLanguage()
  const ah = t.analysisHistory
  const { entries, removeById, clear } = useLocalHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS)
  const [listRef] = useAutoAnimate<HTMLUListElement>({ duration: 200, easing: 'ease-out' })
  const [confirming, setConfirming] = useState(false)
  const dateFormat = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'tr-TR', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <MainLayout title={ah.meta.title} description={ah.meta.description} keywords={ah.meta.keywords} noIndex>
      <WorldPage world="ai-music-detection" planet={false} title={ah.title} lead={ah.subtitle}>
        {entries.length > 0 ? (
          <section className={world.section} aria-label={ah.title}>
            <div className={world.sectionHead}>
              <h2>{ah.entryCount.replace('{{count}}', String(entries.length))}</h2>
              <div className={styles.clear}>
                {confirming ? (
                  <>
                    <span>{ah.clearAllConfirm}</span>
                    <button type="button" className={world.link} onClick={() => { clear(); setConfirming(false) }}>{ah.clearAll}</button>
                    <button type="button" className={world.link} onClick={() => setConfirming(false)}>{ah.cancel}</button>
                  </>
                ) : (
                  <button type="button" className={world.link} onClick={() => setConfirming(true)}>{ah.clearAll}</button>
                )}
              </div>
            </div>

            <div className={world.sectionBody}>
              <ul ref={listRef} className={styles.entries}>
                {entries.map(entry => {
                  const result = entry.result
                  const facts: Array<[string, string]> = [
                    ...(typeof result?.confidence === 'number' ? [[ah.confidenceLabel, `${Math.round(result.confidence * 100)}%`] as [string, string]] : []),
                    ...(typeof result?.processingTime === 'number' ? [[ah.durationLabel, `${result.processingTime.toFixed(1)} s`] as [string, string]] : []),
                    ...(result?.modelVersion ? [[ah.modelLabel, result.modelVersion] as [string, string]] : []),
                  ]
                  return (
                    <li key={entry.id} className={styles.entry}>
                      <p className={styles.input}>{entry.input}</p>
                      <p className={styles.when}>{dateFormat.format(new Date(entry.timestamp))}</p>
                      {typeof result?.isAIGenerated === 'boolean' && (
                        <p className={world.interpretation}>{result.isAIGenerated ? ah.verdictAi : ah.verdictHuman}</p>
                      )}
                      {facts.length > 0 && (
                        <dl className={world.margins}>
                          {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                        </dl>
                      )}
                      <button type="button" className={`${world.link} ${styles.remove}`} onClick={() => removeById(entry.id)}>
                        {ah.delete}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        ) : (
          <section className={world.section} aria-label={ah.title}>
            <div className={world.sectionHead}>
              <h2>{ah.noHistory}</h2>
            </div>
            <div className={world.sectionBody}>
              <p className={world.interpretation}>{ah.noHistoryDesc}</p>
              <div className={world.actions}>
                <Link href="/ai-music-detection" className={world.primary}>{ah.goToAnalysis}</Link>
              </div>
            </div>
          </section>
        )}
      </WorldPage>
    </MainLayout>
  )
}

export default AnalysisHistoryPage
