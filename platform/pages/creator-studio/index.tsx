import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { Palette, Wand2, Layers, ArrowRight } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

const CreatorStudioPage: NextPage = () => {
  const { t } = useLanguage()
  const cs = t.creatorStudio

  const features = [
    { icon: Palette, title: cs?.features?.remix?.title || 'Audio Remix', desc: cs?.features?.remix?.desc || 'Combine and transform audio samples with AI assistance.' },
    { icon: Wand2, title: cs?.features?.generate?.title || 'AI Generate', desc: cs?.features?.generate?.desc || 'Generate new audio patterns from text prompts.' },
    { icon: Layers, title: cs?.features?.layers?.title || 'Multi-Track', desc: cs?.features?.layers?.desc || 'Layer multiple tracks and export studio-quality output.' },
  ]

  return (
    <MainLayout
      title={cs?.meta?.title || 'Creator Studio - CrownCode'}
      description={cs?.meta?.description || 'AI-assisted audio creation workspace.'}
      keywords={cs?.meta?.keywords || 'creator studio, audio, AI, remix'}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'rgba(255,68,68,0.15)', color: '#ff4444', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
            Coming Soon
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 12 }}>
            {cs?.title || 'Creator Studio'}
          </h1>
          <p style={{ color: '#999', fontSize: '1.1rem', maxWidth: 600, marginBottom: 48 }}>
            {cs?.subtitle || 'AI-assisted audio creation workspace. Remix, generate, and export — all in your browser.'}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 48 }}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}
              >
                <Icon size={28} style={{ color: '#ff4444', marginBottom: 12 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            {cs?.comingSoonNote || 'This feature is under active development. Stay tuned for updates.'}
          </p>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ff4444', marginTop: 16, fontSize: '0.9rem' }}>
            {cs?.backHome || 'Back to Home'} <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </MainLayout>
  )
}

export default CreatorStudioPage
