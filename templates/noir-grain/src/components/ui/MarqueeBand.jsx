// Fasıllar arası akan yazı bandı — katman sisteminin ritim öğesi.
// items: ['Noir & Grain', 'Karaköy', ...] — iki kez render edilir (sonsuz döngü).
export default function MarqueeBand({ items, className = '' }) {
  const row = items.map((text, i) => (
    <span key={`${text}-${i}`} className="flex items-center gap-10 shrink-0">
      <span className="font-display italic text-2xl md:text-4xl text-noir-text/60">{text}</span>
      <span className="w-1.5 h-1.5 rotate-45 bg-noir-accent/60 shrink-0" aria-hidden="true" />
    </span>
  ))

  return (
    <div
      className={`relative overflow-hidden border-y border-noir-border py-6 ${className}`}
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max gap-10">
        <div className="flex gap-10 shrink-0">{row}</div>
        <div className="flex gap-10 shrink-0">{row}</div>
      </div>
    </div>
  )
}
