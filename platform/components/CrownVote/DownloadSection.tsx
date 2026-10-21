import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { fetchWithTimeout, isCallerAbort } from '@/hooks/useAsyncRequest'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/crown-vote.module.css'

const REPO_URL = 'https://github.com/Rtur2003/VOTRYX'
const RELEASES_URL = `${REPO_URL}/releases`
const RELEASES_API = 'https://api.github.com/repos/Rtur2003/VOTRYX/releases?per_page=5'

interface ReleaseInfo {
  version: string
  downloadUrl: string
  size: string | null
  date: string | null
}

interface GitHubRelease {
  tag_name?: string
  html_url: string
  draft: boolean
  published_at?: string
  assets?: { name: string; size: number; browser_download_url: string }[]
}

/** The installer link comes from the newest published release; if GitHub can't be reached it falls back to the releases page. */
export const DownloadSection: React.FC = () => {
  const { t, language } = useLanguage()
  const D = t.crownVote.download
  const I = t.crownVote.installation
  const [release, setRelease] = useState<ReleaseInfo | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        // /releases/latest skips pre-releases and VOTRYX only has one, so read the list.
        const res = await fetchWithTimeout(RELEASES_API, { timeout: 10_000, signal: controller.signal })
        if (!res.ok) {throw new Error(`GitHub answered ${res.status}`)}
        const releases = (await res.json()) as GitHubRelease[]
        const newest = releases.find(r => !r.draft)
        if (!newest) {throw new Error('No published release')}
        const exe = newest.assets?.find(a => a.name.endsWith('.exe'))
        const published = newest.published_at ? new Date(newest.published_at) : null
        setRelease({
          version: newest.tag_name || '',
          downloadUrl: exe?.browser_download_url || newest.html_url,
          size: exe ? `${(exe.size / 1024 / 1024).toFixed(1)} MB` : null,
          date: published && !Number.isNaN(published.getTime())
            ? published.toLocaleDateString(language === 'en' ? 'en-GB' : 'tr-TR', { dateStyle: 'medium' })
            : null,
        })
      } catch (err) {
        if (!isCallerAbort(err, controller.signal)) {setFailed(true)}
      }
    }

    void load()
    return () => controller.abort()
  }, [language])

  const facts = release ? [
    release.version && `${D.version} ${release.version}`,
    release.size && `${D.size} ${release.size}`,
    release.date && `${D.date} ${release.date}`,
  ].filter(Boolean) : []

  return (
    <div>
      {facts.length > 0 && <p className={styles.release}>{facts.join(' · ')}</p>}

      <div className={world.actions}>
        <a className={world.primary} href={release?.downloadUrl ?? RELEASES_URL} target="_blank" rel="noopener noreferrer">
          {D.button}
        </a>
        <a className={world.link} href={REPO_URL} target="_blank" rel="noopener noreferrer">{t.crownVote.github.button}</a>
      </div>
      {failed && <p className={world.hint}>{D.loadFailed}</p>}

      <h3 className={`${world.readingLabel} ${styles.subhead}`}>{D.requirements.title}</h3>
      <ul className={styles.plain}>
        {D.requirements.items.map((item: string) => <li key={item}>{item}</li>)}
      </ul>

      <h3 className={`${world.readingLabel} ${styles.subhead}`}>{I.title}</h3>
      <ol className={styles.steps}>
        {I.steps.map((step: { title: string; description: string }) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <span>{step.description}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
