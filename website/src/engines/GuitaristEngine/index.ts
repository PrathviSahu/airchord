// ── Guitarist Engine (Legacy-Compatible Wrapper) ──────────────────────────────
//
// This module re-exports the split Guitarist Engine components for backward
// compatibility. New code should import VoicingResolver and StrummingEngine
// directly.

export { VoicingResolver } from './VoicingResolver'
export { StrummingEngine } from './StrummingEngine'

// ── Backward-compatible GuitaristEngine class ─────────────────────────────────
// Keeps the old API working while internally delegating to the split modules.

import type { GuitarVoicing, PlayStyle } from '../../core/types'
import { VoicingResolver } from './VoicingResolver'
import { StrummingEngine } from './StrummingEngine'

export class GuitaristEngine {
  private voicingResolver: VoicingResolver
  private strummingEngine: StrummingEngine

  constructor(style: PlayStyle = 'pop') {
    this.voicingResolver = new VoicingResolver(style)
    this.strummingEngine = new StrummingEngine(style)
  }

  setStyle(style: PlayStyle) {
    this.voicingResolver.setStyle(style)
    this.strummingEngine.setStyle(style)
  }

  static sectionVolume(sectionName: string): number {
    return StrummingEngine.sectionVolume(sectionName)
  }

  static styleFromCollections(collections: string[]): PlayStyle {
    return StrummingEngine.styleFromCollections(collections)
  }

  /**
   * Legacy API: play one beat of the strum pattern.
   * Internally resolves voicing and dispatches to the strumming engine.
   */
  playBeat(
    stroke: string,
    chordName: string,
    beatIdx: number,
    sectionName: string,
    baseVol = 0.35,
  ) {
    if (!stroke || stroke === '.' || stroke === '•') return

    const voicing = this.voicingResolver.resolve(chordName, beatIdx, sectionName)
    this.strummingEngine.play(stroke, voicing, beatIdx, sectionName, baseVol)
  }

  reset() {
    this.voicingResolver.reset()
    this.strummingEngine.reset()
  }
}
