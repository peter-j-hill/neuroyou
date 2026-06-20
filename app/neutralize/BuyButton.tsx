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
      className="px-8 py-3 bg-[var(--accent)] text-white text-sm font-sans rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? 'Preparing checkout…' : 'Enrol in Neutralize'}
    </button>
  )
}
