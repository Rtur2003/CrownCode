import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollTriggerRefresh() {
  const location = useLocation()

  useEffect(() => {
    // Bir kare beklenir: commit anında yeni rotanın düzeni henüz oturmamış
    // olabiliyor ve pinned bölümler yanlış yükseklik ölçüp kayıyordu.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [location.pathname])
}
