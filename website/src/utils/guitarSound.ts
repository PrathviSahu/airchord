// AirChord guitar audio engine
//
// The engine is deliberately sample-first, with a physical-model fallback. The
// public API stays small so gesture, practice, and live-performance code do not
// need to know how a string is rendered.
//
// A browser cannot manufacture a licensed studio recording. When the optional
// SoundFont notes are available we use them; while they load (or when the user
// is offline) we use a humanized Karplus-Strong string model. Both paths share
// the same strum timing, pick transient, body EQ, reverb, and capture bus.

export type GuitarType = 'steel' | 'nylon' | 'electric' | '12string'
export type EngineMode = 'sampled' | 'nylon' | 'synth'

// Six strings in guitar order: [low E, A, D, G, B, high e]. null is muted.
export type GuitarVoicing = (string | null)[]

export interface IGuitarEngine {
  id: string
  name: string
  playPluckNote(note: string, volume: number, stringIndex: number, delaySec?: number): void
  playDownStrum(voicing: GuitarVoicing, volume: number): void
  playUpStrum(voicing: GuitarVoicing, volume: number): void
  playMuteStrum(voicing: GuitarVoicing, volume: number): void
}

let currentEngineMode: EngineMode = 'sampled'
let currentGuitarType: GuitarType = 'steel'
let currentCapoFret = 0
let audioCtx: AudioContext | null = null
let lastPlayedChord = ''
let isStrummingEnabled = true
let audioMuted = false

// ── Shared output bus ────────────────────────────────────────────────────────

let masterBuilt = false
let masterOut: GainNode | null = null
let compressor: DynamicsCompressorNode | null = null
let limiter: DynamicsCompressorNode | null = null
let reverbConv: ConvolverNode | null = null
let dryBus: GainNode | null = null
let wetBus: GainNode | null = null
let recordingDestination: MediaStreamAudioDestinationNode | null = null
let microphoneSource: MediaStreamAudioSourceNode | null = null
let microphoneGain: GainNode | null = null

const MASTER_LEVEL = 0.82

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildReverbImpulse(ctx: AudioContext) {
  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * 0.9)
  const impulse = ctx.createBuffer(2, length, sampleRate)
  const earlyReflections = [0.013, 0.027, 0.043, 0.071, 0.11]

  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i += 1) {
      const time = i / sampleRate
      const tail = (Math.random() * 2 - 1) * Math.pow(1 - time / 0.9, 3.4) * 0.24
      const early = earlyReflections.some(reflection => Math.abs(time - reflection) < 1 / sampleRate)
        ? (channel === 0 ? 0.24 : 0.20)
        : 0
      data[i] = tail + early
    }
    data[0] += channel === 0 ? 0.78 : 0.72
  }

  return impulse
}

function buildMaster(ctx: AudioContext) {
  if (masterBuilt && audioCtx === ctx && masterOut) return

  // The current app only creates one context, but resetting these references
  // makes hot reload and a future explicit reset safe.
  masterBuilt = false
  audioCtx = ctx

  reverbConv = ctx.createConvolver()
  reverbConv.buffer = buildReverbImpulse(ctx)

  // Leave sensible headroom. The previous 1.85x output gain made ordinary
  // six-string chords hit the limiter on every beat, which sounded crushed.
  dryBus = ctx.createGain()
  dryBus.gain.value = 0.86
  wetBus = ctx.createGain()
  wetBus.gain.value = 0.12

  compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -18
  compressor.knee.value = 12
  compressor.ratio.value = 3
  compressor.attack.value = 0.006
  compressor.release.value = 0.18

  limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -2.5
  limiter.knee.value = 0
  limiter.ratio.value = 20
  limiter.attack.value = 0.001
  limiter.release.value = 0.06

  masterOut = ctx.createGain()
  masterOut.gain.value = audioMuted ? 0 : MASTER_LEVEL

  // A separate destination lets MediaRecorder capture the guitar (and, when
  // requested by a screen, the microphone) rather than only the camera stream.
  recordingDestination = ctx.createMediaStreamDestination()

  dryBus.connect(compressor)
  wetBus.connect(reverbConv)
  reverbConv.connect(compressor)
  compressor.connect(limiter)
  limiter.connect(masterOut)
  masterOut.connect(ctx.destination)
  masterOut.connect(recordingDestination)
  masterBuilt = true
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (audioCtx?.state === 'closed') {
    // Browsers can close an AudioContext after a device change or a hot reload.
    // Do not keep routing new voices into the dead graph.
    audioCtx = null
    masterBuilt = false
    masterOut = null
    compressor = null
    limiter = null
    reverbConv = null
    dryBus = null
    wetBus = null
    recordingDestination = null
    disconnectMicrophoneFromRecording()
    lastPlayedChord = ''
  }

  if (!audioCtx) {
    const AudioContextConstructor = window.AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AudioContextConstructor) audioCtx = new AudioContextConstructor()
  }

  if (audioCtx?.state === 'suspended') {
    void audioCtx.resume().catch(() => undefined)
  }

  return audioCtx
}

