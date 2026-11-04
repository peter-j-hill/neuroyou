import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy · NeuroYou',
  description: 'What NeuroYou stores about you, who can see it, and how to download or delete it.',
}

// DRAFT privacy statement, written by Claude Code from how the site actually works (what the database
// stores, which services are used) for Peter to review. It is a plain-language statement, not legal
// advice. Points that need Peter's confirmation are listed in the pull request.
const UPDATED = '4 November 2026'

type Section = { id: string; title: string; body: React.ReactNode }

const SECTIONS: Section[] = [
  {
    id: 'who',
    title: 'Who we are',
    body: (
      <p>
        NeuroYou is an independent consciousness laboratory run by Peter J Hill. This page explains what the site
        stores about you and why. To ask a question about your information, use the{' '}
        <Link href="/connect">Connect page</Link>.
      </p>
    ),
  },
  {
    id: 'collect',
    title: 'What we store',
    body: (
      <ul>
        <li><strong>Your account:</strong> your email address, your name if you gave one, and a password that is stored in scrambled form by our sign-in service, so we cannot read it.</li>
        <li><strong>Your journal:</strong> the notes you choose to write, with the date and time. If you take a protocol, notes from its practice room also record the emotion or sense you worked on and how it felt afterwards.</li>
        <li><strong>Your course progress:</strong> which lessons you have opened or finished, and where you stopped in a video, so you can pick up where you left off.</li>
        <li><strong>Your purchases:</strong> which protocol you bought, when, the amount, and any promo code used. Your card details go straight to our payment provider, Stripe. We never see or store them.</li>
        <li><strong>Our mailing list:</strong> your name and email, only if you tick the box when you sign up or use a sign-up form on the site. You can unsubscribe at any time.</li>
        <li><strong>Technical records:</strong> like any website, our hosting keeps routine server logs (such as your IP address and the pages requested) for security and to keep the site running.</li>
      </ul>
    ),
  },
  {
    id: 'journal',
    title: 'Your journal is private',
    body: (
      <>
        <p>
          Only you can read your journal. Other accounts cannot, and the site&apos;s admin screens have no way to display it.
          We never use it for marketing or advertising, and we never sell or share it.
        </p>
        <p>
          To be straightforward about the limits: the journal is kept in the same database that runs the site, so the
          site owner and our database provider technically have access to that database in order to run the service.
          We do not read journals.
        </p>
        <p>
          Because we do not read journals, we cannot respond to anything you write in one. If you are in distress,
          please contact a local support service or someone you trust.
        </p>
      </>
    ),
  },
  {
    id: 'why',
    title: 'Why we use it',
    body: (
      <p>
        To run your account and the things you ask for: signing you in, saving your journal and progress, letting you
        into the protocols you have bought, and sending the confirmation and password emails the account needs. We email
        you news only if you opted in.
      </p>
    ),
  },
  {
    id: 'where',
    title: 'Who else handles it',
    body: (
      <>
        <p>We use a small number of services to run the site. Each receives only what it needs for its job:</p>
        <ul>
          <li><strong>Supabase:</strong> our database and sign-in service. Your account, journal and progress are stored there, in the United States.</li>
          <li><strong>Vercel:</strong> hosts the website.</li>
          <li><strong>Stripe:</strong> takes payments for protocols.</li>
          <li><strong>Bunny.net:</strong> delivers the course videos. It sees your IP address when a video plays.</li>
          <li><strong>Vimeo:</strong> plays some of the free exercise videos.</li>
        </ul>
        <p>
          Because these services are based in or operate from other countries, your information may be processed outside
          the country where you live.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <p>
        We use only the cookies needed to keep you signed in. We do not use advertising or tracking cookies. The video
        players mentioned above may set their own cookies when you play a video.
      </p>
    ),
  },
  {
    id: 'choices',
    title: 'Your choices',
    body: (
      <ul>
        <li><strong>Download your journal</strong> as a text file from the <Link href="/journal">journal page</Link>.</li>
        <li><strong>Delete a journal note</strong> from the same page. It is removed immediately and permanently.</li>
        <li><strong>Delete your account</strong> and everything stored with it, including your journal and progress, by asking us on the <Link href="/connect">Connect page</Link> from the email address on the account.</li>
        <li><strong>Leave the mailing list</strong> using the unsubscribe link in any email, or by asking us.</li>
        <li>You can also ask what we hold about you, or ask us to correct it.</li>
      </ul>
    ),
  },
  {
    id: 'keep',
    title: 'How long we keep it',
    body: (
      <p>
        Your account, journal and progress are kept until you delete them or your account. Records of purchases are kept
        for as long as accounting and tax rules require, even if the account is deleted.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this page',
    body: <p>If we change how we handle your information, we will update this page and the date below.</p>,
  },
]

export default function PrivacyPage() {
  return (
    <div className="ny-scope bg-white pb-28">
      <div className="mx-auto max-w-[760px] px-4 pt-20 sm:px-8">
        <div className="ny-eyebrow mb-3.5">Privacy</div>
        <h1 className="m-0 text-[40px] leading-[1.05] sm:text-[52px]" style={{ letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>
          How we look after your information.
        </h1>
        <p className="mt-5 text-[19px] leading-relaxed" style={{ color: 'var(--ny-ink-2)' }}>
          In short: we store what is needed to run your account, your journal is private to you, and we do not sell or
          advertise with your information.
        </p>

        <div className="mt-12 flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <section key={s.id} aria-labelledby={`${s.id}-h`} className="privacy-section flex flex-col gap-3">
              <h2 id={`${s.id}-h`} className="m-0 text-[24px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>{s.title}</h2>
              <div className="flex flex-col gap-3 text-[17px] leading-relaxed [&_a]:underline [&_a]:text-[var(--ny-tide)] [&_li]:mt-2 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:m-0" style={{ color: 'var(--ny-ink-2)' }}>
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 text-sm" style={{ color: 'var(--ny-ink-3)' }}>Last updated {UPDATED}.</p>
      </div>
    </div>
  )
}
