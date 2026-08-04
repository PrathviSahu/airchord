import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, Download, RotateCcw, Volume2, VolumeX, Mic } from 'lucide-react'
import { SessionConfig } from './SongSetupScreen'
import {
  initAudioEngine,
  triggerGuitarChord,
  playDownStrum,
  playUpStrum,
  playMuteStrum,
  CHORD_NOTES,
  setCapoFret,
  setAudioMuted,
  createPerformanceRecordingStream,
  disconnectMicrophoneFromRecording,
} from '../utils/guitarSound'
import { GuitaristEngine, PlayStyle } from '../utils/guitaristEngine'
import { useHandTracking } from '../utils/useHandTracking'
import { GestureEngine } from '../utils/GestureEngine'
import { getProfileById } from '../utils/GestureProfiles'
import { drawHandSkeleton } from '../utils/handTracker'

const FINGER_EMOJI = ['✊', '☝️', '✌️', '🤟', '🖐️', '✋']

const STRUM_PRESETS: { name: string; pattern: string[]; display: string; style: PlayStyle }[] = [
  { name: '8-Stroke Ballad', pattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'], display: '↓ • ↓ ↑ • ↑ ↓ ↑', style: 'ballad' },
  { name: 'Pop Strum',       pattern: ['D', 'D', 'U', 'U', 'D', 'U'],            display: '↓ ↓ ↑ ↑ ↓ ↑',     style: 'pop' },
  { name: 'Campfire Folk',   pattern: ['D', '.', 'D', 'U', 'D', 'U'],            display: '↓ • ↓ ↑ ↓ ↑',     style: 'campfire' },
  { name: 'Driving Rock',    pattern: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],   display: '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓', style: 'pop' },
]

interface PracticeRoomScreenProps {
  config?: SessionConfig
  onBack: () => void
  onStartLive?: () => void
}

const AVAILABLE_CHORDS = [
  'Em', 'Am', 'C', 'D', 'G', 'F',
  'Bm', 'B7', 'F#m', 'Cadd9', 'Dsus2', 'Dsus4',
  'Am7', 'E', 'A', 'B', 'G7', 'E7', 'A7', 'D7', 'Dm'
]