export function initAudioEngine(): AudioContext | null {
  const ctx = getAudioContext()
  if (!ctx) return null
  buildMaster(ctx)
  void preloadCommonSamples(ctx)
  return ctx
}

export function setAudioMuted(muted: boolean) {
  audioMuted = muted
  if (!masterOut || !audioCtx) return
  const now = audioCtx.currentTime
  masterOut.gain.cancelScheduledValues(now)
  masterOut.gain.setTargetAtTime(muted ? 0 : MASTER_LEVEL, now, 0.015)
}

export function isAudioMuted() {
  return audioMuted
}

export function setStrummingEnabled(enabled: boolean) {
  isStrummingEnabled = enabled
  if (enabled) initAudioEngine()
}

export function isStrummingActive() {
  return isStrummingEnabled
}

export function toggleStrumming() {
  setStrummingEnabled(!isStrummingEnabled)
  return isStrummingEnabled
}

// ── Recording mix bus ────────────────────────────────────────────────────────

/** The mixed guitar output used by MediaRecorder. */
export function getAudioCaptureStream(): MediaStream | null {
  initAudioEngine()
  return recordingDestination?.stream ?? null
}

/**
 * Mix the microphone into the recording-only bus. It is intentionally not
 * connected to the speaker output, avoiding feedback while still recording
 * voice + guitar together.
 */
export function connectMicrophoneToRecording(stream: MediaStream | null): boolean {
  const ctx = initAudioEngine()
  if (!ctx || !recordingDestination || !stream || stream.getAudioTracks().length === 0) {
    disconnectMicrophoneFromRecording()
    return false
  }

  disconnectMicrophoneFromRecording()
  const audioOnlyStream = new MediaStream(stream.getAudioTracks())
  microphoneSource = ctx.createMediaStreamSource(audioOnlyStream)
  microphoneGain = ctx.createGain()
  microphoneGain.gain.value = 0.82
  microphoneSource.connect(microphoneGain)
  microphoneGain.connect(recordingDestination)
  return true
}

export function disconnectMicrophoneFromRecording() {
  try { microphoneSource?.disconnect() } catch { /* already disconnected */ }
  try { microphoneGain?.disconnect() } catch { /* already disconnected */ }
  microphoneSource = null
  microphoneGain = null
}

/**
 * Build a recorder-friendly stream with the camera video tracks and one mixed
 * audio track. Falling back to the input microphone keeps this useful on
 * browsers without MediaStreamAudioDestinationNode.
 */
export function createPerformanceRecordingStream(input: MediaStream | null): MediaStream | null {
  if (!input) return null

  const output = new MediaStream()
  input.getVideoTracks().forEach(track => output.addTrack(track))

  connectMicrophoneToRecording(input)
  const guitarAudio = getAudioCaptureStream()?.getAudioTracks()[0]

  if (guitarAudio) {
    output.addTrack(guitarAudio)
  } else {
    input.getAudioTracks().forEach(track => output.addTrack(track))
  }

  return output.getTracks().length > 0 ? output : null
}

// ── Controls ────────────────────────────────────────────────────────────────

export function setCapoFret(fret: number) {
  currentCapoFret = clamp(Math.round(fret), 0, 12)
}

export function getCapoFret() {
  return currentCapoFret
}

export function setGuitarType(type: GuitarType) {
  currentGuitarType = type
}

export function getGuitarType() {
  return currentGuitarType
}

export function setEngineMode(mode: EngineMode) {
  currentEngineMode = mode
}

export function getEngineMode(): EngineMode {
  return currentEngineMode
}

// ── Pitch helpers ────────────────────────────────────────────────────────────

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const PITCH_OFFSETS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

