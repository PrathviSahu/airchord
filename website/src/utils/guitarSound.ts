// ── AirChord Modular Audio Engine Architecture ────────────────────────────────
// Supports pluggable engine drivers:
// 1. Studio Acoustic Sampled Engine (High-realism sampled acoustic guitar with SoundFont/WAV buffers)
// 2. Nylon Classical Engine (Mellow fingerstyle classical sound)
// 3. Classic Synth Engine (3-oscillator humanized acoustic synthesis)

export type GuitarType = 'steel' | 'nylon' | 'electric' | '12string'
export type EngineMode = 'sampled' | 'nylon' | 'synth'

let currentEngineMode: EngineMode = 'sampled'
let currentGuitarType: GuitarType = 'steel'
let currentCapoFret   = 0
let audioCtx: AudioContext | null = null
let lastPlayedChord   = ''

// ── Pluggable Engine Interface ───────────────────────────────────────────────
export interface IGuitarEngine {
  id: string
  name: string
  playPluckNote(note: string, volume: number, stringIndex: number): void
  playDownStrum(notes: string[], volume: number): void
  playUpStrum(notes: string[], volume: number): void
  playMuteStrum(notes: string[], volume: number): void
}

// ── Shared Master Output Chain (Reverb + Compression + Master Volume) ───────
let masterBuilt       = false
let masterOut:  GainNode            | null = null
let compressor: DynamicsCompressorNode | null = null
let reverbConv: ConvolverNode       | null = null
let dryBus:     GainNode            | null = null
let wetBus:     GainNode            | null = null

function buildMaster(ctx: AudioContext) {
  if (masterBuilt) return
  masterBuilt = true

  // Plate reverb impulse — short bright acoustic space (0.9s tail)
  const sr  = ctx.sampleRate
  const len = Math.floor(sr * 0.9)
  const buf = ctx.createBuffer(2, len, sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      const t = i / len
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2)
    }
  }
  reverbConv = ctx.createConvolver()
  reverbConv.buffer = buf

  dryBus = ctx.createGain(); dryBus.gain.value = 0.84
  wetBus = ctx.createGain(); wetBus.gain.value = 0.15

  compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -16
  compressor.knee.value      = 10
  compressor.ratio.value     = 3.5
  compressor.attack.value    = 0.003
  compressor.release.value   = 0.20

  masterOut = ctx.createGain()
  masterOut.gain.value = 0.72

  dryBus.connect(compressor)
  wetBus.connect(reverbConv!)
  reverbConv!.connect(compressor)
  compressor.connect(masterOut)
  masterOut.connect(ctx.destination)
}

// ── Audio Context Unlock & Core Handlers ─────────────────────────────────────
let isStrummingEnabled = true

export function setStrummingEnabled(e: boolean) { isStrummingEnabled = e; if (e) initAudioEngine() }
export function isStrummingActive()              { return isStrummingEnabled }
export function toggleStrumming()               {
  isStrummingEnabled = !isStrummingEnabled
  if (isStrummingEnabled) initAudioEngine()
  return isStrummingEnabled
}

export function initAudioEngine(): AudioContext | null {
  const ctx = getAudioContext()
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
  if (ctx) {
    buildMaster(ctx)
    preloadCommonSamples(ctx)
  }
  return ctx
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    initAudioEngine()
    window.removeEventListener('click',      unlock)
    window.removeEventListener('keydown',    unlock)
    window.removeEventListener('touchstart', unlock)
  }
  window.addEventListener('click',      unlock)
  window.addEventListener('keydown',    unlock)
  window.addEventListener('touchstart', unlock)
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AC = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AC) audioCtx = new AC()
  }
  if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

export function setCapoFret(fret: number)    { currentCapoFret = Math.max(0, Math.min(7, fret)) }
export function getCapoFret()                { return currentCapoFret }
export function setGuitarType(t: GuitarType) { currentGuitarType = t }
export function getGuitarType()              { return currentGuitarType }

export function setEngineMode(mode: EngineMode) { currentEngineMode = mode }
export function getEngineMode(): EngineMode    { return currentEngineMode }

