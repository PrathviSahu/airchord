import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Screen } from '../App'
import { Settings, User, Music, BookOpen, Mic, Home, Target, Clock, TrendingUp, ChevronRight } from 'lucide-react'

const MODES = [
  { id: 'freeplay' as Screen, label: 'Free Play', sub: 'Play any chord freely', icon: '𝄞' },
  { id: 'practice' as Screen, label: 'Practice', sub: 'AI-guided sessions', icon: '◎' },
  { id: 'recording' as Screen, label: 'Recording', sub: 'Capture your performance', icon: '⏺' },
  { id: 'library' as Screen, label: 'Song Library', sub: '50+ songs with chords', icon: '≡' },
]

const NAV = [
  { id: 'home' as Screen, icon: Home, label: 'Home' },
  { id: 'freeplay' as Screen, icon: Music, label: 'Play' },
  { id: 'recording' as Screen, icon: Mic, label: 'Record' },
  { id: 'library' as Screen, icon: BookOpen, label: 'Library' },
  { id: 'profile' as Screen, icon: User, label: 'Me' },
]

const RECENT = [
  { title: 'Perfect', artist: 'Ed Sheeran', score: 82, time: '14m ago', chords: ['Ab', 'Cm', 'Fm'] },
  { title: 'Wonderwall', artist: 'Oasis', score: 91, time: 'Yesterday', chords: ['Em', 'G', 'D'] },
  { title: 'Free Play', artist: 'Open session', score: 77, time: '2 days ago', chords: ['G', 'C', 'D'] },
]

interface Props { onNavigate: (s: Screen) => void }

export default function HomeDashboard({ onNavigate }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'

  return (
    <div className="screen-bg" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="screen-nav">
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>
            Good {greeting}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>AirChord</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" onClick={() => onNavigate('settings')}>
            <Settings size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
          <button className="icon-btn" onClick={() => onNavigate('profile')}>
            <User size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => onNavigate('practice')}
          style={{
            background: '#0e0e0e',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 8,
            padding: '28px 28px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: 24, top: 24, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)' }}>
            Daily Challenge
          </div>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 12 }}>Today</p>
          <h3 style={{ fontSize: 20, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Play C → G → Am → F
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>100 BPM · 5 minutes · Intermediate</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(201,168,76,0.8)', fontWeight: 500 }}>
            Begin <ChevronRight size={14} />
          </div>
        </motion.div>

        {/* Mode grid */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Modes
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MODES.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onNavigate(m.id)}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  padding: '28px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                whileHover={{ borderColor: 'rgba(255,255,255,0.18)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div style={{ fontSize: 24, marginBottom: 16, color: 'rgba(255,255,255,0.4)' }}>{m.icon}</div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{m.label}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{m.sub}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            This week
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Sessions', value: '42', icon: Target },
              { label: 'Practice', value: '8h 30m', icon: Clock },
              { label: 'Avg Score', value: '87%', icon: TrendingUp },
            ].map(s => (
              <div
                key={s.label}
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '20px 16px' }}
              >
                <s.icon size={14} style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 12 }} />
                <p style={{ fontSize: 22, fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', marginBottom: 2 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>Practice Streak</p>
            <p style={{ fontSize: 32, fontWeight: 300, color: '#fff', letterSpacing: '-0.03em' }}>7 days</p>
          </div>
          <div style={{ fontSize: 40 }}>🔥</div>
        </div>

        {/* Recent sessions */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Recent
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {RECENT.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.07 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 0',
                  borderBottom: i < RECENT.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 400, color: '#fff', marginBottom: 3, letterSpacing: '-0.01em' }}>{s.title}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{s.artist}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{s.time}</span>
                  </div>
                </div>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  color: s.score >= 90 ? '#C9A84C' : '#fff',
                }}>
                  {s.score}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="bottom-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item ${item.id === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
