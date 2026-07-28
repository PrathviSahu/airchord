// ── Karplus-Strong Physical String Guitar Synthesis Engine ─────────────────
// Uses the Karplus-Strong algorithm for ultra-realistic plucked guitar sounds.
// Each string is modeled as a vibrating physical string with: 
//   - Initial noise burst (pick excitation)
//   - Delay-line feedback loop with low-pass filtering (string resonance + decay)
//   - Body resonance filters tuned per guitar type
//   - Stereo spread per string

export type GuitarType = 'steel' | 'nylon' | 'electric' | '12string'

let currentGuitarType: GuitarType = 'steel'
let currentCapoFret: number = 0
let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let reverbNode: ConvolverNode | null = null
let reverbGain: GainNode | null = null
let dryGain: GainNode | null = null

let isStrummingEnabled: boolean = true

export function setStrummingEnabled(enabled: boolean) {
  isStrummingEnabled = enabled
  if (enabled) initAudioEngine()
}

export function isStrummingActive(): boolean {
  return isStrummingEnabled
}

export function toggleStrumming(): boolean {
  isStrummingEnabled = !isStrummingEnabled
  if (isStrummingEnabled) initAudioEngine()
  return isStrummingEnabled
}

// Auto-unlock AudioContext on first user interaction
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
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AC) {
      audioCtx = new AC()
      buildMasterChain(audioCtx)
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/** Build master output chain: dryGain ─┬─ masterGain ─► destination
 *                                       └─ reverbGain ─► masterGain      */
function buildMasterChain(ctx: AudioContext) {
  masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.9, ctx.currentTime)
  masterGain.connect(ctx.destination)

  dryGain = ctx.createGain()
  dryGain.gain.setValueAtTime(0.78, ctx.currentTime)
  dryGain.connect(masterGain)

  // Simple reverb using impulse response noise
  reverbNode = buildReverb(ctx)
  reverbGain = ctx.createGain()
  reverbGain.gain.setValueAtTime(0.22, ctx.currentTime)
  reverbNode.connect(reverbGain)
  reverbGain.connect(masterGain)
}

/** Build a simple hall reverb using a noise-based impulse response */
function buildReverb(ctx: AudioContext): ConvolverNode {
  const convolver = ctx.createConvolver()
  const length = ctx.sampleRate * 1.8 // 1.8s reverb tail
  const ir = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5)
    }
  }
  convolver.buffer = ir
  return convolver
}

export function initAudioEngine(): AudioContext | null {
  return getAudioContext()
}

export function setCapoFret(fret: number) {
  currentCapoFret = Math.max(0, Math.min(7, fret))
}
export function getCapoFret(): number { return currentCapoFret }
export function setGuitarType(type: GuitarType) { currentGuitarType = type }
export function getGuitarType(): GuitarType { return currentGuitarType }

// ─── Karplus-Strong Parameters per guitar type ───────────────────────────────
interface KSParams {
  decayFactor: number      // Low-pass blend factor (0=brighter, 1=more mellow)
  stretch: number          // Allpass stretching factor (inharmonicity)
  dynVariance: number      // Random pitch deviation (adds character)
  attackNoise: number      // Initial noise burst length multiplier
  bodyFreq: number         // Body resonance peak Hz
  bodyGain: number         // Body resonance dB gain
  bright: number           // High shelf gain (0..1)
  sustainMult: number      // Overall decay duration multiplier
}

const KS_PARAMS: Record<GuitarType, KSParams> = {
  steel: {
    decayFactor: 0.495,
    stretch: 0.5,
    dynVariance: 0.002,
    attackNoise: 1.0,
    bodyFreq: 200,
    bodyGain: 5.0,
    bright: 0.55,
    sustainMult: 1.0,
  },
  nylon: {
    decayFactor: 0.488,
    stretch: 0.4,
    dynVariance: 0.001,
    attackNoise: 0.7,
    bodyFreq: 120,
    bodyGain: 6.0,
    bright: 0.18,
    sustainMult: 1.15,
  },
  electric: {
    decayFactor: 0.499,
    stretch: 0.6,
    dynVariance: 0.003,
    attackNoise: 1.3,
    bodyFreq: 800,
    bodyGain: 4.0,
    bright: 0.85,
    sustainMult: 1.6,
  },
  '12string': {
    decayFactor: 0.496,
    stretch: 0.52,
    dynVariance: 0.004,
    attackNoise: 1.1,
    bodyFreq: 250,
    bodyGain: 5.5,
    bright: 0.65,
    sustainMult: 1.2,
  },
}

// Standard guitar note frequencies (Hz)
const NOTE_FREQS: Record<string, number> = {
  E2: 82.41, F2: 87.31, 'F#2': 92.50, G2: 98.00, 'G#2': 103.83, A2: 110.00,
  'A#2': 116.54, 'Bb2': 116.54, B2: 123.47, C3: 130.81, 'C#3': 138.59,
  D3: 146.83, 'D#3': 155.56, 'Eb3': 155.56, E3: 164.81, F3: 174.61,
  'F#3': 185.00, G3: 196.00, 'G#3': 207.65, A3: 220.00, 'A#3': 233.08,
  B3: 246.94, C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13,
  'Eb4': 311.13, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.00,
  'G#4': 415.30, A4: 440.00, B4: 493.88, C5: 523.25,
}

