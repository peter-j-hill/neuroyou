'use client'

import { useEffect, useRef } from 'react'
import {
  ORIGIN_BOX, ORIGIN_PAGE, buildField, flicker, pulse, zoomFrame, type ZoomFrame,
} from '@/lib/protocols/neuron-timing'

// The neuron field (Steps 4 and 5): dots that flicker, links that pulse between neighbours, and the slow zoom
// out to one point. One canvas, so it stays smooth on a phone. All timings live in lib/protocols/neuron-timing.ts.

const GLOW = '230, 241, 245'

export default function NeuronField({
  mode = 'page',
  zoom,
  zoomKey,
  onRest,
}: {
  /** 'page': fills the screen behind the text. 'box': fills its parent. */
  mode?: 'page' | 'box'
  /** Step 5: play the zoom out. */
  zoom: boolean
  /** Changing this restarts the zoom ("Replay the zoom"). */
  zoomKey: number
  /** Called every frame of the zoom with how visible "Rest here…" should be (0 to 1). */
  onRest?: (opacity: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onRestRef = useRef(onRest)

  useEffect(() => {
    onRestRef.current = onRest
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const origin = mode === 'page' ? ORIGIN_PAGE : ORIGIN_BOX
    let width = 0
    let height = 0
    let field = buildField(1, 1)
    let raf = 0
    let stopped = false
    const started = performance.now()
    const zoomStarted = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      field = buildField(width, height)
    }

    const draw = (now: number) => {
      const t = (now - started) / 1000
      const zf: ZoomFrame | null = zoom ? zoomFrame((now - zoomStarted) / 1000, reduced) : null
      const ox = origin.x * width
      const oy = origin.y * height

      ctx.clearRect(0, 0, width, height)
      if (!zf || zf.field > 0.001) {
        ctx.save()
        if (zf) {
          ctx.globalAlpha = zf.field
          ctx.translate(ox, oy)
          ctx.scale(zf.scale, zf.scale)
          ctx.translate(-ox, -oy)
        }
        if (!reduced) {
          for (const l of field.links) {
            const a = field.points[l.a]
            const b = field.points[l.b]
            const alpha = pulse((((t + l.delay) % l.period) + l.period) % l.period / l.period)
            if (alpha < 0.01) continue
            const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
            g.addColorStop(0, `rgba(${GLOW}, 0)`)
            g.addColorStop(0.5, `rgba(${GLOW}, ${alpha})`)
            g.addColorStop(1, `rgba(${GLOW}, 0)`)
            ctx.strokeStyle = g
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        for (const p of field.points) {
          const alpha = reduced ? 0.7 : flicker((((t + p.delay) % p.period) + p.period) % p.period / p.period)
          ctx.fillStyle = `rgba(${GLOW}, ${alpha * 0.16})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = `rgba(${GLOW}, ${alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      if (zf && zf.last > 0.001) {
        ctx.fillStyle = `rgba(${GLOW}, ${zf.last * 0.22})`
        ctx.beginPath()
        ctx.arc(ox, oy, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(255, 255, 255, ${zf.last})`
        ctx.beginPath()
        ctx.arc(ox, oy, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      if (zf) onRestRef.current?.(zf.rest)
      return zf
    }

    const frame = (now: number) => {
      if (stopped) return
      const zf = draw(now)
      if (zf?.done) return // the field is dark and "Rest here…" is showing: nothing more to draw
      raf = requestAnimationFrame(frame)
    }

    resize()
    const observer = new ResizeObserver(() => {
      resize()
      if (reduced && !zoom) draw(performance.now())
    })
    observer.observe(canvas)

    if (reduced && !zoom) draw(performance.now()) // a still picture; nothing moves
    else raf = requestAnimationFrame(frame)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
    // zoomKey restarts the zoom; a new run needs a fresh start time.
  }, [mode, zoom, zoomKey])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={mode === 'page' ? 'pointer-events-none fixed inset-0 z-0 h-full w-full' : 'pointer-events-none absolute inset-0 h-full w-full'}
    />
  )
}