function parseNote(note: string): { midi: number; canonical: string } | null {
  const match = note.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/)
  if (!match) return null

  const pitch = `${match[1].toUpperCase()}${match[2]}`
  const octave = Number(match[3])
  const offset = PITCH_OFFSETS[pitch]
  if (offset === undefined || !Number.isFinite(octave)) return null

  const midi = (octave + 1) * 12 + offset
  const pitchClass = PITCH_CLASSES[((midi % 12) + 12) % 12]
  return { midi, canonical: `${pitchClass}${octave}` }
}

function noteFrequency(note: string) {
  const parsed = parseNote(note)
  return parsed ? 440 * Math.pow(2, (parsed.midi - 69) / 12) : null
}

function canonicalNote(note: string) {
  return parseNote(note)?.canonical ?? null
}

// ── Humanization constants ──────────────────────────────────────────────────

// Values are intentionally lower than the old implementation. Six strings at
// the old gains routinely summed above 1.0 before compression.
const STRING_GAIN = [0.31, 0.35, 0.40, 0.44, 0.41, 0.37]
const STRING_BRIGHTNESS = [1450, 2600, 5600, 8200, 12000, 16000]
const STRING_ATTACK = [0.010, 0.008, 0.006, 0.0045, 0.0032, 0.0022]
const STRING_DECAY = [3.1, 2.8, 2.35, 2.05, 1.85, 1.65]
const STRING_PAN = [-0.34, -0.19, -0.04, 0.14, 0.29, 0.40]

const STRUM_DELAY_MS = { down: 10, up: 8 }

interface GuitarTone {
  bodyLow: number
  bodyMid: number
  bodyGain: number
  shelfGain: number
  damping: number
  pickNoise: number
  transient: number
}

const GUITAR_TONES: Record<GuitarType, GuitarTone> = {
  steel: {
    bodyLow: 125, bodyMid: 1850, bodyGain: 3.8, shelfGain: 1.2,
    damping: 0.82, pickNoise: 0.24, transient: 0.82,
  },
  nylon: {
    bodyLow: 105, bodyMid: 950, bodyGain: 4.5, shelfGain: -2.8,
    damping: 0.64, pickNoise: 0.10, transient: 0.66,
  },
  electric: {
    bodyLow: 560, bodyMid: 2600, bodyGain: 2.2, shelfGain: 2.0,
    damping: 0.90, pickNoise: 0.16, transient: 0.78,
  },
  '12string': {
    bodyLow: 140, bodyMid: 2050, bodyGain: 3.4, shelfGain: 1.8,
    damping: 0.78, pickNoise: 0.22, transient: 0.80,
  },
}

function capoRatio() {
  return Math.pow(2, currentCapoFret / 12)
}

function centsRatio(cents: number) {
  return Math.pow(2, cents / 1200)
}

// ── Physical-model buffers ──────────────────────────────────────────────────

// AudioBuffers are owned by their AudioContext. A global string-keyed cache
// would reuse an old-context buffer after hot reload or context recreation.
const modelBuffers = new WeakMap<AudioContext, Map<string, AudioBuffer>>()

/**
 * Render a plucked string once into an AudioBuffer. This is the classic
 * Karplus-Strong delay-line model: a noisy pick excitation circulates through
 * a short, damped string loop. Rendering the loop into a buffer keeps playback
 * cheap and stable on phones, unlike running one ScriptProcessor per string.
 */
