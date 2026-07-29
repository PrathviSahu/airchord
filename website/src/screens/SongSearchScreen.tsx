import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Music, ArrowRight, ChevronRight, Star, Zap, Clock, Guitar } from 'lucide-react'
import { SEED_SONGS, SONG_COLLECTIONS, Song } from '../utils/songLibrary'

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Easy:         'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Intermediate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Advanced:     'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

const STRUM_PREVIEW: Record<string, string> = {
  'Island Pop':  '↓↓↑↑↓↑',
  'Rock 4/4':    '↓↓↓↓↓↓↓↓',
  'Basic Folk':  '↓↓↑↓↑',
  'Waltz 3/4':   '↓↑↑↓↑↑',
}

function SongCard({ song, onSelect, index }: { song: Song; onSelect: (s: Song) => void; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      key={song.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onSelect(song)}
      className="relative w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden group"
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(17,17,27,0.95) 100%)'
          : 'rgba(12,12,20,0.85)',
        borderColor: hovered ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)',
        boxShadow: hovered ? '0 0 32px rgba(124,58,237,0.15)' : 'none',
      }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full"
        animate={{ opacity: hovered ? 1 : 0, scaleY: hovered ? 1 : 0.3 }}
        style={{ background: 'linear-gradient(180deg, #7c3aed, #fbbf24)' }}
        transition={{ duration: 0.2 }}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: title + artist */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-white text-base truncate">{song.title}</h3>
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[song.difficulty]}`}>
                {song.difficulty}
              </span>
            </div>
            <p className="text-sm text-white/50 truncate">{song.artist}</p>

            {/* Meta chips row */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* BPM */}
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/20">
                <Zap className="w-3 h-3" />
                {song.bpm} BPM
              </span>
              {/* Capo */}
              {song.capo > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/20">
                  Capo {song.capo}
                </span>
              )}
              {song.capo === 0 && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10">
                  No Capo
                </span>
              )}
              {/* Key */}
              <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10">
                {song.key.split(' ')[0]} {song.key.split(' ')[1]}
              </span>
              {/* Duration */}
              <span className="flex items-center gap-1 text-[11px] font-mono text-white/30">
                <Clock className="w-3 h-3" />
                {song.duration}
              </span>
            </div>

            {/* Chords preview */}
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider mr-1">Chords:</span>
              {song.chords.map((c) => (
                <span key={c} className="text-[11px] font-black font-mono px-1.5 py-0.5 rounded bg-white/8 text-white/70 border border-white/10">
                  {c}
                </span>
              ))}
            </div>

            {/* Strum pattern */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Pattern:</span>
              <span className="text-[12px] font-mono text-purple-300 tracking-widest">{song.displayPattern}</span>
            </div>
          </div>

          {/* Right: arrow */}
          <div className="shrink-0 flex items-center h-full pt-2">
            <motion.div
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: hovered ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)',
                border: hovered ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <ChevronRight className="w-4 h-4 text-white/60" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

interface SongSearchScreenProps {
  onSelectSong: (song: Song) => void
  onBack: () => void
}

export default function SongSearchScreen({ onSelectSong, onBack }: SongSearchScreenProps) {
  const [query, setQuery] = useState('')
  const [activeCollection, setActiveCollection] = useState('All')

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

  return (
    <div
      className="fixed inset-0 flex flex-col font-sans select-none"
      style={{ background: 'linear-gradient(160deg, #070710 0%, #050508 60%, #080510 100%)' }}
    >
      {/* ── Header ── */}
      <div className="shrink-0 px-8 pt-8 pb-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-[11px] font-mono text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">AirChord</span>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <h1 className="text-3xl font-black text-white mb-1">Choose a Song</h1>
          <p className="text-sm text-white/40">Search by title, artist, or chord. We'll set up everything for you.</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            autoFocus
            type="text"
            placeholder="Search songs, artists, chords…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/25 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs font-mono"
            >
              ✕
            </button>
          )}
        </motion.div>

        {/* Collection filter pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          {SONG_COLLECTIONS.map(col => (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                activeCollection === col
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {col}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── Song list ── */}
      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
        {/* Result count */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono text-white/30">
            {filtered.length} song{filtered.length !== 1 ? 's' : ''} found
          </span>
          <span className="text-[10px] text-white/20 font-mono">Click to setup & play →</span>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <Music className="w-12 h-12 text-white/10" />
              <p className="text-sm text-white/30 font-mono">No songs match "{query}"</p>
              <button
                onClick={() => { setQuery(''); setActiveCollection('All') }}
                className="text-xs text-purple-400 hover:text-purple-300 font-mono underline underline-offset-2"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            filtered.map((song, i) => (
              <SongCard key={song.id} song={song} onSelect={onSelectSong} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
