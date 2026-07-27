import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROFILES = [
  { id: 'classic', name: 'Classic', desc: 'Standard guitar chords for pop, rock, and folk.', genres: ['Pop', 'Rock', 'Folk'], chords: ['Em', 'Am', 'G', 'C', 'D', 'F'], emoji: '🎵' },
  { id: 'worship', name: 'Worship', desc: 'Common worship song chords for CCM and gospel.', genres: ['Worship', 'CCM', 'Gospel'], chords: ['Am', 'C', 'G', 'Em', 'F', 'D'], emoji: '🙏' },
  { id: 'bollywood', name: 'Bollywood', desc: 'Popular Hindi song chords for Indian pop.', genres: ['Bollywood', 'Indian Pop'], chords: ['Am', 'C', 'G', 'F', 'Em', 'D'], emoji: '🎬' },
  { id: 'blues', name: 'Blues', desc: '12-bar blues chords for blues and rock.', genres: ['Blues', 'Rock', 'Jazz'], chords: ['E', 'A', 'B7', 'Am', 'D', 'G'], emoji: '🎷' },
]

const FINGERS = [
  { n: 0, emoji: '✊', label: 'Fist' },
  { n: 1, emoji: '☝️', label: 'One' },
  { n: 2, emoji: '✌️', label: 'Two' },
  { n: 3, emoji: '🤟', label: 'Three' },
  { n: 4, emoji: '🖐️', label: 'Four' },
  { n: 5, emoji: '✋', label: 'Palm' },
]

export default function ProfilesSection() {
  const [sel, setSel] = useState('classic')
  const p = PROFILES.find(x => x.id === sel)!

  return (
    <section id="profiles" className="py-32 px-6 bg-white">
      <div className="text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-sm font-mono text-amber-600 uppercase tracking-[4px] mb-4">Gesture Profiles</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-heading text-5xl md:text-6xl lg:text-7xl text-stone-800">
          One Gesture.<br /><span className="text-amber-700">Different Chords.</span>
        </motion.h2>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {PROFILES.map(p => (
            <motion.button key={p.id} onClick={() => setSel(p.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${sel === p.id ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/20' : 'bg-amber-50 text-stone-600 border border-amber-200 hover:border-amber-400'}`}>
              <span className="mr-2">{p.emoji}</span>{p.name}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-[#FAFAF8] border border-amber-100 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className="font-heading text-3xl text-stone-800 mb-3">{p.name} Profile</h3>
                <p className="text-stone-500 leading-relaxed mb-6">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.genres.map(g => <span key={g} className="px-4 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{g}</span>)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-mono text-stone-400 uppercase tracking-wider mb-4">Gesture → Chord</h4>
                <div className="grid grid-cols-2 gap-3">
                  {FINGERS.map((f, i) => (
                    <motion.div key={f.n} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-amber-100">
                      <span className="text-2xl">{f.emoji}</span>
                      <div>
                        <div className="text-xs text-stone-400">{f.label}</div>
                        <div className="font-heading text-lg text-amber-700">{p.chords[i]}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
