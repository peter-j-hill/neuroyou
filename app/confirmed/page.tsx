import Link from 'next/link'
import AuthShell, { AuthTitle } from '@/components/AuthShell'

export default function ConfirmedPage() {
  return (
    <AuthShell>
      <div className="text-[15px] font-medium mb-3.5" style={{ color: 'var(--ny-leaf)' }}>Verification complete</div>
      <AuthTitle title="Congratulations — you’re confirmed." />
      <p className="mt-4 text-[17px] leading-relaxed" style={{ color: 'var(--ny-ink-3)' }}>
        Your account has been confirmed successfully. Please return to the login page and sign in.
      </p>
      <Link href="/login" className="ny-btn ny-btn-primary mt-7" style={{ padding: '12px 22px' }}>
        Go to login
      </Link>
    </AuthShell>
  )
}
