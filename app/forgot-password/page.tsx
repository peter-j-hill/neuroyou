'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthShell, { AuthTitle, AuthError } from '@/components/AuthShell'

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
    <AuthShell>
      <AuthTitle
        title="Reset password."
        sub={<>Remembered it? <Link href="/login" style={{ color: 'var(--ny-tide)' }}>Sign in</Link></>}
      />

      {sent ? (
        <div className="mt-9 rounded-[14px] p-6" style={{ background: 'var(--ny-mist)' }}>
          <p className="text-[17px] font-semibold m-0 mb-2">Check your email</p>
          <p className="text-[15px] leading-relaxed m-0" style={{ color: 'var(--ny-ink-3)' }}>
            A password reset link has been sent to <span style={{ color: 'var(--ny-ink)' }}>{email}</span>.
            Click the link in the email to set a new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-9">
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ny-field"
          />
          <AuthError message={error} />
          <button
            type="submit"
            disabled={loading}
            className="ny-btn ny-btn-primary w-full mt-2 disabled:opacity-50"
            style={{ height: 48, padding: 0 }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
