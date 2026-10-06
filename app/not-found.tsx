import Link from 'next/link'

// Shown for any address that does not exist. New copy, not from the handoff.
export default function NotFound() {
  return (
    <div className="ny-scope bg-white">
      <div className="max-w-[1120px] mx-auto px-8 pt-24 pb-[120px] min-h-[60vh] flex flex-col justify-center">
        <div className="ny-eyebrow mb-3.5">404</div>
        <h1 className="ny-page-title">Page not found.</h1>
        <p className="ny-lede mt-5 max-w-[560px]" style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.4 }}>
          That address doesn&rsquo;t lead anywhere. It may have moved, or the link may have a typo.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/" className="ny-btn ny-btn-primary">Back to home</Link>
          <Link href="/exercises" className="ny-btn ny-btn-secondary">Try a practice</Link>
        </div>
      </div>
    </div>
  )
}
