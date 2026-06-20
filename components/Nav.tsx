'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null)
      })
      return () => subscription.unsubscribe()
    })
  }, [])

  const isActive = (href: string) =>
    pathname === href
      ? 'text-[var(--white)]'
      : 'text-[var(--muted)] hover:text-[var(--white)] transition-colors'

  return (
    <header className="border-b border-[var(--border)] bg-[var(--black)]">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span
            className="text-sm font-bold tracking-[0.15em] uppercase text-[var(--white)] group-hover:text-[var(--blue)] transition-colors"
            style={{ fontFamily: 'var(--font-inter), Helvetica Neue, sans-serif' }}
          >
            NeuroYou
          </span>
          <span className="text-[0.55rem] tracking-[0.18em] uppercase text-[var(--muted)] mt-0.5">
            Independent Consciousness Laboratory
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
          <Link href="/exercises" className={isActive('/exercises')}>Exercises</Link>
          <Link href="/blog" className={isActive('/blog')}>Research</Link>
          <Link href="/neutralize" className={`${isActive('/neutralize')} text-[var(--blue)]`}>Neutralize</Link>

          {user ? (
            <Link href="/dashboard" className={`${isActive('/dashboard')} ml-2`}>Account</Link>
          ) : (
            <>
              <Link href="/login" className={isActive('/login')}>Sign in</Link>
              <Link
                href="/signup"
                className="ml-2 px-4 py-1.5 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors"
              >
                Enter
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
