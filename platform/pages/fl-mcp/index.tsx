// FL MCP: a local MCP server that lets an AI assistant control FL Studio. This page says what
// it does, gives the setup steps with copyable commands and states what it cannot do.

import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import { worldName } from '@/config/showroom-worlds'
import { useLanguage } from '@/context/LanguageContext'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/fl-mcp.module.css'

const ENTRY = PRODUCT_CATALOG.find(entry => entry.id === 'fl-mcp')
const REPO_URL = 'https://github.com/Rtur2003/FL-MCP'

const CodeBlock: React.FC<{ code: string; copy: string; copied: string }> = ({ code, copy, copied }) => {
  const { copied: done, copyToClipboard } = useCopyToClipboard()
  return (
    <div className={styles.code}>
      <pre>
        <code>{code}</code>
      </pre>
      <button type="button" className={world.link} onClick={() => void copyToClipboard(code, false)}>
        {done ? copied : copy}
      </button>
    </div>
  )
}

const FlMcpPage: NextPage = () => {
  const { t } = useLanguage()
  if (!ENTRY) {return null}
  const item = resolveProduct(ENTRY, t)
  const P = t.products.items.flMcp.page

  return (
    <MainLayout title={item.title} description={item.description} keywords={P.keywords}>
      <WorldPage world="fl-mcp" title={worldName(ENTRY, item.title)} lead={item.showroomDescription}>
        <section className={world.section} aria-labelledby="fl-mcp-about">
          <div className={world.sectionHead}>
            <h2 id="fl-mcp-about">{t.products.items.flMcp.heading}</h2>
          </div>
          <div className={world.sectionBody}>
            <p className={world.interpretation}>{item.description}</p>
            <dl className={world.margins}>
              {P.facts.map(fact => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={world.section} aria-labelledby="fl-mcp-asks">
          <div className={world.sectionHead}>
            <h2 id="fl-mcp-asks">{P.asksTitle}</h2>
            <p>{P.asksLead}</p>
          </div>
          <div className={world.sectionBody}>
            <dl className={styles.asks}>
              {P.asks.map(entry => (
                <div key={entry.ask}>
                  <dt>{`“${entry.ask}”`}</dt>
                  <dd>{entry.result}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={world.section} aria-labelledby="fl-mcp-setup">
          <div className={world.sectionHead}>
            <h2 id="fl-mcp-setup">{P.setupTitle}</h2>
            <p>{P.setupLead}</p>
          </div>
          <div className={world.sectionBody}>
            <ol className={styles.steps}>
              {P.setup.map(step => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                  {'code' in step && step.code && (
                    <CodeBlock code={step.code} copy={P.copy} copied={P.copied} />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={world.section} aria-labelledby="fl-mcp-limits">
          <div className={world.sectionHead}>
            <h2 id="fl-mcp-limits">{P.limitsTitle}</h2>
          </div>
          <div className={world.sectionBody}>
            <ul className={styles.plain}>
              {P.limits.map(limit => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={world.section} aria-labelledby="fl-mcp-source">
          <div className={world.sectionHead}>
            <h2 id="fl-mcp-source">{P.sourceTitle}</h2>
            <p>{P.sourceBody}</p>
          </div>
          <div className={world.sectionBody}>
            <div className={world.actions}>
              <a className={world.primary} href={REPO_URL} target="_blank" rel="noopener noreferrer">
                {P.sourceLink}
              </a>
            </div>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default FlMcpPage
