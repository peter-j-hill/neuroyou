import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, type, published_at, sort_order')
    .order('sort_order', { ascending: true })

  return <AdminClient posts={posts ?? []} />
}
