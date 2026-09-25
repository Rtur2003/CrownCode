import React, { useState, useEffect } from 'react'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'
import { m as motion } from 'motion/react'
import { Download, Monitor, CheckCircle, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-vote.module.css'

interface ReleaseInfo {
  version: string
  downloadUrl: string
  size: string | null
  date: string
}

interface GitHubRelease {
  tag_name?: string
  html_url: string
  draft: boolean
  published_at: string
  assets?: { name: string; size: number; browser_download_url: string }[]
}

export const DownloadSection: React.FC = () => {
  const { t } = useLanguage()
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchRelease = async () => {
      try {
        // /releases/latest skips pre-releases (VOTRYX only has one), so take
        // the newest published release from the list instead of a 404.
        const res = await fetchWithTimeout('https://api.github.com/repos/Rtur2003/VOTRYX/releases?per_page=5', { timeout: 10_000 })
        if (res.ok) {
          const releases = (await res.json()) as GitHubRelease[]
          const data = releases.find((r) => !r.draft)
          const exeAsset = data?.assets?.find((a) => a.name.endsWith('.exe'))

          if (data && isMounted) {
            setReleaseInfo({
              version: data.tag_name || 'v1.0.0',
              downloadUrl: exeAsset?.browser_download_url || data.html_url,
              size: exeAsset ? `${(exeAsset.size / 1024 / 1024).toFixed(1)} MB` : null,
              date: new Date(data.published_at).toLocaleDateString(),
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch release info:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRelease()

    return () => {
      isMounted = false
    }
  }, [])

  const downloadText = t.crownVote?.download
  const requirementItems = downloadText?.requirements?.items || [
    'Windows 10/11',
    'Google Chrome (latest version)',
    'Internet connection',
  ]

  return (
    <motion.div
      className={styles['download-section']}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className={styles['download-card']}>
        <div className={styles['download-icon']}>
          <Monitor size={48} />
        </div>

        <h2>{downloadText?.title || 'Download Application'}</h2>
        <p>{downloadText?.description || 'Download VOTRYX installer for Windows'}</p>

        {releaseInfo && !loading && (
          <div className={styles['release-info']}>
            <span>
              {downloadText?.version || 'Version'}: {releaseInfo.version}
            </span>
            {releaseInfo.size && (
              <span>
                {downloadText?.size || 'Size'}: {releaseInfo.size}
              </span>
            )}
          </div>
        )}

        <a
          href={releaseInfo?.downloadUrl || 'https://github.com/Rtur2003/VOTRYX/releases'}
          target="_blank"
          rel="noopener noreferrer"
          className={styles['download-button']}
        >
          <Download size={20} />
          {downloadText?.button || 'Download Windows Installer'}
        </a>

        <div className={styles['requirements']}>
          <h4>{downloadText?.requirements?.title || 'System Requirements'}</h4>
          <ul>
            {requirementItems.map((item: string, i: number) => (
              <li key={i}>
                <CheckCircle size={14} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="https://github.com/Rtur2003/VOTRYX"
          target="_blank"
          rel="noopener noreferrer"
          className={styles['github-link']}
        >
          <ExternalLink size={14} />
          {t.crownVote?.github?.button || 'View on GitHub'}
        </a>
      </div>
    </motion.div>
  )
}
