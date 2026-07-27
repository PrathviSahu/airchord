import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2 } from 'lucide-react'

const ACHIEVEMENTS = [
  { icon: '🎸', title: 'First Chord', unlocked: true },
  { icon: '🔥', title: 'Week Warrior', unlocked: true },
  { icon: '🎯', title: 'Perfect Score', unlocked: true },
  { icon: '⚡', title: 'Speed Demon', unlocked: false },
  { icon: '🏆', title: 'Month Master', unlocked: false },
  { icon: '🎤', title: 'Studio Pro', unlocked: false },
]

const WEEK_SCORES = [65, 78, 82, 70, 91, 87, 94]
const DAYS        = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const HISTORY = [
  { mode: 'Free Play', date: 'Today', duration: '14 min', score: 82 },
  { mode: 'Chord Trainer', date: 'Yesterday', duration: '23 min', score: 91 },
  { mode: 'Song Practice', date: 'Sat', duration: '18 min', score: 77 },
]

interface Props { onBack: () => void }

export default function ProfileScreen({ onBack }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('Aria Singh')
  const accuracy = 87

  return (
    <div className="screen-bg" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 20px 24px' }}>
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Profile</h1>
        <button className="icon-btn" onClick={() => setEditing(e => !e)}><Edit2 size={15} style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 8, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Avatar ring */}
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 44}` }}
                animate={{ strokeDashoffset: `${2 * Math.PI * 44 * (1 - accuracy / 100)}` }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎸</div>
          </div>

          {editing
            ? <input value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 22, fontWeight: 500, color: '#fff', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', outline: 'none', textAlign: 'center', fontFamily: 'inherit', padding: '4px 8px' }} />
            : <h2 style={{ fontSize: 22, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em' }}>{name}</h2>
          }
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Guitarist · Member since July 2026</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <span>🔥</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>7 day streak</span>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>Stats</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: 'Total Sessions', v: '42' },
              { l: 'Practice Time', v: '8h 30m' },
              { l: 'Average Score', v: '87%' },
              { l: 'Best Score', v: '96%' },
            ].map(s => (
              <div key={s.l} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '20px 16px' }}>
                <p style={{ fontSize: 26, fontWeight: 200, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>{s.v}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day chart */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Last 7 days</p>
            <p style={{ fontSize: 12, color: 'rgba(52,211,153,0.8)' }}>↑ +12%</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56 }}>
            {WEEK_SCORES.map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(s / 100) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: '100%', background: i === 6 ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.18)', borderRadius: 2 }}
                />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Achievements</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>3 / 6</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ACHIEVEMENTS.map((a, i) => (
              <div key={i} style={{
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '20px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                opacity: a.unlocked ? 1 : 0.35, filter: a.unlocked ? 'none' : 'grayscale(1)',
              }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <span style={{ fontSize: 11, color: '#fff', textAlign: 'center', lineHeight: 1.3 }}>{a.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Practice history */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>History</p>
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0 16px' }}>
            {HISTORY.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < HISTORY.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 400, color: '#fff', marginBottom: 2 }}>{s.mode}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{s.date} · {s.duration}</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 200, color: s.score >= 90 ? '#C9A84C' : '#fff', letterSpacing: '-0.02em' }}>{s.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
