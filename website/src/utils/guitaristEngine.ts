// ── AirChord Guitarist Engine ─────────────────────────────────────────────────
// Sits between GestureEngine (input) and guitarSound (audio renderer).
//
// Adds the intelligence that makes AirChord behave like a *guitarist*, not
// just a chord player:
//
//  1. Multiple voicings per chord — picks from 3 real fingerings each press
//  2. Beat accent curve        — beat 1 is strong, upstrokes are soft
//  3. String overlap on change — shared notes ring through, not re-triggered
//  4. ChordState tracking      — knows what is currently ringing and how hard
//  5. Section-aware dynamics   — Chorus is loudest, Bridge/Outro are quieter
//  6. Style bias               — Campfire picks warmer voicings, Pop random

import type { GuitarVoicing } from './guitarSound'
import { playDownStrum, playUpStrum, playMuteStrum, CHORD_NOTES } from './guitarSound'

export type PlayStyle  = 'campfire' | 'pop' | 'ballad' | 'worship'

// ── Multiple Voicings Per Chord ───────────────────────────────────────────────
// Each chord has 2-4 real open-position fingering variants.
// [E2, A2, D3, G3, B3, E4] — null = muted string.
const CHORD_VOICINGS: Record<string, GuitarVoicing[]> = {

  // G major — three real shapes guitarists use
  G: [
    ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],    // 320003 — standard
    ['G2', 'B2', 'D3', 'G3', 'D4', 'G4'],    // 320033 — pinky pair
    ['G2',  null, 'D3', 'G3', 'B3', 'G4'],   // 3x0003 — muted A
  ],

  // D major — standard + two color variants
  D: [
    [null, null, 'D3', 'A3', 'D4', 'F#4'],   // xx0232 — standard
    [null, null, 'D3', 'A3', 'D4', 'E4'],    // xx0230 — Dsus2 color
    [null, null, 'D3', 'A3', 'C4', 'F#4'],   // xx0212 — D7 color
  ],

  // C major
  C: [
    [null, 'C3', 'E3', 'G3', 'C4', 'E4'],    // x32010 — standard
    [null, 'C3', 'E3', 'G3', 'C4', 'G4'],    // x32013 — high G pinky
    [null, 'C3', 'E3', 'G3', 'C4', 'E4'],    // same — no accidental drift
  ],

  // E major
  E: [
    ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],   // 022100 — standard
    ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'],   // 020100 — E7 color
    ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],   // standard repeat
  ],

  // A major
  A: [
    [null, 'A2', 'E3', 'A3', 'C#4', 'E4'],   // x02220 — standard
    [null, 'A2', 'E3', 'A3', 'C#4', 'A4'],   // x02225 — high A
    [null, 'A2', 'E3', 'A3', 'E4',  'E4'],   // x02222 — full barre top
  ],

  // B major
  B: [
    [null, 'B2', 'F#3', 'B3', 'D#4', 'F#4'],
    [null, 'B2', 'F#3', 'B3', 'D#4', 'B4'],
    [null, 'B2', 'F#3', 'B3', 'D#4', 'F#4'],
  ],

  // Em minor
  Em: [
    ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],    // 022000 — standard
    ['E2', 'B2', 'E3', 'G3', 'D4', 'E4'],    // 022030 — Em7 color
    ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],    // standard repeat
  ],

  // Am minor
  Am: [
    [null, 'A2', 'E3', 'A3', 'C4', 'E4'],    // x02210 — standard
    [null, 'A2', 'E3', 'G3', 'C4', 'E4'],    // x02010 — Am7 color
    [null, 'A2', 'E3', 'A3', 'C4', 'A4'],    // x02215 — high A
  ],

  // Dm minor
  Dm: [
    [null, null, 'D3', 'A3', 'D4', 'F4'],    // xx0231 — standard
    [null, null, 'D3', 'A3', 'F4', 'F4'],    // xx0233 — top barre
    [null, null, 'D3', 'A3', 'D4', 'F4'],    // standard repeat
  ],

  // Bm minor
  Bm: [
    [null, 'B2', 'F#3', 'B3', 'D4', 'F#4'],
    [null, 'B2', 'F#3', 'B3', 'D4', 'B4'],
    [null, 'B2', 'F#3', 'B3', 'D4', 'F#4'],
  ],

  // F major (barre)
  F: [
    ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],    // 133211 — full barre
    [null, null, 'F3', 'A3', 'C4', 'F4'],    // xx3211 — partial (easier)
    ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],    // full barre repeat
  ],

  // B7
  B7: [
    [null, 'B2', 'D#3', 'A3', 'B3', 'F#4'],
    [null, 'B2', 'D#3', 'F#3', 'B3', 'F#4'],
    [null, 'B2', 'D#3', 'A3', 'B3', 'F#4'],
  ],

  // G7
  G7: [
    ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'],
    ['G2', 'B2', 'D3', 'G3', 'D4', 'F4'],
    ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'],
  ],

  // E7
  E7: [
    ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'],
    ['E2',  null, 'D3', 'G#3', 'B3', 'E4'],
    ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'],
  ],

  // A7
  A7: [
    [null, 'A2', 'E3', 'G3', 'C#4', 'E4'],
    [null, 'A2', 'E3', 'G3', 'C#4', 'A4'],
    [null, 'A2', 'E3', 'G3', 'C#4', 'E4'],
  ],

  // D7
  D7: [
    [null, null, 'D3', 'A3', 'C4', 'F#4'],
    [null, null, 'D3', 'F#3', 'C4', 'F#4'],
    [null, null, 'D3', 'A3', 'C4', 'F#4'],
  ],

  // F#m
  'F#m': [
    ['F#2', 'C#3', 'F#3', 'A3',  'C#4', 'F#4'],
    ['F#2', 'C#3', 'F#3', 'A3',  'C#4', 'F#4'],
    ['F#2', 'C#3', 'F#3', 'A3',  'C#4', 'F#4'],
  ],

  // Am7
  Am7: [
    [null, 'A2', 'E3', 'G3', 'C4', 'E4'],
    [null, 'A2', 'E3', 'G3', 'C4', 'A4'],
    [null, 'A2', 'E3', 'G3', 'C4', 'E4'],
  ],

  // Cadd9
  Cadd9: [
    [null, 'C3', 'E3', 'G3', 'D4', 'E4'],
    [null, 'C3', 'E3', 'G3', 'D4', 'G4'],
    [null, 'C3', 'E3', 'G3', 'D4', 'E4'],
  ],
}

