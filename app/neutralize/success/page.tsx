import Link from 'next/link'

export default function NeutralizeSuccessPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-normal mb-4">You have access to Neutralize.</h1>
      <p className="text-[var(--muted)] leading-relaxed mb-10">
        Your payment was received. All modules are now available to you.
      </p>
      <Link
        href="/neutralize"
        className="px-6 py-3 bg-[var(--accent)] text-white text-sm font-sans rounded-sm hover:opacity-90 transition-opacity"
      >
        Go to the course
      </Link>
    </div>
  )
}
