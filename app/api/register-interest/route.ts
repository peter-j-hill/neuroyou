import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const INTERESTS = ['The Protocols', 'Reality Check (book)', 'New articles', 'Research papers', 'Workshops']

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Older form versions posted a single `name`; keep accepting it.
  const firstName = text(body.firstName, 200) || text(body.name, 200)
  const lastName = text(body.lastName, 200)
  const email = text(body.email, 320)
  const organization = text(body.organization, 300)
  // The free-text note is stored in `interest`; older versions called it `interest` too.
  const message = text(body.message ?? body.interest, 4000)
  const interests = Array.isArray(body.interests)
    ? body.interests.filter((i: unknown): i is string => typeof i === 'string' && INTERESTS.includes(i))
    : []

  if (!firstName || !email) {
    return NextResponse.json({ error: 'First name and email are required' }, { status: 400 })
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // interest_registrations is shared with peterjonathanhill.com; `origin` (required)
  // says which site a row came from.
  const { error } = await admin.from('interest_registrations').insert({
    origin: 'neuroyou',
    name: [firstName, lastName].filter(Boolean).join(' '),
    first_name: firstName,
    last_name: lastName || null,
    organization: organization || null,
    email,
    interest: message || null,
    interests,
    marketing_consent: !!body.marketingConsent,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
