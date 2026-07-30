// ── AirChord Audio Engine v3.0 ────────────────────────────────────────────────
// Fixes applied:
//  1. CHORD_NOTES are now 6-element arrays; null = muted string
//  2. D voicing fixed: [null,null,"D3","A3","D4","F#4"]
//  3. B7 voicing fixed: [null,"B2","D#3","A3","B3","F#4"]
//  4. STRING_GAIN table replaces bad (0.6+idx*0.05) formula
//  5. Real strumming: strings fire 12ms apart (down) / 10ms apart (up)
//  6. Per-string brightness lowpass: bass=dark, treble=bright
//  7. Wider stereo image: Low E=-0.40, High e=+0.45
//  8. Per-string attack: bass=9ms snap, treble=2ms snap

export type GuitarType = "steel" | "nylon" | "electric" | "12string"
export type EngineMode = "sampled" | "nylon" | "synth"

// 6 elements: [E2, A2, D3, G3, B3, E4]. null = muted (do not play that string)
export type GuitarVoicing = (string | null)[]

let currentEngineMode: EngineMode = "sampled"
let currentGuitarType: GuitarType = "steel"
let currentCapoFret   = 0
let audioCtx: AudioContext | null = null
let lastPlayedChord   = ""

// ── Engine Interface ─────────────────────────────────────────────────────────
export interface IGuitarEngine {
  id: string
  name: string
  playPluckNote(note: string, volume: number, stringIndex: number, delaySec?: number): void
  playDownStrum(voicing: GuitarVoicing, volume: number): void
  playUpStrum(voicing: GuitarVoicing, volume: number): void
  playMuteStrum(voicing: GuitarVoicing, volume: number): void
}

// ── Shared Master Bus ────────────────────────────────────────────────────────
let masterBuilt = false
let masterOut:  GainNode               | null = null
let compressor: DynamicsCompressorNode | null = null
let reverbConv: ConvolverNode          | null = null
let dryBus:     GainNode               | null = null
let wetBus:     GainNode               | null = null

function buildMaster(ctx: AudioContext) {
  if (masterBuilt) return
  masterBuilt = true
  const sr  = ctx.sampleRate
  const len = Math.floor(sr * 0.9)
  const buf = ctx.createBuffer(2, len, sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2)
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

// ── Audio Context ────────────────────────────────────────────────────────────
let isStrummingEnabled = true

export function setStrummingEnabled(e: boolean) { isStrummingEnabled = e; if (e) initAudioEngine() }
export function isStrummingActive()              { return isStrummingEnabled }
export function toggleStrumming() {
  isStrummingEnabled = !isStrummingEnabled
  if (isStrummingEnabled) initAudioEngine()
  return isStrummingEnabled
}

export function initAudioEngine(): AudioContext | null {
  const ctx = getAudioContext()
  if (ctx?.state === "suspended") ctx.resume().catch(() => {})
  if (ctx) { buildMaster(ctx); preloadCommonSamples(ctx) }
  return ctx
}

if (typeof window !== "undefined") {
  const unlock = () => {
    initAudioEngine()
    window.removeEventListener("click",      unlock)
    window.removeEventListener("keydown",    unlock)
    window.removeEventListener("touchstart", unlock)
  }
  window.addEventListener("click",      unlock)
  window.addEventListener("keydown",    unlock)
  window.addEventListener("touchstart", unlock)
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AC = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AC) audioCtx = new AC()
  }
  if (audioCtx?.state === "suspended") audioCtx.resume().catch(() => {})
  return audioCtx
}

export function setCapoFret(fret: number)    { currentCapoFret   = Math.max(0, Math.min(7, fret)) }
export function getCapoFret()                { return currentCapoFret }
export function setGuitarType(t: GuitarType) { currentGuitarType = t }
export function getGuitarType()              { return currentGuitarType }
export function setEngineMode(m: EngineMode) { currentEngineMode = m }
export function getEngineMode(): EngineMode  { return currentEngineMode }

