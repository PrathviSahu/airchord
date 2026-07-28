// ── Multi-Guitar Sound Engine (Web Audio API) ──────────────────────────────
// Supports Steel Acoustic, Classical Nylon, Electric Clean, and 12-String Acoustic

export type GuitarType = 'steel' | 'nylon' | 'electric' | '12string'

let currentGuitarType: GuitarType = 'steel'
let currentCapoFret: number = 0
let audioCtx: AudioContext | null = null

const waveCache: Partial<Record<GuitarType, PeriodicWave>> = {}

let isStrummingEnabled: boolean = true

export function setStrummingEnabled(enabled: boolean) {
  isStrummingEnabled = enabled
  if (enabled) {
    initAudioEngine()
  }
}

export function isStrummingActive(): boolean {
  return isStrummingEnabled
}

export function toggleStrumming(): boolean {
  isStrummingEnabled = !isStrummingEnabled
  if (isStrummingEnabled) {
    initAudioEngine()
  }
  return isStrummingEnabled
}

export function initAudioEngine(): AudioContext | null {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

// Auto-unlock AudioContext on first user interaction anywhere in browser
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    initAudioEngine()
    window.removeEventListener('click', unlockAudio)
    window.removeEventListener('keydown', unlockAudio)
    window.removeEventListener('touchstart', unlockAudio)
  }
  window.addEventListener('click', unlockAudio)
  window.addEventListener('keydown', unlockAudio)
  window.addEventListener('touchstart', unlockAudio)
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function setCapoFret(fret: number) {
  currentCapoFret = Math.max(0, Math.min(7, fret))
}

export function getCapoFret(): number {
  return currentCapoFret
}

export function setGuitarType(type: GuitarType) {
  currentGuitarType = type
}

export function getGuitarType(): GuitarType {
  return currentGuitarType
}

// Generate guitar-specific harmonic spectra
function getGuitarWave(ctx: AudioContext, type: GuitarType): PeriodicWave {
  if (waveCache[type]) return waveCache[type]!

  let real: Float32Array
  if (type === 'nylon') {
    // Mellow nylon harmonics (strong fundamental, rapidly decaying overtones)
    real = new Float32Array([0, 1.0, 0.45, 0.18, 0.08, 0.03])
  } else if (type === 'electric') {
    // Single-coil magnetic pickup (strong 1st, 3rd, 5th harmonics)
    real = new Float32Array([0, 1.0, 0.85, 0.60, 0.40, 0.25, 0.15, 0.08])
  } else if (type === '12string') {
    // Shimmering 12-string harmonics
    real = new Float32Array([0, 1.0, 0.80, 0.55, 0.35, 0.20, 0.10, 0.05])
  } else {
    // Steel acoustic dreadnought (balanced fundamental & harmonics)
    real = new Float32Array([0, 1.0, 0.72, 0.45, 0.28, 0.16, 0.08, 0.04])
  }

  const imag = new Float32Array(real.length)
  const wave = ctx.createPeriodicWave(real, imag)
  waveCache[type] = wave
  return wave
}

// Frequency map for standard guitar notes
const NOTE_FREQS: Record<string, number> = {
  E2: 82.41,
  F2: 87.31,
  F3: 174.61,
  F4: 349.23,
  F2_high: 349.23,
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  'C#3': 138.59,
  D3: 146.83,
  E3: 164.81,
  G3: 196.0,
  'G#3': 207.65,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  'C#4': 277.18,
  D4: 293.66,
  E4: 329.63,
  'F#4': 369.99,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
}

// Stereo panning per string index (Low E panned left, High E panned right)
const STRING_PANS = [-0.3, -0.18, -0.05, 0.05, 0.18, 0.3]

/**
 * Play a single studio guitar note with selected guitar type timbres
 */