function createKarplusStrongBuffer(
  ctx: AudioContext,
  frequency: number,
  type: GuitarType,
): AudioBuffer {
  const tone = GUITAR_TONES[type]
  const sampleRate = ctx.sampleRate
  const period = Math.max(2, Math.round(sampleRate / frequency))
  const duration = type === 'nylon' ? 3.0 : 3.6
  const length = Math.floor(sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  const delayLine = new Float32Array(period)

  // A shaped random excitation is more guitar-like than a full-period block of
  // white noise. The small harmonic component gives the body something musical
  // to resonate before the loop settles into its fundamentals.
  for (let i = 0; i < period; i += 1) {
    const position = i / Math.max(1, period - 1)
    const pickShape = Math.sin(Math.PI * position)
    const noise = (Math.random() * 2 - 1) * pickShape
    const harmonic = Math.sin(Math.PI * 2 * position) * 0.12
      + Math.sin(Math.PI * 3 * position) * 0.06
    delayLine[i] = noise * 0.86 + harmonic
  }

  // Damping is applied once per string cycle, not once per output sample.
  // That gives low strings a believable tail without making high notes ring
  // forever.
  const cycleDamping = Math.pow(0.001, 1 / Math.max(1, frequency * (type === 'nylon' ? 1.9 : 2.8)))
  let lowPassed = 0
  let peak = 0

  for (let i = 0; i < length; i += 1) {
    const index = i % period
    const current = delayLine[index]
    const next = delayLine[(index + 1) % period]
    const averaged = (current + next) * 0.5

    lowPassed = lowPassed * (1 - tone.damping) + averaged * tone.damping
    delayLine[index] = lowPassed * cycleDamping

    const output = current * 0.52 + lowPassed * 0.48
    data[i] = output
    peak = Math.max(peak, Math.abs(output))
  }

  // Normalize once so the same public volume behaves consistently for E2 and
  // high e strings.
  if (peak > 0.0001) {
    const scale = Math.min(1.25, 0.82 / peak)
    for (let i = 0; i < data.length; i += 1) data[i] *= scale
  }

  return buffer
}

function getModelBuffer(ctx: AudioContext, note: string, type: GuitarType) {
  const parsed = parseNote(note)
  if (!parsed) return null

  let contextBuffers = modelBuffers.get(ctx)
  if (!contextBuffers) {
    contextBuffers = new Map<string, AudioBuffer>()
    modelBuffers.set(ctx, contextBuffers)
  }

  const key = `${type}:${parsed.canonical}`
  const cached = contextBuffers.get(key)
  if (cached) return cached

  const buffer = createKarplusStrongBuffer(ctx, noteFrequency(note)!, type)
  contextBuffers.set(key, buffer)
  return buffer
}

// ── Pick and mute transients ─────────────────────────────────────────────────

const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>()

function getNoiseBuffer(ctx: AudioContext) {
  const existing = noiseBuffers.get(ctx)
  if (existing) return existing

  const length = Math.floor(ctx.sampleRate * 0.08)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    const envelope = Math.sin(Math.PI * i / length)
    data[i] = (Math.random() * 2 - 1) * envelope
  }
  noiseBuffers.set(ctx, buffer)
  return buffer
}

function playPickTransient(ctx: AudioContext, now: number, volume: number, stringIndex: number, tone: GuitarTone) {
  if (!dryBus || tone.pickNoise <= 0) return

  const source = ctx.createBufferSource()
  source.buffer = getNoiseBuffer(ctx)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1800 + stringIndex * 680
  band.Q.value = 0.75
  const gain = ctx.createGain()
  const peak = Math.max(0.0001, volume * tone.pickNoise * 0.20)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(peak, now + 0.0015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038)
  source.connect(band)
  band.connect(gain)
  gain.connect(dryBus)
  source.start(now)
  source.stop(now + 0.045)
}

function playMutedHit(ctx: AudioContext, now: number, volume: number, stringIndex: number) {
  if (!dryBus) return

  const source = ctx.createBufferSource()
  source.buffer = getNoiseBuffer(ctx)
  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 700 + stringIndex * 180
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1700 + stringIndex * 420
  band.Q.value = 0.65
  const gain = ctx.createGain()
  const peak = Math.max(0.0001, volume * 0.85)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(peak, now + 0.001)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.052)
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
  pan?.pan.setValueAtTime(STRING_PAN[stringIndex], now)

  source.connect(highpass)
  highpass.connect(band)
  band.connect(gain)
  const output: AudioNode = pan ? (gain.connect(pan), pan) : gain
  output.connect(dryBus)
  source.start(now)
  source.stop(now + 0.06)
}

// ── Voice playback ───────────────────────────────────────────────────────────

interface BufferVoiceOptions {
  playbackRate: number
  duration: number
  transientScale: number
  includePick: boolean
}

