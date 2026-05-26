'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ModuleConstellationSVG } from './ModuleConstellationSVG'

const ModuleConstellation3D = dynamic(
  () => import('./ModuleConstellation3D').then((m) => m.ModuleConstellation3D),
  { ssr: false, loading: () => <ModuleConstellationSVG totalMasteryPercent={0} /> }
)

interface ModuleConstellationProps {
  totalMasteryPercent: number
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export function ModuleConstellation({ totalMasteryPercent }: ModuleConstellationProps) {
  const [mode, setMode] = useState<'svg' | '3d' | null>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !hasWebGL()) {
      setMode('svg')
    } else {
      setMode('3d')
    }
  }, [])

  if (mode === null) {
    // SSR fallback: render SVG synchronously so first paint shows something
    return <ModuleConstellationSVG totalMasteryPercent={totalMasteryPercent} />
  }
  if (mode === 'svg') {
    return <ModuleConstellationSVG totalMasteryPercent={totalMasteryPercent} />
  }
  return <ModuleConstellation3D totalMasteryPercent={totalMasteryPercent} />
}
