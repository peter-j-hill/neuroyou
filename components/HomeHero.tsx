'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// Previous hero subtitle, kept here so it is easy to restore:
//   "Neuroscience-grounded training for attention, perception, and emotional state.
//   Not spiritual. Not wellness. A skill you can measure."

const THEMES = [
  { name: 'Focus', line: 'Clear attention under pressure', img: '/redesign-placeholders/lab.jpg' },
  { name: 'Flow', line: 'Perform with less interference', img: '/redesign-placeholders/surf.jpg' },
  { name: 'Awe', line: 'Notice what is already here', img: '/redesign-placeholders/woman.jpg' },
  { name: 'Depth', line: 'Go further than meditation took you', img: '/redesign-placeholders/forest.jpg' },
]

export default function HomeHero() {
  const [theme, setTheme] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTheme((t) => (t + 1) % THEMES.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative h-screen min-h-[760px] overflow-hidden -mt-14" style={{ background: '#2C6E7F' }}>
      {THEMES.map((t, i) => (
        <div
          key={t.name}
          className="absolute inset-0 transition-opacity duration-[1200ms]"
          style={{ opacity: theme === i ? 1 : 0, transitionTimingFunction: 'var(--ny-ease)' }}
        >
          <div className="absolute inset-0 ny-ken-burns">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.img} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      ))}

      {/* Scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,.42), rgba(0,0,0,.12) 70%), ' +
            'linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45))',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pt-[72px] pb-[200px] text-white pointer-events-none">
        <div className="text-[15px] font-medium opacity-90 mb-5">Independent Consciousness Laboratory</div>
        <h1
          className="m-0 font-semibold max-w-[1000px] text-[40px] leading-[1.05] sm:text-[clamp(48px,9vh,96px)] sm:leading-[0.98]"
          style={{ letterSpacing: '-0.05em', textWrap: 'balance' }}
        >
          See more. Feel more. Perform better.
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-xl leading-relaxed max-w-[620px] opacity-95" style={{ textWrap: 'pretty' }}>
          Neuroscience-grounded training for attention, perception and emotional regulation. Not meditation. Not spiritual. Not wellness. Experiential skills you can feel.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6 sm:mt-8 pointer-events-auto">
          <Link href="/start-here" className="ny-btn" style={{ background: '#fff', color: '#1D1D1F', fontWeight: 500 }}>
            Start Here
          </Link>
          <Link href="/exercises" className="ny-btn ny-btn-glass">
            Try a free practice
          </Link>
        </div>
      </div>

      {/* Theme tabs */}
      <div className="absolute left-0 right-0 bottom-12 px-8">
        <div
          className="max-w-[1120px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-px"
          style={{ borderTop: '1px solid rgba(255,255,255,.35)' }}
        >
          {THEMES.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setTheme(i)}
              onMouseEnter={() => setTheme(i)}
              className="text-left pt-[18px] px-1 text-white transition-opacity duration-300 -mt-px"
              style={{
                borderTop: `2px solid ${theme === i ? '#fff' : 'transparent'}`,
                opacity: theme === i ? 1 : 0.7,
              }}
            >
              <div className="text-[17px] font-semibold tracking-[-0.01em]">{t.name}</div>
              <div className="text-sm opacity-85 mt-1">{t.line}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