function playBufferVoice(
  ctx: AudioContext,
  buffer: AudioBuffer,
  volume: number,
  stringIndex: number,
  delaySec: number,
  options: BufferVoiceOptions,
) {
  if (!dryBus || !wetBus || !masterOut) return

  const si = clamp(Math.round(stringIndex), 0, 5)
  const tone = GUITAR_TONES[currentGuitarType]
  const now = ctx.currentTime + Math.max(0, delaySec)
  const playbackRate = Math.max(0.05, options.playbackRate * centsRatio(randomBetween(-2.6, 2.6)))
  const requestedDecay = clamp(options.duration, 0.16, 5.0)
  const sourceDuration = buffer.duration / playbackRate
  // Capo/pitch playback shortens the buffer. Keep the envelope and source
  // lifetime aligned so a high capo cannot leave an envelope ramping after the
  // AudioBufferSourceNode has already stopped.
  const decay = Math.min(requestedDecay, Math.max(0.16, sourceDuration - 0.04))
  const peak = clamp(volume * randomBetween(0.93, 1.07), 0.0001, 0.95)

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.playbackRate.setValueAtTime(playbackRate, now)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = Math.min(ctx.sampleRate * 0.45, STRING_BRIGHTNESS[si] * randomBetween(0.96, 1.04))
  lowpass.Q.value = 0.45

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = si >= 2 ? 72 : 34
  highpass.Q.value = 0.55

  const bodyLow = ctx.createBiquadFilter()
  bodyLow.type = 'peaking'
  bodyLow.frequency.value = tone.bodyLow
  bodyLow.Q.value = 1.05
  bodyLow.gain.value = si <= 1 ? tone.bodyGain : tone.bodyGain * 0.28

  const bodyMid = ctx.createBiquadFilter()
  bodyMid.type = 'peaking'
  bodyMid.frequency.value = tone.bodyMid
  bodyMid.Q.value = 1.15
  bodyMid.gain.value = 1.4 + Math.random() * 0.8

  const shelf = ctx.createBiquadFilter()
  shelf.type = 'highshelf'
  shelf.frequency.value = 3600
  shelf.gain.value = tone.shelfGain + randomBetween(-0.45, 0.45)

  const envelope = ctx.createGain()
  const attack = STRING_ATTACK[si] * randomBetween(0.86, 1.16)
  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.linearRampToValueAtTime(peak, now + attack)
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.42), now + 0.075)
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + decay)

  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
  pan?.pan.setValueAtTime(clamp(STRING_PAN[si] + randomBetween(-0.025, 0.025), -0.8, 0.8), now)

  source.connect(lowpass)
  lowpass.connect(highpass)
  highpass.connect(bodyLow)
  bodyLow.connect(bodyMid)
  bodyMid.connect(shelf)
  shelf.connect(envelope)
  const output: AudioNode = pan ? (envelope.connect(pan), pan) : envelope
  output.connect(dryBus)
  output.connect(wetBus)

  if (options.includePick) {
    playPickTransient(ctx, now, peak * options.transientScale * tone.transient, si, tone)
  }

  source.start(now)
  source.stop(now + Math.min(decay + 0.08, Math.max(0.12, sourceDuration + 0.04)))
}

// ── Strum scheduling ─────────────────────────────────────────────────────────

function scheduleStrum(
  voicing: GuitarVoicing,
  volume: number,
  direction: 'down' | 'up',
  playFn: (note: string, volume: number, stringIndex: number, delaySec: number) => void,
) {
  if (!voicing || voicing.length === 0 || !isStrummingEnabled) return

  const order = direction === 'down' ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0]
  const baseDelay = STRUM_DELAY_MS[direction]
  let hit = 0

  order.forEach(stringIndex => {
    const note = voicing[stringIndex]
    if (!note) return

    // A real hand is not a clock: timing, pick force, and pick angle all move
    // a little. The jitter is kept below the inter-string gap so the stroke
    // direction remains audible rather than turning into a flam.
    const jitterMs = randomBetween(-1.2, 1.2)
    const delaySec = Math.max(0, (hit * baseDelay + jitterMs) / 1000)
    const directionScale = direction === 'down' ? 1 : 0.82
    const force = volume * STRING_GAIN[stringIndex]
      * randomBetween(0.91, 1.09) * directionScale
    playFn(note, force, stringIndex, delaySec)
    hit += 1
  })
}

// ── Physical model engine ────────────────────────────────────────────────────

class PhysicalGuitarEngine implements IGuitarEngine {
  id = 'physical'
  name = 'Humanized Physical Model'

