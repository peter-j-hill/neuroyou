// The journal: types and the pure rules for showing it (filters, the "how it felt over time" trail,
// the plain-text download). No database access here, so the rules are easy to test and read in one place.

export type JournalKind = 'practice' | 'advanced' | 'lesson' | 'own' | 'exercise'
export type JournalResult = 'lighter' | 'neutral' | 'same' | 'stronger'

export type JournalEntry = {
  id: string
  created_at: string
  kind: JournalKind
  topic_kind: 'emotion' | 'sense' | null
  topic: string | null
  item: string | null
  result: JournalResult | null
  text: string
  /** Title of the lesson or free exercise the note is about, when there is one. */
  detail: string | null
}

export const MAX_ENTRY_CHARS = 10000

export const SOURCE_LABEL: Record<JournalKind, string> = {
  practice: 'Practice',
  advanced: 'Advanced practice',
  lesson: 'Lesson',
  own: 'My note',
  exercise: 'Exercise',
}

export type JournalFilter = 'all' | 'practice' | 'lesson' | 'exercise' | 'own'

const FILTER_LABEL: Record<JournalFilter, string> = {
  all: 'All',
  practice: 'Practice',
  lesson: 'Lessons',
  exercise: 'Exercises',
  own: 'My Notes',
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "Fainter" is how a lighter sense is described; everything else uses the same words as the practice room. */
export function resultLabel(result: JournalResult | null, topicKind: 'emotion' | 'sense' | null): string {
  if (!result) return ''
  if (result === 'lighter') return topicKind === 'sense' ? 'Fainter' : 'Lighter'
  return { neutral: 'Neutral', same: 'About the same', stronger: 'Stronger' }[result]
}

export function topicLabel(e: Pick<JournalEntry, 'topic' | 'topic_kind' | 'item'>): string {
  if (!e.topic) return ''
  return e.topic_kind === 'sense' && e.item ? `${cap(e.topic)} · ${e.item}` : cap(e.topic)
}

const inFilter = (e: JournalEntry, f: JournalFilter) =>
  f === 'all' || e.kind === f || (f === 'practice' && e.kind === 'advanced')

/** Only offer the filters a person has entries for, so a free account is not shown empty "Practice" and "Lessons" tabs. */
export function availableFilters(entries: JournalEntry[]): { id: JournalFilter; label: string }[] {
  const ids = (['practice', 'lesson', 'exercise', 'own'] as const).filter((id) => entries.some((e) => inFilter(e, id)))
  return ids.length === 0 ? [] : [{ id: 'all', label: FILTER_LABEL.all }, ...ids.map((id) => ({ id, label: FILTER_LABEL[id] }))]
}

export function filterEntries(entries: JournalEntry[], filter: JournalFilter, topic: string): JournalEntry[] {
  return entries.filter((e) => inFilter(e, filter) && (!topic || e.topic === topic))
}

/** Distinct emotions and senses used in practice entries, for the menu. */
export function topicsOf(entries: JournalEntry[]): { emotions: string[]; senses: string[] } {
  const uniq = (kind: 'emotion' | 'sense') =>
    Array.from(new Set(entries.filter((e) => e.topic_kind === kind && e.topic).map((e) => e.topic as string))).sort()
  return { emotions: uniq('emotion'), senses: uniq('sense') }
}

/** How a topic felt after each session, oldest first. */
export function topicTrail(entries: JournalEntry[], topic: string): JournalEntry[] {
  return entries
    .filter((e) => e.topic === topic && e.result)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

/** Plain-text copy of the whole journal, newest first, in the reader's own time zone and language. */
export function journalAsText(entries: JournalEntry[], locale?: string): string {
  const lines: string[] = ['My NeuroYou journal', '']
  for (const e of entries) {
    const when = new Date(e.created_at)
    const stamp = `${when.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}, ${when.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}`
    const tags = [SOURCE_LABEL[e.kind], e.detail, e.topic ? topicLabel(e) : null, e.result ? `felt ${resultLabel(e.result, e.topic_kind).toLowerCase()} afterwards` : null].filter(Boolean)
    lines.push(`${stamp} · ${tags.join(' · ')}`, e.text.trim(), '', '---', '')
  }
  return lines.join('\n')
}
