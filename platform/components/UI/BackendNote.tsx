import React, { useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ensureServer } from '@/hooks/auris/server'
import { useAurisStore } from '@/hooks/auris/store'
import styles from '@/components/UI/BackendNote.module.css'

/**
 * Says so when the backend is asleep or out of reach, on any page that talks to it.
 * The free Space sleeps after a quiet spell and needs a minute or two to boot, so a
 * first request can look like a hang. Silent while the server answers; shares its
 * state with AURIS, so a server already woken there is not probed again here.
 */
export const BackendNote: React.FC = () => {
  const { t } = useLanguage()
  const N = t.backendNote
  const status = useAurisStore(s => s.server.status)

  useEffect(() => {
    void ensureServer()
  }, [])

  if (status !== 'waking' && status !== 'down') {return null}

  return (
    <p className={styles.note} role="status" data-status={status}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{status === 'waking' ? N.waking : N.down}</span>
      {status === 'down' && (
        <button type="button" className={styles.retry} onClick={() => void ensureServer()}>{N.retry}</button>
      )}
    </p>
  )
}

export default BackendNote