  playPluckNote(note = 'E4', volume = 0.22, stringIndex = 2, delaySec = 0) {
    if (!isStrummingEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    buildMaster(ctx)

    const parsed = parseNote(note)
    const canonical = parsed?.canonical ?? 'E4'
    const buffer = getModelBuffer(ctx, canonical, currentGuitarType)
    if (!buffer) return

    const si = clamp(Math.round(stringIndex), 0, 5)
    const rate = capoRatio()
    const duration = STRING_DECAY[si] * (currentGuitarType === 'nylon' ? 0.86 : 1)
    playBufferVoice(ctx, buffer, volume, si, delaySec, {
      playbackRate: rate,
      duration,
      transientScale: 1,
      includePick: true,
    })

    // A 12-string course is a quiet, slightly late octave/unison companion.
    // It is deliberately subtle; the main string must remain the center image.
    if (currentGuitarType === '12string' && si <= 3) {
      playBufferVoice(ctx, buffer, volume * 0.16, si, delaySec + randomBetween(0.006, 0.013), {
        playbackRate: rate * 2,
        duration: duration * 0.72,
        transientScale: 0.35,
        includePick: false,
      })
    }
  }

  playDownStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, 'down', (note, force, index, delay) => {
      this.playPluckNote(note, force, index, delay)
    })
  }

  playUpStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, 'up', (note, force, index, delay) => {
      this.playPluckNote(note, force, index, delay)
    })
  }

  playMuteStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    buildMaster(ctx)

    let hit = 0
    voicing.forEach((note, stringIndex) => {
      if (!note || hit >= 6) return
      const now = ctx.currentTime + Math.max(0, (hit * 8 + randomBetween(-1, 1)) / 1000)
      playMutedHit(ctx, now, volume * STRING_GAIN[stringIndex], stringIndex)
      hit += 1
    })
  }
}

// ── Optional SoundFont sample engine ─────────────────────────────────────────

const DEFAULT_SAMPLE_BASE_URL = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/'
let sampleBaseUrl = DEFAULT_SAMPLE_BASE_URL
const COMMON_SAMPLE_NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4', 'C3', 'F#4']
const sampleCache = new Map<string, AudioBuffer>()
const sampleRequests = new Map<string, Promise<AudioBuffer | null>>()
const unavailableSamples = new Set<string>()
let sampleContext: AudioContext | null = null
let sampleGeneration = 0
let samplePreloadPromise: Promise<void> | null = null

function sampleUrl(note: string) {
  return `${sampleBaseUrl}${note.replace('#', 's')}.mp3`
}

/**
 * Point the sample engine at a local/licensed note set. Files should use the
 * same names as the fallback SoundFont (`E2.mp3`, `Fs2.mp3`, etc.). Passing a
 * local URL here is the path to turn the optional sample layer into a real,
 * bundled multi-sample library without changing the renderer.
 */
export function setGuitarSampleBaseUrl(baseUrl: string) {
  sampleBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  sampleGeneration += 1
  sampleCache.clear()
  sampleRequests.clear()
  unavailableSamples.clear()
  samplePreloadPromise = null
}

export function getGuitarSampleBaseUrl() {
  return sampleBaseUrl
}

async function loadSample(ctx: AudioContext, note: string): Promise<AudioBuffer | null> {
  const canonical = canonicalNote(note)
  if (!canonical) return null
  if (sampleContext !== ctx) {
    sampleContext = ctx
    sampleGeneration += 1
    sampleCache.clear()
    sampleRequests.clear()
    unavailableSamples.clear()
    samplePreloadPromise = null
  }

  const cached = sampleCache.get(canonical)
  if (cached) return cached
  // Do not retry a missing CDN file on every strum while offline. A page reload
  // (or a future explicit retry control) clears this set.
  if (unavailableSamples.has(canonical)) return null
  const pending = sampleRequests.get(canonical)
  if (pending) return pending

  const requestGeneration = sampleGeneration
  const request = (async () => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12000)
    try {
      const response = await fetch(sampleUrl(canonical), { mode: 'cors', signal: controller.signal })
      if (!response.ok) {
        if (requestGeneration === sampleGeneration) unavailableSamples.add(canonical)
        return null
      }
      const arrayBuffer = await response.arrayBuffer()
      const decoded = await ctx.decodeAudioData(arrayBuffer)
      if (requestGeneration !== sampleGeneration) return null
      sampleCache.set(canonical, decoded)
      return decoded
    } catch {
      if (requestGeneration === sampleGeneration) unavailableSamples.add(canonical)
      return null
    } finally {
      window.clearTimeout(timeout)
      if (requestGeneration === sampleGeneration) sampleRequests.delete(canonical)
    }
  })()

  sampleRequests.set(canonical, request)
  return request
}

