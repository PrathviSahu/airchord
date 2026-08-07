// ── Session Setup ─────────────────────────────────────────────────────────────
// Studio monochrome redesign. Same functionality, calmer hierarchy:
// lyrics + chord map on the left, grouped session controls on the right.

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, RotateCcw, Check, SlidersHorizontal } from 'lucide-react'
import type { Song } from '../utils/songLibrary'
import {
  getEngineMode,
  setEngineMode,
  getGuitarType,
  setGuitarType,
  EngineMode,
  GuitarType,
  initAudioEngine,
  triggerGuitarChord,
  playPatternBeat,
  CHORD_NOTES,
} from '../utils/guitarSound'

// ── Strum pattern presets ─────────────────────────────────────────────
const STRUM_PRESETS = [
  { name: 'Island Pop',  pattern: ['D','D','U','U','D','U'], display: '↓ ↓ ↑ ↑ ↓ ↑' },
  { name: 'Rock 4/4',   pattern: ['D','D','D','D'],         display: '↓ ↓ ↓ ↓' },
  { name: 'Basic Folk', pattern: ['D','D','U','D','U'],     display: '↓ ↓ ↑ ↓ ↑' },
  { name: 'Waltz 3/4',  pattern: ['D','U','U','D','U','U'],display: '↓ ↑ ↑ ↓ ↑ ↑' },
  { name: 'Slow Ballad',pattern: ['D','.','D','U','.','U'],  display: '↓ • ↓ ↑ • ↑' },
]

const ALL_CHORDS = [
  'Em','Am','G','C','D','F','E','A','Dm','B7','G7','D7','E7','A7',
  'Bm','Fm','Gm','Cm','C#m','F#m','Bb','Eb','Ab','B','F#','Gsus4','Cadd9','Am7',
]

const SECTION_COLORS: Record<string, string> = {
  Intro:  'rgba(143,183,232,0.85)',
  Verse:  'rgba(255,255,255,0.55)',
  Chorus: 'rgba(227,200,120,0.9)',
  Bridge: 'rgba(217,168,110,0.85)',
  Outro:  'rgba(217,138,138,0.85)',
}

const STROKE_ALIASES: Record<string, string> = {
  D: 'D', '↓': 'D', U: 'U', '↑': 'U', X: 'X', '✕': 'X', '.': '.', '•': '.',
}

function parseCustomPattern(input: string, fallback: string[]) {
  const parsed = input
    .trim()
    .split(/\s+/)
    .map(token => STROKE_ALIASES[token.toUpperCase()] ?? STROKE_ALIASES[token])
    .filter((stroke): stroke is string => Boolean(stroke))
  return parsed.length > 0 ? parsed : fallback
}

const GESTURE_LABELS = ['Fist', 'One', 'Two', 'Three', 'Four', 'Open']

export interface SessionConfig {
  song: Song
  capo: number
  bpm: number
  strumPattern: string[]
  displayPattern: string
  fingerMapping: string[]
  /** Virtual Guitarist personality (Campfire, Pop, Rock, etc.) */
  personality: string
  /** Humanizer preset (tight, natural, loose, etc.) */
  humanizerPreset: string
  /** Effects chain preset (acoustic, intimate, concert, etc.) */
  effectsPreset: string
  /** Whether fingerstyle mode is active */
  isFingerstyle: boolean
  /** Fingerstyle pattern name (travis, arpeggio, etc.) */
  fingerstylePattern: string
}

// ── Options ────────────────────────────────────────────────────────────
const PERSONALITY_OPTIONS = [
  { id: 'campfire', name: 'Campfire', desc: 'Warm · relaxed' },
  { id: 'pop', name: 'Pop', desc: 'Clean · rhythmic' },
  { id: 'bollywood', name: 'Bollywood', desc: 'Emotional' },
  { id: 'rock', name: 'Rock', desc: 'Driving · tight' },
  { id: 'worship', name: 'Worship', desc: 'Ambient swells' },
  { id: 'indie', name: 'Indie', desc: 'Organic · alt' },
]

