import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, ChevronDown, ChevronUp, Music, Zap, Guitar,
  RotateCcw, Check, Edit3, ChevronRight, Info
} from 'lucide-react'
import { Song, TimestampedLyric } from '../utils/songLibrary'
import { getEngineMode, setEngineMode, EngineMode } from '../utils/guitarSound'

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
  'Bm','Fm','Gm','Cm','F#m','Bb','Eb','Ab','B','F#','Gsus4','Cadd9','Am7',
]

const SECTION_COLORS: Record<string, string> = {
  Intro:  'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  Verse:  'text-blue-400 border-blue-500/30 bg-blue-500/10',
  Chorus: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  Bridge: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  Outro:  'text-rose-400 border-rose-500/30 bg-rose-500/10',
}

// ── Finger gesture labels ─────────────────────────────────────────────
const FINGER_LABELS = ['✊ 0 — Fist', '☝️ 1 — Index', '✌️ 2 — Peace', '🤟 3 — Three', '🖐️ 4 — Four', '✋ 5 — Palm']

interface SongSetupScreenProps {
  song: Song
  onBack: () => void
  onStartPlaying: (config: SessionConfig) => void
  onPractice: (config: SessionConfig) => void
}

export interface SessionConfig {
  song: Song
  capo: number
  bpm: number
  strumPattern: string[]
  displayPattern: string
  fingerMapping: string[]
}

