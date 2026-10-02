'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type Registration = {
  id: string
  created_at: string
  name: string
  first_name: string | null
  last_name: string | null
  organization: string | null
  email: string
  interest: string | null
  interests: string[] | null
  marketing_consent: boolean
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function RegistrationsTable({ initial }: { initial: Registration[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(initial)
  const [error, setError] = useState('')

  const downloadCsv = () => {
    const header = ['Date', 'First name', 'Last name', 'Name', 'Organization', 'Email', 'Interested in', 'Message', 'Email consent']
    const lines = rows.map((r) => [
      new Date(r.created_at).toISOString(),
      r.first_name ?? '',
      r.last_name ?? '',
      r.name,
      r.organization ?? '',
      r.email,
      (r.interests ?? []).join('; '),
      r.interest ?? '',
      r.marketing_consent ? 'Yes' : 'No',
    ])
    const csv = [header, ...lines].map((l) => l.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `neuroyou-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const remove = async (r: Registration) => {
    if (!confirm(`Delete the registration from ${r.name} (${r.email})? This cannot be undone.`)) return
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('interest_registrations').delete().eq('id', r.id)
    if (error) { setError(error.message); return }
    setRows((cur) => cur.filter((x) => x.id !== r.id))
    router.refresh()
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="m-0 text-[22px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>Registrations</h1>
            <p className="m-0 mt-1 text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>
              From the Connect form on neuroyou.online · {rows.length} {rows.length === 1 ? 'person' : 'people'}
            </p>
          </div>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="rounded-full border px-4 py-2 text-[13px] bg-white transition-colors hover:border-[var(--ny-ink)] disabled:opacity-40"
            style={{ borderColor: 'var(--ny-line-strong)' }}
          >
            ↓ Download CSV
          </button>
        </div>

        {error && <p className="mt-4 text-sm" role="alert" style={{ color: 'var(--ny-coral)' }}>{error}</p>}

        {rows.length === 0 ? (
          <div className="mt-6 rounded-[14px] bg-white p-10 text-center text-sm" style={{ color: 'var(--ny-ink-3)' }}>
            No registrations yet. People who use the Connect form will appear here.
          </div>
        ) : (
          <div className="mt-6 rounded-[14px] bg-white overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="text-left text-xs" style={{ color: 'var(--ny-ink-3)' }}>
                  {['Date', 'Name', 'Organization', 'Email', 'Interested in', 'Message', 'Consent', ''].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap border-b" style={{ borderColor: 'var(--ny-line)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap border-b" style={{ borderColor: '#F0F0F3', color: 'var(--ny-ink-3)' }}>{fmt(r.created_at)}</td>
                    <td className="px-4 py-3 border-b font-medium" style={{ borderColor: '#F0F0F3' }}>{r.name}</td>
                    <td className="px-4 py-3 border-b" style={{ borderColor: '#F0F0F3', color: 'var(--ny-ink-2)' }}>{r.organization ?? '—'}</td>
                    <td className="px-4 py-3 border-b" style={{ borderColor: '#F0F0F3' }}>
                      <a href={`mailto:${r.email}`} style={{ color: 'var(--ny-tide)' }}>{r.email}</a>
                    </td>
                    <td className="px-4 py-3 border-b" style={{ borderColor: '#F0F0F3', color: 'var(--ny-ink-2)' }}>
                      {(r.interests ?? []).length ? (r.interests ?? []).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 border-b min-w-[220px] max-w-[360px]" style={{ borderColor: '#F0F0F3', color: 'var(--ny-ink-2)' }}>{r.interest ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap border-b" style={{ borderColor: '#F0F0F3', color: r.marketing_consent ? 'var(--ny-leaf)' : 'var(--ny-ink-4)' }}>
                      {r.marketing_consent ? '✓ Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3 border-b text-right" style={{ borderColor: '#F0F0F3' }}>
                      <button type="button" onClick={() => remove(r)} className="text-xs" style={{ color: 'var(--ny-coral)' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
