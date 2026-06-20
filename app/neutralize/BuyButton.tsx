'use client'

import { useState } from 'react'

export default function BuyButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const res = await fetch('/api/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else if (data.redirect) {
      window.location.href = data.redirect
    } else {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-8 py-3 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors disabled:opacity-40"
    >
      {loading ? 'Preparing…' : 'Enrol in Neutralize'}
    </button>
  )
}
