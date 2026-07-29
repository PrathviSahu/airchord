import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LandingPage from './screens/LandingPage'
import SongSearchScreen from './screens/SongSearchScreen'
import SongSetupScreen, { SessionConfig } from './screens/SongSetupScreen'
import PracticeRoomScreen from './screens/PracticeRoomScreen'
import LivePerformanceScreen from './screens/LivePerformanceScreen'
import { SEED_SONGS, Song } from './utils/songLibrary'

export type AppMode = 'landing' | 'song-search' | 'song-setup' | 'practice' | 'live'

// ── Splash Screen ──────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 bg-[#050508] flex flex-col items-center justify-center z-[9999] select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="text-6xl mb-4 animate-bounce">🎸</div>
        <h1 className="text-2xl font-black tracking-widest text-white uppercase">AIRCHORD</h1>
        <p className="text-xs font-mono text-purple-400 mt-1">AI GUITAR PERFORMANCE STUDIO</p>
      </motion.div>
      <div className="absolute bottom-10 text-[10px] font-mono text-white/30">Loading Audio Engine & 3D Stage...</div>
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [mode, setMode]             = useState<AppMode>('landing')
  const [activeSong, setActiveSong] = useState<Song>(SEED_SONGS[0])
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null)

  // ESC to navigate back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode(prev => {
          if (prev === 'live')        return 'song-setup'
          if (prev === 'practice')    return 'song-setup'
          if (prev === 'song-setup')  return 'song-search'
          if (prev === 'song-search') return 'landing'
          return 'landing'
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderScreen = () => {
    switch (mode) {
      case 'landing':
        return (
          <LandingPage
            onEnter={() => setMode('song-search')}
            onOpenStudio={() => setMode('song-search')}
          />
        )

      case 'song-search':
        return (
          <SongSearchScreen
            onSelectSong={(song) => {
              setActiveSong(song)
              setMode('song-setup')
            }}
            onBack={() => setMode('landing')}
          />
        )

      case 'song-setup':
        return (
          <SongSetupScreen
            song={activeSong}
            onBack={() => setMode('song-search')}
            onStartPlaying={(config) => {
              setSessionConfig(config)
              setMode('live')
            }}
            onPractice={(config) => {
              setSessionConfig(config)
              setMode('practice')
            }}
          />
        )

      case 'practice':
        return sessionConfig ? (
          <PracticeRoomScreen
            config={sessionConfig}
            onBack={() => setMode('song-setup')}
            onStartLive={() => setMode('live')}
          />
        ) : null

      case 'live':
        return sessionConfig ? (
          <LivePerformanceScreen
            config={sessionConfig}
            onEnd={() => setMode('song-setup')}
          />
        ) : null

      default:
        return null
    }
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onDone={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <main className="w-full h-full bg-[#06060a] text-white">
          {renderScreen()}
        </main>
      )}
    </>
  )
}
