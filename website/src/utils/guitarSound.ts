// ── Multi-Guitar Sound Engine (Web Audio API) ──────────────────────────────
// Steel Acoustic · Classical Nylon · Electric Clean · 12-String Acoustic

export type GuitarType = 'steel' | 'nylon' | 'electric' | '12string'

let currentGuitarType: GuitarType = 'steel'
let currentCapoFret: number = 0
let audioCtx: AudioContext | null = null

const waveCache: Partial<Record<GuitarType, PeriodicWave>> = {}

// ── Master chain: reverb send → compressor → master gain → destination ───────
let masterGainNode:    GainNode | null = null
let masterCompressor:  DynamicsCompressorNode | null = null
let reverbNode:        ConvolverNode | null = null
let reverbSend:        GainNode | null = null
let dryGain:           GainNode | null = null

/** Build a synthetic reverb impulse response (plate reverb approximation) */
function buildReverb(ctx: AudioContext): ConvolverNode {
  const sampleRate  = ctx.sampleRate
  const duration    = 1.8          // seconds of reverb tail
  const decay       = 3.5          // higher = faster decay
  const length      = Math.floor(sampleRate * duration)
  const buffer      = ctx.createBuffer(2, length, sampleRate)

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // White noise * exponential decay envelope
      data[i] = (Math.random() * 2 - 1) * Math.exp(-decay * t)
    }
  }

  const conv = ctx.createConvolver()
  conv.buffer = buffer
  return conv
}

function getMasterChain(ctx: AudioContext): { dry: GainNode; verb: GainNode } {
  if (!masterGainNode || !masterCompressor || !reverbNode || !reverbSend || !dryGain) {
    // Reverb
    reverbNode = buildReverb(ctx)
    reverbSend = ctx.createGain()
    reverbSend.gain.value = 0.22       // Wet reverb amount (22%)

    // Dry signal path
    dryGain = ctx.createGain()
    dryGain.gain.value = 0.78          // Dry amount (78%)

    // Compressor (transparent limiter)
    masterCompressor = ctx.createDynamicsCompressor()
    masterCompressor.threshold.value = -16   // dBFS
    masterCompressor.knee.value      = 10    // Smooth
    masterCompressor.ratio.value     = 5     // 5:1
    masterCompressor.attack.value    = 0.003 // 3ms
    masterCompressor.release.value   = 0.15  // 150ms

    // Master gain
    masterGainNode = ctx.createGain()
    masterGainNode.gain.value = 0.70   // Final volume

    // Wiring: dry → compressor, reverb send → reverb → compressor
    dryGain.connect(masterCompressor)
    reverbSend.connect(reverbNode)
    reverbNode.connect(masterCompressor)
    masterCompressor.connect(masterGainNode)
    masterGainNode.connect(ctx.destination)
  }

  return { dry: dryGain!, verb: reverbSend! }
}

// ── Strumming toggle ─────────────────────────────────────────────────────────
let isStrummingEnabled = true

export function setStrummingEnabled(enabled: boolean) {
  isStrummingEnabled = enabled
  if (enabled) initAudioEngine()
}
export function isStrummingActive()   { return isStrummingEnabled }
export function toggleStrumming()     {
  isStrummingEnabled = !isStrummingEnabled
  if (isStrummingEnabled) initAudioEngine()
  return isStrummingEnabled
}

export function initAudioEngine(): AudioContext | null {
  const ctx = getAudioContext()
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Auto-unlock AudioContext on first user gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    initAudioEngine()
    window.removeEventListener('click',      unlockAudio)
    window.removeEventListener('keydown',    unlockAudio)
    window.removeEventListener('touchstart', unlockAudio)
  }
  window.addEventListener('click',      unlockAudio)
  window.addEventListener('keydown',    unlockAudio)
  window.addEventListener('touchstart', unlockAudio)
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

// ── Capo / Guitar type setters ───────────────────────────────────────────────
export function setCapoFret(fret: number)   { currentCapoFret   = Math.max(0, Math.min(7, fret)) }
export function getCapoFret()               { return currentCapoFret }
export function setGuitarType(type: GuitarType) { currentGuitarType = type; waveCache[type] = undefined }
export function getGuitarType()             { return currentGuitarType }

