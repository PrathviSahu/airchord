// ── Voicing Resolver ──────────────────────────────────────────────────────────
//
// Responsible ONLY for selecting which notes to play for a given chord.
// Does NOT know about audio rendering or strum timing.
//
// Guitarist
//   ↓
// Voicing Resolver (this module)
//   ↓
// Strumming Engine → Sample/Synth Engine

import type { GuitarVoicing, PlayStyle } from '../../core/types'
import { CHORD_NOTES } from '../AudioEngine/guitarSound'

// ── Multiple Voicings Per Chord ───────────────────────────────────────────────
// Each chord has 2-4 real open-position fingering variants.
// [E2, A2, D3, G3, B3, E4] — null = muted string.
export const CHORD_VOICINGS: Record<string, GuitarVoicing[]> = {
  G: [
    ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
    ['G2', 'B2', 'D3', 'G3', 'D4', 'G4'],
    ['G2',  null, 'D3', 'G3', 'B3', 'G4'],
  ],
  D: [
    [null, null, 'D3', 'A3', 'D4', 'F#4'],
    [null, null, 'D3', 'A3', 'D4', 'E4'],
    [null, null, 'D3', 'A3', 'C4', 'F#4'],
  ],
  C: [
    [null, 'C3', 'E3', 'G3', 'C4', 'E4'],
    [null, 'C3', 'E3', 'G3', 'C4', 'G4'],
    [null, 'C3', 'E3', 'G3', 'C4', 'E4'],
  ],
  E: [
    ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
    ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'],
    ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  ],
  A: [
    [null, 'A2', 'E3', 'A3', 'C#4', 'E4'],
    [null, 'A2', 'E3', 'A3', 'C#4', 'A4'],
    [null, 'A2', 'E3', 'A3', 'E4',  'E4'],
  ],
  B: [
    [null, 'B2', 'F#3', 'B3', 'D#4', 'F#4'],
    [null, 'B2', 'F#3', 'B3', 'D#4', 'B4'],
    [null, 'B2', 'F#3', 'B3', 'D#4', 'F#4'],
  ],
  Em: [
    ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
    ['E2', 'B2', 'E3', 'G3', 'D4', 'E4'],
    ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  ],
  Am: [
    [null, 'A2', 'E3', 'A3', 'C4', 'E4'],
    [null, 'A2', 'E3', 'G3', 'C4', 'E4'],
    [null, 'A2', 'E3', 'A3', 'C4', 'A4'],
  ],
  Dm: [
    [null, null, 'D3', 'A3', 'D4', 'F4'],
    [null, null, 'D3', 'A3', 'F4', 'F4'],
    [null, null, 'D3', 'A3', 'D4', 'F4'],
  ],
  Bm: [
    [null, 'B2', 'F#3', 'B3', 'D4', 'F#4'],
    [null, 'B2', 'F#3', 'B3', 'D4', 'B4'],
    [null, 'B2', 'F#3', 'B3', 'D4', 'F#4'],
  ],
  F: [
    ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
    [null, null, 'F3', 'A3', 'C4', 'F4'],
    ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  ],
  B7: [
    [null, 'B2', 'D#3', 'A3', 'B3', 'F#4'],
    [null, 'B2', 'D#3', 'F#3', 'B3', 'F#4'],
    [null, 'B2', 'D#3', 'A3', 'B3', 'F#4'],
  ],
  G7: [
    ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'],
    ['G2', 'B2', 'D3', 'G3', 'D4', 'F4'],
    ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'],
  ],
  E7: [
    ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'],
    ['E2',  null, 'D3', 'G#3', 'B3', 'E4'],
    ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'],
  ],
  A7: [
    [null, 'A2', 'E3', 'G3', 'C#4', 'E4'],
    [null, 'A2', 'E3', 'G3', 'C#4', 'A4'],
    [null, 'A2', 'E3', 'G3', 'C#4', 'E4'],
  ],
  D7: [
    [null, null, 'D3', 'A3', 'C4', 'F#4'],
    [null, null, 'D3', 'F#3', 'C4', 'F#4'],
    [null, null, 'D3', 'A3', 'C4', 'F#4'],
  ],
  'F#m': [
    ['F#2', 'C#3', 'F#3', 'A3',  'C#4', 'F#4'],
    ['F#2', 'C#3', 'F#3', 'A3',  'C#4', 'F#4'],
    ['F#2', 'C#3', 'F#3', 'A3',  'C#4', 'F#4'],
  ],
  'F#7': [
    ['F#2', 'C#3', 'E3', 'A#3', 'C#4', 'F#4'],
    ['F#2', 'C#3', 'E3', 'A#3', 'C#4', 'F#4'],
    ['F#2', 'C#3', 'E3', 'A#3', 'C#4', 'F#4'],
  ],
  Am7: [
    [null, 'A2', 'E3', 'G3', 'C4', 'E4'],
    [null, 'A2', 'E3', 'G3', 'C4', 'A4'],
    [null, 'A2', 'E3', 'G3', 'C4', 'E4'],
  ],
  Cadd9: [
    [null, 'C3', 'E3', 'G3', 'D4', 'E4'],
    [null, 'C3', 'E3', 'G3', 'D4', 'G4'],
    [null, 'C3', 'E3', 'G3', 'D4', 'E4'],
  ],
}

