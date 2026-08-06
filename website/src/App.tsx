import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionConfig } from './screens/SongSetupScreen'
import { SEED_SONGS } from './utils/songLibrary'
import type { Song } from './utils/songLibrary'

// Keep the landing page, camera/MediaPipe practice room, and live recorder out
// of the first JavaScript payload. Each route is loaded only when entered.
const LandingPage = lazy(() => import('./screens/LandingPage'))
const SongSearchScreen = lazy(() => import('./screens/SongSearchScreen'))
const SongSetupScreen = lazy(() => import('./screens/SongSetupScreen'))
const PracticeRoomScreen = lazy(() => import('./screens/PracticeRoomScreen'))
const LivePerformanceScreen = lazy(() => import('./screens/LivePerformanceScreen'))

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
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 border border-purple-500/30 flex items-center justify-center text-2xl text-amber-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          ✨
        </div>
        <h1 className="text-2xl font-black tracking-widest text-white uppercase">AIRCHORD</h1>
        <p className="text-xs font-mono text-purple-400 mt-1">AI GUITAR PERFORMANCE STUDIO</p>
      </motion.div>
      <div className="absolute bottom-10 text-[10px] font-mono text-white/30">Loading Audio Engine & 3D Stage...</div>
    </div>
  )
}

function RouteLoading() {
  return (
    <div className="fixed inset-0 bg-[#06060a] flex items-center justify-center font-mono text-xs text-white/40">
      Loading studio…
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
            onOpenPractice={() => setMode('practice')}
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
        return (
          <PracticeRoomScreen
            config={sessionConfig ?? undefined}
            onBack={() => setMode(sessionConfig ? 'song-setup' : 'landing')}
          />
        )

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
          <Suspense fallback={<RouteLoading />}>
            {renderScreen()}
          </Suspense>
        </main>
      )}
    </>
  )
}
