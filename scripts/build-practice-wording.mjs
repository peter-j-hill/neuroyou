// Turns the practice room wording spreadsheet into content/practice-wording.json.
//
//   node scripts/build-practice-wording.mjs [path-to-spreadsheet]
//
// Peter edits the spreadsheet (the single source for practice room wording); this script checks it and writes
// the data file the practice rooms read. The room code contains no practice wording of its own.
// Needs the dev dependency read-excel-file. The generated JSON is committed, so the site never reads the spreadsheet.

import { readSheet } from 'read-excel-file/node'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(process.argv[2] ?? resolve(root, '..', 'protocols-handoff', 'Neutralize_practice_wording.xlsx'))
const target = resolve(root, 'content', 'practice-wording.json')

const problems = []
const warnings = []
const fail = (msg) => problems.push(msg)
const warn = (msg) => warnings.push(msg)

// The nine senses of the advanced room. The abstract senses belong to NeuroFinity preparation and must never appear here.
const SENSES = ['sight', 'sound', 'touch', 'taste', 'smell', 'internal sensation', 'memory', 'imagination', 'thinking']

const text = (v) => (v == null ? '' : String(v).trim())

const [steps, shared] = await Promise.all([readSheet(source, 'Steps by sense'), readSheet(source, 'Shared steps')])

// ── Steps by sense ───────────────────────────────────────────────────────────
const header = steps[0].map(text)
const col = (name) => {
  const i = header.indexOf(name)
  if (i < 0) fail(`The "Steps by sense" sheet has no column "${name}".`)
  return i
}
const C = {
  version: col('Version'), name: col('Emotion or sense'), opening: col('Step 1 · opening words'),
  pills: col('Step 1 · example pills (one per line)'), placeholder: col('Step 1 · placeholder for own entry'),
  s2main: col('Step 2 · main line'), s2support: col('Step 2 · supporting text'),
  s3main: col('Step 3 · main line'), s3support: col('Step 3 · supporting text'),
  lines: [1, 2, 3, 4, 5, 6].map((n) => col(`Step 3 · instruction line ${n}`)),
  question: col('Step 6 · question'), answers: col('Step 6 · answer buttons'),
}

const RESULTS = ['lighter', 'neutral', 'same', 'stronger']

function readRow(row, label, placeholder) {
  const get = (i) => text(row[i])
  const need = (value, what) => {
    if (!value) fail(`${label}: ${what} is empty.`)
    return value
  }
  const entry = {
    opening: need(get(C.opening), 'Step 1 opening words'),
    pills: get(C.pills).split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    placeholder: need(get(C.placeholder), 'Step 1 placeholder'),
    step2: { main: need(get(C.s2main), 'Step 2 main line'), support: need(get(C.s2support), 'Step 2 supporting text') },
    step3: {
      main: need(get(C.s3main), 'Step 3 main line'),
      support: need(get(C.s3support), 'Step 3 supporting text'),
      lines: C.lines.map((i, n) => need(get(i), `Step 3 instruction line ${n + 1}`)),
    },
    step6: { question: need(get(C.question), 'Step 6 question'), answers: get(C.answers).split('|').map((s) => s.trim()).filter(Boolean) },
  }
  if (entry.pills.length === 0) fail(`${label}: no example pills.`)
  if (entry.step6.answers.length !== 4) fail(`${label}: Step 6 needs exactly 4 answer buttons separated by | (found ${entry.step6.answers.length}).`)
  if (!entry.step6.question.includes(placeholder)) fail(`${label}: the Step 6 question should contain ${placeholder}.`)
  if (!entry.step3.lines[0].includes(placeholder)) fail(`${label}: Step 3 instruction line 1 should contain ${placeholder}.`)
  return entry
}

