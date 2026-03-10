import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { History, Music, FileAudio, Trash2 } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { useLocalHistory, HISTORY_KEYS } from '@/hooks/useLocalHistory'
import type { AnalysisResult } from '@/hooks/analysisTypes'

import styles from '@/styles/pages/analysis-history.module.css'

const AnalysisHistoryPage: NextPage = () => {
  const { t } = useLanguage()
  const ah = t.analysisHistory
  const { lastEntry, remove } = useLocalHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS)

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

        {lastEntry ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles['entry-card']}
          >
            <div className={styles['entry-header']}>
              <div className={styles['entry-input']}>
                {lastEntry.input.includes('http') ? <Music size={18} className={styles['entry-icon']} /> : <FileAudio size={18} className={styles['entry-icon']} />}
                <span className={styles['entry-input-text']}>{lastEntry.input}</span>
              </div>
              <button
                onClick={remove}
                className={styles['delete-btn']}
                title={ah.delete}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className={styles['entry-date']}>
              {new Date(lastEntry.timestamp).toLocaleString()}
            </div>
            {lastEntry.result && (
              <div className={styles['entry-result']}>
                <pre>
                  {JSON.stringify(lastEntry.result, null, 2).slice(0, 500)}
                  {JSON.stringify(lastEntry.result).length > 500 ? '...' : ''}
                </pre>
              </div>
            )}
          </motion.div>
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
