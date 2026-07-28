import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Camera, Settings, RotateCcw, Volume2, Music, Sparkles, Sliders, Check, Play, Pause, Edit3, VolumeX, Mic, MicOff, Radio, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { playPluckNote, playStrum, playDownStrum, playUpStrum, playPatternBeat, setGuitarType, getGuitarType, GuitarType, triggerGuitarChord, setCapoFret, getCapoFret, toggleStrumming, isStrummingActive } from '../utils/guitarSound'
import { drawHandSkeleton } from '../utils/handTracker'
import { useHandTracking, HandResult } from '../utils/useHandTracking'
import { GestureEngine, GestureResult } from '../utils/GestureEngine'
import { getProfileById } from '../utils/GestureProfiles'
import { BACKING_TRACKS, BackingTrackPlayer, BackingTrack } from '../utils/backingTracks'
import { HINDI_SONGS, HindiSong } from '../utils/hindiSongs'
import { StrumVoiceDetector, VocalStrumResult } from '../utils/strumVoiceDetector'

const GUITAR_VOICE_TYPES: { id: GuitarType; name: string; icon: string; desc: string }[] = [
  { id: 'steel', name: 'Dreadnought Steel', icon: '🎸', desc: 'Resonant steel strings' },
  { id: 'nylon', name: 'Spanish Nylon', icon: '🎼', desc: 'Warm classical timbre' },
  { id: 'electric', name: 'Electric Clean', icon: '⚡', desc: 'Single-coil Strat tone' },
  { id: '12string', name: '12-String Acoustic', icon: '🌟', desc: 'Shimmering octave layers' },
]

