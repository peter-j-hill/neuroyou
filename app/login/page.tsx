'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 text-sm font-light rounded-none"
        />
      </div>
      {error && (
        <p className="text-xs font-light" style={{ color: 'var(--magenta)' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors disabled:opacity-40"
      >
        {loading ? 'Authenticating…' : 'Sign in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="label mb-8">
        <span className="node mr-3" />
        Authentication
      </p>
      <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-2">Sign in</h1>
      <p className="text-xs text-[var(--muted)] font-light mb-10">
        No account?{' '}
        <Link href="/signup" className="text-[var(--blue)] hover:underline underline-offset-4">
          Create one
        </Link>
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
