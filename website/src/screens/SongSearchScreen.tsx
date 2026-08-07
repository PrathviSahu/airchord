// ── Song Library ──────────────────────────────────────────────────────────────
// Studio monochrome redesign: a cinematic tracklist instead of neon cards.
// Pure black surface, hairline dividers, one gold accent.

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, ArrowUpRight, Music2 } from 'lucide-react'
import { SEED_SONGS, SONG_COLLECTIONS } from '../utils/songLibrary'
import type { Song } from '../utils/songLibrary'
import { initAudioEngine, triggerGuitarChord } from '../utils/guitarSound'

// Difficulty shown as a quiet dot + word, not a rainbow pill.
const DIFFICULTY_DOT: Record<string, string> = {
  Beginner:     '#7FBF8E',
  Easy:         '#8FB7E8',
  Intermediate: '#C9A84C',
  Advanced:     '#D98A8A',
}

interface SongRowProps {
  song: Song
  index: number
  auditioning: boolean
  onSelect: (s: Song) => void
  onHoverStart: (s: Song) => void
  onHoverEnd: () => void
}

function SongRow({ song, index, auditioning, onSelect, onHoverStart, onHoverEnd }: SongRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.4), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => { setHovered(true); onHoverStart(song) }}
      onHoverEnd={() => { setHovered(false); onHoverEnd() }}
      onClick={() => onSelect(song)}
      className="w-full text-left group relative grid items-center gap-x-6 gap-y-2 px-5 sm:px-8 py-5 border-b transition-colors duration-300"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: hovered ? 'rgba(255,255,255,0.028)' : 'transparent',
        gridTemplateColumns: 'minmax(150px, 1.6fr) minmax(140px, 1fr) auto',
      }}
    >
      {/* Gold hover rule */}
      <motion.span
        className="absolute left-0 top-0 bottom-0 w-px"
        animate={{ opacity: hovered ? 1 : 0, scaleY: hovered ? 1 : 0.2 }}
        style={{ background: 'var(--gold)' }}
        transition={{ duration: 0.22 }}
      />

      {/* Track: number + title + artist */}
      <div className="flex items-center gap-5 min-w-0">
        <span
          className="studio-num hidden sm:block text-sm font-light w-7 shrink-0 text-right transition-colors"
          style={{ color: hovered ? 'var(--gold)' : 'rgba(255,255,255,0.22)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex items-center gap-3">
          <div className="min-w-0">
            <h3
              className="text-lg sm:text-xl font-light tracking-tight text-white truncate transition-colors"
              style={{ letterSpacing: '-0.01em' }}
            >
              {song.title}
            </h3>
            <p className="text-xs text-white/35 mt-0.5 truncate">{song.artist}</p>
          </div>
          {auditioning && (
            <span className="eq-bars shrink-0" title="Auditioning…">
              <span /><span /><span />
            </span>
          )}
        </div>
      </div>

      {/* Meta: key · tempo · chords */}
      <div className="hidden md:flex items-center gap-5">
        <div>
          <p className="studio-label mb-1" style={{ fontSize: 8 }}>Key · Tempo</p>
          <p className="studio-num text-xs text-white/70 font-mono">
            {song.key.split(' ')[0]}
            <span className="text-white/25 mx-1.5">/</span>
            {song.bpm} BPM
          </p>
        </div>
        <div className="w-px h-7 bg-white/6" />
        <div>
          <p className="studio-label mb-1" style={{ fontSize: 8 }}>Pattern</p>
          <p className="text-xs font-mono tracking-[0.2em]" style={{ color: hovered ? 'var(--gold-bright)' : 'rgba(255,255,255,0.4)' }}>
            {song.displayPattern}
          </p>
        </div>
        <div className="w-px h-7 bg-white/6" />
        <div>
          <p className="studio-label mb-1" style={{ fontSize: 8 }}>Chords</p>
          <div className="flex items-center gap-1">
            {song.chords.slice(0, 5).map(c => (
              <span
                key={c}
                className="studio-num text-[11px] px-1.5 py-0.5 border rounded-[2px] transition-colors"
                style={{
                  borderColor: hovered ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.09)',
                  color: hovered ? 'rgba(227,200,120,0.95)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: difficulty + arrow */}
      <div className="flex items-center justify-end gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: DIFFICULTY_DOT[song.difficulty] ?? '#888' }} />
          <span className="text-[11px] text-white/40">{song.difficulty}</span>
        </div>
        <motion.div
          animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ArrowUpRight className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      {/* Mobile meta row */}
      <div className="md:hidden col-span-3 flex items-center gap-4 -mt-1">
        <span className="studio-num text-[11px] font-mono text-white/35">{song.key.split(' ')[0]} · {song.bpm} BPM</span>
        <span className="text-[11px] font-mono tracking-[0.2em] text-white/30">{song.displayPattern}</span>
      </div>
    </motion.button>
  )
}

interface SongSearchScreenProps {
  onSelectSong: (song: Song) => void
  onBack: () => void
  onOpenPractice?: () => void
}

export default function SongSearchScreen({ onSelectSong, onBack, onOpenPractice }: SongSearchScreenProps) {
  const [query, setQuery] = useState('')
  const [activeCollection, setActiveCollection] = useState('All')
  const [auditioningId, setAuditioningId] = useState<string | null>(null)
  const auditionTimers = useRef<number[]>([])
  const hoverTimer = useRef<number | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return SEED_SONGS.filter(s => {
      const matchesQuery = !q
        || s.title.toLowerCase().includes(q)
        || s.artist.toLowerCase().includes(q)
        || s.key.toLowerCase().includes(q)
        || s.chords.some(c => c.toLowerCase().includes(q))
      const matchesCollection = activeCollection === 'All' || s.collections.includes(activeCollection)
      return matchesQuery && matchesCollection
    })
  }, [query, activeCollection])

  // ── Hover audition: play the song's chord progression softly ──────────
  const stopAudition = useCallback(() => {
    auditionTimers.current.forEach(t => window.clearTimeout(t))
    auditionTimers.current = []
    setAuditioningId(null)
  }, [])

  const startAudition = useCallback((song: Song) => {
    stopAudition()
    initAudioEngine()
    setAuditioningId(song.id)
    const chords = song.chords.slice(0, 4)
    chords.forEach((chord, i) => {
      auditionTimers.current.push(
        window.setTimeout(() => triggerGuitarChord(chord, 0.15), i * 640)
      )
    })
    auditionTimers.current.push(
      window.setTimeout(() => setAuditioningId(null), chords.length * 640 + 300)
    )
  }, [stopAudition])

  const handleHoverStart = useCallback((song: Song) => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => startAudition(song), 320)
  }, [startAudition])

  const handleHoverEnd = useCallback(() => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
    stopAudition()
  }, [stopAudition])

  useEffect(() => () => {
    auditionTimers.current.forEach(t => window.clearTimeout(t))
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current)
  }, [])

  return (
    <div className="studio-root fixed inset-0 flex flex-col select-none overflow-hidden">
      {/* Depth layers */}
      <div
        className="ambient-orb"
        style={{ width: 520, height: 520, top: '-18%', right: '-8%', background: 'rgba(201,168,76,0.055)' }}
      />
      <div
        className="ambient-orb"
        style={{ width: 420, height: 420, bottom: '-16%', left: '-6%', background: 'rgba(96,160,255,0.05)', animationDelay: '-12s' }}
      />
      <div className="film-grain" />
      {/* ── Header ── */}
      <header className="shrink-0 px-5 sm:px-10 pt-7 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2.5 text-white/40 hover:text-white transition-colors group"
          >
            <span className="studio-icon !w-8 !h-8 group-hover:border-white/40">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span className="studio-label hidden sm:block">Back</span>
          </button>
          <span className="studio-label">AirChord — Library</span>
          {onOpenPractice ? (
            <button onClick={onOpenPractice} className="studio-btn studio-btn-ghost !py-2 !px-4 !text-[11px]">
              Freestyle Room
            </button>
          ) : <div className="w-24" />}
        </div>

        {/* Title + search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="studio-label-gold mb-3">Step 01 — Choose</p>
            <h1 className="text-white font-light tracking-tight" style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              The <span className="font-bold">Library</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative w-full lg:w-[380px]"
          >
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              autoFocus
              type="text"
              placeholder="Search title, artist, chord…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white text-sm font-light pl-8 pr-8 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', letterSpacing: '0.02em' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs font-mono transition-colors"
              >
                ✕
              </button>
            )}
          </motion.div>
        </div>

        {/* Collections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 scrollbar-none"
        >
          {SONG_COLLECTIONS.map(col => (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              className={`studio-chip shrink-0 ${activeCollection === col ? 'studio-chip-active' : ''}`}
            >
              {col}
            </button>
          ))}
        </motion.div>
      </header>

      {/* ── Column headers ── */}
      <div
        className="hidden md:grid shrink-0 items-center gap-x-6 px-5 sm:px-8 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', gridTemplateColumns: 'minmax(150px, 1.6fr) minmax(140px, 1fr) auto' }}
      >
        <span className="studio-label pl-12">Track</span>
        <span className="studio-label">Details</span>
        <span className="studio-label text-right pr-1">{filtered.length} song{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Tracklist ── */}
      <div className="flex-1 overflow-y-auto studio-scroll">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-28 gap-5"
            >
              <Music2 className="w-10 h-10 text-white/10" strokeWidth={1} />
              <p className="text-sm text-white/35 font-light">Nothing matches “{query}”</p>
              <button
                onClick={() => { setQuery(''); setActiveCollection('All') }}
                className="studio-btn studio-btn-ghost !py-2 !px-5 !text-[11px]"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            filtered.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                auditioning={auditioningId === song.id}
                onSelect={(s) => { stopAudition(); onSelectSong(s) }}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
