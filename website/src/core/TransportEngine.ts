// ── AirChord Transport Engine ─────────────────────────────────────────────────
//
// Similar to professional DAWs, the transport is the single clock source.
// Everything runs from one clock:
//
//   Transport
//     ↓
//   Current Beat → Current Measure → Current Section → Current Chord → Lyrics
//     ↓
//   Recording / Metronome / Audio / UI
//
// The transport emits ticks via the EventBus so all subsystems stay in sync
// without directly coupling to each other.

import { eventBus } from './EventBus'
import type { Song, TransportState } from './types'

export class TransportEngine {
  private song: Song
  private bpm: number
  private playing = false
  private positionSec = 0
  private startedAt = 0
  private positionAtStart = 0
  private tickInterval: number | null = null
  private currentLine = 0
  private currentSection = 'Verse'

  // Pre-computed flat lyric list for fast lookup
  private flatLyrics: { text: string; chord: string; time: number; section: string }[] = []

  constructor(song: Song, bpm: number) {
    this.song = song
    this.bpm = bpm
    this.buildFlatLyrics()
  }

  private buildFlatLyrics() {
    this.flatLyrics = []
    for (const section of this.song.sections) {
      for (const lyric of section.lyrics) {
        this.flatLyrics.push({
          text: lyric.text,
          chord: lyric.chord,
          time: lyric.time,
          section: section.name,
        })
      }
    }
  }

  /** Start or resume the transport. */
  start() {
    if (this.playing) return
    this.playing = true
    this.startedAt = performance.now()
    this.positionAtStart = this.positionSec

    eventBus.emit('transport:start')

    this.tickInterval = window.setInterval(() => this.tick(), 50)
    this.tick() // immediate first tick
  }

  /** Pause the transport, preserving position. */
  pause() {
    if (!this.playing) return
    this.playing = false
    this.positionSec = this.positionAtStart + (performance.now() - this.startedAt) / 1000

    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }

    eventBus.emit('transport:pause')
  }

  /** Stop and reset to beginning. */
  stop() {
    this.playing = false
    this.positionSec = 0
    this.currentLine = 0
    this.currentSection = this.song.sections[0]?.name ?? 'Verse'

    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }

    eventBus.emit('transport:stop')
  }

  /** Seek to a specific time in seconds. */
  seek(timeSec: number) {
    this.positionSec = Math.max(0, timeSec)
    if (this.playing) {
      this.startedAt = performance.now()
      this.positionAtStart = this.positionSec
    }
    this.updateFromPosition()
    eventBus.emit('transport:seek', this.positionSec)
  }

  /** Get current transport state snapshot. */
  getState(): TransportState {
    const currentSec = this.playing
      ? this.positionAtStart + (performance.now() - this.startedAt) / 1000
      : this.positionSec

    const beatMs = Math.round(60000 / this.bpm)
    const beatInMeasure = Math.floor((currentSec * 1000 / beatMs) % 4)
    const measure = Math.floor(currentSec * 1000 / beatMs / 4) + 1

    const lyric = this.flatLyrics[this.currentLine]
    const chord = lyric?.chord ?? this.song.chords[0] ?? 'G'

    return {
      playing: this.playing,
      positionSec: currentSec,
      beat: beatInMeasure,
      measure,
      section: this.currentSection,
      currentChord: chord,
      currentLine: this.currentLine,
    }
  }

  /** Get the flat lyric list (for external lyric rendering). */
  getFlatLyrics() {
    return this.flatLyrics
  }

  /** Get the total duration estimate. */
  getDuration(): number {
    const lastLyric = this.flatLyrics[this.flatLyrics.length - 1]
    return lastLyric ? lastLyric.time + 8 : 0
  }

  /** Check if we've passed the end of the song. */
  isFinished(): boolean {
    const state = this.getState()
    return state.positionSec >= this.getDuration() && this.flatLyrics.length > 0
  }

  private tick() {
    const currentSec = this.positionAtStart + (performance.now() - this.startedAt) / 1000
    this.positionSec = currentSec
    this.updateFromPosition()

    const state = this.getState()
    eventBus.emit('transport:tick', state)

    // Auto-stop after song ends
    if (this.isFinished()) {
      this.pause()
    }
  }

  private updateFromPosition() {
    const currentSec = this.playing
      ? this.positionAtStart + (performance.now() - this.startedAt) / 1000
      : this.positionSec

    // Update current line based on timestamps
    let newLine = 0
    for (let i = 0; i < this.flatLyrics.length; i++) {
      if (this.flatLyrics[i].time <= currentSec) {
        newLine = i
      } else {
        break
      }
    }

    if (newLine !== this.currentLine) {
      const prevLine = this.currentLine
      this.currentLine = newLine

      const lyric = this.flatLyrics[newLine]
      if (lyric) {
        eventBus.emit('lyrics:line-change', {
          lineIndex: newLine,
          text: lyric.text,
          chord: lyric.chord,
        })
      }

      // Check for section change
      if (lyric && lyric.section !== this.currentSection) {
        this.currentSection = lyric.section
        eventBus.emit('lyrics:section-change', this.currentSection)
      }
    }
  }

  /** Dispose and clean up intervals. */
  dispose() {
    this.stop()
    eventBus.clear()
  }
}
