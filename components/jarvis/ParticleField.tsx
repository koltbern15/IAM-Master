'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/media-query'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

interface ParticleFieldProps {
  count?: number
  connectionDistance?: number
  className?: string
}

export function ParticleField({
  count = 50,
  connectionDistance = 120,
  className
}: ParticleFieldProps) {
  const [enabled, setEnabled] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Downshift particle count on weak hardware
    const hwCores = navigator.hardwareConcurrency ?? 4
    const effectiveCount = hwCores < 4 ? Math.floor(count * 0.4) : count

    const particles: Particle[] = Array.from({ length: effectiveCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }))

    // Spatial bucketing for the constellation pass: only particles within one
    // grid cell (sized to the connection radius) can possibly link, so we never
    // run the full O(n^2) pairwise scan. Cap connections per particle as well.
    const cellSize = connectionDistance
    const maxLinksPerParticle = 6
    const grid = new Map<number, Particle[]>()
    const cols = () => Math.max(1, Math.ceil(width / cellSize))
    const cellKey = (cx: number, cy: number) => cy * cols() + cx

    let rafId = 0
    function tick() {
      ctx!.clearRect(0, 0, width, height)
      grid.clear()
      // Update + draw particles, binning each into its grid cell
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
        ctx!.fillStyle = 'rgba(0, 240, 255, 0.22)'
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
        ctx!.fill()

        const key = cellKey(
          Math.floor(p.x / cellSize),
          Math.floor(p.y / cellSize)
        )
        const bucket = grid.get(key)
        if (bucket) bucket.push(p)
        else grid.set(key, [p])
      }
      // Constellation lines — compare each particle only against its own cell
      // and the 8 neighbors, capping links so a dense cluster can't blow up.
      for (const p of particles) {
        const pcx = Math.floor(p.x / cellSize)
        const pcy = Math.floor(p.y / cellSize)
        let links = 0
        for (let oy = -1; oy <= 1 && links < maxLinksPerParticle; oy++) {
          for (let ox = -1; ox <= 1 && links < maxLinksPerParticle; ox++) {
            const bucket = grid.get(cellKey(pcx + ox, pcy + oy))
            if (!bucket) continue
            for (const q of bucket) {
              if (q === p) continue
              // Only draw each pair once (ordering by x, then y as tiebreak).
              if (q.x < p.x || (q.x === p.x && q.y <= p.y)) continue
              const dx = p.x - q.x
              const dy = p.y - q.y
              const dist = Math.hypot(dx, dy)
              if (dist < connectionDistance) {
                const alpha = (1 - dist / connectionDistance) * 0.08
                ctx!.strokeStyle = `rgba(0, 240, 255, ${alpha})`
                ctx!.lineWidth = 1
                ctx!.beginPath()
                ctx!.moveTo(p.x, p.y)
                ctx!.lineTo(q.x, q.y)
                ctx!.stroke()
                if (++links >= maxLinksPerParticle) break
              }
            }
          }
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    function onResize() {
      width = canvas!.width = window.innerWidth
      height = canvas!.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [enabled, count, connectionDistance])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-10', className)}
    />
  )
}
