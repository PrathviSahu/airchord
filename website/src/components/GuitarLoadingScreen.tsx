import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Animated guitar string SVG ─────────────────────────────────────────
function GuitarStrings({ ready }: { ready: boolean }) {
  const strings = [
    { delay: 0,   thick: 3,   color: '#e2c07c', dur: 0.6  },
    { delay: 0.1, thick: 2.5, color: '#d4a853', dur: 0.55 },
    { delay: 0.2, thick: 2,   color: '#c8965e', dur: 0.5  },
    { delay: 0.3, thick: 1.5, color: '#b87c3b', dur: 0.48 },
    { delay: 0.4, thick: 1.2, color: '#a06828', dur: 0.45 },
    { delay: 0.5, thick: 1,   color: '#8a5520', dur: 0.42 },
  ]

  return (
    <svg width="220" height="160" viewBox="0 0 220 160" className="select-none">
      {/* Guitar body silhouette */}
      <ellipse cx="110" cy="105" rx="62" ry="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
      <ellipse cx="110" cy="105" rx="44" ry="36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      {/* Sound hole */}
      <circle cx="110" cy="102" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {/* Guitar neck */}
      <rect x="103" y="0" width="14" height="60" rx="3" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
      {/* Frets */}
      {[12, 24, 36, 48].map((y, i) => (
        <line key={i} x1="103" y1={y} x2="117" y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}

      {/* Animated Guitar Strings */}
      {strings.map((s, i) => {
        const x = 95 + i * 6
        return (
          <g key={i}>
            {/* Static string */}
            <line x1={x} y1={0} x2={x} y2={155} stroke={s.color} strokeWidth={s.thick} opacity={0.3} />
            {/* Animated vibrating string */}
            {ready && (
              <motion.path
                d={`M ${x} 0 Q ${x + 4} 80 ${x} 155`}
                stroke={s.color}
                strokeWidth={s.thick}
                fill="none"
                opacity={0.85}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 1],
                  opacity: [0, 0.85, 0.85],
                  d: [
                    `M ${x} 0 Q ${x} 80 ${x} 155`,
                    `M ${x} 0 Q ${x + 6} 80 ${x} 155`,
                    `M ${x} 0 Q ${x - 6} 80 ${x} 155`,
                    `M ${x} 0 Q ${x + 4} 80 ${x} 155`,
                    `M ${x} 0 Q ${x - 2} 80 ${x} 155`,
                    `M ${x} 0 Q ${x} 80 ${x} 155`,
                  ],
                }}
                transition={{
                  delay: s.delay,
                  duration: s.dur * 3,
                  times: [0, 0.1, 0.3, 0.5, 0.75, 1],
                  ease: 'easeOut',
                  repeat: Infinity,
                  repeatDelay: 1.2,
                }}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Neon progress bar ──────────────────────────────────────────────────
function NeonProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-xs relative h-1 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #7c3aed, #a855f7, #fbbf24)',
          boxShadow: '0 0 12px rgba(168,85,247,0.8), 0 0 24px rgba(251,191,36,0.4)',
        }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}

// ── Floating particle dots ─────────────────────────────────────────────
function Particle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: Math.random() > 0.5 ? 'rgba(168,85,247,0.6)' : 'rgba(251,191,36,0.5)',
        boxShadow: `0 0 ${size * 2}px currentColor`,
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration: 2.5 + Math.random() * 1.5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ── Loading tips ───────────────────────────────────────────────────────
const TIPS = [
  '🎸 Initialising AI gesture engine...',
  '✋ Calibrating hand-tracking model...',
  '🎵 Loading guitar tone synthesis...',
  '🎼 Rendering 3D guitar stage...',
  '✨ Almost ready to jam!',
]

// ── Main Loading Screen ────────────────────────────────────────────────
interface GuitarLoadingScreenProps {
  isLoaded: boolean
}

export default function GuitarLoadingScreen({ isLoaded }: GuitarLoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Fake-progress that runs up to 90, then jumps to 100 when loaded
  useEffect(() => {
    if (isLoaded) {
      setProgress(100)
      setTimeout(() => setVisible(false), 900)
      return
    }

    const iv = setInterval(() => {
      setProgress(prev => {
        if (prev >= 88) return prev
        return prev + (88 - prev) * 0.04 + 0.4
      })
    }, 60)
    return () => clearInterval(iv)
  }, [isLoaded])

  // Rotate tips
  useEffect(() => {
    const iv = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 1600)
    return () => clearInterval(iv)
  }, [])

  // Pre-generate stable particles
  const particles = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 37 + 11) % 95 + 2,
    y: (i * 53 + 7) % 90 + 3,
    size: (i % 4) + 2,
    delay: (i * 0.2) % 2.5,
  }))

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        key="loading-screen"
        className="fixed inset-0 z-[999] flex flex-col items-center justify-center select-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #0e0416 0%, #050505 60%, #000000 100%)',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </div>

        {/* Glow blob behind guitar */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 340,
            height: 340,
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
          }}
        />

        {/* Main content card */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span
              className="font-black tracking-[0.2em] text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #fbbf24 100%)',
                fontSize: 22,
                letterSpacing: '0.22em',
              }}
            >
              AIRCHORD
            </span>
          </motion.div>

          {/* Animated guitar strings illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <GuitarStrings ready={progress > 20} />
          </motion.div>

          {/* Loading label */}
          <div className="flex flex-col items-center gap-3 w-72">
            {/* Tip text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                className="text-xs text-center font-mono"
                style={{ color: 'rgba(196,181,253,0.75)', letterSpacing: '0.04em' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                {TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Neon progress bar */}
            <NeonProgressBar progress={progress} />

            {/* Percent */}
            <motion.span
              className="text-[10px] font-mono tabular-nums"
              style={{ color: 'rgba(251,191,36,0.7)' }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>

          {/* Beat dots / pulse */}
          <div className="flex items-center gap-2 mt-1">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: i % 2 === 0 ? '#a855f7' : '#fbbf24',
                }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 0.9,
                  delay: i * 0.18,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
