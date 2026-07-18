import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const { data: posts } = await supabase
    .from('content')
    .select('id, title, type, status, published_at, sort_order')
    .eq('site', 'neuroyou')
    .order('sort_order', { ascending: true })

  return <AdminClient posts={posts ?? []} />
}
