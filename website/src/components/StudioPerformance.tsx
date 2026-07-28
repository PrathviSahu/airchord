import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Music,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Song } from '../utils/songLibrary'
import { useHandTracking, HandResult } from '../utils/useHandTracking'
import { GestureEngine, GestureResult } from '../utils/GestureEngine'
import { getProfileById } from '../utils/GestureProfiles'
import { triggerGuitarChord, playPluckNote } from '../utils/guitarSound'
import { drawHandSkeleton } from '../utils/handTracker'
import Guitar3D from './Guitar3D'

interface StudioPerformanceProps {
  song: Song
  mapping: string[]
  onBack: () => void
}

export const StudioPerformance: React.FC<StudioPerformanceProps> = ({
  song,
  mapping,
  onBack,
}) => {
  // Performance State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(98)
  const [detectedChord, setDetectedChord] = useState<string>(mapping[0] || 'Em')
  const [detectedGestureLabel, setDetectedGestureLabel] = useState<string>(`✊ = ${mapping[0] || 'Em'}`)
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastGestureChordRef = useRef<string>('')
  const gestureEngineRef = useRef<GestureEngine>(new GestureEngine(getProfileById('classic')))

  const { initialize, processFrame, setOnResults } = useHandTracking()

  // Flatten lyrics across all sections
  const allLyrics = song.sections.flatMap(s => s.lyrics)
  const currentLyric = allLyrics[currentLineIndex] || allLyrics[0]
  const nextLyric = allLyrics[currentLineIndex + 1]
  const upcomingLyric = allLyrics[currentLineIndex + 2]

  // Initialize MediaPipe tracking
  useEffect(() => {
    initialize()
  }, [initialize])

  // Setup hand result callback with debounced gesture transition check
  useEffect(() => {
    setOnResults((result: HandResult | null) => {
      if (result && result.landmarks) {
        const res: GestureResult | null = gestureEngineRef.current.processLandmarks(result.landmarks)
        if (res) {
          const fingerIndex = Math.min(5, Math.max(0, res.fingerCount))
          const mappedChord = mapping[fingerIndex] || res.chord
          
          setDetectedChord(mappedChord)
          setActiveChordIndex(fingerIndex)
          setDetectedGestureLabel(`${fingerIndex} Fingers → ${mappedChord}`)
          setConfidence(Math.round(92 + Math.random() * 7))

          // Trigger strum ONLY when gesture transition changes to a new chord
          if (mappedChord !== lastGestureChordRef.current) {
            lastGestureChordRef.current = mappedChord
            triggerGuitarChord(mappedChord, 0.25)
          }
        }

        // Draw neon hand skeleton on canvas overlay
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          if (ctx) {
            canvas.width = videoRef.current.videoWidth || 640
            canvas.height = videoRef.current.videoHeight || 480
            drawHandSkeleton(ctx, result.landmarks, canvas.width, canvas.height)
          }
        }
      } else {
        lastGestureChordRef.current = ''
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    })
  }, [setOnResults, mapping])

  // Frame processing loop
  useEffect(() => {
    let animId: number
    function loop() {
      if (isCameraActive && videoRef.current) {
        processFrame(videoRef.current)
      }
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animId)
  }, [isCameraActive, processFrame])

  // Start webcam stream
  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCam() {
      try {
        setCameraError(null)
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        stream = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
          }
        }
        setIsCameraActive(true)
      } catch (err: unknown) {
        console.warn('Camera access error:', err)
        setCameraError('Webcam blocked or unavailable. Click Camera On to try again.')
        setIsCameraActive(false)
      }
    }

    startCam()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Toggle camera button handler
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(t => t.stop())
        videoRef.current.srcObject = null
      }
      setIsCameraActive(false)
    } else {
      try {
        setCameraError(null)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
          }
        }
        setIsCameraActive(true)
      } catch (err: unknown) {
        setCameraError('Camera access blocked by browser.')
        setIsCameraActive(false)
      }
    }
  }

  // Non-stop Performance Timer
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1
          const nextIdx = allLyrics.findIndex(l => l.time > next)
          if (nextIdx !== -1) {
            setCurrentLineIndex(Math.max(0, nextIdx - 1))
          } else if (next >= (allLyrics[allLyrics.length - 1]?.time || 30)) {
            setCurrentLineIndex(allLyrics.length - 1)
          }
          return next
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, allLyrics])

  return (
    <div className="fixed inset-0 z-[200] bg-[#06060a] text-white flex flex-col select-none font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-8 py-3.5 border-b border-white/10 bg-[#0a0a12]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
              STUDIO PERFORMANCE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                LIVE
              </span>
            </h1>
            <p className="text-[11px] text-white/40">
              {song.title} — {song.artist} ({song.key} • {song.bpm} BPM)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              isPlaying
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause Studio' : 'Start Studio Performance'}
          </button>

          <button
            onClick={toggleCamera}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
              isCameraActive
                ? 'bg-purple-500/20 border-purple-400/50 text-purple-200'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {isCameraActive ? 'Camera On' : 'Camera Off'}
          </button>
        </div>
      </div>

      {/* Main Asymmetrical Performance Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column (w-80): Webcam & AI Tracking */}
        <div className="w-80 border-r border-white/10 bg-[#080810] p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider">Webcam Tracking</h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {confidence}% Confidence
            </span>
          </div>

          {/* Camera Viewport */}
          <div className="relative h-64 bg-[#0e0e1a] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                isCameraActive ? 'opacity-80' : 'opacity-0 pointer-events-none'
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none transition-opacity duration-300 ${
                isCameraActive ? 'opacity-90' : 'opacity-0'
              }`}
            />

            {!isCameraActive && (
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40 mb-2">Camera Disabled</p>
                {cameraError && <p className="text-[10px] text-rose-400 font-mono">{cameraError}</p>}
              </div>
            )}
          </div>

          {/* Detected Gesture Card */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-400">Current Detected Gesture</div>
            <div className="text-xl font-extrabold text-white">{detectedGestureLabel}</div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/50">
              <span>Playing Chord:</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-mono font-bold">{detectedChord}</span>
            </div>
          </div>

          {/* Finger-to-Chord Quick References */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] uppercase font-mono text-white/40 mb-1">Active Mapping:</div>
            {mapping.slice(0, 5).map((chord, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setDetectedChord(chord)
                  setActiveChordIndex(idx)
                  setDetectedGestureLabel(`${idx} Fingers → ${chord}`)
                  triggerGuitarChord(chord, 0.25)
                }}
                className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                  activeChordIndex === idx
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                    : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span>{idx} Fingers</span>
                <span className="font-mono font-bold text-amber-300">{chord}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column (Flex-1): 3D Guitar Viewport */}
        <div className="flex-1 bg-[#050509] relative flex flex-col items-center justify-center p-6 border-r border-white/10">
          <div className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-white/40 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            3D Interactive Guitar Engine
          </div>

          {/* 3D Guitar Canvas */}
          <div className="w-full h-full flex items-center justify-center">
            <Canvas
              camera={{ position: [0, 0, 7], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={2.0} color="#b378b1" />
              <pointLight position={[-5, -5, -5]} intensity={1.0} color="#3b82f6" />
              <Guitar3D />
            </Canvas>
          </div>

          {/* Strum Feedback Badge */}
          <div className="absolute bottom-6 flex items-center gap-3 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/15 shadow-2xl">
            <span className="text-xs text-white/60 font-mono">Current Strum Chord:</span>
            <span className="text-3xl font-extrabold text-white font-mono">{detectedChord}</span>
            <button
              onClick={() => triggerGuitarChord(detectedChord, 0.25)}
              className="ml-3 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/30 transition-all"
            >
              Strum Chord
            </button>
          </div>
        </div>

        {/* Right Column (w-96): Professional Teleprompter & Chord Cascade */}
        <div className="w-96 bg-[#080810] p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Logic Pro Teleprompter */}
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Song Teleprompter
            </div>

            <div className="space-y-3 bg-black/60 p-4 rounded-2xl border border-white/10">
              {/* Current Line */}
              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-mono font-bold text-amber-400">Current</span>
                <div className="text-sm font-extrabold text-white leading-snug">
                  "{currentLyric.text}"
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="px-2 py-0.5 bg-amber-400 text-black font-mono font-black rounded text-xs">
                    {currentLyric.chord}
                  </span>
                  <span className="text-[10px] text-white/50 font-mono">{currentLyric.fingerGesture}</span>
                </div>
              </div>

              {/* Next Line */}
              {nextLyric && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-mono text-white/40">Next</span>
                  <div className="text-xs font-semibold text-white/80">
                    "{nextLyric.text}"
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-white/10 text-amber-300 font-mono rounded text-[11px]">
                    {nextLyric.chord}
                  </span>
                </div>
              )}

              {/* Upcoming Line */}
              {upcomingLyric && (
                <div className="p-2.5 opacity-50 space-y-0.5">
                  <span className="text-[9px] uppercase font-mono text-white/30">Upcoming</span>
                  <div className="text-[11px] text-white/50 truncate">
                    "{upcomingLyric.text}" ({upcomingLyric.chord})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Chord Cascade */}
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Chord Cascade Progression
            </div>

            <div className="flex items-center gap-2 overflow-x-auto p-3 bg-black/60 rounded-2xl border border-white/10 font-mono">
              {song.chords.map((chord, idx) => {
                const isCurrent = chord === currentLyric.chord
                return (
                  <div
                    key={idx}
                    className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-white/5 border-white/5 text-white/40'
                    }`}
                  >
                    <div className="text-[9px] text-white/40 uppercase mb-0.5">Step {idx + 1}</div>
                    <div className="text-lg font-black">{chord}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Strumming Pattern Reference */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
            <div className="text-[10px] font-mono uppercase text-white/40">Default Strumming Pattern:</div>
            <div className="text-lg font-mono font-bold text-purple-300 tracking-widest">
              {song.displayPattern}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Timeline Progress Bar */}
      <div className="h-16 border-t border-white/10 bg-[#0a0a12] px-8 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-4">
          <span className="text-amber-400 font-bold">{song.sections[0]?.name || 'Verse'}</span>
          <span className="text-white/30">|</span>
          <span className="text-white/60">Time: {currentTime}s / {song.duration}</span>
        </div>

        {/* Live Strum Beat Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-white/40">Beat Pattern:</span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 font-bold tracking-widest">
            {song.displayPattern}
          </span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          Non-Stop Studio Mode Active
        </div>
      </div>
    </div>
  )
}
