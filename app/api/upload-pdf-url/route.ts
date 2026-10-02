import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

// Admin only. Returns a signed upload URL for the public `paper-pdfs` bucket, so the
// browser uploads the PDF straight to storage (no 4.5 MB serverless body limit).
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await admin.storage.from('paper-pdfs').createSignedUploadUrl(path)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ path: data.path, token: data.token })
}
