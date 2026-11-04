'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthShell, { AuthTitle, AuthError } from '@/components/AuthShell'
import { safeNext } from '@/lib/safeNext'

function SignupForm() {
  // Where to go once the account is confirmed and signed in (e.g. back to an offer page's checkout).
  const next = safeNext(useSearchParams().get('next'))
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  // Optional, and off by default: a free account does not join the mailing list unless this is ticked.
  const [mailing, setMailing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/confirmed${nextQuery}`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (mailing) {
        // Saved with the site's other interest sign-ups. A failure here must not get in the way of the account.
        fetch('/api/register-interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: name.trim().split(/\s+/)[0] || email.split('@')[0],
            lastName: name.trim().split(/\s+/).slice(1).join(' '),
            email,
            interests: ['NeuroYou updates'],
            marketingConsent: true,
          }),
        }).catch(() => {})
      }
      setDone(true)
    }
  }

  if (done) {
    return (
      <AuthShell>
        <AuthTitle title="Check your email." />
        <p className="mt-4 text-[17px] leading-relaxed" style={{ color: 'var(--ny-ink-3)' }}>
          A confirmation link has been sent to <span style={{ color: 'var(--ny-tide)' }}>{email}</span>.
          Open it to activate your account.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthTitle
        title="Create account."
        sub={<>Already have an account? <Link href={`/login${nextQuery}`} style={{ color: 'var(--ny-tide)' }}>Sign in</Link></>}
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-9">
        <label htmlFor="name" className="sr-only">Name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="ny-field"
        />
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="ny-field"
        />
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="ny-field"
        />
        <p className="text-[13px] m-0" style={{ color: 'var(--ny-ink-4)' }}>Minimum 8 characters</p>
        <label className="mt-2 flex items-start gap-3 text-[14px] leading-snug cursor-pointer" style={{ color: 'var(--ny-ink-2)' }}>
          <input type="checkbox" checked={mailing} onChange={(e) => setMailing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Keep me posted by email about new exercises, articles and protocols. You can unsubscribe at any time.</span>
        </label>
        <AuthError message={error} />
        <button
          type="submit"
          disabled={loading}
          className="ny-btn ny-btn-primary w-full mt-2 disabled:opacity-50"
          style={{ height: 48, padding: 0 }}
        >
          {loading ? 'Initializing…' : 'Create account'}
        </button>
        <p className="text-[13px] m-0 mt-1" style={{ color: 'var(--ny-ink-4)' }}>
          Every account includes a free, private journal. How we look after your information is in our{' '}
          <Link href="/privacy" style={{ color: 'var(--ny-tide)' }}>privacy statement</Link>.
        </p>
      </form>
    </AuthShell>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
