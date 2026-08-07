// ── Timeline ──────────────────────────────────────────────────────────────────
// Owns: beat metronome LEDs, strum pattern display, pause/resume, chord gesture hint

import React from 'react'
import { motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'

const FINGER_EMOJI = ['✊', '☝️', '✌️', '🤟', '🖐️', '✋']
const STRUM_SYMBOL_MAP: Record<string, string> = { D: '↓', U: '↑', '.': '•', X: '✕', '↓': '↓', '↑': '↑', '•': '•', '✕': '✕' }

interface TimelineProps {
  isPlaying: boolean
  activeBeat: number
  bpm: number
  displayPattern: string
  detectedFingers: number | null
  detectedChord: string
  fingerMapping: string[]
  onPause: () => void
}

export function Timeline({
  isPlaying,
  activeBeat,
  bpm,
  displayPattern,
  detectedFingers,
  detectedChord,
  fingerMapping,
  onPause,
}: TimelineProps) {
  const fingerIdx = detectedFingers ?? -1
  const patternSymbols = displayPattern.trim().split(/\s+/)

  return (
    <div className="flex items-center gap-3">
      {/* Detected chord hint */}
      <motion.div
        key={detectedChord}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between sm:justify-start gap-3"
      >
        <div className="text-2xl sm:text-3xl">
          {fingerIdx >= 0 ? FINGER_EMOJI[fingerIdx] : '🎸'}
        </div>
        <div>
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">You're playing</p>
          <p className="text-xl sm:text-2xl font-black text-amber-300 leading-none">{detectedChord}</p>
          {fingerIdx >= 0 && (
            <p className="text-[10px] font-mono text-white/40">{fingerIdx} finger{fingerIdx !== 1 ? 's' : ''}</p>
          )}
        </div>
      </motion.div>

      {/* Beat LED metronome */}
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl border border-white/8 rounded-2xl px-4 py-2">
        {[0, 1, 2, 3].map(b => (
          <motion.div
            key={b}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: activeBeat % 4 === b
                ? (b === 0 ? '#a855f7' : '#fbbf24')
                : 'rgba(255,255,255,0.15)',
              scale: activeBeat % 4 === b ? 1.3 : 1,
              boxShadow: activeBeat % 4 === b
                ? b === 0 ? '0 0 8px #a855f7' : '0 0 8px #fbbf24'
                : 'none',
            }}
            transition={{ duration: 0.08 }}
          />
        ))}
        <span className="text-[10px] font-mono text-white/30 ml-2">{bpm} BPM</span>
      </div>

      {/* Strum pattern display */}
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl border border-white/8 rounded-2xl px-3 py-2 flex-1">
        {patternSymbols.map((sym, i) => (
          <span
            key={i}
            className={`flex-1 text-center text-base font-black font-mono rounded-lg py-1 transition-all duration-75 ${
              activeBeat === i
                ? 'text-black bg-amber-400 shadow-lg shadow-amber-400/50 scale-110'
                : 'text-white/40'
            }`}
          >
            {STRUM_SYMBOL_MAP[sym] ?? sym}
          </span>
        ))}
      </div>

      {/* Pause/Resume */}
      <button
        onClick={onPause}
        className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
        style={{
          background: isPlaying ? 'rgba(168,85,247,0.25)' : 'rgba(168,85,247,0.6)',
          border: '1px solid rgba(168,85,247,0.4)',
        }}
      >
        {isPlaying
          ? <Pause className="w-5 h-5 text-purple-200" />
          : <Play className="w-5 h-5 text-white fill-current" />}
      </button>
    </div>
  )
}
