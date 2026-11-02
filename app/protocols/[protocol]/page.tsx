import type { Metadata } from 'next'
import { requireProtocolAccess } from '@/lib/protocols/access'
import { loadCourseState } from '@/lib/protocols/load'
import { PROTOCOL_CARDS } from '@/content/protocols'
import CourseHome, { type JournalPreview } from '@/components/protocols/course/CourseHome'

export const dynamic = 'force-dynamic'

type Params = Promise<{ protocol: string }>
type Search = Promise<{ [key: string]: string | string[] | undefined }>

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CourseHomePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { protocol: slug } = await params
  const sp = await searchParams
  const { supabase, user, protocol, admin } = await requireProtocolAccess(slug)

  const [state, journalRes] = await Promise.all([
    loadCourseState(supabase, { protocolId: protocol.id, userId: user.id, unlockAll: admin }),
    supabase
      .from('protocol_journal_entries')
      .select('id, created_at, topic, kind, text')
      .eq('user_id', user.id)
      .eq('protocol_id', protocol.id)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  const card = PROTOCOL_CARDS.find((c) => c.slug === slug)
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

  return (
    <div className="ny-scope bg-white">
      <CourseHome
        slug={slug}
        eyebrow={card ? `${card.n} · ${card.tag}` : protocol.title}
        title={card?.full ?? protocol.title}
        state={state}
        journal={(journalRes.data ?? []) as JournalPreview[]}
        welcome={first(sp.welcome) === '1'}
        adminView={admin}
      />
    </div>
  )
}
