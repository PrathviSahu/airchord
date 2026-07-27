import React, { useState } from 'react'
import { ArrowLeft, Sliders, Check, RotateCcw } from 'lucide-react'
import { GestureProfile, PRESET_GESTURE_PROFILES } from '../utils/gestureProfiles'

interface ProfileEditorModalProps {
  activeProfile: GestureProfile
  onSelectProfile: (profile: GestureProfile) => void
  onUpdateMapping: (mapping: string[]) => void
  onBack: () => void
}

const ALL_CHORDS = ['Em', 'Am', 'D', 'C', 'G', 'B7', 'E', 'A', 'F', 'Dm', 'Bm', 'F#m', 'F#7']

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  activeProfile,
  onSelectProfile,
  onUpdateMapping,
  onBack,
}) => {
  const [currentMapping, setCurrentMapping] = useState<string[]>([...activeProfile.mapping])

  const handleChordChange = (index: number, chord: string) => {
    const updated = [...currentMapping]
    updated[index] = chord
    setCurrentMapping(updated)
    onUpdateMapping(updated)
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#06060a] text-white flex flex-col p-8 select-none font-sans overflow-hidden">
      {/* Top Bar */}
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
              GESTURE PROFILES
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CONFIGURATOR
              </span>
            </h1>
            <p className="text-[11px] text-white/40">Assign any chord to any supported finger gesture</p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex gap-8 py-6 overflow-hidden">
        {/* Left Side: Preset Profiles Selectors */}
        <div className="w-80 space-y-3 bg-[#0d0d16] p-5 rounded-3xl border border-white/10">
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Preset Profiles</h3>
          {PRESET_GESTURE_PROFILES.map(p => {
            const isSelected = activeProfile.id === p.id
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProfile(p)
                  setCurrentMapping([...p.mapping])
                  onUpdateMapping([...p.mapping])
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-400 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{p.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[10px] text-white/40 leading-snug">{p.description}</p>
              </button>
            )
          })}
        </div>

        {/* Right Side: Interactive Finger Mapping Selectors */}
        <div className="flex-1 bg-[#0d0d16] p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {activeProfile.name} — Finger-to-Chord Assignments
            </h3>

            <div className="space-y-3">
              {['✊ 0 Fingers (Fist)', '☝️ 1 Finger (Index)', '✌️ 2 Fingers (Peace)', '🤟 3 Fingers (Three)', '🖐️ 4 Fingers (Four)', '🖐️ 5 Fingers (Full Hand)'].map((label, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-medium text-white">{label}</span>
                  <select
                    value={currentMapping[idx] || 'Em'}
                    onChange={e => handleChordChange(idx, e.target.value)}
                    className="bg-[#141424] border border-white/20 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {ALL_CHORDS.map(c => (
                      <option key={c} value={c} className="bg-[#0e0e18] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            Save & Return to Launcher
          </button>
        </div>
      </div>
    </div>
  )
}
