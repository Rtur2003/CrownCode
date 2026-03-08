import React, { useState, useEffect } from 'react'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'
import { motion } from 'framer-motion'
import { Download, Monitor, CheckCircle, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-vote.module.css'

interface ReleaseInfo {
  version: string
  downloadUrl: string
  size: string
  date: string
}

export const DownloadSection: React.FC = () => {
  const { t } = useLanguage()
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await fetchWithTimeout('https://api.github.com/repos/Rtur2003/VOTRYX/releases/latest', { timeout: 10_000 })
        if (res.ok) {
          const data = await res.json()
          const exeAsset = data.assets?.find((a: { name: string }) => a.name.endsWith('.exe'))

          setReleaseInfo({
            version: data.tag_name || 'v1.0.0',
            downloadUrl: exeAsset?.browser_download_url || data.html_url,
            size: exeAsset ? `${(exeAsset.size / 1024 / 1024).toFixed(1)} MB` : 'N/A',
            date: new Date(data.published_at).toLocaleDateString(),
          })
        }
      } catch (error) {
        console.error('Failed to fetch release info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelease()
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
            <span>
              {downloadText?.size || 'Size'}: {releaseInfo.size}
            </span>
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
