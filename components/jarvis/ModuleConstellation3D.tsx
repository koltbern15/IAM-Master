'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, PerspectiveCamera, Points, PointMaterial, Text } from '@react-three/drei'
import Link from 'next/link'
import * as THREE from 'three'
import { getAllModules } from '@/lib/content'
import { prefersReducedMotion } from '@/lib/media-query'
import { TelemetryValue } from './TelemetryValue'
import type { ModuleMeta } from '@/lib/types'

// Module data is static at runtime (modules.json is bundled). Compute the
// home page's 12-node slice once at module scope so React's useMemo dep
// stays stable across renders instead of seeing a fresh array each tick.
const HOME_MODULES = getAllModules().slice(0, 12)

interface ModuleConstellation3DProps {
  totalMasteryPercent: number
}

const PHASE_COLOR: Record<1 | 2 | 3, string> = {
  1: '#00f0ff',
  2: '#ffb800',
  3: '#888888'
}

/** Returns the 12 vertices of an icosahedron of the given radius (golden-ratio derivation). */
function icosahedronVertices(radius: number): THREE.Vector3[] {
  const phi = (1 + Math.sqrt(5)) / 2
  const raw: [number, number, number][] = [
    [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
  ]
  const norm = Math.sqrt(1 + phi * phi)
  return raw.map(([x, y, z]) => new THREE.Vector3((x / norm) * radius, (y / norm) * radius, (z / norm) * radius))
}

/** Samples a cubic bezier curve through P0 -> C1 -> C2 -> P3 at `segments + 1` points. */
function cubicBezierPoints(
  p0: THREE.Vector3,
  c1: THREE.Vector3,
  c2: THREE.Vector3,
  p3: THREE.Vector3,
  segments: number
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const it = 1 - t
    const b0 = it * it * it
    const b1 = 3 * it * it * t
    const b2 = 3 * it * t * t
    const b3 = t * t * t
    pts.push(
      new THREE.Vector3(
        p0.x * b0 + c1.x * b1 + c2.x * b2 + p3.x * b3,
        p0.y * b0 + c1.y * b1 + c2.y * b2 + p3.y * b3,
        p0.z * b0 + c1.z * b1 + c2.z * b2 + p3.z * b3
      )
    )
  }
  return pts
}

/** Spherical-shell point cloud for the ambient particle wash. */
function shellParticles(count: number, rMin: number, rMax: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = rMin + Math.random() * (rMax - rMin)
    arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    arr[i * 3 + 2] = r * Math.cos(phi)
  }
  return arr
}

function CoreShell() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = (clock.getElapsedTime() / 8) * Math.PI * 2
  })
  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[1.8, 0]} />
      <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.85} />
    </mesh>
  )
}

function CorePulse() {
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t = clock.getElapsedTime()
    const k = 0.5 + 0.5 * Math.sin((t / 3) * Math.PI * 2)
    matRef.current.opacity = 0.15 + k * 0.2
    if (ref.current) ref.current.rotation.y = -t * 0.05
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshBasicMaterial ref={matRef} color="#00f0ff" transparent opacity={0.25} />
    </mesh>
  )
}

interface NodeData {
  module: ModuleMeta
  position: THREE.Vector3
  color: string
  arcPoints: THREE.Vector3[]
}

function buildNodes(modules: ModuleMeta[]): NodeData[] {
  const verts = icosahedronVertices(4.5)
  return modules.slice(0, 12).map((m, i) => {
    const p = verts[i]
    const mid = p.clone().multiplyScalar(0.5)
    const outward = mid.clone().normalize().multiplyScalar(1.2)
    const control = mid.clone().add(outward)
    const arc = cubicBezierPoints(new THREE.Vector3(0, 0, 0), control, control, p, 32)
    return {
      module: m,
      position: p,
      color: PHASE_COLOR[m.phase as 1 | 2 | 3],
      arcPoints: arc
    }
  })
}

