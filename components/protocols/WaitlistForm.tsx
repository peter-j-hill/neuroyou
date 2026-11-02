'use client'

import { useState } from 'react'
import Link from 'next/link'

// Waitlist for a protocol that has not opened yet. Posts to the same endpoint as the Connect
// form; the protocol is recorded in the "interests" list as "Waitlist: <title>".
export default function WaitlistForm({ interest, title }: { interest: string; title: string }) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, interests: [interest], marketingConsent: consent }),
      })
      if (res.ok) setDone(true)
      else setError((await res.json().catch(() => ({}))).error ?? 'Something went wrong. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="rounded-[18px] p-7" style={{ background: 'var(--ny-tide-tint)' }}>
        <h3 className="m-0 text-[22px]" style={{ color: 'var(--ny-tide-deep)' }}>You’re on the list.</h3>
        <p className="mt-2 mb-0 text-[17px]" style={{ color: 'var(--ny-ink-2)' }}>
          We’ll be in touch when {title} opens. In the meantime, try a free practice.
        </p>
        <Link href="/exercises" className="ny-btn ny-btn-primary mt-5" style={{ padding: '12px 22px' }}>Go to Learn</Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 max-w-[460px]">
      <label htmlFor="wl-name" className="sr-only">First name</label>
      <input id="wl-name" type="text" required autoComplete="given-name" placeholder="First name"
        value={firstName} onChange={(e) => setFirstName(e.target.value)} className="ny-field" />
      <label htmlFor="wl-email" className="sr-only">Email</label>
      <input id="wl-email" type="email" required autoComplete="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} className="ny-field" />
      <label className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--ny-ink-2)' }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
          className="mt-1" style={{ accentColor: 'var(--ny-tide)' }} />
        I agree to receive occasional email about the NeuroYou Protocols.
      </label>
      {error && <p className="m-0 text-sm" role="alert" style={{ color: 'var(--ny-coral)' }}>{error}</p>}
      <button type="submit" disabled={loading} className="ny-btn ny-btn-primary self-start disabled:opacity-50" style={{ padding: '13px 26px' }}>
        {loading ? 'Sending…' : 'Join the waitlist'}
      </button>
    </form>
  )
}
