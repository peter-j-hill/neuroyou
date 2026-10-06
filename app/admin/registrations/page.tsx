import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RegistrationsTable, { type Registration } from './RegistrationsTable'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

export default async function RegistrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  // interest_registrations is shared with peterjonathanhill.com; only this site's rows.
  // Row-level security already limits reads of this table to the admin login.
  const { data } = await supabase
    .from('interest_registrations')
    .select('id, created_at, name, first_name, last_name, organization, email, interest, interests, marketing_consent')
    .eq('origin', 'neuroyou')
    .order('created_at', { ascending: false })

  return <RegistrationsTable initial={(data ?? []) as Registration[]} />
}
