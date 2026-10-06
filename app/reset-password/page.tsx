'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, { AuthTitle, AuthError } from '@/components/AuthShell'

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
    <AuthShell>
      <AuthTitle title="Set new password." />

      {done ? (
        <div className="mt-9 rounded-[14px] p-6" style={{ background: 'var(--ny-mist)' }}>
          <p className="text-[17px] font-semibold m-0 mb-2">Password updated</p>
          <p className="text-[15px] m-0" style={{ color: 'var(--ny-ink-3)' }}>Redirecting you to your account…</p>
        </div>
      ) : !ready ? (
        <div className="mt-9 rounded-[14px] p-6" style={{ background: 'var(--ny-mist)' }}>
          <p className="text-[15px] leading-relaxed m-0" style={{ color: 'var(--ny-ink-3)' }}>
            Verifying reset link… If nothing happens, the link may have expired.{' '}
            <Link href="/forgot-password" style={{ color: 'var(--ny-tide)' }}>Request a new one.</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-9">
          <label htmlFor="password" className="sr-only">New password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="New password (minimum 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ny-field"
          />
          <label htmlFor="confirm" className="sr-only">Confirm password</label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="ny-field"
          />
          <AuthError message={error} />
          <button
            type="submit"
            disabled={loading}
            className="ny-btn ny-btn-primary w-full mt-2 disabled:opacity-50"
            style={{ height: 48, padding: 0 }}
          >
            {loading ? 'Updating…' : 'Set new password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
