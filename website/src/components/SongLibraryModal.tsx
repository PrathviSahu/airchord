import React, { useState } from 'react'
import { ArrowLeft, Search, BookOpen, Music, Check, Sparkles } from 'lucide-react'
import { Song, SEED_SONGS, SONG_COLLECTIONS } from '../utils/songLibrary'

interface SongLibraryModalProps {
  activeSong: Song
  onSelectSong: (song: Song) => void
  onBack: () => void
}

export const SongLibraryModal: React.FC<SongLibraryModalProps> = ({
  activeSong,
  onSelectSong,
  onBack,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredSongs = SEED_SONGS.filter(song => {
    const matchesCollection =
      selectedCollection === 'All' || song.collections.includes(selectedCollection)
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCollection && matchesSearch
  })

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
              SONG LIBRARY
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                CATALOG
              </span>
            </h1>
            <p className="text-[11px] text-white/40">Extensible catalog across collections and genres</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search songs or artists..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 placeholder-white/30"
          />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col py-6 overflow-hidden space-y-6">
        {/* Collections Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
          {SONG_COLLECTIONS.map(col => {
            const isSelected = selectedCollection === col
            return (
              <button
                key={col}
                onClick={() => setSelectedCollection(col)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-sky-500 text-black border-sky-400 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {col}
              </button>
            )
          })}
        </div>

        {/* Songs Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4">
          {filteredSongs.map(s => {
            const isSelected = activeSong.id === s.id
            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSong(s)
                  onBack()
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-xl shadow-sky-500/10'
                    : 'bg-[#0e0e18] border-white/10 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-sky-300 font-bold uppercase px-2 py-0.5 bg-sky-500/10 rounded border border-sky-500/20">
                      {s.difficulty}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                  <h3 className="text-base font-bold text-white mb-0.5">{s.title}</h3>
                  <p className="text-xs text-white/40 mb-3">{s.artist}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/50">
                  <span>{s.key} • {s.bpm} BPM</span>
                  <span className="text-amber-300">{s.displayPattern}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
