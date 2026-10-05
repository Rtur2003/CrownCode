import React, { useState, type ReactNode } from 'react'

let cached: boolean | undefined

/** True when the browser can create a WebGL context. Checked once; false on the server. */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') {return false}
  if (cached !== undefined) {return cached}
  try {
    const canvas = document.createElement('canvas')
    cached = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    cached = false
  }
  return cached
}

interface BoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

/** Shows `fallback` if a scene throws while it is created or drawn (lost or refused context). */
class SceneBoundary extends React.Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: unknown) {
    // One quiet line instead of the renderer's stack trace; the page works without the scene.
    console.warn('3D scene unavailable, showing the static fallback.', error instanceof Error ? error.message : error)
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Renders a 3D scene only where WebGL works, and the static `fallback`
 * (nothing by default) everywhere else, so the page stays complete either way.
 */
export const WebGLGuard: React.FC<{ fallback?: ReactNode; children: ReactNode }> = ({ fallback = null, children }) => {
  const [supported] = useState(hasWebGL)
  return supported ? <SceneBoundary fallback={fallback}>{children}</SceneBoundary> : <>{fallback}</>
}