const HUMANIZER_OPTIONS = [
  { id: 'tight', name: 'Tight', desc: 'Precise' },
  { id: 'natural', name: 'Natural', desc: 'Human feel' },
  { id: 'loose', name: 'Loose', desc: 'Expressive' },
]

const EFFECTS_OPTIONS = [
  { id: 'acoustic', name: 'Acoustic', desc: 'Balanced' },
  { id: 'intimate', name: 'Intimate', desc: 'Close · dry' },
  { id: 'concert', name: 'Concert', desc: 'Large hall' },
  { id: 'warm', name: 'Warm', desc: 'Mellow' },
  { id: 'campfire', name: 'Campfire', desc: 'Cozy room' },
]

const FINGERSTYLE_PATTERNS = [
  { id: 'travis', name: 'Travis', desc: 'Alternating bass' },
  { id: 'arpeggio', name: 'Arpeggio', desc: 'Flowing P-I-M-A' },
  { id: 'waltz', name: 'Waltz', desc: 'Oom-pah-pah' },
  { id: 'campfire', name: 'Boom-Chick', desc: 'Bass + strum' },
]

// ── Panel wrapper ─────────────────────────────────────────────────────
function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="studio-panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <p className="studio-label">{title}</p>
        {hint && <p className="text-[10px] font-mono text-white/25">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

interface SongSetupScreenProps {
  song: Song
  onBack: () => void
  onStartPlaying: (config: SessionConfig) => void
  onPractice: (config: SessionConfig) => void
}

export default function SongSetupScreen({ song, onBack, onStartPlaying, onPractice }: SongSetupScreenProps) {
  const songPresetIndex = STRUM_PRESETS.findIndex(p => p.display === song.displayPattern)
  const [capo, setCapo]               = useState(song.capo)
  const [bpm, setBpm]                 = useState(song.bpm)
  const [selectedPreset, setPreset]   = useState(songPresetIndex >= 0 ? songPresetIndex : 0)
  const defaultMapping = song.fingerMapping ?? [
    ...song.chords,
    ...['Am', 'Em', 'Dm', 'Bm', 'G', 'F'].filter(c => !song.chords.includes(c)),
  ].slice(0, 6)
  const [fingerMapping, setFingerMapping] = useState<string[]>([...defaultMapping])
  const [customPattern, setCustom]    = useState(song.displayPattern)
  const [isCustom, setIsCustom]       = useState(songPresetIndex < 0)
  const [editingMapping, setEditingMapping] = useState(false)
  const [engineState, setEngineState] = useState<EngineMode>(getEngineMode())
  const [guitarTypeState, setGuitarTypeState] = useState<GuitarType>(getGuitarType())
  const [personality, setPersonality] = useState('pop')
  const [humanizerPreset, setHumanizerPreset] = useState('natural')
  const [effectsPreset, setEffectsPreset] = useState('acoustic')
  const [isFingerstyle, setIsFingerstyle] = useState(false)
  const [fingerstylePattern, setFingerstylePattern] = useState('travis')

  const getConfig = (): SessionConfig => {
    const fallbackPattern = STRUM_PRESETS[selectedPreset].pattern
    const parsedCustomPattern = parseCustomPattern(customPattern, fallbackPattern)
    return {
      song,
      capo,
      bpm,
      strumPattern: isCustom ? parsedCustomPattern : fallbackPattern,
      displayPattern: isCustom && parsedCustomPattern.length > 0
        ? parsedCustomPattern.map(stroke => stroke === 'D' ? '↓' : stroke === 'U' ? '↑' : stroke === 'X' ? '✕' : '•').join(' ')
        : STRUM_PRESETS[selectedPreset].display,
      fingerMapping,
      personality,
      humanizerPreset,
      effectsPreset,
      isFingerstyle,
      fingerstylePattern,
    }
  }

  const handleStart = () => onStartPlaying(getConfig())
  const handlePractice = () => onPractice(getConfig())

  // ── Audible previews ─────────────────────────────────────────────────
  const previewTimers = useRef<number[]>([])
  const clearPreviews = useCallback(() => {
    previewTimers.current.forEach(t => window.clearTimeout(t))
    previewTimers.current = []
  }, [])
  useEffect(() => () => clearPreviews(), [clearPreviews])

  /** Strum one chord softly — used to audition engine, room tone, mapping. */
  const previewChord = useCallback((chord: string, volume = 0.24) => {
    initAudioEngine()
    triggerGuitarChord(chord, volume)
  }, [])

  /** Play a full pattern once at the session tempo. */
  const previewPattern = useCallback((pattern: string[]) => {
    clearPreviews()
    initAudioEngine()
    const chordName = song.chords[0] ?? 'Em'
    const voicing = CHORD_NOTES[chordName] ?? CHORD_NOTES['Em']!
    const beatMs = Math.round(60000 / (bpm || 90))
    pattern.forEach((stroke, i) => {
      previewTimers.current.push(
        window.setTimeout(() => playPatternBeat(stroke, voicing, 0.26), i * beatMs)
      )
    })
  }, [clearPreviews, song.chords, bpm])

  return (
    <div className="studio-root fixed inset-0 flex flex-col select-none overflow-y-auto lg:overflow-hidden">
      {/* Depth layers */}
      <div className="ambient-orb" style={{ width: 480, height: 480, top: '-16%', left: '30%', background: 'rgba(201,168,76,0.05)' }} />
      <div className="film-grain" />
      {/* ── Top bar ── */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-5 sm:px-10 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="flex items-center gap-2.5 text-white/40 hover:text-white transition-colors group">
          <span className="studio-icon !w-8 !h-8 group-hover:border-white/40"><ArrowLeft className="w-3.5 h-3.5" /></span>
          <span className="studio-label hidden sm:block">Library</span>
        </button>

        <div className="text-center min-w-0">
          <p className="studio-label-gold" style={{ fontSize: 9 }}>Step 02 — Session Setup</p>
          <p className="text-sm text-white font-light truncate mt-0.5">{song.title} <span className="text-white/30">· {song.artist}</span></p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={handlePractice} className="studio-btn studio-btn-ghost !py-2.5 !px-4 !text-[11px]">
            Practice
          </button>
          <button onClick={handleStart} className="studio-btn studio-btn-primary !py-2.5 !px-5 !text-[12px]">
            <Play className="w-3.5 h-3.5 fill-current" /> Start Playing
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">

        {/* ═══ LEFT — Song sheet ═══ */}
        <div className="flex-1 overflow-y-auto studio-scroll px-5 sm:px-10 py-8 border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {/* Song hero */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-white font-light" style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              {song.title}
            </h1>
            <p className="text-white/40 text-sm font-light mt-2">{song.artist}</p>

            <div className="flex items-center gap-2 mt-5 flex-wrap">
              <span className="studio-meta">{song.key}</span>
              <span className="studio-meta">{song.timeSignature}</span>
              <span className="studio-meta">{song.bpm} BPM</span>
              <span className="studio-meta">{song.duration}</span>
              {song.capo > 0 && <span className="studio-meta" style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.35)' }}>Capo {song.capo}</span>}
            </div>
          </motion.div>

          {/* Chord map strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="mt-8 grid grid-cols-3 sm:grid-cols-6 border rounded-[3px] overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {fingerMapping.map((chord, i) => (
              <button
                key={i}
                onClick={() => previewChord(chord)}
                title={`Hear ${chord}`}
                className="px-3 py-3.5 text-center transition-colors hover:bg-white/[0.03] cursor-pointer"
                style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <p className="studio-label" style={{ fontSize: 8 }}>{GESTURE_LABELS[i]} · {i}</p>
                <p className="studio-num chord-hot text-lg font-bold mt-1" style={{ color: 'var(--gold)' }}>{chord}</p>
              </button>
            ))}
          </motion.div>
          <p className="text-[11px] text-white/25 font-light mt-3 leading-relaxed max-w-md">
            Show the matching hand shape to the camera and the chord plays.
            Remap any gesture under <span className="text-white/50">Gesture Map</span> on the right.
          </p>

          {/* Lyrics */}
          <div className="mt-10">
            {song.sections.map((section, si) => (
              <div key={si} className="mb-9">
                <div className="flex items-center gap-3 mb-4">
                  <span className="studio-label" style={{ fontSize: 9, color: SECTION_COLORS[section.name] ?? 'rgba(255,255,255,0.5)' }}>{section.name}</span>
                  <div className="flex-1 studio-hr" />
                </div>
                <div>
                  {section.lyrics.map((lyric, li) => (
                    <div key={li} className="flex items-baseline gap-5 py-[7px] group rounded-[2px] transition-colors hover:bg-white/[0.02] px-2 -mx-2">
                      <button
                        onClick={() => previewChord(lyric.chord, 0.2)}
                        title={`Hear ${lyric.chord}`}
                        className="studio-num chord-hot shrink-0 text-sm font-bold min-w-[42px] text-right bg-transparent border-none p-0"
                        style={{ color: 'var(--gold)' }}
                      >
                        {lyric.chord}
                      </button>
                      <span className="text-[13.5px] text-white/75 font-light leading-relaxed">{lyric.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ RIGHT — Controls ═══ */}
        <div className="w-full lg:w-[380px] shrink-0 overflow-y-auto studio-scroll px-5 sm:px-7 py-8 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-3 h-3 text-white/30" strokeWidth={1.5} />
            <p className="studio-label">Performance Settings</p>
          </div>

          {/* ── Sound ── */}
          <Panel title="Sound Engine">
            <div className="studio-seg" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {([
                { id: 'sampled', name: 'Acoustic', sub: 'Sampled' },
                { id: 'nylon', name: 'Nylon', sub: 'Classical' },
                { id: 'synth', name: 'Model', sub: 'Offline' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  className={engineState === opt.id ? 'seg-active' : ''}
                  onClick={() => {
                    setEngineMode(opt.id)
                    setEngineState(opt.id)
                    // Audition the engine immediately so the choice is heard,
                    // not guessed. The mode switch is synchronous.
                    window.setTimeout(() => previewChord(song.chords[0] ?? 'Em'), 30)
                  }}
                >
                  <span className="block">{opt.name}</span>
                  <span className="block text-[9px] mt-0.5 opacity-50 font-mono uppercase tracking-wider">{opt.sub}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="studio-label mb-2" style={{ fontSize: 8 }}>Guitar</p>
              <div className="studio-seg" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {([
                  { id: 'steel', name: 'Steel' },
                  { id: 'nylon', name: 'Nylon' },
                  { id: 'electric', name: 'Electric' },
                  { id: '12string', name: '12-String' },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    className={guitarTypeState === opt.id ? 'seg-active' : ''}
                    onClick={() => {
                      setGuitarType(opt.id)
                      setGuitarTypeState(opt.id)
                      // Audition so the choice is heard, not guessed.
                      window.setTimeout(() => previewChord(song.chords[0] ?? 'Em', 0.22), 30)
                    }}
                  >
                    <span className="block">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {EFFECTS_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setEffectsPreset(opt.id); previewChord(song.chords[0] ?? 'Em', 0.22) }}
                  className={`studio-chip !py-1.5 ${effectsPreset === opt.id ? 'studio-chip-gold-active' : ''}`}
                  title={opt.desc}
                >
                  {opt.name}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-mono text-white/25 mt-3">
              Room tone — {EFFECTS_OPTIONS.find(o => o.id === effectsPreset)?.desc} · tap any option to hear it
            </p>
          </Panel>

          {/* ── Guitarist ── */}
          <Panel title="Virtual Guitarist">
            <div className="grid grid-cols-3 gap-1.5">
              {PERSONALITY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPersonality(opt.id)}
                  className="px-2 py-2.5 rounded-[3px] border text-center transition-all"
                  style={{
                    borderColor: personality === opt.id ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.08)',
                    background: personality === opt.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                  }}
                >
                  <p className="text-[11px] font-semibold" style={{ color: personality === opt.id ? 'var(--gold-bright)' : 'rgba(255,255,255,0.6)' }}>{opt.name}</p>
                  <p className="text-[9px] font-mono text-white/25 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="studio-seg mt-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {HUMANIZER_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={humanizerPreset === opt.id ? 'seg-active' : ''}
                  onClick={() => setHumanizerPreset(opt.id)}
                >
                  <span className="block">{opt.name}</span>
                  <span className="block text-[9px] mt-0.5 opacity-50 font-mono uppercase tracking-wider">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Fingerstyle toggle */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-[11px] font-semibold text-white/70">Fingerstyle mode</p>
                <p className="text-[9px] font-mono text-white/25 mt-0.5">P-I-M-A pattern engine</p>
              </div>
              <button
                onClick={() => setIsFingerstyle(f => !f)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: isFingerstyle ? 'var(--gold)' : 'rgba(255,255,255,0.1)' }}
              >
                <span
                  className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all"
                  style={{ left: isFingerstyle ? 23 : 3 }}
                />
              </button>
            </div>
            {isFingerstyle && (
              <div className="grid grid-cols-2 gap-1.5 mt-3">
                {FINGERSTYLE_PATTERNS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFingerstylePattern(p.id)}
                    className="px-2.5 py-2 rounded-[3px] border text-left transition-all"
                    style={{
                      borderColor: fingerstylePattern === p.id ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.08)',
                      background: fingerstylePattern === p.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                    }}
                  >
                    <p className="text-[10px] font-semibold" style={{ color: fingerstylePattern === p.id ? 'var(--gold-bright)' : 'rgba(255,255,255,0.6)' }}>{p.name}</p>
                    <p className="text-[9px] font-mono text-white/25">{p.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </Panel>

          {/* ── Tempo & rhythm ── */}
          <Panel title="Tempo & Rhythm">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="studio-num text-4xl font-light text-white">{bpm}</p>
                <p className="studio-label mt-1" style={{ fontSize: 8 }}>
                  BPM · song suggests {song.bpm}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setBpm(b => Math.max(40, b - 5))} className="studio-icon !w-8 !h-8 !text-sm">−</button>
                <button onClick={() => setBpm(song.bpm)} className="studio-icon !w-8 !h-8"><RotateCcw className="w-3 h-3" /></button>
                <button onClick={() => setBpm(b => Math.min(180, b + 5))} className="studio-icon !w-8 !h-8 !text-sm">+</button>
              </div>
            </div>
            <input
              type="range"
              min={40}
              max={180}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="studio-range"
            />
            <p className="text-[10px] font-mono text-white/25 text-center mt-2.5">
              {bpm < 60 ? 'Largo — very slow' : bpm < 80 ? 'Andante — slow' : bpm < 100 ? 'Moderato' : bpm < 120 ? 'Allegro' : 'Presto — very fast'}
            </p>

            <div className="studio-hr my-4" />

            {/* Strum presets */}
            <div className="space-y-1.5">
              {STRUM_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => { setPreset(i); setIsCustom(false); previewPattern(preset.pattern) }}
                  title="Select & hear this pattern"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[3px] border transition-all text-left"
                  style={{
                    borderColor: !isCustom && selectedPreset === i ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.07)',
                    background: !isCustom && selectedPreset === i ? 'rgba(201,168,76,0.07)' : 'transparent',
                  }}
                >
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: !isCustom && selectedPreset === i ? 'var(--gold-bright)' : 'rgba(255,255,255,0.55)' }}>
                      {preset.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-mono tracking-[0.25em]" style={{ color: !isCustom && selectedPreset === i ? 'rgba(227,200,120,0.9)' : 'rgba(255,255,255,0.3)' }}>
                      {preset.display}
                    </span>
                    {!isCustom && selectedPreset === i && <Check className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom builder */}
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="studio-label" style={{ fontSize: 8 }}>Custom pattern</p>
                {isCustom && <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ color: 'var(--gold)', background: 'rgba(201,168,76,0.1)' }}>Active</span>}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customPattern}
                  onChange={e => { setCustom(e.target.value); setIsCustom(true) }}
                  onFocus={() => setIsCustom(true)}
                  placeholder="D D U U D U"
                  className="studio-input !py-2 !text-xs font-mono"
                />
                {customPattern && (
                  <button
                    onClick={() => { setCustom(''); setIsCustom(false) }}
                    className="studio-icon !w-9 !h-9 shrink-0"
                    title="Clear pattern"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {([['↓', 'D'], ['↑', 'U'], ['✕', 'X'], ['•', '.']] as const).map(([sym]) => (
                  <button
                    key={sym}
                    onClick={() => { setCustom(prev => (prev ? `${prev} ${sym}` : sym)); setIsCustom(true) }}
                    className="flex-1 py-1.5 rounded-[2px] border text-xs font-mono transition-all hover:bg-white/[0.05]"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}
                  >
                    + {sym}
                  </button>
                ))}
              </div>
              <p className="text-[9px] font-mono text-white/20 mt-2">D down · U up · X mute · • rest</p>
            </div>
          </Panel>

          {/* ── Tuning ── */}
          <Panel title="Capo">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/40 font-light">
                {capo === 0 ? 'Open position — no capo' : `Capo on fret ${capo} — auto-transposed`}
              </p>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setCapo(c => Math.max(0, c - 1))} className="studio-icon !w-8 !h-8 !text-sm">−</button>
                <span className="studio-num text-2xl font-light w-8 text-center" style={{ color: capo > 0 ? 'var(--gold)' : '#fff' }}>{capo}</span>
                <button onClick={() => setCapo(c => Math.min(7, c + 1))} className="studio-icon !w-8 !h-8 !text-sm">+</button>
              </div>
            </div>
          </Panel>

          {/* ── Gesture map ── */}
          <Panel title="Gesture Map" hint={editingMapping ? 'editing' : undefined}>
            <div className="space-y-1.5">
              {fingerMapping.map((chord, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 shrink-0 w-24">
                    <span
                      className="studio-num w-6 h-6 flex items-center justify-center text-[10px] font-bold border rounded-[2px]"
                      style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      {i}
                    </span>
                    <span className="text-[10px] font-mono text-white/35 uppercase tracking-wider">{GESTURE_LABELS[i]}</span>
                  </div>
                  <span className="text-white/15 font-mono text-[10px]">→</span>
                  {editingMapping ? (
                    <select
                      value={chord}
                      onChange={e => {
                        const updated = [...fingerMapping]
                        updated[i] = e.target.value
                        setFingerMapping(updated)
                      }}
                      className="studio-select flex-1 !py-1.5 !text-xs font-mono"
                      style={{ color: 'var(--gold)' }}
                    >
                      {ALL_CHORDS.map(c => <option key={c} value={c} className="bg-[#0a0a0a] text-white">{c}</option>)}
                    </select>
                  ) : (
                    <span
                      className="flex-1 studio-num text-xs font-bold px-3 py-1.5 rounded-[2px] border"
                      style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.05)' }}
                    >
                      {chord}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-3">
              <button
                onClick={() => setEditingMapping(e => !e)}
                className="studio-chip flex-1 justify-center !text-[10px]"
              >
                {editingMapping ? 'Done editing' : 'Edit mapping'}
              </button>
              <button
                onClick={() => setFingerMapping([...defaultMapping])}
                className="studio-chip justify-center !text-[10px]"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </Panel>

          {/* ── Start ── */}
          <motion.button
            onClick={handleStart}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            className="btn-shimmer w-full py-4 rounded-[3px] font-bold text-[13px] text-[#050505] flex items-center justify-center gap-2.5 bg-white transition-all"
            style={{ letterSpacing: '0.04em' }}
          >
            <Play className="w-4 h-4 fill-current" />
            Start Playing
          </motion.button>
          <p className="text-center text-[10px] font-mono text-white/25 pb-4">
            Camera + auto-strum activate on the next screen
          </p>
        </div>
      </div>
    </div>
  )
}
