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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-sans text-[var(--muted)] mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-[var(--border)] rounded-sm bg-white text-sm font-sans focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-sans text-[var(--muted)] mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-[var(--border)] rounded-sm bg-white text-sm font-sans focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>
      {error && (
        <p className="text-sm font-sans text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[var(--accent)] text-white text-sm font-sans rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="text-2xl font-normal mb-2">Sign in</h1>
      <p className="text-sm text-[var(--muted)] font-sans mb-10">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[var(--accent)] hover:underline underline-offset-4">
          Create one
        </Link>
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
