import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, List, Pause, Play, Search, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import styles from './ProjectExplorer.module.css'

const worlds = [
  { id: 'ai-music-detection', name: 'AURIS', tone: '#d7a34e', texture: 'sound', ring: true },
  { id: 'ml-toolkit', name: 'ML Toolkit', tone: '#879d93', texture: 'mineral', ring: false },
  { id: 'crown-fortune', name: 'Crown Fortune', tone: '#c88551', texture: 'sand', ring: true },
  { id: 'crown-dreams', name: 'Crown Dreams', tone: '#a59aaa', texture: 'cloud', ring: false },
  { id: 'crown-commend', name: 'Crown Commend', tone: '#b9674f', texture: 'sand', ring: false },
  { id: 'crown-vote', name: 'VOTRYX', tone: '#98a47b', texture: 'mineral', ring: true },
  { id: 'noir-grain', name: 'Noir & Grain', tone: '#bfa788', texture: 'cloud', ring: false },
  { id: 'kognita', name: 'Kognita', tone: '#be9760', texture: 'sound', ring: false },
] as const

const groups = {
  all: worlds.map(world => world.id),
  sound: ['ai-music-detection', 'ml-toolkit'],
  creative: ['crown-dreams', 'crown-fortune', 'noir-grain'],
  tools: ['crown-commend', 'crown-vote', 'kognita'],
}
type Group = keyof typeof groups
const step = Math.PI * 2 / worlds.length
const wrap = (value: number) => ((value % worlds.length) + worlds.length) % worlds.length

function position(index: number, phase: number): CSSProperties {
  const angle = index * step + Math.PI / 2 + phase
  const depth = (Math.sin(angle) + 1) / 2
  return {
    left: `${50 + Math.cos(angle) * 37}%`,
    top: `${46 + Math.sin(angle) * 32}%`,
    transform: `translate(-50%, -50%) scale(${0.78 + depth * 0.3})`,
    zIndex: Math.round(depth * 10) + 2,
  }
}

