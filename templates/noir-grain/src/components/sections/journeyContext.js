import { createContext, useContext } from 'react'

// Fasıl bileşenleri, pinned modda containerAnimation'a bağlanmak için
// bu context üzerinden yatay scrub tween'ine erişir.
export const JourneyContext = createContext({ pinned: false, anim: null })
export const useJourney = () => useContext(JourneyContext)
