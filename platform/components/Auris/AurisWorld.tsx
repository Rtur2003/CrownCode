/**
 * The AURIS world from the homepage atlas, alone on its own page.
 *
 * Same procedural planet, atmosphere and vinyl ring as the atlas (shared
 * shaders), plus one extra band just outside the grooves that shows the
 * analysis: a sweep while the server wakes, real step progress while the
 * models run, then the AI probability with the decision threshold marked.
 * The planet takes the verdict's colour when the result lands.
 * Client-only (loaded with next/dynamic, ssr: false).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { WebGLGuard } from '@/components/UI/WebGLGuard'
import { worldLook } from '@/config/showroom-worlds'
import {
  atmosphereFragment, atmosphereVertex, planetFragment, planetVertex,
  pointsFragment, pointsVertex, ringFragment, ringVertex,
} from '@/components/Home/Atlas/shaders'

export type WorldMode = 'idle' | 'waking' | 'running' | 'ai' | 'human'

export interface AurisWorldProps {
  mode: WorldMode
  /** 0..1 lit arc while running, the AI probability once a result is in. */
  progress: number
  /** Decision threshold, drawn as a mark on the band (result only). */
  threshold: number | null
  /** Number of pipeline steps, drawn as gaps in the band while running. */
  ticks: number
  /** A file is being dragged over the page. */
  hot: boolean
  /** The canvas is on screen; rendering pauses otherwise. */
  active: boolean
  reducedMotion: boolean
  onReady?: () => void
}

const LOOK = worldLook({ id: 'ai-music-detection' })
const KEY_LIGHT = new THREE.Vector3(-0.55, 0.5, 0.68).normalize()
const AI_COLOR = new THREE.Color('#f2b45f')
const HUMAN_COLOR = new THREE.Color('#8fc0ab')
const TRACK_COLOR = new THREE.Color('#3a2a1c')
const RING_TILT = -Math.PI / 2 + 0.38
// Radii in planet units: the grooves, then the analysis band just outside.
const GROOVES = [1.4, 2.15] as const
const BAND = [2.2, 2.5] as const

const bandVertex = /* glsl */ `
  varying vec2 vLocal;
  void main() {
    vLocal = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const bandFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uTrack;
  uniform float uInner;
  uniform float uOuter;
  uniform float uProgress;
  uniform float uSweep;
  uniform float uThreshold;
  uniform float uTicks;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vLocal;
  void main() {
    float r = length(vLocal);
    float t = (r - uInner) / (uOuter - uInner);
    float band = smoothstep(0.12, 0.26, t) * smoothstep(0.88, 0.74, t);

    // 0 at the far left of the disc, growing clockwise seen from above.
    float u = fract(atan(-vLocal.y, -vLocal.x) / 6.2831853 + 1.0);
    float aa = max(fwidth(u) * 1.5, 0.0015);
    float lit = 1.0 - smoothstep(uProgress - aa, uProgress, u);
    if (uSweep > 0.5) {
      float d = fract(uTime * 0.16 - u);
      lit = smoothstep(0.3, 0.0, d) * 0.9;
    }

    float gap = 0.0;
    if (uTicks > 0.5) {
      float s = fract(u * uTicks);
      gap = 1.0 - smoothstep(0.0, aa * uTicks * 1.4, min(s, 1.0 - s));
    }

    float mark = 0.0;
    if (uThreshold >= 0.0) {
      float d = abs(u - uThreshold);
      mark = (1.0 - smoothstep(aa * 0.6, aa * 1.8, d)) * smoothstep(0.05, 0.25, t) * smoothstep(0.98, 0.8, t);
    }

    vec3 color = mix(uTrack, uColor * 1.25, lit);
    float alpha = band * (0.3 + 0.7 * lit) * (1.0 - gap * 0.9);
    color = mix(color, vec3(1.0, 0.95, 0.86), mark);
    alpha = max(alpha, mark);
    gl_FragColor = vec4(color, alpha * uOpacity);
    #include <colorspace_fragment>
  }
`