// ── Note Frequencies ─────────────────────────────────────────────────────────
const NOTE_FREQS: Record<string, number> = {
  E2:82.41, F2:87.31, "F#2":92.50, G2:98.00, "G#2":103.83,
  A2:110.0, "A#2":116.54, B2:123.47,
  C3:130.81, "C#3":138.59, D3:146.83, "D#3":155.56,
  E3:164.81, F3:174.61, "F#3":185.00, G3:196.0, "G#3":207.65,
  A3:220.0, "A#3":233.08, B3:246.94,
  C4:261.63, "C#4":277.18, D4:293.66, "D#4":311.13, E4:329.63,
  F4:349.23, "F#4":369.99, G4:392.0, "G#4":415.30,
  A4:440.0, B4:493.88, C5:523.25,
}

// ── Per-String Physics (index 0=Low E ... 5=High e) ──────────────────────────

// Bug Fix #4: real loudness curve — G string is most resonant on acoustic
const STRING_GAIN = [
  0.55,  // Low E  — solid, not too loud
  0.62,  // A      — warm and full
  0.78,  // D      — midrange punch
  0.92,  // G      — most resonant on acoustic
  0.86,  // B      — bright and singing
  0.80,  // High e — clear, slightly quieter than G
]

// Bug Fix #6: per-string tone brightness lowpass cutoff (Hz)
const STRING_BRIGHTNESS = [
  700,   // Low E  — very dark/warm
  1100,  // A
  1800,  // D
  3200,  // G
  5000,  // B
  8000,  // High e — full brightness
]

// Bug Fix #8: per-string attack time (ms) — bass strings have heavier pick attack
const STRING_ATTACK = [
  0.009, // Low E
  0.007, // A
  0.005, // D
  0.004, // G
  0.003, // B
  0.002, // High e
]

// Decay per string: bass strings ring longer
const STRING_DECAY_MUL = [1.45, 1.25, 1.00, 0.88, 0.78, 0.68]

// Bug Fix #7: wider stereo — bass hard-left, treble hard-right
const STRING_PANS = [-0.40, -0.22, 0.00, 0.20, 0.35, 0.45]

// ── Strum Engine ─────────────────────────────────────────────────────────────
// Bug Fix #5: 12ms between strings on downstroke, 10ms on upstroke
// Uses AudioContext scheduling (not setTimeout) for sample-accurate timing
const DOWN_DELAY_MS = 12
const UP_DELAY_MS   = 10

function scheduleStrum(
  voicing: GuitarVoicing,
  volume: number,
  downstroke: boolean,
  playFn: (note: string, vol: number, strIdx: number, delaySec: number) => void
) {
  const order   = downstroke ? [0,1,2,3,4,5] : [5,4,3,2,1,0]
  const delayMs = downstroke ? DOWN_DELAY_MS : UP_DELAY_MS
  let hit = 0
  order.forEach(si => {
    const note = voicing[si]
    if (note === null) return
    const humanGain   = STRING_GAIN[si] * volume * (0.88 + Math.random() * 0.24)
    const jitterMs    = Math.random() * 2.5
    const delaySec    = (hit * delayMs + jitterMs) / 1000
    const strokeScale = downstroke ? 1.0 : 0.82
    hit++
    playFn(note, humanGain * strokeScale, si, delaySec)
  })
}

