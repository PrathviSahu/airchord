// ── Stage HUD ─────────────────────────────────────────────────────────────────
// Owns: top bar with song info, controls, recording, mute, elapsed timer

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Youtube, Mic } from 'lucide-react'

interface StageHUDProps {
  songTitle: string
  songArtist: string
  bpm: number
  isPlaying: boolean
  isMuted: boolean
  micReady: boolean
  elapsedSec: number
  isRecording: boolean
  recordingTime: number
  showYT: boolean
  voiceFollower: boolean
  onToggleMute: () => void
  onToggleRecording: () => void
  onToggleVoiceFollower: () => void
  onToggleYouTube: () => void
  onEnd: () => void
}

export function StageHUD({
  songTitle,
  songArtist,
  bpm,
  isPlaying,
  isMuted,
  micReady,
  elapsedSec,
  isRecording,
  recordingTime,
  showYT,
  voiceFollower,
  onToggleMute,
  onToggleRecording,
  onToggleVoiceFollower,
  onToggleYouTube,
  onEnd,
}: StageHUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4 z-20 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
      {/* Song info */}
      <div className="bg-black/50 backdrop-blur-xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-white/10 max-w-[140px] sm:max-w-none">
        <p className="text-xs font-black text-white truncate">{songTitle}</p>
        <p className="text-[9px] sm:text-[10px] text-white/40 font-mono truncate">{songArtist} · {bpm} BPM</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-mono ${micReady ? 'text-emerald-300' : 'text-white/35'}`}>
          <Mic className="w-3 h-3" /> {micReady ? 'Mic on' : 'Guitar only'}
        </span>

        {/* Recording button */}
        {!isRecording ? (
          <button
            onClick={onToggleRecording}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 backdrop-blur-xl transition-all text-xs font-bold shadow-lg shadow-red-600/20"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="hidden sm:inline">Record 🔴</span>
            <span className="sm:hidden text-[11px]">Rec 🔴</span>
          </button>
        ) : (
          <button
            onClick={onToggleRecording}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-600 border border-red-400 text-white font-bold backdrop-blur-xl transition-all text-xs shadow-lg shadow-red-600/40 animate-pulse"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-white" />
            <span>Stop ({Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')})</span>
          </button>
        )}

        {/* Elapsed timer */}
        {isPlaying && (
          <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-xs font-mono text-white/70">
            ⏱️ {Math.floor(elapsedSec / 60)}:{String(Math.floor(elapsedSec % 60)).padStart(2, '0')}
          </div>
        )}

        {/* Voice follower toggle */}
        <button
          onClick={onToggleVoiceFollower}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-xs font-bold ${
            voiceFollower
              ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-200 animate-pulse'
              : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-black/60'
          }`}
        >
          <span>🎤</span>
          <span>{voiceFollower ? 'Sing-Sync ON' : 'Sing-Sync OFF'}</span>
        </button>

        {/* YouTube toggle */}
        <button
          onClick={onToggleYouTube}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-xs font-bold ${
            showYT
              ? 'bg-red-600/40 border-red-400/50 text-red-200'
              : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-black/60'
          }`}
        >
          <Youtube className="w-3.5 h-3.5" />
          {showYT ? 'Close BG' : 'BG Song 🎧'}
        </button>

        {/* Mute */}
        <button
          onClick={onToggleMute}
          className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Exit */}
        <button
          onClick={onEnd}
          className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
