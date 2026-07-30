import { useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { categories, menuItems } from '../../data/menu.js'
import { images } from '../../data/images.js'
import { menuPage } from '../../data/content.js'
import { WebGLCrossfade } from '../ui/WebGLImage.jsx'
import Magnetic from '../ui/Magnetic.jsx'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

// "Karanlik Vitrin": aktif yemegin gorseli tam ekran, uzerinde editoryal indeks
export default function MenuExperience() {
  const [activeCat, setActiveCat] = useState(categories[0].id)
  const [activeItemId, setActiveItemId] = useState(null)
  const listRef = useRef(null)

  const items = useMemo(() => menuItems.filter(i => i.category === activeCat), [activeCat])

  // Stabil referans sart: yoksa her hover WebGL context'ini yeniden kurar
  const catImages = useMemo(() => items.map(i => images.dishes[i.id]), [items])

  // Turetilmis: kategori degisiminde activeItemId bir an eski kategoriyi gosterir
  const activeItem = items.find(i => i.id === activeItemId) ?? items[0]
  const activeIndex = Math.max(0, items.findIndex(i => i.id === activeItem?.id))

  const selectCategory = (id) => {
    setActiveCat(id)
    setActiveItemId(menuItems.find(i => i.category === id)?.id ?? null)
  }

  // Kategori değişince öğeler stagger ile girer
  useGSAP(() => {
    const { reducedMotion } = getMediaCapability()
    if (reducedMotion || !listRef.current) return
    const rows = listRef.current.querySelectorAll('.menu-row')
    gsap.fromTo(
      rows,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }
    )
  }, { dependencies: [activeCat], scope: listRef })

  return (
    <div>
      {/* ── Masaüstü: tam ekran sahne ── */}
      <div className="hidden lg:block">
        {/* z-0: aktif yemeğin tam ekran görseli (mürekkep crossfade) */}
        <div className="fixed inset-0 z-0" aria-hidden="true">
          <WebGLCrossfade
            images={catImages}
            activeIndex={activeIndex}
            alt=""
            className="w-full h-full"
          />
          {/* Okunabilirlik: sol taraf koyu, alt geçiş */}
          <div className="absolute inset-0 bg-gradient-to-r from-noir-bg via-noir-bg/80 to-noir-bg/30" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-noir-bg to-transparent" />
        </div>

        <div className="relative z-10 flex items-start gap-[4vw] px-[6vw] pb-32 min-h-svh">
          {/* Kategori rayı — roma rakamları tadım sırasını taşır */}
          <nav className="sticky top-40 self-start flex flex-col gap-8 pt-2 shrink-0" aria-label="Menü kategorileri">
            {categories.map(({ id, label, numeral }) => {
              const active = id === activeCat
              return (
                <Magnetic key={id} strength={0.3}>
                  <button
                    type="button"
                    onClick={() => selectCategory(id)}
                    aria-pressed={active}
                    className="group flex flex-col items-start transition-colors duration-300"
                  >
                    <span
                      className={`font-display text-5xl leading-none transition-colors duration-300 ${
                        active ? 'text-noir-accent' : 'text-noir-text/40 group-hover:text-noir-text/70'
                      }`}
                    >
                      {numeral}
                    </span>
                    <span
                      className={`font-body text-[10px] tracking-[0.3em] uppercase mt-1 transition-opacity duration-300 ${
                        active ? 'text-noir-accent opacity-100' : 'text-noir-text/60 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                </Magnetic>
              )
            })}
          </nav>

          {/* Dev yemek indeksi */}
          <div className="flex-1 max-w-4xl pt-2">
          <ul ref={listRef}>
            {items.map((item) => {
              const active = item.id === activeItem?.id
              return (
                <li key={item.id} className="menu-row">
                  <button
                    type="button"
                    onMouseEnter={() => setActiveItemId(item.id)}
                    onFocus={() => setActiveItemId(item.id)}
                    onClick={() => setActiveItemId(item.id)}
                    data-cursor="Gör"
                    className="w-full text-left py-6 group"
                  >
                    <span className="flex items-baseline gap-5">
                      <span
                        className={`font-display text-[clamp(2rem,3.4vw,3.4rem)] leading-tight transition-colors duration-300 ${
                          active ? 'text-noir-text' : 'text-noir-text/45 group-hover:text-noir-text/80'
                        }`}
                      >
                        {item.name}
                      </span>
                      {/* Noktalı fiyat hattı — menü kartı geleneği */}
                      <span
                        className={`flex-1 border-b border-dotted mb-3 transition-colors duration-300 ${
                          active ? 'border-noir-accent/60' : 'border-noir-text/15'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`font-body text-base tabular-nums shrink-0 transition-colors duration-300 ${
                          active ? 'text-noir-accent' : 'text-noir-text/60'
                        }`}
                      >
                        {item.price} ₺
                      </span>
                    </span>
                    <span
                      className={`block font-display italic text-lg text-noir-text/60 overflow-hidden transition-all duration-500 ${
                        active ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {/* <ul> yalnızca <li> barındırabilir — bu not listenin dışına alındı. */}
          <p className="font-body text-xs text-noir-text/60 mt-10">{menuPage.note}</p>
          </div>
        </div>
      </div>

      {/* ── Cep Servisi — mobil: kart destesi + numeral sekmeler ── */}
      <div className="lg:hidden">
        <nav className="flex gap-8 overflow-x-auto px-6 pb-5" aria-label="Menü kategorileri">
          {categories.map(({ id, label, numeral }) => {
            const active = id === activeCat
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectCategory(id)}
                aria-pressed={active}
                className="shrink-0 flex flex-col items-center"
              >
                <span className={`font-display text-3xl leading-none ${active ? 'text-noir-accent' : 'text-noir-text/45'}`}>
                  {numeral}
                </span>
                <span className={`font-body text-[10px] tracking-[0.25em] uppercase mt-1 ${active ? 'text-noir-accent' : 'text-noir-text/60'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="overflow-x-auto snap-x snap-mandatory flex gap-4 px-6 pb-8">
          {items.map((item) => (
            <figure key={item.id} className="relative snap-center shrink-0 w-[82vw] h-[58vh] overflow-hidden">
              <img
                src={images.dishes[item.id]}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-noir-bg via-noir-bg/70 to-transparent" aria-hidden="true" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-3xl text-noir-text min-w-0 line-clamp-2">{item.name}</span>
                  <span className="font-body text-sm text-noir-accent tabular-nums shrink-0">{item.price} ₺</span>
                </span>
                <span className="block font-display italic text-sm text-noir-text/60 mt-1">{item.desc}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="font-body text-xs text-noir-text/60 px-6 pb-10">{menuPage.note}</p>
      </div>

      {/* Ekran okuyucular için aktif yemek duyurusu */}
      <span className="sr-only" aria-live="polite">{activeItem?.name}</span>
    </div>
  )
}
