// ── Adaptive Chord Preview ────────────────────────────────────────────────────
//
// Telegraphs the next hand shape before the chord arrives:
//   Current chord → arrow → next chord + gesture number.

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GESTURE_LABELS = ['Fist', 'One', 'Two', 'Three', 'Four', 'Open']
const GESTURE_DESC: Record<number, string> = {
  0: 'closed fist',
  1: 'index finger up',
  2: 'two fingers up',
  3: 'three fingers up',
  4: 'four fingers up',
  5: 'open palm',
}

interface AdaptiveChordPreviewProps {
  nextChord: string | undefined
  nextFingerCount: number
  currentChord: string
  currentFingerCount: number
  visible: boolean
}

export function AdaptiveChordPreview({
  nextChord,
  nextFingerCount,
  currentChord,
  currentFingerCount,
  visible,
}: AdaptiveChordPreviewProps) {
  if (!visible || !nextChord || nextFingerCount < 0) return null

  const nextCount = Math.min(5, Math.max(0, nextFingerCount))
  const isChanging = nextChord !== currentChord

  return (
    <AnimatePresence>
      {isChanging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="studio-glass px-4 py-2.5 flex items-center gap-4 overflow-hidden"
            style={{ borderColor: 'rgba(201,168,76,0.3)' }}
          >
            {/* Current → Next */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center opacity-40">
                <p className="studio-num text-sm font-bold text-white">{currentChord}</p>
                <p className="text-[8px] font-mono text-white/30 uppercase tracking-wider mt-0.5">now</p>
              </div>

              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xs"
                style={{ color: 'var(--gold)' }}
              >
                →
              </motion.span>

              <motion.div
                key={`next-${nextChord}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-center"
              >
                <p className="studio-num text-base font-bold" style={{ color: 'var(--gold-bright)' }}>{nextChord}</p>
                <p className="text-[8px] font-mono uppercase tracking-wider mt-0.5" style={{ color: 'rgba(201,168,76,0.6)' }}>next</p>
              </motion.div>
            </div>

            {/* Instruction */}
            <div className="flex-1 min-w-0 border-l pl-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="studio-label-gold" style={{ fontSize: 8 }}>Get ready</p>
              <p className="text-[11px] font-light text-white/75 truncate mt-0.5">
                {GESTURE_LABELS[nextCount]} hand — {GESTURE_DESC[nextCount]}
              </p>
            </div>

            {/* Finger count badge */}
            <div
              className="studio-num shrink-0 w-9 h-9 rounded-[3px] border flex items-center justify-center text-sm font-bold"
              style={{ borderColor: 'rgba(201,168,76,0.55)', color: 'var(--gold-bright)', background: 'rgba(201,168,76,0.08)' }}
            >
              {nextFingerCount}
            </div>
          </div>

          {/* Sweep progress line */}
          <motion.div
            className="absolute bottom-0 left-0 h-px"
            style={{ background: 'var(--gold)' }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
