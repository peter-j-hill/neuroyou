'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase exchanges the token from the URL hash and fires PASSWORD_RECOVERY
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="label mb-8">
        <span className="node mr-3" />
        Authentication
      </p>
      <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-10">Set new password</h1>

      {done ? (
        <div className="border border-[var(--border)] p-8">
          <p className="text-sm font-light text-[var(--white)] mb-3">Password updated</p>
          <p className="text-xs text-[var(--muted)] font-light">Redirecting you to your account…</p>
        </div>
      ) : !ready ? (
        <div className="border border-[var(--border)] p-8">
          <p className="text-xs text-[var(--muted)] font-light leading-relaxed">
            Verifying reset link… If nothing happens, the link may have expired.{' '}
            <a href="/forgot-password" className="text-[var(--blue)] hover:underline underline-offset-4">
              Request a new one.
            </a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="label block mb-2">New password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm font-light rounded-none"
              placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="label block mb-2">Confirm password</label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? 'Updating…' : 'Set new password'}
          </button>
        </form>
      )}
    </div>
  )
}