export function playPluckNote(note: string = 'E4', volume = 0.2, stringIndex = 2) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const baseFreq = NOTE_FREQS[note] ?? 329.63
    const freq = baseFreq * Math.pow(2, currentCapoFret / 12)
    const now = ctx.currentTime
    const type = currentGuitarType

    // 1. Primary Guitar Harmonic Oscillator
    const osc1 = ctx.createOscillator()
    osc1.setPeriodicWave(getGuitarWave(ctx, type))
    osc1.frequency.setValueAtTime(freq, now)

    // 2. Secondary Shimmer / Octave Oscillator
    const osc2 = ctx.createOscillator()
    osc2.setPeriodicWave(getGuitarWave(ctx, type))
    // 12-string acoustic adds octave-up layer (+12 semitones = 2x frequency)
    const freq2 = type === '12string' ? freq * 2.0 : freq * 1.0015
    osc2.frequency.setValueAtTime(freq2, now)

    // Oscillator Gain Envelope
    const oscGain = ctx.createGain()
    const attackTime = type === 'nylon' ? 0.012 : 0.006
    const decayDuration = type === 'nylon' ? 1.4 : type === 'electric' ? 2.5 : type === '12string' ? 2.2 : 1.8
    oscGain.gain.setValueAtTime(0.0001, now)
    oscGain.gain.linearRampToValueAtTime(volume * (type === '12string' ? 0.6 : 0.75), now + attackTime)
    oscGain.gain.linearRampToValueAtTime(0.0001, now + decayDuration)

    // 3. Attack Transient Pluck Filter (Pick on steel vs Finger on nylon)
    const noiseLen = Math.round(ctx.sampleRate * (type === 'nylon' ? 0.015 : 0.022))
    const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.35))
    }
    const pickSource = ctx.createBufferSource()
    pickSource.buffer = noiseBuffer

    const pickFilter = ctx.createBiquadFilter()
    pickFilter.type = type === 'nylon' ? 'lowpass' : 'bandpass'
    pickFilter.frequency.setValueAtTime(type === 'nylon' ? 1200 : type === 'electric' ? 3200 : 2400, now)
    if (type !== 'nylon') pickFilter.Q.setValueAtTime(2.2, now)

    const pickGain = ctx.createGain()
    pickGain.gain.setValueAtTime(volume * (type === 'nylon' ? 0.2 : 0.4), now)
    pickGain.gain.linearRampToValueAtTime(0.0001, now + 0.03)

    // 4. Acoustic Body / Pickup Resonator Filters
    const bodyFilter = ctx.createBiquadFilter()
    if (type === 'electric') {
      bodyFilter.type = 'peaking'
      bodyFilter.frequency.setValueAtTime(3200, now)
      bodyFilter.gain.setValueAtTime(3.0, now)
    } else if (type === 'nylon') {
      bodyFilter.type = 'lowpass'
      bodyFilter.frequency.setValueAtTime(1600, now)
    } else {
      bodyFilter.type = 'peaking'
      bodyFilter.frequency.setValueAtTime(110, now) // Wood cavity air resonance
      bodyFilter.gain.setValueAtTime(4.0, now)
    }

    // 5. Stereo Panner Node
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    if (panner) {
      panner.pan.setValueAtTime(STRING_PANS[stringIndex % 6] || 0, now)
    }

    // Connect Audio Pipeline
    osc1.connect(oscGain)
    osc2.connect(oscGain)
    pickSource.connect(pickFilter)
    pickFilter.connect(pickGain)

    oscGain.connect(bodyFilter)
    pickGain.connect(bodyFilter)

    if (panner) {
      bodyFilter.connect(panner)
      panner.connect(ctx.destination)
    } else {
      bodyFilter.connect(ctx.destination)
    }

    osc1.start(now)
    osc2.start(now)
    pickSource.start(now)

    osc1.stop(now + decayDuration + 0.2)
    osc2.stop(now + decayDuration + 0.2)
    pickSource.stop(now + 0.05)
  } catch {
    // Ignore audio context autoplay restriction
  }
}

const CHORD_NOTES: Record<string, string[]> = {
  Em: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  Am: ['A2', 'E3', 'A3', 'C4', 'E4'],
  C: ['C3', 'E3', 'G3', 'C4', 'E4'],
  D: ['D3', 'A3', 'D4', 'F#4'],
  G: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  F: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  B7: ['B2', 'D#3', 'A3', 'B3', 'F#4'],
  E: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  A: ['A2', 'E3', 'A3', 'C#4', 'E4'],
  Bm: ['B2', 'F#3', 'B3', 'D4', 'F#4'],
  Dm: ['D3', 'A3', 'D4', 'F4'],
  'F#m': ['F#2', 'C#3', 'F#3', 'A3', 'C#4', 'F#4'],
  'F#7': ['F#2', 'A#2', 'E3', 'F#3', 'C#4'],
}

export function triggerGuitarChord(chordName: string = 'Em', volume = 0.2) {
  if (!isStrummingEnabled) return
  initAudioEngine()
  const notes = CHORD_NOTES[chordName] || CHORD_NOTES['Em']
  playDownStrum(notes, volume)
}

export function playGuitarChord(chordName: string = 'Em', volume = 0.2) {
  triggerGuitarChord(chordName, volume)
}

/**
 * Standard guitar strum (Downstrum)
 */
export function playStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.2) {
  playDownStrum(notes, volume)
}

/**
 * Downstrum: Low strings → High strings
 */
export function playDownStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.2) {
  const type = currentGuitarType
  const rollDelay = type === 'nylon' ? 42 : type === '12string' ? 32 : 36
  notes.forEach((note, idx) => {
    setTimeout(() => {
      const vol = idx < 2 ? volume * 1.25 : volume
      playPluckNote(note, vol, idx)
    }, idx * rollDelay)
  })
}

/**
 * Upstrum: High strings → Low strings
 */
export function playUpStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.18) {
  const type = currentGuitarType
  const rollDelay = type === 'nylon' ? 34 : 26
  const reversed = [...notes].reverse()
  reversed.forEach((note, idx) => {
    setTimeout(() => {
      const vol = idx < 3 ? volume * 1.15 : volume * 0.85
      playPluckNote(note, vol, 5 - idx)
    }, idx * rollDelay)
  })
}

/**
 * Mute / Slap strum
 */
export function playMuteStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.12) {
  notes.slice(0, 4).forEach((note, idx) => {
    setTimeout(() => {
      playPluckNote(note, volume * 0.35, idx)
    }, idx * 12)
  })
}

/**
 * Play a single strum pattern stroke step ('D' | 'U' | 'X' | '.')
 */
export function playPatternBeat(stroke: string, notes: string[], volume = 0.2) {
  const type = stroke.toUpperCase()
  if (type === 'D' || type === '↓') {
    playDownStrum(notes, volume)
  } else if (type === 'U' || type === '↑') {
    playUpStrum(notes, volume)
  } else if (type === 'X' || type === '✕') {
    playMuteStrum(notes, volume)
  }
  // '.' is a rest
}
