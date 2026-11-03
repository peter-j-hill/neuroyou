'use server'

import { recordVideoProgress, type ProgressResult } from '@/lib/protocols/progress'

export async function saveVideoProgress(input: {
  protocolSlug: string
  lessonId: string
  seconds: number
  duration: number
}): Promise<ProgressResult> {
  return recordVideoProgress(input)
}