async function preloadCommonSamples(ctx: AudioContext) {
  if (sampleContext === ctx && samplePreloadPromise) return samplePreloadPromise
  if (sampleContext !== ctx) {
    sampleContext = ctx
    sampleGeneration += 1
    sampleCache.clear()
    sampleRequests.clear()
    unavailableSamples.clear()
  }
  samplePreloadPromise = Promise.allSettled(COMMON_SAMPLE_NOTES.map(note => loadSample(ctx, note))).then(() => undefined)
  return samplePreloadPromise
}

class SampledGuitarEngine implements IGuitarEngine {
  id = 'sampled'
  name = 'Studio Acoustic (Sampled + Model Fallback)'
  private readonly fallback = new PhysicalGuitarEngine()

  playPluckNote(note = 'E4', volume = 0.22, stringIndex = 2, delaySec = 0) {
    if (!isStrummingEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    buildMaster(ctx)

    const canonical = canonicalNote(note) ?? 'E4'
    const sample = sampleCache.get(canonical)
    if (!sample) {
      // Do not make the first chord wait on the network. Play immediately with
      // the same physical model and use the sample on a later hit if loading
      // succeeds.
      void loadSample(ctx, canonical)
      this.fallback.playPluckNote(canonical, volume, stringIndex, delaySec)
      return
    }

    const si = clamp(Math.round(stringIndex), 0, 5)
    const rate = capoRatio()
    const duration = clamp(sample.duration / rate, 1.25, STRING_DECAY[si] + 0.8)
    playBufferVoice(ctx, sample, volume, si, delaySec, {
      playbackRate: rate,
      duration,
      transientScale: 0.25,
      includePick: true,
    })
  }

  playDownStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, 'down', (note, force, index, delay) => {
      this.playPluckNote(note, force, index, delay)
    })
  }

  playUpStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, 'up', (note, force, index, delay) => {
      this.playPluckNote(note, force, index, delay)
    })
  }

  playMuteStrum(voicing: GuitarVoicing, volume: number) {
    this.fallback.playMuteStrum(voicing, volume)
  }
}

const physicalEngine = new PhysicalGuitarEngine()
const sampledEngine = new SampledGuitarEngine()

function getActiveEngine(): IGuitarEngine {
  if (currentEngineMode === 'nylon') {
    currentGuitarType = 'nylon'
    return physicalEngine
  }
  if (currentEngineMode === 'sampled') {
    currentGuitarType = 'steel'
    return sampledEngine
  }
  currentGuitarType = 'steel'
  return physicalEngine
}

// ── Chord voicings ───────────────────────────────────────────────────────────

// Notes are canonicalized at playback time, so sharps and flats both work.
export const CHORD_NOTES: Record<string, GuitarVoicing> = {
  C: [null, 'C3', 'E3', 'G3', 'C4', 'E4'],
  D: [null, null, 'D3', 'A3', 'D4', 'F#4'],
  E: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  F: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  G: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  A: [null, 'A2', 'E3', 'A3', 'C#4', 'E4'],
  B: [null, 'B2', 'F#3', 'B3', 'D#4', 'F#4'],
  Cm: [null, 'C3', 'G3', 'C4', 'D#4', 'G4'],
  'C#m': [null, 'C#3', 'G#3', 'C#4', 'E4', 'G#4'],
  Dm: [null, null, 'D3', 'A3', 'D4', 'F4'],
  Em: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  Fm: ['F2', 'C3', 'F3', 'G#3', 'C4', 'F4'],
  Gm: ['G2', 'D3', 'G3', 'A#3', 'D4', 'G4'],
  Am: [null, 'A2', 'E3', 'A3', 'C4', 'E4'],
  Bm: [null, 'B2', 'F#3', 'B3', 'D4', 'F#4'],
  C7: [null, 'C3', 'E3', 'A#3', 'C4', 'E4'],
  D7: [null, null, 'D3', 'A3', 'C4', 'F#4'],
  E7: ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'],
  F7: ['F2', 'C3', 'D#3', 'A3', 'C4', 'F4'],
  G7: ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'],
  A7: [null, 'A2', 'E3', 'G3', 'C#4', 'E4'],
  B7: [null, 'B2', 'D#3', 'A3', 'B3', 'F#4'],
  'F#': ['F#2', 'C#3', 'F#3', 'A#3', 'C#4', 'F#4'],
  'F#m': ['F#2', 'C#3', 'F#3', 'A3', 'C#4', 'F#4'],
  'F#7': ['F#2', 'C#3', 'E3', 'A#3', 'C#4', 'F#4'],
  Bb: [null, 'A#2', 'F3', 'A#3', 'D4', 'F4'],
  Eb: [null, null, 'D#3', 'A#3', 'D#4', 'G4'],
  Ab: ['G#2', 'D#3', 'G#3', 'C4', 'D#4', 'G#4'],
  Am7: [null, 'A2', 'E3', 'G3', 'C4', 'E4'],
  Cadd9: [null, 'C3', 'E3', 'G3', 'D4', 'E4'],
  Gsus4: ['G2', 'B2', 'D3', 'G3', 'C4', 'G4'],
  Dsus2: [null, null, 'D3', 'A3', 'D4', 'E4'],
  Dsus4: [null, null, 'D3', 'A3', 'D4', 'G4'],
}

