'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const ERRORS: Record<string, string> = {
  invalid_code: 'That code is not valid. Check it and try again, or continue without one.',
  prerequisite_missing: 'This protocol needs the one before it first.',
  not_available: 'This protocol is not open yet.',
  not_configured: 'Checkout is not available right now. Please try again later.',
}

export default function EnrollPanel({
  slug,
  price,
  refund,
  initialCode,
  autoStart,
}: {
  slug: string
  /** Formatted price from Stripe, or null when it cannot be shown (the button is then disabled). */
  price: string | null
  refund: string | null
  initialCode: string
  /** Set when the student comes back from sign-up with ?checkout=1: carry straight on to Stripe. */
  autoStart: boolean
}) {
  const [code, setCode] = useState(initialCode)
  const [applied, setApplied] = useState(initialCode.trim().toUpperCase())
  const [codeOpen, setCodeOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const started = useRef(false)

  const go = async (fromAuto = false) => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: slug, promo: applied || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.url) {
        window.location.href = data.url
        return
      }
      if (data.redirect) {
        // Coming back from sign-up and still not signed in: do not bounce to sign-up again.
        if (fromAuto && String(data.redirect).startsWith('/signup')) {
          setError('Please sign in to continue to checkout.')
          setBusy(false)
          return
        }
        window.location.href = data.redirect
        return
      }
      setError(ERRORS[data.error] ?? 'Something went wrong. Please try again.')
      if (data.error === 'invalid_code') setApplied('')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setBusy(false)
  }

  useEffect(() => {
    if (autoStart && price && !started.current) {
      started.current = true
      void go(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apply = () => {
    const c = code.trim().toUpperCase()
    if (!c) return
    setApplied(c)
    setCode(c)
    setCodeOpen(false)
    setError('')
  }

  return (
    <div id="enroll-card" className="flex flex-col gap-4 rounded-[18px] bg-white p-8 border" style={{ borderColor: 'var(--ny-line)' }}>
      <div className="flex items-baseline gap-2.5">
        <span className="font-semibold" style={{ fontSize: 48, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>
          {price ?? 'Price to come'}
        </span>
        {price && <span className="text-sm" style={{ color: 'var(--ny-ink-3)' }}>one-time</span>}
      </div>

      {applied && (
        <div className="rounded-[10px] px-3.5 py-2.5 text-sm" style={{ background: 'var(--ny-tide-tint)', color: 'var(--ny-tide-deep)' }}>
          Code <b>{applied}</b> will be applied on the secure payment page.{' '}
          <button type="button" className="underline" onClick={() => { setApplied(''); setCode('') }}>Remove</button>
        </div>
      )}

      <button
        type="button"
        onClick={() => go()}
        disabled={busy || !price}
        className="ny-btn ny-btn-primary w-full disabled:opacity-50"
        style={{ minHeight: 48, padding: '14px 24px' }}
      >
        {busy ? 'Preparing checkout…' : price ? 'Continue to secure checkout' : 'Opens soon'}
      </button>

      {error && <p className="m-0 text-sm" role="alert" style={{ color: 'var(--ny-coral)' }}>{error}</p>}

      {!codeOpen && !applied && (
        <button type="button" onClick={() => setCodeOpen(true)} className="self-start py-2.5 text-sm" style={{ color: 'var(--ny-tide)' }}>
          Have a promo code?
        </button>
      )}
      {codeOpen && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="promo" className="text-[13px]" style={{ color: 'var(--ny-ink-2)' }}>Promo code</label>
          <div className="flex gap-2">
            <input
              id="promo"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply() } }}
              placeholder="e.g. FOUNDING20"
              autoComplete="off"
              className="ny-field uppercase"
              style={{ height: 44 }}
            />
            <button type="button" onClick={apply} className="ny-btn ny-btn-secondary" style={{ padding: '0 18px', minHeight: 44, fontSize: 14 }}>
              Apply
            </button>
          </div>
        </div>
      )}

      <span className="text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>
        Payment handled by Stripe. Card, Apple Pay, Google Pay.{refund ? ` ${refund}` : ''}
      </span>
      <Link href={`/login?next=/offers/${slug}`} className="text-[13px] self-start" style={{ color: 'var(--ny-ink-4)' }}>
        Already enrolled? Sign in
      </Link>
    </div>
  )
}
