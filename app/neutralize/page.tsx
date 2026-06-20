import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BuyButton from './BuyButton'

export const revalidate = 60

export default async function NeutralizePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let hasPurchased = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('purchased_neutralize')
      .eq('id', user.id)
      .single()
    hasPurchased = profile?.purchased_neutralize ?? false
  }

  const { data: modules } = await supabase
    .from('neutralize_modules')
    .select('id, order_index, title, body_text')
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-sm font-sans text-[var(--muted)] tracking-widest uppercase mb-4">
        The course
      </p>
      <h1 className="text-4xl font-normal mb-6 max-w-lg">Neutralize</h1>
      <p className="text-xl text-[var(--muted)] max-w-xl leading-relaxed mb-12">
        A structured course in emotional regulation — for people whose unpleasant emotional
        states are limiting their lives, and who want a neuroscience-grounded way through.
      </p>

      {/* What it is */}
      <div className="grid sm:grid-cols-2 gap-12 mb-16 pb-16 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-normal mb-4">What this is</h2>
          <p className="text-[var(--muted)] leading-relaxed text-sm mb-4">
            Neutralize is a fixed sequential course — Module 1 leads to Module 2, and so on.
            It is not a library of content to browse; it is a curriculum to work through in order.
          </p>
          <p className="text-[var(--muted)] leading-relaxed text-sm">
            Each module contains a mix of video, audio exercises (some designed for outdoor or
            movement contexts), and text. Progress is tracked by date of completion — nothing
            more decorative than that.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-normal mb-4">What it&apos;s not</h2>
          <p className="text-[var(--muted)] leading-relaxed text-sm mb-4">
            It is not a meditation course. It is not positive psychology or cognitive behavioural
            work. It does not ask you to change your thoughts or build better habits.
          </p>
          <p className="text-[var(--muted)] leading-relaxed text-sm">
            It works directly on the felt, sensory reality of emotional experience — on what
            is actually happening in your nervous system, moment to moment.
          </p>
        </div>
      </div>

      {/* Module list preview */}
      {modules && modules.length > 0 && (
        <div className="mb-16">
          <h2 className="text-lg font-normal mb-6">Course modules</h2>
          <div className="space-y-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className={`flex items-start gap-4 p-5 border border-[var(--border)] rounded-sm ${
                  hasPurchased ? 'hover:border-[var(--accent)] transition-colors' : 'opacity-70'
                }`}
              >
                <span className="text-xs font-sans text-[var(--muted)] pt-0.5 shrink-0 w-6">
                  {mod.order_index}
                </span>
                <div>
                  <h3 className="text-sm font-normal">{mod.title}</h3>
                  {mod.body_text && (
                    <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed line-clamp-2">
                      {mod.body_text.slice(0, 120)}…
                    </p>
                  )}
                </div>
                {hasPurchased && (
                  <Link
                    href={`/neutralize/${mod.id}`}
                    className="ml-auto text-xs font-sans text-[var(--accent)] hover:underline underline-offset-4 shrink-0"
                  >
                    Open →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {hasPurchased ? (
        <div className="p-6 bg-[var(--accent-light)] rounded-sm">
          <p className="text-sm font-sans text-[var(--accent)] mb-1">You have access to Neutralize.</p>
          <Link
            href="/neutralize/1"
            className="text-sm font-sans text-[var(--accent)] font-medium hover:underline underline-offset-4"
          >
            Continue to Module 1 →
          </Link>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-sm p-8">
          <h2 className="text-2xl font-normal mb-3">Get full access</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-6 max-w-md">
            One-time payment. Includes all modules, audio files, and any future additions
            to the course.
          </p>
          <BuyButton />
          {!user && (
            <p className="text-xs font-sans text-[var(--muted)] mt-4">
              You&apos;ll be asked to create a free account before checkout.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
