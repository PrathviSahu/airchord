// ── Lyrics Panel ──────────────────────────────────────────────────────────────
// Owns: current/next lyric display, chord badges, voice follower feedback, sync status

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const FINGER_EMOJI = ['✊', '☝️', '✌️', '🤟', '🖐️', '✋']

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
  detectedFingers,
  fingerMapping,
  voiceFollower,
  lastSungWord,
  lrcStatus,
  onPrevLine,
  onNextLine,
}: LyricsPanelProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
      {/* Current lyric card */}
      <div className="flex-1 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-3 min-w-0">
        {/* Next chord hint */}
        {nextLyric && (
          <p className="text-[9px] font-mono text-white/30 mb-1">
            Next: <span className="text-amber-300/70 font-bold">{nextLyric.chord}</span>
            {(() => {
              const idx = fingerMapping.indexOf(nextLyric.chord)
              return idx >= 0 ? ` — ${FINGER_EMOJI[idx]} ${idx} fingers` : ''
            })()}
          </p>
        )}
        {/* Current lyric */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentLine}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-black text-white leading-snug truncate"
          >
            "{currentLyric?.text}"
          </motion.p>
        </AnimatePresence>
        {/* Current chord badge + sync status */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-white/30">Chord now:</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs">
            {currentLyric?.chord}
          </span>
          {(() => {
            const idx = fingerMapping.indexOf(currentLyric?.chord ?? '')
            return idx >= 0 ? (
              <span className="text-[11px] font-mono text-white/40">
                {FINGER_EMOJI[idx]} {idx} finger{idx !== 1 ? 's' : ''}
              </span>
            ) : null
          })()}

          {/* Live voice feedback */}
          {voiceFollower && lastSungWord && (
            <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              🎙️ Heard: "{lastSungWord}"
            </span>
          )}

          {/* Live sync pill */}
          {lrcStatus === 'ok' && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold tracking-wide">
              🎵 LIVE SYNC
            </span>
          )}
          {lrcStatus === 'fallback' && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500/60 text-[9px] font-bold tracking-wide">
              📋 LOCAL
            </span>
          )}
          {lrcStatus === 'loading' && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 text-[9px] font-bold tracking-wide">
              ⏳ SYNCING...
            </span>
          )}
        </div>
      </div>

      {/* Manual lyric nav buttons */}
      <div className="flex flex-col gap-2 justify-center">
        <button
          onClick={onPrevLine}
          className="w-9 h-9 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNextLine}
          className="w-9 h-9 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
