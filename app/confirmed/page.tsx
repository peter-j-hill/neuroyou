import Link from 'next/link'

export default function ConfirmedPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="label mb-8">
        <span className="node mr-3" />
        Verification complete
      </p>
      <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-6">
        Congratulations — you&apos;re confirmed.
      </h1>
      <p className="text-sm text-[var(--muted)] font-light leading-relaxed mb-10">
        Your account has been confirmed successfully. Please return to the login page and sign in.
      </p>
      <Link
        href="/login"
        className="inline-block px-6 py-3 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors"
      >
        Go to login
      </Link>
    </div>
  )
}