// ── Fret Scratch Noise ────────────────────────────────────────────────────────
function playFretScratchNoise(ctx: AudioContext) {
  try {
    const now = ctx.currentTime
    const len = Math.round(ctx.sampleRate * 0.035)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d   = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len)
    const src  = ctx.createBufferSource(); src.buffer = buf
    const filt = ctx.createBiquadFilter(); filt.type = "highpass"; filt.frequency.value = 4500
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
    src.connect(filt); filt.connect(gain); gain.connect(dryBus!)
    src.start(now)
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER 1 — SynthGuitarEngine
// ─────────────────────────────────────────────────────────────────────────────
interface GuitarPreset { chorus: number; decayBase: number; bodyLow: number; bodyMid: number; bodyGain: number; shelfGain: number }

const PRESETS: Record<GuitarType, GuitarPreset> = {
  steel:      { chorus: 3,  decayBase: 2.0, bodyLow: 120,  bodyMid: 1800, bodyGain: 5.5, shelfGain: 1.5 },
  nylon:      { chorus: 2,  decayBase: 1.5, bodyLow: 90,   bodyMid: 900,  bodyGain: 4.5, shelfGain: -1.5 },
  electric:   { chorus: 4,  decayBase: 2.8, bodyLow: 600,  bodyMid: 3200, bodyGain: 3.0, shelfGain: 2.5 },
  "12string": { chorus: 6,  decayBase: 2.3, bodyLow: 130,  bodyMid: 2000, bodyGain: 5.0, shelfGain: 2.0 },
}

const waveCache: Partial<Record<GuitarType, PeriodicWave>> = {}
function buildGuitarWave(ctx: AudioContext, type: GuitarType): PeriodicWave {
  if (waveCache[type]) return waveCache[type]!
  const C: Record<GuitarType, { r: number[]; i: number[] }> = {
    nylon:      { r:[0,1.0,0.50,0.20,0.08,0.03,0.01], i:[0,0,0.04,0.03,0.02,0.01,0] },
    electric:   { r:[0,1.0,0.82,0.65,0.46,0.30,0.18,0.10,0.05,0.02], i:[0,0,0.10,0.08,0.06,0.04,0.02,0.01,0.01,0] },
    "12string": { r:[0,1.0,0.76,0.50,0.30,0.18,0.10,0.05,0.02], i:[0,0,0.08,0.06,0.04,0.02,0.01,0.01,0] },
    steel:      { r:[0,1.0,0.70,0.42,0.26,0.15,0.09,0.05,0.03,0.01], i:[0,0,0.07,0.05,0.03,0.02,0.01,0,0,0] },
  }
  const { r, i } = C[type]
  const wave = ctx.createPeriodicWave(new Float32Array(r), new Float32Array(i), { disableNormalization: false })
  waveCache[type] = wave
  return wave
}

class SynthGuitarEngine implements IGuitarEngine {
  id   = "synth"
  name = "Classic Synth Guitar"

  playPluckNote(note = "E4", volume = 0.22, stringIndex = 2, delaySec = 0) {
    if (!isStrummingEnabled) return
    try {
      const ctx = getAudioContext(); if (!ctx) return
      buildMaster(ctx)
      const type   = currentGuitarType
      const preset = PRESETS[type]
      const baseHz = NOTE_FREQS[note] ?? 329.63
      const freq   = baseHz * Math.pow(2, currentCapoFret / 12)
      const now    = ctx.currentTime + delaySec
      const si     = Math.max(0, Math.min(5, stringIndex))
      const jitter = Math.pow(2, ((Math.random() - 0.5) * 6) / 1200)
      const target = freq * jitter
      const spike  = target * (1 + 0.006 * (volume / 0.35))
      const decay  = preset.decayBase * STRING_DECAY_MUL[si]
      const attack = STRING_ATTACK[si]
      const wave = buildGuitarWave(ctx, type)
      const cr   = Math.pow(2, preset.chorus / 1200)
      const oscs = [ctx.createOscillator(), ctx.createOscillator(), ctx.createOscillator()]
      oscs.forEach(o => o.setPeriodicWave(wave))
      oscs[0].frequency.setValueAtTime(spike,      now); oscs[0].frequency.exponentialRampToValueAtTime(target,      now + 0.035)
      oscs[1].frequency.setValueAtTime(spike * cr, now); oscs[1].frequency.exponentialRampToValueAtTime(target * cr, now + 0.035)
      oscs[2].frequency.setValueAtTime(spike / cr, now); oscs[2].frequency.exponentialRampToValueAtTime(target / cr, now + 0.035)
      const mixes = [0.52, 0.24, 0.24].map(v => { const g = ctx.createGain(); g.gain.value = v; return g })
      oscs.forEach((o, k) => o.connect(mixes[k]))
      const toneLP = ctx.createBiquadFilter()
      toneLP.type = "lowpass"; toneLP.frequency.value = STRING_BRIGHTNESS[si]; toneLP.Q.value = 0.5
      const bodyLo = ctx.createBiquadFilter()
      bodyLo.type = "peaking"; bodyLo.frequency.value = preset.bodyLow; bodyLo.Q.value = 1.6
      bodyLo.gain.value = preset.bodyGain * (si <= 1 ? 1.0 : si === 2 ? 0.35 : 0.05)
      const bodyHi = ctx.createBiquadFilter()
      bodyHi.type = "peaking"; bodyHi.frequency.value = preset.bodyMid; bodyHi.Q.value = 1.0; bodyHi.gain.value = 2.5
      const shelf = ctx.createBiquadFilter()
      shelf.type = "highshelf"; shelf.frequency.value = 3500; shelf.gain.value = preset.shelfGain
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, now)
      env.gain.linearRampToValueAtTime(volume, now + attack)
      env.gain.exponentialRampToValueAtTime(volume * 0.42, now + 0.08)
      env.gain.exponentialRampToValueAtTime(0.0001, now + decay)
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
      pan?.pan.setValueAtTime(STRING_PANS[si], now)
      mixes.forEach(m => m.connect(toneLP))
      toneLP.connect(bodyLo); bodyLo.connect(bodyHi); bodyHi.connect(shelf); shelf.connect(env)
      const out: AudioNode = pan ? (env.connect(pan), pan) : env
      out.connect(dryBus!); out.connect(wetBus!)
      const stopAt = now + decay + 0.05
      oscs.forEach(o => { o.start(now); o.stop(stopAt) })
    } catch { /* ignore */ }
  }

  playDownStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, true, (n, v, si, d) => this.playPluckNote(n, v, si, d))
  }
  playUpStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, false, (n, v, si, d) => this.playPluckNote(n, v, si, d))
  }
  playMuteStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    let hit = 0
    voicing.forEach((note, si) => {
      if (note === null || hit >= 4) return
      const d = (hit * 10 + Math.random() * 2) / 1000
      this.playPluckNote(note, volume * STRING_GAIN[si] * 0.20, si, d)
      hit++
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER 2 — SampledGuitarEngine
// ─────────────────────────────────────────────────────────────────────────────
const sampleCache: Record<string, AudioBuffer> = {}

// All notes used in chord voicings (D#3 for B7 is now included)
const COMMON_NOTES = [
  "E2","F2","F#2","G2","G#2","A2","A#2","B2",
  "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
  "C4","C#4","D4","D#4","E4","F4","F#4","G4","A4","B4",
]

async function preloadCommonSamples(ctx: AudioContext) {
  for (const n of COMMON_NOTES) {
    if (sampleCache[n]) continue
    try {
      const url  = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/" + n.replace("#","s") + ".mp3"
      const resp = await fetch(url, { mode: "cors" }).catch(() => null)
      if (!resp?.ok) continue
      const ab  = await resp.arrayBuffer().catch(() => null)
      if (!ab)  continue
      const dec = await ctx.decodeAudioData(ab).catch(() => null)
      if (dec)  sampleCache[n] = dec
    } catch { /* silent */ }
  }
}

class SampledGuitarEngine implements IGuitarEngine {
  id   = "sampled"
  name = "Studio Acoustic (Sampled)"
  private synth = new SynthGuitarEngine()

  private async loadNote(ctx: AudioContext, note: string): Promise<AudioBuffer | null> {
    if (sampleCache[note]) return sampleCache[note]
    try {
      const url  = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/" + note.replace("#","s") + ".mp3"
      const resp = await fetch(url, { mode: "cors" }).catch(() => null)
      if (!resp?.ok) return null
      const ab   = await resp.arrayBuffer().catch(() => null)
      if (!ab)   return null
      const dec  = await ctx.decodeAudioData(ab).catch(() => null)
      if (dec)   sampleCache[note] = dec
      return dec
    } catch { return null }
  }

  playPluckNote(note = "E4", volume = 0.22, stringIndex = 2, delaySec = 0) {
    if (!isStrummingEnabled) return
    const ctx = getAudioContext(); if (!ctx) return
    buildMaster(ctx)
    const si  = Math.max(0, Math.min(5, stringIndex))
    const now = ctx.currentTime + delaySec
    const buf = sampleCache[note]
    if (buf) {
      try {
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = Math.pow(2, currentCapoFret / 12)
        const lp = ctx.createBiquadFilter()
        lp.type = "lowpass"; lp.frequency.value = STRING_BRIGHTNESS[si]; lp.Q.value = 0.5
        const gn = ctx.createGain(); gn.gain.setValueAtTime(volume, now)
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
        pan?.pan.setValueAtTime(STRING_PANS[si], now)
        src.connect(lp); lp.connect(gn)
        const out: AudioNode = pan ? (gn.connect(pan), pan) : gn
        out.connect(dryBus!); out.connect(wetBus!)
        src.start(now)
      } catch {
        this.synth.playPluckNote(note, volume, stringIndex, delaySec)
      }
    } else {
      this.loadNote(ctx, note).catch(() => {})
      this.synth.playPluckNote(note, volume, stringIndex, delaySec)
    }
  }

  playDownStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, true, (n, v, si, d) => this.playPluckNote(n, v, si, d))
  }
  playUpStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    scheduleStrum(voicing, volume, false, (n, v, si, d) => this.playPluckNote(n, v, si, d))
  }
  playMuteStrum(voicing: GuitarVoicing, volume: number) {
    if (!isStrummingEnabled) return
    let hit = 0
    voicing.forEach((note, si) => {
      if (note === null || hit >= 4) return
      const d = (hit * 10 + Math.random() * 2) / 1000
      this.playPluckNote(note, volume * STRING_GAIN[si] * 0.20, si, d)
      hit++
    })
  }
}

