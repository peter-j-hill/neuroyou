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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
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
        <h1 className="text-2xl font-normal mb-4">Check your email</h1>
        <p className="text-[var(--muted)] leading-relaxed">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Open it to
          activate your account, then you can sign in.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="text-2xl font-normal mb-2">Create an account</h1>
      <p className="text-sm text-[var(--muted)] font-sans mb-10">
        Already have one?{' '}
        <Link href="/login" className="text-[var(--accent)] hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-sans text-[var(--muted)] mb-1.5">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-sm bg-white text-sm font-sans focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-sm bg-white text-sm font-sans focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <p className="text-xs text-[var(--muted)] font-sans mt-1">Minimum 8 characters</p>
        </div>
        {error && (
          <p className="text-sm font-sans text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[var(--accent)] text-white text-sm font-sans rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
