import { useEffect } from 'react'
import { site } from '../data/site.js'

// Sayfa başlığını "Sayfa — Site Adı" formatında ayarlar.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : site.name
  }, [title])
}
