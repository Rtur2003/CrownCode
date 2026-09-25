import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, m as motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG, resolveProduct, type ProductEntry } from '@/config/product-catalog'
import styles from './ProjectExplorer.module.css'

const materials: Record<string, string> = {
  'ai-music-detection': '/images/showroom/world-auris.webp',
  'ml-toolkit': '/images/showroom/world-ml.webp',
  'crown-fortune': '/images/showroom/world-fortune.webp',
  'crown-dreams': '/images/showroom/world-dreams.webp',
  'crown-commend': '/images/showroom/world-commend-v2.webp',
  'crown-vote': '/images/showroom/world-votryx-v2.webp',
  'noir-grain': '/images/showroom/world-noir.webp',
  kognita: '/images/showroom/world-kognita.webp',
}

const focusStart = 0.18
const focusSpan = 0.7
const focusStep = (count: number) => focusSpan / Math.max(1, count - 1)
const focalPoint = (index: number, count: number) => count === 1 ? 0.5 : focusStart + index * focusStep(count)
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}
const focusRadius = (count: number) => count === 1 ? 0.15 : Math.min(0.052, focusStep(count) * 0.52)
const focusAt = (progress: number, index: number, count: number) => smooth(1 - Math.abs(progress - focalPoint(index, count)) / focusRadius(count))
const nearestFocusAt = (progress: number, count: number) => {
  const index = Math.max(0, Math.min(count - 1, Math.round((progress - focusStart) / focusStep(count))))
  return focusAt(progress, index, count)
}

type Product = ProductEntry & ReturnType<typeof resolveProduct> & { name: string; image: string }

function Specimen({ product, index, count, progress, onSelect, reducedMotion, interactive }: {
  product: Product
  index: number
  count: number
  progress: MotionValue<number>
  onSelect: (index: number, focusRail?: boolean) => void
  reducedMotion: boolean
  interactive: boolean
}) {
  const staticScene = () => reducedMotion
  const orbitalAngle = (value: number) => -Math.PI / 2 + index * Math.PI * 2 / count + (staticScene() ? 0 : value * Math.PI * 2 * 1.05)
  const position = useTransform(progress, value => {
    const angle = orbitalAngle(value)
    const mobile = typeof window !== 'undefined' && window.innerWidth <= 700
    const x = Math.cos(angle) * (mobile ? 30 : 32) + Math.sin(angle) * (mobile ? 6 : 8)
    const y = Math.sin(angle) * (mobile ? 23 : 29) - Math.cos(angle) * (mobile ? 5 : 8)
    const focus = staticScene() ? 0 : focusAt(value, index, count)
    return `translate3d(${x * (1 - focus)}vw, ${y * (1 - focus)}svh, 0) translate(-50%, -50%)`
  })
  const scale = useTransform(progress, value => {
    const focus = staticScene() ? 0 : focusAt(value, index, count)
    const depth = 1 + Math.sin(orbitalAngle(value)) * 0.16
    return depth * (1 - focus) + focus * 16
  })
  const rotate = useTransform(progress, value => staticScene() ? 0 : value * 230 + index * 8)
  const opacity = useTransform(progress, value => {
    if (staticScene()) {return 1}
    const otherFocus = nearestFocusAt(value, count)
    return Math.max(0, Math.min(1, 1 - otherFocus * 1.4 + focusAt(value, index, count) * 1.4))
  })
  const pointerEvents = useTransform(progress, value => {
    if (staticScene()) {return 'auto'}
    return value < 0.145 || nearestFocusAt(value, count) > 0.14 ? 'none' : 'auto'
  })
  const labelOpacity = useTransform(progress, value => {
    return staticScene() ? 1 : Math.max(0, 1 - nearestFocusAt(value, count) * 5)
  })

  return (
    <motion.div className={styles.specimen} style={{ transform: position }}>
      <motion.button type="button" className={styles.specimenOrb} style={{ scale, rotate, opacity, pointerEvents }}
        onClick={() => onSelect(index, true)} tabIndex={interactive ? 0 : -1} aria-hidden={interactive ? undefined : true}
        aria-label={`${product.name}: ${product.title}`}>
        <Image src={product.image} alt="" fill unoptimized />
      </motion.button>
      <motion.span className={styles.specimenName} style={{ opacity: labelOpacity }}>
        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span> {product.name}
      </motion.span>
    </motion.div>
  )
}

