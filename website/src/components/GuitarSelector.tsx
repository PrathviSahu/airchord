import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GUITARS = [
  { id: 'acoustic', name: 'Acoustic', tagline: 'Warm & Natural', desc: 'Classic acoustic with rich, natural tones.', emoji: '🎸', color: '#8B5E3C', gradient: 'from-amber-600 to-amber-800', strings: 6, tuning: 'E A D G B E', genres: ['Folk', 'Pop', 'Country'] },
  { id: 'electric', name: 'Electric', tagline: 'Bold & Powerful', desc: 'Amplified tones with effects. Ideal for rock and blues.', emoji: '🎸', color: '#6B21A8', gradient: 'from-purple-600 to-purple-800', strings: 6, tuning: 'E A D G B E', genres: ['Rock', 'Blues', 'Metal'] },
  { id: 'bass', name: 'Bass', tagline: 'Deep & Groovy', desc: 'Low-end depth. The foundation of any rhythm section.', emoji: '🎸', color: '#1E40AF', gradient: 'from-blue-600 to-blue-800', strings: 4, tuning: 'E A D G', genres: ['Funk', 'Jazz', 'R&B'] },
  { id: 'ukulele', name: 'Ukulele', tagline: 'Light & Playful', desc: 'Bright, cheerful tones. Great for beginners.', emoji: '🪕', color: '#B45309', gradient: 'from-yellow-600 to-orange-600', strings: 4, tuning: 'G C E A', genres: ['Hawaiian', 'Pop', 'Indie'] },
]

export default function GuitarSelector() {
  const [selected, setSelected] = useState(0)
  const g = GUITARS[selected]

  return (
    <section id="guitars" className="py-32 px-6 bg-[#FAFAF8]">
      <div className="text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-sm font-mono text-amber-600 uppercase tracking-[4px] mb-4">Choose Your Instrument</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="font-heading text-5xl md:text-6xl lg:text-7xl text-stone-800">Multiple Guitars.<br /><span className="text-amber-700">One App.</span></motion.h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative flex items-center justify-center min-h-[420px]">
          <div className="absolute w-72 h-72 rounded-full blur-[80px] opacity-25 transition-colors duration-700" style={{ background: g.color }} />
          <AnimatePresence mode="wait">
            <motion.div key={g.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.4 }} className={`w-56 h-72 rounded-[100px_100px_80px_80px] bg-gradient-to-br ${g.gradient} relative shadow-2xl`}>
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-[3px] border-white/20 bg-black/30" />
              <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20" />
              <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex gap-1 h-[65%]">
                {Array.from({ length: g.strings }).map((_, i) => <div key={i} className="w-[1.5px] bg-white/35" />)}
              </div>
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-9 h-32 rounded-t-md bg-gradient-to-b from-amber-900 to-amber-800">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="absolute w-full h-[1px] bg-white/25" style={{ top: `${18 + i * 15}%` }} />)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          {GUITARS.map((guitar, i) => (
            <motion.button key={guitar.id} onClick={() => setSelected(i)} whileHover={{ x: 6 }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${selected === i ? 'bg-white border-amber-300 shadow-lg shadow-amber-100/50' : 'bg-white/50 border-amber-100 hover:border-amber-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${guitar.gradient} flex items-center justify-center text-xl`}>{guitar.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-lg text-stone-800">{guitar.name}</h3>
                    <span className="text-xs font-mono text-stone-400">{guitar.strings} strings</span>
                  </div>
                  <p className="text-sm text-stone-500">{guitar.tagline}</p>
                </div>
                {selected === i && <motion.div layoutId="guitar-dot" className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
              </div>
              <AnimatePresence>
                {selected === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="pt-3 mt-3 border-t border-amber-100">
                      <p className="text-sm text-stone-500 mb-2">{guitar.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {guitar.genres.map(g => <span key={g} className="px-2.5 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">{g}</span>)}
                      </div>
                      <div className="text-xs font-mono text-stone-400">Tuning: {guitar.tuning}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
