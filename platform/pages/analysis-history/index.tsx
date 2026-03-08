import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { History, Music, FileAudio, Trash2 } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { useLocalHistory, HISTORY_KEYS } from '@/hooks/useLocalHistory'
import type { AnalysisResult } from '@/hooks/analysisTypes'

const AnalysisHistoryPage: NextPage = () => {
  const { t } = useLanguage()
  const ah = t.analysisHistory
  const { lastEntry, remove } = useLocalHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS)

  return (
    <MainLayout
      title={ah?.meta?.title || 'Analysis History - CrownCode'}
      description={ah?.meta?.description || 'View your recent analysis results.'}
      keywords={ah?.meta?.keywords || 'analysis history, AI music detection, results'}
    >
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <History size={28} style={{ color: '#ff4444' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              {ah?.title || 'Analysis History'}
            </h1>
          </div>
          <p style={{ color: '#999', fontSize: '1rem', marginBottom: 32 }}>
            {ah?.subtitle || 'Your most recent analysis result is shown below. History is stored locally in your browser.'}
          </p>
        </motion.div>

        {lastEntry ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {lastEntry.input.includes('http') ? <Music size={18} style={{ color: '#ff4444' }} /> : <FileAudio size={18} style={{ color: '#ff4444' }} />}
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lastEntry.input}</span>
              </div>
              <button
                onClick={remove}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}
                title={ah?.clearBtn || 'Clear history'}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
              {new Date(lastEntry.timestamp).toLocaleString()}
            </div>
            {lastEntry.result && (
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.85rem', color: '#ccc' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
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
            style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}
          >
            <History size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p>{ah?.empty || 'No analysis history yet. Run an analysis from the AI Music Detection page to see results here.'}</p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

export default AnalysisHistoryPage
