import React, { useId, useMemo, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/crown-vote.module.css'

type NumberKey = 'pause_between_votes' | 'parallel_workers' | 'timeout_seconds' | 'max_errors'

const NUMBER_FIELDS: { key: NumberKey; label: 'pauseBetween' | 'parallelWorkers' | 'timeout' | 'maxErrors'; min: number; max: number; fallback: number }[] = [
  { key: 'pause_between_votes', label: 'pauseBetween', min: 1, max: 30, fallback: 3 },
  { key: 'parallel_workers', label: 'parallelWorkers', min: 1, max: 10, fallback: 2 },
  { key: 'timeout_seconds', label: 'timeout', min: 5, max: 60, fallback: 15 },
  { key: 'max_errors', label: 'maxErrors', min: 1, max: 20, fallback: 3 },
]

interface FormState {
  target_url: string
  numbers: Record<NumberKey, string>
  headless: boolean
  use_random_user_agent: boolean
  block_images: boolean
}

const INITIAL: FormState = {
  target_url: 'https://distrokid.com/spotlight/yourartist/vote/',
  numbers: { pause_between_votes: '3', parallel_workers: '2', timeout_seconds: '15', max_errors: '3' },
  headless: true,
  use_random_user_agent: true,
  block_images: true,
}

/** A number field is kept as text while typing, so it can be cleared; the file always gets a value inside the allowed range. */
const clamp = (raw: string, min: number, max: number, fallback: number) => {
  const value = Number.parseInt(raw, 10)
  return Number.isNaN(value) ? fallback : Math.min(max, Math.max(min, value))
}

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

export const ConfigGenerator: React.FC = () => {
  const { t } = useLanguage()
  const { success } = useToast()
  const { copied, copyToClipboard } = useCopyToClipboard()
  const G = t.crownVote.configGenerator
  const idBase = useId()

  const [form, setForm] = useState<FormState>(INITIAL)
  const [showPreview, setShowPreview] = useState(false)

  const urlInvalid = form.target_url.trim().length > 0 && !isHttpUrl(form.target_url.trim())

  const configJson = useMemo(() => JSON.stringify({
    paths: {
      chrome: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      driver: 'chromedriver.exe',
      logs: 'logs',
      config: 'config.json',
    },
    target_url: form.target_url.trim(),
    pause_between_votes: clamp(form.numbers.pause_between_votes, 1, 30, 3),
    batch_size: 1,
    max_errors: clamp(form.numbers.max_errors, 1, 20, 3),
    parallel_workers: clamp(form.numbers.parallel_workers, 1, 10, 2),
    headless: form.headless,
    timeout_seconds: clamp(form.numbers.timeout_seconds, 5, 60, 15),
    use_selenium_manager: false,
    use_random_user_agent: form.use_random_user_agent,
    block_images: form.block_images,
  }, null, 2), [form])

  const handleDownload = () => {
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'config.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    success(G.downloaded)
  }

  const toggles: { key: 'headless' | 'use_random_user_agent' | 'block_images'; label: string }[] = [
    { key: 'headless', label: G.fields.headless },
    { key: 'use_random_user_agent', label: G.fields.useRandomAgent },
    { key: 'block_images', label: G.fields.blockImages },
  ]

  return (
    <div>
      <div className={world.field}>
        <label className={world.fieldLabel} htmlFor={`${idBase}-url`}>{G.fields.targetUrl}</label>
        <input
          id={`${idBase}-url`}
          type="url"
          inputMode="url"
          autoComplete="off"
          className={world.input}
          value={form.target_url}
          aria-invalid={urlInvalid}
          aria-describedby={urlInvalid ? `${idBase}-url-error` : undefined}
          onChange={(e) => setForm({ ...form, target_url: e.target.value })}
        />
        {urlInvalid && <p id={`${idBase}-url-error`} className={world.error}>{G.urlInvalid}</p>}
      </div>

      <div className={world.fields}>
        {NUMBER_FIELDS.map(({ key, label, min, max }) => (
          <div key={key} className={world.field}>
            <label className={world.fieldLabel} htmlFor={`${idBase}-${key}`}>{G.fields[label]}</label>
            <input
              id={`${idBase}-${key}`}
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              className={world.input}
              value={form.numbers[key]}
              onChange={(e) => setForm({ ...form, numbers: { ...form.numbers, [key]: e.target.value } })}
            />
          </div>
        ))}
      </div>

      <div className={styles.toggles}>
        {toggles.map(({ key, label }) => (
          <label key={key} className={styles.toggle}>
            <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className={world.actions}>
        <button type="button" className={world.primary} onClick={handleDownload} disabled={urlInvalid}>{G.download}</button>
        <button type="button" className={world.link} onClick={() => void copyToClipboard(configJson)} aria-live="polite">
          {copied ? G.copied : G.copy}
        </button>
        <button type="button" className={world.link} onClick={() => setShowPreview(v => !v)} aria-expanded={showPreview}>
          {G.preview}
        </button>
      </div>

      {showPreview && <pre className={styles.code}><code>{configJson}</code></pre>}
    </div>
  )
}
