import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Radio,
  Play,
  Pause,
  Sparkles,
  Volume2,
  Moon,
  CloudRain,
  Flame,
  Trees,
  Waves,
  Music,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react'
import { playPluckNote } from '../utils/guitarSound'

interface FingerstyleLoungeProps {
  onBack: () => void
}

interface AmbientTheme {
  id: string
  name: string
  icon: React.ReactNode
  bgGradient: string
  accentColor: string
  desc: string
  arpeggioNotes: string[]
}

const AMBIENT_THEMES: AmbientTheme[] = [
  {
    id: 'night',
    name: 'Night Lounge',
    icon: <Moon className="w-5 h-5" />,
    bgGradient: 'from-[#0b0c16] via-[#101226] to-[#080810]',
    accentColor: 'text-indigo-400',
    desc: 'Mellow evening acoustic fingerstyle arpeggios',
    arpeggioNotes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  },
  {
    id: 'rain',
    name: 'Rainy Evening',
    icon: <CloudRain className="w-5 h-5" />,
    bgGradient: 'from-[#0a121a] via-[#0d1b26] to-[#070b10]',
    accentColor: 'text-sky-400',
    desc: 'Gentle raindrops with soothing 6/8 fingerpicking',
    arpeggioNotes: ['A2', 'E3', 'A3', 'C4', 'E4'],
  },
  {
    id: 'campfire',
    name: 'Campfire',
    icon: <Flame className="w-5 h-5" />,
    bgGradient: 'from-[#1a0e0a] via-[#26140b] to-[#100805]',
    accentColor: 'text-amber-400',
    desc: 'Warm acoustic hearth melodies and folk picking',
    arpeggioNotes: ['G2', 'D3', 'G3', 'B3', 'D4', 'G4'],
  },
  {
    id: 'forest',
    name: 'Forest Whispers',
    icon: <Trees className="w-5 h-5" />,
    bgGradient: 'from-[#0a1a12] via-[#0d261b] to-[#05100a]',
    accentColor: 'text-emerald-400',
    desc: 'Organic wood harmonics and peaceful forest vibes',
    arpeggioNotes: ['E2', 'B2', 'G3', 'B3', 'E4'],
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: <Waves className="w-5 h-5" />,
    bgGradient: 'from-[#08141e] via-[#0b2030] to-[#050b12]',
    accentColor: 'text-cyan-400',
    desc: 'Rhythmic coastal picking patterns',
    arpeggioNotes: ['C3', 'G3', 'C4', 'E4', 'G4'],
  },
  {
    id: 'sunset',
    name: 'Acoustic Sunset',
    icon: <Music className="w-5 h-5" />,
    bgGradient: 'from-[#1a0a14] via-[#260e1d] to-[#10050c]',
    accentColor: 'text-rose-400',
    desc: 'Shimmering 12-string fingerstyle chords',
    arpeggioNotes: ['D3', 'A3', 'D4', 'F#4', 'A4'],
  },
]

