import MenuExperience from '../components/sections/MenuExperience.jsx'
import { menuPage } from '../data/content.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Menu() {
  usePageTitle('Menü')
  return (
    <main className="relative min-h-screen bg-noir-bg text-noir-text pt-28 lg:pt-36 overflow-hidden">
      {/* z-0: sayfa filigranı (mobil; masaüstünde tam ekran görsel sahnede) */}
      <span className="watermark lg:hidden text-[34vw] -right-6 top-16 italic" aria-hidden="true">
        Menü
      </span>
      <header className="relative z-20 px-6 lg:px-[6vw] mb-10 lg:mb-12">
        <h1 className="font-display text-5xl lg:text-7xl text-balance">{menuPage.title}</h1>
      </header>
      <MenuExperience />
    </main>
  )
}
