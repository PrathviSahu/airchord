import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

// Pure CSS/SVG guitar silhouette — no WebGL conflict
// Renders as a dark guitar body against the Lightfall background

interface GuitarSilhouetteProps {
  className?: string
}

export default function GuitarSilhouette({ className = '' }: GuitarSilhouetteProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Breathing animation wrapper */}
        <motion.div
          animate={{
            y: [0, -6, 0],
            scale: [1, 1.004, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ position: 'relative' }}
        >
          <GuitarSVG />
        </motion.div>
      </motion.div>
    </div>
  )
}

function GuitarSVG() {
  return (
    <svg
      viewBox="0 0 240 520"
      width="260"
      height="560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 60px rgba(0,0,0,0.9))' }}
    >
      {/* ── Body lower bout ── */}
      <path
        d="M120 480
           C 70 480, 20 440, 15 390
           C 10 340, 35 300, 55 275
           C 70 255, 75 240, 70 220
           C 65 200, 55 185, 55 165
           C 55 125, 85 100, 120 100
           C 155 100, 185 125, 185 165
           C 185 185, 175 200, 170 220
           C 165 240, 170 255, 185 275
           C 205 300, 230 340, 225 390
           C 220 440, 170 480, 120 480Z"
        fill="#0a0a0a"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />

      {/* Body highlight — rim light from left */}
      <path
        d="M55 165
           C 55 125, 85 100, 120 100
           C 120 100, 95 110, 72 140
           C 56 162, 55 165, 55 165Z"
        fill="rgba(64,144,255,0.12)"
      />
      <path
        d="M15 390
           C 10 340, 35 300, 55 275
           C 55 275, 25 320, 22 370
           C 20 395, 15 390, 15 390Z"
        fill="rgba(64,144,255,0.08)"
      />

      {/* Warm spotlight glow on body top-right */}
      <path
        d="M185 165
           C 185 125, 155 100, 120 100
           C 120 100, 148 108, 168 135
           C 183 155, 185 165, 185 165Z"
        fill="rgba(255,220,120,0.08)"
      />

      {/* Sound hole */}
      <circle cx="120" cy="290" r="40" fill="#050505" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      {/* Rosette ring */}
      <circle cx="120" cy="290" r="40" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="3" />
      <circle cx="120" cy="290" r="35" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="1" />

      {/* Bridge */}
      <rect x="85" y="355" width="70" height="12" rx="1" fill="#0e0e0e" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Saddle */}
      <rect x="90" y="362" width="60" height="4" rx="0.5" fill="rgba(230,220,200,0.4)" />

      {/* Bridge pins */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <circle key={i} cx={95 + i * 10} cy={360} r={2} fill="rgba(255,255,255,0.2)" />
      ))}

      {/* Pick guard */}
      <path
        d="M130 310 C 140 305, 155 310, 158 330 C 161 350, 155 375, 148 378 C 140 381, 128 370, 126 350 C 124 335, 125 315, 130 310Z"
        fill="rgba(0,0,0,0.6)"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="0.5"
      />

      {/* ── Neck ── */}
      <path
        d="M100 100 L100 30 L140 30 L140 100Z"
        fill="#0d0d0d"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      {/* Fretboard (slightly inset) */}
      <path
        d="M104 100 L104 32 L136 32 L136 100Z"
        fill="#080808"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="0.5"
      />

      {/* Frets */}
      {[0, 10, 20, 30, 40, 50, 60].map((y, i) => (
        <line key={i} x1="104" y1={38 + y} x2="136" y2={38 + y} stroke="rgba(180,170,160,0.35)" strokeWidth="1" />
      ))}

      {/* Fret position dots */}
      {[48, 68, 88].map((y, i) => (
        <circle key={i} cx="120" cy={y} r="2.5" fill="rgba(210,200,185,0.4)" />
      ))}

      {/* ── Headstock ── */}
      <path
        d="M105 30 L105 5 C 105 2, 107 0, 120 0 C 133 0, 135 2, 135 5 L135 30Z"
        fill="#0e0e0e"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      {/* Logo plate on headstock */}
      <rect x="108" y="4" width="24" height="16" rx="1" fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />

      {/* Tuning pegs — left */}
      <circle cx="102" cy="10" r="4" fill="#111" stroke="rgba(200,200,200,0.25)" strokeWidth="0.8" />
      <circle cx="102" cy="18" r="4" fill="#111" stroke="rgba(200,200,200,0.25)" strokeWidth="0.8" />
      <circle cx="102" cy="26" r="4" fill="#111" stroke="rgba(200,200,200,0.25)" strokeWidth="0.8" />
      {/* Tuning pegs — right */}
      <circle cx="138" cy="10" r="4" fill="#111" stroke="rgba(200,200,200,0.25)" strokeWidth="0.8" />
      <circle cx="138" cy="18" r="4" fill="#111" stroke="rgba(200,200,200,0.25)" strokeWidth="0.8" />
      <circle cx="138" cy="26" r="4" fill="#111" stroke="rgba(200,200,200,0.25)" strokeWidth="0.8" />

      {/* ── Strings (6) — from saddle to nut ── */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const x = 98 + i * 8.4
        return (
          <line
            key={i}
            x1={x}
            y1={363}  /* saddle */
            x2={x}
            y2={5}    /* nut */
            stroke={i < 2 ? 'rgba(201,168,76,0.55)' : 'rgba(220,218,210,0.45)'}
            strokeWidth={i < 2 ? 1.4 : 0.9}
          />
        )
      })}

      {/* Nut */}
      <rect x="104" y="29" width="32" height="3" rx="0.5" fill="rgba(230,220,200,0.35)" />

      {/* Body clearcoat sheen — subtle diagonal highlight */}
      <path
        d="M90 120 C 100 110, 120 108, 140 115 C 155 120, 165 135, 170 150"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
