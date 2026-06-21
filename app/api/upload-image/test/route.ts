import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    adminEmail: process.env.ADMIN_EMAIL ?? '(not set)',
  })
}
