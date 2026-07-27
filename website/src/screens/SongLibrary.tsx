import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Heart, X } from 'lucide-react'

const SONGS = [
  { title: 'Perfect', artist: 'Ed Sheeran', key: 'Ab', bpm: 95, genre: 'Pop', diff: 'Easy', chords: ['Ab', 'Cm', 'Fm', 'Db'] },
  { title: 'Wonderwall', artist: 'Oasis', key: 'Em', bpm: 88, genre: 'Rock', diff: 'Easy', chords: ['Em7', 'G', 'Dsus4', 'A7sus4'] },
  { title: 'Let Her Go', artist: 'Passenger', key: 'G', bpm: 72, genre: 'Folk', diff: 'Easy', chords: ['G', 'D', 'Em', 'C'] },
  { title: 'Hotel California', artist: 'Eagles', key: 'Bm', bpm: 75, genre: 'Rock', diff: 'Hard', chords: ['Bm', 'F#', 'A', 'E'] },
  { title: 'Tum Hi Ho', artist: 'Arijit Singh', key: 'Am', bpm: 70, genre: 'Bollywood', diff: 'Easy', chords: ['Am', 'F', 'C', 'G'] },
  { title: 'Shape of You', artist: 'Ed Sheeran', key: 'C#m', bpm: 96, genre: 'Pop', diff: 'Medium', chords: ['C#m', 'F#', 'A', 'B'] },
  { title: 'Stand By Me', artist: 'Ben E. King', key: 'A', bpm: 73, genre: 'Classic', diff: 'Easy', chords: ['A', 'F#m', 'D', 'E'] },
  { title: 'Hallelujah', artist: 'Leonard Cohen', key: 'C', bpm: 65, genre: 'Folk', diff: 'Medium', chords: ['C', 'Am', 'F', 'G'] },
  { title: 'Country Roads', artist: 'John Denver', key: 'G', bpm: 85, genre: 'Country', diff: 'Easy', chords: ['G', 'Em', 'C', 'D'] },
  { title: 'Riptide', artist: 'Vance Joy', key: 'Am', bpm: 100, genre: 'Pop', diff: 'Easy', chords: ['Am', 'G', 'C'] },
]
const GENRES = ['All', 'Pop', 'Rock', 'Folk', 'Bollywood', 'Classic', 'Country']

interface Props { onBack: () => void }

export default function SongLibrary({ onBack }: Props) {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All')
  const [favs, setFavs] = useState(new Set(['Wonderwall', 'Let Her Go']))
  const [sel, setSel] = useState<typeof SONGS[0] | null>(null)

  const filtered = SONGS.filter(s =>
    (genre === 'All' || s.genre === genre) &&
    (!query || s.title.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase()))
  )

  const toggleFav = (t: string) => {
    setFavs(f => { const n = new Set(f); n.has(t) ? n.delete(t) : n.add(t); return n })
  }

  const diffColor = (d: string) => ({ Easy: 'rgba(52,211,153,0.6)', Medium: 'rgba(201,168,76,0.6)', Hard: 'rgba(239,68,68,0.5)' }[d] ?? 'rgba(255,255,255,0.3)')

  return (
    <div className="screen-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <button className="icon-btn" onClick={onBack}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>Song Library</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{filtered.length} songs</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search songs or artists"
            style={{
              width: '100%', padding: '12px 40px', background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
              color: '#fff', fontSize: 14, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} style={{ color: 'rgba(255,255,255,0.3)' }} /></button>}
        </div>

        {/* Genre chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g)} style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 3, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
              border: `1px solid ${genre === g ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
              background: genre === g ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: genre === g ? '#fff' : 'rgba(255,255,255,0.35)',
              fontWeight: genre === g ? 500 : 400,
            }}>{g}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        {filtered.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            onClick={() => setSel(s)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '18px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 4, background: '#0e0e0e',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em',
                flexShrink: 0,
              }}>{s.key}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', marginBottom: 3 }}>{s.title}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{s.artist}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ fontSize: 12, color: diffColor(s.diff) }}>{s.diff}</span>
                </div>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); toggleFav(s.title) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
              <Heart size={15} style={{ color: favs.has(s.title) ? '#EF4444' : 'rgba(255,255,255,0.2)', fill: favs.has(s.title) ? '#EF4444' : 'none' }} />
            </button>
          </motion.button>
        ))}
      </div>

      {/* Song detail bottom sheet */}
      <AnimatePresence>
        {sel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px 12px 0 0', padding: 28 }}
            >
              <div style={{ width: 32, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 28px' }} />
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 4, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{sel.key}</div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>{sel.title}</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sel.artist} · {sel.bpm} BPM</p>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>Chord Progression</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sel.chords.map(c => (
                    <span key={c} style={{ padding: '8px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 15, fontWeight: 300, color: '#fff', letterSpacing: '0.02em' }}>{c}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSel(null)} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>Practice</button>
                <button onClick={() => setSel(null)} style={{ flex: 1, padding: '16px', background: '#fff', borderRadius: 6, color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' }}>Play Along →</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
