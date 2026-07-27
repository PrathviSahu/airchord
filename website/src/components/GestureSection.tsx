import { motion } from 'framer-motion'

const GESTURES = [
  { fingers: 0, emoji: '✊', chord: 'Em', label: 'Fist' },
  { fingers: 1, emoji: '☝️', chord: 'Am', label: 'One Finger' },
  { fingers: 2, emoji: '✌️', chord: 'G', label: 'Two Fingers' },
  { fingers: 3, emoji: '🤟', chord: 'C', label: 'Three Fingers' },
  { fingers: 4, emoji: '🖐️', chord: 'D', label: 'Four Fingers' },
  { fingers: 5, emoji: '✋', chord: 'F', label: 'Open Palm' },
]

export default function GestureSection() {
  return (
    <section className="py-32 px-6 bg-white" id="gestures">
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-mono text-amber-600 uppercase tracking-[4px] mb-4"
        >
          How It Works
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-heading text-5xl md:text-6xl lg:text-7xl text-stone-800"
        >
          Simple Gestures.<br />
          <span className="text-amber-700">Live Guitar.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-stone-500 mt-4 max-w-lg mx-auto"
        >
          Show your hand to the camera. Each finger count plays a different chord.
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
        {GESTURES.map((g, i) => (
          <motion.div
            key={g.fingers}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139,94,60,0.12)' }}
            className="bg-[#FAFAF8] border border-amber-100 rounded-3xl p-8 text-center cursor-pointer transition-all"
          >
            <div className="text-5xl mb-4">{g.emoji}</div>
            <h3 className="font-heading text-lg text-stone-700 mb-1">{g.label}</h3>
            <div className="font-heading text-3xl text-amber-700 mb-2">{g.chord}</div>
            <div className="text-xs font-mono text-stone-400 uppercase tracking-wider">
              {g.fingers} finger{g.fingers !== 1 ? 's' : ''}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
