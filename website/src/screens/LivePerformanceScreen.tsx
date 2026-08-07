// ── Live Performance Screen (Orchestrator) ────────────────────────────────────
//
// This screen orchestrates sub-components instead of implementing everything:
//
//   LivePerformanceScreen
//     ├── CameraPanel        — video feed + hand skeleton
//     ├── StageHUD           — top bar controls
//     ├── LyricsPanel        — current/next lyric + chord badges
//     ├── Timeline           — beat metronome + strum pattern + pause
//     ├── CountdownOverlay   — 3-2-1 countdown
//     └── RecordingPreview   — post-recording modal
//
// Controllers (logic, not UI):
//     ├── GestureController  — camera → hand tracking → chord detection
//     ├── AudioController    — guitarist engine + beat scheduling
//     └── RecordingController— MediaRecorder lifecycle

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Youtube } from 'lucide-react'
import type { SessionConfig } from './SongSetupScreen'
import {
  initAudioEngine,
  setCapoFret,
  setAudioMuted,
  setEffectsConfig,
  createPerformanceRecordingStream,
  disconnectMicrophoneFromRecording,
  CHORD_NOTES,
  playPluckNote,
} from '../utils/guitarSound'
import { GuitaristEngine } from '../engines/GuitaristEngine'
import { FingerstyleEngine } from '../engines/Fingerstyle/FingerstyleEngine'
import { useHandTracking } from '../utils/useHandTracking'
import { useWhisperFollower } from '../hooks/useWhisperFollower'
import { GestureEngine } from '../utils/GestureEngine'
import { getProfileById } from '../utils/GestureProfiles'
import { drawHandSkeleton } from '../utils/handTracker'
import { fetchSyncedLyrics, type SyncedLine } from '../utils/lrclib'
import { eventBus } from '../core/EventBus'
import type { HumanizerPreset } from '../core/types'

// Decomposed components
import { CameraPanel } from '../components/LivePerformance/CameraPanel'
import { StageHUD } from '../components/LivePerformance/StageHUD'
import { LyricsPanel } from '../components/LivePerformance/LyricsPanel'
import { Timeline } from '../components/LivePerformance/Timeline'
import { CountdownOverlay } from '../components/LivePerformance/CountdownOverlay'
import { RecordingPreview } from '../components/LivePerformance/RecordingPreview'
import { AdaptiveChordPreview } from '../components/LivePerformance/AdaptiveChordPreview'

interface LivePerformanceScreenProps {
  config: SessionConfig
  onEnd: () => void
}

