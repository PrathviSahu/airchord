// ── Lyrics Panel ──────────────────────────────────────────────────────────────
// Current/next lyric, chord + gesture hint, voice follower feedback, sync status.

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const GESTURE_LABELS = ['Fist', 'One', 'Two', 'Three', 'Four', 'Open']

interface LyricLine {
  text: string
  chord: string
  time: number
}

interface LyricsPanelProps {
  currentLyric: LyricLine | undefined
  nextLyric: LyricLine | undefined
  currentLine: number
  totalLines: number
  detectedFingers: number | null
  fingerMapping: string[]
  voiceFollower: boolean
  lastSungWord: string
  lrcStatus: 'loading' | 'ok' | 'fallback'
  onPrevLine: () => void
  onNextLine: () => void
}

export function LyricsPanel({
  currentLyric,
  nextLyric,
  currentLine,
  totalLines,
  fingerMapping,
  voiceFollower,
  lastSungWord,
  lrcStatus,
  onPrevLine,
  onNextLine,
}: LyricsPanelProps) {
  const nextIdx = nextLyric ? fingerMapping.indexOf(nextLyric.chord) : -1
  const currentIdx = fingerMapping.indexOf(currentLyric?.chord ?? '')

  return (
    <div className="flex items-stretch gap-2 sm:gap-2.5">
      {/* Lyric card */}
      <div className="flex-1 studio-glass px-5 sm:px-6 py-3.5 min-w-0">
        {/* Next chord telegraph */}
        {nextLyric && (
          <p className="text-[10px] font-mono text-white/30 mb-1.5 truncate">
            NEXT&nbsp;
            <span className="studio-num font-bold" style={{ color: 'rgba(227,200,120,0.75)' }}>{nextLyric.chord}</span>
            {nextIdx >= 0 && (
              <span className="text-white/25"> — {GESTURE_LABELS[nextIdx]} ({nextIdx})</span>
            )}
          </p>
        )}

        {/* Current line */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentLine}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-white font-light truncate"
            style={{ fontSize: 'clamp(17px, 2.4vw, 24px)', letterSpacing: '-0.01em', lineHeight: 1.25 }}
          >
            {currentLyric?.text}
          </motion.p>
        </AnimatePresence>

        {/* Chord + status row */}
        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
          <span className="studio-label" style={{ fontSize: 8 }}>Chord</span>
          <span
            className="studio-num px-2 py-0.5 rounded-[2px] border text-xs font-bold"
            style={{ color: 'var(--gold-bright)', borderColor: 'rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.08)' }}
          >
            {currentLyric?.chord}
          </span>
          {currentIdx >= 0 && (
            <span className="text-[10px] font-mono text-white/35">
              show {GESTURE_LABELS[currentIdx].toLowerCase()} ({currentIdx})
            </span>
          )}

          {voiceFollower && lastSungWord && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] border" style={{ color: '#7FBF8E', borderColor: 'rgba(127,191,142,0.25)', background: 'rgba(127,191,142,0.06)' }}>
              heard “{lastSungWord}”
            </span>
          )}

          <span className="ml-auto text-[9px] font-mono tracking-[0.18em] uppercase" style={{ color: lrcStatus === 'ok' ? '#7FBF8E' : 'rgba(255,255,255,0.25)' }}>
            {lrcStatus === 'ok' ? 'Live sync' : lrcStatus === 'fallback' ? 'Local lyrics' : 'Syncing…'}
          </span>
        </div>
      </div>

      {/* Manual nav */}
      <div className="flex flex-col gap-1.5 justify-center shrink-0">
        <button onClick={onPrevLine} aria-label="Previous lyric line" className="studio-icon !w-9 !h-8"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <button onClick={onNextLine} aria-label="Next lyric line" className="studio-icon !w-9 !h-8"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}
