import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollTriggerRefresh() {
  const location = useLocation()

  useEffect(() => {
    // Bir kare bekle: commit aninda yeni rotanin duzeni henuz oturmamis olabilir
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [location.pathname])
}
