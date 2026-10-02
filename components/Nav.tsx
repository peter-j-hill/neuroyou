'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

// Pages with a full-bleed hero the nav floats transparently over, until scrolled.
const HERO_PAGES = ['/', '/protocols']

const LINKS = [
  { href: '/exercises', label: 'Learn' },
  { href: '/blog', label: 'Explore' },
  { href: '/protocols', label: 'Protocols' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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

  // On every route change: close the mobile menu and re-check the scroll position
  // (a short page starts "unscrolled").
  useEffect(() => {
    setOpen(false)
    setScrolled(window.scrollY > 40)
  }, [pathname])

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Transparent with white text over a hero; an open menu always uses the solid glass bar.
  const overHero = HERO_PAGES.includes(pathname) && !scrolled && !open

  const navTheme = overHero
    ? { bg: 'rgba(255,255,255,0)', border: 'transparent', ink: '#fff', btnBg: '#fff', btnInk: '#1D1D1F' }
    : { bg: 'var(--ny-glass)', border: 'var(--ny-line)', ink: 'var(--ny-ink)', btnBg: 'var(--ny-tide)', btnInk: '#fff' }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between gap-6 px-5 sm:px-8 border-b transition-colors duration-300"
        style={{
          background: navTheme.bg,
          borderColor: navTheme.border,
          backdropFilter: 'var(--ny-blur)',
          WebkitBackdropFilter: 'var(--ny-blur)',
          fontFamily: 'var(--ny-font)',
          fontWeight: 400,
        }}
      >
        <Link
          href="/"
          className="text-[21px] font-semibold tracking-[-0.025em] transition-colors duration-300"
          style={{ color: navTheme.ink }}
        >
          NeuroYou
        </Link>

        {/* Desktop / tablet */}
        <nav className="hidden md:flex items-center gap-1.5">
          {LINKS.map((l) => (
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

        {/* Mobile: Connect stays one tap away; everything else lives in the menu */}
        <div className="flex md:hidden items-center gap-1">
          {!user && (
            <Link
              href="/connect"
              className="px-4 py-[7px] text-sm whitespace-nowrap rounded-full transition-colors duration-300"
              style={{ background: navTheme.btnBg, color: navTheme.btnInk }}
            >
              Connect
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="w-11 h-11 flex items-center justify-center transition-colors duration-300"
            style={{ color: navTheme.ink }}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? <path d="M3 1.5l14 11M17 1.5L3 12.5" /> : <path d="M1 2h18M1 12h18" />}
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu"
          className="ny-no-print md:hidden fixed top-14 left-0 right-0 z-40 max-h-[calc(100vh-56px)] overflow-y-auto border-b"
          style={{
            background: 'rgba(255,255,255,.97)',
            backdropFilter: 'var(--ny-blur)',
            WebkitBackdropFilter: 'var(--ny-blur)',
            borderColor: 'var(--ny-line)',
            fontFamily: 'var(--ny-font)',
            fontWeight: 400,
          }}
        >
          {[...LINKS, user ? { href: '/dashboard', label: 'Account' } : { href: '/login', label: 'Sign in' }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-5 sm:px-8 py-3.5 text-[17px] border-t first:border-t-0"
              style={{
                borderColor: 'var(--ny-line)',
                color: pathname === l.href ? 'var(--ny-tide)' : 'var(--ny-ink)',
                fontWeight: pathname === l.href ? 600 : 400,
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