// ── Engine Registry ──────────────────────────────────────────────────────────
const synthEngine   = new SynthGuitarEngine()
const sampledEngine = new SampledGuitarEngine()

function getActiveEngine(): IGuitarEngine {
  if (currentEngineMode === "nylon")   { setGuitarType("nylon");  return synthEngine }
  if (currentEngineMode === "sampled") { setGuitarType("steel");  return sampledEngine }
  setGuitarType("steel"); return synthEngine
}

// ── Chord Voicing Table ───────────────────────────────────────────────────────
// 6 elements always. null = muted. Order: [E2, A2, D3, G3, B3, E4]
export const CHORD_NOTES: Record<string, GuitarVoicing> = {
  // Open Major
  C:       [null,  "C3",  "E3",  "G3",  "C4",  "E4"],
  D:       [null,  null,  "D3",  "A3",  "D4",  "F#4"],
  E:       ["E2",  "B2",  "E3",  "G#3", "B3",  "E4"],
  F:       ["F2",  "C3",  "F3",  "A3",  "C4",  "F4"],
  G:       ["G2",  "B2",  "D3",  "G3",  "B3",  "G4"],
  A:       [null,  "A2",  "E3",  "A3",  "C#4", "E4"],
  B:       [null,  "B2",  "F#3", "B3",  "D#4", "F#4"],
  // Open Minor
  Cm:      [null,  "C3",  "G3",  "C4",  "D#4", "G4"],
  Dm:      [null,  null,  "D3",  "A3",  "D4",  "F4"],
  Em:      ["E2",  "B2",  "E3",  "G3",  "B3",  "E4"],
  Fm:      ["F2",  "C3",  "F3",  "G#3", "C4",  "F4"],
  Gm:      ["G2",  "D3",  "G3",  "A#3", "D4",  "G4"],
  Am:      [null,  "A2",  "E3",  "A3",  "C4",  "E4"],
  Bm:      [null,  "B2",  "F#3", "B3",  "D4",  "F#4"],
  // Dominant 7th
  C7:      [null,  "C3",  "E3",  "A#3", "C4",  "E4"],
  D7:      [null,  null,  "D3",  "A3",  "C4",  "F#4"],
  E7:      ["E2",  "B2",  "D3",  "G#3", "B3",  "E4"],
  F7:      ["F2",  "C3",  "D#3", "A3",  "C4",  "F4"],
  G7:      ["G2",  "B2",  "D3",  "G3",  "B3",  "F4"],
  A7:      [null,  "A2",  "E3",  "G3",  "C#4", "E4"],
  B7:      [null,  "B2",  "D#3", "A3",  "B3",  "F#4"],
  // Sharps & Flats
  "F#":    ["F#2", "C#3", "F#3", "A#3", "C#4", "F#4"],
  "F#m":   ["F#2", "C#3", "F#3", "A3",  "C#4", "F#4"],
  "F#7":   ["F#2", "C#3", "E3",  "A#3", "C#4", "F#4"],
  Bb:      [null,  "A#2", "F3",  "A#3", "D4",  "F4"],
  Eb:      [null,  null,  "D#3", "A#3", "D#4", "G4"],
  Ab:      ["G#2", "D#3", "G#3", "C4",  "D#4", "G#4"],
  // Extended & Suspended
  Am7:     [null,  "A2",  "E3",  "G3",  "C4",  "E4"],
  Cadd9:   [null,  "C3",  "E3",  "G3",  "D4",  "E4"],
  Gsus4:   ["G2",  "B2",  "D3",  "G3",  "C4",  "G4"],
  Dsus2:   [null,  null,  "D3",  "A3",  "D4",  "E4"],
  Dsus4:   [null,  null,  "D3",  "A3",  "D4",  "G4"],
}

