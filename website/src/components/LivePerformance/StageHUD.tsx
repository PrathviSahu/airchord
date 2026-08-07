// ── Stage HUD ─────────────────────────────────────────────────────────────────
// Studio monochrome top bar: song info, recording, sing-sync, mute, exit.

import React from 'react'
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
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 z-20"
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.25) 70%, transparent)' }}
    >
      {/* Song info */}
      <div className="studio-glass px-4 py-2 max-w-[150px] sm:max-w-none">
        <p className="studio-label-gold" style={{ fontSize: 8 }}>Now performing</p>
        <p className="text-[13px] font-light text-white truncate mt-0.5">{songTitle}</p>
        <p className="studio-num text-[10px] font-mono text-white/35 truncate">{songArtist} · {bpm} BPM</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mic status */}
        <span
          className="studio-glass hidden sm:flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono"
          style={{ color: micReady ? '#7FBF8E' : 'rgba(255,255,255,0.3)' }}
        >
          <Mic className="w-3 h-3" strokeWidth={1.5} /> {micReady ? 'Mic live' : 'Guitar only'}
        </span>

        {/* Recording */}
        <button
          onClick={onToggleRecording}
          className="studio-btn !py-2 !px-3 sm:!px-4 !text-[10px] sm:!text-[11px]"
          style={isRecording
            ? { background: '#E5484D', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
            : { background: 'rgba(229,72,77,0.12)', color: '#F0A3A6', border: '1px solid rgba(229,72,77,0.45)' }}
        >
          <span className={isRecording ? 'w-2 h-2 bg-white rounded-[1px]' : 'rec-dot'} />
          {isRecording
            ? `Stop · ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
            : 'Record'}
        </button>

        {/* Elapsed */}
        {isPlaying && (
          <div className="studio-glass studio-num px-3 py-2 text-[11px] font-mono text-white/60">
            {Math.floor(elapsedSec / 60)}:{String(Math.floor(elapsedSec % 60)).padStart(2, '0')}
          </div>
        )}

        {/* Sing-sync */}
        <button
          onClick={onToggleVoiceFollower}
          className="studio-btn !py-2 !px-3 !text-[10px]"
          style={voiceFollower
            ? { background: 'rgba(201,168,76,0.14)', color: 'var(--gold-bright)', border: '1px solid rgba(201,168,76,0.5)' }
            : { background: 'rgba(5,5,5,0.55)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${voiceFollower ? 'anim-slow-pulse' : ''}`}
            style={{ background: voiceFollower ? 'var(--gold)' : 'rgba(255,255,255,0.25)' }} />
          Sing-Sync
        </button>

        {/* Background track */}
        <button
          onClick={onToggleYouTube}
          className="studio-icon hidden sm:inline-flex"
          aria-label="Toggle background track"
          style={showYT ? { borderColor: 'rgba(201,168,76,0.5)', color: 'var(--gold-bright)' } : {}}
          title="Open background track"
        >
          <Youtube className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Mute */}
        <button onClick={onToggleMute} className="studio-icon" aria-label={isMuted ? "Unmute guitar" : "Mute guitar"}>
          {isMuted ? <VolumeX className="w-4 h-4" strokeWidth={1.5} /> : <Volume2 className="w-4 h-4" strokeWidth={1.5} />}
        </button>

        {/* Exit */}
        <button onClick={onEnd} className="studio-icon hover:!border-[#E5484D]/60 hover:!text-[#F0A3A6]" aria-label="End performance">
          <span className="text-xs">✕</span>
        </button>
      </div>
    </div>
  )
}