// Per-string stereo pan positions (Low E to High E)
const STRING_PANS = [-0.35, -0.22, -0.08, 0.08, 0.22, 0.35]

/**
 * Core Karplus-Strong string synthesis
 * Produces a single realistic plucked string note.
 */
export function playPluckNote(note: string = 'E4', volume = 0.25, stringIndex = 2) {
  if (!isStrummingEnabled) return
  try {
    const ctx = getAudioContext()
    if (!ctx || !dryGain || !reverbNode) return

    const baseFreq = NOTE_FREQS[note] ?? 329.63
    const freq = baseFreq * Math.pow(2, currentCapoFret / 12)
    const p = KS_PARAMS[currentGuitarType]
    const now = ctx.currentTime

    // ── 1. Delay line length in samples ──────────────────────────────────────
    const delayTime = 1 / freq
    // Slight random tuning variance for organic feel
    const actualDelay = delayTime * (1 + (Math.random() - 0.5) * p.dynVariance)

    // ── 2. Initial noise burst (pick/pluck excitation) ───────────────────────
    const noiseLen = Math.round(ctx.sampleRate * actualDelay * 2.5 * p.attackNoise)
    const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)

    // Shaped noise: attack transient + quick decay envelope
    for (let i = 0; i < noiseLen; i++) {
      const env = Math.exp(-i / (noiseLen * 0.3))
      noiseData[i] = (Math.random() * 2 - 1) * env
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer

    // ── 3. Karplus-Strong feedback delay loop ────────────────────────────────
    const delay = ctx.createDelay(0.1)
    delay.delayTime.setValueAtTime(actualDelay, now)

    // Low-pass filter inside feedback loop (models string stiffness & damping)
    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    // Higher cutoff = brighter, more sustain; lower = muffled, faster decay
    const lpfFreq = currentGuitarType === 'nylon' ? 2800
      : currentGuitarType === 'electric' ? 5500
      : currentGuitarType === '12string' ? 4000
      : 3500
    lpf.frequency.setValueAtTime(lpfFreq, now)
    lpf.Q.setValueAtTime(0.6, now)

    // Decay gain in feedback path (controls how long the string rings)
    const feedbackGain = ctx.createGain()
    feedbackGain.gain.setValueAtTime(p.decayFactor * 2, now) // 2x because lowpass halves energy

    // ── 4. All-pass filter (gives inharmonic stretch, more natural)  ─────────
    const allpass = ctx.createBiquadFilter()
    allpass.type = 'allpass'
    allpass.frequency.setValueAtTime(freq * 2.2, now)
    allpass.Q.setValueAtTime(p.stretch, now)

    // ── 5. Output gain envelope ──────────────────────────────────────────────
    const outGain = ctx.createGain()
    const sustainTime = (1 / freq) * 350 * p.sustainMult
    outGain.gain.setValueAtTime(volume * 1.6, now)
    outGain.gain.exponentialRampToValueAtTime(0.0001, now + sustainTime)

    // ── 6. Body resonance filter (guitar body coloring) ─────────────────────
    const bodyEQ = ctx.createBiquadFilter()
    bodyEQ.type = 'peaking'
    bodyEQ.frequency.setValueAtTime(p.bodyFreq, now)
    bodyEQ.gain.setValueAtTime(p.bodyGain, now)
    bodyEQ.Q.setValueAtTime(0.8, now)

    // ── 7. Brightness high-shelf ─────────────────────────────────────────────
    const brightEQ = ctx.createBiquadFilter()
    brightEQ.type = 'highshelf'
    brightEQ.frequency.setValueAtTime(3500, now)
    brightEQ.gain.setValueAtTime(p.bright * 4 - 2, now) // -2dB to +2dB

    // ── 8. Stereo panner ─────────────────────────────────────────────────────
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    if (panner) panner.pan.setValueAtTime(STRING_PANS[stringIndex % 6] ?? 0, now)

    // ── Wire the Karplus-Strong loop ─────────────────────────────────────────
    // noiseSource → delay ─→ lpf → feedbackGain → allpass → delay (loop)
    //                      ↘ outGain → bodyEQ → brightEQ → [panner] → dry+reverb

    noiseSource.connect(delay)          // feed initial noise into delay
    delay.connect(lpf)
    lpf.connect(feedbackGain)
    feedbackGain.connect(allpass)
    allpass.connect(delay)              // close the feedback loop

    delay.connect(outGain)             // also tap output from delay
    outGain.connect(bodyEQ)
    bodyEQ.connect(brightEQ)

    // For 12-string: add a slightly detuned octave-up layer
    if (currentGuitarType === '12string') {
      const osc12 = ctx.createOscillator()
      osc12.frequency.setValueAtTime(freq * 2 * 1.003, now) // octave + tiny sharp
      const osc12Gain = ctx.createGain()
      osc12Gain.gain.setValueAtTime(volume * 0.18, now)
      osc12Gain.gain.exponentialRampToValueAtTime(0.0001, now + sustainTime * 0.6)
      osc12.connect(osc12Gain)
      osc12Gain.connect(brightEQ)
      osc12.start(now)
      osc12.stop(now + sustainTime * 0.6)
    }

    if (panner) {
      brightEQ.connect(panner)
      panner.connect(dryGain)
      panner.connect(reverbNode)
    } else {
      brightEQ.connect(dryGain)
      brightEQ.connect(reverbNode)
    }

    // ── Start / Stop ─────────────────────────────────────────────────────────
    noiseSource.start(now)
    noiseSource.stop(now + actualDelay * 3) // noise burst is short

    // Auto-cleanup after full decay
    setTimeout(() => {
      try {
        delay.disconnect()
        lpf.disconnect()
        feedbackGain.disconnect()
        allpass.disconnect()
        outGain.disconnect()
      } catch { /* already disconnected */ }
    }, (sustainTime + 0.5) * 1000)

  } catch {
    // Silently ignore AudioContext autoplay restriction
  }
}

