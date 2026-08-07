// ── AirChord Performance Engine v2 ────────────────────────────────────────────
//
// The conductor. Full pipeline:
//
//   Gesture → Performance Engine → Song Timeline
//     ↓
//   Virtual Guitarist (musical decisions)
//     ↓
//   Humanizer (micro-timing, velocity, pitch variation)
//     ↓
//   Strumming Engine → Audio Output
//     ↓
//   Effects Chain (reverb, EQ, compression)
//
// The Performance Engine coordinates everything from a single clock.

import { eventBus } from './EventBus'
import { TransportEngine } from './TransportEngine'
import { VirtualGuitarist } from '../engines/VirtualGuitarist'
import { Humanizer } from '../engines/Humanizer/Humanizer'
import { FingerstyleEngine } from '../engines/Fingerstyle'
import { personalityFromCollections } from '../engines/VirtualGuitarist/personalities'
import type { Song, TransportState, PlayStyle, GuitaristPersonalityId, HumanizerPreset, EffectsPreset } from './types'

export class PerformanceEngine {
  private transport: TransportEngine
  private guitarist: VirtualGuitarist
  private humanizer: Humanizer
  private fingerstyleEngine: FingerstyleEngine
  private beatTimer: number | null = null
  private beatIndex = -1
  private strumPattern: string[]
  private fingerMapping: string[]
  private detectedChord = 'G'
  private currentSection = 'Verse'
  private isFingerstyleMode = false
  private effectsPreset: EffectsPreset = 'acoustic'

  constructor(
    song: Song,
    bpm: number,
    strumPattern: string[],
    fingerMapping: string[],
    personality?: GuitaristPersonalityId,
  ) {
    this.transport = new TransportEngine(song, bpm)

    // Virtual Guitarist — derive personality from song collections
    const personalityId = personality ?? this.derivePersonality(song.collections)
    this.guitarist = new VirtualGuitarist(personalityId)

    // Humanizer — natural feel by default
    this.humanizer = new Humanizer('natural')

    // Fingerstyle engine — separate from strumming
    this.fingerstyleEngine = new FingerstyleEngine('travis')

    this.strumPattern = strumPattern.length > 0 ? strumPattern : ['D']
    this.fingerMapping = fingerMapping

    // Subscribe to gesture events to track current chord
    eventBus.on('gesture:detected', (result) => {
      this.detectedChord = result.chord
      eventBus.emit('audio:chord-change', result.chord)
    })
  }

  /** Derive guitarist personality from song collection tags. */
  private derivePersonality(collections: string[]): GuitaristPersonalityId {
    if (collections.includes('Campfire')) return 'campfire'
    if (collections.includes('Worship')) return 'worship'
    if (collections.includes('Rock')) return 'rock'
    if (collections.includes('Indie')) return 'indie'
    if (collections.includes('Bollywood')) return 'bollywood'
    if (collections.includes('Romantic') || collections.includes('Ballad')) return 'worship'
    return 'pop'
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
    this.guitarist.reset()
    eventBus.emit('transport:stop')
  }

  /** Reset transport to zero and restart. */
  restart() {
    this.stop()
    this.guitarist.reset()
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

  /** Get the Virtual Guitarist for advanced configuration. */
  getGuitarist(): VirtualGuitarist {
    return this.guitarist
  }

  /** Get the Humanizer for adjusting feel. */
  getHumanizer(): Humanizer {
    return this.humanizer
  }

  /** Get the Fingerstyle engine. */
  getFingerstyleEngine(): FingerstyleEngine {
    return this.fingerstyleEngine
  }

  /** Switch guitarist personality at runtime. */
  setPersonality(personality: GuitaristPersonalityId) {
    this.guitarist.setPersonality(personality)
    // Update humanizer to match
    const humanizerMap: Record<string, HumanizerPreset> = {
      campfire: 'campfire',
      pop: 'natural',
      bollywood: 'natural',
      rock: 'tight',
      worship: 'loose',
      fingerstyle: 'studio',
      indie: 'natural',
    }
    this.humanizer.setPreset(humanizerMap[personality] ?? 'natural')
  }

  /** Switch humanizer preset. */
  setHumanizerPreset(preset: HumanizerPreset) {
    this.humanizer.setPreset(preset)
  }

  /** Switch effects preset. */
  setEffectsPreset(preset: EffectsPreset) {
    this.effectsPreset = preset
  }

  /** Toggle fingerstyle mode. */
  setFingerstyleMode(enabled: boolean, pattern?: string) {
    this.isFingerstyleMode = enabled
    if (pattern) this.fingerstyleEngine.setPattern(pattern)
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
    const bpm = (this.transport as any)['bpm'] || 60
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

    // ── Virtual Guitarist decides HOW to play ───────────────────────────
    const decision = this.guitarist.decideStroke(
      stroke,
      chordName,
      this.beatIndex,
      state.section,
      0.35,
    )

    // ── Humanizer adds micro-variation ──────────────────────────────────
    if (decision.stroke !== 'rest' && decision.voicing) {
      const humanized = this.humanizer.humanizeStrum(
        decision.voicing,
        decision.stroke === 'down' ? 'down' : 'up',
        decision.velocity,
        decision.includeFretNoise,
      )

      // The humanized strum is ready for the audio engine
      // In the current implementation, we pass through to the existing
      // StrummingEngine for actual audio output.
      // Future: connect directly to the Sample Engine.
    }

    // Emit beat event for UI (metronome LEDs)
    eventBus.emit('audio:beat', {
      stroke,
      chord: chordName,
      beatIdx: this.beatIndex,
      section: state.section,
    })
  }

  /** Dispose all resources. */
  dispose() {
    this.stop()
    this.transport.dispose()
  }
}
