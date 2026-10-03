import Link from 'next/link'
import type { ReactNode } from 'react'
import { displayableExcerpt } from '@/lib/excerpt'

// Shared detail-page layout for articles, exercises (and, in a later phase,
// research papers). Layout and typography only — title, excerpt and body come
// straight from the CMS and are rendered verbatim.
export default function ArticleLayout({
  backHref,
  backLabel,
  kind,
  date,
  title,
  excerpt,
  heroAsset,
  heroAlt,
  heroFocal,
  media,
  children,
}: {
  backHref: string
  backLabel: string
  kind: string
  date: string
  title: string
  excerpt?: string | null
  heroAsset?: string | null
  heroAlt?: string | null
  heroFocal?: string | null
  media?: ReactNode
  children: ReactNode
}) {
  return (
    <article className="ny-scope bg-white">
      <div className="max-w-[760px] mx-auto px-8 pt-[84px]">
        <Link href={backHref} className="ny-no-print text-[15px] whitespace-nowrap" style={{ color: 'var(--ny-tide)' }}>
          ‹ {backLabel}
        </Link>
        <div className="mt-10 text-[15px]" style={{ color: 'var(--ny-ink-4)' }}>
          {kind} · {date}
        </div>
        <h1 className="ny-article-title mt-3">{title}</h1>
        {displayableExcerpt(excerpt) && (
          <p className="ny-lede mt-6" style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.4 }}>
            {displayableExcerpt(excerpt)}
          </p>
        )}
        <div
          className="flex items-center gap-3 mt-8 pt-6 border-t"
          style={{ borderColor: 'var(--ny-line)' }}
        >
          <div
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: 'var(--ny-tide-tint)', color: 'var(--ny-tide)' }}
          >
            PH
          </div>
          <div className="whitespace-nowrap">
            <div className="text-[15px] font-semibold">Peter J Hill</div>
            <div className="ny-caption">Founder, NeuroYou</div>
          </div>
        </div>
      </div>

      {media && <div className="ny-no-print max-w-[760px] mx-auto px-8 mt-10 space-y-6">{media}</div>}

      {heroAsset && (
        <div className="max-w-[1120px] mx-auto px-8 mt-14">
          <div className="h-[260px] sm:h-[560px] rounded-[28px] overflow-hidden" style={{ background: 'var(--ny-mist)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroAsset}
              alt={heroAlt ?? ''}
              className="w-full h-full object-cover"
              style={heroFocal ? { objectPosition: heroFocal } : undefined}
            />
          </div>
        </div>
      )}

      <div className="max-w-[680px] mx-auto px-8 pt-[72px] pb-[120px]">{children}</div>
    </article>
  )
}
