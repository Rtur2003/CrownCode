import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
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
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeScene, setActiveScene] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const sceneRefs = useRef<Array<HTMLElement | null>>([])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const updateProgress = () => {
      const hero = heroRef.current
      if (hero && !reducedMotion) {
        const range = Math.max(hero.offsetHeight, 1)
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / range)))
      }
      const focusLine = window.scrollY + window.innerHeight * 0.42
      let nextScene = 0
      sceneRefs.current.forEach((scene, index) => {
        if (scene && focusLine >= scene.offsetTop) {
          nextScene = index
        }
      })
      setActiveScene(nextScene)
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [reducedMotion])

  const rotation = -12 + scrollProgress * 67
  const y = scrollProgress * 100
  const labels: Record<Group, string> = en
    ? {
        all: 'All projects',
        sound: 'Sound & data',
        creative: 'Creative experiences',
        tools: 'Tools & automation',
      }
    : {
        all: 'Tüm projeler',
        sound: 'Ses & veri',
        creative: 'Yaratıcı deneyimler',
        tools: 'Araçlar & otomasyon',
      }
  const products = PRODUCT_CATALOG.map((entry) => ({ entry, ...resolveProduct(entry, t) }))
  const visible = products.filter((product) => {
    const inGroup =
      group === 'all' || (groups[group] as readonly string[]).includes(product.entry.id)
    return (
      inGroup &&
      `${product.title} ${product.description} ${product.features.join(' ')}`
        .toLocaleLowerCase(language)
        .includes(query.trim().toLocaleLowerCase(language))
    )
  })

  return (
    <div className={styles.root}>
      <div className={styles.progressRail} aria-hidden="true">
        {[0, 1, 2, 3].map((scene) => (
          <span key={scene} className={activeScene === scene ? styles.progressActive : ''}>
            0{scene + 1}
          </span>
        ))}
      </div>
      <section
        ref={(element) => {
          heroRef.current = element
          sceneRefs.current[0] = element
        }}
        className={styles.hero}
        aria-labelledby="studio-heading"
      >
        <div className={styles.heroTop}>
          <div className={styles.brandLockup}>
            <Image
              src="/favicon.svg"
              alt="CrownCode logo"
              width={48}
              height={48}
              priority
              className={styles.brandLogo}
            />
            <span className={styles.brandName}>CrownCode</span>
            <span className={styles.brandMeta}>independent lab / 001</span>
          </div>
          <span className={styles.heroCredit}>/ Hasan Arthur Altuntaş</span>
          <a href="https://github.com/Rtur2003" target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} />
          </a>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{en ? 'A workshop for useful wonder' : 'İşe yarayan merak için bir atölye'}</p>
          <h1 id="studio-heading">
            {en ? 'Sound, data' : 'Ses, veri'}
            <br />
            {en ? '& experiments.' : 've deneyler.'}
          </h1>
          <p className={styles.heroLead}>
            {en
              ? 'CrownCode turns questions into instruments — research, software and small digital worlds made to be explored.'
              : 'CrownCode soruları araçlara dönüştürür — araştırma, yazılım ve keşfedilmeyi bekleyen küçük dijital dünyalar.'}
          </p>
        </div>
        <motion.div
          className={styles.orbit}
          style={reducedMotion ? {} : { rotate: rotation, y }}
          aria-hidden="true"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <i
              key={index}
              style={{ inset: `${index * 4.3}%`, transform: `rotate(${index * 13}deg)` }}
            />
          ))}
        </motion.div>
        <motion.div
          className={styles.heroGlow}
          style={reducedMotion ? {} : { opacity: 0.42 - scrollProgress * 0.2, scale: 1 + scrollProgress * 0.1 }}
          aria-hidden="true"
        />
        <div className={styles.heroBottom}>
          <div className={styles.heroMeta}>
            <span>01 / 04</span>
            <span>{en ? 'Scroll to enter' : 'İçeri girmek için kaydır'}</span>
          </div>
          <a href="#project-explorer">
            {en ? 'Find your next discovery' : 'Projeleri keşfet'}
            <ArrowDown size={18} />
          </a>
        </div>
      </section>
      <section
        ref={(element) => {
          sceneRefs.current[1] = element
        }}
        className={`${styles.manifesto} ${activeScene === 1 ? styles.sceneActive : ''}`}
        aria-labelledby="manifesto-heading"
      >
        <div className={styles.chapterMarker}>
          <span>02</span>
          <span>{en ? 'The reason behind the work' : 'İşin arkasındaki neden'}</span>
        </div>
        <div className={styles.manifestoGrid}>
          <div className={styles.manifestoCopy}>
            <p className={styles.eyebrow}>{en ? 'Purpose before polish' : 'Önce amaç, sonra parıltı'}</p>
            <h2 id="manifesto-heading">
              {en ? 'Make curiosity tangible.' : 'Merakı elle tutulur hale getir.'}
            </h2>
            <p>
              {en
                ? 'Every CrownCode project starts with a question. The interface is the invitation; the useful answer lives underneath it.'
                : 'Her CrownCode projesi bir soruyla başlar. Arayüz davettir; işe yarayan cevap onun altında yaşar.'}
            </p>
          </div>
          <div className={styles.methodRail} aria-label={en ? 'CrownCode method' : 'CrownCode yöntemi'}>
            {[
              [en ? 'LISTEN' : 'DİNLE', en ? 'Find the signal.' : 'Sinyali bul.'],
              [en ? 'SHAPE' : 'ŞEKİLLENDİR', en ? 'Give it a form.' : 'Ona bir biçim ver.'],
              [en ? 'RELEASE' : 'PAYLAŞ', en ? 'Let people use it.' : 'İnsanların kullanmasına izin ver.'],
            ].map(([title, caption], index) => (
              <div key={title} className={styles.methodStep}>
                <span>0{index + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{caption}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.manifestoFoot}>
          <span>{en ? 'Independent / open-ended / human' : 'Bağımsız / açık uçlu / insani'}</span>
          <span>© 2024—{new Date().getFullYear()}</span>
        </div>
      </section>
      <section
        id="project-explorer"
        ref={(element) => {
          sceneRefs.current[2] = element
        }}
        className={`${styles.explorer} ${activeScene === 2 ? styles.sceneActive : ''}`}
        aria-labelledby="explorer-heading"
      >
        <div className={styles.explorerHead}>
          <div>
            <p>03 / {en ? 'Choose your direction' : 'Bir yön seç'}</p>
            <h2 id="explorer-heading">
              {en ? 'What are you curious about?' : 'Neyi merak ediyorsun?'}
            </h2>
          </div>
          <label className={styles.search}>
            <Search size={18} />
            <span className={styles.srOnly}>{en ? 'Search projects' : 'Proje ara'}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={en ? 'Search projects…' : 'Projelerde ara…'}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={en ? 'Clear search' : 'Aramayı temizle'}
              >
                <X size={16} />
              </button>
            )}
          </label>
        </div>
        <div
          className={styles.filters}
          aria-label={en ? 'Project categories' : 'Proje kategorileri'}
        >
          {(Object.keys(labels) as Group[]).map((key) => (
            <button key={key} aria-pressed={group === key} onClick={() => setGroup(key)}>
              {labels[key]}
            </button>
          ))}
        </div>
        <p className={styles.resultCount} aria-live="polite">
          {visible.length} {en ? 'projects to explore' : 'proje keşfedilmeyi bekliyor'}
        </p>
        <div className={styles.results}>
          {visible.map((product) => {
            const Icon = product.entry.icon
            const external = product.entry.href.startsWith('https://')
            return (
              <Link
                key={product.entry.id}
                href={product.entry.href}
                className={styles.result}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <Icon size={24} strokeWidth={1.4} />
                <div>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </div>
                <ArrowUpRight size={22} />
              </Link>
            )
          })}
        </div>
        {visible.length === 0 && (
          <div className={styles.empty}>
            <h3>{en ? 'No matching projects.' : 'Eşleşen proje bulunamadı.'}</h3>
            <p>
              {en
                ? 'Try a different term or explore the full collection.'
                : 'Başka bir sözcük dene veya tüm koleksiyona göz at.'}
            </p>
            <button
              onClick={() => {
                setQuery('')
                setGroup('all')
              }}
            >
              {en ? 'Show all projects' : 'Tüm projeleri göster'}
            </button>
          </div>
        )}
      </section>
      <section
        ref={(element) => {
          sceneRefs.current[3] = element
        }}
        className={`${styles.feature} ${activeScene === 3 ? styles.sceneActive : ''}`}
        aria-labelledby="auris-feature-heading"
      >
        <div className={styles.featureMedia}>
          <Image
            src="/images/auris/hero-wave.webp"
            alt=""
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className={styles.featureCopy}>
          <span>04 / {en ? 'Where music meets research' : 'Müzik araştırmayla buluştuğunda'}</span>
          <h2 id="auris-feature-heading">AURIS</h2>
          <p>{en ? 'Can you hear who made it?' : 'Kimin yaptığını duyabilir misin?'}</p>
          <p>
            {en
              ? 'Explore a system that brings several ways of listening together to examine AI-generated music.'
              : 'Yapay zekâ ile üretilen müziği incelemek için birden fazla dinleme yaklaşımını bir araya getiren sistemi keşfet.'}
          </p>
          <Link href="/ai-music-detection">
            {en ? 'Explore the audio lab' : 'Ses laboratuvarını keşfet'}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <div className={styles.bridge}>
        <span>{en ? 'Prefer a visual tour?' : 'Görerek keşfetmek ister misin?'}</span>
        <a href="#products">
          {en ? 'Explore the showcase below' : 'Aşağıdaki vitrine göz at'}
          <ArrowDown size={17} />
        </a>
      </div>
    </div>
  )
}
