// ── Fingerstyle Engine ────────────────────────────────────────────────────────
//
// Fingerstyle is NOT just "play chord and arpeggiate."
//
// It is:
//   P (Thumb)  → Bass note
//     ↓
//   I (Index)  → String 3
//     ↓
//   M (Middle) → String 2
//     ↓
//   A (Ring)   → String 1
//     ↓
//   P (Thumb)  → Bass note again
//
// With:
//   - Variable timing per finger
//   - Bass accents (thumb is louder)
//   - Melody emphasis (top string rings)
//   - Each finger has its own attack character

import type { GuitarVoicing } from '../../core/types'

/** Finger identifiers in classical guitar notation. */
export type Finger = 'P' | 'I' | 'M' | 'A'

/** A single finger event in a fingerstyle pattern. */
export interface FingerEvent {
  finger: Finger
  /** String index to pluck (0-5). If null, uses default assignment. */
  stringIndex?: number
  /** Relative velocity (0-1). Thumb is usually louder. */
  velocity: number
  /** Timing offset from pattern start in ms. */
  timingMs: number
  /** Whether this note should ring (true) or be damped after plucking (false). */
  letRing: boolean
}

/** A complete fingerstyle pattern (repeating). */
export interface FingerstylePattern {
  name: string
  events: FingerEvent[]
  /** Duration of one full pattern cycle in beats. */
  cycleDuration: number
}

/** Default finger → string assignment for a 6-string guitar. */
const FINGER_DEFAULT_STRINGS: Record<Finger, number> = {
  P: 5, // Thumb → bass (string 5 or 6)
  I: 3, // Index → string 3
  M: 2, // Middle → string 2
  A: 1, // Ring → string 1 (high e)
}

// ── Preset Patterns ───────────────────────────────────────────────────────────

export const FINGERSTYLE_PATTERNS: Record<string, FingerstylePattern> = {
  /** Travis picking — alternating bass with melody. */
  travis: {
    name: 'Travis Picking',
    cycleDuration: 2,
    events: [
      { finger: 'P', velocity: 0.85, timingMs: 0, letRing: true },
      { finger: 'I', velocity: 0.60, timingMs: 125, letRing: true },
      { finger: 'M', velocity: 0.55, timingMs: 250, letRing: true },
      { finger: 'I', velocity: 0.60, timingMs: 375, letRing: true },
      { finger: 'P', velocity: 0.80, timingMs: 500, letRing: true },
      { finger: 'A', velocity: 0.55, timingMs: 625, letRing: true },
      { finger: 'M', velocity: 0.55, timingMs: 750, letRing: true },
      { finger: 'I', velocity: 0.60, timingMs: 875, letRing: true },
    ],
  },

  /** Simple arpeggio — P-I-M-A in sequence. */
  arpeggio: {
    name: 'Simple Arpeggio',
    cycleDuration: 2,
    events: [
      { finger: 'P', velocity: 0.80, timingMs: 0, letRing: true },
      { finger: 'I', velocity: 0.65, timingMs: 200, letRing: true },
      { finger: 'M', velocity: 0.60, timingMs: 400, letRing: true },
      { finger: 'A', velocity: 0.70, timingMs: 600, letRing: true },
      { finger: 'A', velocity: 0.50, timingMs: 800, letRing: false },
      { finger: 'M', velocity: 0.50, timingMs: 900, letRing: false },
      { finger: 'I', velocity: 0.50, timingMs: 1000, letRing: false },
    ],
  },

  /** Waltz pattern — Oom-pah-pah. */
  waltz: {
    name: 'Waltz (3/4)',
    cycleDuration: 3,
    events: [
      { finger: 'P', velocity: 0.85, timingMs: 0, letRing: true },
      { finger: 'I', velocity: 0.55, timingMs: 266, letRing: true },
      { finger: 'M', velocity: 0.55, timingMs: 400, letRing: true },
      { finger: 'A', velocity: 0.55, timingMs: 533, letRing: true },
      { finger: 'P', velocity: 0.80, timingMs: 666, letRing: true },
      { finger: 'I', velocity: 0.50, timingMs: 933, letRing: true },
      { finger: 'M', velocity: 0.50, timingMs: 1066, letRing: true },
      { finger: 'A', velocity: 0.50, timingMs: 1200, letRing: true },
    ],
  },

  /** Bollywood-style fingerpicking with bass emphasis. */
  bollywood: {
    name: 'Bollywood Pick',
    cycleDuration: 2,
    events: [
      { finger: 'P', velocity: 0.90, timingMs: 0, letRing: true },
      { finger: 'I', velocity: 0.55, timingMs: 150, letRing: true },
      { finger: 'P', velocity: 0.75, timingMs: 300, letRing: true },
      { finger: 'M', velocity: 0.60, timingMs: 450, letRing: true },
      { finger: 'A', velocity: 0.65, timingMs: 600, letRing: true },
      { finger: 'M', velocity: 0.50, timingMs: 750, letRing: true },
      { finger: 'I', velocity: 0.55, timingMs: 900, letRing: true },
    ],
  },

  /** Worship-style — slow, ambient arpeggios with lots of ring. */
  worship: {
    name: 'Worship Ambient',
    cycleDuration: 4,
    events: [
      { finger: 'P', velocity: 0.70, timingMs: 0, letRing: true },
      { finger: 'I', velocity: 0.50, timingMs: 400, letRing: true },
      { finger: 'M', velocity: 0.55, timingMs: 800, letRing: true },
      { finger: 'A', velocity: 0.65, timingMs: 1200, letRing: true },
    ],
  },

  /** Campfire — simple boom-chick. */
  campfire: {
    name: 'Campfire Boom-Chick',
    cycleDuration: 2,
    events: [
      { finger: 'P', velocity: 0.85, timingMs: 0, letRing: true },
      { finger: 'I', velocity: 0.50, timingMs: 200, letRing: false },
      { finger: 'M', velocity: 0.50, timingMs: 350, letRing: false },
      { finger: 'A', velocity: 0.50, timingMs: 500, letRing: false },
      { finger: 'P', velocity: 0.80, timingMs: 750, letRing: true },
      { finger: 'I', velocity: 0.50, timingMs: 950, letRing: false },
      { finger: 'M', velocity: 0.50, timingMs: 1100, letRing: false },
      { finger: 'A', velocity: 0.50, timingMs: 1250, letRing: false },
    ],
  },
}