const DEFAULT_VOICING: GuitarVoicing = ['E2', 'B2', 'E3', 'G3', 'B3', 'E4']

function playFretScratchNoise(ctx: AudioContext) {
  if (!dryBus) return
  const now = ctx.currentTime
  const source = ctx.createBufferSource()
  source.buffer = getNoiseBuffer(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 4200
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(0.018, now + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(dryBus)
  source.start(now)
  source.stop(now + 0.04)
}

// ── Public playback API ──────────────────────────────────────────────────────

export function playPluckNote(note = 'E4', volume = 0.22, stringIndex = 2, delaySec = 0) {
  initAudioEngine()
  getActiveEngine().playPluckNote(note, volume, stringIndex, delaySec)
}

export function triggerGuitarChord(chordName = 'Em', volume = 0.32) {
  if (!isStrummingEnabled) return
  initAudioEngine()
  const ctx = getAudioContext()
  if (ctx && lastPlayedChord && lastPlayedChord !== chordName) playFretScratchNoise(ctx)
  lastPlayedChord = chordName
  const voicing = CHORD_NOTES[chordName] ?? DEFAULT_VOICING
  getActiveEngine().playDownStrum(voicing, volume)
}

export function playGuitarChord(chordName = 'Em', volume = 0.32) {
  triggerGuitarChord(chordName, volume)
}

const DEFAULT_EM: GuitarVoicing = ['E2', 'B2', 'E3', 'G3', 'B3', 'E4']

export function playStrum(voicing: GuitarVoicing = DEFAULT_EM, volume = 0.32) {
  initAudioEngine()
  getActiveEngine().playDownStrum(voicing, volume)
}

export function playDownStrum(voicing: GuitarVoicing = DEFAULT_EM, volume = 0.32) {
  initAudioEngine()
  getActiveEngine().playDownStrum(voicing, volume)
}

export function playUpStrum(voicing: GuitarVoicing = DEFAULT_EM, volume = 0.28) {
  initAudioEngine()
  getActiveEngine().playUpStrum(voicing, volume)
}

export function playMuteStrum(voicing: GuitarVoicing = DEFAULT_EM, volume = 0.12) {
  initAudioEngine()
  getActiveEngine().playMuteStrum(voicing, volume)
}

export function playPatternBeat(stroke: string, voicing: GuitarVoicing, volume = 0.32) {
  if (!isStrummingEnabled) return
  const normalized = stroke.toUpperCase()
  if (normalized === 'D' || normalized === '↓') playDownStrum(voicing, volume)
  else if (normalized === 'U' || normalized === '↑') playUpStrum(voicing, volume)
  else if (normalized === 'X' || normalized === '✕') playMuteStrum(voicing, volume)
}

// Unlock audio after a real user gesture. Creating the context before the
// gesture is allowed by browsers, but resuming it is not.
if (typeof window !== 'undefined') {
  const unlock = () => {
    initAudioEngine()
    window.removeEventListener('click', unlock)
    window.removeEventListener('keydown', unlock)
    window.removeEventListener('touchstart', unlock)
  }
  window.addEventListener('click', unlock, { passive: true })
  window.addEventListener('keydown', unlock, { passive: true })
  window.addEventListener('touchstart', unlock, { passive: true })
}
