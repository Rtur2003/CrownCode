import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image, { getImageProps } from 'next/image'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG, resolveProduct, type ProductEntry } from '@/config/product-catalog'
import { worldLook, worldName, worldPlacement, type WorldLook, type WorldPlacement } from '@/config/showroom-worlds'
import type { AtlasState } from './Atlas/AtlasScene'
import styles from './ProjectExplorer.module.css'

// WebGL only exists in the browser and is not needed for the first paint:
// the server HTML shows a rendered poster of the same scene.
const AtlasScene = dynamic(() => import('./Atlas/AtlasScene'), { ssr: false })

/** Worlds with a rendered thumbnail (scripts/capture-atlas-assets.py). */
const RENDERED = new Set(['ai-music-detection', 'ml-toolkit', 'crown-fortune', 'crown-dreams', 'crown-commend', 'crown-vote', 'noir-grain', 'kognita'])

/** Scroll distance between two stops, in viewport heights. */
const HOP = 1.1

type World = ProductEntry & ReturnType<typeof resolveProduct> & {
  name: string
  image: string
  look: WorldLook
  placement: WorldPlacement
}

const pad = (n: number) => String(n).padStart(2, '0')
const external = (href: string) => href.startsWith('https:')
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function ProjectExplorer() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const en = language === 'en'
  const reducedMotion = Boolean(useReducedMotion())

  const worlds: World[] = useMemo(() => PRODUCT_CATALOG.map((entry, index) => {
    const localized = resolveProduct(entry, t)
    const name = worldName(entry, localized.title)
    return {
      ...entry,
      ...localized,
      name,
      image: RENDERED.has(entry.id) ? `/images/atlas/world-${entry.id}.webp` : '/images/showroom/planet-generic.webp',
      look: worldLook(entry),
      placement: worldPlacement(index),
    }
  }), [t])
  const sceneWorlds = useMemo(() => worlds.map(({ id, look, placement }) => ({ id, look, placement })), [worlds])
  const count = worlds.length
  const stations = count + 2 // intro, one per world, outro

  const atlasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const labelRefs = useRef<(HTMLElement | null)[]>([])
  const stationRef = useRef(0)
  const exitRef = useRef(0)
  const atlas = useRef<AtlasState>({ target: 0, exit: 0, highlight: -1, warp: 0, pointer: { x: 0, y: 0 }, time: 0 })

  const [station, setStation] = useState(0)
  const [inView, setInView] = useState(true)
  const [canRender, setCanRender] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [capture, setCapture] = useState(false)

  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ['start start', 'end end'] })
  // 0 while the list is below the fold, 1 once it has risen over the atlas.
  const { scrollYProgress: exitProgress } = useScroll({ target: indexRef, offset: ['start end', 'start 0.25'] })

  const applyProgress = useCallback((value: number) => {
    atlas.current.target = value
    const s = value * (stations - 1)
    const nearest = Math.round(s)
    if (stationRef.current !== nearest) {
      stationRef.current = nearest
      setStation(nearest)
    }
    // Copy fades between stops and settles while the camera dwells.
    const dwell = 1 - smoothstep(0.14, 0.38, Math.abs(s - nearest))
    panelRef.current?.style.setProperty('--dwell', dwell.toFixed(3))
    panelRef.current?.toggleAttribute('data-passing', dwell < 0.35)
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, (s - 0.5) / count)).toFixed(4)})`
    }
  }, [stations, count])

  const applyExit = useCallback((value: number) => {
    const exit = smoothstep(0, 1, value)
    exitRef.current = exit
    atlas.current.exit = exit
    stageRef.current?.style.setProperty('--exit', exit.toFixed(3))
    stageRef.current?.toggleAttribute('data-exited', exit > 0.6)
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', applyProgress)
  useMotionValueEvent(exitProgress, 'change', applyExit)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isCapture = params.has('atlas-capture')
    // Deterministic hooks for recording the promo video frame by frame.
    if (isCapture) {(window as unknown as { __atlas: AtlasState }).__atlas = atlas.current}
    setCapture(isCapture)
    setCanRender(!reducedMotion && hasWebGL())
    applyProgress(scrollYProgress.get())
    applyExit(exitProgress.get())
  }, [reducedMotion, applyProgress, applyExit, scrollYProgress, exitProgress])

  // The scene keeps rendering behind the list, so observe the whole atlas.
  useEffect(() => {
    const el = atlasRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {return}
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((target: number) => {
    const next = Math.max(0, Math.min(stations - 1, target))
    if (reducedMotion) {
      const world = worlds[next - 1]
      document.getElementById(world ? `project-${world.id}` : 'project-index')?.scrollIntoView({ behavior: 'instant' })
      return
    }
    const journey = journeyRef.current
    if (!journey) {return}
    const top = journey.getBoundingClientRect().top + window.scrollY
    const distance = journey.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (next / (stations - 1)) * distance, behavior: 'smooth' })
  }, [stations, reducedMotion, worlds])

  // /#world-<id> (used by the route badge on project pages) opens the
  // atlas at that world instead of the intro.
  useEffect(() => {
    const match = window.location.hash.match(/^#world-(.+)$/)
    const index = match ? worlds.findIndex((w) => w.id === decodeURIComponent(match[1])) : -1
    if (index < 0 || !journeyRef.current) {return}
    const journey = journeyRef.current
    const top = journey.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + ((index + 1) / (stations - 1)) * (journey.offsetHeight - window.innerHeight), behavior: 'instant' })
    // Only on first load: a later hash change is regular in-page navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // "Enter world": the camera dives into the planet and the stage floods
  // with the world's colour before the project page loads.
  const enterWorld = (href: string, color: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || external(href) || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {return}
    e.preventDefault()
    atlas.current.warp = performance.now()
    stageRef.current?.style.setProperty('--warp-color', color)
    stageRef.current?.setAttribute('data-warp', '')
    window.setTimeout(() => { void router.push(href) }, 720)
  }

  // ← / → move between worlds like a level-select screen.
  useEffect(() => {
    if (!inView) {return}
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (exitRef.current > 0.5 || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey
        || el?.closest('input, textarea, select, [contenteditable="true"]')) {return}
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(stationRef.current + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(stationRef.current - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inView, goTo])

  const highlight = (index: number) => () => { atlas.current.highlight = index }
  const clearHighlight = () => { atlas.current.highlight = -1 }

  const world = station >= 1 && station <= count ? worlds[station - 1] : null
  const trackStyle = { '--journey-height': `${(stations - 1) * HOP * 100 + 100}svh`, '--stations': stations - 1 } as CSSProperties

  const { props: { srcSet: portraitSrcSet } } = getImageProps({ src: '/images/atlas/poster-portrait.webp', alt: '', width: 1080, height: 1920, sizes: '100vw' })
  const { props: posterProps } = getImageProps({ src: '/images/atlas/poster.webp', alt: '', width: 1920, height: 1080, sizes: '100vw', preload: true })

  return (
    <div className={styles.home}>
      {/* One space: the stage stays pinned while the journey track scrolls
          under it, and the project list then rises over the same scene. */}
      <div ref={atlasRef} className={styles.atlas} data-reduced={reducedMotion ? '' : undefined}>
        <section ref={stageRef} className={styles.stage} aria-labelledby="showroom-title">
          <picture className={`${styles.poster} ${sceneReady ? styles.posterHidden : ''}`}>
            <source media="(max-aspect-ratio: 4/5)" srcSet={portraitSrcSet} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- props come from getImageProps (art direction) */}
            <img {...posterProps} />
          </picture>
          {canRender && (
            <div className={`${styles.canvas} ${sceneReady ? styles.canvasReady : ''}`}>
              <AtlasScene worlds={sceneWorlds} state={atlas} labels={labelRefs} active={inView} capture={capture}
                onReady={() => setSceneReady(true)} />
            </div>
          )}
          <div className={styles.scrim} aria-hidden="true" />

          {canRender && (
            <div className={styles.labels} aria-hidden="true">
              {worlds.map((w, i) => (
                <button key={w.id} type="button" tabIndex={-1} className={styles.worldLabel}
                  ref={(el) => { labelRefs.current[i] = el }} onClick={() => goTo(i + 1)}
                  style={{ '--world': w.look.accent } as CSSProperties}>
                  <span>{pad(i + 1)}</span>{w.name}
                </button>
              ))}
            </div>
          )}

          <div className={styles.hud}>
            <div ref={panelRef} className={styles.panel}>
              {station === 0 || reducedMotion ? (
                <div key="intro" className={styles.copy}>
                  <p className={styles.eyebrow}>{en ? `Atlas · ${count} worlds` : `Atlas · ${count} dünya`}</p>
                  <h1 id="showroom-title">CrownCode</h1>
                  <p className={styles.lead}>{en ? 'Independent work across sound, data and the web, laid out as worlds you can travel between.' : 'Ses, veri ve web üzerine bağımsız işler; aralarında gezebileceğin dünyalar olarak.'}</p>
                  <div className={styles.actions}>
                    <button type="button" className={styles.primary} onClick={() => goTo(1)}>
                      {en ? 'Enter the atlas' : 'Atlas’a gir'} <ArrowDown size={18} />
                    </button>
                    <a href="#project-index" className={styles.secondary}>{en ? 'All projects' : 'Tüm projeler'}</a>
                  </div>
                </div>
              ) : world ? (
                <article key={world.id} className={styles.copy} style={{ '--world': world.look.accent } as CSSProperties}>
                  <p className={styles.eyebrow}>
                    <span className={styles.worldIndex}>{pad(station)} / {pad(count)}</span>
                    <span>{en ? world.look.sector.en : world.look.sector.tr}</span>
                  </p>
                  <h2>{world.name}</h2>
                  <p className={styles.lead}>{world.showroomDescription}</p>
                  {world.features.length > 0 && (
                    <ul className={styles.features}>{world.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul>
                  )}
                  <div className={styles.actions}>
                    <Link href={world.href} className={styles.primary} onClick={enterWorld(world.href, world.look.accent)}
                      target={external(world.href) ? '_blank' : undefined} rel={external(world.href) ? 'noreferrer' : undefined}>
                      {en ? 'Enter world' : 'Dünyaya gir'} <ArrowUpRight size={18} />
                    </Link>
                    <span className={styles.status}>{world.status}</span>
                  </div>
                </article>
              ) : (
                <div key="outro" className={styles.copy}>
                  <p className={styles.eyebrow}>{en ? 'Atlas · end of route' : 'Atlas · rotanın sonu'}</p>
                  <h2>{en ? `${count} worlds, one route.` : `${count} dünya, tek rota.`}</h2>
                  <p className={styles.lead}>{en ? 'Keep scrolling: the log of every world is right below.' : 'Kaydırmaya devam et: her dünyanın seyir kaydı hemen aşağıda.'}</p>
                  <div className={styles.actions}>
                    <a href="#project-index" className={styles.primary}>{en ? 'Open the log' : 'Seyir defterini aç'} <ArrowDown size={18} /></a>
                  </div>
                </div>
              )}
            </div>

            <nav className={styles.strip} aria-label={en ? 'Choose a world' : 'Dünya seç'}>
              <button type="button" className={styles.step} onClick={() => goTo(station - 1)} disabled={station === 0}
                aria-label={en ? 'Previous world' : 'Önceki dünya'}>
                <ArrowLeft size={18} />
              </button>
              <ol className={styles.track} style={{ '--count': count } as CSSProperties}>
                <span className={styles.trackLine} aria-hidden="true"><span ref={fillRef} className={styles.trackFill} /></span>
                {worlds.map((w, i) => (
                  <li key={w.id}>
                    <button type="button" onClick={() => goTo(i + 1)} aria-current={station === i + 1 ? 'step' : undefined}
                      style={{ '--world': w.look.accent } as CSSProperties}>
                      <span className={styles.node} aria-hidden="true" />
                      <span className={styles.nodeLabel}><span aria-hidden="true">{pad(i + 1)}</span> {w.name}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" className={styles.step} onClick={() => goTo(station + 1)} disabled={station === stations - 1}
                aria-label={en ? 'Next world' : 'Sonraki dünya'}>
                <ArrowRight size={18} />
              </button>
              <p className={styles.hint} aria-hidden="true">{en ? 'Scroll or use ← →' : 'Kaydır ya da ← → kullan'}</p>
            </nav>
          </div>
          <div className={styles.dim} aria-hidden="true" />
          <div className={styles.warp} aria-hidden="true" />
          <p className={styles.srOnly} aria-live="polite">{world ? `${world.name}: ${world.showroomDescription}` : ''}</p>
        </section>

        {/* The scroll track the camera flight is mapped to. */}
        <div id="products" ref={journeyRef} className={styles.journey} style={trackStyle} aria-hidden="true">
          {Array.from({ length: stations }, (_, k) => (
            <span key={k} className={styles.snap} style={{ '--k': k } as CSSProperties} />
          ))}
        </div>

        <section id="project-index" ref={indexRef} className={styles.index} aria-labelledby="project-index-title">
          <div className={styles.indexLead}>
            <p className={styles.eyebrow}>{en ? 'Atlas · log' : 'Atlas · seyir defteri'}</p>
            <h2 id="project-index-title">{en ? 'Every world, in order.' : 'Bütün dünyalar, sırayla.'}</h2>
            <p>{en ? 'The same route as a list. Hover a world to find it on the map.' : 'Aynı rota, liste olarak. Bir dünyanın üzerine gel, haritada yerini gör.'}</p>
          </div>
          <ol className={styles.indexList}>
            {worlds.map((w, index) => (
              <li key={w.id}>
                <Link id={`project-${w.id}`} href={w.href}
                  target={external(w.href) ? '_blank' : undefined} rel={external(w.href) ? 'noreferrer' : undefined}
                  style={{ '--world': w.look.accent } as CSSProperties}
                  onPointerEnter={highlight(index)} onPointerLeave={clearHighlight}
                  onFocus={highlight(index)} onBlur={clearHighlight}>
                  <span className={styles.indexNumber} aria-hidden="true">{pad(index + 1)}</span>
                  <span className={styles.indexImage}><Image src={w.image} alt="" fill sizes="(max-width: 700px) 54px, 160px" /></span>
                  <span className={styles.indexCopy}>
                    <span className={styles.indexSector}>{en ? w.look.sector.en : w.look.sector.tr} · {w.status}</span>
                    <strong>{w.name}</strong>
                    <span>{w.showroomDescription}</span>
                  </span>
                  <ArrowUpRight size={20} />
                </Link>
              </li>
            ))}
          </ol>
          <div id="studio-end" className={styles.musicBridge}>
            <p>{en ? 'The music lives next door.' : 'Müzik de yan tarafta.'}</p>
            <a href="https://hasan-arthur-altuntas.com.tr" target="_blank" rel="noreferrer">
              {en ? 'Listen to Hasan Arthur Altuntaş' : 'Hasan Arthur Altuntaş’ı dinle'} <ArrowUpRight size={26} />
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