export const FingerstyleLounge: React.FC<FingerstyleLoungeProps> = ({ onBack }) => {
  const [subMode, setSubMode] = useState<'relax' | 'learn'>('relax')
  const [activeTheme, setActiveTheme] = useState<AmbientTheme>(AMBIENT_THEMES[0])
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false)
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null)

  // Learn Fingerstyle State
  const [currentPimaStep, setCurrentPimaStep] = useState(0)
  const pimaPattern = [
    { finger: 'P (Thumb)', stringName: 'Bass String (E/A/D)', note: 'E2' },
    { finger: 'I (Index)', stringName: 'G String (3rd)', note: 'G3' },
    { finger: 'M (Middle)', stringName: 'B String (2nd)', note: 'B3' },
    { finger: 'A (Ring)', stringName: 'High E String (1st)', note: 'E4' },
  ]

  // Ambient Audio Player Timer
  useEffect(() => {
    if (isPlayingAmbient) {
      let step = 0
      const interval = setInterval(() => {
        const notes = activeTheme.arpeggioNotes
        const note = notes[step % notes.length]
        setActiveNoteIndex(step % notes.length)
        playPluckNote(note, 0.2)
        step++
      }, 350)
      return () => clearInterval(interval)
    }
  }, [isPlayingAmbient, activeTheme])

  return (
    <div className={`fixed inset-0 z-[200] bg-gradient-to-br ${activeTheme.bgGradient} text-white flex flex-col justify-between p-8 select-none font-sans overflow-y-auto transition-all duration-700`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
              FINGERSTYLE EXPERIENCE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                P-I-M-A AUDIO
              </span>
            </h1>
            <p className="text-[11px] text-white/40">Guided Finger Picking Lessons & Ambient Relax Lounge</p>
          </div>
        </div>

        {/* Sub-Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setSubMode('relax')
              setIsPlayingAmbient(false)
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subMode === 'relax'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Relax & Listen
          </button>

          <button
            onClick={() => {
              setSubMode('learn')
              setIsPlayingAmbient(false)
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subMode === 'learn'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Learn Fingerstyle
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="my-auto py-8 max-w-5xl mx-auto w-full">
        {subMode === 'relax' ? (
          /* RELAX & LISTEN SUB-MODE */
          <div className="space-y-8 text-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-rose-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                No Camera Required — Pure Acoustic Relaxation
              </div>
              <h2 className="text-4xl font-black text-white mb-2">Fingerstyle Ambient Lounge</h2>
              <p className="text-xs text-white/50 max-w-md mx-auto">
                Sit back, close your eyes, and enjoy continuous guitar arpeggio soundscapes.
              </p>
            </div>

            {/* Theme Selectors Grid */}
            <div className="grid grid-cols-3 gap-4">
              {AMBIENT_THEMES.map(t => {
                const isSelected = activeTheme.id === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTheme(t)
                      setIsPlayingAmbient(true)
                    }}
                    className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white/10 border-white/40 shadow-2xl scale-105'
                        : 'bg-black/30 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-2xl bg-white/10 ${t.accentColor}`}>
                        {t.icon}
                      </div>
                      {isSelected && isPlayingAmbient && (
                        <span className="flex gap-1 items-end h-4">
                          <span className="w-1 bg-rose-400 animate-pulse h-full rounded" />
                          <span className="w-1 bg-amber-400 animate-pulse h-2/3 rounded" />
                          <span className="w-1 bg-emerald-400 animate-pulse h-1/2 rounded" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{t.name}</h3>
                      <p className="text-[11px] text-white/40 leading-relaxed">{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Play/Pause Main Control */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setIsPlayingAmbient(!isPlayingAmbient)}
                className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all shadow-2xl ${
                  isPlayingAmbient
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/40 scale-105'
                    : 'bg-white text-black hover:bg-white/90 shadow-white/20'
                }`}
              >
                {isPlayingAmbient ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isPlayingAmbient ? 'Pause Ambient Lounge' : 'Play Ambient Lounge'}
              </button>
            </div>
          </div>
        ) : (
          /* LEARN FINGERSTYLE SUB-MODE */
          <div className="space-y-8 max-w-2xl mx-auto text-center">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Learn P-I-M-A Finger Picking</h2>
              <p className="text-xs text-white/50">
                Master classical & folk guitar picking: P (Thumb), I (Index), M (Middle), A (Ring).
              </p>
            </div>

            {/* Active Finger Picking Guide */}
            <div className="bg-black/50 border border-white/10 p-8 rounded-3xl space-y-6">
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Step {currentPimaStep + 1} of {pimaPattern.length}
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
                <div className="text-2xl font-black text-white">{pimaPattern[currentPimaStep].finger}</div>
                <div className="text-xs text-amber-300 font-mono">Target: {pimaPattern[currentPimaStep].stringName}</div>
              </div>

              <button
                onClick={() => {
                  playPluckNote(pimaPattern[currentPimaStep].note, 0.25)
                  setCurrentPimaStep(prev => (prev + 1) % pimaPattern.length)
                }}
                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/30"
              >
                Pluck & Next Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-white/40">
        <span>Theme: {activeTheme.name}</span>
        <span>P-I-M-A Audio Engine Ready</span>
      </div>
    </div>
  )
}