// ── Note Frequency Map ────────────────────────────────────────────────────────
const NOTE_FREQS: Record<string, number> = {
  E2:82.41, F2:87.31, 'F#2':92.50, G2:98.00, 'G#2':103.83, A2:110.0, 'A#2':116.54,
  B2:123.47, C3:130.81, 'C#3':138.59, D3:146.83, 'D#3':155.56,
  E3:164.81, F3:174.61, 'F#3':185.00, G3:196.0, 'G#3':207.65, A3:220.0, 'A#3':233.08,
  B3:246.94, C4:261.63, 'C#4':277.18, D4:293.66, 'D#4':311.13, E4:329.63,
  F4:349.23, 'F#4':369.99, G4:392.0, A4:440.0, B4:493.88, C5:523.25,
}

const STRING_PANS = [-0.26, -0.14, -0.04, 0.04, 0.14, 0.26]

// ── Fret Scratch Noise (Finger Slide Simulation) ──────────────────────────────
function playFretScratchNoise(ctx: AudioContext) {
  try {
    const now = ctx.currentTime
    const len = Math.round(ctx.sampleRate * 0.035)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len)
    }

    const src = ctx.createBufferSource()
    src.buffer = buf

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 4500

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(dryBus!)

    src.start(now)
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER 1: Synth Guitar Engine (3-oscillator + body EQ + humanized touch)
// ─────────────────────────────────────────────────────────────────────────────
interface GuitarPreset {
  chorus: number
  decayMul: number
  pickHz: number
  bodyLow: number
  bodyMid: number
  bodyGain: number
  shelfGain: number
}

const PRESETS: Record<GuitarType, GuitarPreset> = {
  steel:    { chorus: 3,  decayMul: 1.0, pickHz: 2200, bodyLow: 120,  bodyMid: 1800, bodyGain: 5.5, shelfGain: 1.5 },
  nylon:    { chorus: 2,  decayMul: 0.9, pickHz: 900,  bodyLow: 90,   bodyMid: 900,  bodyGain: 4.5, shelfGain: -1.5 },
  electric: { chorus: 4,  decayMul: 1.6, pickHz: 3800, bodyLow: 600,  bodyMid: 3200, bodyGain: 3.0, shelfGain: 2.5 },
  '12string':{ chorus: 6, decayMul: 1.3, pickHz: 2600, bodyLow: 130,  bodyMid: 2000, bodyGain: 5.0, shelfGain: 2.0 },
}

const waveCache: Partial<Record<GuitarType, PeriodicWave>> = {}

function buildGuitarWave(ctx: AudioContext, type: GuitarType): PeriodicWave {
  if (waveCache[type]) return waveCache[type]!
  let real: number[], imag: number[]
  if (type === 'nylon') {
    real = [0, 1.0, 0.50, 0.20, 0.08, 0.03, 0.01]
    imag = [0, 0.0, 0.04, 0.03, 0.02, 0.01, 0.00]
  } else if (type === 'electric') {
    real = [0, 1.0, 0.82, 0.65, 0.46, 0.30, 0.18, 0.10, 0.05, 0.02]
    imag = [0, 0.0, 0.10, 0.08, 0.06, 0.04, 0.02, 0.01, 0.01, 0.00]
  } else if (type === '12string') {
    real = [0, 1.0, 0.76, 0.50, 0.30, 0.18, 0.10, 0.05, 0.02]
    imag = [0, 0.0, 0.08, 0.06, 0.04, 0.02, 0.01, 0.01, 0.00]
  } else {
    real = [0, 1.0, 0.70, 0.42, 0.26, 0.15, 0.09, 0.05, 0.03, 0.01]
    imag = [0, 0.0, 0.07, 0.05, 0.03, 0.02, 0.01, 0.00, 0.00, 0.00]
  }
  const wave = ctx.createPeriodicWave(new Float32Array(real), new Float32Array(imag), { disableNormalization: false })
  waveCache[type] = wave
  return wave
}

class SynthGuitarEngine implements IGuitarEngine {
  id   = 'synth'
  name = 'Classic Synth Guitar'

