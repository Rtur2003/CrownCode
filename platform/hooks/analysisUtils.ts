export const fnv1a = (value: string): number => {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export const buildSeed = (value: string): number => (fnv1a(value) % 1000) / 1000

const clamp01 = (value: number) => Math.min(0.99, Math.max(0, value))

const jitter = (value: number, magnitude: number) => {
  const delta = (Math.random() - 0.5) * magnitude
  return Number(clamp01(value + delta).toFixed(3))
}

export const buildFeatureScores = (seed: number) => {
  const normalized = (offset: number) => ((seed + offset) % 1)
  return {
    spectralRegularity: jitter(normalized(0.17), 0.12),
    temporalPatterns: jitter(normalized(0.43), 0.12),
    harmonicStructure: jitter(normalized(0.71), 0.12)
  }
}

export const previewIndicators = (extra?: string[]) => {
  const base = [
    'Preview-only decision based on fingerprint.',
    'No model inference was available at request time.'
  ]
  return extra && extra.length ? [...base, ...extra] : base
}
