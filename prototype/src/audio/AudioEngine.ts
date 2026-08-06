/**
 * Lightweight prototype guitar renderer.
 *
 * The production website has the full sample-first engine in
 * website/src/utils/guitarSound.ts. This demo keeps the same important
 * behavior locally: corrected open voicings, a cached Karplus-Strong string
 * model, per-string strum timing, pick variation, body EQ, and stereo spread.
 */

type Voicing = (string | null)[]

const CHORD_VOICINGS: Record<string, Voicing> = {
  Em: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  Am: [null, 'A2', 'E3', 'A3', 'C4', 'E4'],
  G: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  C: [null, 'C3', 'E3', 'G3', 'C4', 'E4'],
  D: [null, null, 'D3', 'A3', 'D4', 'F#4'],
  F: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  E: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  A: [null, 'A2', 'E3', 'A3', 'C#4', 'E4'],
  Dm: [null, null, 'D3', 'A3', 'D4', 'F4'],
  B7: [null, 'B2', 'D#3', 'A3', 'B3', 'F#4'],
  G7: ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'],
  C7: [null, 'C3', 'E3', 'A#3', 'C4', 'E4'],
}

const PITCH_OFFSETS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

function noteFrequency(note: string) {
  const match = note.match(/^([A-Ga-g])([#b]?)(-?\d+)$/)
  if (!match) return null
  const pitch = `${match[1].toUpperCase()}${match[2]}`
  const octave = Number(match[3])
  const offset = PITCH_OFFSETS[pitch]
  if (offset === undefined || !Number.isFinite(octave)) return null
  const midi = (octave + 1) * 12 + offset
  return 440 * Math.pow(2, (midi - 69) / 12)
}

const STRING_GAIN = [0.27, 0.30, 0.35, 0.39, 0.36, 0.32]
const STRING_BRIGHTNESS = [1400, 2500, 5400, 8000, 12000, 16000]
const STRING_ATTACK = [0.010, 0.008, 0.006, 0.0045, 0.003, 0.002]
const STRING_DECAY = [3.0, 2.7, 2.3, 2.0, 1.8, 1.6]
const STRING_PAN = [-0.34, -0.19, -0.04, 0.14, 0.29, 0.40]

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function createKarplusStrongBuffer(ctx: AudioContext, frequency: number) {
  const sampleRate = ctx.sampleRate
  const period = Math.max(2, Math.round(sampleRate / frequency))
  const length = Math.floor(sampleRate * 3.4)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  const delayLine = new Float32Array(period)

  for (let i = 0; i < period; i += 1) {
    const position = i / Math.max(1, period - 1)
    delayLine[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * position)
      + Math.sin(Math.PI * 2 * position) * 0.10
  }

  const damping = Math.pow(0.001, 1 / Math.max(1, frequency * 2.7))
  let lowPassed = 0
  let peak = 0

  for (let i = 0; i < length; i += 1) {
    const index = i % period
    const current = delayLine[index]
    const next = delayLine[(index + 1) % period]
    const average = (current + next) * 0.5
    lowPassed = lowPassed * 0.18 + average * 0.82
    delayLine[index] = lowPassed * damping
    data[i] = current * 0.52 + lowPassed * 0.48
    peak = Math.max(peak, Math.abs(data[i]))
  }

  if (peak > 0.0001) {
    const scale = Math.min(1.25, 0.82 / peak)
    for (let i = 0; i < length; i += 1) data[i] *= scale
  }

  return buffer
}

function getNoiseBuffer(ctx: AudioContext) {
  const length = Math.floor(ctx.sampleRate * 0.06)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / length)
  }
  return buffer
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private currentChord = ''
  private activeSources: AudioBufferSourceNode[] = []
  private buffers = new Map<string, AudioBuffer>()

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      return
    }

    const AudioContextConstructor = window.AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextConstructor) return

    this.ctx = new AudioContextConstructor({ latencyHint: 'interactive' })
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.42

    const compressor = this.ctx.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.knee.value = 12
    compressor.ratio.value = 3
    compressor.attack.value = 0.006
    compressor.release.value = 0.18

    this.masterGain.connect(compressor)
    compressor.connect(this.ctx.destination)

    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  private playString(note: string, volume: number, stringIndex: number, delaySec: number) {
    if (!this.ctx || !this.masterGain) return
    const frequency = noteFrequency(note)
    if (!frequency) return

    let buffer = this.buffers.get(note)
    if (!buffer) {
      buffer = createKarplusStrongBuffer(this.ctx, frequency)
      this.buffers.set(note, buffer)
    }

    const ctx = this.ctx
    const now = ctx.currentTime + Math.max(0, delaySec)
    const si = Math.max(0, Math.min(5, Math.round(stringIndex)))
    const pitch = Math.pow(2, randomBetween(-2.5, 2.5) / 1200)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.playbackRate.setValueAtTime(pitch, now)

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = STRING_BRIGHTNESS[si] * randomBetween(0.96, 1.04)
    lowpass.Q.value = 0.45

    const body = ctx.createBiquadFilter()
    body.type = 'peaking'
    body.frequency.value = si < 2 ? 125 : 1850
    body.Q.value = 1.1
    body.gain.value = si < 2 ? 3.8 : 1.5

    const envelope = ctx.createGain()
    const peak = Math.max(0.0001, volume * randomBetween(0.93, 1.07))
    const attack = STRING_ATTACK[si] * randomBetween(0.86, 1.16)
    const decay = STRING_DECAY[si]
    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.linearRampToValueAtTime(peak, now + attack)
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.42), now + 0.075)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + decay)

    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    pan?.pan.setValueAtTime(STRING_PAN[si] + randomBetween(-0.02, 0.02), now)

    source.connect(lowpass)
    lowpass.connect(body)
    body.connect(envelope)
    const output: AudioNode = pan ? (envelope.connect(pan), pan) : envelope
    output.connect(this.masterGain)

    // A short pick transient stops the physical model from sounding like a
    // pure, static tone when the same chord is held.
    const noise = ctx.createBufferSource()
    noise.buffer = getNoiseBuffer(ctx)
    const pickFilter = ctx.createBiquadFilter()
    pickFilter.type = 'bandpass'
    pickFilter.frequency.value = 1900 + si * 600
    pickFilter.Q.value = 0.75
    const pickGain = ctx.createGain()
    pickGain.gain.setValueAtTime(0.0001, now)
    pickGain.gain.linearRampToValueAtTime(peak * 0.035, now + 0.001)
    pickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)
    noise.connect(pickFilter)
    pickFilter.connect(pickGain)
    pickGain.connect(this.masterGain)

    source.start(now)
    source.stop(now + Math.min(decay + 0.08, buffer.duration / pitch + 0.04))
    noise.start(now)
    noise.stop(now + 0.04)
    this.activeSources.push(source, noise)
  }

  playChord(chordName: string, velocity = 1.0) {
    if (!this.ctx || !this.masterGain) return
    if (chordName === this.currentChord) return

    this.stopCurrentChord()
    const voicing = CHORD_VOICINGS[chordName]
    if (!voicing) return
    this.currentChord = chordName

    let hit = 0
    voicing.forEach((note, stringIndex) => {
      if (!note) return
      const delay = Math.max(0, (hit * 10 + randomBetween(-1.2, 1.2)) / 1000)
      this.playString(note, velocity * STRING_GAIN[stringIndex], stringIndex, delay)
      hit += 1
    })
  }

  stopCurrentChord() {
    const stopAt = (this.ctx?.currentTime ?? 0) + 0.04
    this.activeSources.forEach(source => {
      try { source.stop(stopAt) } catch { /* source already ended */ }
    })
    this.activeSources = []
  }

  setVolume(volume: number) {
    if (!this.masterGain || !this.ctx) return
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), now, 0.015)
  }

  destroy() {
    this.stopCurrentChord()
    void this.ctx?.close()
    this.ctx = null
    this.masterGain = null
    this.buffers.clear()
    this.currentChord = ''
  }
}