export function ProjectExplorer() {
  const { t, language } = useLanguage()
  const en = language === 'en'
  const reducedMotion = Boolean(useReducedMotion())
  const journeyRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(-1)
  const [featureVisible, setFeatureVisible] = useState(false)
  const [interactive, setInteractive] = useState(true)
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ['start start', 'end end'] })
  const products: Product[] = PRODUCT_CATALOG.map(entry => {
    const localized = resolveProduct(entry, t)
    const name = entry.id === 'crown-vote' ? 'VOTRYX' : entry.id === 'ml-toolkit' ? 'ML Toolkit' : localized.title.split(' - ')[0]
    return { ...entry, ...localized, image: materials[entry.id] ?? '/images/showroom/atlas-plate.webp', name }
  })
  const count = products.length
  const journeyStyle = { '--journey-height': `${(count + 0.6) * 100}svh` } as CSSProperties

  const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.22], [1, 1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 1.45])
  const heroX = useTransform(scrollYProgress, [0, 0.28], ['0%', '-12%'])
  const detailOpacity = useTransform(scrollYProgress, [0.1, 0.22], [0, 1])
  const detailScale = useTransform(scrollYProgress, [0.1, 1], [1.1, 1.02])
  const detailX = useTransform(scrollYProgress, [0.1, 1], ['3%', '-3%'])
  const introOpacity = useTransform(scrollYProgress, [0, 0.06, 0.145], [1, 1, 0])
  const introY = useTransform(scrollYProgress, [0, 0.15], [0, -45])
  const introVisibility = useTransform(scrollYProgress, value => value >= 0.145 ? 'hidden' : 'visible')
  const orbitTurn = useTransform(scrollYProgress, value => reducedMotion ? 0 : value * 360 * 1.05)
  const orbitOpacity = useTransform(scrollYProgress, value => {
    if (reducedMotion) {return 1}
    return 0.22 + smooth(value / 0.15) * 0.78
  })
  const atlasMarkOpacity = useTransform(scrollYProgress, value => smooth((value - 0.14) / 0.13) * Math.max(0, 1 - nearestFocusAt(value, count) * 2) * 0.62)
  const activeOpacity = useTransform(scrollYProgress, value => active < 0 || reducedMotion ? 0 : focusAt(value, active, count))

  useMotionValueEvent(scrollYProgress, 'change', value => {
    if (reducedMotion) {return}
    const next = value < focusStart - focusRadius(count) * 1.25 ? -1 : Math.max(0, Math.min(count - 1, Math.round((value - focusStart) / focusStep(count))))
    const visible = next >= 0 && focusAt(value, next, count) > 0.14
    setActive(previous => previous === next ? previous : next)
    setFeatureVisible(previous => previous === visible ? previous : visible)
    const canSelectOrb = value >= 0.145 && !visible
    setInteractive(previous => previous === canSelectOrb ? previous : canSelectOrb)
  })

  useEffect(() => {
    if (!railRef.current) {return}
    const rail = railRef.current
    const scrollRail = (left: number) => {
      if (typeof rail.scrollTo === 'function') {
        rail.scrollTo({ left, behavior: reducedMotion ? 'instant' : 'smooth' })
      } else {
        rail.scrollLeft = left
      }
    }
    if (active < 0) {
      scrollRail(0)
      return
    }
    const button = rail.querySelectorAll('button')[active]
    if (button) {
      scrollRail(button.offsetLeft - rail.clientWidth / 2 + button.clientWidth / 2)
    }
  }, [active, reducedMotion])

  const select = (index: number, focusRail = false) => {
    if (focusRail) {railRef.current?.querySelectorAll('button')[index]?.focus({ preventScroll: true })}
    if (reducedMotion) {
      document.getElementById(`project-${products[index].id}`)?.scrollIntoView({ behavior: 'instant' })
      return
    }
    const journey = journeyRef.current
    if (!journey) {return}
    const start = journey.getBoundingClientRect().top + window.scrollY
    const distance = journey.offsetHeight - window.innerHeight
    window.scrollTo({ top: start + focalPoint(index, count) * distance, behavior: 'smooth' })
  }

  const selected = active >= 0 ? products[active] : null

  return (
    <div className={styles.home}>
      <section id="products" ref={journeyRef} className={styles.journey} style={journeyStyle} aria-labelledby="showroom-title">
        <div className={styles.stage}>
          <div className={styles.studio} aria-hidden="true">
            <motion.div className={styles.studioHero} style={{ opacity: heroOpacity, scale: heroScale, x: heroX }}>
              <Image src="/images/showroom/crown-studio.webp" alt="" fill preload sizes="100vw" />
            </motion.div>
            <motion.div className={styles.studioDetail} style={{ opacity: detailOpacity, scale: detailScale, x: detailX }}>
              <Image src="/images/showroom/atlas-plate.webp" alt="" fill sizes="100vw" />
            </motion.div>
          </div>
          <AnimatePresence>
            {selected && <motion.div key={selected.id} className={styles.materialExposure}
              initial={{ opacity: 0 }} animate={{ opacity: featureVisible ? 0.22 : 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55 }} aria-hidden="true">
              <Image src={selected.image} alt="" fill sizes="100vw" />
            </motion.div>}
          </AnimatePresence>
          <div className={styles.shade} aria-hidden="true" />
          <motion.div className={styles.intro} style={{ opacity: introOpacity, y: introY, visibility: introVisibility }}>
            <span className={styles.brandMark} aria-hidden="true"><Image src="/images/showroom/crown-glyph.webp" alt="" width={70} height={70} /></span>
            <h1 id="showroom-title">CrownCode</h1>
            <p>{en ? 'Independent work across sound, data and the web.' : 'Ses, veri ve web üzerine bağımsız çalışmalar.'}</p>
            <a href="#project-index" className={styles.introLink}>
              {en ? 'See all projects' : 'Tüm projelere bak'} <ArrowDown size={18} />
            </a>
          </motion.div>
          <motion.span className={styles.atlasMark} style={{ opacity: atlasMarkOpacity }} aria-hidden="true">
            <Image src="/images/showroom/crown-glyph.webp" alt="" width={220} height={220} />
          </motion.span>
          <motion.div id="project-explorer" className={styles.orbit} style={{ opacity: orbitOpacity }}
            aria-label={en ? 'Project objects' : 'Proje cisimleri'}>
            <motion.svg className={styles.orbitLines} style={{ rotate: orbitTurn }} viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <ellipse cx="500" cy="350" rx="410" ry="170" transform="rotate(-20 500 350)" />
              <ellipse cx="500" cy="350" rx="300" ry="285" transform="rotate(24 500 350)" />
              <ellipse cx="500" cy="350" rx="155" ry="365" transform="rotate(-30 500 350)" />
            </motion.svg>
            {products.map((product, index) =>
              <Specimen key={product.id} product={product} index={index} count={count} progress={scrollYProgress}
                onSelect={select} reducedMotion={reducedMotion} interactive={interactive} />,
            )}
          </motion.div>
          <motion.div className={styles.focusShade} style={{ opacity: activeOpacity }} aria-hidden="true" />
          {selected && featureVisible && <motion.article className={styles.feature} style={{ opacity: activeOpacity }}>
            <h2>{selected.name}</h2>
            <p>{selected.showroomDescription}</p>
            {selected.features.length > 0 && <ul>{selected.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul>}
            <div className={styles.featureActions}>
              <Link href={selected.href} target={selected.href.startsWith('https:') ? '_blank' : undefined}
                rel={selected.href.startsWith('https:') ? 'noreferrer' : undefined}>
                {en ? 'Open project' : 'Projeyi aç'} <ArrowUpRight size={20} />
              </Link>
              <span>{selected.status}</span>
            </div>
          </motion.article>}
          <nav ref={railRef} className={styles.rail} aria-label={en ? 'Move between projects' : 'Projeler arasında gezin'}>
            {products.map((product, index) =>
              <button key={product.id} type="button" onClick={() => select(index)}
                aria-current={active === index ? 'true' : undefined}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{product.name}
              </button>,
            )}
          </nav>
          <motion.div className={styles.scrollCue} style={{ opacity: introOpacity, visibility: introVisibility }} aria-hidden="true"><ArrowDown size={16} /> {en ? 'Scroll into the work' : 'İşlerin içine kaydır'}</motion.div>
        </div>
      </section>

      <section id="project-index" className={styles.index} aria-label={en ? 'All projects' : 'Tüm projeler'}>
        <div className={styles.indexLead}>
          <h2>{en ? 'Projects' : 'Projeler'}</h2>
          <p>{en ? 'Choose a project to see what it does and how it was built.' : 'Ne yaptığını ve nasıl kurulduğunu görmek için bir proje seç.'}</p>
        </div>
        <div className={styles.indexList}>
          {products.map((product, index) =>
            <Link id={`project-${product.id}`} key={product.id} href={product.href}
              target={product.href.startsWith('https:') ? '_blank' : undefined}
              rel={product.href.startsWith('https:') ? 'noreferrer' : undefined}>
              <span className={styles.indexNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.indexImage}><Image src={product.image} alt="" fill sizes="(max-width: 700px) 54px, 160px" /></span>
              <span className={styles.indexCopy}><strong>{product.name}</strong><span>{product.showroomDescription}</span></span>
              <ArrowUpRight size={20} />
            </Link>,
          )}
        </div>
        <div id="studio-end" className={styles.musicBridge}>
          <p>{en ? 'The music lives next door.' : 'Müzik de yan tarafta.'}</p>
          <a href="https://hasan-arthur-altuntas.com.tr" target="_blank" rel="noreferrer">
            {en ? 'Listen to Hasan Arthur Altuntaş' : 'Hasan Arthur Altuntaş’ı dinle'} <ArrowUpRight size={26} />
          </a>
        </div>
      </section>
    </div>
  )
}
