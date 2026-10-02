'use client'

import { useEffect } from 'react'

// Opens the print dialog when the page is loaded with ?print=1 (used by the
// "↓ PDF" links on papers that don't have an uploaded PDF yet).
export default function PrintOnLoad() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('print') !== '1') return
    const t = setTimeout(() => window.print(), 700)
    return () => clearTimeout(t)
  }, [])
  return null
}
