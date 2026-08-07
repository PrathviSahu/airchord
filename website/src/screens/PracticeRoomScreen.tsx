// ── Freestyle Practice Room ───────────────────────────────────────────────────
// Studio monochrome redesign. All camera/tracking/recording logic unchanged —
// only the HUD language changed: black glass, hairlines, gold on live values.

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, Download, RotateCcw, Mic, Plus, Minus, X } from 'lucide-react'
import type { SessionConfig } from './SongSetupScreen'
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

const GESTURE_LABELS = ['Fist', 'One', 'Two', 'Three', 'Four', 'Open']

const STRUM_PRESETS: { name: string; pattern: string[]; display: string; style: PlayStyle }[] = [
  { name: '8-Stroke Ballad', pattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'], display: '↓ • ↓ ↑ • ↑ ↓ ↑', style: 'ballad' },
  { name: 'Pop Strum',       pattern: ['D', 'D', 'U', 'U', 'D', 'U'],            display: '↓ ↓ ↑ ↑ ↓ ↑',     style: 'pop' },
  { name: 'Campfire Folk',   pattern: ['D', '.', 'D', 'U', 'D', 'U'],            display: '↓ • ↓ ↑ ↓ ↑',     style: 'campfire' },
  { name: 'Driving Rock',   pattern: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],   display: '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓', style: 'pop' },
]

interface PracticeRoomScreenProps {
  config?: SessionConfig
  onBack: () => void
}

const AVAILABLE_CHORDS = [
  'Em', 'Am', 'C', 'D', 'G', 'F',
  'Bm', 'B7', 'F#m', 'C#m', 'Cadd9', 'Dsus2', 'Dsus4',
  'Am7', 'E', 'A', 'B', 'G7', 'E7', 'A7', 'D7', 'Dm'
]

const STROKE_GLYPH = (s: string) => s === 'D' || s === '↓' ? '↓' : s === 'U' || s === '↑' ? '↑' : s === 'X' || s === '✕' ? '✕' : '•'

