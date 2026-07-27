import { motion } from 'framer-motion'
import { Music, Guitar } from 'lucide-react'

interface NavigationProps {
  onStartStudio?: () => void
}

export default function Navigation({ onStartStudio }: NavigationProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-white/80 backdrop-blur-xl border-b border-amber-100/50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-600/20">
            <Guitar className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-2xl text-amber-900">AirChord</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-stone-500 hover:text-amber-800 transition-colors font-medium">How It Works</a>
          <a href="#guitars" className="text-sm text-stone-500 hover:text-amber-800 transition-colors font-medium">Guitars</a>
          <a href="#profiles" className="text-sm text-stone-500 hover:text-amber-800 transition-colors font-medium">Profiles</a>
          <a href="#features" className="text-sm text-stone-500 hover:text-amber-800 transition-colors font-medium">Features</a>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartStudio}
          className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 rounded-full text-sm font-semibold text-white shadow-lg shadow-amber-700/25 transition-colors flex items-center gap-2"
        >
          <Music className="w-4 h-4" />
          Open Studio
        </motion.button>
      </div>
    </motion.nav>
  )
}
