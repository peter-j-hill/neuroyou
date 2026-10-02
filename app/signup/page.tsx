'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthShell, { AuthTitle, AuthError } from '@/components/AuthShell'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/confirmed`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
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
        sub={<>Already have an account? <Link href="/login" style={{ color: 'var(--ny-tide)' }}>Sign in</Link></>}
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
        <AuthError message={error} />
        <button
          type="submit"
          disabled={loading}
          className="ny-btn ny-btn-primary w-full mt-2 disabled:opacity-50"
          style={{ height: 48, padding: 0 }}
        >
          {loading ? 'Initializing…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
