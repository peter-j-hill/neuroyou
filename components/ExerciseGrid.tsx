'use client'

import Link from 'next/link'
import { useState } from 'react'
import { EXERCISE_CATEGORIES, type ExerciseCategory } from '@/lib/categories'

export type Exercise = {
  id: string
  title: string
  excerpt: string | null
  hero_asset: string | null
  hero_focal: string | null
  audio_url: string | null
  video_url: string | null
  category: ExerciseCategory | null
}

const CATEGORIES = EXERCISE_CATEGORIES

export default function ExerciseGrid({ exercises }: { exercises: Exercise[] }) {
  const [filter, setFilter] = useState<'All' | ExerciseCategory>('All')
  const visible = filter === 'All' ? exercises : exercises.filter((e) => e.category === filter)

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-12" role="group" aria-label="Filter practices by category">
        {(['All', ...CATEGORIES] as const).map((label) => (
          <button
            key={label}
            type="button"
            className="ny-chip"
            data-on={filter === label}
            aria-pressed={filter === label}
            onClick={() => setFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-4 mt-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {visible.map((e) => {
            const cat = e.category
            return (
              <Link key={e.id} href={`/exercises/${e.id}`} className="ny-card block">
                <div className="h-[220px]" style={{ background: 'var(--ny-tide-tint)' }}>
                  {e.hero_asset && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.hero_asset}
                      alt=""
                      className="w-full h-full object-cover"
                      style={e.hero_focal ? { objectPosition: e.hero_focal } : undefined}
                    />
                  )}
                </div>
                <div className="px-6 pt-5 pb-[26px]">
                  {cat && (
                    <div className="ny-caption font-medium" style={{ color: 'var(--ny-tide)' }}>{cat}</div>
                  )}
                  <div className="text-[21px] font-semibold mt-1" style={{ letterSpacing: '-0.015em', color: 'var(--ny-ink)' }}>
                    {e.title}
                  </div>
                  {e.excerpt && (
                    <p className="text-[15px] leading-normal mt-2 line-clamp-2" style={{ color: 'var(--ny-ink-3)' }}>
                      {e.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="ny-body mt-12" style={{ color: 'var(--ny-ink-3)' }}>
          No practices in this category yet.
        </p>
      )}
    </>
  )
}