// ── Beat Accent Curves ────────────────────────────────────────────────────────
// Velocity multiplier indexed by beat position in the strum pattern.
// Beat 0 is always the strongest downbeat. Upstrokes are softer by definition.
// The curve repeats if the pattern has more beats than the curve length.
const ACCENT_CURVES: Record<PlayStyle, number[]> = {
  campfire: [1.00, 0.70, 0.52, 0.66, 0.86, 0.58],
  pop:      [1.00, 0.74, 0.58, 0.72, 0.90, 0.64],
  ballad:   [0.86, 0.58, 0.44, 0.56, 0.74, 0.48],
  worship:  [1.00, 0.76, 0.56, 0.68, 0.90, 0.62],
}

// ── Section Volume Multipliers ────────────────────────────────────────────────
// The app knows which section is playing — use it to shape the performance.
const SECTION_VOLUME: Record<string, number> = {
  Intro:  0.75,
  Verse:  0.82,
  Chorus: 1.00,
  Bridge: 0.70,
  Outro:  0.60,
}

// ── ChordState — what the guitarist currently has ringing ─────────────────────
interface ChordState {
  name: string
  voicing: GuitarVoicing
  velocity: number
}

// ── Guitarist Engine ──────────────────────────────────────────────────────────
export class GuitaristEngine {
  private style:      PlayStyle
  private chord:      ChordState | null = null
  private lastStrokeAt = 0
  private ringing = false

  constructor(style: PlayStyle = 'pop') {
    this.style = style
  }

  setStyle(style: PlayStyle) { this.style = style }

  // ── Pick a voicing variant with style bias ──────────────────────────────────
  private selectVoicing(chordName: string): GuitarVoicing {
    const variants = CHORD_VOICINGS[chordName]
    if (!variants || variants.length === 0) {
      // Fall back to the single canonical voicing from guitarSound
      return (CHORD_NOTES[chordName] as GuitarVoicing) ?? ['E2','B2','E3','G3','B3','E4']
    }

    if (this.style === 'campfire' || this.style === 'worship') {
      // Warmer/folk styles: prefer first (most traditional) voicing
      const r = Math.random()
      if (r < 0.55) return variants[0]
      if (r < 0.85) return variants[Math.min(1, variants.length - 1)]
      return variants[variants.length - 1]
    }
    // Pop/ballad: uniform random — more variety
    return variants[Math.floor(Math.random() * variants.length)]
  }

