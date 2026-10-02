'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

// Pages with a full-bleed hero the nav floats transparently over, until scrolled.
const HERO_PAGES = ['/', '/protocols']

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Re-check scroll position on route change (a short page starts "unscrolled").
  useEffect(() => {
    setScrolled(window.scrollY > 40)
  }, [pathname])

  const overHero = HERO_PAGES.includes(pathname) && !scrolled

  const navTheme = overHero
    ? { bg: 'rgba(255,255,255,0)', border: 'transparent', ink: '#fff', btnBg: '#fff', btnInk: '#1D1D1F' }
    : { bg: 'var(--ny-glass)', border: 'var(--ny-line)', ink: 'var(--ny-ink)', btnBg: 'var(--ny-tide)', btnInk: '#fff' }

  const links = [
    { href: '/exercises', label: 'Learn' },
    { href: '/blog', label: 'Explore' },
    { href: '/protocols', label: 'Protocols' },
    { href: '/research', label: 'Research' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between gap-6 px-8 border-b transition-colors duration-300"
      style={{
        background: navTheme.bg,
        borderColor: navTheme.border,
        backdropFilter: 'var(--ny-blur)',
        WebkitBackdropFilter: 'var(--ny-blur)',
        fontFamily: 'var(--ny-font)',
      }}
    >
      <Link
        href="/"
        className="text-[21px] font-semibold tracking-[-0.025em] transition-colors duration-300"
        style={{ color: navTheme.ink }}
      >
        NeuroYou
      </Link>

      <nav className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-300"
            style={{ color: navTheme.ink, opacity: pathname === l.href ? 1 : 0.78 }}
          >
            {l.label}
          </Link>
        ))}

        {user ? (
          <Link
            href="/dashboard"
            className="ml-2 px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-300"
            style={{ color: navTheme.ink, opacity: pathname === '/dashboard' ? 1 : 0.78 }}
          >
            Account
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-300"
              style={{ color: navTheme.ink, opacity: pathname === '/login' ? 1 : 0.78 }}
            >
              Sign in
            </Link>
            <Link
              href="/connect"
              className="ml-1 px-4 py-[7px] text-sm whitespace-nowrap rounded-full transition-colors duration-300"
              style={{ background: navTheme.btnBg, color: navTheme.btnInk }}
            >
              Connect
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
