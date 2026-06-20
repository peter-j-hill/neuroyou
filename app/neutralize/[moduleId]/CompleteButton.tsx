'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CompleteButton({ moduleId, userId }: { moduleId: string; userId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('module_progress').upsert({
      user_id: userId,
      module_id: moduleId,
      completed_at: new Date().toISOString(),
    })
    router.refresh()
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="px-5 py-2 border border-[var(--accent)] text-[var(--accent)] text-sm font-sans rounded-sm hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50"
    >
      {loading ? 'Saving…' : 'Mark complete'}
    </button>
  )
}
