// ── Humanizer Engine ──────────────────────────────────────────────────────────
//
// The Humanizer sits ABOVE the sample engine.
// The sample engine only plays audio. The Humanizer makes musical decisions.
//
// Every strum passes through the humanizer before reaching the audio output:
//
//   Random Sample Selection
//     ↓
//   ± Timing Jitter (±4 ms)
//     ↓
//   ± Velocity Variation (±2 dB)
//     ↓
//   ± Pitch Drift (±3 cents)
//     ↓
//   String Emphasis (per-string velocity)
//     ↓
//   Output
//
// The same chord never sounds exactly the same twice.

export interface HumanizerParams {
  /** Timing randomness in milliseconds (±). Default: 3.5 */
  timingJitterMs: number
  /** Velocity randomness as a multiplier range (±). Default: 0.08 (±8%) */
  velocityVariation: number
  /** Pitch drift in cents (±). Default: 2.5 */
  pitchDriftCents: number
  /** Per-string velocity emphasis [low E → high e]. Default: natural guitar balance */
  stringEmphasis: number[]
  /** Strum spread randomness — extra ms of variation between strings. Default: 1.2 */
  strumSpreadJitterMs: number
  /** Probability of a "dead note" (muted string hit) on chord change. Default: 0.06 */
  deadNoteProbability: number
  /** Amount of fret squeak noise on position changes. 0 = none, 1 = full. Default: 0.3 */
  fretSqueakAmount: number
}

/** A single note event after humanization has been applied. */
export interface HumanizedNote {
  /** The note to play (e.g., 'G3') */
  note: string
  /** String index 0-5 */
  stringIndex: number
  /** Volume after humanization (0-1) */
  volume: number
  /** Delay from strum start in seconds */
  delaySec: number
  /** Playback rate multiplier (1.0 = normal, includes pitch drift) */
  playbackRate: number
  /** Whether this is a "dead note" (muted fret noise) */
  isDeadNote: boolean
}

/** A complete humanized strum (multiple notes with timing offsets). */
export interface HumanizedStrum {
  notes: HumanizedNote[]
  /** Total duration of the strum spread in seconds */
  spreadDuration: number
  /** Whether fret squeak should play before this strum */
  includeFretSqueak: boolean
}

// ── Default Params by Style ───────────────────────────────────────────────────

