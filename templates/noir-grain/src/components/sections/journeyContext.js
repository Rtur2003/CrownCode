import { createContext, useContext } from 'react'

// Fasil bilesenleri pinned modda containerAnimation'a bu context uzerinden baglanir
// bu context üzerinden yatay scrub tween'ine erişir.
export const JourneyContext = createContext({ pinned: false, anim: null })
export const useJourney = () => useContext(JourneyContext)
