// Cihaz yetenekleri tek kaynaktan; tum sinematik katman buna gore dususe geciyor
let cached = null

export function getMediaCapability() {
  if (cached) return cached
  if (typeof window === 'undefined') {
    return { reducedMotion: true, isTouch: true, hasWebGL: false }
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isTouch = window.matchMedia('(hover: none)').matches

  let hasWebGL = false
  try {
    const canvas = document.createElement('canvas')
    hasWebGL = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    hasWebGL = false
  }

  cached = { reducedMotion, isTouch, hasWebGL }
  return cached
}
