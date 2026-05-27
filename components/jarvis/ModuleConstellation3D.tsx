'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { TelemetryValue } from './TelemetryValue'

interface ModuleConstellation3DProps {
  totalMasteryPercent: number
}

export function ModuleConstellation3D({ totalMasteryPercent }: ModuleConstellation3DProps) {
  const modules = getAllModules().slice(0, 12)

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
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} color="#00f0ff" intensity={1.2} />
        {/* Scene layers land in T6; interaction lands in T7. */}
      </Canvas>

      {/* Mastery % overlay -- hoisted OUT of R3F per the 9cb015f fix pattern. */}
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

      {/* Hidden accessible nav -- outside the canvas so keyboard + screen reader users get the same module list as the SVG fallback. */}
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
