import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export default function GuitarAssembly() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })

  // Part visibility thresholds
  const bodyOp = useTransform(progress, [0.05, 0.15], [0, 1])
  const bodyY = useTransform(progress, [0.05, 0.18], [120, 0])
  const bodyScale = useTransform(progress, [0.05, 0.18], [0.7, 1])
  const bodyRotate = useTransform(progress, [0.05, 0.18], [15, 0])

  const holeOp = useTransform(progress, [0.18, 0.28], [0, 1])
  const holeScale = useTransform(progress, [0.18, 0.28], [0, 1])

  const neckOp = useTransform(progress, [0.28, 0.38], [0, 1])
  const neckY = useTransform(progress, [0.28, 0.38], [-150, 0])

  const fretOp = useTransform(progress, [0.38, 0.46], [0, 1])

  const headOp = useTransform(progress, [0.46, 0.54], [0, 1])
  const headY = useTransform(progress, [0.46, 0.54], [-80, 0])

  const stringOp = useTransform(progress, [0.54, 0.65], [0, 1])
  const stringScale = useTransform(progress, [0.54, 0.65], [0, 1])

  const glowOp = useTransform(progress, [0.65, 0.8], [0, 0.5])

  // Step labels
  const steps = [
    { label: 'Body', desc: 'Hand-selected tonewoods for rich, resonant warmth', range: [0.05, 0.25] as const },
    { label: 'Sound Hole', desc: 'Precision-cut for optimal resonance and projection', range: [0.18, 0.35] as const },
    { label: 'Neck', desc: 'Mahogany neck with smooth, comfortable playability', range: [0.28, 0.45] as const },
    { label: 'Fretboard', desc: 'Rosewood fretboard with polished nickel frets', range: [0.38, 0.55] as const },
    { label: 'Headstock', desc: 'Classic design with precision tuning machines', range: [0.46, 0.63] as const },
    { label: 'Strings', desc: 'Steel strings with natural sustain and warmth', range: [0.54, 0.72] as const },
  ]

  return (
    <div ref={containerRef} className="relative" style={{ height: '400vh' }} id="how-it-works">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background warm particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 4,
                height: 3 + Math.random() * 4,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                background: ['#C4956A', '#8B5E3C', '#D4A574', '#A0522D'][i % 4],
                opacity: 0.15 + Math.random() * 0.15,
              }}
            />
          ))}
        </div>

        {/* === REALISTIC CSS GUITAR === */}
        <div className="relative" style={{ width: 300, height: 520, perspective: 800 }}>

          {/* Glow behind guitar */}
          <motion.div
            style={{ opacity: glowOp }}
            className="absolute -inset-20 rounded-full blur-[60px] bg-amber-300/40 pointer-events-none"
          />

          {/* Headstock */}
          <motion.div
            style={{ opacity: headOp, y: headY, top: 0 }}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <div className="relative" style={{ width: 50, height: 70 }}>
              {/* Headstock body */}
              <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-[#3D2314] to-[#5C3A1E] shadow-md" />
              {/* Tuning pegs */}
              {[0, 1, 2].map(i => (
                <div key={`l${i}`} className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow"
                  style={{ left: -4, top: 10 + i * 18 }} />
              ))}
              {[0, 1, 2].map(i => (
                <div key={`r${i}`} className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow"
                  style={{ right: -4, top: 10 + i * 18 }} />
              ))}
            </div>
          </motion.div>

          {/* Neck */}
          <motion.div
            style={{ opacity: neckOp, y: neckY, top: 68 }}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <div style={{ width: 42, height: 200 }}
              className="bg-gradient-to-b from-[#3D2314] via-[#5C3A1E] to-[#4A2C1A] rounded-t-sm shadow-lg">
              {/* Fretboard overlay */}
              <motion.div
                className="absolute top-1 bg-gradient-to-b from-[#1C1008] to-[#2D1810] rounded-sm"
                style={{ width: 36, height: 190, left: '50%', transform: 'translateX(-50%)', opacity: fretOp as any }}
              >
                {/* Frets */}
                {[20, 35, 48, 59, 68, 76, 83, 89].map((top, i) => (
                  <div key={i} className="absolute w-full" style={{
                    top: `${top}%`,
                    height: i < 4 ? 1.5 : 1,
                    background: 'rgba(192,192,192,0.5)',
                  }} />
                ))}
                {/* Fret dots */}
                {[38, 55, 70].map((top, i) => (
                  <div key={i} className="absolute w-1.5 h-1.5 rounded-full left-1/2 -translate-x-1/2"
                    style={{ top: `${top}%`, background: '#DEB887', boxShadow: '0 0 4px rgba(222,184,135,0.5)' }} />
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Body */}
          <motion.div
            style={{ opacity: bodyOp, y: bodyY, scale: bodyScale, rotateX: bodyRotate, top: 260 }}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <div style={{ width: 260, height: 240 }}
              className="relative">
              {/* Main body — figure-8 shape using two overlapping ovals */}
              <div className="absolute"
                style={{
                  width: 240, height: 180,
                  top: 0, left: 10,
                  borderRadius: '50% 50% 45% 45%',
                  background: 'linear-gradient(145deg, #DEB887 0%, #C4956A 25%, #A0764A 50%, #8B5E3C 75%, #6B4226 100%)',
                  boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.2), inset 0 -8px 25px rgba(0,0,0,0.15), 0 15px 40px rgba(92,58,30,0.25)',
                }} />
              {/* Lower bout */}
              <div className="absolute"
                style={{
                  width: 260, height: 200,
                  top: 60, left: 0,
                  borderRadius: '45% 45% 50% 50%',
                  background: 'linear-gradient(145deg, #C4956A 0%, #A0764A 30%, #8B5E3C 60%, #6B4226 100%)',
                  boxShadow: 'inset 0 2px 15px rgba(255,255,255,0.1), inset 0 -10px 30px rgba(0,0,0,0.2), 0 20px 50px rgba(92,58,30,0.3)',
                }} />
              {/* Bridge */}
              <div className="absolute" style={{
                width: 60, height: 8,
                bottom: 50, left: '50%', transform: 'translateX(-50%)',
                borderRadius: 4,
                background: 'linear-gradient(90deg, #3D2314, #5C3A1E, #3D2314)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }} />
              {/* Bridge pins */}
              <div className="absolute flex gap-1.5" style={{ bottom: 42, left: '50%', transform: 'translateX(-50%)' }}>
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full bg-gray-300" />
                ))}
              </div>

              {/* Sound hole */}
              <motion.div
                style={{
                  opacity: holeOp, scale: holeScale,
                  width: 80, height: 80,
                  top: 55, left: '50%', transform: 'translateX(-50%)',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #0a0502 55%, #1a0f08 75%, #2D1810 100%)',
                  boxShadow: '0 0 0 3px #8B5E3C, 0 0 0 6px #C4956A, 0 0 0 8px #8B5E3C, inset 0 0 20px rgba(0,0,0,0.8)',
                } as any}
                className="absolute"
              />
              {/* Rosette decorative ring */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  opacity: holeOp,
                  width: 96, height: 96,
                  top: 47, left: '50%', transform: 'translateX(-50%)',
                  border: '1px solid rgba(196,149,106,0.3)',
                } as any}
              />
            </div>
          </motion.div>

          {/* Strings */}
          <motion.div
            className="absolute flex justify-between"
            style={{
              opacity: stringOp, scale: stringScale,
              top: 70, height: 400, width: 30,
              left: '50%', transform: 'translateX(-50%)',
            } as any}
          >
            {[1.2, 1.3, 1.5, 1.5, 1.8, 2].map((w, i) => (
              <div
                key={i}
                className={i < 3 ? 'guitar-string' : 'guitar-string-thick'}
                style={{
                  width: w,
                  height: '100%',
                  transformOrigin: 'top',
                  animation: `string-vibrate 0.${6 + i}s infinite alternate`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Step labels — alternating sides */}
        {steps.map((step, i) => {
          const op = useTransform(progress, [step.range[0], step.range[0] + 0.03, step.range[1] - 0.02, step.range[1]], [0, 1, 1, 0])
          return (
            <motion.div
              key={step.label}
              className="absolute pointer-events-none"
              style={{
                opacity: op as any,
                top: '35%',
                left: i % 2 === 0 ? '8%' : 'auto',
                right: i % 2 !== 0 ? '8%' : 'auto',
                textAlign: i % 2 === 0 ? 'left' as const : 'right' as const,
              }}
            >
              <div className="text-xs font-mono text-amber-600 uppercase tracking-[4px] mb-2">
                Step {i + 1} of 6
              </div>
              <div className="font-heading text-3xl md:text-4xl lg:text-5xl text-stone-800 mb-3">
                {step.label}
              </div>
              <div className="text-base text-stone-500 max-w-[280px] leading-relaxed">
                {step.desc}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
