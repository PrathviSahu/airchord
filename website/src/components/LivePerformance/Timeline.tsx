// ── Timeline ──────────────────────────────────────────────────────────────────
// Beat metronome LEDs, strum pattern cells, detected chord, pause/resume.

import React from 'react'
import { motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'

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
  onPause,
}: TimelineProps) {
  const fingerIdx = detectedFingers ?? -1
  const patternSymbols = displayPattern.trim().split(/\s+/)

  return (
    <div className="flex items-stretch gap-2 sm:gap-3">
      {/* Detected chord */}
      <motion.div
        key={detectedChord}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="studio-glass px-4 sm:px-5 py-2.5 flex items-center gap-3.5"
      >
        <div
          className="studio-num w-9 h-9 flex items-center justify-center text-sm font-bold border rounded-[3px] shrink-0"
          style={fingerIdx >= 0
            ? { borderColor: 'rgba(201,168,76,0.55)', color: 'var(--gold-bright)', background: 'rgba(201,168,76,0.08)' }
            : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' }}
        >
          {fingerIdx >= 0 ? fingerIdx : '–'}
        </div>
        <div>
          <p className="studio-label" style={{ fontSize: 8 }}>You're playing</p>
          <p className="studio-num text-2xl font-bold leading-none mt-0.5" style={{ color: 'var(--gold-bright)' }}>
            {detectedChord}
          </p>
        </div>
      </motion.div>

      {/* Beat LEDs */}
      <div className="studio-glass hidden sm:flex items-center gap-2 px-4">
        {[0, 1, 2, 3].map(b => {
          const active = activeBeat >= 0 && activeBeat % 4 === b
          return (
            <motion.span
              key={b}
              className="w-1.5 h-1.5 rounded-full"
              animate={{
                backgroundColor: active ? (b === 0 ? '#E3C878' : 'rgba(255,255,255,0.9)') : 'rgba(255,255,255,0.15)',
                scale: active ? 1.5 : 1,
              }}
              transition={{ duration: 0.08 }}
            />
          )
        })}
        <span className="studio-num text-[10px] font-mono text-white/30 ml-1.5">{bpm}</span>
      </div>

      {/* Strum pattern */}
      <div className="studio-glass flex items-center gap-1 px-2.5 flex-1">
        {patternSymbols.map((sym, i) => (
          <span
            key={i}
            className={`beat-cell !h-9 ${activeBeat === i ? 'beat-cell-active' : ''}`}
            style={{ fontSize: 13 }}
          >
            {STRUM_SYMBOL_MAP[sym] ?? sym}
          </span>
        ))}
      </div>

      {/* Pause / resume */}
      <button
        onClick={onPause}
        aria-label={isPlaying ? "Pause" : "Resume"}
        className="w-11 shrink-0 rounded-[3px] flex items-center justify-center transition-all border"
        style={{
          background: isPlaying ? 'rgba(255,255,255,0.08)' : '#fff',
          borderColor: isPlaying ? 'rgba(255,255,255,0.25)' : '#fff',
          color: isPlaying ? '#fff' : '#050505',
          backdropFilter: 'blur(12px)',
        }}
      >
        {isPlaying
          ? <Pause className="w-4 h-4" />
          : <Play className="w-4 h-4 fill-current" />}
      </button>
    </div>
  )
}
