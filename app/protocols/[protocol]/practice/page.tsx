import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { requireProtocolAccess } from '@/lib/protocols/access'
import { loadCourseState } from '@/lib/protocols/load'
import { emotionRoomWording } from '@/lib/protocols/wording'
import { isEmotionsRoom } from '@/lib/protocols/practice-journal'
import { FEATURES } from '@/lib/protocols/features'
import PracticeRoom from '@/components/protocols/practice/PracticeRoom'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Practice room · NeuroYou', robots: { index: false, follow: false } }

type Params = Promise<{ protocol: string }>

// The emotions practice room (design canvas artboard 04). The course-wide access check runs in the layout;
// this page adds the room's own rule: its module (Module 4) must be open to this student. The admin sees everything.
export default async function PracticeRoomPage({ params }: { params: Params }) {
  const { protocol: slug } = await params
  const { supabase, user, protocol, admin } = await requireProtocolAccess(slug)
  if (!FEATURES.practiceRoom && !admin) redirect(`/protocols/${slug}`)

  const state = await loadCourseState(supabase, { protocolId: protocol.id, userId: user.id, unlockAll: admin })
  const mod = state.modules.find((m) => m.lessons.some(isEmotionsRoom))
  if (!mod) notFound()
  if (mod.locked) redirect(`/protocols/${slug}`)

  return <PracticeRoom protocolSlug={slug} exitHref={`/protocols/${slug}`} wording={emotionRoomWording()} />
}