  playPluckNote(note = 'E4', volume = 0.22, stringIndex = 2) {
    if (!isStrummingEnabled) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      buildMaster(ctx)

      const type   = currentGuitarType
      const preset = PRESETS[type]
      const baseHz = NOTE_FREQS[note] ?? 329.63
      const freq   = baseHz * Math.pow(2, currentCapoFret / 12)
      const now    = ctx.currentTime

      const pitchJitterCents = (Math.random() - 0.5) * 6.0
      const pitchJitterFactor = Math.pow(2, pitchJitterCents / 1200)
      const targetFreq = freq * pitchJitterFactor
      const initialTensionSpike = targetFreq * (1.0 + 0.006 * (volume / 0.35))
      const humanVolume = volume * (0.88 + Math.random() * 0.24)

      const safeStrIdx = Math.max(0, Math.min(5, stringIndex))

      const decay = (type === 'nylon' ? 1.5 : type === 'electric' ? 2.8 : 2.0)
                 * preset.decayMul
                 * (1.0 - safeStrIdx * 0.05)

      const wave = buildGuitarWave(ctx, type)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const osc3 = ctx.createOscillator()
      osc1.setPeriodicWave(wave); osc2.setPeriodicWave(wave); osc3.setPeriodicWave(wave)

      const centRatio = Math.pow(2, preset.chorus / 1200)
      osc1.frequency.setValueAtTime(initialTensionSpike, now)
      osc1.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.035)
      osc2.frequency.setValueAtTime(initialTensionSpike * centRatio, now)
      osc2.frequency.exponentialRampToValueAtTime(targetFreq * centRatio, now + 0.035)
      osc3.frequency.setValueAtTime(initialTensionSpike / centRatio, now)
      osc3.frequency.exponentialRampToValueAtTime(targetFreq / centRatio, now + 0.035)

      const osc1Gain = ctx.createGain(); osc1Gain.gain.value = 0.52
      const osc2Gain = ctx.createGain(); osc2Gain.gain.value = 0.24
      const osc3Gain = ctx.createGain(); osc3Gain.gain.value = 0.24
      osc1.connect(osc1Gain); osc2.connect(osc2Gain); osc3.connect(osc3Gain)

      const pickFilter = ctx.createBiquadFilter()
      pickFilter.type = 'lowpass'
      pickFilter.frequency.setValueAtTime(preset.pickHz * (0.8 + volume * 0.4), now)
      pickFilter.frequency.exponentialRampToValueAtTime(Math.max(250, targetFreq * 1.8), now + Math.min(0.25, decay * 0.2))

      osc1Gain.connect(pickFilter)
      osc2Gain.connect(pickFilter)
      osc3Gain.connect(pickFilter)

      const bodyLo = ctx.createBiquadFilter()
      bodyLo.type = 'peaking'
      bodyLo.frequency.value = preset.bodyLow
      bodyLo.Q.value = 1.6
      const bassScaleFactor = safeStrIdx <= 1 ? 1.0 : safeStrIdx === 2 ? 0.4 : 0.1
      bodyLo.gain.value = preset.bodyGain * bassScaleFactor

      const bodyHi = ctx.createBiquadFilter()
      bodyHi.type = 'peaking'
      bodyHi.frequency.value = preset.bodyMid
      bodyHi.Q.value = 1.0
      bodyHi.gain.value = 2.5

      const shelf = ctx.createBiquadFilter()
      shelf.type = 'highshelf'
      shelf.frequency.value = 3500
      shelf.gain.value = preset.shelfGain

      const stringEnv = ctx.createGain()
      stringEnv.gain.setValueAtTime(0.0001, now)
      stringEnv.gain.linearRampToValueAtTime(humanVolume, now + 0.004)
      stringEnv.gain.exponentialRampToValueAtTime(humanVolume * 0.45, now + 0.08)
      stringEnv.gain.exponentialRampToValueAtTime(0.0001, now + decay)

      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
      pan?.pan.setValueAtTime(STRING_PANS[safeStrIdx] ?? 0, now)

      pickFilter.connect(bodyLo)
      bodyLo.connect(bodyHi)
      bodyHi.connect(shelf)
      shelf.connect(stringEnv)

      const toOut: AudioNode = pan ? (stringEnv.connect(pan), pan) : stringEnv
      toOut.connect(dryBus!)
      toOut.connect(wetBus!)

