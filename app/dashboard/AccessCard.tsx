import Link from 'next/link'

// One thing the signed-in user has access to (a purchased course, for now).
// A course can live on this site (`href` starting with "/") or elsewhere
// (`external`, opens in a new tab). Hosting is undecided, so both are supported.
export type AccessItem = {
  id: string
  title: string
  summary: string
  status: string
  href: string
  cta: string
  external?: boolean
}

export default function AccessCard({ item }: { item: AccessItem }) {
  const btn = 'ny-btn ny-btn-primary self-start'
  return (
    <div className="rounded-[18px] p-7 flex flex-col gap-3" style={{ background: 'var(--ny-mist)' }}>
      <div className="ny-caption font-medium" style={{ color: 'var(--ny-leaf)' }}>{item.status}</div>
      <h3 className="m-0 text-[24px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>{item.title}</h3>
      <p className="m-0 text-[15px] leading-normal" style={{ color: 'var(--ny-ink-3)' }}>{item.summary}</p>
      <div className="mt-3">
        {item.external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={btn}>{item.cta} ↗</a>
        ) : (
          <Link href={item.href} className={btn}>{item.cta}</Link>
        )}
      </div>
    </div>
  )
}
