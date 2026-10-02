import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

// Lets the nav and the login page know whether the signed-in user is the admin.
// Only a yes/no goes back; the real access control stays on /admin and the admin APIs.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return NextResponse.json(
    { admin: !!user && user.email === ADMIN_EMAIL },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
