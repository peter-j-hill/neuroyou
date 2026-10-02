'use client'

import { useState } from 'react'
import Link from 'next/link'

// Page copy from the redesign handoff. Previous strings, kept here so they are easy
// to restore:
//   eyebrow "Connect" / heading "Register your interest" / "The first NeuroYou Protocol
//   is opening to a small group. Leave your details to be notified."
//   fields: Name, Organization — optional ("Company or institution"), Email address
//   ("you@organization.com"), Interest — optional ("What are you hoping to explore with
//   NeuroYou?"), checkbox "I agree to receive occasional email about the NeuroYou
//   Protocols.", button "Register interest".
//   Thank-you: "Registered" / "You're on the list." / "Thanks for registering your
//   interest. We'll be in touch when the first NeuroYou Protocol opens."
const COPY = {
  eyebrow: 'Connect',
  heading: 'Register interest.',
  intro: 'Be first to hear when the protocols and the book become available.',
  thanksEyebrow: 'Received',
  thanksHeading: 'Thank you.',
  thanksBody: 'We’ll be in touch when registration opens. In the meantime, try a free practice.',
}

const INTERESTS = ['The Protocols', 'Reality Check (book)', 'New articles', 'Research papers', 'Workshops']

export default function ConnectPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const toggle = (label: string) =>
    setInterests((cur) => (cur.includes(label) ? cur.filter((i) => i !== label) : [...cur, label]))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, organization, email, interests, message, marketingConsent }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="ny-scope bg-white -mt-14 grid md:grid-cols-2 min-h-screen">
      {/* Image: a short banner on phones, a full-height column from md up */}
      <div className="relative h-[260px] md:h-auto md:min-h-[420px]" style={{ background: '#2C6E7F' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/redesign-placeholders/woman.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-14 pt-12 md:pt-[136px] pb-24 max-w-[620px]">
        {done ? (
          <div>
            <div className="text-[15px] font-medium mb-3.5" style={{ color: 'var(--ny-leaf)' }}>{COPY.thanksEyebrow}</div>
            <h1 className="m-0" style={{ fontSize: 'clamp(36px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>
              {COPY.thanksHeading}
            </h1>
            <p className="mt-4 text-[19px] leading-normal" style={{ color: 'var(--ny-ink-3)' }}>{COPY.thanksBody}</p>
            <Link href="/exercises" className="ny-btn ny-btn-primary mt-7" style={{ padding: '12px 22px' }}>Go to Learn</Link>
          </div>
        ) : (
          <div>
            <div className="ny-eyebrow mb-3.5">{COPY.eyebrow}</div>
            <h1 className="m-0" style={{ fontSize: 'clamp(38px, 5.5vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--ny-ink)' }}>
              {COPY.heading}
            </h1>
            <p className="mt-4 text-[19px] leading-normal" style={{ color: 'var(--ny-ink-3)' }}>{COPY.intro}</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-10">
              <div className="grid grid-cols-2 gap-3">
                <label htmlFor="firstName" className="sr-only">First name</label>
                <input id="firstName" type="text" required autoComplete="given-name" placeholder="First name"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} className="ny-field" />
                <label htmlFor="lastName" className="sr-only">Last name</label>
                <input id="lastName" type="text" autoComplete="family-name" placeholder="Last name"
                  value={lastName} onChange={(e) => setLastName(e.target.value)} className="ny-field" />
              </div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input id="email" type="email" required autoComplete="email" placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)} className="ny-field" />
              <label htmlFor="organization" className="sr-only">Organization (optional)</label>
              <input id="organization" type="text" autoComplete="organization" placeholder="Organization (optional)"
                value={organization} onChange={(e) => setOrganization(e.target.value)} className="ny-field" />

              <div className="text-[13px] mt-2" style={{ color: 'var(--ny-ink-3)' }}>I’m interested in</div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
                {INTERESTS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="ny-chip"
                    data-variant="tint"
                    data-on={interests.includes(label)}
                    aria-pressed={interests.includes(label)}
                    onClick={() => toggle(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label htmlFor="message" className="sr-only">Message (optional)</label>
              <textarea id="message" rows={3} placeholder="Message (optional)"
                value={message} onChange={(e) => setMessage(e.target.value)} className="ny-field" />

              <label className="flex items-start gap-3 text-[15px] leading-normal" style={{ color: 'var(--ny-ink-3)' }}>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1"
                  style={{ accentColor: 'var(--ny-tide)' }}
                />
                I agree to receive occasional email about the NeuroYou Protocols.
              </label>

              {error && <p className="text-sm m-0" role="alert" style={{ color: 'var(--ny-coral)' }}>{error}</p>}

              <button type="submit" disabled={loading} className="ny-btn ny-btn-primary self-start mt-2 disabled:opacity-50"
                style={{ padding: '13px 26px' }}>
                {loading ? 'Sending…' : 'Register Interest'}
              </button>
              <div className="text-[13px]" style={{ color: 'var(--ny-ink-4)' }}>
                Or follow on{' '}
                <a href="https://neuroyou.substack.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ny-tide)' }}>Substack</a>{' '}
                and{' '}
                <a href="https://www.facebook.com/neuroyou" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ny-tide)' }}>Facebook</a>.
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
