// ── Adaptive Chord Preview ────────────────────────────────────────────────────
//
// Shows the upcoming hand shape BEFORE the chord arrives.
//
//   Current: G
//     ↓
//   Next: Em
//     ↓
//   [Animated hand showing Em shape fading in]
//
// The performer sees the next gesture before it arrives.
// This is genuinely useful on stage.

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FINGER_EMOJI = ['✊', '☝️', '✌️', '🤟', '🖐️', '✋']
const FINGER_NAMES = ['Fist', 'One', 'Peace', 'Three', 'Four', 'Open']

/** Visual representation of a hand shape for a given finger count. */
const HAND_SHAPES: Record<number, { emoji: string; label: string; description: string }> = {
  0: { emoji: '✊', label: 'Fist', description: '0 fingers → closed fist' },
  1: { emoji: '☝️', label: 'Point', description: '1 finger → index up' },
  2: { emoji: '✌️', label: 'Peace', description: '2 fingers → peace sign' },
  3: { emoji: '🤟', label: 'Three', description: '3 fingers → ILY sign' },
  4: { emoji: '🖐️', label: 'Four', description: '4 fingers → four up' },
  5: { emoji: '✋', label: 'Open', description: '5 fingers → open palm' },
}

interface AdaptiveChordPreviewProps {
  /** The chord coming up next */
  nextChord: string | undefined
  /** The finger count needed for the next chord */
  nextFingerCount: number
  /** Current chord (for contrast) */
  currentChord: string
  /** Current finger count */
  currentFingerCount: number
  /** Whether to show the preview */
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

  const currentShape = HAND_SHAPES[Math.min(5, Math.max(0, currentFingerCount))] ?? HAND_SHAPES[0]
  const nextShape = HAND_SHAPES[Math.min(5, Math.max(0, nextFingerCount))] ?? HAND_SHAPES[0]
  const isChanging = nextChord !== currentChord

  return (
    <AnimatePresence>
      {isChanging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Preview card */}
          <div
            className="rounded-2xl border px-4 py-2.5 flex items-center gap-3 overflow-hidden"
            style={{
              background: 'rgba(168, 85, 247, 0.08)',
              borderColor: 'rgba(168, 85, 247, 0.25)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Current → Next transition */}
            <div className="flex items-center gap-2">
              {/* Current shape (fading out) */}
              <motion.div
                key={`current-${currentChord}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.4 }}
                className="text-center"
              >
                <span className="text-xl opacity-50">{currentShape.emoji}</span>
                <p className="text-[8px] font-mono text-white/30 mt-0.5">{currentChord}</p>
              </motion.div>

              {/* Arrow */}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-purple-400/60 text-sm"
              >
                →
              </motion.span>

              {/* Next shape (pulsing in) */}
              <motion.div
                key={`next-${nextChord}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-center"
              >
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-2xl inline-block"
                >
                  {nextShape.emoji}
                </motion.span>
                <p className="text-[9px] font-black text-purple-300 mt-0.5">{nextChord}</p>
              </motion.div>
            </div>

            {/* Instruction text */}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono text-purple-300/70 uppercase tracking-wider">
                Get ready
              </p>
              <p className="text-xs font-bold text-white/80 truncate">
                {nextShape.description}
              </p>
            </div>

            {/* Finger count badge */}
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30">
              <span className="text-sm font-black text-purple-300">{nextFingerCount}</span>
            </div>
          </div>

          {/* Progress indicator line (animated) */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-amber-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
