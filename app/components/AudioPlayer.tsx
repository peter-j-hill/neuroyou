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

  // Light redesign styling. Playback, seek and download behaviour are unchanged.
  return (
    <div className="rounded-[18px] p-5" style={{ background: 'var(--ny-mist)', fontFamily: 'var(--ny-font)' }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play/pause button */}
        <button
          onClick={toggle}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-colors hover:bg-[var(--ny-tide-deep)]"
          style={{ background: 'var(--ny-tide)' }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
              <rect x="0" y="0" width="4" height="14" /><rect x="8" y="0" width="4" height="14" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" style={{ marginLeft: 2 }}>
              <polygon points="0,0 12,7 0,14" />
            </svg>
          )}
        </button>

        {/* Progress bar (taller click target around a thin bar) */}
        <div className="flex-1 flex flex-col">
          <div className="w-full py-2 cursor-pointer" onClick={seek}>
            <div className="w-full h-1 rounded-full relative" style={{ background: 'var(--ny-line-strong)' }}>
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ width: `${progress}%`, background: 'var(--ny-tide)' }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[13px]" style={{ color: 'var(--ny-ink-4)' }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Download link */}
      <a
        href={src}
        download={filename ?? 'audio.mp3'}
        className="mt-4 inline-flex items-center gap-2 text-[15px] transition-colors hover:text-[var(--ny-tide-deep)]"
        style={{ color: 'var(--ny-tide)' }}
      >
        <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor">
          <path d="M5 0v7M2 5l3 3 3-3M0 9h10" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        Download MP3
      </a>
    </div>
  )
}
