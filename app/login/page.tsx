'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthShell, { AuthTitle, AuthError } from '@/components/AuthShell'

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-9">
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
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="ny-field"
      />
      <AuthError message={error} />
      <button
        type="submit"
        disabled={loading}
        className="ny-btn ny-btn-primary w-full mt-2 disabled:opacity-50"
        style={{ height: 48, padding: 0 }}
      >
        {loading ? 'Authenticating…' : 'Sign in'}
      </button>
      <div className="text-center mt-1">
        <Link href="/forgot-password" className="text-sm" style={{ color: 'var(--ny-tide)' }}>
          Forgot password?
        </Link>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthTitle
        title="Sign in."
        sub={<>No account? <Link href="/signup" style={{ color: 'var(--ny-tide)' }}>Create one</Link></>}
      />
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
