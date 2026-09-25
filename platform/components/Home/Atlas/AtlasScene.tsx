/**
 * CrownCode Atlas — the WebGL scene behind the homepage showroom.
 *
 * Projects are worlds on a tilted helix that recedes into depth (−Z). Scroll
 * progress picks a point on a camera path that starts at the crown, stops
 * beside every world and ends looking back over the whole route. The system
 * rolls as you travel, so the sky wheels around the camera while it closes
 * in on each world. Loaded client-side only (see ProjectExplorer).
 */

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { WorldLook, WorldPlacement } from '@/config/showroom-worlds'
import {
  atmosphereFragment, atmosphereVertex, glowFragment, glowVertex, planetFragment, planetVertex,
  pointsFragment, pointsVertex, ringFragment, ringVertex, routeFragment, routeVertex,
} from './shaders'

export interface AtlasWorld {
  id: string
  look: WorldLook
  placement: WorldPlacement
}

/** Mutable state shared with the DOM layer; written on scroll, read per frame. */
export interface AtlasState {
  /** Scroll progress through the journey, 0..1. */
  target: number
  /** Pointer position, -1..1, for a little parallax. */
  pointer: { x: number; y: number }
  /** Seconds; only used when `capture` is on (deterministic video frames). */
  time: number
}

interface AtlasSceneProps {
  worlds: AtlasWorld[]
  state: MutableRefObject<AtlasState>
  labels: MutableRefObject<(HTMLElement | null)[]>
  active: boolean
  capture: boolean
  onReady: () => void
}

const KEY_LIGHT = new THREE.Vector3(-0.45, 0.55, 0.7).normalize()
const CROWN_POSITION = new THREE.Vector3(0, 0, 1.5)
const GOLD = new THREE.Color('#e7c77a')

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Station coordinate → path parameter, holding still around each station. */
export function stationEase(progress: number, stationCount: number): number {
  const s = Math.min(1, Math.max(0, progress)) * (stationCount - 1)
  const k = Math.min(stationCount - 2, Math.floor(s))
  const f = s - k
  return (k + smoothstep(0.14, 0.86, f)) / (stationCount - 1)
}

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps)
  useEffect(() => () => value.dispose(), [value])
  return value
}

function Sky() {
  const texture = useDisposable(() => {
    const t = new THREE.TextureLoader().load('/images/atlas/nebula.webp')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) {ref.current.rotation.y += dt * 0.003}
  })
  return (
    <mesh ref={ref} rotation={[0.35, 0.8, 0.15]}>
      <sphereGeometry args={[420, 48, 24]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Points({ positions, sizes, colors, time }: {
  positions: Float32Array
  sizes: Float32Array
  colors: Float32Array
  time: MutableRefObject<number>
}) {
  const gl = useThree((s) => s.gl)
  const geometry = useDisposable(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    const phase = new Float32Array(sizes.length)
    const rand = seeded(sizes.length)
    for (let i = 0; i < phase.length; i++) {phase[i] = rand() * Math.PI * 2}
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return g
  }, [positions, sizes, colors])
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

function Stars({ time }: { time: MutableRefObject<number> }) {
  const data = useMemo(() => {
    const count = 2200
    const rand = seeded(7)
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const warm = new THREE.Color('#f3dcb2')
    const cool = new THREE.Color('#b9c8dc')
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1
      const a = rand() * Math.PI * 2
      const r = 90 + rand() * 200
      const s = Math.sqrt(1 - u * u)
      positions.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3)
      const big = rand() > 0.97
      sizes[i] = (big ? 2.6 : 0.8 + rand() * 1.2) * (r / 60)
      c.copy(warm).lerp(cool, rand()).multiplyScalar(big ? 1 : 0.55 + rand() * 0.4)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    return { positions, sizes, colors }
  }, [])
  return <Points {...data} time={time} />
}

function Dust({ curve, time }: { curve: THREE.CatmullRomCurve3; time: MutableRefObject<number> }) {
  const data = useMemo(() => {
    const count = 2600
    const rand = seeded(19)
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const point = new THREE.Vector3()
    const gold = new THREE.Color('#d9a45c')
    const ember = new THREE.Color('#8a5a2e')
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      curve.getPointAt(rand(), point)
      const spread = 0.35 + Math.pow(rand(), 2) * 3.4
      const a = rand() * Math.PI * 2
      point.x += Math.cos(a) * spread
      point.y += Math.sin(a) * spread * 0.6
      point.z += (rand() - 0.5) * 3
      positions.set([point.x, point.y, point.z], i * 3)
      sizes[i] = 0.25 + rand() * 0.7
      c.copy(ember).lerp(gold, rand()).multiplyScalar(0.5 + rand() * 0.5)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    return { positions, sizes, colors }
  }, [curve])
  return <Points {...data} time={time} />
}

function Route({ curve, travelled, time }: {
  curve: THREE.CatmullRomCurve3
  travelled: MutableRefObject<number>
  time: MutableRefObject<number>
}) {
  const geometry = useDisposable(() => new THREE.TubeGeometry(curve, 520, 0.028, 6, false), [curve])
  const material = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: routeVertex,
    fragmentShader: routeFragment,
    uniforms: { uColor: { value: GOLD.clone() }, uTime: { value: 0 }, uTravelled: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])
  useFrame(() => {
    material.uniforms.uTime.value = time.current
    material.uniforms.uTravelled.value = travelled.current
  })
  return <mesh geometry={geometry} material={material} />
}