// ─── Chord voicings ──────────────────────────────────────────────────────────
const CHORD_NOTES: Record<string, string[]> = {
  Em:  ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  Am:  ['A2', 'E3', 'A3', 'C4', 'E4'],
  G:   ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  C:   ['C3', 'E3', 'G3', 'C4', 'E4'],
  D:   ['D3', 'A3', 'D4', 'F#4'],
  F:   ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  B7:  ['B2', 'D#3', 'A3', 'B3', 'F#4'],
  E:   ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  A:   ['A2', 'E3', 'A3', 'C#4', 'E4'],
  Bm:  ['B2', 'F#3', 'B3', 'D4', 'F#4'],
  Dm:  ['D3', 'A3', 'D4', 'F4'],
  'F#m': ['F#2', 'C#3', 'F#3', 'A3', 'C#4', 'F#4'],
  'F#7': ['F#2', 'A#2', 'E3', 'F#3', 'C#4'],
  Bb:  ['A#2', 'F3', 'A#3', 'D4', 'F4'],
  Eb:  ['D#3', 'G#3', 'D#4', 'G4'],
  Ab:  ['G#2', 'D#3', 'G#3', 'C4', 'D#4'],
  Gsus4: ['G2', 'D3', 'G3', 'C4', 'D4'],
  Cadd9: ['C3', 'G3', 'C4', 'D4', 'E4'],
}

export function triggerGuitarChord(chordName: string = 'Em', volume = 0.28) {
  if (!isStrummingEnabled) return
  initAudioEngine()
  const notes = CHORD_NOTES[chordName] || CHORD_NOTES['Em']
  playDownStrum(notes, volume)
}

export function playGuitarChord(chordName: string = 'Em', volume = 0.28) {
  triggerGuitarChord(chordName, volume)
}

/**
 * Down strum: Low E → High E with guitar-realistic pick roll timing
 */
export function playDownStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.28) {
  if (!isStrummingEnabled) return
  const rollMs = currentGuitarType === 'nylon' ? 48
    : currentGuitarType === '12string' ? 38
    : currentGuitarType === 'electric' ? 28
    : 35
  notes.forEach((note, idx) => {
    setTimeout(() => {
      // Bass strings slightly louder for warmth
      const vol = idx < 2 ? volume * 1.2 : idx > 3 ? volume * 0.88 : volume
      playPluckNote(note, vol, idx)
    }, idx * rollMs)
  })
}

/**
 * Up strum: High E → Low E (faster, lighter)
 */
export function playUpStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.22) {
  if (!isStrummingEnabled) return
  const rollMs = currentGuitarType === 'nylon' ? 32 : 22
  const reversed = [...notes].reverse()
  reversed.forEach((note, idx) => {
    setTimeout(() => {
      const vol = idx < 2 ? volume * 0.7 : volume * 0.9
      playPluckNote(note, vol, 5 - idx)
    }, idx * rollMs)
  })
}

/**
 * Mute strum (percussive slap)
 */
export function playMuteStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.14) {
  if (!isStrummingEnabled) return
  notes.slice(0, 4).forEach((note, idx) => {
    setTimeout(() => playPluckNote(note, volume * 0.3, idx), idx * 12)
  })
}

export function playStrum(notes: string[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], volume = 0.28) {
  playDownStrum(notes, volume)
}

/**
 * Play a strum pattern stroke ('D' | 'U' | 'X' | '.')
 */
export function playPatternBeat(stroke: string, notes: string[], volume = 0.28) {
  if (!isStrummingEnabled) return
  const t = stroke.toUpperCase()
  if (t === 'D' || t === '↓') playDownStrum(notes, volume)
  else if (t === 'U' || t === '↑') playUpStrum(notes, volume * 0.85)
  else if (t === 'X' || t === '✕') playMuteStrum(notes, volume)
  // '.' is a rest — silence
}