// ── Harmonic spectra — real (cosine) and imaginary (sine) components ─────────
// These shape the timbre of each guitar type using Fourier coefficients.
function getGuitarWave(ctx: AudioContext, type: GuitarType): PeriodicWave {
  if (waveCache[type]) return waveCache[type]!

  let real: Float32Array
  let imag: Float32Array

  if (type === 'nylon') {
    // Warm, round nylon-string classical — mellow high harmonics
    real = new Float32Array([0, 1.0,  0.42, 0.14, 0.06, 0.02, 0.01])
    imag = new Float32Array([0, 0.0,  0.05, 0.03, 0.01, 0.01, 0.00])
  } else if (type === 'electric') {
    // Single-coil Strat: bright, prominent 3rd & 5th harmonics, slight phase
    real = new Float32Array([0, 1.0,  0.80, 0.62, 0.42, 0.28, 0.18, 0.10, 0.05])
    imag = new Float32Array([0, 0.0,  0.12, 0.08, 0.06, 0.04, 0.02, 0.01, 0.00])
  } else if (type === '12string') {
    // Jangly 12-string — rich overtones + chorus shimmer
    real = new Float32Array([0, 1.0,  0.78, 0.52, 0.34, 0.20, 0.12, 0.06, 0.03])
    imag = new Float32Array([0, 0.0,  0.10, 0.07, 0.04, 0.02, 0.01, 0.00, 0.00])
  } else {
    // Steel acoustic dreadnought — balanced body + harmonic richness
    real = new Float32Array([0, 1.0,  0.68, 0.40, 0.24, 0.14, 0.08, 0.04, 0.02])
    imag = new Float32Array([0, 0.0,  0.08, 0.05, 0.03, 0.02, 0.01, 0.00, 0.00])
  }

  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false })
  waveCache[type] = wave
  return wave
}

// ── Note frequency table ─────────────────────────────────────────────────────
const NOTE_FREQS: Record<string, number> = {
  E2: 82.41,  F2: 87.31,  'F#2': 92.50, G2: 98.00,
  'G#2': 103.83, 'A#2': 116.54,
  A2: 110.0,  B2: 123.47, C3: 130.81, 'C#3': 138.59,
  D3: 146.83, 'D#3': 155.56, E3: 164.81, F3: 174.61,
  'F#3': 185.00, G3: 196.0,  'G#3': 207.65, A3: 220.0,
  B3: 246.94, C4: 261.63, 'C#4': 277.18, D4: 293.66,
  E4: 329.63, F4: 349.23,  'F#4': 369.99, G4: 392.0,
  A4: 440.0,  B4: 493.88, C5: 523.25,
}

// Stereo panning: Low E panned left → High E panned right
const STRING_PANS = [-0.28, -0.16, -0.05, 0.05, 0.16, 0.28]

