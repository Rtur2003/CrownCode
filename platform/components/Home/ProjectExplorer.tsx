import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, m as motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG, resolveProduct, type ProductEntry } from '@/config/product-catalog'
import styles from './ProjectExplorer.module.css'

const materials: Record<string, { image: string; x: number; y: number; mobileX: number; mobileY: number }> = {
  'ai-music-detection': { image: '/images/showroom/world-auris.webp', x: 64, y: 28, mobileX: 19, mobileY: 43 },
  'ml-toolkit': { image: '/images/showroom/world-ml.webp', x: 81, y: 43, mobileX: 50, mobileY: 41 },
  'crown-fortune': { image: '/images/showroom/world-fortune.webp', x: 77, y: 68, mobileX: 81, mobileY: 43 },
  'crown-dreams': { image: '/images/showroom/world-dreams.webp', x: 55, y: 69, mobileX: 81, mobileY: 58 },
  'crown-commend': { image: '/images/showroom/world-commend-v2.webp', x: 40, y: 48, mobileX: 67, mobileY: 72 },
  'crown-vote': { image: '/images/showroom/world-votryx-v2.webp', x: 54, y: 18, mobileX: 34, mobileY: 72 },
  'noir-grain': { image: '/images/showroom/world-noir.webp', x: 89, y: 24, mobileX: 19, mobileY: 58 },
  kognita: { image: '/images/showroom/world-kognita.webp', x: 32, y: 70, mobileX: 50, mobileY: 57 },
}

const focalPoint = (index: number) => 0.18 + index * 0.1
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}
const focusAt = (progress: number, index: number) => smooth(1 - Math.abs(progress - focalPoint(index)) / 0.052)
const nearestFocusAt = (progress: number) => {
  const index = Math.max(0, Math.min(PRODUCT_CATALOG.length - 1, Math.round((progress - 0.18) / 0.1)))
  return focusAt(progress, index)
}

type Product = ProductEntry & ReturnType<typeof resolveProduct> & { name: string; image: string; x: number; y: number; mobileX: number; mobileY: number }

