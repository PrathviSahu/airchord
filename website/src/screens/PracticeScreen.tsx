import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Clock, Target } from 'lucide-react'

const MODES = [
  { id: 'chord', title: 'Chord Trainer', sub: 'Master individual chords', level: 'Easy' },
  { id: 'transition', title: 'Transition Trainer', sub: 'Smooth chord changes', level: 'Medium' },
  { id: 'strumming', title: 'Strumming Coach', sub: 'Nail the rhythm', level: 'Medium' },
  { id: 'song', title: 'Song Practice', sub: 'Play along with songs', level: 'Hard' },
  { id: 'challenge', title: 'Speed Challenge', sub: 'Test your limits', level: 'Expert' },
]

const CHORDS = [
  { name: 'Am', gesture: '☝️', hint: '1 finger' },
  { name: 'C',  gesture: '🤟', hint: '3 fingers' },
  { name: 'G',  gesture: '✌️', hint: '2 fingers' },
  { name: 'Em', gesture: '✊', hint: 'Fist' },
  { name: 'F',  gesture: '✋', hint: 'Open palm' },
]

interface Props { onBack: () => void }

export default function PracticeScreen({ onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [chordIdx, setChordIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [round, setRound] = useState(1)
  const [timer, setTimer] = useState(0)
  const [timerRef] = useState({ id: 0 as any })
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null)
  const [done, setDone] = useState(false)
  const [accuracy, setAccuracy] = useState(0)

  const start = (id: string) => {
    setSelected(id)
    setScore(0); setStreak(0); setChordIdx(0); setRound(1)
    timerRef.id = setInterval(() => setTimer(t => t + 1), 1000)
  }

  const attempt = (correct: boolean) => {
    if (correct) { setScore(s => s + 10); setStreak(s => s + 1); setFeedback({ text: 'Good', good: true }) }
    else         { setStreak(0); setFeedback({ text: 'Miss', good: false }) }
    setTimeout(() => {
      setFeedback(null)
      if (chordIdx + 1 >= CHORDS.length) {
        if (round >= 3) {
          clearInterval(timerRef.id)
          setAccuracy(Math.floor(65 + Math.random() * 32))
          setDone(true)
        } else { setRound(r => r + 1); setChordIdx(0) }
      } else { setChordIdx(c => c + 1) }
    }, 700)
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const cur = CHORDS[chordIdx]

  // Done screen
  if (done) return (
    <div className="screen-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Session complete</p>
        <h2 style={{ fontSize: 48, fontWeight: 200, letterSpacing: '-0.04em', color: '#fff' }}>{accuracy}%</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Accuracy · {fmt(timer)} session</p>
      </div>

      {/* Score ring */}
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke="#C9A84C" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: `${2 * Math.PI * 42}` }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 42 * (1 - accuracy / 100)}` }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 300, color: '#fff' }}>{accuracy}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>score</span>
        </div>
      </div>

      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[{ l: 'Score', v: score }, { l: 'Best Streak', v: streak }, { l: 'Time', v: fmt(timer) }].map(s => (
          <div key={s.l} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 300, color: '#fff', letterSpacing: '-0.02em' }}>{s.v}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.l}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <button onClick={onBack} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>Home</button>
        <button onClick={() => { setDone(false); setTimer(0); start(selected!) }} style={{ flex: 1, padding: '16px', background: '#fff', borderRadius: 6, color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' }}>Retry</button>
      </div>
    </div>
  )

  // Active session
  if (selected) return (
    <div className="screen-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 20px 16px' }}>
        <button className="icon-btn" onClick={() => { setSelected(null); setTimer(0); clearInterval(timerRef.id) }}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            <Clock size={12} /> {fmt(timer)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            <Target size={12} /> Round {round}/3
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Play this chord</p>

        <motion.div
          key={chordIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 64, marginBottom: 12 }}>{cur.gesture}</div>
          <div style={{ fontSize: 96, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>{cur.name}</div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{cur.hint}</p>
        </motion.div>

        {/* Scores */}
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 36, fontWeight: 200, color: '#fff' }}>{score}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Score</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', height: 60 }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 36, fontWeight: 200, color: streak > 4 ? '#C9A84C' : '#fff' }}>{streak}🔥</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Streak</p>
          </div>
        </div>

        {/* Camera mock */}
        <div style={{ width: '100%', maxWidth: 280, aspectRatio: '4/3', background: '#080808', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Camera detecting</p>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                padding: '12px 28px', borderRadius: 4,
                border: `1px solid ${feedback.good ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: feedback.good ? '#34D399' : '#EF4444',
                fontSize: 15, fontWeight: 500,
              }}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap buttons (simulation) */}
        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 280 }}>
          <button onClick={() => attempt(true)} style={{ flex: 1, padding: '16px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 6, color: '#34D399', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CheckCircle size={16} /> Hit
          </button>
          <button onClick={() => attempt(false)} style={{ flex: 1, padding: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, color: '#EF4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <XCircle size={16} /> Miss
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>*Simulated — camera integration coming soon</p>
      </div>
    </div>
  )

  // Mode selection
  return (
    <div className="screen-bg">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '28px 20px 24px' }}>
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>Practice</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Choose a mode to train</p>
        </div>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MODES.map((m, i) => (
          <motion.button key={m.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => start(m.id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 20px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s',
            }}
          >
            <div>
              <p style={{ fontSize: 16, fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4 }}>{m.title}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{m.sub}</p>
            </div>
            <span style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.05em', fontWeight: 500,
            }}>{m.level}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