let emotion = null
const senses = {}
for (const row of steps.slice(1)) {
  const version = text(row[C.version])
  const name = text(row[C.name])
  if (!version && !name) continue
  if (version.toLowerCase().startsWith('emotion')) {
    if (emotion) fail('More than one Emotions row.')
    emotion = readRow(row, 'Emotions', '[emotion]')
  } else {
    const key = name.toLowerCase()
    if (!SENSES.includes(key)) {
      fail(`"${name}" is not one of the nine senses of the advanced room. Abstract senses are never included.`)
      continue
    }
    if (senses[key]) fail(`The sense "${name}" appears twice.`)
    senses[key] = { label: name, ...readRow(row, name, '[choice]') }
  }
}
if (!emotion) fail('There is no Emotions row.')
for (const s of SENSES) if (!senses[s]) fail(`The sense "${s}" has no row.`)

// ── Shared steps ─────────────────────────────────────────────────────────────
const sharedRows = Object.fromEntries(shared.slice(1).filter((r) => text(r[0])).map((r) => [text(r[0]), { label: text(r[1]), main: text(r[2]), support: text(r[3]) }]))
const sharedRow = (key, { label = false, support = true } = {}) => {
  const r = sharedRows[key]
  if (!r) return fail(`The "Shared steps" sheet has no row "${key}".`)
  if (!r.main) fail(`Shared steps "${key}": main line is empty.`)
  if (support && !r.support) fail(`Shared steps "${key}": supporting text is empty.`)
  if (label && !r.label) fail(`Shared steps "${key}": step bar label is empty.`)
  return r
}
const sharedOut = {
  step4: sharedRow('Step 4', { label: true }),
  step5: sharedRow('Step 5', { label: true }),
  afterZoom: sharedRow('Step 5 · after the zoom', { support: false })?.main,
  step7Emotions: sharedRow('Step 7 · emotions', { label: true }),
  step7Advanced: sharedRow('Step 7 · advanced', { label: true }),
}

// ── Checks (the house rules in the spreadsheet's "How to use" sheet) ──────────
const everyString = []
const collect = (path, v) => {
  if (typeof v === 'string') everyString.push([path, v])
  else if (Array.isArray(v)) v.forEach((x, i) => collect(`${path}[${i}]`, x))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) collect(`${path}.${k}`, x)
}
collect('emotion', emotion)
collect('senses', senses)
collect('shared', sharedOut)

const BANNED = [
  [/\bmind\b/i, '"mind"'], [/\bmindful(ness)?\b/i, '"mindfulness"'], [/bring to mind/i, '"bring to mind"'],
  [/\bwatch (it|them|the)\b/i, '"watch it"'], [/\blet (it|them) go\b/i, '"let it go"'],
]
for (const [path, s] of everyString) {
  for (const [re, label] of BANNED) if (re.test(s)) fail(`${path} uses ${label}: "${s}"`)
  for (const m of s.matchAll(/\[([^\]]*)\]/g)) {
    const ph = m[0]
    const emotional = path.startsWith('emotion')
    if (ph !== (emotional ? '[emotion]' : '[choice]')) fail(`${path} has the placeholder ${ph}, which is not allowed there.`)
  }
  if (/\b(\w+)\s+\1\b/i.test(s)) warn(`${path} repeats a word: "${s.match(/\b(\w+)\s+\1\b/i)[0]}" in "${s}"`)
}
const lineRe = /^[a-z][a-z_]*\((\[emotion\]|\[choice\]|[a-z_]+)\)$/
for (const [path, s] of everyString.filter(([p]) => /step3\.lines/.test(p))) {
  if (/[;]/.test(s)) fail(`${path} has a semicolon: "${s}"`)
  if (/\d/.test(s)) fail(`${path} has a number: "${s}"`)
  if (!lineRe.test(s)) fail(`${path} does not look like thing(action): "${s}"`)
}

if (problems.length) {
  console.error(`\nThe wording has ${problems.length} problem${problems.length === 1 ? '' : 's'}; nothing was written:\n`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exit(1)
}

const out = {
  _generated: 'Generated from Neutralize_practice_wording.xlsx by scripts/build-practice-wording.mjs. Do not edit by hand: edit the spreadsheet and run the script.',
  answerResults: RESULTS,
  emotion,
  senses,
  shared: sharedOut,
}
writeFileSync(target, JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`Wrote ${target}`)
console.log(`  Emotions row + ${Object.keys(senses).length} senses + shared steps from ${source}`)
for (const w of warnings) console.warn(`  ! ${w}`)
