'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Admin cover-image editor (Adjust / Crop / Details).
//
// Edits are applied for real: "Apply to post" renders the crop + colour
// adjustments to a canvas at export size, uploads that file through
// /api/upload-image and hands the new URL back. The alt text and focal point
// are returned too and stored on the post (content.hero_alt / hero_focal).
// If nothing visual changed, no new file is made: only alt/focal are returned.

type Adj = { exposure: number; contrast: number; saturation: number; warmth: number }
const NEUTRAL: Adj = { exposure: 0, contrast: 0, saturation: 0, warmth: 0 }

const PRESETS: { name: string; adj: Adj }[] = [
  { name: 'Natural', adj: NEUTRAL },
  { name: 'Vivid Nature', adj: { exposure: 4, contrast: 8, saturation: 35, warmth: 6 } },
  { name: 'Morning', adj: { exposure: 10, contrast: -6, saturation: 12, warmth: 14 } },
  { name: 'Ocean', adj: { exposure: 2, contrast: 6, saturation: 28, warmth: -16 } },
  { name: 'Soft Light', adj: { exposure: 12, contrast: -14, saturation: 6, warmth: 4 } },
  { name: 'Mono', adj: { exposure: 0, contrast: 12, saturation: -100, warmth: 0 } },
]

const SLIDERS: { key: keyof Adj; label: string; min: number; max: number }[] = [
  { key: 'exposure', label: 'Exposure', min: -50, max: 50 },
  { key: 'contrast', label: 'Contrast', min: -50, max: 50 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'warmth', label: 'Warmth', min: -50, max: 50 },
]

// ratio === 0 means "keep the original shape"
const RATIOS: { label: string; ratio: number; use: string }[] = [
  { label: '16:9', ratio: 16 / 9, use: 'Hero, article cover' },
  { label: '4:3', ratio: 4 / 3, use: 'Cards' },
  { label: '1:1', ratio: 1, use: 'Square, social' },
  { label: '1.91:1', ratio: 1.91, use: 'Open Graph' },
  { label: 'Free', ratio: 0, use: 'Original' },
]

const FOCAL_FRACTIONS = [1 / 6, 1 / 2, 5 / 6]
const FOCAL_NAMES = ['top left', 'top', 'top right', 'left', 'centre', 'right', 'bottom left', 'bottom', 'bottom right']
const MAX_EDGE = 2560

const filterCss = (a: Adj) =>
  `brightness(${1 + a.exposure / 100}) contrast(${1 + a.contrast / 100}) saturate(${1 + a.saturation / 100}) ` +
  `sepia(${Math.max(0, a.warmth) / 200}) hue-rotate(${a.warmth < 0 ? a.warmth / 2 : 0}deg)`

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** The part of the image that is kept: the largest `ratio` window, centred on the focal point where it fits. */
function cropRect(iw: number, ih: number, ratio: number, fx: number, fy: number) {
  const r = ratio || iw / ih
  const cw = iw / ih > r ? ih * r : iw
  const ch = iw / ih > r ? ih : iw / r
  return {
    x: clamp(fx * iw - cw / 2, 0, iw - cw),
    y: clamp(fy * ih - ch / 2, 0, ih - ch),
    cw,
    ch,
  }
}

function focalIndexFrom(saved: string): number {
  const m = saved.match(/^\s*([\d.]+)%\s+([\d.]+)%\s*$/)
  if (!m) return 4
  const nearest = (v: number) =>
    FOCAL_FRACTIONS.reduce((best, f, i) => (Math.abs(f * 100 - v) < Math.abs(FOCAL_FRACTIONS[best] * 100 - v) ? i : best), 0)
  return nearest(parseFloat(m[2])) * 3 + nearest(parseFloat(m[1]))
}

const supportsCanvasFilter = () =>
  typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

const pill = 'rounded-full border px-3.5 py-[7px] text-[13px] bg-white transition-colors hover:border-[var(--ny-ink)]'

