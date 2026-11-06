// The neuron field and the zoom out (Step 5). Every timing is a named constant here so it is easy to tune.
// Times are in seconds from the moment the zoom starts. Pure functions, no drawing: components/protocols/practice/NeuronField.tsx draws.

/** The whole of Step 5: zoom, last flicker, dark, then "Rest here…" fades in. */
export const TOTAL_S = 24
/** The field reaches one tiny point at this time (the plan's "about 19 seconds"). */
export const ZOOM_END_S = 18.7
/** The field itself is gone (all dark except the last point) by this time. */
export const FIELD_GONE_S = 19.7
/** Scale at each sixth of the zoom: it halves, then slows, ending at a single point. */
export const ZOOM_SCALES = [1, 0.5, 0.25, 0.12, 0.06, 0.03, 0.012]
/** The last point: [time, brightness]. It appears, flickers, then goes dark. */
export const LAST_POINT_KNOTS: [number, number][] = [
  [0, 0], [18.48, 0], [19.2, 1], [19.92, 0.25], [20.64, 1], [21.36, 0.45], [22.08, 1], [23.28, 0], [TOTAL_S, 0],
]
/** "Rest here…" fades in over the last stretch. */
export const REST_FADE_START_S = 23.28

// The field: about one dot per this many square pixels, between the limits; links join near neighbours.
export const DOT_AREA_PX = 20000
export const DOT_MIN = 44
export const DOT_MAX = 90
export const LINK_NEIGHBOURS = 3
/** Longest link as a fraction of the larger screen side (never less than LINK_MIN_PX). */
export const LINK_MAX_FRACTION = 0.175
export const LINK_MIN_PX = 160
/** Dots flicker with a period in this range; links pulse with a period in this range. */
export const DOT_PERIOD_S: [number, number] = [0.9, 2.3]
export const LINK_PERIOD_S: [number, number] = [2.5, 6.5]
/** Where the zoom is centred, as fractions of the field: across, and down (whole page keeps it above the text). */
export const ORIGIN_PAGE = { x: 0.5, y: 0.3 }
export const ORIGIN_BOX = { x: 0.5, y: 0.5 }

function along(knots: [number, number][], t: number): number {
  if (t <= knots[0][0]) return knots[0][1]
  for (let i = 1; i < knots.length; i++) {
    const [t1, v1] = knots[i]
    if (t <= t1) {
      const [t0, v0] = knots[i - 1]
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0)
    }
  }
  return knots[knots.length - 1][1]
}

export type ZoomFrame = {
  /** Scale of the whole field about its origin. */
  scale: number
  /** Opacity of the field (it fades out just after the zoom ends). */
  field: number
  /** Brightness of the last point. */
  last: number
  /** Opacity of "Rest here…". */
  rest: number
  done: boolean
}

/** The state of Step 5 at time t. With reduced motion there is no movement: the field simply fades. */
export function zoomFrame(t: number, reducedMotion = false): ZoomFrame {
  const rest = Math.min(1, Math.max(0, (t - REST_FADE_START_S) / (TOTAL_S - REST_FADE_START_S)))
  if (reducedMotion) {
    return { scale: 1, field: Math.max(0, 1 - t / ZOOM_END_S), last: 0, rest, done: t >= TOTAL_S }
  }
  const sixth = ZOOM_END_S / (ZOOM_SCALES.length - 1)
  const scale = along(ZOOM_SCALES.map((s, i): [number, number] => [i * sixth, s]), t)
  const field = along([[0, 1], [ZOOM_END_S, 1], [FIELD_GONE_S, 0]], t)
  return { scale, field, last: along(LAST_POINT_KNOTS, t), rest, done: t >= TOTAL_S }
}

/** A dot's brightness over its flicker cycle (phase 0 to 1): dim, bright, dimmer, bright-ish, dim. */
export function flicker(phase: number): number {
  return along([[0, 0.25], [0.45, 1], [0.55, 0.35], [0.7, 0.85], [1, 0.25]], phase)
}

/** A link's brightness over its pulse cycle (phase 0 to 1): a short bright pulse, then nothing. */
export function pulse(phase: number): number {
  return along([[0, 0], [0.03, 0.9], [0.09, 0], [1, 0]], phase)
}

export type FieldPoint = { x: number; y: number; r: number; period: number; delay: number }
export type FieldLink = { a: number; b: number; period: number; delay: number }

/** A repeatable field for a screen size: the same size always gives the same field. */
export function buildField(width: number, height: number): { points: FieldPoint[]; links: FieldLink[] } {
  let seed = 7
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const count = Math.round(Math.min(DOT_MAX, Math.max(DOT_MIN, (width * height) / DOT_AREA_PX)))
  const points: FieldPoint[] = []
  for (let i = 0; i < count; i++) {
    points.push({
      x: 0.04 * width + rnd() * 0.92 * width,
      y: 0.05 * height + rnd() * 0.9 * height,
      r: 1 + Math.floor(rnd() * 3) * 0.5 + 0.5,
      period: DOT_PERIOD_S[0] + rnd() * (DOT_PERIOD_S[1] - DOT_PERIOD_S[0]),
      delay: rnd() * 1.4,
    })
  }
  const maxLink = Math.max(LINK_MIN_PX, LINK_MAX_FRACTION * Math.max(width, height))
  const seen = new Set<string>()
  const links: FieldLink[] = []
  points.forEach((p, i) => {
    points
      .map((q, j) => ({ j, d: Math.hypot(q.x - p.x, q.y - p.y) }))
      .filter((o) => o.j !== i)
      .sort((m, n) => m.d - n.d)
      .slice(0, LINK_NEIGHBOURS)
      .forEach((o) => {
        const key = `${Math.min(i, o.j)}-${Math.max(i, o.j)}`
        if (seen.has(key) || o.d > maxLink) return
        seen.add(key)
        links.push({ a: i, b: o.j, period: LINK_PERIOD_S[0] + rnd() * (LINK_PERIOD_S[1] - LINK_PERIOD_S[0]), delay: rnd() * 5 })
      })
  })
  return { points, links }
}