  // ── Transition voicing: null out strings already ringing at the same pitch ──
  // When G → Em, strings 3 (G3) and 4 (B3) are common → they ring through.
  // We return a modified voicing where those positions are null (skip re-pluck).
  private buildTransitionVoicing(oldV: GuitarVoicing, newV: GuitarVoicing): GuitarVoicing {
    return newV.map((note, i) => {
      if (note === null)  return null   // muted in the new chord anyway
      if (oldV[i] === note) return null // same note ringing — let it sustain
      return note                       // different note — pluck it
    }) as GuitarVoicing
  }

  // ── Beat accent: velocity multiplier for this position in the pattern ───────
  private accentGain(beatIdx: number, stroke: string): number {
    const curve   = ACCENT_CURVES[this.style]
    const accent  = curve[beatIdx % curve.length]
    const isUp    = stroke === 'U' || stroke === '↑'
    return isUp ? accent * 0.85 : accent  // upstrokes naturally softer
  }

  // ── Section volume (static so LivePerformanceScreen can also call it) ───────
  static sectionVolume(sectionName: string): number {
    return SECTION_VOLUME[sectionName] ?? 0.82
  }

  // ── Derive play style from song collection tags ──────────────────────────────
  static styleFromCollections(collections: string[]): PlayStyle {
    if (collections.includes('Campfire'))                  return 'campfire'
    if (collections.includes('Worship'))                   return 'worship'
    if (collections.includes('Romantic') ||
        collections.includes('Ballad'))                    return 'ballad'
    return 'pop'
  }

  // ── Main entry point: play one beat of the strum pattern ────────────────────
  /**
   * @param stroke      'D'|'↓'|'U'|'↑'|'X'|'✕'
   * @param chordName   e.g. 'G', 'Am', 'F#m'
   * @param beatIdx     0-based position in the strum pattern
   * @param sectionName 'Intro'|'Verse'|'Chorus'|'Bridge'|'Outro'
   * @param baseVol     nominal volume before scaling (default 0.35)
   */
  playBeat(
    stroke:      string,
    chordName:   string,
    beatIdx:     number,
    sectionName: string,
    baseVol = 0.35
  ) {
    if (!stroke || stroke === '.' || stroke === '•') return

    const now = performance.now()
    const s = stroke.toUpperCase()
    const isDown = s === 'D' || s === '↓'
    const isUp = s === 'U' || s === '↑'
    const isMute = s === 'X' || s === '✕'
    if (!isDown && !isUp && !isMute) return
    let triggerVoicing: GuitarVoicing

    if (this.chord?.name === chordName) {
      // Same chord — keep the selected voicing, but re-pluck it after a mute or
      // a long pause because the previously shared strings are no longer ringing.
      triggerVoicing = this.chord.voicing
    } else {
      // Chord changed. Shared open strings may ring through a close transition,
      // but only while we have recently played a non-muted stroke.
      const newVoicing = this.selectVoicing(chordName)
      const canCarrySharedStrings = Boolean(
        this.chord && this.ringing && now - this.lastStrokeAt < 900,
      )
      triggerVoicing = canCarrySharedStrings
        ? this.buildTransitionVoicing(this.chord!.voicing, newVoicing)
        : newVoicing
      this.chord = { name: chordName, voicing: newVoicing, velocity: baseVol }
    }

    // Final volume: base × section multiplier × beat accent
    const vol = baseVol
      * GuitaristEngine.sectionVolume(sectionName)
      * this.accentGain(beatIdx, stroke)

    // Dispatch to the audio renderer
    if (isDown) playDownStrum(triggerVoicing, vol)
    else if (isUp) playUpStrum(triggerVoicing, vol)
    else if (isMute) playMuteStrum(triggerVoicing, vol)

    if (isDown || isUp) this.ringing = true
    if (isMute) this.ringing = false
    this.lastStrokeAt = now
  }

  /** Reset chord state — call when the song restarts */
  reset() {
    this.chord = null
    this.lastStrokeAt = 0
    this.ringing = false
  }
}