const STRUM_PRESETS = [
  { name: 'Island Pop', pattern: ['D', 'D', 'U', 'U', 'D', 'U'], display: '↓ ↓ ↑ ↑ ↓ ↑' },
  { name: 'Rock 4/4', pattern: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'], display: '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓' },
  { name: 'Basic Folk', pattern: ['D', 'D', 'U', 'D', 'U'], display: '↓ ↓ ↑ ↓ ↑' },
  { name: 'Waltz 3/4', pattern: ['D', 'U', 'U', 'D', 'U', 'U'], display: '↓ ↑ ↑ ↓ ↑ ↑' },
  { name: 'Percussive Slap', pattern: ['D', 'X', 'U', 'D', 'X', 'U'], display: '↓ ✕ ↑ ↓ ✕ ↑' },
]

const ALL_CHORDS = [
  'Em', 'Am', 'G', 'C', 'D', 'F', 'E', 'A', 'Dm', 'B7', 'G7', 'C7', 'D7', 'E7', 'A7',
  'Bm', 'Fm', 'Gm', 'Cm', 'F#m', 'G#m', 'C#m', 'Bbm', 'Ebm', 'Abm',
  'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'F#', 'C#', 'G#', 'D#', 'A#',
]

const CHORD_NOTES_MAP: Record<string, string[]> = {
  Em: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  Am: ['A2', 'E3', 'A3', 'C4', 'E4'],
  G: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  C: ['C3', 'E3', 'G3', 'C4', 'E4'],
  D: ['D3', 'A3', 'D4', 'F#4'],
  F: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  E: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  A: ['A2', 'E3', 'A3', 'C#4', 'E4'],
  Dm: ['D3', 'A3', 'D4', 'F4'],
  Bm: ['B2', 'F#3', 'B3', 'D4', 'F#4'],
  Cmaj7: ['C3', 'G3', 'B3', 'E4'],
  Am9: ['A2', 'E3', 'G3', 'B3', 'C4'],
  'F#m7': ['F#2', 'C#3', 'E3', 'A3', 'C#4'],
  Gsus4: ['G2', 'D3', 'G3', 'C4', 'D4'],
}

const FINGER_LABELS = [
  { n: 0, emoji: '✊', name: 'Fist (0 fingers)' },
  { n: 1, emoji: '☝️', name: 'One Finger' },
  { n: 2, emoji: '✌️', name: 'Two Fingers' },
  { n: 3, emoji: '🤟', name: 'Three Fingers' },
  { n: 4, emoji: '🖐️', name: 'Four Fingers' },
  { n: 5, emoji: '✋', name: 'Open Palm (5)' },
]

const DEFAULT_MAPPING = ['Em', 'Am', 'G', 'C', 'D', 'F']

const PRESETS = [
  { name: 'Pop Standards', mapping: ['C', 'G', 'Am', 'F', 'Dm', 'Em'] },
  { name: 'Acoustic Folk', mapping: ['G', 'Em', 'C', 'D', 'Am', 'Bm'] },
  { name: 'Rock Anthems', mapping: ['E', 'A', 'B7', 'C#m', 'F#m', 'D'] },
  { name: 'Jazz Warmth', mapping: ['Cmaj7', 'Am9', 'F#m7', 'Gsus4', 'Dm', 'Em'] },
]

const STRINGS = [
  { note: 'E4', name: '1st (High E)', freq: '329.6 Hz' },
  { note: 'B3', name: '2nd (B)', freq: '246.9 Hz' },
  { note: 'G3', name: '3rd (G)', freq: '196.0 Hz' },
  { note: 'D3', name: '4th (D)', freq: '146.8 Hz' },
  { note: 'A2', name: '5th (A)', freq: '110.0 Hz' },
  { note: 'E2', name: '6th (Low E)', freq: '82.4 Hz' },
]

interface StudioProps {
  onBack: () => void
}

export default function Studio({ onBack }: StudioProps) {
  const [mapping, setMapping] = useState<string[]>(DEFAULT_MAPPING)
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(0)
  const [activeChord, setActiveChord] = useState<string>('Em')
  const [tempo, setTempo] = useState(100)
  const [pattern, setPattern] = useState('strum')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null)
  const [activePreset, setActivePreset] = useState('Acoustic Folk')
  const [detectedFingers, setDetectedFingers] = useState<number | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { initialize, processFrame, setOnResults } = useHandTracking()
  const gestureEngineRef = useRef<GestureEngine>(new GestureEngine(getProfileById('classic')))

  const [strumPattern, setStrumPattern] = useState<string[]>(['D', 'D', 'U', 'U', 'D', 'U'])
  const [customPatternInput, setCustomPatternInput] = useState('D D U U D U')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlayingPattern, setIsPlayingPattern] = useState(false)
  const [selectedPatternPreset, setSelectedPatternPreset] = useState('Island Pop')

  const lastGestureChordRef = useRef<string>('')
  const [activeGuitarVoice, setActiveGuitarVoice] = useState<GuitarType>('steel')

  // Studio Backing Track Player State
  const backingPlayerRef = useRef<BackingTrackPlayer>(new BackingTrackPlayer())
  const [activeBackingTrack, setActiveBackingTrack] = useState<BackingTrack>(BACKING_TRACKS[0])
  const [isBackingPlaying, setIsBackingPlaying] = useState(false)
  const [backingChord, setBackingChord] = useState('')

  useEffect(() => {
    const player = backingPlayerRef.current
    player.setTrack(activeBackingTrack)
    player.setCallback((chordName) => {
      setBackingChord(chordName)
      setActiveChord(chordName)
    })
    return () => {
      player.stop()
    }
  }, [activeBackingTrack])

  const toggleBackingTrack = () => {
    const player = backingPlayerRef.current
    if (isBackingPlaying) {
      player.stop()
      setIsBackingPlaying(false)
    } else {
      player.start()
      setIsBackingPlaying(true)
    }
  }

  // Voice AI Strumming Pattern Detector
  const voiceDetectorRef = useRef<StrumVoiceDetector>(new StrumVoiceDetector())
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [micVolume, setMicVolume] = useState(0)

  // Selected Hindi Song State
  const [selectedHindiSong, setSelectedHindiSong] = useState<HindiSong | null>(HINDI_SONGS[0])
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)

  const selectHindiSong = (song: HindiSong) => {
    setSelectedHindiSong(song)
    setCurrentLyricIndex(0)
    setStrumPattern(song.strumPattern)
    setCustomPatternInput(song.strumPattern.join(' '))
    setTempo(song.bpm)
    const newMapping = [
      song.fingerMapping[0] || 'Em',
      song.fingerMapping[1] || 'Am',
      song.fingerMapping[2] || 'D',
      song.fingerMapping[3] || 'C',
      song.fingerMapping[4] || 'G',
      song.fingerMapping[5] || 'B7',
    ]
    setMapping(newMapping)
  }

  const nextLyric = () => {
    if (!selectedHindiSong) return
    setCurrentLyricIndex(prev => (prev + 1) % selectedHindiSong.lyricsWithChords.length)
  }

  const prevLyric = () => {
    if (!selectedHindiSong) return
    setCurrentLyricIndex(prev => (prev - 1 + selectedHindiSong.lyricsWithChords.length) % selectedHindiSong.lyricsWithChords.length)
  }

  const toggleVoiceStrumDetector = async () => {
    const detector = voiceDetectorRef.current
    if (isVoiceListening) {
      const result = detector.stopListening()
      setIsVoiceListening(false)
      if (result) {
        setStrumPattern(result.pattern)
        setCustomPatternInput(result.pattern.join(' '))
        setTempo(result.detectedBpm)
      }
    } else {
      try {
        setIsVoiceListening(true)
        await detector.startListening(
          (result) => {
            setStrumPattern(result.pattern)
            setCustomPatternInput(result.pattern.join(' '))
            setTempo(result.detectedBpm)
          },
          (vol) => setMicVolume(vol)
        )
      } catch {
        setIsVoiceListening(false)
      }
    }
  }

  const changeGuitarVoice = (type: GuitarType) => {
    setActiveGuitarVoice(type)
    setGuitarType(type)
    const notes = CHORD_NOTES_MAP[activeChord] || ['E3', 'A3', 'D4', 'G4']
    playStrum(notes, 0.16)
  }

  // Capo & Audio State
  const [capoFret, setCapoFretState] = useState<number>(getCapoFret())
  const [isStrumming, setIsStrumming] = useState<boolean>(isStrummingActive())

  const handleCapoChange = (fret: number) => {
    setCapoFretState(fret)
    setCapoFret(fret)
  }

  // Play chord function
  const triggerChord = (index: number, chordName: string) => {
    setActiveChordIndex(index)
    setActiveChord(chordName)
    triggerGuitarChord(chordName, 0.2)
  }

  // Auto-strummer rhythm loop synced directly to BPM tempo
  useEffect(() => {
    if (!isPlayingPattern) {
      setCurrentStepIndex(0)
      return
    }

    // 8th note duration: 60,000ms / BPM / 2
    const intervalMs = Math.max(80, Math.round((60 / Math.max(40, tempo)) * 1000 * 0.5))

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextStep = (prev + 1) % (strumPattern.length || 1)
        const stroke = strumPattern[nextStep] || 'D'
        const notes = CHORD_NOTES_MAP[activeChord] || ['E3', 'A3', 'D4', 'G4']
        playPatternBeat(stroke, notes, 0.16)
        return nextStep
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [isPlayingPattern, tempo, strumPattern, activeChord])

  // Custom pattern parser with full support for spaces, dashes (-), dots (.), and rests
  const applyCustomPatternText = (text: string) => {
    setCustomPatternInput(text)
    
    // Replace visual symbols and convert dash/underscore/dot to '.' rest beats
    const formatted = text
      .toUpperCase()
      .replace(/↓/g, 'D')
      .replace(/↑/g, 'U')
      .replace(/✕/g, 'X')
      .replace(/[-_~]/g, ' . ') // Convert dashes & underscores to explicit rest steps

    // Split by spaces or commas
    const rawTokens = formatted.split(/[\s,]+/).filter(Boolean)

    const steps = rawTokens.map(token => {
      if (token === 'D' || token === 'U' || token === 'X' || token === '.') return token
      if (token.startsWith('D')) return 'D'
      if (token.startsWith('U')) return 'U'
      if (token.startsWith('X')) return 'X'
      return '.'
    })

    if (steps.length > 0) {
      setStrumPattern(steps)
    }
  }

  // Cycle beat step: D -> U -> X -> . -> D
  const toggleBeatStep = (idx: number) => {
    const cycleMap: Record<string, string> = { D: 'U', U: 'X', X: '.', '.': 'D' }
    const next = [...strumPattern]
    next[idx] = cycleMap[next[idx] || 'D'] || 'D'
    setStrumPattern(next)
    setCustomPatternInput(next.join(' '))
  }

  // Initialize MediaPipe tracking
  useEffect(() => {
    initialize()
  }, [initialize])

  // Setup hand result callback with debounced gesture transition check
  useEffect(() => {
    setOnResults((result: HandResult | null) => {
      if (result && result.landmarks) {
        setDetectedFingers(gestureEngineRef.current.countFingers(result.landmarks))
        const res: GestureResult | null = gestureEngineRef.current.processLandmarks(result.landmarks)
        if (res) {
          const fingerIndex = Math.min(5, Math.max(0, res.fingerCount))
          const mappedChord = mapping[fingerIndex] || res.chord
          
          // Trigger strum ONLY when gesture transition changes to a new chord
          if (mappedChord !== lastGestureChordRef.current) {
            lastGestureChordRef.current = mappedChord
            triggerChord(fingerIndex, mappedChord)
          }
        }

        // Draw skeleton on canvas
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
        setDetectedFingers(null)
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

  // Auto-start camera feed on mount
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
        setCameraError('Webcam blocked or unavailable. Click Enable Camera to try again.')
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
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      setIsCameraActive(false)
    } else {
      try {
        setCameraError(null)
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
          }
        }
        setIsCameraActive(true)
      } catch (err: unknown) {
        setCameraError('Camera access denied in browser settings.')
        setIsCameraActive(false)
      }
    }
  }

  const updateChord = (fingerIndex: number, chord: string) => {
    const next = [...mapping]
    next[fingerIndex] = chord
    setMapping(next)
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.name)
    setMapping(preset.mapping)
    triggerChord(0, preset.mapping[0])
  }

  const resetToDefault = () => {
    setMapping(DEFAULT_MAPPING)
    triggerChord(0, DEFAULT_MAPPING[0])
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#06060a] flex flex-col text-white select-none font-sans overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#0a0a10]">
        <div className="flex items-center gap-5">
          <button
            onClick={() => {
              playPluckNote('E4', 0.1)
              onBack()
            }}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white">AIRCHORD STUDIO</h1>
              <p className="text-[11px] text-white/40">Real-time Gesture-to-Guitar Engine</p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          {/* Capo Transposition Selector */}
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

          {/* Strumming Start / Stop Button */}
          <button
            onClick={() => {
              const active = toggleStrumming()
              setIsStrumming(active)
              if (active) triggerGuitarChord(activeChord, 0.3)
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all ${
              isStrumming
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            {isStrumming ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            {isStrumming ? 'Strumming ON 🎸' : 'Strumming OFF 🔇'}
          </button>

          <button
            onClick={toggleCamera}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              isCameraActive
                ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {isCameraActive ? 'Disable Camera' : 'Enable Camera'}
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Huge Camera Viewport with Floating Karaoke Lyrics Suggestion Window */}
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
          {/* Main Huge Camera Viewport */}
          <div className="relative flex-1 min-h-[540px] bg-[#0c0c14] rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center shadow-2xl">
            {/* Native Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* AI Neon Hand Skeleton Canvas */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none transition-opacity duration-300 ${
                isCameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Offline / Disabled Camera Fallback */}
            {!isCameraActive && (
              <div className="text-center z-10 p-8 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-purple-400">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Camera Feed Offline</h3>
                <p className="text-xs text-white/40 mb-6 leading-relaxed">
                  Click <strong className="text-white/70">Enable Camera</strong> above to play via live webcam gesture tracking, or use the gesture buttons below to test chords instantly.
                </p>
                {cameraError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg mb-4">
                    {cameraError}
                  </p>
                )}
                <button
                  onClick={toggleCamera}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-purple-600/30"
                >
                  Start Camera Feed
                </button>
              </div>
            )}

            {/* Active Chord Display */}
            {activeChord && (
              <div className="absolute top-6 left-6 z-20 flex items-center gap-4 bg-black/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 shadow-2xl">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold mb-0.5">Active Chord</div>
                  <div className="text-4xl font-extrabold text-white tracking-tight">{activeChord}</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <button
                  onClick={() => triggerChord(activeChordIndex ?? 0, activeChord)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all shadow-md shadow-purple-600/30"
                >
                  Strum
                </button>
              </div>
            )}

            {/* 🌟 FLOATING LYRICS & STRUM PATTERN SUGGESTION WINDOW 🌟 */}
            {selectedHindiSong && selectedHindiSong.lyricsWithChords[currentLyricIndex] && (
              <div className="absolute top-6 right-6 z-30 w-96 bg-black/85 backdrop-blur-xl p-5 rounded-2xl border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-left transition-all">
                {/* Header: Song Info & Karaoke Navigation */}
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                    <div>
                      <span className="text-xs font-bold text-amber-300 tracking-wide uppercase block">
                        {selectedHindiSong.title}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {selectedHindiSong.scale} Scale • {selectedHindiSong.bpm} BPM
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevLyric}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center transition-all"
                      title="Previous Line"
                    >
                      ‹
                    </button>
                    <span className="text-[10px] font-mono text-amber-300/80 px-1">
                      {currentLyricIndex + 1}/{selectedHindiSong.lyricsWithChords.length}
                    </span>
                    <button
                      onClick={nextLyric}
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black flex items-center justify-center transition-all shadow-md shadow-amber-500/30"
                      title="Next Line"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Current Karaoke Song Line */}
                <div className="text-base font-extrabold text-white mb-3 leading-snug tracking-tight">
                  "{selectedHindiSong.lyricsWithChords[currentLyricIndex].line}"
                </div>

                {/* Hand Gesture & Chord Instruction Badge */}
                <div className="flex items-center justify-between bg-amber-500/20 border border-amber-500/40 rounded-xl p-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-200 font-mono">Chord:</span>
                    <span className="px-2.5 py-1 bg-amber-400 text-black font-black rounded-lg font-mono text-sm shadow-md">
                      {selectedHindiSong.lyricsWithChords[currentLyricIndex].chord}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="text-xs font-bold text-white font-mono">
                      {selectedHindiSong.lyricsWithChords[currentLyricIndex].fingerGesture}
                    </span>
                  </div>
                </div>

                {/* Suggested Strum Pattern Badge */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-[10px] text-purple-300 font-mono font-semibold uppercase">Suggested Strum:</span>
                  <span className="text-xs font-mono font-bold text-purple-200 tracking-wider">
                    {selectedHindiSong.displayPattern}
                  </span>
                </div>

                {/* Next Line Preview */}
                {selectedHindiSong.lyricsWithChords[currentLyricIndex + 1] && (
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                    <span className="truncate max-w-[240px]">
                      Next: "{selectedHindiSong.lyricsWithChords[currentLyricIndex + 1].line}"
                    </span>
                    <span className="font-mono font-bold text-amber-300/60">
                      {selectedHindiSong.lyricsWithChords[currentLyricIndex + 1].chord}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Finger Gesture Buttons Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between gap-2 overflow-x-auto p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl">
              {FINGER_LABELS.map((f, i) => {
                const chord = mapping[i] || 'Em'
                const isActive = activeChordIndex === i
                return (
                  <button
                    key={f.n}
                    onClick={() => triggerChord(i, chord)}
                    className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs flex flex-col items-center gap-1 transition-all border ${
                      isActive
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{f.emoji}</span>
                    <span className="font-bold text-xs">{chord}</span>
                    <span className="text-[9px] text-white/30">{f.n} fingers</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side Panel: Hindi Songs & Strumming Input Builder */}
        <div className="w-[420px] border-l border-white/10 bg-[#0a0a12] flex flex-col h-full overflow-y-auto p-5 space-y-4">
          
          {/* Part 1: 🇮🇳 Hindi Songs Selection & Chords */}
          <div className="bg-[#0e0e18] p-5 rounded-2xl border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Hindi Songs Library
              </h3>
              {selectedHindiSong && (
                <span className="text-[10px] font-mono text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedHindiSong.scale} Scale • {selectedHindiSong.bpm} BPM
                </span>
              )}
            </div>

            {/* Song Chips */}
            <div className="grid grid-cols-2 gap-2">
              {HINDI_SONGS.map(s => {
                const isSelected = selectedHindiSong?.id === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => selectHindiSong(s)}
                    className={`p-2.5 rounded-xl text-left transition-all border flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-white leading-tight">{s.title}</span>
                    <span className="text-[10px] text-white/40">{s.singer}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Part 2: 🎙️ Strumming Input Part */}
          <div className="bg-[#0e0e18] p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Strumming Input Builder
                </h3>
                <p className="text-[10px] text-white/40">Hum rhythm patterns or use custom beat steps</p>
              </div>
              <button
                onClick={() => setIsPlayingPattern(!isPlayingPattern)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPlayingPattern
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {isPlayingPattern ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPlayingPattern ? 'Stop' : 'Play Pattern'}
              </button>
            </div>

            {/* Voice AI Strum Detector with Mic VU Meter */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  Voice AI Strum Detector
                </div>
                <div className="text-[10px] text-white/40">Hum or speak rhythm (e.g. "Down Down Up Up")</div>
                {isVoiceListening && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] text-rose-400 font-mono font-bold">Live Mic:</span>
                    <div className="w-24 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75"
                        style={{ width: `${Math.min(100, Math.max(8, micVolume * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={toggleVoiceStrumDetector}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isVoiceListening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {isVoiceListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-400" />}
                {isVoiceListening ? 'Stop Mic' : 'Hum Strum'}
              </button>
            </div>

            {/* 8-Step Interactive Beat Grid */}
            <div>
              <div className="text-[10px] font-mono text-white/40 uppercase mb-1.5">Interactive Beat Steps (Click to edit):</div>
              <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-black/50 rounded-xl border border-white/5">
                {strumPattern.map((step, idx) => {
                  const isCurrent = isPlayingPattern && currentStepIndex === idx
                  const displayChar = step === 'D' ? '↓' : step === 'U' ? '↑' : step === 'X' ? '✕' : '•'
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleBeatStep(idx)}
                      className={`flex-1 min-w-[38px] h-11 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-sm transition-all border ${
                        isCurrent
                          ? 'bg-purple-500 text-white border-purple-300 shadow-md scale-105'
                          : step === 'X'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : step === 'D' || step === 'U'
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                          : 'bg-white/5 border-white/5 text-white/30'
                      }`}
                    >
                      <span>{displayChar}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Pattern Text Input (with pauses support) */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span className="text-[11px] text-white/50 font-mono w-24">Pattern Text:</span>
              <input
                type="text"
                value={customPatternInput}
                onChange={e => applyCustomPatternText(e.target.value)}
                placeholder="e.g. D - D - U - U - D - U  or  ↓ . ↑ . ↓ ↑"
                className="flex-1 bg-transparent text-xs font-mono text-purple-300 focus:outline-none placeholder-white/20"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
