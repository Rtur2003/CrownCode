import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'motion/react'
import { History, Music, FileAudio, Trash2 } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { useLocalHistory, HISTORY_KEYS } from '@/hooks/useLocalHistory'
import type { AnalysisResult } from '@/hooks/analysisTypes'

import styles from '@/styles/pages/analysis-history.module.css'

const AnalysisHistoryPage: NextPage = () => {
  const { t } = useLanguage()
  const ah = t.analysisHistory
  const { entries, removeById, clear } = useLocalHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS)

  return (
    <MainLayout
      title={ah.meta.title}
      description={ah.meta.description}
      keywords={ah.meta.keywords}
    >
      <div className={styles['page-container']}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles['header-row']}>
            <History size={28} className={styles['header-icon']} />
            <h1 className={styles['title']}>
              {ah.title}
            </h1>
          </div>
          <p className={styles['subtitle']}>
            {ah.subtitle}
          </p>
        </motion.div>

        {entries.length > 0 ? (
          <>
            <div className={styles['list-header']}>
              <span className={styles['entry-count']}>
                {ah.entryCount.replace('{{count}}', String(entries.length))}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(ah.clearAllConfirm)) {
                    clear()
                  }
                }}
                className={styles['clear-all-btn']}
              >
                <Trash2 size={14} />
                {ah.clearAll}
              </button>
            </div>

            <div className={styles['entries-list']}>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={styles['entry-card']}
                >
                  <div className={styles['entry-header']}>
                    <div className={styles['entry-input']}>
                      {entry.input.includes('http') ? <Music size={18} className={styles['entry-icon']} /> : <FileAudio size={18} className={styles['entry-icon']} />}
                      <span className={styles['entry-input-text']}>{entry.input}</span>
                    </div>
                    <button
                      onClick={() => removeById(entry.id)}
                      className={styles['delete-btn']}
                      title={ah.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className={styles['entry-date']}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  {entry.result && (
                    <div className={styles['entry-result']}>
                      <pre>
                        {JSON.stringify(entry.result, null, 2).slice(0, 500)}
                        {JSON.stringify(entry.result).length > 500 ? '...' : ''}
                      </pre>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles['empty-state']}
          >
            <History size={48} className={styles['empty-icon']} />
            <p>{ah.noHistory}</p>
            <p className={styles['empty-sub']}>{ah.noHistoryDesc}</p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

export default AnalysisHistoryPage
