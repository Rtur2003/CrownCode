import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Search, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import styles from './ProjectExplorer.module.css'

const groups = {
  sound: ['ai-music-detection', 'ml-toolkit'],
  creative: ['crown-dreams', 'crown-fortune', 'noir-grain'],
  tools: ['crown-commend', 'crown-vote', 'kognita'],
} as const

type Group = 'all' | keyof typeof groups

export function ProjectExplorer() {
  const { t, language } = useLanguage()
  const en = language === 'en'
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<Group>('all')
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root || reducedMotion) {return}
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll-scene]'))
    let frame = 0
    const render = () => {
      frame = 0
      const height = window.innerHeight
      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect()
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - height)))
        const drift = Math.min(1, Math.max(-1, (height * 0.5 - rect.top) / (height + rect.height)))
        scene.style.setProperty('--progress', progress.toFixed(4))
        scene.style.setProperty('--drift', drift.toFixed(4))
      })
    }
    const schedule = () => {
      if (!frame) {frame = window.requestAnimationFrame(render)}
    }
    render()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
      scenes.forEach((scene) => {
        scene.style.removeProperty('--progress')
        scene.style.removeProperty('--drift')
      })
    }
  }, [reducedMotion])

  const labels: Record<Group, string> = en
    ? { all: 'All projects', sound: 'Sound & data', creative: 'Creative experiences', tools: 'Tools & automation' }
    : { all: 'Tüm projeler', sound: 'Ses & veri', creative: 'Yaratıcı deneyimler', tools: 'Araçlar & otomasyon' }
  const products = PRODUCT_CATALOG.map((entry) => ({ entry, ...resolveProduct(entry, t) }))
  const visible = products.filter((product) => {
    const inGroup = group === 'all' || (groups[group] as readonly string[]).includes(product.entry.id)
    return inGroup && `${product.title} ${product.description} ${product.features.join(' ')}`
      .toLocaleLowerCase(language).includes(query.trim().toLocaleLowerCase(language))
  })

  return (
    <div className={styles.root} ref={rootRef}>
      <section className={styles.entrance} data-scroll-scene aria-labelledby="studio-heading">
        <div className={styles.hero}>
          <div className={styles.heroNote}>
            <p>{en ? 'An independent software studio' : 'Bağımsız bir yazılım atölyesi'}</p>
            <span>Hasan Arthur Altuntaş</span>
          </div>
          <div className={styles.crest} aria-hidden="true">
            <Image src="/logo-main.png" alt="" width={1024} height={1024} sizes="(max-width: 700px) 100vw, 70vw" preload />
          </div>
          <div className={styles.heroIntro}>
            <p>{en ? 'Ideas you can' : 'Fikirlerin'}<br />
              {en ? 'step inside.' : 'çalışan hâli.'}</p>
            <a href="https://hasan-arthur-altuntas.com.tr" target="_blank" rel="noreferrer">
              {en ? 'Meet the music side' : 'Müzik tarafını dinle'} <ArrowUpRight size={16} />
            </a>
          </div>
          <div className={styles.wordmark}>
            <h1 id="studio-heading"><span>Crown</span><span>Code</span></h1>
            <div className={styles.heroBottom}>
              <p>{en ? 'Audio research, open-source tools and digital experiences.' : 'Ses araştırmaları, açık kaynak araçlar ve dijital deneyimler.'}</p>
              <a href="#products">{en ? 'Explore the projects' : 'Projeleri keşfet'} <ArrowDown size={17} /></a>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.audio} data-scroll-scene aria-labelledby="auris-heading">
        <div className={styles.audioMedia} aria-hidden="true">
          <Image src="/images/auris/hero-wave.webp" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.audioHeading}>
          <h2 id="auris-heading">AURIS</h2>
        </div>
        <div className={styles.audioDetail}>
          <p>{en ? 'What does a recording reveal?' : 'Bir kayıt neler anlatır?'}</p>
          <p>{en
            ? 'AURIS examines the traces of AI-generated music. Upload a recording or use a link to explore its audio analysis.'
            : 'AURIS, müzikte yapay zekânın izlerini araştırıyor. Bir kayıt yükle veya bağlantı paylaş; sesin analizini incele.'}</p>
          <Link href="/ai-music-detection" className={styles.textLink}>
            {en ? 'Open AURIS' : 'AURIS’i aç'} <ArrowUpRight size={20} />
          </Link>
          <a href="https://github.com/Rtur2003/Music-AIDetector" target="_blank" rel="noreferrer" className={styles.sourceLink}>
            {en ? 'Read the source' : 'Kaynak kodunu incele'}
          </a>
        </div>
      </section>
      <section className={styles.creative} data-scroll-scene aria-labelledby="creative-heading">
        <div className={styles.creativeHeading}>
          <h2 id="creative-heading">{en ? 'An appetite' : 'Atmosferi'}<br />{en ? 'for atmosphere.' : 'hisset.'}</h2>
        </div>
        <Link href="/noir-grain" className={styles.noirFeature}>
          <div className={styles.noirMedia}>
            <Image src="/images/noir-grain/hero.png" alt={en ? 'The warmly lit Noir & Grain restaurant interior' : 'Noir & Grain restoranının sıcak ışıklı iç mekânı'} fill sizes="(max-width: 700px) 100vw, 70vw" />
          </div>
          <div className={styles.noirCaption}>
            <span>Noir & Grain</span>
            <span>{en ? 'A digital dining room' : 'Dijital bir sofra'} <ArrowUpRight size={20} /></span>
          </div>
        </Link>
        <div className={styles.noirInset} aria-hidden="true">
          <Image src="/images/noir-grain/menu.png" alt="" fill sizes="(max-width: 700px) 45vw, 25vw" />
        </div>
        <div className={styles.creativeFoot}>
          <p>{en ? 'From the atmosphere of a restaurant to the language of a dream. Each project finds its own form.' : 'Bir restoranın atmosferinden bir rüyanın diline. Her projenin kendine ait bir ifadesi var.'}</p>
          <Link href="/crown-dreams" className={styles.textLink}>{en ? 'Discover Crown Dreams' : 'Crown Dreams’i keşfet'} <ArrowUpRight size={18} /></Link>
        </div>
      </section>
      <section id="products" className={styles.explorer} aria-labelledby="explorer-heading">
        <div id="project-explorer" className={styles.explorerHead}>
          <div>
            <h2 id="explorer-heading">{en ? 'The collection.' : 'Koleksiyon.'}</h2>
          </div>
          <label className={styles.search}>
            <Search size={18} />
            <span className={styles.srOnly}>{en ? 'Search projects' : 'Proje ara'}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={en ? 'Search projects…' : 'Projelerde ara…'} />
            {query && <button type="button" onClick={() => setQuery('')} aria-label={en ? 'Clear search' : 'Aramayı temizle'}><X size={16} /></button>}
          </label>
        </div>
        <div className={styles.filters} aria-label={en ? 'Project categories' : 'Proje kategorileri'}>
          {(Object.keys(labels) as Group[]).map((key) => <button type="button" key={key} aria-pressed={group === key} onClick={() => setGroup(key)}>{labels[key]}</button>)}
        </div>
        <p className={styles.resultCount} aria-live="polite">{visible.length} {en ? 'projects' : 'proje'}</p>
        <div className={styles.results}>
          {visible.map((product) => {
            const Icon = product.entry.icon
            const external = product.entry.href.startsWith('https://')
            return (
              <Link key={product.entry.id} href={product.entry.href} className={styles.result} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <Icon size={25} strokeWidth={1.4} />
                <div><h3>{product.title}</h3><p>{product.description}</p></div>
                <ArrowUpRight size={22} />
              </Link>
            )
          })}
        </div>
        {visible.length === 0 && <div className={styles.empty}>
          <h3>{en ? 'No matching projects.' : 'Eşleşen proje bulunamadı.'}</h3>
          <p>{en ? 'Try a different search or explore the full collection.' : 'Başka bir sözcük dene veya tüm koleksiyona göz at.'}</p>
          <button type="button" onClick={() => { setQuery(''); setGroup('all') }}>{en ? 'Show all projects' : 'Tüm projeleri göster'}</button>
        </div>}
        <div className={styles.collectionFoot}>
          <p>{en ? 'Made to be explored. Built to be used.' : 'Keşfetmen için burada. Kullanman için geliştiriliyor.'}</p>
          <a href="https://github.com/Rtur2003" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={17} /></a>
        </div>
      </section>
    </div>
  )
}