export default function PracticeRoomScreen({ config, onBack }: PracticeRoomScreenProps) {
  // Config defaults for Pro Jam Room & Editable Finger Mapping
  const defaultFingerMapping = ['Em', 'Am', 'C', 'D', 'G', 'F']
  const [fingerMapping, setFingerMapping] = useState<string[]>(config?.fingerMapping ?? defaultFingerMapping)
  const [editingFingerIdx, setEditingFingerIdx] = useState<number | null>(null)
  const [customInput, setCustomInput] = useState('')
  const [customChordError, setCustomChordError] = useState('')

  // Capo & BPM Controls
  const [capo, setCapo] = useState<number>(config?.capo ?? 0)
  const [bpm, setBpm]   = useState<number>(config?.bpm ?? 90)
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(() => {
    const configured = config?.displayPattern
    const index = configured
      ? STRUM_PRESETS.findIndex(p => p.display === configured)
      : -1
    return index >= 0 ? index : 0
  })
  const [customPattern, setCustomPattern] = useState<string[] | null>(() => {
    if (!config?.strumPattern?.length) return null
    const isPreset = STRUM_PRESETS.some(p => p.display === config.displayPattern)
    return isPreset ? null : [...config.strumPattern]
  })
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
  const [isMuted] = useState(false)
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
  const { initialize, processFrame, setOnResults, dispose } = useHandTracking()

  // ── Recording State ──────────────────────────────────────────────────
  const [isRecording, setIsRecording]       = useState(false)
  const [recordingTime, setRecordingTime]   = useState(0)
  const [recordedUrl, setRecordedUrl]       = useState<string | null>(null)
  const mountedRef                           = useRef(true)
  const recordedUrlRef                       = useRef<string | null>(null)
  const mediaRecorderRef                     = useRef<MediaRecorder | null>(null)
  const recordedChunksRef                    = useRef<Blob[]>([])
  const recTimerRef                          = useRef<any>(null)

  const updateRecordedUrl = useCallback((url: string | null) => {
    setRecordedUrl(previous => {
      if (previous && previous !== url) URL.revokeObjectURL(previous)
      recordedUrlRef.current = url
      return url
    })
  }, [])

  useEffect(() => () => {
    mountedRef.current = false
    if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
  }, [])

  // ── Apply Capo ────────────────────────────────────────────────────────
  useEffect(() => { setCapoFret(capo) }, [capo])

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
    let cancelled = false

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
          stream = await navigator.mediaDevices.getUserMedia({ video })
        }

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        setMicReady(stream.getAudioTracks().length > 0)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (cancelled) return
            videoRef.current?.play().catch(() => {})
            setCameraReady(true)
          }
        }
      } catch {
        if (!cancelled) setCameraError('Camera permission blocked. Please allow camera access.')
      }
    }
    void startCam()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop() } catch { /* already stopped */ }
      }
      if (recTimerRef.current) {
        clearInterval(recTimerRef.current)
        recTimerRef.current = null
      }
      disconnectMicrophoneFromRecording()
    }
  }, [])

  // ── Hand Tracking MediaPipe ──────────────────────────────────────────
  useEffect(() => {
    void initialize()
    return dispose
  }, [initialize, dispose])

  useEffect(() => {
    setOnResults((result) => {
      if (!canvasRef.current || !videoRef.current) return
      const canvas = canvasRef.current
      const ctx    = canvas.getContext('2d')
      const width = videoRef.current.videoWidth || 1280
      const height = videoRef.current.videoHeight || 720
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!result?.landmarks || result.landmarks.length === 0) {
        gestureRef.current.reset()
        return
      }

      if (result.landmarks.length > 0) {
        drawHandSkeleton(ctx, result.landmarks, canvas.width, canvas.height)
        const gesture = gestureRef.current.processLandmarks(result.landmarks, result.confidence)
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

    playNextBeat()
    let nextBeatAt = performance.now() + beatMs
    let timerId = window.setTimeout(scheduleNextBeat, beatMs)

    function scheduleNextBeat() {
      const now = performance.now()
      if (now > nextBeatAt + beatMs) nextBeatAt = now
      playNextBeat()
      nextBeatAt += beatMs
      timerId = window.setTimeout(scheduleNextBeat, Math.max(0, nextBeatAt - performance.now()))
    }

    return () => window.clearTimeout(timerId)
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
        disconnectMicrophoneFromRecording()
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/webm' })
        const url  = URL.createObjectURL(blob)
        if (!mountedRef.current) {
          URL.revokeObjectURL(url)
          return
        }
        updateRecordedUrl(url)
      }

      recorder.onerror = () => {
        disconnectMicrophoneFromRecording()
        if (recTimerRef.current) {
          clearInterval(recTimerRef.current)
          recTimerRef.current = null
        }
        setIsRecording(false)
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
  }, [updateRecordedUrl])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
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
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden select-none text-white">

      {/* ── Camera feed + skeleton ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        style={{ opacity: 0.85 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none z-10"
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,0.85) 100%)' }}
      />
      <div className="film-grain z-10" />

      {/* ═══ TOP BAR ═══ */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-8 py-4 flex items-center justify-between gap-3 flex-wrap">
        {/* Left: identity */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="studio-icon" aria-label="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="studio-label-gold" style={{ fontSize: 9 }}>Freestyle Room</p>
            <p className="text-[13px] font-light text-white/90 flex items-center gap-2.5 mt-0.5">
              Practice &amp; Record
              <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: micReady ? '#7FBF8E' : 'rgba(255,255,255,0.3)' }}>
                <Mic className="w-3 h-3" strokeWidth={1.5} /> {micReady ? 'Mic live' : 'No mic'}
              </span>
            </p>
          </div>
        </div>

        {/* Right: session controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Capo */}
          <div className="studio-glass flex items-center gap-1 px-3 py-2">
            <span className="studio-label mr-1" style={{ fontSize: 8 }}>Capo</span>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(fret => (
              <button
                key={fret}
                onClick={() => { initAudioEngine(); setCapo(fret) }}
                className="studio-num w-6 h-6 rounded-[2px] text-[11px] font-semibold transition-all"
                style={capo === fret
                  ? { background: 'var(--gold)', color: '#0a0a0a' }
                  : { color: 'rgba(255,255,255,0.4)' }}
              >
                {fret}
              </button>
            ))}
          </div>

          {/* BPM */}
          <div className="studio-glass flex items-center gap-2 px-3 py-2">
            <span className="studio-label" style={{ fontSize: 8 }}>BPM</span>
            <button onClick={() => setBpm(b => Math.max(40, b - 5))} className="text-white/50 hover:text-white transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="studio-num text-sm font-semibold min-w-[30px] text-center" style={{ color: 'var(--gold-bright)' }}>{bpm}</span>
            <button onClick={() => setBpm(b => Math.min(200, b + 5))} className="text-white/50 hover:text-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pattern */}
          <select
            value={selectedPresetIdx}
            onChange={e => { setSelectedPresetIdx(Number(e.target.value)); setCustomPattern(null) }}
            className="studio-select hidden sm:block"
          >
            {STRUM_PRESETS.map((p, idx) => (
              <option key={idx} value={idx} className="bg-[#0a0a0a]">{p.name}</option>
            ))}
          </select>
          <button onClick={() => setShowPatternModal(true)} className="studio-btn studio-btn-ghost !py-2 !px-3.5 !text-[10px]">
            Edit Pattern
          </button>

          {/* Record */}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className="studio-btn !py-2 !px-4 !text-[11px] transition-all"
            style={isRecording
              ? { background: '#E5484D', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
              : { background: 'rgba(229,72,77,0.12)', color: '#F0A3A6', border: '1px solid rgba(229,72,77,0.45)' }}
          >
            <span className={isRecording ? 'w-2 h-2 bg-white rounded-[1px]' : 'rec-dot'} />
            {isRecording ? `Stop · ${formatRecTime(recordingTime)}` : 'Record'}
          </button>

          {/* Play */}
          <button
            onClick={() => { initAudioEngine(); setIsPlaying(p => !p) }}
            className="studio-btn !py-2 !px-5 !text-[11px]"
            style={isPlaying
              ? { background: 'var(--gold)', color: '#0a0a0a' }
              : { background: '#fff', color: '#050505' }}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Start Strumming'}
          </button>
        </div>
      </div>

      {/* ═══ CENTER — detected chord ═══ */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Gold pulse + vibrating strings on every strummed beat */}
        {isPlaying && activeBeat >= 0 && (
          <div key={`fx-${activeBeat}`} className="absolute inset-0 flex items-center justify-center">
            <div className="beat-flash" />
            <div className="strings-burst">
              <span /><span /><span /><span /><span /><span />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={detectedChord}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-center relative"
          >
            <p className="studio-label mb-3">Now sounding</p>
            <div
              className="font-light text-white leading-none"
              style={{ fontSize: 'clamp(90px, 16vh, 150px)', letterSpacing: '-0.04em', textShadow: '0 4px 60px rgba(0,0,0,0.6)' }}
            >
              {detectedChord}
            </div>
            <div className="mx-auto mt-4 w-16 h-px" style={{ background: 'var(--gold)' }} />
            <p className="text-[11px] font-mono text-white/45 mt-3 uppercase tracking-[0.25em]">
              {GESTURE_LABELS[detectedFingers] ?? '—'} · {detectedFingers} finger{detectedFingers !== 1 ? 's' : ''}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ BOTTOM — gesture map + metronome ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 pb-4 sm:pb-6 space-y-2.5">
        {/* Beat visualizer */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="studio-glass px-4 sm:px-5 py-3 flex items-center gap-4"
          >
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="rec-dot" style={{ background: 'var(--gold)' }} />
              <span className="studio-num text-[11px] font-mono text-white/50">{bpm} BPM</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1 max-w-2xl mx-auto">
              {strumPattern.map((stroke, i) => (
                <button
                  key={i}
                  onClick={() => toggleBeat(i)}
                  title="Click to cycle stroke"
                  className={`beat-cell cursor-pointer ${activeBeat === i ? 'beat-cell-active' : 'hover:border-white/30'}`}
                >
                  {STROKE_GLYPH(stroke)}
                </button>
              ))}
            </div>
            <span className="studio-num hidden sm:block text-[11px] font-mono text-white/35 shrink-0">
              {activeBeat >= 0 ? activeBeat + 1 : '–'}/{strumPattern.length}
            </span>
          </motion.div>
        )}

        {/* Gesture map */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {fingerMapping.map((chord, idx) => (
            <button
              key={idx}
              onClick={() => { initAudioEngine(); setEditingFingerIdx(idx); setCustomInput(chord); setCustomChordError('') }}
              title="Edit chord for this gesture"
              className="studio-glass flex items-center gap-2.5 px-3.5 py-2.5 transition-all hover:border-white/25"
              style={detectedFingers === idx ? { borderColor: 'rgba(201,168,76,0.6)', background: 'rgba(201,168,76,0.1)' } : {}}
            >
              <span
                className="studio-num w-5 h-5 flex items-center justify-center text-[10px] font-bold border rounded-[2px]"
                style={detectedFingers === idx
                  ? { background: 'var(--gold)', borderColor: 'var(--gold)', color: '#0a0a0a' }
                  : { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }}
              >
                {idx}
              </span>
              <span
                className="studio-num text-xs font-bold"
                style={{ color: detectedFingers === idx ? 'var(--gold-bright)' : 'rgba(255,255,255,0.7)' }}
              >
                {chord}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Recording preview modal ═══ */}
      <AnimatePresence>
        {recordedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-[#0a0a0a] border rounded-[4px] p-6 max-w-2xl w-full space-y-5"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="studio-label-gold mb-1.5">Take complete</p>
                  <h2 className="text-xl font-light text-white">Performance Recorded</h2>
                </div>
                <button onClick={() => updateRecordedUrl(null)} className="studio-icon !w-8 !h-8">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative aspect-video rounded-[3px] overflow-hidden bg-black border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <video src={recordedUrl} controls autoPlay className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button onClick={() => updateRecordedUrl(null)} className="studio-btn studio-btn-ghost !text-[11px]">
                  <RotateCcw className="w-3.5 h-3.5" /> Re-record
                </button>
                <a href={recordedUrl} download="airchord-jam-session.webm" className="studio-btn studio-btn-primary !text-[11px]">
                  <Download className="w-3.5 h-3.5" /> Download Video
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Chord map editor modal ═══ */}
      <AnimatePresence>
        {editingFingerIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-[#0a0a0a] border rounded-[4px] p-6 max-w-lg w-full space-y-5"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="studio-label-gold mb-1.5">Gesture {editingFingerIdx} — {GESTURE_LABELS[editingFingerIdx]}</p>
                  <h2 className="text-lg font-light text-white">Map a chord to this hand shape</h2>
                </div>
                <button onClick={() => setEditingFingerIdx(null)} className="studio-icon !w-8 !h-8">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Dsus2, F#m, Cadd9…"
                  className="studio-input font-mono !text-sm"
                />
                <button
                  onClick={() => {
                    const requested = customInput.trim()
                    const supported = Object.keys(CHORD_NOTES).find(
                      chord => chord.toLowerCase() === requested.toLowerCase(),
                    )
                    if (!supported || editingFingerIdx === null) {
                      setCustomChordError('Choose a supported chord from the list below.')
                      return
                    }
                    const newMap = [...fingerMapping]
                    newMap[editingFingerIdx] = supported
                    setFingerMapping(newMap)
                    triggerGuitarChord(supported, 0.35)
                    setCustomChordError('')
                    setEditingFingerIdx(null)
                  }}
                  className="studio-btn studio-btn-gold !text-[11px] shrink-0"
                >
                  Apply
                </button>
              </div>
              {customChordError && (
                <p className="text-xs font-mono text-[#F0A3A6]" role="alert">{customChordError}</p>
              )}

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-60 overflow-y-auto studio-scroll pr-1">
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
                    className="studio-num py-2.5 rounded-[3px] border text-xs font-bold transition-all hover:bg-white/[0.06]"
                    style={fingerMapping[editingFingerIdx] === c
                      ? { background: 'var(--gold)', borderColor: 'var(--gold)', color: '#0a0a0a' }
                      : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Pattern editor modal ═══ */}
      <AnimatePresence>
        {showPatternModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-[#0a0a0a] border rounded-[4px] p-6 max-w-lg w-full space-y-5"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="studio-label-gold mb-1.5">Rhythm</p>
                  <h2 className="text-lg font-light text-white">Edit strum pattern</h2>
                  <p className="text-[11px] font-mono text-white/30 mt-1">Click any beat to cycle ↓ / ↑ / ✕ / •</p>
                </div>
                <button onClick={() => setShowPatternModal(false)} className="studio-icon !w-8 !h-8">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 flex-wrap bg-white/[0.02] p-4 rounded-[3px] border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                {strumPattern.map((stroke, i) => (
                  <button
                    key={i}
                    onClick={() => toggleBeat(i)}
                    className="w-12 h-14 rounded-[3px] border flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)' }}
                  >
                    <span className="text-lg font-bold" style={{ color: 'var(--gold-bright)' }}>{STROKE_GLYPH(stroke)}</span>
                    <span className="studio-num text-[9px] font-mono text-white/30">B{i + 1}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { if (strumPattern.length > 2) setCustomPattern(strumPattern.slice(0, -1)) }}
                    className="studio-btn studio-btn-ghost !py-2 !px-3.5 !text-[10px]"
                  >
                    <Minus className="w-3 h-3" /> Beat
                  </button>
                  <button
                    onClick={() => { if (strumPattern.length < 16) setCustomPattern([...strumPattern, 'D']) }}
                    className="studio-btn studio-btn-ghost !py-2 !px-3.5 !text-[10px]"
                  >
                    <Plus className="w-3 h-3" /> Beat
                  </button>
                </div>
                <button
                  onClick={() => setCustomPattern(null)}
                  className="studio-btn studio-btn-ghost !py-2 !px-4 !text-[10px]"
                >
                  <RotateCcw className="w-3 h-3" /> Reset preset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera status states */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050505]">
          <div className="text-center">
            <div className="w-14 h-14 border rounded-full animate-spin mx-auto mb-5" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--gold)' }} />
            <p className="studio-label">Starting camera</p>
          </div>
        </div>
      )}
      {cameraError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050505]">
          <div className="text-center max-w-xs px-6">
            <p className="text-sm font-light text-[#F0A3A6] mb-5">{cameraError}</p>
            <button onClick={onBack} className="studio-btn studio-btn-ghost !text-[11px] mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" /> Go back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