const DEFAULT_VOICING: GuitarVoicing = ["E2", "B2", "E3", "G3", "B3", "E4"]

// ── Public API ───────────────────────────────────────────────────────────────
export function playPluckNote(note = "E4", volume = 0.22, stringIndex = 2) {
  initAudioEngine()
  getActiveEngine().playPluckNote(note, volume, stringIndex, 0)
}

export function triggerGuitarChord(chordName = "Em", volume = 0.32) {
  if (!isStrummingEnabled) return
  const ctx = getAudioContext()
  if (ctx && lastPlayedChord !== "" && lastPlayedChord !== chordName) {
    playFretScratchNoise(ctx)
  }
  lastPlayedChord = chordName
  initAudioEngine()
  const voicing = CHORD_NOTES[chordName] ?? DEFAULT_VOICING
  getActiveEngine().playDownStrum(voicing, volume)
}

export function playGuitarChord(chordName = "Em", volume = 0.32) {
  triggerGuitarChord(chordName, volume)
}

export function playStrum(voicing: GuitarVoicing, volume = 0.32) {
  getActiveEngine().playDownStrum(voicing, volume)
}

export function playDownStrum(voicing: GuitarVoicing, volume = 0.32) {
  getActiveEngine().playDownStrum(voicing, volume)
}

export function playUpStrum(voicing: GuitarVoicing, volume = 0.28) {
  getActiveEngine().playUpStrum(voicing, volume)
}

export function playMuteStrum(voicing: GuitarVoicing, volume = 0.12) {
  getActiveEngine().playMuteStrum(voicing, volume)
}

export function playPatternBeat(stroke: string, voicing: GuitarVoicing, volume = 0.32) {
  if (!isStrummingEnabled) return
  const s = stroke.toUpperCase()
  if      (s === "D" || s === "↓") playDownStrum(voicing, volume)
  else if (s === "U" || s === "↑") playUpStrum(voicing, volume)
  else if (s === "X" || s === "✕") playMuteStrum(voicing, volume)
}
