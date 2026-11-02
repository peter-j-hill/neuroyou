import { requireProtocolAccess } from '@/lib/protocols/access'

// Every page under /protocols/[protocol] (course home, lessons, practice rooms, journal) is for
// people who own the protocol (and the admin). One gate, here, for all of them.
export default async function ProtocolLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ protocol: string }>
}) {
  const { protocol } = await params
  await requireProtocolAccess(protocol)
  return children
}
