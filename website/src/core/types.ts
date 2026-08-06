// ── AirChord Core Type Definitions ────────────────────────────────────────────
// Central types shared across engines, services, and components.

// ── Song Schema ───────────────────────────────────────────────────────────────

export interface TimestampedLyric {
  text: string
  chord: string
  time: number // seconds from track start
  /** @deprecated Finger gesture info belongs to profiles, not lyrics */
  fingerGesture?: string
}

export interface SongSection {
  name: 'Intro' | 'Verse' | 'Chorus' | 'Bridge' | 'Outro'
  lyrics: TimestampedLyric[]
}

export interface Song {
  id: string
  title: string
  artist: string
  bpm: number
  timeSignature: string
  key: string
  capo: number
  difficulty: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced'
  collections: string[]
  duration: string
  defaultStrumPattern: string[]
  displayPattern: string
  fingerstylePattern?: string[]
  chords: string[]
  sections: SongSection[]

  /**
   * @deprecated Finger mapping should come from gesture profiles, not songs.
   * Kept optional for backward compatibility with legacy SEED_SONGS data.
   * New JSON songs should NOT include this field.
   */
  fingerMapping?: string[]
}

export const SONG_COLLECTIONS = [
  'All','Hindi','English','Bollywood','Pop','Rock',
  'Indie','Campfire','Romantic','Worship','Beginner','Advanced',
]

// ── Session Config ────────────────────────────────────────────────────────────

export interface SessionConfig {
  song: Song
  capo: number
  bpm: number
  strumPattern: string[]
  displayPattern: string
  fingerMapping: string[] // Resolved from gesture profile + song chords
}

// ── Gesture ───────────────────────────────────────────────────────────────────

export interface GestureProfile {
  id: string
  name: string
  description: string
  mapping: string[] // Array of 6 chords corresponding to 0-5 extended fingers
}

export interface GestureResult {
  gesture: string
  chord: string
  confidence: number
  fingerCount: number
  profileId: string
}

// ── Audio ─────────────────────────────────────────────────────────────────────

export type GuitarType = 'steel' | 'nylon' | 'electric' | '12string'
export type EngineMode = 'sampled' | 'nylon' | 'synth'
export type GuitarVoicing = (string | null)[]
export type PlayStyle = 'campfire' | 'pop' | 'ballad' | 'worship'

// ── Transport ─────────────────────────────────────────────────────────────────

export interface TransportState {
  playing: boolean
  positionSec: number
  beat: number
  measure: number
  section: string
  currentChord: string
  currentLine: number
}

// ── Events ────────────────────────────────────────────────────────────────────

export interface AirChordEvents {
  // Transport events
  'transport:tick': TransportState
  'transport:start': void
  'transport:pause': void
  'transport:stop': void
  'transport:seek': number

  // Gesture events
  'gesture:detected': GestureResult
  'gesture:reset': void

  // Audio events
  'audio:beat': { stroke: string; chord: string; beatIdx: number; section: string }
  'audio:mute': boolean
  'audio:chord-change': string

  // Lyric events
  'lyrics:line-change': { lineIndex: number; text: string; chord: string }
  'lyrics:section-change': string

  // Recording events
  'recording:start': void
  'recording:stop': void
  'recording:complete': Blob

  // UI events
  'ui:countdown': number | null
  'ui:camera-ready': boolean
  'ui:mic-ready': boolean
}
