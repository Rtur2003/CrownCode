import React, { type CSSProperties, type ReactNode } from 'react'
import { worldImage, worldLook } from '@/config/showroom-worlds'
import styles from '@/styles/components/world-page.module.css'

interface WorldPageProps {
  /** The project's id in the atlas (config/product-catalog.ts); its planet gives the page its colours. */
  world: string
  title: string
  lead?: string
  /** False for pages with no planet of their own (legal text, status): the title then takes the full width. */
  planet?: boolean
  /** A plain line under the title, for a date or a version. */
  meta?: string
  children: ReactNode
}

/**
 * The frame project pages share with the homepage atlas: display title, lead and
 * the project's own planet, then the page's sections. Pages that aren't worlds of
 * their own (Creator Studio, legal text) borrow a world's colours.
 */
export const WorldPage: React.FC<WorldPageProps> = ({ world, title, lead, planet = true, meta, children }) => {
  const look = worldLook({ id: world })
  const palette = {
    '--world-base': look.base,
    '--world-accent': look.accent,
    '--world-atmosphere': look.atmosphere,
  } as CSSProperties

  return (
    <div className={styles.page} data-world={world} style={palette}>
      <div className={styles.frame}>
        <header className={`${styles.hero} enter-rise`} data-bare={planet ? undefined : 'true'}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {lead && <p className={styles.lead}>{lead}</p>}
            {meta && <p className={styles.meta}>{meta}</p>}
          </div>
          {planet && (
            <div
              className={styles.planet}
              style={{ backgroundImage: `url(${worldImage(world)})` }}
              aria-hidden="true"
            />
          )}
        </header>
        {children}
      </div>
    </div>
  )
}

export default WorldPage
