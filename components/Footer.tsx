import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--ny-line)', background: 'var(--ny-mist)', fontFamily: 'var(--ny-font)' }}
    >
      <div
        className="max-w-[1120px] mx-auto px-8 pt-12 pb-14 flex flex-wrap gap-8 justify-between text-[13px]"
        style={{ color: 'var(--ny-ink-3)' }}
      >
        <div>
          <div className="text-[15px] font-semibold" style={{ color: 'var(--ny-ink)' }}>NeuroYou</div>
          <div className="mt-1">Independent Consciousness Laboratory · © {new Date().getFullYear()}</div>
        </div>
        <nav className="flex flex-wrap items-center gap-5" style={{ color: 'var(--ny-ink-2)' }}>
          <Link href="/exercises" className="hover:text-[var(--ny-ink)] transition-colors">Learn</Link>
          <Link href="/blog" className="hover:text-[var(--ny-ink)] transition-colors">Explore</Link>
          <Link href="/protocols" className="hover:text-[var(--ny-ink)] transition-colors">Protocols</Link>
          <Link href="/research" className="hover:text-[var(--ny-ink)] transition-colors">Research</Link>
          <Link href="/about" className="hover:text-[var(--ny-ink)] transition-colors">About</Link>
          <Link href="/start-here" className="hover:text-[var(--ny-ink)] transition-colors">Start Here</Link>
          <a href="https://www.facebook.com/neuroyou" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ny-ink)] transition-colors">Facebook</a>
          <a href="https://neuroyou.substack.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ny-ink)] transition-colors">Substack</a>
        </nav>
      </div>
    </footer>
  )
}
