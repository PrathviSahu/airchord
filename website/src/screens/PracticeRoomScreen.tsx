import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, CheckCircle2, RotateCcw, Volume2, Sparkles, Award, Music, ShieldCheck } from 'lucide-react'
import { SessionConfig } from './SongSetupScreen'
import { initAudioEngine, triggerGuitarChord, setCapoFret } from '../utils/guitarSound'
import { useHandTracking } from '../utils/useHandTracking'
import { GestureEngine } from '../utils/GestureEngine'
import { drawHandSkeleton } from '../utils/handTracker'

interface PracticeRoomScreenProps {
  config: SessionConfig
  onBack: () => void
  onStartLive: () => void
}

export default function PracticeRoomScreen({ config, onBack, onStartLive }: PracticeRoomScreenProps) {
  const { song, capo, fingerMapping } = config

  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [detectedFingers, setDetectedFingers] = useState<number>(0)
  const [detectedChord, setDetectedChord]     = useState<string>('Em')

  // Practice state
  const practiceChords = song.chords.length > 0 ? song.chords : ['G', 'Em', 'C', 'D']
  const [targetIndex, setTargetIndex]       = useState(0)
  const [matchedCount, setMatchedCount]     = useState(0)
  const [practiceDone, setPracticeDone]     = useState(false)
  const [feedbackEffect, setFeedbackEffect] = useState<string | null>(null)

  const currentTargetChord = practiceChords[targetIndex] || practiceChords[0]
  const targetFingerIdx    = fingerMapping.indexOf(currentTargetChord)
  const requiredFingers    = targetFingerIdx >= 0 ? targetFingerIdx : 0
  const gestureEmojis       = ['✊','☝️','✌️','🤟','🖐️','✋']

  const gestureRef = useRef(new GestureEngine())
  const { initialize, processFrame, setOnResults } = useHandTracking()

  // ── Camera setup ──────────────────────────────────────────────────────────
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
        setCameraError('Camera blocked. Please allow camera access.')
      }
    }
    startCam()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // MediaPipe initialization
  useEffect(() => { initialize() }, [initialize])
  useEffect(() => { setCapoFret(capo) }, [capo])

  // Hand tracking frame processing
  useEffect(() => {
    setOnResults((result) => {
      if (!canvasRef.current || !videoRef.current) return
      const canvas = canvasRef.current
      const ctx    = canvas.getContext('2d')
      canvas.width  = videoRef.current.videoWidth || 1280
      canvas.height = videoRef.current.videoHeight || 720
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (result?.landmarks && result.landmarks.length > 0) {
        drawHandSkeleton(ctx, result.landmarks, canvas.width, canvas.height)
        const gesture = gestureRef.current.processLandmarks(result.landmarks)
        if (gesture) {
          const fingers = Math.min(5, Math.max(0, gesture.fingerCount))
          const chord   = fingerMapping[fingers] || fingerMapping[0]
          setDetectedFingers(fingers)
          setDetectedChord(chord)
        }
      }
    })
  }, [setOnResults, fingerMapping])

  useEffect(() => {
    let animId: number
    function loop() {
      if (cameraReady && videoRef.current) {
        processFrame(videoRef.current)
      }
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animId)
  }, [cameraReady, processFrame])

  // ── Match logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (practiceDone) return
    if (detectedFingers === requiredFingers) {
      initAudioEngine()
      triggerGuitarChord(currentTargetChord, 0.40)
      setFeedbackEffect(`MATCHED ${currentTargetChord}!`)

      const timer = setTimeout(() => {
        setFeedbackEffect(null)
        if (targetIndex + 1 >= practiceChords.length) {
          setPracticeDone(true)
        } else {
          setTargetIndex(prev => prev + 1)
          setMatchedCount(prev => prev + 1)
        }
      }, 900)

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedFingers, targetIndex, practiceDone])

  const handleResetPractice = () => {
    setTargetIndex(0)
    setMatchedCount(0)
    setPracticeDone(false)
  }

  return (
    <div className="fixed inset-0 bg-[#050508] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* ── Top Header ── */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4 bg-black/60 border-b border-white/8 backdrop-blur-md z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Setup
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            🎯 Interactive Practice Room
          </span>
          <h2 className="text-sm font-black text-white mt-1">{song.title} ({song.artist})</h2>
        </div>

        <button
          onClick={onStartLive}
          className="flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs text-black shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Start Live Stage 🚀
        </button>
      </div>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Camera Feed */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
          />

          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-mono text-white/60">Booting Camera & Hand Tracking...</p>
            </div>
          )}

          {/* Feedback Splash overlay */}
          <AnimatePresence>
            {feedbackEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute z-30 px-8 py-4 rounded-2xl bg-emerald-500/90 text-black font-black text-2xl shadow-2xl backdrop-blur-md flex items-center gap-3"
              >
                <Sparkles className="w-8 h-8 fill-current" />
                {feedbackEffect}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera bottom status pill */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
            <span className="text-xl">{gestureEmojis[detectedFingers] || '✊'}</span>
            <div>
              <p className="text-[10px] font-mono text-white/40">Hand Status</p>
              <p className="text-xs font-black text-amber-300">{detectedFingers} Fingers → {detectedChord}</p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Chord Trainer Panel */}
        <div className="w-[380px] shrink-0 bg-[#080812] border-l border-white/8 p-6 flex flex-col justify-between overflow-y-auto z-20">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Step-by-Step Trainer</span>
              <button
                onClick={handleResetPractice}
                className="text-[10px] font-mono text-white/40 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Target Chord Card */}
            {!practiceDone ? (
              <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-900/30 to-black/60 border border-purple-500/30 text-center space-y-4 shadow-xl">
                <p className="text-xs font-mono text-purple-300 uppercase tracking-widest">Target Chord #{targetIndex + 1}</p>
                <div className="text-6xl font-black text-white tracking-tight drop-shadow-md">{currentTargetChord}</div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/8 space-y-2">
                  <p className="text-xs font-bold text-white">Required Hand Gesture</p>
                  <div className="text-4xl">{gestureEmojis[requiredFingers]}</div>
                  <p className="text-xs font-mono text-amber-300 font-bold">
                    Show {requiredFingers} Finger{requiredFingers !== 1 ? 's' : ''} on Camera
                  </p>
                </div>

                <div className="pt-2">
                  {detectedFingers === requiredFingers ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 animate-pulse">
                      <CheckCircle2 className="w-4 h-4" /> PERFECT MATCH!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 text-white/40 text-xs font-mono border border-white/10">
                      Show gesture on camera...
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-900/30 to-black/60 border border-emerald-500/40 text-center space-y-4 shadow-xl">
                <Award className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-white">Practice Complete! 🎉</h3>
                <p className="text-xs text-white/60 font-mono leading-relaxed">
                  You successfully matched all {practiceChords.length} chords for {song.title}! You are ready to rock the live performance.
                </p>
                <button
                  onClick={onStartLive}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Jump to Live Stage Now
                </button>
              </div>
            )}

            {/* Song Chords List */}
            <div className="mt-6 space-y-2">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Song Chord Progression</p>
              <div className="grid grid-cols-2 gap-2">
                {practiceChords.map((chord, idx) => {
                  const fIdx = fingerMapping.indexOf(chord)
                  const isCurrent = idx === targetIndex && !practiceDone
                  const isDone    = idx < targetIndex || practiceDone
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-purple-600/30 border-purple-500/60 shadow-md shadow-purple-500/20'
                          : isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/3 border-white/8 opacity-50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black font-mono">{chord}</p>
                        <p className="text-[10px] font-mono text-white/40">{gestureEmojis[fIdx >= 0 ? fIdx : 0]} {fIdx} finger</p>
                      </div>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-4 border-t border-white/8">
            <button
              onClick={onStartLive}
              className="w-full py-3.5 rounded-xl font-black text-xs text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              Skip Practice & Start Live 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
