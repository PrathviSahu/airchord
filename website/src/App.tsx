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
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-14 h-14 mx-auto mb-7 rounded-[3px] border flex items-center justify-center"
          style={{ borderColor: 'rgba(201,168,76,0.45)', boxShadow: '0 0 40px rgba(201,168,76,0.12)' }}
        >
          <span className="text-xl font-light" style={{ color: 'var(--gold)' }}>A</span>
        </motion.div>

        <h1 className="text-xl font-light text-white uppercase flex justify-center pl-[0.4em]">
          {'AIRCHORD'.split('').map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ letterSpacing: '0.4em' }}
            >
              {c}
            </motion.span>
          ))}
        </h1>

        {/* Gold waveform */}
        <div className="flex items-end justify-center gap-[3px] h-4 mt-5">
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              className="anim-waveform w-[2px] rounded-full"
              style={{
                height: 14,
                background: 'rgba(201,168,76,0.65)',
                animationDelay: `${i * 0.06}s`,
                animationDuration: `${0.6 + (i % 4) * 0.12}s`,
              }}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="text-[10px] font-mono tracking-[0.22em] mt-4 uppercase"
          style={{ color: 'rgba(201,168,76,0.7)' }}
        >
          AI Guitar Performance Studio
        </motion.p>
      </div>
      <div className="absolute bottom-10 text-[9px] font-mono tracking-[0.25em] text-white/25 uppercase">Loading audio engine</div>
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
