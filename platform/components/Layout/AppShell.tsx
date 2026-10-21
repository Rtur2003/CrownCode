import React, { type ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useLanguage } from '@/context/LanguageContext'
import { Header } from './Header'
import { Footer } from './Footer'
import { RouteBadge } from './RouteBadge'
import { ShellContext } from './ShellContext'
import styles from './AppShell.module.css'

/** Shown only if a navigation takes longer than this, so quick ones don't flash a bar. */
const PROGRESS_DELAY_MS = 140
const PROGRESS_DONE_MS = 320

type Phase = 'idle' | 'loading' | 'done'

/** A thin bar along the top edge while the next page is on its way. */
const RouteProgress: React.FC = () => {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const phaseRef = useRef<Phase>('idle')
  const delayRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const doneRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const update = (next: Phase) => {
      phaseRef.current = next
      setPhase(next)
    }
    const start = () => {
      clearTimeout(delayRef.current)
      clearTimeout(doneRef.current)
      delayRef.current = setTimeout(() => update('loading'), PROGRESS_DELAY_MS)
    }
    const finish = () => {
      clearTimeout(delayRef.current)
      if (phaseRef.current === 'loading') {
        update('done')
        doneRef.current = setTimeout(() => update('idle'), PROGRESS_DONE_MS)
      } else {
        update('idle')
      }
    }
    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', finish)
    router.events.on('routeChangeError', finish)
    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', finish)
      router.events.off('routeChangeError', finish)
      clearTimeout(delayRef.current)
      clearTimeout(doneRef.current)
    }
  }, [router.events])

  return <div className={styles.progress} data-phase={phase} aria-hidden="true" />
}

/**
 * Header, footer and the world badge are mounted once and stay put while pages
 * change, so moving around the site only swaps the content in between. Content
 * fades in after a client-side navigation; the first load keeps the page's own
 * server-rendered entrance.
 */
export const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { language, t } = useLanguage()
  const router = useRouter()
  const [navigated, setNavigated] = useState(false)
  // Query and hash changes on one page (search, anchors) are not page changes.
  const routeKey = router.asPath.split(/[?#]/)[0]

  useEffect(() => {
    const onStart = () => setNavigated(true)
    router.events.on('routeChangeStart', onStart)
    return () => router.events.off('routeChangeStart', onStart)
  }, [router.events])

  return (
    <ShellContext.Provider value>
      <RouteProgress />
      <a href="#main-content" className="skip-link">
        {t.aria?.skipToContent ?? (language === 'tr' ? 'İçeriğe geç' : 'Skip to content')}
      </a>
      <div className="app-container">
        <Header />
        <RouteBadge />
        <main id="main-content" className="main-content" tabIndex={-1}>
          <div key={routeKey} className={navigated ? styles.pageIn : undefined}>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </ShellContext.Provider>
  )
}

export default AppShell
