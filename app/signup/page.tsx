'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
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
      <div className="max-w-md mx-auto px-6 py-24">
        <p className="label mb-8">
          <span className="node mr-3" />
          Verification
        </p>
        <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-6">Check your email.</h1>
        <p className="text-sm text-[var(--muted)] font-light leading-relaxed">
          A confirmation link has been sent to <span className="text-[var(--blue)]">{email}</span>.
          Open it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="label mb-8">
        <span className="node mr-3" />
        Initialize account
      </p>
      <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-2">Create an account</h1>
      <p className="text-xs text-[var(--muted)] font-light mb-10">
        Already have one?{' '}
        <Link href="/login" className="text-[var(--blue)] hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="label block mb-2">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-sm font-light rounded-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="label block mb-2">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm font-light rounded-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="label block mb-2">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm font-light rounded-none"
          />
          <p className="text-[0.6rem] text-[var(--muted)] mt-1 tracking-wider">Minimum 8 characters</p>
        </div>
        {error && (
          <p className="text-xs font-light" style={{ color: 'var(--magenta)' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors disabled:opacity-40"
        >
          {loading ? 'Initializing…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