// ── Voicing Resolver ──────────────────────────────────────────────────────────

interface ChordState {
  name: string
  voicing: GuitarVoicing
}

export class VoicingResolver {
  private style: PlayStyle
  private currentChord: ChordState | null = null

  constructor(style: PlayStyle = 'pop') {
    this.style = style
  }

  setStyle(style: PlayStyle) {
    this.style = style
  }

  /** Select a voicing variant with style bias. */
  private selectVoicing(chordName: string): GuitarVoicing {
    const variants = CHORD_VOICINGS[chordName]
    if (!variants || variants.length === 0) {
      return (CHORD_NOTES[chordName] as GuitarVoicing) ?? ['E2','B2','E3','G3','B3','E4']
    }

    if (this.style === 'campfire' || this.style === 'worship') {
      const r = Math.random()
      if (r < 0.55) return variants[0]
      if (r < 0.85) return variants[Math.min(1, variants.length - 1)]
      return variants[variants.length - 1]
    }
    return variants[Math.floor(Math.random() * variants.length)]
  }

  /**
   * Build transition voicing: null out strings already ringing at the same pitch.
   * When G → Em, strings 3 (G3) and 4 (B3) are common → they ring through.
   */
  private buildTransitionVoicing(oldV: GuitarVoicing, newV: GuitarVoicing): GuitarVoicing {
    return newV.map((note, i) => {
      if (note === null) return null
      if (oldV[i] === note) return null // same note — let it sustain
      return note
    }) as GuitarVoicing
  }

  /**
   * Resolve a voicing for the given chord, considering the current ringing state.
   * Returns the voicing to be played (with shared strings nulled for transition).
   */
  resolve(
    chordName: string,
    _beatIdx: number,
    _sectionName: string,
    canCarrySharedStrings = true,
  ): GuitarVoicing {
    if (this.currentChord?.name === chordName) {
      return this.currentChord.voicing
    }

    const newVoicing = this.selectVoicing(chordName)

    let triggerVoicing: GuitarVoicing
    if (canCarrySharedStrings && this.currentChord) {
      triggerVoicing = this.buildTransitionVoicing(this.currentChord.voicing, newVoicing)
    } else {
      triggerVoicing = newVoicing
    }

    this.currentChord = { name: chordName, voicing: newVoicing }
    return triggerVoicing
  }

  /** Reset chord state — call when the song restarts. */
  reset() {
    this.currentChord = null
  }

  /** Get the currently ringing chord state. */
  getCurrentChord(): ChordState | null {
    return this.currentChord
  }
}
