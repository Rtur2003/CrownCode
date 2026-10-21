import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import { internalProjects, resolveProduct } from '@/config/product-catalog'
import { worldName } from '@/config/showroom-worlds'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/not-found.module.css'

const NotFoundPage: NextPage = () => {
  const { t } = useLanguage()
  const nf = t.notFound

  return (
    <MainLayout title={nf.meta.title} description={nf.meta.description} noIndex>
      <WorldPage world="kognita" planet={false} title="404" lead={nf.description}>
        <section className={world.section} aria-labelledby="not-found-links">
          <div className={world.sectionHead}>
            <h2 id="not-found-links">{nf.helpfulPages}</h2>
          </div>
          <div className={world.sectionBody}>
            <ul className={styles.links}>
              <li><Link href="/#products">{nf.projects}</Link></li>
              {internalProjects().map(entry => (
                <li key={entry.id}>
                  <Link href={entry.href}>{worldName(entry, resolveProduct(entry, t).title)}</Link>
                </li>
              ))}
              <li>
                <a href="https://github.com/Rtur2003?tab=repositories" target="_blank" rel="noopener noreferrer">GitHub</a>
              </li>
            </ul>
            <div className={world.actions}>
              <Link href="/" className={world.primary}>{nf.goHome}</Link>
              <button type="button" className={world.link} onClick={() => window.history.back()}>{nf.goBack}</button>
            </div>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default NotFoundPage
