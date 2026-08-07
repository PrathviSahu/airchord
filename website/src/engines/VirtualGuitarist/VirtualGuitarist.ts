// ── Virtual Guitarist Engine ──────────────────────────────────────────────────
//
// The Virtual Guitarist makes musical decisions. It sits between the
// Performance Engine (which provides timing) and the Humanizer (which
// adds micro-timing variation).
//
//   Performance Engine (beat, section, chord)
//     ↓
//   Virtual Guitarist (decides HOW to play)
//     ↓
//   Humanizer (adds micro-timing, velocity, pitch variation)
//     ↓
//   Sample Engine (plays the actual audio)
//
// The Guitarist decides:
//   - Which voicing to use (from multiple variants)
//   - Whether to accent or ghost this beat
//   - Whether to palm-mute or let ring
//   - How to transition between chords
//   - Whether to add fret noise on position changes

import type { GuitarVoicing } from '../../core/types'
import { VoicingResolver, CHORD_VOICINGS } from '../GuitaristEngine/VoicingResolver'
import type {
  StrokeDecision,
  TransitionPlan,
  GuitaristPersonality,
  SectionContext,
  StrokeCharacter,
} from './types'
import { PERSONALITIES, personalityFromCollections } from './personalities'

// ── Section Intensity Map ─────────────────────────────────────────────────────
// How intense each section type should be (0-1)
const SECTION_INTENSITY: Record<string, number> = {
  Intro: 0.55,
  Verse: 0.70,
  Chorus: 1.00,
  Bridge: 0.60,
  Outro: 0.50,
}

// ── Virtual Guitarist ─────────────────────────────────────────────────────────

export class VirtualGuitarist {
  private personality: GuitaristPersonality
  private voicingResolver: VoicingResolver
  private lastChord: string | null = null
  private lastVoicing: GuitarVoicing | null = null
  private beatCounter = 0
  private sectionContext: SectionContext = { name: 'Verse', intensity: 0.7, repetition: 0 }
  private previousSectionName = ''
  private sectionRepeatCount = 0

  constructor(personality: GuitaristPersonality | string = 'pop') {
    if (typeof personality === 'string') {
      this.personality = PERSONALITIES[personality] ?? PERSONALITIES['pop']
    } else {
      this.personality = personality
    }
    this.voicingResolver = new VoicingResolver(
      this.personality.voicingPreference === 'warm' ? 'campfire'
        : this.personality.voicingPreference === 'bright' ? 'pop'
        : 'pop'
    )
  }

  /** Create from song collection tags. */
  static fromCollections(collections: string[]): VirtualGuitarist {
    return new VirtualGuitarist(personalityFromCollections(collections))
  }

  /** Change personality at runtime. */
  setPersonality(personality: GuitaristPersonality | string) {
    if (typeof personality === 'string') {
      this.personality = PERSONALITIES[personality] ?? PERSONALITIES['pop']
    } else {
      this.personality = personality
    }
  }

  /** Get current personality. */
  getPersonality(): GuitaristPersonality {
    return { ...this.personality }
  }

  /** Update section context. */
  updateSection(sectionName: string) {
    if (sectionName === this.previousSectionName) {
      this.sectionRepeatCount++
    } else {
      this.sectionRepeatCount = 0
      this.previousSectionName = sectionName
    }
    this.sectionContext = {
      name: sectionName,
      intensity: SECTION_INTENSITY[sectionName] ?? 0.70,
      repetition: this.sectionRepeatCount,
    }
  }

  /**
   * Decide how to play the next beat.
   *
   * @param stroke - The raw stroke direction from the pattern ('D', 'U', 'X', '.')
   * @param chordName - The chord to play
   * @param beatIdx - Position in the strum pattern
   * @param sectionName - Current song section
   * @param baseVelocity - Base volume (0-1)
   * @returns Complete stroke decision with voicing, character, and dynamics
   */
  decideStroke(
    stroke: string,
    chordName: string,
    beatIdx: number,
    sectionName: string,
    baseVelocity = 0.35,
  ): StrokeDecision {
    this.updateSection(sectionName)
    this.beatCounter++

    const s = stroke.toUpperCase()
    const isDown = s === 'D' || s === '↓'
    const isUp = s === 'U' || s === '↑'
    const isMute = s === 'X' || s === '✕'
    const isRest = s === '.' || s === '•'

    if (isRest) {
      return {
        stroke: 'rest',
        character: 'normal',
        velocity: 0,
        voicing: this.lastVoicing ?? ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
        allowSharedStrings: true,
        includeFretNoise: false,
      }
    }

    if (isMute) {
      return {
        stroke: 'mute',
        character: 'palm-mute',
        velocity: baseVelocity * 0.5 * this.personality.strumIntensity,
        voicing: this.lastVoicing ?? ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
        allowSharedStrings: false,
        includeFretNoise: false,
      }
    }

    // Determine chord change
    const isChordChange = chordName !== this.lastChord
    if (isChordChange) {
      this.voicingResolver.reset()
    }

    // ── Select voicing ──────────────────────────────────────────────────
    const voicing = this.voicingResolver.resolve(chordName, beatIdx, sectionName, this.personality.letRingFactor > 0.3)

    // ── Determine stroke character ───────────────────────────────────────
    const character = this.determineCharacter(beatIdx, isDown, isChordChange)

    // ── Compute velocity ─────────────────────────────────────────────────
    const velocity = this.computeVelocity(character, baseVelocity, beatIdx, isDown)

    // ── Fret noise on chord changes ──────────────────────────────────────
    const includeFretNoise = isChordChange && this.beatCounter > 4 && Math.random() < 0.3

    // Update state
    this.lastChord = chordName
    this.lastVoicing = voicing

    return {
      stroke: isDown ? 'down' : 'up',
      character,
      velocity,
      voicing,
      allowSharedStrings: this.personality.letRingFactor > 0.3,
      includeFretNoise,
    }
  }

