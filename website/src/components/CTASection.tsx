import { motion } from 'framer-motion'
import { Play, ArrowRight } from 'lucide-react'

interface CTASectionProps {
  onStartStudio?: () => void
}

export default function CTASection({ onStartStudio }: CTASectionProps) {
  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-[40px] p-12 md:p-20">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl text-stone-800 mb-6">
            Ready to<br /><span className="text-amber-700">Play?</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-xl text-stone-500 mb-10 max-w-md mx-auto">
            Join thousands of singers discovering hands-free guitar accompaniment.
          </motion.p>
          <motion.button initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}
            onClick={onStartStudio}
            className="px-10 py-5 bg-amber-700 hover:bg-amber-800 rounded-2xl text-xl font-bold text-white shadow-xl shadow-amber-700/25 transition-colors inline-flex items-center gap-3">
            <Play className="w-6 h-6" fill="white" />
            Start Playing Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <p className="text-sm text-stone-400 mt-6">No credit card required. No guitar needed. Just your hands.</p>
        </motion.div>
      </div>
    </section>
  )
}
