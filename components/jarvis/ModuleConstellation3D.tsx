'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrthographicCamera, Text } from '@react-three/drei'
import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import type { ModuleId } from '@/lib/types'
import * as THREE from 'three'

const PHASE_EMISSIVE: Record<1 | 2 | 3, string> = {
  1: '#00f0ff',
  2: '#ffb800',
  3: '#808080'
}

const SHORT_LABEL: Record<ModuleId, string> = {
  '01-foundations': 'FOUNDATIONS',
  '02-protocols': 'PROTOCOLS',
  '03-microsoft-identity': 'MS IDENTITY',
  '04-pam': 'PAM',
  '05-iga': 'IGA',
  '06-powershell': 'POWERSHELL',
  '07-cloud-iam': 'CLOUD IAM',
  '08-security-detection': 'SECURITY',
  '09-compliance': 'COMPLIANCE',
  '10-program-leadership': 'LEADERSHIP',
  '11-cert-roadmap': 'CERTS',
  '12-labs': 'LABS'
}

interface ModuleConstellation3DProps {
  totalMasteryPercent: number
}

function ParallaxCamera() {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    target.current.x = state.pointer.x * 0.3
    target.current.y = state.pointer.y * 0.3
    camera.position.x += (target.current.x - camera.position.x) * 0.05
    camera.position.y += (target.current.y - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })
  return null
}

function MasteryCore({ percent }: { percent: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.15
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.07
  })
  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>
      <Html center distanceFactor={8}>
        <div className="pointer-events-none whitespace-nowrap text-center">
          <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong tabular-nums">
            {Math.round(percent)}
            <span className="ml-1 text-2xl text-cyan/60">%</span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
            CURRICULUM MASTERY
          </div>
        </div>
      </Html>
    </group>
  )
}

function ModuleNode({
  index,
  module: m
}: {
  index: number
  module: ReturnType<typeof getAllModules>[number]
}) {
  const angleDeg = index * 30 - 90
  const rad = (angleDeg * Math.PI) / 180
  const r = 4.2
  const x = r * Math.cos(rad)
  const y = -r * Math.sin(rad) // negate y so top is +y in Three's coord system
  const phase = m.phase as 1 | 2 | 3
  const color = PHASE_EMISSIVE[phase]

  return (
    <group position={[x, y, 0]}>
      <mesh>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Text
        position={[0, 0, 0.5]}
        fontSize={0.32}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {String(m.order).padStart(2, '0')}
      </Text>
      <Text
        position={[0, -0.85, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {SHORT_LABEL[m.id]}
      </Text>
      {/* Invisible HTML overlay for click + a11y */}
      <Html center>
        <Link
          href={`/modules/${m.id}`}
          aria-label={`${m.order}. ${m.title}`}
          className="block size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          title={m.title}
        />
      </Html>
    </group>
  )
}

function OrbitalRings() {
  const ringARef = useRef<THREE.Mesh>(null)
  const ringBRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ringARef.current) ringARef.current.rotation.z = t * 0.15
    if (ringBRef.current) ringBRef.current.rotation.z = -t * 0.1
  })
  return (
    <group>
      <mesh ref={ringARef}>
        <ringGeometry args={[4.5, 4.55, 64]} />
        <meshBasicMaterial color="#00f0ff" opacity={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringBRef}>
        <ringGeometry args={[5.1, 5.13, 96]} />
        <meshBasicMaterial color="#00f0ff" opacity={0.08} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function ModuleConstellation3D({ totalMasteryPercent }: ModuleConstellation3DProps) {
  const modules = getAllModules()
  return (
    <div className="relative" style={{ width: 600, height: 600 }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          // Force the WebGL clear to fully transparent so the page-level
          // AmbientBackground gradient + dot grid bleed through the
          // canvas area instead of a dark rectangle showing.
          gl.setClearColor(0x000000, 0)
        }}
      >
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 5]} color="#00f0ff" intensity={2} />
        <ParallaxCamera />
        <OrbitalRings />
        <MasteryCore percent={totalMasteryPercent} />
        {modules.map((m, i) => (
          <ModuleNode key={m.id} index={i} module={m} />
        ))}
      </Canvas>
      {/* Hidden accessible nav for screen readers */}
      <nav aria-label="Module navigation" className="sr-only">
        <ul>
          {modules.map((m) => (
            <li key={m.id}>
              <Link href={`/modules/${m.id}`}>
                {m.order}. {m.title} (Phase {m.phase})
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
