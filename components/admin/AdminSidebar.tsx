'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = { contentCount: number; registrationCount: number }

const NAV = (p: Props) => [
  { href: '/admin', label: 'Content', count: p.contentCount, match: (path: string) => path === '/admin' },
  { href: '/admin/registrations', label: 'Registrations', count: p.registrationCount, match: (path: string) => path.startsWith('/admin/registrations') },
]

export default function AdminSidebar(props: Props) {
  const pathname = usePathname()
  const items = NAV(props)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col gap-0.5 px-3 py-5 border-r"
        style={{ background: '#fff', borderColor: 'var(--ny-line)' }}
      >
        <div className="flex items-baseline gap-2 px-3 pt-1 pb-5">
          <span className="text-[17px] font-semibold" style={{ letterSpacing: '-0.02em' }}>NeuroYou</span>
          <span className="text-xs" style={{ color: 'var(--ny-ink-4)' }}>Admin</span>
        </div>
        {items.map((n) => {
          const active = n.match(pathname)
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--ny-mist)]"
              style={{
                background: active ? 'var(--ny-tide-tint)' : undefined,
                color: active ? 'var(--ny-tide)' : 'var(--ny-ink-2)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <span className="whitespace-nowrap">{n.label}</span>
              <span className="text-xs" style={{ color: 'var(--ny-ink-4)', fontWeight: 400 }}>{n.count}</span>
            </Link>
          )
        })}
        <div className="mt-auto flex flex-col gap-0.5">
          <Link href="/" className="px-3 py-2 text-sm" style={{ color: 'var(--ny-ink-2)' }}>View site ↗</Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 p-3 mt-2 border-t text-[13px]"
            style={{ borderColor: 'var(--ny-line)' }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: 'var(--ny-tide-tint)', color: 'var(--ny-tide)' }}
            >
              PH
            </span>
            <span>
              Peter J Hill
              <span className="block text-xs" style={{ color: 'var(--ny-ink-4)' }}>Account</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Tablet / phone: compact top bar */}
      <header
        className="lg:hidden flex items-center gap-3 px-4 h-12 border-b overflow-x-auto"
        style={{ background: '#fff', borderColor: 'var(--ny-line)' }}
      >
        <span className="text-[15px] font-semibold whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
          NeuroYou <span className="text-xs font-normal" style={{ color: 'var(--ny-ink-4)' }}>Admin</span>
        </span>
        {items.map((n) => {
          const active = n.match(pathname)
          return (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1 rounded-full text-[13px] whitespace-nowrap"
              style={{
                background: active ? 'var(--ny-tide-tint)' : undefined,
                color: active ? 'var(--ny-tide)' : 'var(--ny-ink-2)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {n.label}
            </Link>
          )
        })}
        <Link href="/" className="ml-auto px-3 py-1 text-[13px] whitespace-nowrap" style={{ color: 'var(--ny-ink-2)' }}>View site ↗</Link>
      </header>
    </>
  )
}
