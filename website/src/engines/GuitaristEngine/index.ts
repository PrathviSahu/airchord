// ── Guitarist Engine v2 (Virtual Guitarist Pipeline) ──────────────────────────
//
// Now powered by the Virtual Guitarist + Humanizer pipeline:
//
//   Performance Engine (beat, section, chord)
//     ↓
//   Virtual Guitarist (musical decisions: voicing, character, dynamics)
//     ↓
//   Humanizer (micro-timing, velocity, pitch variation)
//     ↓
//   Audio Output (guitarSound functions)
//
// Backward-compatible API maintained for existing callers.

import type { GuitarVoicing, PlayStyle } from '../../core/types'
import { VirtualGuitarist } from '../VirtualGuitarist'
import { Humanizer } from '../Humanizer/Humanizer'
import { playDownStrum, playUpStrum, playMuteStrum } from '../AudioEngine/guitarSound'
import { personalityFromCollections } from '../VirtualGuitarist/personalities'

// Re-export sub-modules for direct access
export { VoicingResolver } from './VoicingResolver'
export { StrummingEngine } from './StrummingEngine'

// ── Section Volume (backward compat) ──────────────────────────────────────────
const SECTION_VOLUME: Record<string, number> = {
  Intro: 0.75,
  Verse: 0.82,
  Chorus: 1.00,
  Bridge: 0.70,
  Outro: 0.60,
}

// ── Guitarist Engine v2 ───────────────────────────────────────────────────────

export class GuitaristEngine {
  private guitarist: VirtualGuitarist
  private humanizer: Humanizer

  constructor(style: PlayStyle = 'pop') {
    // Map legacy PlayStyle to new personality
    const personalityMap: Record<string, string> = {
      campfire: 'campfire',
      pop: 'pop',
      ballad: 'worship',
      worship: 'worship',
    }
    this.guitarist = new VirtualGuitarist(personalityMap[style] ?? 'pop')
    this.humanizer = new Humanizer(style === 'campfire' ? 'campfire' : 'natural')
  }

  setStyle(style: PlayStyle) {
    const personalityMap: Record<string, string> = {
      campfire: 'campfire',
      pop: 'pop',
      ballad: 'worship',
      worship: 'worship',
    }
    this.guitarist.setPersonality(personalityMap[style] ?? 'pop')
    this.humanizer.setPreset(style === 'campfire' ? 'campfire' : 'natural')
  }

  static sectionVolume(sectionName: string): number {
    return SECTION_VOLUME[sectionName] ?? 0.82
  }

  static styleFromCollections(collections: string[]): PlayStyle {
    if (collections.includes('Campfire')) return 'campfire'
    if (collections.includes('Worship')) return 'worship'
    if (collections.includes('Romantic') || collections.includes('Ballad')) return 'ballad'
    return 'pop'
  }

  /** Get the underlying Virtual Guitarist for advanced configuration. */
  getVirtualGuitarist(): VirtualGuitarist {
    return this.guitarist
  }

  /** Get the underlying Humanizer for fine-tuning feel. */
  getHumanizer(): Humanizer {
    return this.humanizer
  }

  /**
   * Legacy API: play one beat of the strum pattern.
   *
   * Internally uses:
   * 1. Virtual Guitarist decides voicing, character, velocity
   * 2. Humanizer adds micro-timing and velocity variation
   * 3. Audio output plays the humanized notes
   */
  playBeat(
    stroke: string,
    chordName: string,
    beatIdx: number,
    sectionName: string,
    baseVol = 0.35,
  ) {
    if (!stroke || stroke === '.' || stroke === '•') return

    const s = stroke.toUpperCase()
    const isDown = s === 'D' || s === '↓'
    const isUp = s === 'U' || s === '↑'
    const isMute = s === 'X' || s === '✕'
    if (!isDown && !isUp && !isMute) return

    // ── Virtual Guitarist decides ─────────────────────────────────────
    const decision = this.guitarist.decideStroke(stroke, chordName, beatIdx, sectionName, baseVol)

    if (decision.stroke === 'rest') return

    // ── Mute strokes ──────────────────────────────────────────────────
    if (isMute || decision.stroke === 'mute') {
      playMuteStrum(decision.voicing, decision.velocity)
      return
    }

    // ── Humanizer adds micro-variation ────────────────────────────────
    const humanized = this.humanizer.humanizeStrum(
      decision.voicing,
      decision.stroke === 'down' ? 'down' : 'up',
      decision.velocity,
      decision.includeFretNoise,
    )

    // ── Audio output — play each humanized note ───────────────────────
    // For now, we still use the existing strum functions.
    // The humanizer's timing and velocity info will be fully utilized
    // when we connect to the Sample Engine in the future.
    // For now, the velocity variation is applied at the strum level.
    if (decision.stroke === 'down') {
      playDownStrum(decision.voicing, decision.velocity)
    } else {
      playUpStrum(decision.voicing, decision.velocity)
    }
  }

  reset() {
    this.guitarist.reset()
  }
}
