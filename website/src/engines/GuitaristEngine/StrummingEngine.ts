// ── Strumming Engine ──────────────────────────────────────────────────────────
//
// Responsible ONLY for translating stroke direction + voicing + accent into
// actual audio calls. Does NOT know about chord selection or song structure.
//
// Voicing Resolver → Strumming Engine (this module) → Audio Renderer

import type { GuitarVoicing, PlayStyle } from '../../core/types'
import { playDownStrum, playUpStrum, playMuteStrum } from '../AudioEngine/guitarSound'

// ── Beat Accent Curves ────────────────────────────────────────────────────────
const ACCENT_CURVES: Record<PlayStyle, number[]> = {
  campfire: [1.00, 0.70, 0.52, 0.66, 0.86, 0.58],
  pop:      [1.00, 0.74, 0.58, 0.72, 0.90, 0.64],
  ballad:   [0.86, 0.58, 0.44, 0.56, 0.74, 0.48],
  worship:  [1.00, 0.76, 0.56, 0.68, 0.90, 0.62],
}

// ── Section Volume Multipliers ────────────────────────────────────────────────
const SECTION_VOLUME: Record<string, number> = {
  Intro:  0.75,
  Verse:  0.82,
  Chorus: 1.00,
  Bridge: 0.70,
  Outro:  0.60,
}

export class StrummingEngine {
  private style: PlayStyle
  private ringing = false

  constructor(style: PlayStyle = 'pop') {
    this.style = style
  }

  setStyle(style: PlayStyle) {
    this.style = style
  }

  /** Get accent gain for a beat position and stroke direction. */
  private accentGain(beatIdx: number, stroke: string): number {
    const curve = ACCENT_CURVES[this.style]
    const accent = curve[beatIdx % curve.length]
    const isUp = stroke === 'U' || stroke === '↑'
    return isUp ? accent * 0.85 : accent
  }

  /** Get section volume multiplier. */
  static sectionVolume(sectionName: string): number {
    return SECTION_VOLUME[sectionName] ?? 0.82
  }

  /** Derive play style from song collection tags. */
  static styleFromCollections(collections: string[]): PlayStyle {
    if (collections.includes('Campfire')) return 'campfire'
    if (collections.includes('Worship')) return 'worship'
    if (collections.includes('Romantic') || collections.includes('Ballad')) return 'ballad'
    return 'pop'
  }

  /**
   * Play one beat of the strum pattern.
   * @param stroke 'D'|'↓'|'U'|'↑'|'X'|'✕'
   * @param voicing The resolved voicing (already with shared strings nulled)
   * @param beatIdx 0-based position in the strum pattern
   * @param sectionName Current section name
   * @param baseVol Nominal volume before scaling (default 0.35)
   */
  play(
    stroke: string,
    voicing: GuitarVoicing,
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

    // Final volume: base × section multiplier × beat accent
    const vol = baseVol
      * StrummingEngine.sectionVolume(sectionName)
      * this.accentGain(beatIdx, stroke)

    // Dispatch to audio renderer
    if (isDown) playDownStrum(voicing, vol)
    else if (isUp) playUpStrum(voicing, vol)
    else if (isMute) playMuteStrum(voicing, vol)

    if (isDown || isUp) this.ringing = true
    if (isMute) this.ringing = false
  }

  /** Reset ringing state. */
  reset() {
    this.ringing = false
  }
}
