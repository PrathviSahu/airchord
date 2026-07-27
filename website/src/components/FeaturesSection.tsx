import { motion } from 'framer-motion'
import { Zap, Music, Mic, Smartphone, Brain, Gauge } from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: '<50ms Latency', desc: 'Real-time gesture detection with industry-leading response time.', color: '#B45309' },
  { icon: Music, title: '10+ Chords', desc: 'Em, Am, G, C, D, F, E, A, Dm, B7 — realistic Karplus-Strong synthesis.', color: '#7C3AED' },
  { icon: Mic, title: 'Dynamic Band', desc: 'Accompaniment responds to your voice intensity. Sing soft, play soft.', color: '#DB2777' },
  { icon: Smartphone, title: 'Mobile Ready', desc: 'Works on any device with a camera. No special hardware needed.', color: '#0891B2' },
  { icon: Brain, title: 'AI Practice Coach', desc: 'Real-time feedback on your technique with personalized improvement tips.', color: '#059669' },
  { icon: Gauge, title: '60fps Tracking', desc: 'Buttery smooth hand tracking with 21-landmark detection.', color: '#D97706' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 bg-[#FAFAF8]">
      <div className="text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-sm font-mono text-amber-600 uppercase tracking-[4px] mb-4">Built for Musicians</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-heading text-5xl md:text-6xl lg:text-7xl text-stone-800">
          Every Feature<br /><span className="text-amber-700">Performs.</span>
        </motion.h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
            className="bg-white border border-amber-100 rounded-3xl p-8 cursor-pointer group hover:shadow-xl hover:shadow-amber-100/50 transition-all">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${f.color}12` }}>
              <f.icon className="w-7 h-7" style={{ color: f.color }} />
            </div>
            <h3 className="font-heading text-xl text-stone-800 mb-3">{f.title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
