// ── Guitar Sound Engine — Karplus-Strong String Synthesis ───────────────────
// Karplus-Strong is the standard algorithm for realistic plucked string sound.
// A noise burst excites a delay line whose period matches the desired pitch.
// A one-pole low-pass filter in the feedback loop models string damping.
// This produces the characteristic attack transient + exponential harmonic decay
// of a real plucked string, far more convincingly than oscillator-based synthesis.

export type GuitarType = 'steel' | 'nylon' | 'electric' | '12string'

let currentGuitarType: GuitarType = 'steel'
let currentCapoFret:   number     = 0
let audioCtx:          AudioContext | null = null

// ── Master chain: compressor → reverb mix → output ──────────────────────────
let masterGainNode:   GainNode | null = null
let masterCompressor: DynamicsCompressorNode | null = null
let reverbNode:       ConvolverNode | null = null
let reverbReturn:     GainNode | null = null
let dryReturn:        GainNode | null = null
let masterChainBuilt  = false

/** Synthetic plate reverb impulse response */
function buildReverb(ctx: AudioContext): ConvolverNode {
  const sr     = ctx.sampleRate
  const dur    = 1.6                           // reverb tail length (s)
  const decay  = 4.0                           // how fast it fades
  const len    = Math.floor(sr * dur)
  const buf    = ctx.createBuffer(2, len, sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-(decay * i) / len)
    }
  }
  const conv = ctx.createConvolver()
  conv.buffer = buf
  return conv
}

function buildMasterChain(ctx: AudioContext) {
  if (masterChainBuilt) return

  // Reverb
  reverbNode   = buildReverb(ctx)
  reverbReturn = ctx.createGain()
  reverbReturn.gain.value = 0.18              // 18% wet reverb

  // Dry
  dryReturn = ctx.createGain()
  dryReturn.gain.value = 1.0

  // Compressor / limiter
  masterCompressor = ctx.createDynamicsCompressor()
  masterCompressor.threshold.value = -14
  masterCompressor.knee.value      = 8
  masterCompressor.ratio.value     = 4
  masterCompressor.attack.value    = 0.002
  masterCompressor.release.value   = 0.12

  // Master gain
  masterGainNode = ctx.createGain()
  masterGainNode.gain.value = 0.68

  // Wiring
  dryReturn.connect(masterCompressor)
  reverbReturn.connect(reverbNode)
  reverbNode.connect(masterCompressor)
  masterCompressor.connect(masterGainNode)
  masterGainNode.connect(ctx.destination)

  masterChainBuilt = true
}

// ── Strumming enabled flag ───────────────────────────────────────────────────
let isStrummingEnabled = true

export function setStrummingEnabled(enabled: boolean) {
  isStrummingEnabled = enabled
  if (enabled) initAudioEngine()
}
export function isStrummingActive() { return isStrummingEnabled }
export function toggleStrumming()   {
  isStrummingEnabled = !isStrummingEnabled
  if (isStrummingEnabled) initAudioEngine()
  return isStrummingEnabled
}

export function initAudioEngine(): AudioContext | null {
  const ctx = getAudioContext()
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
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
    if (AC) { audioCtx = new AC() }
  }
  if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

export function setCapoFret(fret: number) { currentCapoFret   = Math.max(0, Math.min(7, fret)) }
export function getCapoFret()             { return currentCapoFret }
export function setGuitarType(t: GuitarType) { currentGuitarType = t }
export function getGuitarType()           { return currentGuitarType }

// ── Note frequency table ─────────────────────────────────────────────────────
const NOTE_FREQS: Record<string, number> = {
  E2: 82.41,  F2: 87.31,  'F#2': 92.50,  G2: 98.00,
  'G#2': 103.83, 'A#2': 116.54,
  A2: 110.0,  B2: 123.47, C3: 130.81, 'C#3': 138.59,
  D3: 146.83, 'D#3': 155.56, E3: 164.81, F3: 174.61,
  'F#3': 185.00, G3: 196.0,  'G#3': 207.65, A3: 220.0,
  B3: 246.94, C4: 261.63, 'C#4': 277.18, D4: 293.66,
  E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.0,
  A4: 440.0,  B4: 493.88, C5: 523.25,
}

// String stereo spread
const STRING_PANS = [-0.28, -0.16, -0.05, 0.05, 0.16, 0.28]

