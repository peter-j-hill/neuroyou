import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { name, organization, email, interest, marketingConsent } = await request.json()

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // interest_registrations is shared with peterjonathanhill.com; `origin` (required)
  // says which site a row came from.
  const { error } = await admin.from('interest_registrations').insert({
    origin: 'neuroyou',
    name: name.trim(),
    organization: organization?.trim() || null,
    email: email.trim(),
    interest: interest?.trim() || null,
    marketing_consent: !!marketingConsent,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