function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps)
  useEffect(() => () => value.dispose(), [value])
  return value
}

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function Sky() {
  const texture = useDisposable(() => {
    const t = new THREE.TextureLoader().load('/images/atlas/nebula.webp')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh rotation={[0.2, 2.4, 0.1]}>
      <sphereGeometry args={[300, 40, 20]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Stars({ time }: { time: React.MutableRefObject<number> }) {
  const gl = useThree(s => s.gl)
  const geometry = useDisposable(() => {
    const count = 900
    const rand = seeded(11)
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const phase = new Float32Array(count)
    const warm = new THREE.Color('#f3dcb2')
    const cool = new THREE.Color('#b9c8dc')
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1
      const a = rand() * Math.PI * 2
      const r = 60 + rand() * 160
      const s = Math.sqrt(1 - u * u)
      positions.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3)
      const big = rand() > 0.97
      sizes[i] = (big ? 2.4 : 0.7 + rand() * 1.1) * (r / 60)
      c.copy(warm).lerp(cool, rand()).multiplyScalar(big ? 1 : 0.5 + rand() * 0.4)
      colors.set([c.r, c.g, c.b], i * 3)
      phase[i] = rand() * Math.PI * 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return g
  }, [])
  const material = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])
  useFrame(() => {
    material.uniforms.uTime.value = time.current
    material.uniforms.uPixelRatio.value = gl.getPixelRatio()
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

function Scene({ mode, progress, threshold, ticks, hot, reducedMotion, onReady }: Omit<AurisWorldProps, 'active'>) {
  const { camera, size, gl, setDpr } = useThree()
  const time = useRef(0)
  const spin = useRef<THREE.Mesh>(null)
  const system = useRef<THREE.Group>(null)
  const shown = useRef(0)
  const ready = useRef(false)
  const pointer = useRef({ x: 0, y: 0 })
  const frameTimes = useRef<number[]>([])
  const baseAccent = useMemo(() => new THREE.Color(LOOK.accent), [])
  const baseAtmo = useMemo(() => new THREE.Color(LOOK.atmosphere), [])
  const geometry = useDisposable(() => new THREE.SphereGeometry(1, 128, 64), [])
  const grooves = useDisposable(() => new THREE.RingGeometry(GROOVES[0], GROOVES[1], 200, 1), [])
  const bandGeometry = useDisposable(() => new THREE.RingGeometry(BAND[0], BAND[1], 360, 1), [])

  const planet = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: planetVertex,
    fragmentShader: planetFragment,
    uniforms: {
      uBase: { value: new THREE.Color(LOOK.base) },
      uMid: { value: new THREE.Color(LOOK.mid) },
      uAccent: { value: new THREE.Color(LOOK.accent) },
      uAtmo: { value: new THREE.Color(LOOK.atmosphere) },
      uLight: { value: KEY_LIGHT.clone() },
      uBands: { value: LOOK.bands },
      uDetail: { value: LOOK.detail },
      uLines: { value: LOOK.lines },
      // No gloss: this close, the lacquer's highlight reads as a smudge.
      uGloss: { value: 0 },
      uSeed: { value: 3.1 },
      uFocus: { value: 0 },
    },
  }), [])
  const atmosphere = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    uniforms: { uAtmo: { value: new THREE.Color(LOOK.atmosphere) }, uLight: { value: KEY_LIGHT.clone() }, uGlow: { value: 0 } },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])
  const ring = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    uniforms: {
      uAccent: { value: new THREE.Color(LOOK.accent) },
      uMid: { value: new THREE.Color(LOOK.mid) },
      uInner: { value: GROOVES[0] },
      uOuter: { value: GROOVES[1] },
      uStyle: { value: 0 },
      uTime: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  }), [])
  const band = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: bandVertex,
    fragmentShader: bandFragment,
    uniforms: {
      uColor: { value: new THREE.Color(LOOK.accent) },
      uTrack: { value: TRACK_COLOR.clone() },
      uInner: { value: BAND[0] },
      uOuter: { value: BAND[1] },
      uProgress: { value: 0 },
      uSweep: { value: 0 },
      uThreshold: { value: -1 },
      uTicks: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  }), [])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // Frame the disc. On wide screens the world sits right of centre (an
  // off-axis projection, so it isn't viewed at a slant) and its ring runs
  // behind the panel; the band always stays whole on the open side.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const W = Math.max(1, size.width)
    const H = Math.max(1, size.height)
    const cx = W / H > 1.15 ? 0.63 : 0.5
    const half = Math.tan((cam.fov * Math.PI) / 360)
    const radius = BAND[1] * LOOK.size * 1.04
    const open = Math.min(cx, 1 - cx) * 2 * (W / H)
    const distance = Math.max(radius / (half * open), 1.95 / half)
    const fullWidth = 2 * cx * W
    cam.aspect = fullWidth / H
    if (cx === 0.5) {cam.clearViewOffset()} else {cam.setViewOffset(fullWidth, H, 0, 0, W, H)}
    cam.position.set(0, distance * 0.2, distance)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  }, [camera, size])

  const running = mode === 'waking' || mode === 'running'
  const verdict = mode === 'ai' ? AI_COLOR : mode === 'human' ? HUMAN_COLOR : null
  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const speed = reducedMotion ? 0 : running ? 2.6 : hot ? 1.8 : 1
    time.current += dt * speed
    const k = 1 - Math.exp(-dt * 3)

    if (spin.current) {spin.current.rotation.y = time.current * LOOK.spin}
    if (system.current && !reducedMotion) {
      system.current.rotation.y += (pointer.current.x * 0.12 - system.current.rotation.y) * k
      system.current.rotation.x += (pointer.current.y * 0.06 - system.current.rotation.x) * k
    }

    const pulse = running ? 0.55 + 0.45 * Math.sin(time.current * 1.6) : 0
    const focus = verdict ? 1 : hot ? 0.9 : pulse
    planet.uniforms.uFocus.value += (focus - planet.uniforms.uFocus.value) * k
    atmosphere.uniforms.uGlow.value += ((verdict ? 0.45 : hot ? 0.5 : running ? 0.18 : 0) - atmosphere.uniforms.uGlow.value) * k
    ring.uniforms.uTime.value = time.current * 3

    // Tint toward the verdict; back to the lacquer's own copper otherwise.
    tmp.copy(verdict ?? baseAccent)
    planet.uniforms.uAccent.value.lerp(tmp, k)
    ring.uniforms.uAccent.value.lerp(tmp, k)
    band.uniforms.uColor.value.lerp(verdict ?? baseAccent, k)
    tmp.copy(verdict ?? baseAtmo)
    planet.uniforms.uAtmo.value.lerp(tmp, k)
    atmosphere.uniforms.uAtmo.value.lerp(tmp, k)

    // The band eases toward its target instead of jumping between steps.
    shown.current += (progress - shown.current) * (1 - Math.exp(-dt * 2.2))
    band.uniforms.uProgress.value = reducedMotion ? progress : shown.current
    band.uniforms.uSweep.value = mode === 'waking' ? 1 : 0
    band.uniforms.uTicks.value = mode === 'running' ? ticks : 0
    band.uniforms.uThreshold.value = verdict && threshold !== null ? threshold : -1
    band.uniforms.uTime.value = time.current
    const bandTarget = mode === 'idle' ? (hot ? 0.6 : 0) : 1
    band.uniforms.uOpacity.value += (bandTarget - band.uniforms.uOpacity.value) * k

    // Adaptive resolution: step the pixel ratio down if frames run long.
    const times = frameTimes.current
    times.push(delta)
    if (times.length === 90) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const dpr = gl.getPixelRatio()
      if (avg > 1 / 45 && dpr > 1) {setDpr(Math.max(1, dpr - 0.25))}
      times.length = 0
    }

    if (!ready.current) {
      ready.current = true
      requestAnimationFrame(() => onReady?.())
    }
  })

  return (
    <>
      <Sky />
      <Stars time={time} />
      <group ref={system}>
        <group rotation={[0.1, 0, -0.16]} scale={LOOK.size}>
          <mesh ref={spin} geometry={geometry} material={planet} />
          <mesh geometry={geometry} material={atmosphere} scale={1.1} />
          <mesh geometry={grooves} material={ring} rotation={[RING_TILT, 0, 0]} />
          <mesh geometry={bandGeometry} material={band} rotation={[RING_TILT, 0, 0]} />
        </group>
      </group>
    </>
  )
}

export default function AurisWorld({ active, ...props }: AurisWorldProps) {
  const [maxDpr] = useState(() => (typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1.5 : 1.75)))
  // Without WebGL the page keeps the still of this scene it already shows behind it.
  return (
    <WebGLGuard>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, maxDpr]}
        flat
        camera={{ fov: 34, near: 0.1, far: 800, position: [0, 3, 14] }}
        gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor('#07070a')}
        aria-hidden="true"
      >
        <Scene {...props} />
      </Canvas>
    </WebGLGuard>
  )
}
