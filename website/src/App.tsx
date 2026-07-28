import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LandingPage from './screens/LandingPage'
import { SessionLauncher } from './components/SessionLauncher'
import { StudioPerformance } from './components/StudioPerformance'
import { PracticeMode } from './components/PracticeMode'
import { FingerstyleLounge } from './components/FingerstyleLounge'
import { SongLibraryModal } from './components/SongLibraryModal'
import { ProfileEditorModal } from './components/ProfileEditorModal'
import Studio from './components/Studio'
import { SEED_SONGS, Song } from './utils/songLibrary'
import { PRESET_GESTURE_PROFILES, GestureProfile } from './utils/GestureProfiles'

export type AppMode =
  | 'landing'
  | 'launcher'
  | 'studio'
  | 'practice'
  | 'freeplay'
  | 'fingerstyle'
  | 'library'
  | 'profiles'

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
  const [mode, setMode] = useState<AppMode>('landing')

  // Global Session State
  const [activeSong, setActiveSong] = useState<Song>(SEED_SONGS[0]) // Default: Perfect
  const [activeProfile, setActiveProfile] = useState<GestureProfile>(PRESET_GESTURE_PROFILES[0]) // Default: Beginner

  // Keyboard shortcut: ESC returns to Session Launcher or Landing Page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode(prev => (prev === 'launcher' ? 'landing' : 'launcher'))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderActiveMode = () => {
    switch (mode) {
      case 'landing':
        return (
          <LandingPage
            onEnter={() => setMode('launcher')}
            onOpenStudio={() => setMode('launcher')}
          />
        )

      case 'launcher':
        return (
          <SessionLauncher
            onSelectMode={(selected) => setMode(selected)}
            activeSongTitle={`${activeSong.title} (${activeSong.artist})`}
            activeProfileName={activeProfile.name}
          />
        )

      case 'studio':
        return (
          <StudioPerformance
            song={activeSong}
            mapping={activeSong.fingerMapping || activeProfile.mapping}
            onBack={() => setMode('launcher')}
          />
        )

      case 'practice':
        return (
          <PracticeMode
            song={activeSong}
            mapping={activeSong.fingerMapping || activeProfile.mapping}
            onBack={() => setMode('launcher')}
          />
        )

      case 'freeplay':
        return <Studio onBack={() => setMode('launcher')} />

      case 'fingerstyle':
        return <FingerstyleLounge onBack={() => setMode('launcher')} />

      case 'library':
        return (
          <SongLibraryModal
            activeSong={activeSong}
            onSelectSong={(song) => setActiveSong(song)}
            onBack={() => setMode('launcher')}
          />
        )

      case 'profiles':
        return (
          <ProfileEditorModal
            activeProfile={activeProfile}
            onSelectProfile={(profile) => setActiveProfile(profile)}
            onUpdateMapping={(mapping) =>
              setActiveProfile(prev => ({ ...prev, mapping }))
            }
            onBack={() => setMode('launcher')}
          />
        )

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
          {renderActiveMode()}
        </main>
      )}
    </>
  )
}
