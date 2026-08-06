// ── AirChord Performance Engine ───────────────────────────────────────────────
//
// The Performance Engine is the conductor. It sits between gesture input and
// all output subsystems:
//
//   Gesture
//     ↓
//   Performance Engine (conductor)
//     ↓
//   Timeline → Guitarist → Audio → Recording → UI
//
// It coordinates the TransportEngine, GuitaristEngine (via VoicingResolver +
// StrummingEngine), and emits events for all other subsystems to consume.

import { eventBus } from './EventBus'
import { TransportEngine } from './TransportEngine'
import { VoicingResolver } from '../engines/GuitaristEngine/VoicingResolver'
import { StrummingEngine } from '../engines/GuitaristEngine/StrummingEngine'
import type { Song, PlayStyle, TransportState } from './types'

export class PerformanceEngine {
  private transport: TransportEngine
  private voicingResolver: VoicingResolver
  private strummingEngine: StrummingEngine
  private style: PlayStyle
  private beatTimer: number | null = null
  private beatIndex = -1
  private strumPattern: string[]
  private fingerMapping: string[]
  private detectedChord = 'G'
  private lastBeatAt = 0

  constructor(
    song: Song,
    bpm: number,
    strumPattern: string[],
    fingerMapping: string[],
    style: PlayStyle = 'pop',
  ) {
    this.transport = new TransportEngine(song, bpm)
    this.voicingResolver = new VoicingResolver(style)
    this.strummingEngine = new StrummingEngine()
    this.style = style
    this.strumPattern = strumPattern.length > 0 ? strumPattern : ['D']
    this.fingerMapping = fingerMapping

    // Subscribe to gesture events to track current chord
    eventBus.on('gesture:detected', (result) => {
      this.detectedChord = result.chord
      eventBus.emit('audio:chord-change', result.chord)
    })
  }

  /** Start the full performance. */
  start() {
    this.transport.start()
    this.startBeatEngine()
    eventBus.emit('transport:start')
  }

  /** Pause transport and beat engine. */
  pause() {
    this.transport.pause()
    this.stopBeatEngine()
    eventBus.emit('transport:pause')
  }

  /** Stop and reset everything. */
  stop() {
    this.transport.stop()
    this.stopBeatEngine()
    this.beatIndex = -1
    this.voicingResolver.reset()
    eventBus.emit('transport:stop')
  }

  /** Reset transport to zero and restart. */
  restart() {
    this.stop()
    this.voicingResolver.reset()
    this.beatIndex = -1
  }

  /** Get current transport state. */
  getState(): TransportState {
    return this.transport.getState()
  }

  /** Get the transport engine for direct access if needed. */
  getTransport(): TransportEngine {
    return this.transport
  }

  /** Update the detected chord (called from gesture controller). */
  setDetectedChord(chord: string) {
    this.detectedChord = chord
  }

  /** Get the current chord being played. */
  getDetectedChord(): string {
    return this.detectedChord
  }

  /** Resolve a chord from finger count using the finger mapping. */
  resolveChordFromFingers(fingerCount: number): string {
    return this.fingerMapping[Math.min(5, Math.max(0, fingerCount))]
      || this.fingerMapping[0]
      || 'G'
  }

  private startBeatEngine() {
    this.stopBeatEngine()
    const bpm = this.transport['bpm'] || 60
    const beatMs = Math.round(60000 / bpm)

    // Play first beat immediately
    this.playNextBeat()

    // Drift-corrected scheduler
    let nextBeatAt = performance.now() + beatMs
    const schedule = () => {
      const now = performance.now()
      if (now > nextBeatAt + beatMs) nextBeatAt = now
      this.playNextBeat()
      nextBeatAt += beatMs
      this.beatTimer = window.setTimeout(schedule, Math.max(0, nextBeatAt - performance.now()))
    }
    this.beatTimer = window.setTimeout(schedule, beatMs)
  }

  private stopBeatEngine() {
    if (this.beatTimer !== null) {
      clearTimeout(this.beatTimer)
      this.beatTimer = null
    }
  }

  private playNextBeat() {
    const patterns = this.strumPattern
    this.beatIndex = (this.beatIndex + 1) % patterns.length

    const stroke = patterns[this.beatIndex]
    const chordName = this.detectedChord || 'Em'
    const state = this.transport.getState()

    // Emit beat event for UI (metronome LEDs)
    eventBus.emit('audio:beat', {
      stroke,
      chord: chordName,
      beatIdx: this.beatIndex,
      section: state.section,
    })

    // Resolve voicing and play through strumming engine
    const voicing = this.voicingResolver.resolve(chordName, this.beatIndex, state.section)
    if (voicing && stroke && stroke !== '.' && stroke !== '•') {
      this.strummingEngine.play(stroke, voicing, this.beatIndex, state.section, 0.35)
    }

    this.lastBeatAt = performance.now()
  }

  /** Dispose all resources. */
  dispose() {
    this.stop()
    this.transport.dispose()
  }
}