export default function LivePerformanceScreen({ config, onEnd }: LivePerformanceScreenProps) {
  const { song, capo, bpm, strumPattern, displayPattern, fingerMapping } = config

  // ── Lyrics (merged from local + lrclib) ──────────────────────────────────
  const localLyrics = useMemo(
    () => song.sections.flatMap(s => s.lyrics.map(l => ({
      text: l.text,
      chord: l.chord,
      time: l.time,
      fingerGesture: '',
    }))),
    [song.sections],
  )

  const [lrcLines, setLrcLines] = useState<SyncedLine[] | null>(null)
  const [lrcStatus, setLrcStatus] = useState<'loading' | 'ok' | 'fallback'>('loading')

  const allLyrics = useMemo(() => {
    if (!lrcLines) return localLyrics
    const localLyricAtTime = (time: number) => {
      let candidate = localLyrics[0]
      for (const lyric of localLyrics) {
        if (lyric.time > time) break
        candidate = lyric
      }
      return candidate
    }
    return lrcLines.map(l => ({
      text: l.text,
      chord: localLyricAtTime(l.time)?.chord ?? localLyrics[localLyrics.length - 1]?.chord ?? 'G',
      time: l.time,
      fingerGesture: '',
    }))
  }, [lrcLines, localLyrics])

  useEffect(() => {
    let cancelled = false
    const [min, sec] = song.duration.split(':').map(Number)
    const durSec = min * 60 + (sec || 0)
    fetchSyncedLyrics(song.id, song.artist, song.title, durSec).then(lines => {
      if (cancelled) return
      if (lines && lines.length > 0) {
        setLrcLines(lines)
        setLrcStatus('ok')
      } else {
        setLrcStatus('fallback')
      }
    })
    return () => { cancelled = true }
  }, [song.id, song.artist, song.title, song.duration])

  // ── Core State ────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [activeBeat, setActiveBeat] = useState(-1)
  const [detectedFingers, setDetectedFingers] = useState<number | null>(null)
  const [detectedChord, setDetectedChord] = useState<string>(fingerMapping[0] || 'G')
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [micReady, setMicReady] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showYT, setShowYT] = useState(false)
  const [voiceFollower, setVoiceFollower] = useState(true)
  const [lastSungWord, setLastSungWord] = useState('')
  const [elapsedSec, setElapsedSec] = useState(0)
  const ytWindowRef = useRef<Window | null>(null)

  // ── Recording (extracted to hook pattern but kept inline for simplicity) ──
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mountedRef = useRef(true)
  const recordedUrlRef = useRef<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recTimerRef = useRef<any>(null)

  const updateRecordedUrl = useCallback((url: string | null) => {
    setRecordedUrl(prev => {
      if (prev && prev !== url) URL.revokeObjectURL(prev)
      recordedUrlRef.current = url
      return url
    })
  }, [])

  useEffect(() => () => {
    mountedRef.current = false
    if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
  }, [])

  // ── Refs ──────────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const gestureRef = useRef(new GestureEngine(getProfileById('classic')))
  const detectedChordRef = useRef(detectedChord)
  detectedChordRef.current = detectedChord
  const guitaristRef = useRef(new GuitaristEngine(
    GuitaristEngine.styleFromCollections(song.collections)
  ))
  const fingerstyleRef = useRef(new FingerstyleEngine(config?.fingerstylePattern || 'travis'))
  const fingerstyleStartRef = useRef(0)
  // Apply personality from session config
  useEffect(() => {
    const personalityMap: Record<string, string> = {
      campfire: 'campfire', pop: 'pop', bollywood: 'pop',
      rock: 'campfire', worship: 'worship', indie: 'pop',
    }
    const style = (personalityMap[config.personality] || 'pop') as any
    guitaristRef.current.setStyle(style)
  }, [config.personality])

  // Apply the explicit humanizer preset chosen in setup. This must run AFTER
  // the personality effect above, since setStyle() also sets a style-derived
  // humanizer preset and would otherwise override the user's choice.
  useEffect(() => {
    if (config.humanizerPreset) {
      guitaristRef.current.getHumanizer().setPreset(config.humanizerPreset as HumanizerPreset)
    }
  }, [config.humanizerPreset])

  // Keep the fingerstyle engine in sync with the selected pattern.
  useEffect(() => {
    fingerstyleRef.current.setPattern(config.fingerstylePattern || 'travis')
  }, [config.fingerstylePattern])
  const currentSectionRef = useRef<string>('Verse')
  const strumBeatIndexRef = useRef(-1)
  const transportPositionRef = useRef(0)
  const countdownTimerRef = useRef<number | null>(null)
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying
  const voiceFollowerRef = useRef(voiceFollower)
  voiceFollowerRef.current = voiceFollower
  const currentLineRef = useRef(currentLine)
  currentLineRef.current = currentLine
  const allLyricsRef = useRef(allLyrics)
  allLyricsRef.current = allLyrics

  // Whisper-based lyrics follower (replaces the browser SpeechRecognition API).
  // On-device Whisper transcribes the mic (gated by a light VAD) and aligns
  // recognized words to the lyric script to advance/correct the highlighted line.
  const whisperLanguage = song.collections.includes('Hindi') || song.collections.includes('Bollywood')
    ? 'hindi'
    : 'english'
  const getMicStream = useCallback(() => streamRef.current, [])
  const { status: whisperStatus, progress: whisperProgress } = useWhisperFollower({
    enabled: voiceFollower && isPlaying,
    getStream: getMicStream,
    language: whisperLanguage,
    getCurrentLine: () => currentLineRef.current,
    getLyrics: () => allLyricsRef.current,
    onAdvance: (i) => setCurrentLine(l => Math.min(allLyricsRef.current.length - 1, Math.max(l, i))),
    onTranscript: (t) => setLastSungWord(t),
  })

  const { initialize, processFrame, setOnResults, dispose } = useHandTracking()

  // ── Camera Boot ───────────────────────────────────────────────────────────
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
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
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
        if (!cancelled) setCameraError('Camera blocked. Please allow camera access and refresh.')
      }
    }
    void startCam()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop() } catch {}
      }
      if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null }
      disconnectMicrophoneFromRecording()
    }
  }, [])

  // Auto-start countdown
  useEffect(() => {
    if (!cameraReady) return
    const t = setTimeout(() => handleStartWithCountdown(), 600)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraReady])

  // ── MediaPipe ─────────────────────────────────────────────────────────────
  useEffect(() => { void initialize(); return dispose }, [initialize, dispose])

  useEffect(() => {
    setOnResults((result: import('../utils/useHandTracking').HandResult | null) => {
      if (!canvasRef.current || !videoRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const width = videoRef.current.videoWidth || 1280
      const height = videoRef.current.videoHeight || 720
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!result?.landmarks || result.landmarks.length === 0) { gestureRef.current.reset(); return }
      if (result.landmarks.length > 0) {
        drawHandSkeleton(ctx, result.landmarks, canvas.width, canvas.height)
        const gesture = gestureRef.current.processLandmarks(result.landmarks, result.confidence)
        if (gesture) {
          const fingers = Math.min(5, Math.max(0, gesture.fingerCount))
          const chord = fingerMapping[fingers] || fingerMapping[0]
          setDetectedFingers(fingers)
          setDetectedChord(chord)
          eventBus.emit('gesture:detected', { ...gesture, chord })
        }
      }
    })
  }, [setOnResults, fingerMapping])

  // Frame loop
  useEffect(() => {
    let animId: number
    function loop() {
      if (cameraReady && videoRef.current) processFrame(videoRef.current)
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animId)
  }, [cameraReady, processFrame])

  // ── Capo + Mute + Effects ──────────────────────────────────────────────────
  useEffect(() => { setCapoFret(capo) }, [capo])
  useEffect(() => {
    setAudioMuted(isMuted)
    return () => setAudioMuted(false)
  }, [isMuted])

  // Apply effects preset from session config
  useEffect(() => {
    const effectsMap: Record<string, { reverbMix: number; compressionThresholdDb: number; compressionRatio: number }> = {
      acoustic:  { reverbMix: 0.15, compressionThresholdDb: -18, compressionRatio: 3 },
      intimate:  { reverbMix: 0.05, compressionThresholdDb: -14, compressionRatio: 4 },
      concert:   { reverbMix: 0.30, compressionThresholdDb: -20, compressionRatio: 2.5 },
      warm:      { reverbMix: 0.18, compressionThresholdDb: -16, compressionRatio: 3.5 },
      campfire:  { reverbMix: 0.20, compressionThresholdDb: -16, compressionRatio: 3 },
      studio:    { reverbMix: 0.10, compressionThresholdDb: -15, compressionRatio: 4 },
    }
    const fx = effectsMap[config.effectsPreset] ?? effectsMap.acoustic
    setEffectsConfig(fx)
  }, [config.effectsPreset])

  // ── Section Tracker ───────────────────────────────────────────────────────
  useEffect(() => {
    const currentTime = allLyrics[currentLine]?.time
    if (typeof currentTime === 'number') {
      let currentSection = song.sections[0]?.name ?? 'Verse'
      for (const section of song.sections) {
        const firstTime = section.lyrics[0]?.time
        if (typeof firstTime === 'number' && firstTime <= currentTime) currentSection = section.name
      }
      currentSectionRef.current = currentSection
      return
    }
    let lineCount = 0
    for (const section of song.sections) {
      if (currentLine < lineCount + section.lyrics.length) {
        currentSectionRef.current = section.name
        break
      }
      lineCount += section.lyrics.length
    }
  }, [currentLine, song.sections, allLyrics])

  // ── Beat Engine ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || isMuted) { setActiveBeat(-1); return }
    const beatMs = Math.round(60000 / (bpm || 60))
    const patterns = strumPattern.length > 0 ? strumPattern : ['D']
    let beatIndex = strumBeatIndexRef.current
    const playNextBeat = () => {
      beatIndex = (beatIndex + 1) % patterns.length
      strumBeatIndexRef.current = beatIndex
      setActiveBeat(beatIndex)
      const stroke = patterns[beatIndex]
      const chordName = detectedChordRef.current || 'Em'

      // Fingerstyle mode: drive P-I-M-A plucks for the detected chord instead
      // of strumming the pattern.
      if (config.isFingerstyle) {
        const voicing = CHORD_NOTES[chordName] ?? CHORD_NOTES['Em']!
        const cycleMs = (fingerstyleRef.current.getPattern().cycleDuration * 60000) / (bpm || 90)
        const elapsed = fingerstyleStartRef.current
          ? (performance.now() - fingerstyleStartRef.current) % cycleMs
          : 0
        for (const note of fingerstyleRef.current.getNextNotes(voicing, bpm || 90, elapsed)) {
          playPluckNote(note.note, note.velocity, note.stringIndex, note.delaySec)
        }
        return
      }

      eventBus.emit('audio:beat', { stroke, chord: chordName, beatIdx: beatIndex, section: currentSectionRef.current })
      guitaristRef.current.playBeat(stroke, chordName, beatIndex, currentSectionRef.current, 0.35)
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
  }, [isPlaying, isMuted, bpm, strumPattern, config.isFingerstyle, config.fingerstylePattern])

  // ── Transport Clock ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      setElapsedSec(transportPositionRef.current)
      return
    }
    const startedAt = performance.now()
    const positionAtStart = transportPositionRef.current
    const updateTransport = () => {
      const currentSec = positionAtStart + (performance.now() - startedAt) / 1000
      transportPositionRef.current = currentSec
      setElapsedSec(currentSec)
      if (lrcStatus === 'ok') {
        let matchIdx = 0
        for (let i = 0; i < allLyrics.length; i++) {
          if (typeof allLyrics[i]?.time === 'number' && allLyrics[i].time <= currentSec) matchIdx = i
          else break
        }
        setCurrentLine(prev => Math.max(prev, matchIdx))
      } else {
        const secPerLine = (16 * 60) / (bpm || 90)
        const calculatedIdx = Math.min(allLyrics.length - 1, Math.floor(currentSec / secPerLine))
        setCurrentLine(prev => Math.max(prev, calculatedIdx))
      }
      const lastLineTime = allLyrics[allLyrics.length - 1]?.time ?? (allLyrics.length * 8)
      if (allLyrics.length > 0 && currentSec >= lastLineTime + 8) {
        setIsPlaying(false)
        setActiveBeat(-1)
      }
    }
    updateTransport()
    const iv = setInterval(updateTransport, 100)
    return () => {
      transportPositionRef.current = positionAtStart + (performance.now() - startedAt) / 1000
      clearInterval(iv)
    }
  }, [isPlaying, allLyrics, lrcStatus, bpm])

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        setCurrentLine(l => Math.min(allLyricsRef.current.length - 1, l + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentLine(l => Math.max(0, l - 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ── Voice Recognition (Whisper) ──────────────────────────────────────────────
  // Implemented by useWhisperFollower (declared above). It replaces the browser
  // SpeechRecognition API with an on-device Whisper pipeline that aligns
  // recognized words to the lyric script to advance the highlighted line.

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStartWithCountdown = useCallback(() => {
    initAudioEngine()
    guitaristRef.current.reset()
    currentSectionRef.current = 'Verse'
    strumBeatIndexRef.current = -1
    transportPositionRef.current = 0
    setElapsedSec(0)
    setCountdown(3)
    if (countdownTimerRef.current !== null) window.clearInterval(countdownTimerRef.current)
    let count = 3
    const timerId = window.setInterval(() => {
      count -= 1
      if (count <= 0) {
        window.clearInterval(timerId)
        countdownTimerRef.current = null
        setCountdown(null)
        fingerstyleStartRef.current = performance.now()
        setIsPlaying(true)
        setCurrentLine(0)
      } else {
        setCountdown(count)
      }
    }, 1000)
    countdownTimerRef.current = timerId
  }, [])

  const handlePause = useCallback(() => {
    if (countdown !== null) {
      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
      setCountdown(null)
      return
    }
    setIsPlaying(p => !p)
  }, [countdown])

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
        if (!m || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m))) { selectedMime = m; break }
      }
      const options = selectedMime ? { mimeType: selectedMime } : undefined
      const recorder = new MediaRecorder(recStream, options)
      recorder.ondataavailable = (e) => { if (e.data?.size > 0) recordedChunksRef.current.push(e.data) }
      recorder.onstop = () => {
        disconnectMicrophoneFromRecording()
        const mime = selectedMime || 'video/webm'
        const blob = new Blob(recordedChunksRef.current, { type: mime })
        const url = URL.createObjectURL(blob)
        if (!mountedRef.current) { URL.revokeObjectURL(url); return }
        setRecordedBlob(blob)
        updateRecordedUrl(url)
        setIsRecording(false)
      }
      recorder.onerror = () => {
        if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null }
        setIsRecording(false)
      }
      mediaRecorderRef.current = recorder
      recorder.start(200)
      setIsRecording(true)
      setRecordingTime(0)
      recTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch { setIsRecording(false) }
  }, [updateRecordedUrl])

  const handleStopRecording = useCallback(() => {
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const closeRecordingPreview = useCallback(() => {
    updateRecordedUrl(null)
    setRecordedBlob(null)
  }, [updateRecordedUrl])

  const handleDownloadVideo = useCallback(() => {
    if (!recordedUrl) return
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = recordedUrl
    const ext = recordedBlob?.type.includes('mp4') ? 'mp4' : 'webm'
    const safeTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
    a.download = `airchord_${safeTitle}_performance.${ext}`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => document.body.removeChild(a), 100)
  }, [recordedUrl, recordedBlob, song.title])

  // ── Derived values ────────────────────────────────────────────────────────
  const currentLyric = allLyrics[currentLine]
  const nextLyric = allLyrics[currentLine + 1]

  return (
    <div className="fixed inset-0 overflow-hidden font-sans" style={{ background: '#000' }}>
      {/* Camera + hand skeleton */}
      <CameraPanel
        videoRef={videoRef}
        canvasRef={canvasRef}
        cameraReady={cameraReady}
        cameraError={cameraError}
        onEnd={onEnd}
      />

      {/* Top bar */}
      <StageHUD
        songTitle={song.title}
        songArtist={song.artist}
        bpm={bpm}
        isPlaying={isPlaying}
        isMuted={isMuted}
        micReady={micReady}
        elapsedSec={elapsedSec}
        isRecording={isRecording}
        recordingTime={recordingTime}
        showYT={showYT}
        voiceFollower={voiceFollower}
        onToggleMute={() => setIsMuted(m => !m)}
        onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
        onToggleVoiceFollower={() => setVoiceFollower(v => !v)}
        onToggleYouTube={() => {
          const query = encodeURIComponent(`${song.title} ${song.artist} official`)
          const url = `https://www.youtube.com/results?search_query=${query}`
          if (ytWindowRef.current && !ytWindowRef.current.closed) {
            ytWindowRef.current.close(); setShowYT(false); return
          }
          const popup = window.open(url, 'airchord_bg_song', 'width=480,height=320,top=80,right=20,toolbar=no,menubar=no,scrollbars=yes,resizable=yes')
          ytWindowRef.current = popup; setShowYT(true)
        }}
        onEnd={onEnd}
      />

      {/* Gold pulse on every strummed beat — the screen breathes with the music */}
      {isPlaying && activeBeat >= 0 && (
        <div key={`beat-flash-${activeBeat}`} className="absolute inset-0 z-10 pointer-events-none">
          <div className="beat-flash" />
        </div>
      )}

      {/* Countdown */}
      <CountdownOverlay countdown={countdown} chords={song.chords} />

      {/* Bottom HUD */}
      {(isPlaying || activeBeat >= 0) && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-6 pb-3 sm:pb-6 space-y-2 sm:space-y-3">

          {/* Adaptive Chord Preview — shows next gesture before it arrives */}
          <AdaptiveChordPreview
            nextChord={nextLyric?.chord}
            nextFingerCount={fingerMapping.indexOf(nextLyric?.chord ?? '')}
            currentChord={detectedChord}
            currentFingerCount={detectedFingers ?? -1}
            visible={isPlaying}
          />

          {voiceFollower && (
            <div className="text-center text-[10px] font-mono tracking-wide text-white/45">
              {whisperStatus === 'loading'
                ? `Whisper loading ${whisperProgress}%`
                : whisperStatus === 'unavailable'
                ? 'Voice follow unavailable (Whisper)'
                : whisperStatus === 'ready'
                ? 'Listening · Whisper'
                : ''}
            </div>
          )}

          <LyricsPanel
            currentLyric={currentLyric}
            nextLyric={nextLyric}
            currentLine={currentLine}
            totalLines={allLyrics.length}
            detectedFingers={detectedFingers}
            fingerMapping={fingerMapping}
            voiceFollower={voiceFollower}
            lastSungWord={lastSungWord}
            lrcStatus={lrcStatus}
            onPrevLine={() => setCurrentLine(l => Math.max(0, l - 1))}
            onNextLine={() => setCurrentLine(l => Math.min(allLyrics.length - 1, l + 1))}
          />
          <Timeline
            isPlaying={isPlaying}
            activeBeat={activeBeat}
            bpm={bpm}
            displayPattern={displayPattern}
            detectedFingers={detectedFingers}
            detectedChord={detectedChord}
            fingerMapping={fingerMapping}
            onPause={handlePause}
          />
        </div>
      )}

      {/* Recording preview */}
      <RecordingPreview
        recordedUrl={recordedUrl}
        songTitle={song.title}
        onClose={closeRecordingPreview}
        onDownload={handleDownloadVideo}
      />
    </div>
  )
}
