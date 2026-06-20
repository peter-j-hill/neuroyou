import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-32">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--white)]">NeuroYou</p>
          <p className="text-[0.6rem] tracking-[0.15em] uppercase text-[var(--muted)] mt-0.5">
            Independent Consciousness Laboratory
          </p>
        </div>
        <nav className="flex gap-6 text-[0.65rem] tracking-widest uppercase text-[var(--muted)]">
          <Link href="/start-here" className="hover:text-[var(--white)] transition-colors">Start Here</Link>
          <Link href="/exercises" className="hover:text-[var(--white)] transition-colors">Exercises</Link>
          <Link href="/blog" className="hover:text-[var(--white)] transition-colors">Research</Link>
          <Link href="/neutralize" className="hover:text-[var(--blue)] transition-colors text-[var(--blue)]">Neutralize</Link>
        </nav>
        <p className="text-[0.6rem] tracking-wider text-[var(--muted)]">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
