export const fnv1a = (value: string): number => {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export const buildSeed = (value: string): number => (fnv1a(value) % 1000) / 1000

export const buildFeatureScores = (seed: number) => {
  const normalized = (offset: number) => Number(((seed + offset) % 1).toFixed(3))
  return {
    spectralRegularity: normalized(0.17),
    temporalPatterns: normalized(0.43),
    harmonicStructure: normalized(0.71)
  }
}

export const previewIndicators = (extra?: string[]) => {
  const base = [
    'Preview-only decision based on fingerprint.',
    'No model inference was available at request time.'
  ]
  return extra && extra.length ? [...base, ...extra] : base
}
