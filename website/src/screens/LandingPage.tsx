import { useRef, useEffect, useState, Suspense, useCallback } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import StageScene from '../components/StageScene'
import GuitarLoadingScreen from '../components/GuitarLoadingScreen'
import { playPluckNote, playStrum, initAudioEngine } from '../utils/guitarSound'

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
}
const FADE_IN = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.4, ease: 'easeOut' } },
}

function RevealText({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={FADE_UP}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function RevealFade({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      variants={FADE_IN}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Thin horizontal divider with fade ────────────────────────────────
function LineDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`} />
  )
}

// ── Gesture → Chord demo card ─────────────────────────────────────────
const DEMO_STEPS = [
  { gesture: '✊', chord: 'Em', label: 'Fist', num: '0 fingers' },
  { gesture: '☝️', chord: 'Am', label: 'Index', num: '1 finger' },
  { gesture: '✌️', chord: 'G',  label: 'Peace', num: '2 fingers' },
  { gesture: '🤟', chord: 'C',  label: 'Three', num: '3 fingers' },
  { gesture: '🖐️', chord: 'D',  label: 'Four',  num: '4 fingers' },
  { gesture: '✋', chord: 'F',  label: 'Palm',  num: '5 fingers' },
]

function GestureDemo() {
  const [active, setActive] = useState(2)
  useEffect(() => {
    const iv = setInterval(() => setActive(a => (a + 1) % DEMO_STEPS.length), 1800)
    return () => clearInterval(iv)
  }, [])

  const step = DEMO_STEPS[active]

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Active gesture */}
      <motion.div
        key={active}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="text-7xl mb-4">{step.gesture}</div>
        <div style={{ fontSize: 80, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>
          {step.chord}
        </div>
        <p className="t-label mt-3">{step.num}</p>
      </motion.div>

      {/* Waveform */}
      <div className="flex items-end gap-1 h-8">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-white/40 anim-waveform"
            style={{
              animationDelay: `${i * 0.04}s`,
              animationDuration: `${0.5 + Math.random() * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Step selector */}
      <div className="flex gap-3">
        {DEMO_STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: 36, height: 36,
              borderRadius: 4,
              border: `1px solid ${i === active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: i === active ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: i === active ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 18,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {s.gesture}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Features list ─────────────────────────────────────────────────────
const FEATURES = [
  {
    num: '01',
    title: 'Sub-50ms Response',
    body: 'Chord plays the instant your hand gesture is recognised. Indistinguishable from a real instrument.',
  },
  {
    num: '02',
    title: 'Dynamic Band',
    body: 'Sing softly and the guitar answers gently. Belt a phrase and the accompaniment builds behind you.',
  },
  {
    num: '03',
    title: 'Four Gesture Profiles',
    body: 'Classic. Worship. Bollywood. Blues. Switch between curated chord sets made for each genre.',
  },
  {
    num: '04',
    title: 'Record & Export',
    body: 'Capture your full performance — voice, guitar, video — in one take. Share anywhere.',
  },
  {
    num: '05',
    title: 'Runs Entirely Offline',
    body: 'All gesture recognition and synthesis happens on your device. No server. No latency. No subscription required.',
  },
]

// ── Main page ─────────────────────────────────────────────────────────
interface LandingPageProps {
  onEnter: () => void
  onOpenStudio?: () => void
}

export default function LandingPage({ onEnter, onOpenStudio }: LandingPageProps) {
  const scrollProgress = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const [isLoaded, setIsLoaded] = useState(false)
  const handleLoaded = useCallback(() => setIsLoaded(true), [])

  // ── Acoustic string pluck effect when scrolling page ──
  const lastPluckTimeRef = useRef(0)
  const lastScrollPosRef = useRef(0)

  useEffect(() => {
    const unlockAudio = () => {
      initAudioEngine()
    }

    const handleScrollSound = () => {
      initAudioEngine()
      const now = performance.now()
      const currentPos = window.scrollY
      const delta = Math.abs(currentPos - lastScrollPosRef.current)

      if (delta > 25 && now - lastPluckTimeRef.current > 140) {
        lastPluckTimeRef.current = now
        lastScrollPosRef.current = currentPos

        const stringNotes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4', 'G4', 'B4']
        const noteIdx = Math.floor((currentPos / 220) % stringNotes.length)
        const note = stringNotes[noteIdx]
        playPluckNote(note, 0.28, noteIdx % 6)
      }
    }

    window.addEventListener('scroll', handleScrollSound, { passive: true })
    window.addEventListener('wheel', unlockAudio, { passive: true })
    window.addEventListener('touchstart', unlockAudio, { passive: true })
    window.addEventListener('click', unlockAudio, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScrollSound)
      window.removeEventListener('wheel', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
      window.removeEventListener('click', unlockAudio)
    }
  }, [])

  // Keep scrollProgress ref in sync with framer's scroll value
  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => { scrollProgress.current = Math.min(v * 3.5, 1) })
    return unsub
  }, [scrollYProgress])

  // Parallax transforms for text layers
  const heroY = useTransform(scrollYProgress, [0, 0.25], ['0%', '-18%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0])

  return (
    <div ref={containerRef} style={{ background: '#050505' }}>
      {/* ── Guitar loading screen — shown until 3D scene is ready ── */}
      <GuitarLoadingScreen isLoaded={isLoaded} />

      {/* ── Single Three.js canvas: Lightfall BG + rotating guitar, one WebGL context ── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <Suspense fallback={null}>
          <StageScene scrollProgress={scrollProgress} onLoaded={handleLoaded} />
        </Suspense>
      </div>

      {/* ── Nav ── */}
      <nav style={{ background: 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: '#fff' }}>AIRCHORD</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span
            className="t-label"
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onClick={() => { playStrum(); onEnter(); }}
          >
            Open App
          </span>
          <button
            className="btn btn-light"
            style={{ padding: '10px 20px', fontSize: 12 }}
            onClick={() => { playStrum(); onEnter(); }}
          >
            Try Free
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — HERO (full screen)
      ════════════════════════════════════════════════════════════════ */}
      <div className="scroll-layer" style={{ position: 'relative', zIndex: 10 }}>
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 40px 80px',
            position: 'relative',
          }}
        >
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            <motion.p
              className="t-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              style={{ marginBottom: 28 }}
            >
              The AI Guitar Companion
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(52px, 8vw, 110px)',
                fontWeight: 300,
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                color: '#fff',
                maxWidth: 760,
                marginBottom: 20,
              }}
            >
              Sing Freely.<br />
              <span style={{ fontWeight: 700 }}>We'll Play<br />the Guitar.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ color: '#A5A5A5', fontSize: 16, fontWeight: 300, maxWidth: 400, marginBottom: 40, lineHeight: 1.6 }}
            >
              Show your hand to the camera. Hear real guitar chords play instantly. No instrument required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <button
                className="btn btn-light"
                onClick={() => { playStrum(); if (onOpenStudio) onOpenStudio(); else onEnter(); }}
                style={{ gap: 10 }}
              >
                Open Studio <ArrowRight size={14} />
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  playPluckNote('C5', 0.18)
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                See how it works
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1 }}
            style={{
              position: 'absolute',
              bottom: 36,
              right: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              className="anim-slow-pulse"
              style={{
                width: 1,
                height: 56,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
              }}
            />
            <span className="t-label">Scroll</span>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — HOW IT WORKS
        ════════════════════════════════════════════════════════════════ */}
        <section
          id="how-it-works"
          style={{
            minHeight: '100vh',
            padding: '140px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
            <RevealText>
              <p className="t-label" style={{ marginBottom: 20 }}>How it works</p>
              <h2 className="t-heading" style={{ color: '#fff', marginBottom: 80 }}>
                A new way to<br />perform music.
              </h2>
            </RevealText>

            {/* Steps */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              {[
                { step: '01', icon: '📷', title: 'Camera Sees You', body: 'MediaPipe maps 21 hand landmarks in real time.', note: 'E3' },
                { step: '02', icon: '✋', title: 'Gesture Detected', body: 'Finger count classified with 95%+ accuracy.', note: 'A3' },
                { step: '03', icon: '🎵', title: 'Chord Mapped', body: 'Each gesture triggers a guitar chord instantly.', note: 'D4' },
                { step: '04', icon: '🎸', title: 'Music Plays', body: 'Karplus-Strong synthesis. Studio-grade sound.', note: 'G4' },
              ].map((s, i) => (
                <RevealFade key={i} delay={i * 0.15}>
                  <div
                    style={{
                      padding: '48px 36px',
                      background: '#080808',
                      borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'background 0.3s ease',
                    }}
                  >
                    <p className="t-label" style={{ marginBottom: 24 }}>{s.step}</p>
                    <div style={{ fontSize: 32, marginBottom: 20 }}>{s.icon}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 12, letterSpacing: '-0.01em' }}>
                      {s.title}
                    </h3>
                    <p className="t-body" style={{ fontSize: 14 }}>{s.body}</p>
                  </div>
                </RevealFade>
              ))}
            </div>
          </div>
        </section>

        <LineDivider />

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — STORY / CINEMATIC TEXT
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '160px 40px', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
            <RevealText>
              <p className="t-label" style={{ marginBottom: 40 }}>The idea</p>
            </RevealText>
            <RevealText delay={0.1}>
              <p style={{
                fontSize: 'clamp(28px, 4.5vw, 58px)',
                fontWeight: 300,
                lineHeight: 1.18,
                letterSpacing: '-0.025em',
                color: '#fff',
                marginBottom: 24,
              }}>
                Singing and playing guitar at the same time is hard.
              </p>
            </RevealText>
            <RevealText delay={0.2}>
              <p style={{
                fontSize: 'clamp(28px, 4.5vw, 58px)',
                fontWeight: 300,
                lineHeight: 1.18,
                letterSpacing: '-0.025em',
                color: '#A5A5A5',
                marginBottom: 40,
              }}>
                Your voice deserves your full attention.
              </p>
            </RevealText>
            <RevealText delay={0.3}>
              <p style={{
                fontSize: 'clamp(28px, 4.5vw, 58px)',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                color: '#fff',
              }}>
                So we built a guitarist that follows you.
              </p>
            </RevealText>
          </div>
        </section>

        <LineDivider />

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4 — INTERACTIVE DEMO
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '140px 40px', minHeight: '90vh' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 80,
              alignItems: 'center',
            }}>
              {/* Left: Demo */}
              <RevealFade>
                <div style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  padding: '64px 48px',
                  background: '#080808',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  {/* Fake camera frame */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#050505',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 32,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Corner marks */}
                    {[
                      { top: 12, left: 12, borderTop: '1px solid rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.4)', width: 20, height: 20 },
                      { top: 12, right: 12, borderTop: '1px solid rgba(255,255,255,0.4)', borderRight: '1px solid rgba(255,255,255,0.4)', width: 20, height: 20 },
                      { bottom: 12, left: 12, borderBottom: '1px solid rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.4)', width: 20, height: 20 },
                      { bottom: 12, right: 12, borderBottom: '1px solid rgba(255,255,255,0.4)', borderRight: '1px solid rgba(255,255,255,0.4)', width: 20, height: 20 },
                    ].map((s, i) => <div key={i} style={{ position: 'absolute', ...s }} />)}

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>🤚</div>
                      <p className="t-label">Camera · Gesture Detection</p>
                    </div>

                    {/* Scanning line */}
                    <motion.div
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: 1,
                        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
                      }}
                    />
                  </div>

                  <GestureDemo />
                </div>
              </RevealFade>

              {/* Right: Copy */}
              <div>
                <RevealText>
                  <p className="t-label" style={{ marginBottom: 24 }}>Live detection</p>
                  <h2 className="t-heading" style={{ color: '#fff', marginBottom: 28 }}>
                    Show a finger.<br />Hear a chord.
                  </h2>
                  <p className="t-body" style={{ marginBottom: 40 }}>
                    AirChord runs MediaPipe hand tracking at 60 fps, classifying your gesture and triggering guitar synthesis in under 50 milliseconds. No latency. No MIDI controller. Just your hand.
                  </p>
                </RevealText>
                <RevealFade delay={0.2}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { label: 'Latency', value: '< 50ms' },
                      { label: 'Accuracy', value: '> 95%' },
                      { label: 'Chords', value: '12 gestures' },
                    ].map(m => (
                      <div key={m.label} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                      }}>
                        <span className="t-label">{m.label}</span>
                        <span style={{ fontSize: 20, fontWeight: 300, color: '#fff', letterSpacing: '-0.02em' }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </RevealFade>
              </div>
            </div>
          </div>
        </section>

        <LineDivider />

        {/* ════════════════════════════════════════════════════════════════
            SECTION 5 — FEATURES (one at a time, large type)
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '140px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
            <RevealText>
              <p className="t-label" style={{ marginBottom: 80 }}>What it does</p>
            </RevealText>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FEATURES.map((f, i) => (
                <RevealText key={i} delay={i * 0.05}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 380px',
                      gap: 40,
                      alignItems: 'start',
                      padding: '48px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="t-label" style={{ paddingTop: 8 }}>{f.num}</span>
                    <h3 style={{
                      fontSize: 'clamp(22px, 3vw, 38px)',
                      fontWeight: 300,
                      letterSpacing: '-0.025em',
                      color: '#fff',
                      lineHeight: 1.1,
                    }}>
                      {f.title}
                    </h3>
                    <p className="t-body" style={{ paddingTop: 6 }}>{f.body}</p>
                  </div>
                </RevealText>
              ))}
            </div>
          </div>
        </section>

        <LineDivider />

        {/* ════════════════════════════════════════════════════════════════
            SECTION 6 — CTA (return to guitar, lights dim)
        ════════════════════════════════════════════════════════════════ */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '100px 40px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Darkening overlay as we approach end */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,5,0.6) 60%, #050505 100%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 700 }}>
            <RevealText>
              <p className="t-label" style={{ marginBottom: 32 }}>Ready to perform</p>
              <h2
                style={{
                  fontSize: 'clamp(44px, 7vw, 96px)',
                  fontWeight: 300,
                  letterSpacing: '-0.04em',
                  lineHeight: 0.95,
                  color: '#fff',
                  marginBottom: 24,
                }}
              >
                Your hands.<br />
                <span style={{ fontWeight: 700 }}>Our guitar.</span>
              </h2>
            </RevealText>

            <RevealFade delay={0.2}>
              <p className="t-body" style={{ marginBottom: 56, maxWidth: 480, margin: '0 auto 56px' }}>
                Open the studio. Your first chord is thirty seconds away.
              </p>
            </RevealFade>

            <RevealFade delay={0.35}>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="btn btn-light"
                  onClick={onEnter}
                  style={{ gap: 10, padding: '16px 36px', fontSize: 14 }}
                >
                  Open Studio <ArrowRight size={14} />
                </motion.button>
              </div>
            </RevealFade>

            {/* Trust signal */}
            <RevealFade delay={0.5}>
              <p style={{ marginTop: 48, fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                Free to use · No sign-up · Works in browser
              </p>
            </RevealFade>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          padding: '40px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>
            AIRCHORD
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            © 2026 AirChord — All rights reserved
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Help'].map(l => (
              <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'color 0.2s' }}>
                {l}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
