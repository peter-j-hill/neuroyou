'use client'

import { useEffect, useRef, useState } from 'react'

export default function AudioPlayer({ src, filename }: { src: string; filename?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => { setCurrentTime(audio.currentTime); setProgress(audio.currentTime / audio.duration * 100 || 0) }
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onMeta); audio.removeEventListener('ended', onEnd) }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) } else { audio.play(); setPlaying(true) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audio.currentTime = pct * audio.duration
  }

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="border border-[var(--border)] p-5" style={{ background: '#0B0D10' }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4 mb-4">
        {/* Play/pause button */}
        <button
          onClick={toggle}
          className="w-10 h-10 flex items-center justify-center border border-[var(--blue)] text-[var(--blue)] hover:bg-[var(--accent-glow)] transition-colors shrink-0"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
              <rect x="0" y="0" width="4" height="14" /><rect x="8" y="0" width="4" height="14" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
              <polygon points="0,0 12,7 0,14" />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div
            className="w-full h-1 cursor-pointer relative"
            style={{ background: '#1A1D24' }}
            onClick={seek}
          >
            <div
              className="absolute left-0 top-0 h-full transition-all"
              style={{ width: `${progress}%`, background: 'var(--blue)' }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[0.6rem] tracking-wider text-[var(--muted)] font-light">{fmt(currentTime)}</span>
            <span className="text-[0.6rem] tracking-wider text-[var(--muted)] font-light">{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Download link */}
      <a
        href={src}
        download={filename ?? 'audio.mp3'}
        className="text-[0.6rem] tracking-widest uppercase text-[var(--muted)] hover:text-[var(--blue)] transition-colors flex items-center gap-2"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M5 0v7M2 5l3 3 3-3M0 9h10" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        Download MP3
      </a>
    </div>
  )
}
