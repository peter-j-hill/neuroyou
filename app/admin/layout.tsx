import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

// Shell shared by every /admin page. Access control stays in each page (layouts are
// not re-run on client navigation, so they can't be the only gate).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const [{ count: contentCount }, { count: registrationCount }] = await Promise.all([
    supabase.from('content').select('id', { count: 'exact', head: true }).eq('site', 'neuroyou'),
    supabase.from('interest_registrations').select('id', { count: 'exact', head: true }).eq('origin', 'neuroyou'),
  ])

  return (
    <div
      className="ny-scope h-[100dvh] grid grid-rows-[auto_minmax(0,1fr)] lg:grid-rows-1 lg:grid-cols-[220px_minmax(0,1fr)]"
      style={{ background: 'var(--ny-mist)' }}
    >
      <AdminSidebar contentCount={contentCount ?? 0} registrationCount={registrationCount ?? 0} />
      <div className="min-h-0 min-w-0">{children}</div>
    </div>
  )
}
