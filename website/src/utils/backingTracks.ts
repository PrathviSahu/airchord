// ── Real Studio Background Guitar Backing Tracks Engine ──────────────────

import { playPatternBeat } from './guitarSound'

export interface BackingTrack {
  id: string
  name: string
  genre: string
  bpm: number
  chords: string[]
  strumPattern: string[]
  description: string
}

export const BACKING_TRACKS: BackingTrack[] = [
  {
    id: 'pop_ballad',
    name: 'Pop Ballad Accompaniment',
    genre: 'Pop / Acoustic',
    bpm: 90,
    chords: ['C', 'G', 'Am', 'F'],
    strumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    description: 'Perfect for singing modern pop hits (Riptide, Perfect, Someone Like You)',
  },
  {
    id: 'acoustic_folk',
    name: 'Acoustic Folk Strum',
    genre: 'Folk / Country',
    bpm: 105,
    chords: ['G', 'Em', 'C', 'D'],
    strumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    description: 'Upbeat acoustic rhythm for folk and singalong classics',
  },
  {
    id: 'campfire_rock',
    name: 'Campfire Rock Rhythm',
    genre: 'Rock / Unplugged',
    bpm: 115,
    chords: ['Em', 'Am', 'G', 'D'],
    strumPattern: ['D', 'X', 'U', 'D', 'X', 'U'],
    description: 'Dynamic unplugged guitar rhythm with percussive slap accents',
  },
  {
    id: 'smooth_blues',
    name: 'Smooth Blues & Soul',
    genre: 'Blues / Soul',
    bpm: 84,
    chords: ['E', 'A', 'B7', 'C#m'],
    strumPattern: ['D', 'U', 'U', 'D', 'U', 'U'],
    description: 'Warm 3/4 acoustic backing track for soul and blues vocals',
  },
]

const CHORD_NOTES: Record<string, string[]> = {
  C: ['C3', 'E3', 'G3', 'C4', 'E4'],
  G: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  Am: ['A2', 'E3', 'A3', 'C4', 'E4'],
  F: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  Em: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  D: ['D3', 'A3', 'D4', 'F#4'],
  E: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  A: ['A2', 'E3', 'A3', 'C#4', 'E4'],
  B7: ['B2', 'D#3', 'A3', 'D4', 'F#4'],
  'C#m': ['C#3', 'G#3', 'C#4', 'E4'],
}

export class BackingTrackPlayer {
  private isPlaying = false
  private currentTrack: BackingTrack = BACKING_TRACKS[0]
  private chordIndex = 0
  private stepIndex = 0
  private timerId: number | null = null
  private onBeatCallback?: (chord: string, step: number, progress: number) => void

  setTrack(track: BackingTrack) {
    this.currentTrack = track
    this.chordIndex = 0
    this.stepIndex = 0
  }

  setCallback(cb: (chord: string, step: number, progress: number) => void) {
    this.onBeatCallback = cb
  }

  start() {
    if (this.isPlaying) return
    this.isPlaying = true
    this.chordIndex = 0
    this.stepIndex = 0
    this.tick()
  }

  stop() {
    this.isPlaying = false
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  private tick = () => {
    if (!this.isPlaying) return

    const track = this.currentTrack
    const chordName = track.chords[this.chordIndex % track.chords.length]
    const notes = CHORD_NOTES[chordName] || ['E3', 'A3', 'D4', 'G4']
    const stroke = track.strumPattern[this.stepIndex % track.strumPattern.length] || 'D'

    // Play guitar beat step
    playPatternBeat(stroke, notes, 0.22)

    // Notify callback for UI sync
    this.onBeatCallback?.(
      chordName,
      this.stepIndex,
      (this.chordIndex * track.strumPattern.length + this.stepIndex) / (track.chords.length * track.strumPattern.length)
    )

    // Advance step
    this.stepIndex++
    if (this.stepIndex % track.strumPattern.length === 0) {
      this.chordIndex++
    }

    // Schedule next beat based on BPM
    const beatDurationMs = Math.round((60 / track.bpm) * 1000 * 0.5) // 8th notes
    this.timerId = window.setTimeout(this.tick, beatDurationMs)
  }

  getIsPlaying() {
    return this.isPlaying
  }
}