// ── Core pluck synthesizer ───────────────────────────────────────────────────
export function playPluckNote(note = 'E4', volume = 0.2, stringIndex = 2) {
  if (!isStrummingEnabled) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const baseFreq = NOTE_FREQS[note] ?? 329.63
    const freq     = baseFreq * Math.pow(2, currentCapoFret / 12)
    const now      = ctx.currentTime
    const type     = currentGuitarType

    // String-specific decay — bass strings ring longer, treble strings shorter
    const stringDecayFactor = 1.0 - (stringIndex / 5) * 0.28
    const baseDecay = type === 'nylon' ? 1.6 : type === 'electric' ? 2.8 : type === '12string' ? 2.4 : 2.0
    const decayDuration = baseDecay * stringDecayFactor

    const attackTime = type === 'nylon' ? 0.014 : 0.005

    // ── 1. Primary oscillator (main pitch) ──────────────────────────────
    const osc1 = ctx.createOscillator()
    osc1.setPeriodicWave(getGuitarWave(ctx, type))
    osc1.frequency.setValueAtTime(freq, now)

    // ── 2. Chorus oscillator (detuned ±4 cents) ─────────────────────────
    // Gives warmth and natural string chorus without a separate chorus effect
    const osc2 = ctx.createOscillator()
    osc2.setPeriodicWave(getGuitarWave(ctx, type))
    const detuneHz  = type === '12string' ? freq * 2 * 1.003 : freq * 1.004
    osc2.frequency.setValueAtTime(detuneHz, now)

    // ── 3. ADSR gain envelope — exponential for natural pluck feel ──────
    const oscGain = ctx.createGain()
    const peakVol = volume * (type === '12string' ? 0.65 : type === 'nylon' ? 0.70 : 0.78)
    oscGain.gain.setValueAtTime(0.0001, now)
    oscGain.gain.linearRampToValueAtTime(peakVol, now + attackTime)
    // Exponential decay: far more natural than linear (sounds like a real pluck)
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration)

    // ── 4. Pluck transient (string attack noise burst) ───────────────────
    const noiseLen  = Math.round(ctx.sampleRate * (type === 'nylon' ? 0.018 : 0.025))
    const noiseBuf  = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
    const noiseData = noiseBuf.getChannelData(0)
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.3))
    }
    const pickSrc = ctx.createBufferSource()
    pickSrc.buffer = noiseBuf

    const pickFilter = ctx.createBiquadFilter()
    pickFilter.type = type === 'nylon' ? 'lowpass' : 'bandpass'
    pickFilter.frequency.setValueAtTime(
      type === 'nylon' ? 1400 : type === 'electric' ? 3800 : 2800, now
    )
    if (type !== 'nylon') pickFilter.Q.setValueAtTime(2.5, now)

    const pickGain = ctx.createGain()
    pickGain.gain.setValueAtTime(volume * (type === 'nylon' ? 0.22 : 0.35), now)
    pickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

    // ── 5. Body resonance — two peaking filters for acoustic body ────────
    // Filter 1: Air cavity resonance (low-mid warmth)
    const body1 = ctx.createBiquadFilter()
    body1.type = 'peaking'
    body1.frequency.setValueAtTime(type === 'electric' ? 800 : 120, now)
    body1.Q.setValueAtTime(1.2, now)
    body1.gain.setValueAtTime(type === 'electric' ? 2.5 : 5.0, now)

    // Filter 2: Upper-body presence / string brightness
    const body2 = ctx.createBiquadFilter()
    body2.type = 'peaking'
    body2.frequency.setValueAtTime(type === 'electric' ? 3500 : type === 'nylon' ? 900 : 1800, now)
    body2.Q.setValueAtTime(0.9, now)
    body2.gain.setValueAtTime(type === 'electric' ? 3.0 : 2.5, now)

    // High shelf: gentle air (airy sparkle on treble strings)
    const airShelf = ctx.createBiquadFilter()
    airShelf.type = 'highshelf'
    airShelf.frequency.setValueAtTime(5000, now)
    airShelf.gain.setValueAtTime(type === 'nylon' ? -2 : 1.5, now)

    // ── 6. Stereo panner ─────────────────────────────────────────────────
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    panner?.pan.setValueAtTime(STRING_PANS[stringIndex % 6] ?? 0, now)

    // ── 7. Route through master chain (dry + reverb) ─────────────────────
    const { dry, verb } = getMasterChain(ctx)

    // Signal chain: oscs → oscGain → body1 → body2 → airShelf → panner → dry/verb
    osc1.connect(oscGain)
    osc2.connect(oscGain)
    pickSrc.connect(pickFilter)
    pickFilter.connect(pickGain)

    oscGain.connect(body1)
    pickGain.connect(body1)
    body1.connect(body2)
    body2.connect(airShelf)

    const preOut: AudioNode = panner
      ? (airShelf.connect(panner), panner)
      : airShelf

    preOut.connect(dry)
    preOut.connect(verb)   // Parallel reverb send

    // ── 8. Play & schedule cleanup ────────────────────────────────────────
    osc1.start(now);  osc2.start(now);  pickSrc.start(now)
    osc1.stop(now + decayDuration + 0.1)
    osc2.stop(now + decayDuration + 0.1)
    pickSrc.stop(now + 0.06)
  } catch {
    // Ignore AudioContext autoplay restriction errors
  }
}

