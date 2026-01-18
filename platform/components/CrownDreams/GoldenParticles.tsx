'use client'

import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import styles from './GoldenParticles.module.css'

// Neural Network Lines connecting particles
function NeuralConnections({ count = 100 }: { count?: number }) {
  const ref = useRef<THREE.Group>(null)

  const lines = useMemo(() => {
    const lineArray: THREE.Vector3[][] = []
    for (let i = 0; i < count; i++) {
      const startPoint = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      )
      const endPoint = new THREE.Vector3(
        startPoint.x + (Math.random() - 0.5) * 5,
        startPoint.y + (Math.random() - 0.5) * 5,
        startPoint.z + (Math.random() - 0.5) * 3
      )
      lineArray.push([startPoint, endPoint])
    }
    return lineArray
  }, [count])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1
    }
  })

  return (
    <group ref={ref}>
      {lines.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#D4AF37"
            opacity={0.06}
            transparent
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  )
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null)
  const { pointer } = useThree()

  const particles = useMemo(() => {
    const count = 3500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const goldColor = new THREE.Color('#D4AF37')
    const bronzeColor = new THREE.Color('#CD7F32')
    const lightGold = new THREE.Color('#F9E076')
    const purpleColor = new THREE.Color('#9B59B6') // Dream purple accent

    for (let i = 0; i < count; i++) {
      // Spherical distribution with some randomness
      const theta = THREE.MathUtils.randFloatSpread(360)
      const phi = THREE.MathUtils.randFloatSpread(360)
      const r = 8 + THREE.MathUtils.randFloatSpread(8)

      const x = r * Math.sin(theta) * Math.cos(phi)
      const y = r * Math.sin(theta) * Math.sin(phi)
      const z = r * Math.cos(theta) * 0.5

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Vary colors between gold, bronze, light gold, and purple
      const colorChoice = Math.random()
      let color: THREE.Color
      if (colorChoice < 0.4) {
        color = goldColor
      } else if (colorChoice < 0.65) {
        color = bronzeColor
      } else if (colorChoice < 0.85) {
        color = lightGold
      } else {
        color = purpleColor
      }

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (ref.current) {
      // Slow base rotation
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.025
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.015

      // Subtle mouse interaction
      ref.current.rotation.x += pointer.y * 0.03
      ref.current.rotation.y += pointer.x * 0.03

      // Gentle floating motion
      ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.4
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <Points
        ref={ref}
        positions={particles.positions}
        colors={particles.colors}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={0.035}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </Points>
    </group>
  )
}

// Floating orbs for ambient glow
function FloatingOrbs({ count = 8 }: { count?: number }) {
  const orbs = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 2,
      ] as [number, number, number],
      scale: 0.4 + Math.random() * 0.8,
      speed: 0.4 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? '#9B59B6' : '#D4AF37', // Some purple orbs
    }))
  }, [count])

  return (
    <>
      {orbs.map((orb, i) => (
        <OrbMesh key={i} {...orb} />
      ))}
    </>
  )
}

function OrbMesh({
  position,
  scale,
  speed,
  phase,
  color,
}: {
  position: [number, number, number]
  scale: number
  speed: number
  phase: number
  color: string
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed + phase) * 2
      ref.current.position.x = position[0] + Math.cos(state.clock.getElapsedTime() * speed * 0.5 + phase) * 1
    }
  })

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Dream Stars - twinkling effect
function DreamStars({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10
    }

    return positions
  }, [count])

  useFrame((state) => {
    if (ref.current && ref.current.material) {
      const material = ref.current.material as THREE.PointsMaterial
      material.opacity = 0.3 + Math.sin(state.clock.getElapsedTime() * 2) * 0.15
    }
  })

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FFFFFF"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  )
}

function Scene() {
  return (
    <>
      <ParticleField />
      <NeuralConnections count={60} />
      <FloatingOrbs count={8} />
      <DreamStars count={150} />
      <fog attach="fog" args={['#050505', 10, 30]} />
      <ambientLight intensity={0.08} />
    </>
  )
}

export default function GoldenParticles() {
  return (
    <div className={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Gradient overlays for depth */}
      <div className={styles.gradientTop} />
      <div className={styles.gradientBottom} />
      <div className={styles.radialGlow} />
    </div>
  )
}