export default function PracticeRoomScreen({ config, onBack, onStartLive }: PracticeRoomScreenProps) {
  // Config defaults for Pro Jam Room & Editable Finger Mapping
  const defaultFingerMapping = ['Em', 'Am', 'C', 'D', 'G', 'F']
  const [fingerMapping, setFingerMapping] = useState<string[]>(config?.fingerMapping ?? defaultFingerMapping)
  const [editingFingerIdx, setEditingFingerIdx] = useState<number | null>(null)
  const [customInput, setCustomInput] = useState('')

  // Capo & BPM Controls
  const [capo, setCapo] = useState<number>(config?.capo ?? 0)
  const [bpm, setBpm]   = useState<number>(config?.bpm ?? 90)
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0)
  const [customPattern, setCustomPattern]       = useState<string[] | null>(null)
  const [showPatternModal, setShowPatternModal] = useState(false)

  const activePreset = STRUM_PRESETS[selectedPresetIdx]
  const strumPattern = customPattern ?? activePreset.pattern

  const NEXT_STROKE: Record<string, string> = {
    'D': 'U', 'U': 'X', 'X': '.', '.': 'D',
    '↓': '↑', '↑': '✕', '✕': '•', '•': '↓',
  }

  const toggleBeat = (idx: number) => {
    initAudioEngine()
    const newPattern = [...strumPattern]
    const cur = newPattern[idx] || 'D'
    const next = NEXT_STROKE[cur] || 'D'
    newPattern[idx] = next
    setCustomPattern(newPattern)

    // Audio preview
    const voicing = CHORD_NOTES[detectedChord] ?? CHORD_NOTES['Em']!
    if (next === 'D' || next === '↓') playDownStrum(voicing, 0.35)
    else if (next === 'U' || next === '↑') playUpStrum(voicing, 0.30)
    else if (next === 'X' || next === '✕') playMuteStrum(voicing, 0.15)
  }

  // Audio & Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted]     = useState(false)
  const [activeBeat, setActiveBeat] = useState(-1)

  // Camera & Tracking State
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [micReady, setMicReady] = useState(false)

  // Gesture & Detection State
  const [detectedFingers, setDetectedFingers] = useState<number>(0)
  const [detectedChord, setDetectedChord]     = useState<string>(fingerMapping[0] || 'Em')
  const detectedChordRef                      = useRef(detectedChord)
  detectedChordRef.current                    = detectedChord

  const gestureRef  = useRef(new GestureEngine(getProfileById('classic')))
  const guitaristRef = useRef(new GuitaristEngine(activePreset.style))
  const { initialize, processFrame, setOnResults } = useHandTracking()

  // ── Recording State ──────────────────────────────────────────────────
  const [isRecording, setIsRecording]       = useState(false)
  const [recordingTime, setRecordingTime]   = useState(0)
  const [recordedUrl, setRecordedUrl]       = useState<string | null>(null)
  const mediaRecorderRef                     = useRef<MediaRecorder | null>(null)
  const recordedChunksRef                    = useRef<Blob[]>([])
  const recTimerRef                          = useRef<any>(null)

  // ── Apply Capo ───────────────────────────────────────────────────────
  useEffect(() => {
    setCapoFret(capo)
  }, [capo])

  // Mute the actual audio bus as well as stopping future beat triggers. This
  // prevents a strum tail from continuing after the HUD mute button is pressed.
  useEffect(() => {
    setAudioMuted(isMuted)
    return () => setAudioMuted(false)
  }, [isMuted])

  // Update Guitarist style when preset changes
  useEffect(() => {
    guitaristRef.current.setStyle(activePreset.style)
  }, [activePreset])

  // ── Boot Camera ──────────────────────────────────────────────────────
  useEffect(() => {
    async function startCam() {
      const video = { facingMode: 'user' as const, width: { ideal: 1280 }, height: { ideal: 720 } }
      try {
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video,
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          })
        } catch {
          // Camera practice should still work if the user declines the mic.
          stream = await navigator.mediaDevices.getUserMedia({ video })
        }
        streamRef.current = stream
        setMicReady(stream.getAudioTracks().length > 0)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
            setCameraReady(true)
          }
        }
      } catch {
        setCameraError('Camera permission blocked. Please allow camera access.')
      }
    }
    startCam()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      disconnectMicrophoneFromRecording()
    }
  }, [])

  // ── Hand Tracking MediaPipe ──────────────────────────────────────────
  useEffect(() => { initialize() }, [initialize])

  useEffect(() => {
    setOnResults((result) => {
      if (!canvasRef.current || !videoRef.current) return
      const canvas = canvasRef.current
      const ctx    = canvas.getContext('2d')
      canvas.width  = videoRef.current.videoWidth  || 1280
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

  // ── Auto-strum Engine ────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || isMuted) {
      setActiveBeat(-1)
      return
    }
    const beatMs   = Math.round(60000 / (bpm || 90))
    const patterns = strumPattern.length > 0 ? strumPattern : ['D']
    let beatIndex  = -1

    const playNextBeat = () => {
      beatIndex = (beatIndex + 1) % patterns.length
      setActiveBeat(beatIndex)
      const stroke    = patterns[beatIndex]
      const chordName = detectedChordRef.current || 'Em'
      guitaristRef.current.playBeat(
        stroke,
        chordName,
        beatIndex,
        'Chorus', // Full dynamics for free jam
        0.38
      )
    }

    // Put the downbeat on the musical start instead of waiting a full beat.
    playNextBeat()
    const iv = setInterval(playNextBeat, beatMs)

    return () => clearInterval(iv)
  }, [isPlaying, isMuted, bpm, strumPattern])

  // ── Recording Module Handlers ────────────────────────────────────────
  const handleStartRecording = useCallback(() => {
    try {
      recordedChunksRef.current = []
      let recStream: MediaStream | null = createPerformanceRecordingStream(streamRef.current)

      if (!recStream && canvasRef.current && typeof (canvasRef.current as any).captureStream === 'function') {
        recStream = createPerformanceRecordingStream((canvasRef.current as any).captureStream(30))
      }

      if (!recStream || recStream.getTracks().length === 0) return

      const mimeTypes = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4', '']
      let selectedMime = ''
      for (const m of mimeTypes) {
        if (!m || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m))) {
          selectedMime = m
          break
        }
      }

      const options  = selectedMime ? { mimeType: selectedMime } : undefined
      const recorder = new MediaRecorder(recStream, options)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/webm' })
        const url  = URL.createObjectURL(blob)
        setRecordedUrl(url)
      }

      recorder.start(1000)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)

      recTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch {
      alert('Recording failed to initialize. Please check permissions.')
    }
  }, [])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    disconnectMicrophoneFromRecording()
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current)
      recTimerRef.current = null
    }
    setIsRecording(false)
  }, [])

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="relative w-full h-screen bg-[#050508] overflow-hidden select-none font-sans text-white">

      {/* ── Background Video / Canvas Feed ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-75"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none z-10"
      />

      {/* Subtle vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none z-10" />

      {/* ── Top Header Controls Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 flex items-center justify-between gap-4 flex-wrap">

        {/* Back Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                PRO PRACTICE ROOM
              </span>
              <span className={`text-xs font-mono flex items-center gap-1 ${micReady ? 'text-emerald-400' : 'text-white/35'}`}>
                <Mic className="w-3 h-3" /> {micReady ? 'Live Mic On' : 'Mic Optional'}
              </span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white mt-0.5">Freestyle Jam & Record</h1>
          </div>
        </div>

        {/* Pro Controls: Capo + BPM + Strum Pattern */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

          {/* Capo Selector */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-1.5">
            <span className="text-[10px] font-mono text-white/40 uppercase mr-1">Capo</span>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(fret => (
              <button
                key={fret}
                onClick={() => {
                  initAudioEngine()
                  setCapo(fret)
                }}
                className={`w-6 h-6 rounded-lg font-mono text-xs font-bold transition-all ${
                  capo === fret
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 scale-105'
                    : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                {fret}
              </button>
            ))}
          </div>

          {/* BPM Controls */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-1.5">
            <span className="text-[10px] font-mono text-white/40 uppercase">BPM</span>
            <button
              onClick={() => setBpm(b => Math.max(40, b - 5))}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 font-mono text-xs"
            >
              -
            </button>
            <span className="font-mono text-sm font-black text-amber-300 min-w-[32px] text-center">
              {bpm}
            </span>
            <button
              onClick={() => setBpm(b => Math.min(200, b + 5))}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 font-mono text-xs"
            >
              +
            </button>
          </div>

          {/* Strum Pattern Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPresetIdx}
              onChange={e => {
                setSelectedPresetIdx(Number(e.target.value))
                setCustomPattern(null)
              }}
              className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 text-xs font-mono text-white/80 outline-none cursor-pointer hover:border-white/20 transition-all"
            >
              {STRUM_PRESETS.map((p, idx) => (
                <option key={idx} value={idx} className="bg-neutral-900 text-white">
                  {p.name} ({p.display})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowPatternModal(true)}
              className="px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 hover:border-amber-400/40 text-amber-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-black/80"
            >
              <span>✏️ Edit Pattern</span>
            </button>
          </div>

          {/* Recording Button */}
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              Record Performance
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-600 text-white font-mono text-xs font-bold border border-white/30 animate-pulse shadow-lg shadow-red-600/40 transition-all"
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-white" />
              Recording {formatRecTime(recordingTime)} (Stop)
            </button>
          )}

          {/* Play / Pause Metronome Strum Toggle */}
          <button
            onClick={() => {
              initAudioEngine()
              setIsPlaying(p => !p)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xs font-bold transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-400 text-black shadow-amber-400/20 hover:bg-amber-300'
                : 'bg-purple-600 text-white shadow-purple-600/30 hover:bg-purple-500'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pause Metronome' : 'Start Strumming'}
          </button>
        </div>
      </div>

      {/* ── Main Pro HUD Display ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pointer-events-none pt-24 pb-28">

        {/* Top Floating Key / Chord Status */}
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-3">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Tuning</p>
            <p className="text-sm font-bold text-amber-300 font-mono mt-0.5">
              Standard E {capo > 0 ? `(Capo ${capo})` : '(No Capo)'}
            </p>
          </div>

          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-3 text-right">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Selected Groove</p>
            <p className="text-sm font-mono font-bold text-white mt-0.5">{activePreset.name}</p>
            <p className="text-xs font-mono text-amber-400 tracking-wider mt-0.5">{activePreset.display}</p>
          </div>
        </div>

        {/* Center Detected Chord Badge */}
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            key={detectedChord}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="text-7xl mb-2">
              {FINGER_EMOJI[detectedFingers] || '🎸'}
            </div>
            <div
              className="font-black text-amber-300 tracking-tight leading-none drop-shadow-[0_0_40px_rgba(251,191,36,0.5)]"
              style={{ fontSize: 110 }}
            >
              {detectedChord}
            </div>
            <p className="text-xs font-mono text-white/50 uppercase tracking-widest mt-2">
              Detected ({detectedFingers} finger{detectedFingers !== 1 ? 's' : ''})
            </p>
          </motion.div>
        </div>

        {/* Bottom Finger Reference Bar — Click any finger card to edit its mapped chord! */}
        <div className="flex items-center justify-center gap-2 flex-wrap pointer-events-auto">
          {fingerMapping.map((chord, idx) => (
            <button
              key={idx}
              onClick={() => {
                initAudioEngine()
                setEditingFingerIdx(idx)
                setCustomInput(chord)
              }}
              title="Click to edit chord for this finger count"
              className={`px-3.5 py-2 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                detectedFingers === idx
                  ? 'bg-amber-400 text-black border-amber-400 font-black scale-110 shadow-lg shadow-amber-400/30'
                  : 'bg-black/70 text-white/80 border-white/15 hover:border-amber-400/40 hover:bg-black/90'
              }`}
            >
              <span>{FINGER_EMOJI[idx]}</span>
              <span className="font-bold text-amber-300">{chord}</span>
              <span className="text-[10px] opacity-60">({idx}f)</span>
              <span className="text-[10px] text-amber-400/80 ml-1">✏️</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom Strumming Beat Visualizer ── */}
      {isPlaying && (
        <div className="absolute bottom-4 left-6 right-6 z-20 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-mono text-white/60">Metronome: {bpm} BPM</span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-center max-w-xl pointer-events-auto">
            {strumPattern.map((stroke, i) => (
              <motion.button
                key={i}
                onClick={() => toggleBeat(i)}
                title="Click to toggle beat stroke (↓ / ↑ / ✕ / •)"
                animate={{
                  scale: activeBeat === i ? 1.25 : 1,
                  backgroundColor: activeBeat === i ? '#fbbf24' : 'rgba(255,255,255,0.08)',
                  borderColor: activeBeat === i ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                }}
                className={`flex-1 h-9 rounded-xl border flex items-center justify-center font-mono font-black text-sm transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                  activeBeat === i ? 'text-black shadow-lg shadow-amber-400/30' : 'text-white/70 hover:text-white hover:border-amber-400/50'
                }`}
              >
                {stroke === 'D' || stroke === '↓' ? '↓' : stroke === 'U' || stroke === '↑' ? '↑' : stroke === 'X' || stroke === '✕' ? '✕' : '•'}
              </motion.button>
            ))}
          </div>

          <div className="text-xs font-mono text-white/40">
            Beat {activeBeat >= 0 ? activeBeat + 1 : '-'}/{strumPattern.length}
          </div>
        </div>
      )}

      {/* ── Recording Preview Modal ── */}
      <AnimatePresence>
        {recordedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Performance Recorded! 🎬</h2>
                  <p className="text-xs font-mono text-white/50">Preview your jam recording below</p>
                </div>
                <button
                  onClick={() => setRecordedUrl(null)}
                  className="text-white/40 hover:text-white text-sm font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
                <video src={recordedUrl} controls autoPlay className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setRecordedUrl(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-mono text-xs flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Re-record
                </button>

                <a
                  href={recordedUrl}
                  download="airchord-jam-session.webm"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Video
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chord Map Editor Modal ── */}
      <AnimatePresence>
        {editingFingerIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 12 }}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{FINGER_EMOJI[editingFingerIdx]}</span> Edit Chord for {editingFingerIdx} Finger{editingFingerIdx !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-xs font-mono text-white/50">Pick a chord from the preset list or type any custom chord</p>
                </div>
                <button
                  onClick={() => setEditingFingerIdx(null)}
                  className="text-white/40 hover:text-white text-sm font-mono px-2 py-1"
                >
                  ✕ Close
                </button>
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="e.g. Dsus2, F#m, Cadd9..."
                  className="flex-1 bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => {
                    if (customInput.trim()) {
                      const newMap = [...fingerMapping]
                      newMap[editingFingerIdx] = customInput.trim()
                      setFingerMapping(newMap)
                      triggerGuitarChord(customInput.trim(), 0.35)
                      setEditingFingerIdx(null)
                    }
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all"
                >
                  Apply Chord
                </button>
              </div>

              {/* Available Chords Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_CHORDS.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      const newMap = [...fingerMapping]
                      newMap[editingFingerIdx] = c
                      setFingerMapping(newMap)
                      triggerGuitarChord(c, 0.35)
                      setEditingFingerIdx(null)
                    }}
                    className={`py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition-all ${
                      fingerMapping[editingFingerIdx] === c
                        ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/30 font-black scale-105'
                        : 'bg-black/50 text-white/80 border-white/10 hover:border-amber-400/50 hover:bg-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pattern Editor Modal ── */}
      <AnimatePresence>
        {showPatternModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 12 }}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>🥁</span> Edit Strumming Pattern
                  </h2>
                  <p className="text-xs font-mono text-white/50">Click any beat block to cycle stroke (Down ↓ / Up ↑ / Mute ✕ / Rest •)</p>
                </div>
                <button
                  onClick={() => setShowPatternModal(false)}
                  className="text-white/40 hover:text-white text-sm font-mono px-2 py-1"
                >
                  ✕ Close
                </button>
              </div>

              {/* Beat Blocks Editor Grid */}
              <div className="flex items-center justify-center gap-2 flex-wrap bg-black/50 p-4 rounded-2xl border border-white/10">
                {strumPattern.map((stroke, i) => (
                  <button
                    key={i}
                    onClick={() => toggleBeat(i)}
                    className="w-12 h-14 rounded-xl bg-amber-400/10 border border-amber-400/30 hover:border-amber-400 hover:bg-amber-400/20 text-amber-300 font-mono font-black text-lg flex flex-col items-center justify-center transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{stroke === 'D' || stroke === '↓' ? '↓' : stroke === 'U' || stroke === '↑' ? '↑' : stroke === 'X' || stroke === '✕' ? '✕' : '•'}</span>
                    <span className="text-[9px] text-white/40 font-normal">B{i + 1}</span>
                  </button>
                ))}
              </div>

              {/* Pattern Controls: Add / Remove / Reset */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (strumPattern.length > 2) {
                        setCustomPattern(strumPattern.slice(0, -1))
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-mono text-xs border border-white/10"
                  >
                    − Beat
                  </button>
                  <button
                    onClick={() => {
                      if (strumPattern.length < 16) {
                        setCustomPattern([...strumPattern, 'D'])
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-mono text-xs border border-white/10"
                  >
                    + Beat
                  </button>
                </div>

                <button
                  onClick={() => setCustomPattern(null)}
                  className="px-4 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-mono text-xs font-bold border border-purple-500/30"
                >
                  Reset Preset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
