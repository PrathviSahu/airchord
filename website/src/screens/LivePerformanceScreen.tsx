import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { SessionConfig } from './SongSetupScreen'
import {
  initAudioEngine,
  triggerGuitarChord,
  setCapoFret,
  toggleStrumming,
  isStrummingActive,
} from '../utils/guitarSound'
import { useHandTracking } from '../utils/useHandTracking'
import { GestureEngine } from '../utils/GestureEngine'
import { getProfileById } from '../utils/GestureProfiles'
import { drawHandSkeleton } from '../utils/handTracker'

// Finger emoji set
const FINGER_EMOJI = ['✊', '☝️', '✌️', '🤟', '🖐️', '✋']
const STRUM_SYMBOL_MAP: Record<string, string> = { D: '↓', U: '↑', '.': '•', X: '✕' }

interface LivePerformanceScreenProps {
  config: SessionConfig
  onEnd: () => void
}

export default function LivePerformanceScreen({ config, onEnd }: LivePerformanceScreenProps) {
  const { song, capo, bpm, strumPattern, displayPattern, fingerMapping } = config

  // Flatten lyrics
  const allLyrics = song.sections.flatMap(s => s.lyrics)

  // State
  const [isPlaying, setIsPlaying]           = useState(false)
  const [isMuted, setIsMuted]               = useState(false)
  const [currentLine, setCurrentLine]       = useState(0)
  const [activeBeat, setActiveBeat]         = useState(-1)
  const [detectedFingers, setDetectedFingers] = useState<number | null>(null)
  const [detectedChord, setDetectedChord]   = useState<string>(fingerMapping[0] || 'G')
  const [cameraReady, setCameraReady]       = useState(false)
  const [cameraError, setCameraError]       = useState<string | null>(null)
  const [countdown, setCountdown]           = useState<number | null>(null)

  // Refs
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const gestureRef    = useRef(new GestureEngine(getProfileById('classic')))
  const detectedChordRef = useRef(detectedChord)
  detectedChordRef.current = detectedChord

  const { initialize, processFrame, setOnResults } = useHandTracking()

  // ── Boot camera ──────────────────────────────────────────────────────
  useEffect(() => {
    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
            setCameraReady(true)
          }
        }
      } catch {
        setCameraError('Camera blocked. Please allow camera access and refresh.')
      }
    }
    startCam()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // ── MediaPipe hand tracking ──────────────────────────────────────────
  useEffect(() => { initialize() }, [initialize])

  useEffect(() => {
    setOnResults((results) => {
      if (!canvasRef.current || !videoRef.current) return
      const canvas = canvasRef.current
      canvas.width  = videoRef.current.videoWidth  || 1280
      canvas.height = videoRef.current.videoHeight || 720
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)

      if (results.multiHandLandmarks?.length) {
        const lm = results.multiHandLandmarks[0]
        if (ctx) drawHandSkeleton(ctx, lm, canvas.width, canvas.height, true)

        // Gesture engine
        const gesture = gestureRef.current.process(lm)
        if (gesture) {
          const fingers = gesture.fingerCount
          const chord   = fingerMapping[fingers] || fingerMapping[0]
          setDetectedFingers(fingers)
          setDetectedChord(chord)
        }
      } else {
        // No hand detected — clear
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    })
  }, [setOnResults, fingerMapping])

  // Frame loop
  useEffect(() => {
    let id: number
    const loop = () => {
      if (cameraReady && videoRef.current) processFrame(videoRef.current)
      id = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(id)
  }, [cameraReady, processFrame])

  // ── Apply capo ───────────────────────────────────────────────────────
  useEffect(() => { setCapoFret(capo) }, [capo])

  // ── Auto-strum beat engine ───────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || isMuted) {
      setActiveBeat(-1)
      return
    }
    const beatMs = Math.round(60000 / (bpm || 60))
    const patterns = strumPattern
    let beatIndex = 0

    const iv = setInterval(() => {
      beatIndex = (beatIndex + 1) % patterns.length
      setActiveBeat(beatIndex)
      const stroke = patterns[beatIndex]
      if (stroke !== '.' && stroke !== 'X') {
        triggerGuitarChord(detectedChordRef.current, 0.28)
      }
    }, beatMs)

    return () => clearInterval(iv)
  }, [isPlaying, isMuted, bpm, strumPattern])

  // ── Lyric auto-advance ───────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return
    const secPerLine = (60 / bpm) * 4 // ~4 beats per lyric line
    const iv = setInterval(() => {
      setCurrentLine(prev => {
        if (prev >= allLyrics.length - 1) return prev
        return prev + 1
      })
    }, secPerLine * 1000)
    return () => clearInterval(iv)
  }, [isPlaying, bpm, allLyrics.length])

  // ── Countdown then start ─────────────────────────────────────────────
  const handleStartWithCountdown = useCallback(() => {
    initAudioEngine()
    setCountdown(3)
    let count = 3
    const iv = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(iv)
        setCountdown(null)
        setIsPlaying(true)
        setCurrentLine(0)
      } else {
        setCountdown(count)
      }
    }, 1000)
  }, [])

  const handlePause = useCallback(() => setIsPlaying(p => !p), [])

  const currentLyric   = allLyrics[currentLine]
  const nextLyric      = allLyrics[currentLine + 1]
  const fingerIdx      = detectedFingers ?? -1
  const chordForGesture = fingerIdx >= 0 ? fingerMapping[fingerIdx] ?? '—' : '—'

  // Pattern symbols
  const patternSymbols = displayPattern.trim().split(/\s+/)

  return (
    <div className="fixed inset-0 overflow-hidden font-sans" style={{ background: '#000' }}>

      {/* ── Full-bleed camera background ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        style={{ opacity: cameraReady ? 1 : 0, transition: 'opacity 0.5s' }}
      />

      {/* AI hand skeleton canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
      />

      {/* Gradient darkening overlay — bottom 40% only so face stays visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Camera offline fallback */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#06060a]">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-purple-500/40 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-sm font-mono">Starting camera…</p>
          </div>
        </div>
      )}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#06060a]">
          <div className="text-center max-w-xs px-6">
            <p className="text-rose-400 text-sm font-mono mb-4">{cameraError}</p>
            <button onClick={onEnd} className="text-white/60 text-xs font-mono underline">← Go back</button>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
        {/* Song info */}
        <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
          <p className="text-xs font-black text-white">{song.title}</p>
          <p className="text-[10px] text-white/40 font-mono">{song.artist} · {bpm} BPM · {capo > 0 ? `Capo ${capo}` : 'No Capo'}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(m => !m)}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onEnd}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Countdown overlay ── */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key={countdown}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.35 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Before-start overlay ── */}
      {!isPlaying && countdown === null && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-10"
          >
            <p className="text-white/60 text-sm font-mono mb-6">
              Camera is ready. Auto-strum will start with a 3-second countdown.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStartWithCountdown}
              className="px-10 py-4 rounded-2xl font-black text-black text-lg flex items-center gap-3 mx-auto shadow-2xl shadow-purple-600/40"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
            >
              <Play className="w-6 h-6 fill-current" />
              Start Playing
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* ── Bottom HUD (visible only when playing) ── */}
      {(isPlaying || activeBeat >= 0) && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6 space-y-3">

          {/* Chord & gesture hint row */}
          <div className="flex items-stretch gap-3">

            {/* Current detected gesture → chord */}
            <motion.div
              key={detectedChord}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3"
            >
              <div className="text-3xl">
                {fingerIdx >= 0 ? FINGER_EMOJI[fingerIdx] : '🎸'}
              </div>
              <div>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">You're playing</p>
                <p className="text-2xl font-black text-amber-300 leading-none">{detectedChord}</p>
                {fingerIdx >= 0 && (
                  <p className="text-[10px] font-mono text-white/40">{fingerIdx} finger{fingerIdx !== 1 ? 's' : ''}</p>
                )}
              </div>
            </motion.div>

            {/* Current + next lyric card */}
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
              {/* Current chord badge */}
              <div className="flex items-center gap-2 mt-1.5">
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
              </div>
            </div>

            {/* Manual lyric nav buttons */}
            <div className="flex flex-col gap-2 justify-center">
              <button
                onClick={() => setCurrentLine(l => Math.max(0, l - 1))}
                className="w-9 h-9 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentLine(l => Math.min(allLyrics.length - 1, l + 1))}
                className="w-9 h-9 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Beat metronome + strum pattern + pause */}
          <div className="flex items-center gap-3">
            {/* Beat LED metronome */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl border border-white/8 rounded-2xl px-4 py-2">
              {[0, 1, 2, 3].map(b => (
                <motion.div
                  key={b}
                  className="w-2.5 h-2.5 rounded-full"
                  animate={{
                    backgroundColor: activeBeat % 4 === b
                      ? (b === 0 ? '#a855f7' : '#fbbf24')
                      : 'rgba(255,255,255,0.15)',
                    scale: activeBeat % 4 === b ? 1.3 : 1,
                    boxShadow: activeBeat % 4 === b
                      ? b === 0 ? '0 0 8px #a855f7' : '0 0 8px #fbbf24'
                      : 'none',
                  }}
                  transition={{ duration: 0.08 }}
                />
              ))}
              <span className="text-[10px] font-mono text-white/30 ml-2">{bpm} BPM</span>
            </div>

            {/* Strum pattern display */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl border border-white/8 rounded-2xl px-3 py-2 flex-1">
              {patternSymbols.map((sym, i) => (
                <span
                  key={i}
                  className={`flex-1 text-center text-base font-black font-mono rounded-lg py-1 transition-all duration-75 ${
                    activeBeat === i
                      ? 'text-black bg-amber-400 shadow-lg shadow-amber-400/50 scale-110'
                      : 'text-white/40'
                  }`}
                >
                  {STRUM_SYMBOL_MAP[sym] ?? sym}
                </span>
              ))}
            </div>

            {/* Pause/Resume */}
            <button
              onClick={handlePause}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background: isPlaying ? 'rgba(168,85,247,0.25)' : 'rgba(168,85,247,0.6)',
                border: '1px solid rgba(168,85,247,0.4)',
              }}
            >
              {isPlaying
                ? <Pause className="w-5 h-5 text-purple-200" />
                : <Play className="w-5 h-5 text-white fill-current" />}
            </button>

            {/* Line counter */}
            <div className="text-[9px] font-mono text-white/25 text-right leading-tight">
              <div>{currentLine + 1}</div>
              <div>/{allLyrics.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
