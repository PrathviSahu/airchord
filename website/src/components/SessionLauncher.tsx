import React, { useState } from 'react'
import {
  Play,
  Target,
  Music,
  Radio,
  BookOpen,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Disc,
  Search,
  Check,
  X,
} from 'lucide-react'
import { SEED_SONGS, Song } from '../utils/songLibrary'

interface SessionLauncherProps {
  onSelectMode: (mode: 'studio' | 'practice' | 'freeplay' | 'fingerstyle' | 'library' | 'profiles') => void
  onSelectSong?: (song: Song) => void
  activeSongTitle?: string
  activeProfileName?: string
  activeSong?: Song
}

export const SessionLauncher: React.FC<SessionLauncherProps> = ({
  onSelectMode,
  onSelectSong,
  activeSongTitle = 'Perfect (Ed Sheeran)',
  activeProfileName = 'Beginner',
  activeSong = SEED_SONGS[0],
}) => {
  const [songPickerMode, setSongPickerMode] = useState<'studio' | 'practice' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLaunchMode = (mode: 'studio' | 'practice') => {
    setSongPickerMode(mode)
  }

  const handleChooseSongAndLaunch = (song: Song) => {
    if (onSelectSong) {
      onSelectSong(song)
    }
    if (songPickerMode) {
      onSelectMode(songPickerMode)
      setSongPickerMode(null)
    }
  }

  const filteredSongs = SEED_SONGS.filter(
    s =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <div className="fixed inset-0 z-[150] bg-[#06060a] text-white flex flex-col justify-between p-8 select-none font-sans overflow-y-auto">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <Disc className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              AIRCHORD
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO STUDIO
              </span>
            </h1>
            <p className="text-xs text-white/40">AI Guitar Performance & Music Ecosystem</p>
          </div>
        </div>

        {/* Selected Config Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/40">Song:</span>
            <span className="text-white font-semibold">{activeSongTitle}</span>
          </div>
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-white/40">Profile:</span>
            <span className="text-white font-semibold">{activeProfileName}</span>
          </div>
        </div>
      </div>

      {/* Main Mode Selection Prompt */}
      <div className="relative z-10 max-w-6xl mx-auto my-auto py-8 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Select Your Session Experience
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">What would you like to do today?</h2>
          <p className="text-sm text-white/40 max-w-lg mx-auto">
            Choose a dedicated workflow for performing complete songs, practicing chords, jamming freely, or relaxing to ambient fingerstyle.
          </p>
        </div>

        {/* 6 Primary Cards Grid */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Card 1: Studio Performance */}
          <div
            onClick={() => handleLaunchMode('studio')}
            className="group relative bg-[#0d0d16] hover:bg-[#12121f] border border-purple-500/30 hover:border-purple-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Studio Performance
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500 text-black">HOT</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Practice and record complete songs with live lyrics teleprompter, 3D animated guitar, and non-stop timeline flow.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-semibold text-purple-400">
              <span>Select Song & Play</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Practice Mode */}
          <div
            onClick={() => handleLaunchMode('practice')}
            className="group relative bg-[#0d0d16] hover:bg-[#12121f] border border-amber-500/30 hover:border-amber-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                Practice Mode
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Learn chords and timing step-by-step. Timeline pauses on mistakes until you hit the right chord. Generates score reports!
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-semibold text-amber-400">
              <span>Enter Practice</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Free Play */}
          <div
            onClick={() => onSelectMode('freeplay')}
            className="group relative bg-[#0d0d16] hover:bg-[#12121f] border border-white/10 hover:border-emerald-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                Free Play
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Play anything freely with your own gesture mappings, virtual 6-string fretboard, and custom voice strumming builder.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-semibold text-emerald-400">
              <span>Open Jam Session</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Fingerstyle Experience */}
          <div
            onClick={() => onSelectMode('fingerstyle')}
            className="group relative bg-[#0d0d16] hover:bg-[#12121f] border border-white/10 hover:border-rose-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-rose-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 mb-4 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                  Fingerstyle Experience
                </h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Learn finger picking patterns (P-I-M-A) or sit back and relax to continuous ambient acoustic guitar lounge audio.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-semibold text-rose-400">
              <span>Learn & Relax</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Song Library */}
          <div
            onClick={() => onSelectMode('library')}
            className="group relative bg-[#0d0d16] hover:bg-[#12121f] border border-white/10 hover:border-sky-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-1">
                Song Library
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Browse hundreds of songs across collections (Hindi, English, Pop, Rock, Campfire, Worship, Beginner).
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-semibold text-sky-400">
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Gesture Profiles */}
          <div
            onClick={() => onSelectMode('profiles')}
            className="group relative bg-[#0d0d16] hover:bg-[#12121f] border border-white/10 hover:border-purple-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-1">
                Gesture Profiles
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Configure your finger-to-chord mappings. Switch between Beginner, Pop, Rock, Worship, and Custom presets.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-semibold text-purple-400">
              <span>Configure Profiles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/10 text-xs text-white/40 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-time Audio Synthesis & MediaPipe AI Gesture Engine Active</span>
        </div>
        <div>
          <span>Press ESC anytime to return to Launcher</span>
        </div>
      </div>

      {/* Interactive "Which Song Would You Like to Play?" Modal */}
      {songPickerMode && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0e0e18] border border-white/15 rounded-3xl p-8 max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">
                    Which song would you like to play?
                  </h2>
                  <p className="text-xs text-white/40 font-mono">
                    Select a song catalog track for {songPickerMode === 'studio' ? 'Studio Performance' : 'Practice Mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSongPickerMode(null)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search song title or artist..."
                className="w-full bg-white/5 border border-white/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Song Cards Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredSongs.map(song => {
                const isCurrentActive = activeSong.id === song.id
                return (
                  <div
                    key={song.id}
                    onClick={() => handleChooseSongAndLaunch(song)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isCurrentActive
                        ? 'bg-purple-600/20 border-purple-400 text-white shadow-lg shadow-purple-600/10'
                        : 'bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-amber-400 font-black font-mono text-base">
                        🎸
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white group-hover:text-purple-300 transition-colors">
                          {song.title}
                        </div>
                        <div className="text-xs text-white/40 font-mono">
                          {song.artist} • {song.key} • {song.bpm} BPM • Capo {song.capo}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {song.chords.map(c => (
                            <span key={c} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono text-amber-300 font-bold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md group-hover:scale-105 transition-all">
                      Play This Song
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