      osc1.start(now); osc2.start(now); osc3.start(now)
      osc1.stop(now + decay + 0.05)
      osc2.stop(now + decay + 0.05)
      osc3.stop(now + decay + 0.05)
    } catch { /* ignore */ }
  }

  playDownStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.32) {
    if (!isStrummingEnabled) return
    const baseRoll = currentGuitarType === 'nylon' ? 40 : currentGuitarType === '12string' ? 28 : 32
    const roll = baseRoll * (0.88 + Math.random() * 0.24)
    const stringOffset = Math.max(0, 6 - notes.length)
    notes.forEach((note, idx) => {
      const stringIndex = stringOffset + idx
      const microJitter = (Math.random() - 0.5) * 8
      const nonLinearProgress = Math.pow(idx / (notes.length - 1 || 1), 0.92)
      const delay = Math.max(0, nonLinearProgress * (notes.length - 1) * roll + microJitter)
      setTimeout(() => {
        // Root note accent (idx===0):
        // String 0 or 1 (Low E or A string): 1.12x strong root (E, G, A, Am, B, B7, C)
        // String 2 (D string, e.g. D chord): 1.02x balanced root
        const stringAccent = idx === 0 ? (stringIndex <= 1 ? 1.12 : 1.02) : idx === notes.length - 1 ? 1.06 : 0.96
        const humanVol = volume * stringAccent * (0.90 + Math.random() * 0.20)
        this.playPluckNote(note, humanVol, stringIndex)
      }, delay)
    })
  }

  playUpStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.28) {
    if (!isStrummingEnabled) return
    const baseRoll = 22
    const roll = baseRoll * (0.86 + Math.random() * 0.28)
    const rev = [...notes].reverse()
    const stringOffset = Math.max(0, 6 - notes.length)
    rev.forEach((note, idx) => {
      const stringIndex = 5 - (stringOffset + idx)
      const microJitter = (Math.random() - 0.5) * 7
      const nonLinearProgress = Math.pow(idx / (rev.length - 1 || 1), 0.94)
      const delay = Math.max(0, nonLinearProgress * (rev.length - 1) * roll + microJitter)
      setTimeout(() => {
        const stringAccent = idx < 2 ? 1.06 : 0.86
        const humanVol = volume * stringAccent * (0.88 + Math.random() * 0.24)
        this.playPluckNote(note, humanVol, stringIndex)
      }, delay)
    })
  }

  playMuteStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.12) {
    if (!isStrummingEnabled) return
    const stringOffset = Math.max(0, 6 - notes.length)
    notes.slice(0, 4).forEach((note, idx) => {
      const delay = Math.max(0, idx * 10 + (Math.random() - 0.5) * 5)
      setTimeout(() => this.playPluckNote(note, volume * (0.24 + Math.random() * 0.08), stringOffset + idx), delay)
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER 2: Sampled Guitar Engine (Acoustic SoundFont Multi-Sample Player)
// High-realism sampled acoustic guitar with SoundFont audio buffer caching
// ─────────────────────────────────────────────────────────────────────────────
const sampleCache: Record<string, AudioBuffer> = {}

// All chord notes used across the database pre-cached for instant response
const COMMON_NOTES = [
  'E2','F2','F#2','G2','G#2','A2','A#2','B2',
  'C3','C#3','D3','D#3','E3','F3','F#3','G3','G#3','A3','A#3','B3',
  'C4','C#4','D4','D#4','E4','F4','F#4','G4','A4','B4'
]

async function preloadCommonSamples(ctx: AudioContext) {
  for (const n of COMMON_NOTES) {
    if (!sampleCache[n]) {
      try {
        const noteName = n.replace('#', 's')
        const url = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/${noteName}.mp3`
        const resp = await fetch(url, { mode: 'cors' }).catch(() => null)
        if (resp && resp.ok) {
          const ab = await resp.arrayBuffer().catch(() => null)
          if (ab) {
            const decoded = await ctx.decodeAudioData(ab).catch(() => null)
            if (decoded) sampleCache[n] = decoded
          }
        }
      } catch { /* silent fallback */ }
    }
  }
}

class SampledGuitarEngine implements IGuitarEngine {
  id   = 'sampled'
  name = 'Studio Acoustic (Sampled)'
  private fallbackSynth = new SynthGuitarEngine()

  /** Preload SoundFont sample for high acoustic fidelity */
  private async loadSampleForNote(ctx: AudioContext, note: string): Promise<AudioBuffer | null> {
    if (sampleCache[note]) return sampleCache[note]
    try {
      const noteName = note.replace('#', 's')
      const url = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/${noteName}.mp3`
      const resp = await fetch(url, { mode: 'cors' }).catch(() => null)
      if (!resp || !resp.ok) return null
      const arrayBuf = await resp.arrayBuffer().catch(() => null)
      if (!arrayBuf) return null
      const audioBuf = await ctx.decodeAudioData(arrayBuf).catch(() => null)
      if (audioBuf) sampleCache[note] = audioBuf
      return audioBuf
    } catch {
      return null
    }
  }

  playPluckNote(note = 'E4', volume = 0.22, stringIndex = 2) {
    if (!isStrummingEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    buildMaster(ctx)

    const baseHz = NOTE_FREQS[note] ?? 329.63
    const capoFreq = baseHz * Math.pow(2, currentCapoFret / 12)
    const playbackRate = capoFreq / baseHz

    const humanVolume = volume * (0.88 + Math.random() * 0.24)
    const now = ctx.currentTime
    const safeStrIdx = Math.max(0, Math.min(5, stringIndex))

    const buf = sampleCache[note]
    if (buf) {
      try {
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = playbackRate

        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(humanVolume * 1.15, now)

        // Clean high-pass filter:
        // String 0 (Low E): 35 Hz
        // String 1 (A string, B2 for B7 / A2 for Am): 55 Hz (preserves full warm bass)
        // String 2+ (D, G, B, High E): 85 Hz (kills sub-bass boom, preserves brightness)
        const hp = ctx.createBiquadFilter()
        hp.type = 'highpass'
        hp.frequency.value = safeStrIdx === 0 ? 35 : safeStrIdx === 1 ? 55 : 85
        hp.Q.value = 0.7

        // Acoustic presence boost for treble strings
        const presence = ctx.createBiquadFilter()
        presence.type = 'peaking'
        presence.frequency.value = 2200
        presence.Q.value = 1.2
        presence.gain.value = safeStrIdx >= 3 ? 3.0 : safeStrIdx === 2 ? 1.2 : 0

        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
        pan?.pan.setValueAtTime(STRING_PANS[safeStrIdx] ?? 0, now)

        src.connect(gainNode)
        gainNode.connect(hp)
        hp.connect(presence)
        const toOut: AudioNode = pan ? (presence.connect(pan), pan) : presence
        toOut.connect(dryBus!)
        toOut.connect(wetBus!)

        src.start(now)
      } catch {
        this.fallbackSynth.playPluckNote(note, volume, stringIndex)
      }
    } else {
      this.loadSampleForNote(ctx, note).catch(() => {})
      this.fallbackSynth.playPluckNote(note, volume, stringIndex)
    }
  }

  playDownStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.32) {
    if (!isStrummingEnabled) return
    const baseRoll = 32
    const roll = baseRoll * (0.88 + Math.random() * 0.24)
    const stringOffset = Math.max(0, 6 - notes.length)
    notes.forEach((note, idx) => {
      const stringIndex = stringOffset + idx
      const microJitter = (Math.random() - 0.5) * 8
      const nonLinearProgress = Math.pow(idx / (notes.length - 1 || 1), 0.92)
      const delay = Math.max(0, nonLinearProgress * (notes.length - 1) * roll + microJitter)
      setTimeout(() => {
        // Root note accent (idx===0):
        // String 0 or 1 (Low E or A string): 1.12x strong root (E, G, A, Am, B, B7, C)
        // String 2 (D string, e.g. D chord): 1.02x balanced root
        const stringAccent = idx === 0 ? (stringIndex <= 1 ? 1.12 : 1.02) : idx === notes.length - 1 ? 1.06 : 0.96
        const humanVol = volume * stringAccent * (0.90 + Math.random() * 0.20)
        this.playPluckNote(note, humanVol, stringIndex)
      }, delay)
    })
  }

  playUpStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.28) {
    if (!isStrummingEnabled) return
    const baseRoll = 22
    const roll = baseRoll * (0.86 + Math.random() * 0.28)
    const rev = [...notes].reverse()
    const stringOffset = Math.max(0, 6 - notes.length)
    rev.forEach((note, idx) => {
      const stringIndex = 5 - (stringOffset + idx)
      const microJitter = (Math.random() - 0.5) * 7
      const nonLinearProgress = Math.pow(idx / (rev.length - 1 || 1), 0.94)
      const delay = Math.max(0, nonLinearProgress * (rev.length - 1) * roll + microJitter)
      setTimeout(() => {
        const stringAccent = idx < 2 ? 1.06 : 0.86
        const humanVol = volume * stringAccent * (0.88 + Math.random() * 0.24)
        this.playPluckNote(note, humanVol, stringIndex)
      }, delay)
    })
  }

  playMuteStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.12) {
    if (!isStrummingEnabled) return
    const stringOffset = Math.max(0, 6 - notes.length)
    notes.slice(0, 4).forEach((note, idx) => {
      const delay = Math.max(0, idx * 10 + (Math.random() - 0.5) * 5)
      setTimeout(() => this.playPluckNote(note, volume * (0.24 + Math.random() * 0.08), stringOffset + idx), delay)
    })
  }
}

// ── Audio Engine Registry ───────────────────────────────────────────────────
const synthEngine = new SynthGuitarEngine()
const sampledEngine = new SampledGuitarEngine()

function getActiveEngine(): IGuitarEngine {
  if (currentEngineMode === 'nylon') {
    setGuitarType('nylon')
    return synthEngine
  }
  if (currentEngineMode === 'sampled') {
    setGuitarType('steel')
    return sampledEngine
  }
  setGuitarType('steel')
  return synthEngine
}

// ── Chord Voicing Map (Standard 6-String Guitar Voicings) ────────────────────
export const CHORD_NOTES: Record<string, string[]> = {
  // Open / Primary Major Chords
  C:     ['C3','E3','G3','C4','E4'],
  D:     ['D3','A3','D4','F#4'],
  E:     ['E2','B2','E3','G#3','B3','E4'],
  F:     ['F2','C3','F3','A3','C4','F4'],
  G:     ['G2','B2','D3','G3','B3','G4'],
  A:     ['A2','E3','A3','C#4','E4'],
  B:     ['B2','F#3','B3','D#4','F#4'],

  // Open / Primary Minor Chords
  Cm:    ['C3','G3','C4','D#4','G4'],
  Dm:    ['D3','A3','D4','F4'],
  Em:    ['E2','B2','E3','G3','B3','E4'],
  Fm:    ['F2','C3','F3','G#3','C4','F4'],
  Gm:    ['G2','D3','G3','A#3','D4','G4'],
  Am:    ['A2','E3','A3','C4','E4'],
  Bm:    ['B2','F#3','B3','D4','F#4'],

  // Dominant 7th Chords
  C7:    ['C3','E3','A#3','C4','E4'],
  D7:    ['D3','A3','C4','F#4'],
  E7:    ['E2','B2','D3','G#3','B3','E4'],
  F7:    ['F2','C3','D#3','A3','C4','F4'],
  G7:    ['G2','B2','D3','G3','B3','F4'],
  A7:    ['A2','E3','G3','C#4','E4'],
  B7:    ['B2','D#3','A3','B3','F#4'],

  // Sharps & Flats
  'F#':  ['F#2','C#3','F#3','A#3','C#4','F#4'],
  'F#m': ['F#2','C#3','F#3','A3','C#4','F#4'],
  'F#7': ['F#2','C#3','E3','A#3','C#4','F#4'],
  Bb:    ['A#2','F3','A#3','D4','F4'],
  Eb:    ['D#3','A#3','D#4','G4'],
  Ab:    ['G#2','D#3','G#3','C4','D#4','G#4'],

  // Extended & Suspended Chords
  Am7:   ['A2','E3','G3','C4','E4'],
  Cadd9: ['C3','E3','G3','D4','E4'],
  Gsus4: ['G2','C3','D3','G3','C4','G4'],
  Dsus2: ['D3','A3','D4','E4'],
  Dsus4: ['D3','A3','D4','G4'],
}

// ── Public Unified API ───────────────────────────────────────────────────────
export function playPluckNote(note = 'E4', volume = 0.22, stringIndex = 2) {
  initAudioEngine()
  getActiveEngine().playPluckNote(note, volume, stringIndex)
}

export function triggerGuitarChord(chordName = 'Em', volume = 0.32) {
  if (!isStrummingEnabled) return
  const ctx = getAudioContext()
  if (ctx && lastPlayedChord !== '' && lastPlayedChord !== chordName) {
    playFretScratchNoise(ctx)
  }
  lastPlayedChord = chordName

  initAudioEngine()
  const notes = CHORD_NOTES[chordName] || CHORD_NOTES['Em']
  getActiveEngine().playDownStrum(notes, volume)
}

export function playGuitarChord(chordName = 'Em', volume = 0.32) {
  triggerGuitarChord(chordName, volume)
}

export function playStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.32) {
  getActiveEngine().playDownStrum(notes, volume)
}

export function playDownStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.32) {
  getActiveEngine().playDownStrum(notes, volume)
}

export function playUpStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.28) {
  getActiveEngine().playUpStrum(notes, volume)
}

export function playMuteStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.12) {
  getActiveEngine().playMuteStrum(notes, volume)
}

export function playPatternBeat(stroke: string, notes: string[], volume = 0.32) {
  if (!isStrummingEnabled) return
  const s = stroke.toUpperCase()
  if      (s === 'D' || s === '↓') playDownStrum(notes, volume)
  else if (s === 'U' || s === '↑') playUpStrum(notes, volume)
  else if (s === 'X' || s === '✕') playMuteStrum(notes, volume)
}
