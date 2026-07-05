import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollTriggerRefresh() {
  const location = useLocation()

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [location.pathname])
}
