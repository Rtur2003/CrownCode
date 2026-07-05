import ContactSplit from '../components/sections/ContactSplit.jsx'
import { contactPage } from '../data/content.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Contact() {
  usePageTitle('İletişim')
  return (
    <main className="min-h-screen bg-noir-bg text-noir-text pt-28 lg:pt-36">
      <header className="px-6 lg:px-16 mb-6 lg:mb-2 relative z-20">
        <p className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-4">
          {contactPage.eyebrow}
        </p>
        <h1 className="font-display text-5xl lg:text-7xl">{contactPage.title}</h1>
      </header>
      <ContactSplit />
    </main>
  )
}
