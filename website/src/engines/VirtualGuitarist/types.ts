// ── Virtual Guitarist — Types ─────────────────────────────────────────────────
//
// The Virtual Guitarist makes musical decisions.
// It knows styles, dynamics, voicings, and transitions.
// It does NOT produce audio — it produces performance instructions.

import type { GuitarVoicing, PlayStyle } from '../../core/types'

/** How the guitarist approaches the current stroke. */
export type StrokeCharacter = 'normal' | 'accented' | 'ghost' | 'muted' | 'palm-mute' | 'let-ring'

/** A performance decision for one beat. */
export interface StrokeDecision {
  /** Which stroke to play */
  stroke: 'down' | 'up' | 'mute' | 'rest'
  /** Character/intensity of the stroke */
  character: StrokeCharacter
  /** Volume multiplier (0-1) relative to base */
  velocity: number
  /** Which voicing to use (may differ from default for variety) */
  voicing: GuitarVoicing
  /** Whether shared strings should ring through from previous chord */
  allowSharedStrings: boolean
  /** Whether to include a dead-note fret noise before the strum */
  includeFretNoise: boolean
}

/** A plan for transitioning between two chords. */
export interface TransitionPlan {
  /** Strings that should continue ringing (same pitch in both chords) */
  sharedStrings: number[]
  /** Strings that need to be re-fretted (different pitch) */
  newStrings: number[]
  /** Strings that were ringing but should stop */
  dampedStrings: number[]
  /** Whether a bass note lead-in is appropriate */
  useBassLeadIn: boolean
  /** Transition style */
  style: 'clean' | 'slurred' | 'muted' | 'bass-lead'
}

/** Style definition for the virtual guitarist personality. */
export interface GuitaristPersonality {
  id: string
  name: string
  description: string

  /** Base strum intensity (0-1). Higher = more aggressive. */
  strumIntensity: number
  /** Timing feel — how tight or loose the strumming is. */
  timingFeel: 'tight' | 'natural' | 'laid-back' | 'swing'
  /** Dynamic range — how much volume varies between sections. */
  dynamicsRange: number
  /** How often to add ghost strokes between main beats. */
  ghostStrokeFrequency: number
  /** How often to use palm muting. */
  palmMuteFrequency: number
  /** Voicing preference — warm = low positions, bright = higher positions. */
  voicingPreference: 'warm' | 'bright' | 'varied'
  /** Accent pattern strength — 0 = flat, 1 = strong beat-1 accent. */
  accentStrength: number
  /** How much to let strings ring between changes. */
  letRingFactor: number
  /** Whether to add bass note emphasis on beat 1. */
  bassEmphasis: number
  /** Swing ratio (0.5 = straight, 0.67 = triplet swing). */
  swingRatio: number
}

/** Section context for performance decisions. */
export interface SectionContext {
  name: string
  intensity: number // 0-1, how intense this section should be
  repetition: number // how many times this section has repeated (0 = first time)
}