// ── Chord note maps ──────────────────────────────────────────────────────────
const CHORD_NOTES: Record<string, string[]> = {
  Em:   ['E2', 'B2', 'E3', 'G3',  'B3', 'E4'],
  Am:   ['A2', 'E3', 'A3', 'C4',  'E4'],
  C:    ['C3', 'E3', 'G3', 'C4',  'E4'],
  D:    ['D3', 'A3', 'D4', 'F#4'],
  G:    ['G2', 'B2', 'D3', 'G3',  'B3', 'G4'],
  F:    ['F2', 'C3', 'F3', 'A3',  'C4', 'F4'],
  B7:   ['B2', 'D#3','A3', 'B3',  'F#4'],
  E:    ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  A:    ['A2', 'E3', 'A3', 'C#4', 'E4'],
  Bm:   ['B2', 'F#3','B3', 'D4',  'F#4'],
  Dm:   ['D3', 'A3', 'D4', 'F4'],
  'F#m':['F#2','C#3','F#3','A3',  'C#4','F#4'],
  'F#7':['F#2','A#2','E3', 'F#3', 'C#4'],
}

// ── Public strum functions ────────────────────────────────────────────────────

export function triggerGuitarChord(chordName = 'Em', volume = 0.35) {
  if (!isStrummingEnabled) return
  initAudioEngine()
  const notes = CHORD_NOTES[chordName] || CHORD_NOTES['Em']
  playDownStrum(notes, volume)
}

export function playGuitarChord(chordName = 'Em', volume = 0.35) {
  triggerGuitarChord(chordName, volume)
}

export function playStrum(
  notes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  volume = 0.35
) {
  playDownStrum(notes, volume)
}

/** Downstrum: Low E → High e (natural pick direction) */
export function playDownStrum(
  notes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  volume = 0.35
) {
  if (!isStrummingEnabled) return
  const rollDelay = currentGuitarType === 'nylon' ? 40 : currentGuitarType === '12string' ? 30 : 34
  notes.forEach((note, idx) => {
    setTimeout(() => {
      // Bass strings slightly louder for a warm, full chord sound
      const vol = idx < 2 ? volume * 1.2 : idx > 3 ? volume * 0.9 : volume
      playPluckNote(note, vol, idx)
    }, idx * rollDelay)
  })
}

/** Upstrum: High e → Low E */
export function playUpStrum(
  notes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  volume = 0.30
) {
  if (!isStrummingEnabled) return
  const rollDelay = currentGuitarType === 'nylon' ? 32 : 24
  const reversed  = [...notes].reverse()
  reversed.forEach((note, idx) => {
    setTimeout(() => {
      // Upstrokes are naturally lighter — treble strings a bit brighter
      const vol = idx < 3 ? volume * 1.1 : volume * 0.85
      playPluckNote(note, vol, 5 - idx)
    }, idx * rollDelay)
  })
}

/** Palm-muted / slap strum */
export function playMuteStrum(
  notes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  volume = 0.12
) {
  if (!isStrummingEnabled) return
  notes.slice(0, 4).forEach((note, idx) => {
    setTimeout(() => playPluckNote(note, volume * 0.3, idx), idx * 10)
  })
}

/** Play one stroke of a strum pattern ('D' | 'U' | 'X' | '.') */
export function playPatternBeat(stroke: string, notes: string[], volume = 0.35) {
  if (!isStrummingEnabled) return
  const s = stroke.toUpperCase()
  if      (s === 'D' || s === '↓') playDownStrum(notes, volume)
  else if (s === 'U' || s === '↑') playUpStrum(notes, volume)
  else if (s === 'X' || s === '✕') playMuteStrum(notes, volume)
  // '.' = rest, do nothing
}
