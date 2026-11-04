import Link from 'next/link'

// The block at the bottom of each free exercise. Signed out: an invitation to make a free account (and so a
// journal), which comes straight back to this exercise. Signed in: the button that starts a note about it.
export default function JournalCta({ exerciseId, signedIn }: { exerciseId: string; signedIn: boolean }) {
  const back = encodeURIComponent(`/exercises/${exerciseId}`)
  return (
    <aside
      className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-[18px] p-7"
      style={{ background: 'var(--ny-mist)' }}
      aria-label="Your journal"
    >
      <div className="min-w-0 flex-[1_1_320px]">
        <h2 className="m-0 text-[22px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>
          {signedIn ? 'Note what you noticed' : 'Keep a journal'}
        </h2>
        <p className="m-0 mt-1.5 text-[17px]" style={{ color: 'var(--ny-ink-2)' }}>
          {signedIn
            ? 'Write a private note about this exercise. Only you can see it.'
            : 'A free, private place to write down what you notice. Only you can see it.'}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        {signedIn ? (
          <Link href={`/journal?exercise=${exerciseId}`} className="ny-btn ny-btn-primary">Add to your journal</Link>
        ) : (
          <>
            <Link href={`/signup?next=${back}`} className="ny-btn ny-btn-primary">Create my free NeuroYou journal</Link>
            <span className="text-sm" style={{ color: 'var(--ny-ink-3)' }}>
              Already have an account?{' '}
              <Link href={`/login?next=${back}`} className="underline" style={{ color: 'var(--ny-tide)' }}>Sign in</Link>
            </span>
          </>
        )}
      </div>
    </aside>
  )
}
