'use server'

import { recordPracticeEntry, type PracticeSaveResult } from '@/lib/protocols/practice-journal'

export async function savePracticeEntry(input: {
  protocolSlug: string
  emotion: string
  result: string
  note: string
}): Promise<PracticeSaveResult> {
  return recordPracticeEntry(input)
}
