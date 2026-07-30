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

  dryBus = ctx.createGain(); dryBus.gain.value = 0.82
  wetBus = ctx.createGain(); wetBus.gain.value = 0.16

  compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -16
  compressor.knee.value      = 10
  compressor.ratio.value     = 3.5
  compressor.attack.value    = 0.003
  compressor.release.value   = 0.20

  masterOut = ctx.createGain()
  masterOut.gain.value = 0.68

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
  E2:82.41, F2:87.31, 'F#2':92.50, G2:98.00, 'G#2':103.83, 'A#2':116.54,
  A2:110.0, B2:123.47, C3:130.81, 'C#3':138.59, D3:146.83, 'D#3':155.56,
  E3:164.81, F3:174.61, 'F#3':185.00, G3:196.0, 'G#3':207.65, A3:220.0,
  B3:246.94, C4:261.63, 'C#4':277.18, D4:293.66, E4:329.63,
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

      const pitchJitterCents = (Math.random() - 0.5) * 7.0
      const pitchJitterFactor = Math.pow(2, pitchJitterCents / 1200)
      const targetFreq = freq * pitchJitterFactor
      const initialTensionSpike = targetFreq * (1.0 + 0.007 * (volume / 0.35))
      const humanVolume = volume * (0.86 + Math.random() * 0.28)

      const decay = (type === 'nylon' ? 1.5 : type === 'electric' ? 2.8 : 2.0)
                 * preset.decayMul
                 * (1.0 - stringIndex * 0.055)

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

      const envGain = ctx.createGain()
      const peak    = humanVolume * 0.78
      envGain.gain.setValueAtTime(0.0001, now)
      envGain.gain.linearRampToValueAtTime(peak, now + 0.004)
      envGain.gain.setValueAtTime(peak, now + 0.004)
      envGain.gain.exponentialRampToValueAtTime(0.0001, now + decay)

      const mix1 = ctx.createGain(); mix1.gain.value = 0.65
      const mix2 = ctx.createGain(); mix2.gain.value = 0.20
      const mix3 = ctx.createGain(); mix3.gain.value = 0.15
      osc1.connect(mix1); mix1.connect(envGain)
      osc2.connect(mix2); mix2.connect(envGain)
      osc3.connect(mix3); mix3.connect(envGain)

      const noiseLen = Math.round(ctx.sampleRate * 0.028)
      const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
      const nd       = noiseBuf.getChannelData(0)
      for (let i = 0; i < noiseLen; i++) {
        nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.25))
      }
      const pickSrc = ctx.createBufferSource()
      pickSrc.buffer = noiseBuf
      const pickBP = ctx.createBiquadFilter()
      pickBP.type = 'bandpass'
      pickBP.frequency.value = preset.pickHz * (0.88 + Math.random() * 0.24)
      pickBP.Q.value         = 1.8 * (0.9 + Math.random() * 0.2)

      const pickEnv = ctx.createGain()
      pickEnv.gain.setValueAtTime(humanVolume * (0.24 + Math.random() * 0.12), now)
      pickEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.025)
      pickSrc.connect(pickBP); pickBP.connect(pickEnv)

      const bodyLo = ctx.createBiquadFilter()
      bodyLo.type = 'peaking'; bodyLo.frequency.value = preset.bodyLow; bodyLo.Q.value = 1.4; bodyLo.gain.value = preset.bodyGain

      const bodyHi = ctx.createBiquadFilter()
      bodyHi.type = 'peaking'; bodyHi.frequency.value = preset.bodyMid; bodyHi.Q.value = 1.0; bodyHi.gain.value = 2.5

      const shelf = ctx.createBiquadFilter()
      shelf.type = 'highshelf'; shelf.frequency.value = 6000; shelf.gain.value = preset.shelfGain

      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
      pan?.pan.setValueAtTime(STRING_PANS[stringIndex % 6] ?? 0, now)

      envGain.connect(bodyLo)
      pickEnv.connect(bodyLo)
      bodyLo.connect(bodyHi)
      bodyHi.connect(shelf)

      const toOut: AudioNode = pan ? (shelf.connect(pan), pan) : shelf
      toOut.connect(dryBus!)
      toOut.connect(wetBus!)

      osc1.start(now); osc2.start(now); osc3.start(now)
      pickSrc.start(now)
      const stopAt = now + decay + 0.1
      osc1.stop(stopAt); osc2.stop(stopAt); osc3.stop(stopAt)
      pickSrc.stop(now + 0.035)
    } catch { /* ignore */ }
  }

  playDownStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.32) {
    if (!isStrummingEnabled) return
    const baseRoll = currentGuitarType === 'nylon' ? 40 : currentGuitarType === '12string' ? 28 : 32
    const roll = baseRoll * (0.88 + Math.random() * 0.24)
    notes.forEach((note, idx) => {
      const microJitter = (Math.random() - 0.5) * 8
      const nonLinearProgress = Math.pow(idx / (notes.length - 1 || 1), 0.92)
      const delay = Math.max(0, nonLinearProgress * (notes.length - 1) * roll + microJitter)
      setTimeout(() => {
        const stringAccent = idx < 2 ? 1.15 : idx > 3 ? 0.88 : 1.0
        const humanVol = volume * stringAccent * (0.90 + Math.random() * 0.20)
        this.playPluckNote(note, humanVol, idx)
      }, delay)
    })
  }

  playUpStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.28) {
    if (!isStrummingEnabled) return
    const baseRoll = currentGuitarType === 'nylon' ? 30 : 22
    const roll = baseRoll * (0.86 + Math.random() * 0.28)
    const rev = [...notes].reverse()
    rev.forEach((note, idx) => {
      const microJitter = (Math.random() - 0.5) * 7
      const nonLinearProgress = Math.pow(idx / (rev.length - 1 || 1), 0.94)
      const delay = Math.max(0, nonLinearProgress * (rev.length - 1) * roll + microJitter)
      setTimeout(() => {
        const stringAccent = idx < 3 ? 1.06 : 0.84
        const humanVol = volume * stringAccent * (0.88 + Math.random() * 0.24)
        this.playPluckNote(note, humanVol, 5 - idx)
      }, delay)
    })
  }

  playMuteStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.12) {
    if (!isStrummingEnabled) return
    notes.slice(0, 4).forEach((note, idx) => {
      const delay = Math.max(0, idx * 10 + (Math.random() - 0.5) * 5)
      setTimeout(() => this.playPluckNote(note, volume * (0.24 + Math.random() * 0.08), idx), delay)
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER 2: Sampled Guitar Engine (Acoustic SoundFont Multi-Sample Player)
// High-realism sampled acoustic guitar with SoundFont audio buffer caching
// ─────────────────────────────────────────────────────────────────────────────
const sampleCache: Record<string, AudioBuffer> = {}
const COMMON_NOTES = ['E2','A2','D3','G3','B3','E4','C3','F2','G2','C4','D4','F4','F#4','A3','E3']

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

    const buf = sampleCache[note]
    if (buf) {
      try {
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = playbackRate

        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(humanVolume * 1.1, now)

        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
        pan?.pan.setValueAtTime(STRING_PANS[stringIndex % 6] ?? 0, now)

        src.connect(gainNode)
        const toOut: AudioNode = pan ? (gainNode.connect(pan), pan) : gainNode
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
    notes.forEach((note, idx) => {
      const microJitter = (Math.random() - 0.5) * 8
      const nonLinearProgress = Math.pow(idx / (notes.length - 1 || 1), 0.92)
      const delay = Math.max(0, nonLinearProgress * (notes.length - 1) * roll + microJitter)
      setTimeout(() => {
        const stringAccent = idx < 2 ? 1.15 : idx > 3 ? 0.88 : 1.0
        const humanVol = volume * stringAccent * (0.90 + Math.random() * 0.20)
        this.playPluckNote(note, humanVol, idx)
      }, delay)
    })
  }

  playUpStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.28) {
    if (!isStrummingEnabled) return
    const baseRoll = 22
    const roll = baseRoll * (0.86 + Math.random() * 0.28)
    const rev = [...notes].reverse()
    rev.forEach((note, idx) => {
      const microJitter = (Math.random() - 0.5) * 7
      const nonLinearProgress = Math.pow(idx / (rev.length - 1 || 1), 0.94)
      const delay = Math.max(0, nonLinearProgress * (rev.length - 1) * roll + microJitter)
      setTimeout(() => {
        const stringAccent = idx < 3 ? 1.06 : 0.84
        const humanVol = volume * stringAccent * (0.88 + Math.random() * 0.24)
        this.playPluckNote(note, humanVol, 5 - idx)
      }, delay)
    })
  }

  playMuteStrum(notes = ['E2','A2','D3','G3','B3','E4'], volume = 0.12) {
    if (!isStrummingEnabled) return
    notes.slice(0, 4).forEach((note, idx) => {
      const delay = Math.max(0, idx * 10 + (Math.random() - 0.5) * 5)
      setTimeout(() => this.playPluckNote(note, volume * (0.24 + Math.random() * 0.08), idx), delay)
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