function Specimen({ product, index, progress, onSelect, reducedMotion, interactive }: {
  product: Product
  index: number
  progress: MotionValue<number>
  onSelect: (index: number, focusRail?: boolean) => void
  reducedMotion: boolean
  interactive: boolean
}) {
  const staticScene = () => reducedMotion || (typeof window !== 'undefined' && window.innerHeight < 650)
  const transform = useTransform(progress, value => {
    const focus = staticScene() ? 0 : focusAt(value, index)
    const driftX = Math.sin(value * 8 + index * 1.4) * 18 * (1 - focus)
    const driftY = Math.cos(value * 7 + index * 1.2) * 12 * (1 - focus)
    const turn = (value * 28 + index * 4) * (1 - focus)
    return `translate3d(${driftX}px, ${driftY}px, 0) translate(calc((50vw - var(--origin-x)) * ${focus}), calc((50svh - var(--origin-y)) * ${focus})) rotate(${turn}deg) scale(${1 + focus * 15})`
  })
  const opacity = useTransform(progress, value => {
    if (staticScene()) {return 1}
    const otherFocus = nearestFocusAt(value)
    return Math.max(0, Math.min(1, 1 - otherFocus * 1.4 + focusAt(value, index) * 1.4))
  })
  const pointerEvents = useTransform(progress, value => {
    if (staticScene()) {return 'auto'}
    return nearestFocusAt(value) > 0.14 ? 'none' : 'auto'
  })
  const labelOpacity = useTransform(progress, value => {
    return staticScene() ? 1 : Math.max(0, 1 - nearestFocusAt(value) * 5)
  })
  const position = {
    '--x': `${product.x}vw`, '--y': `${product.y}svh`,
    '--mobile-x': `${product.mobileX}vw`, '--mobile-y': `${product.mobileY}svh`,
  } as CSSProperties

  return (
    <div className={styles.specimen} style={position}>
      <motion.button type="button" className={styles.specimenOrb} style={{ transform, opacity, pointerEvents }}
        onClick={() => onSelect(index, true)} tabIndex={interactive ? 0 : -1} aria-hidden={interactive ? undefined : true}
        aria-label={`${product.name}: ${product.title}`}>
        <Image src={product.image} alt="" fill unoptimized />
      </motion.button>
      <motion.span className={styles.specimenName} style={{ opacity: labelOpacity }}>
        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span> {product.name}
      </motion.span>
    </div>
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
    const material = materials[entry.id]
    if (!material) {throw new Error(`Missing showroom image for ${entry.id}`)}
    const localized = resolveProduct(entry, t)
    const name = entry.id === 'crown-vote' ? 'VOTRYX' : entry.id === 'ml-toolkit' ? 'ML Toolkit' : localized.title.split(' - ')[0]
    return { ...entry, ...localized, ...material, name }
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.13, 0.28], [1, 1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 1.45])
  const heroX = useTransform(scrollYProgress, [0, 0.28], ['0%', '-12%'])
  const detailOpacity = useTransform(scrollYProgress, [0.13, 0.29], [0, 1])
  const detailScale = useTransform(scrollYProgress, [0.1, 1], [1.1, 1.02])
  const detailX = useTransform(scrollYProgress, [0.1, 1], ['3%', '-3%'])
  const introOpacity = useTransform(scrollYProgress, [0, 0.06, 0.145], [1, 1, 0])
  const introY = useTransform(scrollYProgress, [0, 0.15], [0, -45])
  const introVisibility = useTransform(scrollYProgress, value => value >= 0.145 ? 'hidden' : 'visible')
  const orbitX = useTransform(scrollYProgress, value => reducedMotion ? 0 : Math.sin(value * Math.PI * 2) * 28 * (1 - nearestFocusAt(value)))
  const orbitY = useTransform(scrollYProgress, value => reducedMotion ? 0 : Math.cos(value * Math.PI * 2) * 17 * (1 - nearestFocusAt(value)))
  const orbitTurn = useTransform(scrollYProgress, value => reducedMotion ? 0 : Math.sin(value * Math.PI * 1.5) * 2.5 * (1 - nearestFocusAt(value)))
  const atlasMarkOpacity = useTransform(scrollYProgress, value => smooth((value - 0.14) / 0.13) * Math.max(0, 1 - nearestFocusAt(value) * 2) * 0.62)
  const activeOpacity = useTransform(scrollYProgress, value => active < 0 || reducedMotion ? 0 : focusAt(value, active))

  useMotionValueEvent(scrollYProgress, 'change', value => {
    if (reducedMotion || window.innerHeight < 650) {return}
    const next = value < 0.115 ? -1 : Math.max(0, Math.min(products.length - 1, Math.round((value - 0.18) / 0.1)))
    const visible = next >= 0 && focusAt(value, next) > 0.14
    setActive(previous => previous === next ? previous : next)
    setFeatureVisible(previous => previous === visible ? previous : visible)
    setInteractive(previous => previous === !visible ? previous : !visible)
  })

  useEffect(() => {
    if (active < 0 || !railRef.current) {return}
    const button = railRef.current.querySelectorAll('button')[active]
    if (button) {
      railRef.current.scrollTo({ left: button.offsetLeft - railRef.current.clientWidth / 2 + button.clientWidth / 2, behavior: reducedMotion ? 'instant' : 'smooth' })
    }
  }, [active, reducedMotion])

  const select = (index: number, focusRail = false) => {
    if (focusRail) {railRef.current?.querySelectorAll('button')[index]?.focus({ preventScroll: true })}
    if (reducedMotion || window.matchMedia('(max-height: 650px)').matches) {
      document.getElementById(`project-${products[index].id}`)?.scrollIntoView({ behavior: 'instant' })
      return
    }
    const journey = journeyRef.current
    if (!journey) {return}
    const start = journey.getBoundingClientRect().top + window.scrollY
    const distance = journey.offsetHeight - window.innerHeight
    window.scrollTo({ top: start + focalPoint(index) * distance, behavior: 'smooth' })
  }

  const selected = active >= 0 ? products[active] : null

  return (
    <div className={styles.home}>
      <section id="products" ref={journeyRef} className={styles.journey} aria-labelledby="showroom-title">
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
          <motion.div id="project-explorer" className={styles.orbit} style={{ x: orbitX, y: orbitY, rotate: orbitTurn }}
            aria-label={en ? 'Project objects' : 'Proje cisimleri'}>
            <svg className={styles.orbitLines} viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <ellipse cx="500" cy="350" rx="410" ry="170" transform="rotate(-20 500 350)" />
              <ellipse cx="500" cy="350" rx="300" ry="285" transform="rotate(24 500 350)" />
              <ellipse cx="500" cy="350" rx="155" ry="365" transform="rotate(-30 500 350)" />
            </svg>
            {products.map((product, index) =>
              <Specimen key={product.id} product={product} index={index} progress={scrollYProgress}
                onSelect={select} reducedMotion={reducedMotion} interactive={interactive} />,
            )}
          </motion.div>
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
              <span className={styles.indexImage}><Image src={product.image} alt="" fill sizes="62px" /></span>
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