function Crown({ time }: { time: MutableRefObject<number> }) {
  const texture = useDisposable(() => {
    const t = new THREE.TextureLoader().load('/images/atlas/crown.png')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const glow = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    uniforms: { uColor: { value: new THREE.Color('#f0b96a') }, uIntensity: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])
  const glowRef = useRef<THREE.Mesh>(null)
  const camera = useThree((s) => s.camera)
  useFrame(() => {
    glowRef.current?.quaternion.copy(camera.quaternion)
    glow.uniforms.uIntensity.value = 0.85 + Math.sin(time.current * 0.8) * 0.08
  })
  return (
    <group position={CROWN_POSITION}>
      <mesh ref={glowRef} material={glow}>
        <planeGeometry args={[13, 13]} />
      </mesh>
      <sprite scale={[3.1, 3.1, 1]}>
        <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

function World({ world, index, geometry, focus, time }: {
  world: AtlasWorld
  index: number
  geometry: THREE.SphereGeometry
  focus: MutableRefObject<number[]>
  time: MutableRefObject<number>
}) {
  const { look, placement } = world
  const spinRef = useRef<THREE.Mesh>(null)
  const planet = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: planetVertex,
    fragmentShader: planetFragment,
    uniforms: {
      uBase: { value: new THREE.Color(look.base) },
      uMid: { value: new THREE.Color(look.mid) },
      uAccent: { value: new THREE.Color(look.accent) },
      uAtmo: { value: new THREE.Color(look.atmosphere) },
      // World-space key light: the system rolls underneath it, so each
      // world's day side swings around as you travel.
      uLight: { value: KEY_LIGHT.clone() },
      uBands: { value: look.bands },
      uDetail: { value: look.detail },
      uLines: { value: look.lines },
      uGloss: { value: look.gloss },
      uSeed: { value: index * 7.31 + 3.1 },
      uFocus: { value: 0 },
    },
  }), [look, index])
  const atmosphere = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    uniforms: { uAtmo: { value: new THREE.Color(look.atmosphere) }, uLight: { value: KEY_LIGHT.clone() } },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [look])
  const ring = useDisposable(() => new THREE.ShaderMaterial({
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    uniforms: {
      uAccent: { value: new THREE.Color(look.accent) },
      uMid: { value: new THREE.Color(look.mid) },
      uInner: { value: 1.45 },
      uOuter: { value: 2.4 },
      uStyle: { value: look.ring === 'grooves' ? 0 : look.ring === 'wheel' ? 1 : 2 },
      uTime: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  }), [look])
  const ringGeometry = useDisposable(() => new THREE.RingGeometry(1.45, 2.4, 180, 1), [])

  useFrame(() => {
    if (spinRef.current) {spinRef.current.rotation.y = time.current * look.spin + index}
    planet.uniforms.uFocus.value = focus.current[index] ?? 0
    ring.uniforms.uTime.value = time.current
  })

  return (
    <group position={placement.position} rotation={[placement.tilt[0], 0, placement.tilt[1]]} scale={look.size}>
      <mesh ref={spinRef} geometry={geometry} material={planet} />
      <mesh geometry={geometry} material={atmosphere} scale={1.1} />
      {look.ring && (
        <mesh geometry={ringGeometry} material={ring} rotation={[-Math.PI / 2 + 0.12, 0, 0]} />
      )}
    </group>
  )
}