  /**
   * Plan a chord transition — which strings ring, which stop, which restart.
   */
  planTransition(fromChord: string, toChord: string): TransitionPlan {
    const fromVoicing = this.voicingResolver.getCurrentChord()?.voicing
    const toVoicing = CHORD_VOICINGS[toChord]?.[0]

    if (!fromVoicing || !toVoicing) {
      return {
        sharedStrings: [],
        newStrings: [0, 1, 2, 3, 4, 5],
        dampedStrings: [],
        useBassLeadIn: false,
        style: 'clean',
      }
    }

    const sharedStrings: number[] = []
    const newStrings: number[] = []
    const dampedStrings: number[] = []

    for (let i = 0; i < 6; i++) {
      const from = fromVoicing[i]
      const to = toVoicing[i]

      if (from === null && to === null) continue // both muted
      if (from !== null && to !== null && from === to) {
        sharedStrings.push(i) // same note — let it ring
      } else if (from !== null && to === null) {
        dampedStrings.push(i) // was ringing, now muted
      } else if (from === null && to !== null) {
        newStrings.push(i) // was muted, now playing
      } else {
        newStrings.push(i) // different note — must refret
      }
    }

    // Decide transition style based on personality
    const style: TransitionPlan['style'] =
      this.personality.letRingFactor > 0.7 ? 'slurred'
        : this.personality.bassEmphasis > 0.5 && sharedStrings.includes(0) ? 'bass-lead'
        : this.personality.palmMuteFrequency > 0.1 ? 'muted'
        : 'clean'

    return {
      sharedStrings,
      newStrings,
      dampedStrings,
      useBassLeadIn: style === 'bass-lead',
      style,
    }
  }

  // ── Private: Character determination ────────────────────────────────────────

  private determineCharacter(
    beatIdx: number,
    isDown: boolean,
    isChordChange: boolean,
  ): StrokeCharacter {
    const p = this.personality

    // Beat 0 (downbeat) — almost always accented
    if (beatIdx === 0 || beatIdx % 4 === 0) {
      return 'accented'
    }

    // Random ghost note insertion
    if (Math.random() < p.ghostStrokeFrequency) {
      return 'ghost'
    }

    // Random palm mute
    if (isDown && Math.random() < p.palmMuteFrequency) {
      return 'palm-mute'
    }

    // Chord change — sometimes let ring instead of striking
    if (isChordChange && Math.random() < p.letRingFactor * 0.3) {
      return 'let-ring'
    }

    return 'normal'
  }

  // ── Private: Velocity computation ───────────────────────────────────────────

  private computeVelocity(
    character: StrokeCharacter,
    baseVelocity: number,
    beatIdx: number,
    isDown: boolean,
  ): number {
    const p = this.personality
    const sectionIntensity = this.sectionContext.intensity
    const dynamicsModulation = 1 + (sectionIntensity - 0.5) * p.dynamicsRange

    let velocity: number

    switch (character) {
      case 'accented':
        velocity = baseVelocity * (0.85 + p.accentStrength * 0.3)
        break
      case 'ghost':
        velocity = baseVelocity * 0.25
        break
      case 'palm-mute':
        velocity = baseVelocity * 0.45
        break
      case 'let-ring':
        velocity = baseVelocity * 0.15
        break
      case 'muted':
        velocity = baseVelocity * 0.30
        break
      default:
        velocity = baseVelocity * 0.75
    }

    // Apply section intensity + dynamics
    velocity *= p.strumIntensity * dynamicsModulation

    // Upstrokes are naturally softer
    if (!isDown) {
      velocity *= 0.82
    }

    // Bass emphasis on downbeats
    if (isDown && beatIdx % 4 === 0) {
      velocity *= 1 + p.bassEmphasis * 0.15
    }

    return Math.min(0.95, Math.max(0.02, velocity))
  }

  /** Reset state — call on song restart. */
  reset() {
    this.lastChord = null
    this.lastVoicing = null
    this.beatCounter = 0
    this.sectionContext = { name: 'Verse', intensity: 0.7, repetition: 0 }
    this.previousSectionName = ''
    this.sectionRepeatCount = 0
    this.voicingResolver.reset()
  }
}
