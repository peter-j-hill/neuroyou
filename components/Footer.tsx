import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)] font-sans">
          © {new Date().getFullYear()} NeuroYou
        </p>
        <nav className="flex gap-5 text-sm text-[var(--muted)] font-sans">
          <Link href="/start-here" className="hover:text-[var(--foreground)] transition-colors">Start Here</Link>
          <Link href="/exercises" className="hover:text-[var(--foreground)] transition-colors">Exercises</Link>
          <Link href="/blog" className="hover:text-[var(--foreground)] transition-colors">Research</Link>
          <Link href="/neutralize" className="hover:text-[var(--foreground)] transition-colors">Neutralize</Link>
        </nav>
      </div>
    </footer>
  )
}