export default function SongSetupScreen({ song, onBack, onStartPlaying, onPractice }: SongSetupScreenProps) {
  const [capo, setCapo]               = useState(song.capo)
  const [bpm, setBpm]                 = useState(song.bpm)
  const [selectedPreset, setPreset]   = useState<number>(() => {
    const idx = STRUM_PRESETS.findIndex(p => p.display === song.displayPattern)
    return idx >= 0 ? idx : 0
  })
  const [fingerMapping, setFingerMapping] = useState<string[]>([...song.fingerMapping])
  const [customPattern, setCustom]    = useState(song.displayPattern)
  const [isCustom, setIsCustom]       = useState(false)
  const [editingMapping, setEditingMapping] = useState(false)
  const [engineState, setEngineState] = useState<EngineMode>(getEngineMode())

  // Flatten all lyrics for display
  const allLyricsFlat = useMemo(() =>
    song.sections.flatMap(s => s.lyrics.map(l => ({ ...l, sectionName: s.name }))),
  [song])

  // Current strum display
  const activePattern = isCustom
    ? STRUM_PRESETS[selectedPreset]
    : STRUM_PRESETS[selectedPreset]

  const getConfig = (): SessionConfig => ({
    song,
    capo,
    bpm,
    strumPattern: isCustom
      ? customPattern.trim().split(/\s+/)
      : STRUM_PRESETS[selectedPreset].pattern,
    displayPattern: isCustom
      ? customPattern.trim()
      : STRUM_PRESETS[selectedPreset].display,
    fingerMapping,
  })

  const handleStart = () => {
    onStartPlaying(getConfig())
  }

  const handlePractice = () => {
    onPractice(getConfig())
  }

  return (
    <div
      className="fixed inset-0 flex flex-col font-sans select-none overflow-y-auto lg:overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #070710 0%, #050508 60%, #080510 100%)' }}
    >
      {/* ── Top bar ── */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-3 sm:py-4 border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm text-white/40 hover:text-white/70 transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Songs
        </button>

        <div className="text-center">
          <p className="text-[10px] sm:text-xs font-mono text-white/30 uppercase tracking-widest">Step 2 of 3</p>
          <p className="text-xs sm:text-sm font-black text-white">{song.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePractice}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
          >
            Practice 🎯
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm text-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            Start Playing
          </button>
        </div>
      </div>

      {/* ── Main layout: 2 columns on desktop, stacked on mobile ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">

        {/* ── LEFT: Lyrics + Chords ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 border-b lg:border-b-0 lg:border-r border-white/5">
          {/* Song header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">{song.title}</h1>
            <p className="text-base text-white/50 mt-0.5">{song.artist}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40">
                {song.key}
              </span>
              <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40">
                {song.timeSignature}
              </span>
              <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40">
                {song.duration}
              </span>
            </div>
            <p className="text-xs text-purple-300/70 font-mono mt-3 bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-xl">
              💡 Each line shows the chord to play while singing that lyric. Use your fingers to match the chord on camera!
            </p>
          </div>

          {/* Chord legend */}
          <div className="mb-5 p-4 rounded-2xl bg-white/3 border border-white/8">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-3">Your Chord Map</p>
            <div className="flex flex-wrap gap-2">
              {fingerMapping.map((chord, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/8">
                  <span className="text-sm">{['✊','☝️','✌️','🤟','🖐️','✋'][i]}</span>
                  <span className="text-[10px] font-mono text-white/40">{i}</span>
                  <span className="text-xs font-black font-mono text-amber-300">{chord}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lyrics sectioned */}
          {song.sections.map((section, si) => (
            <div key={si} className="mb-6">
              <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-3 ${SECTION_COLORS[section.name] || SECTION_COLORS.Verse}`}>
                {section.name}
              </div>
              <div className="space-y-1">
                {section.lyrics.map((lyric, li) => {
                  const fingerIdx = fingerMapping.indexOf(lyric.chord)
                  const gestureEmoji = fingerIdx >= 0 ? ['✊','☝️','✌️','🤟','🖐️','✋'][fingerIdx] : '🎸'
                  return (
                    <div key={li} className="flex items-baseline gap-3 py-2 px-3 rounded-xl hover:bg-white/3 transition-colors group">
                      {/* Chord badge */}
                      <div className="shrink-0 flex items-center gap-1">
                        <span className="text-base font-black font-mono text-amber-300 min-w-[36px]">{lyric.chord}</span>
                        <span className="text-xs opacity-0 group-hover:opacity-60 transition-opacity">{gestureEmoji}</span>
                      </div>
                      {/* Lyric text */}
                      <span className="text-sm text-white/80 leading-relaxed">{lyric.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── RIGHT: Settings panel ── */}
        <div className="w-full lg:w-[340px] shrink-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-4">Performance Settings</p>

          {/* ── Audio Engine Selection ── */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Audio Engine Driver</p>
                <p className="text-[10px] text-white/30 font-mono mt-0.5">Pluggable Sound Engine</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Modular</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setEngineMode('sampled'); setEngineState('sampled') }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  engineState === 'sampled'
                    ? 'bg-purple-600/25 border-purple-500/50 shadow-md shadow-purple-600/20'
                    : 'bg-white/3 border-white/8 hover:bg-white/6'
                }`}
              >
                <p className={`text-[11px] font-bold ${engineState === 'sampled' ? 'text-purple-200' : 'text-white/60'}`}>
                  🎸 Acoustic
                </p>
                <p className="text-[9px] font-mono text-amber-300/80 mt-0.5">Sampled</p>
              </button>

              <button
                onClick={() => { setEngineMode('nylon'); setEngineState('nylon') }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  engineState === 'nylon'
                    ? 'bg-purple-600/25 border-purple-500/50 shadow-md shadow-purple-600/20'
                    : 'bg-white/3 border-white/8 hover:bg-white/6'
                }`}
              >
                <p className={`text-[11px] font-bold ${engineState === 'nylon' ? 'text-purple-200' : 'text-white/60'}`}>
                  🎶 Nylon
                </p>
                <p className="text-[9px] font-mono text-cyan-300/80 mt-0.5">Classical</p>
              </button>

              <button
                onClick={() => { setEngineMode('synth'); setEngineState('synth') }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  engineState === 'synth'
                    ? 'bg-purple-600/25 border-purple-500/50 shadow-md shadow-purple-600/20'
                    : 'bg-white/3 border-white/8 hover:bg-white/6'
                }`}
              >
                <p className={`text-[11px] font-bold ${engineState === 'synth' ? 'text-purple-200' : 'text-white/60'}`}>
                  ⚡ Synth
                </p>
                <p className="text-[9px] font-mono text-white/30 mt-0.5">3-Osc</p>
              </button>
            </div>
          </div>

          {/* ── Capo ── */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Capo Position</p>
                <p className="text-[10px] text-white/30 font-mono mt-0.5">Suggested: Fret {song.capo}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCapo(c => Math.max(0, c - 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/70 flex items-center justify-center hover:bg-white/10 text-lg leading-none"
                >−</button>
                <span className="text-xl font-black text-amber-300 w-8 text-center tabular-nums">{capo}</span>
                <button
                  onClick={() => setCapo(c => Math.min(7, c + 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/70 flex items-center justify-center hover:bg-white/10 text-lg leading-none"
                >+</button>
              </div>
            </div>
            {capo === 0 && <p className="text-[10px] text-white/25 font-mono">No capo — play open chords as written</p>}
            {capo > 0 && <p className="text-[10px] text-amber-300/60 font-mono">Place capo on fret {capo} — chords auto-transposed</p>}
          </div>

          {/* ── BPM ── */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Tempo / BPM</p>
                <p className="text-[10px] text-white/30 font-mono mt-0.5">Suggested: {song.bpm} BPM</p>
              </div>
              <span className="text-xl font-black font-mono text-purple-300">{bpm}</span>
            </div>

            <input
              type="range"
              min={40}
              max={180}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => setBpm(b => Math.max(40, b - 5))}
                className="flex-1 py-1 rounded-lg bg-white/5 border border-white/8 text-xs font-mono text-white/50 hover:text-white hover:bg-white/10">
                −5 BPM
              </button>
              <button onClick={() => setBpm(song.bpm)}
                className="flex-1 py-1 rounded-lg bg-white/5 border border-white/8 text-xs font-mono text-white/30 hover:text-white hover:bg-white/10">
                Reset
              </button>
              <button onClick={() => setBpm(b => Math.min(180, b + 5))}
                className="flex-1 py-1 rounded-lg bg-white/5 border border-white/8 text-xs font-mono text-white/50 hover:text-white hover:bg-white/10">
                +5 BPM
              </button>
            </div>

            {/* Tempo label */}
            <p className="text-[10px] text-center font-mono text-white/25">
              {bpm < 60 ? '🐌 Very Slow (Largo)' : bpm < 80 ? '🐢 Slow (Andante)' : bpm < 100 ? '🚶 Moderate (Moderato)' : bpm < 120 ? '🏃 Allegro' : '⚡ Very Fast (Presto)'}
            </p>
          </div>

          {/* ── Strumming Pattern ── */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-3">
            <p className="text-xs font-bold text-white">Strumming Pattern</p>

            <div className="grid grid-cols-1 gap-1.5">
              {STRUM_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => { setPreset(i); setIsCustom(false) }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
                    !isCustom && selectedPreset === i
                      ? 'bg-purple-600/25 border-purple-500/50 shadow-sm shadow-purple-600/20'
                      : 'bg-white/3 border-white/8 hover:bg-white/6'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold ${!isCustom && selectedPreset === i ? 'text-purple-200' : 'text-white/60'}`}>
                      {preset.name}
                    </p>
                    <p className={`text-[13px] font-mono tracking-widest mt-0.5 ${!isCustom && selectedPreset === i ? 'text-amber-300' : 'text-white/30'}`}>
                      {preset.display}
                    </p>
                  </div>
                  {!isCustom && selectedPreset === i && (
                    <Check className="w-4 h-4 text-purple-300" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom pattern input */}
            <div>
              <p className="text-[10px] font-mono text-white/30 mb-1.5">Custom pattern (space-separated):</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPattern}
                  onChange={e => { setCustom(e.target.value); setIsCustom(true) }}
                  onFocus={() => setIsCustom(true)}
                  placeholder="e.g.  ↓ ↑ ↓ ↓ ↑"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-white/20 outline-none focus:border-purple-500/40 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ── Finger Chord Mapping ── */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">Finger → Chord Map</p>
              <button
                onClick={() => setEditingMapping(e => !e)}
                className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors"
              >
                {editingMapping ? '✓ Done' : '✏️ Edit'}
              </button>
            </div>

            <div className="space-y-2">
              {fingerMapping.map((chord, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 shrink-0 w-28">
                    <span className="text-sm">{['✊','☝️','✌️','🤟','🖐️','✋'][i]}</span>
                    <span className="text-[11px] font-mono text-white/40">{i} finger{i !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-white/30 font-mono text-xs">→</span>
                  {editingMapping ? (
                    <select
                      value={chord}
                      onChange={e => {
                        const updated = [...fingerMapping]
                        updated[i] = e.target.value
                        setFingerMapping(updated)
                      }}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-amber-300 outline-none cursor-pointer"
                    >
                      {ALL_CHORDS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <span className="flex-1 text-xs font-black font-mono text-amber-300 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      {chord}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setFingerMapping([...song.fingerMapping])}
              className="w-full py-1.5 rounded-lg bg-white/3 border border-white/8 text-[10px] font-mono text-white/30 hover:text-white/50 hover:bg-white/6 transition-all flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset to song defaults
            </button>
          </div>

          {/* ── Summary before play ── */}
          <div className="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/25 space-y-2">
            <p className="text-[10px] font-mono text-purple-300 uppercase tracking-wider">Session Summary</p>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-white/50"><span>Song</span><span className="text-white font-bold truncate max-w-[140px]">{song.title}</span></div>
              <div className="flex justify-between text-white/50"><span>Capo</span><span className="text-amber-300">{capo === 0 ? 'None' : `Fret ${capo}`}</span></div>
              <div className="flex justify-between text-white/50"><span>BPM</span><span className="text-purple-300">{bpm}</span></div>
              <div className="flex justify-between text-white/50"><span>Pattern</span><span className="text-white/70 tracking-widest">{isCustom ? customPattern.substring(0,14) : STRUM_PRESETS[selectedPreset].display}</span></div>
              <div className="flex justify-between text-white/50"><span>Chords</span><span className="text-white/70">{song.chords.join(' · ')}</span></div>
            </div>
          </div>

          {/* Big start button */}
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-black text-base text-black flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #fbbf24 100%)' }}
          >
            <Play className="w-5 h-5 fill-current" />
            Start Playing
          </motion.button>
          <p className="text-center text-[10px] text-white/25 font-mono">
            Camera + auto-strum will activate on the next screen
          </p>
        </div>
      </div>
    </div>
  )
}
