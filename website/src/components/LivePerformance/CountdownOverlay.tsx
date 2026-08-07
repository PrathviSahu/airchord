// ── Countdown Overlay ─────────────────────────────────────────────────────────
// Cinematic 3-2-1 before the performance starts.

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
          initial={{ opacity: 0, scale: 1.25 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.75 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="studio-label mb-6">Get ready</p>
          <div className="relative flex items-center justify-center">
            {/* Hairline ring */}
            <div
              className="absolute w-56 h-56 rounded-full border anim-slow-pulse"
              style={{ borderColor: 'rgba(201,168,76,0.25)' }}
            />
            <span
              className="studio-num font-light"
              style={{
                fontSize: 150,
                letterSpacing: '-0.04em',
                color: '#fff',
                textShadow: '0 0 80px rgba(201,168,76,0.35)',
              }}
            >
              {countdown}
            </span>
          </div>
          <p className="studio-num text-[11px] font-mono text-white/35 mt-6 tracking-[0.3em]">
            {chords.join('  ·  ')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
