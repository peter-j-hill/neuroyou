'use client'

import { useState } from 'react'

export default function ConnectPage() {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, organization, email, interest, marketingConsent }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <p className="label mb-8">
          <span className="node mr-3" />
          Registered
        </p>
        <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-6">You&apos;re on the list.</h1>
        <p className="text-sm text-[var(--muted)] font-light leading-relaxed">
          Thanks for registering your interest. We&apos;ll be in touch when the first NeuroYou Protocol opens.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="label mb-8">
        <span className="node mr-3" />
        Connect
      </p>
      <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-2">Register your interest</h1>
      <p className="text-xs text-[var(--muted)] font-light mb-10 leading-relaxed">
        The first NeuroYou Protocol is opening to a small group. Leave your details to be notified.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="label block mb-2">Name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 text-sm font-light rounded-none"
          />
        </div>
        <div>
          <label htmlFor="organization" className="label block mb-2">
            Organization <span style={{ textTransform: 'none', letterSpacing: 'normal' }} className="text-[var(--muted)] opacity-70">— optional</span>
          </label>
          <input
            id="organization"
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Company or institution"
            className="w-full px-4 py-3 text-sm font-light rounded-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="label block mb-2">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organization.com"
            className="w-full px-4 py-3 text-sm font-light rounded-none"
          />
        </div>
        <div>
          <label htmlFor="interest" className="label block mb-2">
            Interest <span style={{ textTransform: 'none', letterSpacing: 'normal' }} className="text-[var(--muted)] opacity-70">— optional</span>
          </label>
          <textarea
            id="interest"
            rows={4}
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="What are you hoping to explore with NeuroYou?"
            className="w-full px-4 py-3 text-sm font-light rounded-none"
          />
        </div>
        <label className="flex items-start gap-3 text-xs text-[var(--muted)] font-light leading-relaxed">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5"
            style={{ accentColor: 'var(--blue)' }}
          />
          I agree to receive occasional email about the NeuroYou Protocols.
        </label>
        {error && (
          <p className="text-xs font-light" style={{ color: 'var(--magenta)' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors disabled:opacity-40"
        >
          {loading ? 'Registering…' : 'Register interest'}
        </button>
      </form>
    </div>
  )
}
