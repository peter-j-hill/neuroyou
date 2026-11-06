'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { savePracticeEntry } from '@/app/protocols/[protocol]/practice/actions'
import {
  ANSWER_RESULTS, fillInstruction, needsAnotherRound, splitAtEmotion, tidyEmotion, type EmotionRoomWording,
} from '@/lib/protocols/wording'
import NeuronField from './NeuronField'
import './practice.css'

// The emotions practice room (design canvas artboard 04): seven steps, a clickable step bar, the neuron field
// and zoom out, and a note saved to the journal. All wording comes from the wording data (see lib/protocols/wording.ts).

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const pillBase = 'cursor-pointer rounded-full px-4 py-2.5 text-[15px] min-h-10'

export default function PracticeRoom({
  protocolSlug,
  exitHref,
  wording,
}: {
  protocolSlug: string
  exitHref: string
  wording: EmotionRoomWording
}) {
  const { room, shared, ui } = wording

  const [step, setStep] = useState(0) // 0 prepare, 1 to 5 the steps, 6 open eyes and result
  const [emotion, setEmotion] = useState('')
  const [custom, setCustom] = useState<string[]>([])
  const [ownDraft, setOwnDraft] = useState('')
  const [answer, setAnswer] = useState<number | null>(null)
  const [zoomRun, setZoomRun] = useState(0)
  const [note, setNote] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const headingRef = useRef<HTMLHeadingElement>(null)
  const restRef = useRef<HTMLSpanElement>(null)
  const firstRender = useRef(true)

  // Each step moves keyboard and screen-reader focus to its heading.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const onRest = useCallback((opacity: number) => {
    if (restRef.current) restRef.current.style.opacity = String(opacity)
  }, [])

  const result = answer == null ? null : ANSWER_RESULTS[answer]
  const repeating = step === 6 && needsAnotherRound(result)
  const finished = step === 6 && result !== null && !repeating
  const emotionShown = emotion || ui.identify.chosenBlank
  const stormy = step === 4 || step === 5

  const railLabels = [ui.rail.identify, ui.rail.feel, ui.rail.instructions, shared.step4.label, shared.step5.label, ui.rail.openEyes, shared.step7Emotions.label]
  const railState = (n: number) => {
    const current = n === 7 ? repeating : step === n && !(n === 6 && repeating)
    const done = step > n || (n === 6 && repeating)
    return { current, done }
  }
  const goRail = (n: number) => {
    if (n === 7) {
      setStep(6)
      setAnswer(2)
    } else {
      setStep(n)
      if (n === 5) setZoomRun((z) => z + 1)
    }
  }
  const currentRail = railLabels.findIndex((_, i) => railState(i + 1).current)

  const pills = [...room.pills, ...custom]
  const addOwn = () => {
    const t = tidyEmotion(ownDraft)
    if (!t) return
    if (!pills.includes(t)) setCustom((c) => [...c, t])
    setEmotion(t)
    setOwnDraft('')
  }

  const resetSave = () => {
    setNote('')
    setSaveState('idle')
  }
  const restart = () => {
    setStep(1)
    setEmotion('')
    setAnswer(null)
    resetSave()
  }
  const goAgain = () => {
    setStep(2)
    setAnswer(null)
    resetSave()
  }
  const next = () => {
    if (step === 4) setZoomRun((z) => z + 1)
    setStep(step + 1)
  }

  const save = async () => {
    if (!result || !emotion) return
    setSaveState('saving')
    try {
      const res = await savePracticeEntry({ protocolSlug, emotion, result, note })
      setSaveState(res.ok ? 'saved' : 'error')
    } catch {
      setSaveState('error')
    }
  }

  const h1 = { ref: headingRef, tabIndex: -1 } as const
  const [q1, q2] = splitAtEmotion(room.step6.question)

  const underlined = (
    <span className="text-white" style={{ borderBottom: '3px solid var(--ny-tide)' }}>{emotionShown}</span>
  )

  const noteBox = (heading: string, label: string, placeholder: string) => (
    <div className="flex w-full max-w-[560px] flex-col gap-3 rounded-[18px] border p-6 text-left" style={{ background: 'var(--ny-night)', borderColor: 'var(--ny-night-2)' }}>
      <p className="m-0 font-semibold">{heading}</p>
      {saveState === 'saved' ? (
        <div className="flex flex-col gap-3">
          <p className="m-0 text-[15px]" style={{ color: 'var(--ny-line-strong)' }} role="status">{ui.result.saved}</p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/journal" className="inline-flex min-h-11 items-center rounded-full px-5 text-sm text-white no-underline" style={{ background: 'var(--ny-tide)' }}>{ui.result.openJournal}</Link>
            <button onClick={restart} className="min-h-11 cursor-pointer rounded-full border bg-transparent px-5 text-sm" style={{ borderColor: 'var(--ny-ink-2)', color: 'var(--ny-mist)' }}>{ui.buttons.another}</button>
          </div>
        </div>
      ) : (
        <>
          <label htmlFor="practice-note" className="text-[13px]" style={{ color: 'var(--ny-ink-4)' }}>{label}</label>
          <textarea
            id="practice-note"
            rows={3}
            value={note}
            maxLength={10000}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            className="rounded-[10px] border px-3.5 py-3 text-[15px]"
            style={{ background: '#000', color: 'var(--ny-mist)', borderColor: 'var(--ny-ink-2)', fontFamily: 'inherit' }}
          />
          {saveState === 'error' && <p role="alert" className="m-0 text-sm" style={{ color: '#ff9b94' }}>{ui.result.saveError}</p>}
          <div className="flex flex-wrap gap-2.5">
            <button onClick={save} disabled={saveState === 'saving'} className="min-h-11 cursor-pointer rounded-full border-0 px-5 text-sm text-white disabled:opacity-60" style={{ background: 'var(--ny-tide)' }}>
              {saveState === 'saving' ? ui.result.working : ui.buttons.save}
            </button>
            {finished && (
              <button onClick={restart} className="min-h-11 cursor-pointer rounded-full border bg-transparent px-5 text-sm" style={{ borderColor: 'var(--ny-ink-2)', color: 'var(--ny-mist)' }}>{ui.buttons.another}</button>
            )}
          </div>
        </>
      )}
    </div>
  )

  const code = room.step3.lines.map((l) => fillInstruction(l, emotion || 'emotion'))
  const codeLines = Array.from({ length: 24 }, (_, i) => code[i % code.length])

  return (
    <div className="ny-scope relative flex min-h-dvh flex-col overflow-hidden" style={{ background: '#000', color: 'var(--ny-mist)' }}>
      {stormy && <NeuronField mode="page" zoom={step === 5} zoomKey={zoomRun} onRest={onRest} />}

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <span className="text-sm" style={{ color: 'var(--ny-ink-4)' }}>{ui.room.title}</span>
        <Link href={exitHref} className="p-2 text-sm no-underline" style={{ color: 'var(--ny-ink-4)' }}>{ui.room.exit}</Link>
      </header>

      <nav aria-label={ui.rail.label} className="relative z-10 mx-auto w-full max-w-[980px] px-4 sm:px-8">
        <div className="grid grid-cols-7 gap-1.5">
          {railLabels.map((label, i) => {
            const n = i + 1
            const { current, done } = railState(n)
            return (
              <button
                key={label}
                onClick={() => goRail(n)}
                aria-current={current ? 'step' : undefined}
                aria-label={`${n}. ${label}`}
                className="flex min-h-11 cursor-pointer flex-col gap-1.5 border-0 bg-transparent pb-2.5 pt-1.5 text-left"
              >
                <span className="block h-[3px] rounded-[3px]" style={{ background: current ? '#fff' : done ? 'var(--ny-tide)' : 'var(--ny-night-2)' }} />
                <span className="hidden text-xs sm:block" style={{ color: current ? '#fff' : done ? 'var(--ny-line-strong)' : 'var(--ny-ink-4)', fontWeight: current ? 600 : 400 }}>{label}</span>
              </button>
            )
          })}
        </div>
        {currentRail >= 0 && (
          <p className="m-0 pt-1 text-center text-xs sm:hidden" style={{ color: 'var(--ny-line-strong)' }} aria-hidden="true">
            {currentRail + 1} / 7 · {railLabels[currentRail]}
          </p>
        )}
      </nav>

      <main className={`relative z-10 flex flex-1 justify-center px-4 py-10 sm:px-8 sm:py-12 ${step === 5 ? 'items-start' : 'items-center'}`}>
        <div className="flex w-full max-w-[760px] flex-col items-center gap-7 text-center">
          {step === 0 && (
            <div className="flex flex-col items-center gap-6">
              <h1 {...h1} className="m-0 text-[36px] leading-[1.1] outline-none sm:text-[44px]" style={{ letterSpacing: '-0.035em', color: '#fff' }}>{ui.prep.heading}</h1>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-left text-[17px]" style={{ color: 'var(--ny-line-strong)' }}>
                {ui.prep.checklist.map((item) => <li key={item}>○ &nbsp;{item}</li>)}
              </ul>
              <p className="m-0 max-w-[460px] text-sm" style={{ color: 'var(--ny-ink-4)' }}>{ui.prep.note}</p>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center gap-6">
              <span className="text-[13px] font-semibold tracking-[0.06em]" style={{ color: 'var(--ny-ink-4)' }}>{ui.kickers.step1}</span>
              <h1 {...h1} className="m-0 text-[30px] font-medium leading-[1.2] outline-none sm:text-[40px]" style={{ letterSpacing: '-0.03em', color: 'var(--ny-mist)' }}>
                {room.opening} {underlined}.
              </h1>
              <div className="flex max-w-[700px] flex-wrap justify-center gap-2" role="group" aria-label={room.opening}>
                {pills.map((p) => (
                  <button
                    key={p}
                    onClick={() => setEmotion(p)}
                    aria-pressed={emotion === p}
                    className={pillBase}
                    style={{
                      background: emotion === p ? 'var(--ny-tide)' : 'var(--ny-night)',
                      color: emotion === p ? '#fff' : 'var(--ny-mist)',
                      border: `1px ${custom.includes(p) && emotion !== p ? 'dashed' : 'solid'} ${emotion === p ? 'var(--ny-tide)' : custom.includes(p) ? 'var(--ny-ink-4)' : 'var(--ny-night-2)'}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label htmlFor="own-emotion" className="text-sm" style={{ color: 'var(--ny-ink-4)' }}>{ui.identify.ownLabel}</label>
                <input
                  id="own-emotion"
                  value={ownDraft}
                  maxLength={40}
                  onChange={(e) => setOwnDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOwn() } }}
                  placeholder={room.placeholder}
                  className="min-h-10 w-[200px] rounded-full border px-4 py-2 text-[15px]"
                  style={{ background: 'var(--ny-night)', color: 'var(--ny-mist)', borderColor: 'var(--ny-ink-2)', fontFamily: 'inherit' }}
                />
                <button onClick={addOwn} className="min-h-10 cursor-pointer rounded-full border-0 px-[18px] text-sm text-white" style={{ background: 'var(--ny-ink-2)' }}>{ui.identify.add}</button>
              </div>
              <p className="m-0 max-w-[480px] text-sm" style={{ color: 'var(--ny-ink-4)' }}>{ui.identify.hint}</p>
            </div>
          )}

          {step >= 2 && step <= 5 && (
            <div className="flex w-full flex-col items-center gap-7">
              {step === 5 && <div aria-hidden="true" style={{ height: 'max(60px, calc(30dvh - 70px))', width: '100%' }} />}
              <span className="text-[13px] font-semibold tracking-[0.06em]" style={{ color: 'var(--ny-ink-4)' }}>{ui.kickers[`step${step}` as 'step2']}</span>

              {step === 3 && (
                <div
                  aria-hidden="true"
                  className="h-[200px] w-full max-w-[560px] overflow-hidden bg-black text-center font-mono text-[13px] sm:h-[220px]"
                  style={{
                    color: 'var(--ny-line-strong)',
                    WebkitMaskImage: 'linear-gradient(transparent 0%, rgba(0,0,0,.3) 22%, #000 50%, rgba(0,0,0,.3) 78%, transparent 100%)',
                    maskImage: 'linear-gradient(transparent 0%, rgba(0,0,0,.3) 22%, #000 50%, rgba(0,0,0,.3) 78%, transparent 100%)',
                  }}
                >
                  <div className="pr-scroll flex flex-col items-center gap-1.5 px-5 py-4">
                    {[...codeLines, ...codeLines].map((l, i) => <span key={i}>{l}</span>)}
                  </div>
                </div>
              )}

              <h1 {...h1} className="m-0 max-w-[680px] text-[24px] font-medium leading-[1.3] outline-none sm:text-[30px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-mist)', textShadow: '0 0 18px #000' }}>
                {step === 2 ? room.step2.main : step === 3 ? room.step3.main : step === 4 ? shared.step4.main : shared.step5.main}
              </h1>
              <p className="m-0 max-w-[600px] text-[17px]" style={{ color: 'var(--ny-line-strong)', textShadow: '0 0 14px #000' }}>
                {step === 2 ? room.step2.support : step === 3 ? room.step3.support : step === 4 ? shared.step4.support : shared.step5.support}
              </p>

              {step === 5 && (
                <div className="flex flex-col items-center gap-2.5">
                  <span ref={restRef} className="text-sm" style={{ color: 'var(--ny-line-strong)', opacity: 0 }}>{shared.afterZoom}</span>
                  <button onClick={() => setZoomRun((z) => z + 1)} className="cursor-pointer border-0 bg-transparent p-2.5 text-[13px] underline" style={{ color: 'var(--ny-ink-4)', fontFamily: 'inherit' }}>{ui.buttons.replay}</button>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="flex w-full flex-col items-center gap-6">
              <span className="text-[13px] font-semibold tracking-[0.06em]" style={{ color: 'var(--ny-ink-4)' }}>{ui.kickers.step6}</span>
              <h1 {...h1} className="m-0 text-[28px] leading-[1.15] outline-none sm:text-[38px]" style={{ letterSpacing: '-0.03em', color: 'var(--ny-mist)' }}>
                {q1}{underlined}{q2}
              </h1>
              <div className="grid w-full max-w-[680px] gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }} role="group" aria-label={room.step6.question.replace('[emotion]', emotionShown)}>
                {room.step6.answers.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => { setAnswer(i); resetSave() }}
                    aria-pressed={answer === i}
                    className="min-h-14 cursor-pointer rounded-[18px] px-3 py-4 text-base"
                    style={{
                      background: answer === i ? 'var(--ny-mist)' : 'var(--ny-night)',
                      color: answer === i ? '#000' : 'var(--ny-mist)',
                      border: `1px solid ${answer === i ? 'var(--ny-mist)' : 'var(--ny-night-2)'}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {repeating && (
                <>
                  <div className="flex max-w-[560px] flex-col gap-3 rounded-[18px] border p-6 text-left" style={{ background: 'var(--ny-night)', borderColor: 'var(--ny-night-2)' }}>
                    <p className="m-0 font-semibold">{ui.result.stepPrefix}{shared.step7Emotions.main}</p>
                    <p className="m-0 text-[15px]" style={{ color: 'var(--ny-line-strong)' }}>{shared.step7Emotions.support}</p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button onClick={goAgain} className="min-h-11 cursor-pointer rounded-full border-0 bg-white px-5 text-sm text-black">{ui.buttons.repeat}</button>
                    </div>
                  </div>
                  {noteBox(ui.result.stopHeading, ui.result.stopNote, ui.result.notePlaceholder)}
                </>
              )}
              {finished && noteBox(ui.result.noteHeading, ui.result.noteLabel, ui.result.notePlaceholder)}
            </div>
          )}
        </div>
      </main>

      <div className="relative z-10 flex flex-wrap justify-center gap-3 px-4 pb-10 pt-6 sm:px-8">
        {step > 0 && step < 6 && (
          <button onClick={() => setStep(step - 1)} className="min-h-12 cursor-pointer rounded-full border bg-black px-6 text-[15px]" style={{ borderColor: 'var(--ny-ink-2)', color: 'var(--ny-line-strong)' }}>{ui.buttons.back}</button>
        )}
        {step < 6 && !(step === 1 && !emotion) && (
          <button onClick={next} className="min-h-12 cursor-pointer rounded-full border-0 bg-white px-8 text-[15px] font-medium text-black">
            {step === 0 ? ui.buttons.begin : step === 5 ? ui.buttons.ready : ui.buttons.continue}
          </button>
        )}
      </div>
    </div>
  )
}
