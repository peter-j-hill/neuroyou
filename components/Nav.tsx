'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Lazy import so supabase is only initialised client-side
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
    pathname === href ? 'text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'

  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-lg tracking-tight font-normal text-[var(--foreground)]">
          NeuroYou
        </Link>
        <nav className="flex items-center gap-6 text-sm font-sans">
          <Link href="/exercises" className={isActive('/exercises')}>Exercises</Link>
          <Link href="/blog" className={isActive('/blog')}>Research</Link>
          <Link href="/neutralize" className={isActive('/neutralize')}>Neutralize</Link>
          {user ? (
            <Link href="/dashboard" className={`${isActive('/dashboard')} ml-2`}>Account</Link>
          ) : (
            <>
              <Link href="/login" className={isActive('/login')}>Sign in</Link>
              <Link
                href="/signup"
                className="ml-2 px-4 py-1.5 bg-[var(--accent)] text-white text-sm rounded-sm hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