function Rig({ worlds, state, labels, capture, onReady }: Omit<AtlasSceneProps, 'active'>) {
  const { camera, size, gl, setDpr } = useThree()
  const system = useRef<THREE.Group>(null)
  const time = useRef(0)
  const smoothed = useRef(state.current.target)
  const travelled = useRef(0)
  const focus = useRef<number[]>(worlds.map(() => 0))
  const pointer = useRef({ x: 0, y: 0 })
  const ready = useRef(false)
  const frameTimes = useRef<number[]>([])
  const portrait = size.width / size.height < 0.8
  const stationCount = worlds.length + 2

  const geometry = useDisposable(() => new THREE.SphereGeometry(1, 96, 64), [])

  const route = useMemo(() => new THREE.CatmullRomCurve3(
    [CROWN_POSITION.clone(), ...worlds.map((w) => new THREE.Vector3(...w.placement.position))],
    false, 'centripetal', 0.5,
  ), [worlds])

  // Arc-length fraction of each route point, so the "travelled" glow lines
  // up with the station the camera is at.
  const routeArc = useMemo(() => {
    const pts = route.points
    const acc = [0]
    for (let i = 1; i < pts.length; i++) {acc.push(acc[i - 1] + pts[i].distanceTo(pts[i - 1]))}
    const total = acc[acc.length - 1] || 1
    return acc.map((d) => d / total)
  }, [route])

  const paths = useMemo(() => {
    const cams: THREE.Vector3[] = []
    const targets: THREE.Vector3[] = []
    const last = worlds[worlds.length - 1]?.placement.position ?? [0, 0, -10]
    cams.push(new THREE.Vector3(2.4, 1.3, 15.5))
    targets.push(new THREE.Vector3(0, -0.2, -10))
    for (const w of worlds) {
      const [x, y, z] = w.placement.position
      const radial = new THREE.Vector2(x, y).normalize()
      const dir = new THREE.Vector3(radial.x * 0.55, radial.y * 0.55 + 0.32, 1).normalize()
      const distance = w.look.size * (portrait ? 5.2 : 3.6) + (w.look.ring ? 1.2 : 0)
      const pos = new THREE.Vector3(x, y, z)
      cams.push(pos.clone().addScaledVector(dir, distance))
      targets.push(pos)
    }
    cams.push(new THREE.Vector3(0.5, 4.5, last[2] - 16))
    targets.push(new THREE.Vector3(0, 0, last[2] * 0.42))
    return {
      camera: new THREE.CatmullRomCurve3(cams, false, 'centripetal', 0.5),
      target: new THREE.CatmullRomCurve3(targets, false, 'centripetal', 0.5),
    }
  }, [worlds, portrait])

  // Frame the subject off-centre: right of the copy on wide screens, above
  // the bottom sheet on tall ones.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const w = size.width
    const h = size.height
    if (portrait) {cam.setViewOffset(w, h, 0, h * 0.13, w, h)}
    else {cam.setViewOffset(w, h, -w * 0.13, 0, w, h)}
    cam.fov = portrait ? 58 : 42
    cam.updateProjectionMatrix()
    return () => cam.clearViewOffset()
  }, [camera, size, portrait])

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      state.current.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      state.current.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => window.removeEventListener('pointermove', onPointer)
  }, [state])

  const tmp = useMemo(() => ({
    camLocal: new THREE.Vector3(),
    targetLocal: new THREE.Vector3(),
    up: new THREE.Vector3(),
    world: new THREE.Vector3(),
    projected: new THREE.Vector3(),
  }), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    time.current = capture ? state.current.time : time.current + dt

    // Scroll progress, damped so the flight glides instead of stepping.
    const goal = state.current.target
    smoothed.current = capture ? goal : smoothed.current + (goal - smoothed.current) * (1 - Math.exp(-4 * dt))
    const u = stationEase(smoothed.current, stationCount)
    const s = u * (stationCount - 1)

    for (let i = 0; i < worlds.length; i++) {
      focus.current[i] = Math.max(0, 1 - Math.abs(s - (i + 1)) * 1.6)
    }
    const routeIndex = Math.min(routeArc.length - 1, Math.max(0, s))
    const lo = Math.floor(routeIndex)
    const hi = Math.min(routeArc.length - 1, lo + 1)
    travelled.current = routeArc[lo] + (routeArc[hi] - routeArc[lo]) * (routeIndex - lo)

    const group = system.current
    if (!group) {return}
    // The system is tilted off the horizon and rolls as you travel.
    group.rotation.set(0.16, -0.3, -0.42 + u * 1.15 + (capture ? 0 : time.current * 0.004))
    group.updateMatrixWorld()

    pointer.current.x += (state.current.pointer.x - pointer.current.x) * (1 - Math.exp(-2.5 * dt))
    pointer.current.y += (state.current.pointer.y - pointer.current.y) * (1 - Math.exp(-2.5 * dt))
    paths.camera.getPoint(u, tmp.camLocal)
    paths.target.getPoint(u, tmp.targetLocal)
    if (!capture) {
      tmp.camLocal.x += pointer.current.x * 0.35
      tmp.camLocal.y -= pointer.current.y * 0.22
    }
    camera.position.copy(group.localToWorld(tmp.camLocal))
    tmp.up.set(0, 1, 0).applyQuaternion(group.quaternion)
    camera.up.copy(tmp.up)
    camera.lookAt(group.localToWorld(tmp.targetLocal))

    // Map labels follow their worlds on screen (written straight to the DOM).
    const cam = camera as THREE.PerspectiveCamera
    const halfHeight = Math.tan((cam.fov * Math.PI) / 360)
    worlds.forEach((w, i) => {
      const el = labels.current[i]
      if (!el) {return}
      tmp.world.set(...w.placement.position)
      group.localToWorld(tmp.world)
      const distance = cam.position.distanceTo(tmp.world)
      tmp.projected.copy(tmp.world).project(cam)
      const behind = tmp.projected.z > 1
      const x = (tmp.projected.x * 0.5 + 0.5) * size.width
      const y = (-tmp.projected.y * 0.5 + 0.5) * size.height
      const radiusPx = (w.look.size / (distance * halfHeight)) * (size.height / 2)
      const onScreen = x > -80 && x < size.width + 40 && y > 40 && y < size.height - 90
      const visible = behind || !onScreen ? 0 : (1 - focus.current[i]) * Math.min(1, Math.max(0, 1.5 - distance / 70))
      el.style.opacity = visible.toFixed(3)
      el.style.transform = `translate3d(${(x + radiusPx + 10).toFixed(1)}px, ${(y - 10).toFixed(1)}px, 0)`
      el.style.pointerEvents = visible > 0.35 ? 'auto' : 'none'
    })

    // Adaptive resolution: step the pixel ratio down if frames run long.
    if (!capture) {
      const times = frameTimes.current
      times.push(dt)
      if (times.length === 90) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length
        const dpr = gl.getPixelRatio()
        if (avg > 1 / 45 && dpr > 1) {setDpr(Math.max(1, dpr - 0.25))}
        times.length = 0
      }
    }

    if (!ready.current) {
      ready.current = true
      requestAnimationFrame(() => onReady())
    }
  })

  return (
    <>
      <Sky />
      <Stars time={time} />
      <group ref={system}>
        <Crown time={time} />
        <Route curve={route} travelled={travelled} time={time} />
        <Dust curve={route} time={time} />
        {worlds.map((world, index) => (
          <World key={world.id} world={world} index={index} geometry={geometry} focus={focus} time={time} />
        ))}
      </group>
    </>
  )
}

export default function AtlasScene({ worlds, state, labels, active, capture, onReady }: AtlasSceneProps) {
  const maxDpr = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1.5 : 1.75)
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={capture ? (typeof window === 'undefined' ? 1 : window.devicePixelRatio) : [1, maxDpr]}
      flat
      camera={{ fov: 42, near: 0.1, far: 1200, position: [0, 0, 16] }}
      gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: capture }}
      onCreated={({ gl }) => gl.setClearColor('#07070a')}
      aria-hidden="true"
    >
      <Rig worlds={worlds} state={state} labels={labels} capture={capture} onReady={onReady} />
    </Canvas>
  )
}
