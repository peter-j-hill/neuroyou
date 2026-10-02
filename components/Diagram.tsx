// Placeholder for the interactive diagram system, shared with peterjonathanhill.com's
// content model — referenced from article bodies as <Diagram slug="..." />.
export default function Diagram({
  slug,
  caption,
  variant = 'dark',
}: {
  slug: string
  caption?: string
  variant?: 'dark' | 'light'
}) {
  if (variant === 'light') {
    return (
      <div className="my-10 rounded-[18px] p-10 text-center" style={{ background: 'var(--ny-mist)' }}>
        <p className="ny-caption mb-2">Diagram</p>
        <p className="text-[15px]" style={{ color: 'var(--ny-ink-3)' }}>{caption ?? slug}</p>
      </div>
    )
  }
  return (
    <div className="my-10 border border-[var(--border)] p-10 text-center">
      <p className="label mb-2">Diagram</p>
      <p className="text-sm text-[var(--muted)]">{caption ?? slug}</p>
    </div>
  )
}
