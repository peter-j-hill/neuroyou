'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// The public site's nav + footer wrap every page except the admin, which is a
// self-contained app with its own sidebar.
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <Nav />
      {/* pt-14 offsets the fixed 56px nav. Hero pages cancel this with a
          negative top margin on their hero section so it can bleed
          underneath — see the design handoff README. */}
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </>
  )
}
