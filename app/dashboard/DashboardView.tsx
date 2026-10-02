import Link from 'next/link'
import SignOutButton from './SignOutButton'
import AccessCard, { type AccessItem } from './AccessCard'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const FREE = [
  { href: '/exercises', title: 'Learn', blurb: 'Free practices for attention, sensation and emotional state.' },
  { href: '/blog', title: 'Explore', blurb: 'Articles on how consciousness works.' },
  { href: '/research', title: 'Research', blurb: 'Working papers, with PDF downloads.' },
]

export type LogEntry = { moduleId: string; order: number | null; title: string | null; completedAt: string }

// Presentational part of the dashboard (see page.tsx for where the data comes from).
export default function DashboardView({
  name, email, showEmail, isAdmin, items, log,
}: {
  name: string
  email: string
  showEmail: boolean
  isAdmin: boolean
  items: AccessItem[]
  log: LogEntry[]
}) {
  return (
    <div className="ny-scope bg-white">
      <div className="max-w-[1120px] mx-auto px-8 pt-24 pb-[120px]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="ny-eyebrow mb-3.5">Account</div>
            <h1 className="m-0 break-words" style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>
              {name}
            </h1>
            {showEmail && <p className="mt-3 text-[17px]" style={{ color: 'var(--ny-ink-3)' }}>{email}</p>}
          </div>
          <SignOutButton />
        </div>

        {isAdmin && (
          <div
            className="mt-12 rounded-[18px] p-7 flex flex-wrap items-center justify-between gap-5"
            style={{ background: 'var(--ny-tide-tint)' }}
          >
            <div>
              <div className="ny-caption font-medium" style={{ color: 'var(--ny-tide)' }}>Admin</div>
              <p className="m-0 mt-1 text-[17px]" style={{ color: 'var(--ny-ink)' }}>
                Manage posts, cover images, paper PDFs and registrations.
              </p>
            </div>
            <Link href="/admin" className="ny-btn ny-btn-primary">Open admin</Link>
          </div>
        )}

        <section className="mt-16" aria-labelledby="courses-h">
          <h2 id="courses-h" className="m-0 text-[28px]" style={{ letterSpacing: '-0.025em', color: 'var(--ny-ink)' }}>
            Your courses
          </h2>
          {items.length > 0 ? (
            <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {items.map((item) => <AccessCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-[18px] p-7" style={{ background: 'var(--ny-mist)' }}>
              <p className="m-0 text-[17px]" style={{ color: 'var(--ny-ink-2)' }}>
                Courses you have access to will appear here, with a link to each.
              </p>
              <Link href="/neutralize" className="inline-block mt-3 text-[17px] hover:underline" style={{ color: 'var(--ny-tide)' }}>
                See the Neutralize course ›
              </Link>
            </div>
          )}
        </section>

        {log.length > 0 && (
          <section className="mt-16" aria-labelledby="log-h">
            <h2 id="log-h" className="m-0 text-[28px]" style={{ letterSpacing: '-0.025em', color: 'var(--ny-ink)' }}>
              Neutralize completion log
            </h2>
            <ul className="list-none m-0 p-0 mt-4">
              {log.map((p) => {
                return (
                  <li
                    key={p.moduleId}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5 border-t first:border-t-0 text-[17px]"
                    style={{ borderColor: 'var(--ny-line)' }}
                  >
                    <span style={{ color: 'var(--ny-ink)' }}>Module {p.order} — {p.title}</span>
                    <span className="ny-caption">{fmtDate(p.completedAt)}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section className="mt-16" aria-labelledby="free-h">
          <h2 id="free-h" className="m-0 text-[28px]" style={{ letterSpacing: '-0.025em', color: 'var(--ny-ink)' }}>
            Free for everyone
          </h2>
          <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {FREE.map((f) => (
              <Link key={f.href} href={f.href} className="ny-card block p-6">
                <div className="text-[21px] font-semibold" style={{ letterSpacing: '-0.015em', color: 'var(--ny-ink)' }}>{f.title}</div>
                <p className="m-0 mt-2 text-[15px] leading-normal" style={{ color: 'var(--ny-ink-3)' }}>{f.blurb}</p>
                <div className="mt-3 text-[15px]" style={{ color: 'var(--ny-tide)' }}>Open ›</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
