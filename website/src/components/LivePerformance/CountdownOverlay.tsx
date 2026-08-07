// ── Countdown Overlay ─────────────────────────────────────────────────────────
// Shows the 3-2-1 countdown before performance starts

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CountdownOverlayProps {
  countdown: number | null
  chords: string[]
}

export function CountdownOverlay({ countdown, chords }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {countdown !== null && (
        <motion.div
          key={countdown}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-white/50 text-sm font-mono mb-4 tracking-widest uppercase">Get Ready…</p>
          <span
            className="font-black tabular-nums"
            style={{
              fontSize: 140,
              color: 'white',
              textShadow: '0 0 60px rgba(168,85,247,0.8), 0 0 120px rgba(168,85,247,0.4)',
            }}
          >
            {countdown}
          </span>
          <p className="text-white/30 text-xs font-mono mt-4">
            🎸 {chords.join('  ·  ')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