// ── Fingerstyle Engine ────────────────────────────────────────────────────────

export interface PluckedNote {
  note: string
  stringIndex: number
  velocity: number
  delaySec: number
  letRing: boolean
}

export class FingerstyleEngine {
  private currentPattern: FingerstylePattern
  private eventIndex = 0
  private cycleStartTime = 0

  constructor(pattern: FingerstylePattern | string = 'travis') {
    if (typeof pattern === 'string') {
      this.currentPattern = FINGERSTYLE_PATTERNS[pattern] ?? FINGERSTYLE_PATTERNS.travis
    } else {
      this.currentPattern = pattern
    }
  }

  /** Switch pattern at runtime. */
  setPattern(pattern: FingerstylePattern | string) {
    if (typeof pattern === 'string') {
      this.currentPattern = FINGERSTYLE_PATTERNS[pattern] ?? FINGERSTYLE_PATTERNS.travis
    } else {
      this.currentPattern = pattern
    }
    this.eventIndex = 0
  }

  /** Get current pattern. */
  getPattern(): FingerstylePattern {
    return this.currentPattern
  }

  /**
   * Get the next batch of notes to pluck for the current beat interval.
   *
   * @param voicing - Current chord voicing (6 strings)
   * @param bpm - Current tempo
   * @param elapsedInCycle - How far we are into the current pattern cycle (ms)
   * @returns Array of notes to pluck, sorted by delay
   */
  getNextNotes(
    voicing: GuitarVoicing,
    bpm: number,
    elapsedInCycle: number,
  ): PluckedNote[] {
    const pattern = this.currentPattern
    const cycleDurationMs = (pattern.cycleDuration * 60000) / bpm
    const normalizedTime = elapsedInCycle % cycleDurationMs

    const notes: PluckedNote[] = []

    for (const event of pattern.events) {
      // Only trigger events within the current time window (±beat interval)
      const beatMs = 60000 / bpm
      if (event.timingMs >= normalizedTime - beatMs && event.timingMs < normalizedTime + beatMs * 0.5) {
        const stringIdx = event.stringIndex ?? this.getFingerString(event.finger, voicing)
        const note = voicing[stringIdx]
        if (!note) continue

        // Convert timing to delay from now
        const delayMs = event.timingMs - normalizedTime
        const delaySec = Math.max(0, delayMs / 1000)

        notes.push({
          note,
          stringIndex: stringIdx,
          velocity: event.velocity,
          delaySec,
          letRing: event.letRing,
        })
      }
    }

    return notes.sort((a, b) => a.delaySec - b.delaySec)
  }

  /**
   * Determine which string a finger should pluck given the current voicing.
   */
  private getFingerString(finger: Finger, voicing: GuitarVoicing): number {
    if (finger === 'P') {
      // Thumb → lowest sounding string
      for (let i = 0; i <= 3; i++) {
        if (voicing[i] !== null) return i
      }
      return 5
    }
    // I, M, A → default assignments
    return FINGER_DEFAULT_STRINGS[finger]
  }

  /** Reset to beginning of pattern. */
  reset() {
    this.eventIndex = 0
    this.cycleStartTime = 0
  }
}
