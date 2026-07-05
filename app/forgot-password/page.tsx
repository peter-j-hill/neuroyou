'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="label mb-8">
        <span className="node mr-3" />
        Authentication
      </p>
      <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-2">Reset password</h1>
      <p className="text-xs text-[var(--muted)] font-light mb-10">
        Remembered it?{' '}
        <Link href="/login" className="text-[var(--blue)] hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>

      {sent ? (
        <div className="border border-[var(--border)] p-8">
          <p className="text-sm font-light text-[var(--white)] mb-3">Check your email</p>
          <p className="text-xs text-[var(--muted)] font-light leading-relaxed">
            A password reset link has been sent to <span className="text-[var(--white)]">{email}</span>.
            Click the link in the email to set a new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="label block mb-2">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm font-light rounded-none"
              placeholder="your@email.com"
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
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  )
}