// ── Karplus-Strong pluck synthesizer ─────────────────────────────────────────
// Based on: Karplus & Strong (1983) "Digital Synthesis of Plucked-String and Drum Timbres"
export function playPluckNote(note = 'E4', volume = 0.2, stringIndex = 2) {
  if (!isStrummingEnabled) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    buildMasterChain(ctx)

    const type    = currentGuitarType
    const baseHz  = NOTE_FREQS[note] ?? 329.63
    const freq    = baseHz * Math.pow(2, currentCapoFret / 12)
    const sr      = ctx.sampleRate
    const now     = ctx.currentTime

    // ── Karplus-Strong parameters per guitar type ──────────────────────
    // dampCoeff: how much the low-pass filter damps each cycle (0=none, 1=full)
    // stretchFactor: controls the decay rate
    // noiseColor: bandpass center for the excitation burst
    const ksParams = {
      steel:    { damp: 0.495, stretch: 0.5, noiseCF: 1200, noiseQ: 0.8, dur: 3.5 },
      nylon:    { damp: 0.490, stretch: 0.5, noiseCF:  700, noiseQ: 0.6, dur: 3.0 },
      electric: { damp: 0.498, stretch: 0.5, noiseCF: 2400, noiseQ: 1.2, dur: 4.5 },
      '12string': { damp: 0.496, stretch: 0.5, noiseCF: 1400, noiseQ: 0.9, dur: 4.0 },
    }
    const p = ksParams[type]

    // ── Delay line length = 1 period of the target frequency ──────────
    const delayLen = 1 / freq                  // seconds per cycle

    // ── Excitation burst: short noise shaped by a bandpass filter ──────
    const burstDur = Math.min(0.05, delayLen * 3) // at most 50ms
    const burstLen = Math.ceil(sr * burstDur)
    const burstBuf = ctx.createBuffer(1, burstLen, sr)
    const burstData = burstBuf.getChannelData(0)
    for (let i = 0; i < burstLen; i++) {
      // Noise with a fast fade-in and fade-out window
      const env = Math.sin(Math.PI * i / burstLen)
      burstData[i] = (Math.random() * 2 - 1) * env
    }

    const burstSrc = ctx.createBufferSource()
    burstSrc.buffer = burstBuf

    // Bandpass colours the excitation (picks vs fingernails vs fingers)
    const exciteBP = ctx.createBiquadFilter()
    exciteBP.type = 'bandpass'
    exciteBP.frequency.value = p.noiseCF
    exciteBP.Q.value         = p.noiseQ

    // Gain for the excitation burst
    const burstGain = ctx.createGain()
    burstGain.gain.setValueAtTime(volume * 2.5, now)
    burstGain.gain.exponentialRampToValueAtTime(0.0001, now + burstDur + 0.01)

    // ── Feedback delay loop (the Karplus-Strong core) ─────────────────
    const delay = ctx.createDelay(1.0)
    delay.delayTime.value = delayLen

    // One-pole low-pass in the feedback path — models string damping
    const lpf = ctx.createBiquadFilter()
    lpf.type            = 'lowpass'
    lpf.frequency.value = type === 'electric' ? sr * 0.48 : type === 'nylon' ? sr * 0.38 : sr * 0.44
    lpf.Q.value         = 0.0          // flat LPF (no resonance peak)

    // Feedback gain < 1.0 to ensure the loop decays
    const fbGain = ctx.createGain()
    fbGain.gain.value = p.damp         // ~0.495 → realistic string decay

    // ── Body resonance: gives the 'box' acoustic character ───────────
    // Low-mid air cavity warmth
    const body1 = ctx.createBiquadFilter()
    body1.type            = 'peaking'
    body1.frequency.value = type === 'electric' ? 600 : 130
    body1.Q.value         = 1.0
    body1.gain.value      = type === 'electric' ? 3.0 : 6.0

    // Upper presence / string brightness
    const body2 = ctx.createBiquadFilter()
    body2.type            = 'peaking'
    body2.frequency.value = type === 'nylon' ? 800 : type === 'electric' ? 3200 : 1600
    body2.Q.value         = 1.2
    body2.gain.value      = 2.5

    // Gentle high-shelf for air
    const shelf = ctx.createBiquadFilter()
    shelf.type            = 'highshelf'
    shelf.frequency.value = 5000
    shelf.gain.value      = type === 'nylon' ? -2.5 : 1.0

    // ── Output gain with fast fade-out at end of decay ────────────────
    const outGain = ctx.createGain()
    outGain.gain.setValueAtTime(volume, now)
    outGain.gain.setValueAtTime(volume, now + p.dur - 0.2)
    outGain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur)

    // ── Stereo panner ────────────────────────────────────────────────
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    panner?.pan.setValueAtTime(STRING_PANS[stringIndex % 6] ?? 0, now)

    // ── Signal routing ────────────────────────────────────────────────
    // Excitation → Karplus-Strong loop
    burstSrc.connect(exciteBP)
    exciteBP.connect(burstGain)
    burstGain.connect(delay)

    // KS feedback: delay → LPF → fbGain → delay (loop)
    delay.connect(lpf)
    lpf.connect(fbGain)
    fbGain.connect(delay)       // closed feedback loop

    // KS output → body EQ → output gain → panner → master
    delay.connect(body1)
    body1.connect(body2)
    body2.connect(shelf)
    shelf.connect(outGain)

    const preOut: AudioNode = panner
      ? (outGain.connect(panner), panner)
      : outGain

    preOut.connect(dryReturn!)
    preOut.connect(reverbReturn!)   // reverb send

    // ── Play ──────────────────────────────────────────────────────────
    burstSrc.start(now)
    burstSrc.stop(now + burstDur + 0.02)

    // Schedule feedback loop shutdown after decay to free nodes
    setTimeout(() => {
      try {
        fbGain.gain.setValueAtTime(0, 0)  // break the loop
      } catch { /* already gone */ }
    }, (p.dur + 0.5) * 1000)

  } catch {
    /* Ignore autoplay restriction */
  }
}

