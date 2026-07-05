import { getMediaCapability } from '../../hooks/useMediaCapability.js'

// Sağ kenarda fasıl ilerlemesini gösteren ince ray (kontrollü bileşen).
// sections: [{ id, numeral, label }] — activeId dışarıdan verilir.
export default function ServiceRail({ sections, activeId }) {
  const { reducedMotion } = getMediaCapability()
  if (reducedMotion) return null

  return (
    <nav
      className="fixed right-6 bottom-10 z-40 hidden lg:flex flex-col gap-4 pointer-events-none"
      aria-label="Fasıl ilerlemesi"
    >
      {sections.map(({ id, numeral, label }) => {
        const active = id === activeId
        return (
          <span key={id} className="flex items-center justify-end gap-3">
            <span
              className={`text-[10px] tracking-[0.3em] uppercase font-body transition-all duration-500 ${
                active ? 'text-noir-accent opacity-100' : 'opacity-0'
              }`}
            >
              {label}
            </span>
            <span
              className={`font-display text-sm transition-colors duration-500 ${
                active ? 'text-noir-accent' : 'text-noir-text/30'
              }`}
            >
              {numeral}
            </span>
          </span>
        )
      })}
    </nav>
  )
}
