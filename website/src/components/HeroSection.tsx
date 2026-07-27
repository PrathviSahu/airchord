import { motion } from 'framer-motion'
import { ChevronDown, Play } from 'lucide-react'

interface HeroSectionProps {
  onStartStudio?: () => void
}

export default function HeroSection({ onStartStudio }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-gradient-to-b from-[#FAFAF8] via-[#F5F0EB] to-[#FAFAF8]">
      {/* Warm ambient circles */}
      <div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 -top-40 -left-40 bg-amber-200" />
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 -bottom-20 -right-20 bg-orange-200" />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-center gap-2 px-5 py-2 rounded-full border border-amber-200 bg-amber-50 mb-8"
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-amber-700 tracking-wider uppercase">Now in Beta</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="font-heading text-6xl md:text-8xl lg:text-9xl text-center leading-[0.95] mb-6"
      >
        <span className="block text-stone-800">Turn Your</span>
        <span className="block bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 bg-clip-text text-transparent">
          Hand Into Music
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-lg md:text-xl text-stone-500 text-center max-w-xl leading-relaxed mb-10"
      >
        AI-powered hand tracking transforms your gestures into realistic guitar chords.
        No guitar needed — just your hands and your voice.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartStudio}
          className="px-8 py-4 bg-amber-700 hover:bg-amber-800 rounded-2xl text-lg font-semibold text-white shadow-xl shadow-amber-700/25 transition-colors flex items-center gap-3"
        >
          <Play className="w-5 h-5" fill="white" />
          Start Playing Free
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-white rounded-2xl text-lg font-medium text-stone-700 border border-amber-200 hover:border-amber-400 shadow-sm transition-colors"
        >
          Watch Demo
        </motion.button>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 flex flex-col items-center gap-3"
      >
        <span className="text-xs text-stone-400 uppercase tracking-[3px]">Scroll to explore</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5 text-stone-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}