export const HUMANIZER_PRESETS: Record<string, HumanizerParams> = {
  tight: {
    timingJitterMs: 1.5,
    velocityVariation: 0.04,
    pitchDriftCents: 1.0,
    stringEmphasis: [0.90, 0.95, 1.00, 1.05, 1.05, 1.00],
    strumSpreadJitterMs: 0.5,
    deadNoteProbability: 0.02,
    fretSqueakAmount: 0.1,
  },
  natural: {
    timingJitterMs: 3.5,
    velocityVariation: 0.08,
    pitchDriftCents: 2.5,
    stringEmphasis: [0.88, 0.94, 1.00, 1.06, 1.04, 0.98],
    strumSpreadJitterMs: 1.2,
    deadNoteProbability: 0.06,
    fretSqueakAmount: 0.3,
  },
  loose: {
    timingJitterMs: 5.5,
    velocityVariation: 0.14,
    pitchDriftCents: 4.0,
    stringEmphasis: [0.85, 0.92, 1.00, 1.08, 1.06, 0.95],
    strumSpreadJitterMs: 2.0,
    deadNoteProbability: 0.10,
    fretSqueakAmount: 0.5,
  },
  campfire: {
    timingJitterMs: 4.0,
    velocityVariation: 0.10,
    pitchDriftCents: 3.0,
    stringEmphasis: [0.92, 0.96, 1.00, 1.04, 1.02, 0.97],
    strumSpreadJitterMs: 1.5,
    deadNoteProbability: 0.08,
    fretSqueakAmount: 0.4,
  },
  studio: {
    timingJitterMs: 2.0,
    velocityVariation: 0.05,
    pitchDriftCents: 1.5,
    stringEmphasis: [0.90, 0.95, 1.00, 1.05, 1.05, 1.00],
    strumSpreadJitterMs: 0.8,
    deadNoteProbability: 0.03,
    fretSqueakAmount: 0.15,
  },
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// ── Humanizer ─────────────────────────────────────────────────────────────────

export class Humanizer {
  private params: HumanizerParams

  constructor(preset: keyof typeof HUMANIZER_PRESETS | HumanizerParams = 'natural') {
    this.params = typeof preset === 'string'
      ? { ...HUMANIZER_PRESETS[preset] }
      : { ...preset }
  }

  /** Update humanizer parameters at runtime. */
  setParams(params: Partial<HumanizerParams>) {
    Object.assign(this.params, params)
  }

  /** Switch to a named preset. */
  setPreset(preset: keyof typeof HUMANIZER_PRESETS) {
    this.params = { ...HUMANIZER_PRESETS[preset] }
  }

  /** Get current params. */
  getParams(): HumanizerParams {
    return { ...this.params }
  }

  /**
   * Humanize a strum pattern.
   *
   * @param voicing - Array of 6 notes (null = muted string)
   * @param direction - 'down' | 'up'
   * @param baseVolume - Base velocity (0-1)
   * @param isChordChange - Whether the chord just changed (triggers fret squeak)
   * @returns HumanizedStrum with per-note timing, velocity, and pitch variation
   */
  humanizeStrum(
    voicing: (string | null)[],
    direction: 'down' | 'up',
    baseVolume: number,
    isChordChange = false,
  ): HumanizedStrum {
    const p = this.params
    const notes: HumanizedNote[] = []

    // Determine string order based on strum direction
    const stringOrder = direction === 'down'
      ? [0, 1, 2, 3, 4, 5]
      : [5, 4, 3, 2, 1, 0]

    // Base strum spread: ~10ms between strings for down, ~8ms for up
    const baseSpreadMs = direction === 'down' ? 10 : 8
    let activeStringCount = 0

    // First pass: compute timing for each active string
    stringOrder.forEach((stringIndex, orderPosition) => {
      const note = voicing[stringIndex]
      if (!note) return

      // Timing: base spread + jitter
      const baseDelay = orderPosition * baseSpreadMs
      const jitter = randBetween(-p.strumSpreadJitterMs, p.strumSpreadJitterMs)
      const timingMs = Math.max(0, baseDelay + jitter)

      // Global timing jitter (the whole strum wobbles a little)
      const globalJitter = randBetween(-p.timingJitterMs, p.timingJitterMs)
      const totalDelayMs = Math.max(0, timingMs + globalJitter)

      // Velocity: base × string emphasis × random variation
      const emphasis = p.stringEmphasis[stringIndex] ?? 1.0
      const velVariation = randBetween(-p.velocityVariation, p.velocityVariation)
      const volume = clamp(baseVolume * emphasis * (1 + velVariation), 0.01, 0.95)

      // Pitch drift in cents → playback rate multiplier
      const cents = randBetween(-p.pitchDriftCents, p.pitchDriftCents)
      const playbackRate = Math.pow(2, cents / 1200)

      // Dead note: on chord changes, there's a small chance of fret noise
      const isDeadNote = isChordChange && Math.random() < p.deadNoteProbability

      notes.push({
        note,
        stringIndex,
        volume: isDeadNote ? volume * 0.3 : volume,
        delaySec: totalDelayMs / 1000,
        playbackRate,
        isDeadNote,
      })

      activeStringCount++
    })

    // Sort by delay for consistent scheduling
    notes.sort((a, b) => a.delaySec - b.delaySec)

    const spreadDuration = notes.length > 0
      ? notes[notes.length - 1].delaySec
      : 0

    // Fret squeak on chord changes
    const includeFretSqueak = isChordChange && Math.random() < p.fretSqueakAmount

    return { notes, spreadDuration, includeFretSqueak }
  }

  /**
   * Humanize a single plucked note (for fingerstyle).
   */
  humanizePluck(
    note: string,
    stringIndex: number,
    baseVolume: number,
  ): HumanizedNote {
    const p = this.params
    const emphasis = p.stringEmphasis[stringIndex] ?? 1.0
    const velVariation = randBetween(-p.velocityVariation, p.velocityVariation)
    const cents = randBetween(-p.pitchDriftCents, p.pitchDriftCents)
    const jitter = randBetween(-p.timingJitterMs, p.timingJitterMs)

    return {
      note,
      stringIndex,
      volume: clamp(baseVolume * emphasis * (1 + velVariation), 0.01, 0.95),
      delaySec: Math.max(0, jitter / 1000),
      playbackRate: Math.pow(2, cents / 1200),
      isDeadNote: false,
    }
  }
}
