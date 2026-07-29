import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, X, ChevronLeft, ChevronRight, Volume2, VolumeX, Youtube } from 'lucide-react'
import { SessionConfig } from './SongSetupScreen'
import {
  initAudioEngine,
  triggerGuitarChord,
  setCapoFret,
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
  const [showYT, setShowYT]                 = useState(false)
  const [ytMinimized, setYtMinimized]       = useState(false)
  const ytWindowRef                         = useRef<Window | null>(null)

  // Recording Module State
  const [isRecording, setIsRecording]       = useState(false)
  const [recordingTime, setRecordingTime]   = useState(0)
  const [recordedUrl, setRecordedUrl]       = useState<string | null>(null)
  const mediaRecorderRef                     = useRef<MediaRecorder | null>(null)
  const recordedChunksRef                    = useRef<Blob[]>([])
  const recTimerRef                          = useRef<any>(null)

  // Refs
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const gestureRef    = useRef(new GestureEngine(getProfileById('classic')))
  const detectedChordRef = useRef(detectedChord)
  detectedChordRef.current = detectedChord

  const { initialize, processFrame, setOnResults } = useHandTracking()

  // ── Boot camera + auto-start on ready ─────────────────────────────
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

  // ── Auto-start countdown as soon as camera is ready ──────────────
  useEffect(() => {
    if (!cameraReady) return
    // Small delay so camera feed renders before countdown
    const t = setTimeout(() => {
      handleStartWithCountdown()
    }, 600)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraReady])

  // ── MediaPipe hand tracking ──────────────────────────────────────────
  useEffect(() => { initialize() }, [initialize])

  useEffect(() => {
    setOnResults((result: import('../utils/useHandTracking').HandResult | null) => {
      if (!canvasRef.current || !videoRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width  = videoRef.current.videoWidth  || 1280
      canvas.height = videoRef.current.videoHeight || 720

      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (result && result.landmarks && result.landmarks.length > 0) {
        // Draw neon hand skeleton — 4 params (no 5th arg)
        drawHandSkeleton(ctx, result.landmarks, canvas.width, canvas.height)

        // Gesture engine — use processLandmarks, not process
        const gesture = gestureRef.current.processLandmarks(result.landmarks)
        if (gesture) {
          const fingers = Math.min(5, Math.max(0, gesture.fingerCount))
          const chord   = fingerMapping[fingers] || fingerMapping[0]
          setDetectedFingers(fingers)
          setDetectedChord(chord)
        }
      }
      // If null → no hand visible, canvas already cleared above
    })
  }, [setOnResults, fingerMapping])

  // Frame loop — only process when camera is actually ready
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
        triggerGuitarChord(detectedChordRef.current, 0.35)
      }
    }, beatMs)

    return () => clearInterval(iv)
  }, [isPlaying, isMuted, bpm, strumPattern])

  // ── Lyric auto-advance + stop at end ────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return
    const secPerLine = (60 / bpm) * 4 // ~4 beats per lyric line
    const iv = setInterval(() => {
      setCurrentLine(prev => {
        if (prev >= allLyrics.length - 1) {
          // Last line reached — stop the performance
          clearInterval(iv)
          setIsPlaying(false)
          setActiveBeat(-1)
          return prev
        }
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

  // ── Recording Module Handlers ─────────────────────────────────────────
  const [recordedBlob, setRecordedBlob]     = useState<Blob | null>(null)

  const handleStartRecording = useCallback(() => {
    try {
      recordedChunksRef.current = []
      let recStream: MediaStream | null = null

      if (streamRef.current) {
        recStream = new MediaStream()
        // Add webcam video track
        streamRef.current.getVideoTracks().forEach(track => recStream?.addTrack(track))
        // Add webcam audio track if available
        streamRef.current.getAudioTracks().forEach(track => recStream?.addTrack(track))
      } else if (canvasRef.current && typeof (canvasRef.current as any).captureStream === 'function') {
        recStream = (canvasRef.current as any).captureStream(30)
      }

      if (!recStream || recStream.getTracks().length === 0) return

      // Find supported mimeType
      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
        '',
      ]
      let selectedMime = ''
      for (const m of mimeTypes) {
        if (!m || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m))) {
          selectedMime = m
          break
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined
      const recorder = new MediaRecorder(recStream, options)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const mime = selectedMime || 'video/webm'
        const blob = new Blob(recordedChunksRef.current, { type: mime })
        const url  = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setRecordedUrl(url)
        setIsRecording(false)
      }

      mediaRecorderRef.current = recorder
      recorder.start(200) // collect chunks every 200ms
      setIsRecording(true)
      setRecordingTime(0)

      recTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch {
      setIsRecording(false)
    }
  }, [])

  const handleStopRecording = useCallback(() => {
    if (recTimerRef.current) clearInterval(recTimerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleDownloadVideo = useCallback(() => {
    if (!recordedUrl && !recordedBlob) return
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = recordedUrl!
    const ext = recordedBlob?.type.includes('mp4') ? 'mp4' : 'webm'
    const safeTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
    a.download = `airchord_${safeTitle}_performance.${ext}`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
    }, 100)
  }, [recordedUrl, recordedBlob, song.title])

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
          {/* Recording module button */}
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 backdrop-blur-xl transition-all text-xs font-bold shadow-lg shadow-red-600/20"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Record Performance 🔴
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 border border-red-400 text-white font-bold backdrop-blur-xl transition-all text-xs shadow-lg shadow-red-600/40 animate-pulse"
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-white" />
              Stop Rec ({Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')})
            </button>
          )}

          {/* YouTube background player toggle */}
          <button
            onClick={() => {
              const query = encodeURIComponent(`${song.title} ${song.artist} official`)
              const url = `https://www.youtube.com/results?search_query=${query}`
              if (ytWindowRef.current && !ytWindowRef.current.closed) {
                ytWindowRef.current.close()
                setShowYT(false)
                return
              }
              const popup = window.open(
                url,
                'airchord_bg_song',
                'width=480,height=320,top=80,right=20,toolbar=no,menubar=no,scrollbars=yes,resizable=yes'
              )
              ytWindowRef.current = popup
              setShowYT(true)
            }}
            title="Play original song in background (for testing)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-xs font-bold ${
              showYT
                ? 'bg-red-600/40 border-red-400/50 text-red-200'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-black/60'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            {showYT ? 'Close BG Song' : 'Play BG Song 🎧'}
          </button>

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

      {/* ── Floating 'Now Playing' card (shows when YouTube popup is open) ── */}
      <AnimatePresence>
        {showYT && (
          <motion.div
            key="yt-card"
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-20 right-6 z-30 rounded-2xl border border-white/15 shadow-2xl shadow-black/60 w-72"
            style={{ background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(20px)' }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">BG Song Playing</span>
              </div>
              <button
                onClick={() => {
                  ytWindowRef.current?.close()
                  setShowYT(false)
                }}
                className="text-white/30 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Song info */}
            <div className="px-4 py-3 space-y-2">
              <div>
                <p className="text-sm font-black text-white">{song.title}</p>
                <p className="text-xs text-white/50 font-mono">{song.artist}</p>
              </div>

              {/* Re-open / focus button */}
              <button
                onClick={() => {
                  if (ytWindowRef.current && !ytWindowRef.current.closed) {
                    ytWindowRef.current.focus()
                  } else {
                    const query = encodeURIComponent(`${song.title} ${song.artist} official`)
                    const url = `https://www.youtube.com/results?search_query=${query}`
                    const popup = window.open(
                      url,
                      'airchord_bg_song',
                      'width=480,height=320,top=80,right=20,toolbar=no,menubar=no,scrollbars=yes,resizable=yes'
                    )
                    ytWindowRef.current = popup
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)' }}
              >
                <Youtube className="w-4 h-4" />
                Open / Refocus YouTube Window
              </button>

              {/* Direct search link fallback */}
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist + ' official')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-mono text-white/40 hover:text-white/60 border border-white/8 hover:border-white/15 transition-all"
              >
                Open in new tab instead ↗
              </a>
            </div>

            {/* Tip */}
            <div className="px-4 py-2.5 bg-amber-500/8 border-t border-amber-500/15 rounded-b-2xl">
              <p className="text-[9px] font-mono text-amber-300/60 leading-relaxed">
                🎧 Search the song in the YouTube window, hit play, then come back here and practice your chord gestures
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Countdown overlay ── */}
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
              🎸 {song.chords.join('  ·  ')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
      {/* ── Recorded Performance Preview & Download Modal ── */}
      <AnimatePresence>
        {recordedUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg rounded-3xl bg-[#0c0c18] border border-white/10 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    🎬 Performance Recorded!
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">{song.title} Performance</h3>
                </div>
                <button
                  onClick={() => setRecordedUrl(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg">
                <video
                  src={recordedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadVideo}
                  className="flex-1 py-3.5 rounded-xl font-black text-xs text-black shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
                >
                  Download Performance Video 💾
                </button>
                <button
                  onClick={() => setRecordedUrl(null)}
                  className="py-3.5 px-5 rounded-xl text-xs font-mono text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
