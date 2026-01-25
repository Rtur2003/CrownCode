import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Download, Eye, Copy } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import styles from '@/styles/pages/crown-vote.module.css'

interface VotryxConfig {
  paths: {
    chrome: string
    driver: string
    logs: string
    config: string
  }
  target_url: string
  pause_between_votes: number
  batch_size: number
  max_errors: number
  parallel_workers: number
  headless: boolean
  timeout_seconds: number
  use_selenium_manager: boolean
  use_random_user_agent: boolean
  block_images: boolean
}

export const ConfigGenerator: React.FC = () => {
  const { t, language } = useLanguage()
  const { showToast } = useToast()

  const [config, setConfig] = useState<VotryxConfig>({
    paths: {
      chrome: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      driver: 'chromedriver.exe',
      logs: 'logs',
      config: 'config.json',
    },
    target_url: 'https://distrokid.com/spotlight/yourartist/vote/',
    pause_between_votes: 3,
    batch_size: 1,
    max_errors: 3,
    parallel_workers: 2,
    headless: true,
    timeout_seconds: 15,
    use_selenium_manager: false,
    use_random_user_agent: true,
    block_images: true,
  })

  const [showPreview, setShowPreview] = useState(false)

  const configJson = useMemo(() => {
    return JSON.stringify(config, null, 2)
  }, [config])

  const handleDownload = () => {
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'config.json'
    a.click()
    URL.revokeObjectURL(url)

    showToast({
      type: 'success',
      message: language === 'tr' ? 'config.json indirildi!' : 'config.json downloaded!',
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(configJson)
    showToast({
      type: 'success',
      message: t.toast?.success?.copied || 'Copied to clipboard',
    })
  }

  const fields = t.crownVote?.configGenerator?.fields

  return (
    <motion.div
      className={styles['config-generator']}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className={styles['config-header']}>
        <Settings size={20} />
        <h2>{t.crownVote?.configGenerator?.title || 'Configuration Generator'}</h2>
      </div>

      <p className={styles['config-description']}>
        {t.crownVote?.configGenerator?.description ||
          'Create and download your config.json file from the web'}
      </p>

      <div className={styles['config-form']}>
        <div className={styles['form-group']}>
          <label>{fields?.targetUrl || 'Target URL'}</label>
          <input
            type="url"
            value={config.target_url}
            onChange={(e) => setConfig({ ...config, target_url: e.target.value })}
            placeholder="https://distrokid.com/spotlight/.../vote/"
          />
        </div>

        <div className={styles['form-row']}>
          <div className={styles['form-group']}>
            <label>{fields?.pauseBetween || 'Pause Between Votes (seconds)'}</label>
            <input
              type="number"
              min={1}
              max={30}
              value={config.pause_between_votes}
              onChange={(e) =>
                setConfig({ ...config, pause_between_votes: parseInt(e.target.value) || 3 })
              }
            />
          </div>

          <div className={styles['form-group']}>
            <label>{fields?.parallelWorkers || 'Parallel Workers'}</label>
            <input
              type="number"
              min={1}
              max={10}
              value={config.parallel_workers}
              onChange={(e) =>
                setConfig({ ...config, parallel_workers: parseInt(e.target.value) || 2 })
              }
            />
          </div>
        </div>

        <div className={styles['form-row']}>
          <div className={styles['form-group']}>
            <label>{fields?.timeout || 'Timeout (seconds)'}</label>
            <input
              type="number"
              min={5}
              max={60}
              value={config.timeout_seconds}
              onChange={(e) =>
                setConfig({ ...config, timeout_seconds: parseInt(e.target.value) || 15 })
              }
            />
          </div>

          <div className={styles['form-group']}>
            <label>{fields?.maxErrors || 'Max Errors'}</label>
            <input
              type="number"
              min={1}
              max={20}
              value={config.max_errors}
              onChange={(e) => setConfig({ ...config, max_errors: parseInt(e.target.value) || 3 })}
            />
          </div>
        </div>

        <div className={styles['toggle-group']}>
          <label className={styles['toggle']}>
            <input
              type="checkbox"
              checked={config.headless}
              onChange={(e) => setConfig({ ...config, headless: e.target.checked })}
            />
            <span>{fields?.headless || 'Headless Mode'}</span>
          </label>

          <label className={styles['toggle']}>
            <input
              type="checkbox"
              checked={config.use_random_user_agent}
              onChange={(e) => setConfig({ ...config, use_random_user_agent: e.target.checked })}
            />
            <span>{fields?.useRandomAgent || 'Random User-Agent'}</span>
          </label>

          <label className={styles['toggle']}>
            <input
              type="checkbox"
              checked={config.block_images}
              onChange={(e) => setConfig({ ...config, block_images: e.target.checked })}
            />
            <span>{fields?.blockImages || 'Block Images'}</span>
          </label>
        </div>
      </div>

      <div className={styles['config-actions']}>
        <button className={styles['preview-btn']} onClick={() => setShowPreview(!showPreview)}>
          <Eye size={16} />
          {t.crownVote?.configGenerator?.preview || 'Preview'}
        </button>

        <button className={styles['copy-btn']} onClick={handleCopy}>
          <Copy size={16} />
          {t.crownVote?.configGenerator?.copy || 'Copy'}
        </button>

        <button className={styles['download-btn']} onClick={handleDownload}>
          <Download size={16} />
          {t.crownVote?.configGenerator?.download || 'Download File'}
        </button>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.pre
            className={styles['config-preview']}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <code>{configJson}</code>
          </motion.pre>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