// ── Chord note maps ──────────────────────────────────────────────────────────
const CHORD_NOTES: Record<string, string[]> = {
  Em:    ['E2', 'B2', 'E3', 'G3',  'B3', 'E4'],
  Am:    ['A2', 'E3', 'A3', 'C4',  'E4'],
  C:     ['C3', 'E3', 'G3', 'C4',  'E4'],
  D:     ['D3', 'A3', 'D4', 'F#4'],
  G:     ['G2', 'B2', 'D3', 'G3',  'B3', 'G4'],
  F:     ['F2', 'C3', 'F3', 'A3',  'C4', 'F4'],
  B7:    ['B2', 'D#3','A3', 'B3',  'F#4'],
  E:     ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  A:     ['A2', 'E3', 'A3', 'C#4', 'E4'],
  Bm:    ['B2', 'F#3','B3', 'D4',  'F#4'],
  Dm:    ['D3', 'A3', 'D4', 'F4'],
  'F#m': ['F#2','C#3','F#3','A3',  'C#4','F#4'],
  'F#7': ['F#2','A#2','E3', 'F#3', 'C#4'],
}

// ── Public strum API ─────────────────────────────────────────────────────────

export function triggerGuitarChord(chordName = 'Em', volume = 0.32) {
  if (!isStrummingEnabled) return
  initAudioEngine()
  const notes = CHORD_NOTES[chordName] || CHORD_NOTES['Em']
  playDownStrum(notes, volume)
}

export function playGuitarChord(chordName = 'Em', volume = 0.32) {
  triggerGuitarChord(chordName, volume)
}

export function playStrum(
  notes = ['E2','A2','D3','G3','B3','E4'],
  volume = 0.32
) { playDownStrum(notes, volume) }

/** Downstrum: Low E → High e */
export function playDownStrum(
  notes = ['E2','A2','D3','G3','B3','E4'],
  volume = 0.32
) {
  if (!isStrummingEnabled) return
  // Strum roll delay: nylon strings slightly slower (finger vs pick)
  const roll = currentGuitarType === 'nylon' ? 42 : currentGuitarType === '12string' ? 30 : 34
  notes.forEach((note, idx) => {
    setTimeout(() => {
      // Bass strings slightly louder, treble strings slightly softer
      const vol = idx < 2 ? volume * 1.18 : idx > 3 ? volume * 0.88 : volume
      playPluckNote(note, vol, idx)
    }, idx * roll)
  })
}

/** Upstrum: High e → Low E */
export function playUpStrum(
  notes = ['E2','A2','D3','G3','B3','E4'],
  volume = 0.28
) {
  if (!isStrummingEnabled) return
  const roll = currentGuitarType === 'nylon' ? 32 : 24
  const rev  = [...notes].reverse()
  rev.forEach((note, idx) => {
    setTimeout(() => {
      const vol = idx < 3 ? volume * 1.05 : volume * 0.82
      playPluckNote(note, vol, 5 - idx)
    }, idx * roll)
  })
}

/** Palm-muted / slap strum */
export function playMuteStrum(
  notes = ['E2','A2','D3','G3','B3','E4'],
  volume = 0.12
) {
  if (!isStrummingEnabled) return
  notes.slice(0, 4).forEach((note, idx) => {
    setTimeout(() => playPluckNote(note, volume * 0.28, idx), idx * 10)
  })
}

/** Play one stroke step of a strum pattern */
export function playPatternBeat(stroke: string, notes: string[], volume = 0.32) {
  if (!isStrummingEnabled) return
  const s = stroke.toUpperCase()
  if      (s === 'D' || s === '↓') playDownStrum(notes, volume)
  else if (s === 'U' || s === '↑') playUpStrum(notes, volume)
  else if (s === 'X' || s === '✕') playMuteStrum(notes, volume)
  // '.' = rest
}