export default function ImageEditor({
  src,
  title,
  initialAlt,
  initialFocal,
  onBack,
  onApply,
}: {
  src: string
  title: string
  initialAlt: string
  initialFocal: string
  onBack: () => void
  onApply: (result: { url: string; alt: string; focal: string }) => void
}) {
  const [tab, setTab] = useState<'adjust' | 'crop' | 'details'>('adjust')
  const [ratioLabel, setRatioLabel] = useState('Free')
  const [showGrid, setShowGrid] = useState(true)
  const [focalIdx, setFocalIdx] = useState(() => focalIndexFrom(initialFocal))
  const [preset, setPreset] = useState('Natural')
  const [adj, setAdj] = useState<Adj>(NEUTRAL)
  const [alt, setAlt] = useState(initialAlt)
  const [local, setLocal] = useState<string | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [loadError, setLoadError] = useState('')
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const sourceBlob = useRef<Blob | null>(null)

  // Fetch the picture once as a blob so previews and the canvas never hit a cross-origin restriction.
  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(src, { mode: 'cors' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        sourceBlob.current = blob
        url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => { if (!cancelled) { setLocal(url); setNatural({ w: img.naturalWidth, h: img.naturalHeight }) } }
        img.onerror = () => { if (!cancelled) setLoadError('This file could not be read as an image.') }
        img.src = url
      } catch (e) {
        if (!cancelled) setLoadError(`Could not load the image for editing (${e instanceof Error ? e.message : 'network error'}).`)
      }
    })()
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url) }
  }, [src])

  const ratio = RATIOS.find((r) => r.label === ratioLabel) ?? RATIOS[4]
  const fx = FOCAL_FRACTIONS[focalIdx % 3]
  const fy = FOCAL_FRACTIONS[Math.floor(focalIdx / 3)]
  const crop = useMemo(
    () => (natural ? cropRect(natural.w, natural.h, ratio.ratio, fx, fy) : null),
    [natural, ratio.ratio, fx, fy],
  )
  const filter = filterCss(adj)
  const neutral = SLIDERS.every((s) => adj[s.key] === 0)
  const wholeImage = !!natural && !!crop && crop.cw >= natural.w - 0.5 && crop.ch >= natural.h - 0.5

  // Output size: never upscale, longest edge capped at MAX_EDGE.
  const out = useMemo(() => {
    if (!crop) return null
    const r = crop.cw / crop.ch
    if (r >= 1) { const w = Math.min(MAX_EDGE, Math.round(crop.cw)); return { w, h: Math.round(w / r) } }
    const h = Math.min(MAX_EDGE, Math.round(crop.ch)); return { w: Math.round(h * r), h }
  }, [crop])

  // Focal point position inside the kept area, as CSS object-position for the public pages.
  const focalInCrop = crop && natural
    ? {
        x: clamp(((fx * natural.w - crop.x) / crop.cw) * 100, 0, 100),
        y: clamp(((fy * natural.h - crop.y) / crop.ch) * 100, 0, 100),
      }
    : { x: fx * 100, y: fy * 100 }
  const focalCss = `${focalInCrop.x.toFixed(1)}% ${focalInCrop.y.toFixed(1)}%`

  const reset = () => { setAdj(NEUTRAL); setPreset('Natural'); setRatioLabel('Free'); setFocalIdx(4); setError('') }

  const apply = async () => {
    if (!natural || !crop || !out || !local) return
    setError('')
    // Nothing visual changed: keep the existing file, just record alt text and focal point.
    if (neutral && wholeImage) { onApply({ url: src, alt: alt.trim(), focal: focalCss }); return }
    if (!neutral && !supportsCanvasFilter()) {
      setError('This browser cannot apply colour adjustments when saving. Use Chrome, Edge or Firefox, or reset the adjustments.')
      return
    }
    setApplying(true)
    try {
      if (!sourceBlob.current) throw new Error('The image is not loaded yet')
      const bitmap = await createImageBitmap(sourceBlob.current)
      const canvas = document.createElement('canvas')
      canvas.width = out.w
      canvas.height = out.h
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas is not available')
      ctx.imageSmoothingQuality = 'high'
      if (!neutral) ctx.filter = filter
      ctx.drawImage(bitmap, crop.x, crop.y, crop.cw, crop.ch, 0, 0, out.w, out.h)
      bitmap.close()

      // WebP, stepping quality down to stay clear of the 4.5 MB upload limit; JPEG if WebP isn't available.
      let blob: Blob | null = null
      let ext = 'webp'
      for (const q of [0.86, 0.75, 0.62, 0.5]) {
        blob = await canvasBlob(canvas, 'image/webp', q)
        if (blob && blob.type !== 'image/webp') { blob = await canvasBlob(canvas, 'image/jpeg', Math.min(q + 0.04, 0.9)); ext = 'jpg' }
        if (blob && blob.size <= 4 * 1024 * 1024) break
      }
      if (!blob) throw new Error('The image could not be exported')
      if (blob.size > 4.4 * 1024 * 1024) throw new Error('The exported image is still over the 4.5 MB upload limit')

      const form = new FormData()
      form.append('file', new File([blob], `cover.${ext}`, { type: blob.type }))
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const text = await res.text()
      let data: { url?: string; error?: string }
      try { data = JSON.parse(text) } catch { throw new Error(text.slice(0, 160) || `status ${res.status}`) }
      if (!data.url) throw new Error(`${data.error ?? 'Upload failed'} (status ${res.status})`)
      onApply({ url: data.url, alt: alt.trim(), focal: focalCss })
    } catch (e) {
      setError(`Not applied: ${e instanceof Error ? e.message : 'unknown error'}`)
      setApplying(false)
    }
  }

  const shortTitle = title.length > 34 ? title.slice(0, 34) + '…' : title || 'Untitled'
  const ink = 'var(--ny-ink)'
  const frameW = crop ? `min(100%, 880px, calc((100dvh - 300px) * ${crop.cw / crop.ch}))` : '100%'

  return (
    <div className="h-full flex flex-col min-h-0 min-w-0">
      {/* top bar */}
      <div
        className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 h-14 border-b"
        style={{ background: 'var(--ny-glass)', backdropFilter: 'var(--ny-blur)', borderColor: 'var(--ny-line)' }}
      >
        <div className="flex items-center gap-2 text-sm min-w-0" style={{ color: 'var(--ny-ink-3)' }}>
          <button type="button" onClick={onBack} className="whitespace-nowrap truncate" style={{ color: 'var(--ny-tide)' }}>
            ‹ {shortTitle}
          </button>
          <span aria-hidden>›</span>
          <span className="font-medium whitespace-nowrap" style={{ color: ink }}>Cover image</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={reset} className={pill} style={{ borderColor: 'var(--ny-line-strong)' }}>Reset</button>
          <button
            type="button"
            onClick={apply}
            disabled={!natural || applying}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-white whitespace-nowrap transition-colors hover:bg-[var(--ny-tide-deep)] disabled:opacity-50"
            style={{ background: 'var(--ny-tide)' }}
          >
            {applying ? 'Applying…' : 'Apply to post'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* canvas area */}
        <div className="flex flex-col items-center justify-center gap-4 p-5 sm:p-8 min-h-0 min-w-0">
          {loadError ? (
            <p className="text-sm text-center max-w-[420px]" role="alert" style={{ color: 'var(--ny-coral)' }}>{loadError}</p>
          ) : !natural || !crop || !local ? (
            <p className="text-sm" style={{ color: 'var(--ny-ink-4)' }}>Loading image…</p>
          ) : (
            <>
              <div
                className="relative overflow-hidden"
                style={{
                  width: frameW,
                  aspectRatio: `${crop.cw} / ${crop.ch}`,
                  borderRadius: 14,
                  background: 'var(--ny-line)',
                  boxShadow: '0 12px 40px rgba(0,0,0,.08)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={local}
                  alt=""
                  draggable={false}
                  style={{
                    position: 'absolute',
                    maxWidth: 'none',
                    width: `${(100 * natural.w) / crop.cw}%`,
                    left: `${(-100 * crop.x) / crop.cw}%`,
                    top: `${(-100 * crop.y) / crop.ch}%`,
                    filter,
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.35) 1px,transparent 1px)',
                    backgroundSize: '33.333% 33.333%',
                    opacity: showGrid ? 1 : 0,
                  }}
                />
                <div
                  aria-hidden
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    left: `${focalInCrop.x}%`,
                    top: `${focalInCrop.y}%`,
                    width: 28,
                    height: 28,
                    margin: '-14px 0 0 -14px',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,.25)',
                    opacity: tab === 'crop' ? 1 : 0,
                  }}
                />
              </div>
              <div className="flex gap-1 p-1 bg-white rounded-full border max-w-full overflow-x-auto" style={{ borderColor: 'var(--ny-line)' }} role="group" aria-label="Crop shape">
                {RATIOS.map((r) => {
                  const active = r.label === ratioLabel
                  return (
                    <button
                      key={r.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setRatioLabel(r.label)}
                      className="rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap"
                      style={{ background: active ? 'var(--ny-ink)' : 'transparent', color: active ? '#fff' : 'var(--ny-ink-2)' }}
                    >
                      {r.label}
                    </button>
                  )
                })}
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--ny-ink-4)' }}>
                {ratio.label} · {ratio.use}
                {out ? ` · saves at ${out.w} × ${out.h}` : ''}
              </div>
            </>
          )}
          {error && <p className="text-[13px] text-center max-w-[460px]" role="alert" style={{ color: 'var(--ny-coral)' }}>{error}</p>}
        </div>

        {/* side panel */}
        <div className="bg-white border-t lg:border-t-0 lg:border-l lg:overflow-y-auto" style={{ borderColor: 'var(--ny-line)' }}>
          <div className="flex gap-1 p-3 border-b" style={{ borderColor: 'var(--ny-line)' }} role="tablist">
            {([['adjust', 'Adjust'], ['crop', 'Crop'], ['details', 'Details']] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className="flex-1 rounded-lg py-[7px] text-[13px] font-medium"
                style={{ background: tab === k ? 'var(--ny-mist)' : 'transparent', color: tab === k ? ink : 'var(--ny-ink-3)' }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'adjust' && (
            <div className="p-5 flex flex-col gap-[22px]">
              <div>
                <div className="text-xs font-medium mb-2.5" style={{ color: 'var(--ny-ink-3)' }}>Presets</div>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      aria-pressed={preset === p.name}
                      onClick={() => { setPreset(p.name); setAdj({ ...p.adj }) }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className="w-full aspect-square rounded-[10px] overflow-hidden"
                        style={{ outline: `2px solid ${preset === p.name ? 'var(--ny-tide)' : 'transparent'}`, outlineOffset: 2, background: 'var(--ny-mist)' }}
                      >
                        {local && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={local} alt="" className="w-full h-full object-cover block" style={{ filter: filterCss(p.adj) }} />
                        )}
                      </div>
                      <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--ny-ink-2)' }}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {SLIDERS.map((s) => (
                <label key={s.key} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[13px]">
                    <span>{s.label}</span>
                    <span style={{ color: 'var(--ny-ink-4)', fontVariantNumeric: 'tabular-nums' }}>{adj[s.key]}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    value={adj[s.key]}
                    onChange={(e) => { const v = +e.target.value; setPreset('Custom'); setAdj((a) => ({ ...a, [s.key]: v })) }}
                    className="w-full"
                    style={{ accentColor: 'var(--ny-tide)' }}
                  />
                </label>
              ))}
            </div>
          )}

          {tab === 'crop' && (
            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                {RATIOS.map((r) => {
                  const active = r.label === ratioLabel
                  return (
                    <button
                      key={r.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setRatioLabel(r.label)}
                      className="flex items-center justify-between rounded-[10px] border bg-white px-3 py-2.5 text-sm"
                      style={{ borderColor: active ? 'var(--ny-tide)' : 'var(--ny-line)', color: ink }}
                    >
                      <span>{r.label}</span>
                      <span className="text-xs" style={{ color: 'var(--ny-ink-4)' }}>{r.use}</span>
                    </button>
                  )
                })}
              </div>
              <label className="flex items-center justify-between text-sm">
                Rule-of-thirds grid
                <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} style={{ accentColor: 'var(--ny-tide)' }} />
              </label>
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--ny-ink-3)' }}>Focal point</div>
                <p className="m-0 mb-2.5 text-xs" style={{ color: 'var(--ny-ink-4)' }}>
                  The part of the picture that must stay visible when it is cropped smaller on cards and phones.
                </p>
                <div className="grid grid-cols-3 gap-1.5" style={{ gridTemplateColumns: 'repeat(3, 40px)' }}>
                  {FOCAL_NAMES.map((name, i) => (
                    <button
                      key={name}
                      type="button"
                      aria-label={`Focal point: ${name}`}
                      aria-pressed={focalIdx === i}
                      onClick={() => setFocalIdx(i)}
                      className="w-10 h-10 rounded-lg border"
                      style={{ borderColor: 'var(--ny-line)', background: focalIdx === i ? 'var(--ny-tide)' : 'var(--ny-mist)' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'details' && (
            <div className="p-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--ny-ink-3)' }}>
                Alt text
                <textarea
                  rows={3}
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image for screen readers"
                  className="ny-field"
                />
              </label>
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--ny-ink-3)' }}>What gets saved</div>
                <ul className="m-0 pl-4 text-[13px] flex flex-col gap-1.5" style={{ color: 'var(--ny-ink-2)' }}>
                  {natural && <li>Original: {natural.w} × {natural.h}</li>}
                  <li>
                    {neutral && wholeImage
                      ? 'No crop or colour change: the current file is kept; only alt text and focal point are saved.'
                      : out
                        ? `New cover: ${out.w} × ${out.h}, WebP (longest side up to ${MAX_EDGE}px, never enlarged).`
                        : '—'}
                  </li>
                  <li>Applying replaces the cover on this post. Save the post to publish the change.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