function ModuleNodeGroup({
  nodes,
  hoveredId,
  onHover,
  onLeave,
  onSelect
}: {
  nodes: NodeData[]
  hoveredId: string | null
  onHover: (id: string) => void
  onLeave: (id: string) => void
  onSelect: (id: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = -(clock.getElapsedTime() / 14) * Math.PI * 2
  })
  // Reset the body cursor on unmount — otherwise hovering a node then
  // navigating away (router.push fires before onPointerOut) leaves the
  // pointer cursor on every subsequent page until another element claims it.
  useEffect(() => () => { document.body.style.cursor = '' }, [])
  return (
    <group ref={groupRef}>
      {nodes.map((n) => {
        const isHovered = hoveredId === n.module.id
        const scale = isHovered ? 1.3 : 1
        return (
          <group key={n.module.id} position={n.position}>
            <mesh
              scale={scale}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
                onHover(n.module.id)
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                document.body.style.cursor = ''
                onLeave(n.module.id)
              }}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(n.module.id)
              }}
            >
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshBasicMaterial color={n.color} />
            </mesh>
            <Text
              position={[0, 0.42, 0]}
              fontSize={0.18}
              color={n.color}
              anchorX="center"
              anchorY="middle"
            >
              {String(n.module.order).padStart(2, '0')}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

function ArcConnections({ nodes, hoveredId }: { nodes: NodeData[]; hoveredId: string | null }) {
  return (
    <>
      {nodes.map((n) => {
        const active = hoveredId === n.module.id
        return (
          <Line
            key={`arc-${n.module.id}`}
            points={n.arcPoints}
            color={n.color}
            lineWidth={active ? 2 : 1}
            transparent
            opacity={active ? 0.85 : 0.25}
          />
        )
      })}
      {hoveredId && <ArcToken node={nodes.find((n) => n.module.id === hoveredId)!} />}
    </>
  )
}

function ArcToken({ node }: { node: NodeData }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const period = 1.8 // seconds
    const t = (clock.getElapsedTime() % period) / period
    const segments = node.arcPoints.length - 1
    const exact = t * segments
    const i0 = Math.floor(exact)
    const i1 = Math.min(segments, i0 + 1)
    const localT = exact - i0
    const a = node.arcPoints[i0]
    const b = node.arcPoints[i1]
    ref.current.position.set(
      a.x + (b.x - a.x) * localT,
      a.y + (b.y - a.y) * localT,
      a.z + (b.z - a.z) * localT
    )
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={node.color} />
    </mesh>
  )
}

function ParallaxCamera({ enabled }: { enabled: boolean }) {
  useFrame((state) => {
    if (!enabled) return
    const targetX = Math.max(-0.6, Math.min(0.6, state.pointer.x * 0.6))
    const targetY = Math.max(-0.6, Math.min(0.6, state.pointer.y * 0.6))
    state.camera.position.x += (targetX - state.camera.position.x) * 0.08
    state.camera.position.y += (targetY - state.camera.position.y) * 0.08
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function AmbientParticles() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => shellParticles(300, 6, 9), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.x = t * 0.01
    ref.current.rotation.y = t * 0.015
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00f0ff" size={0.04} sizeAttenuation depthWrite={false} opacity={0.4} />
    </Points>
  )
}

export function ModuleConstellation3D({ totalMasteryPercent }: ModuleConstellation3DProps) {
  const router = useRouter()
  // HOME_MODULES + nodes are computed once at module scope so this component
  // never reallocates 12 icosahedron vertices + 12 bezier curves per render.
  const nodes = useMemo(() => buildNodes(HOME_MODULES), [])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [parallaxEnabled] = useState(() => !prefersReducedMotion())

  return (
    <div className="relative" style={{ width: 600, height: 600 }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <PerspectiveCamera makeDefault fov={38} position={[0, 0, 12]} near={0.1} far={100} />
        <ParallaxCamera enabled={parallaxEnabled} />
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} color="#00f0ff" intensity={1.2} />
        <CoreShell />
        <CorePulse />
        <ArcConnections nodes={nodes} hoveredId={hoveredId} />
        <ModuleNodeGroup
          nodes={nodes}
          hoveredId={hoveredId}
          onHover={(id) => setHoveredId(id)}
          onLeave={(id) => setHoveredId((current) => (current === id ? null : current))}
          onSelect={(id) => router.push(`/modules/${id}`)}
        />
        <AmbientParticles />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={totalMasteryPercent} />
            <span className="ml-1 text-2xl text-cyan/60">%</span>
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
            CURRICULUM MASTERY
          </div>
        </div>
      </div>

      <nav aria-label="Module navigation" className="sr-only">
        <ul>
          {HOME_MODULES.map((m) => (
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
