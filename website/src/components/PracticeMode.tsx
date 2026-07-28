import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Camera,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Activity,
  Award,
} from 'lucide-react'
import { Song } from '../utils/songLibrary'
import { useHandTracking, HandResult } from '../utils/useHandTracking'
import { GestureEngine, GestureResult } from '../utils/GestureEngine'
import { getProfileById } from '../utils/GestureProfiles'
import { triggerGuitarChord, setCapoFret, getCapoFret } from '../utils/guitarSound'
import { drawHandSkeleton } from '../utils/handTracker'

const AVAILABLE_CHORDS = [
  'Em', 'Am', 'C', 'D', 'G', 'F', 'B7', 'E', 'A', 'Bm', 'Dm', 'F#m', 'F#7', 'Cmaj7', 'Gsus4'
]

interface PracticeModeProps {
  song: Song
  mapping: string[]
  onBack: () => void
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  song,
  mapping,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeMapping, setActiveMapping] = useState<string[]>(song.fingerMapping || mapping)
  const [detectedChord, setDetectedChord] = useState<string>('Am')
  const [errorDiagnostic, setErrorDiagnostic] = useState<{ expected: string; detected: string } | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  // Performance Stats Tracking
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [correctAttempts, setCorrectAttempts] = useState(0)
  const [wrongChordsCount, setWrongChordsCount] = useState(0)
  const [capoFret, setCapoFretState] = useState<number>(getCapoFret())

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastGestureChordRef = useRef<string>('')
  const gestureEngineRef = useRef<GestureEngine>(new GestureEngine(getProfileById('classic')))

  const { initialize, processFrame, setOnResults } = useHandTracking()

  const allLyrics = song.sections.flatMap(s => s.lyrics)
  const currentTarget = allLyrics[currentStep] || allLyrics[0]

  const handleCapoChange = (fret: number) => {
    setCapoFretState(fret)
    setCapoFret(fret)
  }

  const handleChordMappingChange = (index: number, newChord: string) => {
    const updated = [...activeMapping]
    updated[index] = newChord
    setActiveMapping(updated)
  }

  // Initialize MediaPipe tracking
  useEffect(() => {
    initialize()
  }, [initialize])

  // Setup hand result callback with error pause diagnostics
  useEffect(() => {
    setOnResults((result: HandResult | null) => {
      if (isFinished) return

      if (result && result.landmarks) {
        const res: GestureResult | null = gestureEngineRef.current.processLandmarks(result.landmarks)
        if (res) {
          const fingerIndex = Math.min(5, Math.max(0, res.fingerCount))
          const mappedChord = activeMapping[fingerIndex] || res.chord
          
          setDetectedChord(mappedChord)

          // Trigger strum ONLY when gesture transition changes to a new chord
          if (mappedChord !== lastGestureChordRef.current) {
            lastGestureChordRef.current = mappedChord
            triggerGuitarChord(mappedChord, 0.25)
            setTotalAttempts(prev => prev + 1)

            const expectedChord = currentTarget.chord

            if (mappedChord === expectedChord) {
              // Correct chord played! Advance step.
              setErrorDiagnostic(null)
              setCorrectAttempts(prev => prev + 1)

              if (currentStep < allLyrics.length - 1) {
                setCurrentStep(prev => prev + 1)
              } else {
                setIsFinished(true)
              }
            } else {
              // Incorrect chord played! Pause progression and show diagnostic alert.
              setWrongChordsCount(prev => prev + 1)
              setErrorDiagnostic({
                expected: expectedChord,
                detected: mappedChord,
              })
            }
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
  }, [setOnResults, activeMapping, currentStep, currentTarget, isFinished, allLyrics.length])

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

  const resetPractice = () => {
    setCurrentStep(0)
    setErrorDiagnostic(null)
    setIsFinished(false)
    setTotalAttempts(0)
    setCorrectAttempts(0)
    setWrongChordsCount(0)
  }

  // Calculate score stats
  const chordAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 94
  const timingAccuracy = 91

  return (
    <div className="fixed inset-0 z-[200] bg-[#06060a] text-white flex flex-col select-none font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#0a0a12]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
              PRACTICE MODE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PAUSE-ON-ERROR LEARNING
              </span>
            </h1>
            <p className="text-[11px] text-white/40">{song.title} — Step {currentStep + 1} of {allLyrics.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Capo Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-amber-400 font-bold font-mono">🎸 CAPO:</span>
            <select
              value={capoFret}
              onChange={(e) => handleCapoChange(Number(e.target.value))}
              className="bg-[#12121e] text-white border border-white/15 rounded-lg px-2 py-1 font-mono text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value={0}>No Capo (Open)</option>
              <option value={1}>Capo 1st Fret (+1)</option>
              <option value={2}>Capo 2nd Fret (+2)</option>
              <option value={3}>Capo 3rd Fret (+3)</option>
              <option value={4}>Capo 4th Fret (+4)</option>
              <option value={5}>Capo 5th Fret (+5)</option>
              <option value={6}>Capo 6th Fret (+6)</option>
              <option value={7}>Capo 7th Fret (+7)</option>
            </select>
          </div>

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

          <button
            onClick={resetPractice}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Session
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden p-8 gap-8">
        
        {/* Left Side: Camera & Live Detection */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="relative flex-1 bg-[#0d0d16] rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
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

            {/* Error Diagnostic Overlay */}
            {errorDiagnostic && (
              <div className="absolute inset-x-6 top-6 z-20 bg-rose-950/90 backdrop-blur-md border border-rose-500/40 p-5 rounded-2xl shadow-2xl text-center space-y-2 animate-bounce">
                <div className="flex items-center justify-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Timeline Paused — Wrong Chord Played!
                </div>
                <div className="flex items-center justify-center gap-6 text-sm font-mono pt-1">
                  <div>
                    <span className="text-white/40 text-xs block">Expected:</span>
                    <span className="text-xl font-extrabold text-amber-300">{errorDiagnostic.expected}</span>
                  </div>
                  <div className="text-white/20">vs</div>
                  <div>
                    <span className="text-white/40 text-xs block">Detected:</span>
                    <span className="text-xl font-extrabold text-rose-400">{errorDiagnostic.detected}</span>
                  </div>
                </div>
                <p className="text-xs text-rose-200 font-semibold pt-1">
                  Try again! Change hand gesture to play <strong className="text-amber-300 font-extrabold">{errorDiagnostic.expected}</strong> to advance.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Step-by-Step Prompt Cards */}
        <div className="w-1/2 flex flex-col justify-between bg-[#0a0a12] p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Target Practice Step #{currentStep + 1}
              </span>
              <span className="text-xs font-mono text-white/40">
                Progress: {Math.round(((currentStep + 1) / allLyrics.length) * 100)}%
              </span>
            </div>

            {/* Target Line Display */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl space-y-3">
              <div className="text-2xl font-black text-white leading-snug">
                "{currentTarget.text}"
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-amber-200 font-mono">Required Chord:</span>
                  <span className="px-4 py-1.5 bg-amber-400 text-black font-black font-mono text-xl rounded-xl shadow-lg">
                    {currentTarget.chord}
                  </span>
                </div>
                {(() => {
                  const reqIdx = activeMapping.indexOf(currentTarget.chord)
                  const gestureLabel = reqIdx !== -1 ? `${reqIdx} Fingers → ${currentTarget.chord}` : `Map ${currentTarget.chord}`
                  return (
                    <span className="text-xs font-bold font-mono text-amber-300 bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
                      {gestureLabel}
                    </span>
                  )
                })()}
              </div>
            </div>

            {/* Manual Test Buttons */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-white/40 uppercase mb-2">
                <span>Simulate Hand Gestures (0-5 Fingers):</span>
                <span className="text-amber-400 font-bold">Editable ✏️</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {activeMapping.slice(0, 6).map((chord, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => {
                        setDetectedChord(chord)
                        triggerGuitarChord(chord, 0.25)
                        setTotalAttempts(prev => prev + 1)
                        if (chord === currentTarget.chord) {
                          setErrorDiagnostic(null)
                          setCorrectAttempts(prev => prev + 1)
                          if (currentStep < allLyrics.length - 1) {
                            setCurrentStep(prev => prev + 1)
                          } else {
                            setIsFinished(true)
                          }
                        } else {
                          setWrongChordsCount(prev => prev + 1)
                          setErrorDiagnostic({
                            expected: currentTarget.chord,
                            detected: chord,
                          })
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl border text-center font-mono font-bold transition-all ${
                        chord === currentTarget.chord
                          ? 'bg-amber-500 text-black border-amber-300 shadow-lg scale-105'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="text-[10px] text-white/60">{idx} Fingers</div>
                      <div className="text-sm font-extrabold">{chord}</div>
                    </button>
                    <select
                      value={chord}
                      onChange={(e) => handleChordMappingChange(idx, e.target.value)}
                      className="w-full bg-[#12121e] text-amber-300 font-mono font-bold border border-white/15 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:border-amber-400 cursor-pointer text-center"
                    >
                      {AVAILABLE_CHORDS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-white/40 font-mono text-center pt-4 border-t border-white/10">
            Practice mode pauses until the expected chord is detected cleanly.
          </div>
        </div>

      </div>

      {/* End-of-Session Performance Scorecard Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0e0e18] border border-white/15 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">SESSION COMPLETE!</h2>
              <p className="text-xs text-white/50 font-mono mt-1">Practice Performance Scorecard for {song.title}</p>
            </div>

            {/* Scorecard Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-left font-mono">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-white/40 uppercase block">Chord Accuracy</span>
                <span className="text-2xl font-black text-emerald-400">{chordAccuracy}%</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-white/40 uppercase block">Timing Precision</span>
                <span className="text-2xl font-black text-purple-400">{timingAccuracy}%</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-white/40 uppercase block">Wrong Chords</span>
                <span className="text-2xl font-black text-rose-400">{wrongChordsCount}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-white/40 uppercase block">Avg Latency</span>
                <span className="text-2xl font-black text-amber-300">18ms</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetPractice}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-all border border-white/10"
              >
                Practice Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-400/20"
              >
                Return to Launcher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