export function ProjectExplorer() {
  const { t, language } = useLanguage()
  const en = language === 'en'
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [offset, setOffset] = useState(0)
  const [paused, setPaused] = useState(false)
  const [directoryOpen, setDirectoryOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<Group>('all')
  const journeyRef = useRef<HTMLElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const scrollPhase = useRef(0)
  const frozenPhase = useRef(0)
  const selected = active
  const products = worlds.map(world => {
    const entry = PRODUCT_CATALOG.find(product => product.id === world.id)
    if (!entry) {throw new Error(`Missing showroom project: ${world.id}`)}
    return { ...world, entry, ...resolveProduct(entry, t) }
  })
  const project = products[selected]
  const visible = products.filter(product =>
    (groups[group] as readonly string[]).includes(product.id) &&
    `${product.name} ${product.title} ${product.description}`.toLocaleLowerCase(language)
      .includes(query.trim().toLocaleLowerCase(language)),
  )

  useEffect(() => {
    const journey = journeyRef.current
    const orbit = orbitRef.current
    if (!journey || !orbit) {return}
    const nodes = Array.from(orbit.querySelectorAll<HTMLElement>('[data-world]'))
    let frame = 0
    const render = () => {
      frame = 0
      const rect = journey.getBoundingClientRect()
      const distance = Math.max(1, journey.offsetHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / distance))
      const motionAllowed = !reducedMotion && !paused && window.innerHeight >= 740
      const phase = motionAllowed ? progress * Math.PI * 2 : frozenPhase.current
      scrollPhase.current = phase
      if (motionAllowed) {frozenPhase.current = phase}
      const rotation = reducedMotion ? 0 : phase + offset
      nodes.forEach((node, index) => {
        const coordinates = position(index, rotation)
        Object.assign(node.style, coordinates)
      })
      journey.style.setProperty('--travel', reducedMotion ? '0' : String(phase / (Math.PI * 2)))
      if (!reducedMotion) {setActive(wrap(Math.round(-(phase + offset) / step)))}
    }
    const schedule = () => {
      if (!frame) {frame = window.requestAnimationFrame(render)}
    }
    render()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [offset, paused, reducedMotion])

  const choose = (index: number) => {
    const next = wrap(index)
    setActive(next)
    setOffset(-next * step - scrollPhase.current)
  }

  const labels: Record<Group, string> = en
    ? { all: 'All projects', sound: 'Sound & data', creative: 'Creative', tools: 'Tools' }
    : { all: 'Tüm projeler', sound: 'Ses & veri', creative: 'Yaratıcı', tools: 'Araçlar' }

  return (
    <div className={styles.home}>
      <section id="products" ref={journeyRef} className={styles.journey}
        data-paused={paused || reducedMotion ? 'true' : 'false'} aria-labelledby="studio-heading">
        <div className={styles.stage}>
          <div className={styles.cosmos} aria-hidden="true">
            <div className={styles.nebula} />
            <svg className={styles.stars} viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
              {Array.from({ length: 85 }, (_, i) => (
                <circle key={i} cx={(i * 173 + 41) % 1400} cy={(i * 113 + 67) % 900}
                  r={i % 7 === 0 ? 1.5 : 0.65} fill="#ead6b4" opacity={0.16 + (i % 5) * 0.1} />
              ))}
            </svg>
          </div>
          <div className={styles.identity}>
            <h1 id="studio-heading">CrownCode</h1>
            <p>{en ? 'A small universe of independent projects.' : 'Bağımsız projelerden küçük bir evren.'}</p>
          </div>
          <a className={styles.skip} href="#studio-end">
            {en ? 'Skip the exploration' : 'Keşfi atla'} <ArrowDown size={14} />
          </a>

          <div id="project-explorer" className={styles.orbit} ref={orbitRef} aria-label={en ? 'Project worlds' : 'Proje dünyaları'}>
            <svg className={styles.paths} viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx="500" cy="322" rx="370" ry="224" />
              <ellipse cx="500" cy="322" rx="295" ry="174" />
              <ellipse cx="500" cy="322" rx="425" ry="273" />
              <path d="M80 405 Q480 10 925 295" />
            </svg>
            <div className={styles.nucleus} aria-hidden="true">
              <div className={styles.nucleusLight} />
              <Image src="/logo-main.png" alt="" width={240} height={240} preload />
              <span>CrownCode</span>
            </div>
            {products.map((world, index) => (
              <Link key={world.id} href={world.entry.href}
                target={world.entry.href.startsWith('https://') ? '_blank' : undefined}
                rel={world.entry.href.startsWith('https://') ? 'noreferrer' : undefined}
                className={styles.world} data-world={world.id}
                data-selected={selected === index ? 'true' : 'false'}
                style={{ ...position(index, 0), '--tone': world.tone } as CSSProperties}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                aria-label={en ? `Open ${world.name}` : `${world.name} projesini aç`}>
                <span className={styles.planet} data-texture={world.texture} aria-hidden="true">
                  <span className={styles.surface} />
                  <span className={styles.shade} />
                  {world.ring && <span className={styles.planetRing} />}
                </span>
                <span className={styles.worldName}>{world.name}<ArrowUpRight size={12} /></span>
              </Link>
            ))}
          </div>

          <div className={styles.projectInfo}>
            <div className={styles.projectHeading}>
              <span className={styles.projectDot} style={{ background: project.tone }} aria-hidden="true" />
              <h2>{project.name}</h2>
            </div>
            <p>{project.description}</p>
            <Link className={styles.openProject} href={project.entry.href}
              target={project.entry.href.startsWith('https://') ? '_blank' : undefined}
              rel={project.entry.href.startsWith('https://') ? 'noreferrer' : undefined}>
              {en ? 'Explore project' : 'Projeyi keşfet'} <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className={styles.controls}>
            <div className={styles.steering} aria-label={en ? 'Choose a project' : 'Proje seç'}>
              <button type="button" onClick={() => choose(active - 1)} aria-label={en ? 'Previous project' : 'Önceki proje'}><ArrowLeft size={19} /></button>
              <span aria-live="polite" aria-atomic="true">{active + 1} / {products.length}<span className={styles.srOnly}> — {products[active].name}</span></span>
              <button type="button" onClick={() => choose(active + 1)} aria-label={en ? 'Next project' : 'Sonraki proje'}><ArrowRight size={19} /></button>
            </div>
            <p className={styles.scrollHint}><ArrowDown size={15} />{en ? 'Scroll to orbit. Choose a world to enter.' : 'Kaydır, yörüngede gezin. Bir dünya seç.'}</p>
            <div className={styles.actions}>
              {!reducedMotion && <button type="button" onClick={() => setPaused(value => !value)}
                aria-label={paused ? (en ? 'Resume motion' : 'Hareketi sürdür') : (en ? 'Pause motion' : 'Hareketi durdur')}
                aria-pressed={paused}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
              <button type="button" onClick={() => setDirectoryOpen(value => !value)} aria-expanded={directoryOpen} aria-controls="project-directory">
                {directoryOpen ? <X size={16} /> : <List size={16} />}{en ? 'Project index' : 'Proje dizini'}
              </button>
            </div>
          </div>

          {directoryOpen && <aside id="project-directory" className={styles.directory} aria-label={en ? 'Project index' : 'Proje dizini'}>
            <div className={styles.directoryTop}>
              <h2>{en ? 'Project index' : 'Proje dizini'}</h2>
              <button type="button" onClick={() => setDirectoryOpen(false)} aria-label={en ? 'Close index' : 'Dizini kapat'}><X size={20} /></button>
            </div>
            <label className={styles.search}><Search size={17} /><span className={styles.srOnly}>{en ? 'Search projects' : 'Proje ara'}</span>
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder={en ? 'Search projects…' : 'Projelerde ara…'} />
            </label>
            <div className={styles.filters}>{(Object.keys(labels) as Group[]).map(key =>
              <button type="button" key={key} aria-pressed={group === key} onClick={() => setGroup(key)}>{labels[key]}</button>)}</div>
            <p className={styles.resultCount} aria-live="polite">{visible.length} {en ? 'projects' : 'proje'}</p>
            <div className={styles.directoryLinks}>{visible.map(world =>
              <Link key={world.id} href={world.entry.href} target={world.entry.href.startsWith('https://') ? '_blank' : undefined}
                rel={world.entry.href.startsWith('https://') ? 'noreferrer' : undefined}>
                <span style={{ background: world.tone }} aria-hidden="true" />{world.name}<ArrowUpRight size={16} />
              </Link>)}</div>
            {visible.length === 0 && <div className={styles.empty}>
              <p>{en ? 'No matching projects.' : 'Eşleşen proje bulunamadı.'}</p>
              <button type="button" onClick={() => { setQuery(''); setGroup('all') }}>{en ? 'Show all projects' : 'Tüm projeleri göster'}</button>
            </div>}
          </aside>}
        </div>
      </section>
      <div id="studio-end" className={styles.exit}>
        <p>{en ? 'The same curiosity. Another medium.' : 'Aynı merak. Başka bir ifade.'}</p>
        <a href="https://hasan-arthur-altuntas.com.tr" target="_blank" rel="noreferrer">
          {en ? 'Listen to the music.' : 'Bir de müziği dinle.'}<ArrowUpRight size={26} />
        </a>
        <span>Hasan Arthur Altuntaş</span>
      </div>
    </div>
  )
}
